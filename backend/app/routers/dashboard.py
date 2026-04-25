import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.user import User
from app.schemas.dashboard import DashboardTodayOut, HabitTodayItem

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _today_utc() -> date:
    return datetime.now(timezone.utc).date()


def _ring_derivatives(habits_ring: float) -> tuple[float, float]:
    if habits_ring <= 0:
        return 0.0, 0.0
    consistency = min(1.0, habits_ring * 0.9 + 0.08)
    focus = min(1.0, habits_ring * 0.72 + 0.1)
    return consistency, focus


@router.get("/today", response_model=DashboardTodayOut)
def get_today_dashboard(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardTodayOut:
    today = _today_utc()
    habits = list(
        db.scalars(
            select(Habit)
            .where(Habit.user_id == user.id, Habit.is_archived.is_(False))
            .order_by(Habit.sort_order.asc(), Habit.name.asc())
        ).all()
    )
    total = len(habits)
    if total == 0:
        return DashboardTodayOut(
            date=today,
            habits=[],
            total_count=0,
            completed_count=0,
            completion_percent=0.0,
            streak=5,
            ring_habits=0.0,
            ring_consistency=0.0,
            ring_focus=0.0,
        )

    habit_ids = [h.id for h in habits]
    done_rows = db.scalars(
        select(HabitLog.habit_id).where(
            HabitLog.user_id == user.id,
            HabitLog.logged_for_date == today,
            HabitLog.habit_id.in_(habit_ids),
        )
    ).all()
    done_set: set[uuid.UUID] = set(done_rows)

    items: list[HabitTodayItem] = []
    for h in habits:
        done_today = h.id in done_set
        items.append(
            HabitTodayItem(
                id=h.id,
                name=h.name,
                description=h.description,
                color=h.color,
                icon=h.icon,
                sort_order=h.sort_order,
                metadata=h.meta,
                completed_today=done_today,
            )
        )

    completed = len(done_set)
    habits_ring = completed / total
    cons, foc = _ring_derivatives(habits_ring)
    pct = round(100.0 * habits_ring, 1)

    return DashboardTodayOut(
        date=today,
        habits=items,
        total_count=total,
        completed_count=completed,
        completion_percent=pct,
        streak=5,
        ring_habits=habits_ring,
        ring_consistency=cons,
        ring_focus=foc,
    )
