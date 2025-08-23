import { z } from "zod";

// Versioning for DTO schemas
export const SCHEMA_VERSION = "1.0.0" as const;

// Core enums re-declared here to decouple consumers from SDK churn
export const NodeTypeEnum = z.enum([
  "custom",
  "trainer",
  "evaluator",
  "model",
  "model_layer",
  "sequence",
  "dataset",
  "dataloader",
  "preprocessor",
  "postprocessor",
  "augmentation_stack",
  "optimizer",
  "loss_function",
  "metric",
  "scheduler",
  "regularizer",
  "function",
  "pipeline",
  "report",
]);
export type NodeType = z.infer<typeof NodeTypeEnum>;

export const HandleViewTypeEnum = z.enum([
  "default",
  "verticalBox",
  "circle-lg",
  "diamond",
  "square",
  "triangle",
]);

export const HandlePositionEnum = z.enum([
  "top",
  "top-right",
  "right",
  "bottom-right",
  "bottom",
  "bottom-left",
  "left",
  "top-left",
]);

export const EdgeTypeEnum = z.enum([
  "default",
  "solid",
  "dotted",
  "dashed",
  "accent",
  "muted",
  "success",
  "warning",
  "error",
]);

export const HandleDataTypeEnum = z.enum([
  "any",
  "string",
  "number",
  "boolean",
  "object",
  "array",
  // Node types for variable provider validation
  "dataset",
  "dataloader",
  "model",
  "model_layer",
  "sequence",
  "trainer",
  "evaluator",
  "preprocessor",
  "postprocessor",
  "augmentation_stack",
  "optimizer",
  "loss_function",
  "metric",
  "scheduler",
  "regularizer",
  "function",
  "pipeline",
  "report",
  "custom",
]);

// Handles
export const InputHandleSchema = z.object({
  id: z.string(),
  position: HandlePositionEnum,
  viewType: HandleViewTypeEnum,
  required: z.boolean().optional(),
  label: z.string().optional(),
  edgeType: EdgeTypeEnum.optional(),
  dataType: HandleDataTypeEnum,
  description: z.string().optional(),
  // Tensor shape expected at this input (client-side evaluated)
  // Keep schema permissive to avoid breaking older manifests
  expectedShape: z.any().optional(),
  validation: z
    .object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
      customValidator: z.string().optional(),
    })
    .optional(),
});

export const OutputHandleSchema = z.object({
  id: z.string(),
  position: HandlePositionEnum,
  viewType: HandleViewTypeEnum,
  label: z.string().optional(),
  edgeType: EdgeTypeEnum.optional(),
  dataType: HandleDataTypeEnum,
  description: z.string().optional(),
});

// Visual
export const NodeSizeSchema = z.object({
  width: z.number(),
  height: z.number(),
  minWidth: z.number().optional(),
  minHeight: z.number().optional(),
  maxWidth: z.number().optional(),
  maxHeight: z.number().optional(),
  aspectRatio: z.enum(["fixed", "flexible"]).optional(),
});

export const NodePaddingSchema = z.object({
  inner: z.number().default(16),
  outer: z.number().default(8),
  extraPadding: z.boolean().default(false),
});

export const NodeStylingSchema = z.object({
  borderRadius: z.number().default(8),
  borderWidth: z.number().default(2),
  borderColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  shadowLevel: z
    .union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
    .default(1),
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
});

export const NodeIconSchema = z.object({
  type: z.enum(["svg", "fontawesome", "lucide"]).default("lucide"),
  value: z.string(),
  position: z.enum(["center", "top", "left", "bottom", "right"]).optional(),
});

export const NodeIconsSchema = z.object({
  primary: NodeIconSchema.nullable().optional(),
  secondary: z.array(NodeIconSchema).default([]),
  showIconBackground: z.boolean().default(true),
  iconSize: z.enum(["small", "medium", "large"]).default("medium"),
});

export const NodeLabelsSchema = z.object({
  title: z.string().optional(),
  titleDescription: z.string().optional(),
  dynamicLabelTemplate: z.string().optional(),
  showLabels: z.boolean().default(true),
  labelPosition: z.enum(["top", "bottom", "overlay"]).default("top"),
});

