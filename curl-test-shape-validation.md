# Tensor Shape Validation API Test

## Endpoint

```
POST http://localhost:3000/api/validate-workflow-shapes
```

## Test Command

Here's the curl command to test the shape validation with your payload:

```bash
curl -X POST "http://localhost:3000/api/validate-workflow-shapes" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nodes": [
      {
        "id": "f3d7b1b6-e14b-4fc5-bd40-5fb3c891daaf",
        "data": {"label": "StartNode"},
        "type": "@tensorify/core/StartNode",
        "route": "/",
        "position": {"x": 246, "y": 277}
      },
      {
        "id": "63ada78e-842b-4a8a-bfec-2787c59af581",
        "data": {
          "label": "ReLU",
          "pluginId": "@testing-bot-tensorify-dev/relu:1.0.0",
          "pluginSettings": {
            "inplace": false,
            "emitReluVar": true,
            "reluVarName": "relu"
          }
        },
        "type": "@testing-bot-tensorify-dev/relu:1.0.0",
        "position": {"x": 494, "y": 337}
      },
      {
        "id": "11b70408-7f1c-4e54-b4c0-bbfb5d095dca",
        "type": "@testing-bot-tensorify-dev/sequence:1.0.0",
        "position": {"x": 2068, "y": 332},
        "data": {
          "label": "Sequence",
          "pluginId": "@testing-bot-tensorify-dev/sequence:1.0.0",
          "pluginSettings": {
            "sequenceVarName": "seq",
            "emitSequenceVar": true,
            "itemsCount": 2
          },
          "sequenceItems": [
            {
              "slug": "@testing-bot-tensorify-dev/linear:1.0.0",
              "nodeId": "991d8ddd-ecc1-48de-a549-51c7daf146d1",
              "name": "Linear Layer"
            },
            {
              "slug": "@testing-bot-tensorify-dev/linear:1.0.0",
              "nodeId": "3c6d4191-2768-435b-b599-4cd98ff20cb5",
              "name": "Linear Layer"
            }
          ]
        }
      },
      {
        "id": "991d8ddd-ecc1-48de-a549-51c7daf146d1",
        "type": "@testing-bot-tensorify-dev/linear:1.0.0",
        "position": {"x": 2108, "y": 412},
        "data": {
          "label": "Linear Layer",
          "pluginId": "@testing-bot-tensorify-dev/linear:1.0.0",
          "pluginSettings": {
            "linearVarName": "linear_layer",
            "emitLinearVar": true,
            "inFeatures": 784,
            "outFeatures": 10,
            "bias": true
          }
        }
      },
      {
        "id": "3c6d4191-2768-435b-b599-4cd98ff20cb5",
        "type": "@testing-bot-tensorify-dev/linear:1.0.0",
        "position": {"x": 2108, "y": 492},
        "data": {
          "label": "Linear Layer",
          "pluginId": "@testing-bot-tensorify-dev/linear:1.0.0",
          "pluginSettings": {
            "linearVarName": "linear_layer",
            "emitLinearVar": true,
            "inFeatures": 784,
            "outFeatures": 10,
            "bias": true
          }
        }
      }
    ],
    "edges": [
      {
        "id": "edge1",
        "source": "f3d7b1b6-e14b-4fc5-bd40-5fb3c891daaf",
        "target": "63ada78e-842b-4a8a-bfec-2787c59af581",
        "sourceHandle": "next",
        "targetHandle": "prev"
      },
      {
        "id": "edge2",
        "source": "63ada78e-842b-4a8a-bfec-2787c59af581",
        "target": "11b70408-7f1c-4e54-b4c0-bbfb5d095dca",
        "sourceHandle": "next",
        "targetHandle": "prev"
      }
    ]
  }'
```

## Expected Response

The API should detect the shape mismatch in the sequence and return something like:

```json
{
  "success": true,
  "totalNodes": 5,
  "totalEdges": 2,
  "shapeErrors": [],
  "connectionErrors": [
    {
      "edgeId": "sequence-shape-mismatch-991d8ddd-ecc1-48de-a549-51c7daf146d1-3c6d4191-2768-435b-b599-4cd98ff20cb5",
      "sourceNodeId": "991d8ddd-ecc1-48de-a549-51c7daf146d1",
      "targetNodeId": "3c6d4191-2768-435b-b599-4cd98ff20cb5",
      "sourceHandle": "output",
      "targetHandle": "input",
      "error": "Shape mismatch in sequence: Linear Layer outputs 10 features but Linear Layer expects 784 features",
      "details": {
        "outputShape": "(N, 10)",
        "expectedShape": "(N, 784)"
      }
    }
  ],
  "summary": {
    "hasShapeIssues": true,
    "totalShapeErrors": 0,
    "totalConnectionErrors": 1,
    "message": "Found 1 shape validation issues"
  }
}
```

## How to Run

1. Make sure your app.tensorify.io service is running on port 3000
2. Run the curl command above
3. The API should detect that the second linear layer in the sequence expects 784 input features but should expect 10 (the output of the first layer)

## Alternative Test (Shorter)

For a simpler test, you can also just check if the endpoint is working:

```bash
curl -X GET "http://localhost:3000/api/validate-workflow-shapes"
```

This should return the API documentation.
