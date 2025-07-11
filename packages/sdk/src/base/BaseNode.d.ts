import { IUniversalNode, NodeType } from "../interfaces/INode";
import { Children, LayerSettings, PluginPayload, CodeGenerationContext, PluginManifest } from "../types";
/**
 * Abstract base class for all Tensorify nodes/plugins
 * Provides common functionality and ensures compatibility with both
 * the transpiler and plugin-engine systems
 */
export declare abstract class BaseNode<TSettings extends LayerSettings = LayerSettings> implements IUniversalNode<TSettings> {
    /** Name of the node */
    abstract readonly name: string;
    /** Template used for translation */
    abstract readonly translationTemplate: string;
    /** Number of input lines */
    abstract readonly inputLines: number;
    /** Number of output lines */
    abstract readonly outputLinesCount: number;
    /** Number of secondary input lines */
    abstract readonly secondaryInputLinesCount: number;
    /** Type of the node */
    abstract readonly nodeType: NodeType;
    /** Default settings for the node */
    abstract readonly settings: TSettings;
    /** Optional child nodes */
    readonly child?: Children;
    /**
     * Main translation method - must be implemented by subclasses
     */
    abstract getTranslationCode(settings: TSettings, children?: Children, context?: CodeGenerationContext): string;
    /**
     * Validate settings before code generation
     * Default implementation checks for required fields
     * Override in subclasses for custom validation
     */
    validateSettings(settings: TSettings): boolean;
    /**
     * Get required dependencies for this node
     * Override in subclasses to specify dependencies
     */
    getDependencies(): string[];
    /**
     * Get imports needed for this node
     * Override in subclasses to specify imports
     */
    getImports(context?: CodeGenerationContext): string[];
    /**
     * Process payload data from plugin-engine
     * This enables compatibility with the new plugin-engine system
     */
    processPayload(payload: PluginPayload): string;
    /**
     * Convert payload to settings and children
     * Default implementation uses payload directly as settings
     * Override in subclasses for custom payload processing
     */
    payloadToSettings(payload: PluginPayload): {
        settings: TSettings;
        children?: Children;
    };
    /**
     * Get available entry points for this plugin
     * Default implementation provides basic entry points
     * Override in subclasses to add more entry points
     */
    getEntryPoints(): Record<string, string>;
    /**
     * Get plugin manifest information
     * Override in subclasses to provide specific manifest data
     */
    getManifest(): Partial<PluginManifest>;
    /**
     * Utility method to indent code by a given number of levels
     */
    protected indentCode(code: string, indentLevels: number): string;
    /**
     * Utility method to stringify a parameter for Python code
     */
    protected stringifyParameter(value: any): string;
    /**
     * Utility method to build parameter string for function calls
     */
    protected buildParameterString(params: Record<string, any>, excludeDefaults?: Record<string, any>): string;
    /**
     * Utility method to validate required parameters
     */
    protected validateRequiredParams(settings: TSettings, requiredParams: string[]): void;
}
//# sourceMappingURL=BaseNode.d.ts.map