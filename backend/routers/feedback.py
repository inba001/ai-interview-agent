from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import json
import os
from google import genai
from google.genai import types

router = APIRouter()

def get_client():
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


class HistoryItem(BaseModel):
    role: str
    content: str


class AnalyzeRequest(BaseModel):
    history: List[HistoryItem]
    role: str
    topics: List[str]


class FeedbackResponse(BaseModel):
    overall_score: int
    strengths: List[str]
    improvements: List[str]
    topic_scores: Dict[str, int]
    sample_answers: List[Dict[str, str]]
    recommendation: str


class PracticeQuestionRequest(BaseModel):
    topic: str
    difficulty: str


class PracticeQuestionResponse(BaseModel):
    question: str
    hints: List[str]
    sample_answer: str


def format_transcript(history: List[HistoryItem]) -> str:
    """Format the conversation history into a readable transcript."""
    lines = []
    for item in history:
        label = "Candidate" if item.role == "user" else "Interviewer"
        lines.append(f"{label}: {item.content}")
    return "\n\n".join(lines)


def parse_json_response(raw_text: str) -> dict:
    """Parse JSON from Gemini response, stripping markdown if needed."""
    raw_text = raw_text.strip()
    if raw_text.startswith("```"):
        parts = raw_text.split("```")
        raw_text = parts[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
        raw_text = raw_text.strip()

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        start = raw_text.find("{")
        end = raw_text.rfind("}") + 1
        if start != -1 and end > start:
            return json.loads(raw_text[start:end])
        raise


@router.post("/analyze", response_model=FeedbackResponse)
async def analyze_interview(request: AnalyzeRequest):
    """Analyze the completed interview and return detailed feedback."""
    try:
        transcript = format_transcript(request.history)
        topics_str = ", ".join(request.topics)

        prompt = f"""You are an expert technical interview coach. Analyze the following interview transcript for a {request.role} position covering topics: {topics_str}.

INTERVIEW TRANSCRIPT:
{transcript}

Based on this transcript, provide a comprehensive evaluation. You MUST return ONLY a valid JSON object with NO markdown formatting, NO code blocks, NO extra text before or after. The JSON must have exactly these keys:

{{
  "overall_score": <integer 1-10>,
  "strengths": [<3 to 5 specific strength strings>],
  "improvements": [<3 to 5 specific improvement area strings>],
  "topic_scores": {{<topic_name>: <integer 1-10>, ...}},
  "sample_answers": [
    {{"question": "<question text>", "better_answer": "<ideal answer text>"}},
    {{"question": "<question text>", "better_answer": "<ideal answer text>"}},
    {{"question": "<question text>", "better_answer": "<ideal answer text>"}}
  ],
  "recommendation": "<1-2 sentence overall recommendation string>"
}}

Ensure topic_scores covers: {topics_str}. Return ONLY the JSON object."""

        client = get_client()
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
        )

        try:
            feedback_data = parse_json_response(response.text)
        except (json.JSONDecodeError, Exception) as parse_err:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse feedback JSON: {str(parse_err)}. Raw: {response.text[:300]}"
            )

        overall_score = max(1, min(10, int(feedback_data.get("overall_score", 5))))
        strengths = feedback_data.get("strengths", [])[:5]
        improvements = feedback_data.get("improvements", [])[:5]
        topic_scores = {k: max(1, min(10, int(v))) for k, v in feedback_data.get("topic_scores", {}).items()}
        sample_answers = feedback_data.get("sample_answers", [])[:3]
        recommendation = feedback_data.get("recommendation", "Keep practicing to improve your technical skills.")

        return FeedbackResponse(
            overall_score=overall_score,
            strengths=strengths,
            improvements=improvements,
            topic_scores=topic_scores,
            sample_answers=sample_answers,
            recommendation=recommendation,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze interview: {str(e)}")


@router.post("/question", response_model=PracticeQuestionResponse)
async def get_practice_question(request: PracticeQuestionRequest):
    """Generate a practice interview question for a given topic and difficulty."""
    try:
        prompt = f"""Generate a {request.difficulty} difficulty technical interview question about {request.topic}.

Return ONLY a valid JSON object with NO markdown, NO code blocks, NO extra text:
{{
  "question": "<the interview question>",
  "hints": ["<hint 1>", "<hint 2>", "<hint 3>"],
  "sample_answer": "<a comprehensive model answer>"
}}"""

        client = get_client()
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
        )

        try:
            data = parse_json_response(response.text)
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to parse practice question response.")

        return PracticeQuestionResponse(
            question=data.get("question", ""),
            hints=data.get("hints", []),
            sample_answer=data.get("sample_answer", ""),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate practice question: {str(e)}")
