import uuid
from datetime import date

from pydantic import BaseModel


class HeatmapPoint(BaseModel):
    date: date
    count: int


class StatsOverviewOut(BaseModel):
    current_streak: int
    best_streak: int
    completion_rate: int
    weekly: list[int]
    heatmap: list[HeatmapPoint]


class HabitStatsItemOut(BaseModel):
    id: uuid.UUID
    title: str
    completion_rate: int
    missed_count: int
