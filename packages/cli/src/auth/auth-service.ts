import chalk from "chalk";
import { sessionStorage } from "./session-storage";
import { urlGenerator } from "../utils/url-generator";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import open from "open";

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

        server.on(
          "request",
          async (req: IncomingMessage, res: ServerResponse) => {
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
                  <!DOCTYPE html>
                  <html lang="en">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Tensorify CLI - Authentication Success</title>
                      <style>
                        * {
                          margin: 0;
                          padding: 0;
                          box-sizing: border-box;
                        }
                        
                        body {
                          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
                          color: #ffffff;
                          min-height: 100vh;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          overflow: hidden;
                          position: relative;
                        }
                        
                        /* Animated background particles */
                        .particles {
                          position: absolute;
                          top: 0;
                          left: 0;
                          width: 100%;
                          height: 100%;
                          overflow: hidden;
                          z-index: 1;
                        }
                        
                        .particle {
                          position: absolute;
                          width: 4px;
                          height: 4px;
                          background: linear-gradient(45deg, #8b5cf6, #06b6d4);
                          border-radius: 50%;
                          animation: float 6s ease-in-out infinite;
                          opacity: 0.7;
                        }
                        
                        @keyframes float {
                          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
                          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
                        }
                        
                        .container {
                          text-align: center;
                          z-index: 10;
                          position: relative;
                          max-width: 500px;
                          padding: 40px;
                          background: rgba(255, 255, 255, 0.05);
                          backdrop-filter: blur(20px);
                          border-radius: 24px;
                          border: 1px solid rgba(255, 255, 255, 0.1);
                          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
                          animation: slideIn 0.6s ease-out;
                        }
                        
                        @keyframes slideIn {
                          from {
                            opacity: 0;
                            transform: translateY(30px) scale(0.95);
                          }
                          to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                          }
                        }
                        
                        .logo {
                          width: 80px;
                          height: 80px;
                          margin: 0 auto 30px;
                          background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
                          border-radius: 20px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 36px;
                          font-weight: bold;
                          color: white;
                          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
                          animation: pulse 2s ease-in-out infinite;
                        }
                        
                        @keyframes pulse {
                          0%, 100% { transform: scale(1); box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3); }
                          50% { transform: scale(1.05); box-shadow: 0 15px 40px rgba(139, 92, 246, 0.5); }
                        }
                        
                        .success-icon {
                          font-size: 64px;
                          margin-bottom: 20px;
                          animation: checkmark 0.8s ease-in-out 0.3s both;
                        }
                        
                        @keyframes checkmark {
                          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
                          50% { transform: scale(1.2) rotate(-45deg); opacity: 1; }
                          100% { transform: scale(1) rotate(0deg); opacity: 1; }
                        }
                        
                        h1 {
                          font-size: 32px;
                          font-weight: 700;
                          margin-bottom: 16px;
                          background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
                          -webkit-background-clip: text;
                          -webkit-text-fill-color: transparent;
                          background-clip: text;
                          animation: fadeInUp 0.8s ease-out 0.2s both;
                        }
                        
                        .subtitle {
                          font-size: 18px;
                          color: #94a3b8;
                          margin-bottom: 30px;
                          line-height: 1.6;
                          animation: fadeInUp 0.8s ease-out 0.4s both;
                        }
                        
                        .status-badge {
                          display: inline-flex;
                          align-items: center;
                          gap: 8px;
                          background: rgba(34, 197, 94, 0.1);
                          color: #22c55e;
                          padding: 12px 24px;
                          border-radius: 50px;
                          font-weight: 600;
                          font-size: 16px;
                          border: 1px solid rgba(34, 197, 94, 0.2);
                          animation: fadeInUp 0.8s ease-out 0.6s both;
                        }
                        
                        .closing-notice {
                          margin-top: 30px;
                          font-size: 14px;
                          color: #64748b;
                          animation: fadeInUp 0.8s ease-out 0.8s both;
                        }
                        
                        @keyframes fadeInUp {
                          from {
                            opacity: 0;
                            transform: translateY(20px);
                          }
                          to {
                            opacity: 1;
                            transform: translateY(0);
                          }
                        }
                        
                        .progress-bar {
                          width: 100%;
                          height: 4px;
                          background: rgba(255, 255, 255, 0.1);
                          border-radius: 2px;
                          margin-top: 30px;
                          overflow: hidden;
                        }
                        
                        .progress-fill {
                          height: 100%;
                          background: linear-gradient(90deg, #8b5cf6, #06b6d4);
                          border-radius: 2px;
                          width: 0%;
                          animation: fillProgress 3s ease-out forwards;
                        }
                        
                        @keyframes fillProgress {
                          to { width: 100%; }
                        }
                      </style>
                    </head>
                    <body>
                      <div class="particles">
                        <div class="particle" style="left: 10%; animation-delay: 0s;"></div>
                        <div class="particle" style="left: 20%; animation-delay: 1s;"></div>
                        <div class="particle" style="left: 30%; animation-delay: 2s;"></div>
                        <div class="particle" style="left: 40%; animation-delay: 0.5s;"></div>
                        <div class="particle" style="left: 50%; animation-delay: 1.5s;"></div>
                        <div class="particle" style="left: 60%; animation-delay: 2.5s;"></div>
                        <div class="particle" style="left: 70%; animation-delay: 0.8s;"></div>
                        <div class="particle" style="left: 80%; animation-delay: 1.8s;"></div>
                        <div class="particle" style="left: 90%; animation-delay: 2.8s;"></div>
                      </div>
                      
                      <div class="container">
                        <div class="logo">T</div>
                        
                        <div class="success-icon">✅</div>
                        
                        <h1>Authentication Successful!</h1>
                        
                        <p class="subtitle">
                          Welcome to Tensorify CLI! Your authentication has been completed successfully.
                        </p>
                        
                        <div class="status-badge">
                          <span>🔐</span>
                          <span>Securely Connected</span>
                        </div>
                        
                        <p class="closing-notice">
                          This window will close automatically in a few seconds.<br>
                          You can now return to your terminal and start using Tensorify CLI.
                        </p>
                        
                        <div class="progress-bar">
                          <div class="progress-fill"></div>
                        </div>
                      </div>
                      
                      <script>
                        // Add more particles dynamically
                        function createParticle() {
                          const particle = document.createElement('div');
                          particle.className = 'particle';
                          particle.style.left = Math.random() * 100 + '%';
                          particle.style.top = Math.random() * 100 + '%';
                          particle.style.animationDelay = Math.random() * 3 + 's';
                          particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
                          document.querySelector('.particles').appendChild(particle);
                        }
                        
                        // Create additional particles
                        for (let i = 0; i < 15; i++) {
                          setTimeout(createParticle, i * 200);
                        }
                        
                        // Close window after 3 seconds
                        setTimeout(() => {
                          try {
                            window.close();
                          } catch (e) {
                            // Fallback if window.close() fails
                            document.body.innerHTML = '<div style="text-align: center; padding: 50px; color: #64748b;">You can safely close this tab now.</div>';
                          }
                        }, 3000);
                      </script>
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
          }
        );
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

  async getUserProfile(isDev: boolean = false): Promise<any> {
    try {
      // Check for test token first in development
      let sessionToken = null;
      if (
        process.env.NODE_ENV === "development" &&
        process.env.TENSORIFY_TEST_TOKEN
      ) {
        sessionToken = process.env.TENSORIFY_TEST_TOKEN;
      } else {
        sessionToken = await this.getSession();
      }

      if (!sessionToken) {
        throw new Error("No session token found. Please login first.");
      }

      const profileUrl = urlGenerator.getUserProfileUrl(isDev);

      // Use dynamic import for node-fetch to handle ESM compatibility
      let fetchResponse;
      try {
        // Try to use built-in fetch first (Node.js 18+)
        if (typeof globalThis.fetch !== "undefined") {
          fetchResponse = await globalThis.fetch(profileUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionToken}`,
            },
          });
        } else {
          // Fallback to node-fetch with dynamic import
          const { default: fetch } = await import("node-fetch");
          fetchResponse = await fetch(profileUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionToken}`,
            },
          });
        }
      } catch (importError) {
        throw new Error(
          "Failed to load HTTP client. Please ensure you have internet connectivity."
        );
      }

      if (!fetchResponse.ok) {
        throw new Error(
          `Failed to fetch user profile: ${fetchResponse.statusText}`
        );
      }

      const data = (await fetchResponse.json()) as any;
      return data.data; // Return the user profile data
    } catch (error) {
      throw new Error(
        `Failed to get user profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
