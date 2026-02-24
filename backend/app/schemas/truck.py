from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .driver import DriverResponse


class TruckBase(BaseModel):
    plate_number: str
    default_driver_id: Optional[int] = None
    is_active: bool = True


class TruckCreate(TruckBase):
    pass


class TruckUpdate(BaseModel):
    plate_number: Optional[str] = None
    default_driver_id: Optional[int] = None
    is_active: Optional[bool] = None


class TruckResponse(TruckBase):
    id: int
    default_driver: Optional[DriverResponse] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
