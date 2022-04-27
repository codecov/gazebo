const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.js', './src/*.js', './public/*.html'],
  theme: {
    container: {
      center: false,
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
            DEFAULT: '#F01F7A',
            secondary: '#FF4A89',
            tertiary: '#D10D62',
          },
          blue: {
            DEFAULT: '#0088E9',
            light: '#52B7FF',
            medium: '#0095FF',
            darker: '#0071C2',
            quinary: '#015896',
            senary: '#002D4D',
            selected: '#e6f1ff',
          },
          gray: {
            DEFAULT: '#0E1B29',
            primary: '#F7F8FB',
            secondary: '#EAEBEF',
            tertiary: '#D8DCE2',
            quaternary: '#999FA7',
            quinary: '#68737E',
            senary: '#394754',
            septenary: '#222F3D',
            octonary: '#0E1B29',
          },
          primary: {
            green: '#27B340',
            red: '#CE2019',
            purple: '#AC39CF',
            yellow: '#CA8E00',
          },
          coverage: {
            covered: '#DEFFE8',
            uncovered: '#FFEDF0',
            partial: '#FFF9D8',
          },
        },
        codecov: {
          red: '#CE2019',
          orange: '#FFC273',
          footer: '#07111b',
        },
        gray: {
          100: '#F7F8FB',
          200: '#EAEBEF',
          300: '#C7CBD1',
          400: '#999FA7',
          500: '#68737E',
          600: '#394754',
          800: '#222F3D',
          900: '#0E1B29',
        },
        pink: {
          100: '#FF4A89',
          500: '#F01F7A',
          900: '#D10D62',
        },
        blue: {
          100: '#52B7FF',
          200: '#0095FF',
          400: '#0088E9',
          600: '#0071C2',
          800: '#015896',
          900: '#002D4D',
        },
        warning: {
          900: '#473610',
          500: '#CA8E00',
          100: '#FFEBD2',
        },
        success: {
          100: '#DEFFE8',
          500: '#73FF9E',
          700: '#27B340',
          900: '#0E1B29',
        },
        error: {
          100: '#FFEDF0',
          500: '#FF9B9B',
          900: '#590808',
        },
        info: {
          100: '#DFF2FF',
          500: '#A3D9FF',
          900: '#013B65',
        },
      },
      boxShadow: {
        card: '0 7px 20px 0 rgba(34,47,61,0.05)',
      },
      screens: {
        print: { raw: 'print' },
      },
    },
  },
  variants: {
    extend: {
      textColor: ['disabled'],
      margin: ['responsive', 'first', 'last'],
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
