# Tensorify App Architecture

The application is structured using route groups for logical code organization without affecting URL paths. This architecture separates concerns between enterprise features, canvas functionality, and onboarding flows while maintaining a cohesive UI.

## Directory Structure

### Root Structure

- `src/app/` - Root app directory containing all app code and routing structure.
  - `layout.tsx` - Main layout that defines page structure, fonts, and theme provider.
  - `globals.css` - Global CSS styles including Tailwind directives and custom variables.
  - `middleware.ts` - Auth middleware for protected routes, handling authentication with Clerk.

### Protected Routes

- `src/app/(protected)/` - Route group for authenticated and protected features.
  - `layout.tsx` - Protected layout that wraps content with the enterprise AppWrapper.
  - `page.tsx` - Main page component that renders the canvas as the home page of the application.
  - `(enterprise)/` - Route group for enterprise features separated for code organization.
  - `(canvas)/` - Route group for canvas features focused on the workflow editor.

### Enterprise Features

- `src/app/(protected)/(enterprise)/` - Route group for enterprise features separated for code organization.
  - `_components/` - Contains all enterprise-specific components organized by feature area.
    - `layout/` - Components defining the application layout structure and shell.
      - `AppWrapper.tsx` - Top-level component that wraps the app with providers (Auth, Query, etc).
      - `AppLayout.tsx` - Handles the main layout with sidebar, animations, and user state sync.
      - `MainContent.tsx` - Renders navbar and main content area with proper flex layout.
      - `index.ts` - Export file for layout components to facilitate clean imports.
    - `navbar/` - Components for the top application navigation bar.
      - `Navbar.tsx` - Container component for the app's top navigation bar.
      - `NavbarLeft.tsx` - Left section of navbar with menu toggle and other controls.
      - `NavbarRight.tsx` - Right section of navbar with user controls, sharing, and export options.
      - `Breadcrumb.tsx` - Displays current navigation path within the application.
      - `CollaboratorAvatars.tsx` - Shows avatars of active collaborators with status indicators.
      - `index.ts` - Export file for navbar components.
    - `sidebar/` - Components for the application sidebar navigation.
      - `Sidebar.tsx` - Main sidebar container with team switcher and navigation sections.
      - `SidebarContext.tsx` - Context provider for sidebar state management (open/closed).
      - `MenuItem.tsx` - Reusable component for sidebar menu items with icons and counters.
      - `ProjectsSection.tsx` - Projects list section in the sidebar with project items.
      - `DraftWorkflowsSection.tsx` - Displays draft workflows section with create button.
      - `SettingsSection.tsx` - Settings and admin links section of the sidebar with access to settings dialog.
      - `TeamSelector.tsx` - Team/organization selection dropdown in the sidebar header with settings button to open settings dialog.
      - `SidebarFooter.tsx` - Footer component for the sidebar with additional functionality.
      - `InviteFooter.tsx` - Footer component with team invitation functionality.
      - `index.ts` - Export file for sidebar components.
    - `dialog/` - Modal dialog components for various enterprise functions.
      - `ProjectDialog.tsx` - Dialog for creating and editing projects with form validation.
      - `TeamDialog.tsx` - Dialog for team/organization management with member controls.
      - `DraftWorkflowDialog.tsx` - Dialog for creating and managing draft workflows.
      - `ExportDialog.tsx` - Dialog for displaying generated code with copy functionality.
      - `ExportDialog.module.css` - CSS module for the export dialog styling.
      - `ShareDialog.tsx` - Dialog for sharing projects and workflows with other users.
      - `index.ts` - Export file for dialog components.
    - `settings/` - Settings module for managing user preferences.
      - `SettingsDialog.tsx` - Main settings dialog component with section navigation.
      - `index.ts` - Export file for settings components.
      - `context/` - Settings state management.
        - `SettingsContext.tsx` - Context provider for settings state. Now integrates with next-themes to update the app theme when themePreference changes.
      - `types/` - Settings type definitions.
        - `settings.types.ts` - Types and interfaces for settings state.
      - `sections/` - Individual settings section components.
        - `AppearanceSection.tsx` - Theme and appearance settings.
        - `LanguageTimeSection.tsx` - Language, timezone, and calendar settings.
        - `DesktopSection.tsx` - Desktop app specific settings.
  - `_hooks/` - Custom React hooks for enterprise feature functionality.
    - `use-mobile.ts` - Hook for detecting mobile viewport and responsive behavior.
    - `index.ts` - Export file for enterprise hooks.
  - `_lib/` - Utility functions and helpers for enterprise features.
    - `utils.ts` - General utility functions including class name merging with cn function.
  - `_store/` - State management for enterprise data and UI state.
    - `store.ts` - Zustand store for enterprise global state management including user data.
  - `sign-in/` - Authentication related pages and components.
    - `page.tsx` - Sign-in page with authentication UI handled by Clerk.

