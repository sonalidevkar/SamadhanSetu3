from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI(
    title="SamadhanSetu AI Engine",
    description="AI engine for analysing citizen problems",
    version="1.0.0"
)


# -----------------------------
# REQUEST MODEL
# -----------------------------

class ProblemRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    severity: Optional[str] = None
    peopleAffected: Optional[int] = 0
    district: Optional[str] = None
    villageCity: Optional[str] = None


# -----------------------------
# BASIC AI ANALYSIS
# -----------------------------

def analyze_problem(problem: ProblemRequest):

    text = (
        problem.title + " " +
        problem.description
    ).lower()

    # Category detection
    if any(word in text for word in [
        "water", "pani", "पाणी", "drinking water",
        "water supply", "tap"
    ]):
        detected_category = "Water"

    elif any(word in text for word in [
        "hospital", "health", "medical", "doctor",
        "medicine", "रुग्णालय", "आरोग्य"
    ]):
        detected_category = "Health"

    elif any(word in text for word in [
        "school", "college", "education",
        "teacher", "शाळा", "शिक्षण"
    ]):
        detected_category = "Education"

    elif any(word in text for word in [
        "road", "traffic", "transport",
        "रस्ता", "वाहतूक"
    ]):
        detected_category = "Transport"

    elif any(word in text for word in [
        "garbage", "waste", "cleanliness",
        "कचरा", "स्वच्छता"
    ]):
        detected_category = "Sanitation"

    elif any(word in text for word in [
        "farmer", "farming", "agriculture",
        "crop", "शेतकरी", "शेती"
    ]):
        detected_category = "Agriculture"

    elif any(word in text for word in [
        "job", "employment", "unemployment",
        "नोकरी", "रोजगार"
    ]):
        detected_category = "Employment"

    else:
        detected_category = problem.category or "Other"


    # Severity detection
    if any(word in text for word in [
        "death", "danger", "emergency",
        "critical", "life threatening",
        "मृत्यू", "धोकादायक"
    ]):
        detected_severity = "Critical"

    elif any(word in text for word in [
        "serious", "urgent", "major",
        "गंभीर", "तातडीचे"
    ]):
        detected_severity = "High"

    elif any(word in text for word in [
        "problem", "issue", "difficult",
        "अडचण", "समस्या"
    ]):
        detected_severity = "Medium"

    else:
        detected_severity = problem.severity or "Low"


    # Priority score
    priority_score = 50

    if detected_severity == "Critical":
        priority_score = 95
    elif detected_severity == "High":
        priority_score = 80
    elif detected_severity == "Medium":
        priority_score = 60
    else:
        priority_score = 30


    # Increase priority based on affected people
    if problem.peopleAffected:
        if problem.peopleAffected >= 1000:
            priority_score += 5
        elif problem.peopleAffected >= 500:
            priority_score += 3


    priority_score = min(priority_score, 100)


    # Suggested stakeholder
    if detected_category in [
        "Education",
        "Agriculture"
    ]:
        stakeholder = "College"

    elif detected_category in [
        "Water",
        "Sanitation",
        "Transport",
        "Health"
    ]:
        stakeholder = "Municipality"

    else:
        stakeholder = "Industry"


    # Suggested solution domain
    solution_domains = {
        "Water": "Water Management",
        "Health": "Healthcare",
        "Education": "Educational Technology",
        "Transport": "Smart Transportation",
        "Sanitation": "Waste Management",
        "Agriculture": "AgriTech",
        "Employment": "Employment Technology",
        "Other": "Social Innovation"
    }

    suggested_solution_domain = solution_domains.get(
        detected_category,
        "Social Innovation"
    )


    return {
        "category": detected_category,
        "severity": detected_severity,
        "priorityScore": priority_score,
        "problemType": "Societal Problem",
        "suggestedSolutionDomain": suggested_solution_domain,
        "suggestedStakeholder": stakeholder,
        "duplicateDetected": False,
        "duplicateProblemId": None
    }


# -----------------------------
# ROOT
# -----------------------------

@app.get("/")
def root():
    return {
        "success": True,
        "message": "SamadhanSetu AI Engine is running successfully"
    }


# -----------------------------
# HEALTH CHECK
# -----------------------------

@app.get("/health")
def health():
    return {
        "success": True,
        "service": "SamadhanSetu AI Engine",
        "status": "running"
    }


# -----------------------------
# AI ANALYSIS API
# -----------------------------

@app.post("/analyze")
def analyze(problem: ProblemRequest):

    result = analyze_problem(problem)

    return {
        "success": True,
        "message": "Problem analysed successfully",
        "analysis": result
    }