import { Link } from "@tanstack/react-router";
import { App, Table, theme } from "antd";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { articleListThemeVars } from "@/modules/article/components/articleListThemeVars";
import listStyles from "@/modules/comment/components/comment-list.module.css";
import {
  type PluginBulkAction,
  PluginListTablenav,
} from "@/modules/plugins/components/PluginListTablenav";
import {
  type PluginFilter,
  PluginListSubHeader,
} from "@/modules/plugins/components/PluginListSubHeader";
import pluginStyles from "@/modules/plugins/components/plugins-page.module.css";
import { pluginHasSettings } from "@/modules/plugins/utils/pluginSettingsSchema";
import { usePluginMutations, usePlugins, type PluginListItem } from "@/hooks/usePlugins";
import { usePluginListItemMeta } from "@/hooks/usePluginListItemMeta";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";

function PluginListNameCell({
  plugin,
  actions,
  loadError,
}: {
  plugin: PluginListItem;
  actions: ReactNode;
  loadError?: string;
}) {
  const { name } = usePluginListItemMeta(plugin);
  return (
    <div>
      <span className={pluginStyles.pluginName}>{name}</span>
      {actions}
      {loadError ? <span className={pluginStyles.loadError}>{loadError}</span> : null}
    </div>
  );
}

function PluginListDescriptionCell({ plugin }: { plugin: PluginListItem }) {
  const { t } = useTranslation();
  const { description } = usePluginListItemMeta(plugin);
  return (
    <div className={pluginStyles.descCell}>
      <div>{description || "—"}</div>
      <p className={pluginStyles.pluginMeta}>
        {t("plugins.versionLabel", { version: plugin.version })}
        {plugin.author ? (
          <>
            <span className={pluginStyles.pluginMetaSep}>|</span>
            {t("plugins.authorLabel", { author: plugin.author })}
          </>
        ) : null}
      </p>
    </div>
  );
}

function matchesKeyword(plugin: PluginListItem, keyword: string): boolean {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return true;
  return (
    plugin.name.toLowerCase().includes(needle) ||
    plugin.id.toLowerCase().includes(needle) ||
    (plugin.description?.toLowerCase().includes(needle) ?? false) ||
    (plugin.author?.toLowerCase().includes(needle) ?? false)
  );
}

function matchesFilter(plugin: PluginListItem, filter: PluginFilter): boolean {
  if (filter === "active") return plugin.active;
  if (filter === "inactive") return plugin.installed && !plugin.active;
  if (filter === "available") return !plugin.installed;
  return true;
}

