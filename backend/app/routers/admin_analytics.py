import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.analytics import AnalyticsEventOut, AnalyticsEventsOut, AnalyticsOverviewOut
from app.services.analytics_service import analytics_overview, list_events

router = APIRouter(prefix="/admin/analytics", tags=["admin-analytics"])


@router.get("/overview", response_model=AnalyticsOverviewOut)
def get_overview(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AnalyticsOverviewOut:
    # MVP: available for any authenticated user.
    return AnalyticsOverviewOut(**analytics_overview(db))


@router.get("/events", response_model=AnalyticsEventsOut)
def get_events(
    limit: int = Query(default=100, ge=1, le=500),
    event_name: Optional[str] = Query(default=None),
    user_id: Optional[uuid.UUID] = Query(default=None),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AnalyticsEventsOut:
    rows = list_events(db, limit=limit, event_name=event_name, user_id=user_id)
    return AnalyticsEventsOut(
        events=[
            AnalyticsEventOut(
                id=e.id,
                user_id=e.user_id,
                event_name=e.event_name,
                source=e.source,
                metadata=e.meta,
                created_at=e.created_at,
            )
            for e in rows
        ]
    )
