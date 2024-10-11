/* eslint-disable camelcase */
const { codecovWebpackPlugin } = require('@codecov/webpack-plugin')

const { resolve } = require('path')

module.exports = {
  webpack: {
    devtool: 'source-map',
    configure: {
      entry: './src/index.tsx',
    },
    alias: {
      layouts: resolve(__dirname, 'src/layouts'),
      ui: resolve(__dirname, 'src/ui'),
      old_ui: resolve(__dirname, 'src/old_ui'),
      pages: resolve(__dirname, 'src/pages'),
      shared: resolve(__dirname, 'src/shared'),
      services: resolve(__dirname, 'src/services'),
      mocks: resolve(__dirname, 'src/layouts'),
      assets: resolve(__dirname, 'src/assets'),
      'custom-testing-library': resolve(
        __dirname,
        'src/custom-testing-library'
      ),
      config: resolve(__dirname, 'src/config'),
      sentry: resolve(__dirname, 'src/sentry'),
    },
    plugins: [
      ...(process.env.CODECOV_ORG_TOKEN && process.env.CODECOV_API_URL
        ? [
            codecovWebpackPlugin({
              enableBundleAnalysis: true,
              bundleName: process.env.CODECOV_BUNDLE_NAME,
              apiUrl: process.env.CODECOV_API_URL,
              uploadToken: process.env.CODECOV_ORG_TOKEN,
            }),
          ]
        : []),
    ],
  },
}
