import os
import uuid
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.crud import lab_assay as crud
from app.crud import grinding_site as crud_site
from app.crud import sample_type as crud_sample_type
from app.models.user import User
from app.schemas.lab_assay import (
    LabAssayCreate,
    LabAssayListResponse,
    LabAssayResponse,
    LabAssayUpdate,
)
from app.utils.excel_import import import_excel
from app.utils.jalali import jalali_to_gregorian
from app.utils.sample_parser import parse_sample_code

router = APIRouter(prefix="/lab-assays", tags=["lab-assays"])

COLUMN_MAP = {
    "کد نمونه": "sample_code",
    "Sample Code": "sample_code",
    "Au (ppm)": "au_ppm",
    "طلا (ppm)": "au_ppm",
    "تاریخ نمونه": "sample_date_jalali",
    "Sample Date": "sample_date_jalali",
    "کد آزمایشگاه": "batch_code",
    "Batch": "batch_code",
    "یادداشت": "notes",
    "Notes": "notes",
}
REQUIRED_IMPORT_COLUMNS = ["sample_code", "au_ppm"]


@router.get("", response_model=LabAssayListResponse)
def list_assays(
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    page: int = 1,
    size: int = 20,
    batch_id: uuid.UUID | None = None,
    facility_id: uuid.UUID | None = None,
    sample_type_id: uuid.UUID | None = None,
) -> LabAssayListResponse:
    items, total = crud.get_multi(
        db, page=page, size=size,
        batch_id=batch_id, facility_id=facility_id,
        sample_type_id=sample_type_id,
    )
    return LabAssayListResponse(items=items, total=total, page=page, size=size)


@router.get("/{assay_id}", response_model=LabAssayResponse)
def read_assay(
    assay_id: uuid.UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> LabAssayResponse:
    obj = crud.get(db, assay_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab assay not found")
    return obj


@router.post("", response_model=LabAssayResponse, status_code=status.HTTP_201_CREATED)
def create_assay(
    obj_in: LabAssayCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> LabAssayResponse:
    # Auto-parse sample_code if facility/sample_type/date not provided
    parsed = parse_sample_code(obj_in.sample_code)
    create_data = obj_in.model_copy()
    if obj_in.facility_id is None and parsed.facility_code:
        site = crud_site.get_by_code(db, parsed.facility_code)
        if site:
            create_data = create_data.model_copy(update={"facility_id": site.id})
    if obj_in.sample_type_id is None and parsed.sample_type_code:
        st = crud_sample_type.get_by_code(db, parsed.sample_type_code)
        if st:
            create_data = create_data.model_copy(update={"sample_type_id": st.id})
    if obj_in.sample_date_jalali is None and parsed.date_jalali:
        try:
            greg = jalali_to_gregorian(parsed.date_jalali)
            create_data = create_data.model_copy(update={
                "sample_date_jalali": parsed.date_jalali,
                "sample_date_gregorian": greg,
            })
        except Exception:
            pass
    if obj_in.sample_index is None and parsed.sample_index is not None:
        create_data = create_data.model_copy(update={"sample_index": parsed.sample_index})
    return crud.create(db, create_data, created_by=current_user.id)


@router.put("/{assay_id}", response_model=LabAssayResponse)
def update_assay(
    assay_id: uuid.UUID,
    obj_in: LabAssayUpdate,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> LabAssayResponse:
    obj = crud.get(db, assay_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab assay not found")
    return crud.update(db, obj, obj_in)


@router.delete("/{assay_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assay(
    assay_id: uuid.UUID,
    _: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> None:
    if not crud.delete(db, assay_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lab assay not found")


@router.post("/import-excel")
async def import_excel_endpoint(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    file: Annotated[UploadFile, File()],
    batch_id: uuid.UUID = Query(...),
    dry_run: bool = Query(default=False),
) -> dict:
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
            sample_code = str(row.get("sample_code", "")).strip()
            au_ppm_raw = row.get("au_ppm")
            try:
                au_ppm = Decimal(str(au_ppm_raw))
            except Exception:
                row_errors.append(f"Row {i}: invalid au_ppm value '{au_ppm_raw}'")
                continue

            parsed = parse_sample_code(sample_code)

            facility_id = None
            if parsed.facility_code:
                site = crud_site.get_by_code(db, parsed.facility_code)
                if site:
                    facility_id = site.id

            sample_type_id = None
            if parsed.sample_type_code:
                st = crud_sample_type.get_by_code(db, parsed.sample_type_code)
                if st:
                    sample_type_id = st.id

            sample_date_jalali = None
            sample_date_gregorian = None
            if parsed.date_jalali:
                try:
                    sample_date_gregorian = jalali_to_gregorian(parsed.date_jalali)
                    sample_date_jalali = parsed.date_jalali
                except Exception:
                    pass

            raw_date = row.get("sample_date_jalali")
            if raw_date:
                try:
                    sample_date_jalali = str(raw_date).strip()
                    sample_date_gregorian = jalali_to_gregorian(sample_date_jalali)
                except Exception:
                    pass

            obj_in = LabAssayCreate(
                batch_id=batch_id,
                sample_code=sample_code,
                facility_id=facility_id,
                sample_date_jalali=sample_date_jalali,
                sample_date_gregorian=sample_date_gregorian,
                sample_type_id=sample_type_id,
                sample_index=parsed.sample_index,
                au_ppm=au_ppm,
            )
            if not dry_run:
                created = crud.create(db, obj_in, created_by=current_user.id)
                results.append(str(created.id))
            else:
                results.append(f"Row {i}: valid ({sample_code} = {au_ppm} ppm)")
        except Exception as exc:
            row_errors.append(f"Row {i}: {exc}")

    return {
        "imported": len(results),
        "errors": row_errors,
        "dry_run": dry_run,
        "results": results,
    }