export function PluginsPage() {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const listThemeStyle = useMemo(() => articleListThemeVars(token), [token]);

  const { data: plugins, isLoading, isError, error, refetch, isFetching } = usePlugins();
  const { installMutation, activateMutation, deactivateMutation, uninstallMutation } =
    usePluginMutations();

  const [filter, setFilter] = useState<PluginFilter>("all");
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<PluginBulkAction | undefined>();

  const list = Array.isArray(plugins) ? plugins : [];

  const counts = useMemo(
    () => ({
      all: list.length,
      active: list.filter((p) => p.active).length,
      inactive: list.filter((p) => p.installed && !p.active).length,
      available: list.filter((p) => !p.installed).length,
    }),
    [list],
  );

  const filtered = useMemo(
    () => list.filter((p) => matchesFilter(p, filter) && matchesKeyword(p, keyword)),
    [filter, keyword, list],
  );

  const bulkBusy =
    installMutation.isPending ||
    activateMutation.isPending ||
    deactivateMutation.isPending ||
    uninstallMutation.isPending;

  const runAction = async (
    action: "install" | "activate" | "deactivate" | "uninstall",
    id: string,
  ) => {
    try {
      if (action === "install") await installMutation.mutateAsync(id);
      if (action === "activate") await activateMutation.mutateAsync(id);
      if (action === "deactivate") await deactivateMutation.mutateAsync(id);
      if (action === "uninstall") await uninstallMutation.mutateAsync(id);
      message.success(t(`plugins.${action}Success`));
    } catch (err) {
      message.error(err instanceof Error ? err.message : t("plugins.actionFailed"));
    }
  };

  const confirmUninstall = (plugin: PluginListItem) => {
    modal.confirm({
      title: t("plugins.uninstallConfirmTitle", { name: plugin.name }),
      content: t("plugins.uninstallConfirmDesc"),
      okText: t("plugins.uninstall"),
      okButtonProps: { danger: true },
      cancelText: t("common.cancel"),
      onOk: () => runAction("uninstall", plugin.id),
    });
  };

  const renderRowActions = (plugin: PluginListItem) => {
    const actions: { key: string; label: string; onClick: () => void; danger?: boolean }[] = [];
    const hasSettings = pluginHasSettings(plugin.settings?.schema);

    const pushSettingsAction = () => {
      if (!hasSettings) return;
      actions.push({
        key: "settings",
        label: t("plugins.settings"),
        onClick: () => {},
      });
    };

    if (!plugin.installed) {
      actions.push({
        key: "install",
        label: t("plugins.install"),
        onClick: () => void runAction("install", plugin.id),
      });
    } else if (plugin.active) {
      actions.push({
        key: "deactivate",
        label: t("plugins.deactivate"),
        onClick: () => void runAction("deactivate", plugin.id),
      });
      pushSettingsAction();
    } else {
      actions.push({
        key: "activate",
        label: t("plugins.activate"),
        onClick: () => void runAction("activate", plugin.id),
      });
      pushSettingsAction();
      actions.push({
        key: "uninstall",
        label: t("plugins.uninstall"),
        onClick: () => confirmUninstall(plugin),
        danger: true,
      });
    }

    return (
      <div className={pluginStyles.rowActions}>
        {actions.map((action, index) => (
          <span key={action.key}>
            {index > 0 ? <span className={listStyles.rowActionSep}>|</span> : null}
            {action.key === "settings" ? (
              <Link
                to="/plugins/$id/settings"
                params={{ id: plugin.id }}
                className={listStyles.rowAction}
              >
                {action.label}
              </Link>
            ) : (
              <button
                type="button"
                className={`${listStyles.rowAction} ${action.danger ? listStyles.rowActionDanger : ""}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            )}
          </span>
        ))}
      </div>
    );
  };

  const runBulkApply = async () => {
    if (!bulkAction || selectedRowKeys.length === 0) return;

    const selected = filtered.filter((p) => selectedRowKeys.includes(p.id));

    if (bulkAction === "activate") {
      const targets = selected.filter((p) => p.installed && !p.active);
      if (targets.length === 0) {
        message.warning(t("plugins.bulkNothingToDo"));
        return;
      }
      for (const plugin of targets) {
        await runAction("activate", plugin.id);
      }
      setSelectedRowKeys([]);
      setBulkAction(undefined);
      return;
    }

    if (bulkAction === "deactivate") {
      const targets = selected.filter((p) => p.active);
      if (targets.length === 0) {
        message.warning(t("plugins.bulkNothingToDo"));
        return;
      }
      for (const plugin of targets) {
        await runAction("deactivate", plugin.id);
      }
      setSelectedRowKeys([]);
      setBulkAction(undefined);
      return;
    }

    if (bulkAction === "uninstall") {
      const targets = selected.filter((p) => p.installed && !p.active);
      if (targets.length === 0) {
        message.warning(t("plugins.bulkUninstallHint"));
        return;
      }
      modal.confirm({
        title: t("plugins.bulkUninstallTitle", { count: targets.length }),
        content: t("plugins.uninstallConfirmDesc"),
        okText: t("plugins.uninstall"),
        okButtonProps: { danger: true },
        cancelText: t("common.cancel"),
        onOk: async () => {
          for (const plugin of targets) {
            await runAction("uninstall", plugin.id);
          }
          setSelectedRowKeys([]);
          setBulkAction(undefined);
        },
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        title: t("plugins.colPlugin"),
        key: "name",
        width: "28%",
        render: (_: unknown, plugin: PluginListItem) => (
          <PluginListNameCell
            plugin={plugin}
            actions={renderRowActions(plugin)}
            loadError={plugin.loadError}
          />
        ),
      },
      {
        title: t("plugins.colDescription"),
        key: "description",
        render: (_: unknown, plugin: PluginListItem) => (
          <PluginListDescriptionCell plugin={plugin} />
        ),
      },
      {
        title: t("plugins.colStatus"),
        key: "status",
        width: 120,
        render: (_: unknown, plugin: PluginListItem) => {
          if (plugin.active) return t("plugins.statusActive");
          if (plugin.installed) return t("plugins.statusInstalled");
          return <span className={pluginStyles.statusMuted}>{t("plugins.statusAvailable")}</span>;
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, list],
  );

  if (isError) {
    return (
      <ModulePlaceholder
        title={t("placeholder.plugins")}
        description={error instanceof Error ? error.message : t("plugins.loadFailed")}
      />
    );
  }

  const tablenavProps = {
    bulkAction,
    onBulkActionChange: setBulkAction,
    onBulkApply: () => void runBulkApply(),
    bulkApplying: bulkBusy,
    bulkDisabled: selectedRowKeys.length === 0,
    total: filtered.length,
  };

  return (
    <div className={listStyles.wrap} style={listThemeStyle}>
      <PluginListSubHeader
        filter={filter}
        counts={counts}
        onFilterChange={(next) => {
          setFilter(next);
          setSelectedRowKeys([]);
        }}
        keywordInput={keywordInput}
        onKeywordChange={setKeywordInput}
        onSearch={() => setKeyword(keywordInput.trim())}
        onRefresh={() => void refetch()}
        refreshing={isFetching}
      />
      <PluginListTablenav position="top" {...tablenavProps} />
      <div className={`${listStyles.tableCard} ${pluginStyles.tableCard}`}>
        <Table<PluginListItem>
          rowKey="id"
          size="small"
          loading={isLoading}
          dataSource={filtered}
          pagination={false}
          locale={{ emptyText: t("plugins.empty") }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys.map(String)),
          }}
          rowClassName={(record) => (record.active ? "rowActive" : "")}
          columns={columns}
        />
      </div>
      <PluginListTablenav position="bottom" compact {...tablenavProps} />
    </div>
  );
}
