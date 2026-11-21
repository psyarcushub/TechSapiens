import { Link } from 'react-router'
import { ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FeatureManifest } from '../../app/types'
import { pathFor, useFeatures } from '../../app/features-context'
import { WidgetGrid } from '../../app/FeatureView'
import { product } from '../../lib/product'
import { EmptyState, Icon, Section } from '../../ui'
import { SportsEmblems } from './sports-emblems'
import { StartArt } from './start-art'

export const feature: FeatureManifest = {
  id: 'home',
  title: 'Главная',
  icon: 'home',
  kind: 'page',
  order: 0,
  component: HomePage,
  authors: ['NataliGenia'],
}

function HomePage() {
  const { widgets, pages } = useFeatures()
  const sections = pages.filter((p) => p.id !== 'home')
  const purposeOf = new Map(product.screens.map((s) => [s.id, s.purpose]))

  return (
    <div className="flex flex-col gap-7">
      <SurrealStart
        hasTraining={sections.some((page) => page.id === 'team-training')}
        hasVote={sections.some((page) => page.id === 'peace-vote')}
      />
      <SportsEmblems />

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
                  <ArrowRightIcon aria-hidden="true" className="size-[18px] shrink-0 text-subtle transition-transform duration-150 group-hover:translate-x-0.5" />
                </Link>
              )
            })}
          </div>
        </Section>
      )}

      {widgets.length === 0 && sections.length === 0 && (
        <EmptyState
          icon="wand_stars"
          title="Эстафета ещё готовится"
          text="А пока можно выбрать любимую эмблему."
        />
      )}
    </div>
  )
}

function SurrealStart({ hasTraining, hasVote }: { hasTraining: boolean; hasVote: boolean }) {
  return (
    <section aria-labelledby="home-start-heading" className="poster grid rounded-sheet p-2 sm:grid-cols-2">
      <div className="flex min-w-0 flex-col items-start justify-center gap-4 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <p className="label-caps flex items-center gap-2 text-xs">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-on-ink/10 ring-1 ring-primary">
            <Icon name={product.icon} size={19} fill />
          </span>
          Эстафета дружбы
        </p>
        <h1 id="home-start-heading" className="text-4xl leading-none tracking-tight text-balance lg:text-5xl">
          {product.name}
        </h1>
        <p className="max-w-xs text-lg leading-snug text-on-ink/90">{product.tagline}</p>
        {(hasTraining || hasVote) && (
          <div className="mt-1 flex max-w-full flex-wrap items-center gap-2">
            {hasTraining && (
              <Button asChild size="lg" className="h-11 px-4 text-[15px] has-data-[icon=inline-end]:pr-4">
                <Link to={pathFor('team-training')}>
                  На тренировку <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
            )}
            {hasVote && (
              <Button asChild variant="outline" className="px-4">
                <Link to={pathFor('peace-vote')}>К голосованию</Link>
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="relative aspect-[5/4] min-w-0 overflow-hidden rounded-xl sm:aspect-auto sm:min-h-76">
        <div className="absolute inset-0"><StartArt /></div>
      </div>
    </section>
  )
}
