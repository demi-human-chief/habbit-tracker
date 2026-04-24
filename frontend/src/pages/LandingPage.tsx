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
            Войти
          </Link>
          <Link
            to="/register"
            className="af-cta-ghost"
          >
            Создать аккаунт
          </Link>
        </nav>
      </header>

      <main className="af-hero">
        <div className="af-hero-copy">
          <p className="af-kicker">Прогресс на виду</p>
          <h1 className="af-title">
            Кольца, которые
            <br />
            хочется закрывать
          </h1>
          <p className="af-lead">
            Трекер привычек с ясной картиной дня: отмечайте важное, смотрите
            динамику, не перегружайте голову.
          </p>
          <div className="af-hero-cta">
            <Link
              to="/register"
              className="af-cta"
            >
              Начать
            </Link>
            <Link
              to="/app"
              className="af-cta-ghost"
            >
              Уже с аккаунтом
            </Link>
          </div>
        </div>
        <div className="af-hero-viz">
          <div className="af-blob" />
          <div className="af-card">
            <RingSet />
            <p className="af-card-caption">Серия, цели и детали в одной зоне</p>
          </div>
        </div>
      </main>

      <section className="af-band">
        <div className="af-band-inner">
          <h2>Спокойный фокус</h2>
          <p>
            Светлый, воздушный и тёмные режимы — как в тренерских приложениях: без
            шума, без лишних экранов.
          </p>
        </div>
      </section>
    </div>
  )
}
