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
} from "lucide-react";
import { NodeItem } from "../types/NodeItem";

const defaultNodes: NodeItem[] = [
  {
    id: "model_layers",
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
  {
    id: "models",
    draggable: false,
    Icon: Brain,
    title: "Model",
    description:
      "Define and manage your entire model. Supports seamless integration with layers, optimizers, and training workflows.",
  },
  {
    id: "custom",
    draggable: false,
    Icon: Wrench,
    title: "Custom",
    description: "Create custom nodes for standalone or nested operations.",
    children: [
      {
        id: "@tensorify/core/CustomStandaloneNode",
        version: "1.0.0",
        draggable: true,
        Icon: ShipWheel,
        title: "Custom Standalone Node",
        description:
          "Create isolated operations or custom logic nodes. Designed for specific use cases that operate independently of other components.",
      },
      {
        id: "@tensorify/core/CustomNestedNode",
        version: "1.0.0",
        draggable: true,
        Icon: LoaderPinwheel,
        title: "Custom Nested Node",
        description:
          "Design hierarchical nodes with child components for complex operations. Ideal for modular workflows and layered functionalities.",
      },
    ],
  },
  {
    id: "trainers",
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
  {
    id: "criterions",
    draggable: false,
    Icon: InfinityIcon,
    title: "Criterions",
    description:
      "Define how your model measures errors. Choose from a wide array of loss functions tailored for different use cases.",
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
  {
    id: "dataloaders",
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
  {
    id: "datasets",
    draggable: true,
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
  {
    id: "trainOneEpochFunctions",
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
];

export default defaultNodes;
