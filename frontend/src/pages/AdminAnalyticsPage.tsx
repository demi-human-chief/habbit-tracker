import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  Bot,
  MessageSquareText,
  TrendingUp,
  Users,
  UserPlus,
  Waypoints,
} from 'lucide-react'
import { BottomNav } from '../components/dashboard/BottomNav'
import type { BottomTab } from '../components/dashboard/types'
import {
  getAnalyticsEvents,
  getAnalyticsOverview,
  type AnalyticsEvent,
  type AnalyticsOverview,
} from '../lib/admin-analytics-api'
import { ApiError } from '../lib/api'
import { useAuth } from '../lib/auth-context'

function KpiCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: number
  hint: string
  icon: ReactNode
}) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:scale-[1.01]">
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">{label}</p>
        <span className="text-zinc-400">{icon}</span>
      </div>
      <p className="m-0 mt-2 text-2xl font-semibold tracking-tight text-zinc-100">{value}</p>
      <p className="m-0 mt-1 text-xs text-zinc-500">{hint}</p>
    </article>
  )
}

function SourceBadge({ source }: { source: string | null }) {
  const cls =
    source === 'telegram'
      ? 'bg-sky-500/15 text-sky-300 border-sky-400/30'
      : source === 'ai'
        ? 'bg-violet-500/15 text-violet-300 border-violet-400/30'
        : 'bg-zinc-500/15 text-zinc-300 border-zinc-400/30'
  return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{source ?? 'web'}</span>
}

function SkeletonBlock() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-[22px] border border-white/10 bg-zinc-900/70"
        />
      ))}
    </div>
  )
}

