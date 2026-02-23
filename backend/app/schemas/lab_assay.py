import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class LabAssayBase(BaseModel):
    batch_id: uuid.UUID
    sample_code: str
    facility_id: uuid.UUID | None = None
    sample_date_jalali: str | None = None
    sample_date_gregorian: date | None = None
    sample_type_id: uuid.UUID | None = None
    sample_index: int | None = None
    au_ppm: Decimal


class LabAssayCreate(LabAssayBase):
    pass


class LabAssayUpdate(BaseModel):
    sample_code: str | None = None
    facility_id: uuid.UUID | None = None
    sample_date_jalali: str | None = None
    sample_date_gregorian: date | None = None
    sample_type_id: uuid.UUID | None = None
    sample_index: int | None = None
    au_ppm: Decimal | None = None


class FacilityInfo(BaseModel):
    id: uuid.UUID
    code: str
    name_fa: str
    name_en: str

    model_config = {"from_attributes": True}


class SampleTypeInfo(BaseModel):
    id: uuid.UUID
    code: str
    name_fa: str
    name_en: str

    model_config = {"from_attributes": True}


class BatchInfo(BaseModel):
    id: uuid.UUID
    issue_date_jalali: str

    model_config = {"from_attributes": True}


class LabAssayResponse(LabAssayBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    created_by: uuid.UUID | None
    facility: FacilityInfo | None
    sample_type: SampleTypeInfo | None
    batch: BatchInfo | None

    model_config = {"from_attributes": True}


class LabAssayListResponse(BaseModel):
    items: list[LabAssayResponse]
    total: int
    page: int
    size: int
