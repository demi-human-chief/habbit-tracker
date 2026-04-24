import uuid
from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class HabitLogCreate(BaseModel):
    logged_for_date: date
    note: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None


class HabitLogPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    habit_id: uuid.UUID
    user_id: uuid.UUID
    logged_for_date: date
    note: Optional[str] = None
    meta: Optional[dict[str, Any]] = Field(
        default=None, serialization_alias="metadata"
    )
    created_at: datetime
    updated_at: datetime
