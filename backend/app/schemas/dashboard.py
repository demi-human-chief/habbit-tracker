import uuid
from datetime import date
from typing import Any, Optional

from pydantic import BaseModel, Field


class HabitTodayItem(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int
    metadata: Optional[dict[str, Any]] = None
    completed_today: bool


class DashboardTodayOut(BaseModel):
    date: date
    habits: list[HabitTodayItem]
    total_count: int
    completed_count: int
    completion_percent: float
    streak: int
    ring_habits: float
    ring_consistency: float
    ring_focus: float


class ToggleTodayOut(BaseModel):
    habit_id: uuid.UUID
    completed_today: bool
