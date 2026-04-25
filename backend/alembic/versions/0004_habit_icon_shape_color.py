"""add habit icon shape and color fields

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-25
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("habits", sa.Column("icon_shape", sa.String(length=32), nullable=True))
    op.add_column("habits", sa.Column("icon_color", sa.String(length=32), nullable=True))


def downgrade() -> None:
    op.drop_column("habits", "icon_color")
    op.drop_column("habits", "icon_shape")
