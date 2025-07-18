import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncAdminEmails() {
  try {
    console.log("Syncing admin emails from database...");
    const prisma = new PrismaClient();

    let adminEmails = [];

    try {
      // Check if AdminAccount model exists by trying to access it
      const adminAccounts = await prisma.adminAccount.findMany({
        select: {
          email: true,
        },
      });

      // If we get here, the table exists
      if (adminAccounts && adminAccounts.length > 0) {
        adminEmails = adminAccounts.map((account) => account.email);
        console.log(`Found ${adminEmails.length} admin emails in database`);
      } else {
        console.log("No admin accounts found in database");
      }
    } catch (error) {
      console.log("AdminAccount model might not exist yet");
      console.log("Error details:", error.message);
    }

    // Create the admin-emails.json file
    const filePath = path.join(__dirname, "..", "admin-emails.json");

    // Ensure the directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, JSON.stringify(adminEmails, null, 2));

    console.log(`Admin emails synced to ${filePath}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error syncing admin emails:", error);
    process.exit(1);
  }
}

syncAdminEmails();
