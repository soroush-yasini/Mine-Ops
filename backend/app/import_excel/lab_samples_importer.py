from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.lab_report import LabReport
from ..models.lab_sample import LabSample
from ..services.lab_code_parser import parse_lab_code, compute_threshold_flag
import io
import pandas as pd

router = APIRouter()

COLUMN_MAP = {
    "کد نمونه": "raw_code",
    "عیار (ppm)": "au_ppm",
    "شناسه گزارش": "report_id",
}


@router.post("/lab-samples")
async def import_lab_samples(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    content = await file.read()
    if file.filename and file.filename.endswith(".xlsx"):
        df = pd.read_excel(io.BytesIO(content))
    else:
        df = pd.read_csv(io.BytesIO(content))

    df.rename(columns=COLUMN_MAP, inplace=True)

    imported = 0
    skipped = 0
    errors = []

    for idx, row in df.iterrows():
        row_num = idx + 2
        try:
            raw_code = str(row.get("raw_code", "")).strip()
            if not raw_code:
                errors.append({"row": row_num, "reason": "missing raw_code"})
                skipped += 1
                continue

            au_ppm_raw = row.get("au_ppm")
            if pd.isna(au_ppm_raw):
                errors.append({"row": row_num, "reason": "missing au_ppm"})
                skipped += 1
                continue
            au_ppm = float(au_ppm_raw)

            report_id_raw = row.get("report_id")
            if pd.isna(report_id_raw):
                errors.append({"row": row_num, "reason": "missing report_id"})
                skipped += 1
                continue
            report_id = int(report_id_raw)

            # Verify report exists
            report_result = await db.execute(select(LabReport).where(LabReport.id == report_id))
            report = report_result.scalar_one_or_none()
            if not report:
                errors.append({"row": row_num, "reason": f"report_id {report_id} not found"})
                skipped += 1
                continue

            parsed = parse_lab_code(raw_code)
            threshold = compute_threshold_flag(parsed.get("sample_type"), au_ppm)

            obj = LabSample(
                report_id=report_id,
                raw_code=raw_code,
                au_ppm=au_ppm,
                threshold_flag=threshold,
                **parsed,
            )
            db.add(obj)
            report.sample_count = (report.sample_count or 0) + 1
            imported += 1
        except Exception as e:
            errors.append({"row": row_num, "reason": str(e)})
            skipped += 1

    await db.commit()
    return {"total_rows": len(df), "imported": imported, "skipped": skipped, "errors": errors}
