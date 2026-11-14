# OpsPilot AI

Project foundation for OpsPilot AI: a React + TypeScript + Vite frontend in `frontend/` and a FastAPI backend in `backend/`.

## Requirements

- Node.js 20.19+ or 22.12+
- Python 3.10+
- Git
- PostgreSQL 14+ (local or remote)

## Frontend

From the repository root, in its own PowerShell terminal:

```powershell
cd C:\Users\adity\Desktop\OPS-Pilot-AI\frontend
npm install
npm run dev
```

Vite serves the app at <http://localhost:5173>. Keep this terminal open while using the app.

## Backend and database

For a local PostgreSQL installation, make sure its Windows service is running. Open Services (`Win + R`, then `services.msc`) and start the PostgreSQL service if needed. If multiple PostgreSQL versions are installed, make sure the instance configured in `DATABASE_URL` is the one listening on that port.

Create a PostgreSQL role and database if they do not already exist (substitute a strong password):

```sql
CREATE USER opspilot_user WITH PASSWORD 'your-strong-password';
CREATE DATABASE opspilot_db OWNER opspilot_user;
```

In a separate PowerShell terminal, from the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to the database host, port, name, username, and password you configured. URL-encode reserved characters in the password. Keep `.env` private; it is gitignored.

Set `JWT_SECRET_KEY` to a random secret of at least 32 bytes before using authentication. Generate one with:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Copy the output into `backend/.env`. `ACCESS_TOKEN_EXPIRE_MINUTES` controls the access-token lifetime (default: 30 minutes).

Keep the backend terminal in the `backend` directory with the virtual environment active. Apply all database migrations using Python's module entry point, then confirm the current migration:

```powershell
python -m alembic upgrade head
python -m alembic current
```

The current revision should be `0002_token_version`. Using `python -m alembic` runs Alembic through the active Python environment and can avoid Windows Application Control blocking the `alembic.exe` launcher.

Start the API in that terminal:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Keep this terminal open. Check <http://127.0.0.1:8000/health> for database connectivity and <http://127.0.0.1:8000/docs> for API documentation. `/health` returns HTTP 503 if PostgreSQL is unavailable. The migrations create `organizations`, `users`, `teams`, `team_members`, and Alembic's `alembic_version` tracking table. If registration reports a missing database column, stop the API, run `python -m alembic upgrade head`, and start the API again.

Authentication endpoints are `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, and `POST /auth/logout`. There are no default login credentials: register through the frontend to create an organization and its first Admin. Registration signs you in and shows the organization ID; login requires that ID, the registered email, and password. Import `backend/postman/OpsPilot Auth.postman_collection.json` in Postman to run the API flow, including token revocation.
