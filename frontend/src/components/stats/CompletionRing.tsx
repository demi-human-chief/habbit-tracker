import { useMemo } from 'react'

type Props = {
  percent: number
}

const SIZE = 180
const CENTER = SIZE / 2
const R = 64
const STROKE = 12

export function CompletionRing({ percent }: Props) {
  const p = Math.max(0, Math.min(100, percent))
  const c = useMemo(() => 2 * Math.PI * R, [])
  const offset = c * (1 - p / 100)

  return (
    <article className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl">
      <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        Completion rate
      </p>
      <div className="mt-3 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-44 w-44"
          aria-hidden
        >
          <defs>
            <linearGradient
              id="statsCompletionGrad"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#4aee98"
              />
              <stop
                offset="100%"
                stopColor="#1fa85e"
              />
            </linearGradient>
          </defs>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={R}
            fill="none"
            className="stroke-white/10"
            strokeWidth={STROKE}
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={R}
            fill="none"
            stroke="url(#statsCompletionGrad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
          <text
            x={CENTER}
            y={CENTER + 6}
            textAnchor="middle"
            className="fill-zinc-100 text-[1.15rem] font-semibold"
          >
            {`${Math.round(p)}%`}
          </text>
        </svg>
      </div>
      <p className="m-0 text-center text-sm text-zinc-400">{`${Math.round(p)}% completion rate`}</p>
    </article>
  )
}
