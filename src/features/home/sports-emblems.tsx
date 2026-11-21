import { Card, CardContent } from '@/components/ui/card'

const EMBLEMS = [
  { name: 'Кедолёт', mark: 'flight', style: 'bg-accent-soft text-chart-4' },
  { name: 'Вираж', mark: 'curve', style: 'bg-chart-4 text-on-ink' },
  { name: 'Прыг-Скок', mark: 'bounce', style: 'bg-warning-soft text-ink' },
  { name: 'Луноходы', mark: 'moon', style: 'bg-ink-2 text-on-ink' },
  { name: 'Шнурометр', mark: 'lace', style: 'bg-secondary text-chart-4' },
  { name: 'Облакобег', mark: 'cloud', style: 'bg-muted text-ink' },
] as const

export function SportsEmblems() {
  return (
    <section aria-labelledby="home-emblems-heading" className="min-w-0">
      <h2 id="home-emblems-heading" className="text-2xl leading-tight lg:text-4xl">Спортивные эмблемы</h2>
      <p className="mt-1 text-sm text-muted-foreground">Вымышленные марки для квеста</p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {EMBLEMS.map(({ name, mark, style }) => (
          <li key={mark} className="min-w-0">
            <Card size="sm" className="h-full py-0">
              <CardContent className="items-center gap-2 px-2 pt-2 pb-3 text-center">
                <div className={`grid h-21 w-full place-items-center rounded-lg ${style}`}>
                  <EmblemMark mark={mark} />
                </div>
                <span className="text-sm leading-snug font-semibold">{name}</span>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}

function EmblemMark({ mark }: { mark: (typeof EMBLEMS)[number]['mark'] }) {
  const shapes = {
    flight: (
      <>
        <path d="M16 34l19 2 11-10 3 10 17 8v8H26l-7-5h19M13 27h23M8 40h15m2 17h41" />
        <path d="m53 12 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="currentColor" stroke="none" />
      </>
    ),
    curve: (
      <>
        <path d="M13 51c0-20 15-34 35-34h13M24 56c0-16 12-27 28-27h9M37 56c0-9 7-15 16-15h8" />
        <path d="m58 12 9 5-9 5z" fill="currentColor" stroke="none" />
      </>
    ),
    bounce: (
      <>
        <path d="M10 48c4-19 14-25 24-3 8-27 20-34 28-22M12 56h50" />
        <circle cx="62" cy="22" r="7" fill="currentColor" stroke="none" />
      </>
    ),
    moon: (
      <>
        <path d="M44 16a18 18 0 1 0 17 26 18 18 0 0 1-17-26Z" fill="currentColor" stroke="none" />
        <path d="M49 26h13m-6.5-6.5v13M12 48l11-4M19 56l10-4" />
      </>
    ),
    lace: (
      <>
        <path d="M24 17h28l9 18-9 20H24L15 35z" />
        <path d="m29 27 18 16m0-16L29 43" />
        <path d="M29 27h.1m17.9 0h.1M29 43h.1m17.9 0h.1" strokeWidth="6" />
      </>
    ),
    cloud: (
      <>
        <path d="M21 41a9 9 0 0 1 5-16 13 13 0 0 1 25 1 9 9 0 1 1 4 17H28m-9 7h23m-31 7h19" />
        <path d="m55 47-6 10h7l-4 8 12-12h-8l4-6z" fill="currentColor" stroke="none" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 76 72"
      className="size-15 max-w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shapes[mark]}
    </svg>
  )
}
