#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error('Usage: node scripts/fix_export_paths.js <exported-desktop-dir> <basePath>');
  console.error('Example: node scripts/fix_export_paths.js out/desktop /htmaa2');
  process.exit(1);
}

const dir = path.resolve(process.argv[2]);
let base = process.argv[3];
if (!base.startsWith('/')) base = '/' + base;
if (base.endsWith('/')) base = base.slice(0, -1);

// Process HTML, CSS — and now safely-targeted JS bundles. We only apply
// conservative string/template-literal replacements (e.g. "/sounds/...")
// to JS so runtime absolute paths get rewritten when the site is hosted at
// a subpath. This minimizes the risk of corrupting arbitrary code.
const exts = ['.html', '.htm', '.css', '.js', '.mjs'];

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

  // Patterns to rewrite: leading /_next, /icons/, /fonts/, /sounds/, /images/, /assets/, /desktop/
  // We only want to rewrite occurrences that appear inside quoted strings or
  // template literals in JS files. Editing raw JS (including regex literals)
  // risks corrupting code and producing "Invalid regular expression flags".
  const pats = [
    {type: '_next', from: '/_next/', to: `${base}/desktop/_next/`},
    {type: 'icons', from: '/icons/', to: `${base}/desktop/icons/`},
    {type: 'fonts', from: '/fonts/', to: `${base}/desktop/fonts/`},
    {type: 'sounds', from: '/sounds/', to: `${base}/desktop/sounds/`},
    {type: 'images', from: '/images/', to: `${base}/desktop/images/`},
    {type: 'assets', from: '/assets/', to: `${base}/desktop/assets/`},
    {type: 'desktop', from: '/desktop/', to: `${base}/desktop/`},
  ];

  let changed = false;

  // Also rewrite cases where files already contain the base path + /<asset>
  // (e.g. `/htmaa2/icons/...`) to the desktop location (`/htmaa2/desktop/icons/...`).
  // This covers Next.js-rendered HTML or JS that used NEXT_PUBLIC_BASE_PATH.
  function escapeForRegex(str) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  const baseEsc = escapeForRegex(base);
  const assetTypes = ['icons', 'fonts', 'sounds', 'images', 'assets', '_next'];
  // We'll only rewrite occurrences of the full base + asset path when they
  // appear inside quoted/template strings to avoid touching regex literals.
  // We'll handle JS files specially below.

  // Fix CSS variable --public-path: /; (used by runtime loaders) so it includes the base path.
  // If the file is part of the desktop export, prefer base + '/desktop'
  const publicPathRegex = /(--public-path\s*:\s*)\//g;
  if (publicPathRegex.test(s)) {
    const isDesktopFile = file.includes(path.join(path.sep, 'desktop', path.sep)) || file.endsWith(path.join('desktop', 'index.html'));
    const replacement = isDesktopFile ? `$1${base}/desktop` : `$1${base}`;
    const newS = s.replace(publicPathRegex, replacement);
    if (newS !== s) { changed = true; s = newS; }
  }

  // For JS files we only operate inside quoted/template literal strings.
  const ext = path.extname(file).toLowerCase();
  if (ext === '.js' || ext === '.mjs') {
    // Iterate over all string/template literal occurrences and rewrite inside them.
    // This regex captures the quote char in group 1 and the contents in group 2.
    const stringRe = /(['"`])([\s\S]*?)\1/g;
    let newS = s.replace(stringRe, (whole, quote, inner) => {
      let replaced = inner;
      // Apply simple absolute-path -> base/desktop replacements inside the string
      for (const p of pats) {
        // Do not re-apply if the string already contains the base prefix
        if (!replaced.includes(base + p.from) && replaced.includes(p.from)) {
          replaced = replaced.split(p.from).join(p.to);
        }
      }
      // Also fix already-prefixed base + asset occurrences
      for (const t of assetTypes) {
        const prefix = base + '/' + t + '/';
        if (replaced.includes(prefix)) replaced = replaced.split(prefix).join(base + '/desktop/' + t + '/');
      }
      return quote + replaced + quote;
    });
    if (newS !== s) { changed = true; s = newS; }
  } else {
    // Non-JS files (HTML/CSS) — safe to do global textual replacements
    for (const p of pats) {
      // Replace p.from only when it's not already prefixed by the base.
      // Use a negative lookbehind where supported (Node.js RegExp supports fixed-width lookbehind).
      const fromEsc = p.from.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const reNeg = new RegExp('(?<!' + baseEsc + ')' + fromEsc, 'g');
      if (reNeg.test(s)) {
        s = s.replace(reNeg, p.to);
        changed = true;
      }
    }
    for (const t of assetTypes) {
      const re = new RegExp(baseEsc + '\\/(?:' + t + ')\\/', 'g');
      if (re.test(s)) {
        s = s.replace(re, base + '/desktop/' + t + '/');
        changed = true;
      }
    }

    // Normalize accidental double prefixes or duplicate slashes that could have been introduced.
    const dupNext = new RegExp(base.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\/{2,}_next', 'g');
    if (dupNext.test(s)) {
      const newS2 = s.replace(dupNext, `${base}/_next`);
      if (newS2 !== s) { changed = true; s = newS2; }
    }

    // Collapse multiple slashes into one for non-protocol occurrences (safe normalization)
    const collapsed = s.replace(/(^|[^:])\/{2,}/g, '$1/');
    if (collapsed !== s) { changed = true; s = collapsed; }

    // Ensure --public-path variable is exactly the desired value (avoid accidental duplication)
    const publicPathFinalRegex = /(\--public-path\s*:\s*)([^;]+);/g;
    if (publicPathFinalRegex.test(s)) {
      const isDesktopFile = file.includes(path.join(path.sep, 'desktop', path.sep)) || file.endsWith(path.join('desktop', 'index.html'));
      const desired = isDesktopFile ? `${base}/desktop` : base;
      const newS3 = s.replace(publicPathFinalRegex, `$1${desired};`);
      if (newS3 !== s) { changed = true; s = newS3; }
    }
  }
  if (changed) {
    fs.writeFileSync(file, s, 'utf8');
    console.log('Updated', file);
  }
}

// Helper: collapse repeated base prefixes in files under the desktop export
// e.g. "/htmaa2/htmaa2/desktop/_next/..." -> "/htmaa2/desktop/_next/..."
// We perform this after all file-level rewrites have been applied.
function collapseRepeatedBase(dir, base) {
  // Build a regex that matches repeated occurrences of '/<base>/' optionally
  // followed by 'desktop/' (to handle mixed sequences). We avoid double
  // escaping the base by removing the leading slash and building the
  // pattern explicitly.
  const baseNoLeading = base.replace(/^\//, '');
  // Pattern: (?:/<base>(?:/desktop)?/){2,}
  const mixPattern = new RegExp('(?:\\/' + baseNoLeading + '(?:\\/desktop)?\\/){2,}', 'g');
  const files = [];
  function walk2(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk2(full);
      else if (exts.includes(path.extname(e.name).toLowerCase())) files.push(full);
    }
  }
    try {
      walk2(dir);
      for (const f of files) {
        let content = fs.readFileSync(f, 'utf8');
        let newContent = content;

        // Replace any mixed repeated sequences with a single canonical segment.
        // Use a replacer that checks whether '/desktop/' appears in the match
        // to decide whether to normalize to 'base/' or 'base/desktop/'.
        newContent = newContent.replace(mixPattern, (m) => (m.indexOf('/desktop/') !== -1 ? base + '/desktop/' : base + '/'));

        // Iterate until stable in case the replacement reveals additional runs.
        let prev;
        do {
          prev = newContent;
          newContent = newContent.replace(mixPattern, (m) => (m.indexOf('/desktop/') !== -1 ? base + '/desktop/' : base + '/'));
          // Also collapse simple duplicates like '/base/base/' which might not
          // include the '/desktop/' token.
          const dup = new RegExp('\\/' + baseNoLeading + '\\/' + baseNoLeading + '\\/', 'g');
          newContent = newContent.replace(dup, '/' + baseNoLeading + '/');
        } while (newContent !== prev);

        if (newContent !== content) {
          fs.writeFileSync(f, newContent, 'utf8');
          console.log('Collapsed repeated base in', f);
        }
      }
    } catch (e) {
      // best-effort; do not crash assembly
      console.error('collapseRepeatedBase error:', e && e.message ? e.message : e);
    }
}

if (!fs.existsSync(dir)) {
  console.error('Directory does not exist:', dir);
  process.exit(2);
}

walk(dir);
// After making per-file replacements, attempt to collapse any accidental
// repeated base prefixes introduced by earlier replacements.
collapseRepeatedBase(dir, base);
console.log('Done.');
