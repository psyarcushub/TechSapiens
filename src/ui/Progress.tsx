import { cn } from './cn'
import type { Tone } from './Badge'

export interface ProgressProps {
  value: number
  /** Сколько считать за 100%, по умолчанию 100. */
  max?: number
  tone?: Tone
  /** Подпись для экранного диктора. */
  label?: string
  className?: string
}

const fills: Record<Tone, string> = {
  neutral: 'bg-subtle',
  brand: 'bg-brand',
  accent: 'bg-[var(--accent)]',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

/** Полоска заполнения. */
export function Progress({ value, max = 100, tone = 'brand', label, className }: ProgressProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100
  const safeValue = Number.isFinite(value) ? value : 0
  const percent = Math.min(100, Math.max(0, (safeValue / safeMax) * 100))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={Math.min(safeMax, Math.max(0, safeValue))}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-2', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out-soft', fills[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
