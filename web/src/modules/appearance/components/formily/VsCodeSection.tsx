import { connect } from "@formily/react";
import cls from "classnames";
import type { ReactNode } from "react";

import styles from "@/modules/appearance/components/formily/vscode-section.module.css";
import { SearchHighlight } from "@/modules/appearance/components/SearchHighlight";
import { useThemeSettingsSearchOptional } from "@/modules/appearance/context/ThemeSettingsSearchContext";

type Props = {
  title?: string;
  sectionId?: string;
  children?: ReactNode;
};

function VsCodeSectionDecorator({ title, sectionId, children }: Props) {
  const search = useThemeSettingsSearchOptional();
  const sectionKey = sectionId?.replace(/^theme-section-/, "") ?? "";
  const query = search?.query ?? "";
  const hidden =
    search?.isSearchActive && sectionId && !search.isSectionVisible(sectionKey, sectionId);
  const searchMatch = search?.isSearchActive && sectionId && search.visibleIds.has(sectionId);

  if (hidden) {
    return null;
  }

  return (
    <section
      id={sectionId}
      className={cls(
        styles.section,
        "theme-config-section",
        searchMatch && styles.sectionSearchMatch,
      )}
      data-vscode-section
    >
      {title ? (
        <h2 className={styles.sectionTitle}>
          <SearchHighlight text={title} query={query} />
        </h2>
      ) : null}
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

export const VsCodeSection = connect(VsCodeSectionDecorator);

/** @deprecated Use VsCodeSection — kept for schema compatibility */
export const SectionCard = VsCodeSection;
