"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeType = void 0;
/**
 * Node types enumeration for categorizing different plugin types
 */
var NodeType;
(function (NodeType) {
    NodeType["CUSTOM"] = "custom";
    NodeType["TRAINER"] = "trainer";
    NodeType["EVALUATOR"] = "evaluator";
    NodeType["MODEL"] = "model";
    NodeType["MODEL_LAYER"] = "model_layer";
    NodeType["DATALOADER"] = "dataloader";
    NodeType["OPTIMIZER"] = "optimizer";
    NodeType["REPORT"] = "report";
    NodeType["FUNCTION"] = "function";
    NodeType["PIPELINE"] = "pipeline";
    NodeType["AUGMENTATION_STACK"] = "augmentation_stack";
    NodeType["PREPROCESSOR"] = "preprocessor";
    NodeType["POSTPROCESSOR"] = "postprocessor";
    NodeType["LOSS_FUNCTION"] = "loss_function";
    NodeType["METRIC"] = "metric";
    NodeType["SCHEDULER"] = "scheduler";
    NodeType["REGULARIZER"] = "regularizer";
})(NodeType || (exports.NodeType = NodeType = {}));
//# sourceMappingURL=INode.js.map