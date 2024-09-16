import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.mjs'

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        coverage: {
          provider: 'v8',
          reporters: [
            ['text'],
            ['html', { outputFile: 'coverage/index.html' }],
          ],
          reportOnFailure: true,
        },
        globals: true,
        environment: ['jsdom'],
        setupFiles: './src/vitest.setup.js',
        reporters: ['junit', { outputFile: 'reports/junit/junit.xml' }],
        include: ['src/**/*.test.*'],
        exclude: [
          // Default exclude patterns
          '**/node_modules/**',
          '**/dist/**',
          '**/cypress/**',
          '**/.{idea,git,cache,output,temp}/**',
          '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
          // Custom exclude patterns
          'src/**/*.spec.*',
        ],
      },
    })
  )
)
