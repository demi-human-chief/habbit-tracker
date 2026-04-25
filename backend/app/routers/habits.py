import uuid
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.user import User
from app.schemas.dashboard import ToggleTodayOut
from app.schemas.habit import HabitCreate, HabitPublic, HabitUpdate
from app.schemas.habit_log import HabitLogCreate, HabitLogPublic
from app.services.analytics_service import track_event

router = APIRouter(prefix="/habits", tags=["habits"])


def _get_owned_habit(db: Session, user: User, habit_id: uuid.UUID) -> Habit:
    habit = db.scalar(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == user.id,
        )
    )
    if habit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )
    return habit


@router.get("/", response_model=list[HabitPublic])
def list_habits(
    include_archived: bool = False,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Habit]:
    q = select(Habit).where(Habit.user_id == user.id)
    if not include_archived:
        q = q.where(Habit.is_archived.is_(False))
    q = q.order_by(Habit.sort_order.asc(), Habit.name.asc())
    return list(db.scalars(q).all())


@router.post(
    "/",
    response_model=HabitPublic,
    status_code=status.HTTP_201_CREATED,
)
def create_habit(
    body: HabitCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Habit:
    h = Habit(
        user_id=user.id,
        name=body.name,
        description=body.description,
        color=body.color,
        icon=body.icon,
        icon_shape=body.icon_shape,
        icon_color=body.icon_color,
        is_archived=body.is_archived,
        sort_order=body.sort_order,
        meta=body.metadata,
    )
    db.add(h)
    db.commit()
    db.refresh(h)
    try:
        track_event(
            db,
            "habit_created",
            user_id=user.id,
            source="web",
            meta={"habit_id": str(h.id), "habit_name": h.name},
        )
    except Exception:
        pass
    return h


@router.get("/{habit_id}", response_model=HabitPublic)
def get_habit(
    habit_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Habit:
    return _get_owned_habit(db, user, habit_id)


@router.patch("/{habit_id}", response_model=HabitPublic)
def update_habit(
    habit_id: uuid.UUID,
    body: HabitUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Habit:
    h = _get_owned_habit(db, user, habit_id)
    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key == "metadata":
            h.meta = value
        elif key == "title":
            continue
        else:
            setattr(h, key, value)
    db.commit()
    db.refresh(h)
    return h


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_habit(
    habit_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    h = _get_owned_habit(db, user, habit_id)
    db.delete(h)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{habit_id}/toggle-today", response_model=ToggleTodayOut)
def toggle_habit_today(
    habit_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ToggleTodayOut:
    _get_owned_habit(db, user, habit_id)
    today = datetime.now(timezone.utc).date()
    log = db.scalar(
        select(HabitLog).where(
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == user.id,
            HabitLog.logged_for_date == today,
        )
    )
    if log is None:
        new_log = HabitLog(
            habit_id=habit_id,
            user_id=user.id,
            logged_for_date=today,
        )
        db.add(new_log)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            return ToggleTodayOut(habit_id=habit_id, completed_today=True)
        try:
            track_event(
                db,
                "habit_completed",
                user_id=user.id,
                source="web",
                meta={"habit_id": str(habit_id)},
            )
        except Exception:
            pass
        return ToggleTodayOut(habit_id=habit_id, completed_today=True)
    db.delete(log)
    db.commit()
    try:
        track_event(
            db,
            "habit_uncompleted",
            user_id=user.id,
            source="web",
            meta={"habit_id": str(habit_id)},
        )
    except Exception:
        pass
    return ToggleTodayOut(habit_id=habit_id, completed_today=False)


# --- logs ---


@router.get("/{habit_id}/logs", response_model=list[HabitLogPublic])
def list_logs(
    habit_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    date_from: Optional[date] = Query(
        default=None, alias="from", description="Начало диапазона (включительно)"
    ),
    date_to: Optional[date] = Query(
        default=None, alias="to", description="Конец диапазона (включительно)"
    ),
) -> list[HabitLog]:
    _get_owned_habit(db, user, habit_id)
    q = select(HabitLog).where(
        HabitLog.habit_id == habit_id,
        HabitLog.user_id == user.id,
    )
    if date_from is not None:
        q = q.where(HabitLog.logged_for_date >= date_from)
    if date_to is not None:
        q = q.where(HabitLog.logged_for_date <= date_to)
    q = q.order_by(HabitLog.logged_for_date.desc())
    return list(db.scalars(q).all())


@router.post(
    "/{habit_id}/logs",
    response_model=HabitLogPublic,
    status_code=status.HTTP_201_CREATED,
)
def create_log(
    habit_id: uuid.UUID,
    body: HabitLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> HabitLog:
    _get_owned_habit(db, user, habit_id)
    log = HabitLog(
        habit_id=habit_id,
        user_id=user.id,
        logged_for_date=body.logged_for_date,
        note=body.note,
        meta=body.metadata,
    )
    db.add(log)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A log for this day already exists for this habit",
        ) from None
    db.refresh(log)
    return log


@router.delete("/{habit_id}/logs", status_code=status.HTTP_204_NO_CONTENT)
def delete_log(
    habit_id: uuid.UUID,
    logged_for_date: date = Query(
        ..., description="Дата отметки (YYYY-MM-DD), которую удалить"
    ),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    _get_owned_habit(db, user, habit_id)
    log = db.scalar(
        select(HabitLog).where(
            HabitLog.habit_id == habit_id,
            HabitLog.user_id == user.id,
            HabitLog.logged_for_date == logged_for_date,
        )
    )
    if log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Log not found for this date",
        )
    db.delete(log)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
