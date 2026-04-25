import type { HabitStat } from '../../lib/stats-api'

type Props = {
  habits: HabitStat[]
}

export function HabitStatsList({ habits }: Props) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl">
      <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        Habit performance
      </p>
      <ul className="m-0 mt-3 list-none space-y-2 p-0">
        {habits.map((h) => (
          <li
            key={h.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="m-0 truncate text-sm font-semibold text-zinc-100">{h.title}</p>
              <p className="m-0 mt-0.5 text-xs text-zinc-500">{`${h.missed_count} missed in 30d`}</p>
            </div>
            <span className="shrink-0 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
              {`${h.completion_rate}%`}
            </span>
          </li>
        ))}
      </ul>
    </article>
  )
}
