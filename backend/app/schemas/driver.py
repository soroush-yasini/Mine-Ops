import uuid
from datetime import datetime

from pydantic import BaseModel


class DriverBase(BaseModel):
    full_name: str
    iban: str | None = None
    phone: str | None = None
    is_active: bool = True


class DriverCreate(DriverBase):
    pass


class DriverUpdate(BaseModel):
    full_name: str | None = None
    iban: str | None = None
    phone: str | None = None
    is_active: bool | None = None


class DriverResponse(DriverBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    created_by: uuid.UUID | None

    model_config = {"from_attributes": True}


class DriverListResponse(BaseModel):
    items: list[DriverResponse]
    total: int
    page: int
    size: int