export function AdminAnalyticsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [hoveredDau, setHoveredDau] = useState<{ x: number; y: number; date: string; count: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const [o, e] = await Promise.all([getAnalyticsOverview(), getAnalyticsEvents({ limit: 50 })])
        if (!cancelled) {
          setOverview(o)
          setEvents(e.events)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load analytics')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const onTab = (tab: BottomTab) => {
    if (tab === 'today') navigate('/app')
    else if (tab === 'stats') navigate('/app/stats')
    else if (tab === 'coach') navigate('/app/ai')
    else if (tab === 'admin') navigate('/app/admin/analytics')
    else navigate('/app')
  }

  const maxDau = useMemo(
    () => Math.max(1, ...(overview?.daily_active_users.map((i) => i.count) ?? [1])),
    [overview]
  )
  const topEvents = useMemo(() => {
    if (!overview) return []
    return [...overview.top_events].sort((a, b) => b.count - a.count)
  }, [overview])
  const topEventMax = useMemo(() => Math.max(1, ...topEvents.map((i) => i.count)), [topEvents])
  const sourceTotal =
    (overview?.sources?.web ?? 0) +
    (overview?.sources?.telegram ?? 0) +
    (overview?.sources?.ai ?? 0)

  const isEmpty = !loading && !error && overview && overview.total_users === 0

  return (
    <div className="min-h-svh overflow-x-hidden bg-[#050506] font-sans text-zinc-100 antialiased selection:bg-emerald-500/30 [background-image:radial-gradient(120%_80%_at_10%_0%,rgba(255,60,100,0.12)_0%,transparent_50%),radial-gradient(100%_60%_at_100%_20%,rgba(30,160,255,0.1)_0%,transparent_45%),radial-gradient(90%_50%_at_50%_100%,rgba(50,210,120,0.08)_0%,transparent_50%)]">
      <div className="mx-auto flex w-full max-w-[430px] flex-col px-3 pt-2 sm:px-4 md:max-w-3xl md:px-6 lg:max-w-7xl lg:flex-row lg:items-start lg:gap-6 lg:px-8 lg:pt-6">
        <BottomNav
          active="admin"
          onChange={onTab}
          variant="rail"
          showAdmin={Boolean(user?.is_admin)}
        />
        <main className="flex min-w-0 flex-1 flex-col gap-4 pb-28 sm:pb-24 lg:pb-8">
          <header className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-5 shadow-xl shadow-black/30 backdrop-blur-xl">
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-zinc-100">Product Analytics</h1>
          </header>

          {loading ? <SkeletonBlock /> : null}
          {error ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
          {isEmpty ? (
            <div className="rounded-[22px] border border-dashed border-white/12 bg-zinc-900/40 px-4 py-10 text-center">
              <p className="m-0 text-sm font-medium text-zinc-300">No data yet</p>
            </div>
          ) : null}

          {!loading && !error && overview ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:col-span-4 xl:grid-cols-6">
                <KpiCard label="Total users" value={overview.total_users} hint="all time" icon={<Users size={16} />} />
                <KpiCard label="New users 7d" value={overview.new_users_7d} hint="last 7 days" icon={<UserPlus size={16} />} />
                <KpiCard label="Active users 7d" value={overview.active_users_7d} hint="last 7 days" icon={<Activity size={16} />} />
                <KpiCard label="Events 24h" value={overview.events_24h} hint="last 24h" icon={<TrendingUp size={16} />} />
                <KpiCard label="AI messages" value={overview.ai_messages} hint="all time" icon={<MessageSquareText size={16} />} />
                <KpiCard label="Telegram connected" value={overview.telegram_connected} hint="all time" icon={<Bot size={16} />} />
              </section>

              <article className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 md:col-span-2 xl:col-span-2">
                <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">Funnel</p>
                <ul className="m-0 mt-3 list-none space-y-3 p-0 text-sm">
                  {[
                    { key: 'registered', label: 'Registered', value: overview.funnel.registered, pct: 100 },
                    {
                      key: 'created_habit',
                      label: 'Created habit',
                      value: overview.funnel.created_habit,
                      pct: overview.funnel.conversion.created_habit,
                    },
                    {
                      key: 'completed_habit',
                      label: 'Completed habit',
                      value: overview.funnel.completed_habit,
                      pct: overview.funnel.conversion.completed_habit,
                    },
                    {
                      key: 'used_ai',
                      label: 'Used AI',
                      value: overview.funnel.used_ai,
                      pct: overview.funnel.conversion.used_ai,
                    },
                    {
                      key: 'connected_telegram',
                      label: 'Connected Telegram',
                      value: overview.funnel.connected_telegram,
                      pct: overview.funnel.conversion.connected_telegram,
                    },
                  ].map((s) => (
                    <li key={s.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>{s.label}</span>
                        <strong>{`${s.value} (${s.pct.toFixed(1)}%)`}</strong>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                          style={{ width: `${Math.max(3, Math.min(100, s.pct))}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 md:col-span-2 xl:col-span-2">
                <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">Daily active users</p>
                <div className="relative mt-4">
                  {hoveredDau ? (
                    <div
                      className="pointer-events-none absolute z-10 rounded-lg border border-white/15 bg-zinc-950/90 px-2 py-1 text-xs text-zinc-200"
                      style={{ left: hoveredDau.x + 10, top: hoveredDau.y - 24 }}
                    >
                      {hoveredDau.date}: {hoveredDau.count}
                    </div>
                  ) : null}
                  <svg viewBox="0 0 560 180" className="h-40 w-full">
                    <polyline
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1"
                      points="0,160 560,160"
                    />
                    {overview.daily_active_users.map((d, i) => {
                      const x = (i / Math.max(1, overview.daily_active_users.length - 1)) * 540 + 10
                      const y = 160 - (d.count / maxDau) * 130
                      const next = overview.daily_active_users[i + 1]
                      const x2 = next
                        ? ((i + 1) / Math.max(1, overview.daily_active_users.length - 1)) * 540 + 10
                        : x
                      const y2 = next ? 160 - (next.count / maxDau) * 130 : y
                      return (
                        <g key={d.date}>
                          {next ? (
                            <line
                              x1={x}
                              y1={y}
                              x2={x2}
                              y2={y2}
                              stroke="#4fd1ff"
                              strokeWidth="2"
                            />
                          ) : null}
                          <circle
                            cx={x}
                            cy={y}
                            r={3.5}
                            fill="#7adfff"
                            onMouseEnter={(e) =>
                              setHoveredDau({
                                x: e.clientX,
                                y: e.clientY,
                                date: d.date,
                                count: d.count,
                              })
                            }
                            onMouseLeave={() => setHoveredDau(null)}
                          />
                          {i % 3 === 0 ? (
                            <text x={x} y={176} textAnchor="middle" className="fill-zinc-500 text-[9px]">
                              {d.date.slice(5)}
                            </text>
                          ) : null}
                        </g>
                      )
                    })}
                  </svg>
                </div>
              </article>

              <article className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 md:col-span-1 xl:col-span-2">
                <p className="m-0 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  <Waypoints size={14} /> Retention
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Day 1', value: overview.retention?.day_1 ?? 0 },
                    { label: 'Day 3', value: overview.retention?.day_3 ?? 0 },
                    { label: 'Day 7', value: overview.retention?.day_7 ?? 0 },
                  ].map((r) => (
                    <div key={r.label} className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                      <p className="m-0 text-xs uppercase tracking-wide text-zinc-500">{r.label}</p>
                      <p className="m-0 mt-1 text-lg font-semibold text-zinc-100">{r.value}%</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 md:col-span-1 xl:col-span-2">
                <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">Sources</p>
                <div className="mt-3 space-y-3">
                  {[
                    {
                      label: 'Web',
                      value: overview.sources?.web ?? 0,
                      color: 'from-zinc-300 to-zinc-500',
                    },
                    {
                      label: 'Telegram',
                      value: overview.sources?.telegram ?? 0,
                      color: 'from-sky-400 to-sky-600',
                    },
                    {
                      label: 'AI',
                      value: overview.sources?.ai ?? 0,
                      color: 'from-violet-400 to-violet-600',
                    },
                  ].map((s) => {
                    const pct = sourceTotal > 0 ? (s.value / sourceTotal) * 100 : 0
                    return (
                      <div key={s.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{s.label}</span>
                          <strong>{`${s.value} (${pct.toFixed(1)}%)`}</strong>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${s.color} transition-all duration-500`}
                            style={{ width: `${Math.max(2, pct)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>

              <article className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 md:col-span-2 xl:col-span-4">
                <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">Top events</p>
                <ul className="m-0 mt-3 grid list-none gap-2 p-0 md:grid-cols-2">
                  {topEvents.map((e) => (
                    <li key={e.event_name} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>{e.event_name}</span>
                        <strong>{e.count}</strong>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/10">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                          style={{ width: `${Math.max(2, (e.count / topEventMax) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 md:col-span-2 xl:col-span-4">
                <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">Recent events</p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="text-zinc-500">
                        <th className="pb-2 font-medium">Time</th>
                        <th className="pb-2 font-medium">Event</th>
                        <th className="pb-2 font-medium">User</th>
                        <th className="pb-2 font-medium">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((e) => (
                        <tr key={e.id} className="border-t border-white/10">
                          <td className="py-2">{new Date(e.created_at).toLocaleString()}</td>
                          <td className="py-2">{e.event_name}</td>
                          <td className="py-2 font-mono text-xs">{e.user_id ?? '-'}</td>
                          <td className="py-2"><SourceBadge source={e.source} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          ) : null}
        </main>
      </div>
      <BottomNav
        active="admin"
        onChange={onTab}
        variant="bar"
        showAdmin={Boolean(user?.is_admin)}
      />
    </div>
  )
}
