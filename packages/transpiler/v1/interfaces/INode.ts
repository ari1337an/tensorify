import { Children, Layer } from "../types/global";

// interfaces/INode.ts
export enum NodeType {
  CUSTOM,
  TRAINER,
  EVALUATOR,
  MODEL,
  MODEL_LAYER,
  DATALOADER,
  OPTIMIZER,
  REPORT,
  FUNCTION,
  PIPELINE,
  AUGMENTATION_STACK,
}

export default interface INode<TSettings> {
  /** Name of the node */
  name: string;

  /** Template used for translation */
  translationTemplate: string;

  /** Number of input lines */
  inputLines: number;

  /** Number of output lines */
  outputLinesCount: number;

  /** Number of secondary input lines */
  secondaryInputLinesCount: number;

  /** Type of the node */
  nodeType: NodeType;

  /** Settings for the node */
  settings: TSettings;

  /** Child */
  child?: Layer | Layer[] | null;

  /** Function to get the translation code */
  getTranslationCode(settings: TSettings, children: Children): string;
}
