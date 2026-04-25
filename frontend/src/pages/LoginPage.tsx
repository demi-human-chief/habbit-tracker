import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { ApiError } from '../lib/api'

export function LoginPage() {
  const { login, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const nav = useNavigate()
  const loc = useLocation() as { state?: { from?: string } }

  if (user) {
    const to = loc.state?.from && loc.state.from !== '/login' ? loc.state.from : '/app'
    return <Navigate to={to} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    setSubmitting(true)
    try {
      await login(email, password)
      const to =
        loc.state?.from && loc.state.from !== '/login' ? loc.state.from : '/app'
      nav(to, { replace: true })
    } catch (e2) {
      if (e2 instanceof ApiError) setErr(e2.message)
      else setErr('Could not sign in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="af-auth">
      <div className="af-auth-box">
        <h1 className="af-auth-title">Sign in</h1>
        <p className="af-auth-sub">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
        <form
          onSubmit={onSubmit}
          className="af-form"
        >
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
            Password
            <input
              className="af-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {err && <p className="af-err">{err}</p>}
          <button
            type="submit"
            className="af-cta af-cta--block"
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Continue'}
          </button>
        </form>
        <p className="af-auth-back">
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
