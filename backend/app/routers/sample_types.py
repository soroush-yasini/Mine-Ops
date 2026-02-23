import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, role_required
from app.crud import sample_type as crud_sample_type
from app.models.user import User
from app.schemas.sample_type import (
    SampleTypeCreate,
    SampleTypeListResponse,
    SampleTypeResponse,
    SampleTypeUpdate,
)

router = APIRouter(prefix="/sample-types", tags=["sample-types"])


@router.get("", response_model=SampleTypeListResponse)
def list_sample_types(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    page: int = 1,
    size: int = 20,
) -> SampleTypeListResponse:
    items, total = crud_sample_type.get_multi(db, page=page, size=size)
    return SampleTypeListResponse(items=items, total=total, page=page, size=size)


@router.get("/{sample_type_id}", response_model=SampleTypeResponse)
def read_sample_type(
    sample_type_id: uuid.UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> SampleTypeResponse:
    st = crud_sample_type.get(db, sample_type_id)
    if not st:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample type not found")
    return st


@router.post("", response_model=SampleTypeResponse, status_code=status.HTTP_201_CREATED)
def create_sample_type(
    obj_in: SampleTypeCreate,
    current_user: Annotated[User, Depends(role_required(["manager"]))],
    db: Annotated[Session, Depends(get_db)],
) -> SampleTypeResponse:
    if crud_sample_type.get_by_code(db, obj_in.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sample type code already exists")
    return crud_sample_type.create(db, obj_in, created_by=current_user.id)


@router.put("/{sample_type_id}", response_model=SampleTypeResponse)
def update_sample_type(
    sample_type_id: uuid.UUID,
    obj_in: SampleTypeUpdate,
    _: Annotated[User, Depends(role_required(["manager"]))],
    db: Annotated[Session, Depends(get_db)],
) -> SampleTypeResponse:
    st = crud_sample_type.get(db, sample_type_id)
    if not st:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample type not found")
    return crud_sample_type.update(db, st, obj_in)


@router.delete("/{sample_type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sample_type(
    sample_type_id: uuid.UUID,
    _: Annotated[User, Depends(role_required(["manager"]))],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    if not crud_sample_type.delete(db, sample_type_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sample type not found")
