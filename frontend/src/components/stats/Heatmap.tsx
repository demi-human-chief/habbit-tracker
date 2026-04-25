import type { HeatmapPoint } from '../../lib/stats-api'

type Props = {
  points: HeatmapPoint[]
}

function colorClass(count: number): string {
  if (count <= 0) return 'bg-zinc-800/80'
  if (count <= 2) return 'bg-emerald-700/70'
  return 'bg-emerald-400/90'
}

export function Heatmap({ points }: Props) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl">
      <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        Last 30 days heatmap
      </p>
      <div className="mt-4 grid grid-cols-10 gap-1.5 sm:grid-cols-15">
        {points.map((p) => (
          <div
            key={p.date}
            title={`${p.date}: ${p.count}`}
            className={`h-4 w-4 rounded-[4px] border border-white/5 ${colorClass(p.count)}`}
          />
        ))}
      </div>
    </article>
  )
}
