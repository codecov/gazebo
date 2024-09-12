import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import svgr from 'vite-plugin-svgr'

export default defineConfig((config) => {
  const env = loadEnv(config.mode, process.cwd(), "REACT_APP_")

  const envWithProcessPrefix = {
    'process.env': `${JSON.stringify(env)}`,
  }

  return {
    base: env.REACT_APP_BASE_URL,
    server: {
      port: 3000,
    },
    build: {
      outDir: 'build',
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
    ],
  }
})
