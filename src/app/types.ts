import type { ComponentType } from 'react'

export type FeatureKind = 'page' | 'widget'

/**
 * Описание функции продукта. Каждая функция лежит в src/features/<id>/index.tsx
 * и экспортирует `export const feature: FeatureManifest = { ... }`.
 * Имя папки и есть id: латиница в нижнем регистре, цифры и дефис.
 */
export interface FeatureManifest {
  /** Совпадает с именем папки. */
  id: string
  /** Название в меню и в шапке карточки. Пишите строкой прямо здесь: `title: 'Мемы дня'`. */
  title: string
  /** Подпись в нижнем меню телефона: одно-два коротких слова, до 12 знаков, например `short: 'Мемы'`. Без неё берётся title. */
  short?: string
  /** Имя иконки Material Symbols, например 'rocket_launch' или 'favorite'. */
  icon: string
  /** 'page' — пункт меню и страница #/f/<id>; 'widget' — карточка на главной. */
  kind: FeatureKind
  /** Порядок в меню и на главной: меньше — раньше. Главная 0, «О стартапе» 1000. */
  order?: number
  /** Сам интерфейс функции. */
  component: ComponentType
  /** Имена людей, чьи идеи и промпты вошли в функцию. */
  authors?: string[]
}

/** Функция после проверки манифеста: все поля на месте. */
export interface FeatureEntry {
  id: string
  title: string
  /** Подпись в нижнем меню: short из манифеста или title. */
  short: string
  icon: string
  kind: FeatureKind
  order: number
  component: ComponentType
  authors: string[]
  /** Заготовка экрана каркаса: функции с этим id ещё нет. */
  placeholder?: boolean
}

export interface FeatureSummary {
  id: string
  kind: FeatureKind
  title: string
}

declare global {
  interface Window {
    /** Включённые функции; появляется, когда оболочка отрисовалась. Читает прогон в браузере. */
    __FEATURES__?: FeatureSummary[]
    /** Ошибки по id функции: их пишет FeatureBoundary, читает прогон в браузере. */
    __FEATURE_ERRORS__?: Record<string, string[]>
  }
}
