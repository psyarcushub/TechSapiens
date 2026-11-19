import { useId } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { Field, fieldClass } from './Input'
import { cn } from './cn'

export interface TextareaProps extends ComponentProps<'textarea'> {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
}

/** Многострочное поле ввода с подписью. */
export function Textarea({ label, hint, error, id, rows = 4, className, ...rest }: TextareaProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <Field id={inputId} label={label} hint={hint} error={error}>
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(fieldClass, 'min-h-24 resize-y py-3 leading-relaxed', error ? 'border-danger' : 'border-line', className)}
        {...rest}
      />
    </Field>
  )
}
