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
    },
    container: {
      center: true,
    },
    extend: {},
  },
  variants: {},
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
