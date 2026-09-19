"""A5 security regressions; fixtures are generated entirely in memory."""
import hashlib
from io import BytesIO
import multiprocessing
import os
import struct
import time
import unittest
from unittest.mock import patch, MagicMock
from uuid import UUID

import app as service
from utils import parser, pdf_worker


def rc4(key, data):
    state = list(range(256))
    j = 0
    for i in range(256):
        j = (j + state[i] + key[i % len(key)]) % 256
        state[i], state[j] = state[j], state[i]
    i = j = 0
    result = bytearray()
    for value in data:
        i = (i + 1) % 256
        j = (j + state[i]) % 256
        state[i], state[j] = state[j], state[i]
        result.append(value ^ state[(state[i] + state[j]) % 256])
    return bytes(result)


def make_pdf(pages=1, password=None):
    objects = [b"<< /Type /Catalog /Pages 2 0 R >>", b"", b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"]
    kids = []
    for number in range(pages):
        page_id = len(objects) + 1
        kids.append(f"{page_id} 0 R")
        objects.append(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents {page_id + 1} 0 R >>".encode())
        content = f"BT /F1 12 Tf 50 700 Td (Python resume page{number + 1}) Tj ET".encode()
        objects.append(f"<< /Length {len(content)} >>\nstream\n".encode() + content + b"\nendstream")
    objects[1] = f"<< /Type /Pages /Count {pages} /Kids [{' '.join(kids)}] >>".encode()
    encryption = b""
    if password is not None:
        padding = bytes.fromhex("28bf4e5e4e758a4164004e56fffa01082e2e00b6d0683e802f0ca9fe6453697a")
        padded = (password.encode() + padding)[:32]
        owner_key = hashlib.md5((b"owner-secret" + padding)[:32]).digest()[:5]
        owner = rc4(owner_key, padded)
        identifier = b"fixture-id-12345!"
        key = hashlib.md5(padded + owner + struct.pack("<i", -4) + identifier).digest()[:5]
        user = rc4(key, padding)
        objects.append(f"<< /Filter /Standard /V 1 /R 2 /Length 40 /O <{owner.hex()}> /U <{user.hex()}> /P -4 >>".encode())
        encryption = f" /Encrypt {len(objects)} 0 R /ID [<{identifier.hex()}> <{identifier.hex()}>]".encode()
    result = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for number, obj in enumerate(objects, 1):
        offsets.append(len(result))
        result.extend(f"{number} 0 obj\n".encode() + obj + b"\nendobj\n")
    xref = len(result)
    result.extend(f"xref\n0 {len(offsets)}\n0000000000 65535 f \n".encode())
    for offset in offsets[1:]:
        result.extend(f"{offset:010d} 00000 n \n".encode())
    result.extend(f"trailer\n<< /Size {len(offsets)} /Root 1 0 R".encode() + encryption + f" >>\nstartxref\n{xref}\n%%EOF\n".encode())
    return bytes(result)


def hanging_worker(_payload, _sender):
    while True:
        time.sleep(1)


class UploadTests(unittest.TestCase):
    def setUp(self):
        self.client = service.app.test_client()

    def upload(self, payload, name="resume.pdf", **kwargs):
        boundary = "upload-test-boundary"
        body = (f'--{boundary}\r\nContent-Disposition: form-data; name="resume"; filename="{name}"\r\nContent-Type: application/pdf\r\n\r\n'.encode()
                + payload + f"\r\n--{boundary}--\r\n".encode())
        return self.client.post("/analyze", data=body, content_type=f"multipart/form-data; boundary={boundary}", **kwargs)

    def check_error(self, response, status, code):
        self.assertEqual(response.status_code, status)
        self.assertTrue(response.is_json)
        error = response.json["error"]
        self.assertEqual(set(error), {"code", "message", "details", "requestId"})
        self.assertEqual(error["code"], code)
        self.assertEqual(error["details"], [])
        UUID(error["requestId"])
        self.assertEqual(response.headers["X-Request-Id"], error["requestId"])

    def test_large_upload_is_json_413(self):
        self.check_error(self.upload(b"x" * (6 * 1024 * 1024)), 413, "PAYLOAD_TOO_LARGE")

    def test_fake_pdf_rejected_without_parsing(self):
        with patch.object(service, "parse_pdf") as parse:
            self.check_error(self.upload(b"not a PDF"), 400, "FILE_NOT_PDF")
            parse.assert_not_called()

    def test_magic_bytes_not_extension_and_stream_rewound(self):
        pdf = make_pdf()
        with patch.object(service, "parse_pdf", return_value="Python resume") as parse:
            self.assertEqual(self.upload(pdf, "resume.txt").status_code, 200)
            parse.assert_called_once_with(pdf)

    def test_valid_pdf_real_parser(self):
        response = self.upload(make_pdf())
        self.assertEqual(response.status_code, 200)
        self.assertIn("python", response.json["data"]["skills"])

    def test_encrypted_pdfs_real_parser(self):
        for password in ("secret", ""):
            with self.subTest(password=password):
                self.check_error(self.upload(make_pdf(password=password)), 422, "PDF_ENCRYPTED")

    def test_malformed_pdf_is_422(self):
        self.check_error(self.upload(b"%PDF-invalid"), 422, "INVALID_PDF")

    def test_missing_and_empty_files(self):
        self.check_error(self.client.post("/analyze"), 400, "FILE_REQUIRED")
        self.check_error(self.upload(b""), 400, "FILE_NOT_PDF")

    def test_timeout_response(self):
        with patch.object(service, "parse_pdf", side_effect=pdf_worker.ParseFailure("PARSE_TIMEOUT")):
            self.check_error(self.upload(make_pdf()), 422, "PARSE_TIMEOUT")

    def test_timeout_kills_parser_and_next_request_succeeds(self):
        before = {child.pid for child in multiprocessing.active_children()}
        started = time.monotonic()
        with patch.object(pdf_worker, "_parse_worker", hanging_worker):
            with self.assertRaises(pdf_worker.ParseFailure) as failure:
                pdf_worker.parse_pdf(make_pdf(), timeout=0.2)
        self.assertEqual(failure.exception.code, "PARSE_TIMEOUT")
        self.assertLess(time.monotonic() - started, 5)
        self.assertEqual({child.pid for child in multiprocessing.active_children()}, before)
        self.assertIn("Python", pdf_worker.parse_pdf(make_pdf()))

    def test_memory_upload_over_spooling_threshold(self):
        payload = b"%PDF-" + b"x" * 700_000
        # Construct the client multipart body first; its own fixture builder may
        # spool. Deny disk spooling only while the application parses that body.
        boundary = "test-boundary"
        body = (f'--{boundary}\r\nContent-Disposition: form-data; name="resume"; filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\n'.encode()
                + payload + f"\r\n--{boundary}--\r\n".encode())
        with patch("werkzeug.formparser.default_stream_factory", side_effect=AssertionError("disk spool")):
            with patch.object(service, "parse_pdf", return_value="Python") as parse:
                response = self.client.post("/analyze", data=body, content_type=f"multipart/form-data; boundary={boundary}")
                self.assertEqual(response.status_code, 200)
                parse.assert_called_once_with(payload)
        self.assertIsInstance(service.MemoryRequest({})._get_file_stream(None, "application/pdf"), BytesIO)

    def test_cors_exact_allowlist_and_preflight(self):
        with patch.dict(service.app.config, ALLOWED_ORIGINS={"https://portfolio.example"}):
            allowed = self.client.options("/analyze", headers={"Origin": "https://portfolio.example", "Access-Control-Request-Method": "POST"})
            self.assertEqual(allowed.headers["Access-Control-Allow-Origin"], "https://portfolio.example")
            for origin in ("https://attacker.example", "https://portfolioXexample"):
                rejected = self.client.get("/", headers={"Origin": origin})
                self.check_error(rejected, 403, "FORBIDDEN")
                self.assertNotIn("Access-Control-Allow-Origin", rejected.headers)
        with patch.dict(os.environ, {"CORS_ORIGINS": ""}):
            self.assertEqual(service.get_allowed_origins(), set())
        with patch.dict(os.environ, {"CORS_ORIGINS": "*"}):
            self.assertRaises(ValueError, service.get_allowed_origins)

    def test_error_diagnostics_never_leak_resume(self):
        secret = "PRIVATE_RESUME_TEXT_123"
        with patch.object(service, "parse_pdf", side_effect=RuntimeError(secret)):
            with self.assertLogs(service.app.logger, level="ERROR") as logs:
                response = self.upload(b"%PDF-" + secret.encode())
        self.check_error(response, 500, "INTERNAL_ERROR")
        self.assertNotIn(secret, response.get_data(as_text=True))
        self.assertNotIn(secret, " ".join(logs.output))

    def test_404_and_405_envelopes(self):
        self.check_error(self.client.get("/missing"), 404, "NOT_FOUND")
        self.check_error(self.client.get("/analyze"), 405, "METHOD_NOT_ALLOWED")

    def test_page_cap_real_pdf(self):
        text = parser.extract_text_from_pdf(BytesIO(make_pdf(pages=31)))
        self.assertIn("page30", text)
        self.assertNotIn("page31", text)

    def test_character_cap_stops_before_next_page(self):
        pdf = MagicMock()
        pdf.doc.encryption = None
        page = MagicMock()
        page.extract_text.return_value = "x" * 200_100
        with patch.object(parser.pdfplumber, "open") as opener:
            opener.return_value.__enter__.return_value = pdf
            with patch("pdfminer.pdfpage.PDFPage.create_pages", return_value=iter([object(), object()])):
                with patch("pdfplumber.page.Page", return_value=page) as page_type:
                    text = parser.extract_text_from_pdf(BytesIO())
        self.assertEqual(len(text), 200_000)
        self.assertEqual(page_type.call_count, 1)
        page.close.assert_called_once()


if __name__ == "__main__":
    unittest.main()
