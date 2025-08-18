// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Em desenvolvimento, encaminha /api/* para o backend local (porta 10000)
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:10000",
      changeOrigin: true,
      // logLevel: "debug", // opcional para debugar o proxy
    })
  );
};
