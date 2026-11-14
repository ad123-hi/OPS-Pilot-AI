from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_roles, Role
from app.db.session import get_db
from app.models import Organization, User

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("/me")
def get_my_organization(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    organization = db.get(Organization, user.organization_id)
    if organization is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return {"id": organization.id, "name": organization.name, "created_at": organization.created_at}


@router.get("/members")
def list_organization_members(
    user: User = Depends(require_roles(Role.ADMIN, Role.MANAGER)),
    db: Session = Depends(get_db),
) -> list[dict]:
    members = db.query(User).filter(User.organization_id == user.organization_id).order_by(User.id).all()
    return [
        {"id": member.id, "full_name": member.full_name, "email": member.email, "role": member.role}
        for member in members
    ]
