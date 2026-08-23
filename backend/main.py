import os
import re
from dotenv import load_dotenv
from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai

load_dotenv()

app = FastAPI(title="Farmer's Guide API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"status": "online", "message": "Kisan Mitra API is running."}


@app.post("/api/voice-advisory")
def voice_advisory(
    user_query_text: str = Form(...),
    preferred_language: str = Form("Hindi"),
    geminiAPIKey: str = Form(""),
):
    """
    Accepts user query and uses the form/cookie provided API key (or falls back to .env).
    """
    cleaned_query = user_query_text.strip()
    if not cleaned_query:
        raise HTTPException(
            status_code=422, detail="Please provide a question for Kisan Mitra."
        )

    # 1. Prioritize API key sent from the form/cookie, fallback to .env if empty
    active_key = geminiAPIKey.strip() or os.getenv("GEMINI_API_KEY", "").strip()

    if not active_key:
        raise HTTPException(
            status_code=503,
            detail="Kisan Mitra is not configured. Please enter a valid Gemini API key.",
        )

    # 2. Configure Gemini for this request
    genai.configure(api_key=active_key)

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
        model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        model = genai.GenerativeModel(model_name)

        response = model.generate_content(prompt)

        if not getattr(response, "text", None) or not response.text.strip():
            raise HTTPException(
                status_code=502,
                detail="Kisan Mitra received an empty or safety-blocked response from Gemini.",
            )

        return {
            "status": "success",
            "message": "Response generated successfully!",
            "text_response": response.text,
            "language": preferred_language,
        }

    except Exception as error:
        error_text = str(error)
        print(f"[Gemini API Error]: {error_text}")

        if (
            "429" in error_text
            or "quota" in error_text.lower()
            or "resource exhausted" in error_text.lower()
        ):
            retry_match = re.search(
                r"retry(?: in|_delay[^\d]*)(\d+)", error_text, re.IGNORECASE
            )
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
            detail=f"Kisan Mitra could not get a response from Gemini. Error: {error_text}",
        ) from error


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)