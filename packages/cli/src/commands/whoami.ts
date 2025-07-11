import { Command } from "commander";
import chalk from "chalk";
import { authService } from "../auth/auth-service";
import { getConfig } from "../auth/session-storage";

export const whoamiCommand = new Command("whoami")
  .description("Display current logged-in user information")
  .option("-d, --dev", "Use development environment")
  .action(async (options) => {
    try {
      // Check if user is authenticated
      const isAuthenticated = await authService.isAuthenticated();
      if (!isAuthenticated) {
        console.log(chalk.red("❌ Not logged in."));
        console.log(chalk.yellow("💡 Run 'tensorify login' to authenticate."));
        process.exit(1);
      }

      console.log(chalk.blue("🔍 Fetching user profile..."));

      // Determine if we should use dev environment
      // Priority: explicit --dev flag > saved config > NODE_ENV
      let isDev = options.dev;
      if (isDev === undefined) {
        const config = await getConfig();
        isDev = config.isDev || process.env.NODE_ENV === "development";
      }

      if (isDev) {
        console.log(chalk.cyan("🔧 Using development environment"));
      }

      // Fetch user profile from plugins.tensorify.io API
      const userProfile = await authService.getUserProfile(isDev);

      // Display user information in a formatted way
      console.log("\n" + chalk.green("👤 User Profile"));
      console.log(chalk.gray("═".repeat(50)));

      console.log(`${chalk.cyan("ID:")}\t\t${userProfile.id}`);
      console.log(
        `${chalk.cyan("Full Name:")}\t${
          userProfile.fullName || chalk.gray("Not set")
        }`
      );
      console.log(`${chalk.cyan("Email:")}\t\t${userProfile.email}`);

      console.log(chalk.gray("═".repeat(50)));
      console.log(chalk.green("✅ Successfully retrieved user profile!"));
    } catch (error: any) {
      console.error(chalk.red("❌ Failed to get user profile:"), error.message);

      if (error.message.includes("No session token found")) {
        console.log(chalk.yellow("💡 Run 'tensorify login' to authenticate."));
      } else if (
        error.message.includes("Unauthorized") ||
        error.message.includes("401")
      ) {
        console.log(
          chalk.yellow(
            "💡 Your session may have expired. Try 'tensorify login' again."
          )
        );
      }

      process.exit(1);
    }
  });
