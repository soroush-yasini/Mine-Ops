from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.lab_sample import LabSample
from ..schemas.lab_sample import LabSampleUpdate, LabSampleResponse
from ..services.lab_code_parser import parse_lab_code, compute_threshold_flag

router = APIRouter(prefix="/lab-samples", tags=["lab-samples"])


@router.put("/{id}", response_model=LabSampleResponse)
async def update_sample(id: int, data: LabSampleUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LabSample).where(LabSample.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    if data.raw_code:
        parsed = parse_lab_code(data.raw_code)
        for k, v in parsed.items():
            setattr(obj, k, v)
        obj.raw_code = data.raw_code
    if data.au_ppm is not None:
        obj.au_ppm = data.au_ppm
    obj.threshold_flag = compute_threshold_flag(obj.sample_type, obj.au_ppm)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.delete("/{id}", status_code=204)
async def delete_sample(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LabSample).where(LabSample.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(obj)
    await db.commit()
