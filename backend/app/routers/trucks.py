import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, role_required
from app.crud import truck as crud_truck
from app.models.user import User
from app.schemas.truck import TruckCreate, TruckListResponse, TruckResponse, TruckUpdate

router = APIRouter(prefix="/trucks", tags=["trucks"])


@router.get("", response_model=TruckListResponse)
def list_trucks(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    page: int = 1,
    size: int = 20,
    active_only: bool = False,
) -> TruckListResponse:
    items, total = crud_truck.get_multi(db, page=page, size=size, active_only=active_only)
    return TruckListResponse(items=items, total=total, page=page, size=size)


@router.get("/{truck_id}", response_model=TruckResponse)
def read_truck(
    truck_id: uuid.UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> TruckResponse:
    truck = crud_truck.get(db, truck_id)
    if not truck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Truck not found")
    return truck


@router.post("", response_model=TruckResponse, status_code=status.HTTP_201_CREATED)
def create_truck(
    obj_in: TruckCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> TruckResponse:
    if crud_truck.get_by_plate(db, obj_in.plate_number):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Plate number already exists")
    return crud_truck.create(db, obj_in, created_by=current_user.id)


@router.put("/{truck_id}", response_model=TruckResponse)
def update_truck(
    truck_id: uuid.UUID,
    obj_in: TruckUpdate,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> TruckResponse:
    truck = crud_truck.get(db, truck_id)
    if not truck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Truck not found")
    if obj_in.plate_number and obj_in.plate_number != truck.plate_number:
        if crud_truck.get_by_plate(db, obj_in.plate_number):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Plate number already exists")
    return crud_truck.update(db, truck, obj_in)


@router.delete("/{truck_id}", response_model=TruckResponse)
def delete_truck(
    truck_id: uuid.UUID,
    _: Annotated[User, Depends(role_required(["manager"]))],
    db: Annotated[Session, Depends(get_db)],
) -> TruckResponse:
    truck = crud_truck.soft_delete(db, truck_id)
    if not truck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Truck not found")
    return truck
