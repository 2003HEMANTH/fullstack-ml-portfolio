import unittest

from utils.ai_analyzer import AnalysisFailure, _validate


def valid_analysis():
    return {
        "ats_score": 88.4,
        "jd_match_score": 75,
        "overall_rating": "Good",
        "summary": "Strong candidate.",
        "ats_breakdown": {"formatting": 24, "keywords": 22, "experience": 21, "skills": 23},
        "matched_keywords": ["Python"],
        "missing_keywords": ["Kubernetes"],
        "skill_gap": ["Kubernetes"],
        "strengths": ["Clear impact"],
        "weaknesses": ["Few metrics"],
        "section_feedback": {
            "summary_objective": None,
            "experience": "Add metrics.",
            "skills": "Relevant.",
            "education": "Clear.",
            "overall_structure": "Readable.",
        },
        "ai_suggestions": [{"priority": "High", "category": "Impact", "suggestion": "Add metrics.", "example": None}],
        "rewrite_suggestions": [{"original": "Built APIs", "improved": "Built 10 APIs serving 1M requests."}],
        "interview_likelihood": "High",
        "recommendation": "Apply after adding metrics.",
    }


class AIValidationTests(unittest.TestCase):
    def test_valid_response_is_normalized(self):
        result = _validate(valid_analysis())
        self.assertEqual(result["ats_score"], 88)
        self.assertEqual(result["ats_breakdown"]["formatting"], 24)

    def test_missing_or_wrong_fields_are_rejected(self):
        for mutation in (lambda value: value.pop("summary"), lambda value: value.update({"strengths": "not a list"})):
            with self.subTest(mutation=mutation):
                value = valid_analysis()
                mutation(value)
                with self.assertRaises(AnalysisFailure) as failure:
                    _validate(value)
                self.assertEqual(failure.exception.code, "AI_INVALID_RESPONSE")


if __name__ == "__main__":
    unittest.main()