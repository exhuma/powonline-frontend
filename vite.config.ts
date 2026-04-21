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
import { VitePWA } from 'vite-plugin-pwa'
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
    }),
    VitePWA({
      registerType: 'autoUpdate',
      // Use injectManifest so we can write our own service-worker logic
      // (BackgroundSync requires custom SW code).
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'auto',
      manifest: {
        name: 'Powonline',
        short_name: 'Powonline',
        description: 'Station management and scoring for outdoor events',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
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
