/**
 * Demo component to test Plugin Settings UI with sample manifests
 * Use this for testing the plugin settings functionality
 */

import React from "react";
import { Button } from "@/app/_components/ui/button";
import { PluginSettingsSection } from "./PluginSettingsSection";
import type { PluginManifest } from "../../../store/workflowStore";

// Sample manifest from TEST CASE 6 - Complex validation with all field types
const complexManifest: PluginManifest = {
  settingsFields: [
    {
      key: "modelName",
      label: "Model Name",
      type: "input-text",
      dataType: "string",
      defaultValue: "neural_network_v1",
      required: true,
      description: "Name for the trained model",
      validation: {
        minLength: 3,
        maxLength: 50,
        pattern: "^[a-zA-Z0-9_]+$",
      },
      group: "model_config",
    },
    {
      key: "description",
      label: "Model Description",
      type: "textarea",
      dataType: "string",
      defaultValue: "Advanced machine learning model for classification tasks",
      required: false,
      description: "Detailed description of the model",
      validation: {
        maxLength: 1000,
      },
      group: "model_config",
    },
    {
      key: "learningRate",
      label: "Learning Rate",
      type: "input-number",
      dataType: "number",
      defaultValue: 0.001,
      required: true,
      description: "Learning rate for training",
      validation: {
        min: 0.0001,
        max: 1.0,
      },
      group: "training_params",
    },
    {
      key: "batchSize",
      label: "Batch Size",
      type: "slider",
      dataType: "number",
      defaultValue: 32,
      required: true,
      description: "Training batch size",
      validation: {
        min: 1,
        max: 512,
      },
      group: "training_params",
    },
    {
      key: "useGpu",
      label: "Use GPU Acceleration",
      type: "toggle",
      dataType: "boolean",
      defaultValue: true,
      required: false,
      description: "Enable GPU acceleration for training",
      group: "performance",
    },
    {
      key: "saveCheckpoints",
      label: "Save Checkpoints",
      type: "checkbox",
      dataType: "boolean",
      defaultValue: false,
      required: false,
      description: "Save model checkpoints during training",
      group: "performance",
    },
    {
      key: "optimizer",
      label: "Optimizer",
      type: "dropdown",
      dataType: "string",
      defaultValue: "adam",
      required: true,
      description: "Optimization algorithm",
      options: [
        {
          label: "Adam",
          value: "adam",
          description: "Adaptive Moment Estimation",
        },
        {
          label: "SGD",
          value: "sgd",
          description: "Stochastic Gradient Descent",
        },
        {
          label: "RMSprop",
          value: "rmsprop",
          description: "Root Mean Square Propagation",
        },
        {
          label: "AdaGrad",
          value: "adagrad",
          description: "Adaptive Gradient Algorithm",
        },
      ],
      group: "training_params",
    },
    {
      key: "regularization",
      label: "Regularization Method",
      type: "radio",
      dataType: "string",
      defaultValue: "l2",
      required: false,
      description: "Regularization technique",
      options: [
        { label: "None", value: "none" },
        { label: "L1 Regularization", value: "l1" },
        { label: "L2 Regularization", value: "l2" },
        { label: "Dropout", value: "dropout" },
      ],
      group: "training_params",
    },
    {
      key: "metrics",
      label: "Evaluation Metrics",
      type: "multi-select",
      dataType: "array",
      defaultValue: ["accuracy", "loss"],
      required: true,
      description: "Metrics to track during training",
      options: [
        { label: "Accuracy", value: "accuracy" },
        { label: "Loss", value: "loss" },
        { label: "Precision", value: "precision" },
        { label: "Recall", value: "recall" },
        { label: "F1 Score", value: "f1" },
        { label: "AUC", value: "auc" },
      ],
      group: "model_config",
    },
    {
      key: "customCode",
      label: "Custom Training Code",
      type: "code-editor",
      dataType: "string",
      defaultValue:
        "# Custom training logic\nfor epoch in range(epochs):\n    train_step()",
      required: false,
      description: "Custom Python code for training",
      group: "advanced",
    },
    {
      key: "themeColor",
      label: "Visualization Theme Color",
      type: "color-picker",
      dataType: "color",
      defaultValue: "#3b82f6",
      required: false,
      description: "Color for training visualizations",
      group: "advanced",
    },
    {
      key: "trainingStartDate",
      label: "Training Start Date",
      type: "date-picker",
      dataType: "date",
      defaultValue: "2024-01-01T00:00:00Z",
      required: false,
      description: "Scheduled training start date",
      group: "advanced",
    },
  ],
  settingsGroups: [
    {
      id: "model_config",
      label: "Model Configuration",
      description: "Basic model settings and metadata",
      collapsible: true,
      defaultExpanded: true,
      fields: ["modelName", "description", "metrics"],
      order: 1,
    },
    {
      id: "training_params",
      label: "Training Parameters",
      description: "Hyperparameters for model training",
      collapsible: true,
      defaultExpanded: true,
      fields: ["learningRate", "batchSize", "optimizer", "regularization"],
      order: 2,
    },
    {
      id: "performance",
      label: "Performance Settings",
      description: "GPU and checkpoint configuration",
      collapsible: true,
      defaultExpanded: false,
      fields: ["useGpu", "saveCheckpoints"],
      order: 3,
    },
    {
      id: "advanced",
      label: "Advanced Options",
      description: "Custom code, files, and advanced settings",
      collapsible: true,
      defaultExpanded: false,
      fields: ["customCode", "themeColor", "trainingStartDate"],
      order: 4,
    },
  ],
};

// Sample manifest from TEST CASE 1 - Basic setup
const basicManifest: PluginManifest = {
  settingsFields: [
    {
      key: "inputText",
      label: "Input Text",
      type: "input-text",
      dataType: "string",
      defaultValue: "hello world",
      required: true,
      description: "Basic text input field",
      validation: {
        minLength: 1,
        maxLength: 100,
      },
    },
    {
      key: "numberValue",
      label: "Number Value",
      type: "input-number",
      dataType: "number",
      defaultValue: 42,
      required: false,
      description: "Numeric input with validation",
    },
  ],
  settingsGroups: [],
};

export function PluginSettingsDemo() {
  const [currentManifest, setCurrentManifest] = React.useState(basicManifest);
  const [settings, setSettings] = React.useState<Record<string, any>>({});

  const handleSettingsChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const loadDefaults = () => {
    const defaultSettings: Record<string, any> = {};
    currentManifest.settingsFields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaultSettings[field.key] = field.defaultValue;
      }
    });
    setSettings(defaultSettings);
  };

  React.useEffect(() => {
    loadDefaults();
  }, [currentManifest]);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Plugin Settings Demo</h2>
        <p className="text-muted-foreground">
          Test the plugin settings UI with different manifest configurations
        </p>

        <div className="flex gap-2">
          <Button
            variant={currentManifest === basicManifest ? "default" : "outline"}
            onClick={() => setCurrentManifest(basicManifest)}
          >
            Basic Fields
          </Button>
          <Button
            variant={
              currentManifest === complexManifest ? "default" : "outline"
            }
            onClick={() => setCurrentManifest(complexManifest)}
          >
            Complex Fields & Groups
          </Button>
          <Button variant="secondary" onClick={loadDefaults}>
            Load Defaults
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Plugin Settings UI</h3>
          <div className="border rounded-lg p-4 bg-card">
            <PluginSettingsSection
              nodeId="demo-node"
              pluginManifest={currentManifest}
              pluginSettings={settings}
              onSettingsChange={handleSettingsChange}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Current Settings Data</h3>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
