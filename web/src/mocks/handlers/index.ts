import { articleHandlers } from "./article";
import { authHandlers } from "./auth";
import { categoryHandlers } from "./category";
import { commentHandlers } from "./comment";
import {
  apiKeyHandlers,
  fileHandlers,
  pageHandlers,
  settingHandlers,
  smtpHandlers,
  viewHandlers,
} from "./page";
import { pluginHandlers } from "./plugins";
import { tagHandlers } from "./tag";
import { themeHandlers } from "./themes";
import { userHandlers } from "./user";

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
  ...smtpHandlers,
  ...viewHandlers,
  ...apiKeyHandlers,
  ...themeHandlers,
  ...pluginHandlers,
];
