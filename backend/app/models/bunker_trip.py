from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Time, Float, BigInteger, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class BunkerTrip(Base):
    __tablename__ = "bunker_trips"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=True)
    truck_id = Column(Integer, ForeignKey("trucks.id"))
    driver_id = Column(Integer, ForeignKey("drivers.id"))
    receipt_number = Column(Integer, unique=True, nullable=False)
    tonnage_kg = Column(Float, nullable=False)
    origin_facility_id = Column(Integer, ForeignKey("grinding_facilities.id"))
    freight_rate_per_ton = Column(BigInteger, nullable=False, default=2800000)
    # NOTE: DB needs to be reset (drop old columns: recorded_total_amount, computed_total_amount, tonnage_discrepancy_kg, bol_image; add total_amount)
    total_amount = Column(BigInteger, nullable=True)
    notes = Column(Text, nullable=True)
    is_paid = Column(Boolean, default=False)
    payment_date = Column(Date, nullable=True)
    payment_time = Column(Time, nullable=True)
    payment_receipt_image = Column(String, nullable=True)
    payment_notes = Column(Text, nullable=True)
    status = Column(String, default="initialized")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    truck = relationship("Truck")
    driver = relationship("Driver")
    origin_facility = relationship("GrindingFacility")
