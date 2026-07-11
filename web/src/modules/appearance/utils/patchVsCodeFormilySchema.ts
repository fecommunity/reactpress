export type FormilySchemaNode = Record<string, unknown>;

/** Swap Formily decorators to VS Code–style web components. */
export function patchVsCodeFormilySchema(node: FormilySchemaNode | null): FormilySchemaNode | null {
  if (!node || typeof node !== "object") return node;

  const out: FormilySchemaNode = { ...node };

  if (out["x-decorator"] === "FormItem") {
    out["x-decorator"] = "VsCodeSettingRow";
  }
  if (out["x-decorator"] === "SectionCard") {
    out["x-decorator"] = "VsCodeSection";
  }

  if (out.properties && typeof out.properties === "object") {
    out.properties = Object.fromEntries(
      Object.entries(out.properties as Record<string, FormilySchemaNode>).map(([key, child]) => [
        key,
        patchVsCodeFormilySchema(child) as FormilySchemaNode,
      ]),
    );
  }

  if (out.items && typeof out.items === "object" && !Array.isArray(out.items)) {
    out.items = patchVsCodeFormilySchema(out.items as FormilySchemaNode) as FormilySchemaNode;
  }

  return out;
}
