from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..core.database import get_db
from ..models.truck import Truck
from ..schemas.truck import TruckCreate, TruckUpdate, TruckResponse
from typing import List

router = APIRouter(prefix="/trucks", tags=["trucks"])


@router.get("/", response_model=List[TruckResponse])
async def list_trucks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Truck).options(selectinload(Truck.default_driver)).where(Truck.is_active == True)
    )
    return result.scalars().all()


@router.post("/", response_model=TruckResponse, status_code=201)
async def create_truck(data: TruckCreate, db: AsyncSession = Depends(get_db)):
    obj = Truck(**data.model_dump())
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    result = await db.execute(
        select(Truck).options(selectinload(Truck.default_driver)).where(Truck.id == obj.id)
    )
    return result.scalar_one()


@router.get("/{id}", response_model=TruckResponse)
async def get_truck(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Truck).options(selectinload(Truck.default_driver)).where(Truck.id == id)
    )
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj


@router.put("/{id}", response_model=TruckResponse)
async def update_truck(id: int, data: TruckUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Truck).where(Truck.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    await db.commit()
    result = await db.execute(
        select(Truck).options(selectinload(Truck.default_driver)).where(Truck.id == id)
    )
    return result.scalar_one()


@router.delete("/{id}", status_code=204)
async def delete_truck(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Truck).where(Truck.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    obj.is_active = False
    await db.commit()
