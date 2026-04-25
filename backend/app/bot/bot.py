import asyncio
import logging

from aiogram import Bot, Dispatcher
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.bot.handlers import build_router
from app.bot.service import HabitBotService
from app.config import get_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main() -> None:
    settings = get_settings()
    if not settings.telegram_bot_token.strip():
        raise RuntimeError("TELEGRAM_BOT_TOKEN is required to run bot service")

    bot = Bot(token=settings.telegram_bot_token)
    service = HabitBotService(public_app_url=settings.public_app_url)
    dp = Dispatcher()
    dp.include_router(build_router(service))

    scheduler = AsyncIOScheduler(timezone="UTC")

    async def send_reminders() -> None:
        targets = service.reminder_targets()
        for telegram_id, habits_count in targets:
            try:
                await bot.send_message(
                    telegram_id,
                    f"Good morning! You have {habits_count} habits today. Use /today to check them.",
                )
            except Exception:
                logger.exception("Reminder failed for telegram_id=%s", telegram_id)

    scheduler.add_job(
        send_reminders,
        trigger="cron",
        hour=settings.telegram_reminder_hour,
        minute=settings.telegram_reminder_minute,
    )
    scheduler.start()

    try:
        await dp.start_polling(bot)
    finally:
        scheduler.shutdown(wait=False)
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
