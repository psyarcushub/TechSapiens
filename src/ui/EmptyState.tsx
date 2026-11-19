import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { cn } from './cn'

export interface EmptyStateProps {
  icon?: string
  title: ReactNode
  text?: ReactNode
  /** Кнопка под текстом. */
  action?: ReactNode
  /** Компактный вариант для блока внутри страницы. */
  compact?: boolean
  className?: string
}

/** Пустое место с объяснением: «пока ничего нет, вот что будет». */
export function EmptyState({ icon = 'wand_stars', title, text, action, compact, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center text-center',
        compact
          ? 'gap-2 rounded-card bg-surface px-5 py-6 ring-1 ring-line/70'
          : 'gap-3 rounded-card border border-dashed border-line px-6 py-10',
        className,
      )}
    >
      <span className={cn('relative flex items-center justify-center', compact ? 'size-12' : 'size-16')}>
        <span className="absolute inset-0 rotate-6 rounded-[20px] bg-accent-soft" aria-hidden />
        <span className="absolute inset-0 -rotate-6 rounded-[20px] bg-brand-soft" aria-hidden />
        <Icon name={icon} size={compact ? 26 : 32} className="relative text-brand-strong" fill />
      </span>
      <div className={cn('font-extrabold text-fg', compact ? 'text-[16px]' : 'text-[18px]')}>{title}</div>
      {text && <p className="max-w-sm text-[14px] leading-relaxed text-muted">{text}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
