import chalk from "chalk";
import { sessionStorage } from "./session-storage";
import { urlGenerator } from "../utils/url-generator";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { URL } from "url";

class AuthService {
  constructor() {
    // Future: Initialize Clerk client when needed
  }

  async login(isDev: boolean = false): Promise<void> {
    try {
      console.log(chalk.yellow("🌐 Setting up authentication flow..."));

      // Create a callback server to handle the redirect
      const callbackServer = await this.createCallbackServer();
      const { port, server } = callbackServer;

      // Generate the callback URL
      const callbackUrl = urlGenerator.getCallbackUrl(isDev, port);

      // Generate the sign-in URL with redirect
      const signInUrl = urlGenerator.getSignInUrl(isDev, callbackUrl);

      console.log(chalk.blue("📋 Authentication URL:"), signInUrl);
      console.log(
        chalk.yellow(
          "🔗 If the browser doesn't open automatically, copy and paste the URL above."
        )
      );

      // Try to open the browser
      try {
        const open = (await import('open')).default;
        await open(signInUrl);
        console.log(chalk.green("🌍 Opening browser for authentication..."));
      } catch (error) {
        console.log(
          chalk.yellow(
            "⚠️  Could not open browser automatically. Please open the URL manually."
          )
        );
      }

      // Wait for the callback
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          server.close();
          reject(new Error("Authentication timeout. Please try again."));
        }, 300000); // 5 minute timeout

        server.on("request", async (req: IncomingMessage, res: ServerResponse) => {
          try {
            const url = new URL(req.url!, `http://localhost:${port}`);

            if (url.pathname === "/callback") {
              const sessionToken = url.searchParams.get("session");

              if (sessionToken) {
                // Store the session
                await sessionStorage.storeSession(sessionToken);

                // Send success response
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(`
                  <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                      <h1 style="color: green;">✅ Authentication Successful!</h1>
                      <p>You can now close this window and return to your terminal.</p>
                      <script>setTimeout(() => window.close(), 3000);</script>
                    </body>
                  </html>
                `);

                clearTimeout(timeout);
                server.close();
                resolve();
              } else {
                throw new Error("No session token received");
              }
            } else {
              res.writeHead(404);
              res.end("Not found");
            }
          } catch (error) {
            console.error("Callback error:", error);
            res.writeHead(500);
            res.end("Internal server error");
            clearTimeout(timeout);
            server.close();
            reject(error);
          }
        });
      });
    } catch (error) {
      throw new Error(
        `Authentication failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async logout(): Promise<void> {
    try {
      await sessionStorage.clearSession();
      console.log(chalk.green("✅ Successfully logged out"));
    } catch (error) {
      throw new Error(
        `Logout failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await sessionStorage.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  async getSession(): Promise<string | null> {
    try {
      return await sessionStorage.getSession();
    } catch (error) {
      return null;
    }
  }

  private async createCallbackServer(): Promise<{ port: number; server: any }> {
    return new Promise((resolve, reject) => {
      const server = createServer();

      server.listen(0, "localhost", () => {
        const address = server.address();
        if (address && typeof address === "object") {
          resolve({ port: address.port, server });
        } else {
          reject(new Error("Failed to start callback server"));
        }
      });

      server.on("error", reject);
    });
  }
}

export const authService = new AuthService();
