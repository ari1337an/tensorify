"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseNode = void 0;
/**
 * Abstract base class for all Tensorify nodes/plugins
 * Provides common functionality and ensures compatibility with both
 * the transpiler and plugin-engine systems
 */
class BaseNode {
    /**
     * Validate settings before code generation
     * Default implementation checks for required fields
     * Override in subclasses for custom validation
     */
    validateSettings(settings) {
        if (!settings || typeof settings !== "object") {
            throw new Error(`Invalid settings for ${this.name}: Settings must be an object`);
        }
        return true;
    }
    /**
     * Get required dependencies for this node
     * Override in subclasses to specify dependencies
     */
    getDependencies() {
        return [];
    }
    /**
     * Get imports needed for this node
     * Override in subclasses to specify imports
     */
    getImports(context) {
        return [];
    }
    /**
     * Process payload data from plugin-engine
     * This enables compatibility with the new plugin-engine system
     */
    processPayload(payload) {
        const { settings, children } = this.payloadToSettings(payload);
        return this.getTranslationCode(settings, children);
    }
    /**
     * Convert payload to settings and children
     * Default implementation uses payload directly as settings
     * Override in subclasses for custom payload processing
     */
    payloadToSettings(payload) {
        return {
            settings: payload,
            children: payload.children || payload.child || undefined,
        };
    }
    /**
     * Get available entry points for this plugin
     * Default implementation provides basic entry points
     * Override in subclasses to add more entry points
     */
    getEntryPoints() {
        return {
            getTranslationCode: "Generate code using the main translation method",
            processPayload: "Process payload data from plugin-engine",
        };
    }
    /**
     * Get plugin manifest information
     * Override in subclasses to provide specific manifest data
     */
    getManifest() {
        return {
            name: this.name,
            entryPoints: {
                getTranslationCode: {
                    description: "Generate code using settings and children",
                    parameters: {
                        settings: {
                            type: "object",
                            required: true,
                            description: "Node-specific configuration settings",
                        },
                        children: {
                            type: "array",
                            required: false,
                            description: "Child nodes if applicable",
                        },
                        context: {
                            type: "object",
                            required: false,
                            description: "Code generation context",
                        },
                    },
                },
                processPayload: {
                    description: "Process payload data from plugin-engine",
                    parameters: {
                        payload: {
                            type: "object",
                            required: true,
                            description: "Input data from plugin-engine",
                        },
                    },
                },
            },
        };
    }
    /**
     * Utility method to indent code by a given number of levels
     */
    indentCode(code, indentLevels) {
        if (!code || indentLevels <= 0)
            return code;
        const indent = "    ".repeat(indentLevels); // 4 spaces per indent level
        return code
            .split("\n")
            .map((line) => (line.trim().length > 0 ? indent + line : line))
            .join("\n");
    }
    /**
     * Utility method to stringify a parameter for Python code
     */
    stringifyParameter(value) {
        if (typeof value === "string") {
            // Check if it's a variable or a string literal
            if (/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(value)) {
                // It's a variable name or attribute access
                return value;
            }
            else {
                // It's a string literal
                return `"${value.replace(/"/g, '\\"')}"`;
            }
        }
        else if (typeof value === "boolean") {
            return value ? "True" : "False";
        }
        else if (typeof value === "number") {
            return value.toString();
        }
        else if (value === null || value === undefined) {
            return "None";
        }
        else if (Array.isArray(value)) {
            // Convert array to Python list
            const items = value.map((item) => this.stringifyParameter(item));
            return `[${items.join(", ")}]`;
        }
        else if (typeof value === "object") {
            // Convert object to dictionary representation
            const entries = Object.entries(value).map(([k, v]) => `"${k}": ${this.stringifyParameter(v)}`);
            return `{${entries.join(", ")}}`;
        }
        else {
            throw new Error(`Unsupported parameter type: ${typeof value}`);
        }
    }
    /**
     * Utility method to build parameter string for function calls
     */
    buildParameterString(params, excludeDefaults = {}) {
        const parametersList = [];
        Object.entries(params).forEach(([key, value]) => {
            // Skip if value matches default
            if (excludeDefaults[key] !== undefined &&
                excludeDefaults[key] === value) {
                return;
            }
            // Skip undefined values
            if (value !== undefined) {
                const valueStr = this.stringifyParameter(value);
                parametersList.push(`${key}=${valueStr}`);
            }
        });
        return parametersList.join(", ");
    }
    /**
     * Utility method to validate required parameters
     */
    validateRequiredParams(settings, requiredParams) {
        const missing = requiredParams.filter((param) => settings[param] === undefined || settings[param] === null);
        if (missing.length > 0) {
            throw new Error(`Missing required parameters for ${this.name}: ${missing.join(", ")}`);
        }
    }
}
exports.BaseNode = BaseNode;
//# sourceMappingURL=BaseNode.js.map