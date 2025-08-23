#!/bin/bash

# Test script for the workflow shape validation endpoint

echo "Testing Workflow Shape Validation API..."
echo "======================================="

# Test URL (adjust port if needed)
API_URL="http://localhost:3000/api/validate-workflow-shapes"

# Your test payload with shape mismatch in sequence
PAYLOAD='{
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

echo "Sending POST request..."
echo ""

# Make the API call
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "$PAYLOAD" \
  --silent \
  --show-error \
  --fail-with-body | jq '.'

echo ""
echo "Test completed!"
echo ""
echo "Expected: Should detect shape mismatch in sequence"
echo "- First linear layer: 784 → 10 features"  
echo "- Second linear layer: expects 784 but should expect 10"
