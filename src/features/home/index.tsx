import { Link } from 'react-router'
import type { FeatureManifest } from '../../app/types'
import { pathFor, useFeatures } from '../../app/features-context'
import { WidgetGrid } from '../../app/FeatureView'
import { ProductHero } from '../../app/ProductHero'
import { ScreensBoard } from '../../app/Wireframe'
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
  // экраны каркаса показывает доска ниже, в «Разделах» только остальное
  const screenIds = new Set(product.screens.map((s) => s.id))
  const sections = pages.filter((p) => p.id !== 'home' && !screenIds.has(p.id))

  return (
    <div className="flex flex-col gap-7">
      <ProductHero />

      {product.screens.length > 0 && (
        <section className="flex flex-col gap-2">
          <span className="text-[12px] leading-4 font-semibold tracking-[0.16em] text-muted uppercase">Что мы делаем</span>
          <p className="text-[17px] leading-relaxed text-fg">{product.about.summary}</p>
        </section>
      )}

      <ScreensBoard />

      {/* пока есть каркас, пустое «скоро будет» не нужно: его роль играет доска экранов */}
      {(widgets.length > 0 || product.screens.length === 0) && (
        <Section title="Что продукт уже умеет">
          {widgets.length > 0 ? (
            <WidgetGrid widgets={widgets} />
          ) : (
            <EmptyState
              icon="wand_stars"
              title="Скоро здесь появятся функции"
              text="Сначала Гермес выберет стартап, потом соберёт функции по промптам участников."
            />
          )}
        </Section>
      )}

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
