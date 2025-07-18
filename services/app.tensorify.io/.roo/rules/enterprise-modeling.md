---
description: 
globs: 
alwaysApply: false
---
# roo.md

# 🧠 High-Level Architecture
Tensorify is a B2B SaaS platform structured as:
- Organization → Team → Project → Workflow
- Hierarchical role system: admin > manager > leader > member
- Permission and entitlement-controlled access to features
- RBAC, onboarding, subscriptions, and entitlements are all tightly coupled.

# 🧭 Main Entities
## Organization
- Top-level entity.
- Fields: name, slug, logo.
- Only admins can create/delete orgs.
- Onboarding starts here if no invite is found.
- URL format: `https://[org-slug].app.tensorify.io`

## Team
- Belongs to one organization.
- Has a single manager.
- Can create projects.
- Inviting to a team auto-adds to the org.

## Project
- Belongs to a team.
- Contains workflows.
- Created by team leader.
- Name limit: 20 chars.

## Workflow
- Smallest unit. React Flow canvas.
- URL format: `https://[org-slug].app.tensorify.io/w/[workflowId]`
- Has: name, version, history, tags, members
- Versions fetched from: `/api/beta/tensorify-versions`

# 👥 Roles & Hierarchy
- Roles: **admin > manager > leader > member**
- Role assignments must follow hierarchy.
- Examples:
  - Admin can assign managers.
  - Manager can assign leaders and members.
  - Leader can assign members only within their project.
- All permissions are granular and scoped per entity (org/team/project/workflow).

# ✅ Permissions
- Checked via:
  - `hasPermission(user, type, entityId, feature): boolean`
  - `hasPermissionAuth(type, entityId, feature): boolean` (server-side)
- `type` format: `entity:op` e.g., `org:create`, `workflow:invite`
- Permissions stored with:
  - userId/email, type, entityId, feature, scope level (org/team/project/workflow)

# 🔒 Entitlements
- Entitlements control access to product features.
- Enum `Feature` in TS.
- Tied into `hasPermission(...)`.
- Examples: `CREATE_ORGANIZATION`, `EXPORT_CODE`, `VERSIONING_WORKFLOW`

# 🚀 Onboarding Flow
1. If a user is invited → assign them to the entity (org/team/etc).
2. If not → user creates an org (org name + slug).
3. Automatically creates:
   - Team: "OrgName Team 1"
   - Project: "Project 1"
   - Workflow: "Workflow 1"
4. Redirects to: `/w/[workflowId]` for that org-slug.
5. URL: `https://app.tensorify.io/onboarding`

# 💳 Subscription Model
- Purchased by org admin only.
- Database fields:
  - stripeSubscriptionId, stripeCustomerId, stripePlanName
  - stripeSubscriptionActive, stripeBillingCycleEnds, stripeInvoiceFailed
  - seatsUsed, seatsMax, canceledAt, createdAt, updatedAt

# ⚙️ URL Conventions
- Onboarding: `/onboarding`
- Workflow (Prod): `https://[org-slug].app.tensorify.io/w/[workflowId]`
- Workflow (Dev): `http://[org-slug].localhost:PORT/w/[workflowId]:version`

# 🧪 Dev Notes
- Mock entitlements for local testing via dev-only control panel
- Use `hasPermission` consistently across app, hooks, API routes
- URL structure avoids nesting team/project/workflow in the path
- Sidebar handles contextual display of team/project, not URL

# 🧼 Best Practices
- Roles & permissions: always validate against hierarchy
- Prefer `hasPermissionAuth` in server code for Clerk integration
- Always check entitlements during permission checks
- All workflows must have versioned edit history + changelogs
- Use slugs for public URLs; fetch actual IDs via DB
- Avoid deep nesting in DB writes: rely on upward flow from workflow → project → team → org

