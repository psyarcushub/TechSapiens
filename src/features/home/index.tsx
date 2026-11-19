import { Link } from 'react-router'
import type { FeatureManifest } from '../../app/types'
import { pathFor, useFeatures } from '../../app/features-context'
import { WidgetGrid } from '../../app/FeatureView'
import { ProductHero } from '../../app/ProductHero'
import { EmptyState, Icon, Section } from '../../ui'

export const feature: FeatureManifest = {
  id: 'home',
  title: 'Главная',
  icon: 'home',
  kind: 'page',
  order: 0,
  component: HomePage,
}

function HomePage() {
  const { widgets, pages } = useFeatures()
  const sections = pages.filter((p) => p.id !== 'home')

  return (
    <div className="flex flex-col gap-7">
      <ProductHero />

      <Section title="Что уже умеет">
        {widgets.length > 0 ? (
          <WidgetGrid widgets={widgets} />
        ) : (
          <EmptyState
            icon="wand_stars"
            title="Скоро здесь будет жарко"
            text="Гермес уже собирает первые функции из промптов участников. Загляните через пару минут, тут появятся карточки."
          />
        )}
      </Section>

      {sections.length > 0 && (
        <Section title="Разделы">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sections.map((page) => (
              <Link
                key={page.id}
                to={pathFor(page.id)}
                className="group flex min-h-[104px] flex-col justify-between gap-3 rounded-card bg-surface p-4 shadow-card ring-1 ring-line/70 transition-transform duration-150 active:scale-[0.98]"
              >
                <span className="flex size-10 items-center justify-center rounded-[12px] bg-brand-soft text-brand-strong">
                  <Icon name={page.icon} size={22} fill />
                </span>
                <span className="flex items-end gap-1">
                  <span className="min-w-0 flex-1 text-[15px] leading-snug font-bold text-fg">{page.title}</span>
                  <Icon
                    name="arrow_forward"
                    size={18}
                    className="shrink-0 text-subtle transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
