"""initial schema

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("username", sa.String(), nullable=False, unique=True),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "drivers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("iban", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    )

    op.create_table(
        "trucks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("plate_number", sa.String(), nullable=False, unique=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    )

    op.create_table(
        "grinding_sites",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(), nullable=False, unique=True),
        sa.Column("name_fa", sa.String(), nullable=False),
        sa.Column("name_en", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    )

    op.create_table(
        "sample_types",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(), nullable=False, unique=True),
        sa.Column("name_fa", sa.String(), nullable=False),
        sa.Column("name_en", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    )

    op.create_table(
        "mine_transports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("date_jalali", sa.String(), nullable=False),
        sa.Column("date_gregorian", sa.Date(), nullable=False),
        sa.Column("truck_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("trucks.id"), nullable=False),
        sa.Column("driver_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("drivers.id"), nullable=False),
        sa.Column("receipt_no", sa.String(), nullable=False),
        sa.Column("tonnage_kg", sa.Integer(), nullable=False),
        sa.Column("destination_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("grinding_sites.id"), nullable=False),
        sa.Column("cost_per_kg", sa.Integer(), nullable=False),
        sa.Column("bill_of_lading_image", sa.String(), nullable=True),
        sa.Column("status", sa.String(), server_default="initialized", nullable=False),
        sa.Column("payment_date_jalali", sa.String(), nullable=True),
        sa.Column("payment_date_gregorian", sa.Date(), nullable=True),
        sa.Column("payment_receipt_image", sa.String(), nullable=True),
        sa.Column("is_paid", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    )

    op.create_table(
        "bunker_transports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("date_jalali", sa.String(), nullable=False),
        sa.Column("date_gregorian", sa.Date(), nullable=False),
        sa.Column("time", sa.Time(), nullable=True),
        sa.Column("truck_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("trucks.id"), nullable=False),
        sa.Column("driver_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("drivers.id"), nullable=False),
        sa.Column("receipt_no", sa.String(), nullable=False),
        sa.Column("tonnage_kg", sa.Integer(), nullable=False),
        sa.Column("origin_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("grinding_sites.id"), nullable=False),
        sa.Column("cost_per_kg", sa.Integer(), nullable=False),
        sa.Column("is_dead_freight", sa.Boolean(), nullable=False),
        sa.Column("billed_tonnage_kg", sa.Integer(), nullable=False),
        sa.Column("bill_of_lading_image", sa.String(), nullable=True),
        sa.Column("status", sa.String(), server_default="initialized", nullable=False),
        sa.Column("payment_date_jalali", sa.String(), nullable=True),
        sa.Column("payment_date_gregorian", sa.Date(), nullable=True),
        sa.Column("payment_receipt_image", sa.String(), nullable=True),
        sa.Column("is_paid", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    )

    op.create_table(
        "grinding_costs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("date_jalali", sa.String(), nullable=False),
        sa.Column("date_gregorian", sa.Date(), nullable=False),
        sa.Column("site_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("grinding_sites.id"), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("invoice_no", sa.String(), nullable=True),
        sa.Column("receipt_no", sa.String(), nullable=True),
        sa.Column("tonnage_kg", sa.Integer(), nullable=True),
        sa.Column("rate_per_kg", sa.Integer(), nullable=True),
        sa.Column("debit", sa.BigInteger(), server_default="0", nullable=False),
        sa.Column("credit", sa.BigInteger(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    )

    op.create_table(
        "lab_batches",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("issue_date_jalali", sa.String(), nullable=False),
        sa.Column("issue_date_gregorian", sa.Date(), nullable=False),
        sa.Column("receipt_pdf", sa.String(), nullable=True),
        sa.Column("total_cost", sa.Numeric(18, 2), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    )

    op.create_table(
        "lab_assays",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("batch_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lab_batches.id"), nullable=False),
        sa.Column("sample_code", sa.String(), nullable=False),
        sa.Column("facility_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("grinding_sites.id"), nullable=True),
        sa.Column("sample_date_jalali", sa.String(), nullable=True),
        sa.Column("sample_date_gregorian", sa.Date(), nullable=True),
        sa.Column("sample_type_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("sample_types.id"), nullable=True),
        sa.Column("sample_index", sa.Integer(), nullable=True),
        sa.Column("au_ppm", sa.Numeric(10, 4), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("lab_assays")
    op.drop_table("lab_batches")
    op.drop_table("grinding_costs")
    op.drop_table("bunker_transports")
    op.drop_table("mine_transports")
    op.drop_table("sample_types")
    op.drop_table("grinding_sites")
    op.drop_table("trucks")
    op.drop_table("drivers")
    op.drop_table("users")
