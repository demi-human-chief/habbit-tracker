import { type FormEvent, useState } from 'react'
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { ApiError } from '../lib/api'

export function RegisterPage() {
  const { register, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const nav = useNavigate()
  const loc = useLocation() as { state?: { from?: string } }

  if (user) {
    const to = loc.state?.from && loc.state.from !== '/register' ? loc.state.from : '/app'
    return <Navigate to={to} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    setSubmitting(true)
    try {
      await register(
        email,
        password,
        displayName.trim() || undefined
      )
      const to =
        loc.state?.from && loc.state.from !== '/register' ? loc.state.from : '/app'
      nav(to, { replace: true })
    } catch (e2) {
      if (e2 instanceof ApiError) setErr(e2.message)
      else setErr('Не удалось зарегистрироваться')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="af-auth">
      <div className="af-auth-box">
        <h1 className="af-auth-title">Регистрация</h1>
        <p className="af-auth-sub">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
        <form
          onSubmit={onSubmit}
          className="af-form"
        >
          <label className="af-label">
            Как вас называть
            <input
              className="af-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              placeholder="по желанию"
            />
          </label>
          <label className="af-label">
            Email
            <input
              className="af-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="af-label">
            Пароль (от 8 символов)
            <input
              className="af-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          {err && <p className="af-err">{err}</p>}
          <button
            type="submit"
            className="af-cta af-cta--block"
            disabled={submitting}
          >
            {submitting ? 'Создаём…' : 'Создать аккаунт'}
          </button>
        </form>
        <p className="af-auth-back">
          <Link to="/">← На главную</Link>
        </p>
      </div>
    </div>
  )
}
