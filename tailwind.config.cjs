const defaultTheme = require('tailwindcss/defaultTheme')

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue) {
      return `rgba(var(${variableName}), ${opacityValue})`
    }
    return `rgb(var(${variableName}))`
  }
}

module.exports = {
  content: [
    './src/**/*.{css,js,jsx,ts,tsx}',
    './src/*.{css,js,jsx,ts,tsx}',
    './public/*.html',
    './index.html',
  ],
  mode: 'jit',
  darkMode: 'selector',
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
        mono: ['"Source Code Pro"', ...defaultTheme.fontFamily.mono],
        lato: ['Lato', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        transparent: `transparent`,
        ds: {
          background: withOpacity('--color-app-background'),
          container: withOpacity('--color-app-container'),
          'default-text': withOpacity('--color-app-text-primary'),
          'secondary-text': withOpacity('--color-app-text-secondary'),
          'border-line': withOpacity('--color-app-border-line'),
          'chart-area-stroke': withOpacity('--color-chart-area-stroke'),
          'sub-background': withOpacity('--color-app-sub-background'),
          'sub-hover-background': withOpacity(
            '--color-app-sub-hover-background'
          ),
          'summary-container': withOpacity('--color-ds-summary-dropdown'),
          pink: {
            default: withOpacity('--color-ds-pink-default'),
            secondary: withOpacity('--color-ds-pink-secondary'),
            tertiary: withOpacity('--color-ds-pink-tertiary'),
          },
          blue: {
            default: withOpacity('--color-ds-blue-default'),
            light: withOpacity('--color-ds-blue-light'),
            medium: withOpacity('--color-ds-blue-medium'),
            darker: withOpacity('--color-ds-blue-darker'),
            quinary: withOpacity('--color-ds-blue-quinary'),
            septenary: withOpacity('--color-ds-blue-septenary'),
            senary: withOpacity('--color-ds-blue-senary'),
            selected: withOpacity('--color-ds-blue-selected'),
            nonary: withOpacity('--color-ds-blue-nonary'),
          },
          gray: {
            default: withOpacity('--color-ds-gray-default'),
            primary: withOpacity('--color-ds-gray-primary'),
            secondary: withOpacity('--color-ds-gray-secondary'),
            tertiary: withOpacity('--color-ds-gray-tertiary'),
            quaternary: withOpacity('--color-ds-gray-quaternary'),
            quinary: withOpacity('--color-ds-gray-quinary'),
            senary: withOpacity('--color-ds-gray-senary'),
            octonary: withOpacity('--color-ds-gray-octonary'),
          },
          primary: {
            green: withOpacity('--color-ds-primary-green'),
            red: withOpacity('--color-ds-primary-red'),
            purple: withOpacity('--color-ds-primary-purple'),
            yellow: withOpacity('--color-ds-primary-yellow'),
            base: withOpacity('--color-ds-primary-base'),
          },
          coverage: {
            covered: withOpacity('--color-ds-coverage-covered'),
            uncovered: withOpacity('--color-ds-coverage-uncovered'),
            partial: withOpacity('--color-ds-coverage-partial'),
          },
          error: {
            quinary: withOpacity('--color-ds-error-quinary'),
            nonary: withOpacity('--color-ds-error-nonary'),
          },
        },
        codecov: {
          orange: withOpacity('--color-codecov-orange'),
          footer: withOpacity('--color-codecov-footer'),
          code: withOpacity('--color-codecov-code'),
        },
        gray: {
          100: withOpacity('--color-ds-gray-primary'),
          200: withOpacity('--color-ds-gray-secondary'),
          300: withOpacity('--color-gray-300'),
          400: withOpacity('--color-ds-gray-quaternary'),
          500: withOpacity('--color-ds-gray-quinary'),
          600: withOpacity('--color-ds-gray-senary'),
          800: withOpacity('--color-ds-gray-octonary'),
          900: withOpacity('--color-ds-gray-default'),
        },
        pink: {
          100: withOpacity('--color-ds-pink-secondary'),
          500: withOpacity('--color-ds-pink-default'),
          900: withOpacity('--color-ds-pink-tertiary'),
        },
        blue: {
          100: withOpacity('--color-ds-blue-light'),
          200: withOpacity('--color-ds-blue-medium'),
          400: withOpacity('--color-ds-blue-default'),
          600: withOpacity('--color-ds-blue-darker'),
          800: withOpacity('--color-ds-blue-quinary'),
          900: withOpacity('--color-ds-blue-senary'),
        },
        orange: {
          100: withOpacity('--color-orange-100'),
          500: withOpacity('--color-orange-500'),
        },
        green: {
          100: withOpacity('--color-green-100'),
          500: withOpacity('--color-green-500'),
        },
        warning: {
          900: withOpacity('--color-warning-900'),
          500: withOpacity('--color-ds-primary-yellow'),
          100: withOpacity('--color-success-100'),
        },
        success: {
          100: withOpacity('--color-success-100'),
          500: withOpacity('--color-success-500'),
          700: withOpacity('--color-ds-primary-green'),
          900: withOpacity('--color-ds-gray-default'),
        },
        error: {
          100: withOpacity('--color-error-100'),
          500: withOpacity('--color-ds-error-quinary'),
          900: withOpacity('--color-ds-error-nonary'),
        },
        info: {
          100: withOpacity('--color-info-100'),
          500: withOpacity('--color-info-500'),
          900: withOpacity('--color-info-900'),
        },
        github: withOpacity('--color-github'),
        'github-text': withOpacity('--color-github-text'),
        gitlab: withOpacity('--color-gitlab'),
        bitbucket: withOpacity('--color-bitbucket'),
        okta: withOpacity('--color-okta'),
        'okta-text': withOpacity('--color-okta-text'),
        'code-default': withOpacity('--color-code-default'),
        'code-keyword': withOpacity('--color-code-keyword'),
        'code-line-number': withOpacity('--color-code-line-number'),
        'code-comment': withOpacity('--color-code-comment'),
        'code-punctuation': withOpacity('--color-code-punctuation'),
        'code-function': withOpacity('--color-code-function'),
        'code-property': withOpacity('--color-code-property'),
        'code-operator': withOpacity('--color-code-operator'),
        modal: {
          header: withOpacity('--color-modal-header'),
          footer: withOpacity('--color-modal-footer'),
        },
        toggle: {
          active: withOpacity('--color-toggle-active'),
          inactive: withOpacity('--color-toggle-inactive'),
          disabled: withOpacity('--color-toggle-disabled'),
        },
      },
      screens: {
        print: { raw: 'print' },
      },
      backgroundImage: {
        'enterprise-banner-bg': "url('/src/assets/enterprise-banner-bg.png')",
      },
      keyframes: {
        slideDown: {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        slideUp: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        slideDown: 'slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        slideUp: 'slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/container-queries')],
}
