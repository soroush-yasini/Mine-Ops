import uuid
from datetime import datetime

from pydantic import BaseModel


class UserBase(BaseModel):
    username: str
    full_name: str
    role: str
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: str | None = None
    full_name: str | None = None
    role: str | None = None
    is_active: bool | None = None
    password: str | None = None


class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    size: int
