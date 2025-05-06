"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { useSettingsDialog } from "./context/SettingsContext";
import { AppearanceSection } from "./sections/AppearanceSection";
import { LanguageTimeSection } from "./sections/LanguageTimeSection";
import { DesktopSection } from "./sections/DesktopSection";

export function SettingsDialog() {
  const { isOpen, closeSettings } = useSettingsDialog();
  const [activeSection, setActiveSection] = React.useState("appearance");

  React.useEffect(() => {
    console.log("SettingsDialog mounted, isOpen:", isOpen);
  }, [isOpen]);

  const sections = [
    { id: "appearance", label: "Appearance", icon: "monitor" },
    { id: "language", label: "Language & Time", icon: "globe" },
    { id: "desktop", label: "Desktop app", icon: "laptop" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "appearance":
        return <AppearanceSection />;
      case "language":
        return <LanguageTimeSection />;
      case "desktop":
        return <DesktopSection />;
      default:
        return <AppearanceSection />;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        console.log("Dialog onOpenChange:", open);
        if (!open) closeSettings();
      }}
    >
      <DialogContent className="sm:max-w-6xl p-0 gap-0">
        <div className="flex h-[85vh]">
          {/* Left Sidebar */}
          <div className="w-64 border-r border-border/10 p-4 space-y-2 bg-sidebar">
            <DialogTitle className="px-2 py-3">Settings</DialogTitle>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md transition-colors ${
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span
                    className={`${
                      activeSection === section.id ? "text-primary" : ""
                    }`}
                  >
                    {section.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
