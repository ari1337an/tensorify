import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function upsertPermissions() {
  try {
    // Read permissions from JSON file
    const permissionsFile = path.join(process.cwd(), 'src', 'server', 'database', 'prisma', 'permissions.json');
    const permissionsData = await fs.readFile(permissionsFile, 'utf8');
    const permissions = JSON.parse(permissionsData);

    // Upsert each permission individually
    for (const permission of permissions) {
      await prisma.permissionDefinition.upsert({
        where: { action: permission.action },
        update: {}, // No update needed since we only ensure existence
        create: {
          action: permission.action,
        },
      });
      console.log(`Upserted permission: ${permission.action}`);
    }
    console.log('All permissions upserted successfully.');
  } catch (error) {
    console.error('Error upserting permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

upsertPermissions();