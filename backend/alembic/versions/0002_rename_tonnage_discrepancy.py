"""rename tonnage_discrepancy to tonnage_discrepancy_kg

Revision ID: 0002
Revises: 0001
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # tonnage_discrepancy was removed in 0001 schema simplification; nothing to do
    pass


def downgrade() -> None:
    pass
