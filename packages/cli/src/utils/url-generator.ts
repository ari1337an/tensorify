class UrlGenerator {
  private getBaseAuthUrl(isDev: boolean): string {
    return isDev ? "http://localhost:3000" : "https://auth.tensorify.io";
  }

  private getBaseCallbackUrl(isDev: boolean): string {
    return isDev ? "http://localhost" : "https://plugin.tensorify.io";
  }

  getSignInUrl(isDev: boolean, redirectUrl: string): string {
    const baseUrl = this.getBaseAuthUrl(isDev);
    const encodedRedirectUrl = encodeURIComponent(redirectUrl);
    return `${baseUrl}/sign-in?redirect_url=${encodedRedirectUrl}`;
  }

  getCallbackUrl(isDev: boolean, port: number): string {
    const baseUrl = this.getBaseCallbackUrl(isDev);

    if (isDev) {
      return `${baseUrl}:${port}/callback`;
    } else {
      // In production, we'll use a specific endpoint for CLI callbacks
      return `${baseUrl}/cli/auth/callback?port=${port}`;
    }
  }

  getApiUrl(isDev: boolean): string {
    return isDev ? "http://localhost:8080" : "https://api.tensorify.io";
  }
}

export const urlGenerator = new UrlGenerator();
