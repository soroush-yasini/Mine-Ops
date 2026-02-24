from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from ..core.database import Base


class GrindingFacility(Base):
    __tablename__ = "grinding_facilities"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(1), unique=True, nullable=False)
    name_fa = Column(String, nullable=False)
    name_en = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
