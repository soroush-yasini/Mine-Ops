from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LabSampleBase(BaseModel):
    raw_code: str
    au_ppm: float


class LabSampleCreate(LabSampleBase):
    pass


class LabSampleUpdate(BaseModel):
    raw_code: Optional[str] = None
    au_ppm: Optional[float] = None


class LabSampleResponse(LabSampleBase):
    id: int
    report_id: int
    facility_code: Optional[str] = None
    year: Optional[int] = None
    month: Optional[int] = None
    day: Optional[int] = None
    sample_type: Optional[str] = None
    sample_index: Optional[int] = None
    threshold_flag: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
