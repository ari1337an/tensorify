import {
  INode,
  ModelLayerNode,
  ModelLayerSettings,
  NodeType,
} from "@tensorify.io/sdk";

/**
 * Settings interface for the plugin
 */
export interface PluginSettings extends ModelLayerSettings {
  /** Example setting - replace with your own */
  exampleSetting?: string;
}

/**
 * {{projectName}} - A minimal Tensorify plugin template
 * {{description}}
 */
export default class TensorifyPlugin
  extends ModelLayerNode<PluginSettings>
  implements INode<PluginSettings>
{
  /** Name of the node */
  public readonly name: string = "{{projectName}}";

  /** Template used for translation */
  public readonly translationTemplate: string =
    "{{variableProjectName}}_plugin";

  /** Number of input lines */
  public readonly inputLines: number = 1;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Node type */
  public readonly nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Default settings */
  public readonly settings: PluginSettings = {
    exampleSetting: "default-value",
  };

  /**
   * Generate code for this plugin
   */
  public getTranslationCode(
    settings: PluginSettings,
    children?: any,
    context?: any
  ): string {
    // Validate settings
    this.validateSettings(settings);

    // TODO: Implement your code generation logic here
    // This is a placeholder implementation
    const exampleSetting = settings.exampleSetting || "default-value";

    return `
# {{projectName}}: ${exampleSetting}
${this.translationTemplate} = "TODO: Implement your code generation here"
`.trim();
  }

  /**
   * Validate plugin settings
   */
  public validateSettings(settings: PluginSettings): boolean {
    // TODO: Add your validation logic here
    // Example validation:
    if (
      settings.exampleSetting &&
      typeof settings.exampleSetting !== "string"
    ) {
      throw new Error("exampleSetting must be a string");
    }

    return true;
  }

  /**
   * Get required dependencies
   */
  public getDependencies(): string[] {
    // TODO: Return the dependencies your plugin needs
    return [];
  }

  /**
   * Get required imports
   */
  public getImports(context?: any): string[] {
    // TODO: Return the import statements your plugin needs
    return ["# {{projectName}} - {{description}}"];
  }
}
