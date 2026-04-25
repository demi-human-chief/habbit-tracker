import logging
import uuid
from collections.abc import Sequence
from datetime import date, datetime, timedelta, timezone
from typing import Any, Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.analytics_event import AnalyticsEvent
from app.models.user import User

logger = logging.getLogger(__name__)


def track_event(
    db: Session,
    event_name: str,
    user_id: uuid.UUID | None = None,
    source: str = "web",
    meta: dict[str, Any] | None = None,
) -> None:
    try:
        db.add(
            AnalyticsEvent(
                user_id=user_id,
                event_name=event_name,
                source=source,
                meta=meta,
            )
        )
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Failed to track analytics event: %s", event_name)


def _date_range(days: int) -> tuple[date, date]:
    today = datetime.now(timezone.utc).date()
    return today - timedelta(days=days - 1), today


def analytics_overview(db: Session) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)
    one_day_ago = now - timedelta(days=1)
    start_30, end_30 = _date_range(30)
    start_14, end_14 = _date_range(14)

    total_users = db.scalar(select(func.count(User.id))) or 0
    new_users_7d = (
        db.scalar(select(func.count(User.id)).where(User.created_at >= seven_days_ago)) or 0
    )
    active_users_7d = (
        db.scalar(
            select(func.count(func.distinct(AnalyticsEvent.user_id))).where(
                AnalyticsEvent.created_at >= seven_days_ago,
                AnalyticsEvent.user_id.is_not(None),
            )
        )
        or 0
    )
    events_24h = (
        db.scalar(select(func.count(AnalyticsEvent.id)).where(AnalyticsEvent.created_at >= one_day_ago))
        or 0
    )

    def event_count(name: str) -> int:
        return (
            db.scalar(select(func.count(AnalyticsEvent.id)).where(AnalyticsEvent.event_name == name))
            or 0
        )

    habits_created = event_count("habit_created")
    habits_completed = event_count("habit_completed") + event_count("telegram_habit_completed")
    ai_messages = event_count("ai_message_sent")
    telegram_connected = event_count("telegram_connected")

    top_rows = db.execute(
        select(AnalyticsEvent.event_name, func.count(AnalyticsEvent.id).label("cnt"))
        .group_by(AnalyticsEvent.event_name)
        .order_by(func.count(AnalyticsEvent.id).desc())
        .limit(10)
    ).all()
    top_events = [{"event_name": name, "count": int(cnt)} for name, cnt in top_rows]

    dau_rows = db.execute(
        select(
            func.date(AnalyticsEvent.created_at).label("d"),
            func.count(func.distinct(AnalyticsEvent.user_id)).label("cnt"),
        )
        .where(
            AnalyticsEvent.created_at >= datetime.combine(start_14, datetime.min.time(), tzinfo=timezone.utc),
            AnalyticsEvent.created_at
            <= datetime.combine(end_14, datetime.max.time(), tzinfo=timezone.utc),
            AnalyticsEvent.user_id.is_not(None),
        )
        .group_by(func.date(AnalyticsEvent.created_at))
        .order_by(func.date(AnalyticsEvent.created_at))
    ).all()
    dau_map = {d: int(cnt) for d, cnt in dau_rows}
    daily_active_users = []
    for i in range(14):
        d = start_14 + timedelta(days=i)
        daily_active_users.append({"date": str(d), "count": int(dau_map.get(d, 0))})

    timeline_rows = db.execute(
        select(
            func.date(AnalyticsEvent.created_at).label("d"),
            AnalyticsEvent.event_name,
            func.count(AnalyticsEvent.id).label("cnt"),
        )
        .where(
            AnalyticsEvent.created_at >= datetime.combine(start_30, datetime.min.time(), tzinfo=timezone.utc),
            AnalyticsEvent.created_at
            <= datetime.combine(end_30, datetime.max.time(), tzinfo=timezone.utc),
        )
        .group_by(func.date(AnalyticsEvent.created_at), AnalyticsEvent.event_name)
        .order_by(func.date(AnalyticsEvent.created_at))
    ).all()
    event_timeline = [
        {"date": str(d), "event_name": event_name, "count": int(cnt)}
        for d, event_name, cnt in timeline_rows
    ]

    registered_users: int = total_users
    created_habit_users = (
        db.scalar(
            select(func.count(func.distinct(AnalyticsEvent.user_id))).where(
                AnalyticsEvent.event_name == "habit_created",
                AnalyticsEvent.user_id.is_not(None),
            )
        )
        or 0
    )
    completed_habit_users = (
        db.scalar(
            select(func.count(func.distinct(AnalyticsEvent.user_id))).where(
                AnalyticsEvent.event_name.in_(["habit_completed", "telegram_habit_completed"]),
                AnalyticsEvent.user_id.is_not(None),
            )
        )
        or 0
    )
    used_ai_users = (
        db.scalar(
            select(func.count(func.distinct(AnalyticsEvent.user_id))).where(
                AnalyticsEvent.event_name == "ai_message_sent",
                AnalyticsEvent.user_id.is_not(None),
            )
        )
        or 0
    )
    connected_telegram_users = (
        db.scalar(
            select(func.count(func.distinct(AnalyticsEvent.user_id))).where(
                AnalyticsEvent.event_name == "telegram_connected",
                AnalyticsEvent.user_id.is_not(None),
            )
        )
        or 0
    )

    registered = int(registered_users)

    def _pct(v: int) -> float:
        if registered <= 0:
            return 0.0
        return round((v / registered) * 100.0, 1)

    source_rows = db.execute(
        select(AnalyticsEvent.source, func.count(AnalyticsEvent.id).label("cnt"))
        .where(AnalyticsEvent.source.is_not(None))
        .group_by(AnalyticsEvent.source)
    ).all()
    sources_map = {str(src): int(cnt) for src, cnt in source_rows if src}

    users_rows = db.execute(select(User.id, func.date(User.created_at).label("reg_day"))).all()
    user_reg_day = {uid: reg_day for uid, reg_day in users_rows if reg_day is not None}
    uid_set = set(user_reg_day.keys())
    event_rows = db.execute(
        select(AnalyticsEvent.user_id, func.date(AnalyticsEvent.created_at).label("event_day"))
        .where(AnalyticsEvent.user_id.is_not(None))
    ).all()
    user_event_days: dict[uuid.UUID, set[date]] = {uid: set() for uid in uid_set}
    for uid, d in event_rows:
        if uid in user_event_days and d is not None:
            user_event_days[uid].add(d)

    def _retention(days_after: int) -> int:
        cohort = 0
        retained = 0
        for uid, reg_day in user_reg_day.items():
            if reg_day is None:
                continue
            target = reg_day + timedelta(days=days_after)
            if target > datetime.now(timezone.utc).date():
                continue
            cohort += 1
            if target in user_event_days.get(uid, set()):
                retained += 1
        if cohort == 0:
            return 0
        return int(round((retained / cohort) * 100))

    return {
        "total_users": int(total_users),
        "new_users_7d": int(new_users_7d),
        "active_users_7d": int(active_users_7d),
        "events_24h": int(events_24h),
        "habits_created": int(habits_created),
        "habits_completed": int(habits_completed),
        "ai_messages": int(ai_messages),
        "telegram_connected": int(telegram_connected),
        "top_events": top_events,
        "daily_active_users": daily_active_users,
        "event_timeline": event_timeline,
        "funnel": {
            "registered": registered,
            "created_habit": int(created_habit_users),
            "completed_habit": int(completed_habit_users),
            "used_ai": int(used_ai_users),
            "connected_telegram": int(connected_telegram_users),
            "conversion": {
                "created_habit": _pct(int(created_habit_users)),
                "completed_habit": _pct(int(completed_habit_users)),
                "used_ai": _pct(int(used_ai_users)),
                "connected_telegram": _pct(int(connected_telegram_users)),
            },
        },
        "retention": {
            "day_1": _retention(1),
            "day_3": _retention(3),
            "day_7": _retention(7),
        },
        "sources": {
            "web": int(sources_map.get("web", 0)),
            "telegram": int(sources_map.get("telegram", 0)),
            "ai": int(sources_map.get("ai", 0)),
        },
    }


def list_events(
    db: Session,
    limit: int = 100,
    event_name: Optional[str] = None,
    user_id: Optional[uuid.UUID] = None,
) -> Sequence[AnalyticsEvent]:
    q = select(AnalyticsEvent).order_by(AnalyticsEvent.created_at.desc()).limit(min(limit, 500))
    if event_name:
        q = q.where(AnalyticsEvent.event_name == event_name)
    if user_id:
        q = q.where(AnalyticsEvent.user_id == user_id)
    return list(db.scalars(q).all())
