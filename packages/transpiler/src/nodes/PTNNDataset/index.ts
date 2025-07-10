// nodes/PTNNDataset.ts
import { DataNode, DataSettings, NodeType } from "@tensorify.io/sdk";

interface NNDatasetSettings extends DataSettings {
  className: string;
  constructorParams: string[]; // Parameters for __init__
  initCode: string; // Code inside __init__
  lenParams: string[]; // Parameters for __len__, typically just 'self'
  lenCode: string; // Code inside __len__
  getitemParams: string[]; // Parameters for __getitem__, typically 'self, idx'
  getitemCode: string; // Code inside __getitem__
}

export default class PTNNDataset extends DataNode<NNDatasetSettings> {
  /** Name of the node */
  public readonly name: string = "PyTorch NN Dataset";

  /** Template used for translation */
  public readonly translationTemplate: string = `
class {class_name}(Dataset):
    def __init__({constructor_params}):
{init_body}
    def __len__({len_params}):
{len_body}
    def __getitem__({getitem_params}):
{getitem_body}
`;

  /** Number of input lines */
  public readonly inputLines: number = 0;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.DATALOADER;

  /** Default settings for PTNNDataset */
  public readonly settings: NNDatasetSettings = {
    className: "CustomDataset",
    constructorParams: ["self"],
    initCode: "",
    lenParams: ["self"],
    lenCode: "",
    getitemParams: ["self", "idx"],
    getitemCode: "",
  };

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(settings: NNDatasetSettings): string {
    // Validate required settings using SDK method
    this.validateRequiredParams(settings, ["className"]);

    // Use the SDK utility method to build the dataset class
    return this.buildDatasetClass(
      settings.className,
      settings.initCode,
      settings.getitemCode,
      settings.lenCode
    );
  }
}
