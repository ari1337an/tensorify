# Tensorify App Architecture

The application is structured using route groups for logical code organization without affecting URL paths. This architecture separates concerns between enterprise features, canvas functionality, and onboarding flows while maintaining a cohesive UI.

## Directory Structure

### Root Structure

- `src/app/` - Root app directory containing all app code and routing structure.
  - `layout.tsx` - Main layout that defines page structure, fonts, and providers wrapper for theme, user state, and fingerprinting.
  - `globals.css` - Global CSS styles including Tailwind directives and custom variables.
  - `middleware.ts` - Auth middleware for protected routes, handling authentication with Clerk.
  - `_utils/` - General utility functions for the application.
    - `getToken.ts` - Placeholder utility function for retrieving authentication tokens. Designed to be replaced with actual token logic (e.g., from Clerk or another auth provider).
  - `api/` - API routes for internal data handling.
    - `onboarding/` - API routes related to onboarding.
      - `route.ts` - Proxy API handler for fetching onboarding questions to avoid CORS issues. Uses `NEXT_PUBLIC_ONBOARDING_TAG` environment variable for configuration and `CONTROLS_BASE_URL` for API endpoint.
      - `responses/` - API routes for submitting onboarding responses.
        - `route.ts` - Proxy API handler for submitting onboarding response data to the external API. Uses `CONTROLS_BASE_URL` environment variable for API endpoint.
    - `send-invite-email.ts` - API route for sending organization invite emails using Resend and React email template.
    - `roles/` - API routes for managing roles and permissions.
      - `route.ts` - API handler for creating and listing roles with CRUD operations.
    - `permissions/` - API routes for managing permissions.
      - `route.ts` - API handler for retrieving permissions data.
    - `v1/` - Version 1 API endpoints using ts-rest framework for type-safe API contracts.
      - `page.tsx` - Swagger UI page for API documentation with dark theme support.
      - `swagger-ui-dark.css` - Dark theme styles for the Swagger UI documentation.
      - `[...ts-rest]/` - Catch-all route for ts-rest API router.
        - `route.ts` - Main ts-rest router handler for all v1 API endpoints.
      - `openapi.json/` - OpenAPI JSON specification generation.
        - `route.ts` - Route handler for generating OpenAPI specification from ts-rest contracts.
      - `_client/` - Client-side utilities for interacting with the v1 API.
        - `client.ts` - Auto-generated TS-REST client (via `scripts/generate-tsrest-client.cjs`) for making type-safe API calls to v1 endpoints. Provides individual functions for each API contract.
      - `_contracts/` - Type-safe API contracts and actions using ts-rest.
        - `index.ts` - Auto-generated main contract router (via `scripts/generate-tsrest-index.cjs`) that combines all API endpoints and their actions including user role assignments.
        - `schema.ts` - Zod schemas for API request/response validation including JWT payload, user types, account schemas, organization schemas, role schemas (AssignRoleRequest, UserRole), and error responses.
        - `auth-utils.ts` - Authentication utilities and middleware for securing API endpoints.
        - `test-utils.ts` - Utilities for testing API endpoints including test server setup and helper functions.
        - `version.json` - API version information file.
        - `account/` - Account management API endpoints.
          - `getaccountuserid.ts` - GET endpoint for retrieving user account information including sessions for authenticated users.
          - `getaccountuserid.test.ts` - Comprehensive tests for the GET account endpoint covering authentication, authorization, and data retrieval scenarios.
          - `patchAccount.ts` - PATCH endpoint for updating user account information (firstName, lastName) and managing sessions with session retention functionality. Supports both Bearer token and cookie authentication, validates request bodies, and handles session revocation while keeping specified sessions active.
          - `patchAccount.test.ts` - Comprehensive test suite for the PATCH account endpoint covering authentication (Bearer token and cookie), authorization, user existence validation, request body validation, profile updates (firstName, lastName), session management (revocation and retention), combined operations, error handling (Clerk API errors, database failures), and edge cases (undefined values, empty strings, special characters, multiple sessions). Includes 24 test cases organized into logical groups with proper setup/teardown and database management.
          - `getTestJwt.ts` - Utility endpoint for generating test JWTs for development and testing purposes.
          - `uploadPortrait.ts` - POST endpoint for uploading user portrait images with multipart/form-data support, file validation (type, size), and automatic file storage to public/portraits directory.
          - `uploadPortrait.test.ts` - Comprehensive test suite for the POST portrait upload endpoint covering authentication (Bearer token and cookie), authorization, user existence validation, file validation (type, size, empty files), successful uploads with imageUrl database updates, support for multiple image formats (JPEG, PNG, GIF, WebP), imageUrl change verification, maximum file size handling, unsupported format rejection, and error handling. Includes 17 test cases with proper setup/teardown, database management, and file upload simulation using test_avatar.jpeg.
        - `organization/` - Organization management API endpoints.
          - `getOrganization.ts` - GET endpoint for retrieving user's organization information including organizations created by the authenticated user. Returns array of organization objects with id, name, and slug properties.
          - `getOrganization.test.ts` - Comprehensive test suite for the GET organization endpoint covering authentication (Bearer token and cookie), authorization, user existence validation, organization retrieval scenarios, multiple organizations support, proper data structure validation, and error handling. Includes 10 test cases with proper setup/teardown and database management following established testing patterns.
        - `onboarding/` - Onboarding process API endpoints.
          - `onboardingQuestions.ts` - GET endpoint for fetching onboarding questions from external API.
          - `onboardingQuestions.test.ts` - Tests for the onboarding questions endpoint.
          - `onboardingSetup.ts` - POST endpoint for submitting onboarding data and setting up user accounts.
          - `onboardingSetup.test.ts` - Tests for the onboarding setup process.
        - `roles/` - Role management API endpoints.
          - `postRoles.ts` - POST endpoint for creating new roles with associated permissions. Validates permission existence before role creation, creates the role record, and establishes RolePermission links through the intermediate table. Includes comprehensive error handling for invalid permissions and proper response validation.
          - `postRoles.test.ts` - Comprehensive test suite for the POST roles endpoint covering authentication, authorization, request validation, permission existence validation, role creation scenarios, and error handling.
          - `getRoles.ts` - GET endpoint for retrieving roles with hierarchical resource path validation. Supports ORGANIZATION, TEAM, PROJECT, and WORKFLOW resource types with proper path format validation (org:id/team:id/project:id/workflow:id) and database hierarchy validation ensuring parent resources exist.
          - `getRoles.test.ts` - Comprehensive test suite for the GET roles endpoint with 23 test cases covering authentication, query parameter validation, hierarchical path format validation, resource hierarchy validation, all resource types, and proper error handling.
          - `patchRole.ts` - PATCH endpoint for updating role metadata (name, description) while preserving permissions. Validates role existence, updates only provided fields, and returns properly formatted Role objects with standardized permission structure.
          - `patchRole.test.ts` - Comprehensive test suite for the PATCH role endpoint with 17 test cases covering authentication, path parameter validation, request body validation, role updates, permission preservation, and error handling.
        - `permissions/` - Permission management API endpoints.
          - `getPermissions.ts` - GET endpoint for retrieving all system permissions from the PermissionDefinition table. Returns a list of available permissions with their IDs and actions for use in role creation and management.
          - `getPermissions.test.ts` - Test suite for the GET permissions endpoint covering authentication, data retrieval, and response validation.
        - `user-roles/` - User role assignment API endpoints.
          - `postUserRole.ts` - POST endpoint for assigning roles to users with path parameter validation (userId), request body validation (roleId, optional expiresAt), user and role existence validation, duplicate assignment prevention, and proper UserRole response formatting. Includes comprehensive error handling for 400, 404, and 500 status codes with authentication middleware integration.
          - `postUserRole.test.ts` - Comprehensive test suite for the POST user role assignment endpoint with 79 test cases covering authentication (Bearer token and cookie), authorization, path parameter validation, request body validation, user and role existence validation, duplicate assignment prevention, successful role assignments with and without expiration dates, multiple role assignments, different resource types (ORGANIZATION, TEAM, PROJECT, WORKFLOW), date format handling, response format validation, error handling, and integration tests. Includes helper functions for complete resource hierarchy setup, role creation, and proper test data management.
          - `getUserRole.ts` - GET endpoint for retrieving all roles assigned to a specific user with path parameter validation (userId), user existence validation, and proper UserRole array response formatting. Returns array of UserRole objects containing id, roleId, userId, and optional expiresAt fields. Includes comprehensive error handling for 400, 404, and 500 status codes with authentication middleware integration.
          - `getUserRole.test.ts` - Comprehensive test suite for the GET user roles endpoint with 24 test cases covering authentication (Bearer token and cookie), authorization, path parameter validation, user existence validation, successful role retrieval scenarios (empty arrays, single roles, multiple roles, different resource types, various expiration dates), response format validation, cross-user access tests, error handling, and integration tests. Includes end-to-end testing with full onboarding flow, complex hierarchical role assignments, and performance testing with multiple roles.

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
          - `server.tsx` - Server component for fetching account related data.
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
        - `people/` - Organization members management module.
          - `view.tsx` - UI component for displaying and managing organization members. Integrates an invitation system allowing authorized users to invite new members by email and assign roles. Includes checks to prevent inviting existing members or those with active pending invitations.
          - `data-table.tsx` - Advanced data table component built using TanStack Table with row selection, sorting, filtering, pagination, column visibility, and support for an invite button that appears in the filters row.
          - `columns.tsx` - Column definitions for the organization members data table with custom cell renderers and role badges.
          - `EditPersonDialog.tsx` - Dialog component for editing details of a member or an invitation, such as roles for pending invitations.
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
          - `view.tsx` - UI component for the teamspaces section with a paginated table displaying team information including name, admin, and member count. Features a modern UI with loading states, error handling, and a responsive design.
          - `logic.tsx` - Logic and state management for the teamspaces section using React hooks to manage pagination, loading states, and data fetching from the server.
          - `icon.tsx` - Icon component for the teamspaces section in the sidebar.
          - `meta.tsx` - Metadata for the teamspaces section (label, ID, group).
          - `index.ts` - Export file for the teamspaces module.
        - `rbac/` - Role Based Access Control module.
          - `view.tsx` - UI component for managing roles and permissions.
          - `logic.tsx` - Logic and state management for the RBAC section.
          - `server.tsx` - Server component for fetching roles data.
          - `icon.tsx` - Icon component for the RBAC section in the sidebar.
          - `meta.tsx` - Metadata for the RBAC section (label, ID, group).
          - `index.ts` - Export file for the RBAC module.
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
  - `accept-invitation/` - New route for handling user acceptance of organization invitations.
    - `layout.tsx` - Layout for the accept invitation page, providing a consistent onboarding-style appearance.
    - `page.tsx` - Page component that fetches pending invitation details for the logged-in user. Allows users to accept or decline the invitation, triggering server actions to update their account, roles, and redirect them accordingly.

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
  - `team-actions.ts` - Server actions for team management including paginated team listing with member counts and team creation with proper resource allocation.
  - `organization-actions.ts` - Server actions for organization management. Includes original member listing (`getOrganizationMembers`) and a new comprehensive action (`getOrganizationMembersAndInvites`) that fetches both active members and invitations, mapping them to a unified `PeopleListEntry` structure for display in the people management view. Also includes member management operations and organization updates.
  - `onboarding-actions.ts` - Server actions for handling onboarding data submission to the external API.
  - `email-actions.ts` - Server actions for sending emails using Resend, like organization invites.
  - `invitation-actions.ts` - New server actions for managing the lifecycle of user invitations. Includes creating new invitations (now with robust error handling for email sending), fetching pending invitations for a user, processing accepted invitations (upserting user, assigning roles, and updating invitation status within a transaction), declining invitations, checking if a user can be invited (verifies against existing members and pending invites), updating roles for pending invitations, and revoking pending invitations.
  - `file-upload.ts` - Utilities for handling file uploads with validation, storage to public directory, and support for image files with size/type restrictions.
