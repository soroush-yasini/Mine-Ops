from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.bunker_trip import BunkerTrip
from ..models.facility import GrindingFacility
import io
import pandas as pd
import jdatetime
from datetime import date

router = APIRouter()

COLUMN_MAP = {
    "تاریخ": "date",
    "شماره ماشین": "plate_number",
    "شماره قبض": "receipt_number",
    "تناژ": "tonnage_kg",
    "مبدا": "origin",
    "هزینه حمل هر تن": "freight_rate_per_ton",
    "مبلغ کل ثبت شده": "recorded_total_amount",
    "نام راننده": "driver_name",
    "یادداشت": "notes",
}


def parse_jalali_date(s) -> date:
    try:
        parts = str(s).strip().replace("/", "-").split("-")
        if len(parts) == 3:
            jd = jdatetime.date(int(parts[0]), int(parts[1]), int(parts[2]))
            return jd.togregorian()
    except Exception:
        pass
    return None


@router.post("/bunker-trips")
async def import_bunker_trips(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    content = await file.read()
    if file.filename and file.filename.endswith(".xlsx"):
        df = pd.read_excel(io.BytesIO(content))
    else:
        df = pd.read_csv(io.BytesIO(content))

    df.rename(columns=COLUMN_MAP, inplace=True)

    imported = 0
    skipped = 0
    errors = []

    facilities_result = await db.execute(select(GrindingFacility))
    facilities = {f.code: f.id for f in facilities_result.scalars().all()}

    for idx, row in df.iterrows():
        row_num = idx + 2
        try:
            parsed_date = parse_jalali_date(row.get("date"))
            if not parsed_date:
                errors.append({"row": row_num, "reason": "invalid date"})
                skipped += 1
                continue

            receipt_number = int(row.get("receipt_number", 0))

            existing = await db.execute(
                select(BunkerTrip).where(BunkerTrip.receipt_number == receipt_number)
            )
            if existing.scalar_one_or_none():
                errors.append({"row": row_num, "reason": "duplicate receipt_number"})
                skipped += 1
                continue

            tonnage_kg = float(str(row.get("tonnage_kg", 0)).replace(",", ""))
            origin_code = str(row.get("origin", "")).strip()
            facility_id = facilities.get(origin_code, 1)
            freight_rate = int(row.get("freight_rate_per_ton", 2800000))

            recorded_raw = row.get("recorded_total_amount")
            recorded_total = None
            if pd.notna(recorded_raw):
                try:
                    recorded_total = int(float(str(recorded_raw).replace(",", "")))
                except Exception:
                    pass

            obj = BunkerTrip(
                date=parsed_date,
                receipt_number=receipt_number,
                tonnage_kg=tonnage_kg,
                origin_facility_id=facility_id,
                freight_rate_per_ton=freight_rate,
                recorded_total_amount=recorded_total,
                truck_id=None,
                driver_id=None,
                notes=str(row.get("notes", "")) if pd.notna(row.get("notes")) else None,
            )
            obj.computed_total_amount = int((tonnage_kg / 1000) * freight_rate)
            if recorded_total:
                obj.tonnage_discrepancy_kg = ((recorded_total / freight_rate) * 1000) - tonnage_kg
            db.add(obj)
            imported += 1
        except Exception as e:
            errors.append({"row": row_num, "reason": str(e)})
            skipped += 1

    await db.commit()
    return {"total_rows": len(df), "imported": imported, "skipped": skipped, "errors": errors}
