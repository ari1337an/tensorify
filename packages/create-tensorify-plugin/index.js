#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const validatePackageName = require('validate-npm-package-name');

const packageJson = require('./package.json');

console.log(chalk.cyan(`\n🚀 Create Tensorify Plugin v${packageJson.version}\n`));

program
  .name('create-tensorify-plugin')
  .description('Create a new Tensorify plugin with zero configuration')
  .version(packageJson.version)
  .argument('[project-name]', 'name of the plugin project')
  .option('-t, --template <template>', 'template to use', 'basic')
  .option('--skip-install', 'skip installing dependencies')
  .option('--skip-git', 'skip initializing git repository')
  .action(async (projectName, options) => {
    await createPlugin(projectName, options);
  });

async function createPlugin(projectName, options) {
  try {
    // Get project name if not provided
    if (!projectName) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your plugin name?',
          default: 'my-tensorify-plugin',
          validate: (input) => {
            const validation = validatePackageName(input);
            if (!validation.validForNewPackages) {
              return validation.errors?.[0] || validation.warnings?.[0] || 'Invalid package name';
            }
            return true;
          }
        }
      ]);
      projectName = answers.projectName;
    }

    // Validate project name
    const validation = validatePackageName(projectName);
    if (!validation.validForNewPackages) {
      console.error(chalk.red(`\n❌ Invalid package name: ${projectName}`));
      console.error(chalk.red(validation.errors?.[0] || validation.warnings?.[0]));
      process.exit(1);
    }

    const projectPath = path.resolve(projectName);

    // Check if directory exists
    if (fs.existsSync(projectPath)) {
      console.error(chalk.red(`\n❌ Directory ${projectName} already exists!`));
      process.exit(1);
    }

    console.log(chalk.blue(`\n📁 Creating ${projectName}...`));

    // Create project directory
    fs.ensureDirSync(projectPath);

    // Get additional information
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Plugin description:',
        default: `A Tensorify plugin`
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author name:',
        default: ''
      },
      {
        type: 'list',
        name: 'template',
        message: 'Choose a template:',
        choices: [
          { name: 'Basic Plugin (recommended)', value: 'basic' },
          { name: 'Dataset Plugin', value: 'dataset' },
          { name: 'Layer Plugin', value: 'layer' },
          { name: 'Advanced Plugin', value: 'advanced' }
        ],
        default: options.template || 'basic'
      }
    ]);

    // Copy template files
    await copyTemplate(answers.template, projectPath, {
      projectName,
      description: answers.description,
      author: answers.author
    });

    console.log(chalk.green(`\n✅ Created ${projectName}`));

    // Initialize git
    if (!options.skipGit) {
      try {
        execSync('git init', { cwd: projectPath, stdio: 'ignore' });
        console.log(chalk.green('✅ Initialized git repository'));
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not initialize git repository'));
      }
    }

    // Install dependencies
    if (!options.skipInstall) {
      console.log(chalk.blue('\n📦 Installing dependencies...'));
      try {
        execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
        console.log(chalk.green('✅ Dependencies installed'));
      } catch (error) {
        console.error(chalk.red('❌ Failed to install dependencies'));
        console.error(chalk.yellow('You can install them manually with: npm install'));
      }
    }

    // Success message
    console.log(chalk.green('\n🎉 Success! Your Tensorify plugin is ready.'));
    console.log('\nNext steps:');
    console.log(chalk.cyan(`  cd ${projectName}`));
    if (options.skipInstall) {
      console.log(chalk.cyan('  npm install'));
    }
    console.log(chalk.cyan('  npm test'));
    console.log(chalk.cyan('  npm run build'));
    console.log('\nHappy coding! 🚀');

  } catch (error) {
    console.error(chalk.red('\n❌ Error creating plugin:'), error.message);
    process.exit(1);
  }
}

async function copyTemplate(templateName, targetPath, variables) {
  const templatePath = path.join(__dirname, 'templates', templateName);
  
  if (!fs.existsSync(templatePath)) {
    console.error(chalk.red(`Template ${templateName} not found`));
    process.exit(1);
  }

  // Copy template files
  await fs.copy(templatePath, targetPath);

  // Process template variables in specific files
  const filesToProcess = ['package.json', 'README.md', 'src/index.js'];
  
  for (const file of filesToProcess) {
    const filePath = path.join(targetPath, file);
    if (fs.existsSync(filePath)) {
      let content = await fs.readFile(filePath, 'utf8');
      
      // Replace template variables
      content = content
        .replace(/{{projectName}}/g, variables.projectName)
        .replace(/{{description}}/g, variables.description)
        .replace(/{{author}}/g, variables.author)
        .replace(/{{year}}/g, new Date().getFullYear().toString());
      
      await fs.writeFile(filePath, content);
    }
  }
}

program.parse(); 