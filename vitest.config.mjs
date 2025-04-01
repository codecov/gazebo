import { loadEnv } from 'vite'
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
  'src/**/*.mocks.*',
  'src/pages/RepoPage/CoverageTab/OverviewTab/subroute/FileExplorer/FlagMultiSelect.test.jsx', // Temp: ignoring flakes
]

const EXCLUDE_FROM_COVERAGE = [
  ...EXCLUDE_FROM_TESTING,
  'src/**/*.test.*',
  'repo-test-setup.jsx',
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
  const reporters = ['default']
  if (process.env.ENABLE_TEST_REPORTER) {
    reporters.push(['junit', { outputFile: 'reports/junit/junit.xml' }])
  }

  if (process.env.GITHUB_ACTIONS) {
    reporters.push('github-actions')
  }

  const env = loadEnv(config.mode, process.cwd(), 'REACT_APP')

  return {
    test: {
      env: env,
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
