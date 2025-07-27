/**
 * Core type definitions for Tensorify SDK
 */
/**
 * Represents a layer or component in a model
 */
export interface Layer {
    /** Type/class name of the layer */
    type: string;
    /** Child layers or components */
    child?: Layer | Layer[] | null;
    /** Configuration settings for the layer */
    settings?: LayerSettings | NestedLayerSettings;
}
/**
 * Array of layers or single layer
 */
export type Children = Layer[] | Layer | null;
/**
 * Basic settings type for layers - now allows any property structure
 */
export interface LayerSettings {
    [key: string]: any;
}
/**
 * Nested layer settings for complex configurations
 */
export interface NestedLayerSettings extends LayerSettings {
    layers?: Layer[];
    dataFlow?: string;
}
/**
 * Context for code generation
 */
export interface CodeGenerationContext {
    /** Target framework (pytorch, tensorflow, etc.) */
    framework?: string;
    /** Output language (python, javascript, etc.) */
    language?: string;
    /** Additional context data */
    [key: string]: any;
}
/**
 * Plugin payload from plugin-engine
 */
export interface PluginPayload {
    [key: string]: any;
    children?: Children;
    child?: Children;
}
/**
 * Plugin manifest entry point definition
 */
export interface PluginEntryPoint {
    description: string;
    parameters: {
        [paramName: string]: {
            type: string;
            required: boolean;
            description: string;
        };
    };
}
/**
 * Plugin manifest structure
 */
export interface PluginManifest {
    slug: string;
    name: string;
    version?: string;
    description?: string;
    author?: string;
    engineVersion?: string;
    tags?: string[];
    category?: string;
    entryPoints: {
        [entryPointName: string]: PluginEntryPoint;
    };
    dependencies?: string[];
    metadata?: {
        [key: string]: any;
    };
}
//# sourceMappingURL=index.d.ts.map