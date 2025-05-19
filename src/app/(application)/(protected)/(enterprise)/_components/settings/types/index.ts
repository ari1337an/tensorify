export interface SettingsState {
  themePreference: "system" | "light" | "dark";
  timezone?: string;
  openInDesktop: boolean;
  showViewHistory: boolean;
  profileDiscoverable: boolean;
}
