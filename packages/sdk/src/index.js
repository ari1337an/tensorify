"use strict";
/**
 * @tensorify.io/sdk
 *
 * TypeScript SDK for creating Tensorify plugins with comprehensive base classes,
 * utilities, and full compatibility with both transpiler and plugin-engine systems.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK_VERSION = exports.CURRENT_SDK_VERSION = exports.PackageJsonSchema = exports.ManifestSchema = exports.validatePlugin = exports.PluginValidator = exports.compareVersions = exports.parseVersion = exports.formatTensorShape = exports.validateTensorDimensions = exports.buildImports = exports.normalizeSettings = exports.deepMerge = exports.snakeToCamel = exports.camelToSnake = exports.formatPythonCode = exports.sanitizeVariableName = exports.generateVariableName = exports.DataNode = exports.TrainerNode = exports.ModelLayerNode = exports.BaseNode = exports.NodeType = void 0;
exports.createManifest = createManifest;
exports.validateManifest = validateManifest;
exports.createEntryPoint = createEntryPoint;
// Core interfaces
var INode_1 = require("./interfaces/INode");
Object.defineProperty(exports, "NodeType", { enumerable: true, get: function () { return INode_1.NodeType; } });
// Base classes
var BaseNode_1 = require("./base/BaseNode");
Object.defineProperty(exports, "BaseNode", { enumerable: true, get: function () { return BaseNode_1.BaseNode; } });
var ModelLayerNode_1 = require("./base/ModelLayerNode");
Object.defineProperty(exports, "ModelLayerNode", { enumerable: true, get: function () { return ModelLayerNode_1.ModelLayerNode; } });
var TrainerNode_1 = require("./base/TrainerNode");
Object.defineProperty(exports, "TrainerNode", { enumerable: true, get: function () { return TrainerNode_1.TrainerNode; } });
var DataNode_1 = require("./base/DataNode");
Object.defineProperty(exports, "DataNode", { enumerable: true, get: function () { return DataNode_1.DataNode; } });
// Utilities
var utils_1 = require("./utils");
Object.defineProperty(exports, "generateVariableName", { enumerable: true, get: function () { return utils_1.generateVariableName; } });
Object.defineProperty(exports, "sanitizeVariableName", { enumerable: true, get: function () { return utils_1.sanitizeVariableName; } });
Object.defineProperty(exports, "formatPythonCode", { enumerable: true, get: function () { return utils_1.formatPythonCode; } });
Object.defineProperty(exports, "camelToSnake", { enumerable: true, get: function () { return utils_1.camelToSnake; } });
Object.defineProperty(exports, "snakeToCamel", { enumerable: true, get: function () { return utils_1.snakeToCamel; } });
Object.defineProperty(exports, "deepMerge", { enumerable: true, get: function () { return utils_1.deepMerge; } });
Object.defineProperty(exports, "normalizeSettings", { enumerable: true, get: function () { return utils_1.normalizeSettings; } });
Object.defineProperty(exports, "buildImports", { enumerable: true, get: function () { return utils_1.buildImports; } });
Object.defineProperty(exports, "validateTensorDimensions", { enumerable: true, get: function () { return utils_1.validateTensorDimensions; } });
Object.defineProperty(exports, "formatTensorShape", { enumerable: true, get: function () { return utils_1.formatTensorShape; } });
Object.defineProperty(exports, "parseVersion", { enumerable: true, get: function () { return utils_1.parseVersion; } });
Object.defineProperty(exports, "compareVersions", { enumerable: true, get: function () { return utils_1.compareVersions; } });
// Validation
var validation_1 = require("./validation");
Object.defineProperty(exports, "PluginValidator", { enumerable: true, get: function () { return validation_1.PluginValidator; } });
Object.defineProperty(exports, "validatePlugin", { enumerable: true, get: function () { return validation_1.validatePlugin; } });
Object.defineProperty(exports, "ManifestSchema", { enumerable: true, get: function () { return validation_1.ManifestSchema; } });
Object.defineProperty(exports, "PackageJsonSchema", { enumerable: true, get: function () { return validation_1.PackageJsonSchema; } });
Object.defineProperty(exports, "CURRENT_SDK_VERSION", { enumerable: true, get: function () { return validation_1.CURRENT_SDK_VERSION; } });
// Version information
exports.SDK_VERSION = "0.0.1";
/**
 * Create a new plugin manifest with default values
 */
function createManifest(overrides = {}) {
    const defaultManifest = {
        slug: "my-plugin",
        name: "My Plugin",
        version: "1.0.0",
        description: "A Tensorify plugin created with the SDK",
        author: "",
        engineVersion: "^0.0.1",
        tags: [],
        category: "general",
        dependencies: [],
        entryPoints: {},
    };
    return { ...defaultManifest, ...overrides };
}
/**
 * Validate a plugin manifest
 */
function validateManifest(manifest) {
    const required = ["slug", "name", "version"];
    for (const field of required) {
        if (!manifest[field]) {
            throw new Error(`Manifest missing required field: ${field}`);
        }
    }
    // Validate version format
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
        throw new Error(`Invalid version format: ${manifest.version}. Use semantic versioning (e.g., 1.0.0)`);
    }
    return true;
}
/**
 * Helper function to create entry point configuration
 */
function createEntryPoint(description, parameters = {}) {
    return {
        description,
        parameters: Object.fromEntries(Object.entries(parameters).map(([key, config]) => [
            key,
            { description: "", ...config },
        ])),
    };
}
//# sourceMappingURL=index.js.map