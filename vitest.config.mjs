import { defineConfig, mergeConfig } from 'vitest/config'

import ViteConfig from './vite.config.mjs'

// See for more details: https://vitest.dev/config/#coverage-exclude
const EXCLUDE_FROM_TESTING = [
  // Default exclude patterns
  '**/node_modules/**',
  '**/dist/**',
  '**/cypress/**',
  '**/.{idea,git,cache,output,temp}/**',
  '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
  // Custom exclude patterns
  'src/**/*.spec.*',
  'src/**/*.stories.*',
]

const EXCLUDE_FROM_COVERAGE = [
  ...EXCLUDE_FROM_TESTING,
  'repo-jest-setup.jsx',
  'vitest.setup.ts',
  'custom-testing-library.js',
  'setupTestGlobal.js',
  'setupTests.js',
  'setupProxy.js',
  'ts-override.d.ts',
  'types.ts',
  'vite-env.d.ts',
]

const VitestConfig = defineConfig((config) => {
  const reporters = []
  if (process.env.ENABLE_TEST_REPORTER) {
    reporters.push(['junit', { outputFile: 'reports/junit/junit.xml' }])
  }

  return {
    test: {
      coverage: {
        include: ['src/**/*'],
        exclude: EXCLUDE_FROM_COVERAGE,
        provider: 'istanbul',
        reporters: [['text'], ['html', { outputFile: 'coverage/index.html' }]],
        reportOnFailure: true,
      },
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/vitest.setup.ts',
      reporters: reporters,
      include: ['src/**/*.test.*'],
      exclude: EXCLUDE_FROM_TESTING,
    },
  }
})

export default defineConfig((configEnv) =>
  mergeConfig(ViteConfig(configEnv), VitestConfig(configEnv))
)
