import { connect, mapProps, useField } from "@formily/react";
import Editor from "@monaco-editor/react";
import { useMemo } from "react";

import { useThemeSettingsSearchOptional } from "@/modules/appearance/context/ThemeSettingsSearchContext";
import { themeFieldAnchorId } from "@/modules/appearance/utils/themeSettingsAnchors";

function fieldAnchorId(address: string | undefined): string | undefined {
  if (!address) return undefined;
  const parts = address.split(".");
  if (parts.length < 2) return undefined;
  const [sectionKey, fieldKey] = parts;
  return themeFieldAnchorId(sectionKey, fieldKey);
}

type Props = {
  value?: unknown;
  onChange?: (value: unknown) => void;
  description?: string;
  height?: number;
};

function JsonConfigEditorInner({ value, onChange, height = 280 }: Props) {
  const field = useField();
  const anchorId = fieldAnchorId(field.address?.toString());
  const search = useThemeSettingsSearchOptional();
  const hidden = search?.isSearchActive && anchorId && !search.isEntryVisible(anchorId);

  const text = useMemo(() => {
    try {
      return JSON.stringify(value ?? null, null, 2);
    } catch {
      return "{}";
    }
  }, [value]);

  if (hidden) {
    return null;
  }

  return (
    <div
      className="vscode-json-editor"
      style={{
        width: "100%",
        minWidth: 0,
        border: "1px solid var(--vscode-widget-border, var(--ant-color-border))",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Editor
        height={height}
        language="json"
        value={text}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        }}
        onChange={(raw) => {
          if (raw == null || raw.trim() === "") {
            onChange?.(null);
            return;
          }
          try {
            onChange?.(JSON.parse(raw) as unknown);
          } catch {
            /* keep typing until valid JSON */
          }
        }}
      />
    </div>
  );
}

export const JsonConfigEditor = connect(
  mapProps({ description: true }, (props, field) => {
    const componentProps = (field?.componentProps ?? {}) as { height?: number };
    return {
      ...props,
      height: (props as Props).height ?? componentProps.height,
      description:
        (props as Props).description ??
        (typeof field?.description === "string" ? field.description : undefined),
    };
  })(JsonConfigEditorInner),
);
