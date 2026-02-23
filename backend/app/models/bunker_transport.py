import uuid

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, Time, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BunkerTransport(Base):
    __tablename__ = "bunker_transports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date_jalali: Mapped[str] = mapped_column(String, nullable=False)
    date_gregorian: Mapped[Date] = mapped_column(Date, nullable=False)
    time: Mapped[Time | None] = mapped_column(Time, nullable=True)
    truck_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("trucks.id"), nullable=False)
    driver_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("drivers.id"), nullable=False)
    receipt_no: Mapped[str] = mapped_column(String, nullable=False)
    tonnage_kg: Mapped[int] = mapped_column(Integer, nullable=False)
    origin_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("grinding_sites.id"), nullable=False)
    cost_per_kg: Mapped[int] = mapped_column(Integer, nullable=False)
    is_dead_freight: Mapped[bool] = mapped_column(Boolean, nullable=False)
    billed_tonnage_kg: Mapped[int] = mapped_column(Integer, nullable=False)
    bill_of_lading_image: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="initialized", server_default="initialized")
    payment_date_jalali: Mapped[str | None] = mapped_column(String, nullable=True)
    payment_date_gregorian: Mapped[Date | None] = mapped_column(Date, nullable=True)
    payment_receipt_image: Mapped[str | None] = mapped_column(String, nullable=True)
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    truck = relationship("Truck", foreign_keys=[truck_id])
    driver = relationship("Driver", foreign_keys=[driver_id])
    origin = relationship("GrindingSite", foreign_keys=[origin_id])
    creator = relationship("User", foreign_keys=[created_by])
