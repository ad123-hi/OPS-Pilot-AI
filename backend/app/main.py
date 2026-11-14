from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.organizations import router as organizations_router
from app.db.session import get_db

app = FastAPI(title=settings.APP_NAME, version="1.0.0")
app.include_router(auth_router)
app.include_router(organizations_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"])
def root() -> dict[str, str]:
    return {"message": "Welcome to OpsPilot AI API"}


@app.get("/health", tags=["health"])
def health_check(db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database connection failed") from exc
    return {"status": "healthy", "database": "connected"}
