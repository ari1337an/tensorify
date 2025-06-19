import { z } from "zod";

// JWT Payload
export const JwtPayloadSchema = z.object({
  email: z.string(),
  exp: z.number(),
  firstName: z.string(),
  iat: z.number(),
  id: z.string(),
  imageUrl: z.string(),
  iss: z.string(),
  jti: z.string(),
  lastName: z.string(),
  name: z.string(),
  nbf: z.number(),
  sub: z.string(),
});

// Reusable primitives
export const UUID = z.string().uuid({ message: "Invalid UUID" });
export const USERID = z
  .string()
  .regex(/^user_[a-zA-Z0-9]+$/, { message: "Invalid user ID" }); // example user_2xLLWhUxEMd1EbDXsfAyfyCFXtE
export const SLUG = z
  .string()
  .regex(/^[a-z0-9-]+$/, { message: "Invalid slug" });

export const ORGURL = z
  .string()
  .regex(/^[a-z0-9-]+$/, { message: "Invalid org URL" })
  .max(100, { message: "Org URL must be less than 100 characters" })
  .min(1, { message: "Org URL is required" });
export const ORGNAME = z
  .string()
  .max(100, { message: "Org name must be less than 100 characters" })
  .min(1, { message: "Org name is required" });

export const Page = z.number().int().min(1).default(1);
export const Size = z.number().int().min(1).max(100).default(20);
export const ResourceType = z.enum([
  "ORGANIZATION",
  "TEAM",
  "PROJECT",
  "WORKFLOW",
]);
export const PermissionType = z.enum(["ALLOW", "DENY"]);
export const InvitationStatus = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "REVOKED",
]);

// Components: Parameters
export const UserIdParam = UUID; // path param
export const OrgIdParam = UUID;
export const TeamIdParam = UUID;
export const ProjectIdParam = UUID;
export const WorkflowIdParam = UUID;
export const InvitationIdParam = UUID;
export const ResourcePathParam = z.string();
export const ResourceTypeParam = ResourceType;
export const ActionTypeParam = z.string();
export const DateRangeParam = z.string(); // pattern date

// Message
export const Message = z.object({ message: z.string() });
export const ErrorResponse = z.object({
  status: z.literal("failed"),
  message: z.string(),
});

// Session
export const Session = z.object({
  sessionId: z.string(),
  deviceType: z.string().optional(),
  browserName: z.string().optional(),
  browserVersion: z.string().optional(),
  ipAddress: z
    .string()
    .ip({ version: "v4", message: "Invalid IPv4 address" })
    .or(z.string().ip({ version: "v6", message: "Invalid IPv6 address" }))
    .or(z.literal("Unknown"))
    .optional(),
  location: z.string().optional(),
  lastActiveAt: z
    .string()
    .refine((date) => !isNaN(new Date(Number(date)).getTime()), {
      message: "Invalid date",
    }),
});

// Account
export const AccountInfo = z.object({
  userId: USERID,
  portraitUrl: z.string().url().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  sessions: z.array(Session),
});

export const AccountUpdate = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    sessionId: z.array(z.string()).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Request validation failed",
  });

// Organization
export const Organization = z.object({
  id: UUID,
  name: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

export const OrgInfo = z.array(Organization);
export const OrgUpdate = z
  .object({
    orgName: z.string(),
    orgSlug: z.string().regex(/^[a-z0-9-]+$/),
  })
  .strict();

// Preferences
export const UserPreferences = z
  .object({
    theme: z.enum(["light", "system", "dark"]),
  })
  .strict();

// RBAC Schemas
export const Permission = z.object({
  id: z.string(),
  action: z.string(),
});

export const PermissionAssignment = z.object({
  permissionId: z.string(),
  type: PermissionType,
});

export const CreateRoleRequest = z
  .object({
    name: z.string(),
    description: z.string().optional(),
    resourceType: ResourceType,
    resourceId: UUID,
    permissions: z.array(PermissionAssignment),
  })
  .strict();

export const UpdateRoleRequest = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(50, "Name must be less than 50 characters")
      .optional(),
    description: z
      .string()
      .min(1, "Description is required")
      .max(100, "Description must be less than 100 characters")
      .optional(),
    addPermissions: z.array(PermissionAssignment).optional(),
    removePermissions: z.array(PermissionAssignment).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      (data.addPermissions && data.addPermissions.length > 0) ||
      (data.removePermissions && data.removePermissions.length > 0),
    {
      message:
        "At least one field (name, description, addPermissions, or removePermissions) must be provided",
    }
  );

export const Role = z.object({
  id: UUID,
  name: z.string(),
  description: z.string().optional(),
  resourceType: ResourceType,
  resourceId: UUID,
  permissions: z.array(PermissionAssignment),
});

export const AssignRoleRequest = z
  .object({
    roleId: UUID,
    expiresAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date-time",
      })
      .optional(),
  })
  .strict();

