import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { cn } from './cn'

export type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger'

export interface BadgeProps {
  tone?: Tone
  /** Залитый вариант: яркий фон, контрастный текст. */
  solid?: boolean
  icon?: string
  children?: ReactNode
  className?: string
}

const soft: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted',
  brand: 'bg-brand-soft text-brand-strong',
  accent: 'bg-accent-soft text-accent-strong',
  success: 'bg-success-soft text-success-strong',
  warning: 'bg-warning-soft text-warning-strong',
  danger: 'bg-danger-soft text-danger-strong',
}

const solidTones: Record<Tone, string> = {
  neutral: 'bg-fg text-bg',
  brand: 'bg-brand text-on-brand',
  accent: 'bg-accent text-on-accent',
  success: 'bg-success text-white',
  warning: 'bg-warning text-[#1a1200]',
  danger: 'bg-danger text-white',
}

/** Метка-пилюля: статус, счётчик, тег. */
export function Badge({ tone = 'neutral', solid, icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 max-w-full items-center gap-1 rounded-full px-2.5 text-[12px] font-bold whitespace-nowrap',
        solid ? solidTones[tone] : soft[tone],
        className,
      )}
    >
      {icon && <Icon name={icon} size={14} fill />}
      {children !== undefined && <span className="truncate">{children}</span>}
    </span>
  )
}
