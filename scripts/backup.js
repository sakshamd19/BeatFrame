import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create backups dir if it doesn't exist
const backupDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `backup-${dateStr}.sql`);

console.log(`Starting Supabase database backup...`);
console.log(`Make sure you have linked your project via 'npx supabase link' first.`);

try {
  // Execute the supabase CLI db dump command
  execSync(`npx supabase db dump -f "${backupFile}"`, { stdio: 'inherit' });
  console.log(`\n✅ Backup successfully saved to: ${backupFile}`);
  console.log(`Recommendation: Run this script weekly to maintain point-in-time recovery on the free tier.`);
} catch (error) {
  console.error('\n❌ Backup failed.');
  console.error('Please ensure the Supabase CLI is installed and your project is linked.');
  console.error('Run: npx supabase login && npx supabase link --project-ref <your-ref>');
  process.exit(1);
}
