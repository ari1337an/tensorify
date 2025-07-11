#!/usr/bin/env node

import { program } from "commander";
import { loginCommand } from "../commands/login";
import { logoutCommand } from "../commands/logout";
import { whoamiCommand } from "../commands/whoami";
import { publishCommand } from "../commands/publish";
import chalk from "chalk";

// Set up the CLI program
program
  .name("tensorify")
  .description(
    "Official CLI for Tensorify.io - Build, test, and deploy Tensorify plugins"
  )
  .version("0.0.1", "-v, --version", "Show version number");

// Add commands
program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(whoamiCommand);
program.addCommand(publishCommand);

// Global error handling
program.exitOverride();

// Enhanced error handling with better debugging and user guidance
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red("\n❌ Unhandled Rejection at:"), promise);
  console.error(chalk.red("Reason:"), reason);
  console.error(chalk.yellow("\n💡 This appears to be an unexpected error. Please try again."));
  console.error(chalk.gray("If the problem persists, please report this issue to the Tensorify team."));
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red("\n❌ Uncaught Exception:"), error.message);
  console.error(chalk.yellow("\n💡 This appears to be an unexpected error. Please try again."));
  console.error(chalk.gray("If the problem persists, please report this issue to the Tensorify team."));
  process.exit(1);
});

try {
  program.parse();
} catch (err: any) {
  if (err.code !== "commander.version" && err.code !== "commander.help") {
    console.error(chalk.red("\n❌ CLI Error:"), err.message);
    
    // Provide helpful suggestions based on error type
    if (err.message.includes("Unknown command")) {
      console.error(chalk.yellow("\n💡 Did you mean one of these commands?"));
      console.error(chalk.gray("  • tensorify login    - Authenticate with Tensorify"));
      console.error(chalk.gray("  • tensorify publish  - Publish a plugin"));
      console.error(chalk.gray("  • tensorify whoami   - Check current user"));
      console.error(chalk.gray("  • tensorify logout   - Sign out"));
      console.error(chalk.gray("\nRun 'tensorify --help' for more information."));
    }
    
    process.exit(1);
  }
}
