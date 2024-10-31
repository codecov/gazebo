import { codecovVitePlugin } from '@codecov/vite-plugin'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import svgr from 'vite-plugin-svgr'
import legacy from '@vitejs/plugin-legacy'
import { ViteReactSourcemapsPlugin } from '@acemarke/react-prod-sourcemaps'

export default defineConfig((config) => {
  const env = loadEnv(config.mode, process.cwd(), 'REACT_APP')

  const envWithProcessPrefix = {
    'process.env': `${JSON.stringify(env)}`,
  }

  const plugins = []
  if (
    process.env.CODECOV_API_URL &&
    process.env.CODECOV_ORG_TOKEN &&
    process.env.UPLOAD_CODECOV_BUNDLE_STATS === 'true'
  ) {
    plugins.push(
      codecovVitePlugin({
        enableBundleAnalysis:
          process.env.UPLOAD_CODECOV_BUNDLE_STATS === 'true',
        bundleName: process.env.CODECOV_BUNDLE_NAME,
        apiUrl: process.env.CODECOV_API_URL,
        uploadToken: process.env.CODECOV_ORG_TOKEN,
        debug: true
      })
    )
  }

  const runSentryPlugin =
    config.mode === 'production' && !!process.env.SENTRY_AUTH_TOKEN
  if (runSentryPlugin) {
    plugins.push(
      ViteReactSourcemapsPlugin({
        debug: false,
        preserve: false,
      }),
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
    server: {
      port: 3000,
    },
    build: {
      outDir: 'build',
      sourcemap: runSentryPlugin,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].[hash:22].js',
          chunkFileNames: 'assets/[name].[hash:22].js',
          assetFileNames: 'assets/[name].[hash:22][extname]',
        },
      },
    },
    define: envWithProcessPrefix,
    plugins: [
      ViteEjsPlugin({
        isProduction: process.env.REACT_APP_ENV === 'production',
        REACT_APP_PENDO_KEY: process.env.REACT_APP_PENDO_KEY,
      }),
      tsconfigPaths(),
      legacy({
        // which legacy browsers to support
        targets: ['>0.2%', 'not dead', 'not op_mini all'],
        // which polyfills to include in the modern build
        modernPolyfills: ['es.promise.all-settled'],
      }),
      react(),
      svgr(),
      ...plugins,
    ],
  }
})
