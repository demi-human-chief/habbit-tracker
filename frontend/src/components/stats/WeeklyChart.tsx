const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

type Props = {
  values: number[]
}

export function WeeklyChart({ values }: Props) {
  const safe = DAYS.map((_, i) => Math.max(0, values[i] ?? 0))
  const max = Math.max(1, ...safe)

  return (
    <article className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl">
      <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        Weekly activity
      </p>
      <div className="mt-4 flex h-28 items-end justify-between gap-1.5 sm:h-32">
        {DAYS.map((day, i) => {
          const value = safe[i]
          const h = Math.max(8, Math.round((value / max) * 100))
          return (
            <div
              key={day}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
            >
              <div
                className="w-full rounded-t-lg bg-gradient-to-b from-[#5ed0ff] to-[#147ec8] shadow-[0_0_20px_rgba(10,127,212,0.2)]"
                style={{ height: `${h}%` }}
                title={`${day}: ${value}`}
              />
              <span className="mt-2 text-[0.62rem] font-medium uppercase tracking-wide text-zinc-500">
                {day}
              </span>
            </div>
          )
        })}
      </div>
    </article>
  )
}
