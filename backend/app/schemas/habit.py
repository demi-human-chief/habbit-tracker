import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class HabitCreate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=500)
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = None
    color: Optional[str] = Field(default=None, max_length=32)
    icon: Optional[str] = Field(default=None, max_length=64)
    icon_shape: Optional[str] = Field(default=None, max_length=32)
    icon_color: Optional[str] = Field(default=None, max_length=32)
    is_archived: bool = False
    sort_order: int = 0
    metadata: Optional[dict[str, Any]] = None

    @model_validator(mode="after")
    def validate_name_or_title(self) -> "HabitCreate":
        base = (self.name or self.title or "").strip()
        if not base:
            raise ValueError("Either name or title is required")
        self.name = base
        return self


class HabitUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=500)
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = None
    color: Optional[str] = Field(default=None, max_length=32)
    icon: Optional[str] = Field(default=None, max_length=64)
    icon_shape: Optional[str] = Field(default=None, max_length=32)
    icon_color: Optional[str] = Field(default=None, max_length=32)
    is_archived: Optional[bool] = None
    sort_order: Optional[int] = None
    metadata: Optional[dict[str, Any]] = None

    @model_validator(mode="after")
    def normalize_title(self) -> "HabitUpdate":
        if self.title and not self.name:
            self.name = self.title
        return self


class HabitPublic(BaseModel):
    """Поле в JSON — `metadata`, в ORM — `meta`."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    icon_shape: Optional[str] = None
    icon_color: Optional[str] = None
    is_archived: bool
    sort_order: int
    meta: Optional[dict[str, Any]] = Field(
        default=None, serialization_alias="metadata"
    )
    created_at: datetime
    updated_at: datetime
