import sys
import os
from contextlib import asynccontextmanager

# Ensure the project root is on the path so `from backend.xxx` imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import re
from dotenv import load_dotenv

# Load .env first so DATABASE_URL, SECRET_KEY, GEMINI_API_KEY are available
load_dotenv()

# Import database helpers and routers AFTER load_dotenv so env vars are set
from backend.database import Base, engine
from backend.routers.auth import router as auth_router


# --- Lifespan: runs setup on startup, teardown on shutdown ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables (SQLite or PostgreSQL) when the server starts
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created / verified.")
    except Exception as exc:
        print(f"[WARN] Could not reach database on startup: {exc}")
        print("   The server will still start; DB-dependent endpoints will fail until the DB is reachable.")
    yield
    # (Optional teardown code here)


app = FastAPI(title="FarmGuru API", lifespan=lifespan)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include routers ---
app.include_router(auth_router)

# --- Gemini configuration ---
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)


# --- Voice Advisory endpoint ---
@app.post("/api/voice-advisory")
async def voice_advisory(
    user_query_text: str = Form(...),
    preferred_language: str = Form("Hindi")
):
    """
    Accepts transcribed voice input and generates concise, audio-friendly advice.
    """
    cleaned_query = user_query_text.strip()
    if not cleaned_query:
        raise HTTPException(status_code=422, detail="Please provide a question for Kisan Mitra.")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Kisan Mitra is not configured. Add GEMINI_API_KEY to backend/.env and restart the API."
        )

    prompt = f"""
    You are 'Kisan Mitra', a friendly voice assistant for Indian farmers.
    Farmer Query: "{cleaned_query}"
    Language Required: {preferred_language}

    Instructions:
    1. Respond strictly in {preferred_language} using clear, simple spoken terms.
    2. Keep the answer under 3 sentences.
    3. Include 1 actionable tip regarding weather, crops, or market prices.
    """

    try:
        model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-1.5-flash"))
        response = model.generate_content(prompt)
    except Exception as error:
        error_text = str(error)
        if "429" in error_text or "quota" in error_text.lower() or "resource exhausted" in error_text.lower():
            retry_match = re.search(r"retry(?: in|_delay[^\d]*)(\d+)", error_text, re.IGNORECASE)
            retry_after = int(retry_match.group(1)) if retry_match else 60
            raise HTTPException(
                status_code=429,
                detail={
                    "code": "GEMINI_QUOTA_EXCEEDED",
                    "message": "Kisan Mitra has reached the Gemini request limit. Please try again shortly.",
                    "retry_after_seconds": retry_after,
                },
                headers={"Retry-After": str(retry_after)},
            ) from error
        raise HTTPException(
            status_code=502,
            detail="Kisan Mitra could not get a response from Gemini. Please try again shortly."
        ) from error

    if not getattr(response, "text", "").strip():
        raise HTTPException(
            status_code=502,
            detail="Kisan Mitra received an empty response from Gemini. Please try again."
        )

    return {
        "text_response": response.text,
        "language": preferred_language
    }
