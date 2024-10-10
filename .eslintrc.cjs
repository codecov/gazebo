module.exports = {
  extends: [
    'react-app',
    'plugin:tailwindcss/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'plugin:react/recommended',
    'plugin:import/recommended',
    'prettier',
    'plugin:storybook/recommended',
    'plugin:tailwindcss/recommended',
  ],
  plugins: ['@vitest'],
  globals: {
    vi: true,
  },
  ignorePatterns: [
    '!src/**/*.{js,jsx,ts,tsx}',
    'src/old_ui/Icon/svg/*.jsx',
    'src/ui/Icon/svg/**/*.jsx',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prefer-stateless-function': ['error'],
    'react/prop-types': [
      'warn',
      {
        ignore: ['children', 'context', 'className'],
      },
    ],
    camelcase: ['error', { properties: 'always' }],
    'sort-imports': [
      'warn',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
    'import/order': [
      'warn',
      {
        groups: [
          'external',
          'builtin',
          'internal',
          'sibling',
          'parent',
          'index',
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'prop-types',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'custom-testing-library',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'testing-library',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'mocks',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: 'assets',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: 'layouts',
            group: 'internal',
          },
          {
            pattern: 'ui',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'old_ui',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'services',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: 'shared',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: 'pages',
            group: 'internal',
          },
          {
            pattern: 'config',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: 'sentry',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: 'types',
            group: 'internal',
            position: 'before',
          },
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'always',
      },
    ],
  },
  overrides: [
    // Testing Library
    {
      extends: ['plugin:testing-library/react'],
      files: ['**/__tests__/**/*', '**/*.{spec,test}.*'],
      rules: {
        // previous rules we had set already in Gazebo
        'testing-library/no-node-access': 'warn',
        'testing-library/prefer-screen-queries': 'warn',
        'testing-library/no-render-in-lifecycle': 'warn',
        'testing-library/no-unnecessary-act': 'warn',
        'testing-library/await-async-utils': 'warn',
        'testing-library/prefer-find-by': 'warn',
        'testing-library/await-async-events': 'warn',
        'testing-library/no-global-regexp-flag-in-query': 'warn',
        'testing-library/no-manual-cleanup': 'off',
        'testing-library/prefer-user-event': 'warn',
        'testing-library/prefer-explicit-assert': 'warn',

        // copied from https://github.com/facebook/create-react-app/blob/main/packages/eslint-config-react-app/jest.js
        'testing-library/await-async-queries': 'error',
        'testing-library/no-await-sync-queries': 'error',
        'testing-library/no-container': 'error',
        'testing-library/no-debugging-utils': 'error',
        'testing-library/no-dom-import': ['error', 'react'],
        'testing-library/no-promise-in-fire-event': 'error',
        'testing-library/no-wait-for-multiple-assertions': 'error',
        'testing-library/no-wait-for-side-effects': 'error',
        'testing-library/no-wait-for-snapshot': 'error',
        'testing-library/prefer-presence-queries': 'error',
        'testing-library/prefer-query-by-disappearance': 'error',
        'testing-library/render-result-naming-convention': 'error',
      },
    },
    // UI Rules
    {
      files: [
        'src/ui/**/*.js',
        'src/ui/*.js',
        'src/ui/**/*.jsx',
        'src/ui/*.jsx',
        'src/ui/**/*.ts',
        'src/ui/*.ts',
        'src/ui/**/*.tsx',
        'src/ui/*.tsx',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'services',
                message: 'The design system cannot depend on services',
              },
              {
                name: 'layouts',
                message: 'The design system cannot depend on layouts',
              },
              {
                name: 'pages',
                message: 'The design system cannot depend on pages',
              },
            ],
            patterns: ['services/**', 'layouts/**', 'pages/**'],
          },
        ],
      },
    },
    // Services Rules
    {
      files: [
        'src/services/**/*.js',
        'src/services/*.js',
        'src/services/**/*.jsx',
        'src/services/*.jsx',
        'src/services/**/*.ts',
        'src/services/*.ts',
        'src/services/**/*.tsx',
        'src/services/*.tsx',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'ui',
                message: 'Services should not render components',
              },
              {
                name: 'layouts',
                message: 'Services should not render components',
              },
              {
                name: 'pages',
                message: 'Services should not render components',
              },
            ],
            patterns: ['ui/**', 'layouts/**', 'pages/**'],
          },
        ],
      },
    },
    // All
    {
      files: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'Launch Darkly',
                message:
                  "Always access Launch Darkly through 'shared/featureFlags instead",
              },
              {
                name: 'lodash',
                message: 'Import [module] from lodash/[module] instead',
              },
            ],
            patterns: ['launchdarkly-react-client-sdk'],
          },
        ],
      },
    },
    // TypeScript rules
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      rules: {
        // No prop-types definitions required for typed React components
        'react/prop-types': 'off',
      },
    },
    // Testing Rules
    {
      files: [
        '*-test.js',
        '*.spec.js',
        '*.test.js',
        '*-test.jsx',
        '*.spec.jsx',
        '*.test.jsx',
        '*-test.ts',
        '*.spec.ts',
        '*.test.ts',
        '*-test.tsx',
        '*.spec.tsx',
        '*.test.tsx',
      ],
      rules: {
        'react/display-name': 'off',
        camelcase: 'off',
      },
    },
    // Story Rules
    {
      files: ['*.stories.jsx'],
      rules: {
        'import/no-anonymous-default-export': 'off',
      },
    },
  ],
  settings: {
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/resolver': {
      alias: {
        map: [
          ['layouts', './src/layouts'],
          ['ui', './src/ui'],
          ['old_ui', './src/old_ui'],
          ['pages', './src/pages'],
          ['shared', './src/shared'],
          ['services', './src/services'],
          ['mocks', './src/mocks'],
          ['assets', './src/assets'],
          ['custom-testing-library', './src/custom-testing-library'],
          ['config', './src/config'],
          ['sentry', './src/sentry'],
          ['types', './src/types'],
        ],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    },
    tailwindcss: {
      callees: ['classnames', 'clsx', 'ctl', 'cn'],
      config: 'tailwind.config.js',
      cssFiles: ['src/**/*.css'],
      cssFilesRefreshRate: 5000,
      removeDuplicates: true,
      skipClassAttribute: false,
    },
  },
}
