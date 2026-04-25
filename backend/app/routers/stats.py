from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.user import User
from app.schemas.stats import HabitStatsItemOut, HeatmapPoint, StatsOverviewOut

router = APIRouter(prefix="/stats", tags=["stats"])


def _today_utc() -> date:
    return datetime.now(timezone.utc).date()


def _streaks_from_dates(done_dates: set[date], today: date) -> tuple[int, int]:
    if not done_dates:
        return 0, 0

    # Current streak: consecutive days ending today with at least one completion.
    current = 0
    cursor = today
    while cursor in done_dates:
        current += 1
        cursor -= timedelta(days=1)

    # Best streak across all time.
    ordered = sorted(done_dates)
    best = 1
    run = 1
    for i in range(1, len(ordered)):
        if (ordered[i] - ordered[i - 1]).days == 1:
            run += 1
            best = max(best, run)
        else:
            run = 1
    return current, best


@router.get("/overview", response_model=StatsOverviewOut)
def get_stats_overview(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StatsOverviewOut:
    today = _today_utc()
    start_30 = today - timedelta(days=29)
    start_7 = today - timedelta(days=6)

    habits = list(
        db.scalars(
            select(Habit)
            .where(Habit.user_id == user.id, Habit.is_archived.is_(False))
            .order_by(Habit.sort_order.asc(), Habit.name.asc())
        ).all()
    )
    habit_count = len(habits)

    all_log_dates = set(
        db.scalars(
            select(HabitLog.logged_for_date)
            .where(HabitLog.user_id == user.id)
            .distinct()
        ).all()
    )
    current_streak, best_streak = _streaks_from_dates(all_log_dates, today)

    logs_30 = list(
        db.scalars(
            select(HabitLog)
            .where(
                HabitLog.user_id == user.id,
                HabitLog.logged_for_date >= start_30,
                HabitLog.logged_for_date <= today,
            )
            .order_by(HabitLog.logged_for_date.asc())
        ).all()
    )

    done_total_30 = len(logs_30)
    denom = habit_count * 30
    completion_rate = int(round((done_total_30 / denom) * 100)) if denom > 0 else 0

    weekly = [0, 0, 0, 0, 0, 0, 0]  # Mon..Sun
    heatmap_map: dict[date, int] = {
        start_30 + timedelta(days=i): 0 for i in range(30)
    }

    for log in logs_30:
        d = log.logged_for_date
        if d >= start_7:
            weekly[d.weekday()] += 1
        if d in heatmap_map:
            heatmap_map[d] += 1

    heatmap = [
        HeatmapPoint(date=d, count=heatmap_map[d])
        for d in sorted(heatmap_map.keys())
    ]

    return StatsOverviewOut(
        current_streak=current_streak,
        best_streak=best_streak,
        completion_rate=completion_rate,
        weekly=weekly,
        heatmap=heatmap,
    )


@router.get("/habits", response_model=list[HabitStatsItemOut])
def get_habit_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[HabitStatsItemOut]:
    today = _today_utc()
    start_30 = today - timedelta(days=29)

    habits = list(
        db.scalars(
            select(Habit)
            .where(Habit.user_id == user.id, Habit.is_archived.is_(False))
            .order_by(Habit.sort_order.asc(), Habit.name.asc())
        ).all()
    )
    if not habits:
        return []

    habit_ids = [h.id for h in habits]
    logs_30 = list(
        db.scalars(
            select(HabitLog)
            .where(
                HabitLog.user_id == user.id,
                HabitLog.habit_id.in_(habit_ids),
                HabitLog.logged_for_date >= start_30,
                HabitLog.logged_for_date <= today,
            )
        ).all()
    )

    done_by_habit: dict = {hid: 0 for hid in habit_ids}
    for log in logs_30:
        done_by_habit[log.habit_id] = done_by_habit.get(log.habit_id, 0) + 1

    out: list[HabitStatsItemOut] = []
    for h in habits:
        done = done_by_habit.get(h.id, 0)
        missed = max(0, 30 - done)
        rate = int(round((done / 30) * 100))
        out.append(
            HabitStatsItemOut(
                id=h.id,
                title=h.name,
                completion_rate=rate,
                missed_count=missed,
            )
        )
    return out
