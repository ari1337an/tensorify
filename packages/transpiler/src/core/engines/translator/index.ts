import createNodeInstance from "../../../instances/index";
import { Model } from "../../../core/types/global";

export default function translateJsonToBython(json: Model): string {
  const layerCodes: string[] = [];
  const layers = json.layers;

  for (const _layer in layers) {
    if (Object.prototype.hasOwnProperty.call(layers, _layer)) {
      const layer = layers[_layer];

      // process
      const nodeInstance = createNodeInstance(layer.type);
      if (!layer.child) {
        const code = nodeInstance.getTranslationCode(
          layer.settings ?? null,
          layer.child ?? null
        );
        layerCodes.push(code);
      } else {
        const code = nodeInstance.getTranslationCode(
          layer.settings ?? null,
          layer.child ?? null
        );
        layerCodes.push(code);
      }
    }
  }

  const layersCode = layerCodes.join("\n");
  return layersCode;
}
