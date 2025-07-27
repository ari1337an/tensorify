"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataNode = void 0;
const BaseNode_1 = require("./BaseNode");
const INode_1 = require("../interfaces/INode");
/**
 * Base class for data-related nodes (DataLoader, Dataset, etc.)
 * Provides common functionality for data handling components
 */
class DataNode extends BaseNode_1.BaseNode {
    constructor() {
        super(...arguments);
        /** Data nodes typically don't have input lines */
        this.inputLines = 0;
        /** Data nodes typically produce one data object */
        this.outputLinesCount = 1;
        /** Data nodes typically don't have secondary inputs */
        this.secondaryInputLinesCount = 0;
        /** Node type is always DATALOADER */
        this.nodeType = INode_1.NodeType.DATALOADER;
    }
    /**
     * Get imports commonly needed for data handling
     */
    getImports(context) {
        const framework = context?.framework || "pytorch";
        switch (framework) {
            case "pytorch":
                return [
                    "import torch",
                    "from torch.utils.data import Dataset, DataLoader",
                    "import torchvision.transforms as transforms",
                ];
            case "tensorflow":
                return ["import tensorflow as tf"];
            default:
                return [];
        }
    }
    /**
     * Build DataLoader constructor call
     */
    buildDataLoaderConstructor(datasetVariable, settings) {
        const params = [`${datasetVariable}`];
        if (settings.batchSize !== undefined) {
            params.push(`batch_size=${settings.batchSize}`);
        }
        if (settings.shuffle !== undefined) {
            params.push(`shuffle=${settings.shuffle ? "True" : "False"}`);
        }
        if (settings.numWorkers !== undefined) {
            params.push(`num_workers=${settings.numWorkers}`);
        }
        return `DataLoader(${params.join(", ")})`;
    }
    /**
     * Build Dataset class definition
     */
    buildDatasetClass(className, initBody, getitemBody, lenBody) {
        return `
class ${className}(Dataset):
    def __init__(self, *args, **kwargs):
${this.indentCode(initBody, 2)}
    
    def __len__(self):
${this.indentCode(lenBody, 2)}
    
    def __getitem__(self, idx):
${this.indentCode(getitemBody, 2)}
    `.trim();
    }
    /**
     * Validate data node settings
     */
    validateSettings(settings) {
        super.validateSettings(settings);
        // Validate numeric parameters
        const numericParams = ["batchSize", "numWorkers"];
        numericParams.forEach((param) => {
            const value = settings[param];
            if (value !== undefined) {
                if (typeof value !== "number" || value < 0) {
                    throw new Error(`${param} must be a non-negative number, got: ${value}`);
                }
            }
        });
        // Validate boolean parameters
        if (settings.shuffle !== undefined &&
            typeof settings.shuffle !== "boolean") {
            throw new Error(`shuffle must be a boolean, got: ${typeof settings.shuffle}`);
        }
        return true;
    }
}
exports.DataNode = DataNode;
//# sourceMappingURL=DataNode.js.map