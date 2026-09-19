"""Memory-only PDF parsing with a killable per-request worker."""
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from io import BytesIO
import logging
import multiprocessing
from threading import BoundedSemaphore, Event

from pdfminer.pdfdocument import PDFEncryptionError
from utils.parser import extract_text_from_pdf

PARSE_TIMEOUT_SECONDS = 20
_parse_slots = BoundedSemaphore(2)


class ParseFailure(Exception):
    def __init__(self, code):
        self.code = code
        super().__init__(code)


def _parse_worker(payload, sender):
    # pdfminer debug logs can contain document strings. Suppress all logging in
    # this isolated process, including third-party exception diagnostics.
    logging.disable(logging.CRITICAL)
    try:
        with BytesIO(payload) as stream:
            text = extract_text_from_pdf(stream)
        sender.send(("OK", text))
    except Exception as error:
        current = error
        seen = set()
        encrypted = False
        while current is not None and id(current) not in seen:
            seen.add(id(current))
            if isinstance(current, PDFEncryptionError):
                encrypted = True
                break
            current = current.__cause__ or current.__context__
        sender.send(("PDF_ENCRYPTED" if encrypted else "INVALID_PDF", ""))
    finally:
        sender.close()


def _receive_result(receiver, stopped):
    while not stopped.is_set():
        if receiver.poll(0.05):
            return receiver.recv()
    return ("PARSE_TIMEOUT", "")


def parse_pdf(payload, timeout=PARSE_TIMEOUT_SECONDS):
    if not _parse_slots.acquire(blocking=False):
        raise ParseFailure("PARSER_BUSY")
    stopped = Event()
    context = multiprocessing.get_context("spawn")
    receiver = sender = process = executor = None
    try:
        receiver, sender = context.Pipe(duplex=False)
        process = context.Process(target=_parse_worker, args=(payload, sender), daemon=True)
        process.start()
        sender.close()
        executor = ThreadPoolExecutor(max_workers=1)
        future = executor.submit(_receive_result, receiver, stopped)
        try:
            code, text = future.result(timeout=timeout)
        except TimeoutError:
            raise ParseFailure("PARSE_TIMEOUT") from None
        except EOFError:
            raise ParseFailure("INVALID_PDF") from None
        if code != "OK":
            raise ParseFailure(code)
        return text
    finally:
        # Stop the supervising thread and terminate the parser on every exit.
        stopped.set()
        if process is not None and process.pid is not None:
            if process.is_alive():
                process.terminate()
            process.join(timeout=1)
            if process.is_alive():
                process.kill()
                process.join(timeout=1)
            process.close()
        if executor is not None:
            executor.shutdown(wait=True, cancel_futures=True)
        if receiver is not None:
            receiver.close()
        if sender is not None:
            sender.close()
        _parse_slots.release()
