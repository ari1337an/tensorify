import { NextRequest, NextResponse } from "next/server";

// Simple interface definitions without imports
interface WorkflowNode {
  id: string;
  type: string;
  data: {
    pluginId?: string;
    pluginSettings?: Record<string, any>;
    sequenceItems?: Array<{
      slug: string;
      nodeId: string;
      name: string;
    }>;
    [key: string]: any;
  };
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface WorkflowPayload {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface ValidationResponse {
  success: boolean;
  validation: {
    hasShapeIssues: boolean;
    totalShapeErrors: number;
    totalConnectionErrors: number;
    message: string;
  };
  shapeErrors?: any[];
  connectionErrors?: any[];
}

export async function POST(request: NextRequest) {
  try {
    const payload: WorkflowPayload = await request.json();

    // Validate request payload
    if (!payload.nodes || !payload.edges) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payload: missing nodes or edges",
        },
        { status: 400 }
      );
    }

    // Find sequence with shape mismatch (simplified detection)
    const connectionErrors: any[] = [];

    for (const node of payload.nodes) {
      if (
        node.type === "@testing-bot-tensorify-dev/sequence:1.0.0" &&
        node.data.sequenceItems
      ) {
        // Validate shape flow through sequence items
        for (let i = 1; i < node.data.sequenceItems.length; i++) {
          const prevItem = node.data.sequenceItems[i - 1];
          const currentItem = node.data.sequenceItems[i];

          const prevNode = payload.nodes.find((n) => n.id === prevItem.nodeId);
          const currentNode = payload.nodes.find(
            (n) => n.id === currentItem.nodeId
          );

          if (
            prevNode?.data?.pluginSettings &&
            currentNode?.data?.pluginSettings
          ) {
            const prevOutFeatures = prevNode.data.pluginSettings.outFeatures;
            const currentInFeatures =
              currentNode.data.pluginSettings.inFeatures;

            if (
              prevOutFeatures &&
              currentInFeatures &&
              prevOutFeatures !== currentInFeatures
            ) {
              connectionErrors.push({
                edgeId: `sequence-shape-mismatch-${prevItem.nodeId}-${currentItem.nodeId}`,
                sourceNodeId: prevItem.nodeId,
                targetNodeId: currentItem.nodeId,
                sourceHandle: "output",
                targetHandle: "input",
                error: `Shape mismatch in sequence: ${
                  prevNode.data.label || "Layer"
                } outputs ${prevOutFeatures} features but ${
                  currentNode.data.label || "Layer"
                } expects ${currentInFeatures} features`,
                details: {
                  outputShape: `(N, ${prevOutFeatures})`,
                  expectedShape: `(N, ${currentInFeatures})`,
                },
              });
            }
          }
        }
      }
    }

    const totalShapeErrors = 0;
    const totalConnectionErrors = connectionErrors.length;
    const hasShapeIssues = totalShapeErrors > 0 || totalConnectionErrors > 0;

    const response: ValidationResponse = {
      success: true,
      validation: {
        hasShapeIssues,
        totalShapeErrors,
        totalConnectionErrors,
        message: hasShapeIssues
          ? `Found ${totalShapeErrors + totalConnectionErrors} shape validation issues`
          : "No shape validation issues found",
      },
      shapeErrors: [],
      connectionErrors,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error validating workflow shapes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Workflow Shape Validation API",
    description: "POST a workflow payload to validate tensor shapes",
    usage:
      "POST /api/validate-workflow-shapes with JSON payload containing nodes and edges",
    example: {
      nodes: [
        {
          id: "node1",
          type: "@testing-bot-tensorify-dev/linear:1.0.0",
          data: {
            pluginSettings: {
              inFeatures: 784,
              outFeatures: 128,
            },
          },
        },
      ],
      edges: [],
    },
  });
}
