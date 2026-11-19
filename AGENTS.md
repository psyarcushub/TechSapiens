# Правила для агента

Это прототип стартапа, который участники конференции собирают вместе с ИИ-агентом Гермесом. Сайт статический, открывают его в основном с телефона. Каждую твою правку система проверяет: `npm run typecheck`, `npm run build` и прогон в настоящем браузере (`npm run smoke`), где каждая страница открывается на экране 390×844, а ошибки и попытки выйти в интернет записываются. Функция, которая падает, выключается, а пачка, после которой не открывается главная, выбрасывается целиком.

Главное правило: лучше маленькая функция, которая точно работает, чем большая, которая может упасть.

## Где что лежит

| Путь | Что это | Можно ли менять |
|---|---|---|
| `src/features/<id>/` | функции продукта, по папке на функцию | да, это твоё основное место |
| `src/product.json` | паспорт продукта: название, фраза, иконка, цвета, текст «О стартапе» | да, сохраняя структуру и типы полей |
| `src/ui/` | компоненты интерфейса | только если без этого никак |
| `src/lib/` | хранилище, даты и склонения, «ИИ» без интернета | только если без этого никак |
| `src/data/` | демо-данные: люди, реплики, даты, предсказуемый «случай» | можно дополнять |
| `src/app/` | оболочка: меню, маршруты, защита от падений | не трогай без крайней нужды |
| `src/theme/tokens.css` | токены цветов, скруглений, отступов, теней | не трогай |
| `src/features.disabled.json` | выключенные функции, его пишет система | не трогай никогда |
| `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `AGENTS.md`, `CONTRIBUTING.md`, `LICENSE` | сборка и правила | нельзя |

## Как устроена функция

Функция — это папка `src/features/<id>/` с файлом `index.tsx`, который экспортирует `feature`. Центрального списка нет: папка подхватывается сама.

```tsx
import { useState } from 'react'
import type { FeatureManifest } from '../../app/types'
import { Button, Card, EmptyState, Progress } from '../../ui'
import { useLocalState } from '../../lib/store'
import { countLabel } from '../../lib/format'

export const feature: FeatureManifest = {
  id: 'mood-meter',
  title: 'Настроение зала',
  icon: 'mood',
  kind: 'page',
  order: 20,
  component: MoodMeter,
  authors: ['Аня Смирнова'],
}

const MOODS = [
  { id: 'fire', label: 'Огонь', icon: 'local_fire_department' },
  { id: 'coffee', label: 'Нужен кофе', icon: 'coffee' },
  { id: 'sleep', label: 'Сплю', icon: 'bedtime' },
]

