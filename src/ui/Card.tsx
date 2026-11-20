import type { ComponentProps, KeyboardEvent, ReactNode } from 'react'
import { Icon } from './Icon'
import { cn } from './cn'

export type CardTone = 'default' | 'soft' | 'brand' | 'tint' | 'accent' | 'outline'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Заголовок карточки. */
  title?: ReactNode
  subtitle?: ReactNode
  /** Иконка слева от заголовка. */
  icon?: string
  /** Что-то справа от заголовка: кнопка, бейдж. */
  action?: ReactNode
  /** default — белая, soft — серая, brand — цвета бренда, tint — мягкий бренд, accent — мягкий акцент, outline — только рамка. */
  tone?: CardTone
  padding?: CardPadding
}

const tones: Record<CardTone, string> = {
  default: 'bg-surface text-fg ring-1 ring-line',
  soft: 'bg-surface-2 text-fg',
  brand: 'bg-brand text-on-brand',
  tint: 'bg-brand-soft text-fg',
  accent: 'bg-accent-soft text-fg',
  outline: 'border border-line bg-transparent text-fg',
}

const paddings: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-7',
}

/** Карточка. С onClick становится нажимаемой (и работает с клавиатуры). */
export function Card({
  title,
  subtitle,
  icon,
  action,
  tone = 'default',
  padding = 'md',
  className,
  children,
  onClick,
  onKeyDown,
  ...rest
}: CardProps) {
  const interactive = typeof onClick === 'function'
  const hasHeader = Boolean(title || subtitle || icon || action)

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (interactive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      event.currentTarget.click()
    }
  }

  return (
    <div
      className={cn(
        'relative rounded-card',
        tones[tone],
        paddings[padding],
        interactive && 'cursor-pointer transition-transform duration-150 select-none active:scale-[0.98]',
        className,
      )}
      onClick={onClick}
      onKeyDown={interactive ? handleKey : onKeyDown}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...rest}
    >
      {hasHeader && (
        <div className={cn('flex items-start gap-3', children !== undefined && 'mb-3', padding === 'none' && 'p-4 pb-0')}>
          {icon && (
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full',
                tone === 'brand' ? 'bg-white/20' : 'bg-brand-soft text-brand-strong',
              )}
            >
              <Icon name={icon} size={22} fill />
            </span>
          )}
          <div className="min-w-0 flex-1 self-center">
            {title && <div className="text-[17px] leading-snug font-semibold">{title}</div>}
            {subtitle && (
              <div className={cn('mt-0.5 text-[13px] leading-snug', tone === 'brand' ? 'opacity-80' : 'text-muted')}>
                {subtitle}
              </div>
            )}
          </div>
          {action && <div className="shrink-0 self-center">{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
