/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  _comment:
    "Stryker's react suport does not yet include CRA 5.0, so I'm setting the babel config manually with mutator plugins. TODO setup for lint-stagged 'npx stryker run --reporters json --mutate'",
  testRunner: 'jest',
  reporters: ['progress', 'clear-text', 'html'],
  mutate: [
    'src/pages/CommitPage/**/*.js',
    'src/pages/CommitPage/*.js',
    'src/pages/ComparePage/**/*.js',
    'src/pages/ComparePage/*.js',
    '!**/*.spec.js',
    '!**/*.stories.js',
  ],
  mutator: {
    plugins: ['jsx'],
  },
  concurrency: 10, // Defaults to 4, surfacing for CircleCI configs
  jest: {
    projectType: 'create-react-app',
  },
}
