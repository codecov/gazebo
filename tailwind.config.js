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
    extend: {
      boxShadow: {
        card: "0 7px 20px 0 rgba(34,47,61,0.05)",
      },
    },
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
