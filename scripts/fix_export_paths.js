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

// Only process HTML and CSS files. Avoid rewriting JS bundles to prevent
// accidental corruption of regex literals or other code inside .js files.
const exts = ['.html', '.htm', '.css'];

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
    // Map top-level asset paths to the GitHub Pages base + /desktop so
    // exported desktop files reference the files where they're copied.
    {from: /(["'\(])\/(?:_next)\//g, to: `$1${base}/desktop/_next/`},
    {from: /(["'\(])\/(?:icons)\//g, to: `$1${base}/desktop/icons/`},
    {from: /(["'\(])\/(?:fonts)\//g, to: `$1${base}/desktop/fonts/`},
    {from: /(["'\(])\/(?:sounds)\//g, to: `$1${base}/desktop/sounds/`},
    {from: /(["'\(])\/(?:images)\//g, to: `$1${base}/desktop/images/`},
    {from: /(["'\(])\/(?:assets)\//g, to: `$1${base}/desktop/assets/`},
    {from: /(["'\(])\/(?:desktop)\//g, to: `$1${base}/desktop/`},
  ];

  let changed = false;
  for (const p of pats) {
    const newS = s.replace(p.from, p.to);
    if (newS !== s) { changed = true; s = newS; }
  }

  // Also rewrite cases where the files already contain the base path + /<asset>
  // (e.g. `/htmaa2/icons/...`) to the desktop location (`/htmaa2/desktop/icons/...`).
  // This covers Next.js-generated HTML that was rendered with NEXT_PUBLIC_BASE_PATH.
  function escapeForRegex(str) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  const baseEsc = escapeForRegex(base);
  const assetTypes = ['icons', 'fonts', 'sounds', 'images', 'assets', '_next'];
  for (const t of assetTypes) {
    const re = new RegExp(`(["'\\(])${baseEsc}\\/(?:${t})\\/`, 'g');
    if (re.test(s)) {
      const newS = s.replace(re, `$1${base}/desktop/${t}/`);
      if (newS !== s) { changed = true; s = newS; }
    }
  }

  // Fix CSS variable --public-path: /; (used by runtime loaders) so it includes the base path.
  // If the file is part of the desktop export, prefer base + '/desktop'
  const publicPathRegex = /(--public-path\s*:\s*)\//g;
  if (publicPathRegex.test(s)) {
    const isDesktopFile = file.includes(path.join(path.sep, 'desktop', path.sep)) || file.endsWith(path.join('desktop', 'index.html'));
    const replacement = isDesktopFile ? `$1${base}/desktop` : `$1${base}`;
    const newS = s.replace(publicPathRegex, replacement);
    if (newS !== s) { changed = true; s = newS; }
  }

  // Normalize accidental double prefixes or duplicate slashes that could have been introduced.
  // Avoid touching protocol-relative or http(s):// URLs.
  // Replace occurrences like /htmaa2//_next -> /htmaa2/_next and /htmaa2/htmaa2 -> /htmaa2
  const dupNext = new RegExp(base.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\/{2,}_next', 'g');
  if (dupNext.test(s)) {
    const newS = s.replace(dupNext, `${base}/_next`);
    if (newS !== s) { changed = true; s = newS; }
  }

  // Collapse multiple slashes into one for non-protocol occurrences (safe normalization)
  const collapsed = s.replace(/(^|[^:])\/{2,}/g, '$1/');
  if (collapsed !== s) { changed = true; s = collapsed; }

  // Ensure --public-path variable is exactly the desired value (avoid accidental duplication)
  const publicPathFinalRegex = /(--public-path\s*:\s*)([^;]+);/g;
  if (publicPathFinalRegex.test(s)) {
    const isDesktopFile = file.includes(path.join(path.sep, 'desktop', path.sep)) || file.endsWith(path.join('desktop', 'index.html'));
    const desired = isDesktopFile ? `${base}/desktop` : base;
    const newS = s.replace(publicPathFinalRegex, `$1${desired};`);
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
