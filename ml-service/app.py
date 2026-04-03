from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.parser import (
    extract_text_from_pdf,
    extract_skills,
    extract_email,
    extract_phone,
    extract_education,
    extract_experience_years
)
import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "http://54.66.242.6:3000",
    "https://fullstack-ml-portfolio.vercel.app"
])

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def analyze_with_groq(resume_text: str, job_description: str = None):

    if job_description:
        prompt = f"""You are an expert ATS system and career coach. Analyze this resume against the job description and return a detailed JSON analysis.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text, no backticks):
{{
  "ats_score": <number 0-100>,
  "jd_match_score": <number 0-100>,
  "overall_rating": "<Excellent|Good|Average|Needs Work>",
  "summary": "<2-3 sentence AI summary of the candidate>",
  "ats_breakdown": {{
    "formatting": <number 0-25>,
    "keywords": <number 0-25>,
    "experience": <number 0-25>,
    "skills": <number 0-25>
  }},
  "matched_keywords": ["<keyword1>", "<keyword2>"],
  "missing_keywords": ["<keyword1>", "<keyword2>"],
  "skill_gap": ["<skill1>", "<skill2>"],
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "section_feedback": {{
    "summary_objective": "<feedback or null>",
    "experience": "<feedback>",
    "skills": "<feedback>",
    "education": "<feedback>",
    "overall_structure": "<feedback>"
  }},
  "ai_suggestions": [
    {{
      "priority": "High|Medium|Low",
      "category": "<category>",
      "suggestion": "<detailed suggestion>",
      "example": "<example of improvement or null>"
    }}
  ],
  "rewrite_suggestions": [
    {{
      "original": "<original bullet point from resume>",
      "improved": "<improved version with metrics and impact>"
    }}
  ],
  "interview_likelihood": "<High|Medium|Low>",
  "recommendation": "<detailed overall recommendation>"
}}"""
    else:
        prompt = f"""You are an expert ATS system and career coach. Analyze this resume and return a detailed JSON analysis.

RESUME:
{resume_text}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text, no backticks):
{{
  "ats_score": <number 0-100>,
  "jd_match_score": null,
  "overall_rating": "<Excellent|Good|Average|Needs Work>",
  "summary": "<2-3 sentence AI summary of the candidate>",
  "ats_breakdown": {{
    "formatting": <number 0-25>,
    "keywords": <number 0-25>,
    "experience": <number 0-25>,
    "skills": <number 0-25>
  }},
  "matched_keywords": [],
  "missing_keywords": [],
  "skill_gap": ["<skill1>", "<skill2>"],
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "section_feedback": {{
    "summary_objective": "<feedback or null>",
    "experience": "<feedback>",
    "skills": "<feedback>",
    "education": "<feedback>",
    "overall_structure": "<feedback>"
  }},
  "ai_suggestions": [
    {{
      "priority": "High|Medium|Low",
      "category": "<category>",
      "suggestion": "<detailed suggestion>",
      "example": "<example of improvement or null>"
    }}
  ],
  "rewrite_suggestions": [
    {{
      "original": "<original bullet point from resume>",
      "improved": "<improved version with metrics and impact>"
    }}
  ],
  "interview_likelihood": "<High|Medium|Low>",
  "recommendation": "<detailed overall recommendation>"
}}"""

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are an expert ATS system and career coach. Always respond with valid JSON only. No markdown, no extra text."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        max_tokens=3000,
    )

    response_text = chat_completion.choices[0].message.content.strip()

    # Clean markdown if present
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0].strip()
    elif "```" in response_text:
        response_text = response_text.split("```")[1].split("```")[0].strip()

    return json.loads(response_text)


@app.route("/", methods=["GET"])
def health():
    return jsonify({"message": "Resume Analyzer ML Service Running", "status": "ok"})


@app.route("/analyze", methods=["POST"])
def analyze_resume():
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No resume file uploaded"}), 400

        file = request.files["resume"]
        job_description = request.form.get("job_description", "").strip()

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not file.filename.endswith(".pdf"):
            return jsonify({"error": "Only PDF files are supported"}), 400

        # Extract text
        resume_text = extract_text_from_pdf(file)

        if not resume_text:
            return jsonify({"error": "Could not extract text from PDF"}), 400

        # Basic extractions
        skills = extract_skills(resume_text)
        email = extract_email(resume_text)
        phone = extract_phone(resume_text)
        experience_years = extract_experience_years(resume_text)
        word_count = len(resume_text.split())

        # Groq AI analysis
        ai_analysis = analyze_with_groq(
            resume_text,
            job_description if job_description else None
        )

        return jsonify({
            "success": True,
            "data": {
                "ai_analysis": ai_analysis,
                "basic_info": {
                    "skills": skills,
                    "email": email,
                    "phone": phone,
                    "experience_years": experience_years,
                    "word_count": word_count,
                    "has_jd": bool(job_description)
                }
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", debug=False, port=port)