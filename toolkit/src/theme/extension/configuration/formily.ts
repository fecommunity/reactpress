import type { ConfigurationUiMeta, ThemeConfigurationPropertySchema, ThemeConfigurationSchema } from './types';

/** Formily `ISchema` node (JSON Schema + Formily x-* extensions). */
export type FormilySchemaNode = Record<string, unknown>;

const VOID_COMPONENTS = [
  'FormLayout',
  'FormGrid',
  'FormGrid.GridColumn',
  'SectionCard',
  'FormCollapse',
  'FormCollapse.CollapsePanel',
  'CollapsePanel',
  'FormTab',
  'FormTab.TabPane',
];

/** Map `x-ui.widget` → Formily `x-component` (extend via registerFormilyWidget). */
const WIDGET_COMPONENT_MAP: Record<string, string> = {
  navLinkList: 'NavLinkListField',
  urlConfigEditor: 'JsonConfigEditor',
  navSearchEditor: 'JsonConfigEditor',
};

const registeredWidgets: Record<string, string> = { ...WIDGET_COMPONENT_MAP };

export function registerFormilyWidget(widgetId: string, componentName: string): void {
  registeredWidgets[widgetId] = componentName;
}

/**
 * Convert theme `reactpress.configuration` JSON Schema to Formily render schema.
 * Adds `x-decorator` / `x-component` from types and `x-ui.widget`.
 */
export function toFormilyJsonSchema(
  schema: ThemeConfigurationSchema | null | undefined,
): FormilySchemaNode | null {
  if (!schema || schema.type !== 'object') return null;
  const root = convertProperty(
    { ...schema, type: 'object' } as ThemeConfigurationPropertySchema,
    0,
    true,
  );
  const sectionProps = (root.properties ?? {}) as Record<string, FormilySchemaNode>;
  return {
    type: 'object',
    'x-component': 'FormLayout',
    'x-component-props': { layout: 'vertical', style: { width: '100%' } },
    properties: wrapRootSections(sectionProps),
  };
}

/** Full-width section cards; field paths stay `header.*` / `nav.*`. */
function wrapRootSections(properties: Record<string, FormilySchemaNode>): Record<string, FormilySchemaNode> {
  return Object.fromEntries(
    Object.entries(properties).map(([key, child]) => {
      const title = typeof child.title === 'string' ? child.title : key;
      const inner = withObjectLayout(child);
      return [
        key,
        {
          ...inner,
          'x-decorator': 'SectionCard',
          'x-decorator-props': {
            title,
            sectionId: `theme-section-${key}`,
            feedbackLayout: 'none',
            layout: 'vertical',
            fullness: true,
          },
        },
      ];
    }),
  );
}

/** Ensure nested object fields render their properties in Formily. */
function withObjectLayout(node: FormilySchemaNode, title?: string): FormilySchemaNode {
  if (node.type !== 'object' || !node.properties) return node;
  const props = node.properties as Record<string, FormilySchemaNode>;
  const keys = Object.keys(props);
  return {
    ...node,
    ...(keys.length > 1 ? { title } : {}),
    'x-component': 'FormLayout',
    'x-component-props': { layout: 'vertical' },
  };
}

function convertProperty(
  node: ThemeConfigurationPropertySchema,
  depth: number,
  isRoot = false,
): FormilySchemaNode {
  const ui = node['x-ui'] as ConfigurationUiMeta | undefined;
  if (ui?.hidden) {
    return { ...node, 'x-display': 'hidden' };
  }

  const type = typeof node.type === 'string' ? node.type : undefined;

  if (type === 'object') {
    const widget = ui?.widget ? registeredWidgets[ui.widget] : undefined;
    if (widget === 'JsonConfigEditor') {
      return {
        ...stripMeta(node),
        type: 'object',
        'x-decorator': 'FormItem',
        'x-decorator-props': {
          feedbackLayout: 'none',
          layout: 'vertical',
          fullness: true,
          wrapperCol: 24,
        },
        'x-component': 'JsonConfigEditor',
        'x-component-props': { height: 360 },
      };
    }
    if (node.properties) {
      const properties = Object.fromEntries(
        Object.entries(node.properties).map(([key, child]) => [
          key,
          convertProperty(child, depth + 1),
        ]),
      );
      return {
        ...stripMeta(node),
        type: 'object',
        properties,
      };
    }
  }

  if (type === 'array') {
    const widget = ui?.widget ? registeredWidgets[ui.widget] : undefined;
    const out: FormilySchemaNode = {
      ...stripMeta(node),
      type: 'array',
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        feedbackLayout: 'none',
        layout: 'vertical',
        colon: false,
        fullness: true,
        wrapperCol: 24,
      },
      'x-component': widget ?? 'ArrayCards',
      'x-component-props':
        widget === 'NavLinkListField'
          ? {}
          : widget === 'ArrayCards'
            ? { title: node.title ?? 'Item' }
            : {},
    };
    if (widget !== 'NavLinkListField' && node.items && typeof node.items === 'object' && !Array.isArray(node.items)) {
      out.items = convertProperty(node.items as ThemeConfigurationPropertySchema, depth + 1);
    }
    return out;
  }

  if (type === 'boolean') {
    return {
      ...stripMeta(node),
      type: 'boolean',
      'x-decorator': 'FormItem',
      'x-component': 'Switch',
    };
  }

  if (type === 'number' || type === 'integer') {
    return {
      ...stripMeta(node),
      type: 'number',
      'x-decorator': 'FormItem',
      'x-component': 'NumberPicker',
    };
  }

  if (type === 'string') {
    const component = node.enum ? 'Select' : 'Input';
    return {
      ...stripMeta(node),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': component,
    };
  }

  return { ...stripMeta(node) };
}

function stripMeta(node: ThemeConfigurationPropertySchema): FormilySchemaNode {
  const { ['x-ui']: _ui, ...rest } = node;
  return { ...rest };
}

export function getFormilyVoidComponents(): string[] {
  return [...VOID_COMPONENTS];
}
