class UrlGenerator {
  private getBaseUrl(isDev: boolean): string {
    return isDev ? "http://localhost:3000" : "https://plugins.tensorify.io";
  }

  getSignInUrl(isDev: boolean, redirectUrl: string): string {
    const baseUrl = this.getBaseUrl(isDev);
    const encodedRedirectUrl = encodeURIComponent(redirectUrl);
    return `${baseUrl}/api/cli/auth/callback?redirect_url=${encodedRedirectUrl}`;
  }

  getCallbackUrl(isDev: boolean, port: number): string {
    if (isDev) {
      return `http://localhost:${port}/callback`;
    } else {
      // In production, CLI runs locally, so we always use localhost for the callback
      return `http://localhost:${port}/callback`;
    }
  }

  getApiUrl(isDev: boolean): string {
    return isDev ? "http://localhost:3000" : "https://plugins.tensorify.io";
  }

  getUserProfileUrl(isDev: boolean): string {
    const baseUrl = this.getApiUrl(isDev);
    return `${baseUrl}/api/user/profile`;
  }
}

export const urlGenerator = new UrlGenerator();
