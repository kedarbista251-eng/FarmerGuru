from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os
import re
from dotenv import load_dotenv

# Load the secret key from your .env file
load_dotenv()

app = FastAPI(title="Farmer's Guide API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Safely configure Gemini using the hidden variable
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# 2. Configure Gemini (Replace with your actual API key)
#genai.configure(api_key="YOUR_GEMINI_API_KEY")

# 3. The Voice Assistant Endpoint
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
        model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-3.6-flash"))
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
