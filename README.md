# OpsPilot AI

Project foundation for OpsPilot AI: a React + TypeScript + Vite frontend in `frontend/` and a FastAPI backend in `backend/`.

## Requirements

- Node.js 20.19+ or 22.12+
- Python 3.10+
- Git
- PostgreSQL 14+ (local or remote)

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Vite serves the app at <http://localhost:5173>.

## Backend and database

First create a PostgreSQL role and database (substitute a strong password):

```sql
CREATE USER opspilot_user WITH PASSWORD 'your-strong-password';
CREATE DATABASE opspilot_db OWNER opspilot_user;
```

In PowerShell, from the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to your actual PostgreSQL credentials. URL-encode reserved characters in the password. Keep `.env` private; it is gitignored.

Set `JWT_SECRET_KEY` to a random secret of at least 32 bytes before using authentication. For example, generate one with `python -c "import secrets; print(secrets.token_urlsafe(48))"` and place it in `backend/.env`. Set `ACCESS_TOKEN_EXPIRE_MINUTES` to adjust the default 30-minute access-token lifetime.

Apply the initial database migration and start the API:

```powershell
alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Check <http://127.0.0.1:8000/health> for database connectivity and <http://127.0.0.1:8000/docs> for API documentation. `/health` returns HTTP 503 if PostgreSQL is unavailable. Alembic creates `organizations`, `users`, `teams`, `team_members`, and its own `alembic_version` tracking table.

Authentication endpoints are `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, and `POST /auth/logout`. Registration creates a new organization and its first Admin; login requires the returned `organization_id`. Import `backend/postman/OpsPilot Auth.postman_collection.json` in Postman to run the flow, including token revocation.
