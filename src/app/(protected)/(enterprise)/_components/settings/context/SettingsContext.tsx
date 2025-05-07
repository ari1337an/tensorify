"use client";

import * as React from "react";
import { SettingsState, defaultSettings } from "../types/settings.types";
import { SettingsDialog } from "../SettingsDialog";
import { useTheme } from "next-themes";

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (key: keyof SettingsState, value: unknown) => void;
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

// Create the context with a default value
const SettingsContext = React.createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  isOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
});

export function useSettingsDialog() {
  return React.useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] =
    React.useState<SettingsState>(defaultSettings);
  const [isOpen, setIsOpen] = React.useState(false);
  const { setTheme } = useTheme();

  // Update theme when settings.themePreference changes
  React.useEffect(() => {
    setTheme(settings.themePreference);
  }, [settings.themePreference, setTheme]);

  const updateSettings = React.useCallback(
    (key: keyof SettingsState, value: unknown) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const openSettings = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSettings = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  // Create a memoized context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      settings,
      updateSettings,
      isOpen,
      openSettings,
      closeSettings,
    }),
    [settings, updateSettings, isOpen, openSettings, closeSettings]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
      <SettingsDialog />
    </SettingsContext.Provider>
  );
}
