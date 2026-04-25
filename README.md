# Habit tracker

Monorepo: `frontend` (Vite + React + TypeScript), `backend` (FastAPI), `docker-compose` с PostgreSQL.

## Локальная разработка

### Фронт (Vite, React Router, лендинг в духе Apple Fitness)

**Переменные фронта:** `VITE_API_URL` — базовый URL API (без завершающего `/`); в dev по умолчанию `http://127.0.0.1:8000`, в прод-сборке без значения запросы идут на тот же origin. Скопируйте [`frontend/.env.example`](frontend/.env.example) в `frontend/.env` при необходимости.

```bash
cd frontend && npm install && npm run dev
```

- Главная: лендинг, `/login`, `/register`, защищённый `/app` — **дашборд «Today»** загружает данные с API (`GET /api/v1/dashboard/today`), создание и отметка привычек идут через `POST /api/v1/habits/` и `POST /api/v1/habits/{id}/toggle-today` (JWT из `localStorage`, см. [`frontend/src/lib/api.ts`](frontend/src/lib/api.ts)).
- Страница `/app/stats`: аналитика по реальным данным (`GET /api/v1/stats/overview`, `GET /api/v1/stats/habits`) — streak, completion rate, weekly chart, heatmap и перформанс привычек.
- Страница `/app/ai`: локальный **AI Coach** (Qwen через Ollama) через backend endpoint `POST /api/v1/ai/coach`.
- Страница `/app/admin/analytics`: продуктовая аналитика (KPI, визуальная funnel с conversion, DAU за 14 дней, retention, sources, top/recent events) на основе `analytics_events`.
- В профиле есть **Telegram Integration**: генерация одноразового кода привязки и инструкции для подключения бота.
- CORS бэка должен разрешать `http://localhost:5173` (уже в `docker-compose` / `.env`).

### API (без Docker)

Нужен запущенный PostgreSQL и **`DATABASE_URL`**, плюс **`JWT_SECRET`** (≥32 символа), **`CORS_ORIGINS`** (через запятую, например `http://localhost:5173`), **`OLLAMA_BASE_URL`** (например `http://localhost:11434`), **`OLLAMA_MODEL`** (например `qwen2.5:7b`), **`TELEGRAM_BOT_TOKEN`**, **`PUBLIC_APP_URL`**, **`TELEGRAM_REMINDER_HOUR`**, **`TELEGRAM_REMINDER_MINUTE`** — см. корневой [`.env.example`](.env.example); для `backend` можно скопировать в `backend/.env`.

```bash
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Всё с БД (Docker)

```bash
cp .env.example .env
# при необходимости отредактируйте пароли
docker compose up --build
```

При старте контейнера `api` автоматически выполняется `alembic upgrade head`.

Для локального AI Coach сначала поднимите Ollama и скачайте модель:

```bash
docker compose up -d ollama
docker exec -it <ollama_container_name> ollama pull qwen2.5:7b
```

### Telegram bot setup

1. Откройте [@BotFather](https://t.me/BotFather), выполните `/newbot` и получите `TELEGRAM_BOT_TOKEN`.
2. Заполните в `.env`:
   - `TELEGRAM_BOT_TOKEN=...`
   - `PUBLIC_APP_URL=http://your-domain-or-ip` (URL, доступный для bot->api запросов)
   - `TELEGRAM_REMINDER_HOUR=9`
   - `TELEGRAM_REMINDER_MINUTE=0`
3. Запуск всего стека: `docker compose up -d --build` (поднимется отдельный сервис `bot`).
4. Привязка аккаунта:
   - войти в приложение;
   - открыть Profile → Telegram Integration;
   - сгенерировать код;
   - отправить код боту после `/start`.

- API: `http://localhost:8000/health`, проверка БД: `http://localhost:8000/health/db`
- OpenAPI: `http://localhost:8000/docs`
- **Auth (JWT):**
  - `POST /api/v1/auth/register` — JSON: `email`, `password` (≥8), опционально `display_name`
  - `POST /api/v1/auth/login` — JSON: `email`, `password` → `access_token`
  - `GET /api/v1/auth/me` — заголовок `Authorization: Bearer <token>`

Секрет JWT: `JWT_SECRET` (≥32 символа), для фронта: `CORS_ORIGINS` (через запятую) — см. [`.env.example`](.env.example).

### Миграции вручную (локально)

