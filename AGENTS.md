# Правила для агента

Это прототип стартапа, который участники конференции собирают вместе с ИИ-агентом Гермесом. Сайт статический, открывают его в основном с телефона. Каждую твою правку система проверяет: `npm run typecheck`, `npm run build` и прогон в настоящем браузере (`npm run smoke`), где каждая страница открывается на экране 390×844, а ошибки и попытки выйти в интернет записываются. Функция, которая падает, выключается, а пачка, после которой не открывается главная, выбрасывается целиком.

Главное правило: лучше маленькая функция, которая точно работает, чем большая, которая может упасть.

## Где что лежит

| Путь | Что это | Можно ли менять |
|---|---|---|
| `src/features/<id>/` | функции продукта, по папке на функцию | да, это твоё основное место |
| `src/product.json` | паспорт продукта: название, фраза, иконка, цвета, текст «О стартапе» | да, сохраняя структуру и типы полей |
| `src/components/ui/` | компоненты shadcn/ui, уже в стиле TechSapiens | нельзя, только импортируй |
| `src/lib/utils.ts` | `cn` для склейки классов | нельзя |
| `src/ui/` | компоненты оболочки (меню, шапка) и `Icon` | только если без этого никак; в функциях бери отсюда только `Icon` |
| `src/lib/` | хранилище, даты и склонения, «ИИ» без интернета | только если без этого никак |
| `src/data/` | демо-данные: люди, реплики, даты, предсказуемый «случай» | можно дополнять |
| `src/app/` | оболочка: меню, маршруты, защита от падений | не трогай без крайней нужды |
| `src/theme/`, `src/index.css`, `src/assets/fonts/` | токены цветов и скруглений, общие стили, шрифт | не трогай |
| `src/features.disabled.json` | выключенные функции, его пишет система | не трогай никогда |
| `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `components.json`, `AGENTS.md`, `CONTRIBUTING.md`, `LICENSE` | сборка и правила | нельзя |

## Как устроена функция

Функция — это папка `src/features/<id>/` с файлом `index.tsx`, который экспортирует `feature`. Центрального списка нет: папка подхватывается сама. Интерфейс собирай из компонентов shadcn/ui и классов Tailwind, иконки бери из `lucide-react`.

```tsx
import { useState } from 'react'
import { CoffeeIcon, FlameIcon, MoonIcon } from 'lucide-react'
import type { FeatureManifest } from '../../app/types'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useLocalState } from '../../lib/store'
import { countLabel } from '../../lib/format'

export const feature: FeatureManifest = {
  id: 'mood-meter',
  title: 'Настроение зала',
  short: 'Настроение',
  icon: 'mood',
  kind: 'page',
  order: 20,
  component: MoodMeter,
  authors: ['Аня Смирнова'],
}

const MOODS = [
  { id: 'fire', label: 'Огонь', Icon: FlameIcon },
  { id: 'coffee', label: 'Нужен кофе', Icon: CoffeeIcon },
  { id: 'sleep', label: 'Сплю', Icon: MoonIcon },
]

const VOTE_FORMS: [string, string, string] = ['голос', 'голоса', 'голосов']

