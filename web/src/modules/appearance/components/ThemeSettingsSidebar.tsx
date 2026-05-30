import { Typography } from "antd";
import cls from "classnames";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useThemeSettingsSearch } from "@/modules/appearance/context/ThemeSettingsSearchContext";
import { useThemeSettingsActiveId } from "@/modules/appearance/hooks/useThemeSettingsActiveId";
import { SearchHighlight } from "@/modules/appearance/components/SearchHighlight";
import { scrollToThemeAnchor } from "@/modules/appearance/utils/themeSettingsIndex";
import styles from "@/modules/appearance/components/theme-settings-editor.module.css";

type SidebarGroup = {
  sectionKey: string;
  sectionId: string;
  title: string;
  href: string;
  fields: Array<{ id: string; title: string; href: string }>;
};

type Props = {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
};

function buildSidebarGroups(
  filteredIndex: ReturnType<typeof useThemeSettingsSearch>["filteredIndex"],
): SidebarGroup[] {
  const map = new Map<string, SidebarGroup>();

  for (const entry of filteredIndex) {
    if (entry.level === 1) {
      if (!map.has(entry.sectionKey)) {
        map.set(entry.sectionKey, {
          sectionKey: entry.sectionKey,
          sectionId: entry.id,
          title: entry.title,
          href: entry.href,
          fields: [],
        });
      }
      continue;
    }

    let group = map.get(entry.sectionKey);
    if (!group) {
      const sectionEntry = filteredIndex.find(
        (e) => e.level === 1 && e.sectionKey === entry.sectionKey,
      );
      group = {
        sectionKey: entry.sectionKey,
        sectionId: sectionEntry?.id ?? entry.id,
        title: sectionEntry?.title ?? entry.sectionTitle,
        href: sectionEntry?.href ?? entry.href,
        fields: [],
      };
      map.set(entry.sectionKey, group);
    }
    group.fields.push({ id: entry.id, title: entry.title, href: entry.href });
  }

  return [...map.values()];
}

export function ThemeSettingsSidebar({ scrollContainerRef }: Props) {
  const { t } = useTranslation();
  const { filteredIndex, isSearchActive, query: searchQuery } = useThemeSettingsSearch();

  const groups = useMemo(() => buildSidebarGroups(filteredIndex), [filteredIndex]);
  const orderedIds = useMemo(() => filteredIndex.map((e) => e.id), [filteredIndex]);

  const { activeId, setActiveProgrammatically } = useThemeSettingsActiveId({
    scrollContainerRef,
    orderedIds,
    resetKey: searchQuery,
  });

  const navigate = useCallback(
    (href: string, id: string) => {
      setActiveProgrammatically(id);
      scrollToThemeAnchor(href, scrollContainerRef.current);
    },
    [scrollContainerRef, setActiveProgrammatically],
  );

  if (groups.length === 0) {
    return (
      <aside className={styles.sidebar}>
        <Typography.Text type="secondary" className={styles.sidebarEmpty}>
          {isSearchActive
            ? t("appearance.themeSettingsSearchEmpty")
            : t("appearance.themeSettingsNoSchema")}
        </Typography.Text>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar} aria-label={t("appearance.themeSettingsNav")}>
      <div className={styles.sidebarInner}>
        {groups.map((group) => (
          <div key={group.sectionKey} className={styles.sidebarGroup}>
            <button
              type="button"
              className={cls(styles.sidebarSection, {
                [styles.sidebarItemActive]: activeId === group.sectionId,
              })}
              onClick={() => navigate(group.href, group.sectionId)}
            >
              <SearchHighlight text={group.title} query={searchQuery} />
            </button>
            {group.fields.length > 0 ? (
              <ul className={styles.sidebarFields}>
                {group.fields.map((field) => (
                  <li key={field.id}>
                    <button
                      type="button"
                      className={cls(styles.sidebarField, {
                        [styles.sidebarItemActive]: activeId === field.id,
                      })}
                      onClick={() => navigate(field.href, field.id)}
                    >
                      <SearchHighlight text={field.title} query={searchQuery} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </aside>
  );
}
