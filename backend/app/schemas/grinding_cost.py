import uuid
from datetime import date, datetime

from pydantic import BaseModel


class GrindingCostBase(BaseModel):
    date_jalali: str
    date_gregorian: date
    site_id: uuid.UUID
    description: str | None = None
    invoice_no: str | None = None
    receipt_no: str | None = None
    tonnage_kg: int | None = None
    rate_per_kg: int | None = None
    debit: int = 0
    credit: int = 0


class GrindingCostCreate(GrindingCostBase):
    pass


class GrindingCostUpdate(BaseModel):
    date_jalali: str | None = None
    date_gregorian: date | None = None
    site_id: uuid.UUID | None = None
    description: str | None = None
    invoice_no: str | None = None
    receipt_no: str | None = None
    tonnage_kg: int | None = None
    rate_per_kg: int | None = None
    debit: int | None = None
    credit: int | None = None


class SiteInfo(BaseModel):
    id: uuid.UUID
    code: str
    name_fa: str
    name_en: str

    model_config = {"from_attributes": True}


class GrindingCostResponse(GrindingCostBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    created_by: uuid.UUID | None
    site: SiteInfo | None
    balance: int | None = None

    model_config = {"from_attributes": True}


class GrindingCostListResponse(BaseModel):
    items: list[GrindingCostResponse]
    total: int
    page: int
    size: int
    total_balance: int | None = None
