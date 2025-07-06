#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const Handlebars = require('handlebars');

const program = new Command();

// Template paths
const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');

program
  .name('tensorify-cli')
  .description('Tensorify Plugin Development CLI')
  .version('1.0.0');

// Create new plugin command
program
  .command('create')
  .description('Create a new Tensorify plugin')
  .argument('[name]', 'Plugin name')
  .option('-t, --template <template>', 'Template to use (basic, pytorch)', 'basic')
  .option('-d, --dir <directory>', 'Output directory', '.')
  .action(async (name, options) => {
    try {
      const pluginName = name || await askPluginName();
      const config = await askPluginConfig(pluginName);
      
      console.log(chalk.blue(`Creating plugin: ${pluginName}`));
      await createPlugin(pluginName, config, options.dir, options.template);
      
      console.log(chalk.green(`✅ Plugin "${pluginName}" created successfully!`));
      console.log(chalk.gray(`
Next steps:
1. cd ${path.join(options.dir, pluginName)}
2. npm install
3. npm run build
4. npm test
      `));
    } catch (error) {
      console.error(chalk.red('❌ Error creating plugin:'), error.message);
      process.exit(1);
    }
  });

// Create node command
program
  .command('node')
  .description('Create a new node in existing plugin')
  .argument('[name]', 'Node name')
  .option('-t, --type <type>', 'Node type (dataset, dataloader, layer, model, etc.)')
  .action(async (name, options) => {
    try {
      const nodeName = name || await askNodeName();
      const nodeConfig = await askNodeConfig(nodeName, options.type);
      
      console.log(chalk.blue(`Creating node: ${nodeName}`));
      await createNode(nodeName, nodeConfig);
      
      console.log(chalk.green(`✅ Node "${nodeName}" created successfully!`));
    } catch (error) {
      console.error(chalk.red('❌ Error creating node:'), error.message);
      process.exit(1);
    }
  });

// Validate plugin command
program
  .command('validate')
  .description('Validate a plugin')
  .argument('[path]', 'Plugin path', '.')
  .action(async (pluginPath) => {
    try {
      console.log(chalk.blue(`Validating plugin at: ${pluginPath}`));
      await validatePlugin(pluginPath);
      console.log(chalk.green('✅ Plugin validation passed!'));
    } catch (error) {
      console.error(chalk.red('❌ Plugin validation failed:'), error.message);
      process.exit(1);
    }
  });

program.parse();

// Helper functions
async function askPluginName() {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Plugin name:',
      validate: (input) => input.length > 0 || 'Plugin name is required'
    }
  ]);
  return name;
}

async function askPluginConfig(name) {
  return await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Plugin description:',
      default: `A Tensorify plugin for ${name}`
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author:',
      default: 'Your Name <your.email@example.com>'
    },
    {
      type: 'input',
      name: 'version',
      message: 'Version:',
      default: '1.0.0'
    }
  ]);
}

async function askNodeName() {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Node name:',
      validate: (input) => input.length > 0 || 'Node name is required'
    }
  ]);
  return name;
}

async function askNodeConfig(name, type) {
  return await inquirer.prompt([
    {
      type: 'list',
      name: 'nodeType',
      message: 'Node type:',
      choices: [
        'DATASET',
        'DATALOADER', 
        'LAYER',
        'MODEL',
        'PREPROCESSING',
        'OPTIMIZER',
        'LOSS',
        'CUSTOM'
      ],
      default: type?.toUpperCase() || 'CUSTOM'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Node description:',
      default: `A ${name} node for Tensorify`
    }
  ]);
}

async function createPlugin(name, config, outputDir, template) {
  const pluginDir = path.join(outputDir, name);
  const templatePath = path.join(TEMPLATE_DIR, template);
  
  if (!await fs.pathExists(templatePath)) {
    throw new Error(`Template "${template}" not found`);
  }

  await fs.ensureDir(pluginDir);
  await fs.copy(templatePath, pluginDir);

  const templateVars = {
    pluginName: name,
    pluginSlug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    ...config,
    timestamp: new Date().toISOString()
  };

  await processTemplateFiles(pluginDir, templateVars);
}

async function createNode(name, config) {
  const nodeTemplate = `const { BaseNode, NodeType, DevUtils } = require('@tensorify/sdk');

/**
 * ${name} Node
 */
class ${name} extends BaseNode {
  constructor() {
    super();
    
    this.name = '${name}';
    this.nodeType = NodeType.${config.nodeType};
    this.description = '${config.description}';
    
    this.inputs = [];
    this.outputs = [
      DevUtils.createOutput('output', 'tensor', 'Node output')
    ];
    
    this.schema = {
      type: 'object',
      properties: {},
      required: []
    };

    this.codeGeneration = {
      generateCode: (settings, context) => ({
        imports: [],
        definitions: [],
        instantiations: [],
        usage: {
          forward: '# Generated code here',
          named_parameters: '("output", output)'
        }
      }),
      getDependencies: () => [],
      getOutputs: () => ['output'],
      validateConnections: () => true
    };

    this.security = DevUtils.createBasicSecurity();
    this.quality = DevUtils.createBasicQuality('1.0.0', ['Example usage']);
  }
}

module.exports = { ${name} };
`;

  await fs.writeFile(`${name}.js`, nodeTemplate);
}

async function processTemplateFiles(dir, vars) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      await processTemplateFiles(filePath, vars);
    } else if (file.name.endsWith('.hbs')) {
      const template = await fs.readFile(filePath, 'utf8');
      const compiled = Handlebars.compile(template);
      const result = compiled(vars);
      
      const outputPath = filePath.replace('.hbs', '');
      await fs.writeFile(outputPath, result);
      await fs.remove(filePath);
    } else if (file.name.endsWith('.json') || file.name.endsWith('.js') || file.name.endsWith('.md')) {
      let content = await fs.readFile(filePath, 'utf8');
      for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value);
      }
      await fs.writeFile(filePath, content);
    }
  }
}

async function validatePlugin(pluginPath) {
  const packagePath = path.join(pluginPath, 'package.json');
  const mainPath = path.join(pluginPath, 'src', 'index.js');
  
  if (!await fs.pathExists(packagePath)) {
    throw new Error('package.json not found');
  }
  
  if (!await fs.pathExists(mainPath)) {
    throw new Error('Main plugin file not found');
  }

  console.log(chalk.gray('✓ Package structure valid'));
  console.log(chalk.gray('✓ Main file exists'));
} 