import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson, ApiError } from '../lib/api'
import { useAuth } from '../lib/auth-context'
import type { Habit } from '../lib/types'

export function AppPage() {
  const { user, logout } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setErr(null)
    setLoading(true)
    apiJson<Habit[]>('/api/v1/habits/?include_archived=true')
      .then((h) => {
        if (!cancelled) {
          setHabits(h)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          if (e instanceof ApiError) setErr(e.message)
          else setErr('Не удалось загрузить привычки')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="app-page">
      <header className="app-page-header">
        <div>
          <h1 className="app-page-title">Привычки</h1>
          {user && (
            <p className="app-page-sub">
              {user.display_name || user.email}
            </p>
          )}
        </div>
        <div className="app-page-actions">
          <Link
            to="/"
            className="af-link"
          >
            О проекте
          </Link>
          <button
            type="button"
            className="af-cta-ghost"
            onClick={logout}
          >
            Выйти
          </button>
        </div>
      </header>

      {loading && <p className="af-muted">Загрузка…</p>}
      {err && <p className="af-err">{err}</p>}

      {!loading && !err && habits.length === 0 && (
        <div className="app-empty">
          <p className="af-muted">Пока нет привычек — скоро добавим создание с экрана.</p>
        </div>
      )}

      <ul className="habit-list">
        {habits.map((h) => (
          <li
            key={h.id}
            className="habit-card"
          >
            <div className="habit-card-head">
              <span className="habit-dot" style={{ background: h.color || 'var(--af-ring-green)' }} />
              <h2>{h.name}</h2>
            </div>
            {h.description && <p className="habit-desc">{h.description}</p>}
            {h.is_archived && <span className="af-badge">в архиве</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
