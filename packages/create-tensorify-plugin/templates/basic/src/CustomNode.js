import { BaseNode, NodeType } from '@tensorify.io/sdk';

/**
 * Example Custom Node using the Tensorify SDK
 */
export default class CustomNode extends BaseNode {
  /** Name of the node */
  public readonly name: string = 'Custom Node';

  /** Template used for translation */
  public readonly translationTemplate: string = `{variable_name} = {custom_parameter}`;

  /** Number of input lines */
  public readonly inputLines: number = 1;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.CUSTOM;

  /** Default settings for CustomNode */
  public readonly settings = {
    variableName: 'custom_var',
    customParameter: 'default_value',
  };

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(settings) {
    // Validate required settings using SDK method
    this.validateRequiredParams(settings, ['variableName']);

    const varName = settings.variableName || 'custom_var';
    const customParam = settings.customParameter || 'default_value';

    return this.translationTemplate
      .replace('{variable_name}', varName)
      .replace('{custom_parameter}', `"${customParam}"`);
  }

  /** Get required dependencies */
  public getDependencies() {
    return [];
  }

  /** Get required imports */
  public getImports() {
    return ['# Add your imports here'];
  }
} 