// Polyfills for Node.js built-ins in isolated-vm
    const polyfills = {
      fs: {
        existsSync: () => false,
        readFileSync: () => '',
        writeFileSync: () => {},
        mkdirSync: () => {},
        statSync: () => ({ isDirectory: () => false, isFile: () => false })
      },
      path: {
        join: (...args) => args.filter(Boolean).join('/'),
        resolve: (...args) => args.filter(Boolean).join('/'),
        dirname: (p) => p.split('/').slice(0, -1).join('/') || '/',
        basename: (p) => p.split('/').pop() || '',
        extname: (p) => { const parts = p.split('.'); return parts.length > 1 ? '.' + parts.pop() : ''; }
      },
      crypto: {
        createHash: () => ({ update: () => ({}), digest: () => 'mock-hash' })
      },
      os: {
        platform: () => 'neutral',
        tmpdir: () => '/tmp'
      },
      util: {
        promisify: (fn) => fn
      },
      stream: {},
      events: {
        EventEmitter: class EventEmitter {
          on() {}
          emit() {}
          removeListener() {}
        }
      }
    };
    
    // Override require to use polyfills
    globalThis.require = (id) => {
      if (polyfills[id]) return polyfills[id];
      throw new Error('Module not found: ' + id);
    };
    
    // Also set them on globalThis for direct access
    Object.assign(globalThis, polyfills);
