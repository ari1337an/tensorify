#!/usr/bin/env node

const { program } = require("commander");
const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const validatePackageName = require("validate-npm-package-name");

const packageJson = require("./package.json");
const keytar = require("keytar");
const axios = require("axios");

// Session storage constants (same as CLI)
const SERVICE_NAME = "tensorify-cli";
const ACCOUNT_NAME = "session";

// Authentication helper functions
async function getAuthToken() {
  try {
    return await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
  } catch (error) {
    return null;
  }
}

async function getUserProfile(isDev = false) {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const baseUrl = isDev
      ? "http://localhost:3002"
      : "https://plugins.tensorify.io";

    const response = await axios.get(`${baseUrl}/api/cli/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    return null;
  }
}

const TEMPLATES = {
  "linear-layer": {
    name: "Linear Layer",
    description: "A Tensorify PyTorch linear layer plugin",
    displayName: "Linear Layer - A Tensorify PyTorch linear layer plugin",
    default: true,
  },
  minimal: {
    name: "Minimal",
    description: "A Tensorify plugin",
    displayName: "Minimal - A basic Tensorify plugin",
  },
};

// NodeType options from SDK
const NODE_TYPES = {
  CUSTOM: { value: "custom", name: "Custom - General purpose plugin" },
  TRAINER: { value: "trainer", name: "Trainer - Model training component" },
  EVALUATOR: {
    value: "evaluator",
    name: "Evaluator - Model evaluation component",
  },
  MODEL: { value: "model", name: "Model - Complete model architecture" },
  MODEL_LAYER: {
    value: "model_layer",
    name: "Model Layer - Neural network layer",
  },
  DATALOADER: {
    value: "dataloader",
    name: "Data Loader - Data loading component",
  },
  PREPROCESSOR: {
    value: "preprocessor",
    name: "Preprocessor - Data preprocessing",
  },
  POSTPROCESSOR: {
    value: "postprocessor",
    name: "Postprocessor - Data postprocessing",
  },
  AUGMENTATION_STACK: {
    value: "augmentation_stack",
    name: "Augmentation Stack - Data augmentation",
  },
  OPTIMIZER: { value: "optimizer", name: "Optimizer - Training optimizer" },
  LOSS_FUNCTION: {
    value: "loss_function",
    name: "Loss Function - Loss computation",
  },
  METRIC: { value: "metric", name: "Metric - Performance metric" },
  SCHEDULER: {
    value: "scheduler",
    name: "Scheduler - Learning rate scheduler",
  },
  REGULARIZER: {
    value: "regularizer",
    name: "Regularizer - Regularization technique",
  },
  FUNCTION: { value: "function", name: "Function - Utility function" },
  PIPELINE: { value: "pipeline", name: "Pipeline - Workflow pipeline" },
  REPORT: { value: "report", name: "Report - Analysis report generator" },
};

const availableTemplates = Object.keys(TEMPLATES);

// Helper function to convert runtime pluginType to TypeScript enum key
function getNodeTypeEnumKey(pluginTypeValue) {
  const mapping = {
    custom: "CUSTOM",
    trainer: "TRAINER",
    evaluator: "EVALUATOR",
    model: "MODEL",
    model_layer: "MODEL_LAYER",
    dataloader: "DATALOADER",
    preprocessor: "PREPROCESSOR",
    postprocessor: "POSTPROCESSOR",
    augmentation_stack: "AUGMENTATION_STACK",
    optimizer: "OPTIMIZER",
    loss_function: "LOSS_FUNCTION",
    metric: "METRIC",
    scheduler: "SCHEDULER",
    regularizer: "REGULARIZER",
    function: "FUNCTION",
    pipeline: "PIPELINE",
    report: "REPORT",
  };
  return mapping[pluginTypeValue] || "CUSTOM";
}

const DEFAULT_AUTHOR = "Tensorify Developer";

const defaultTemplate = Object.keys(TEMPLATES).find(
  (key) => TEMPLATES[key].default
);

console.log(
  chalk.cyan(`\n🚀 Create Tensorify Plugin v${packageJson.version}\n`)
);

// Function to detect SDK version
function detectSDKVersion() {
  try {
    // First, try to get the local installed version
    try {
      const result = execSync("npm list @tensorify.io/sdk --depth=0 --json", {
        encoding: "utf8",
        stdio: "pipe",
      });
      const packageInfo = JSON.parse(result);
      const localVersion =
        packageInfo.dependencies?.["@tensorify.io/sdk"]?.version;

      if (localVersion) {
        console.log(chalk.blue(`🔍 Found local SDK version: ${localVersion}`));
        return localVersion;
      }
    } catch (localError) {
      console.log(chalk.yellow("⚠️  Could not find local SDK version"));
    }

    // Fallback to published version
    try {
      const result = execSync("npm view @tensorify.io/sdk version", {
        encoding: "utf8",
        stdio: "pipe",
      });
      const latestVersion = result.trim();
      console.log(
        chalk.blue(`🔍 Found published SDK version: ${latestVersion}`)
      );
      return latestVersion;
    } catch (error) {
      console.log(
        chalk.yellow("⚠️  Could not fetch latest SDK version from npm")
      );
      return "0.0.4";
    }
  } catch (error) {
    console.log(
      chalk.yellow("⚠️  Could not detect SDK version, using default")
    );
    return "0.0.4";
  }
}

// Function to format plugin name for scoped packages with auto-namespace detection
async function formatPluginName(name, isDev = false) {
  // If it already starts with @, return as-is
  if (name.startsWith("@")) {
    return name;
  }

  // Clean the name: remove special characters, convert to lowercase
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Try to get authenticated user's namespace
  try {
    const userProfile = await getUserProfile(isDev);
    if (userProfile && userProfile.username) {
      console.log(
        chalk.blue(`🔍 Detected authenticated user: @${userProfile.username}`)
      );
      console.log(
        chalk.green(
          `📦 Auto-applying namespace: @${userProfile.username}/${cleanName}`
        )
      );
      return `@${userProfile.username}/${cleanName}`;
    }
  } catch (error) {
    // Silently fall back to default behavior
  }

  // Fallback to default @tensorify/ scope
  console.log(
    chalk.yellow(
      `⚠️  No authenticated user detected, using default @tensorify/ namespace`
    )
  );
  return `@tensorify/${cleanName}`;
}

program
  .name("create-tensorify-plugin")
  .description("Create a new Tensorify plugin with the latest SDK")
  .version(packageJson.version)
  .argument(
    "[project-name]",
    "name of the plugin project (use '.' for current directory)"
  )
  .option("-d, --description <description>", "plugin description")
  .option("-a, --author <author>", "author name")
  .option(
    "-t, --template <template>",
    `template to use (${availableTemplates.join(", ")})`
  )
  .option(
    "-p, --plugin-type <type>",
    `plugin type/category (${Object.keys(NODE_TYPES).join(", ")})`
  )
  .option("-y, --yes", "accept all defaults and run non-interactively")
  .option("--skip-install", "skip installing dependencies")
  .option("--skip-git", "skip initializing git repository")
  .option("--dev", "use development environment for authentication check")
  .action(async (projectName, options) => {
    await createPlugin(projectName, options);
  });

async function createPlugin(projectName, options) {
  try {
    // Validate template option
    if (options.template && !availableTemplates.includes(options.template)) {
      console.error(chalk.red(`\n❌ Invalid template: ${options.template}`));
      console.error(
        chalk.yellow(`Available templates: ${availableTemplates.join(", ")}`)
      );
      process.exit(1);
    }

    // Get template-specific default description
    const getDefaultDescription = (template) => {
      return TEMPLATES[template]?.description || "A Tensorify plugin";
    };

    let targetPath;
    let finalProjectName;
    let isCurrentDir = false;

    // Handle dot command for current directory
    if (projectName === ".") {
      targetPath = process.cwd();
      finalProjectName = path.basename(targetPath);
      isCurrentDir = true;

      // Validate current directory name as package name
      const validation = validatePackageName(finalProjectName);
      if (!validation.validForNewPackages) {
        console.error(
          chalk.red(
            `\n❌ Current directory name "${finalProjectName}" is not a valid package name`
          )
        );
        console.error(
          chalk.red(validation.errors?.[0] || validation.warnings?.[0])
        );
        process.exit(1);
      }

      // Check if directory already has package.json
      if (fs.existsSync(path.join(targetPath, "package.json"))) {
        if (options.yes) {
          console.log(
            chalk.yellow(
              "Current directory contains package.json. Overwriting due to --yes flag."
            )
          );
        } else {
          const { overwrite } = await inquirer.prompt([
            {
              type: "confirm",
              name: "overwrite",
              message:
                "Current directory already contains a package.json. Overwrite?",
              default: false,
            },
          ]);

          if (!overwrite) {
            console.log(chalk.yellow("Operation cancelled."));
            process.exit(0);
          }
        }
      }
    } else {
      // Get project name if not provided
      if (!projectName) {
        if (options.yes) {
          projectName = "my-tensorify-plugin";
          console.log(chalk.blue(`Using default project name: ${projectName}`));
        } else {
          const answers = await inquirer.prompt([
            {
              type: "input",
              name: "projectName",
              message: "What is your plugin name?",
              default: "my-tensorify-plugin",
              validate: (input) => {
                const validation = validatePackageName(input);
                if (!validation.validForNewPackages) {
                  return (
                    validation.errors?.[0] ||
                    validation.warnings?.[0] ||
                    "Invalid package name"
                  );
                }
                return true;
              },
            },
          ]);
          projectName = answers.projectName;
        }
      }

      // Validate project name
      const validation = validatePackageName(projectName);
      if (!validation.validForNewPackages) {
        console.error(chalk.red(`\n❌ Invalid package name: ${projectName}`));
        console.error(
          chalk.red(validation.errors?.[0] || validation.warnings?.[0])
        );
        process.exit(1);
      }

      finalProjectName = projectName;
      targetPath = path.resolve(projectName);

      // Check if directory exists (but don't create it yet)
      if (fs.existsSync(targetPath)) {
        console.error(
          chalk.red(`\n❌ Directory ${projectName} already exists!`)
        );
        process.exit(1);
      }
    }

    // Prepare questions for missing information
    const questions = [];

    // Only ask for description if not provided via CLI and not in yes mode
    if (!options.description && !options.yes) {
      questions.push({
        type: "input",
        name: "description",
        message: "Plugin description:",
        default: (answers) =>
          getDefaultDescription(
            answers.template || options.template || defaultTemplate
          ),
      });
    }

    // Only ask for author if not provided via CLI and not in yes mode
    if (!options.author && !options.yes) {
      questions.push({
        type: "input",
        name: "author",
        message: "Author name:",
        default: "",
      });
    }

    // Ask for template if not provided via CLI and not in yes mode
    if (!options.template && !options.yes) {
      const templateChoices = Object.keys(TEMPLATES).map((key) => ({
        name: TEMPLATES[key].displayName,
        value: key,
      }));

      questions.push({
        type: "list",
        name: "template",
        message: "Choose a template:",
        choices: templateChoices.map((choice) => ({
          ...choice,
          name: `  ${choice.name}`,
        })),
        default: defaultTemplate,
      });
    }

    // Ask for plugin type if not provided via CLI and not in yes mode
    if (!options.pluginType && !options.yes) {
      const nodeTypeChoices = Object.values(NODE_TYPES);

      questions.push({
        type: "list",
        name: "pluginType",
        message: "Choose the plugin type:",
        choices: nodeTypeChoices.map((choice) => ({
          name: `  ${choice.name}`,
          value: choice.value,
        })),
        default: "CUSTOM",
      });
    }

    // Get additional information from prompts if needed
    let answers = {};
    if (questions.length > 0 && !options.yes) {
      answers = await inquirer.prompt(questions);
    }

    // Detect SDK version
    const sdkVersion = detectSDKVersion();

    // Use CLI options, prompt answers, or defaults for --yes mode
    const pluginConfig = {
      projectName: finalProjectName,
      packageName: await formatPluginName(finalProjectName, options.dev),
      description:
        options.description ||
        answers.description ||
        getDefaultDescription(
          answers.template || options.template || defaultTemplate
        ),
      author: options.author || answers.author || "Tensorify Developer",
      sdkVersion: sdkVersion,
      template: options.template || answers.template || defaultTemplate,
      pluginType: options.pluginType || answers.pluginType || "CUSTOM",
    };

    if (options.yes) {
      console.log(chalk.blue(`Using configuration:`));
      console.log(chalk.gray(`  Project: ${pluginConfig.projectName}`));
      console.log(chalk.gray(`  Package: ${pluginConfig.packageName}`));
      console.log(chalk.gray(`  Description: ${pluginConfig.description}`));
      console.log(chalk.gray(`  Author: ${pluginConfig.author || "(none)"}`));
      console.log(chalk.gray(`  Template: ${pluginConfig.template}`));
      console.log(chalk.gray(`  SDK Version: ${pluginConfig.sdkVersion}`));
    }

    // NOW CREATE THE FOLDER - After all inputs are collected
    if (!isCurrentDir) {
      console.log(chalk.blue(`\n📁 Creating ${projectName}...\n`));
      fs.ensureDirSync(targetPath);
    }

    // Copy template files
    await copyTemplate(targetPath, pluginConfig);

    if (projectName !== ".") {
      console.log(chalk.green(`\n✅ Created ${projectName}`));
    } else {
      console.log(chalk.green(`\n✅ Initialized plugin in current directory`));
    }

    // Initialize git
    if (!options.skipGit) {
      try {
        execSync("git init", { cwd: targetPath, stdio: "ignore" });
        console.log(chalk.green("✅ Initialized git repository"));
      } catch (error) {
        console.log(chalk.yellow("⚠️  Could not initialize git repository"));
      }
    }

    // Install dependencies
    if (!options.skipInstall) {
      console.log(chalk.blue("\n📦 Installing dependencies..."));
      try {
        execSync("npm install", { cwd: targetPath, stdio: "inherit" });
        console.log(chalk.green("✅ Dependencies installed"));
      } catch (error) {
        console.error(chalk.red("❌ Failed to install dependencies"));
        console.error(
          chalk.yellow("You can install them manually with: npm install")
        );
      }
    }

    // Success message
    console.log(chalk.green("\n🎉 Success! Your Tensorify plugin is ready."));
    console.log("\nNext steps:");
    if (projectName !== ".") {
      console.log(chalk.cyan(`  cd ${projectName}`));
    }
    if (options.skipInstall) {
      console.log(chalk.cyan("  npm install"));
    }
    console.log(chalk.cyan("  npm run build"));
    console.log(chalk.cyan("  npm test"));
    console.log("\nHappy tensoring! 🦾");
  } catch (error) {
    console.error(chalk.red("\n❌ Error creating plugin:"), error.message);
    process.exit(1);
  }
}

async function copyTemplate(targetPath, variables) {
  const templatePath = path.join(__dirname, "templates", variables.template);

  if (!fs.existsSync(templatePath)) {
    console.error(
      chalk.red(`Template directory not found: ${variables.template}`)
    );
    console.error(
      chalk.yellow(`Available templates: ${availableTemplates.join(", ")}`)
    );
    process.exit(1);
  }

  console.log(chalk.blue(`📋 Using template: ${variables.template}`));

  // Copy template files
  await fs.copy(templatePath, targetPath);

  // Helper function to convert project name to class name (PascalCase)
  function toClassicProjectName(name) {
    return name
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }

  // Helper function to convert project name to variable name (snake_case)
  function toVariableProjectName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores
  }

  // Process template variables in specific files
  const filesToProcess = [
    "package.json",
    "README.md",
    "src/index.ts",
    "icon.svg",
  ];

  for (const file of filesToProcess) {
    const filePath = path.join(targetPath, file);
    if (fs.existsSync(filePath)) {
      let content = await fs.readFile(filePath, "utf8");

      // Replace template variables
      content = content
        .replace(/{{projectName}}/g, variables.projectName)
        .replace(/{{packageName}}/g, variables.packageName)
        .replace(
          /{{classicProjectName}}/g,
          toClassicProjectName(variables.projectName)
        )
        .replace(
          /{{variableProjectName}}/g,
          toVariableProjectName(variables.projectName)
        )
        .replace(/{{description}}/g, variables.description)
        .replace(/{{author}}/g, variables.author)
        .replace(/{{sdkVersion}}/g, variables.sdkVersion)
        .replace(/{{pluginType}}/g, getNodeTypeEnumKey(variables.pluginType))
        .replace(/{{year}}/g, new Date().getFullYear().toString());

      await fs.writeFile(filePath, content);
    }
  }
}

program.parse();
