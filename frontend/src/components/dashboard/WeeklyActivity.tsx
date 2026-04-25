type Props = {
  values: { day: string; completed_count: number }[]
}

export function WeeklyActivity({ values }: Props) {
  const safe = values.length === 7 ? values : []
  const max = Math.max(0, ...safe.map((v) => v.completed_count))
  return (
    <div className="rounded-[22px] border border-white/10 bg-zinc-950/80 px-4 pb-5 pt-4 backdrop-blur-xl">
      <h3 className="m-0 mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        Weekly activity
      </h3>
      <div
        className="flex h-[5.5rem] items-end justify-between gap-1 px-0.5 sm:h-24 md:h-28"
        role="img"
        aria-label="Last 7 days activity"
      >
        {(safe.length ? safe : Array.from({ length: 7 }, (_, i) => ({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], completed_count: 0 }))).map((item) => {
          const raw = item.completed_count
          const h = max > 0 ? raw / max : 0
          const minHeight = max === 0 ? 10 : 0
          return (
            <div
              key={item.day}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
            >
              <div
                className="mb-1.5 w-full max-w-[2rem] rounded-t-lg rounded-b-sm bg-gradient-to-b from-[#3fe08b] to-[#1a7a3e] opacity-90 shadow-[0_0_20px_rgba(47,208,114,0.15)] transition hover:opacity-100 motion-reduce:transition-none sm:max-w-[2.25rem] md:max-w-8"
                style={{ height: `${Math.max(minHeight, Math.min(1, h) * 100)}%` }}
                title={`${item.day}: ${raw}`}
              />
              <span className="text-[0.6rem] font-medium uppercase tracking-wide text-zinc-500">
                {item.day}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
