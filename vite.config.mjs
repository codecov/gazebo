import { codecovVitePlugin } from '@codecov/vite-plugin'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import svgr from 'vite-plugin-svgr'

export default defineConfig((config) => {
  const env = loadEnv(config.mode, process.cwd(), 'REACT_APP')

  const envWithProcessPrefix = {
    'process.env': `${JSON.stringify(env)}`,
  }

  const plugins = []
  if (
    process.env.UPLOAD_CODECOV_BUNDLE_STATS &&
    process.env.CODECOV_API_URL &&
    process.env.CODECOV_ORG_TOKEN
  ) {
    plugins.push(
      codecovVitePlugin({
        enableBundleAnalysis: true,
        bundleName: process.env.CODECOV_BUNDLE_NAME,
        apiUrl: process.env.CODECOV_API_URL,
        uploadToken: process.env.CODECOV_ORG_TOKEN,
      })
    )
  }

  if (config.mode === 'production') {
    plugins.push(
      sentryVitePlugin({
        applicationKey: 'gazebo',
        org: process.env.SENTRY_ORG || 'codecov',
        project: process.env.REACT_APP_SENTRY_PROJECT || 'gazebo',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: {
          name: process.env.GAZEBO_SHA,
          deploy: {
            env:
              process.env.REACT_APP_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
          },
        },
      })
    )
  }

  return {
    base: env.REACT_APP_BASE_URL,
    server: {
      port: 3000,
    },
    build: {
      outDir: 'build',
      sourcemap: config.mode === 'production',
    },
    define: envWithProcessPrefix,
    plugins: [
      ViteEjsPlugin({
        isProduction: config.mode === 'production',
        REACT_APP_PENDO_KEY: process.env.REACT_APP_PENDO_KEY,
      }),
      tsconfigPaths(),
      react(),
      svgr(),
      ...plugins,
    ],
  }
})
