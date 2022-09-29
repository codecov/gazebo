const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './src/**/*.js',
    './src/*.js',
    './public/*.html',
    './src/**/*.jsx',
    './src/*.jsx',
  ],
  plugins: [require('@tailwindcss/line-clamp')],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
        mono: ['"Source Code Pro"', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        transparent: `transparent`,
        ds: {
          pink: {
            DEFAULT: 'var(--color-ds-pink-default)',
            secondary: 'var(--color-ds-pink-secondary)',
            tertiary: 'var(--color-ds-pink-tertiary)',
            quinary: 'var(--color-ds-pink-default)',
          },
          blue: {
            DEFAULT: 'var(--color-ds-blue-default)',
            light: 'var(--color-ds-blue-light)',
            medium: 'var(--color-ds-blue-medium)',
            darker: 'var(--color-ds-blue-darker)',
            quinary: 'var(--color-ds-blue-quinary)',
            senary: 'var(--color-ds-blue-senary)',
            selected: 'var(--color-ds-blue-selected)',
          },
          gray: {
            DEFAULT: 'var(--color-ds-gray-default)',
            primary: 'var(--color-ds-gray-primary)',
            secondary: 'var(--color-ds-gray-secondary)',
            tertiary: 'var(--color-ds-gray-tertiary)',
            quaternary: 'var(--color-ds-gray-quaternary)',
            quinary: 'var(--color-ds-gray-quinary)',
            senary: 'var(--color-ds-gray-senary)',
            octonary: 'var(--color-ds-gray-octonary)',
            nonary: 'var(--color-ds-gray-default)',
          },
          primary: {
            green: 'var(--color-ds-primary-green)',
            red: 'var(--color-ds-primary-red)',
            purple: 'var(--color-ds-primary-purple)',
            yellow: 'var(--color-ds-primary-yellow)',
          },
          coverage: {
            covered: 'var(--color-success-100)',
            uncovered: 'var(--color-error-100)',
            partial: 'var(--color-ds-coverage-partial)',
          },
          error: {
            quinary: 'var(--color-ds-error-quinary)',
            nonary: 'var(--color-ds-error-nonary)',
          },
        },
        codecov: {
          red: 'var(--color-ds-primary-red)',
          orange: 'var(--color-codecov-orange)',
          footer: 'var(--color-codecov-footer)',
        },
        gray: {
          100: 'var(--color-ds-gray-primary)',
          200: 'var(--color-ds-gray-secondary)',
          300: 'var(--color-gray-300)',
          400: 'var(--color-ds-gray-quaternary)',
          500: 'var(--color-ds-gray-quinary)',
          600: 'var(--color-ds-gray-senary)',
          800: 'var(--color-ds-gray-octonary)',
          900: 'var(--color-ds-gray-default)',
        },
        pink: {
          100: 'var(--color-ds-pink-secondary)',
          500: 'var(--color-ds-pink-default)',
          900: 'var(--color-ds-pink-tertiary)',
        },
        blue: {
          100: 'var(--color-ds-blue-light)',
          200: 'var(--color-ds-blue-medium)',
          400: 'var(--color-ds-blue-default)',
          600: 'var(--color-ds-blue-darker)',
          800: 'var(--color-ds-blue-quinary)',
          900: 'var(--color-ds-blue-senary)',
        },
        orange: {
          100: 'var(--color-orange-100)',
          500: 'var(--color-orange-500)',
        },
        warning: {
          900: 'var(--color-warning-900)',
          500: 'var(--color-ds-primary-yellow)',
          100: 'var(--color-success-100)',
        },
        success: {
          100: 'var(--color-success-100)',
          500: 'var(--color-success-500)',
          700: 'var(--color-ds-primary-green)',
          900: 'var(--color-ds-gray-default)',
        },
        error: {
          100: 'var(--color-error-100)',
          500: 'var(--color-ds-error-quinary)',
          900: 'var(--color-ds-error-nonary)',
        },
        info: {
          100: 'var(--color-info-100)',
          500: 'var(--color-info-500)',
          900: 'var(--color-info-900)',
        },
        github: 'var(--color-github)',
        gitlab: 'var(--color-gitlab)',
        bitbucket: 'var(--color-bitbucket)',
      },
      boxShadow: {
        card: '0 7px 20px 0 rgba(34,47,61,0.05)',
      },
      screens: {
        print: { raw: 'print' },
      },
      backgroundImage: {
        'enterprise-banner-bg': "url('/src/assets/enterprise-banner-bg.png')",
      },
    },
  },
  variants: {
    extend: {
      textColor: ['disabled'],
      margin: ['responsive', 'first', 'last', 'first-letter'],
      opacity: ['disabled', 'hover'],
      cursor: ['disabled'],
      transitionProperty: ['responsive', 'motion-safe', 'motion-reduce'],
      borderRadius: ['focus', 'last'],
      borderStyle: ['first'],
      borderColor: ['first', 'disabled'],
      borderWidth: ['first'],
      padding: ['responsive', 'first', 'last'],
      backgroundColor: ['disabled'],
    },
  },
}
