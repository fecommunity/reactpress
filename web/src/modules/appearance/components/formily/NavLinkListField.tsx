import type { ArrayField } from "@formily/core";
import { connect, useField } from "@formily/react";
import { Button, Input, Switch, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { SearchHighlight } from "@/modules/appearance/components/SearchHighlight";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useThemeSettingsSearchOptional } from "@/modules/appearance/context/ThemeSettingsSearchContext";
import { lookupI18nString, parseSiteI18n } from "@/modules/appearance/utils/parseSiteI18n";
import { themeFieldAnchorId } from "@/modules/appearance/utils/themeSettingsAnchors";
import styles from "@/modules/appearance/components/formily/nav-link-list-field.module.css";

export type NavLinkRow = {
  path: string;
  locale?: string;
  label?: string;
  icon?: string;
  visible?: boolean;
};

function fieldAnchorId(address: string | undefined): string | undefined {
  if (!address) return undefined;
  const parts = address.split(".");
  if (parts.length < 2) return undefined;
  const [sectionKey, fieldKey] = parts;
  return themeFieldAnchorId(sectionKey, fieldKey);
}

function NavLinkListFieldInner() {
  const { t } = useTranslation();
  const field = useField<ArrayField>();
  const { data: settings } = useSiteSettings();
  const siteI18n = useMemo(() => parseSiteI18n(settings?.i18n), [settings?.i18n]);
  const rows = (field.value ?? []) as NavLinkRow[];
  const anchorId = fieldAnchorId(field.address?.toString());
  const search = useThemeSettingsSearchOptional();
  const hidden = search?.isSearchActive && anchorId && !search.isEntryVisible(anchorId);
  const query = search?.query ?? "";

  if (hidden) {
    return null;
  }

  const colTitle = (key: string) => <SearchHighlight text={t(key)} query={query} />;

  const updateRow = (index: number, patch: Partial<NavLinkRow>) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    field.setValue(next);
  };

  const removeRow = (index: number) => {
    field.remove(index);
  };

  const addRow = () => {
    field.push({
      path: "/",
      locale: "",
      label: "",
      icon: "",
      visible: true,
    });
  };

  const columns: ColumnsType<NavLinkRow & { key: number }> = [
    {
      title: colTitle("appearance.navLinkColPath"),
      dataIndex: "path",
      ellipsis: true,
      render: (_, record, index) => (
        <Input
          size="small"
          value={record.path}
          placeholder="/nav"
          onChange={(e) => updateRow(index, { path: e.target.value })}
        />
      ),
    },
    {
      title: colTitle("appearance.navLinkColLocale"),
      dataIndex: "locale",
      width: 200,
      render: (_, record, index) => {
        const key = record.locale?.trim();
        const zh = lookupI18nString(siteI18n.zh, key);
        const en = lookupI18nString(siteI18n.en, key);
        return (
          <div className={styles.localeCell}>
            <Input
              size="small"
              value={record.locale ?? ""}
              placeholder="home"
              onChange={(e) => updateRow(index, { locale: e.target.value })}
            />
            {key ? (
              <Typography.Text type="secondary" className={styles.localePreview}>
                {t("appearance.navLinkLocalePreview", {
                  zh: zh ?? t("appearance.navLinkLocaleMissing"),
                  en: en ?? t("appearance.navLinkLocaleMissing"),
                })}
              </Typography.Text>
            ) : null}
          </div>
        );
      },
    },
    {
      title: colTitle("appearance.navLinkColLabel"),
      dataIndex: "label",
      ellipsis: true,
      render: (_, record, index) => (
        <Input
          size="small"
          value={record.label ?? ""}
          placeholder={t("appearance.navLinkColLabelHint")}
          onChange={(e) => updateRow(index, { label: e.target.value })}
        />
      ),
    },
    {
      title: colTitle("appearance.navLinkColIcon"),
      dataIndex: "icon",
      ellipsis: true,
      render: (_, record, index) => (
        <Input
          size="small"
          value={record.icon ?? ""}
          placeholder="HomeOutlined"
          onChange={(e) => updateRow(index, { icon: e.target.value })}
        />
      ),
    },
    {
      title: colTitle("appearance.navLinkColVisible"),
      dataIndex: "visible",
      width: 72,
      align: "center" as const,
      render: (_, record, index) => (
        <Switch
          size="small"
          checked={record.visible !== false}
          onChange={(checked) => updateRow(index, { visible: checked })}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 48,
      fixed: "right",
      render: (_, __, index) => (
        <Button
          type="text"
          size="small"
          danger
          icon={<Trash2 size={14} />}
          aria-label={t("common.delete")}
          onClick={() => removeRow(index)}
        />
      ),
    },
  ];

  const dataSource = rows.map((row, index) => ({ ...row, key: index }));

  return (
    <div className={styles.wrap}>
      <div className={styles.callout}>
        <div className={styles.calloutTitle}>
          <SearchHighlight text={t("appearance.navLinkI18nTitle")} query={query} />
        </div>
        <ul className={styles.i18nList}>
          <li>
            <SearchHighlight text={t("appearance.navLinkI18nLocale")} query={query} />
          </li>
          <li>
            <SearchHighlight text={t("appearance.navLinkI18nLabel")} query={query} />
          </li>
          <li>
            <SearchHighlight text={t("appearance.navLinkI18nSite")} query={query} />
          </li>
        </ul>
      </div>
      <div className={styles.toolbar}>
        <Typography.Text type="secondary" className={styles.hint}>
          <SearchHighlight text={t("appearance.navLinkListHint")} query={query} />
        </Typography.Text>
        <Button type="dashed" size="small" icon={<Plus size={14} />} onClick={addRow}>
          {t("appearance.navLinkAdd")}
        </Button>
      </div>
      <Table<NavLinkRow & { key: number }>
        className={styles.table}
        size="small"
        bordered
        pagination={false}
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={dataSource}
        locale={{ emptyText: t("appearance.navLinkEmpty") }}
      />
    </div>
  );
}

export const NavLinkListField = connect(NavLinkListFieldInner);
