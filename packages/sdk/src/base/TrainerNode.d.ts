import { BaseNode } from './BaseNode';
import { NodeType } from '../interfaces/INode';
import { LayerSettings, CodeGenerationContext } from '../types';
/**
 * Interface for trainer settings
 */
export interface TrainerSettings extends LayerSettings {
    /** Number of epochs */
    epochs?: number;
    /** Learning rate */
    learningRate?: number;
    /** Batch size */
    batchSize?: number;
    /** Model variable name */
    modelVariable?: string;
    /** Optimizer variable name */
    optimizerVariable?: string;
    /** Loss function variable name */
    lossFunctionVariable?: string;
    /** Dataloader variable name */
    dataloaderVariable?: string;
}
/**
 * Base class for trainer nodes
 * Provides common functionality for training workflows
 */
export declare abstract class TrainerNode<TSettings extends TrainerSettings = TrainerSettings> extends BaseNode<TSettings> {
    /** Trainers typically don't have input lines in the traditional sense */
    readonly inputLines: number;
    /** Trainers typically generate training loop code */
    readonly outputLinesCount: number;
    /** Trainers may have secondary inputs for validation data */
    readonly secondaryInputLinesCount: number;
    /** Node type is always TRAINER */
    readonly nodeType: NodeType;
    /**
     * Get imports commonly needed for training
     */
    getImports(context?: CodeGenerationContext): string[];
    /**
     * Build training function definition
     */
    protected buildTrainingFunction(functionName: string, parameters: string[], body: string): string;
    /**
     * Build training loop structure
     */
    protected buildTrainingLoop(epochLoop: string, batchLoop: string, settings: TSettings): string;
    /**
     * Validate trainer settings
     */
    validateSettings(settings: TSettings): boolean;
}
//# sourceMappingURL=TrainerNode.d.ts.map