import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.crud import grinding_cost as crud
from app.models.user import User
from app.schemas.grinding_cost import (
    GrindingCostCreate,
    GrindingCostListResponse,
    GrindingCostResponse,
    GrindingCostUpdate,
)

router = APIRouter(prefix="/grinding-costs", tags=["grinding-costs"])


@router.get("", response_model=GrindingCostListResponse)
def list_costs(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    page: int = 1,
    size: int = 20,
    site_id: uuid.UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> GrindingCostListResponse:
    items, total = crud.get_multi(db, page=page, size=size, site_id=site_id, date_from=date_from, date_to=date_to)
    total_balance = crud.get_balance(db, site_id=site_id)

    # Compute running balance correctly: start from the cumulative balance of all
    # records that precede this page (ordered by date_gregorian asc).
    preceding_balance = crud.get_balance_before_page(db, site_id=site_id, page=page, size=size, date_from=date_from, date_to=date_to)
    running = preceding_balance
    for item in items:
        running += (item.debit or 0) - (item.credit or 0)
        item.balance = running

    return GrindingCostListResponse(
        items=items, total=total, page=page, size=size, total_balance=total_balance
    )


@router.get("/{cost_id}", response_model=GrindingCostResponse)
def read_cost(
    cost_id: uuid.UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> GrindingCostResponse:
    obj = crud.get(db, cost_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grinding cost not found")
    return obj


@router.post("", response_model=GrindingCostResponse, status_code=status.HTTP_201_CREATED)
def create_cost(
    obj_in: GrindingCostCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> GrindingCostResponse:
    return crud.create(db, obj_in, created_by=current_user.id)


@router.put("/{cost_id}", response_model=GrindingCostResponse)
def update_cost(
    cost_id: uuid.UUID,
    obj_in: GrindingCostUpdate,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> GrindingCostResponse:
    obj = crud.get(db, cost_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grinding cost not found")
    return crud.update(db, obj, obj_in)


@router.delete("/{cost_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cost(
    cost_id: uuid.UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    if not crud.delete(db, cost_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grinding cost not found")