export const UserRole = z.object({
  id: UUID,
  roleId: UUID,
  userId: USERID,
  expiresAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date-time" })
    .optional(),
});

export const PermissionCheckRequest = z
  .object({
    userId: USERID,
    action: z.string(),
    resourcePath: z.string(),
  })
  .strict();

export const PermissionCheckResult = z.object({
  allowed: z.boolean(),
  decisionPath: z.array(
    z.object({ level: z.string(), rule: z.string(), effect: PermissionType })
  ),
});

// Invitations
export const UserSummary = z.object({
  id: UUID,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  imageUrl: z.string().url().nullable(),
});

export const CreateInvitationRequest = z
  .object({
    email: z.string().email(),
    roleId: UUID,
    resourcePath: z.string(),
    propagateRoles: z.boolean().default(false),
    expiresAt: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date-time",
      })
      .optional(),
  })
  .strict();

export const UpdateInvitationRoles = z
  .object({ roleIds: z.array(UUID) })
  .strict();

export const Invitation = z.object({
  id: UUID,
  email: z.string().email(),
  organization: Organization,
  roleIds: z.array(UUID),
  status: InvitationStatus,
  resourcePath: z.string(),
  propagateRoles: z.boolean(),
  expiresAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date-time" }),
  invitedBy: UserSummary,
  createdAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date-time" }),
  updatedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date-time" }),
});

// Audit Log
export const AuditLog = z.object({
  id: UUID,
  userId: USERID,
  action: z.string(),
  resourcePath: z.string(),
  outcome: z.enum(["SUCCESS", "DENIED", "ERROR", "EXPIRED"]),
  details: z.record(z.unknown()),
  timestamp: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date-time" }),
});

// Onboarding
export const OnboardingOption = z.object({
  // using
  id: UUID,
  questionId: UUID,
  value: z.string(),
  label: z.string(),
  iconSlug: z.string().nullable(),
  sortOrder: z.number().int(),
});

export const OnboardingAnswer = z.object({
  // using
  questionId: UUID,
  customValue: z.string().nullable().optional(),
  selectedOptionIds: z.array(UUID).optional(),
});

export const OnboardingQuestion = z.object({
  // using
  id: UUID,
  versionId: UUID,
  slug: z.string(),
  type: z.enum(["single_choice", "multi_choice"]),
  title: z.string(),
  iconSlug: z.string().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  allowOtherOption: z.boolean(),
  createdAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date-time" }),
  options: z.array(OnboardingOption),
});

export const OnboardingVersion = z.object({
  // using
  id: UUID,
  tag: z.string({ message: "Tag is required" }),
  title: z.string({ message: "Title is required" }),
  description: z.string().nullable(),
  status: z.string({ message: "Status is required" }),
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid creation date-time",
  }),
  publishedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid published date-time",
  }),
  questions: z
    .array(OnboardingQuestion)
    .min(1, { message: "At least 1 questions is required" }),
});

