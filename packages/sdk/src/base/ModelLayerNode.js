"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelLayerNode = void 0;
const BaseNode_1 = require("./BaseNode");
const INode_1 = require("../interfaces/INode");
/**
 * Base class for model layer nodes (Linear, Conv2d, ReLU, etc.)
 * Provides common functionality for neural network layers
 */
class ModelLayerNode extends BaseNode_1.BaseNode {
    constructor() {
        super(...arguments);
        /** All model layers have 1 input line by default */
        this.inputLines = 1;
        /** All model layers have 1 output line by default */
        this.outputLinesCount = 1;
        /** Model layers typically don't have secondary inputs */
        this.secondaryInputLinesCount = 0;
        /** Node type is always MODEL_LAYER */
        this.nodeType = INode_1.NodeType.MODEL_LAYER;
    }
    /**
     * Get PyTorch imports commonly needed for model layers
     */
    getImports(context) {
        const framework = context?.framework || "pytorch";
        switch (framework) {
            case "pytorch":
                return ["import torch", "import torch.nn as nn"];
            case "tensorflow":
                return ["import tensorflow as tf"];
            default:
                return [];
        }
    }
    /**
     * Build PyTorch layer constructor call
     * @param layerName - Name of the PyTorch layer (e.g., 'nn.Linear', 'nn.Conv2d')
     * @param requiredParams - Required parameters as key-value pairs
     * @param optionalParams - Optional parameters with their default values
     * @param settings - Current settings
     * @returns Complete layer constructor string
     */
    buildLayerConstructor(layerName, requiredParams, optionalParams, settings) {
        // Add required parameters first
        const params = [];
        Object.entries(requiredParams).forEach(([key, value]) => {
            params.push(this.stringifyParameter(value));
        });
        // Add optional parameters that differ from defaults
        Object.entries(optionalParams).forEach(([key, defaultValue]) => {
            const currentValue = settings[key];
            if (currentValue !== undefined && currentValue !== defaultValue) {
                params.push(`${key}=${this.stringifyParameter(currentValue)}`);
            }
        });
        return `${layerName}(${params.join(", ")})`;
    }
    /**
     * Validate common model layer settings
     */
    validateSettings(settings) {
        super.validateSettings(settings);
        // Check for negative values in size-related parameters
        const sizeParams = ["inFeatures", "outFeatures", "inputSize", "outputSize"];
        sizeParams.forEach((param) => {
            const value = settings[param];
            if (value !== undefined && typeof value === "number" && value <= 0) {
                throw new Error(`${param} must be a positive number, got: ${value}`);
            }
        });
        return true;
    }
}
exports.ModelLayerNode = ModelLayerNode;
//# sourceMappingURL=ModelLayerNode.js.map