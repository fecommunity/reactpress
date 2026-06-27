export const IMAGE_OPTIMIZER_PLUGIN_ID = 'image-optimizer';

export interface ImageOptimizeReport {
  total: number;
  alreadyOptimized: number;
  needsOptimization: number;
  skipped: {
    nonImage: number;
    svg: number;
    gif: number;
    missing: number;
  };
  storageBytes: {
    current: number;
    estimatedAfter: number;
    estimatedSaved: number;
  };
  contentRefs: {
    articles: number;
    pages: number;
  };
}

export interface OptimizeRunOptions {
  dryRun?: boolean;
  batchSize?: number;
  skipGif?: boolean;
  rewriteContent?: boolean;
  cleanupOriginals?: boolean;
  limit?: number;
}

export type OptimizeJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface OptimizeJobItemResult {
  fileId: string;
  originalname: string;
  status: 'success' | 'skipped' | 'failed';
  oldUrl?: string;
  newUrl?: string;
  savedBytes?: number;
  error?: string;
}

export interface OptimizeJob {
  id: string;
  status: OptimizeJobStatus;
  dryRun: boolean;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  savedBytes: number;
  urlMap: Record<string, string>;
  items: OptimizeJobItemResult[];
  rewriteContent: boolean;
  contentRewrite?: {
    articles: number;
    pages: number;
    revisions: number;
  };
  error?: string;
  startedAt: string;
  finishedAt?: string;
}

export interface RewriteContentResult {
  articles: number;
  pages: number;
  revisions: number;
}
