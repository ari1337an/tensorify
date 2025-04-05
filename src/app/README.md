# Tensorify App Architecture

The application is structured using route groups for logical code organization without affecting URL paths.

## Directory Structure

- `src/app/` - Root app directory
  - `layout.tsx` - Main layout that uses the enterprise AppWrapper
  - `page.tsx` - Main page that renders the canvas
  - `(enterprise)/` - Enterprise features (sidebar, navbar, team management)
    - `_components/` - Enterprise-specific components
      - `layout/` - Layout components (AppWrapper, AppLayout, MainContent)
      - `navbar/` - Navbar components
      - `sidebar/` - Sidebar components
    - `_hooks/` - Enterprise-specific hooks
    - `_lib/` - Enterprise-specific utilities
    - `_store/` - Enterprise-specific state management
  - `(canvas)/` - Canvas-specific implementation
    - `_components/` - Canvas-specific components
    - `_hooks/` - Canvas-specific hooks
    - `_lib/` - Canvas-specific utilities
    - `_store/` - Canvas-specific state management
  - `_components/` - Legacy components (to be moved)
  - `components/` - Shadcn UI components

## Responsibility Separation

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

## Architecture Notes

This architecture separates concerns into logical groups:

- The AppWrapper from the enterprise section provides the shell UI (sidebar, navbar, etc.)
- The WorkflowCanvas from the canvas section is rendered within this shell
- The route groups (folders in parentheses) are solely for code organization and developer separation
- All components are interconnected through the root layout and page

## Development Guidelines

1. Enterprise features should be developed within the `(enterprise)` folder
2. Canvas features should be developed within the `(canvas)` folder
3. Shared utilities and types can be placed in the root directories
4. Maintain separation of concerns between enterprise and canvas
5. UI components should be in `components/ui/`

## Team Organization

This architecture is designed to allow two developers to work independently:

- One developer focusing on enterprise features
- One developer focusing on canvas features
