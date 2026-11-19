import type { ComponentProps, ReactNode } from 'react'
import { Icon } from './Icon'
import { cn } from './cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Иконка слева. */
  icon?: string
  /** Иконка справа. */
  iconRight?: string
  /** Во всю ширину. */
  block?: boolean
  /** Крутилка вместо иконки и блокировка нажатий. */
  loading?: boolean
  children?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand shadow-card hover:brightness-105',
  secondary: 'bg-brand-soft text-brand-strong hover:brightness-[0.97]',
  outline: 'border border-line bg-surface text-fg hover:bg-surface-2',
  ghost: 'bg-transparent text-fg hover:bg-surface-2',
  danger: 'bg-danger text-white shadow-card hover:brightness-105',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 gap-1.5 rounded-[12px] px-3.5 text-[14px]',
  md: 'h-11 gap-2 rounded-[14px] px-5 text-[15px]',
  lg: 'h-13 gap-2.5 rounded-[16px] px-6 text-[16px]',
}

const iconOnly: Record<ButtonSize, string> = {
  sm: 'w-9 px-0',
  md: 'w-11 px-0',
  lg: 'w-13 px-0',
}

const iconSizes: Record<ButtonSize, number> = { sm: 18, md: 20, lg: 22 }

/** Кнопка. Без текста (только icon) обязательно передайте aria-label. */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  block = false,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const hasText = children !== undefined && children !== null && children !== false
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center font-bold whitespace-nowrap',
        'transition-[transform,filter,background-color] duration-150 active:scale-[0.97]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        variants[variant],
        sizes[size],
        !hasText && iconOnly[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Icon name="progress_activity" size={iconSizes[size]} className="animate-spin" />
      ) : (
        icon && <Icon name={icon} size={iconSizes[size]} />
      )}
      {hasText && <span className="truncate">{children}</span>}
      {iconRight && !loading && <Icon name={iconRight} size={iconSizes[size]} />}
    </button>
  )
}
