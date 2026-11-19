import { useId } from 'react'
import type { ReactNode } from 'react'
import { cn } from './cn'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Подпись слева от переключателя. */
  label?: ReactNode
  /** Пояснение под подписью. */
  description?: ReactNode
  disabled?: boolean
  className?: string
}

/** Переключатель «вкл/выкл». С label становится строкой «подпись — переключатель». */
export function Toggle({ checked, onChange, label, description, disabled, className }: ToggleProps) {
  const id = useId()
  const knob = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-[30px] w-[50px] shrink-0 items-center rounded-full transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-brand' : 'bg-surface-3',
      )}
    >
      <span
        className={cn(
          'absolute top-[3px] left-[3px] size-6 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]',
          'transition-transform duration-200 ease-spring',
          checked && 'translate-x-5',
        )}
      />
    </button>
  )
  if (!label) return <span className={className}>{knob}</span>
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span className="block text-[15px] leading-snug font-semibold text-fg">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{description}</span>}
      </label>
      {knob}
    </div>
  )
}
