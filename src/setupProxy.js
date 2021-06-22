const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  if (process.env.PROXY_TO) {
    app.use(
      '/internal',
      createProxyMiddleware({
        target: process.env.PROXY_TO,
        changeOrigin: true,
      })
    )
    app.use(
      '/graphql',
      createProxyMiddleware({
        target: process.env.PROXY_TO,
        changeOrigin: true,
      })
    )
  }
}
