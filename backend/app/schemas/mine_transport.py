import uuid
from datetime import date, datetime

from pydantic import BaseModel


class MineTransportBase(BaseModel):
    date_jalali: str
    date_gregorian: date
    truck_id: uuid.UUID
    driver_id: uuid.UUID
    receipt_no: str
    tonnage_kg: int
    destination_id: uuid.UUID
    cost_per_kg: int
    notes: str | None = None


class MineTransportCreate(MineTransportBase):
    pass


class MineTransportUpdate(BaseModel):
    date_jalali: str | None = None
    date_gregorian: date | None = None
    truck_id: uuid.UUID | None = None
    driver_id: uuid.UUID | None = None
    receipt_no: str | None = None
    tonnage_kg: int | None = None
    destination_id: uuid.UUID | None = None
    cost_per_kg: int | None = None
    notes: str | None = None


class MineTransportPaymentUpdate(BaseModel):
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


class MineTransportResponse(MineTransportBase):
    id: uuid.UUID
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
    destination: SiteInfo | None

    model_config = {"from_attributes": True}


class MineTransportListResponse(BaseModel):
    items: list[MineTransportResponse]
    total: int
    page: int
    size: int
