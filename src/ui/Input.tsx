import { useId } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { Icon } from './Icon'
import { cn } from './cn'

export interface InputProps extends ComponentProps<'input'> {
  label?: ReactNode
  /** Подсказка под полем. */
  hint?: ReactNode
  /** Текст ошибки под полем, поле краснеет. */
  error?: ReactNode
  /** Иконка внутри поля слева. */
  icon?: string
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[14px] font-semibold text-fg">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[13px] text-danger-strong">{error}</p>
      ) : (
        hint && <p className="text-[13px] text-muted">{hint}</p>
      )}
    </div>
  )
}

export const fieldClass =
  'w-full rounded-control border bg-surface px-4 text-[16px] text-fg placeholder:text-subtle transition-[border-color,box-shadow] outline-none focus:border-brand focus:ring-3 focus:ring-brand/20 disabled:opacity-60'

/** Однострочное поле ввода с подписью. Шрифт 16px, чтобы iPhone не увеличивал страницу. */
export function Input({ label, hint, error, icon, id, className, ...rest }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <Field id={inputId} label={label} hint={hint} error={error}>
      <div className="relative">
        {icon && (
          <Icon name={icon} size={20} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle" />
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(fieldClass, 'h-12', icon && 'pl-11', error ? 'border-danger' : 'border-line-strong', className)}
          {...rest}
        />
      </div>
    </Field>
  )
}
