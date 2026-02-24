from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.financial_ledger import FinancialLedger
from ..models.facility import GrindingFacility
from ..services.tonnage_discrepancy import compute_discrepancy
from ..services.running_balance import recompute_balance
import io
import pandas as pd
import jdatetime
from datetime import date

router = APIRouter()

COLUMN_MAP = {
    "تاریخ": "date",
    "توضیحات": "description",
    "بدهکار": "debit",
    "بستانکار": "credit",
    "شماره قبض": "receipt_number",
    "تناژ (کیلوگرم)": "ledger_tonnage_kg",
    "نرخ هر تن": "rate_per_ton",
    "کد تاسیسات": "facility_code",
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


def safe_int(val):
    if pd.isna(val):
        return None
    try:
        return int(float(str(val).replace(",", "")))
    except Exception:
        return None


def safe_float(val):
    if pd.isna(val):
        return None
    try:
        return float(str(val).replace(",", ""))
    except Exception:
        return None


@router.post("/financial-ledger")
async def import_financial_ledger(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    content = await file.read()
    if file.filename and file.filename.endswith(".xlsx"):
        df = pd.read_excel(io.BytesIO(content))
    else:
        df = pd.read_csv(io.BytesIO(content))

    df.rename(columns=COLUMN_MAP, inplace=True)

    imported = 0
    skipped = 0
    errors = []
    affected_facilities = set()

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

            description = str(row.get("description", "")).strip()
            if not description:
                errors.append({"row": row_num, "reason": "missing description"})
                skipped += 1
                continue

            facility_code = str(row.get("facility_code", "")).strip()
            facility_id = facilities.get(facility_code)
            if not facility_id:
                errors.append({"row": row_num, "reason": f"unknown facility_code: {facility_code}"})
                skipped += 1
                continue

            obj = FinancialLedger(
                facility_id=facility_id,
                date=parsed_date,
                description=description,
                debit=safe_int(row.get("debit")),
                credit=safe_int(row.get("credit")),
                receipt_number=safe_int(row.get("receipt_number")),
                ledger_tonnage_kg=safe_float(row.get("ledger_tonnage_kg")),
                rate_per_ton=safe_int(row.get("rate_per_ton")),
            )
            await compute_discrepancy(db, obj)
            db.add(obj)
            affected_facilities.add(facility_id)
            imported += 1
        except Exception as e:
            errors.append({"row": row_num, "reason": str(e)})
            skipped += 1

    await db.commit()

    for fid in affected_facilities:
        await recompute_balance(db, fid)
    await db.commit()

    return {"total_rows": len(df), "imported": imported, "skipped": skipped, "errors": errors}
