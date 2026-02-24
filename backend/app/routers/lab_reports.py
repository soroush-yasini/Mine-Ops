from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..core.database import get_db
from ..models.lab_report import LabReport
from ..models.lab_sample import LabSample
from ..schemas.lab_report import LabReportCreate, LabReportUpdate, LabReportResponse
from ..schemas.lab_sample import LabSampleCreate, LabSampleResponse
from ..services.lab_code_parser import parse_lab_code, compute_threshold_flag
from typing import List, Optional
from datetime import date

router = APIRouter(prefix="/lab-reports", tags=["lab-reports"])


@router.get("/", response_model=List[LabReportResponse])
async def list_lab_reports(
    facility_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: AsyncSession = Depends(get_db)
):
    q = select(LabReport).options(selectinload(LabReport.samples))
    if facility_id:
        q = q.where(LabReport.facility_id == facility_id)
    if date_from:
        q = q.where(LabReport.issue_date >= date_from)
    if date_to:
        q = q.where(LabReport.issue_date <= date_to)
    result = await db.execute(q.order_by(LabReport.issue_date.desc()))
    return result.scalars().all()


@router.post("/", response_model=LabReportResponse, status_code=201)
async def create_lab_report(data: LabReportCreate, db: AsyncSession = Depends(get_db)):
    obj = LabReport(**data.model_dump())
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.get("/{id}", response_model=LabReportResponse)
async def get_lab_report(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LabReport).options(selectinload(LabReport.samples)).where(LabReport.id == id)
    )
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj


@router.put("/{id}", response_model=LabReportResponse)
async def update_lab_report(id: int, data: LabReportUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LabReport).where(LabReport.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.delete("/{id}", status_code=204)
async def delete_lab_report(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LabReport).where(LabReport.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(obj)
    await db.commit()


@router.get("/{report_id}/samples", response_model=List[LabSampleResponse])
async def list_samples(report_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LabSample).where(LabSample.report_id == report_id))
    return result.scalars().all()


@router.post("/{report_id}/samples", response_model=LabSampleResponse, status_code=201)
async def create_sample(report_id: int, data: LabSampleCreate, db: AsyncSession = Depends(get_db)):
    parsed = parse_lab_code(data.raw_code)
    threshold = compute_threshold_flag(parsed.get("sample_type"), data.au_ppm)
    obj = LabSample(
        report_id=report_id,
        raw_code=data.raw_code,
        au_ppm=data.au_ppm,
        threshold_flag=threshold,
        **parsed
    )
    db.add(obj)
    # Update sample_count on parent report
    report_result = await db.execute(select(LabReport).where(LabReport.id == report_id))
    report = report_result.scalar_one_or_none()
    if report:
        report.sample_count = (report.sample_count or 0) + 1
    await db.commit()
    await db.refresh(obj)
    return obj