"use strict";
var PluginBundle = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // <define:process>
  var init_define_process = __esm({
    "<define:process>"() {
    }
  });

  // node_modules/@tensorify.io/sdk/dist/types/core.js
  var require_core = __commonJS({
    "node_modules/@tensorify.io/sdk/dist/types/core.js"(exports) {
      "use strict";
      init_define_process();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.PluginCapability = exports.NodeType = void 0;
      var NodeType2;
      (function(NodeType3) {
        NodeType3["CUSTOM"] = "custom";
        NodeType3["TRAINER"] = "trainer";
        NodeType3["EVALUATOR"] = "evaluator";
        NodeType3["MODEL"] = "model";
        NodeType3["MODEL_LAYER"] = "model_layer";
        NodeType3["SEQUENCE"] = "sequence";
        NodeType3["DATALOADER"] = "dataloader";
        NodeType3["PREPROCESSOR"] = "preprocessor";
        NodeType3["POSTPROCESSOR"] = "postprocessor";
        NodeType3["AUGMENTATION_STACK"] = "augmentation_stack";
        NodeType3["OPTIMIZER"] = "optimizer";
        NodeType3["LOSS_FUNCTION"] = "loss_function";
        NodeType3["METRIC"] = "metric";
        NodeType3["SCHEDULER"] = "scheduler";
        NodeType3["REGULARIZER"] = "regularizer";
        NodeType3["FUNCTION"] = "function";
        NodeType3["PIPELINE"] = "pipeline";
        NodeType3["REPORT"] = "report";
      })(NodeType2 || (exports.NodeType = NodeType2 = {}));
      var PluginCapability2;
      (function(PluginCapability3) {
        PluginCapability3["CODE_GENERATION"] = "code-generation";
        PluginCapability3["DATA_PROCESSING"] = "data-processing";
        PluginCapability3["REAL_TIME"] = "real-time";
        PluginCapability3["BATCH_PROCESSING"] = "batch-processing";
        PluginCapability3["EXTERNAL_API"] = "external-api";
        PluginCapability3["FILE_PROCESSING"] = "file-processing";
        PluginCapability3["AI_INTEGRATION"] = "ai-integration";
      })(PluginCapability2 || (exports.PluginCapability = PluginCapability2 = {}));
    }
  });

  // node_modules/@tensorify.io/sdk/dist/types/visual.js
  var require_visual = __commonJS({
    "node_modules/@tensorify.io/sdk/dist/types/visual.js"(exports) {
      "use strict";
      init_define_process();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.IconType = exports.NodeViewContainerType = exports.EdgeType = exports.HandlePosition = exports.HandleViewType = void 0;
      var HandleViewType2;
      (function(HandleViewType3) {
        HandleViewType3["DEFAULT"] = "default";
        HandleViewType3["VERTICAL_BOX"] = "verticalBox";
        HandleViewType3["CIRCLE_LG"] = "circle-lg";
        HandleViewType3["DIAMOND"] = "diamond";
        HandleViewType3["SQUARE"] = "square";
        HandleViewType3["TRIANGLE"] = "triangle";
      })(HandleViewType2 || (exports.HandleViewType = HandleViewType2 = {}));
      var HandlePosition2;
      (function(HandlePosition3) {
        HandlePosition3["TOP"] = "top";
        HandlePosition3["TOP_RIGHT"] = "top-right";
        HandlePosition3["RIGHT"] = "right";
        HandlePosition3["BOTTOM_RIGHT"] = "bottom-right";
        HandlePosition3["BOTTOM"] = "bottom";
        HandlePosition3["BOTTOM_LEFT"] = "bottom-left";
        HandlePosition3["LEFT"] = "left";
        HandlePosition3["TOP_LEFT"] = "top-left";
      })(HandlePosition2 || (exports.HandlePosition = HandlePosition2 = {}));
      var EdgeType2;
      (function(EdgeType3) {
        EdgeType3["DEFAULT"] = "default";
        EdgeType3["SOLID"] = "solid";
        EdgeType3["DOTTED"] = "dotted";
        EdgeType3["DASHED"] = "dashed";
        EdgeType3["ACCENT"] = "accent";
        EdgeType3["MUTED"] = "muted";
        EdgeType3["SUCCESS"] = "success";
        EdgeType3["WARNING"] = "warning";
        EdgeType3["ERROR"] = "error";
      })(EdgeType2 || (exports.EdgeType = EdgeType2 = {}));
      var NodeViewContainerType2;
      (function(NodeViewContainerType3) {
        NodeViewContainerType3["DEFAULT"] = "default";
        NodeViewContainerType3["BOX"] = "box";
        NodeViewContainerType3["CIRCLE"] = "circle";
        NodeViewContainerType3["LEFT_ROUND"] = "left-round";
      })(NodeViewContainerType2 || (exports.NodeViewContainerType = NodeViewContainerType2 = {}));
      var IconType2;
      (function(IconType3) {
        IconType3["SVG"] = "svg";
        IconType3["FONTAWESOME"] = "fontawesome";
        IconType3["LUCIDE"] = "lucide";
      })(IconType2 || (exports.IconType = IconType2 = {}));
    }
  });

  // node_modules/@tensorify.io/sdk/dist/types/settings.js
  var require_settings = __commonJS({
    "node_modules/@tensorify.io/sdk/dist/types/settings.js"(exports) {
      "use strict";
      init_define_process();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DEFAULT_VALUES = exports.UI_TYPE_TO_DATA_TYPE_MAP = exports.SettingsDataType = exports.SettingsUIType = void 0;
      var SettingsUIType2;
      (function(SettingsUIType3) {
        SettingsUIType3["INPUT_TEXT"] = "input-text";
        SettingsUIType3["TEXTAREA"] = "textarea";
        SettingsUIType3["INPUT_NUMBER"] = "input-number";
        SettingsUIType3["SLIDER"] = "slider";
        SettingsUIType3["TOGGLE"] = "toggle";
        SettingsUIType3["CHECKBOX"] = "checkbox";
        SettingsUIType3["DROPDOWN"] = "dropdown";
        SettingsUIType3["RADIO"] = "radio";
        SettingsUIType3["MULTI_SELECT"] = "multi-select";
        SettingsUIType3["CODE_EDITOR"] = "code-editor";
        SettingsUIType3["FILE_UPLOAD"] = "file-upload";
        SettingsUIType3["COLOR_PICKER"] = "color-picker";
        SettingsUIType3["DATE_PICKER"] = "date-picker";
      })(SettingsUIType2 || (exports.SettingsUIType = SettingsUIType2 = {}));
      var SettingsDataType2;
      (function(SettingsDataType3) {
        SettingsDataType3["STRING"] = "string";
        SettingsDataType3["NUMBER"] = "number";
        SettingsDataType3["BOOLEAN"] = "boolean";
        SettingsDataType3["ARRAY"] = "array";
        SettingsDataType3["OBJECT"] = "object";
        SettingsDataType3["FILE"] = "file";
        SettingsDataType3["DATE"] = "date";
        SettingsDataType3["COLOR"] = "color";
      })(SettingsDataType2 || (exports.SettingsDataType = SettingsDataType2 = {}));
      exports.UI_TYPE_TO_DATA_TYPE_MAP = {
        [SettingsUIType2.INPUT_TEXT]: [SettingsDataType2.STRING],
        [SettingsUIType2.TEXTAREA]: [SettingsDataType2.STRING],
        [SettingsUIType2.INPUT_NUMBER]: [SettingsDataType2.NUMBER],
        [SettingsUIType2.SLIDER]: [SettingsDataType2.NUMBER],
        [SettingsUIType2.TOGGLE]: [SettingsDataType2.BOOLEAN],
        [SettingsUIType2.CHECKBOX]: [SettingsDataType2.BOOLEAN],
        [SettingsUIType2.DROPDOWN]: [
          SettingsDataType2.STRING,
          SettingsDataType2.NUMBER,
          SettingsDataType2.BOOLEAN
        ],
        [SettingsUIType2.RADIO]: [
          SettingsDataType2.STRING,
          SettingsDataType2.NUMBER,
          SettingsDataType2.BOOLEAN
        ],
        [SettingsUIType2.MULTI_SELECT]: [SettingsDataType2.ARRAY],
        [SettingsUIType2.CODE_EDITOR]: [SettingsDataType2.STRING],
        [SettingsUIType2.FILE_UPLOAD]: [SettingsDataType2.FILE],
        [SettingsUIType2.COLOR_PICKER]: [SettingsDataType2.COLOR],
        [SettingsUIType2.DATE_PICKER]: [SettingsDataType2.DATE]
      };
      exports.DEFAULT_VALUES = {
        [SettingsDataType2.STRING]: "",
        [SettingsDataType2.NUMBER]: 0,
        [SettingsDataType2.BOOLEAN]: false,
        [SettingsDataType2.ARRAY]: [],
        [SettingsDataType2.OBJECT]: {},
        [SettingsDataType2.FILE]: null,
        [SettingsDataType2.DATE]: /* @__PURE__ */ new Date(),
        [SettingsDataType2.COLOR]: "#000000"
      };
    }
  });

  // node_modules/@tensorify.io/sdk/dist/core/TensorifyPlugin.js
  var require_TensorifyPlugin = __commonJS({
    "node_modules/@tensorify.io/sdk/dist/core/TensorifyPlugin.js"(exports) {
      "use strict";
      init_define_process();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.TensorifyPlugin = void 0;
      var core_1 = require_core();
      var visual_1 = require_visual();
      var settings_1 = require_settings();
      var _TensorifyPlugin = class _TensorifyPlugin {
        /**
         * Constructor - Creates a new plugin instance
         * @param definition Complete plugin definition
         */
        constructor(definition) {
          /** Plugin definition containing all configuration */
          __publicField(this, "definition");
          this.definition = definition;
          this.validateDefinition();
        }
        // ========================================
        // INPUT ACCESS HELPER
        // ========================================
        /**
         * Helper method to access input data from handles
         *
         * @param context Code generation context
         * @param handleNumber Handle index (0-based)
         * @returns Input data from the specified handle
         */
        getInput(context, handleNumber) {
          return context?.inputData[handleNumber] || null;
        }
        /**
         * Get all input data as an array
         *
         * @param context Code generation context
         * @returns Array of all input data
         */
        getAllInputs(context) {
          if (!context?.inputData)
            return [];
          const maxHandle = Math.max(...Object.keys(context.inputData).map(Number));
          const inputs = [];
          for (let i = 0; i <= maxHandle; i++) {
            inputs.push(context.inputData[i] || null);
          }
          return inputs;
        }
        // ========================================
        // PLUGIN DEFINITION ACCESSORS
        // ========================================
        /** Get plugin ID (may be undefined if not provided in definition) */
        getId() {
          return this.definition.id;
        }
        /** Get plugin name (may be undefined if not provided in definition) */
        getName() {
          return this.definition.name;
        }
        /** Get plugin description (may be undefined if not provided in definition) */
        getDescription() {
          return this.definition.description;
        }
        /** Get plugin version (may be undefined if not provided in definition) */
        getVersion() {
          return this.definition.version;
        }
        /** Get node type (may be undefined if not provided in definition) */
        getNodeType() {
          return this.definition.nodeType;
        }
        /** Get visual configuration */
        getVisualConfig() {
          return this.definition.visual;
        }
        /** Get input handles */
        getInputHandles() {
          return this.definition.inputHandles;
        }
        /** Get output handles */
        getOutputHandles() {
          return this.definition.outputHandles;
        }
        /** Get settings fields */
        getSettingsFields() {
          return this.definition.settingsFields;
        }
        /** Get settings groups */
        getSettingsGroups() {
          return this.definition.settingsGroups || [];
        }
        /** Get capabilities */
        getCapabilities() {
          return this.definition.capabilities;
        }
        /** Get requirements */
        getRequirements() {
          return this.definition.requirements;
        }
        /** Get complete definition */
        getDefinition() {
          return { ...this.definition };
        }
        // ========================================
        // VALIDATION METHODS
        // ========================================
        /**
         * Validate plugin settings before code generation
         *
         * @param settings Settings to validate
         * @returns Validation result
         */
        validateSettings(settings) {
          const errors = [];
          const warnings = [];
          if (!settings.labelName) {
            errors.push({
              type: "missing_property",
              message: "labelName is required in plugin settings",
              path: "labelName",
              expected: "string",
              actual: settings.labelName
            });
          }
          for (const field of this.definition.settingsFields) {
            const value = settings[field.key];
            if (field.required && (value === void 0 || value === null || value === "")) {
              errors.push({
                type: "missing_property",
                message: `Required field '${field.key}' is missing`,
                path: field.key,
                expected: field.dataType,
                actual: value
              });
              continue;
            }
            if (value === void 0 || value === null)
              continue;
            if (!this.validateFieldDataType(value, field.dataType, field.key)) {
              errors.push({
                type: "invalid_type",
                message: `Invalid type for field '${field.key}'`,
                path: field.key,
                expected: field.dataType,
                actual: typeof value
              });
            }
            if (field.validation) {
              const fieldErrors = this.validateFieldRules(value, field);
              errors.push(...fieldErrors);
            }
          }
          return {
            isValid: errors.length === 0,
            errors,
            warnings
          };
        }
        /**
         * Validate the plugin definition structure
         */
        validateDefinition() {
          const errors = [];
          if (!this.definition.visual) {
            errors.push("Plugin visual configuration is required");
          } else {
            this.validateVisualConfig(errors);
          }
          this.validateHandles(errors);
          this.validateSettingsFields(errors);
          const emits = this.definition.emits;
          if (!emits || typeof emits !== "object") {
            errors.push("Plugin definition must include 'emits' object with variables/imports arrays");
          } else {
            if (!Array.isArray(emits.variables)) {
              errors.push("Plugin 'emits.variables' must be an array (can be empty)");
            }
            if (!Array.isArray(emits.imports)) {
              errors.push("Plugin 'emits.imports' must be an array (can be empty)");
            }
          }
          if (errors.length > 0) {
            throw new Error(`Plugin definition validation failed:
${errors.join("\n")}`);
          }
        }
        /**
         * Validate visual configuration
         */
        validateVisualConfig(errors) {
          const visual = this.definition.visual;
          if (!visual.containerType) {
            errors.push("Visual containerType is required");
          }
          if (!visual.size || !visual.size.width || !visual.size.height) {
            errors.push("Visual size (width and height) is required");
          }
          if (visual.size.width < 50 || visual.size.height < 30) {
            errors.push("Visual size too small (minimum 50x30)");
          }
        }
        /**
         * Validate handle configurations
         */
        validateHandles(errors) {
          const inputIds = /* @__PURE__ */ new Set();
          const outputIds = /* @__PURE__ */ new Set();
          let hasPrev = false;
          let hasNext = false;
          for (const handle of this.definition.inputHandles) {
            if (!handle.id) {
              errors.push("Input handle id is required");
              continue;
            }
            if (inputIds.has(handle.id)) {
              errors.push(`Duplicate input handle id: ${handle.id}`);
            }
            inputIds.add(handle.id);
            if (!handle.position) {
              errors.push(`Input handle ${handle.id} position is required`);
            }
            if (!handle.viewType) {
              errors.push(`Input handle ${handle.id} viewType is required`);
            }
            if (handle.id === "prev") {
              hasPrev = true;
              if (handle.position !== visual_1.HandlePosition.LEFT) {
                errors.push("Input handle 'prev' must be on the LEFT side");
              }
              if (handle.required !== true) {
                errors.push("Input handle 'prev' must be required: true");
              }
            }
          }
          for (const handle of this.definition.outputHandles) {
            if (!handle.id) {
              errors.push("Output handle id is required");
              continue;
            }
            if (outputIds.has(handle.id)) {
              errors.push(`Duplicate output handle id: ${handle.id}`);
            }
            outputIds.add(handle.id);
            if (!handle.position) {
              errors.push(`Output handle ${handle.id} position is required`);
            }
            if (!handle.viewType) {
              errors.push(`Output handle ${handle.id} viewType is required`);
            }
            if (handle.id === "next") {
              hasNext = true;
              if (handle.position !== visual_1.HandlePosition.RIGHT) {
                errors.push("Output handle 'next' must be on the RIGHT side");
              }
            }
          }
          if (!hasPrev) {
            errors.push("Plugin must define an input handle with id 'prev'");
          }
          if (!hasNext) {
            errors.push("Plugin must define an output handle with id 'next'");
          }
        }
        /**
         * Validate settings fields configuration
         */
        validateSettingsFields(errors) {
          const fieldKeys = /* @__PURE__ */ new Set();
          for (const field of this.definition.settingsFields) {
            if (!field.key) {
              errors.push("Settings field key is required");
              continue;
            }
            if (fieldKeys.has(field.key)) {
              errors.push(`Duplicate settings field key: ${field.key}`);
            }
            fieldKeys.add(field.key);
            if (!field.label) {
              errors.push(`Settings field ${field.key} label is required`);
            }
            if (!field.type) {
              errors.push(`Settings field ${field.key} type is required`);
            }
            if (!field.dataType) {
              errors.push(`Settings field ${field.key} dataType is required`);
            }
            if (field.type && field.dataType) {
              const compatibleTypes = settings_1.UI_TYPE_TO_DATA_TYPE_MAP[field.type];
              if (compatibleTypes && !compatibleTypes.includes(field.dataType)) {
                errors.push(`Settings field ${field.key} has incompatible type/dataType combination`);
              }
            }
          }
          if (this.definition.emits && Array.isArray(this.definition.emits.variables)) {
            const byKey = {};
            for (const f of this.definition.settingsFields) {
              byKey[f.key] = f;
            }
            for (const variable of this.definition.emits.variables) {
              if (!variable || !variable.switchKey)
                continue;
              const rawKey = variable.switchKey.includes(".") ? variable.switchKey.split(".").pop() : variable.switchKey;
              const toggleField = byKey[rawKey];
              if (!toggleField) {
                errors.push(`Emitted variable '${variable.value}' requires a boolean toggle settings field '${rawKey}' (from switchKey '${variable.switchKey}')`);
                continue;
              }
              if (toggleField.type !== settings_1.SettingsUIType.TOGGLE) {
                errors.push(`Settings field '${rawKey}' must be of UI type TOGGLE because it controls emitted variable '${variable.value}'`);
              }
              if (toggleField.dataType !== settings_1.SettingsDataType.BOOLEAN) {
                errors.push(`Settings field '${rawKey}' must have dataType BOOLEAN because it controls emitted variable '${variable.value}'`);
              }
              if (toggleField.required !== true) {
                errors.push(`Settings field '${rawKey}' must be required: true because it controls emitted variable '${variable.value}'`);
              }
              if (typeof variable.isOnByDefault === "boolean" && toggleField.defaultValue !== variable.isOnByDefault) {
                errors.push(`Settings field '${rawKey}'.defaultValue (${String(toggleField.defaultValue)}) must match isOnByDefault (${String(variable.isOnByDefault)}) for emitted variable '${variable.value}'`);
              }
            }
          }
        }
        /**
         * Validate individual field data type
         */
        validateFieldDataType(value, expectedType, fieldKey) {
          switch (expectedType) {
            case settings_1.SettingsDataType.STRING:
              return typeof value === "string";
            case settings_1.SettingsDataType.NUMBER:
              return typeof value === "number" && !isNaN(value);
            case settings_1.SettingsDataType.BOOLEAN:
              return typeof value === "boolean";
            case settings_1.SettingsDataType.ARRAY:
              return Array.isArray(value);
            case settings_1.SettingsDataType.OBJECT:
              return typeof value === "object" && value !== null && !Array.isArray(value);
            default:
              return true;
          }
        }
        /**
         * Validate field-specific rules
         */
        validateFieldRules(value, field) {
          const errors = [];
          const validation = field.validation;
          if (typeof value === "string") {
            if (validation.minLength !== void 0 && value.length < validation.minLength) {
              errors.push({
                type: "invalid_value",
                message: `Field '${field.key}' is too short (minimum ${validation.minLength} characters)`,
                path: field.key,
                expected: `length >= ${validation.minLength}`,
                actual: value.length
              });
            }
            if (validation.maxLength !== void 0 && value.length > validation.maxLength) {
              errors.push({
                type: "invalid_value",
                message: `Field '${field.key}' is too long (maximum ${validation.maxLength} characters)`,
                path: field.key,
                expected: `length <= ${validation.maxLength}`,
                actual: value.length
              });
            }
            if (validation.pattern) {
              const regex = new RegExp(validation.pattern);
              if (!regex.test(value)) {
                errors.push({
                  type: "invalid_value",
                  message: `Field '${field.key}' does not match required pattern`,
                  path: field.key,
                  expected: validation.pattern,
                  actual: value
                });
              }
            }
          }
          if (typeof value === "number") {
            if (validation.min !== void 0 && value < validation.min) {
              errors.push({
                type: "invalid_value",
                message: `Field '${field.key}' is too small (minimum ${validation.min})`,
                path: field.key,
                expected: `>= ${validation.min}`,
                actual: value
              });
            }
            if (validation.max !== void 0 && value > validation.max) {
              errors.push({
                type: "invalid_value",
                message: `Field '${field.key}' is too large (maximum ${validation.max})`,
                path: field.key,
                expected: `<= ${validation.max}`,
                actual: value
              });
            }
          }
          return errors;
        }
        // ========================================
        // MANIFEST GENERATION
        // ========================================
        /**
         * Derive plugin ID from package name
         * @param packageName Package name (e.g., "@org/my-plugin" or "my-plugin")
         * @returns Derived plugin ID
         */
        derivePluginId(packageName) {
          return packageName.replace(/^@[^/]+\//, "");
        }
        /**
         * Derive nodeType from package.json tensorify.pluginType
         * @param pluginType Plugin type from package.json tensorify section
         * @returns Derived NodeType or default to CUSTOM
         */
        deriveNodeType(pluginType) {
          if (!pluginType)
            return core_1.NodeType.CUSTOM;
          const typeMap = {
            custom: core_1.NodeType.CUSTOM,
            trainer: core_1.NodeType.TRAINER,
            evaluator: core_1.NodeType.EVALUATOR,
            model: core_1.NodeType.MODEL,
            model_layer: core_1.NodeType.MODEL_LAYER,
            sequence: core_1.NodeType.SEQUENCE,
            dataloader: core_1.NodeType.DATALOADER,
            preprocessor: core_1.NodeType.PREPROCESSOR,
            postprocessor: core_1.NodeType.POSTPROCESSOR,
            augmentation_stack: core_1.NodeType.AUGMENTATION_STACK,
            optimizer: core_1.NodeType.OPTIMIZER,
            loss_function: core_1.NodeType.LOSS_FUNCTION,
            metric: core_1.NodeType.METRIC,
            scheduler: core_1.NodeType.SCHEDULER,
            regularizer: core_1.NodeType.REGULARIZER,
            function: core_1.NodeType.FUNCTION,
            pipeline: core_1.NodeType.PIPELINE,
            report: core_1.NodeType.REPORT
          };
          return typeMap[pluginType.toLowerCase()] || core_1.NodeType.CUSTOM;
        }
        /**
         * Generate frontend manifest for CLI publishing
         *
         * @param packageInfo Package.json information
         * @param entrypointClassName Exact class name for instantiation
         * @returns Frontend plugin manifest
         */
        generateManifest(packageInfo, entrypointClassName) {
          const derivedId = this.definition.id || this.derivePluginId(packageInfo.name);
          const derivedName = this.definition.name || packageInfo.name;
          const derivedDescription = this.definition.description || packageInfo.description || "";
          const derivedVersion = this.definition.version || packageInfo.version;
          const derivedNodeType = this.definition.nodeType || this.deriveNodeType(packageInfo.tensorify?.pluginType);
          if (!derivedId) {
            throw new Error("Plugin ID could not be derived from package name");
          }
          if (!derivedName) {
            throw new Error("Plugin name could not be derived from package name");
          }
          if (!derivedVersion) {
            throw new Error("Plugin version could not be derived from package.json");
          }
          const manifest = {
            // Package Information
            name: packageInfo.name,
            version: packageInfo.version,
            description: packageInfo.description || derivedDescription,
            author: packageInfo.author || this.definition.author || "",
            main: packageInfo.main || "dist/index.js",
            entrypointClassName,
            keywords: packageInfo.keywords || this.definition.keywords || [],
            repository: packageInfo.repository,
            pluginType: packageInfo.tensorify?.pluginType,
            tensorify: packageInfo.tensorify,
            // Frontend Configuration
            frontendConfigs: {
              id: derivedId,
              name: derivedName,
              category: derivedNodeType,
              nodeType: derivedNodeType,
              visual: this.definition.visual,
              inputHandles: this.definition.inputHandles,
              outputHandles: this.definition.outputHandles,
              settingsFields: this.definition.settingsFields,
              settingsGroups: this.definition.settingsGroups
            },
            // Plugin Metadata
            capabilities: this.definition.capabilities,
            requirements: this.definition.requirements,
            // Emits (variables/imports) are included in manifest; ensure arrays exist
            emits: {
              variables: this.definition.emits?.variables || [],
              imports: this.definition.emits?.imports || []
            },
            // Generation Metadata
            sdkVersion: _TensorifyPlugin.SDK_VERSION,
            generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            manifestVersion: _TensorifyPlugin.MANIFEST_VERSION
          };
          return manifest;
        }
        // ========================================
        // UTILITY METHODS
        // ========================================
        /**
         * Create default settings object from field definitions
         */
        createDefaultSettings() {
          const settings = {
            variableName: `${this.definition.id || "plugin"}_${Date.now()}`,
            labelName: this.definition.name || "Plugin"
          };
          for (const field of this.definition.settingsFields) {
            if (field.defaultValue !== void 0) {
              settings[field.key] = field.defaultValue;
            }
          }
          return settings;
        }
        /**
         * Process dynamic label template with settings values
         */
        generateDynamicLabel(settings) {
          const template = this.definition.visual.labels.dynamicLabelTemplate;
          if (!template)
            return "";
          let result = template;
          for (const [key, value] of Object.entries(settings)) {
            const placeholder = `{${key}}`;
            result = result.replace(new RegExp(placeholder, "g"), String(value));
          }
          return result;
        }
        /**
         * Get current SDK version
         */
        static getSDKVersion() {
          return _TensorifyPlugin.SDK_VERSION;
        }
        /**
         * Get manifest format version
         */
        static getManifestVersion() {
          return _TensorifyPlugin.MANIFEST_VERSION;
        }
      };
      __name(_TensorifyPlugin, "TensorifyPlugin");
      /** Current SDK version */
      __publicField(_TensorifyPlugin, "SDK_VERSION", "1.0.0");
      /** Manifest format version */
      __publicField(_TensorifyPlugin, "MANIFEST_VERSION", "1.0.0");
      var TensorifyPlugin2 = _TensorifyPlugin;
      exports.TensorifyPlugin = TensorifyPlugin2;
    }
  });

  // node_modules/@tensorify.io/sdk/dist/constants/handles.js
  var require_handles = __commonJS({
    "node_modules/@tensorify.io/sdk/dist/constants/handles.js"(exports) {
      "use strict";
      init_define_process();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.NextNodeAsOutput = exports.PrevNodeAsInput = void 0;
      var visual_1 = require_visual();
      exports.PrevNodeAsInput = {
        id: "prev",
        position: visual_1.HandlePosition.LEFT,
        viewType: visual_1.HandleViewType.DEFAULT,
        required: true,
        label: "Prev",
        edgeType: visual_1.EdgeType.DEFAULT,
        dataType: "any",
        description: "Previous node output"
      };
      exports.NextNodeAsOutput = {
        id: "next",
        position: visual_1.HandlePosition.RIGHT,
        viewType: visual_1.HandleViewType.DEFAULT,
        label: "Next",
        edgeType: visual_1.EdgeType.DEFAULT,
        dataType: "any",
        description: "Flow to next node"
      };
    }
  });

  // node_modules/@tensorify.io/sdk/dist/utils/plugin-utils.js
  var require_plugin_utils = __commonJS({
    "node_modules/@tensorify.io/sdk/dist/utils/plugin-utils.js"(exports) {
      "use strict";
      init_define_process();
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: /* @__PURE__ */ __name(function() {
            return m[k];
          }, "get") };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = exports && exports.__importStar || /* @__PURE__ */ (function() {
        var ownKeys = /* @__PURE__ */ __name(function(o) {
          ownKeys = Object.getOwnPropertyNames || function(o2) {
            var ar = [];
            for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
            return ar;
          };
          return ownKeys(o);
        }, "ownKeys");
        return function(mod) {
          if (mod && mod.__esModule) return mod;
          var result = {};
          if (mod != null) {
            for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
          }
          __setModuleDefault(result, mod);
          return result;
        };
      })();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.generatePluginManifest = generatePluginManifest;
      exports.readPackageJson = readPackageJson;
      exports.writeManifestFile = writeManifestFile;
      exports.buildPluginManifest = buildPluginManifest;
      exports.validatePlugin = validatePlugin;
      exports.validatePluginSettings = validatePluginSettings;
      exports.createDefaultSettings = createDefaultSettings;
      exports.mergeSettingsWithDefaults = mergeSettingsWithDefaults;
      exports.processDynamicLabelTemplate = processDynamicLabelTemplate;
      exports.generateVariableName = generateVariableName;
      exports.sanitizeVariableName = sanitizeVariableName;
      exports.indentCode = indentCode;
      exports.autoDetectEntrypointClassName = autoDetectEntrypointClassName;
      exports.isValidPluginDirectory = isValidPluginDirectory;
      exports.createPluginTemplate = createPluginTemplate;
      exports.getPluginMetadata = getPluginMetadata;
      var fs = __importStar(__require("fs"));
      var path = __importStar(__require("path"));
      var core_1 = require_core();
      var settings_1 = require_settings();
      function generatePluginManifest(plugin, packageJsonPath, entrypointClassName) {
        const packageInfo = readPackageJson(packageJsonPath);
        return plugin.generateManifest(packageInfo, entrypointClassName);
      }
      __name(generatePluginManifest, "generatePluginManifest");
      function readPackageJson(packageJsonPath) {
        try {
          const content = fs.readFileSync(packageJsonPath, "utf-8");
          const packageJson = JSON.parse(content);
          return {
            name: packageJson.name,
            version: packageJson.version,
            description: packageJson.description,
            author: packageJson.author,
            main: packageJson.main,
            keywords: packageJson.keywords,
            dependencies: packageJson.dependencies,
            peerDependencies: packageJson.peerDependencies,
            repository: packageJson.repository,
            tensorify: packageJson.tensorify
          };
        } catch (error) {
          throw new Error(`Failed to read package.json: ${error}`);
        }
      }
      __name(readPackageJson, "readPackageJson");
      function writeManifestFile(manifest, outputPath) {
        try {
          const manifestJson = JSON.stringify(manifest, null, 2);
          const dir = path.dirname(outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(outputPath, manifestJson, "utf-8");
        } catch (error) {
          throw new Error(`Failed to write manifest file: ${error}`);
        }
      }
      __name(writeManifestFile, "writeManifestFile");
      function buildPluginManifest(plugin, packageJsonPath, entrypointClassName, outputPath) {
        const manifest = generatePluginManifest(plugin, packageJsonPath, entrypointClassName);
        writeManifestFile(manifest, outputPath);
        return manifest;
      }
      __name(buildPluginManifest, "buildPluginManifest");
      function validatePlugin(plugin) {
        const defaultSettings = plugin.createDefaultSettings();
        return plugin.validateSettings(defaultSettings);
      }
      __name(validatePlugin, "validatePlugin");
      function validatePluginSettings(plugin, settings) {
        const result = plugin.validateSettings(settings);
        if (result.isValid) {
          return {
            isValid: true,
            message: "All settings are valid"
          };
        }
        const details = result.errors.map((error) => `${error.path}: ${error.message}`);
        return {
          isValid: false,
          message: `Validation failed with ${result.errors.length} error(s)`,
          details
        };
      }
      __name(validatePluginSettings, "validatePluginSettings");
      function createDefaultSettings(settingsFields) {
        const settings = {
          variableName: `plugin_${Date.now()}`,
          labelName: "Plugin"
        };
        for (const field of settingsFields) {
          if (field.defaultValue !== void 0) {
            settings[field.key] = field.defaultValue;
          } else {
            settings[field.key] = settings_1.DEFAULT_VALUES[field.dataType];
          }
        }
        return settings;
      }
      __name(createDefaultSettings, "createDefaultSettings");
      function mergeSettingsWithDefaults(userSettings, settingsFields) {
        const defaults = createDefaultSettings(settingsFields);
        return { ...defaults, ...userSettings };
      }
      __name(mergeSettingsWithDefaults, "mergeSettingsWithDefaults");
      function processDynamicLabelTemplate(template, settings) {
        if (!template)
          return "";
        let result = template;
        for (const [key, value] of Object.entries(settings)) {
          const placeholder = `{${key}}`;
          result = result.replace(new RegExp(placeholder, "g"), String(value));
        }
        return result;
      }
      __name(processDynamicLabelTemplate, "processDynamicLabelTemplate");
      function generateVariableName(prefix = "var") {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1e3);
        return `${prefix}_${timestamp}_${random}`;
      }
      __name(generateVariableName, "generateVariableName");
      function sanitizeVariableName(name) {
        return name.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^[0-9]/, "_$&").replace(/_+/g, "_").toLowerCase();
      }
      __name(sanitizeVariableName, "sanitizeVariableName");
      function indentCode(code, levels, indentString = "  ") {
        if (levels <= 0)
          return code;
        const indent = indentString.repeat(levels);
        return code.split("\n").map((line) => line.trim() ? indent + line : line).join("\n");
      }
      __name(indentCode, "indentCode");
      function autoDetectEntrypointClassName(sourceDir) {
        try {
          const indexPath = path.join(sourceDir, "index.ts");
          if (!fs.existsSync(indexPath))
            return null;
          const content = fs.readFileSync(indexPath, "utf-8");
          const defaultExportMatch = content.match(/export\s+default\s+class\s+(\w+)/);
          if (defaultExportMatch) {
            return defaultExportMatch[1];
          }
          const namedExportMatch = content.match(/export\s+class\s+(\w+)\s+extends\s+TensorifyPlugin/);
          if (namedExportMatch) {
            return namedExportMatch[1];
          }
          return null;
        } catch (error) {
          return null;
        }
      }
      __name(autoDetectEntrypointClassName, "autoDetectEntrypointClassName");
      function isValidPluginDirectory(directory) {
        const requiredFiles = ["package.json", "tsconfig.json"];
        const requiredDirs = ["src"];
        for (const file of requiredFiles) {
          if (!fs.existsSync(path.join(directory, file))) {
            return false;
          }
        }
        for (const dir of requiredDirs) {
          if (!fs.existsSync(path.join(directory, dir))) {
            return false;
          }
        }
        if (!fs.existsSync(path.join(directory, "src", "index.ts"))) {
          return false;
        }
        return true;
      }
      __name(isValidPluginDirectory, "isValidPluginDirectory");
      function createPluginTemplate(pluginName, pluginId, nodeType = core_1.NodeType.CUSTOM) {
        return `import { 
  TensorifyPlugin,
  IPluginDefinition,
  PluginSettings,
  PluginCodeGenerationContext,
  NodeType,
  PluginCapability,
  HandleViewType,
  HandlePosition,
  EdgeType,
  NodeViewContainerType,
  IconType,
  SettingsUIType,
  SettingsDataType
} from '@tensorify.io/sdk';

export default class ${pluginName.replace(/[^a-zA-Z0-9]/g, "")}Plugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      // Core Metadata (id, name, description, version, nodeType are derived from package.json)
      // nodeType is derived from package.json tensorify.pluginType field

      // Visual Configuration
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: {
          width: 200,
          height: 120
        },
        padding: {
          inner: 16,
          outer: 8,
          extraPadding: false
        },
        styling: {
          borderRadius: 8,
          borderWidth: 2,
          shadowLevel: 1,
          theme: "auto"
        },
        icons: {
          primary: {
            type: IconType.LUCIDE,
            value: "box"
          },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium"
        },
        labels: {
          title: "${pluginName}",
          showLabels: true,
          labelPosition: "top"
        }
      },

      // Handle Configuration
      inputHandles: [
        {
          id: "input",
          position: HandlePosition.LEFT,
          viewType: HandleViewType.DEFAULT,
          required: false,
          label: "Input",
          edgeType: EdgeType.DEFAULT,
          dataType: "any"
        }
      ],

      outputHandles: [
        {
          id: "output",
          position: HandlePosition.RIGHT,
          viewType: HandleViewType.DEFAULT,
          label: "Output",
          edgeType: EdgeType.DEFAULT,
          dataType: "any"
        }
      ],

      // Settings Configuration
      settingsFields: [
        {
          key: "message",
          label: "Message",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "Hello World!",
          required: false,
          description: "Message to display in generated code"
        }
      ],

      // Plugin Metadata
      capabilities: [PluginCapability.CODE_GENERATION],
      requirements: {
        minSdkVersion: "1.0.0",
        dependencies: []
      }
    };

    super(definition);
  }

  public getTranslationCode(
    settings: PluginSettings,
    children?: any,
    context?: PluginCodeGenerationContext
  ): string {
    // Validate settings
    const validation = this.validateSettings(settings);
    if (!validation.isValid) {
      throw new Error(\`Settings validation failed: \${validation.errors.map(e => e.message).join(', ')}\`);
    }

    // Generate code
    const message = settings.message || "Hello World!";
    const variableName = settings.variableName;
    
    return \`# ${pluginName} Plugin
\${variableName} = "\${message}"
print(\${variableName})\`;
  }
}`;
      }
      __name(createPluginTemplate, "createPluginTemplate");
      function getPluginMetadata(plugin) {
        const definition = plugin.getDefinition();
        return {
          id: definition.id,
          name: definition.name,
          version: definition.version,
          nodeType: definition.nodeType,
          inputHandles: definition.inputHandles.length,
          outputHandles: definition.outputHandles.length,
          settingsFields: definition.settingsFields.length,
          capabilities: definition.capabilities,
          hasVisualConfig: !!definition.visual,
          hasDynamicLabel: !!definition.visual.labels.dynamicLabelTemplate
        };
      }
      __name(getPluginMetadata, "getPluginMetadata");
    }
  });

  // node_modules/@tensorify.io/sdk/dist/index.js
  var require_dist = __commonJS({
    "node_modules/@tensorify.io/sdk/dist/index.js"(exports) {
      "use strict";
      init_define_process();
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.MANIFEST_VERSIONS = exports.MIN_TYPESCRIPT_VERSION = exports.SDK_VERSION = exports.PLUGIN_CATEGORIES = exports.getPluginMetadata = exports.createPluginTemplate = exports.isValidPluginDirectory = exports.autoDetectEntrypointClassName = exports.indentCode = exports.sanitizeVariableName = exports.generateVariableName = exports.processDynamicLabelTemplate = exports.mergeSettingsWithDefaults = exports.createDefaultSettings = exports.validatePluginSettings = exports.validatePlugin = exports.buildPluginManifest = exports.writeManifestFile = exports.readPackageJson = exports.generatePluginManifest = exports.DEFAULT_VALUES = exports.UI_TYPE_TO_DATA_TYPE_MAP = exports.SettingsDataType = exports.SettingsUIType = exports.NextNodeAsOutput = exports.PrevNodeAsInput = exports.IconType = exports.NodeViewContainerType = exports.EdgeType = exports.HandlePosition = exports.HandleViewType = exports.PluginCapability = exports.NodeType = exports.TensorifyPlugin = void 0;
      exports.createManifest = createManifest;
      exports.validateManifest = validateManifest;
      exports.createEntryPoint = createEntryPoint;
      var TensorifyPlugin_1 = require_TensorifyPlugin();
      Object.defineProperty(exports, "TensorifyPlugin", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return TensorifyPlugin_1.TensorifyPlugin;
      }, "get") });
      var core_1 = require_core();
      Object.defineProperty(exports, "NodeType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return core_1.NodeType;
      }, "get") });
      Object.defineProperty(exports, "PluginCapability", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return core_1.PluginCapability;
      }, "get") });
      var visual_1 = require_visual();
      Object.defineProperty(exports, "HandleViewType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return visual_1.HandleViewType;
      }, "get") });
      Object.defineProperty(exports, "HandlePosition", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return visual_1.HandlePosition;
      }, "get") });
      Object.defineProperty(exports, "EdgeType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return visual_1.EdgeType;
      }, "get") });
      Object.defineProperty(exports, "NodeViewContainerType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return visual_1.NodeViewContainerType;
      }, "get") });
      Object.defineProperty(exports, "IconType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return visual_1.IconType;
      }, "get") });
      var handles_1 = require_handles();
      Object.defineProperty(exports, "PrevNodeAsInput", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return handles_1.PrevNodeAsInput;
      }, "get") });
      Object.defineProperty(exports, "NextNodeAsOutput", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return handles_1.NextNodeAsOutput;
      }, "get") });
      var settings_1 = require_settings();
      Object.defineProperty(exports, "SettingsUIType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return settings_1.SettingsUIType;
      }, "get") });
      Object.defineProperty(exports, "SettingsDataType", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return settings_1.SettingsDataType;
      }, "get") });
      Object.defineProperty(exports, "UI_TYPE_TO_DATA_TYPE_MAP", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return settings_1.UI_TYPE_TO_DATA_TYPE_MAP;
      }, "get") });
      Object.defineProperty(exports, "DEFAULT_VALUES", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return settings_1.DEFAULT_VALUES;
      }, "get") });
      var core_2 = require_core();
      var visual_2 = require_visual();
      var plugin_utils_1 = require_plugin_utils();
      Object.defineProperty(exports, "generatePluginManifest", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.generatePluginManifest;
      }, "get") });
      Object.defineProperty(exports, "readPackageJson", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.readPackageJson;
      }, "get") });
      Object.defineProperty(exports, "writeManifestFile", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.writeManifestFile;
      }, "get") });
      Object.defineProperty(exports, "buildPluginManifest", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.buildPluginManifest;
      }, "get") });
      Object.defineProperty(exports, "validatePlugin", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.validatePlugin;
      }, "get") });
      Object.defineProperty(exports, "validatePluginSettings", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.validatePluginSettings;
      }, "get") });
      Object.defineProperty(exports, "createDefaultSettings", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.createDefaultSettings;
      }, "get") });
      Object.defineProperty(exports, "mergeSettingsWithDefaults", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.mergeSettingsWithDefaults;
      }, "get") });
      Object.defineProperty(exports, "processDynamicLabelTemplate", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.processDynamicLabelTemplate;
      }, "get") });
      Object.defineProperty(exports, "generateVariableName", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.generateVariableName;
      }, "get") });
      Object.defineProperty(exports, "sanitizeVariableName", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.sanitizeVariableName;
      }, "get") });
      Object.defineProperty(exports, "indentCode", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.indentCode;
      }, "get") });
      Object.defineProperty(exports, "autoDetectEntrypointClassName", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.autoDetectEntrypointClassName;
      }, "get") });
      Object.defineProperty(exports, "isValidPluginDirectory", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.isValidPluginDirectory;
      }, "get") });
      Object.defineProperty(exports, "createPluginTemplate", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.createPluginTemplate;
      }, "get") });
      Object.defineProperty(exports, "getPluginMetadata", { enumerable: true, get: /* @__PURE__ */ __name(function() {
        return plugin_utils_1.getPluginMetadata;
      }, "get") });
      exports.PLUGIN_CATEGORIES = [
        "custom",
        "trainer",
        "evaluator",
        "model",
        "model_layer",
        "sequence",
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
        "report"
      ];
      exports.SDK_VERSION = "1.0.0";
      exports.MIN_TYPESCRIPT_VERSION = "4.5.0";
      exports.MANIFEST_VERSIONS = ["1.0.0"];
      function createManifest(overrides = {}) {
        const defaults = {
          name: "my-plugin",
          version: "1.0.0",
          description: "A new Tensorify plugin",
          author: "",
          main: "dist/index.js",
          entrypointClassName: "MyPlugin",
          keywords: ["tensorify", "plugin"],
          frontendConfigs: {
            id: "my-plugin",
            name: "My Plugin",
            category: "custom",
            nodeType: core_2.NodeType.CUSTOM,
            visual: {
              containerType: visual_2.NodeViewContainerType.DEFAULT,
              size: { width: 200, height: 120 },
              padding: { inner: 16, outer: 8, extraPadding: false },
              styling: {
                borderRadius: 8,
                borderWidth: 2,
                shadowLevel: 1,
                theme: "auto"
              },
              icons: { secondary: [], showIconBackground: true, iconSize: "medium" },
              labels: { showLabels: true, labelPosition: "top" }
            },
            inputHandles: [],
            outputHandles: [],
            settingsFields: []
          },
          capabilities: [core_2.PluginCapability.CODE_GENERATION],
          requirements: {
            minSdkVersion: exports.SDK_VERSION,
            dependencies: []
          },
          sdkVersion: exports.SDK_VERSION,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          manifestVersion: "1.0.0"
        };
        return { ...defaults, ...overrides };
      }
      __name(createManifest, "createManifest");
      function validateManifest(manifest) {
        const required = [
          "name",
          "version",
          "entrypointClassName",
          "frontendConfigs"
        ];
        for (const field of required) {
          if (!(field in manifest) || !manifest[field]) {
            throw new Error(`Required field '${field}' is missing from manifest`);
          }
        }
        const versionRegex = /^\d+\.\d+\.\d+$/;
        if (!versionRegex.test(manifest.version)) {
          throw new Error(`Invalid version format: ${manifest.version}`);
        }
        return true;
      }
      __name(validateManifest, "validateManifest");
      function createEntryPoint(description, parameters = {}) {
        return {
          description,
          parameters: {
            settings: {
              type: "object",
              required: true,
              description: "Plugin settings object"
            },
            children: {
              type: "any",
              required: false,
              description: "Connected child plugins"
            },
            context: {
              type: "object",
              required: false,
              description: "Code generation context"
            },
            ...parameters
          }
        };
      }
      __name(createEntryPoint, "createEntryPoint");
    }
  });

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => LinearLayerPlugin
  });
  init_define_process();
  var import_sdk = __toESM(require_dist());
  var _LinearLayerPlugin = class _LinearLayerPlugin extends import_sdk.TensorifyPlugin {
    constructor() {
      const definition = {
        // Core Metadata (id, name, description, version, nodeType are derived from package.json)
        // nodeType is derived from package.json tensorify.pluginType field
        // Visual Configuration (comprehensive and required)
        visual: {
          containerType: import_sdk.NodeViewContainerType.DEFAULT,
          size: {
            width: 240,
            height: 140
          },
          padding: {
            inner: 16,
            outer: 8,
            extraPadding: false
          },
          styling: {
            borderRadius: 8,
            borderWidth: 2,
            shadowLevel: 1,
            theme: "auto"
          },
          icons: {
            primary: {
              type: import_sdk.IconType.LUCIDE,
              value: "layers"
            },
            secondary: [],
            showIconBackground: true,
            iconSize: "medium"
          },
          labels: {
            title: "Linear Layer",
            dynamicLabelTemplate: "{inFeatures} \u2192 {outFeatures}",
            showLabels: true,
            labelPosition: "top"
          }
        },
        // Handle Configuration
        inputHandles: [import_sdk.PrevNodeAsInput],
        outputHandles: [import_sdk.NextNodeAsOutput],
        // Settings Configuration (UI components automatically generated)
        settingsFields: [
          {
            key: "linearVarName",
            label: "Variable name",
            type: import_sdk.SettingsUIType.INPUT_TEXT,
            dataType: import_sdk.SettingsDataType.STRING,
            defaultValue: "linear_layer",
            required: true,
            description: "Name of the variable to assign when emit is enabled"
          },
          {
            key: "emitLinearVar",
            label: "Emit variable name",
            type: import_sdk.SettingsUIType.TOGGLE,
            dataType: import_sdk.SettingsDataType.BOOLEAN,
            defaultValue: true,
            required: true,
            description: "Controls emission of the linear layer variable"
          },
          {
            key: "inFeatures",
            label: "Input Features",
            type: import_sdk.SettingsUIType.INPUT_NUMBER,
            dataType: import_sdk.SettingsDataType.NUMBER,
            defaultValue: 784,
            required: true,
            description: "Number of input features",
            validation: {
              min: 1,
              max: 1e5
            }
          },
          {
            key: "outFeatures",
            label: "Output Features",
            type: import_sdk.SettingsUIType.INPUT_NUMBER,
            dataType: import_sdk.SettingsDataType.NUMBER,
            defaultValue: 10,
            required: true,
            description: "Number of output features",
            validation: {
              min: 1,
              max: 1e5
            }
          },
          {
            key: "bias",
            label: "Use Bias",
            type: import_sdk.SettingsUIType.TOGGLE,
            dataType: import_sdk.SettingsDataType.BOOLEAN,
            defaultValue: true,
            required: false,
            description: "Whether to include bias parameters in the linear transformation"
          }
        ],
        // Plugin Metadata
        emits: {
          variables: [
            {
              value: "linear_layer",
              switchKey: "settingsFields.emitLinearVar",
              isOnByDefault: true
            }
          ],
          imports: [{ path: "torch", items: ["nn"] }]
        },
        capabilities: [import_sdk.PluginCapability.CODE_GENERATION],
        requirements: {
          minSdkVersion: "1.0.0",
          dependencies: ["torch"],
          pythonPackages: ["torch"]
        }
      };
      super(definition);
    }
    getTranslationCode(settings, children, context) {
      const validation = this.validateSettings(settings);
      if (!validation.isValid) {
        throw new Error(
          `Settings validation failed: ${validation.errors.map((e) => e.message).join(", ")}`
        );
      }
      const variableName = settings.linearVarName || settings.variableName || "linear_layer";
      const shouldEmit = Boolean(settings.emitLinearVar);
      const inFeatures = settings.inFeatures || 784;
      const outFeatures = settings.outFeatures || 10;
      const bias = settings.bias !== void 0 ? settings.bias : true;
      if (typeof inFeatures !== "number" || inFeatures <= 0) {
        throw new Error("Input features must be a positive number");
      }
      if (typeof outFeatures !== "number" || outFeatures <= 0) {
        throw new Error("Output features must be a positive number");
      }
      const inputData = context ? this.getInput(context, 0) : null;
      const ctor = `torch.nn.Linear(
    in_features=${inFeatures},
    out_features=${outFeatures},
    bias=${bias ? "True" : "False"}
)`;
      const body = shouldEmit ? `${variableName} = ${ctor}` : ctor;
      return `${body}
`;
    }
  };
  __name(_LinearLayerPlugin, "LinearLayerPlugin");
  var LinearLayerPlugin = _LinearLayerPlugin;
  return __toCommonJS(index_exports);
})();
/*! Bundled license information:

@tensorify.io/sdk/dist/index.js:
  (**
   * @tensorify.io/sdk
   *
   * TypeScript SDK for developing Tensorify plugins with comprehensive validation,
   * frontend enforcement, and publishing tools.
   *
   * @version 1.0.0
   * @author AlphaWolf Ventures, Inc.
   * @license ISC
   *)
*/
