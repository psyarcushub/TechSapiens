// Прогон собранного сайта (dist/) в настоящем Chromium.
//
// Поднимает крошечный статический сервер на 127.0.0.1, открывает главную,
// ждёт window.__FEATURES__, затем открывает каждую функцию по адресу #/f/<id>.
// Собирает необработанные ошибки страницы, console.error и
// window.__FEATURE_ERRORS__, блокирует и записывает любые запросы не к своему
// серверу, снимает каждую страницу в smoke/<id>.png и пишет smoke-report.json:
//   { ok, shellOk, pages: [{ id, ok, errors }], failedFeatures, blockedRequests, externalRequests, durationMs }
// blockedRequests — то, что режет политика безопасности (чужой код, iframe, адреса без https): это провал.
// externalRequests — запросы данных в интернет: в прогоне они остаются без ответа, как при пропавшей сети,
// и страница обязана это пережить, поэтому сами по себе они не провал.
// Код выхода 0, если оболочка и главная отрисовались (упавшие функции только
// перечисляются), иначе 1.
//
// Переменные окружения:
//   SMOKE_PORT     порт сервера; по умолчанию свободный из 40000–40999
//   CHROMIUM_PATH  путь к Chromium или Chrome; по умолчанию браузер playwright-core,
//                  затем Chrome/Chromium, установленные в системе

import { createServer } from 'node:http'
import { createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const SHOTS = join(ROOT, 'smoke')
const REPORT = join(ROOT, 'smoke-report.json')

const VIEWPORT = { width: 390, height: 844 }
const HARD_LIMIT_MS = 58_000 // после этого прогон обрывается в любом случае
const VISITS_UNTIL_MS = 48_000 // новые страницы после этого не открываются
const HOME_TIMEOUT_MS = 15_000
const PAGE_TIMEOUT_MS = 8_000
const SETTLE_MS = 500
const CONCURRENCY = 4

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json; charset=utf-8',
}

// Сообщения консоли, которые не считаются падением функции:
// сетевые отказы (внешние запросы и так попадают в blockedRequests), отказы CSP
// и замечания к разбору самой CSP (её задаёт index.html, функции её не меняют).
const IGNORED_CONSOLE = [
  /^Failed to load resource/i,
  /Refused to (connect|load|frame|execute|apply|create)/i,
  /violates the following Content Security Policy/i,
  /The Content[- ]Security[- ]Policy directive/i,
]

// Адреса, которые подмешивает в страницу антивирус на машине разработчика
// (Kaspersky вставляет свой скрипт даже в страницы с 127.0.0.1). Запросы к ним
// всё равно отклоняются, но в blockedRequests не попадают: сайт их не делает.
const INJECTED_HOSTS = [/(^|\.)kaspersky-labs\.com$/i]

function isInjected(url) {
  try {
    const host = new URL(url).hostname
    return INJECTED_HOSTS.some((re) => re.test(host))
  } catch {
    return false
  }
}

const started = Date.now()
const elapsed = () => Date.now() - started

const blocked = new Set()
const external = new Set()
let server = null
let browser = null
let finished = false
let partialReport = null