export const OnboardingSetupRequest = z
  .object({
    // using
    // userId: USERID, // from clerk userId
    // email: z.string().email(), // from clerk email
    // imageUrl: z.string().url(), // from clerk imageUrl
    // firstName: z.string(), // from clerk firstName
    // lastName: z.string(), // from clerk lastName
    orgUrl: ORGURL,
    orgName: ORGNAME,
    answers: z.array(OnboardingAnswer),
    usageSelection: z
      .string()
      .regex(
        /^WILL_NOT_PAY|WILL_PAY_HOBBY|WILL_PAY_TEAM|ENTERPRISE_POTENTIAL$/,
        { message: "Invalid usage selection" }
      )
      .optional(),
    orgSize: z
      .string()
      .regex(/^<20|20-99|100-499|500-999|1000\+$/, {
        message: "Invalid org size",
      })
      .optional(),
    clientFingerprint: z.string().nullable().optional(),
  })
  .strict();

export const OnboardingSetupResponse = z.object({
  // using
  orgId: UUID,
  teamId: UUID,
  projectId: UUID,
  workflowId: UUID,
  orgName: ORGNAME,
  orgUrl: SLUG,
  responseId: UUID,
});

// Lists and Pagination
export const PaginationMeta = z.object({
  totalCount: z.number().int(),
  page: z.number().int(),
  size: z.number().int(),
  totalPages: z.number().int(),
});

export const UserListItem = z.object({
  userId: USERID,
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  imageUrl: z.string().url().nullable(),
  roles: z.array(z.lazy(() => RoleResponse)),
  status: z.enum(["active", "invited"]),
});

export const UserListResponse = z.object({
  items: z.array(UserListItem),
  meta: PaginationMeta,
});

export const TeamUserListItem = z.object({
  teamId: UUID,
  teamName: z.string(),
  userId: USERID,
  email: z.string().email(),
  roles: z.array(z.lazy(() => RoleResponse)),
  status: z.enum(["active", "invited"]),
});

export const TeamUserListResponse = z.object({
  items: z.array(TeamUserListItem),
  meta: PaginationMeta,
});

export const Project = z.object({
  id: UUID,
  name: z.string(),
  teamId: UUID,
  organizationId: UUID,
});
export const NewProject = z.object({ name: z.string() }).strict();
export const ProjectUserListItem = z.object({
  projectId: UUID,
  projectName: z.string(),
  userId: USERID,
  email: z.string().email(),
  roles: z.array(z.lazy(() => RoleResponse)),
  status: z.enum(["active", "invited"]),
});
export const ProjectUserListResponse = z.object({
  items: z.array(ProjectUserListItem),
  meta: PaginationMeta,
});
export const ProjectListItem = z.object({
  id: UUID,
  name: z.string(),
  description: z.string().nullable(),
  teamId: UUID,
  teamName: z.string(),
  organizationId: UUID,
  memberCount: z.number().int(),
  createdAt: z.string(),
});
export const ProjectListResponse = z.object({
  items: z.array(ProjectListItem),
  meta: PaginationMeta,
});

export const Workflow = z.object({
  id: UUID,
  name: z.string(),
  projectId: UUID,
});
export const WorkflowUserListItem = z.object({
  workflowId: UUID,
  workflowName: z.string(),
  userId: USERID,
  email: z.string().email(),
  roles: z.array(z.lazy(() => RoleResponse)),
  status: z.enum(["active", "invited"]),
});
export const WorkflowUserListResponse = z.object({
  items: z.array(WorkflowUserListItem),
  meta: PaginationMeta,
});
export const WorkflowListResponse = z.object({
  items: z.array(Workflow),
  meta: PaginationMeta,
});

export const Team = z.object({
  id: UUID,
  name: z.string(),
  organizationId: UUID,
});

export const TeamListItem = z.object({
  id: UUID,
  name: z.string(),
  description: z.string().nullable(),
  organizationId: UUID,
  memberCount: z.number().int(),
  createdAt: z.string(),
});

export const TeamListResponse = z.object({
  items: z.array(TeamListItem),
  meta: PaginationMeta,
});

export const PermissionItem = z.object({
  action: z.string(),
  resourceType: z.string(),
});
export const RoleResponse = z.object({
  id: UUID,
  name: z.string(),
  permissions: z.array(PermissionItem),
});

export const User = z.object({
  id: UUID,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  imageUrl: z.string().url().nullable(),
});
