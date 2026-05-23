import { authHandlers } from "./auth";
import { articleHandlers } from "./article";
import { userHandlers } from "./user";

export const handlers = [...authHandlers, ...userHandlers, ...articleHandlers];
