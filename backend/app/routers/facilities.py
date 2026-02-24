from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.facility import GrindingFacility
from ..schemas.facility import FacilityCreate, FacilityUpdate, FacilityResponse
from typing import List

router = APIRouter(prefix="/facilities", tags=["facilities"])


@router.get("/", response_model=List[FacilityResponse])
async def list_facilities(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GrindingFacility))
    return result.scalars().all()


@router.post("/", response_model=FacilityResponse, status_code=201)
async def create_facility(data: FacilityCreate, db: AsyncSession = Depends(get_db)):
    obj = GrindingFacility(**data.model_dump())
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.get("/{id}", response_model=FacilityResponse)
async def get_facility(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GrindingFacility).where(GrindingFacility.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj


@router.put("/{id}", response_model=FacilityResponse)
async def update_facility(id: int, data: FacilityUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GrindingFacility).where(GrindingFacility.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.delete("/{id}", status_code=204)
async def delete_facility(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GrindingFacility).where(GrindingFacility.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    obj.is_active = False
    await db.commit()