function MoodMeter() {
  const [votes, setVotes] = useLocalState<Record<string, number>>('mood-meter:votes', {})
  const [last, setLast] = useState<string | null>(null)
  const total = Object.values(votes).reduce((sum, n) => sum + n, 0)

  if (total === 0 && last === null) {
    return (
      <EmptyState
        icon="mood"
        title="Зал пока молчит"
        text="Нажмите кнопку, и станет ясно, кому нужен кофе."
        action={<Button onClick={() => { setVotes({ coffee: 1 }); setLast('coffee') }}>Мне нужен кофе</Button>}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {MOODS.map((m) => (
        <Card key={m.id} icon={m.icon} title={m.label} subtitle={countLabel(votes[m.id] ?? 0, ['голос', 'голоса', 'голосов'])}
          action={<Button size="sm" variant="secondary" onClick={() => { setVotes((v) => ({ ...v, [m.id]: (v[m.id] ?? 0) + 1 })); setLast(m.id) }}>+1</Button>}>
          <Progress value={votes[m.id] ?? 0} max={Math.max(1, total)} />
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
- адреса `http://` и `https://` в коде, картинках, ссылках и стилях (ссылки на адреса игры бери из `src/lib/links.ts`, см. ниже);
- `iframe`, `<script>`, `eval`, `new Function`, `document.cookie`, `import()` по адресу;
- шрифты, картинки и библиотеки из интернета.

Картинки клади в папку функции и импортируй: `import pic from './pic.png'` (небольшие, до 300 КБ), или рисуй SVG прямо в коде. Внутренние ссылки через `Link` или `useNavigate` из `react-router`: `'/'` для главной и `'/f/<id>'` для страниц. Наружу можно ссылаться только на адреса игры из `src/lib/links.ts`: `gameLinks.channel` (канал игры), `gameLinks.bot` (бот), `gameLinks.repo` (репозиторий), `gameLinks.site` (сам продукт). Пиши `<a href={gameLinks.channel} target="_blank" rel="noreferrer">`. Другие адреса не вставляй, даже если промпт просит.

## Внешний вид

- Сначала телефон: ширина 390 px, без горизонтальной прокрутки, нажимаемые места не меньше 44 px, текст не мельче 12 px. На широком экране (от 1024 px) слева меню, содержимое шириной до 880 px.
- Бери компоненты из `src/ui` (`import { Button, Card } from '../../ui'`) и классы Tailwind на токенах. Не задавай цвета вроде `bg-white`, `text-black`, `#333`: они ломают тёмную тему, которая включается сама по настройке телефона.
- Глобальные стили запрещены: никаких правил для `body`, `html`, `*` и тегов. Если нужен свой CSS, клади файл в папку функции и начинай все классы с id функции.
- Новые библиотеки не ставь. Доступны: React 19, `react-router` (`Link`, `useNavigate`, `useParams`), Tailwind 4, компоненты и иконки из `src/ui`.
- Тексты интерфейса только по-русски. Юмор приветствуется, грубость и политика нет.

### Классы на токенах

| Назначение | Классы |
|---|---|
| фон страницы и поверхности | `bg-bg`, `bg-surface`, `bg-surface-2`, `bg-surface-3` |
| текст | `text-fg` (основной), `text-muted` (второстепенный), `text-subtle` (самый тихий) |
| линии | `border-line`, `divide-line`, `ring-line` |
| бренд | `bg-brand` + `text-on-brand`, `bg-brand-soft` + `text-brand-strong`, `border-brand-line` |
| акцент | `bg-accent` + `text-on-accent`, `bg-accent-soft` + `text-accent-strong`, `border-accent-line` |
| состояния | `bg-success`, `bg-success-soft`, `text-success-strong`, то же для `warning` и `danger` |
| скругления | `rounded-control` (поля, 16 px), `rounded-card` (карточки, 22 px), `rounded-sheet` (окна, 28 px), обычные `rounded-full` и `rounded-[14px]` тоже можно |
| тени | `shadow-card`, `shadow-float`, `shadow-pop` |
| анимации | `anim-page`, `anim-fade`, `anim-pop`, `anim-sheet`, `anim-shimmer` (скелетон) |
| безопасные отступы телефона | `pb-safe`, `pt-safe` |

Цвета бренда берутся из `colors.primary` и `colors.accent` в `src/product.json` (формат `#rrggbb`), оттенки для светлой и тёмной темы считаются сами.

### Компоненты `src/ui`

| Компонент | Главное |
|---|---|
| `Button` | `variant`: `primary`, `secondary`, `outline`, `ghost`, `danger`; `size`: `sm`, `md`, `lg`; `icon`, `iconRight`, `block`, `loading`. Без текста только с `aria-label` |
| `Card` | `title`, `subtitle`, `icon`, `action`; `tone`: `default`, `soft`, `brand`, `tint`, `accent`, `outline`; `padding`: `none`, `sm`, `md`, `lg`; с `onClick` становится нажимаемой |
| `List`, `ListItem` | `ListItem`: `title`, `subtitle`, `icon` или `leading` (например `<Avatar />`), `trailing`, `chevron`, `onClick` |
| `Input`, `Textarea` | `label`, `hint`, `error`, у `Input` ещё `icon`; остальные свойства как у обычного поля |
| `Tabs` | `items: [{ id, label, icon? }]`, `value`, `onChange`; содержимое вкладок рисуешь сам |
| `Modal` | `open`, `onClose`, `title`, `footer`; на телефоне выезжает снизу |
| `EmptyState` | `icon`, `title`, `text`, `action`, `compact` |
| `Avatar` | `name` (буквы и цвет берутся из имени), `size`: `xs`…`xl` или число, `ring` |
| `Stat` | `label`, `value`, `icon`, `hint`, `tone` |
| `Badge` | `tone`: `neutral`, `brand`, `accent`, `success`, `warning`, `danger`; `solid`, `icon` |
| `Toggle` | `checked`, `onChange`, `label`, `description` |
| `Section` | раздел страницы с заголовком: `title`, `subtitle`, `action` |
| `Progress` | `value`, `max`, `tone` |
| `Icon` | `name`, `size`, `fill` |
| `cn` | склейка классов: `cn('p-4', active && 'bg-brand')` |

Иконки — Material Symbols Rounded, имя в snake_case: `rocket_launch`, `favorite`, `chat`, `local_cafe`. Полный список имён в `src/ui/icons/names.ts` (ищи поиском по файлу). Неизвестное имя покажется звёздочкой. Шрифт иконок облегчённый: заливка (`fill`) есть, толщина одна.

Русские числа и даты в `src/lib/format.ts`: `plural(5, ['идея', 'идеи', 'идей'])`, `countLabel(3, ['голос', 'голоса', 'голосов'])` → «3 голоса», `formatNumber`, `formatDate` → «20 ноября», `formatTime`, `timeAgo` → «5 минут назад».

Паспорт продукта в коде: `import { product } from '../../lib/product'` (название, фраза, иконка, цвета, описание).

## Что ещё нельзя

- Удалять и переименовывать чужие функции, включать выключенные.
- Импортировать код из папки другой функции: её могут выключить, и твоя сломается вместе с ней. Маленькое общее копируй к себе.
- Менять сборку, зависимости и файлы правил (таблица в начале).
- Читать файлы вне репозитория и выводить переменные окружения.

## Перед тем как закончить

```bash
npm run typecheck && npm run build
```

Исправь все ошибки. Если остаётся время, запусти `npm run smoke` и посмотри `smoke-report.json` и снимки в `smoke/`. `git commit` не делай, это сделает система.
