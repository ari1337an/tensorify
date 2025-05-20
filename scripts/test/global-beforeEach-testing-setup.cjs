/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.test.local') });

const execSync = require('child_process').execSync;

beforeEach(() => {
  console.log('⏳ Resetting testing database with Prisma before this test suite...');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.endsWith('/app_test')) {
    throw new Error(`${databaseUrl} is not a test database. Please use the test database.`);
  }
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
});
