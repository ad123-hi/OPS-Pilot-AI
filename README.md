# OpsPilot AI

Project foundation for OpsPilot AI: a React + TypeScript + Vite frontend and a FastAPI backend.

## Requirements

- Node.js 20.19+ or 22.12+
- Python 3.10+
- Git
- PostgreSQL (not needed for the initial health check)

## Frontend

```powershell
npm install
npm run dev
```

Vite serves the app at <http://localhost:5173>.

## Backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API health check is at <http://127.0.0.1:8000/health>; interactive docs are at <http://127.0.0.1:8000/docs>.

Copy the relevant `.env.example` to `.env` and update values for local configuration. Do not commit `.env` files.
