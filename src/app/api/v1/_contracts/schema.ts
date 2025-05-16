import { z } from 'zod';

export const UUID = z.string().uuid();
export const Message = z.object({ message: z.string() });
export const ErrorResponse = z.object({ status: z.enum(['success', 'failed']), message: z.string() });

export const Session = z.object({
  sessionId: z.string(),
  deviceType: z.string().optional(),
  browserName: z.string().optional(),
  browserVersion: z.string().optional(),
  ipAddress: z.string().ip({ version: 'v4' }).optional(),
  location: z.string().optional(),
  lastActiveAt: z.string().datetime(),
});

export const AccountInfo = z.object({
  portraitUrl: z.string().url().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  sessions: z.array(Session),
});

export const AccountUpdate = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  portraitUrl: z.string().url().optional(),
  sessionId: z.string().optional(),
}).strict();

export const Organization = z.object({
  id: UUID,
  name: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

export const OrgInfo = z.object({
  org: Organization,
});

export const OrgUpdate = z.object({
  orgName: z.string(),
  orgSlug: z.string().regex(/^[a-z0-9-]+$/),
}).strict();

export const UserPreferences = z.object({
  theme: z.enum(['light', 'system', 'dark']),
}).strict();

export const PermissionItem = z.object({
  action: z.string(),
  resourceType: z.string(),
});

export const RoleResponse = z.object({
  id: UUID,
  name: z.string(),
  permissions: z.array(PermissionItem),
});

export const RoleListResponse = z.object({
  roles: z.array(RoleResponse),
});

export const NewRole = z.object({
  name: z.string(),
  permissions: z.array(PermissionItem),
}).strict();

export const UpdateRole = z.object({
  roleId: UUID,
  name: z.string().optional(),
  addPermissions: z.array(PermissionItem).optional(),
  removePermissions: z.array(PermissionItem).optional(),
}).strict();

export const InvitationStatus = z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED']);

export const UserSummary = z.object({
  id: UUID,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  imageUrl: z.string().url().nullable().optional(),
});

export const NewInvitation = z.object({
  email: z.string().email(),
  organization: Organization,
  roleIds: z.array(UUID),
  expiresAt: z.string().datetime(),
}).strict();

export const UpdateInvitationRoles = z.object({
  roleIds: z.array(UUID),
}).strict();

export const Invitation = z.object({
  id: UUID,
  email: z.string().email(),
  organization: Organization,
  roleIds: z.array(UUID),
  status: InvitationStatus,
  expiresAt: z.string().datetime(),
  invitedBy: UserSummary,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const OnboardingOption = z.object({
  id: UUID,
  questionId: UUID,
  value: z.string(),
  label: z.string(),
  iconSlug: z.string().nullable().optional(),
  sortOrder: z.number().int(),
});

export const OnboardingQuestion = z.object({
  id: UUID,
  versionId: UUID,
  slug: z.string(),
  type: z.enum(['single_choice', 'multi_choice']),
  title: z.string(),
  iconSlug: z.string().nullable().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  allowOtherOption: z.boolean(),
  createdAt: z.string().datetime(),
  options: z.array(OnboardingOption),
});

export const OnboardingVersion = z.object({
  id: UUID,
  tag: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  status: z.string(),
  createdAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
  questions: z.array(OnboardingQuestion),
});

export const OnboardingAnswer = z.object({
  questionId: UUID,
  customValue: z.string().nullable().optional(),
  selectedOptionIds: z.array(UUID).optional(),
});

export const OnboardingSetupRequest = z.object({
  userId: UUID,
  email: z.string().email(),
  imageUrl: z.string().url().optional(),
  firstName: z.string(),
  lastName: z.string(),
  orgUrl: z.string(),
  orgName: z.string(),
  answers: z.array(OnboardingAnswer).optional(),
  usageSelection: z.string().optional(),
  orgSize: z.string().optional(),
  clientFingerprint: z.string().nullable().optional(),
}).strict();
