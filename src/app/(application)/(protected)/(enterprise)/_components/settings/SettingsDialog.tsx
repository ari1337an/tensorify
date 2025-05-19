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
import useStore from "@/app/_store/store"; // Import the Zustand store

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
  RBACView,
  RBACIcon,
  useRBACMeta,
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
  organization: SectionItem[];
};

export function SettingsDialog() {
  const { isOpen, closeSettings } = useSettingsDialog();
  const [activeSection, setActiveSection] = React.useState("account");
  const currentOrg = useStore((state) => state.currentOrg); // Get currentOrg from store

  // Use the new meta hooks
  const accountMeta = useAccountMeta();
  const preferencesMeta = usePreferencesMeta();
  const generalMeta = useGeneralMeta();
  const peopleMeta = usePeopleMeta();
  const teamspacesMeta = useTeamspacesMeta();
  const rbacMeta = useRBACMeta();

  const sections: SectionsType & { accessControl: SectionItem[] } = {
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
    organization: [
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
    ],
    accessControl: [
      {
        id: rbacMeta.id,
        label: rbacMeta.label,
        icon: RBACIcon,
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
        if (!currentOrg?.id) {
          return (
            <div className="p-4 text-muted-foreground">
              Organization not selected or available.
            </div>
          );
        }
        return <PeopleView organizationId={currentOrg.id} />;
      case "teamspaces":
        return <TeamspacesView />;
      case "rbac":
        return <RBACView />;
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

              {/* Organization Section */}
              <div className="space-y-1 mt-6">
                <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Organization
                </h3>
                <nav>
                  {sections.organization.map((section) => (
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

              {/* Access Control Section */}
              <div className="space-y-1 mt-6">
                <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Access Control
                </h3>
                <nav>
                  {sections.accessControl.map((section) => (
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
