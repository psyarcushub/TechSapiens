import { cn } from './cn'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps {
  /** Имя человека: из него берутся буквы и цвет. */
  name: string
  size?: AvatarSize | number
  /** Свой цвет фона вместо выбранного по имени. */
  color?: string
  /** Белая обводка, удобно для стопки аватаров. */
  ring?: boolean
  className?: string
}

const SIZES: Record<AvatarSize, number> = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 }

const COLORS = ['#5b5bd6', '#c2298a', '#d13438', '#c8510b', '#218358', '#0b6fc9', '#8145b5', '#0d7f74', '#93603f', '#3451c4']

function hash(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Буквы имени: «Аня Смирнова» → «АС», «Гермес» → «Г». */
export function initials(name: string): string {
  const words = name
    .trim()
    .split(/[\s_\-.]+/)
    .filter(Boolean)
  if (words.length === 0) return '?'
  const letters = words.length === 1 ? [...words[0]].slice(0, 1) : [[...words[0]][0], [...words[1]][0]]
  return letters.join('').toUpperCase()
}

/** Кружок с буквами имени; цвет зависит от имени и не меняется. */
export function Avatar({ name, size = 'md', color, ring, className }: AvatarProps) {
  const px = typeof size === 'number' ? size : SIZES[size]
  const bg = color ?? COLORS[hash(name) % COLORS.length]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-extrabold text-white',
        ring && 'ring-2 ring-surface',
        className,
      )}
      style={{ width: px, height: px, background: bg, fontSize: Math.max(10, Math.round(px * 0.38)) }}
      title={name}
      aria-label={name}
      role="img"
    >
      {initials(name)}
    </span>
  )
}
