/**
 * Sequence Shape Validator
 *
 * Validates tensor shapes between layers within sequence-type plugins.
 * Flow direction: top → bottom within the sequence.
 */

import {
  ShapeCalculator,
  type CalculatedTensorShape,
  type ShapeCalculationContext,
} from "./ShapeCalculator";

export interface SequenceItemShapeInfo {
  itemIndex: number;
  itemSlug: string;
  itemName: string;
  outputShape?: CalculatedTensorShape;
  expectedInputShape?: CalculatedTensorShape;
  hasShapeError: boolean;
  shapeErrorMessage?: string;
}

export interface SequenceShapeValidation {
  sequenceNodeId: string;
  itemShapeInfos: SequenceItemShapeInfo[];
  hasAnyErrors: boolean;
}

export class SequenceShapeValidator {
  /**
   * Validate shapes for all items in a sequence node
   */
  static validateSequenceShapes(
    sequenceNode: any,
    pluginManifests: any[],
    nodes: any[],
    sequenceInputShape?: CalculatedTensorShape
  ): SequenceShapeValidation {
    const sequenceItems: any[] = sequenceNode.data?.sequenceItems || [];

    // Debug: Uncomment for troubleshooting sequence validation
    // console.log(`🔧 SequenceShapeValidator input for ${sequenceNode.id}:`, {
    //   sequenceItems: sequenceItems.map((item: any) => ({
    //     slug: item.slug,
    //     name: item.name,
    //     settings: item.settings,
    //   })),
    //   pluginManifestsCount: pluginManifests.length,
    //   sequenceInputShape,

    const itemShapeInfos: SequenceItemShapeInfo[] = [];
    let hasAnyErrors = false;

    // Track the current shape flowing through the sequence
    let currentShape: CalculatedTensorShape | undefined = sequenceInputShape;

    for (let i = 0; i < sequenceItems.length; i++) {
      const item = sequenceItems[i];
      const itemInfo: SequenceItemShapeInfo = {
        itemIndex: i,
        itemSlug: item.slug || "unknown",
        itemName: item.name || `Item ${i + 1}`,
        hasShapeError: false,
      };

      try {
        // Get manifest for this item
        console.log(`🚨 SEQUENCE ITEM ${i} DEBUG:`, {
          itemSlug: item.slug,
          itemName: item.name,
          pluginManifestsCount: pluginManifests.length,
        });

        console.log(
          `🚨 AVAILABLE MANIFESTS:`,
          pluginManifests.map((m) => ({
            slug: m.slug,
            id: m.id,
            manifestName: m.manifest?.name,
            hasInputHandles: Array.isArray(m.manifest?.inputHandles),
            inputHandlesCount: m.manifest?.inputHandles?.length || 0,
          }))
        );

        const itemManifest = pluginManifests.find(
          (manifest) => manifest.slug === item.slug || manifest.id === item.slug
        );

        console.log(`🚨 MANIFEST LOOKUP RESULT for item ${i}:`, {
          lookingFor: item.slug,
          found: !!itemManifest,
          foundManifest: itemManifest
            ? {
                slug: itemManifest.slug,
                id: itemManifest.id,
                hasManifest: !!itemManifest.manifest,
                inputHandles: itemManifest.manifest?.inputHandles,
                inputHandlesLength: itemManifest.manifest?.inputHandles?.length,
              }
            : "NOT FOUND AT ALL",
        });

        if (!itemManifest) {
          itemInfo.hasShapeError = true;
          itemInfo.shapeErrorMessage = `Plugin ${item.slug} is not installed`;
          hasAnyErrors = true;
          itemShapeInfos.push(itemInfo);
          continue;
        }

        // Create shape context for this item
        // Sequence items reference actual canvas nodes by nodeId
        // Get settings from the actual canvas node
        const childNode = nodes.find((node: any) => node.id === item.nodeId);
        const itemSettings =
          childNode?.data?.pluginSettings ||
          childNode?.data?.settings ||
          this.getDefaultSettingsFromManifest(itemManifest);

        // Debug: Show child node lookup results
        console.log(`🚨 SEQUENCE ITEM ${i} CHILD NODE:`, {
          itemNodeId: item.nodeId,
          childNodeFound: !!childNode,
          childNodeType: childNode?.type,
          pluginSettings: childNode?.data?.pluginSettings,
          settingsKeys: Object.keys(itemSettings || {}),
          inFeatures: itemSettings?.inFeatures,
          outFeatures: itemSettings?.outFeatures,
          manifestFound: !!itemManifest,
        });
        const context: ShapeCalculationContext = {
          settings: itemSettings,
          inputs: currentShape
            ? { prev: currentShape, input_tensor: currentShape }
            : {},
          nodeType: item.slug,
        };

        // For sequence items, validate internal flow directly (not edge-based)
        // Skip validation for first item (no previous layer to validate against)
        if (i === 0) {
          console.log(
            `🔧 Sequence item ${i}: Skipping validation (first item)`
          );
        } else if (currentShape) {
          // For sequence internal validation, directly check if current layer can accept
          // the output from the previous layer. For Linear layers: inFeatures vs outFeatures.

          console.log(`🔧 Sequence item ${i} validation check:`, {
            itemSlug: item.slug,
            itemName: item.name,
            currentShapeFromPrevious: currentShape,
            itemSettings: itemSettings,
          });

          // For Linear layers, check if inFeatures matches previous outFeatures
          if (
            item.slug?.includes("linear") &&
            currentShape.dimensions?.length >= 2 &&
            itemSettings.inFeatures !== undefined
          ) {
            const prevOutputFeatures =
              currentShape.dimensions[currentShape.dimensions.length - 1];
            const currentInputFeatures = itemSettings.inFeatures;

            console.log(`🔧 Linear layer shape check for item ${i}:`, {
              previousOutputFeatures: prevOutputFeatures,
              currentInputFeatures: currentInputFeatures,
              isCompatible: prevOutputFeatures === currentInputFeatures,
            });

            if (prevOutputFeatures !== currentInputFeatures) {
              const errorMessage = `Shape mismatch: previous layer outputs ${prevOutputFeatures} features, but this layer expects ${currentInputFeatures} features`;

              itemInfo.hasShapeError = true;
              itemInfo.shapeErrorMessage = errorMessage;
              hasAnyErrors = true;

              console.log(
                `🔴 SEQUENCE SHAPE ERROR - Item ${i}: ${errorMessage}`
              );
            } else {
              console.log(`✅ Sequence item ${i}: Shape validation passed`);
            }
          } else {
            console.log(
              `🔧 Sequence item ${i}: Skipping validation - not a Linear layer or missing settings`
            );
          }
        } else if (i > 0) {
          console.log(
            `🔧 Sequence item ${i}: Validation SKIPPED - No current shape from previous layer`
          );
        }

        // Calculate output shape for this item
        const emittedVariables = itemManifest.manifest?.emits?.variables || [];
        const primaryVariable = emittedVariables[0]; // Take first emitted variable

        if (primaryVariable?.shape) {
          const outputShape = ShapeCalculator.calculateShape(
            primaryVariable.shape,
            context
          );
          itemInfo.outputShape = outputShape;

          console.log(`🔧 Sequence item ${i} output shape:`, {
            shapeTemplate: primaryVariable.shape,
            calculatedOutputShape: outputShape,
            context: context,
          });

          // Update current shape for next iteration
          currentShape = outputShape;
        } else {
          console.log(`🔧 Sequence item ${i} has no shape info:`, {
            primaryVariable,
            emittedVariables: emittedVariables,
          });
        }
      } catch (error) {
        itemInfo.hasShapeError = true;
        itemInfo.shapeErrorMessage = `Shape calculation failed: ${error instanceof Error ? error.message : String(error)}`;
        hasAnyErrors = true;
        console.warn(`Sequence shape validation failed for item ${i}:`, error);
      }

      itemShapeInfos.push(itemInfo);
    }

    return {
      sequenceNodeId: sequenceNode.id,
      itemShapeInfos,
      hasAnyErrors,
    };
  }

  /**
   * Get default settings from manifest for shape calculation
   */
  private static getDefaultSettingsFromManifest(
    manifest: any
  ): Record<string, any> {
    const defaultSettings: Record<string, any> = {};
    const settingsFields = manifest.manifest?.settingsFields || [];

    for (const field of settingsFields) {
      if (field.defaultValue !== undefined) {
        defaultSettings[field.key] = field.defaultValue;
      }
    }

    return defaultSettings;
  }

  /**
   * Format sequence shape validation results for debugging
   */
  static formatValidationResults(validation: SequenceShapeValidation): string {
    const lines = [`🔗 Sequence ${validation.sequenceNodeId}:`];

    for (const item of validation.itemShapeInfos) {
      const status = item.hasShapeError ? "❌" : "✅";
      const shapeSummary = item.outputShape
        ? `→ (${item.outputShape.dimensions.map((d) => (d === -1 ? "N" : d)).join(", ")})`
        : "→ ?";

      lines.push(`  ${status} ${item.itemName} ${shapeSummary}`);

      if (item.hasShapeError && item.shapeErrorMessage) {
        lines.push(`     Error: ${item.shapeErrorMessage}`);
      }
    }

    return lines.join("\n");
  }
}
