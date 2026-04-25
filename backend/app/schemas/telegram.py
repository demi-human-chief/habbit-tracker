from datetime import datetime

from pydantic import BaseModel, Field


class TelegramLinkCodeOut(BaseModel):
    code: str
    expires_at: datetime


class TelegramLinkIn(BaseModel):
    telegram_id: int
    code: str = Field(min_length=6, max_length=6)


class TelegramLinkOut(BaseModel):
    success: bool
