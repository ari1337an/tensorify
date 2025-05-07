"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { useSettingsDialog } from "./context/SettingsContext";
import { cn } from "@/app/_lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Import from the new modular structure
import {
  AccountView,
  AccountIcon,
  useAccountMeta,
  PreferencesView,
  PreferencesIcon,
  usePreferencesMeta,
  GeneralView,
  GeneralIcon,
  useGeneralMeta,
  PeopleView,
  PeopleIcon,
  usePeopleMeta,
  TeamspacesView,
  TeamspacesIcon,
  useTeamspacesMeta,
  SecurityView,
  SecurityIcon,
  useSecurityMeta,
  IdentityView,
  IdentityIcon,
  useIdentityMeta,
} from "./group";

// Types for sections
type IconComponent = React.FC<{ className?: string }>;

type SectionItem = {
  id: string;
  label: string;
  icon: IconComponent;
};

type SectionsType = {
  account: SectionItem[];
  workspace: SectionItem[];
};

export function SettingsDialog() {
  const { isOpen, closeSettings } = useSettingsDialog();
  const [activeSection, setActiveSection] = React.useState("account");

  // Use the new meta hooks
  const accountMeta = useAccountMeta();
  const preferencesMeta = usePreferencesMeta();
  const generalMeta = useGeneralMeta();
  const peopleMeta = usePeopleMeta();
  const teamspacesMeta = useTeamspacesMeta();
  const securityMeta = useSecurityMeta();
  const identityMeta = useIdentityMeta();

  const sections: SectionsType = {
    account: [
      {
        id: accountMeta.id,
        label: accountMeta.label,
        icon: AccountIcon,
      },
      {
        id: preferencesMeta.id,
        label: preferencesMeta.label,
        icon: PreferencesIcon,
      },
    ],
    workspace: [
      {
        id: generalMeta.id,
        label: generalMeta.label,
        icon: GeneralIcon,
      },
      {
        id: peopleMeta.id,
        label: peopleMeta.label,
        icon: PeopleIcon,
      },
      {
        id: teamspacesMeta.id,
        label: teamspacesMeta.label,
        icon: TeamspacesIcon,
      },
      {
        id: securityMeta.id,
        label: securityMeta.label,
        icon: SecurityIcon,
      },
      {
        id: identityMeta.id,
        label: identityMeta.label,
        icon: IdentityIcon,
      },
    ],
  };

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return <AccountView />;
      case "preferences":
        return <PreferencesView />;
      case "general":
        return <GeneralView />;
      case "people":
        return <PeopleView />;
      case "teamspaces":
        return <TeamspacesView />;
      case "security":
        return <SecurityView />;
      case "identity":
        return <IdentityView />;
      default:
        return <div className="text-muted-foreground">Coming soon</div>;
    }
  };

  // Render icon helper function
  const renderIcon = (IconComponent: IconComponent) => {
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeSettings();
      }}
    >
      <DialogContent className="sm:max-w-6xl p-0 gap-0">
        <VisuallyHidden>
          <DialogTitle>Settings</DialogTitle>
        </VisuallyHidden>
        <div className="flex h-[85vh]">
          {/* Left Sidebar */}
          <div className="w-64 border-r border-border/10 bg-muted/50">
            <div className="px-2 py-4">
              {/* Account Section */}
              <div className="space-y-1">
                <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Account
                </h3>
                <nav>
                  {sections.account.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      aria-current={
                        activeSection === section.id ? "page" : undefined
                      }
                      type="button"
                      aria-label={`${section.label} settings`}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                        activeSection === section.id
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50"
                      )}
                    >
                      {renderIcon(section.icon)}
                      <span>{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Workspace Section */}
              <div className="space-y-1 mt-6">
                <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Workspace
                </h3>
                <nav>
                  {sections.workspace.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      aria-current={
                        activeSection === section.id ? "page" : undefined
                      }
                      type="button"
                      aria-label={`${section.label} settings`}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                        activeSection === section.id
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50"
                      )}
                    >
                      {renderIcon(section.icon)}
                      <span>{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
