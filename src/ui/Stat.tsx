import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { cn } from './cn'
import type { Tone } from './Badge'

export interface StatProps {
  /** Подпись под числом. */
  label: ReactNode
  /** Само число или короткое значение. */
  value: ReactNode
  icon?: string
  /** Мелкий текст под подписью: «+12 за час». */
  hint?: ReactNode
  tone?: Tone
  className?: string
}

const iconTones: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted',
  brand: 'bg-brand-soft text-brand-strong',
  accent: 'bg-accent-soft text-accent-strong',
  success: 'bg-success-soft text-success-strong',
  warning: 'bg-warning-soft text-warning-strong',
  danger: 'bg-danger-soft text-danger-strong',
}

/** Плитка с крупным числом. */
export function Stat({ label, value, icon, hint, tone = 'brand', className }: StatProps) {
  return (
    <div className={cn('flex min-w-0 flex-col rounded-card bg-surface p-4 shadow-card ring-1 ring-line/70', className)}>
      {icon && (
        <span className={cn('mb-3 flex size-9 items-center justify-center rounded-[11px]', iconTones[tone])}>
          <Icon name={icon} size={20} fill />
        </span>
      )}
      <div className="truncate text-[26px] leading-none font-extrabold tracking-tight text-fg tabular-nums">{value}</div>
      <div className="mt-1.5 text-[13px] leading-snug text-muted">{label}</div>
      {hint && <div className="mt-1 text-[12px] leading-snug text-subtle">{hint}</div>}
    </div>
  )
}
