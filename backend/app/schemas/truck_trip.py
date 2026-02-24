from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime


class TruckTripBase(BaseModel):
    date: date
    truck_id: Optional[int] = None
    driver_id: Optional[int] = None
    receipt_number: int
    tonnage_kg: float
    destination_facility_id: Optional[int] = None
    freight_rate_per_ton: int = 8700000
    bol_image: Optional[str] = None


class TruckTripCreate(TruckTripBase):
    truck_id: int
    driver_id: int
    destination_facility_id: int


class TruckTripUpdate(BaseModel):
    date: Optional[date] = None
    truck_id: Optional[int] = None
    driver_id: Optional[int] = None
    receipt_number: Optional[int] = None
    tonnage_kg: Optional[float] = None
    destination_facility_id: Optional[int] = None
    freight_rate_per_ton: Optional[int] = None
    bol_image: Optional[str] = None


class TruckTripPayment(BaseModel):
    payment_date: date
    payment_time: Optional[time] = None
    payment_receipt_image: Optional[str] = None
    payment_notes: Optional[str] = None


class TruckTripResponse(TruckTripBase):
    id: int
    total_freight_cost: Optional[int] = None
    is_paid: bool
    payment_date: Optional[date] = None
    payment_time: Optional[time] = None
    payment_receipt_image: Optional[str] = None
    payment_notes: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
