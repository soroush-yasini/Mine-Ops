from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from .lab_sample import LabSampleResponse


class LabReportBase(BaseModel):
    issue_date: date
    facility_id: int
    report_pdf: Optional[str] = None
    total_cost: Optional[int] = None
    notes: Optional[str] = None


class LabReportCreate(LabReportBase):
    pass


class LabReportUpdate(BaseModel):
    issue_date: Optional[date] = None
    facility_id: Optional[int] = None
    report_pdf: Optional[str] = None
    total_cost: Optional[int] = None
    notes: Optional[str] = None


class LabReportResponse(LabReportBase):
    id: int
    sample_count: int
    samples: List[LabSampleResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