- `src/server/flows/` - Server-side flows for complex operations.
  - `onboarding/` - Flows related to user onboarding.
    - `setup-account.ts` - Creates a complete account setup with organizational structure in a single transaction, including organization, team, project, and workflow creation with proper access controls. Extracts organization slug from the provided organization URL.
    - `check-onboarded.ts` - Checks if a user is onboarded by verifying they have an organization. If not, it now also checks for pending invitations for the user's email. If an invitation exists, redirects to an accept invitation page. Otherwise, handles redirection to the standard onboarding page if not onboarded, or to the correct organization subdomain if already onboarded but accessing via wrong URL. Supports both production (`{slug}.app.tensorify.io`) and development (`{slug}.localhost:PORT`) environments.

### Database

- `src/server/database/` - Database connection and configuration files.
  - `db.ts` - Database client setup and connection configuration.
  - `prisma/` - Prisma database configuration and migrations.
    - `schema.prisma` - Prisma schema definition. Updated to include a new `Invitation` model and `InvitationStatus` enum to support the user invitation system. The `Invitation` model stores email, organization, assigned roles, status, expiration, and inviter details.
    - `seed.ts` - Seed file for initializing standard permissions in the database.

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

### Email Templates

- `src/server/emails/OrganizationInviteEmail.tsx` - React email template for organization invite emails
