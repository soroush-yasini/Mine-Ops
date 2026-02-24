from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.truck_trip import TruckTrip
from ..models.facility import GrindingFacility
import io
import pandas as pd
import jdatetime
from datetime import date
from typing import List

router = APIRouter()

COLUMN_MAP = {
    "تاریخ": "date",
    "شماره ماشین": "plate_number",
    "شماره قبض": "receipt_number",
    "تناژ": "tonnage_kg",
    "مقصد": "destination",
    "هزینه حمل هر تن": "freight_rate_per_ton",
    "نام راننده": "driver_name",
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


@router.post("/truck-trips")
async def import_truck_trips(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
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
                select(TruckTrip).where(TruckTrip.receipt_number == receipt_number)
            )
            if existing.scalar_one_or_none():
                errors.append({"row": row_num, "reason": "duplicate receipt_number"})
                skipped += 1
                continue

            tonnage_kg = float(str(row.get("tonnage_kg", 0)).replace(",", ""))
            destination_code = str(row.get("destination", "")).strip()
            facility_id = facilities.get(destination_code, 1)

            obj = TruckTrip(
                date=parsed_date,
                receipt_number=receipt_number,
                tonnage_kg=tonnage_kg,
                destination_facility_id=facility_id,
                freight_rate_per_ton=int(row.get("freight_rate_per_ton", 8700000)),
                truck_id=1,
                driver_id=1,
            )
            obj.total_freight_cost = int((tonnage_kg / 1000) * obj.freight_rate_per_ton)
            db.add(obj)
            imported += 1
        except Exception as e:
            errors.append({"row": row_num, "reason": str(e)})
            skipped += 1

    await db.commit()
    return {"total_rows": len(df), "imported": imported, "skipped": skipped, "errors": errors}
