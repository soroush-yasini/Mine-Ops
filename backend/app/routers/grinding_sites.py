import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, role_required
from app.crud import grinding_site as crud_site
from app.models.user import User
from app.schemas.grinding_site import (
    GrindingSiteCreate,
    GrindingSiteListResponse,
    GrindingSiteResponse,
    GrindingSiteUpdate,
)

router = APIRouter(prefix="/grinding-sites", tags=["grinding-sites"])


@router.get("", response_model=GrindingSiteListResponse)
def list_sites(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    page: int = 1,
    size: int = 20,
    active_only: bool = False,
) -> GrindingSiteListResponse:
    items, total = crud_site.get_multi(db, page=page, size=size, active_only=active_only)
    return GrindingSiteListResponse(items=items, total=total, page=page, size=size)


@router.get("/{site_id}", response_model=GrindingSiteResponse)
def read_site(
    site_id: uuid.UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> GrindingSiteResponse:
    site = crud_site.get(db, site_id)
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grinding site not found")
    return site


@router.post("", response_model=GrindingSiteResponse, status_code=status.HTTP_201_CREATED)
def create_site(
    obj_in: GrindingSiteCreate,
    current_user: Annotated[User, Depends(role_required(["manager"]))],
    db: Annotated[Session, Depends(get_db)],
) -> GrindingSiteResponse:
    if crud_site.get_by_code(db, obj_in.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Site code already exists")
    return crud_site.create(db, obj_in, created_by=current_user.id)


@router.put("/{site_id}", response_model=GrindingSiteResponse)
def update_site(
    site_id: uuid.UUID,
    obj_in: GrindingSiteUpdate,
    _: Annotated[User, Depends(role_required(["manager"]))],
    db: Annotated[Session, Depends(get_db)],
) -> GrindingSiteResponse:
    site = crud_site.get(db, site_id)
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grinding site not found")
    return crud_site.update(db, site, obj_in)


@router.delete("/{site_id}", response_model=GrindingSiteResponse)
def delete_site(
    site_id: uuid.UUID,
    _: Annotated[User, Depends(role_required(["manager"]))],
    db: Annotated[Session, Depends(get_db)],
) -> GrindingSiteResponse:
    site = crud_site.soft_delete(db, site_id)
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grinding site not found")
    return site
