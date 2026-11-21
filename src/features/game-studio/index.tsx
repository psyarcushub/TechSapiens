import { useState, type FormEvent } from 'react'
import { CheckIcon, PackageIcon, PlusIcon, TruckIcon, UtensilsIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScreenBlocks } from '../../app/ScreenBlocks'
import type { FeatureManifest } from '../../app/types'
import { countLabel } from '../../lib/format'
import { product } from '../../lib/product'
import { useLocalState } from '../../lib/store'

export const feature: FeatureManifest = {
  id: 'game-studio',
  title: 'Игровая студия',
  short: 'Студия',
  icon: 'sports_esports',
  kind: 'page',
  order: 90,
  component: GameStudio,
  authors: ['NataliGenia', 'Dima E.', 'Artem G.'],
}

type Kit = 'paper-targets' | 'confetti'

type Order = {
  mission: string
  kit: Kit
  delivered: boolean
}

const KITS: Record<Kit, string> = {
  'paper-targets': 'Бумажные мишени',
  confetti: 'Конфетти',
}

function isKit(value: unknown): value is Kit {
  return value === 'paper-targets' || value === 'confetti'
}

function GameStudio() {
  const screen = product.screens.find((s) => s.id === feature.id)

  return (
    <div className="flex flex-col gap-8">
      {screen && <ScreenBlocks blocks={screen.blocks} screenId={screen.id} />}
      <PropOrder />
      <TeamBuffet />
    </div>
  )
}

const BUFFET_ITEMS = [
  { id: 'compote', name: 'Компот' },
  { id: 'buckwheat', name: 'Гречка' },
  { id: 'prunes', name: 'Чернослив' },
] as const

function portionCount(value: number | undefined) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0
}

function TeamBuffet() {
  const [portions, setPortions] = useLocalState<Partial<Record<(typeof BUFFET_ITEMS)[number]['id'], number>>>(
    'game-studio:buffet-portions',
    {},
  )

  return (
    <section aria-labelledby="game-studio-buffet">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id="game-studio-buffet" className="flex items-center gap-2 text-2xl">
              <UtensilsIcon aria-hidden="true" className="size-6 shrink-0 text-primary" />
              Буфет команды
            </h2>
          </CardTitle>
          <CardDescription>Демо — без заказа и доставки</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {BUFFET_ITEMS.map(({ id, name }) => (
              <li key={id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-lg bg-muted p-3">
                <div>
                  <p className="text-base font-semibold">{name}</p>
                  <p aria-live="polite" aria-atomic="true" className="text-sm tabular-nums text-muted-foreground">
                    <span className="sr-only">{name}: </span>
                    {countLabel(portionCount(portions[id]), ['порция', 'порции', 'порций'])}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="min-h-11"
                  aria-label={`Ещё порцию — ${name}`}
                  onClick={() => setPortions((previous) => ({ ...previous, [id]: portionCount(previous[id]) + 1 }))}
                >
                  <PlusIcon aria-hidden="true" data-icon="inline-start" />
                  Ещё порцию
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}

function PropOrder() {
  const [mission, setMission] = useState('')
  const [kit, setKit] = useState<Kit>('paper-targets')
  const [missionError, setMissionError] = useState(false)
  const [order, setOrder] = useLocalState<Order | null>('game-studio:prop-order', null)
  const currentOrder = order && typeof order.mission === 'string' && isKit(order.kit) ? order : null

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = mission.trim()
    if (!name) {
      setMissionError(true)
      return
    }
    setOrder({ mission: name, kit, delivered: false })
    setMission('')
  }

  return (
    <section aria-labelledby="game-studio-props" className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id="game-studio-props" className="flex items-center gap-2 text-2xl">
              <PackageIcon aria-hidden="true" className="size-6 shrink-0 text-primary" />
              Реквизит для миссии
            </h2>
          </CardTitle>
          <CardDescription>Закажите набор для репетиции. Доставка понарошку: без адреса, контактов и оплаты.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="game-studio-mission">Название миссии</Label>
                <Input
                  id="game-studio-mission"
                  placeholder="Например, «Печать сбежала»"
                  value={mission}
                  onChange={(event) => {
                    setMission(event.target.value)
                    setMissionError(false)
                  }}
                  required
                  maxLength={100}
                  aria-invalid={missionError}
                  aria-describedby={missionError ? 'game-studio-mission-error' : undefined}
                  className="min-h-11"
                />
                {missionError && <p id="game-studio-mission-error" role="alert" className="text-sm text-destructive">Введите название миссии.</p>}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="game-studio-kit">Набор реквизита</Label>
                <Select value={kit} onValueChange={(value) => { if (isKit(value)) setKit(value) }}>
                  <SelectTrigger id="game-studio-kit" className="w-full">
                    <SelectValue>{KITS[kit]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="paper-targets" className="min-h-11">{KITS['paper-targets']}</SelectItem>
                    <SelectItem value="confetti" className="min-h-11">{KITS.confetti}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" size="lg" className="min-h-11 sm:self-start">Заказать реквизит</Button>
          </form>
        </CardContent>
      </Card>

      <div aria-live="polite" role="status" className="sr-only">
        {currentOrder && (currentOrder.delivered ? 'Доставлено' : 'Заказ принят. Соня в пути.')}
      </div>
      {currentOrder && (
        <Card>
          <CardHeader>
            <Badge variant="secondary" className="mb-1">Демо-доставка за 30 минут</Badge>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TruckIcon aria-hidden="true" className="size-5 text-primary" />
              Соня, вымышленный курьер
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <dl className="grid gap-2 rounded-xl bg-muted p-3 text-sm sm:grid-cols-2">
              <div className="min-w-0">
                <dt className="text-muted-foreground">Миссия</dt>
                <dd className="font-semibold wrap-anywhere">{currentOrder.mission}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Набор</dt>
                <dd className="font-semibold">{KITS[currentOrder.kit]}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={currentOrder.delivered ? 'secondary' : 'outline'}>
                {currentOrder.delivered && <CheckIcon aria-hidden="true" data-icon="inline-start" />}
                {currentOrder.delivered ? 'Доставлено' : 'В пути'}
              </Badge>
              {!currentOrder.delivered && (
                <Button type="button" variant="outline" className="min-h-11" onClick={() => setOrder({ ...currentOrder, delivered: true })}>
                  Показать вручение
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
