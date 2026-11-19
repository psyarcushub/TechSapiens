import type { CSSProperties } from 'react'
import { ICON_NAMES } from './icons/names'
import { cn } from './cn'

export interface IconProps {
  /** Имя Material Symbols в snake_case: 'rocket_launch', 'favorite', 'chat'. */
  name: string
  /** Размер в пикселях, по умолчанию 24. */
  size?: number
  /** Залитая версия иконки. */
  fill?: boolean
  className?: string
  /** Подпись для экранного диктора; без неё иконка считается украшением. */
  label?: string
  style?: CSSProperties
}

const FALLBACK = 'star'
const warned = new Set<string>()

/** Приводит имя к виду Material Symbols; неизвестное имя заменяется звёздочкой. */
export function iconName(name: unknown): string {
  if (typeof name !== 'string') return FALLBACK
  const normalized = name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
  if (ICON_NAMES.has(normalized)) return normalized
  if (!warned.has(normalized)) {
    warned.add(normalized)
    console.warn(`[Icon] нет иконки «${name}», показываю «${FALLBACK}»`)
  }
  return FALLBACK
}

export function isIconName(name: string): boolean {
  return ICON_NAMES.has(name)
}

export function Icon({ name, size = 24, fill = false, className, label, style }: IconProps) {
  return (
    <span
      className={cn('ms-icon', className)}
      data-fill={fill ? 'true' : undefined}
      style={{ fontSize: size, ...style }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {iconName(name)}
    </span>
  )
}
