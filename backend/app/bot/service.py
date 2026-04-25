import json
import logging
import uuid
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Any
from urllib import error, request

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models.habit import Habit
from app.models.habit_log import HabitLog
from app.models.user import User
from app.services.analytics_service import track_event

logger = logging.getLogger(__name__)


@dataclass
class HabitBotService:
    public_app_url: str

    def _session(self) -> Session:
        return SessionLocal()

    def _today(self) -> date:
        return datetime.now(timezone.utc).date()

    def find_user_by_telegram_id(self, telegram_id: int) -> User | None:
        db = self._session()
        try:
            return db.scalar(select(User).where(User.telegram_id == telegram_id))
        finally:
            db.close()

    def link_telegram_with_code(self, telegram_id: int, code: str) -> tuple[bool, str]:
        url = f"{self.public_app_url.rstrip('/')}/api/v1/telegram/link"
        payload = json.dumps(
            {"telegram_id": telegram_id, "code": code.strip().upper()}
        ).encode("utf-8")
        req = request.Request(
            url=url,
            data=payload,
            method="POST",
            headers={"Content-Type": "application/json"},
        )
        try:
            with request.urlopen(req, timeout=20) as resp:
                if resp.status < 300:
                    return True, "Telegram connected successfully ✅"
                return False, "Failed to link Telegram account."
        except error.HTTPError as e:
            body = e.read().decode("utf-8", errors="ignore")
            if "expired" in body.lower():
                return False, "Link code expired. Generate a new code in the app."
            if "not found" in body.lower():
                return False, "Code not found. Check the code and try again."
            if "already linked" in body.lower():
                return False, "This Telegram account is already linked."
            logger.exception("Link request failed: %s", body)
            return False, "Could not link Telegram right now."
        except Exception:
            logger.exception("Link request failed")
            return False, "Could not reach backend. Try again later."

    def today_habits(self, telegram_id: int) -> list[dict[str, Any]] | None:
        db = self._session()
        try:
            user = db.scalar(select(User).where(User.telegram_id == telegram_id))
            if user is None:
                return None
            today = self._today()
            habits = list(
                db.scalars(
                    select(Habit)
                    .where(Habit.user_id == user.id, Habit.is_archived.is_(False))
                    .order_by(Habit.sort_order.asc(), Habit.name.asc())
                ).all()
            )
            done_ids = set(
                db.scalars(
                    select(HabitLog.habit_id).where(
                        HabitLog.user_id == user.id, HabitLog.logged_for_date == today
                    )
                ).all()
            )
            return [
                {
                    "id": str(h.id),
                    "title": h.name,
                    "completed": h.id in done_ids,
                }
                for h in habits
            ]
        finally:
            db.close()

    def toggle_habit(self, telegram_id: int, habit_id: str) -> tuple[bool, str]:
        db = self._session()
        try:
            user = db.scalar(select(User).where(User.telegram_id == telegram_id))
            if user is None:
                return False, "Account is not linked."
            try:
                habit_uuid = uuid.UUID(habit_id)
            except ValueError:
                return False, "Habit not found."
            habit = db.scalar(
                select(Habit).where(
                    Habit.id == habit_uuid,
                    Habit.user_id == user.id,
                    Habit.is_archived.is_(False),
                )
            )
            if habit is None:
                return False, "Habit not found."
            today = self._today()
            log = db.scalar(
                select(HabitLog).where(
                    HabitLog.habit_id == habit.id,
                    HabitLog.user_id == user.id,
                    HabitLog.logged_for_date == today,
                )
            )
            if log is None:
                db.add(HabitLog(habit_id=habit.id, user_id=user.id, logged_for_date=today))
                db.commit()
                try:
                    track_event(
                        db,
                        "telegram_habit_completed",
                        user_id=user.id,
                        source="telegram",
                        meta={"habit_id": str(habit.id)},
                    )
                except Exception:
                    pass
                return True, "done"
            db.delete(log)
            db.commit()
            try:
                track_event(
                    db,
                    "telegram_habit_uncompleted",
                    user_id=user.id,
                    source="telegram",
                    meta={"habit_id": str(habit.id)},
                )
            except Exception:
                pass
            return True, "pending"
        except Exception:
            db.rollback()
            logger.exception("Toggle habit failed")
            return False, "Could not update habit."
        finally:
            db.close()

    def mark_first_pending(self, telegram_id: int) -> tuple[bool, str]:
        habits = self.today_habits(telegram_id)
        if habits is None:
            return False, "Account is not linked."
        pending = next((h for h in habits if not h["completed"]), None)
        if pending is None:
            return False, "All habits are already done today ✅"
        ok, state = self.toggle_habit(telegram_id, pending["id"])
        if not ok:
            return False, state
        return True, f"Marked as done: {pending['title']} ✅"

    def quick_stats(self, telegram_id: int) -> dict[str, int] | None:
        db = self._session()
        try:
            user = db.scalar(select(User).where(User.telegram_id == telegram_id))
            if user is None:
                return None
            today = self._today()
            start_30 = today - timedelta(days=29)

            habits = list(
                db.scalars(
                    select(Habit).where(Habit.user_id == user.id, Habit.is_archived.is_(False))
                ).all()
            )
            total_habits = len(habits)
            today_done = len(
                db.scalars(
                    select(HabitLog.id).where(
                        HabitLog.user_id == user.id, HabitLog.logged_for_date == today
                    )
                ).all()
            )
            logs_30 = len(
                db.scalars(
                    select(HabitLog.id).where(
                        HabitLog.user_id == user.id,
                        HabitLog.logged_for_date >= start_30,
                        HabitLog.logged_for_date <= today,
                    )
                ).all()
            )
            rate = int(round((logs_30 / (total_habits * 30)) * 100)) if total_habits else 0
            done_dates = set(
                db.scalars(
                    select(HabitLog.logged_for_date).where(HabitLog.user_id == user.id).distinct()
                ).all()
            )
            streak = 0
            cursor = today
            while cursor in done_dates:
                streak += 1
                cursor -= timedelta(days=1)
            return {
                "today_done": today_done,
                "today_total": total_habits,
                "streak": streak,
                "completion_rate": rate,
            }
        finally:
            db.close()

    def reminder_targets(self) -> list[tuple[int, int]]:
        db = self._session()
        try:
            users = list(db.scalars(select(User).where(User.telegram_id.is_not(None))).all())
            out: list[tuple[int, int]] = []
            for u in users:
                count = len(
                    db.scalars(
                        select(Habit.id).where(
                            Habit.user_id == u.id, Habit.is_archived.is_(False)
                        )
                    ).all()
                )
                out.append((int(u.telegram_id), count))
            return out
        finally:
            db.close()
