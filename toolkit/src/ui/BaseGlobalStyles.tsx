import React from 'react';

export interface BaseGlobalStylesProps {
  extra?: string;
}

/** Shared reset used by starter themes (override via `extra` CSS). */
export function BaseGlobalStyles({ extra }: BaseGlobalStylesProps) {
  const css = `
    html, body {
      padding: 0;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
        Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background-color: var(--rp-background, #f8f9fa);
    }
    * { box-sizing: border-box; }
    ${extra ?? ''}
  `;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