```bash
cd backend && source .venv/bin/activate
export DATABASE_URL=postgresql://habit:habit@localhost:5432/habit
alembic upgrade head
```

## Порядок работ

**Опционально дальше:** расширенные формы редактирования привычек, календарь отметок, реальный streak на бэкенде.

**Дашборд (Today):** `GET /api/v1/dashboard/today` — привычки пользователя с `completed_today`, агрегаты `total_count`, `completed_count`, `completion_percent`, поля колец `ring_habits`, `ring_consistency`, `ring_focus`, `streak` (пока заглушка с бэка). `POST /api/v1/habits/{id}/toggle-today` — переключить отметку за сегодня (UTC-дата на сервере).

**AI Coach (локальный):** `POST /api/v1/ai/coach` — backend собирает контекст привычек и логов за последние 14 дней, затем отправляет запрос в Ollama (`OLLAMA_BASE_URL`, `OLLAMA_MODEL`) и возвращает короткий персональный ответ.

**Telegram bot:** команды `/start`, `/today`, `/done`, `/stats`, `/help`, inline Done/Undo и ежедневные напоминания через scheduler.

**Product analytics:** backend автоматически трекает события (регистрация, логин, действия с привычками, AI, Telegram) и отдаёт admin dashboard endpoints.

**Готово в том числе:** прод-стек [docker-compose.prod.yml](docker-compose.prod.yml) (PostgreSQL, API, Nginx+SPA, [Caddyfile](Caddyfile) — `:80`, прокси `/api*`, `/docs*`, `…` → API, остальное → фронт). Пример [Caddyfile.domain.example](Caddyfile.domain.example) — домен и Let’s Encrypt.

### Деплой на ВМ (Yandex Cloud и аналоги)

1. На сервер: Docker, Git (или scp), скопируйте проект, `cp .env.example .env`, задайте `POSTGRES_PASSWORD`, длинный `JWT_SECRET` (≥32).
2. Сборка и запуск: `docker compose -f docker-compose.prod.yml up -d --build`
3. Откройте `http://<IP_ВМ>` — одна точка входа, фронт ходит в API **по тому же host** (в образе фронта `VITE_API_URL` пустой, см. [frontend/src/lib/api.ts](frontend/src/lib/api.ts)).
4. **Группы безопасности / firewall:** снаружи **80** и **443**; **22** (SSH) — только с вашего IP, не весь интернет.
5. **Домен и HTTPS:** A-запись на IP ВМ, подставьте домен в Caddy (см. [Caddyfile.domain.example](Caddyfile.domain.example) вместо `:80` или в дополнение), перезапустите caddy, проверьте 443.

Локальная dev-сборка фронта как раньше: `VITE_API_URL` по умолчанию `http://127.0.0.1:8000` при `npm run dev`.

**API привычек** (всё с `Authorization: Bearer`, чужие `habit_id` → 404):

- `GET /api/v1/habits/?include_archived=false` — список
- `POST /api/v1/habits/` — создать (в теле `metadata` опционально)
- `GET|PATCH|DELETE /api/v1/habits/{id}`
- `GET /api/v1/habits/{id}/logs?from=…&to=…` — отметки по дням
- `POST /api/v1/habits/{id}/logs` — тело: `logged_for_date`, при необходимости `note`, `metadata` (дубликат дня → 409)
- `DELETE /api/v1/habits/{id}/logs?logged_for_date=YYYY-MM-DD`
- `GET /api/v1/dashboard/today` — сводка на сегодня для дашборда
- `POST /api/v1/habits/{id}/toggle-today` — создать/удалить отметку за сегодня
- `POST /api/v1/ai/coach` — локальный AI Coach через Ollama
- `GET /api/v1/stats/overview` — агрегированная аналитика за период (streak, weekly, heatmap, completion_rate)
- `GET /api/v1/stats/habits` — аналитика по каждой привычке (completion_rate, missed_count)
- `POST /api/v1/telegram/link-code` — создать код привязки Telegram (JWT required)
- `POST /api/v1/telegram/link` — привязать telegram_id по коду (использует бот)
- `GET /api/v1/admin/analytics/overview` — KPI, funnel + conversion, top events, DAU (14 дней), retention (D1/D3/D7), sources, timeline
- `GET /api/v1/admin/analytics/events?limit=...&event_name=...&user_id=...` — последние события
