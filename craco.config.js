const pfm = require('postcss-font-magician')

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        pfm({ foundries: ['google'], display: 'swap' }),
      ],
    },
  },
}
