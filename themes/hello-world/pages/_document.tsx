import { resolveVisitorLocale } from '@fecommunity/reactpress-toolkit/theme';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

export default class HelloWorldDocument extends Document<{ locale?: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const locale = resolveVisitorLocale(['zh', 'en'], ctx.req);

    return { ...initialProps, locale };
  }

  render() {
    const locale = this.props.locale ?? 'en';

    return (
      <Html lang={locale}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
