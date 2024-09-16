import { defineConfig, mergeConfig } from 'vitest/config'

import ViteConfig from './vite.config.mjs'

const VitestConfig = defineConfig((config) => {
  const reporters = []
  if (process.env.ENABLE_TEST_REPORTER) {
    reporters.push(['junit', { outputFile: 'reports/junit/junit.xml' }])
  }

  return {
    test: {
      coverage: {
        include: ['src/**/*'],
        provider: 'v8',
        reporters: [['text'], ['html', { outputFile: 'coverage/index.html' }]],
        reportOnFailure: true,
      },
      globals: true,
      environment: ['jsdom'],
      setupFiles: './src/vitest.setup.js',
      reporters: reporters,
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
  }
})

export default defineConfig((configEnv) =>
  mergeConfig(ViteConfig(configEnv), VitestConfig(configEnv))
)
