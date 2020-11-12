const tailwindcss = require('tailwindcss')

module.exports = {
  map: true,
  plugins: [
    tailwindcss('./tailwind.config.js'),
    require('autoprefixer'),
    require('postcss-font-magician'),
  ],
}
