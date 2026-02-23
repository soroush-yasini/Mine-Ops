import uuid
from datetime import datetime

from pydantic import BaseModel


class TruckBase(BaseModel):
    plate_number: str
    is_active: bool = True


class TruckCreate(TruckBase):
    pass


class TruckUpdate(BaseModel):
    plate_number: str | None = None
    is_active: bool | None = None


class TruckResponse(TruckBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    created_by: uuid.UUID | None

    model_config = {"from_attributes": True}


class TruckListResponse(BaseModel):
    items: list[TruckResponse]
    total: int
    page: int
    size: int
