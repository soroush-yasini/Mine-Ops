import uuid

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class LabAssay(Base):
    __tablename__ = "lab_assays"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lab_batches.id"), nullable=False)
    sample_code: Mapped[str] = mapped_column(String, nullable=False)
    facility_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("grinding_sites.id"), nullable=True)
    sample_date_jalali: Mapped[str | None] = mapped_column(String, nullable=True)
    sample_date_gregorian: Mapped[Date | None] = mapped_column(Date, nullable=True)
    sample_type_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("sample_types.id"), nullable=True)
    sample_index: Mapped[int | None] = mapped_column(Integer, nullable=True)
    au_ppm: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    batch = relationship("LabBatch", back_populates="assays")
    facility = relationship("GrindingSite", foreign_keys=[facility_id])
    sample_type = relationship("SampleType", foreign_keys=[sample_type_id])
    creator = relationship("User", foreign_keys=[created_by])
