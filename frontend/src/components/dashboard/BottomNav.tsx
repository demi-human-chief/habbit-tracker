import type { BottomTab } from './types'

const TABS: { id: BottomTab; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '◎' },
  { id: 'stats', label: 'Stats', icon: '▣' },
  { id: 'coach', label: 'AI Coach', icon: '✦' },
  { id: 'admin', label: 'Admin', icon: '⌘' },
  { id: 'profile', label: 'Profile', icon: '⍟' },
]

type Props = {
  active: BottomTab
  onChange: (tab: BottomTab) => void
  variant: 'bar' | 'rail'
  showAdmin?: boolean
}

function TabButton({
  t,
  active,
  onChange,
  compact,
  showLabel,
}: {
  t: (typeof TABS)[number]
  active: BottomTab
  onChange: (tab: BottomTab) => void
  compact: boolean
  showLabel: boolean
}) {
  const selected = active === t.id
  return (
    <button
      type="button"
      aria-label={t.label}
      aria-current={selected ? 'page' : undefined}
      title={t.label}
      onClick={() => onChange(t.id)}
      className={[
        'flex flex-col items-center justify-center gap-0.5 rounded-2xl font-semibold uppercase tracking-wide text-zinc-500 transition hover:text-zinc-200 motion-reduce:transition-none',
        compact
          ? 'min-h-[52px] flex-1 max-w-[5.5rem] px-1 py-2 text-[0.55rem]'
          : 'w-full px-1 py-3 text-[0.55rem]',
        selected
          ? 'bg-white/10 text-zinc-100 shadow-inner shadow-white/5'
          : 'bg-transparent',
      ].join(' ')}
    >
      <span
        className={compact ? 'text-lg leading-none' : 'text-xl leading-none'}
        aria-hidden
      >
        {t.icon}
      </span>
      {showLabel && compact ? (
        <span className="text-center text-[0.58rem] leading-tight text-current">{t.label}</span>
      ) : null}
    </button>
  )
}

export function BottomNav({ active, onChange, variant, showAdmin = false }: Props) {
  const visibleTabs = showAdmin ? TABS : TABS.filter((t) => t.id !== 'admin')
  if (variant === 'rail') {
    return (
      <nav
        aria-label="Main"
        className="sticky top-4 z-40 hidden w-16 shrink-0 flex-col items-stretch gap-1 self-start rounded-3xl border border-white/10 bg-zinc-950/70 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl lg:flex xl:w-[4.5rem]"
      >
        {visibleTabs.map((t) => (
          <TabButton
            key={t.id}
            t={t}
            active={active}
            onChange={onChange}
            compact={false}
            showLabel={false}
          />
        ))}
      </nav>
    )
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
    >
      <div className="mx-auto flex max-w-[430px] items-stretch justify-around gap-1 rounded-3xl border border-white/10 bg-zinc-950/85 px-1 py-1.5 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:max-w-2xl md:max-w-3xl">
        {visibleTabs.map((t) => (
          <TabButton
            key={t.id}
            t={t}
            active={active}
            onChange={onChange}
            compact
            showLabel
          />
        ))}
      </div>
    </nav>
  )
}
