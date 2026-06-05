import {
  colorModeInitScript,
  DEFAULT_VISITOR_LOCALES,
  resolveVisitorLocale,
} from '@fecommunity/reactpress-toolkit/theme';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

export default class ThemeDocument extends Document<{ locale?: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const locale = resolveVisitorLocale([...DEFAULT_VISITOR_LOCALES], ctx.req);
    return { ...initialProps, locale };
  }

  render() {
    const locale = this.props.locale ?? DEFAULT_VISITOR_LOCALES[0];
    return (
      <Html lang={locale}>
        <Head />
        <body>
          <script dangerouslySetInnerHTML={{ __html: colorModeInitScript }} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
