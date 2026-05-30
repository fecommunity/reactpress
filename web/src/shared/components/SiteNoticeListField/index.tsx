import {
  createEmptySiteNotice,
  parseSiteNotices,
  serializeSiteNotices,
  type SiteNoticeItem,
} from "@fecommunity/reactpress-toolkit/extension";
import { Button, Input, Switch, Tag } from "antd";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import styles from "@/shared/components/SiteNoticeListField/site-notice-list-field.module.css";

export type SiteNoticeListFieldProps = {
  value?: string;
  onChange?: (value: string) => void;
  /** When `value` is empty, display notices from site settings (theme customizer inherit). */
  inheritFrom?: string;
  /** Show「继承全站」banner and reset button (customizer). */
  showInheritHint?: boolean;
};

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [removed] = next.splice(from, 1);
  next.splice(to, 0, removed);
  return next;
}

export function SiteNoticeListField({
  value,
  onChange,
  inheritFrom,
  showInheritHint = false,
}: SiteNoticeListFieldProps) {
  const { t } = useTranslation();
  const hasOverride = Boolean((value ?? "").trim());
  const effectiveRaw = hasOverride ? value : inheritFrom;
  const isInherited = showInheritHint && !hasOverride && Boolean((inheritFrom ?? "").trim());

  const parsedEffective = useMemo(() => parseSiteNotices(effectiveRaw), [effectiveRaw]);
  const [items, setItems] = useState<SiteNoticeItem[]>(parsedEffective);

  useEffect(() => {
    setItems(parseSiteNotices(effectiveRaw));
  }, [effectiveRaw]);

  const emit = (next: SiteNoticeItem[]) => {
    setItems(next);
    onChange?.(serializeSiteNotices(next));
  };

  const updateRow = (index: number, patch: Partial<SiteNoticeItem>) => {
    emit(items.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    emit(items.filter((_, i) => i !== index));
  };

  const moveRow = (index: number, direction: -1 | 1) => {
    emit(moveItem(items, index, index + direction));
  };

  const resetToInherit = () => {
    setItems(parseSiteNotices(inheritFrom));
    onChange?.("");
  };

  return (
    <div className={styles.wrap}>
      {isInherited ? (
        <p className={styles.inheritBanner}>
          <Tag color="blue">{t("appearance.noticeInheritTag")}</Tag>{" "}
          {t("appearance.noticeInheritHint")}
        </p>
      ) : null}
      <div className={styles.toolbar}>
        <Button
          type="dashed"
          icon={<Plus size={14} />}
          onClick={() => emit([...items, createEmptySiteNotice()])}
        >
          {t("settings.addNotice")}
        </Button>
        {showInheritHint && (hasOverride || items.length > 0) ? (
          <Button type="link" onClick={resetToInherit}>
            {t("appearance.noticeResetInherit")}
          </Button>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className={styles.empty}>{t("settings.noticeListEmpty")}</p>
      ) : (
        <div className={styles.list}>
          {items.map((row, index) => (
            <div key={row.id} className={styles.item}>
              <div className={styles.orderCol}>
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUp size={14} />}
                  disabled={index === 0}
                  aria-label={t("settings.moveNoticeUp")}
                  onClick={() => moveRow(index, -1)}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDown size={14} />}
                  disabled={index === items.length - 1}
                  aria-label={t("settings.moveNoticeDown")}
                  onClick={() => moveRow(index, 1)}
                />
              </div>
              <div className={styles.bodyCol}>
                <div className={styles.metaRow}>
                  <span className={styles.orderLabel}>
                    {t("settings.noticeOrder", { index: index + 1 })}
                  </span>
                  <span>
                    <Switch
                      size="small"
                      checked={row.enabled !== false}
                      onChange={(checked) => updateRow(index, { enabled: checked })}
                    />
                    <span style={{ marginLeft: 8, fontSize: 12 }}>
                      {t("settings.noticeEnabled")}
                    </span>
                  </span>
                </div>
                <Input.TextArea
                  rows={2}
                  value={row.content}
                  placeholder={t("settings.noticeContentPlaceholder")}
                  onChange={(e) => updateRow(index, { content: e.target.value })}
                />
              </div>
              <Button
                type="text"
                danger
                icon={<Trash2 size={14} />}
                aria-label={t("settings.removeNotice")}
                onClick={() => removeRow(index)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
