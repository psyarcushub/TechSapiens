import { useEffect } from 'react'
import { HashRouter, Route, Routes, useNavigate, useParams } from 'react-router'
import { Button, EmptyState, Icon, Section } from '../ui'
import { FeaturesContext } from './features-context'
import type { FeaturesValue } from './features-context'
import { FeatureView, WidgetCard, WidgetGrid } from './FeatureView'
import { ProductHero } from './ProductHero'
import { features, findFeature, pages, widgets } from './registry'
import { Shell } from './Shell'
import type { FeatureEntry } from './types'

function PageTitle({ feature }: { feature: FeatureEntry }) {
  return (
    <header className="mb-5 flex items-center gap-3 lg:mb-8">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand lg:size-12">
        <Icon name={feature.icon} size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="text-[26px] leading-tight font-semibold text-fg lg:text-[32px]">{feature.title}</h1>
      </div>
    </header>
  )
}

/** Главная на случай, если функцию home выключили: баннер и виджеты. */
function HomeFallback() {
  return (
    <div className="flex flex-col gap-6">
      <ProductHero />
      {widgets.length > 0 ? (
        <WidgetGrid widgets={widgets} />
      ) : (
        <EmptyState title="Скоро здесь появятся функции" text="Гермес уже работает над продуктом." />
      )}
    </div>
  )
}

function NotFound() {
  const navigate = useNavigate()
  return (
    <div data-page-id="not-found" className="anim-page pt-6">
      <EmptyState
        icon="explore_off"
        title="Такой страницы нет"
        text="Возможно, её убрали или ещё не доделали."
        action={
          <Button icon="home" onClick={() => navigate('/')}>
            На главную
          </Button>
        }
      />
    </div>
  )
}

function PageHost({ id }: { id: string }) {
  const feature = findFeature(id)
  if (!feature) {
    if (id === 'home') {
      return (
        <div data-page-id="home" className="anim-page">
          <HomeFallback />
        </div>
      )
    }
    return <NotFound />
  }
  if (feature.kind === 'widget') {
    return (
      <div data-page-id={feature.id} key={feature.id} className="anim-page">
        <PageTitle feature={feature} />
        <Section subtitle="Этот блок также есть на главной.">
          <WidgetCard feature={feature} />
        </Section>
      </div>
    )
  }
  return (
    <div data-page-id={feature.id} key={feature.id} className="anim-page">
      {feature.id !== 'home' && <PageTitle feature={feature} />}
      <FeatureView feature={feature} />
    </div>
  )
}

function FeatureRoute() {
  const { id = '' } = useParams()
  return <PageHost key={id} id={id} />
}

function Ready() {
  useEffect(() => {
    // Сигнал для прогона в браузере: оболочка отрисована, вот список функций.
    window.__FEATURES__ = features.map((f) => ({ id: f.id, kind: f.kind, title: f.title }))
  }, [])
  return null
}

export function App() {
  // списки уже загружены loadFeatures() до первой отрисовки
  const value: FeaturesValue = { features, pages, widgets }
  return (
    <HashRouter>
      <FeaturesContext.Provider value={value}>
        <Shell>
          <Routes>
            <Route path="/" element={<PageHost id="home" />} />
            <Route path="/f/:id" element={<FeatureRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Shell>
        <Ready />
      </FeaturesContext.Provider>
    </HashRouter>
  )
}
