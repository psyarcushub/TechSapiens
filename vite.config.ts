import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Политика безопасности собранного сайта: код только свой (никаких чужих
// скриптов, iframe, eval и встроенных скриптов), а данные и картинки можно
// брать из интернета по https: курсы, погода, открытые API.
// Вставляется только при сборке: в режиме разработки Vite и React
// пользуются встроенными скриптами, и с ней `npm run dev` не работал бы.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' data: blob: https:",
  "connect-src 'self' https: wss:",
  "worker-src 'self' blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

function contentSecurityPolicy(): Plugin {
  return {
    name: 'techsapiens-csp',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP + ';' }, injectTo: 'head-prepend' },
    ],
  }
}

// Название и фраза продукта в <title> и описании страницы: их показывает превью
// ссылки в Telegram. Если паспорт не прочитался, остаётся то, что в index.html.
function productMeta(): Plugin {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  return {
    name: 'product-meta',
    apply: 'build',
    transformIndexHtml(html) {
      try {
        const p = JSON.parse(readFileSync(new URL('./src/product.json', import.meta.url), 'utf8')) as Record<string, unknown>
        const name = typeof p.name === 'string' ? p.name.trim().slice(0, 80) : ''
        const tagline = typeof p.tagline === 'string' ? p.tagline.trim().slice(0, 200) : ''
        let out = html
        if (name) out = out.replace(/<title>[^<]*<\/title>/, () => `<title>${escape(name)}</title>`)
        if (tagline) {
          out = out.replace(/<meta name="description" content="[^"]*" \/>/, () => `<meta name="description" content="${escape(tagline)}" />`)
        }
        return out
      } catch {
        return html
      }
    },
  }
}

// node_modules на сервере смонтирован только для чтения, поэтому:
// - кэш Vite лежит в .cache/vite;
// - конфиг грузится через --configLoader runner (см. package.json),
//   иначе Vite пишет временный файл в node_modules/.vite-temp.
export default defineConfig({
  base: './',
  cacheDir: '.cache/vite',
  plugins: [react(), tailwindcss(), contentSecurityPolicy(), productMeta()],
  // время сборки версии (на сайте сейчас не показывается)
  define: { __BUILD_TIME__: JSON.stringify(new Date().toISOString()) },
  resolve: {
    // '@/components/ui/button' → src/components/ui/button (компоненты shadcn/ui)
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1500,
  },
  server: {
    host: '127.0.0.1',
  },
})
