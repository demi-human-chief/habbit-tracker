from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.deps import get_current_user
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.user import User
from app.schemas.ai import CoachRequest, CoachResponse
from app.services.ollama_service import (
    OllamaModelNotFoundError,
    OllamaService,
    OllamaServiceError,
    OllamaUnavailableError,
)

router = APIRouter(prefix="/ai", tags=["ai"])

SYSTEM_PROMPT = """Ты — AI Coach в приложении Habit Tracker.
Помогай пользователю формировать устойчивые привычки.
Отвечай мягко, конкретно и практически.
Используй данные пользователя: список привычек, выполнение, пропуски, прогресс.
Не ставь медицинские диагнозы.
Не обещай гарантированный результат.
Отвечай на русском языке, если пользователь пишет на русском.
Ответ должен быть коротким: 3-6 предложений.
В конце дай 1-3 конкретных действия на сегодня."""


@router.post("/coach", response_model=CoachResponse)
def coach_reply(
    body: CoachRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CoachResponse:
    today = datetime.now(timezone.utc).date()
    since = today - timedelta(days=13)

    habits = list(
        db.scalars(
            select(Habit)
            .where(Habit.user_id == user.id, Habit.is_archived.is_(False))
            .order_by(Habit.sort_order.asc(), Habit.name.asc())
        ).all()
    )
    habit_ids = [h.id for h in habits]

    done14_counts: dict = {}
    done_today_ids: set = set()
    if habit_ids:
        rows = db.execute(
            select(HabitLog.habit_id, func.count(HabitLog.id))
            .where(
                HabitLog.user_id == user.id,
                HabitLog.logged_for_date >= since,
                HabitLog.logged_for_date <= today,
                HabitLog.habit_id.in_(habit_ids),
            )
            .group_by(HabitLog.habit_id)
        ).all()
        done14_counts = {hid: int(cnt) for hid, cnt in rows}

        today_rows = db.scalars(
            select(HabitLog.habit_id).where(
                HabitLog.user_id == user.id,
                HabitLog.logged_for_date == today,
                HabitLog.habit_id.in_(habit_ids),
            )
        ).all()
        done_today_ids = set(today_rows)

    lines = []
    for h in habits:
        completed_14 = done14_counts.get(h.id, 0)
        skipped_14 = 14 - completed_14
        today_mark = "done" if h.id in done_today_ids else "not_done"
        lines.append(
            f"- {h.name}: done_14d={completed_14}/14, skipped_14d={skipped_14}, today={today_mark}"
        )
    worst = sorted(
        habits,
        key=lambda h: done14_counts.get(h.id, 0),
    )[:3]
    worst_names = ", ".join(h.name for h in worst) if worst else "нет данных"

    context = (
        f"Пользователь: {user.email}\n"
        f"Сегодня (UTC): {today.isoformat()}\n"
        f"Привычек: {len(habits)}\n"
        f"Сегодня выполнено: {len(done_today_ids)}/{len(habits) if habits else 0}\n"
        f"Чаще пропускаются: {worst_names}\n"
        "Список привычек и статистика за 14 дней:\n"
        + ("\n".join(lines) if lines else "- У пользователя пока нет привычек.")
    )
    user_prompt = (
        "Контекст пользователя:\n"
        f"{context}\n\n"
        "Сообщение пользователя:\n"
        f"{body.message}"
    )

    settings = get_settings()
    svc = OllamaService(
        base_url=settings.ollama_base_url,
        model=settings.ollama_model,
        timeout_seconds=45,
    )
    try:
        answer = svc.chat(SYSTEM_PROMPT, user_prompt)
        return CoachResponse(answer=answer)
    except OllamaModelNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{e}",
        ) from None
    except OllamaUnavailableError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"{e}",
        ) from None
    except OllamaServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"{e}",
        ) from None
