import type { PluginSettingsPanelProps } from "@fecommunity/reactpress-toolkit/plugin/admin";
import { App, Button, Progress, Spin } from "antd";
import { useEffect, useRef, useState } from "react";

import {
  fetchOptimizeJob,
  fetchOptimizeReport,
  readApiErrorMessage,
  startOptimizeJob,
  type ImageOptimizeReport,
  type OptimizeJob,
} from "./api";
import { usePluginDashboardText } from "./locale";

import styles from "./optimize-dashboard.module.css";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function resolveConfig(config: Record<string, unknown>) {
  const batchSize = Number(config.batchSize);
  return {
    batchSize: Number.isFinite(batchSize) ? Math.min(Math.max(batchSize, 1), 200) : 50,
    skipGif: config.skipGif !== false,
    rewriteContent: config.rewriteContent === true,
    cleanupOriginals: config.cleanupOriginals === true,
  };
}

export function OptimizeDashboard({ pluginId, pluginActive, config }: PluginSettingsPanelProps) {
  const { message } = App.useApp();
  const t = usePluginDashboardText(pluginId);

  const [report, setReport] = useState<ImageOptimizeReport | null>(null);
  const [job, setJob] = useState<OptimizeJob | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [startingJob, setStartingJob] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const loadReport = useCallback(async () => {
    setLoadingReport(true);
    try {
      const data = await fetchOptimizeReport();
      setReport(data);
    } catch (err) {
      message.error(readApiErrorMessage(err, t("analyzeFailed", "分析失败")));
    } finally {
      setLoadingReport(false);
    }
  }, [message, t]);

  const pollJob = useCallback(
    (jobId: string) => {
      stopPolling();

      const refresh = () => {
        void fetchOptimizeJob(jobId)
          .then((next) => {
            setJob(next);
            if (next.status === "completed" || next.status === "failed") {
              stopPolling();
              void loadReport();
            }
          })
          .catch((err) => {
            stopPolling();
            message.error(readApiErrorMessage(err, t("jobPollFailed", "获取任务进度失败")));
          });
      };

      refresh();
      pollRef.current = setInterval(refresh, 800);
    },
    [loadReport, message, stopPolling, t],
  );

  useEffect(() => {
    if (pluginActive) {
      void loadReport();
    }
  }, [loadReport, pluginActive]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const runJob = async (dryRun: boolean) => {
    if (!pluginActive) return;
    const opts = resolveConfig(config);
    setStartingJob(true);
    try {
      const started = await startOptimizeJob({
        dryRun,
        batchSize: opts.batchSize,
        limit: opts.batchSize,
        skipGif: opts.skipGif,
        rewriteContent: opts.rewriteContent,
        cleanupOriginals: opts.cleanupOriginals,
      });
      setJob(started);
      if (started.status === "completed" || started.status === "failed") {
        void loadReport();
        if (started.total === 0) {
          message.info(t("jobEmpty", "没有待优化的图片（可能已全部优化，或原文件已不存在）。"));
        } else if (dryRun) {
          message.success(t("dryRunDone", "试运行完成（未写入数据库）。"));
        }
      } else {
        pollJob(started.id);
        if (dryRun) {
          message.info(t("dryRun", "试运行（不写入）"));
        }
      }
    } catch (err) {
      message.error(readApiErrorMessage(err, t("runFailed", "启动任务失败")));
    } finally {
      setStartingJob(false);
    }
  };

  if (!pluginActive) {
    return (
      <div className={styles.warn} data-testid="image-optimizer-inactive">
        {t("inactiveHint", "请先在插件列表中启用本插件，才能执行分析与优化。")}
      </div>
    );
  }

  const jobRunning = job?.status === "pending" || job?.status === "running";
  const jobDone = job?.status === "completed" || job?.status === "failed";
  const jobPercent =
    job && job.total > 0 ? Math.round((job.processed / job.total) * 100) : undefined;
  const failedItems = job?.items.filter((item) => item.status === "failed").slice(0, 5) ?? [];

  return (
    <div className={styles.optimizeDashboard} data-testid="image-optimizer-dashboard">
      <h2 className={styles.sectionTitle}>{t("title", "资源分析")}</h2>

      <div className={styles.actions}>
        <Button loading={loadingReport} onClick={() => void loadReport()}>
          {t("analyze", "分析现状")}
        </Button>
        <Button loading={startingJob} onClick={() => void runJob(true)}>
          {t("dryRun", "试运行（不写入）")}
        </Button>
        <Button type="primary" loading={startingJob || jobRunning} onClick={() => void runJob(false)}>
          {t("run", "开始批量优化")}
        </Button>
      </div>

      {loadingReport && !report ? (
        <Spin />
      ) : report ? (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>{t("total", "素材总数")}</p>
            <p className={styles.statValue}>{report.total}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>{t("optimized", "已优化")}</p>
            <p className={styles.statValue}>{report.alreadyOptimized}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>{t("pending", "待优化")}</p>
            <p className={styles.statValue}>{report.needsOptimization}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>{t("estimatedSaved", "预估可节省")}</p>
            <p className={styles.statValue}>{formatBytes(report.storageBytes.estimatedSaved)}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>{t("contentRefs", "内容引用")}</p>
            <p className={styles.statValue}>
              {report.contentRefs.articles} {t("articles", "文章")} / {report.contentRefs.pages}{" "}
              {t("pages", "页面")}
            </p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>{t("skipped", "已跳过")}</p>
            <p className={styles.statValue}>
              {report.skipped.nonImage + report.skipped.svg + report.skipped.gif + report.skipped.missing}
            </p>
          </div>
        </div>
      ) : null}

      {job ? (
        <div className={styles.progressBlock}>
          <Progress
            percent={jobPercent}
            status={
              job.status === "failed"
                ? "exception"
                : jobRunning
                  ? "active"
                  : job.total === 0
                    ? "normal"
                    : "success"
            }
            showInfo={job.total > 0}
          />
          <p className={styles.hint}>
            {job.status === "failed"
              ? `${t("jobFailed", "任务失败")}: ${job.error ?? ""}`
              : jobRunning
                ? job.total === 0
                  ? t("jobScanning", "正在扫描待优化素材…")
                  : t("jobRunning", "优化任务进行中…")
                : t("jobDone", "任务已完成")}
            {" · "}
            {t("processed", "已处理")} {job.processed}/{job.total} · {t("succeeded", "成功")}{" "}
            {job.succeeded} · {t("failed", "失败")} {job.failed}
            {job.savedBytes > 0 ? ` · ${t("savedBytes", "已节省空间")} ${formatBytes(job.savedBytes)}` : ""}
          </p>
          {jobDone && job.total === 0 ? (
            <p className={styles.emptyJob}>
              {t("jobEmpty", "没有待优化的图片（可能已全部优化，或原文件已不存在）。")}
            </p>
          ) : null}
          {job.contentRewrite ? (
            <p className={styles.hint}>
              URL 回写：{job.contentRewrite.articles} {t("articles", "文章")}、{job.contentRewrite.pages}{" "}
              {t("pages", "页面")}、{job.contentRewrite.revisions} 修订
            </p>
          ) : null}
          {failedItems.length > 0 ? (
            <ul className={styles.errorList}>
              {failedItems.map((item) => (
                <li key={item.fileId}>
                  {item.originalname}: {item.error}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export { OptimizeDashboard as SettingsPanel };
