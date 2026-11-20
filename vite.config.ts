import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Политика безопасности собранного сайта: всё только со своего адреса,
// никаких запросов в интернет, iframe, eval и встроенных скриптов.
// Вставляется только при сборке: в режиме разработки Vite и React
// пользуются встроенными скриптами, и с ней `npm run dev` не работал бы.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' data: blob:",
  "connect-src 'self'",
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

// node_modules на сервере смонтирован только для чтения, поэтому:
// - кэш Vite лежит в .cache/vite;
// - конфиг грузится через --configLoader runner (см. package.json),
//   иначе Vite пишет временный файл в node_modules/.vite-temp.
export default defineConfig({
  base: './',
  cacheDir: '.cache/vite',
  plugins: [react(), tailwindcss(), contentSecurityPolicy()],
  // время сборки версии: главная показывает «Обновлено в …»
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
