import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { cn } from './cn'

export interface ListProps {
  children?: ReactNode
  className?: string
}

/** Список строк на общей подложке с разделителями. Внутри — ListItem. */
export function List({ children, className }: ListProps) {
  return (
    <div
      role="list"
      className={cn(
        'divide-y divide-line overflow-hidden rounded-card bg-surface shadow-card ring-1 ring-line/70',
        className,
      )}
    >
      {children}
    </div>
  )
}

export interface ListItemProps {
  title: ReactNode
  subtitle?: ReactNode
  /** Иконка слева. */
  icon?: string
  /** Что-то слева вместо иконки, например <Avatar />. */
  leading?: ReactNode
  /** Что-то справа: бейдж, переключатель, число. */
  trailing?: ReactNode
  /** Стрелка справа, как у ссылки. */
  chevron?: boolean
  onClick?: () => void
  className?: string
}

export function ListItem({ title, subtitle, icon, leading, trailing, chevron, onClick, className }: ListItemProps) {
  const content = (
    <>
      {leading ??
        (icon && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-soft text-brand-strong">
            <Icon name={icon} size={22} />
          </span>
        ))}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] leading-snug font-semibold text-fg">{title}</span>
        {subtitle && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{subtitle}</span>}
      </span>
      {trailing && <span className="shrink-0 text-[14px] text-muted">{trailing}</span>}
      {chevron && <Icon name="chevron_right" size={22} className="shrink-0 text-subtle" />}
    </>
  )
  const base = 'flex w-full min-h-14 items-center gap-3 px-4 py-3 text-left'
  if (onClick) {
    return (
      <div role="listitem">
        <button
          type="button"
          onClick={onClick}
          className={cn(base, 'transition-colors hover:bg-surface-2 active:bg-surface-3', className)}
        >
          {content}
        </button>
      </div>
    )
  }
  return (
    <div role="listitem" className={cn(base, className)}>
      {content}
    </div>
  )
}
