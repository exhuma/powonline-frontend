import fs from 'fs'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import MdContainer from 'markdown-it-container'
import MarkdownIt from 'markdown-it'
import mdPlugin from 'vite-plugin-markdown'
import { Mode } from 'vite-plugin-markdown'
import packageJson from './package.json'

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

/**
 * Write the application version to a file in the dist folder
 */
function writeVersionPlugin(): import('vite').Plugin {
  return {
    name: 'write-version-plugin',
    closeBundle() {
      const outputPath = path.resolve(__dirname, 'dist', 'version.txt')
      fs.writeFileSync(outputPath, `${packageJson.version}`, {
        encoding: 'utf8'
      })
      console.log(`Version ${packageJson.version} written to dist/version.txt`)
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true
  },
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    writeVersionPlugin(),
    mdPlugin({
      mode: [Mode.HTML],
      markdownIt: mdi
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  },
  test: {
    setupFiles: ['tests/setup.ts'],
    environment: 'jsdom',
    coverage: {
      all: true
    }
  }
})
