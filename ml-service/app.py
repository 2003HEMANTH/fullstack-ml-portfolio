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
import nltk

# Download nltk data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except:
    pass

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Job role skill requirements
JOB_ROLES = {
    "Full Stack Developer": [
        "react", "node.js", "javascript", "mongodb", "html", "css",
        "express", "next.js", "typescript", "rest api", "git"
    ],
    "Data Scientist": [
        "python", "pandas", "numpy", "scikit-learn", "machine learning",
        "sql", "matplotlib", "deep learning", "statistics", "tensorflow"
    ],
    "ML Engineer": [
        "python", "tensorflow", "pytorch", "scikit-learn", "deep learning",
        "machine learning", "nlp", "docker", "aws", "git"
    ],
    "Cloud Engineer": [
        "aws", "azure", "docker", "kubernetes", "linux", "ci/cd",
        "terraform", "jenkins", "git", "bash"
    ],
    "Data Analyst": [
        "sql", "python", "excel", "power bi", "tableau", "pandas",
        "data analysis", "matplotlib", "statistics"
    ],
}

def calculate_ats_score(text, skills):
    score = 0

    # Has email
    if extract_email(text):
        score += 15

    # Has phone
    if extract_phone(text):
        score += 10

    # Has education
    if extract_education(text):
        score += 15

    # Skills count
    skill_score = min(len(skills) * 3, 30)
    score += skill_score

    # Keywords check
    important_keywords = [
        "experience", "project", "education", "skills",
        "achievement", "certification", "internship"
    ]
    text_lower = text.lower()
    keyword_hits = sum(1 for kw in important_keywords if kw in text_lower)
    score += min(keyword_hits * 3, 20)

    # Length check (good resumes have decent length)
    word_count = len(text.split())
    if word_count > 200:
        score += 10

    return min(score, 100)

def calculate_skill_score(skills):
    score = len(skills) * 5
    return min(score, 100)

def calculate_job_match(skills):
    skills_lower = [s.lower() for s in skills]
    matches = {}

    for role, required_skills in JOB_ROLES.items():
        matched = [s for s in required_skills if s in skills_lower]
        percentage = round((len(matched) / len(required_skills)) * 100)
        matches[role] = {
            "score": percentage,
            "matched_skills": matched,
            "missing_skills": [s for s in required_skills if s not in skills_lower]
        }

    # Sort by score
    sorted_matches = dict(
        sorted(matches.items(), key=lambda x: x[1]["score"], reverse=True)
    )
    return sorted_matches

def generate_suggestions(skills, ats_score, text):
    suggestions = []
    skills_lower = [s.lower() for s in skills]

    if not extract_email(text):
        suggestions.append("Add your email address to the resume")

    if not extract_phone(text):
        suggestions.append("Add your phone number to the resume")

    if ats_score < 60:
        suggestions.append("Add more relevant keywords to improve ATS score")

    if len(skills) < 8:
        suggestions.append("Add more technical skills relevant to your target role")

    if "git" not in skills_lower and "github" not in skills_lower:
        suggestions.append("Add Git or GitHub to your skills section")

    # Only suggest Docker if they have cloud interest
    cloud_skills = ["aws", "azure", "linux", "kubernetes", "jenkins", "ci/cd"]
    has_cloud_interest = any(s in skills_lower for s in cloud_skills)
    if has_cloud_interest and "docker" not in skills_lower:
        suggestions.append("Consider learning Docker — it pairs well with your cloud skills")

    # Suggest AWS if they have cloud interest but no AWS
    if has_cloud_interest and "aws" not in skills_lower:
        suggestions.append("AWS certification would strengthen your cloud profile")

    # Suggest deep learning if they have ML skills
    ml_skills = ["scikit-learn", "tensorflow", "machine learning", "python"]
    has_ml_interest = any(s in skills_lower for s in ml_skills)
    if has_ml_interest and "deep learning" not in skills_lower:
        suggestions.append("Consider adding Deep Learning skills to complement your ML profile")

    word_count = len(text.split())
    if word_count < 200:
        suggestions.append("Your resume seems short. Add more details about your experience and projects")

    if not suggestions:
        suggestions.append("Excellent resume! Well structured with strong skills coverage")

    return suggestions

@app.route("/", methods=["GET"])
def health():
    return jsonify({"message": "Resume Analyzer ML Service Running", "status": "ok"})

@app.route("/analyze", methods=["POST"])
def analyze_resume():
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No resume file uploaded"}), 400

        file = request.files["resume"]

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not file.filename.endswith(".pdf"):
            return jsonify({"error": "Only PDF files are supported"}), 400

        # Extract text
        text = extract_text_from_pdf(file)

        if not text:
            return jsonify({"error": "Could not extract text from PDF"}), 400

        # Analysis
        skills = extract_skills(text)
        ats_score = calculate_ats_score(text, skills)
        skill_score = calculate_skill_score(skills)
        job_matches = calculate_job_match(skills)
        suggestions = generate_suggestions(skills, ats_score, text)
        email = extract_email(text)
        phone = extract_phone(text)
        experience_years = extract_experience_years(text)

        return jsonify({
            "success": True,
            "data": {
                "skills": skills,
                "skill_score": skill_score,
                "ats_score": ats_score,
                "job_matches": job_matches,
                "suggestions": suggestions,
                "contact": {
                    "email": email,
                    "phone": phone
                },
                "experience_years": experience_years,
                "word_count": len(text.split())
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(debug=True, port=port)
