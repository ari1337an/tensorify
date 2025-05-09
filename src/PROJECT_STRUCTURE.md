# Tensorify App Architecture

The application is structured using route groups for logical code organization without affecting URL paths. This architecture separates concerns between enterprise features, canvas functionality, and onboarding flows while maintaining a cohesive UI.

## Directory Structure

### Root Structure

- `src/app/` - Root app directory containing all app code and routing structure.
  - `layout.tsx` - Main layout that defines page structure, fonts, and providers wrapper for theme, user state, and fingerprinting.
  - `globals.css` - Global CSS styles including Tailwind directives and custom variables.
  - `middleware.ts` - Auth middleware for protected routes, handling authentication with Clerk.
  - `api/` - API routes for internal data handling.
    - `onboarding/` - API routes related to onboarding.
      - `route.ts` - Proxy API handler for fetching onboarding questions to avoid CORS issues. Uses `NEXT_PUBLIC_ONBOARDING_TAG` environment variable for configuration and `CONTROLS_BASE_URL` for API endpoint.
      - `responses/` - API routes for submitting onboarding responses.
        - `route.ts` - Proxy API handler for submitting onboarding response data to the external API. Uses `CONTROLS_BASE_URL` environment variable for API endpoint.

### Global Providers

- `src/app/_providers/` - Application-wide providers for shared functionality.
  - `theme-provider.tsx` - Provider for theme management using next-themes.
  - `fingerprint-provider.tsx` - Client component that initializes browser fingerprinting and stores it in global state.
  - `user-provider.tsx` - Client component that syncs Clerk user data with global state for use across the application.
  - `providers-wrapper.tsx` - Client component that wraps multiple providers (ClerkProvider, ThemeProvider, FingerprintProvider, UserProvider) for use in the root layout.

### Protected Routes

- `src/app/(protected)/` - Route group for authenticated and protected features.
  - `layout.tsx` - Protected layout that wraps content with the enterprise AppWrapper and checks if user is onboarded, redirecting to onboarding if needed.
  - `page.tsx` - Main page component that renders the canvas as the home page of the application.
  - `(enterprise)/` - Route group for enterprise features separated for code organization.
  - `(canvas)/` - Route group for canvas features focused on the workflow editor.

### Enterprise Features