export const NodeVisualConfigSchema = z.object({
  containerType: z
    .enum(["default", "box", "circle", "left-round"])
    .default("default"),
  size: NodeSizeSchema,
  padding: NodePaddingSchema.default({
    inner: 16,
    outer: 8,
    extraPadding: false,
  }),
  styling: NodeStylingSchema.default({
    borderRadius: 8,
    borderWidth: 2,
    shadowLevel: 1,
    theme: "auto",
  }),
  icons: NodeIconsSchema.default({
    secondary: [],
    showIconBackground: true,
    iconSize: "medium",
  }),
  labels: NodeLabelsSchema.default({ showLabels: true, labelPosition: "top" }),
  sequence: z
    .object({
      allowedItemType: z.string().optional(),
      showItems: z.boolean().default(true).optional(),
    })
    .optional(),
});

// Settings
export const SettingsUITypeEnum = z.enum([
  "input-text",
  "textarea",
  "input-number",
  "slider",
  "toggle",
  "checkbox",
  "dropdown",
  "radio",
  "multi-select",
  "code-editor",
  "file-upload",
  "color-picker",
  "date-picker",
]);

export const SettingsDataTypeEnum = z.enum([
  "string",
  "number",
  "boolean",
  "array",
  "object",
  "file",
  "date",
  "color",
]);

export const FieldValidationSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  customValidator: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const SettingsFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: SettingsUITypeEnum,
  dataType: SettingsDataTypeEnum,
  defaultValue: z.any().optional(),
  required: z.boolean(),
  description: z.string().optional(),
  validation: FieldValidationSchema.optional(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.any(),
        description: z.string().optional(),
        disabled: z.boolean().optional(),
      })
    )
    .optional(),
  placeholder: z.string().optional(),
  group: z.string().optional(),
  order: z.number().optional(),
  conditionalDisplay: z
    .object({
      dependsOn: z.string(),
      condition: z.enum([
        "equals",
        "not-equals",
        "greater-than",
        "less-than",
        "contains",
        "not-contains",
      ]),
      value: z.any(),
    })
    .optional(),
});

export const SettingsGroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
  collapsible: z.boolean().default(true),
  defaultExpanded: z.boolean().default(true),
  fields: z.array(z.string()),
  order: z.number().optional(),
});

// UI Manifest DTO (what UI consumes)
export const UIManifestSchema = z.object({
  schemaVersion: z.string().default(SCHEMA_VERSION),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  main: z.string().default("dist/index.js"),
  entrypointClassName: z.string(),
  keywords: z.array(z.string()).default([]),
  repository: z.object({ type: z.string(), url: z.string().url() }).optional(),
  pluginType: NodeTypeEnum, // required
  tensorify: z
    .object({ pluginType: z.string().optional() })
    .partial()
    .optional(),

  frontendConfigs: z.object({
    id: z.string(),
    name: z.string(),
    category: NodeTypeEnum,
    nodeType: NodeTypeEnum,
    visual: NodeVisualConfigSchema,
    inputHandles: z.array(InputHandleSchema),
    outputHandles: z.array(OutputHandleSchema),
    settingsFields: z.array(SettingsFieldSchema),
    settingsGroups: z.array(SettingsGroupSchema).optional(),
  }),

  capabilities: z.array(z.string()).default([]),
  requirements: z
    .object({
      minSdkVersion: z.string().optional(),
      dependencies: z.array(z.string()).default([]),
      pythonPackages: z.array(z.string()).optional(),
      nodePackages: z.array(z.string()).optional(),
      environmentVariables: z.array(z.string()).optional(),
    })
    .default({ dependencies: [] }),

  // Enforce emits presence and shape
  emits: z
    .object({
      variables: z
        .array(
          z.object({
            value: z.string().min(1),
            switchKey: z.string().min(1),
            isOnByDefault: z.boolean().optional(),
            type: z.string().optional(),
            // Tensor shape description for this emitted variable
            // Use z.any() to preserve forward/backward compatibility
            shape: z.any().optional(),
          })
        )
        .default([]),
      imports: z
        .array(
          z.object({
            path: z.string().min(1),
            items: z.array(z.string()).optional(),
            alias: z.string().optional(),
            as: z.record(z.string(), z.string()).optional(),
          })
        )
        .default([]),
    })
    .default({ variables: [], imports: [] }),
});
export type UIManifest = z.infer<typeof UIManifestSchema>;

// Installed plugin record (DB DTO shape – not Prisma types)
export const InstalledPluginRecordSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  description: z.string().nullable(),
  pluginType: z.string(),
  manifest: UIManifestSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type InstalledPluginRecord = z.infer<typeof InstalledPluginRecordSchema>;

