from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from ..core.database import get_db
from ..models.bunker_trip import BunkerTrip
from ..schemas.bunker_trip import BunkerTripCreate, BunkerTripUpdate, BunkerTripPayment, BunkerTripResponse
from typing import List, Optional
from datetime import date

router = APIRouter(prefix="/bunker-trips", tags=["bunker-trips"])


@router.get("/", response_model=List[BunkerTripResponse])
async def list_bunker_trips(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    facility_id: Optional[int] = None,
    driver_id: Optional[int] = None,
    is_paid: Optional[bool] = None,
    has_discrepancy: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    q = select(BunkerTrip)
    if date_from:
        q = q.where(BunkerTrip.date >= date_from)
    if date_to:
        q = q.where(BunkerTrip.date <= date_to)
    if facility_id:
        q = q.where(BunkerTrip.origin_facility_id == facility_id)
    if driver_id:
        q = q.where(BunkerTrip.driver_id == driver_id)
    if is_paid is not None:
        q = q.where(BunkerTrip.is_paid == is_paid)
    result = await db.execute(q.order_by(BunkerTrip.date.desc()))
    return result.scalars().all()


@router.post("/", response_model=BunkerTripResponse, status_code=201)
async def create_bunker_trip(data: BunkerTripCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(BunkerTrip).where(BunkerTrip.receipt_number == data.receipt_number)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail=f"شماره قبض {data.receipt_number} قبلاً ثبت شده است"
        )
    obj = BunkerTrip(**data.model_dump())
    db.add(obj)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail=f"شماره قبض {data.receipt_number} قبلاً ثبت شده است"
        )
    await db.refresh(obj)
    return obj


@router.get("/{id}", response_model=BunkerTripResponse)
async def get_bunker_trip(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BunkerTrip).where(BunkerTrip.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    return obj


@router.put("/{id}", response_model=BunkerTripResponse)
async def update_bunker_trip(id: int, data: BunkerTripUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BunkerTrip).where(BunkerTrip.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    await db.commit()
    await db.refresh(obj)
    return obj


@router.patch("/{id}/payment", response_model=BunkerTripResponse)
async def pay_bunker_trip(id: int, data: BunkerTripPayment, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BunkerTrip).where(BunkerTrip.id == id))
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
async def delete_bunker_trip(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BunkerTrip).where(BunkerTrip.id == id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(obj)
    await db.commit()
