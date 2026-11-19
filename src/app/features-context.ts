import { createContext, useContext } from 'react'
import type { FeatureEntry } from './types'

// Отдельный модуль, чтобы функции (например, главная) получали список
// функций, не импортируя registry.ts: иначе вышел бы круговой импорт.

export interface FeaturesValue {
  features: FeatureEntry[]
  pages: FeatureEntry[]
  widgets: FeatureEntry[]
}

export const FeaturesContext = createContext<FeaturesValue>({ features: [], pages: [], widgets: [] })

/** Все включённые функции, страницы и виджеты. */
export function useFeatures(): FeaturesValue {
  return useContext(FeaturesContext)
}

/** Адрес страницы функции для Link и navigate: '/' для главной, '/f/<id>' для остальных. */
export function pathFor(id: string): string {
  return id === 'home' ? '/' : `/f/${encodeURIComponent(id)}`
}
