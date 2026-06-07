declare module 'highlight.js' {
  interface HighlightJs {
    highlightBlock?(element: HTMLElement): void;
    highlightElement?(element: HTMLElement): void;
    highlightAuto?(code: string): { language?: string; relevance?: number; value?: string };
  }

  const hljs: HighlightJs;
  export default hljs;
}
