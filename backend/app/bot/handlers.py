import logging

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import CallbackQuery, Message

from app.bot.keyboards import today_keyboard
from app.bot.service import HabitBotService

logger = logging.getLogger(__name__)


def _today_text(habits: list[dict[str, object]]) -> str:
    if not habits:
        return "No habits found for today."
    lines = ["Today's habits:"]
    for h in habits:
        status = "✅ done" if bool(h["completed"]) else "⏳ pending"
        lines.append(f"- {h['title']}: {status}")
    return "\n".join(lines)


def build_router(service: HabitBotService) -> Router:
    router = Router()

    @router.message(Command("start"))
    async def cmd_start(message: Message) -> None:
        if message.from_user is None:
            return
        user = service.find_user_by_telegram_id(message.from_user.id)
        if user is not None:
            await message.answer(
                "Welcome back! 🎯\nUse /today, /done, /stats, /help."
            )
            return
        await message.answer(
            "Hi! To connect Telegram, open Habit Tracker profile, generate link code, "
            "then send that code here."
        )

    @router.message(Command("help"))
    async def cmd_help(message: Message) -> None:
        await message.answer(
            "Commands:\n"
            "/start - start and account status\n"
            "/today - today's habits with buttons\n"
            "/done - mark first pending habit as done\n"
            "/stats - quick stats\n"
            "/help - this message"
        )

    @router.message(Command("today"))
    async def cmd_today(message: Message) -> None:
        if message.from_user is None:
            return
        habits = service.today_habits(message.from_user.id)
        if habits is None:
            await message.answer("Account is not linked. Send /start and then your link code.")
            return
        await message.answer(_today_text(habits), reply_markup=today_keyboard(habits))

    @router.message(Command("done"))
    async def cmd_done(message: Message) -> None:
        if message.from_user is None:
            return
        ok, msg = service.mark_first_pending(message.from_user.id)
        await message.answer(msg)
        if ok:
            habits = service.today_habits(message.from_user.id)
            if habits is not None:
                await message.answer(_today_text(habits), reply_markup=today_keyboard(habits))

    @router.message(Command("stats"))
    async def cmd_stats(message: Message) -> None:
        if message.from_user is None:
            return
        stats = service.quick_stats(message.from_user.id)
        if stats is None:
            await message.answer("Account is not linked. Send /start and then your link code.")
            return
        await message.answer(
            "Stats:\n"
            f"- Today progress: {stats['today_done']}/{stats['today_total']}\n"
            f"- Current streak: {stats['streak']} days\n"
            f"- Completion rate (30d): {stats['completion_rate']}%"
        )

    @router.message(F.text.regexp(r"^[A-Za-z0-9]{6}$"))
    async def code_message(message: Message) -> None:
        if message.from_user is None or message.text is None:
            return
        user = service.find_user_by_telegram_id(message.from_user.id)
        if user is not None:
            return
        ok, msg = service.link_telegram_with_code(message.from_user.id, message.text)
        await message.answer(msg)

    @router.callback_query(F.data.startswith("habit_toggle:"))
    async def toggle_callback(callback: CallbackQuery) -> None:
        if callback.from_user is None or callback.data is None:
            return
        habit_id = callback.data.split(":", maxsplit=1)[1]
        ok, msg = service.toggle_habit(callback.from_user.id, habit_id)
        if not ok:
            await callback.answer(msg, show_alert=True)
            return
        habits = service.today_habits(callback.from_user.id)
        if habits is None:
            await callback.answer("Account is not linked.", show_alert=True)
            return
        if callback.message is not None:
            await callback.message.edit_text(_today_text(habits), reply_markup=today_keyboard(habits))
        await callback.answer(f"Updated: {msg}")

    return router
