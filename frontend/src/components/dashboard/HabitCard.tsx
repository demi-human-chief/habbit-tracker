import type { DashboardHabit } from './types'
import { ShapeIcon } from './HabitVisual'

type Props = {
  habit: DashboardHabit
  onToggle: (id: string) => void | Promise<void>
  disabled?: boolean
}

export function HabitCard({ habit, onToggle, disabled }: Props) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-[22px] border border-white/10 bg-zinc-900/70 p-3 shadow-lg shadow-black/25 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-xl motion-reduce:transition-none sm:gap-3 sm:p-4 md:min-h-[5.5rem]">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-xl"
          aria-hidden
        >
          {habit.iconShape ? (
            <ShapeIcon
              shape={habit.iconShape}
              color={habit.iconColor}
            />
          ) : (
            habit.icon
          )}
        </span>
        <div className="min-w-0">
          <h2 className="m-0 text-[1.02rem] font-semibold tracking-tight text-zinc-100">
            {habit.title}
          </h2>
          {habit.description ? (
            <p className="mt-1 text-[0.8rem] leading-snug text-zinc-500">{habit.description}</p>
          ) : null}
          <span
            className={
              habit.completed
                ? 'mt-2 inline-block text-[0.7rem] font-semibold uppercase tracking-widest text-emerald-400'
                : 'mt-2 inline-block text-[0.7rem] font-semibold uppercase tracking-widest text-zinc-500'
            }
          >
            {habit.completed ? 'Done' : 'Pending'}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="rounded-lg bg-black/30 px-2 py-0.5 text-[0.65rem] text-zinc-500">
          {habit.completed ? 'Today' : 'Not yet'}
        </span>
        <button
          type="button"
          aria-pressed={habit.completed}
          disabled={disabled}
          onClick={() => void onToggle(habit.id)}
          className="rounded-full bg-gradient-to-br from-[#4ae088] to-[#2fd072] px-4 py-2 text-[0.8rem] font-semibold text-[#051208] shadow-[0_6px_20px_rgba(47,208,114,0.35)] transition hover:scale-[1.03] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
        >
          {habit.completed ? 'Undo' : 'Done'}
        </button>
      </div>
    </li>
  )
}
