import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { cn } from './cn'

export interface TabItem<T extends string = string> {
  id: T
  label: ReactNode
  icon?: string
}

export interface TabsProps<T extends string = string> {
  items: readonly TabItem<T>[]
  /** id выбранной вкладки. */
  value: T
  onChange: (id: T) => void
  className?: string
}

/** Переключатель вкладок. Содержимое под ним рисуете сами по value. */
export function Tabs<T extends string = string>({ items, value, onChange, className }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn('scrollbar-none flex gap-1 overflow-x-auto rounded-[16px] bg-surface-2 p-1', className)}
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'flex h-10 min-w-fit flex-1 items-center justify-center gap-1.5 rounded-[12px] px-3.5 text-[14px] font-semibold whitespace-nowrap',
              'transition-[background-color,color,box-shadow] duration-200',
              active ? 'bg-surface text-fg shadow-card' : 'text-muted hover:text-fg',
            )}
          >
            {item.icon && <Icon name={item.icon} size={18} fill={active} />}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
