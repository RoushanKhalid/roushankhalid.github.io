/**
 * Run this script once after cloning or changing credentials:
 *   node generate-admin-config.js
 *
 * It reads ADMIN_USERNAME and ADMIN_PASSWORD from .env and writes
 * the SHA-256 hash into admin-config.js so the admin panel can
 * validate logins without exposing plaintext credentials.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Simple .env reader (no dependencies)
function loadEnv(filePath) {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }
  return env;
}

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env file not found. Create it with ADMIN_USERNAME and ADMIN_PASSWORD.');
  process.exit(1);
}

const env = loadEnv(envPath);
const { ADMIN_USERNAME, ADMIN_PASSWORD } = env;

if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error('ERROR: ADMIN_USERNAME or ADMIN_PASSWORD missing in .env');
  process.exit(1);
}

const combined = `${ADMIN_USERNAME}:${ADMIN_PASSWORD}`;
const hash = crypto.createHash('sha256').update(combined).digest('hex');

const output = `/*
  Admin credentials config — generated from .env
  This file stores a hashed token, NOT plaintext credentials.
  Re-generate by running: node generate-admin-config.js
  DO NOT commit .env — DO commit this file (hash only).
*/

const ADMIN_TOKEN_HASH = "${hash}";
`;

fs.writeFileSync(path.join(__dirname, 'admin-config.js'), output, 'utf-8');
console.log('✓ admin-config.js generated successfully.');
console.log(`  Hash: ${hash}`);
