from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()
# API key is read from env by the google-genai SDK automatically,
# or set explicitly in each router via google.genai.Client(api_key=...)


app = FastAPI(title="AI Interview Prep Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import interview, feedback
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["feedback"])

@app.get("/")
def root():
    return {"message": "AI Interview Prep Agent API is running!"}

@app.get("/health")
def health():
    return {"status": "ok"}
