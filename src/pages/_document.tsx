import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta
            httpEquiv="Content-Security-Policy"
            content="
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com;
              style-src 'self' 'unsafe-inline' https://api.mapbox.com;
              img-src 'self' data: https:;
              worker-src 'self' blob:;
              connect-src 'self' https://*.mapbox.com;
              font-src 'self' https://api.mapbox.com;
            "
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
