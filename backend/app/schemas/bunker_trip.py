from pydantic import BaseModel
from typing import Optional, Union
from datetime import date, time as dt_time, datetime


class BunkerTripBase(BaseModel):
    date: date
    time: Union[dt_time, None] = None
    truck_id: Optional[int] = None
    driver_id: Optional[int] = None
    receipt_number: int
    tonnage_kg: float
    origin_facility_id: Optional[int] = None
    freight_rate_per_ton: int = 2800000
    recorded_total_amount: Optional[int] = None
    bol_image: Optional[str] = None
    notes: Optional[str] = None


class BunkerTripCreate(BunkerTripBase):
    truck_id: int
    driver_id: int
    origin_facility_id: int


class BunkerTripUpdate(BaseModel):
    date: Optional[date] = None
    time: Union[dt_time, None] = None
    truck_id: Optional[int] = None
    driver_id: Optional[int] = None
    receipt_number: Optional[int] = None
    tonnage_kg: Optional[float] = None
    origin_facility_id: Optional[int] = None
    freight_rate_per_ton: Optional[int] = None
    recorded_total_amount: Optional[int] = None
    bol_image: Optional[str] = None
    notes: Optional[str] = None


class BunkerTripPayment(BaseModel):
    payment_date: date
    payment_time: Union[dt_time, None] = None
    payment_receipt_image: Optional[str] = None
    payment_notes: Optional[str] = None


class BunkerTripResponse(BunkerTripBase):
    id: int
    computed_total_amount: Optional[int] = None
    tonnage_discrepancy_kg: Optional[float] = None
    is_paid: bool
    payment_date: Optional[date] = None
    payment_time: Union[dt_time, None] = None
    payment_receipt_image: Optional[str] = None
    payment_notes: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
