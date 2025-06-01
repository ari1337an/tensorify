/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.test') });
const { createClerkClient } = require("@clerk/backend");

async function revokeAllBotSessions() {
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const botIds = [
    "user_2xLLWhUxEMd1EbDXsfAyfyCFXtE",
    "user_2xdxI5ZwYaOqiDzy0FgQkVdsw5j",
  ];

  for (const botId of botIds) {
    const sessions = await clerkClient.sessions.getSessionList({
      userId: botId,
      status: "active",
    });

    const count = sessions.totalCount;
    const allSessions = await clerkClient.sessions.getSessionList({
      userId: botId,
      status: "active",
      limit: count,
    });

    for (const session of allSessions.data) {
      await clerkClient.sessions.revokeSession(session.id);
    }
  }

  console.log("All bot sessions revoked successfully.");
}

// ✅ Export this as the teardown hook for Jest
module.exports = async () => {
  try {
    await revokeAllBotSessions();
  } catch (err) {
    console.error("Failed to revoke bot sessions:", err);
    process.exit(1);
  }
};
