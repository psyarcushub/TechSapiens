import { Suspense } from 'react'
import { Card, Icon } from '../ui'
import { FeatureBoundary } from './FeatureBoundary'
import type { FeatureEntry } from './types'

function Loading() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Загрузка">
      <div className="anim-shimmer h-5 w-2/3 rounded-full" />
      <div className="anim-shimmer h-4 w-full rounded-full" />
      <div className="anim-shimmer h-4 w-5/6 rounded-full" />
    </div>
  )
}

/** Функция внутри защитной обёртки: её падение не роняет оболочку. */
export function FeatureView({ feature, variant = 'page' }: { feature: FeatureEntry; variant?: 'page' | 'widget' }) {
  const Content = feature.component
  return (
    <FeatureBoundary id={feature.id} variant={variant}>
      <Suspense fallback={<Loading />}>
        <Content />
      </Suspense>
    </FeatureBoundary>
  )
}

/** Карточка виджета для главной: шапка с иконкой и названием, внутри сам виджет. */
export function WidgetCard({ feature }: { feature: FeatureEntry }) {
  return (
    <Card data-widget-id={feature.id} padding="md" className="anim-page flex min-w-0 flex-col">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-brand-soft text-brand-strong">
          <Icon name={feature.icon} size={18} fill />
        </span>
        <h3 className="min-w-0 flex-1 truncate text-[15px] font-bold text-fg">{feature.title}</h3>
      </div>
      <div className="min-w-0">
        <FeatureView feature={feature} variant="widget" />
      </div>
    </Card>
  )
}

/** Сетка виджетов: одна колонка на телефоне, две на широком экране. */
export function WidgetGrid({ widgets }: { widgets: FeatureEntry[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {widgets.map((w) => (
        <WidgetCard key={w.id} feature={w} />
      ))}
    </div>
  )
}
