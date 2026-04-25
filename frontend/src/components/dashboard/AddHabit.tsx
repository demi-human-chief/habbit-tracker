import { type FormEvent, useState } from 'react'
import { ICON_OPTIONS, ShapeIcon, type ShapeName } from './HabitVisual'

type Props = {
  onAdd: (payload: {
    title: string
    iconShape?: string | null
    iconColor?: string | null
    icon?: string | null
  }) => void | Promise<void>
  busy?: boolean
}

export function pickIcon(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('water') || t.includes('drink')) return '💧'
  if (t.includes('read') || t.includes('book')) return '📖'
  if (t.includes('workout') || t.includes('run') || t.includes('gym')) return '🏃'
  if (t.includes('medita')) return '🧘'
  if (t.includes('sleep')) return '🌙'
  return '✨'
}

const STARTER_HABITS = [
  'Drink water',
  'Read 20 minutes',
  'Morning workout',
  'Meditation',
  'Walk 10,000 steps',
  'Sleep before 23:00',
  'Study',
  'No sugar',
  'Journaling',
  'Stretching',
]

export function AddHabit({ onAdd, busy }: Props) {
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState('')
  const [iconShape, setIconShape] = useState<ShapeName>('circle')
  const [iconColor, setIconColor] = useState<string>('green')

  const addStarter = (title: string) => {
    if (busy) return
    void Promise.resolve(
      onAdd({
        title,
        icon: pickIcon(title),
      })
    ).then(() => {
      setOpen(false)
      setVal('')
    })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = val.trim()
    if (!t || busy) return
    void Promise.resolve(
      onAdd({
        title: t,
        iconShape,
        iconColor,
      })
    ).then(() => {
      setVal('')
      setOpen(false)
    })
  }
  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-[22px] border border-white/10 bg-zinc-950/80 px-4 py-3 text-left text-[0.95rem] font-semibold text-zinc-100 transition hover:bg-white/5"
      >
        + Add habit
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 p-3 sm:items-center">
          <form
            onSubmit={submit}
            className="w-full max-w-lg rounded-[24px] border border-white/10 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="m-0 text-base font-semibold text-zinc-100">Add Habit</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <p className="m-0 mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Choose a starter habit
            </p>
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STARTER_HABITS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => addStarter(h)}
                  disabled={busy}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-xs text-zinc-200 transition hover:bg-white/[0.09] disabled:opacity-50"
                >
                  {h}
                </button>
              ))}
            </div>

            <p className="m-0 mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Custom habit
            </p>
            <input
              className="mb-3 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-emerald-400/40"
              placeholder="Title"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              maxLength={120}
              disabled={busy}
              aria-label="Habit title"
            />

            <p className="m-0 mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Icon
            </p>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map((opt) => {
                const selected = iconShape === opt.shape && iconColor === opt.color
                return (
                  <button
                    key={`${opt.shape}-${opt.color}`}
                    type="button"
                    onClick={() => {
                      setIconShape(opt.shape)
                      setIconColor(opt.color)
                    }}
                    className={`rounded-xl border px-2 py-2 transition ${
                      selected
                        ? 'border-emerald-400/60 bg-emerald-500/10'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'
                    }`}
                    title={opt.label}
                  >
                    <span className="flex items-center justify-center">
                      <ShapeIcon
                        shape={opt.shape}
                        color={opt.color}
                      />
                    </span>
                  </button>
                )
              })}
            </div>

            <button
              type="submit"
              disabled={!val.trim() || busy}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Create habit
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
