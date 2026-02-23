import uuid

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class LabBatch(Base):
    __tablename__ = "lab_batches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    issue_date_jalali: Mapped[str] = mapped_column(String, nullable=False)
    issue_date_gregorian: Mapped[Date] = mapped_column(Date, nullable=False)
    receipt_pdf: Mapped[str | None] = mapped_column(String, nullable=True)
    total_cost: Mapped[float | None] = mapped_column(Numeric(18, 2), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    creator = relationship("User", foreign_keys=[created_by])
    assays = relationship("LabAssay", back_populates="batch", cascade="all, delete-orphan")
