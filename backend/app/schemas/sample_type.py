import uuid
from datetime import datetime

from pydantic import BaseModel


class SampleTypeBase(BaseModel):
    code: str
    name_fa: str
    name_en: str
    description: str | None = None


class SampleTypeCreate(SampleTypeBase):
    pass


class SampleTypeUpdate(BaseModel):
    code: str | None = None
    name_fa: str | None = None
    name_en: str | None = None
    description: str | None = None


class SampleTypeResponse(SampleTypeBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    created_by: uuid.UUID | None

    model_config = {"from_attributes": True}


class SampleTypeListResponse(BaseModel):
    items: list[SampleTypeResponse]
    total: int
    page: int
    size: int
