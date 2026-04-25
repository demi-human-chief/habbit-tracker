import { type FormEvent, useState } from 'react'

type Props = {
  onAdd: (title: string) => void | Promise<void>
  busy?: boolean
}

function pickIcon(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('water') || t.includes('drink')) return '💧'
  if (t.includes('read') || t.includes('book')) return '📖'
  if (t.includes('workout') || t.includes('run') || t.includes('gym')) return '🏃'
  if (t.includes('medita')) return '🧘'
  if (t.includes('sleep')) return '🌙'
  return '✨'
}

export function AddHabit({ onAdd, busy }: Props) {
  const [val, setVal] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = val.trim()
    if (!t || busy) return
    void Promise.resolve(onAdd(t)).then(() => setVal(''))
  }
  return (
    <form
      onSubmit={submit}
      className="mb-5 flex items-stretch gap-2 rounded-[22px] border border-white/10 bg-zinc-950/80 py-1 pl-4 pr-1 backdrop-blur-xl"
    >
      <input
        className="min-w-0 flex-1 border-0 bg-transparent py-3 text-[0.95rem] text-zinc-100 outline-none placeholder:text-zinc-500 disabled:opacity-50"
        placeholder="Add a new habit…"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        maxLength={120}
        disabled={busy}
        aria-label="Add a new habit"
      />
      <button
        type="submit"
        disabled={!val.trim() || busy}
        className="shrink-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-[0.85rem] font-semibold text-zinc-100 transition hover:-translate-y-0.5 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
      >
        Add
      </button>
    </form>
  )
}

export { pickIcon }
