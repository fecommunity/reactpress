import { colorModeInitScript, resolveVisitorLocale } from '@fecommunity/reactpress-toolkit/theme';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

export default class TwentyTwentySixDocument extends Document<{ locale?: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const locale = resolveVisitorLocale(['zh', 'en'], ctx.req);

    return { ...initialProps, locale };
  }

  render() {
    const locale = this.props.locale ?? 'zh';

    return (
      <Html lang={locale}>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <script dangerouslySetInnerHTML={{ __html: colorModeInitScript }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
