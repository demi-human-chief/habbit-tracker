# Habit tracker

Monorepo: `frontend` (Vite + React + TypeScript), `backend` (FastAPI), `docker-compose` с PostgreSQL.

## Локальная разработка

### Фронт (Vite, React Router, лендинг в духе Apple Fitness)

`VITE_API_URL` указывает на бэкенд, по умолчанию `http://127.0.0.1:8000` — скопируйте [`frontend/.env.example`](frontend/.env.example) в `frontend/.env` при необходимости.

```bash
cd frontend && npm install && npm run dev
```

- Главная: лендинг, `/login`, `/register`, защищённый `/app` (список привычек из API, выход).
- CORS бэка должен разрешать `http://localhost:5173` (уже в `docker-compose` / `.env`).

### API (без Docker)

Нужен запущенный PostgreSQL и `DATABASE_URL` (см. корневой `.env.example`; для `backend` можно скопировать в `backend/.env`).

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

**Опционально дальше:** формы **создания/редактирования** привычек и **отметок** в SPA.

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
