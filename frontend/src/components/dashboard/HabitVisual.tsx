export type ShapeName = 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon'

export type IconOption = {
  shape: ShapeName
  color: string
  label: string
}

export const ICON_OPTIONS: IconOption[] = [
  { shape: 'circle', color: 'red', label: 'Circle red' },
  { shape: 'circle', color: 'green', label: 'Circle green' },
  { shape: 'circle', color: 'blue', label: 'Circle blue' },
  { shape: 'square', color: 'purple', label: 'Square purple' },
  { shape: 'square', color: 'orange', label: 'Square orange' },
  { shape: 'triangle', color: 'yellow', label: 'Triangle yellow' },
  { shape: 'diamond', color: 'cyan', label: 'Diamond cyan' },
  { shape: 'hexagon', color: 'pink', label: 'Hexagon pink' },
]

const COLOR_MAP: Record<string, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  orange: '#f97316',
  yellow: '#eab308',
  cyan: '#06b6d4',
  pink: '#ec4899',
}

export function colorToHex(color?: string | null): string {
  if (!color) return '#64748b'
  return COLOR_MAP[color] ?? color
}

export function ShapeIcon({
  shape,
  color,
  className = '',
}: {
  shape?: string | null
  color?: string | null
  className?: string
}) {
  const fill = colorToHex(color)
  const s = (shape || 'circle') as ShapeName
  const clipPath =
    s === 'triangle'
      ? 'polygon(50% 8%, 92% 88%, 8% 88%)'
      : s === 'diamond'
        ? 'polygon(50% 4%, 96% 50%, 50% 96%, 4% 50%)'
        : s === 'hexagon'
          ? 'polygon(25% 8%, 75% 8%, 96% 50%, 75% 92%, 25% 92%, 4% 50%)'
          : undefined

  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center ${className}`}
      aria-hidden
    >
      <span
        className={
          s === 'circle'
            ? 'h-5 w-5 rounded-full'
            : s === 'square'
              ? 'h-5 w-5 rounded-[4px]'
              : 'h-5 w-5'
        }
        style={{
          backgroundColor: fill,
          clipPath,
        }}
      />
    </span>
  )
}
