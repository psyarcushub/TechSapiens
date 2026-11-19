export type ClassValue = string | number | false | null | undefined

/** Склеивает классы, пропуская пустые: cn('p-4', active && 'bg-brand'). */
export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(' ')
}
