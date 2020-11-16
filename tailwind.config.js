const plugin = require('tailwindcss/plugin')

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: {
    content: [
      './src/components/**/*.js',
      './src/components/**.js',
      './public/*.html',
    ],
  },
  theme: {
    fontFamily: {
      body: ['sans-serif', 'Lato'],
      display: ['sans-serif', 'Lato'],
    },
    container: {
      center: true,
    },
    extend: {
      colors: {
        codecov: {
          'text-light': '#465B6A',
          green: '#27B340',
          red: '#CE2019',
          purple: '#AC39CF',
          orange: '#FFC273',
          success: '#83E46C', // Dupe of new success
          warning: '#CA8E00', // Dupe of new warning
          danger: '#C60800', // Dupe of new danger
          negative: '#9F3A38',
          dashboard: '#F7F7FC',
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
        site: {
          header: '#0E1B29',
          footer: '#07111B',
        },
        warning: {
          900: '#473610',
          500: '#CA8E00',
          100: '#FFEBD2',
        },
        success: {
          100: '#DEFFE8',
          500: '#73FF9E',
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
      gradients: {
        'green-red': [
          '#73FF9E',
          '#83E46C',
          '#8DCB27',
          '#CA8E00',
          '#CA4800',
          '#C60800',
          '#840500',
        ],
      },
      boxShadow: {
        grid: '0 7px 20px 0 rgba(34,47,61,0.05)',
        card: '0 7px 20px 0 rgba(34,47,61,0.05)',
        table: '0 2px 15px 0 rgba(14,27,41,0.05)',
        alert: {
          negative: '0 0 0 1px #E0B4B4 inset, 0 0 0 0 transparent',
        },
      },
    },
  },
  variants: {
    text: ['default', 'hover', 'focus', 'disabled'],
    backgroundColor: ['default', 'responsive', 'hover', 'focus', 'disabled'],
    opacity: ['default', 'responsive', 'hover', 'focus', 'disabled'],
    textColor: [
      'default',
      'responsive',
      'hover',
      'focus',
      'disabled',
      'visited',
    ],
    borderColor: ['default', 'responsive', 'hover', 'focus', 'disabled'],
    cursor: ['default', 'responsive', 'disabled'],
    textOpacity: ['default', 'responsive', 'hover', 'focus', 'disabled'],
  },
  plugins: [
    plugin(function ({ addBase, config }) {
      addBase({
        html: {
          fontFamily: config('theme.fontFamily.body'),
          fontSize: '16px',
          fontSize: '1rem',
        },
      })
    }),
  ],
}
