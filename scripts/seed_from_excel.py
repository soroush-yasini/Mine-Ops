"""
Seed script to import data from Excel files into the database.

Usage:
    python scripts/seed_from_excel.py --financial-ledger path/to/ledger.xlsx --facility A

Environment variables (or .env file):
    DATABASE_URL: PostgreSQL connection URL
"""
import argparse
import asyncio
import os
import re
import sys

import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv

load_dotenv()

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/mineops")


def clean_amount(val) -> int | None:
    """Remove commas and handle Persian trailing minus: '2,654,913,000-' → -2654913000"""
    try:
        s = str(val).replace(",", "").strip()
        if not s or s in ('nan', 'None', ''):
            return None
        negative = s.endswith('-')
        s = s.rstrip('-').strip()
        result = int(float(s))
        return -result if negative else result
    except Exception:
        return None


def jalali_to_gregorian(val):
    import jdatetime
    try:
        parts = str(val).strip().replace("/", "-").split("-")
        if len(parts) == 3:
            jd = jdatetime.date(int(parts[0]), int(parts[1]), int(parts[2]))
            return jd.togregorian()
    except Exception:
        pass
    return None


async def import_financial_ledger(filepath: str, facility_code: str):
    from backend.app.models.financial_ledger import FinancialLedger
    from backend.app.models.facility import GrindingFacility

    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    if filepath.endswith(".xlsx"):
        df = pd.read_excel(filepath)
    else:
        df = pd.read_csv(filepath)

    imported = 0
    skipped = 0
    errors = []

    async with async_session() as db:
        facilities_result = await db.execute(select(GrindingFacility))
        facilities = {f.code: f.id for f in facilities_result.scalars().all()}

        facility_id = facilities.get(facility_code)
        if not facility_id:
            print(f"Error: facility code '{facility_code}' not found in database.")
            print(f"Available codes: {list(facilities.keys())}")
            return

        for idx, row in df.iterrows():
            row_num = idx + 2

            debit = clean_amount(row.get("بدهکار"))
            credit = clean_amount(row.get("بستانکار"))
            balance = clean_amount(row.get("مانده"))
            desc = str(row.get("شرح", "") or "").strip()

            # Skip completely empty rows silently
            if not desc and debit is None and credit is None:
                skipped += 1
                continue

            date_raw = row.get("تاریخ")
            try:
                if pd.isna(date_raw) or not str(date_raw).strip():
                    skipped += 1
                    continue
            except (TypeError, ValueError):
                pass

            parsed_date = jalali_to_gregorian(date_raw)
            if not parsed_date:
                errors.append({"row": row_num, "reason": "invalid date"})
                skipped += 1
                continue

            if not desc:
                errors.append({"row": row_num, "reason": "missing description"})
                skipped += 1
                continue

            # Extract receipt number from description if present
            receipt_number = None
            match = re.search(r'قبض\s+(\d+)', desc)
            if match:
                receipt_number = int(match.group(1))

            # Extract tonnage from description if present
            tonnage_kg = None
            tonnage_match = re.search(r'تناژ\s+([\d,]+)', desc)
            if tonnage_match:
                try:
                    tonnage_kg = float(tonnage_match.group(1).replace(",", ""))
                except Exception:
                    pass

            # Extract rate from description if present
            rate_per_ton = None
            rate_match = re.search(r'فی\s+([\d,]+)', desc)
            if rate_match:
                try:
                    rate_per_ton = int(rate_match.group(1).replace(",", ""))
                except Exception:
                    pass

            try:
                obj = FinancialLedger(
                    facility_id=facility_id,
                    date=parsed_date,
                    description=desc,
                    debit=debit,
                    credit=credit,
                    balance=balance,
                    receipt_number=receipt_number,
                    ledger_tonnage_kg=tonnage_kg,
                    rate_per_ton=rate_per_ton,
                )
                db.add(obj)
                imported += 1
            except Exception as e:
                errors.append({"row": row_num, "reason": str(e)})
                skipped += 1

        await db.commit()

    print(f"Financial ledger import complete:")
    print(f"  Total rows: {len(df)}")
    print(f"  Imported:   {imported}")
    print(f"  Skipped:    {skipped}")
    if errors:
        print(f"  Errors ({len(errors)}):")
        for err in errors[:10]:
            print(f"    Row {err['row']}: {err['reason']}")
        if len(errors) > 10:
            print(f"    ... and {len(errors) - 10} more")


def main():
    parser = argparse.ArgumentParser(description="Seed database from Excel files")
    parser.add_argument("--financial-ledger", metavar="FILE", help="Path to financial ledger Excel file")
    parser.add_argument("--facility", metavar="CODE", default="A", help="Facility code (A, B, C)")
    args = parser.parse_args()

    if args.financial_ledger:
        asyncio.run(import_financial_ledger(args.financial_ledger, args.facility))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
