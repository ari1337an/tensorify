// // @ts-check
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("Starting seed...");

//   // Step 1: Delete existing permissions that don't have a resourceType
//   // (Needed for the schema migration)
//   try {
//     // Since we can't directly check for resourceType due to schema issues,
//     // we'll delete all existing permissions and recreate them
//     console.log("Cleaning up existing permissions...");
//     await prisma.$executeRaw`TRUNCATE TABLE "Permission" CASCADE;`;
//     console.log("Existing permissions removed.");
//   } catch (error) {
//     console.error("Error cleaning permissions:", error);
//   }

//   // Define the standard permissions with prefixed format
//   const standardPermissions = [
//     // Organization permissions
//     { action: "org:readOrgMemberList", resourceType: "Organization" },
//     { action: "org:inviteOrgMember", resourceType: "Organization" },
//     { action: "org:removeOrgMember", resourceType: "Organization" },
//     { action: "org:grantInviteOrgMember", resourceType: "Organization" },
//     { action: "org:revokeGrantInviteOrgMember", resourceType: "Organization" },
//     { action: "org:createOrgLevelRole", resourceType: "Organization" },
//     { action: "org:readOrgLevelRole", resourceType: "Organization" },
//     { action: "org:editOrgLevelRole", resourceType: "Organization" },
//     { action: "org:deleteOrgLevelRole", resourceType: "Organization" },
//     { action: "org:assignOrgLevelRole", resourceType: "Organization" },

//     // Team permissions
//     { action: "team:createTeam", resourceType: "Team" },
//     { action: "team:readTeamMemberList", resourceType: "Team" },
//     { action: "team:inviteTeamMember", resourceType: "Team" },
//     { action: "team:removeTeamMember", resourceType: "Team" },
//     { action: "team:addTeamRole", resourceType: "Team" },
//     { action: "team:createTeamRole", resourceType: "Team" },
//     { action: "team:readTeamRole", resourceType: "Team" },
//     { action: "team:updateTeamRole", resourceType: "Team" },
//     { action: "team:deleteTeamRole", resourceType: "Team" },

//     // Project permissions
//     { action: "project:createProject", resourceType: "Project" },
//     { action: "project:readProjectMemberList", resourceType: "Project" },
//     { action: "project:updateProject", resourceType: "Project" },
//     { action: "project:deleteProject", resourceType: "Project" },
//     { action: "project:inviteProjectMember", resourceType: "Project" },
//     { action: "project:removeProjectMember", resourceType: "Project" },
//     { action: "project:addProjectRole", resourceType: "Project" },
//     { action: "project:createProjectRole", resourceType: "Project" },
//     { action: "project:readProjectRole", resourceType: "Project" },
//     { action: "project:updateProjectRole", resourceType: "Project" },
//     { action: "project:deleteProjectRole", resourceType: "Project" },

//     // Workflow permissions
//     { action: "workflow:createWorkflow", resourceType: "Workflow" },
//     { action: "workflow:readWorkflowMemberList", resourceType: "Workflow" },
//     { action: "workflow:editWorkflow", resourceType: "Workflow" },
//     { action: "workflow:deleteWorkflow", resourceType: "Workflow" },
//     { action: "workflow:executeWorkflow", resourceType: "Workflow" },
//     { action: "workflow:shareWorkflow", resourceType: "Workflow" },
//     { action: "workflow:createWorkflowRole", resourceType: "Workflow" },
//     { action: "workflow:readWorkflowRole", resourceType: "Workflow" },
//     { action: "workflow:updateWorkflowRole", resourceType: "Workflow" },
//     { action: "workflow:deleteWorkflowRole", resourceType: "Workflow" },
//     { action: "workflow:addWorkflowRole", resourceType: "Workflow" },
//     { action: "workflow:removeWorkflowRole", resourceType: "Workflow" },
//   ];

//   console.log("Creating new permissions...");

//   // Create all permissions
//   for (const permission of standardPermissions) {
//     await prisma.permission.create({
//       data: {
//         action: permission.action,
//         resourceType: permission.resourceType,
//       },
//     });
//   }

//   console.log("Permissions created successfully!");

//   // Create super admin role with all org permissions
//   console.log("Creating or updating Super Admin role...");

//   // Step 1: Create or update the Super Admin role using upsert
//   const superAdminRole = await prisma.role.upsert({
//     where: { name: "Super Admin" },
//     update: {}, // No updates needed if it exists
//     create: {
//       name: "Super Admin",
//     },
//   });

//   console.log(`Super Admin role with ID: ${superAdminRole.id}`);

//   // Step 2: Query all organization permissions (permissions that start with "org:")
//   const orgPermissions = await prisma.permission.findMany({
//     where: {
//       action: {
//         startsWith: "org:",
//       },
//     },
//   });

//   console.log(`Found ${orgPermissions.length} organization permissions`);

//   // Step 3: Assign all org permissions to the Super Admin role
//   console.log("Assigning organization permissions to Super Admin role...");

//   for (const permission of orgPermissions) {
//     await prisma.rolePermission.upsert({
//       where: {
//         roleId_permissionId: {
//           roleId: superAdminRole.id,
//           permissionId: permission.id,
//         },
//       },
//       update: {}, // No updates needed if it exists
//       create: {
//         roleId: superAdminRole.id,
//         permissionId: permission.id,
//       },
//     });
//   }

//   console.log("Super Admin role configured with all organization permissions!");
//   console.log("Seed completed successfully!");
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
