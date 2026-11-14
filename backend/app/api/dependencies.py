from enum import Enum

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


class Role(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    claims = decode_access_token(token)
    try:
        user_id = int(claims["sub"])
    except (ValueError, TypeError, KeyError) as exc:
        raise HTTPException(status_code=401, detail="Invalid access token") from exc
    user = db.get(User, user_id)
    if (user is None or user.organization_id != claims.get("org")
            or user.role != claims.get("role") or user.token_version != claims.get("ver")):
        raise HTTPException(status_code=401, detail="Invalid or revoked access token")
    return user


def require_roles(*roles: Role):
    def check_role(user: User = Depends(get_current_user)) -> User:
        if user.role not in {role.value for role in roles}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user
    return check_role


def ensure_same_organization(user: User, organization_id: int) -> None:
    if user.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Resource not found")
