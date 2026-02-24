from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.driver import Driver
from ..schemas.driver import DriverCreate, DriverUpdate, DriverResponse
from typing import List

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.get("/", response_model=List[DriverResponse])
async def list_drivers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Driver).where(Driver.is_active == True))
    return result.scalars().all()


@router.post("/", response_model=DriverResponse, status_code=201)
async def create_driver(data: DriverCreate, db: AsyncSession = Depends(get_db)):
    obj = Driver(**data.model_dump())
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.get("/{id}", response_model=DriverResponse)
async def get_driver(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Driver).where(Driver.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj


@router.put("/{id}", response_model=DriverResponse)
async def update_driver(id: int, data: DriverUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Driver).where(Driver.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.delete("/{id}", status_code=204)
async def delete_driver(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Driver).where(Driver.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    obj.is_active = False
    await db.commit()
