const pfm = require('postcss-font-magician')

module.exports = {
  map: true,
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    pfm({ foundries: ['google'], display: 'swap' }),
  ],
}
