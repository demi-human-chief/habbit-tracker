import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class TopEventItem(BaseModel):
    event_name: str
    count: int


class DailyCountItem(BaseModel):
    date: str
    count: int


class EventTimelineItem(BaseModel):
    date: str
    event_name: str
    count: int


class FunnelItem(BaseModel):
    registered: int
    created_habit: int
    completed_habit: int
    used_ai: int
    connected_telegram: int


class FunnelConversionItem(BaseModel):
    created_habit: float
    completed_habit: float
    used_ai: float
    connected_telegram: float


class FunnelOut(FunnelItem):
    conversion: FunnelConversionItem


class RetentionOut(BaseModel):
    day_1: int
    day_3: int
    day_7: int


class SourcesOut(BaseModel):
    web: int
    telegram: int
    ai: int


class AnalyticsOverviewOut(BaseModel):
    total_users: int
    new_users_7d: int
    active_users_7d: int
    events_24h: int
    habits_created: int
    habits_completed: int
    ai_messages: int
    telegram_connected: int
    top_events: list[TopEventItem]
    daily_active_users: list[DailyCountItem]
    event_timeline: list[EventTimelineItem]
    funnel: FunnelOut
    retention: RetentionOut
    sources: SourcesOut


class AnalyticsEventOut(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    event_name: str
    source: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None
    created_at: datetime


class AnalyticsEventsOut(BaseModel):
    events: list[AnalyticsEventOut]
