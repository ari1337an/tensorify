export interface SettingsState {
  startWeekOnMonday: boolean;
  autoSetTimezone: boolean;
  openLinksInDesktop: boolean;
  themePreference: string;
  language: string;
  timezone: string;
  startupPage: string;
}

export const defaultSettings: SettingsState = {
  startWeekOnMonday: true,
  autoSetTimezone: true,
  openLinksInDesktop: true,
  themePreference: "system",
  language: "english",
  timezone: "dhaka",
  startupPage: "last_visited",
};
