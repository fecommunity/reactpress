import { authHandlers } from "./auth";
import { articleHandlers } from "./article";
import { categoryHandlers } from "./category";
import { tagHandlers } from "./tag";
import { commentHandlers } from "./comment";
import { userHandlers } from "./user";
import { pageHandlers, fileHandlers, settingHandlers, viewHandlers, apiKeyHandlers } from "./page";
import { themeHandlers } from "./themes";

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...articleHandlers,
  ...categoryHandlers,
  ...tagHandlers,
  ...commentHandlers,
  ...pageHandlers,
  ...fileHandlers,
  ...settingHandlers,
  ...viewHandlers,
  ...apiKeyHandlers,
  ...themeHandlers,
];
