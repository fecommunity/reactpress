import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { colorModeInitScript, resolveVisitorLocale } from '@fecommunity/reactpress-toolkit/theme';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

export default class ThemeDocument extends Document<{ locale?: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const cache = createCache();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) =>
          React.createElement(StyleProvider, { cache }, React.createElement(App, props)),
      });

    const initialProps = await Document.getInitialProps(ctx);
    const style = extractStyle(cache, true);
    const locale = resolveVisitorLocale(['zh', 'en'], ctx.req);

    return {
      ...initialProps,
      locale,
      styles: (
        <>
          {initialProps.styles}
          <style dangerouslySetInnerHTML={{ __html: style }} />
        </>
      ),
    };
  }

  render() {
    const locale = this.props.locale ?? 'zh';
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
