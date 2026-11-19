import type { FeatureManifest } from '../../app/types'
import { useFeatures } from '../../app/features-context'
import { product } from '../../lib/product'
import { countLabel, formatNumber } from '../../lib/format'
import { Avatar, Badge, Card, EmptyState, Icon, Progress, Section, Stat } from '../../ui'

export const feature: FeatureManifest = {
  id: 'about',
  title: 'О стартапе',
  icon: 'info',
  kind: 'page',
  order: 1000,
  component: AboutPage,
}

const BUILT_IN = new Set(['home', 'about'])

function AboutPage() {
  const { features } = useFeatures()
  const { about } = product
  const own = features.filter((f) => !BUILT_IN.has(f.id))
  const authors = [...new Set(features.flatMap((f) => f.authors))]
  const clusters = [...about.clusters].sort((a, b) => b.count - a.count)
  const maxCount = Math.max(1, ...clusters.map((c) => c.count))

  return (
    <div className="flex flex-col gap-7">
      <Card tone="tint" padding="lg">
        <div className="mb-3 flex items-center gap-2 text-[13px] font-bold tracking-wide text-brand-strong uppercase">
          <Icon name="smart_toy" size={18} fill />
          Что решил Гермес
        </div>
        <p className="text-[17px] leading-relaxed text-fg">{about.summary}</p>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Stat icon="lightbulb" value={formatNumber(about.ideasCount)} label="идей прислали" tone="accent" />
        <Stat icon="groups" value={formatNumber(about.participantsCount)} label="участников" />
        <Stat icon="extension" value={formatNumber(own.length)} label="функций собрано" tone="success" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card icon="emergency_heat" title="Какую проблему решаем">
          <p className="text-[15px] leading-relaxed text-muted">{product.problem}</p>
        </Card>
        <Card icon="diversity_3" title="Для кого">
          <p className="text-[15px] leading-relaxed text-muted">{product.audience}</p>
        </Card>
      </div>

      <Section
        title="Из каких идей собрали"
        subtitle="Гермес сгруппировал похожие идеи участников. Чем длиннее полоска, тем больше идей в группе."
      >
        {clusters.length > 0 ? (
          <Card padding="none" className="divide-y divide-line overflow-hidden">
            {clusters.map((cluster, index) => (
              <div key={`${cluster.title}-${index}`} className="flex flex-col gap-2 px-4 py-4 sm:px-5">
                <div className="flex items-start gap-3">
                  <span className="min-w-0 flex-1 text-[15px] leading-snug font-bold text-fg">{cluster.title}</span>
                  <Badge tone={index === 0 ? 'brand' : 'neutral'} solid={index === 0}>
                    {countLabel(cluster.count, ['идея', 'идеи', 'идей'])}
                  </Badge>
                </div>
                <Progress
                  value={cluster.count}
                  max={maxCount}
                  tone={index === 0 ? 'brand' : 'accent'}
                  label={`${cluster.title}: ${cluster.count}`}
                />
                {cluster.contribution && <p className="text-[14px] leading-snug text-muted">{cluster.contribution}</p>}
              </div>
            ))}
          </Card>
        ) : (
          <EmptyState
            compact
            icon="hourglass_top"
            title="Идеи ещё разбираются"
            text="Как только Гермес выберет стартап, здесь появятся группы идей и то, что каждая дала продукту."
          />
        )}
      </Section>

      <Section title="Чего мы не делаем">
        {about.outOfScope.length > 0 ? (
          <Card padding="none" className="divide-y divide-line overflow-hidden">
            {about.outOfScope.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
                <Icon name="block" size={20} className="mt-0.5 shrink-0 text-danger" />
                <span className="text-[15px] leading-snug text-fg">{item}</span>
              </div>
            ))}
          </Card>
        ) : (
          <EmptyState
            compact
            icon="do_not_disturb_on"
            title="Пока без запретов"
            text="Список появится вместе с решением Гермеса: что в продукт сознательно не берём."
          />
        )}
      </Section>

      {authors.length > 0 && (
        <Section title="Кто приложил руку">
          <div className="flex flex-wrap gap-2">
            {authors.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-2 rounded-full bg-surface py-1 pr-3.5 pl-1 shadow-card ring-1 ring-line/70"
              >
                <Avatar name={name} size="sm" />
                <span className="text-[14px] font-semibold text-fg">{name}</span>
              </span>
            ))}
          </div>
        </Section>
      )}

      <p className="flex items-center justify-center gap-2 px-4 text-center text-[13px] leading-snug text-subtle">
        <Icon name="favorite" size={16} fill className="shrink-0 text-accent" />
        Идеи и промпты от людей, код от Гермеса
      </p>
    </div>
  )
}
