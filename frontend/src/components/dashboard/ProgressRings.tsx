import { useMemo } from 'react'

type Props = {
  habitsProgress: number
  consistencyProgress: number
  focusProgress: number
  completed: number
  total: number
  streak: number
}

const SIZE = 220
const CENTER = SIZE / 2
const R = { habit: 88, cons: 72, focus: 56 }
const W = { habit: 12, cons: 10, focus: 8 }

function RingSet({
  r,
  w,
  progress,
  gradId,
}: {
  r: number
  w: number
  progress: number
  gradId: string
}) {
  const c = useMemo(() => 2 * Math.PI * r, [r])
  const p = Math.max(0, Math.min(1, progress))
  const offset = c * (1 - p)
  return (
    <>
      <circle
        cx={CENTER}
        cy={CENTER}
        r={r}
        fill="none"
        className="stroke-white/10"
        strokeWidth={w}
        strokeLinecap="round"
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={r}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={w}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
        className="motion-reduce:transition-none"
        style={{
          transition: 'stroke-dashoffset 0.88s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </>
  )
}

export function ProgressRings({
  habitsProgress,
  consistencyProgress,
  focusProgress,
  completed,
  total,
  streak,
}: Props) {
  return (
    <div className="text-center">
      <div className="mx-auto flex w-full max-w-[180px] justify-center drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[280px] xl:max-w-[300px]">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="aspect-square h-auto w-full"
          aria-hidden
        >
          <defs>
            <linearGradient
              id="gHabit"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#ff6b86"
              />
              <stop
                offset="100%"
                stopColor="#e81d3d"
              />
            </linearGradient>
            <linearGradient
              id="gCons"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor="#4aee98"
              />
              <stop
                offset="100%"
                stopColor="#2bc65f"
              />
            </linearGradient>
            <linearGradient
              id="gFocus"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#5ed0ff"
              />
              <stop
                offset="100%"
                stopColor="#0a7fd4"
              />
            </linearGradient>
          </defs>
          <RingSet
            r={R.habit}
            w={W.habit}
            progress={habitsProgress}
            gradId="gHabit"
          />
          <RingSet
            r={R.cons}
            w={W.cons}
            progress={consistencyProgress}
            gradId="gCons"
          />
          <RingSet
            r={R.focus}
            w={W.focus}
            progress={focusProgress}
            gradId="gFocus"
          />
        </svg>
      </div>
      <ul className="mb-2 mt-3 flex list-none flex-wrap justify-center gap-x-4 gap-y-2 px-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        <li className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"
            style={{ background: 'linear-gradient(135deg,#ff6b86,#e81d3d)' }}
          />
          Habits
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"
            style={{ background: 'linear-gradient(90deg,#4aee98,#2bc65f)' }}
          />
          Consistency
        </li>
        <li className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"
            style={{ background: 'linear-gradient(180deg,#5ed0ff,#0a7fd4)' }}
          />
          Focus
        </li>
      </ul>
      <p className="mb-1 text-sm text-zinc-500">
        <span className="font-semibold text-zinc-100">
          {completed} of {total} habits
        </span>
        <span> completed today</span>
      </p>
      <p className="m-0 text-sm tracking-wide text-zinc-200">🔥 {streak} day streak</p>
    </div>
  )
}
