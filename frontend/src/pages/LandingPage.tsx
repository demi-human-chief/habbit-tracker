import { Link } from 'react-router-dom'

function RingSet() {
  return (
    <svg
      className="af-rings"
      viewBox="0 0 200 200"
      aria-hidden
    >
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="url(#g1)"
        strokeWidth="14"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="0.78 0.22"
        transform="rotate(-90 100 100)"
        opacity="0.95"
      />
      <circle
        cx="100"
        cy="100"
        r="70"
        fill="none"
        stroke="url(#g2)"
        strokeWidth="12"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="0.55 0.45"
        transform="rotate(-40 100 100)"
        opacity="0.95"
      />
      <circle
        cx="100"
        cy="100"
        r="52"
        fill="none"
        stroke="url(#g3)"
        strokeWidth="10"
        strokeLinecap="round"
        pathLength="1"
        strokeDasharray="0.4 0.6"
        transform="rotate(120 100 100)"
        opacity="0.95"
      />
      <defs>
        <linearGradient
          id="g1"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#2fd072" />
          <stop offset="100%" stopColor="#1a9e52" />
        </linearGradient>
        <linearGradient
          id="g2"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop offset="0%" stopColor="#ff5a7a" />
          <stop offset="100%" stopColor="#ff2d6a" />
        </linearGradient>
        <linearGradient
          id="g3"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#3dc7ff" />
          <stop offset="100%" stopColor="#0c9edf" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function LandingPage() {
  return (
    <div className="af-landing">
      <header className="af-topbar">
        <span className="af-mark">HabitRings</span>
        <nav className="af-nav">
          <Link
            to="/login"
            className="af-link"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="af-cta-ghost"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="af-hero">
        <div className="af-hero-copy">
          <p className="af-kicker">Habit Tracker</p>
          <h1 className="af-title">Build better habits with AI</h1>
          <p className="af-lead">
            Track your daily routines, stay consistent, and get personalized coaching
            based on your progress.
          </p>
          <div className="af-hero-cta">
            <Link
              to="/register"
              className="af-cta"
            >
              Get started
            </Link>
            <Link
              to="/login"
              className="af-cta-ghost"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="af-hero-viz">
          <div className="af-blob" />
          <div className="af-card">
            <RingSet />
            <p className="af-card-caption">Your daily progress, clear and focused.</p>
          </div>
        </div>
      </main>

      <section className="af-band">
        <div className="af-band-inner">
          <h2>Everything you need to stay consistent</h2>
          <div className="af-feature-grid">
            <article className="af-feature-card">
              <h3>Daily habit tracking</h3>
              <p>Plan your routines and check them off every day.</p>
            </article>
            <article className="af-feature-card">
              <h3>Progress analytics</h3>
              <p>See streaks, completion trends, and weekly activity.</p>
            </article>
            <article className="af-feature-card">
              <h3>AI coaching</h3>
              <p>Get practical advice based on your habit history.</p>
            </article>
            <article className="af-feature-card">
              <h3>Telegram reminders</h3>
              <p>Stay on track with reminders and quick updates in chat.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
