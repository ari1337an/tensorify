"use client";

import { useSettingsDialog } from "../../context/SettingsContext";

export function usePreferencesLogic() {
  const { settings, updateSettings } = useSettingsDialog();

  const handleThemeChange = (value: string) => {
    updateSettings("themePreference", value);
  };

  return {
    settings,
    handleThemeChange,
  };
}

export default usePreferencesLogic;
