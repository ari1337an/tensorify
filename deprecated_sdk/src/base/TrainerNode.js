"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerNode = void 0;
const BaseNode_1 = require("./BaseNode");
const INode_1 = require("../interfaces/INode");
/**
 * Base class for trainer nodes
 * Provides common functionality for training workflows
 */
class TrainerNode extends BaseNode_1.BaseNode {
    constructor() {
        super(...arguments);
        /** Trainers typically don't have input lines in the traditional sense */
        this.inputLines = 0;
        /** Trainers typically generate training loop code */
        this.outputLinesCount = 1;
        /** Trainers may have secondary inputs for validation data */
        this.secondaryInputLinesCount = 0;
        /** Node type is always TRAINER */
        this.nodeType = INode_1.NodeType.TRAINER;
    }
    /**
     * Get imports commonly needed for training
     */
    getImports(context) {
        const framework = context?.framework || 'pytorch';
        switch (framework) {
            case 'pytorch':
                return [
                    'import torch',
                    'import torch.nn as nn',
                    'import torch.optim as optim',
                    'from torch.utils.data import DataLoader'
                ];
            case 'tensorflow':
                return ['import tensorflow as tf'];
            default:
                return [];
        }
    }
    /**
     * Build training function definition
     */
    buildTrainingFunction(functionName, parameters, body) {
        const paramStr = parameters.join(', ');
        return `def ${functionName}(${paramStr}):\n${this.indentCode(body, 1)}`;
    }
    /**
     * Build training loop structure
     */
    buildTrainingLoop(epochLoop, batchLoop, settings) {
        const epochs = settings.epochs || 1;
        return `
for epoch in range(${epochs}):
${this.indentCode(epochLoop, 1)}
${this.indentCode(batchLoop, 1)}
    `.trim();
    }
    /**
     * Validate trainer settings
     */
    validateSettings(settings) {
        super.validateSettings(settings);
        // Validate numeric parameters
        const numericParams = ['epochs', 'learningRate', 'batchSize'];
        numericParams.forEach(param => {
            const value = settings[param];
            if (value !== undefined) {
                if (typeof value !== 'number' || value <= 0) {
                    throw new Error(`${param} must be a positive number, got: ${value}`);
                }
            }
        });
        // Validate required variable names
        const requiredVars = ['modelVariable', 'optimizerVariable', 'lossFunctionVariable'];
        requiredVars.forEach(varName => {
            const value = settings[varName];
            if (value !== undefined && typeof value !== 'string') {
                throw new Error(`${varName} must be a string, got: ${typeof value}`);
            }
        });
        return true;
    }
}
exports.TrainerNode = TrainerNode;
//# sourceMappingURL=TrainerNode.js.map