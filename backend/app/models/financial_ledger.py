from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Float, BigInteger, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class FinancialLedger(Base):
    __tablename__ = "financial_ledger"
    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("grinding_facilities.id"))
    date = Column(Date, nullable=False)
    description = Column(Text, nullable=False)
    debit = Column(BigInteger, nullable=True)
    credit = Column(BigInteger, nullable=True)
    balance = Column(BigInteger, nullable=True)
    receipt_number = Column(Integer, nullable=True)
    ledger_tonnage_kg = Column(Float, nullable=True)
    rate_per_ton = Column(Integer, nullable=True)
    bunker_trip_id = Column(Integer, ForeignKey("bunker_trips.id"), nullable=True)
    tonnage_discrepancy_kg = Column(Float, nullable=True)
    discrepancy_flag = Column(Boolean, default=False)
    investigation_notes = Column(Text, nullable=True)
    investigation_status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    facility = relationship("GrindingFacility")
    bunker_trip = relationship("BunkerTrip")
