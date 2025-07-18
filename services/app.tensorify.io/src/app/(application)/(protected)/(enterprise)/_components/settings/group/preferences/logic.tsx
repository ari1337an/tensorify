"use client";

import { useSettingsDialog } from "../../context/SettingsContext";
import { useTheme } from "next-themes";

export function usePreferencesLogic() {
  const { settings } = useSettingsDialog();
  const { setTheme } = useTheme();
  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  return {
    settings,
    handleThemeChange,
  };
}

export default usePreferencesLogic;
