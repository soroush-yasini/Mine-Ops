from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.truck_trip import TruckTrip
from ..models.facility import GrindingFacility
from ..models.truck import Truck
from ..models.driver import Driver
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
    "نام و نام خانوادگی راننده": "driver_name",
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


def resolve_driver_id(name: str, all_drivers) -> int | None:
    """Return driver id for name, using exact match first then bidirectional prefix match."""
    name = name.strip()
    if not name or name == 'nan':
        return None
    for d in all_drivers:
        if d.full_name == name:
            return d.id
    for d in all_drivers:
        if d.full_name.startswith(name) or name.startswith(d.full_name):
            return d.id
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

    trucks_result = await db.execute(select(Truck))
    trucks = {str(t.plate_number): t.id for t in trucks_result.scalars().all()}

    drivers_result = await db.execute(select(Driver))
    all_drivers = list(drivers_result.scalars().all())

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

            freight_raw = row.get("freight_rate_per_ton", 8700000)
            try:
                freight_rate = int(str(freight_raw).replace(",", "")) if pd.notna(freight_raw) else 8700000
            except Exception:
                freight_rate = 8700000

            plate_raw = row.get("plate_number")
            truck_id = None
            if pd.notna(plate_raw):
                try:
                    plate_str = str(int(float(str(plate_raw).replace(",", ""))))
                    truck_id = trucks.get(plate_str)
                except Exception:
                    pass

            driver_name_raw = row.get("driver_name")
            driver_id = resolve_driver_id(str(driver_name_raw) if pd.notna(driver_name_raw) else "", all_drivers)

            obj = TruckTrip(
                date=parsed_date,
                receipt_number=receipt_number,
                tonnage_kg=tonnage_kg,
                destination_facility_id=facility_id,
                freight_rate_per_ton=freight_rate,
                truck_id=truck_id,
                driver_id=driver_id,
            )
            obj.total_freight_cost = int((tonnage_kg / 1000) * freight_rate)
            db.add(obj)
            imported += 1
        except Exception as e:
            errors.append({"row": row_num, "reason": str(e)})
            skipped += 1

    await db.commit()
    return {"total_rows": len(df), "imported": imported, "skipped": skipped, "errors": errors}
