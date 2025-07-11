import * as keytar from "keytar";

const SERVICE_NAME = "tensorify-cli";
const ACCOUNT_NAME = "session";

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
}

export const sessionStorage = new SessionStorage();
