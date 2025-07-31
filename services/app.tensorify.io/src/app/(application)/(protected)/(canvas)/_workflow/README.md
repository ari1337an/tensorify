# Workflow Canvas Persistence

This document describes the implementation of the React Flow canvas persistence feature.

## Overview

The workflow canvas now automatically saves and restores its state (nodes, edges, and viewport) to the database. This ensures that users' work is preserved across page reloads and sessions.

## How It Works

### 1. Architecture

```
WorkflowLayout (receives workflow prop)
  └── ReactFlowProvider
       └── WorkflowCanvas
            └── useWorkflowPersistence hook
                 ├── Loads state on mount
                 └── Saves state on changes (debounced)
```

### 2. Data Flow

1. **Loading**: When a workflow is opened, the `useWorkflowPersistence` hook checks if there's saved state in the `workflow.version.code` field and restores it.

2. **Saving**: As users interact with the canvas (add/move nodes, create edges), changes are automatically saved to the database after a 1-second debounce period.

### 3. API Endpoint

- **Endpoint**: `PATCH /api/v1/workflow/:workflowId/version/:versionId/code`
- **Purpose**: Updates the `code` field of a workflow version with the current React Flow state
- **Payload**:
  ```json
  {
    "code": {
      "nodes": [...],
      "edges": [...],
      "viewport": { "x": 0, "y": 0, "zoom": 1 }
    }
  }
  ```

### 4. Key Components

#### useWorkflowPersistence Hook

- Manages loading and saving of workflow state
- Uses debouncing to prevent excessive API calls
- Prevents save operations during initial load

#### useDebounce Hook

- Generic debounce utility
- Default delay: 1000ms
- Cancels pending operations on unmount

## Testing

To test the persistence feature:

1. Open a workflow in the canvas
2. Add some nodes by dragging from the node panel
3. Connect nodes with edges
4. Wait 1 second for auto-save (check console for "Workflow state saved successfully")
5. Refresh the page
6. The canvas should restore with all your nodes and edges in the same positions

## Future Enhancements

1. **Visual Save Indicator**: Show a saving/saved status to users
2. **Manual Save**: Add a save button for immediate saves
3. **Viewport Persistence**: Currently viewport is hardcoded, could save actual viewport state
4. **Conflict Resolution**: Handle concurrent edits from multiple users
5. **Version History**: Allow users to revert to previous states
6. **Access Control**: Currently disabled, should be re-enabled when implemented

## Known Limitations

1. Access control is not implemented (any authenticated user can edit any workflow they can see)
2. Viewport state is not actually persisted (always resets to default)
3. No visual feedback when saving
4. No error recovery if save fails
