import type { ReactNode } from 'react'
import { cn } from './cn'

export interface SectionProps {
  title?: ReactNode
  subtitle?: ReactNode
  /** Что-то справа от заголовка, например кнопка «Все». */
  action?: ReactNode
  children?: ReactNode
  className?: string
}

/** Раздел страницы с заголовком. Заголовок самой страницы рисует оболочка. */
export function Section({ title, subtitle, action, children, className }: SectionProps) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      {(title || action) && (
        <div className="flex items-end gap-3 px-1">
          <div className="min-w-0 flex-1">
            {title && <h2 className="text-[19px] leading-tight font-extrabold tracking-tight text-fg">{title}</h2>}
            {subtitle && <p className="mt-1 text-[14px] leading-snug text-muted">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
