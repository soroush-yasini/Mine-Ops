import uuid

from sqlalchemy import BigInteger, Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class GrindingCost(Base):
    __tablename__ = "grinding_costs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date_jalali: Mapped[str] = mapped_column(String, nullable=False)
    date_gregorian: Mapped[Date] = mapped_column(Date, nullable=False)
    site_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("grinding_sites.id"), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    invoice_no: Mapped[str | None] = mapped_column(String, nullable=True)
    receipt_no: Mapped[str | None] = mapped_column(String, nullable=True)
    tonnage_kg: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rate_per_kg: Mapped[int | None] = mapped_column(Integer, nullable=True)
    debit: Mapped[int] = mapped_column(BigInteger, default=0, server_default="0")
    credit: Mapped[int] = mapped_column(BigInteger, default=0, server_default="0")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    site = relationship("GrindingSite", foreign_keys=[site_id])
    creator = relationship("User", foreign_keys=[created_by])
