/**
 * Node Shape Debug Tooltip Component
 *
 * Shows tensor shape information when hovering over nodes for debugging
 */

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { useUIEngine } from "@workflow/engine";

interface NodeShapeDebugTooltipProps {
  children: React.ReactNode;
  nodeId: string;
  nodeType: string;
  pluginId?: string;
}

export function NodeShapeDebugTooltip({
  children,
  nodeId,
  nodeType,
  pluginId,
}: NodeShapeDebugTooltipProps) {
  const engine = useUIEngine();

  // Get shape information for this node
  const nodeShapeInfo = engine.nodeShapes?.[nodeId];

  // Use the same manifest resolution logic as the UI Engine
  const manifest = engine.pluginManifests
    ? (pluginId ? (engine.pluginManifests as any)[pluginId] : undefined) ||
      (engine.pluginManifests as any)[nodeType]
    : undefined;

  // Get emitted variables with shapes
  // The manifest data is directly on the manifest object, not nested
  const emittedVariables =
    manifest?.emits?.variables || manifest?.visual?.emits?.variables || [];
  const variablesWithShapes = emittedVariables.filter((v: any) => v.shape);

  // Debug logging
  console.log(`🔍 NodeShapeDebugTooltip - Node: ${nodeId}`, {
    nodeType,
    pluginId,
    manifestFound: !!manifest,
    manifestSlug: manifest?.slug,
    manifestName: manifest?.name,
    emittedVariables: emittedVariables.length,
    variablesWithShapes: variablesWithShapes.length,
    nodeShapeInfo: !!nodeShapeInfo,
    availableManifests: engine.pluginManifests
      ? Object.keys(engine.pluginManifests)
      : [],
    engineExists: !!engine,
    pluginManifestsExists: !!engine.pluginManifests,
    manifestStructure: manifest ? Object.keys(manifest) : [],
  });

  // Always show tooltip for debugging purposes
  // if (!nodeShapeInfo && variablesWithShapes.length === 0) {
  //   return <>{children}</>;
  // }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-lg">
          <div className="space-y-3">
            <div className="font-semibold text-sm border-b pb-1">
              🔍 Shape Debug - {nodeType}
            </div>

            {/* Manifest Shape Information */}
            {variablesWithShapes.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-blue-600">
                  📋 Manifest Shapes:
                </div>
                {variablesWithShapes.map((variable: any, index: number) => (
                  <div key={index} className="text-xs bg-blue-50 p-2 rounded">
                    <div>
                      <strong>{variable.value}</strong> ({variable.type})
                    </div>
                    <div>
                      Type: <code>{variable.shape.type}</code>
                    </div>
                    <div>
                      Dimensions:{" "}
                      <code>
                        [{variable.shape.dimensions?.join(", ") || "none"}]
                      </code>
                    </div>
                    {variable.shape.description && (
                      <div>Description: {variable.shape.description}</div>
                    )}
                    {variable.shape.passthroughSource && (
                      <div>
                        Passthrough:{" "}
                        <code>{variable.shape.passthroughSource}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Calculated Shape Information */}
            {nodeShapeInfo && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-green-600">
                  🧮 Calculated Shapes:
                </div>

                {Object.keys(nodeShapeInfo.outputShapes).length > 0 && (
                  <div className="text-xs bg-green-50 p-2 rounded">
                    <div className="font-medium mb-1">Output Shapes:</div>
                    {Object.entries(nodeShapeInfo.outputShapes).map(
                      ([key, shape]: [string, any]) => (
                        <div key={key}>
                          <strong>{key}:</strong> ({shape.dimensions.join(", ")}
                          ) - {shape.description}
                        </div>
                      )
                    )}
                  </div>
                )}

                {Object.keys(nodeShapeInfo.expectedInputShapes).length > 0 && (
                  <div className="text-xs bg-yellow-50 p-2 rounded">
                    <div className="font-medium mb-1">
                      Expected Input Shapes:
                    </div>
                    {Object.entries(nodeShapeInfo.expectedInputShapes).map(
                      ([key, shape]: [string, any]) => (
                        <div key={key}>
                          <strong>{key}:</strong> ({shape.dimensions.join(", ")}
                          ) - {shape.description}
                        </div>
                      )
                    )}
                  </div>
                )}

                {nodeShapeInfo.shapeErrors.length > 0 && (
                  <div className="text-xs bg-red-50 p-2 rounded">
                    <div className="font-medium mb-1 text-red-600">
                      ❌ Shape Errors:
                    </div>
                    {nodeShapeInfo.shapeErrors.map((error, index) => (
                      <div key={index} className="text-red-700">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* No Shape Info */}
            {!nodeShapeInfo && variablesWithShapes.length === 0 && (
              <div className="text-xs text-gray-500">
                No tensor shape information available for this node.
              </div>
            )}

            {/* Debug Info */}
            <div className="text-xs text-gray-400 border-t pt-1">
              Node ID: {nodeId}
              <br />
              Plugin: {pluginId || "N/A"}
              <br />
              Manifest Found: {manifest ? "Yes" : "No"}
              <br />
              Shape Info: {nodeShapeInfo ? "Yes" : "No"}
              <br />
              Engine: {engine ? "Yes" : "No"}
              <br />
              Plugin Manifests: {engine?.pluginManifests ? "Yes" : "No"}
              <br />
              Available Manifests:{" "}
              {engine?.pluginManifests
                ? Object.keys(engine.pluginManifests).length
                : 0}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
