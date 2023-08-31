/* eslint-disable camelcase */
const SentryWebpackPlugin = require('@sentry/webpack-plugin')
// const CracoSwcPlugin = require('craco-swc')

const { resolve } = require('path')

const SentryPlugin = new SentryWebpackPlugin({
  org: process.env.SENTRY_ORG || 'codecov',
  project: process.env.SENTRY_PROJECT || 'gazebo',
  include: './build/static/js',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  urlPrefix: '~/static/js',
})

module.exports = {
  // plugins: [
  //   {
  //     plugin: CracoSwcPlugin,
  //   },
  // ],
  webpack: {
    devtool: 'source-map',
    configure: {
      entry: './src/index.js',
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
    plugins: [...(process.env.SENTRY_AUTH_TOKEN ? [SentryPlugin] : [])],
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^layouts/(.*)$': '<rootDir>/src/layouts/$1',
        '^ui/(.*)$': '<rootDir>/src/ui/$1',
        '^old_ui/(.*)$': '<rootDir>/src/old_ui/$1',
        '^pages/(.*)$': '<rootDir>/src/pages/$1',
        '^shared/(.*)$': '<rootDir>/src/shared/$1',
        '^services/(.*)$': '<rootDir>/src/services/$1',
        '^mocks/(.*)$': '<rootDir>/src/mocks/$1',
        '^assets/(.*)$': '<rootDir>/src/assets/$1',
        '^custom-testing-library': '<rootDir>/src/custom-testing-library',
        '^config': '<rootDir>/src/config',
        '^sentry': '<rootDir>/src/sentry',
      },
    },
  },
}