- `src/app/(protected)/(enterprise)/` - Route group for enterprise features separated for code organization.
  - `_components/` - Contains all enterprise-specific components organized by feature area.
    - `layout/` - Components defining the application layout structure and shell.
      - `AppWrapper.tsx` - Top-level component that wraps the app with providers (Auth, Query, etc).
      - `AppLayout.tsx` - Handles the main layout with sidebar, animations, and responsive behavior.
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
      - `SettingsDialog.tsx` - Main settings dialog component with section navigation and modern UI design.
      - `index.ts` - Export file for settings components.
      - `context/` - Settings state management.
        - `SettingsContext.tsx` - Context provider for settings state with theme integration.
      - `types/` - Settings type definitions.
        - `settings.types.ts` - Types and interfaces for settings state including account, theme, timezone, and privacy preferences.
        - `index.ts` - Export file for settings types.
      - `group/` - Modular group structure for settings sections.
        - `index.ts` - Export file for all group modules.
        - `account/` - Account management module.
          - `view.tsx` - UI component for the account section.
          - `logic.tsx` - Logic and state management for the account section.
          - `icon.tsx` - Icon component for the account section in the sidebar.
          - `meta.tsx` - Metadata for the account section (label, ID, group).
          - `index.ts` - Export file for the account module.
        - `preferences/` - User preferences module.
          - `view.tsx` - UI component for the preferences section.
          - `logic.tsx` - Logic and state management for the preferences section.
          - `icon.tsx` - Icon component for the preferences section in the sidebar.
          - `meta.tsx` - Metadata for the preferences section (label, ID, group).
          - `index.ts` - Export file for the preferences module.
        - `notifications/` - Notification settings module.
          - `view.tsx` - UI component for the notifications section.
          - `logic.tsx` - Logic and state management for the notifications section.
          - `icon.tsx` - Icon component for the notifications section in the sidebar.
          - `meta.tsx` - Metadata for the notifications section (label, ID, group).
          - `index.ts` - Export file for the notifications module.
        - `general/` - General workspace settings module.
          - `view.tsx` - UI component for the general section.
          - `logic.tsx` - Logic and state management for the general section.
          - `icon.tsx` - Icon component for the general section in the sidebar.
          - `meta.tsx` - Metadata for the general section (label, ID, group).
          - `index.ts` - Export file for the general module.
        - `people/` - People management module.
          - `view.tsx` - UI component for the people section.
          - `logic.tsx` - Logic and state management for the people section.
          - `icon.tsx` - Icon component for the people section in the sidebar.
          - `meta.tsx` - Metadata for the people section (label, ID, group).
          - `index.ts` - Export file for the people module.
        - `identity/` - Identity management module.
          - `view.tsx` - UI component for the identity section.
          - `logic.tsx` - Logic and state management for the identity section.
          - `icon.tsx` - Icon component for the identity section in the sidebar.
          - `meta.tsx` - Metadata for the identity section (label, ID, group).
          - `index.ts` - Export file for the identity module.
        - `security/` - Security settings module.
          - `view.tsx` - UI component for the security section.
          - `logic.tsx` - Logic and state management for the security section.
          - `icon.tsx` - Icon component for the security section in the sidebar.
          - `meta.tsx` - Metadata for the security section (label, ID, group).
          - `index.ts` - Export file for the security module.
        - `teamspaces/` - Teamspaces management module.
          - `view.tsx` - UI component for the teamspaces section.
          - `logic.tsx` - Logic and state management for the teamspaces section.
          - `icon.tsx` - Icon component for the teamspaces section in the sidebar.
          - `meta.tsx` - Metadata for the teamspaces section (label, ID, group).
          - `index.ts` - Export file for the teamspaces module.
  - `settings/` - Settings pages for managing user and workspace preferences.
    - `layout.tsx` - Layout component for settings pages with sidebar navigation, properly typed with LucideIcon type for icon components.
    - `account/` - Account settings pages.
      - `page.tsx` - Account settings page with profile management, security settings, and device management.
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
    - `page.tsx` - Main onboarding page with multi-step form that fetches initial questions from an API using the `NEXT_PUBLIC_ONBOARDING_TAG` environment variable before showing built-in questions. Collects data throughout the process and submits it to the API during the setup phase.
    - `_components/` - Components specific to the onboarding flow.
      - `OnboardingApiQuestion.tsx` - Component for handling API-fetched questions, supporting both single_choice and multi_choice question types.
      - `OnboardingSource.tsx` - Component for collecting how users discovered Tensorify.
      - `OnboardingUsage.tsx` - Component for collecting how users plan to use Tensorify, now with data passing to parent component.
      - `OnboardingFramework.tsx` - Component for selecting ML/DL/AI framework.
      - `OnboardingOrg.tsx` - Component for organization name and slug setup, passes organization data to parent component including organization URL generated from the slug in format `{slug}.app.tensorify.io`.
      - `OnboardingSetup.tsx` - Multi-step process component with proper error handling and retry capability. Processes and submits onboarding data to the API, then calls the account setup function with the organization URL to configure the user's workspace with default organizational structure before redirecting. Includes detailed status updates and allows retrying failed submissions without resetting or reloading.

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
  - `radio-group.tsx` - Radio button group component for selecting options.
  - `select.tsx` - Select dropdown component for choosing from options.
  - `separator.tsx` - Visual separator component for dividing content.
  - `switch.tsx` - Toggle switch component for boolean settings.
  - `table.tsx` - Table component for displaying structured data.
  - `tabs.tsx` - Tab component for organizing content into panels.
  - `textarea.tsx` - Multi-line text input component.
  - `tooltip.tsx` - Tooltip component for displaying additional information.

### Server Actions and Flows

- `src/server/actions/` - Server actions for data manipulation.
  - `onboarding-actions.ts` - Server actions for handling onboarding data submission to the external API.
- `src/server/flows/` - Server-side flows for complex operations.
  - `onboarding/` - Flows related to user onboarding.
    - `setup-account.ts` - Creates a complete account setup with organizational structure in a single transaction, including organization, team, project, and workflow creation with proper access controls. Extracts organization slug from the provided organization URL.
    - `check-onboarded.ts` - Checks if a user is onboarded by verifying they have an organization. Handles redirection to onboarding page if not onboarded, or to the correct organization subdomain if already onboarded but accessing via wrong URL. Supports both production (`{slug}.app.tensorify.io`) and development (`{slug}.localhost:PORT`) environments.

### Database

- `src/server/database/` - Database connection and configuration files.
  - `db.ts` - Database client setup and connection configuration.

### Utility Functions

- `src/app/_utils/` - Utility functions and helpers for the application.
  - `clientFingerprint.ts` - Utility for accessing client browser fingerprints stored in global state. Now with hook-based approach (useClientFingerprint) that accesses the centralized fingerprint data.

### Types Directory

- `src/types/` - Type declarations for external libraries.
  - `clientjs.d.ts` - Type declaration for ClientJS library to fix TypeScript errors and provide type checking.

### Global State Management

- `src/app/_store/` - Global state management for the application.
  - `store.ts` - Zustand store for application-wide state management including user data and client fingerprint for tracking.

### Testing Structure

- `src/__tests__/` - Root test directory containing test files and utilities.
  - `README.md` - Documentation for testing approach and guidelines.
  - `server/` - Tests for server-side functionality.
    - `actions/` - Unit tests for server actions.
      - `test.test.ts` - Test for the simple test server action.
  - `integration/` - Integration tests for testing multiple parts of the application together.
    - `serverActions.test.ts` - Integration tests for server actions, focusing on end-to-end functionality.
  - `utils/` - Utility functions for testing.
    - `serverActionsInterceptor.ts` - Utilities for testing Next.js server actions, providing mocks and interceptors.
    - `setupIntegrationTests.ts` - Setup utilities for integration tests, including environment mocking and test context.
