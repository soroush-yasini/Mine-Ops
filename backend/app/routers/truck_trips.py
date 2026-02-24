from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..core.database import get_db
from ..models.truck_trip import TruckTrip
from ..schemas.truck_trip import TruckTripCreate, TruckTripUpdate, TruckTripPayment, TruckTripResponse
from typing import List, Optional
from datetime import date

router = APIRouter(prefix="/truck-trips", tags=["truck-trips"])


@router.get("/", response_model=List[TruckTripResponse])
async def list_truck_trips(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    facility_id: Optional[int] = None,
    driver_id: Optional[int] = None,
    is_paid: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    q = select(TruckTrip)
    if date_from:
        q = q.where(TruckTrip.date >= date_from)
    if date_to:
        q = q.where(TruckTrip.date <= date_to)
    if facility_id:
        q = q.where(TruckTrip.destination_facility_id == facility_id)
    if driver_id:
        q = q.where(TruckTrip.driver_id == driver_id)
    if is_paid is not None:
        q = q.where(TruckTrip.is_paid == is_paid)
    result = await db.execute(q.order_by(TruckTrip.date.desc()))
    return result.scalars().all()


@router.post("/", response_model=TruckTripResponse, status_code=201)
async def create_truck_trip(data: TruckTripCreate, db: AsyncSession = Depends(get_db)):
    obj = TruckTrip(**data.model_dump())
    obj.total_freight_cost = int((obj.tonnage_kg / 1000) * obj.freight_rate_per_ton)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.get("/{id}", response_model=TruckTripResponse)
async def get_truck_trip(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TruckTrip).where(TruckTrip.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj


@router.put("/{id}", response_model=TruckTripResponse)
async def update_truck_trip(id: int, data: TruckTripUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TruckTrip).where(TruckTrip.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    obj.total_freight_cost = int((obj.tonnage_kg / 1000) * obj.freight_rate_per_ton)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.patch("/{id}/payment", response_model=TruckTripResponse)
async def pay_truck_trip(id: int, data: TruckTripPayment, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TruckTrip).where(TruckTrip.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    obj.is_paid = True
    obj.status = "paid"
    await db.commit()
    await db.refresh(obj)
    return obj


@router.delete("/{id}", status_code=204)
async def delete_truck_trip(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TruckTrip).where(TruckTrip.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(obj)
    await db.commit()
