#!/usr/bin/env node

import { program } from "commander";
import { loginCommand } from "../commands/login";
import { logoutCommand } from "../commands/logout";
import { whoamiCommand } from "../commands/whoami";
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

// Global error handling
program.exitOverride();

try {
  program.parse();
} catch (err: any) {
  if (err.code !== "commander.version" && err.code !== "commander.help") {
    console.error(chalk.red("Error:"), err.message);
    process.exit(1);
  }
}
