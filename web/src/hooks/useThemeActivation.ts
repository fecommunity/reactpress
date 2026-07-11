import { App } from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { type ActivateThemeResult, useThemeMutations } from "@/hooks/useThemes";
import { isDesktopRuntime } from "@/shared/desktop/apiConfig";
import { waitForVisitorSite } from "@/shared/theme/waitForVisitorSite";
import { useDesktopStore } from "@/stores/desktop";

/** Match CLI theme dev / compile time — keep loading until the public site responds. */
const ACTIVATE_READY_TIMEOUT_MS = 120_000;
const ACTIVATE_MSG_KEY = "theme-activate";

export type ThemeActivationPhase = "idle" | "activating" | "restarting" | "checking";

function resolveSiteUrl(state: ActivateThemeResult): string {
  if (typeof state === "object" && state && "siteUrl" in state) {
    return String((state as { siteUrl?: string }).siteUrl ?? "").trim();
  }
  return "";
}

export function useThemeActivation() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { activateMutation } = useThemeMutations();
  const desktopMode = useDesktopStore((s) => s.mode);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [activationPhase, setActivationPhase] = useState<ThemeActivationPhase>("idle");
  const [activationSiteUrl, setActivationSiteUrl] = useState<string | undefined>();

  const showPhaseMessage = useCallback(
    (phase: ThemeActivationPhase, siteUrl?: string) => {
      setActivationPhase(phase);
      if (phase === "idle") return;

      const content =
        phase === "activating"
          ? t("appearance.activatePhaseActivating")
          : phase === "restarting"
            ? t("appearance.activatePhaseRestarting")
            : t("appearance.activatePhaseChecking", { url: siteUrl ?? "…" });

      message.loading({ content, key: ACTIVATE_MSG_KEY, duration: 0 });
    },
    [message, t],
  );

  const activationStatusText =
    activationPhase === "activating"
      ? t("appearance.activatePhaseActivatingShort")
      : activationPhase === "restarting"
        ? t("appearance.activatePhaseRestartingShort")
        : activationPhase === "checking"
          ? t("appearance.activatePhaseCheckingShort")
          : undefined;

  const activateAndWait = useCallback(
    async (id: string) => {
      setActivatingId(id);
      setActivationSiteUrl(undefined);
      showPhaseMessage("activating");

      try {
        const state = await activateMutation.mutateAsync(id);
        const siteUrl = resolveSiteUrl(state);
        setActivationSiteUrl(siteUrl || undefined);

        if (!siteUrl) {
          message.destroy(ACTIVATE_MSG_KEY);
          message.success(t("appearance.activateSuccess"), 6);
          return;
        }

        const skipVisitorWait = isDesktopRuntime() && (desktopMode ?? "local") === "local";
        if (skipVisitorWait) {
          message.destroy(ACTIVATE_MSG_KEY);
          message.success(t("appearance.activateSuccess"), 6);
          return;
        }

        showPhaseMessage("restarting", siteUrl);
        await new Promise((resolve) => setTimeout(resolve, 400));
        showPhaseMessage("checking", siteUrl);

        const ready = await waitForVisitorSite(siteUrl, {
          minWaitMs: 300,
          maxWaitMs: ACTIVATE_READY_TIMEOUT_MS,
          intervalMs: 400,
          onPoll: (_attempt, elapsedMs) => {
            if (elapsedMs >= 8_000 && elapsedMs % 4_000 < 450) {
              showPhaseMessage("checking", siteUrl);
            }
          },
        });

        message.destroy(ACTIVATE_MSG_KEY);

        if (ready) {
          message.success(t("appearance.activateSuccessWithSite", { url: siteUrl }), 6);
        } else {
          message.error(t("appearance.activateFailedSiteTimeout", { url: siteUrl }), 8);
        }
      } catch {
        message.destroy(ACTIVATE_MSG_KEY);
        message.error(t("appearance.actionFailed"));
      } finally {
        setActivatingId(null);
        setActivationPhase("idle");
        setActivationSiteUrl(undefined);
      }
    },
    [activateMutation, desktopMode, message, showPhaseMessage, t],
  );

  return {
    activateAndWait,
    activatingId,
    activationPhase,
    activationSiteUrl,
    activationStatusText,
    isActivating: activatingId !== null,
  };
}
