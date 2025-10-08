#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const APPS_DESKTOP = path.join(ROOT, 'apps', 'desktop');
const APPS_WEB = path.join(ROOT, 'apps', 'web');

function run(cmd, args, opts = {}) {
  console.log('>', cmd, args.join(' '), opts.cwd ? `(cwd: ${opts.cwd})` : '');
  const res = spawnSync(cmd, args, { stdio: 'inherit', env: Object.assign({}, process.env, opts.env || {}), cwd: opts.cwd || process.cwd() });
  if (res.error) {
    console.error('Failed to run', cmd, args.join(' '), res.error);
    process.exit(1);
  }
  if (res.status !== 0) {
    console.error('Command exited with', res.status);
    process.exit(res.status || 1);
  }
}

const prodEnv = { NODE_ENV: 'production', BUILD_FOR_GITHUB: 'true' };

console.log('Building and exporting desktop app (production)...');
if (!fs.existsSync(APPS_DESKTOP)) { console.error('Missing', APPS_DESKTOP); process.exit(1); }
run('npm', ['run', 'build'], { cwd: APPS_DESKTOP, env: prodEnv });

console.log('Building and exporting web app (production)...');
if (!fs.existsSync(APPS_WEB)) { console.error('Missing', APPS_WEB); process.exit(1); }
run('npm', ['run', 'build'], { cwd: APPS_WEB, env: prodEnv });
// Note: Next.js >=15 uses `output: 'export'` and generates the `out/` directory
// during `next build`. `next export` was removed. Build step above will create
// the out/ directory when configured.

console.log('\nBuild & export complete. You can now run `npm run preview:full-static` to copy+fix+preview.');
