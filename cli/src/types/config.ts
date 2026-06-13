/** ReactPress 4.x 数据库模式 */
export type DatabaseMode = 'embedded-docker' | 'external' | 'embedded-sqlite';

export type DatabaseType = 'mysql' | 'sqlite';

export interface ReactPressConfig {
  version: number;
  database: {
    mode: DatabaseMode;
    containerName?: string;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    /** SQLite 文件路径（相对项目根或绝对路径） */
    sqlitePath?: string;
  };
  server: {
    port: number;
    clientUrl?: string;
    serverUrl?: string;
    apiPrefix?: string;
    siteUrl?: string;
  };
}

export interface EnvMap {
  [key: string]: string;
}

export interface MysqlCredentials {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface SqliteCredentials {
  database: string;
}

export interface DatabaseProfile {
  type: DatabaseType;
  mode: DatabaseMode;
  mysql?: MysqlCredentials;
  sqlite?: SqliteCredentials;
}

export interface DatabaseEnsureResult {
  ok: boolean;
  message?: string;
}

export interface ServerStatus {
  running: boolean;
  pid?: number;
  port?: number;
  url?: string;
  databaseReady: boolean;
  databaseMode: DatabaseMode;
  databaseType: DatabaseType;
}
