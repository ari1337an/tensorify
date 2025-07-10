// src/nodes/PTMaxPool2d.ts

import INode, { NodeType } from "../../../core/interfaces/INode";

export default class PTMaxPool2d implements INode<PTMaxPool2d["settings"]> {
  name: string = "MaxPool2d";

  translationTemplate: string = `nn.MaxPool2d({parameters})`;

  inputLines: number = 1;
  outputLinesCount: number = 1;
  secondaryInputLinesCount: number = 0;
  nodeType: NodeType = NodeType.MODEL_LAYER;

  settings: {
    kernelSize: number;
    stride?: number;
    padding?: number;
  } = {
    kernelSize: 2,
  };

  constructor() {
    // Initialize settings if needed
  }

  getTranslationCode(settings: typeof this.settings): string {
    const params = [`${settings.kernelSize}`];

    if (settings.stride !== undefined) {
      params.push(`stride=${settings.stride}`);
    }
    if (settings.padding !== undefined) {
      params.push(`padding=${settings.padding}`);
    }

    return this.translationTemplate.replace('{parameters}', params.join(', '));
  }
}
