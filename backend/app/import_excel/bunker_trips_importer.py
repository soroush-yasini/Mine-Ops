from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.bunker_trip import BunkerTrip
from ..models.facility import GrindingFacility
from ..models.truck import Truck
from ..models.driver import Driver
import io
import pandas as pd
import jdatetime
from datetime import date, time as time_type

router = APIRouter()

COLUMN_MAP = {
    "تاریخ": "date",
    "شماره ماشین": "plate_number",
    "شماره قبض": "receipt_number",
    "تناژ": "tonnage_kg",
    "مبدا": "origin",
    "هزینه حمل هر تن": "freight_rate_per_ton",
    "مبلغ کل ثبت شده": "total_amount",
    "مبلغ (ریال)": "total_amount",
    "نام راننده": "driver_name",
    "نام و نام خانوادگی راننده": "driver_name",
    "ساعت": "time",
    "یادداشت": "notes",
    "توضیحات": "notes",
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


def resolve_driver_id(name: str, drivers: dict):
    """Return driver id for name, using exact match first then prefix (startswith) match."""
    if not name:
        return None
    if name in drivers:
        return drivers[name]
    for full_name, driver_id in drivers.items():
        if full_name.startswith(name):
            return driver_id
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
    facilities_list = facilities_result.scalars().all()
    facilities_by_code = {f.code: f.id for f in facilities_list}
    facilities_by_name = {f.name_fa: f.id for f in facilities_list}

    trucks_result = await db.execute(select(Truck))
    trucks = {str(t.plate_number): t.id for t in trucks_result.scalars().all()}

    drivers_result = await db.execute(select(Driver))
    drivers = {d.full_name: d.id for d in drivers_result.scalars().all()}

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
            facility_id = facilities_by_code.get(origin_code) or facilities_by_name.get(origin_code) or 1

            freight_rate_raw = row.get("freight_rate_per_ton", 2800000)
            try:
                freight_rate = int(str(freight_rate_raw).replace(",", "")) if pd.notna(freight_rate_raw) else 2800000
            except Exception:
                freight_rate = 2800000

            recorded_raw = row.get("total_amount")
            total_amount = None
            if pd.notna(recorded_raw):
                try:
                    total_amount = int(float(str(recorded_raw).replace(",", "")))
                except Exception:
                    pass

            plate_raw = row.get("plate_number")
            truck_id = None
            if pd.notna(plate_raw):
                try:
                    plate_str = str(int(float(str(plate_raw).replace(",", ""))))
                    truck_id = trucks.get(plate_str)
                except Exception:
                    pass

            driver_name_raw = row.get("driver_name")
            driver_id = resolve_driver_id(
                str(driver_name_raw) if pd.notna(driver_name_raw) else "", drivers
            )

            time_raw = row.get("time")
            trip_time = None
            if pd.notna(time_raw):
                try:
                    parts = str(time_raw).strip().split(":")
                    if len(parts) >= 2:
                        trip_time = time_type(int(parts[0]), int(parts[1]))
                except Exception:
                    pass

            obj = BunkerTrip(
                date=parsed_date,
                time=trip_time,
                receipt_number=receipt_number,
                tonnage_kg=tonnage_kg,
                origin_facility_id=facility_id,
                freight_rate_per_ton=freight_rate,
                total_amount=total_amount,
                truck_id=truck_id,
                driver_id=driver_id,
                notes=str(row.get("notes", "")) if pd.notna(row.get("notes")) else None,
            )
            db.add(obj)
            imported += 1
        except Exception as e:
            errors.append({"row": row_num, "reason": str(e)})
            skipped += 1

    await db.commit()
    return {"total_rows": len(df), "imported": imported, "skipped": skipped, "errors": errors}
