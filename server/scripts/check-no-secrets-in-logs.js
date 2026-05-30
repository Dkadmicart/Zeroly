#!/usr/bin/env node
// server/scripts/check-no-secrets-in-logs.js
//
// CI guardrail: scans server/**/*.js for patterns that should never appear
// in production code. Exits with code 1 if violations are found.
//
// Usage:  npm run lint:secrets
//         node scripts/check-no-secrets-in-logs.js

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SERVER_ROOT = join(__dirname, '..');

// Patterns that indicate credential/PII leakage in logs.
// Each entry: [regex, human-readable description]
const FORBIDDEN_PATTERNS = [
  [/console\.log\s*\(\s*.*process\.env/,         'Logging environment variables directly'],
  [/console\.log\s*\(\s*.*req\.body/,             'Logging request body (may contain passwords/PII)'],
  [/console\.log\s*\(\s*.*CLOUDINARY/i,           'Logging Cloudinary configuration values'],
  [/console\.log\s*\(\s*.*API[_\s]?KEY/i,         'Logging API key values'],
  [/console\.log\s*\(\s*.*API[_\s]?SECRET/i,      'Logging API secret values'],
  [/console\.log\s*\(\s*.*JWT[_\s]?SECRET/i,      'Logging JWT secret values'],
  [/console\.log\s*\(\s*.*password/i,             'Logging password-related data'],
];

// Directories to skip
const SKIP_DIRS = new Set(['node_modules', '.git', 'scripts']);

function walkDir(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) {
        files.push(...walkDir(fullPath));
      }
    } else if (entry.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

let violations = 0;

const files = walkDir(SERVER_ROOT);

for (const filePath of files) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const [pattern, description] of FORBIDDEN_PATTERNS) {
      if (pattern.test(line)) {
        const rel = relative(SERVER_ROOT, filePath);
        console.error(`❌ VIOLATION: ${rel}:${i + 1}`);
        console.error(`   Pattern:  ${description}`);
        console.error(`   Line:     ${line.trim()}`);
        console.error('');
        violations++;
      }
    }
  }
}

if (violations > 0) {
  console.error(`\n🚨 Found ${violations} secret-logging violation(s). Fix them before merging.\n`);
  process.exit(1);
} else {
  console.log('✅ No secret-logging violations found.');
  process.exit(0);
}
