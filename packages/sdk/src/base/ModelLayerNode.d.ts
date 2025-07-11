import { BaseNode } from "./BaseNode";
import { NodeType } from "../interfaces/INode";
import { LayerSettings, CodeGenerationContext } from "../types";
/**
 * Interface for model layer settings
 */
export interface ModelLayerSettings extends LayerSettings {
    /** Input features/channels/dimensions */
    inFeatures?: number;
    /** Output features/channels/dimensions */
    outFeatures?: number;
    /** Whether to include bias */
    bias?: boolean;
}
/**
 * Base class for model layer nodes (Linear, Conv2d, ReLU, etc.)
 * Provides common functionality for neural network layers
 */
export declare abstract class ModelLayerNode<TSettings extends ModelLayerSettings = ModelLayerSettings> extends BaseNode<TSettings> {
    /** All model layers have 1 input line by default */
    readonly inputLines: number;
    /** All model layers have 1 output line by default */
    readonly outputLinesCount: number;
    /** Model layers typically don't have secondary inputs */
    readonly secondaryInputLinesCount: number;
    /** Node type is always MODEL_LAYER */
    readonly nodeType: NodeType;
    /**
     * Get PyTorch imports commonly needed for model layers
     */
    getImports(context?: CodeGenerationContext): string[];
    /**
     * Build PyTorch layer constructor call
     * @param layerName - Name of the PyTorch layer (e.g., 'nn.Linear', 'nn.Conv2d')
     * @param requiredParams - Required parameters as key-value pairs
     * @param optionalParams - Optional parameters with their default values
     * @param settings - Current settings
     * @returns Complete layer constructor string
     */
    protected buildLayerConstructor(layerName: string, requiredParams: Record<string, any>, optionalParams: Record<string, any>, settings: TSettings): string;
    /**
     * Validate common model layer settings
     */
    validateSettings(settings: TSettings): boolean;
}
//# sourceMappingURL=ModelLayerNode.d.ts.map