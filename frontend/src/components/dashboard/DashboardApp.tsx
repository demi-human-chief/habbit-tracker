import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/api'
import { useAuth } from '../../lib/auth-context'
import {
  createHabit,
  getTodayDashboard,
  toggleHabitToday,
  type DashboardTodayResponse,
} from '../../lib/dashboard-api'
import { AddHabit, pickIcon } from './AddHabit'
import { AIInsight } from './AIInsight'
import { BottomNav } from './BottomNav'
import { HabitCard } from './HabitCard'
import { ProgressRings } from './ProgressRings'
import type { BottomTab, DashboardHabit } from './types'
import { WeeklyActivity } from './WeeklyActivity'

function greeting(): 'Good morning' | 'Good afternoon' | 'Good evening' {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function mapDashboardToHabits(d: DashboardTodayResponse): DashboardHabit[] {
  return d.habits.map((h) => ({
    id: h.id,
    title: h.name,
    description: h.description?.trim() ? h.description : '',
    icon: (h.icon && h.icon.trim()) || pickIcon(h.name),
    completed: h.completed_today,
  }))
}

function TabPlaceholder({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div className="flex min-h-[50svh] flex-col items-center justify-center gap-2 px-4 pb-28 pt-4 text-center sm:pb-24 lg:min-h-[40svh] lg:pb-8">
      <h1 className="m-0 text-xl font-semibold tracking-tight text-zinc-100">{title}</h1>
      <p className="m-0 max-w-[28ch] text-sm leading-relaxed text-zinc-500">{body}</p>
    </div>
  )
}

export function DashboardApp() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [tab, setTab] = useState<BottomTab>('today')
  const [dash, setDash] = useState<DashboardTodayResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [adding, setAdding] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadDashboard = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true
    try {
      if (!silent) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      setError(null)
      const data = await getTodayDashboard()
      setDash(data)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to load dashboard'
      setError(msg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  const habits = useMemo(() => (dash ? mapDashboardToHabits(dash) : []), [dash])

  const name = useMemo(() => {
    if (user?.display_name?.trim()) {
      return user.display_name.split(/\s+/)[0] ?? 'there'
    }
    const local = user?.email?.split('@')[0]
    if (local) {
      return local.charAt(0).toUpperCase() + local.slice(1)
    }
    return 'Alex'
  }, [user])

  const { total, done, habitsP, consP, focusP, streakDisplay } = useMemo(() => {
    if (!dash) {
      return {
        total: 0,
        done: 0,
        habitsP: 0,
        consP: 0,
        focusP: 0,
        streakDisplay: 0,
      }
    }
    const total2 = dash.total_count
    const done2 = dash.completed_count
    const bonus = total2 > 0 && done2 === total2
    return {
      total: total2,
      done: done2,
      habitsP: dash.ring_habits,
      consP: dash.ring_consistency,
      focusP: dash.ring_focus,
      streakDisplay: dash.streak + (bonus ? 1 : 0),
    }
  }, [dash])

  const toggleHabit = async (id: string) => {
    setTogglingId(id)
    try {
      await toggleHabitToday(id)
      await loadDashboard({ silent: true })
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not update habit'
      setError(msg)
    } finally {
      setTogglingId(null)
    }
  }

  const addHabit = async (title: string) => {
    const t = title.trim()
    if (!t) return
    setAdding(true)
    try {
      await createHabit({ name: t })
      await loadDashboard({ silent: true })
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not create habit'
      setError(msg)
    } finally {
      setAdding(false)
    }
  }

  const showTodaySkeleton = loading && !dash
  const showTodayError = Boolean(error) && !dash && !loading
  const emptyHabits = dash && dash.total_count === 0
  const onTabChange = (nextTab: BottomTab) => {
    if (nextTab === 'coach') {
      navigate('/app/ai')
      return
    }
    setTab(nextTab)
  }

  return (
    <div
      className="min-h-svh overflow-x-hidden bg-[#050506] font-sans text-zinc-100 antialiased selection:bg-emerald-500/30 [background-image:radial-gradient(120%_80%_at_10%_0%,rgba(255,60,100,0.12)_0%,transparent_50%),radial-gradient(100%_60%_at_100%_20%,rgba(30,160,255,0.1)_0%,transparent_45%),radial-gradient(90%_50%_at_50%_100%,rgba(50,210,120,0.08)_0%,transparent_50%)]"
    >
      <div className="mx-auto flex w-full max-w-[430px] flex-col px-3 pt-2 sm:px-4 md:max-w-3xl md:px-6 lg:max-w-7xl lg:flex-row lg:items-start lg:gap-6 lg:px-8 lg:pt-6 xl:max-w-[1200px] xl:gap-8">
        <BottomNav
          active={tab}
          onChange={onTabChange}
          variant="rail"
        />

        <div className="flex min-w-0 flex-1 flex-col pb-28 sm:pb-24 lg:min-h-0 lg:pb-8">
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-5">
            <div className="min-w-0">
              <p className="m-0 text-[0.8rem] font-medium tracking-wide text-zinc-500">
                {greeting()}
              </p>
              <p className="m-0 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-[1.5rem]">
                {name}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <p className="m-0 max-w-[12rem] text-right text-[0.7rem] font-medium uppercase tracking-[0.1em] text-zinc-500 sm:max-w-none">
                {formatDate()}
              </p>
              <button
                type="button"
                onClick={() => setTab('profile')}
                title="Open profile"
                aria-label="Open profile"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] text-sm font-semibold text-zinc-100 transition hover:scale-105 hover:shadow-lg motion-reduce:transition-none"
              >
                {name.slice(0, 1).toUpperCase()}
              </button>
            </div>
          </header>

          {tab === 'today' && (
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
              <div className="min-w-0 flex-1 space-y-5 lg:space-y-6">
                {error && dash ? (
                  <div
                    role="alert"
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
                  >
                    <span className="min-w-0">{error}</span>
                    <button
                      type="button"
                      onClick={() => void loadDashboard({ silent: true })}
                      className="shrink-0 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-100 transition hover:bg-white/15"
                    >
                      Retry
                    </button>
                  </div>
                ) : null}

                {showTodaySkeleton ? (
                  <div className="flex min-h-[40svh] flex-col items-center justify-center gap-3 py-8 text-center">
                    <div
                      className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-emerald-400"
                      aria-hidden
                    />
                    <p className="m-0 text-sm text-zinc-500">Loading your habits…</p>
                  </div>
                ) : null}

                {showTodayError ? (
                  <div className="flex min-h-[40svh] flex-col items-center justify-center gap-4 px-2 py-8 text-center">
                    <p className="m-0 max-w-[32ch] text-sm text-zinc-400">{error}</p>
                    <button
                      type="button"
                      onClick={() => void loadDashboard()}
                      className="rounded-2xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-white/15"
                    >
                      Try again
                    </button>
                  </div>
                ) : null}

                {!showTodaySkeleton && !showTodayError && dash ? (
                  <>
                    <div
                      className={refreshing ? 'opacity-80 transition-opacity' : 'transition-opacity'}
                    >
                      <ProgressRings
                        habitsProgress={habitsP}
                        consistencyProgress={consP}
                        focusProgress={focusP}
                        completed={done}
                        total={total}
                        streak={streakDisplay}
                      />
                    </div>

                    <h2 className="m-0 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                      Today&apos;s habits
                    </h2>

                    {emptyHabits ? (
                      <div className="rounded-[22px] border border-dashed border-white/12 bg-zinc-900/40 px-4 py-10 text-center">
                        <p className="m-0 text-sm font-medium text-zinc-300">No habits yet</p>
                        <p className="mx-auto mt-2 max-w-[28ch] text-sm leading-relaxed text-zinc-500">
                          Add your first habit below. You&apos;ll see rings and streaks as you check
                          in each day.
                        </p>
                      </div>
                    ) : (
                      <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2 md:gap-4">
                        {habits.map((h) => (
                          <HabitCard
                            key={h.id}
                            habit={h}
                            onToggle={toggleHabit}
                            disabled={togglingId === h.id || refreshing}
                          />
                        ))}
                      </ul>
                    )}

                    <AddHabit
                      onAdd={addHabit}
                      busy={adding || refreshing}
                    />

                    <div className="space-y-4 lg:hidden">
                      <AIInsight />
                      <WeeklyActivity />
                    </div>
                  </>
                ) : null}
              </div>

              {!showTodaySkeleton && !showTodayError && dash ? (
                <aside className="hidden w-full max-w-sm shrink-0 flex-col gap-4 lg:flex xl:max-w-[22rem]">
                  <AIInsight />
                  <WeeklyActivity />
                </aside>
              ) : null}
            </div>
          )}

          {tab === 'stats' && (
            <TabPlaceholder
              title="Stats"
              body="Detailed analytics and history will live here. Coming soon."
            />
          )}

          {tab === 'profile' && (
            <div className="flex min-h-[45svh] flex-col items-center px-2 pb-28 pt-2 text-center sm:pb-24 lg:pb-8">
              <h1 className="m-0 text-xl font-semibold text-zinc-100">Profile</h1>
              <p className="mt-2 text-sm text-zinc-500">{user?.email}</p>
              <div className="mt-6 flex w-full max-w-[280px] flex-col gap-3">
                <Link
                  to="/"
                  className="block rounded-2xl border border-white/10 bg-zinc-900/70 px-4 py-3 text-center text-sm font-medium text-zinc-100 no-underline transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  About / Home
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-2xl border border-rose-400/35 bg-zinc-900/70 px-4 py-3 text-sm font-medium text-rose-300 transition hover:-translate-y-0.5 hover:bg-rose-500/10"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav
        active={tab}
        onChange={onTabChange}
        variant="bar"
      />
    </div>
  )
}
