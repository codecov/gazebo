const forIn = require('lodash/forIn')
const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

module.exports = {
  purge: {
    content: ['./src/**/*.js', './src/*.js', './public/*.html'],
  },
  theme: {
    fontFamily: {
      body: ['sans-serif', 'Poppins'],
    },
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
        mono: ['Source Code Pro', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        ds: {
          pink: {
            DEFAULT: '#F01F7A',
            primary: '#F01F7A',
            secondary: '#FF4A89',
            tertiary: '#D10D62',
          },
          blue: {
            DEFAULT: '#0088E9',
            primary: '#0088E9',
            secondary: '#52B7FF',
            tertiary: '#0095FF',
            quanternary: '#0071C2',
            quinary: '#015896',
            senary: '#002D4D',
          },
          gray: {
            DEFAULT: '#F7F8FB',
            primary: '#F7F8FB',
            secondary: '#EAEBEF',
            tertiary: '#D8DCE2',
            quanternary: '#999FA7',
            quinary: '#68737E',
            senary: '#394754',
            septenary: '#222F3D',
            octonary: '#0E1B29',
          },
          green: {
            DEFAULT: '#27B340',
          },
          red: {
            DEFAULT: '#CE2019',
          },
          purple: {
            DEFAULT: '#AC39CF',
          },
          white: { DEFAULT: '#FFFFFF' },
          sunburst: {
            // Caution: Needs a proper design language name
            DEFAULT: '#C60800',
            light: '#C60800',
            dark: '#840500',
          },
          success: {
            DEFAULT: '#73FF9E',
            primary: '#73FF9E',
            secondary: '#0E1B29',
            tertiary: '#DEFFE8',
          },
          warning: {
            DEFAULT: '#FFC273',
            primary: '#FFC273',
            secondary: '#473610',
            tertiary: '#FFEBD2',
          },
          alert: {
            DEFAULT: '#FF9B9B',
            primary: '#FF9B9B',
            secondary: '#590808',
            tertiary: '#FFEDF0',
          },
          info: {
            DEFAULT: '#A3D9FF',
            primary: '#A3D9FF',
            secondary: '#013B65',
            tertiary: '#DFF2FF',
          },
          gradients: {
            // Caution: Needs a proper design language name
            // CAUTION These transparent colors and set gradients need more design/engineering discussion.
            DEFAULT:
              'linear-gradient(236.85deg, #EF589C 14.72%, #F01F7A 78.1%)',
            pink: 'rgba(149, 0, 65, 0.25)',
            blue: 'rgba(0, 107, 184, 0.25)',
            // I know we could move these to the tailwind gradients but for now
            pinkgradient:
              'linear-gradient(236.85deg, #EF589C 14.72%, #F01F7A 78.1%)',
            bluegradient: 'gradient(236.85deg, #2AA7FF 14.72%, #0095FF 78.1%)',
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
      gradientColorStops: (theme) => ({
        // From Design System
        ...theme('colors'),
        lightBlue: '#2AA7FF',
        darkBlue: '#0095FF',
        lightPink: '#EF589C',
        darkPink: '#F01F7A',
      }),
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
      margin: ['responsive', 'last'],
      opacity: ['disabled', 'hover'],
      cursor: ['disabled'],
      transitionProperty: ['responsive', 'motion-safe', 'motion-reduce'],
      borderRadius: ['focus', 'last'],
      borderStyle: ['first'],
      borderColor: ['first'],
      borderWidth: ['first'],
      padding: ['responsive', 'last'],
      backgroundColor: ['disabled'],
    },
  },
  plugins: [plugin(caretColorPlugin)],
}

function caretColorPlugin({ addUtilities, theme }) {
  // inspired by https://github.com/Naoray/tailwind-caret-color
  // which doesn't work for v2
  const colors = theme('colors')
  const newUtilities = {}
  forIn(colors, (variants, colorName) => {
    if (typeof variants === 'string') {
      // no variant for the color, it's directly the color
      newUtilities[`.caret-${colorName}`] = {
        'caret-color': variants,
      }
    } else {
      // map each variant of the color
      forIn(variants, (color, variantName) => {
        newUtilities[`.caret-${colorName}-${variantName}`] = {
          'caret-color': color,
        }
      })
    }
  })
  addUtilities(newUtilities)
}
