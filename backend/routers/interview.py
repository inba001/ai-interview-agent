from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import uuid
import os
from google import genai
from google.genai import types

router = APIRouter()

def get_client():
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


class StartRequest(BaseModel):
    role: str
    topics: List[str]
    difficulty: str


class StartResponse(BaseModel):
    session_id: str
    message: str


class HistoryItem(BaseModel):
    role: str
    content: str


class InterviewConfig(BaseModel):
    role: str
    topics: List[str]
    difficulty: str


class ChatRequest(BaseModel):
    session_id: str
    history: List[HistoryItem]
    user_message: str
    interview_config: InterviewConfig


class ChatResponse(BaseModel):
    message: str
    is_finished: bool


def build_system_prompt(role: str, topics: List[str], difficulty: str) -> str:
    topics_str = ", ".join(topics)
    return (
        f"You are an experienced technical interviewer for {role} positions. "
        f"You are conducting a technical interview covering these topics: {topics_str}. "
        f"Difficulty level: {difficulty}. "
        "Ask ONE question at a time. After the candidate answers, give a brief acknowledgement (1 sentence), "
        "then ask your next question. Cover all the listed topics throughout the interview. "
        "After asking approximately 8 questions total, say exactly: "
        "'Thank you for your time. The interview is now complete. Please wait for your feedback.' "
        "Do NOT give feedback during the interview."
    )


def build_contents(system_prompt: str, history: List[HistoryItem], new_user_message: str = None) -> List[types.Content]:
    """Build conversation history in the new google-genai Content format."""
    contents = [
        types.Content(
            role="user",
            parts=[types.Part(text=f"[SYSTEM INSTRUCTIONS]\n{system_prompt}")]
        ),
        types.Content(
            role="model",
            parts=[types.Part(text="Understood. I will follow these instructions carefully and conduct the interview as specified.")]
        ),
    ]

    for item in history:
        gemini_role = "user" if item.role == "user" else "model"
        contents.append(
            types.Content(
                role=gemini_role,
                parts=[types.Part(text=item.content)]
            )
        )

    if new_user_message:
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part(text=new_user_message)]
            )
        )

    return contents


@router.post("/start", response_model=StartResponse)
async def start_interview(request: StartRequest):
    """Start a new interview session and return the first question."""
    try:
        session_id = str(uuid.uuid4())
        system_prompt = build_system_prompt(request.role, request.topics, request.difficulty)
        topics_str = ", ".join(request.topics)

        opening_prompt = (
            f"Please greet me, briefly introduce yourself as the interviewer for a {request.role} position, "
            f"mention the topics we'll cover ({topics_str}), and then ask your first interview question."
        )

        contents = [
            types.Content(role="user", parts=[types.Part(text=f"[SYSTEM INSTRUCTIONS]\n{system_prompt}")]),
            types.Content(role="model", parts=[types.Part(text="Understood. I will follow these instructions carefully.")]),
            types.Content(role="user", parts=[types.Part(text=opening_prompt)]),
        ]

        client = get_client()
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
        )
        opening_message = response.text

        return StartResponse(session_id=session_id, message=opening_message)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Continue the interview by sending a user message and getting the AI response."""
    try:
        system_prompt = build_system_prompt(
            request.interview_config.role,
            request.interview_config.topics,
            request.interview_config.difficulty,
        )

        contents = build_contents(system_prompt, request.history, request.user_message)

        client = get_client()
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
        )
        ai_message = response.text

        # Check if interview is complete
        is_finished = "interview is now complete" in ai_message.lower()

        return ChatResponse(message=ai_message, is_finished=is_finished)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")
