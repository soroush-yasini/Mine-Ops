import os
import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.crud import bunker_transport as crud
from app.models.user import User
from app.schemas.bunker_transport import (
    BunkerTransportCreate,
    BunkerTransportListResponse,
    BunkerTransportPaymentUpdate,
    BunkerTransportResponse,
    BunkerTransportUpdate,
)
from app.utils.excel_import import import_excel
from app.utils.jalali import jalali_to_gregorian

router = APIRouter(prefix="/bunker-transport", tags=["bunker-transport"])

COLUMN_MAP = {
    "تاریخ شمسی": "date_jalali",
    "Date Jalali": "date_jalali",
    "زمان": "time",
    "Time": "time",
    "شماره قبض": "receipt_no",
    "Receipt No": "receipt_no",
    "تناژ (کیلوگرم)": "tonnage_kg",
    "Tonnage KG": "tonnage_kg",
    "هزینه هر کیلو": "cost_per_kg",
    "Cost Per KG": "cost_per_kg",
    "شماره پلاک": "plate_number",
    "Plate Number": "plate_number",
    "نام راننده": "driver_name",
    "Driver Name": "driver_name",
    "مبدا": "origin_code",
    "Origin": "origin_code",
    "یادداشت": "notes",
    "Notes": "notes",
}
REQUIRED_IMPORT_COLUMNS = ["date_jalali", "receipt_no", "tonnage_kg", "cost_per_kg"]


@router.get("", response_model=BunkerTransportListResponse)
def list_transports(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    page: int = 1,
    size: int = 20,
    date_from: date | None = None,
    date_to: date | None = None,
    is_paid: bool | None = None,
    driver_id: uuid.UUID | None = None,
    origin_id: uuid.UUID | None = None,
) -> BunkerTransportListResponse:
    items, total = crud.get_multi(
        db, page=page, size=size,
        date_from=date_from, date_to=date_to,
        is_paid=is_paid, driver_id=driver_id,
        origin_id=origin_id,
    )
    return BunkerTransportListResponse(items=items, total=total, page=page, size=size)


@router.get("/{transport_id}", response_model=BunkerTransportResponse)
def read_transport(
    transport_id: uuid.UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BunkerTransportResponse:
    obj = crud.get(db, transport_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transport not found")
    return obj


@router.post("", response_model=BunkerTransportResponse, status_code=status.HTTP_201_CREATED)
def create_transport(
    obj_in: BunkerTransportCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BunkerTransportResponse:
    return crud.create(db, obj_in, created_by=current_user.id)


@router.put("/{transport_id}", response_model=BunkerTransportResponse)
def update_transport(
    transport_id: uuid.UUID,
    obj_in: BunkerTransportUpdate,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BunkerTransportResponse:
    obj = crud.get(db, transport_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transport not found")
    return crud.update(db, obj, obj_in)


@router.post("/{transport_id}/pay", response_model=BunkerTransportResponse)
def mark_paid(
    transport_id: uuid.UUID,
    payment: BunkerTransportPaymentUpdate,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BunkerTransportResponse:
    obj = crud.get(db, transport_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transport not found")
    return crud.mark_paid(db, obj, payment.payment_date_jalali, payment.payment_date_gregorian)


@router.delete("/{transport_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transport(
    transport_id: uuid.UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    if not crud.delete(db, transport_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transport not found")


@router.post("/{transport_id}/upload-bol", response_model=BunkerTransportResponse)
async def upload_bol(
    transport_id: uuid.UUID,
    file: Annotated[UploadFile, File()],
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BunkerTransportResponse:
    obj = crud.get(db, transport_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transport not found")
    upload_dir = os.path.join(settings.UPLOAD_DIR, "bol")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    relative_path = f"bol/{filename}"
    return crud.update_bol_image(db, obj, relative_path)


@router.post("/{transport_id}/upload-payment-receipt", response_model=BunkerTransportResponse)
async def upload_payment_receipt(
    transport_id: uuid.UUID,
    file: Annotated[UploadFile, File()],
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> BunkerTransportResponse:
    obj = crud.get(db, transport_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transport not found")
    upload_dir = os.path.join(settings.UPLOAD_DIR, "payment_receipts")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    relative_path = f"payment_receipts/{filename}"
    return crud.update_payment_receipt(db, obj, relative_path)


@router.post("/import-excel")
async def import_excel_endpoint(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    file: Annotated[UploadFile, File()],
    dry_run: bool = Query(default=False),
) -> dict:
    from app.crud import driver as crud_driver
    from app.crud import grinding_site as crud_site
    from app.crud import truck as crud_truck

    tmp_path = f"/tmp/{uuid.uuid4()}_{file.filename}"
    with open(tmp_path, "wb") as f:
        f.write(await file.read())

    rows, errors = import_excel(tmp_path, COLUMN_MAP, REQUIRED_IMPORT_COLUMNS)
    os.remove(tmp_path)

    if errors:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=errors)

    results = []
    row_errors = []

    for i, row in enumerate(rows, start=1):
        try:
            date_jalali = str(row.get("date_jalali", "")).strip()
            date_gregorian = jalali_to_gregorian(date_jalali)

            plate = str(row.get("plate_number", "")).strip()
            truck = crud_truck.get_by_plate(db, plate) if plate else None

            driver_name = str(row.get("driver_name", "")).strip()
            driver = None
            if driver_name:
                drivers, _ = crud_driver.get_multi(db, page=1, size=1, search=driver_name)
                driver = drivers[0] if drivers else None

            origin_code = str(row.get("origin_code", "")).strip()
            origin = crud_site.get_by_code(db, origin_code) if origin_code else None

            if not truck:
                row_errors.append(f"Row {i}: truck with plate '{plate}' not found")
                continue
            if not driver:
                row_errors.append(f"Row {i}: driver '{driver_name}' not found")
                continue
            if not origin:
                row_errors.append(f"Row {i}: origin '{origin_code}' not found")
                continue

            obj_in = BunkerTransportCreate(
                date_jalali=date_jalali,
                date_gregorian=date_gregorian,
                truck_id=truck.id,
                driver_id=driver.id,
                receipt_no=str(row.get("receipt_no", "")).strip(),
                tonnage_kg=int(row.get("tonnage_kg", 0)),
                origin_id=origin.id,
                cost_per_kg=int(row.get("cost_per_kg", 0)),
                notes=str(row.get("notes", "")).strip() or None,
            )
            if not dry_run:
                created = crud.create(db, obj_in, created_by=current_user.id)
                results.append(str(created.id))
            else:
                results.append(f"Row {i}: valid")
        except Exception as exc:
            row_errors.append(f"Row {i}: {exc}")

    return {
        "imported": len(results),
        "errors": row_errors,
        "dry_run": dry_run,
        "results": results,
    }
