import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, role_required
from app.crud import driver as crud_driver
from app.models.user import User
from app.schemas.driver import DriverCreate, DriverListResponse, DriverResponse, DriverUpdate

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.get("", response_model=DriverListResponse)
def list_drivers(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    page: int = 1,
    size: int = 20,
    search: str | None = None,
    active_only: bool = False,
) -> DriverListResponse:
    items, total = crud_driver.get_multi(db, page=page, size=size, search=search, active_only=active_only)
    return DriverListResponse(items=items, total=total, page=page, size=size)


@router.get("/{driver_id}", response_model=DriverResponse)
def read_driver(
    driver_id: uuid.UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DriverResponse:
    driver = crud_driver.get(db, driver_id)
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    return driver


@router.post("", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(
    obj_in: DriverCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DriverResponse:
    return crud_driver.create(db, obj_in, created_by=current_user.id)


@router.put("/{driver_id}", response_model=DriverResponse)
def update_driver(
    driver_id: uuid.UUID,
    obj_in: DriverUpdate,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> DriverResponse:
    driver = crud_driver.get(db, driver_id)
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    return crud_driver.update(db, driver, obj_in)


@router.delete("/{driver_id}", response_model=DriverResponse)
def delete_driver(
    driver_id: uuid.UUID,
    _: Annotated[User, Depends(role_required(["manager"]))],
    db: Annotated[Session, Depends(get_db)],
) -> DriverResponse:
    driver = crud_driver.soft_delete(db, driver_id)
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    return driver
