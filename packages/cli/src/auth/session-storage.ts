import * as keytar from "keytar";

const SERVICE_NAME = "tensorify-cli";
const ACCOUNT_NAME = "session";
const CONFIG_ACCOUNT_NAME = "config";

interface CLIConfig {
  isDev?: boolean;
  lastUsedEnv?: "dev" | "prod";
}

class SessionStorage {
  async storeSession(sessionToken: string): Promise<void> {
    try {
      await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, sessionToken);
    } catch (error) {
      throw new Error(
        `Failed to store session: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getSession(): Promise<string | null> {
    try {
      return await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    } catch (error) {
      throw new Error(
        `Failed to retrieve session: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async clearSession(): Promise<void> {
    try {
      await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
    } catch (error) {
      throw new Error(
        `Failed to clear session: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async hasSession(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return session !== null;
    } catch (error) {
      return false;
    }
  }

  async storeConfig(config: CLIConfig): Promise<void> {
    try {
      await keytar.setPassword(
        SERVICE_NAME,
        CONFIG_ACCOUNT_NAME,
        JSON.stringify(config)
      );
    } catch (error) {
      throw new Error(
        `Failed to store config: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getConfig(): Promise<CLIConfig> {
    try {
      const configString = await keytar.getPassword(
        SERVICE_NAME,
        CONFIG_ACCOUNT_NAME
      );
      if (!configString) {
        return {};
      }
      return JSON.parse(configString);
    } catch (error) {
      return {};
    }
  }

  async updateConfig(updates: Partial<CLIConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    const newConfig = { ...currentConfig, ...updates };
    await this.storeConfig(newConfig);
  }
}

export const sessionStorage = new SessionStorage();

/**
 * Get the current authentication token
 */
export async function getAuthToken(): Promise<string | null> {
  // In development, check for test token first
  if (
    process.env.NODE_ENV === "development" &&
    process.env.TENSORIFY_TEST_TOKEN
  ) {
    return process.env.TENSORIFY_TEST_TOKEN;
  }

  return await sessionStorage.getSession();
}

/**
 * Get the current CLI configuration
 */
export async function getConfig(): Promise<CLIConfig> {
  return await sessionStorage.getConfig();
}

/**
 * Update CLI configuration
 */
export async function updateConfig(updates: Partial<CLIConfig>): Promise<void> {
  return await sessionStorage.updateConfig(updates);
}
