import { Command } from "commander";
import chalk from "chalk";
import { authService } from "../auth/auth-service";

export const loginCommand = new Command("login")
  .description("Authenticate with Tensorify.io")
  .option("-d, --dev", "Use development environment")
  .action(async (options) => {
    try {
      console.log(
        chalk.blue("🔐 Starting authentication with Tensorify.io...")
      );

      const isDev = options.dev || process.env.NODE_ENV === "development";

      await authService.login(isDev);

      console.log(chalk.green("✅ Successfully authenticated!"));
    } catch (error: any) {
      console.error(chalk.red("❌ Authentication failed:"), error.message);
      process.exit(1);
    }
  });
