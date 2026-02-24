from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, BigInteger, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class LabReport(Base):
    __tablename__ = "lab_reports"
    id = Column(Integer, primary_key=True, index=True)
    issue_date = Column(Date, nullable=False)
    facility_id = Column(Integer, ForeignKey("grinding_facilities.id"))
    report_pdf = Column(String, nullable=True)
    sample_count = Column(Integer, default=0)
    total_cost = Column(BigInteger, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    facility = relationship("GrindingFacility")
    samples = relationship("LabSample", back_populates="report", cascade="all, delete-orphan")
