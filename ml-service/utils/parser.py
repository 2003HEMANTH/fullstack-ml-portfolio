import pdfplumber
import re

def extract_text_from_pdf(file):
    text = ""
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()

def extract_skills(text):
    skill_keywords = [
        # Programming
        "python", "javascript", "typescript", "java", "c++", "c#", "r", "sql",
        "html", "css", "bash", "go", "rust", "kotlin", "swift",
        # Web
        "react", "next.js", "nextjs", "node.js", "nodejs", "express", "django",
        "flask", "fastapi", "vue", "angular", "tailwind",
        # Data & ML
        "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras",
        "matplotlib", "seaborn", "plotly", "opencv", "nltk", "spacy",
        # Cloud & DevOps
        "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd",
        "linux", "git", "github", "terraform", "ansible",
        # Databases
        "mongodb", "mysql", "postgresql", "redis", "firebase", "sqlite",
        # Data Viz
        "power bi", "tableau", "excel", "looker",
        # Other
        "machine learning", "deep learning", "nlp", "data analysis",
        "rest api", "graphql", "microservices", "agile", "scrum"
    ]

    text_lower = text.lower()
    found_skills = []

    for skill in skill_keywords:
        if skill in text_lower:
            found_skills.append(skill)

    return list(set(found_skills))

def extract_email(text):
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(pattern, text)
    return match.group() if match else None

def extract_phone(text):
    pattern = r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]'
    match = re.search(pattern, text)
    return match.group() if match else None

def extract_education(text):
    education_keywords = [
        "bachelor", "master", "phd", "b.sc", "m.sc", "b.tech", "m.tech",
        "mba", "bca", "mca", "b.e", "m.e", "degree", "university", "college"
    ]
    text_lower = text.lower()
    found = []
    for keyword in education_keywords:
        if keyword in text_lower:
            found.append(keyword)
    return found

def extract_experience_years(text):
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*experience',
        r'experience\s*of\s*(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s*experience',
    ]
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return int(match.group(1))
    return 0