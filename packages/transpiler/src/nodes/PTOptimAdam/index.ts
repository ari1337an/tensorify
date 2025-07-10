// nodes/PTOptimAdam.ts
import { TrainerNode, TrainerSettings, NodeType, Children } from "@tensorify.io/sdk";

interface OptimAdamSettings {
  optimizerVariable: string; // Variable name for the optimizer instance
  params: string; // Parameters to optimize (e.g., model.parameters())
  parameters: { [key: string]: any }; // Additional optimizer parameters
}

export default class PTOptimAdam extends TrainerNode<TrainerSettings> {
  /** Name of the node */
  public readonly name: string = "PyTorch Optimizer Adam";

  /** Template used for translation */
  public readonly translationTemplate: string = `{optimizer_variable} = torch.optim.Adam({params}{parameters})`;

  /** Number of input lines */
  public readonly inputLines: number = 0;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.TRAINER;

  /** Default settings for PTOptimAdam */
  public readonly settings: TrainerSettings = {
    learningRate: 0.001,
  };

  // Additional settings for complex configuration
  public optimizerSettings: OptimAdamSettings = {
    optimizerVariable: "optimizer",
    params: "model.parameters()",
    parameters: {},
  };

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(
    settings: TrainerSettings,
    children?: Children
  ): string {
    // Use the optimizer settings for complex configuration
    const actualSettings = this.optimizerSettings;

    // Validate required settings
    if (!actualSettings.optimizerVariable || !actualSettings.params) {
      throw new Error("optimizerVariable and params are required");
    }

    // Prepare parameters string
    const parametersList: string[] = [];

    // Convert parameters to string representations
    for (const [key, value] of Object.entries(actualSettings.parameters)) {
      const valueStr = this.stringifyParameter(value);
      parametersList.push(`${key}=${valueStr}`);
    }

    // Join parameters with commas, prefixing with a comma if parameters exist
    const parametersStr =
      parametersList.length > 0 ? `, ${parametersList.join(", ")}` : "";

    return this.translationTemplate
      .replace("{optimizer_variable}", actualSettings.optimizerVariable)
      .replace("{params}", actualSettings.params)
      .replace("{parameters}", parametersStr);
  }
}
