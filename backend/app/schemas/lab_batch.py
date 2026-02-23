import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class LabBatchBase(BaseModel):
    issue_date_jalali: str
    issue_date_gregorian: date
    total_cost: Decimal | None = None
    notes: str | None = None


class LabBatchCreate(LabBatchBase):
    pass


class LabBatchUpdate(BaseModel):
    issue_date_jalali: str | None = None
    issue_date_gregorian: date | None = None
    total_cost: Decimal | None = None
    notes: str | None = None


class LabBatchResponse(LabBatchBase):
    id: uuid.UUID
    receipt_pdf: str | None
    assay_count: int = 0
    created_at: datetime
    updated_at: datetime
    created_by: uuid.UUID | None

    model_config = {"from_attributes": True}


class LabBatchListResponse(BaseModel):
    items: list[LabBatchResponse]
    total: int
    page: int
    size: int
