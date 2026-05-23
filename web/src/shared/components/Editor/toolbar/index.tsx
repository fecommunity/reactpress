import type { ComponentType } from "react";
import { EmojiTool } from "./Emoji";
import { IframeTool } from "./Iframe";
import { ImageTool } from "./Image";
import { MagimgTool } from "./Magimg";
import type { ToolbarEditorProps } from "./types";
import { VideoTool } from "./Video";

export { FormatToolbar } from "./FormatToolbar";

export type ToolbarItem = {
  labelKey: string;
  content: ComponentType<ToolbarEditorProps>;
};

/** 媒体与扩展插入（格式工具见 FormatToolbar） */
export const mediaToolbar: ToolbarItem[] = [
  { labelKey: "editor.toolEmoji", content: EmojiTool },
  { labelKey: "editor.toolImage", content: ImageTool },
  { labelKey: "editor.toolVideo", content: VideoTool },
  { labelKey: "editor.toolIframe", content: IframeTool },
  { labelKey: "editor.toolMagimg", content: MagimgTool },
];