function trimMessage(text) {
  const s = String(text ?? '')
    .replace(/\u001b\[[0-9;]*m/g, '')
    .split(/\s*Call log:/)[0]
    .replace(/\s+/g, ' ')
    .trim()
  return s.length > 400 ? s.slice(0, 400) + '…' : s
}

function withTimeout(promise, ms, what) {
  let timer
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${what}: нет ответа за ${Math.round(ms / 1000)} с`)), ms)
    }),
  ]).finally(() => clearTimeout(timer))
}

// ---------- статический сервер ----------

function handle(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end()
    return
  }
  let pathname = '/'
  try {
    pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://127.0.0.1').pathname)
  } catch {
    res.writeHead(400).end()
    return
  }
  if (pathname.endsWith('/')) pathname += 'index.html'
  const file = normalize(join(DIST, pathname))
  if (file !== DIST && !file.startsWith(DIST + sep)) {
    res.writeHead(403).end()
    return
  }
  let stat
  try {
    stat = statSync(file)
  } catch {
    stat = null
  }
  if (!stat || !stat.isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('not found')
    return
  }
  res.writeHead(200, {
    'content-type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'content-length': stat.size,
    'cache-control': 'no-store',
  })
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(file).on('error', () => res.destroy()).pipe(res)
}

function listenOn(port) {
  return new Promise((resolvePromise, reject) => {
    const srv = createServer(handle)
    srv.once('error', reject)
    srv.listen(port, '127.0.0.1', () => {
      srv.off('error', reject)
      resolvePromise(srv)
    })
  })
}

async function startServer() {
  const fixed = process.env.SMOKE_PORT
  if (fixed) {
    const port = Number(fixed)
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`SMOKE_PORT не число порта: ${fixed}`)
    return { srv: await listenOn(port), port }
  }
  const tried = new Set()
  while (tried.size < 60) {
    const port = 40000 + Math.floor(Math.random() * 1000)
    if (tried.has(port)) continue
    tried.add(port)
    try {
      return { srv: await listenOn(port), port }
    } catch (error) {
      if (error?.code !== 'EADDRINUSE' && error?.code !== 'EACCES') throw error
    }
  }
  throw new Error('не нашёлся свободный порт в диапазоне 40000–40999')
}

// ---------- браузер ----------

function systemBrowsers() {
  const env = process.env
  const list = []
  if (process.platform === 'win32') {
    for (const base of [env.PROGRAMFILES, env['PROGRAMFILES(X86)'], env.LOCALAPPDATA]) {
      if (!base) continue
      list.push(join(base, 'Google', 'Chrome', 'Application', 'chrome.exe'))
      list.push(join(base, 'Chromium', 'Application', 'chrome.exe'))
      list.push(join(base, 'Microsoft', 'Edge', 'Application', 'msedge.exe'))
    }
  } else if (process.platform === 'darwin') {
    list.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    list.push('/Applications/Chromium.app/Contents/MacOS/Chromium')
  } else {
    list.push(
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/snap/bin/chromium',
    )
  }
  return list.filter((p) => existsSync(p))
}

async function launchBrowser() {
  const options = {
    headless: true,
    timeout: 20_000,
    args: ['--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio', '--disable-gpu'],
  }
  const candidates = []
  const fromEnv = process.env.CHROMIUM_PATH
  if (fromEnv) {
    if (existsSync(fromEnv)) candidates.push(fromEnv)
    else console.warn(`smoke: CHROMIUM_PATH указывает на несуществующий файл: ${fromEnv}`)
  }
  candidates.push(undefined) // браузер, который скачал playwright-core
  for (const p of systemBrowsers()) if (!candidates.includes(p)) candidates.push(p)

  const failures = []
  for (const executablePath of candidates) {
    try {
      const b = await chromium.launch({ ...options, executablePath })
      console.log(`smoke: браузер ${executablePath ?? 'playwright-core по умолчанию'} (${b.version()})`)
      return b
    } catch (error) {
      failures.push(`${executablePath ?? 'playwright-core'}: ${trimMessage(error?.message).slice(0, 160)}`)
    }
  }
  throw new Error('не удалось запустить Chromium. Задайте CHROMIUM_PATH. Попытки: ' + failures.join(' | '))
}

// ---------- прогон ----------

function isLocalUrl(url, origin) {
  if (/^(data|blob|about):/i.test(url)) return true
  try {
    return new URL(url).origin === origin
  } catch {
    return false
  }
}

// Ждёт window.__FEATURES__. Если страница уже выдала ошибку, а оболочки нет,
// ждёт ещё 2 секунды и сдаётся, не тратя все 15.
async function waitForShell(page, rec, timeout) {
  const until = Date.now() + timeout
  let firstErrorAt = 0
  while (Date.now() < until) {
    const ready = await withTimeout(
      page.evaluate(() => Array.isArray(window.__FEATURES__)),
      2000,
      'проверка оболочки',
    ).catch(() => false)
    if (ready) return
    if (rec.pageErrors.length > 0) {
      firstErrorAt ||= Date.now()
      if (Date.now() - firstErrorAt > 2000) throw new Error('приложение упало при запуске')
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error('window.__FEATURES__ так и не появился')
}

async function visit(context, base, { id, hash, needFeatures }) {
  const rec = { id, rendered: false, pageErrors: [], consoleErrors: [], featureErrors: {}, features: null, shell: false }
  const page = await context.newPage()
  page.on('pageerror', (error) => rec.pageErrors.push(trimMessage(error?.message ?? error)))
  page.on('crash', () => rec.pageErrors.push('вкладка браузера аварийно завершилась'))
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return
    const text = msg.text()
    if (IGNORED_CONSOLE.some((re) => re.test(text))) return
    rec.consoleErrors.push(trimMessage(text))
  })
  const timeout = needFeatures ? HOME_TIMEOUT_MS : PAGE_TIMEOUT_MS
  try {
    await withTimeout(page.goto(base + hash, { waitUntil: 'load', timeout }), timeout + 1000, 'загрузка страницы')
    if (needFeatures) await waitForShell(page, rec, timeout)
    await page.waitForSelector(`[data-page-id="${id}"]`, { state: 'attached', timeout })
    rec.rendered = true
    await page.waitForTimeout(SETTLE_MS)
    await withTimeout(
      page.evaluate(() => (document.fonts ? document.fonts.ready.then(() => true) : true)),
      3000,
      'шрифты',
    ).catch(() => {})
    // Снимок размером с экран телефона: так страница выглядит при открытии,
    // и закреплённая нижняя панель стоит на своём месте.
    await page
      .screenshot({ path: join(SHOTS, `${id}.png`), animations: 'disabled', timeout: 6000 })
      .catch((error) => console.warn(`smoke: снимок ${id} не получился: ${trimMessage(error?.message)}`))
  } catch (error) {
    rec.pageErrors.push(
      rec.rendered
        ? trimMessage(error?.message)
        : `страница не отрисовалась: ${trimMessage(error?.message).slice(0, 200)}`,
    )
  }
  try {
    const state = await withTimeout(
      page.evaluate(() => ({
        fe: window.__FEATURE_ERRORS__ ?? {},
        csp: window.__SMOKE_CSP__ ?? [],
        features: Array.isArray(window.__FEATURES__) ? window.__FEATURES__ : null,
        shell: Boolean(document.querySelector('[data-shell]')),
      })),
      3000,
      'состояние страницы',
    )
    if (state.fe && typeof state.fe === 'object') {
      for (const [key, list] of Object.entries(state.fe)) {
        if (Array.isArray(list) && list.length) rec.featureErrors[key] = list.map(trimMessage)
      }
    }
    for (const raw of state.csp ?? []) {
      const url = String(raw)
      if (/^(https?|wss?):/i.test(url) && !isInjected(url)) blocked.add(url)
    }
    rec.features = state.features
    rec.shell = state.shell
  } catch (error) {
    rec.pageErrors.push(trimMessage(error?.message))
  }
  await withTimeout(page.close({ runBeforeUnload: false }), 3000, 'закрытие вкладки').catch(() => {})
  return rec
}

async function runPool(items, limit, worker) {
  const results = new Array(items.length)
  let next = 0
  async function lane() {
    while (next < items.length) {
      const index = next++
      results[index] = await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, lane))
  return results
}

// Кому приписать ошибку:
// - ошибки, пойманные FeatureBoundary, — функции с этим id (ключ __FEATURE_ERRORS__);
// - прочие ошибки на странице #/f/<id> — этой функции: на странице отрисована только она;
// - прочие ошибки на главной — виджету, у которого та же ошибка была на его отдельной
//   странице (каждый виджет открывается и отдельно), иначе самой главной.
// Главная в failedFeatures не попадает никогда: её падение означает shellOk = false.
function buildReport({ shellOk, visits, skipped, fatal }) {
  const looseOf = (v) => [...v.pageErrors, ...v.consoleErrors.map((m) => `console.error: ${m}`)]
  const seenElsewhere = new Set()
  for (const v of visits) if (v.id !== 'home') for (const m of looseOf(v)) seenElsewhere.add(m)

  const entries = new Map()
  const failed = new Set()
  const entry = (id) => {
    if (!entries.has(id)) entries.set(id, { id, ok: true, errors: [] })
    return entries.get(id)
  }
  const add = (id, message) => {
    const e = entry(id)
    if (!e.errors.includes(message)) e.errors.push(message)
    e.ok = false
  }

  for (const v of visits) {
    entry(v.id)
    const caught = Object.keys(v.featureErrors)
    for (const key of caught) {
      for (const message of v.featureErrors[key]) add(key, `упала: ${message}`)
      if (key !== 'home') failed.add(key)
    }
    const loose = looseOf(v)
    if (loose.length === 0) continue
    if (v.id !== 'home') {
      for (const message of loose) add(v.id, message)
      failed.add(v.id)
      continue
    }
    for (const message of loose) if (!seenElsewhere.has(message)) add('home', message)
  }
  for (const id of skipped) add(id, 'не проверено: кончилось время прогона')
  if (fatal) add('home', fatal)

  const pages = [...entries.values()]
  const failedFeatures = [...failed].sort()
  const blockedRequests = [...blocked].slice(0, 50)
  const externalRequests = [...external].slice(0, 50)
  return {
    ok: Boolean(shellOk) && failedFeatures.length === 0 && blockedRequests.length === 0 && pages.every((p) => p.ok),
    shellOk: Boolean(shellOk),
    pages,
    failedFeatures,
    blockedRequests,
    externalRequests,
    durationMs: elapsed(),
  }
}

function writeReport(report) {
  report.durationMs = elapsed()
  writeFileSync(REPORT, JSON.stringify(report, null, 2) + '\n')
  for (const p of report.pages) {
    console.log(`${p.ok ? '  ok ' : ' FAIL'} ${p.id}${p.errors.length ? ': ' + p.errors.slice(0, 3).join(' | ') : ''}`)
  }
  if (report.blockedRequests.length) console.log(`smoke: политика безопасности отклонила: ${report.blockedRequests.join(', ')}`)
  if (report.externalRequests?.length) console.log(`smoke: запросы в интернет (в прогоне без ответа): ${report.externalRequests.join(', ')}`)
  console.log(
    `smoke: ok=${report.ok} shellOk=${report.shellOk} страниц=${report.pages.length} ` +
      `упали=[${report.failedFeatures.join(', ')}] отклонено=${report.blockedRequests.length} в интернет=${report.externalRequests?.length ?? 0} ` +
      `за ${(report.durationMs / 1000).toFixed(1)} с`,
  )
}

async function cleanup() {
  if (browser) await withTimeout(browser.close(), 5000, 'закрытие браузера').catch(() => {})
  browser = null
  if (server) {
    server.closeAllConnections?.()
    await new Promise((r) => server.close(() => r()))
    server = null
  }
}

async function main() {
  rmSync(SHOTS, { recursive: true, force: true })
  mkdirSync(SHOTS, { recursive: true })

  if (!existsSync(join(DIST, 'index.html'))) {
    return { shellOk: false, visits: [], skipped: [], fatal: 'нет dist/index.html: сначала npm run build' }
  }

  const listening = await startServer()
  server = listening.srv
  const origin = `http://127.0.0.1:${listening.port}`
  const base = `${origin}/`
  console.log(`smoke: сервер ${origin}`)

  browser = await launchBrowser()
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    locale: 'ru-RU',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    acceptDownloads: false,
  })
  context.setDefaultTimeout(PAGE_TIMEOUT_MS)
  await context.addInitScript(() => {
    window.__SMOKE_CSP__ = []
    document.addEventListener('securitypolicyviolation', (event) => {
      try {
        window.__SMOKE_CSP__.push(String(event.blockedURI || ''))
      } catch {
        // ничего
      }
    })
  })
  // запросы наружу остаются без ответа: так проверяется, что виджет живых данных
  // не падает и показывает запасные данные, когда сервис молчит
  await context.route('**/*', (route) => {
    const url = route.request().url()
    if (isLocalUrl(url, origin)) return route.continue()
    if (!isInjected(url)) external.add(url)
    return route.abort('internetdisconnected')
  })
  if (typeof context.routeWebSocket === 'function') {
    await context.routeWebSocket(/.*/, (ws) => {
      external.add(ws.url())
      ws.close()
    })
  }

  const home = await visit(context, base, { id: 'home', hash: '#/', needFeatures: true })
  const shellOk = home.rendered && home.shell && Array.isArray(home.features) && !home.featureErrors.home
  partialReport = { shellOk, visits: [home], skipped: [], fatal: null }
  if (!shellOk) {
    if (home.pageErrors.length === 0 && !home.featureErrors.home) home.pageErrors.push('оболочка или главная не отрисовались')
    return partialReport
  }

  const targets = home.features.filter((f) => f && typeof f.id === 'string' && f.id !== 'home')
  partialReport.pending = new Set(targets.map((f) => f.id))
  await runPool(targets, CONCURRENCY, async (f) => {
    if (elapsed() > VISITS_UNTIL_MS) {
      partialReport.skipped.push(f.id)
      partialReport.pending.delete(f.id)
      return
    }
    const v = await visit(context, base, { id: f.id, hash: `#/f/${encodeURIComponent(f.id)}`, needFeatures: false })
    partialReport.visits.push(v)
    partialReport.pending.delete(f.id)
  })
  return partialReport
}

async function finish(result, code) {
  if (finished) return
  finished = true
  try {
    writeReport(buildReport(result))
  } catch (error) {
    console.error('smoke: не удалось записать отчёт', error)
  }
  await cleanup().catch(() => {})
  process.exit(code)
}

const watchdog = setTimeout(() => {
  const result = partialReport ?? { shellOk: false, visits: [], skipped: [], fatal: 'прогон не уложился в отведённое время' }
  for (const id of result.pending ?? []) result.skipped.push(id)
  console.error('smoke: время вышло, прогон остановлен')
  finish(result, result.shellOk ? 0 : 1)
}, HARD_LIMIT_MS)
watchdog.unref()

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => finish(partialReport ?? { shellOk: false, visits: [], skipped: [], fatal: `прервано: ${signal}` }, 1))
}

main()
  .then((result) => finish(result, result.shellOk ? 0 : 1))
  .catch((error) => {
    console.error('smoke:', error?.message ?? error)
    const result = partialReport ?? { shellOk: false, visits: [], skipped: [], fatal: null }
    result.fatal = trimMessage(error?.message ?? error)
    finish(result, 1)
  })
