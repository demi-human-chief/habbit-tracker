import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '../components/dashboard/BottomNav'
import type { BottomTab } from '../components/dashboard/types'
import { CompletionRing } from '../components/stats/CompletionRing'
import { HabitStatsList } from '../components/stats/HabitStatsList'
import { Heatmap } from '../components/stats/Heatmap'
import { StreakCard } from '../components/stats/StreakCard'
import { WeeklyChart } from '../components/stats/WeeklyChart'
import { ApiError } from '../lib/api'
import { useAuth } from '../lib/auth-context'
import { getHabitStats, getStatsOverview, type HabitStat, type StatsOverview } from '../lib/stats-api'

export function StatsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canSeeAdmin = Boolean(user?.is_admin)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<StatsOverview | null>(null)
  const [habitStats, setHabitStats] = useState<HabitStat[]>([])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const [ov, hs] = await Promise.all([getStatsOverview(), getHabitStats()])
        if (!cancelled) {
          setOverview(ov)
          setHabitStats(hs)
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof ApiError ? e.message : 'Failed to load stats'
          setError(msg)
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

  const empty = useMemo(() => {
    if (!overview) return false
    const hasAnyWeekly = overview.weekly.some((v) => v > 0)
    const hasAnyHeat = overview.heatmap.some((p) => p.count > 0)
    return !hasAnyWeekly && !hasAnyHeat && habitStats.length === 0
  }, [overview, habitStats])

  const onTab = (tab: BottomTab) => {
    if (tab === 'today') navigate('/app')
    else if (tab === 'coach') navigate('/app/ai')
    else if (tab === 'stats') navigate('/app/stats')
    else if (tab === 'admin' && canSeeAdmin) navigate('/app/admin/analytics')
    else navigate('/app')
  }

  return (
    <div className="min-h-svh overflow-x-hidden bg-[#050506] font-sans text-zinc-100 antialiased selection:bg-emerald-500/30 [background-image:radial-gradient(120%_80%_at_10%_0%,rgba(255,60,100,0.12)_0%,transparent_50%),radial-gradient(100%_60%_at_100%_20%,rgba(30,160,255,0.1)_0%,transparent_45%),radial-gradient(90%_50%_at_50%_100%,rgba(50,210,120,0.08)_0%,transparent_50%)]">
      <div className="mx-auto flex w-full max-w-[430px] flex-col px-3 pt-2 sm:px-4 md:max-w-3xl md:px-6 lg:max-w-7xl lg:flex-row lg:items-start lg:gap-6 lg:px-8 lg:pt-6">
        <BottomNav
          active="stats"
          onChange={onTab}
          variant="rail"
          showAdmin={canSeeAdmin}
        />

        <main className="flex min-w-0 flex-1 flex-col gap-4 pb-28 sm:pb-24 lg:pb-8">
          <header className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-5 shadow-xl shadow-black/30 backdrop-blur-xl">
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-zinc-100">Your Progress</h1>
          </header>

          {loading ? (
            <div className="flex min-h-[45svh] items-center justify-center">
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-emerald-400"
                aria-hidden
              />
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {!loading && !error && overview && empty ? (
            <div className="rounded-[22px] border border-dashed border-white/12 bg-zinc-900/40 px-4 py-10 text-center">
              <p className="m-0 text-sm font-medium text-zinc-300">No data yet</p>
              <p className="mx-auto mt-2 max-w-[30ch] text-sm leading-relaxed text-zinc-500">
                Complete a few habits to unlock streaks, charts, and performance insights.
              </p>
            </div>
          ) : null}

          {!loading && !error && overview && !empty ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
                <StreakCard
                  label="Current streak"
                  value={overview.current_streak}
                  icon="🔥"
                />
                <StreakCard
                  label="Best streak"
                  value={overview.best_streak}
                  icon="🏆"
                />
              </div>

              <CompletionRing percent={overview.completion_rate} />
              <WeeklyChart values={overview.weekly} />

              <div className="lg:col-span-2">
                <Heatmap points={overview.heatmap} />
              </div>

              <div className="lg:col-span-2">
                <HabitStatsList habits={habitStats} />
              </div>
            </div>
          ) : null}
        </main>
      </div>

      <BottomNav
        active="stats"
        onChange={onTab}
        variant="bar"
        showAdmin={canSeeAdmin}
      />
    </div>
  )
}
