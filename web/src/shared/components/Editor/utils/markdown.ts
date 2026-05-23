import Showdown from "showdown";

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

export const makeHtml = (value: string) => converter.makeHtml(value);

export type TocItem = { level: string; id: string; text: string };

export function makeToc(html: string): TocItem[] {
  const reg = /<h([1-6])[^>]*\sid="([^"]*)"[^>]*>(.*?)<\/h\1>/gi;
  const toc: TocItem[] = [];
  let ret: RegExpExecArray | null;
  while ((ret = reg.exec(html)) !== null) {
    toc.push({ level: ret[1], id: ret[2], text: ret[3] });
  }
  return toc;
}
