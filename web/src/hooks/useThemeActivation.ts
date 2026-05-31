import { App } from "antd";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { type ActivateThemeResult, useThemeMutations } from "@/hooks/useThemes";
import { waitForVisitorSite } from "@/shared/theme/waitForVisitorSite";

const ACTIVATE_READY_TIMEOUT_MS = 10_000;

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
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const activateAndWait = useCallback(
    async (id: string) => {
      setActivatingId(id);
      const hide = message.loading(t("appearance.activateSwitching"), 0);
      try {
        const state = await activateMutation.mutateAsync(id);
        const siteUrl = resolveSiteUrl(state);
        if (siteUrl) {
          const ready = await waitForVisitorSite(siteUrl, {
            minWaitMs: 200,
            maxWaitMs: ACTIVATE_READY_TIMEOUT_MS,
            intervalMs: 350,
          });
          hide();
          message.success(
            ready
              ? t("appearance.activateSuccessWithSite", { url: siteUrl })
              : t("appearance.activateSuccessPending", { url: siteUrl }),
            6,
          );
        } else {
          hide();
          message.success(t("appearance.activateSuccess"), 6);
        }
      } catch {
        hide();
        message.error(t("appearance.actionFailed"));
      } finally {
        setActivatingId(null);
      }
    },
    [activateMutation, message, t],
  );

  return {
    activateAndWait,
    activatingId,
    isActivating: activatingId !== null,
  };
}
