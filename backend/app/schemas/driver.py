from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DriverBase(BaseModel):
    full_name: str
    bank_account: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True


class DriverCreate(DriverBase):
    pass


class DriverUpdate(BaseModel):
    full_name: Optional[str] = None
    bank_account: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class DriverResponse(DriverBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
