import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import vue2 from '@vitejs/plugin-vue2'
import MdContainer from 'markdown-it-container'
import MarkdownIt from 'markdown-it'
import mdPlugin from 'vite-plugin-markdown'
import { Mode } from 'vite-plugin-markdown'

const mdi = MarkdownIt()
mdi.use(MdContainer, 'admonition', {
  validate: function (params) {
    const match = params.trim().match(/^admonition(?:\s+(.*))?$/)
    if (!match) {
      console.error(`${params} did not match the admonition pattern`)
      return false
    }
    return true
  },
  render: function (tokens, idx) {
    const match = tokens[idx].info.trim().match(/^admonition(?:\s+(.*))?$/)
    const variant = match && match[1] ? ` ${match[1]}` : ''
    if (tokens[idx].nesting === 1) {
      return `<div class="admonition${variant}">`
    } else {
      return '</div>'
    }
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue2(),
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    mdPlugin({
      mode: [Mode.HTML],
      markdownIt: mdi
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
