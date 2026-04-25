from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup


def today_keyboard(habits: list[dict[str, object]]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    for h in habits:
        done = bool(h["completed"])
        title = str(h["title"])
        hid = str(h["id"])
        label = f"{'Undo' if done else 'Done'} • {title}"
        rows.append(
            [InlineKeyboardButton(text=label, callback_data=f"habit_toggle:{hid}")]
        )
    return InlineKeyboardMarkup(inline_keyboard=rows)
