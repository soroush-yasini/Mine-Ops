from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class LabSample(Base):
    __tablename__ = "lab_samples"
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("lab_reports.id", ondelete="CASCADE"))
    raw_code = Column(String, nullable=False)
    facility_code = Column(String(10), nullable=True)
    year = Column(Integer, nullable=True)
    month = Column(Integer, nullable=True)
    day = Column(Integer, nullable=True)
    sample_type = Column(String, nullable=True)
    sample_index = Column(Integer, nullable=True)
    au_ppm = Column(Float, nullable=False)
    threshold_flag = Column(String, default="normal")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    report = relationship("LabReport", back_populates="samples")
