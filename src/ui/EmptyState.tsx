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
          ? 'gap-2 rounded-card bg-surface px-5 py-6 ring-1 ring-line'
          : 'gap-3 rounded-card border border-dashed border-line-strong px-6 py-10',
        className,
      )}
    >
      {/* круг с розовой обводкой, как фото на афишах TechSapiens */}
      <span
        className={cn(
          'flex items-center justify-center rounded-full bg-brand-soft text-brand-strong ring-2 ring-brand ring-offset-2 ring-offset-surface',
          compact ? 'size-12' : 'size-16',
        )}
      >
        <Icon name={icon} size={compact ? 26 : 32} fill />
      </span>
      <div className={cn('font-semibold text-fg', compact ? 'text-[17px]' : 'text-[20px]')}>{title}</div>
      {text && <p className="max-w-sm text-[14px] leading-relaxed text-muted">{text}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
