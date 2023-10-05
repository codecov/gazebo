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
    './src/**/*.{js,jsx,ts,tsx}',
    './src/*.{js,jsx,ts,tsx}',
    './public/*.html',
  ],
  mode: 'jit',
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
          pink: {
            DEFAULT: withOpacity('--color-ds-pink-default'),
            secondary: withOpacity('--color-ds-pink-secondary'),
            tertiary: withOpacity('--color-ds-pink-tertiary'),
            quinary: withOpacity('--color-ds-pink-default'),
          },
          blue: {
            DEFAULT: withOpacity('--color-ds-blue-darker'),
            light: withOpacity('--color-ds-blue-light'),
            medium: withOpacity('--color-ds-blue-medium'),
            darker: withOpacity('--color-ds-blue-darker'),
            quinary: withOpacity('--color-ds-blue-quinary'),
            septenary: withOpacity('--color-ds-blue-septenary'),
            senary: withOpacity('--color-ds-blue-senary'),
            selected: withOpacity('--color-ds-blue-selected'),
          },
          gray: {
            DEFAULT: withOpacity('--color-ds-gray-default'),
            primary: withOpacity('--color-ds-gray-primary'),
            secondary: withOpacity('--color-ds-gray-secondary'),
            tertiary: withOpacity('--color-ds-gray-tertiary'),
            quaternary: withOpacity('--color-ds-gray-quaternary'),
            quinary: withOpacity('--color-ds-gray-quinary'),
            senary: withOpacity('--color-ds-gray-senary'),
            octonary: withOpacity('--color-ds-gray-octonary'),
            nonary: withOpacity('--color-ds-gray-default'),
          },
          primary: {
            green: withOpacity('--color-ds-primary-green'),
            red: withOpacity('--color-ds-primary-red'),
            purple: withOpacity('--color-ds-primary-purple'),
            yellow: withOpacity('--color-ds-primary-yellow'),
            base: withOpacity('--color-ds-primary-base'),
          },
          coverage: {
            covered: withOpacity('--color-success-100'),
            uncovered: withOpacity('--color-error-100'),
            partial: withOpacity('--color-ds-coverage-partial'),
          },
          error: {
            quinary: withOpacity('--color-ds-error-quinary'),
            nonary: withOpacity('--color-ds-error-nonary'),
          },
        },
        codecov: {
          red: withOpacity('--color-ds-primary-red'),
          orange: withOpacity('--color-codecov-orange'),
          footer: withOpacity('--color-codecov-footer'),
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
        gitlab: withOpacity('--color-gitlab'),
        bitbucket: withOpacity('--color-bitbucket'),
        okta: withOpacity('--color-okta'),
      },
      screens: {
        print: { raw: 'print' },
      },
      backgroundImage: {
        'enterprise-banner-bg': "url('/src/assets/enterprise-banner-bg.png')",
      },
    },
  },
  plugins: [require('@tailwindcss/container-queries')],
}
