import { getFormilyVoidComponents } from "@fecommunity/reactpress-toolkit/extension";
import {
  ArrayCards,
  Form,
  FormCollapse,
  FormGrid,
  FormItem,
  FormLayout,
  Input,
  NumberPicker,
  Select,
  Submit,
  Switch,
} from "@formily/antd-v5";
import { Schema } from "@formily/json-schema";
import { createSchemaField } from "@formily/react";

import { JsonConfigEditor } from "@/modules/appearance/components/formily/JsonConfigEditor";
import { NavLinkListField } from "@/modules/appearance/components/formily/NavLinkListField";
import { VsCodeSection } from "@/modules/appearance/components/formily/VsCodeSection";
import { VsCodeSettingRow } from "@/modules/appearance/components/formily/VsCodeSettingRow";

/** Shared SchemaField registry — register custom widgets here. */
const { CollapsePanel: FormCollapsePanel } = FormCollapse;

export const SchemaField = createSchemaField({
  components: {
    Form,
    FormItem,
    VsCodeSettingRow,
    FormLayout,
    FormGrid,
    FormCollapse,
    "FormCollapse.CollapsePanel": FormCollapsePanel,
    CollapsePanel: FormCollapsePanel,
    ArrayCards,
    NavLinkListField,
    Input,
    Select,
    Switch,
    NumberPicker,
    Submit,
    JsonConfigEditor,
    VsCodeSection,
    SectionCard: VsCodeSection,
  },
});

let voidComponentsRegistered = false;

/** Call once before rendering theme configuration forms. */
export function ensureFormilyVoidComponentsRegistered(): void {
  if (voidComponentsRegistered) return;
  Schema.registerVoidComponents([...getFormilyVoidComponents(), "VsCodeSection"]);
  voidComponentsRegistered = true;
}
