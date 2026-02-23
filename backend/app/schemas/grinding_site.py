import uuid
from datetime import datetime

from pydantic import BaseModel


class GrindingSiteBase(BaseModel):
    code: str
    name_fa: str
    name_en: str
    is_active: bool = True


class GrindingSiteCreate(GrindingSiteBase):
    pass


class GrindingSiteUpdate(BaseModel):
    code: str | None = None
    name_fa: str | None = None
    name_en: str | None = None
    is_active: bool | None = None


class GrindingSiteResponse(GrindingSiteBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    created_by: uuid.UUID | None

    model_config = {"from_attributes": True}


class GrindingSiteListResponse(BaseModel):
    items: list[GrindingSiteResponse]
    total: int
    page: int
    size: int
