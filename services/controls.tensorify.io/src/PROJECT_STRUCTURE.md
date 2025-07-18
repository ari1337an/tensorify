# Controls App Architecture

A standalone Next.js-based control panel that serves as the centralized brain for managing onboarding journeys, A/B tests, feature flags, and personalized user experiences—entirely decoupled from product repositories. This platform enables dynamic configuration and experimentation without requiring code changes or redeployments in the main applications. It empowers non-technical stakeholders to define onboarding flows, push feature rollouts, manage UI variants (e.g., landing page hero sections), and track performance metrics in real time, effectively functioning as a headless experience orchestration engine for modern B2B SaaS systems.

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
      - `index.ts` - Export file for navbar components.
    - `sidebar/` - Components for the application sidebar navigation.
      - `Sidebar.tsx` - Main sidebar container with team switcher and navigation sections.
      - `SidebarContext.tsx` - Context provider for sidebar state management (open/closed).
      - `MenuItem.tsx` - Reusable component for sidebar menu items with icons and counters.
      - `ProjectsSection.tsx` - Projects list section in the sidebar with project items.
      - `TeamSelector.tsx` - Team/organization selection dropdown in the sidebar header.
      - `SidebarFooter.tsx` - Footer component for the sidebar with additional functionality.
      - `index.ts` - Export file for sidebar components.
    - `dialog/` - Modal dialog components for various enterprise functions.
      - `index.ts` - Export file for dialog components.
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
  - `radio-group.tsx` - Radio button group for exclusive selection.
  - `select.tsx` - Select/dropdown component for choosing from options.
  - `separator.tsx` - Visual separator component for dividing content.
  - `sheet.tsx` - Side sheet/drawer component for additional content.
  - `skeleton.tsx` - Skeleton loading component for content placeholders.
  - `slider.tsx` - Slider component for selecting numeric values.
  - `switch.tsx` - Toggle switch component for boolean settings.
  - `table.tsx` - Table component for displaying structured data.
  - `tabs.tsx` - Tabs component for switching between content views.
  - `textarea.tsx` - Multi-line text input component.
  - `toast.tsx` - Toast notification component for transient messages.
  - `theme-toggle.tsx` - Toggles the theme in the UI using a button
  - `toggle-group.tsx` - Group of toggleable buttons for multi-selection.
  - `toggle.tsx` - Toggle button component for pressed/unpressed state.
  - `tooltip.tsx` - Tooltip component for showing additional information on hover.
  - `logo.tsx` - Tensorify official logo

### Server Components

- `src/server/` - Server-side code for data handling and business logic.
  - `database/` - Database connection and schema definitions.
    - `db.ts` - Database client configuration and connection setup.
  - `roles/` - Authorization and permission management.
    - `hasPermission.ts` - Permission checking logic for user actions and resources.

## Architecture Notes

### Layout Structure

The application uses a nested layout structure to compose the UI:

1. **Root Layout (`src/app/layout.tsx`)**

   - Sets up fonts, metadata, and global styles
   - Provides the HTML and body structure with theme provider

2. **Protected Layout (`src/app/(protected)/layout.tsx`)**

   - Wraps the entire protected application in the enterprise `AppWrapper`
   - Provides authentication context with ClerkProvider
   - Sets up React Query client
   - Provides sidebar context

3. **Enterprise AppWrapper (`src/app/(protected)/(enterprise)/_components/layout/AppWrapper.tsx`)**

   - Provides authentication context with ClerkProvider
   - Sets up React Query client
   - Provides sidebar context
   - Wraps content in AppLayout

4. **Enterprise AppLayout (`src/app/(protected)/(enterprise)/_components/layout/AppLayout.tsx`)**

   - Handles the two-column layout (sidebar + content)
   - Manages sidebar state (open/closed)
   - Animates sidebar opening and closing
   - Syncs user data with global store

5. **MainContent (`src/app/(protected)/(enterprise)/_components/layout/MainContent.tsx`)**

   - Renders the navbar
   - Contains the main content area for the page

This nested structure allows the canvas component to be rendered within the enterprise UI shell while keeping the code organized in separate directories. The parentheses in folder names (e.g., `(protected)`, `(enterprise)`, `(canvas)`) create route groups that don't affect the URL path, enabling logical separation of code without changing the routing.

Key design features:

- Root layout provides only basic HTML structure and theme
- Protected layout ensures authentication for all protected routes
- Enterprise components provide the application shell (sidebar, navbar, etc.)
- Canvas components focus solely on the workflow editor functionality
- All components are connected through the layout hierarchy
- UI components from shadcn/ui are shared across all domains

## Responsibility Separation

### Protected Routes

Handles all authenticated and protected features:

- User authentication and access control
- Enterprise features
- Canvas functionality

### Enterprise Section

Handles all enterprise features such as:

- User authentication and management
- Team/organization management
- Navigation and sidebar
- Project management
- Workspace settings and configuration

### Canvas Section

Focused on the visual workflow editor:

- Workflow canvas implementation
- Node and edge management
- Workflow execution
- Canvas-specific state management

## Development Guidelines

1. Protected features should be developed within the `(protected)` folder
2. Enterprise features should be developed within the `(protected)/(enterprise)` folder
3. Canvas features should be developed within the `(protected)/(canvas)` folder
5. Shared utilities and types can be placed in the root directories
6. Maintain separation of concerns between protected, enterprise, canvas, and onboarding
7. UI components should be in `components/ui/`