### Canvas Features

- `src/app/(protected)/(canvas)/` - Route group for canvas features focused on the workflow editor.
  - `_components/` - React components specific to the canvas/workflow editor.
    - `CanvasRoot.tsx` - Main server component canvas root that extracts organization slug from URL (port-agnostic in development mode) and displays workflow canvas.
    - `index.ts` - Export file for canvas components, exports the CanvasRoot component.
  - `_hooks/` - Custom React hooks for canvas specific functionality.
    - `use-canvas.ts` - Hook for canvas initialization and core functionality.
    - `index.ts` - Export file for canvas hooks.
  - `_lib/` - Utility functions for canvas operations.
    - `utils.ts` - Canvas-specific utility functions for rendering and data handling.
  - `_store/` - State management for canvas data and UI state.
    - `store.ts` - Zustand store for canvas state including nodes, edges, and selection.

### Onboarding Routes

- `src/app/(onboarding)/` - Route group for user onboarding flows.
  - `layout.tsx` - Layout for onboarding pages.
  - `onboarding/` - Components and pages for the onboarding process.
    - `layout.tsx` - Layout specific to the onboarding process.
    - `page.tsx` - Main onboarding page with multi-step form.
    - `_components/` - Components specific to the onboarding flow.
      - `OnboardingSource.tsx` - Component for collecting how users discovered Tensorify.
      - `OnboardingOrg.tsx` - Component for organization name and slug setup.
      - `OnboardingSetup.tsx` - Loading component for workspace setup process.

### UI Components

- `src/app/_components/ui/` - Shadcn UI components reused across the application.
  - `accordion.tsx` - Expandable accordion component for collapsible content sections.
  - `alert-dialog.tsx` - Alert dialog component for important notifications requiring action.
  - `alert.tsx` - Alert component for status messages and notifications.
  - `avatar.tsx` - Avatar component for user profile pictures with fallback support.
  - `button.tsx` - Versatile button component with multiple variants and states.
  - `calendar.tsx` - Calendar component for date selection and display.
  - `card.tsx` - Card component for containing related information with header/footer.
  - `checkbox.tsx` - Checkbox input component with custom styling and states.
  - `collapsible.tsx` - Collapsible component for hiding/showing content.
  - `command.tsx` - Command palette component for keyboard-centric navigation.
  - `dialog.tsx` - Modal dialog component for displaying content over the app.
  - `dropdown-menu.tsx` - Dropdown menu component for navigation and actions.
  - `form.tsx` - Form components with validation integration via react-hook-form.
  - `input-otp.tsx` - One-time password input for verification codes.
  - `input.tsx` - Text input component with consistent styling.
  - `label.tsx` - Form label component with proper accessibility.
  - `menubar.tsx` - Menu bar component for application menus and submenus.
  - `navigation-menu.tsx` - Navigation component for main app navigation.
  - `popover.tsx` - Popover component for tooltips and floating content.
  - `progress.tsx` - Progress indicator component for loading and completion status.
  - `radio-group.tsx`
