import { BaseNode } from "./BaseNode";
import { NodeType } from "../interfaces/INode";
import { LayerSettings, CodeGenerationContext } from "../types";

/**
 * Interface for data node settings
 */
export interface DataSettings extends LayerSettings {
  /** Variable name for the data object */
  dataVariable?: string;
  /** Batch size */
  batchSize?: number;
  /** Whether to shuffle data */
  shuffle?: boolean;
  /** Number of workers for data loading */
  numWorkers?: number;
  /** Dataset path or configuration */
  dataPath?: string;
  /** Data transformations */
  transforms?: string[];
}

/**
 * Base class for data-related nodes (DataLoader, Dataset, etc.)
 * Provides common functionality for data handling components
 */
export abstract class DataNode<
  TSettings extends DataSettings = DataSettings
> extends BaseNode<TSettings> {
  /** Data nodes typically don't have input lines */
  public readonly inputLines: number = 0;

  /** Data nodes typically produce one data object */
  public readonly outputLinesCount: number = 1;

  /** Data nodes typically don't have secondary inputs */
  public readonly secondaryInputLinesCount: number = 0;

  /** Node type is always DATALOADER */
  public readonly nodeType: NodeType = NodeType.DATALOADER;

  /**
   * Get imports commonly needed for data handling
   */
  public getImports(context?: CodeGenerationContext): string[] {
    const framework = context?.framework || "pytorch";

    switch (framework) {
      case "pytorch":
        return [
          "import torch",
          "from torch.utils.data import Dataset, DataLoader",
          "import torchvision.transforms as transforms",
        ];
      case "tensorflow":
        return ["import tensorflow as tf"];
      default:
        return [];
    }
  }

  /**
   * Build DataLoader constructor call
   */
  protected buildDataLoaderConstructor(
    datasetVariable: string,
    settings: TSettings
  ): string {
    const params = [`${datasetVariable}`];

    if (settings.batchSize !== undefined) {
      params.push(`batch_size=${settings.batchSize}`);
    }

    if (settings.shuffle !== undefined) {
      params.push(`shuffle=${settings.shuffle ? "True" : "False"}`);
    }

    if (settings.numWorkers !== undefined) {
      params.push(`num_workers=${settings.numWorkers}`);
    }

    return `DataLoader(${params.join(", ")})`;
  }

  /**
   * Build Dataset class definition
   */
  protected buildDatasetClass(
    className: string,
    initBody: string,
    getitemBody: string,
    lenBody: string
  ): string {
    return `
class ${className}(Dataset):
    def __init__(self, *args, **kwargs):
${this.indentCode(initBody, 2)}
    
    def __len__(self):
${this.indentCode(lenBody, 2)}
    
    def __getitem__(self, idx):
${this.indentCode(getitemBody, 2)}
    `.trim();
  }

  /**
   * Validate data node settings
   */
  public validateSettings(settings: TSettings): boolean {
    super.validateSettings(settings);

    // Validate numeric parameters
    const numericParams = ["batchSize", "numWorkers"];
    numericParams.forEach((param) => {
      const value = settings[param];
      if (value !== undefined) {
        if (typeof value !== "number" || value < 0) {
          throw new Error(
            `${param} must be a non-negative number, got: ${value}`
          );
        }
      }
    });

    // Validate boolean parameters
    if (
      settings.shuffle !== undefined &&
      typeof settings.shuffle !== "boolean"
    ) {
      throw new Error(
        `shuffle must be a boolean, got: ${typeof settings.shuffle}`
      );
    }

    return true;
  }
}
