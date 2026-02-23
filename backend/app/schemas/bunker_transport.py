import uuid
from datetime import date, datetime
from datetime import time as Time

from pydantic import BaseModel


class BunkerTransportBase(BaseModel):
    date_jalali: str
    date_gregorian: date
    time: Time | None = None
    truck_id: uuid.UUID
    driver_id: uuid.UUID
    receipt_no: str
    tonnage_kg: int
    origin_id: uuid.UUID
    cost_per_kg: int
    notes: str | None = None


class BunkerTransportCreate(BunkerTransportBase):
    pass


class BunkerTransportUpdate(BaseModel):
    date_jalali: str | None = None
    date_gregorian: date | None = None
    time: Time | None = None
    truck_id: uuid.UUID | None = None
    driver_id: uuid.UUID | None = None
    receipt_no: str | None = None
    tonnage_kg: int | None = None
    origin_id: uuid.UUID | None = None
    cost_per_kg: int | None = None
    notes: str | None = None


class BunkerTransportPaymentUpdate(BaseModel):
    payment_date_jalali: str
    payment_date_gregorian: date


class TruckInfo(BaseModel):
    id: uuid.UUID
    plate_number: str

    model_config = {"from_attributes": True}


class DriverInfo(BaseModel):
    id: uuid.UUID
    full_name: str

    model_config = {"from_attributes": True}


class SiteInfo(BaseModel):
    id: uuid.UUID
    code: str
    name_fa: str
    name_en: str

    model_config = {"from_attributes": True}


class BunkerTransportResponse(BunkerTransportBase):
    id: uuid.UUID
    is_dead_freight: bool
    billed_tonnage_kg: int
    bill_of_lading_image: str | None
    status: str
    payment_date_jalali: str | None
    payment_date_gregorian: date | None
    payment_receipt_image: str | None
    is_paid: bool
    created_at: datetime
    updated_at: datetime
    created_by: uuid.UUID | None
    truck: TruckInfo | None
    driver: DriverInfo | None
    origin: SiteInfo | None

    model_config = {"from_attributes": True}


class BunkerTransportListResponse(BaseModel):
    items: list[BunkerTransportResponse]
    total: int
    page: int
    size: int
