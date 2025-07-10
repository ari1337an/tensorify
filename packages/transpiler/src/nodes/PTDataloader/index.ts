// nodes/PTDataloader.ts
import { DataNode, DataSettings, NodeType, Children } from "@tensorify.io/sdk";

interface DataloaderSettings {
  dataloaderVariable: string; // Variable name for the DataLoader instance
  datasetVariable: string; // Variable name of the dataset to load
  parameters: { [key: string]: any }; // Additional DataLoader parameters
}

export default class PTDataloader extends DataNode<DataSettings> {
  /** Name of the node */
  public readonly name: string = "PyTorch DataLoader";

  /** Template used for translation */
  public readonly translationTemplate: string = `{dataloader_variable} = DataLoader({dataset_variable}{parameters})`;

  /** Number of input lines */
  public readonly inputLines: number = 0;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.DATALOADER;

  /** Default settings for PTDataloader */
  public readonly settings: DataSettings = {
    batchSize: 32,
    shuffle: false,
    numWorkers: 0,
  };

  // Additional settings for complex configuration
  public dataloaderSettings: DataloaderSettings = {
    dataloaderVariable: "data_loader",
    datasetVariable: "dataset",
    parameters: {},
  };

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(
    settings: DataSettings,
    children?: Children
  ): string {
    // Use the dataloader settings for complex configuration
    const actualSettings = this.dataloaderSettings;

    // Validate required settings using SDK method
    if (!actualSettings.dataloaderVariable || !actualSettings.datasetVariable) {
      throw new Error("dataloaderVariable and datasetVariable are required");
    }

    // Extract standard parameters into specific settings for SDK compatibility
    const dataSettings: DataSettings = {
      batchSize: actualSettings.parameters.batch_size,
      shuffle: actualSettings.parameters.shuffle,
      numWorkers: actualSettings.parameters.num_workers,
      ...settings,
    };

    // Use SDK utility to build DataLoader constructor
    const dataloaderCode = this.buildDataLoaderConstructor(
      actualSettings.datasetVariable,
      dataSettings
    );

    // Handle any additional custom parameters not covered by SDK
    const additionalParams: string[] = [];
    Object.entries(actualSettings.parameters).forEach(([key, value]) => {
      // Skip parameters already handled by SDK
      if (!["batch_size", "shuffle", "num_workers"].includes(key)) {
        additionalParams.push(`${key}=${this.stringifyParameter(value)}`);
      }
    });

    // Combine SDK-generated code with additional parameters
    let finalCode = dataloaderCode;
    if (additionalParams.length > 0) {
      // Extract the parameters part and add additional ones
      const paramStart = finalCode.indexOf("(") + 1;
      const paramEnd = finalCode.lastIndexOf(")");
      const existingParams = finalCode.substring(paramStart, paramEnd);
      const allParams =
        existingParams +
        (existingParams ? ", " : "") +
        additionalParams.join(", ");
      finalCode = `DataLoader(${allParams})`;
    }

    return `${actualSettings.dataloaderVariable} = ${finalCode}`;
  }
}
