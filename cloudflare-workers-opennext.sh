#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "Converting Next.js project to OpenNext.js for Cloudflare Workers..."

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but not installed. Aborting." >&2
  exit 1
fi

echo "Installing @opennextjs/cloudflare..."
npm install @opennextjs/cloudflare@latest

echo "Installing wrangler..."
npm install --save-dev wrangler@latest

PACKAGE_NAME="$(node -p "require('./package.json').name")"
if [[ -z "$PACKAGE_NAME" || "$PACKAGE_NAME" == "undefined" ]]; then
  echo "Unable to determine package name from package.json." >&2
  exit 1
fi

WRANGLER_FILE="wrangler.jsonc"
echo "Configuring ${WRANGLER_FILE}..."
node - "$PACKAGE_NAME" <<'NODE'
const fs = require('fs');
const path = require('path');

const packageName = process.argv[2];
const filePath = path.join(process.cwd(), 'wrangler.jsonc');
const envPath = path.join(process.cwd(), '.env');

const stripComments = (input) =>
  input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s+)\/\/.*$/gm, '');

let data = {};
if (fs.existsSync(filePath)) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(stripComments(raw));
  } catch (error) {
    console.warn('Warning: existing wrangler.jsonc could not be parsed; it will be recreated.');
    data = {};
  }
}

const parseEnv = (input) => {
  const result = {};
  input.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key) result[key] = value;
  });
  return result;
};

const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const envVars = parseEnv(envContent);

const today = new Date().toISOString().slice(0, 10);
const bucketName = `${packageName}-inc-cache`;

data.$schema = 'node_modules/wrangler/config-schema.json';
data.main = '.open-next/worker.js';
data.name = packageName;
data.compatibility_date = today;

const desiredFlags = ['nodejs_compat', 'global_fetch_strictly_public'];
const existingFlags = Array.isArray(data.compatibility_flags) ? data.compatibility_flags : [];
const combinedFlags = [];
for (const flag of desiredFlags.concat(existingFlags)) {
  if (!combinedFlags.includes(flag)) combinedFlags.push(flag);
}
data.compatibility_flags = combinedFlags;

data.assets = {
  directory: '.open-next/assets',
  binding: 'ASSETS',
};

data.r2_buckets = [
  {
    bucket_name: bucketName,
    binding: 'NEXT_INC_CACHE_R2_BUCKET',
  },
];

const vars = (data.vars && typeof data.vars === 'object') ? data.vars : {};
const umamiId = envVars.NEXT_PUBLIC_UMAMI_ID || vars.NEXT_PUBLIC_UMAMI_ID || '';
const umamiDomains = envVars.NEXT_PUBLIC_UMAMI_DOMAINS || vars.NEXT_PUBLIC_UMAMI_DOMAINS || '';

if (!envVars.NEXT_PUBLIC_UMAMI_ID && !vars.NEXT_PUBLIC_UMAMI_ID) {
  console.warn('Warning: NEXT_PUBLIC_UMAMI_ID not found in .env; leaving empty string.');
}
if (!envVars.NEXT_PUBLIC_UMAMI_DOMAINS && !vars.NEXT_PUBLIC_UMAMI_DOMAINS) {
  console.warn('Warning: NEXT_PUBLIC_UMAMI_DOMAINS not found in .env; leaving empty string.');
}

data.vars = {
  ...vars,
  NEXT_PUBLIC_UMAMI_ID: umamiId,
  NEXT_PUBLIC_UMAMI_DOMAINS: umamiDomains,
};

const formatted = JSON.stringify(data, null, 2) + '\n';
fs.writeFileSync(filePath, formatted);
NODE

echo "Writing open-next.config.ts..."
cat <<'EOF' > open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
EOF

echo "Writing .dev.vars..."
cat <<'EOF' > .dev.vars
NEXTJS_ENV=production
EOF

HEADERS_FILE="public/_headers"
echo "Ensuring ${HEADERS_FILE} exists..."
mkdir -p "$(dirname "$HEADERS_FILE")"
cat <<'EOF' > "$HEADERS_FILE"
/_next/static/*
  Cache-Control: public,max-age=31536000,immutable
EOF

echo "Updating package.json scripts..."
node <<'NODE'
const fs = require('fs');
const path = require('path');

const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.scripts = pkg.scripts || {};
pkg.scripts.build = 'next build';
pkg.scripts.preview = 'opennextjs-cloudflare build && opennextjs-cloudflare preview';
pkg.scripts.deploy = 'opennextjs-cloudflare build && opennextjs-cloudflare deploy';
pkg.scripts.upload = 'opennextjs-cloudflare build && opennextjs-cloudflare upload';
pkg.scripts['cf-typegen'] = 'wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts';

const output = JSON.stringify(pkg, null, 2) + '\n';
fs.writeFileSync(pkgPath, output);
NODE

if [[ -f ".gitignore" ]]; then
  if ! grep -qxF ".open-next" .gitignore; then
    echo "" >> .gitignore
    echo ".open-next" >> .gitignore
    echo "Added .open-next to .gitignore."
  else
    echo ".gitignore already contains .open-next."
  fi
else
  echo ".open-next" > .gitignore
  echo "Created .gitignore with .open-next entry."
fi

echo "Finished converting project to OpenNext.js for Cloudflare Workers."
