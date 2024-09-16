import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.mjs'

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        globals: true,
        environment: ['jsdom'],
        setupFiles: './src/vitest.setup.js',
        include: ['**/*.test.*'],
      },
    })
  )
)
