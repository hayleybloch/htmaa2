#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error('Usage: node scripts/fix_export_paths.js <exported-desktop-dir> <basePath>');
  console.error('Example: node scripts/fix_export_paths.js apps/web/out/desktop /htmaa2');
  process.exit(1);
}

const dir = path.resolve(process.argv[2]);
let base = process.argv[3];
if (!base.startsWith('/')) base = '/' + base;
if (base.endsWith('/')) base = base.slice(0, -1);

const exts = ['.html', '.htm', '.js', '.css'];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (exts.includes(path.extname(e.name).toLowerCase())) processFile(full);
  }
}

function processFile(file) {
  let s = fs.readFileSync(file, 'utf8');

  // Patterns to rewrite: leading /_next, /icons/, /fonts/, /assets/, /desktop/
  // Only rewrite occurrences that start with a leading slash and not already prefixed with base
  const pats = [
    {from: /(["'\(])\/(?:_next)\//g, to: `$1${base}/_next/`},
    {from: /(["'\(])\/(?:icons)\//g, to: `$1${base}/icons/`},
    {from: /(["'\(])\/(?:fonts)\//g, to: `$1${base}/fonts/`},
    {from: /(["'\(])\/(?:assets)\//g, to: `$1${base}/assets/`},
    {from: /(["'\(])\/(?:desktop)\//g, to: `$1${base}/desktop/`},
  ];

  let changed = false;
  for (const p of pats) {
    const newS = s.replace(p.from, p.to);
    if (newS !== s) { changed = true; s = newS; }
  }

  if (changed) {
    fs.writeFileSync(file, s, 'utf8');
    console.log('Updated', file);
  }
}

if (!fs.existsSync(dir)) {
  console.error('Directory does not exist:', dir);
  process.exit(2);
}

walk(dir);
console.log('Done.');
