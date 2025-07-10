/**
 * PyTorch Linear Layer Plugin
 * A fully connected linear transformation layer
 */

/**
 * PyTorch Linear Layer Settings
 */
interface PyTorchLinearSettings {
  inFeatures: number;
  outFeatures: number;
  bias?: boolean;
}

/**
 * Generate PyTorch Linear layer code
 */
export function generateLinearLayer(payload: PyTorchLinearSettings): string {
  // Validate required parameters
  if (!payload.inFeatures || !payload.outFeatures) {
    throw new Error("inFeatures and outFeatures are required");
  }

  // Validate input values
  if (payload.inFeatures <= 0 || payload.outFeatures <= 0) {
    throw new Error("inFeatures and outFeatures must be positive numbers");
  }

  const bias = payload.bias !== false; // default to true unless explicitly false

  // Generate PyTorch Linear layer code
  return `torch.nn.Linear(${payload.inFeatures}, ${payload.outFeatures}, bias=${
    bias ? "True" : "False"
  })`;
}

/**
 * Process payload method for plugin-engine compatibility
 */
export function processPayload(payload: any): string {
  return generateLinearLayer(payload);
}

/**
 * PyTorch Linear Layer Class (for compatibility)
 */
export class PyTorchLinearLayer {
  public readonly name: string = "PyTorch Linear Layer";

  public getTranslationCode(settings: PyTorchLinearSettings): string {
    return generateLinearLayer(settings);
  }

  public getDependencies(): string[] {
    return ["torch"];
  }
}

// Default export for transpiler compatibility
export default PyTorchLinearLayer;

// Named exports for plugin-engine flexible entry points
export const LinearLayer = PyTorchLinearLayer;