// Webhook payload (backend -> plugins site)
export const PluginPublishedWebhookSchema = z.object({
  slug: z.string(),
  name: z.string(),
  version: z.string().optional(),
  description: z.string().optional(),
  author: z.string(),
  authorFullName: z.string().optional(),
  status: z.string().optional(),
  isPublic: z.boolean().optional(),
  githubUrl: z.string().url().optional(),
  entrypointClassName: z.string().optional(),
  files: z.array(z.string()),
  authorId: z.string(),
  publishedAt: z.string().optional(),
  readme: z.string().optional(),
  tags: z.string().optional(),
  sdkVersion: z.string().optional(),
  pluginType: z.string().optional(),
});
export type PluginPublishedWebhook = z.infer<
  typeof PluginPublishedWebhookSchema
>;

// Normalizers
export function coerceLegacyPluginType(input?: unknown): NodeType | undefined {
  if (typeof input !== "string") return undefined;
  const lower = input.toLowerCase();
  if (NodeTypeEnum.options.includes(lower as any)) return lower as NodeType;
  // common aliases
  const map: Record<string, NodeType> = {
    modelLayer: "model_layer",
  } as any;
  return map[lower];
}

export function normalizeUiManifest(manifest: unknown): UIManifest {
  // Best-effort coercion for legacy keys
  const m: any = manifest || {};
  if (m.frontendConfigs?.nodeType && !m.frontendConfigs?.category) {
    m.frontendConfigs.category = m.frontendConfigs.nodeType;
  }
  // Resolve pluginType precedence:
  // 1) package.json tensorify-settings.pluginType if provided via caller as m.tensorifySettings?.pluginType
  // 2) legacy m.tensorify.pluginType
  // 3) existing m.pluginType
  const fromTensorifySettings = coerceLegacyPluginType(
    m.tensorifySettings?.pluginType
  );
  const fromLegacyTensorify = coerceLegacyPluginType(m.tensorify?.pluginType);
  m.pluginType = fromTensorifySettings || fromLegacyTensorify || m.pluginType;
  // Check if this is a variable provider plugin that doesn't need prev/next handles
  const isVariableProvider = ["dataset", "dataloader"].includes(m.pluginType);

  // For non-variable providers, validate prev/next handles before parsing
  if (!isVariableProvider) {
    const inputHandles = m.frontendConfigs?.inputHandles || [];
    const outputHandles = m.frontendConfigs?.outputHandles || [];

    const hasPrev = inputHandles.some(
      (h: any) =>
        h.id === "prev" && h.position === "left" && h.required === true
    );
    const hasNext = outputHandles.some(
      (h: any) => h.id === "next" && h.position === "right"
    );

    if (!hasPrev) {
      throw new Error(
        "An input handle 'prev' on the LEFT marked required: true is required"
      );
    }
    if (!hasNext) {
      throw new Error("An output handle 'next' on the RIGHT is required");
    }
  }

  const parsed = UIManifestSchema.parse(m);

  // Validate that for each emitted variable switchKey, a corresponding settings field exists
  const settingsFields = parsed.frontendConfigs.settingsFields || [];
  const settingsMap = new Map<string, any>();
  for (const f of settingsFields) settingsMap.set((f as any).key, f);
  for (const v of parsed.emits.variables) {
    const rawKey = v.switchKey.includes(".")
      ? v.switchKey.split(".").pop()!
      : v.switchKey;
    const field = settingsMap.get(rawKey);
    if (!field) {
      throw new Error(
        `Emitted variable '${v.value}' requires a settings toggle '${rawKey}' as referenced by switchKey '${v.switchKey}'`
      );
    }
    if (
      (field as any).type !== "toggle" ||
      (field as any).dataType !== "boolean"
    ) {
      throw new Error(
        `Settings field '${rawKey}' must be TOGGLE/BOOLEAN because it controls emitted variable '${v.value}'`
      );
    }
    if ((field as any).required !== true) {
      throw new Error(
        `Settings field '${rawKey}' must be required: true because it controls emitted variable '${v.value}'`
      );
    }
    if (typeof v.isOnByDefault === "boolean") {
      const defVal = (field as any).defaultValue;
      if (defVal !== v.isOnByDefault) {
        throw new Error(
          `Settings field '${rawKey}'.defaultValue must match isOnByDefault (${String(
            v.isOnByDefault
          )}) for emitted variable '${v.value}'`
        );
      }
    }
  }

  return parsed;
}

export function toPluginPublishedWebhook(
  input: PluginPublishedWebhook
): PluginPublishedWebhook {
  return PluginPublishedWebhookSchema.parse(input);
}
