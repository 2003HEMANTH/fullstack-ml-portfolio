from flask import Flask, Request, request, jsonify, g
from io import BytesIO
from uuid import uuid4
from werkzeug.exceptions import HTTPException, RequestEntityTooLarge
from utils.ai_analyzer import AnalysisFailure, MAX_JOB_DESCRIPTION_CHARS, analyze_with_groq
from utils.pdf_worker import ParseFailure, parse_pdf
from utils.parser import extract_skills, extract_email, extract_phone, extract_experience_years
import os

from dotenv import load_dotenv

load_dotenv()


class MemoryRequest(Request):
    def _get_file_stream(self, total_content_length, content_type, filename=None, content_length=None):
        # Prevent Werkzeug's default upload spooling from writing to disk.
        return BytesIO()


app = Flask(__name__)
app.request_class = MemoryRequest
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024


def get_allowed_origins():
    origins = {origin.strip() for origin in os.environ.get("CORS_ORIGINS", "").split(",") if origin.strip()}
    if "*" in origins:
        raise ValueError("CORS_ORIGINS must contain explicit origins, not a wildcard")
    return origins


app.config["ALLOWED_ORIGINS"] = get_allowed_origins()


def api_error(status, code, message):
    return jsonify({"error": {
        "code": code, "message": message, "details": [], "requestId": g.request_id,
    }}), status


@app.before_request
def prepare_request():
    g.request_id = str(uuid4())
    origin = request.headers.get("Origin")
    if origin and origin not in app.config["ALLOWED_ORIGINS"]:
        return api_error(403, "FORBIDDEN", "Origin is not allowed.")


@app.after_request
def response_headers(response):
    response.headers["X-Request-Id"] = g.request_id
    origin = request.headers.get("Origin")
    response.vary.add("Origin")
    if origin and origin in app.config["ALLOWED_ORIGINS"]:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Expose-Headers"] = "X-Request-Id"
    return response


@app.errorhandler(RequestEntityTooLarge)
def payload_too_large(_error):
    return api_error(413, "PAYLOAD_TOO_LARGE", "Maximum request size is 5 MiB.")


@app.errorhandler(HTTPException)
def http_error(error):
    codes = {400: "BAD_REQUEST", 404: "NOT_FOUND", 405: "METHOD_NOT_ALLOWED"}
    return api_error(error.code, codes.get(error.code, "HTTP_ERROR"), error.name)


@app.errorhandler(Exception)
def unexpected_error(_error):
    # Never include exception messages, tracebacks, filenames, or resume text.
    app.logger.error("Unhandled ML service error requestId=%s", g.request_id)
    return api_error(500, "INTERNAL_ERROR", "An unexpected error occurred.")


@app.route("/healthz", methods=["GET"])
@app.route("/", methods=["GET"])
def health():
    return jsonify({"message": "Resume Analyzer ML Service Running", "status": "ok"})


@app.route("/analyze", methods=["POST"])
def analyze_resume():
    if "resume" not in request.files:
        return api_error(400, "FILE_REQUIRED", "No resume file uploaded.")
    file = request.files["resume"]
    job_description = request.form.get("job_description", "").strip()
    if len(job_description) > MAX_JOB_DESCRIPTION_CHARS:
        return api_error(422, "JOB_DESCRIPTION_TOO_LONG", "Job description must be 20,000 characters or fewer.")
    if not file.filename:
        return api_error(400, "FILE_REQUIRED", "No file selected.")
    if file.stream.read(5) != b"%PDF-":
        return api_error(400, "FILE_NOT_PDF", "Only PDF files are supported.")
    file.stream.seek(0)
    try:
        text = parse_pdf(file.stream.read())
    except ParseFailure as error:
        failures = {
            "PARSE_TIMEOUT": (422, "PDF parsing exceeded 20 seconds."),
            "PDF_ENCRYPTED": (422, "Encrypted PDFs are not supported."),
            "INVALID_PDF": (422, "Could not parse the PDF."),
            "PARSER_BUSY": (503, "The PDF parser is busy. Try again later."),
        }
        status, message = failures[error.code]
        return api_error(status, error.code, message)
    if not text:
        return api_error(422, "PDF_NO_TEXT", "Could not extract text from PDF.")

    try:
        ai_analysis = analyze_with_groq(text, job_description or None)
    except AnalysisFailure as error:
        failures = {
            "AI_NOT_CONFIGURED": (503, "AI analysis is not configured."),
            "AI_INVALID_RESPONSE": (502, "The AI returned an invalid response. Try again."),
            "AI_UNAVAILABLE": (503, "AI analysis is temporarily unavailable. Try again shortly."),
        }
        status, message = failures[error.code]
        return api_error(status, error.code, message)

    skills = extract_skills(text)
    return jsonify({
        "success": True,
        "data": {
            "ai_analysis": ai_analysis,
            "basic_info": {
                "skills": skills,
                "email": extract_email(text),
                "phone": extract_phone(text),
                "experience_years": extract_experience_years(text),
                "word_count": len(text.split()),
                "has_jd": bool(job_description),
            },
        },
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
