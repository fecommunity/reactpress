import * as hljs from 'highlight.js';
import * as Marked from 'marked';

const renderer = new Marked.Renderer();

renderer.heading = (text, level) => {
  const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

  return `
<h${level}>
  <a name="${escapedText}" class="anchor" href="#${escapedText}">
    <span class="header-link"></span>
  </a>
  ${text}
</h${level}>`;
};

Marked.setOptions({
  highlight(code: string, lang: string) {
    if (hljs.getLanguage(lang)) {
      return hljs.highlight(lang, code).value;
    }
    return hljs.highlightAuto(code).value;
  },
  renderer,
});

export const marked = (content: string): { html: string; toc: string } => {
  const toc = [];

  renderer.heading = (text: string, level: number) => {
    const anchor = 'heading-' + toc.length;

    toc.push([level, anchor, text]);
    return `<h${level} id="${anchor}">${text}</h${level}>`;
  };

  const marked = (text: string) => {
    const tok = Marked.lexer(text);
    text = Marked.parser(tok).replace(/<pre>/gi, '<pre class="hljs">'); // eslint-disable-line no-param-reassign
    return text;
  };

  const html = marked(content);
  return { html, toc: JSON.stringify(toc, null, 2) };
};
