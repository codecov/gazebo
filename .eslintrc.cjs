// The ESLint browser environment defines all browser globals as valid,
// even though most people don't know some of them exist (e.g. `name` or `status`).
// This is dangerous as it hides accidentally undefined variables.
// We blacklist the globals that we deem potentially confusing.
// To use them, explicitly reference them, e.g. `window.name` or `window.status`.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const restrictedGlobals = require('confusing-browser-globals')

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:tailwindcss/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'plugin:import/recommended',
    'prettier',
    'plugin:storybook/recommended',
    'plugin:tailwindcss/recommended',
  ],
  plugins: ['@vitest', 'jsx-a11y', 'import'],
  globals: {
    vi: true,
  },
  ignorePatterns: [
    '!src/**/*.{js,jsx,ts,tsx}',
    'src/old_ui/Icon/svg/*.jsx',
    'src/ui/Icon/svg/**/*.jsx',
  ],
  overrides: [
    // JS Rules
    // Copied from https://github.com/facebook/create-react-app/blob/main/packages/eslint-config-react-app/base.js
    {
      files: [
        '**/*.js?(x)',
        '**/*.cjs?(x)',
        '**/*.mjs?(x)',
        '**/*.test.js?(x)',
      ],
      parser: '@babel/eslint-parser',
      plugins: ['react'],
      extends: ['plugin:@typescript-eslint/disable-type-checked'],
      env: {
        browser: true,
        commonjs: true,
        es6: true,
        jest: true,
        node: true,
      },
      parserOptions: {
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
          presets: [require.resolve('babel-preset-react-app/prod')],
        },
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        'react/jsx-uses-vars': 'warn',
        'react/jsx-uses-react': 'warn',
      },
    },
    // TypeScript rules
    // Copied from https://github.com/facebook/create-react-app/blob/main/packages/eslint-config-react-app/index.js#L32-L92
    {
      files: ['**/*.ts?(x)', '**/*.test.ts?(x)'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: ['./tsconfig.json'],
        // typescript-eslint specific options
        warnOnUnsupportedTypeScriptVersion: true,
      },
      plugins: ['@typescript-eslint'],
      rules: {
        // No prop-types definitions required for typed React components
        'react/prop-types': 'off',
        // TypeScript's `noFallthroughCasesInSwitch` option is more robust (#6906)
        'default-case': 'off',
        // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/291)
        'no-dupe-class-members': 'off',
        // 'tsc' already handles this (https://github.com/typescript-eslint/typescript-eslint/issues/477)
        'no-undef': 'off',

        // Add TypeScript specific rules (and turn off ESLint equivalents)
        '@typescript-eslint/consistent-type-assertions': 'warn',
        'no-array-constructor': 'off',
        '@typescript-eslint/no-array-constructor': 'warn',
        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': 'warn',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': [
          'warn',
          {
            functions: false,
            classes: false,
            variables: false,
            typedefs: false,
          },
        ],
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': [
          'error',
          {
            allowShortCircuit: true,
            allowTernary: true,
            allowTaggedTemplates: true,
          },
        ],
        'no-unused-vars': 'off',
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
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
      files: ['**/*.js?(x)', '**/*.ts?(x)'],
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
      files: ['*.stories.jsx', '*.stories.tsx'],
      rules: {
        'import/no-anonymous-default-export': 'off',
        // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
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
      config: 'tailwind.config.mjs',
      cssFiles: ['src/**/*.css'],
      cssFilesRefreshRate: 5000,
      removeDuplicates: true,
      skipClassAttribute: false,
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-vars': 'warn',
    'react/jsx-uses-react': 'warn',
    'react/prefer-stateless-function': ['error'],
    'react/prop-types': [
      'warn',
      { ignore: ['children', 'context', 'className'] },
    ],
    camelcase: ['error', { properties: 'always' }],
    'sort-imports': ['warn', { ignoreCase: true, ignoreDeclarationSort: true }],
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
          { pattern: 'react', group: 'external', position: 'before' },
          { pattern: 'prop-types', group: 'external', position: 'before' },
          {
            pattern: 'custom-testing-library',
            group: 'external',
            position: 'before',
          },
          { pattern: 'testing-library', group: 'external', position: 'before' },
          { pattern: 'mocks', group: 'internal', position: 'before' },
          { pattern: 'assets', group: 'internal', position: 'before' },
          { pattern: 'layouts', group: 'internal' },
          { pattern: 'ui', group: 'internal', position: 'after' },
          { pattern: 'old_ui', group: 'internal', position: 'after' },
          { pattern: 'services', group: 'internal', position: 'before' },
          { pattern: 'shared', group: 'internal', position: 'before' },
          { pattern: 'pages', group: 'internal' },
          { pattern: 'config', group: 'internal', position: 'before' },
          { pattern: 'sentry', group: 'internal', position: 'before' },
          { pattern: 'types', group: 'internal', position: 'before' },
        ],
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always',
      },
    ],
    // Everything below, copied from https://github.com/facebook/create-react-app/blob/main/packages/eslint-config-react-app/index.js#L97
    // http://eslint.org/docs/rules/
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],

    // custom applied base rules
    'array-callback-return': 'warn',
    'default-case': ['warn', { commentPattern: '^no default$' }],
    eqeqeq: ['warn', 'smart'],
    'no-array-constructor': 'warn',
    'no-caller': 'warn',
    'no-eval': 'warn',
    'no-extend-native': 'warn',
    'no-extra-bind': 'warn',
    'no-extra-label': 'warn',
    'no-implied-eval': 'warn',
    'no-iterator': 'warn',
    'no-label-var': 'warn',
    'no-labels': ['warn', { allowLoop: true, allowSwitch: false }],
    'no-lone-blocks': 'warn',
    'no-loop-func': 'warn',
    'no-multi-str': 'warn',
    'no-new-func': 'warn',
    'no-object-constructor': 'warn',
    'no-new-wrappers': 'warn',
    'no-octal-escape': 'warn',
    'no-restricted-syntax': ['warn', 'WithStatement'],
    'no-script-url': 'warn',
    'no-self-compare': 'warn',
    'no-sequences': 'warn',
    'no-template-curly-in-string': 'warn',
    'no-throw-literal': 'warn',
    'no-restricted-globals': ['error'].concat(restrictedGlobals),
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    'no-use-before-define': [
      'warn',
      {
        functions: false,
        classes: false,
        variables: false,
      },
    ],
    'no-useless-computed-key': 'warn',
    'no-useless-concat': 'warn',
    'no-useless-constructor': 'warn',
    'no-useless-rename': [
      'warn',
      {
        ignoreDestructuring: false,
        ignoreImport: false,
        ignoreExport: false,
      },
    ],
    strict: ['warn', 'never'],
    'unicode-bom': ['warn', 'never'],
    'no-restricted-properties': [
      'error',
      {
        object: 'require',
        property: 'ensure',
        message:
          'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
      },
      {
        object: 'System',
        property: 'import',
        message:
          'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
      },
    ],

    // https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules
    'import/first': 'error',
    'import/no-amd': 'error',
    'import/no-anonymous-default-export': 'warn',
    'import/no-webpack-loader-syntax': 'error',

    // https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules
    'react/forbid-foreign-prop-types': ['warn', { allowInPropTypes: true }],
    'react/jsx-pascal-case': ['warn', { allowAllCaps: true, ignore: [] }],
    'react/no-typos': 'error',
    'react/style-prop-object': 'warn',

    // https://github.com/evcohen/eslint-plugin-jsx-a11y/tree/master/docs/rules
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-has-content': 'warn',
    'jsx-a11y/anchor-is-valid': [
      'warn',
      { aspects: ['noHref', 'invalidHref'] },
    ],
    'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-role': ['warn', { ignoreNonDOM: true }],
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/heading-has-content': 'warn',
    'jsx-a11y/iframe-has-title': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'jsx-a11y/no-access-key': 'warn',
    'jsx-a11y/no-distracting-elements': 'warn',
    'jsx-a11y/no-redundant-roles': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'jsx-a11y/scope': 'warn',

    // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    'no-restricted-syntax': [
      'warn',
      {
        selector: "Literal[value=/\\bGithub\\b|\\bGitlab\\b/]",
        message: "Use correct casing (GitHub, GitLab)"
      }
    ]
  },
}
