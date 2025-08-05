// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com;",
              "style-src 'self' 'unsafe-inline' https://api.mapbox.com;",
              "img-src 'self' data: blob: https://api.mapbox.com;",
              "font-src 'self' https://fonts.gstatic.com https://api.mapbox.com;",
              "connect-src 'self' https://api.mapbox.com https://events.mapbox.com;",
              "worker-src 'self' blob:;",
              "object-src 'none';"
            ].join(" ")
          }
        ]
      }
    ];
  }
};
