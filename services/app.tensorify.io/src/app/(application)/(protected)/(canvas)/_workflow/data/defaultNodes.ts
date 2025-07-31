import {
  Axis3D,
  Box,
  Brain,
  ChartNetwork,
  CopyCheck,
  Database,
  DraftingCompass,
  InfinityIcon,
  Layers,
  Loader,
  LoaderPinwheel,
  Parentheses,
  PersonStanding,
  Plus,
  Radical,
  Rotate3d,
  ShipWheel,
  TriangleRight,
  Wrench,
  Activity,
  Play,
  BarChart3,
  Calculator,
  Clock,
  Filter,
  GitBranch,
  FileText,
  Settings,
  Workflow,
  HelpCircle,
  Component,
} from "lucide-react";
import { NodeItem } from "../types/NodeItem";

const defaultNodes: NodeItem[] = [
  // START NODE
  {
    id: "@tensorify/core/StartNode",
    version: "1.0.0",
    draggable: true,
    Icon: Play,
    title: "Start Node",
    description:
      "Workflow entry point that initiates your AI training or data processing pipeline. Essential for beginning any workflow execution.",
  },
  // NESTED NODE
  {
    id: "@tensorify/core/NestedNode",
    version: "1.0.0",
    draggable: true,
    Icon: Component,
    title: "Nested Node",
    description:
      "Design hierarchical nodes with child components for complex operations. Ideal for modular workflows and layered functionalities.",
  },
  // MODEL_LAYER category
  {
    id: "model_layer",
    draggable: false,
    Icon: Layers,
    title: "Model Layers",
    description:
      "Create powerful and flexible neural network architectures with these model layers.",
    children: [
      {
        id: "@tensorify/PTSequential",
        version: "1.0.0",
        draggable: true,
        Icon: Plus,
        title: "PTSequential",
        description:
          "A container for stacking layers sequentially. Perfect for straightforward neural networks where one layer feeds into the next.",
      },
      {
        id: "@tensorify/PTConv2D",
        version: "1.0.0",
        draggable: true,
        Icon: Box,
        title: "PTConv2D",
        description:
          "A 2D convolution layer to extract spatial features from images. Ideal for computer vision tasks like image classification and object detection.",
      },
      {
        id: "@tensorify/PTLinear",
        version: "1.0.0",
        draggable: true,
        Icon: Axis3D,
        title: "PTLinear",
        description:
          "A fully connected layer for dense transformations. Excellent for tasks requiring feature aggregation or classification.",
      },
      {
        id: "@tensorify/PTRelu",
        version: "1.0.0",
        draggable: true,
        Icon: Rotate3d,
        title: "PTReLU",
        description:
          "An activation layer applying the ReLU function. Boosts non-linearity in your network for superior learning capabilities.",
      },
    ],
  },
  // MODEL category
  {
    id: "model",
    draggable: false,
    Icon: Brain,
    title: "Models",
    description:
      "Define and manage your entire model. Supports seamless integration with layers, optimizers, and training workflows.",
    children: [],
  },
  // TRAINER category
  {
    id: "trainer",
    draggable: false,
    Icon: ChartNetwork,
    title: "Trainers",
    description:
      "Master the art of training your models with state-of-the-art trainers. Whether you need reinforcement learning or standard backpropagation, we've got you covered.",
    children: [
      {
        id: "@tensorify/trainers/RLHFTrainer",
        version: "1.0.0",
        draggable: true,
        Icon: PersonStanding,
        title: "RLHF Trainer",
        description:
          "Reinforcement Learning with Human Feedback Trainer. Fine-tune models for alignment and user-centric behaviors.",
      },
      {
        id: "@tensorify/trainers/StandardBackpropTrainer",
        version: "1.0.0",
        draggable: true,
        Icon: DraftingCompass,
        title: "StandardBackprop Trainer",
        description:
          "The classic backpropagation trainer for supervised learning. Ensures optimal performance with efficient gradient updates.",
      },
    ],
  },
  // EVALUATOR category
  {
    id: "evaluator",
    draggable: false,
    Icon: BarChart3,
    title: "Evaluators",
    description:
      "Evaluate model performance with comprehensive evaluation tools and metrics.",
    children: [],
  },
  // DATALOADER category
  {
    id: "dataloader",
    draggable: false,
    Icon: Loader,
    title: "Dataloaders",
    description:
      "Efficiently load and preprocess your data with these loaders. Optimized for batch processing and high-performance pipelines.",
    children: [
      {
        id: "@tensorify/dataloaders/PTDataloader",
        version: "1.0.0",
        draggable: true,
        Icon: Loader,
        title: "PTDataloader",
        description:
          "PyTorch DataLoader for dynamic data loading. Supports batching, shuffling, and multiprocessing for seamless training.",
      },
    ],
  },
  // DATASET category
  {
    id: "dataset",
    draggable: false,
    Icon: Database,
    title: "Datasets",
    description:
      "Create and manage your training and validation datasets. From raw data to structured inputs, we've got you covered.",
    children: [
      {
        id: "@tensorify/datasets/PTDataset",
        version: "1.0.0",
        draggable: true,
        Icon: Database,
        title: "PTDataset",
        description:
          "PyTorch Dataset interface for custom dataset handling. Provides flexibility for preprocessing and data augmentation.",
      },
    ],
  },
  // OPTIMIZER category (mapping Adam from criterions)
  {
    id: "optimizer",
    draggable: false,
    Icon: Settings,
    title: "Optimizers",
    description:
      "Optimize your model's learning process with advanced optimization algorithms.",
    children: [
      {
        id: "@tensorify/criterions/Adam",
        version: "1.0.0",
        draggable: true,
        Icon: TriangleRight,
        title: "Adam",
        description:
          "Adaptive moment estimation optimizer. Combines the benefits of RMSProp and momentum for faster convergence.",
      },
    ],
  },
  // CRITERION category (mapping MSE and MAE from criterions)
  {
    id: "criterion",
    draggable: false,
    Icon: InfinityIcon,
    title: "Criterions",
    description:
      "Define how your model measures errors. Choose from a wide array of loss functions tailored for different use cases.",
    children: [
      {
        id: "@tensorify/criterions/MSE",
        version: "1.0.0",
        draggable: true,
        Icon: Radical,
        title: "MSE",
        description:
          "Mean Squared Error loss. Ideal for regression tasks where minimizing squared differences is essential.",
      },
      {
        id: "@tensorify/criterions/MAE",
        version: "1.0.0",
        draggable: true,
        Icon: Parentheses,
        title: "MAE",
        description:
          "Mean Absolute Error loss. Focuses on minimizing absolute differences for robust regression models.",
      },
    ],
  },
  // LOSS_FUNCTION category
  {
    id: "loss_function",
    draggable: false,
    Icon: Calculator,
    title: "Loss Functions",
    description:
      "Advanced loss functions for specialized training objectives and model optimization.",
    children: [],
  },
  // METRIC category
  {
    id: "metric",
    draggable: false,
    Icon: Activity,
    title: "Metrics",
    description:
      "Track and monitor your model's performance with comprehensive metrics and monitoring tools.",
    children: [],
  },
  // SCHEDULER category
  {
    id: "scheduler",
    draggable: false,
    Icon: Clock,
    title: "Schedulers",
    description:
      "Control learning rate and other hyperparameters dynamically during training.",
    children: [],
  },
  // REGULARIZER category
  {
    id: "regularizer",
    draggable: false,
    Icon: Filter,
    title: "Regularizers",
    description:
      "Prevent overfitting and improve model generalization with regularization techniques.",
    children: [],
  },
  // PREPROCESSOR category
  {
    id: "preprocessor",
    draggable: false,
    Icon: Filter,
    title: "Preprocessors",
    description:
      "Transform and prepare your data before feeding it to your models.",
    children: [],
  },
  // POSTPROCESSOR category
  {
    id: "postprocessor",
    draggable: false,
    Icon: Workflow,
    title: "Postprocessors",
    description:
      "Process and refine model outputs for final results and visualization.",
    children: [],
  },
  // AUGMENTATION_STACK category
  {
    id: "augmentation_stack",
    draggable: false,
    Icon: Layers,
    title: "Augmentation Stacks",
    description:
      "Enhance your training data with sophisticated augmentation techniques and pipelines.",
    children: [],
  },
  // TRAIN_ONE_EPOCH_FUNCTION category
  {
    id: "train_one_epoch_function",
    draggable: false,
    Icon: CopyCheck,
    title: "Train One Epoch Functions",
    description:
      "Execute training operations for a single epoch with precision. Customize metrics and operations to optimize learning.",
    children: [
      {
        id: "@tensorify/TOEF/PTStandardTrainOneEpoch",
        version: "1.0.0",
        draggable: true,
        Icon: CopyCheck,
        title: "PTStandardTrainOneEpoch",
        description:
          "A PyTorch standard training routine for one epoch. Handles forward passes, loss computation, and optimization in a single loop.",
      },
    ],
  },
  // REPORT category
  {
    id: "report",
    draggable: false,
    Icon: FileText,
    title: "Reports",
    description:
      "Generate comprehensive reports and analytics for your training processes and model performance.",
    children: [],
  },
  // FUNCTION category
  {
    id: "function",
    draggable: false,
    Icon: GitBranch,
    title: "Functions",
    description:
      "Utility functions and custom operations for specialized tasks in your workflow.",
    children: [],
  },
  // PIPELINE category
  {
    id: "pipeline",
    draggable: false,
    Icon: Workflow,
    title: "Pipelines",
    description:
      "Create complex workflows and pipelines that orchestrate multiple components together.",
    children: [],
  },

  // MISCELLANEOUS category
  {
    id: "miscellaneous",
    draggable: false,
    Icon: HelpCircle,
    title: "Miscellaneous",
    description:
      "Various utilities and components that don't fit into specific categories but provide valuable functionality.",
    children: [],
  },
];

export default defaultNodes;
