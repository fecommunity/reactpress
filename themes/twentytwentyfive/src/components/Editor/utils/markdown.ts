import * as Showdown from 'showdown';

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
  emoji: true,
  smoothLivePreview: true,
  simpleLineBreaks: true,
  underline: true,
  parseImgDimensions: true,
  rawHeaderId: false,
  ghCompatibleHeaderId: true,
});

export const makeHtml = (value) => {
  return converter.makeHtml(value);
};


export function makeToc(html: string) {
  const reg = /<h([\d])\s+id="([^"]*)">(.*?)<\/h\1>/gi;
  let ret = null;
  const toc = [];
  while ((ret = reg.exec(html)) !== null) {
    toc.push({ level: ret[1], id: ret[2], text: ret[3] });
  }
  return toc;
}
