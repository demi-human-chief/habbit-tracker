type Props = {
  label: string
  value: number
  icon: string
}

export function StreakCard({ label, value, icon }: Props) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-zinc-900/70 p-4 shadow-lg shadow-black/30 backdrop-blur-xl">
      <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>
      <p className="m-0 mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
        <span className="mr-1">{icon}</span>
        {value} days
      </p>
    </article>
  )
}
