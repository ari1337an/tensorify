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
export declare abstract class DataNode<TSettings extends DataSettings = DataSettings> extends BaseNode<TSettings> {
    /** Data nodes typically don't have input lines */
    readonly inputLines: number;
    /** Data nodes typically produce one data object */
    readonly outputLinesCount: number;
    /** Data nodes typically don't have secondary inputs */
    readonly secondaryInputLinesCount: number;
    /** Node type is always DATALOADER */
    readonly nodeType: NodeType;
    /**
     * Get imports commonly needed for data handling
     */
    getImports(context?: CodeGenerationContext): string[];
    /**
     * Build DataLoader constructor call
     */
    protected buildDataLoaderConstructor(datasetVariable: string, settings: TSettings): string;
    /**
     * Build Dataset class definition
     */
    protected buildDatasetClass(className: string, initBody: string, getitemBody: string, lenBody: string): string;
    /**
     * Validate data node settings
     */
    validateSettings(settings: TSettings): boolean;
}
//# sourceMappingURL=DataNode.d.ts.map