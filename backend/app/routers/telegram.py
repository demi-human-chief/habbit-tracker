import secrets
import string
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.telegram import TelegramLinkCodeOut, TelegramLinkIn, TelegramLinkOut
from app.services.analytics_service import track_event

router = APIRouter(prefix="/telegram", tags=["telegram"])


def _new_link_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(6))


@router.post("/link-code", response_model=TelegramLinkCodeOut)
def create_link_code(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TelegramLinkCodeOut:
    code = _new_link_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    user.telegram_link_code = code
    user.telegram_link_code_expires_at = expires_at
    db.commit()
    return TelegramLinkCodeOut(code=code, expires_at=expires_at)


@router.post("/link", response_model=TelegramLinkOut)
def link_telegram(
    body: TelegramLinkIn,
    db: Session = Depends(get_db),
) -> TelegramLinkOut:
    now = datetime.now(timezone.utc)
    user = db.scalar(select(User).where(User.telegram_link_code == body.code.upper()))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link code not found")
    if user.telegram_link_code_expires_at is None or user.telegram_link_code_expires_at < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Link code expired")

    conflict = db.scalar(
        select(User).where(User.telegram_id == body.telegram_id, User.id != user.id)
    )
    if conflict is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This Telegram account is already linked",
        )

    user.telegram_id = body.telegram_id
    user.telegram_link_code = None
    user.telegram_link_code_expires_at = None
    db.commit()
    try:
        track_event(
            db,
            "telegram_connected",
            user_id=user.id,
            source="telegram",
            meta={"telegram_id": body.telegram_id},
        )
    except Exception:
        pass
    return TelegramLinkOut(success=True)
