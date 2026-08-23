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

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
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

## Deploy the Backend to Render

The repository includes a `render.yaml` Blueprint for the FastAPI backend. It
uses `backend/requirements.txt`; Python projects do not need a `package.json`.

1. Push this repository to GitHub. Confirm that `backend/.env` is not pushed.
2. In Render, select **New** > **Blueprint**, connect the GitHub repository,
   and apply the detected `render.yaml`.
3. Open the created `farmguru-api` service. In **Environment**, enter a real
   `GEMINI_API_KEY`. Render generates `JWT_SECRET` automatically.
4. Create a Render PostgreSQL database (New > PostgreSQL). Copy its **Internal
   Database URL** into the API service's `DATABASE_URL` environment variable.
5. Deploy. Render should report the health check at `/health` as successful.
   The API URL is displayed on the service page, for example
   `https://farmguru-api.onrender.com`.
6. Deploy the frontend, then set the API service's `FRONTEND_URL` to the exact
   public frontend URL (no trailing slash) and redeploy it.
7. In the frontend deployment environment, set
   `VITE_API_URL=https://farmguru-api.onrender.com`, then rebuild/redeploy the
   frontend. This is required because Vite embeds environment values at build
   time.

After deployment, open `https://your-api.onrender.com/health`; it should return
`{"status":"ok"}`. FastAPI documentation is available at `/docs`.
