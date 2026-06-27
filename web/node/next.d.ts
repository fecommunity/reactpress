import type { IncomingMessage, ServerResponse } from "node:http";
import type { AdminStaticOptions } from "./index.d.ts";

export declare function isAdminRequest(
  req: IncomingMessage,
  options?: Pick<AdminStaticOptions, "basePath">,
): boolean;

export declare function createCombinedRequestHandler(
  fallbackHandler: (req: IncomingMessage, res: ServerResponse) => void,
  adminOptions?: AdminStaticOptions,
): (req: IncomingMessage, res: ServerResponse) => void;

export interface AdminRewriteOptions extends AdminStaticOptions {
  /** Upstream Admin static server, e.g. `http://localhost:3000`. */
  adminOrigin?: string;
}

export declare function createAdminRewrites(
  options?: AdminRewriteOptions,
): Array<{ source: string; destination: string }>;

export declare function createAdminVercelRedirects(
  options?: Pick<AdminStaticOptions, "basePath">,
): Array<{ source: string; destination: string; permanent: boolean }>;

export declare function createAdminVercelRewrites(options?: Pick<AdminStaticOptions, "basePath">): {
  afterFiles: Array<{ source: string; destination: string }>;
};
