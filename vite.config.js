import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Injects <meta name="robots" content="noindex"> into the built index.html
// when building with `--mode dev-preview` (see package.json's deploy:dev),
// so the dev.dolphintennis.com preview build never gets indexed even if its
// URL leaks — the production build (default mode) is untouched.
function noindexForDevPreview() {
  return {
    name: 'noindex-for-dev-preview',
    transformIndexHtml(html, ctx) {
      if (ctx.server) return html // never touch the local dev server
      return html.replace('<head>', '<head>\n    <meta name="robots" content="noindex, nofollow" />')
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === 'dev-preview' && noindexForDevPreview()].filter(Boolean),
}))
