#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const [k, v] = a.split('=');
      out[k.replace(/^--/, '')] = v === undefined ? true : v;
    } else if (!out._) out._ = a;
  }
  return out;
}

const argv = parseArgs();
const SOURCE = argv.source || process.env.SOURCE || '/htmaa2';
const TARGET = argv.target || process.env.TARGET || process.env.DEPLOY_BASE_PATH || '/classes/863.25/people/HayleyBloch';
const DIRS = (argv.dirs || 'out,public').split(',').map(s => s.trim()).filter(Boolean);
const DRY = argv['dry-run'] === 'true' || argv['dry-run'] === true || !!argv['dry-run'];

if (!SOURCE) {
  console.error('Missing source string (use --source=/htmaa2)');
  process.exit(2);
}

console.log('fix_export_paths running');
console.log(' SOURCE:', SOURCE);
console.log(' TARGET:', TARGET);
console.log(' DIRS:  ', DIRS.join(', '));
console.log(' DRY-RUN:', DRY);

const exts = new Set(['.html', '.htm', '.css', '.js', '.json']);

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, cb);
    else cb(full);
  }
}

let totalFiles = 0;
let changedFiles = 0;

for (const base of DIRS) {
  const abs = path.resolve(__dirname, '..', base);
  if (!fs.existsSync(abs)) {
    // skip missing dirs
    continue;
  }
  walk(abs, (file) => {
    const ext = path.extname(file).toLowerCase();
    if (!exts.has(ext)) return;
    totalFiles++;
    let s;
    try {
      s = fs.readFileSync(file, 'utf8');
    } catch (e) {
      console.warn('Could not read', file, e.message);
      return;
    }
    if (s.indexOf(SOURCE) === -1) return;
    const replaced = s.split(SOURCE).join(TARGET);
    console.log((DRY ? '[DRY] ' : '') + 'Replace in', file);
    if (!DRY) {
      try {
        // create a backup
        fs.copyFileSync(file, file + '.bak');
        fs.writeFileSync(file, replaced, 'utf8');
        changedFiles++;
      } catch (e) {
        console.error('Failed to write', file, e.message);
      }
    } else {
      changedFiles++;
    }
  });
}

console.log(`Scanned ${totalFiles} files; ${changedFiles} files matched ${SOURCE}`);
if (!DRY) console.log('Backups written with .bak suffix where changes were made.');
console.log('Done.');
