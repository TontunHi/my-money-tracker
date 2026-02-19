
const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

console.log('Pushing database schema...');
try {
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  console.log('Database schema pushed successfully.');
} catch (error) {
  console.error('Failed to push database schema:', error);
  process.exit(1);
}
