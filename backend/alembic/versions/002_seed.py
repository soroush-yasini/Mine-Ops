"""seed initial data

Revision ID: 002
Revises: 001
Create Date: 2024-01-01 00:01:00.000000

"""
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from passlib.context import CryptContext

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Pre-generated UUIDs for reproducibility
ADMIN_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
SITE_A_ID = uuid.UUID("00000000-0000-0000-0000-000000000010")
SITE_B_ID = uuid.UUID("00000000-0000-0000-0000-000000000011")
SITE_C_ID = uuid.UUID("00000000-0000-0000-0000-000000000012")
ST_K_ID = uuid.UUID("00000000-0000-0000-0000-000000000020")
ST_T_ID = uuid.UUID("00000000-0000-0000-0000-000000000021")
ST_CR_ID = uuid.UUID("00000000-0000-0000-0000-000000000022")
ST_RC_ID = uuid.UUID("00000000-0000-0000-0000-000000000023")
ST_L_ID = uuid.UUID("00000000-0000-0000-0000-000000000024")

# bcrypt hash of "admin123" — generated at migration time
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ADMIN_PASSWORD_HASH = pwd_context.hash("admin123")


def upgrade() -> None:
    conn = op.get_bind()

    # Admin user
    conn.execute(
        sa.text(
            """
            INSERT INTO users (id, username, full_name, password_hash, role, is_active)
            VALUES (:id, :username, :full_name, :password_hash, :role, :is_active)
            ON CONFLICT (username) DO NOTHING
            """
        ),
        {
            "id": str(ADMIN_ID),
            "username": "admin",
            "full_name": "Administrator",
            "password_hash": ADMIN_PASSWORD_HASH,
            "role": "manager",
            "is_active": True,
        },
    )

    # Grinding sites
    sites = [
        {"id": str(SITE_A_ID), "code": "A", "name_fa": "رباط سفید", "name_en": "Hejazian"},
        {"id": str(SITE_B_ID), "code": "B", "name_fa": "شن بتن", "name_en": "Shen Beton"},
        {"id": str(SITE_C_ID), "code": "C", "name_fa": "کاویان", "name_en": "Kavian"},
    ]
    for site in sites:
        conn.execute(
            sa.text(
                """
                INSERT INTO grinding_sites (id, code, name_fa, name_en, is_active, created_by)
                VALUES (:id, :code, :name_fa, :name_en, true, :created_by)
                ON CONFLICT (code) DO NOTHING
                """
            ),
            {**site, "created_by": str(ADMIN_ID)},
        )

    # Sample types
    sample_types = [
        {"id": str(ST_K_ID), "code": "K", "name_fa": "کانال", "name_en": "Channel", "description": None},
        {"id": str(ST_T_ID), "code": "T", "name_fa": "ترانشه", "name_en": "Trench", "description": None},
        {"id": str(ST_CR_ID), "code": "CR", "name_fa": "مغزه خرد شده", "name_en": "Crushed Core", "description": None},
        {"id": str(ST_RC_ID), "code": "RC", "name_fa": "مغزه معکوس", "name_en": "Reverse Circulation", "description": None},
        {"id": str(ST_L_ID), "code": "L", "name_fa": "لیچینگ", "name_en": "Leaching", "description": None},
    ]
    for st in sample_types:
        conn.execute(
            sa.text(
                """
                INSERT INTO sample_types (id, code, name_fa, name_en, description, created_by)
                VALUES (:id, :code, :name_fa, :name_en, :description, :created_by)
                ON CONFLICT (code) DO NOTHING
                """
            ),
            {**st, "created_by": str(ADMIN_ID)},
        )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM sample_types WHERE id IN (:k,:t,:cr,:rc,:l)"), {
        "k": str(ST_K_ID), "t": str(ST_T_ID), "cr": str(ST_CR_ID),
        "rc": str(ST_RC_ID), "l": str(ST_L_ID),
    })
    conn.execute(sa.text("DELETE FROM grinding_sites WHERE id IN (:a,:b,:c)"), {
        "a": str(SITE_A_ID), "b": str(SITE_B_ID), "c": str(SITE_C_ID),
    })
    conn.execute(sa.text("DELETE FROM users WHERE id = :id"), {"id": str(ADMIN_ID)})
