import { connect, mapProps } from "@formily/react";
import cls from "classnames";
import type { ReactNode } from "react";

import { SearchHighlight } from "@/modules/appearance/components/SearchHighlight";
import { useThemeSettingsSearchOptional } from "@/modules/appearance/context/ThemeSettingsSearchContext";
import { themeFieldAnchorId } from "@/modules/appearance/utils/themeSettingsAnchors";
import styles from "@/modules/appearance/components/formily/vscode-setting-row.module.css";

type Props = {
  title?: ReactNode;
  description?: ReactNode;
  settingId?: string;
  children?: ReactNode;
};

function fieldSettingId(address: string | undefined): string | undefined {
  if (!address) return undefined;
  const parts = address.split(".");
  if (parts.length < 2) return undefined;
  return themeFieldAnchorId(parts[0], parts[1]);
}

function VsCodeSettingRowInner({ title, description, settingId, children }: Props) {
  const search = useThemeSettingsSearchOptional();
  const query = search?.query ?? "";
  const hidden = search?.isSearchActive && settingId && !search.isEntryVisible(settingId);
  const searchMatch = search?.isSearchActive && settingId && search.visibleIds.has(settingId);

  if (hidden) {
    return null;
  }

  const titleText = title != null ? String(title) : "";
  const descText = description != null ? String(description) : "";

  return (
    <div
      id={settingId}
      className={cls(styles.row, searchMatch && styles.rowSearchMatch)}
      data-setting-row
      data-search-match={searchMatch || undefined}
    >
      {titleText || descText ? (
        <div className={styles.header}>
          {titleText ? (
            <div className={styles.title}>
              <SearchHighlight text={titleText} query={query} />
            </div>
          ) : null}
          {descText ? (
            <div className={styles.description}>
              <SearchHighlight text={descText} query={query} />
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={styles.control}>{children}</div>
    </div>
  );
}

export const VsCodeSettingRow = connect(
  mapProps((props, field) => {
    const address = field?.address?.toString();
    return {
      ...props,
      title: (props as Props).title ?? field?.title,
      description: (props as Props).description ?? field?.description,
      settingId: (props as Props).settingId ?? fieldSettingId(address),
    };
  })(VsCodeSettingRowInner),
);
