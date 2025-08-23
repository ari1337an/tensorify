/**
 * Test script to verify shape calculation for linear layer
 */

import { ShapeIntelliSenseManager } from "./services/app.tensorify.io/src/app/(application)/(protected)/(canvas)/_workflow/utils/ShapeIntelliSense";

// Mock linear layer node
const mockLinearNode = {
  id: "test-linear-node",
  type: "@tensorify/linear",
  position: { x: 100, y: 100 },
  route: "/",
  version: "1.0.0",
  data: {
    label: "Linear Layer",
    pluginId: "@tensorify/linear",
    pluginSettings: {
      inFeatures: 784,
      outFeatures: 10,
      bias: true,
      linearVarName: "linear_layer",
      emitLinearVar: true,
    },
  },
  selected: false,
  dragging: false,
};

// Mock edges (empty for this test)
const mockEdges: any[] = [];

// Mock plugin manifest (simulating InstalledPluginRecord structure)
const mockPluginManifest = {
  id: "test-linear-id",
  slug: "@tensorify/linear",
  description: "PyTorch nn.Linear layer",
  pluginType: "model_layer",
  manifest: {
    name: "@tensorify/linear",
    version: "1.0.0",
    description: "PyTorch nn.Linear layer",
    emits: {
      variables: [
        {
          value: "linear_layer",
          switchKey: "settingsFields.emitLinearVar",
          isOnByDefault: true,
          type: "model_layer",
          shape: {
            type: "dynamic",
            dimensions: [
              "{input.input_tensor.shape[0]}", // Same batch size as input
              "{settings.outFeatures}", // Output features from settings
            ],
            description: "2D tensor (batch_size, output_features)",
          },
        },
      ],
      imports: [
        {
          path: "torch",
          items: ["nn"],
        },
      ],
    },
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

async function testShapeCalculation() {
  console.log("🧪 Testing shape calculation for linear layer...");

  try {
    const shapeManager = new ShapeIntelliSenseManager();

    // Calculate shapes
    const shapeMap = shapeManager.calculateAllNodeShapes(
      [mockLinearNode],
      mockEdges,
      [mockPluginManifest]
    );

    console.log("✅ Shape calculation completed!");
    console.log("Shape map:", shapeMap);

    // Check if we got the expected result
    const linearNodeShape = shapeMap.get("test-linear-node");
    if (linearNodeShape) {
      console.log("✅ Linear node shape found:", linearNodeShape);
      console.log("Output shapes:", linearNodeShape.outputShapes);
      console.log(
        "Expected input shapes:",
        linearNodeShape.expectedInputShapes
      );
      console.log("Shape errors:", linearNodeShape.shapeErrors);
    } else {
      console.error("❌ No shape info found for linear node");
    }
  } catch (error) {
    console.error("❌ Shape calculation test failed:", error);
  }
}

// Run the test
testShapeCalculation();
