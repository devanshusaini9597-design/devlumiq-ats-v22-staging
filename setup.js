#!/usr/bin/env node
/**
 * Devlumiq ATS — One-command setup script.
 * Run: node setup.js
 *
 * This script:
 * 1. Copies .env.example → .env (if .env doesn't exist)
 * 2. Runs prisma generate (creates the Prisma client)
 * 3. Runs prisma db push (creates/syncs database tables)
 * 4. Seeds demo data (candidates, jobs, interviews, notifications, etc.)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const envFile = path.join(root, '.env');
const envExample = path.join(root, '.env.example');
const dbFile = path.join(root, 'prisma', 'dev.db');

function run(cmd, label) {
  console.log(`\n➤ ${label}...`);
  try {
    execSync(cmd, { cwd: root, stdio: 'inherit' });
    console.log(`  ✓ ${label} — done`);
  } catch (e) {
    console.error(`  ✗ ${label} — failed`);
    process.exit(1);
  }
}

console.log('\n╔══════════════════════════════════════════╗');
console.log('║   Devlumiq ATS — Setup                   ║');
console.log('╚══════════════════════════════════════════╝\n');

// Step 1: .env file
if (!fs.existsSync(envFile)) {
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    console.log('✓ Created .env from .env.example');
  } else {
    fs.writeFileSync(envFile, 'DATABASE_URL="file:./dev.db"\n');
    console.log('✓ Created .env with SQLite default');
  }
} else {
  console.log('✓ .env already exists');
}

// Step 2: Generate Prisma Client
run('npx prisma generate', 'Generate Prisma Client');

// Step 3: Create/sync database
if (fs.existsSync(dbFile)) {
  console.log('\n✓ Database already exists (prisma/dev.db)');
  console.log('  To reset with fresh demo data, delete prisma/dev.db and run this script again.');
} else {
  run('npx prisma db push --skip-generate', 'Create database tables');
  run('node prisma/seed.js', 'Seed demo data');
}

console.log('\n╔══════════════════════════════════════════╗');
console.log('║   Setup complete!                        ║');
console.log('╠══════════════════════════════════════════╣');
console.log('║                                          ║');
console.log('║   Start the dev server:                  ║');
console.log('║   npm run dev                            ║');
console.log('║                                          ║');
console.log('║   Then open: http://localhost:3000        ║');
console.log('║                                          ║');
console.log('║   Demo login:                            ║');
console.log('║   Email: demo@devlumiq.com               ║');
console.log('║   Password: demo                         ║');
console.log('║                                          ║');
console.log('╚══════════════════════════════════════════╝\n');
