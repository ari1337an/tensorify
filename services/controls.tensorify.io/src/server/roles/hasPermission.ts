export type Role = keyof typeof ROLES;
type BasePermissions = (typeof ROLES)[Role][number];

type Permission = BasePermissions;

const ROLES = {
  admin: [
    // Org
    "org:create",
    "org:read",
    "org:update",
    "org:delete",
    "org:invite",
  ],
  manager: [
    // Org
    "org:read",
    "org:invite",

    // Team
    "team:create",
    "team:delete",
    "team:invite",
    "team:read",
    "team:update",

    // Project
    "project:create",
    "project:delete",
    "project:read",
    "project:update",
  ],
  user: [
    // Org
    "org:read",

    // Team
    "team:read",
    "team:update",

    // Project
    "project:create",
    "project:read",
    "project:update",
    "project:delete",

    // Workflow
    "workflow:create",
    "workflow:read",
    "workflow:update",
    "workflow:delete",
    "workflow:export",
  ],
} as const;

// Define role hierarchy as a constant object
const ROLE_HIERARCHY: Record<Role, Role | null> = {
  admin: "manager",
  manager: "user",
  user: null,
};

// Function to get all permissions including inherited ones
const getPermissions = (role: Role): Permission[] => {
  const basePermissions = new Set(ROLES[role]);
  let inheritedRole: Role | null = ROLE_HIERARCHY[role];
  while (inheritedRole) {
    ROLES[inheritedRole].forEach((perm) => basePermissions.add(perm));
    inheritedRole = ROLE_HIERARCHY[inheritedRole];
  }
  return Array.from(basePermissions);
};

export const hasPermission = (
  user: { id: string; role: Role },
  permission: Permission
) => {
  return getPermissions(user.role).includes(permission);
};
