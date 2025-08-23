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
  Square,
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
  Merge,
  Split,
  Code,
  Code2,
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
  // END NODE
  {
    id: "@tensorify/core/EndNode",
    version: "1.0.0",
    draggable: true,
    Icon: Square,
    title: "End Node",
    description:
      "Workflow exit point that marks the completion of your AI training or data processing pipeline. Can have multiple end nodes for different branches.",
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
  // CONTROL FLOW category
  {
    id: "@tensorify/core/BranchNode",
    version: "1.0.0",
    draggable: true,
    Icon: GitBranch,
    title: "Branch",
    description:
      "Split your workflow into multiple parallel branches. Configure 2-20 output branches for parallel processing paths.",
  },
  {
    id: "@tensorify/core/CustomCodeNode",
    version: "1.0.0",
    draggable: true,
    Icon: Code,
    title: "Custom Code",
    description:
      "Write custom Python code with intelligent variable injection and type inference. Perfect for custom transformations, calculations, and advanced logic.",
  },
  {
    id: "@tensorify/core/ClassNode",
    version: "1.0.0",
    draggable: true,
    Icon: Code2,
    title: "Python Class",
    description:
      "Create Python classes with intelligent constructor and method management. Perfect for defining custom datasets, models, and complex data structures with upstream variable integration.",
  },
  {
    id: "@tensorify/core/ConstantsNode",
    version: "1.0.0",
    draggable: true,
    Icon: Calculator,
    title: "Constants",
    description:
      "Define constant values (strings, integers, doubles) that can be used by downstream nodes. Emits variables containing your constant values for use throughout the workflow.",
  },
  // SEQUENCE category
  {
    id: "sequence",
    draggable: false,
    Icon: Workflow,
    title: "Sequences",
    description:
      "Compose ordered chains of items (e.g., model layers or transforms).",
    children: [],
  },
  // MODEL_LAYER category
  {
    id: "model_layer",
    draggable: false,
    Icon: Layers,
    title: "Model Layers",
    description:
      "Create powerful and flexible neural network architectures with these model layers.",
    children: [],
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
    children: [],
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
    children: [],
  },
  // DATASET category
  {
    id: "dataset",
    draggable: false,
    Icon: Database,
    title: "Datasets",
    description:
      "Create and manage your training and validation datasets. From raw data to structured inputs, we've got you covered.",
    children: [],
  },
  // OPTIMIZER category (mapping Adam from criterions)
  {
    id: "optimizer",
    draggable: false,
    Icon: Settings,
    title: "Optimizers",
    description:
      "Optimize your model's learning process with advanced optimization algorithms.",
    children: [],
  },
  // CRITERION category (mapping MSE and MAE from criterions)
  {
    id: "criterion",
    draggable: false,
    Icon: InfinityIcon,
    title: "Criterions",
    description:
      "Define how your model measures errors. Choose from a wide array of loss functions tailored for different use cases.",
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
    children: [],
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

  // CUSTOM category (for user-installed custom plugins/nodes)
  {
    id: "custom",
    draggable: false,
    Icon: ShipWheel,
    title: "Custom",
    description: "Your custom nodes and plugins installed into this workspace.",
    children: [],
  },
];

export default defaultNodes;
