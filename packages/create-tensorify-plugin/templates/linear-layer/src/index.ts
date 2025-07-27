import {
  TensorifyPlugin,
  type IPluginDefinition,
  type PluginSettings,
  type PluginCodeGenerationContext,
} from "@tensorify.io/sdk";

/**
 * {{projectName}} - A PyTorch Linear/Dense layer implementation
 * {{description}}
 */
export default class LinearLayerPlugin extends TensorifyPlugin {
  constructor() {
    super({
      // Basic plugin metadata
      id: "{{packageName}}",
      name: "{{projectName}}",
      description: "{{description}}",
      version: "1.0.0",
      category: "model_layer", // Linear layer belongs to model_layer category

      // Visual configuration
      visual: {
        containerType: "default",
        size: {
          width: 250,
          height: 120,
        },
        extraPadding: false,

        title: "Linear Layer",
        titleDescription: "PyTorch Linear/Dense Layer",

        // Icon for linear layer
        primaryIcon: {
          type: "lucide",
          value: "Layers",
          position: "center",
        },
        secondaryIcons: [],

        // Dynamic label showing layer dimensions
        dynamicLabelTemplate: "Linear({inFeatures} → {outFeatures})",
      },

      // Input/Output handles
      inputHandles: [
        {
          id: "input",
          position: "left",
          viewType: "default",
          required: true,
          label: "Input Tensor",
        },
      ],
      outputHandles: [
        {
          id: "output",
          position: "right",
          viewType: "default",
          label: "Output Tensor",
        },
      ],

      // Settings fields for the frontend UI
      settingsFields: [
        {
          key: "inFeatures",
          label: "Input Features",
          type: "input-number",
          dataType: "number",
          required: true,
          defaultValue: 784,
          description: "Number of input features",
        },
        {
          key: "outFeatures",
          label: "Output Features",
          type: "input-number",
          dataType: "number",
          required: true,
          defaultValue: 128,
          description: "Number of output features",
        },
        {
          key: "bias",
          label: "Include Bias",
          type: "toggle",
          dataType: "boolean",
          defaultValue: true,
          description:
            "Whether to include bias term in the linear transformation",
        },
      ],
    });
  }

  /**
   * Generate PyTorch Linear layer code
   */
  public getTranslationCode(
    settings: PluginSettings,
    children?: any,
    context?: PluginCodeGenerationContext
  ): string {
    // Validate settings first
    this.validateSettings(settings);

    // Get setting values with fallbacks
    const inFeatures = settings.inFeatures || 784;
    const outFeatures = settings.outFeatures || 128;
    const bias = settings.bias !== undefined ? settings.bias : true;

    // Generate the PyTorch Linear layer code
    const layerCode = `nn.Linear(${inFeatures}, ${outFeatures}, bias=${bias})`;

    return `
# {{projectName}} Linear Layer: ${inFeatures} -> ${outFeatures} features
# Generated from plugin: ${this.getName()} v${this.getVersion()}
# PyTorch Linear/Dense layer implementation

# Import required modules
import torch
import torch.nn as nn

# Create the linear layer
{{variableProjectName}}_linear = ${layerCode}

# Layer info
print(f"Created Linear layer: {inFeatures} -> {outFeatures} features, bias={bias}")
`.trim();
  }

  /**
   * Custom validation for linear layer parameters
   */
  public validateSettings(settings: PluginSettings): boolean {
    // Call parent validation first
    super.validateSettings(settings);

    // Additional validation for linear layer
    const inFeatures = settings.inFeatures;
    const outFeatures = settings.outFeatures;

    if (
      inFeatures !== undefined &&
      (typeof inFeatures !== "number" || inFeatures <= 0)
    ) {
      throw new Error("inFeatures must be a positive number");
    }

    if (
      outFeatures !== undefined &&
      (typeof outFeatures !== "number" || outFeatures <= 0)
    ) {
      throw new Error("outFeatures must be a positive number");
    }

    return true;
  }
}
