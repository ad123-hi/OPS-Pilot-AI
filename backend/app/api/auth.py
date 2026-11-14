from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models import Organization, User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    # Each public registration starts a new tenant; role and organization IDs are never accepted.
    organization = Organization(name=body.organization_name)
    db.add(organization)
    db.flush()
    user = User(
        organization_id=organization.id,
        full_name=body.full_name,
        email=body.email,
        password_hash=hash_password(body.password),
        role="admin",
    )
    db.add(user)
    try:
        db.flush()
        response = _token_response(user)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Unable to create account") from exc
    db.refresh(user)
    return response


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(
        User.organization_id == body.organization_id,
        User.email == body.email,
    ))
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email, password, or organization")
    return _token_response(user)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    # Incrementing the DB version revokes this and all of the user's outstanding access tokens.
    user.token_version += 1
    db.add(user)
    db.commit()


def _token_response(user: User) -> TokenResponse:
    access_token = create_access_token(user.id, user.organization_id, user.role, user.token_version)
    return TokenResponse(access_token=access_token, user=UserResponse.model_validate(user))
