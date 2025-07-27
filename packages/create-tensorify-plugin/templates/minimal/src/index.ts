import {
  TensorifyPlugin,
  type IPluginDefinition,
  type PluginSettings,
  type PluginCodeGenerationContext,
} from "@tensorify.io/sdk";

/**
 * {{projectName}} - A minimal Tensorify plugin for the frontend system
 * {{description}}
 */
export default class MinimalPlugin extends TensorifyPlugin {
  constructor() {
    super({
      // Basic plugin metadata
      id: "{{packageName}}",
      name: "{{projectName}}",
      description: "{{description}}",
      version: "1.0.0",
      category: "miscellaneous", // Change this to your preferred category

      // Visual configuration
      visual: {
        containerType: "default",
        size: {
          width: 200,
          height: 100,
        },
        extraPadding: false,

        // Optional: Configure title and description
        title: "{{projectName}}",
        titleDescription: "{{description}}",

        // Optional: Add icons (uncomment and customize)
        // primaryIcon: {
        //   type: "lucide",
        //   value: "Package", // Lucide icon name
        //   position: "center"
        // },
        secondaryIcons: [],

        // Optional: Dynamic label template
        // dynamicLabelTemplate: "{{projectName}}: {exampleSetting}"
      },

      // Input/Output handles
      inputHandles: [
        {
          id: "input",
          position: "left",
          viewType: "default",
          required: true,
          label: "Input",
        },
      ],
      outputHandles: [
        {
          id: "output",
          position: "right",
          viewType: "default",
          label: "Output",
        },
      ],

      // Settings fields for the frontend UI
      settingsFields: [
        {
          key: "exampleSetting",
          label: "Example Setting",
          type: "input-text",
          dataType: "string",
          required: false,
          defaultValue: "default-value",
          description: "An example setting to demonstrate the plugin system",
        },
        // Add more settings fields here:
        // {
        //   key: "numericValue",
        //   label: "Numeric Value",
        //   type: "input-number",
        //   dataType: "number",
        //   required: true,
        //   defaultValue: 42,
        //   description: "A numeric input example"
        // },
        // {
        //   key: "enableFeature",
        //   label: "Enable Feature",
        //   type: "toggle",
        //   dataType: "boolean",
        //   defaultValue: false,
        //   description: "Toggle to enable/disable a feature"
        // },
        // {
        //   key: "selectionOption",
        //   label: "Selection Option",
        //   type: "dropdown",
        //   dataType: "string",
        //   required: true,
        //   defaultValue: "option1",
        //   options: [
        //     { label: "Option 1", value: "option1" },
        //     { label: "Option 2", value: "option2" },
        //     { label: "Option 3", value: "option3" }
        //   ],
        //   description: "Select one option from the dropdown"
        // }
      ],
    });
  }

  /**
   * Generate code for this plugin
   * This is the main method that must be implemented by all plugins
   */
  public getTranslationCode(
    settings: PluginSettings,
    children?: any,
    context?: PluginCodeGenerationContext
  ): string {
    // Validate settings first
    this.validateSettings(settings);

    // Get setting values with fallbacks
    const exampleSetting =
      settings.exampleSetting ||
      this.getDefinition().settingsFields[0]?.defaultValue ||
      "default-value";

    // TODO: Implement your code generation logic here
    // This is a placeholder implementation
    return `
# {{projectName}}: ${exampleSetting}
# Generated from plugin: ${this.getName()} v${this.getVersion()}
# Category: ${this.getCategory()}

# TODO: Replace this with your actual code generation
{{variableProjectName}}_result = "Hello from {{projectName}} plugin!"
print(f"{{projectName}} executed with setting: {JSON.stringify(exampleSetting)}")
`.trim();
  }
}
