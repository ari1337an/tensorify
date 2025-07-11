import { Command } from "commander";
import chalk from "chalk";
import { authService } from "../auth/auth-service";

export const logoutCommand = new Command("logout")
  .description("Sign out of Tensorify.io and clear stored authentication")
  .action(async () => {
    try {
      // Check if user is currently authenticated
      const isAuthenticated = await authService.isAuthenticated();

      if (!isAuthenticated) {
        console.log(chalk.yellow("🔓 You're not currently logged in."));
        console.log(
          chalk.gray(
            "💡 Use 'tensorify login' to authenticate with Tensorify.io"
          )
        );
        return;
      }

      console.log(chalk.blue("🔓 Signing out of Tensorify.io..."));

      // Clear the authentication session
      await authService.logout();

      // Provide success feedback
      console.log(chalk.green("✅ Successfully signed out!"));
      console.log(chalk.gray("💡 Use 'tensorify login' to sign in again"));
    } catch (error: any) {
      console.error(chalk.red("❌ Logout failed:"), error.message);
      console.log(
        chalk.yellow("💡 You may need to manually clear your credentials")
      );
      process.exit(1);
    }
  });
