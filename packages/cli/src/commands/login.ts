import { Command } from "commander";
import chalk from "chalk";
import { authService } from "../auth/auth-service";
import { updateConfig } from "../auth/session-storage";

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

      // Save development environment preference
      await updateConfig({
        isDev,
        lastUsedEnv: isDev ? "dev" : "prod",
      });

      if (isDev) {
        console.log(
          chalk.green(
            "✅ Successfully authenticated with development environment!"
          )
        );
        console.log(
          chalk.blue(
            "ℹ️  Development environment will be used for subsequent commands"
          )
        );
      } else {
        console.log(chalk.green("✅ Successfully authenticated!"));
      }
    } catch (error: any) {
      console.error(chalk.red("❌ Authentication failed:"), error.message);
      process.exit(1);
    }
  });
