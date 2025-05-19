export interface SettingsState {
  themePreference: "system" | "light" | "dark";
  timezone: string;
  openInDesktop: boolean;
  showViewHistory: boolean;
  profileDiscoverable: boolean;
}

export const defaultSettings: SettingsState = {
  themePreference: "system",
  timezone: "(GMT+6:00) Dhaka",
  openInDesktop: true,
  showViewHistory: true,
  profileDiscoverable: true,
};
