import { Link } from 'react-router'
import type { FeatureManifest } from '../../app/types'
import { pathFor, useFeatures } from '../../app/features-context'
import { WidgetGrid } from '../../app/FeatureView'
import { ProductHero } from '../../app/ProductHero'
import { product } from '../../lib/product'
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
  const purposeOf = new Map(product.screens.map((s) => [s.id, s.purpose]))

  return (
    <div className="flex flex-col gap-7">
      <ProductHero />

      {product.screens.length > 0 && product.problem && (
        <p className="text-[17px] leading-relaxed text-fg">{product.problem}</p>
      )}

      {widgets.length > 0 && <WidgetGrid widgets={widgets} />}

      {sections.length > 0 && (
        <Section title="Разделы">
          <div className="grid gap-3 sm:grid-cols-2">
            {sections.map((page) => {
              const purpose = purposeOf.get(page.id)
              return (
                <Link
                  key={page.id}
                  to={pathFor(page.id)}
                  className="group flex items-center gap-3 rounded-card bg-surface p-4 shadow-card ring-1 ring-line/70 transition-transform duration-150 active:scale-[0.99]"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand">
                    <Icon name={page.icon} size={22} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[17px] leading-snug font-semibold text-fg">{page.title}</span>
                    {purpose && <span className="text-[15px] leading-snug text-muted">{purpose}</span>}
                  </span>
                  <Icon
                    name="arrow_forward"
                    size={18}
                    className="shrink-0 text-subtle transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </Link>
              )
            })}
          </div>
        </Section>
      )}

      {widgets.length === 0 && sections.length === 0 && (
        <EmptyState
          icon="wand_stars"
          title="Скоро здесь появятся функции"
          text="Сначала Гермес выберет стартап, потом соберёт функции по промптам участников."
        />
      )}
    </div>
  )
}
