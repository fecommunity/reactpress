import type { IncomingMessage, Server, ServerResponse } from "node:http";

export declare const DEFAULT_ADMIN_BASE: "/admin/";

export interface AdminStaticOptions {
  /** Absolute path to the Vite build output. Defaults to `<package>/dist`. */
  distDir?: string;
  /** Public URL prefix for assets and routes. Defaults to `/admin/`. */
  basePath?: string;
}

export interface ServeAdminOptions extends AdminStaticOptions {
  host?: string;
  port?: number;
  silent?: boolean;
}

export declare function resolveDistDir(options?: Pick<AdminStaticOptions, "distDir">): string;

export declare function normalizeAdminBase(basePath?: string): string;

export declare function adminPublicSegment(basePath?: string): string;

export declare function syncAdminDistToPublic(
  targetDir: string,
  options?: AdminStaticOptions,
): string;

export declare function createAdminStaticMiddleware(
  options?: AdminStaticOptions,
): (req: IncomingMessage, res: ServerResponse, next?: () => void) => void | Promise<void>;

export declare function createAdminStaticHandler(
  options?: AdminStaticOptions,
): (req: IncomingMessage, res: ServerResponse) => void;

export declare function serveAdmin(options?: ServeAdminOptions): Server;
