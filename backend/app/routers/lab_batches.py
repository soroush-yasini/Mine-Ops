import os
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.crud import lab_batch as crud
from app.models.user import User
from app.schemas.lab_batch import (
    LabBatchCreate,
    LabBatchListResponse,
    LabBatchResponse,
    LabBatchUpdate,
)

router = APIRouter(prefix="/lab-batches", tags=["lab-batches"])


@router.get("", response_model=LabBatchListResponse)
def list_batches(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    page: int = 1,
    size: int = 20,
) -> LabBatchListResponse:
    items, total = crud.get_multi(db, page=page, size=size)
    return LabBatchListResponse(items=items, total=total, page=page, size=size)


@router.get("/{batch_id}", response_model=LabBatchResponse)
def read_batch(
    batch_id: uuid.UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> LabBatchResponse:
    obj = crud.get(db, batch_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab batch not found")
    return obj


@router.post("", response_model=LabBatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(
    obj_in: LabBatchCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> LabBatchResponse:
    return crud.create(db, obj_in, created_by=current_user.id)


@router.put("/{batch_id}", response_model=LabBatchResponse)
def update_batch(
    batch_id: uuid.UUID,
    obj_in: LabBatchUpdate,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> LabBatchResponse:
    obj = crud.get(db, batch_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab batch not found")
    return crud.update(db, obj, obj_in)


@router.delete("/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_batch(
    batch_id: uuid.UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    if not crud.delete(db, batch_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab batch not found")


@router.post("/{batch_id}/upload-receipt-pdf", response_model=LabBatchResponse)
async def upload_receipt_pdf(
    batch_id: uuid.UUID,
    file: Annotated[UploadFile, File()],
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> LabBatchResponse:
    obj = crud.get(db, batch_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab batch not found")
    upload_dir = os.path.join(settings.UPLOAD_DIR, "lab_pdfs")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    relative_path = f"lab_pdfs/{filename}"
    return crud.update_receipt_pdf(db, obj, relative_path)
