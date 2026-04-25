import json
import logging
from dataclasses import dataclass
from typing import Any
from urllib import error, request


logger = logging.getLogger(__name__)


class OllamaServiceError(Exception):
    pass


class OllamaUnavailableError(OllamaServiceError):
    pass


class OllamaModelNotFoundError(OllamaServiceError):
    pass


@dataclass
class OllamaService:
    base_url: str
    model: str
    timeout_seconds: int = 45

    def chat(self, system_prompt: str, user_message: str) -> str:
        payload = {
            "model": self.model,
            "stream": False,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        }
        body = json.dumps(payload).encode("utf-8")
        url = f"{self.base_url.rstrip('/')}/api/chat"
        req = request.Request(
            url=url,
            data=body,
            method="POST",
            headers={"Content-Type": "application/json"},
        )
        try:
            with request.urlopen(req, timeout=self.timeout_seconds) as resp:
                raw = resp.read().decode("utf-8")
                data = json.loads(raw) if raw else {}
        except error.HTTPError as e:
            detail = e.read().decode("utf-8", errors="ignore")
            lowered = detail.lower()
            if e.code == 404 and "model" in lowered and "pull" in lowered:
                raise OllamaModelNotFoundError(
                    f"Model '{self.model}' is not available. Run: ollama pull {self.model}"
                ) from None
            logger.exception("Ollama HTTP error: %s", detail or e.reason)
            raise OllamaServiceError("Ollama request failed") from None
        except error.URLError as e:
            logger.exception("Ollama unavailable: %s", e.reason)
            raise OllamaUnavailableError(
                "Ollama is unavailable. Check OLLAMA_BASE_URL and that Ollama is running."
            ) from None
        except TimeoutError:
            logger.exception("Ollama request timeout")
            raise OllamaUnavailableError("Ollama request timed out.") from None
        except Exception:
            logger.exception("Unexpected Ollama error")
            raise OllamaServiceError("Unexpected Ollama error") from None

        content = _extract_content(data)
        if content.strip():
            return content.strip()
        return (
            "Похоже, сейчас ответ от модели пустой. "
            "Сделайте один самый простой шаг: выберите 1 привычку и отметьте ее в течение 10 минут."
        )


def _extract_content(data: dict[str, Any]) -> str:
    msg = data.get("message")
    if isinstance(msg, dict):
        content = msg.get("content")
        if isinstance(content, str):
            return content
    if isinstance(data.get("response"), str):
        return data["response"]
    return ""
