# FarmGuru

FarmGuru is a farmer support application with crop guidance, weather and risk information, marketplace features, loan schemes, community support, and a voice advisory assistant.

## Project Structure

- `frontend/` - React application powered by Vite
- `backend/` - FastAPI service for the voice advisory endpoint

## Prerequisites

- Node.js 18 or newer
- Python 3.10 or newer
- A Google Gemini API key for voice advisory functionality

## Run the Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend is available at `http://localhost:5173`.

## Run the Backend

```powershell
cd backend
python -m venv .venv
.[4mvenv\Scripts\Activate.ps1
pip install fastapi uvicorn python-multipart python-dotenv google-generativeai
uvicorn main:app --reload
```

Create `backend/.env` with:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-3.6-flash
```

The API runs at `http://localhost:8000`. The voice advisory endpoint is `POST /api/voice-advisory` and accepts `user_query_text` and `preferred_language` form fields.

## Frontend Commands

From `frontend/`:

```powershell
npm run dev      # Start the development server
npm run build    # Create a production build
npm run lint     # Run Oxlint
npm run preview  # Preview the production build
```

## Security

Keep `backend/.env` private. Do not commit API keys or other credentials.