function MoodMeter() {
  const [votes, setVotes] = useLocalState<Record<string, number>>('mood-meter:votes', {})
  const [last, setLast] = useState<string | null>(null)
  const total = Object.values(votes).reduce((sum, n) => sum + n, 0)

  const vote = (id: string) => {
    setVotes((v) => ({ ...v, [id]: (v[id] ?? 0) + 1 }))
    setLast(id)
  }

  if (total === 0) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Зал пока молчит</CardTitle>
          <CardDescription>Нажмите кнопку, и станет ясно, кому нужен кофе.</CardDescription>
        </CardHeader>
        <CardContent className="items-center">
          <Button onClick={() => vote('coffee')}>Мне нужен кофе</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="label-caps text-sm text-muted-foreground">Всего {countLabel(total, VOTE_FORMS)}</p>
      {MOODS.map((m) => (
        <Card key={m.id} size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <m.Icon className="size-5 text-primary" />
              {m.label}
            </CardTitle>
            <CardDescription>
              {countLabel(votes[m.id] ?? 0, VOTE_FORMS)}
              {last === m.id ? ' · ваш голос' : ''}
            </CardDescription>
            <CardAction>
              <Button size="sm" variant="secondary" onClick={() => vote(m.id)}>
                +1
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Progress value={((votes[m.id] ?? 0) / total) * 100} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

Правила манифеста:

1. `id` совпадает с именем папки: латиница в нижнем регистре, цифры и дефис, от 2 до 61 знака, первый знак буква или цифра. Новые функции не называй `home` и `about`, это встроенные.
2. `title` пиши обычной строкой прямо в манифесте, до 80 знаков, без кавычек внутри: `title: 'Мемы дня'`. Система читает названия из исходника поиском по тексту, поэтому первое `title:` и первое `kind:` в `index.tsx` должны быть именно манифестными. Ставь манифест сразу после импортов, а компоненты объявляй ниже через `function` (они поднимаются, ссылка на них в манифесте работает). Массивы данных с полем `title` держи ниже манифеста или в отдельном файле, например `data.ts`.
   Для страницы добавь `short` — подпись в нижнем меню телефона: одно-два коротких слова до 12 знаков (`title: 'Кофейный пит-стоп'`, `short: 'Пит-стоп'`). Длинное название там не помещается.
3. `kind: 'page'` — пункт меню и страница по адресу `#/f/<id>`. `kind: 'widget'` — карточка на главной (и отдельная страница для проверки).
4. `order`: главная 0, «О стартапе» 1000, новые страницы ставь от 10 до 900. Первые четыре страницы попадают в нижнюю панель, остальные в «Ещё».
5. `authors` — имена людей, чьи промпты вошли в функцию. Они показываются под заголовком страницы и на странице «О стартапе».
6. Заголовок страницы (иконку и `title`) и шапку карточки виджета рисует оболочка. Свой `h1` в начале функции не дублируй, начинай сразу с содержимого.
7. `icon` в манифесте — значок в меню, имя Material Symbols в snake_case (см. «Иконки» ниже). Внутри функции иконки из `lucide-react`.
8. Первая версия продукта. В `src/product.json` в поле `screens` перечислены экраны продукта (`id`, `title`, `short`, `icon`, `purpose`, `examples`, `blocks`). Пока у экрана нет своей функции, сайт рисует его из `blocks`: вступление, карточки, список, форма, числа, метки с демо-данными. Если задача про такой экран, создай функцию ровно с его `id`, `kind: 'page'`, `title` и `short` как у экрана, перенеси в неё содержимое его блоков и добавь то, что просит задача: функция сама займёт место экрана из блоков. Поле `screens` не меняй.

## Безопасность кода: чтобы ничего не падало

- **Никакого кода, который может упасть, на верхнем уровне модуля.** Если файл функции падает уже при загрузке, функция не появится на сайте вовсе, и система её выключит. На верхнем уровне можно только объявлять константы-литералы, функции и манифест. Нельзя читать `localStorage`, вызывать `JSON.parse`, обращаться к `window` или `document`, брать `list[0].name`.
- Все данные внутри компонентов. Пустой массив и отсутствующее поле — нормальный случай: проверяй `list.length`, пиши `item?.name ?? 'Без имени'`.
- Таймеры и подписки снимай в `useEffect`: `return () => clearInterval(id)`.
- Ошибки в обработчиках нажатий не ловятся автоматически: оборачивай рискованное в `try/catch`.
- Не используй `console.error`: прогон считает это падением. Для отладки годится `console.warn`.
- Не выкидывай исключения нарочно и не оставляй `throw` «на потом».

## Данные

- Храни состояние через `useLocalState(key, initial)` из `src/lib/store.ts`: работает как `useState`, но переживает перезагрузку. Ключ начинай с id своей функции: `'mood-meter:votes'`. Хранилище само переживает битый JSON и запрет на `localStorage`, а если сохранённое значение другого вида, чем начальное (объект вместо массива), вернёт начальное.
- Напрямую `localStorage` не трогай.
- Демо-данные бери из `src/data`: `demoPeople` (12 вымышленных людей), `demoComments`, `createRandom(seed)` для предсказуемого «случая», `daysAgo`, `minutesAgo`, `demoDates`. Свои демо-данные клади в папку функции.
- Сервера, базы, входа, оплаты и настоящих нейросетей нет и не будет. Просьбы о них не отклоняй, а изображай понарошку и честно подписывай: демо-оплата без денег с надписью «понарошку», шуточный вход («войти как гость-единорог»), «ИИ» на заготовленных ответах, «база» в браузере, «рассылка» с экраном «письма улетели» без настоящих писем.
- «ИИ» изображай заготовленными ответами: `fakeAiReply(question)` и `askFakeAi(question)` из `src/lib/fake-ai.ts`, или свой список смешных ответов.

## Сеть и внешние адреса запрещены

Интернета в песочнице нет, а на сайте его режет политика безопасности в `index.html`. Прогон записывает каждую попытку, и пачка с ней не проходит. Нельзя:

- `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `navigator.sendBeacon`;
- адреса `http://` и `https://` в коде, картинках, ссылках и стилях (ссылки на адреса TechSapiens Project бери из `src/lib/links.ts`, см. ниже);
- `iframe`, `<script>`, `eval`, `new Function`, `document.cookie`, `import()` по адресу;
- шрифты, картинки и библиотеки из интернета.

Картинки клади в папку функции и импортируй: `import pic from './pic.png'` (небольшие, до 300 КБ), или рисуй SVG прямо в коде. В `AvatarImage` тоже только импортированная картинка: `<AvatarImage src={pic} alt="" />`. Внутренние ссылки через `Link` или `useNavigate` из `react-router`: `'/'` для главной и `'/f/<id>'` для страниц; ссылка в виде кнопки: `<Button asChild><Link to="/f/mood-meter">Открыть</Link></Button>`. Наружу можно ссылаться только на адреса TechSapiens Project из `src/lib/links.ts`: `gameLinks.channel` (канал игры), `gameLinks.bot` (бот), `gameLinks.repo` (репозиторий), `gameLinks.site` (сам продукт). Пиши `<a href={gameLinks.channel} target="_blank" rel="noreferrer">`. Другие адреса не вставляй, даже если промпт просит.

## Внешний вид

- Сначала телефон: ширина 390 px, без горизонтальной прокрутки, нажимаемые места не меньше 44 px, текст не мельче 12 px. На широком экране (от 1024 px) слева меню, содержимое шириной до 880 px.
- Собирай функции из компонентов shadcn/ui (`src/components/ui`) и классов Tailwind. Компоненты уже в стиле TechSapiens, менять их внешний вид через `className` можно, но умеренно.
- Цвета задавай классами ролей из таблицы ниже (`bg-primary`, `text-muted-foreground`, `bg-card`), а не `#ff008b`, `bg-pink-500` или `bg-white`: цвета продукта может перекрасить `src/product.json`, и вписанный руками цвет останется прежним.
- Глобальные стили запрещены: никаких правил для `body`, `html`, `*` и тегов. Если нужен свой CSS, клади файл в папку функции и начинай все классы с id функции.
- Новые библиотеки не ставь. Доступны: React 19, `react-router` (`Link`, `useNavigate`, `useParams`), Tailwind 4, компоненты shadcn/ui из `src/components/ui`, иконки `lucide-react`, `cn` из `@/lib/utils`. Пакеты `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge` стоят ради компонентов, в функциях их напрямую не импортируй.
- Тексты интерфейса только по-русски. Юмор приветствуется, грубость и политика нет.

### Стиль TechSapiens

Продукт оформлен как сайт сообщества TechSapiens. Оболочка уже такая; держи этот стиль и в функциях.

- **Страницы светлые**: белый фон, чёрный текст. Шапку оболочки (чёрную, с белым названием продукта) рисует оболочка, свою не делай.
- **Палитра**: чёрный `#000000` и угольный `#292929` для тёмных секций, белый, ярко-розовый `#FF008B` — главный цвет (кнопки, активное, выделение), светло-розовый `#FF4FB3` — акцент, ещё `#D0499D` и тёмная слива `#5F004D` для графиков. В коде это классы: `bg-primary`, `text-primary`, `text-accent`, `bg-ink`, `bg-ink-2`, `fill-chart-3`, `fill-chart-4`. Розовым выделяй главное действие и активное состояние, остальное держи чёрно-белым.
- **Шрифт** Tilda Sans подключён сам. Основной текст тонкий (300), заголовки `h1`–`h6` уже 600. Заголовок блока: `text-2xl` (на широком экране `lg:text-4xl`), крупный заголовок афиши `text-3xl`–`text-5xl`. Для выделения бери `font-semibold`, не `font-bold` и не `font-extrabold`.
- **Кнопки-таблетки**: `<Button>` уже круглая, розовая, с белым текстом 600. Вторичная — `variant="outline"`: контур 1.5 px цвета текста, поэтому на тёмном фоне она сама белая. Светло-розовая — `variant="secondary"`. Главная кнопка экрана — `size="lg"`.
- **Метки-таблетки**: `<Badge>` розовая, `<Badge variant="outline">` контурная (на афише белым контуром).
- **Подписи-метки заглавными с разрядкой**, как «TECH SAPIENS COMMUNITY» на сайте: `label-caps text-sm` (помельче `label-caps text-xs`). Только для коротких подписей над заголовком и в метках, не для абзацев.
- **Карточки и фото**: `Card` со скруглением 16 px и тонкой рамкой; фото внутри `rounded-xl`; круглые фото людей с розовой обводкой: `<Avatar size="lg" className="ring-2 ring-primary">`.
- **Афиша**: блок `poster` — почти чёрный фон с розовым свечением и белый текст, как анонсы событий на сайте.
- **Тёмная секция**: класс `dark` на блоке делает тёмными его фон и все компоненты внутри.

```tsx
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function EventPoster() {
  return (
    <div className="flex flex-col gap-6">
      <section className="poster flex flex-col gap-4 rounded-xl p-6">
        <p className="label-caps text-xs">Митап · Тбилиси</p>
        <h2 className="text-3xl leading-tight">Финансирование для роста</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>25 ноября · 18:30</Badge>
          <Badge variant="outline">Терминал, Тбилиси</Badge>
        </div>
        <Button size="lg" className="self-start">
          Подробнее и билеты
        </Button>
      </section>

      <section className="dark flex flex-col gap-4 rounded-xl bg-background p-6 text-foreground">
        <p className="label-caps text-xs text-muted-foreground">О нас</p>
        <p className="text-lg">Внутри тёмной секции кнопки, поля и карточки сами становятся тёмными.</p>
        <Button variant="outline" className="self-start">
          Узнать больше
        </Button>
      </section>
    </div>
  )
}
```

### Классы на токенах

| Назначение | Классы |
|---|---|
| фон | `bg-background` (страница, белый), `bg-card` (карточка), `bg-muted` (светло-серая подложка), `bg-surface-2` и `bg-surface-3` (серые подложки) |
| текст | `text-foreground` (основной), `text-muted-foreground` (второстепенный, серый); старые имена `text-fg`, `text-muted`, `text-subtle` тоже работают |
| главный цвет | `bg-primary` + `text-primary-foreground`, `text-primary`, `border-primary`, `ring-primary` |
| светло-розовое | `bg-secondary` + `text-secondary-foreground` (то же, что `bg-brand-soft` + `text-brand-strong`), `bg-accent` (подсветка строки при наведении), `text-accent` (светло-розовый текст), `bg-accent-soft` |
| тёмное | `bg-ink` (чёрный) и `bg-ink-2` (угольный) вместе с `text-on-ink`, блок `poster`, класс `dark` |
| линии | `border-border`, `border-input` (рамка поля), `divide-border`, `ring-border` |
| состояния | `text-destructive`, `bg-destructive/10`; `bg-success-soft` + `text-success-strong`, то же для `warning` и `danger` |
| графики | `bg-chart-1` … `bg-chart-5`, `fill-chart-1` … `fill-chart-5` |
| скругления | `rounded-full` (кнопки, метки, круглые фото), `rounded-xl` (16 px: карточки, фото), `rounded-lg` (около 11 px: поля), `rounded-sheet` (24 px: окна, афиши) |
| подписи и афиши | `label-caps`, `poster` |
| анимации | `anim-page`, `anim-fade`, `anim-pop`, `anim-sheet`, а также `animate-in fade-in-0 slide-in-from-bottom-2` и `animate-pulse` |
| безопасные отступы телефона | `pb-safe`, `pt-safe` |

Похожие имена значат разное, так задумано: `bg-muted` — светло-серый фон, а `text-muted` — серый текст; `bg-accent` — светло-розовая подсветка, а `text-accent` — светло-розовый текст.

Цвета берутся из `colors.primary` (главный, по умолчанию `#FF008B`) и `colors.accent` (акцент, по умолчанию `#FF4FB3`) в `src/product.json` (формат `#rrggbb`); оттенки считаются сами.

### Компоненты shadcn/ui

Каждый компонент импортируется из своего файла: `import { Button } from '@/components/ui/button'`, `import { Card, CardHeader, CardTitle } from '@/components/ui/card'`. Свойства как в документации shadcn/ui; главное:

| Файл | Что внутри и главные свойства |
|---|---|
| `button` | `Button`: `variant` = `default` (розовая), `outline`, `secondary`, `ghost`, `destructive`, `link`; `size` = `default`, `xs`, `sm`, `lg`, `icon`, `icon-sm`, `icon-lg`; `asChild` (кнопка-ссылка). Иконка рядом с текстом: `<HeartIcon data-icon="inline-start" />`. Кнопка только с иконкой — с `aria-label` |
| `card` | `Card` (`size`: `default`, `sm`), `CardHeader`, `CardTitle`, `CardDescription`, `CardAction` (справа в шапке), `CardContent`, `CardFooter` |
| `badge` | `Badge`: `variant` = `default` (розовая), `secondary`, `outline`, `destructive`, `ghost` |
| `avatar` | `Avatar` (`size`: `sm`, `default`, `lg`), `AvatarImage` (`src` импортированной картинки), `AvatarFallback` (буквы), `AvatarGroup`, `AvatarBadge` |
| `input`, `textarea`, `label` | поля как обычные `<input>` и `<textarea>`; подпись `<Label htmlFor="id">` |
| `select` | `Select` (`value`, `onValueChange`, `defaultValue`), `SelectTrigger` (`className="w-full"`), `SelectValue` (`placeholder`), `SelectContent`, `SelectItem` (`value`), `SelectGroup`, `SelectLabel` |
| `switch` | `Switch`: `checked`, `onCheckedChange` |
| `checkbox` | `Checkbox`: `checked`, `onCheckedChange` (приходит `true`, `false` или `'indeterminate'`) |
| `toggle-group` | `ToggleGroup` (`type` = `single` или `multiple`, `value`, `onValueChange`, `variant="outline"`), `ToggleGroupItem` (`value`); выбранная таблетка розовая. В `single` при повторном нажатии приходит `''` |
| `toggle` | `Toggle`: `pressed`, `onPressedChange`, `variant`, `size` |
| `tabs` | `Tabs` (`defaultValue` или `value` + `onValueChange`), `TabsList` (`variant`: `default`, `line`), `TabsTrigger` (`value`), `TabsContent` (`value`) |
| `dialog` | `Dialog` (`open`, `onOpenChange`), `DialogTrigger asChild`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` (`showCloseButton` добавит кнопку «Закрыть»), `DialogClose` |
| `sheet` | шторка: `Sheet`, `SheetTrigger asChild`, `SheetContent` (`side` = `bottom`, `right`, `left`, `top`; на телефоне бери `bottom`), `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`, `SheetClose` |
| `accordion` | `Accordion` (`type` = `single` или `multiple`, `collapsible`, `defaultValue`), `AccordionItem` (`value`), `AccordionTrigger`, `AccordionContent` |
| `alert` | `Alert` (`variant`: `default`, `destructive`; первой внутри можно поставить иконку), `AlertTitle`, `AlertDescription` |
| `tooltip` | `Tooltip`, `TooltipTrigger asChild`, `TooltipContent`. Провайдер уже стоит в оболочке. На телефоне подсказку почти не видно: важное пиши текстом |
| `progress` | `Progress`: `value` от 0 до 100 |
| `skeleton` | `Skeleton`: серая заглушка, размер задаёшь классами (`className="h-4 w-2/3"`) |
| `separator` | `Separator`: линия, `orientation` = `horizontal` или `vertical` |
| `scroll-area` | `ScrollArea`: область с прокруткой, высоту задаёшь классом (`className="h-64"`) |

- В `DialogContent` и `SheetContent` всегда ставь `DialogTitle` или `SheetTitle`: по нему экранный диктор понимает, что за окно. Если заголовок не нужен глазу, спрячь его классом `sr-only`.
- Состояние окна держи через `open` и `onOpenChange`, если окно должно закрываться из кода (например, после «отправки»).
- `cn` из `@/lib/utils` склеивает классы и убирает конфликтующие: `cn('px-4', active && 'bg-primary text-primary-foreground')`.

### Иконки

- **Внутри функции** — `lucide-react`: `import { HeartIcon, MapPinIcon } from 'lucide-react'`, затем `<HeartIcon className="size-5 text-primary" />`. Имена в PascalCase с окончанием `Icon`: `HeartIcon`, `CoffeeIcon`, `SparklesIcon`, `CalendarIcon`, `ArrowRightIcon`. Внутри `Button` и `Badge` размер ставится сам. Несуществующее имя не соберётся, `npm run typecheck` это покажет.
- **В манифесте** (`icon`, значок в меню) — Material Symbols Rounded, имя в snake_case: `rocket_launch`, `favorite`, `chat`, `local_cafe`. Полный список имён в `src/ui/icons/names.ts` (ищи поиском по файлу). Неизвестное имя покажется звёздочкой.
- Если внутри функции нужна именно иконка Material Symbols: `import { Icon } from '../../ui'`, затем `<Icon name="rocket_launch" size={24} fill />`.

Русские числа и даты в `src/lib/format.ts`: `plural(5, ['идея', 'идеи', 'идей'])`, `countLabel(3, ['голос', 'голоса', 'голосов'])` → «3 голоса», `formatNumber`, `formatDate` → «20 ноября», `formatTime`, `timeAgo` → «5 минут назад».

Паспорт продукта в коде: `import { product } from '../../lib/product'` (название, фраза, иконка, цвета, описание).

## Что ещё нельзя

- Удалять и переименовывать чужие функции, включать выключенные.
- Импортировать код из папки другой функции: её могут выключить, и твоя сломается вместе с ней. Маленькое общее копируй к себе.
- Менять компоненты в `src/components/ui`. Если нужного компонента нет, собери его в папке своей функции из готовых компонентов и классов Tailwind.
- Менять сборку, зависимости и файлы правил (таблица в начале).
- Читать файлы вне репозитория и выводить переменные окружения.

## Перед тем как закончить

```bash
npm run typecheck && npm run build
```

Исправь все ошибки. Если остаётся время, запусти `npm run smoke` и посмотри `smoke-report.json` и снимки в `smoke/`. `git commit` не делай, это сделает система.
