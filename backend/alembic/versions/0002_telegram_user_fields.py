"""add telegram fields to users

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-25
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("telegram_id", sa.BigInteger(), nullable=True))
    op.add_column("users", sa.Column("telegram_link_code", sa.String(length=6), nullable=True))
    op.add_column(
        "users",
        sa.Column("telegram_link_code_expires_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_unique_constraint("uq_users_telegram_id", "users", ["telegram_id"])
    op.create_index(
        "ix_users_telegram_link_code",
        "users",
        ["telegram_link_code"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_users_telegram_link_code", table_name="users")
    op.drop_constraint("uq_users_telegram_id", "users", type_="unique")
    op.drop_column("users", "telegram_link_code_expires_at")
    op.drop_column("users", "telegram_link_code")
    op.drop_column("users", "telegram_id")
