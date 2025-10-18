#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function log(...args) { console.log('[assemble]', ...args); }
function die(msg, code = 1) { console.error('[assemble] ERROR', msg); process.exit(code); }

const ROOT = path.resolve(__dirname, '..');
const WEB_OUT = path.join(ROOT, 'apps', 'web', 'out');
const DESKTOP_OUT = path.join(ROOT, 'apps', 'desktop', 'out');
const OUT_ROOT = path.join(ROOT, 'out');

try {
  // Clean out/
  if (fs.existsSync(OUT_ROOT)) {
    log('Removing existing', OUT_ROOT);
    fs.rmSync(OUT_ROOT, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT_ROOT, { recursive: true });

  // Copy web export if present
  if (fs.existsSync(WEB_OUT)) {
    log('Copying web export from', WEB_OUT, 'to', OUT_ROOT);
    fs.cpSync(WEB_OUT, OUT_ROOT, { recursive: true });
  } else {
    log('Warning: web export not found at', WEB_OUT);
  }

  // Copy desktop export into out/desktop if present
  if (fs.existsSync(DESKTOP_OUT)) {
    const desktopTarget = path.join(OUT_ROOT, 'desktop');
    log('Copying desktop export from', DESKTOP_OUT, 'to', desktopTarget);
    fs.mkdirSync(desktopTarget, { recursive: true });
    fs.cpSync(DESKTOP_OUT, desktopTarget, { recursive: true });
  } else {
    log('No desktop export found at', DESKTOP_OUT);
  }

  // Merge web _next/static into out/desktop/_next/static if both exist
  const webNextStatic = path.join(OUT_ROOT, '_next', 'static');
  const desktopNextStatic = path.join(OUT_ROOT, 'desktop', '_next', 'static');
  if (fs.existsSync(webNextStatic)) {
    log('Ensuring desktop _next/static contains web hashed assets');
    fs.mkdirSync(desktopNextStatic, { recursive: true });
    // copy/overwrite
    fs.cpSync(webNextStatic, desktopNextStatic, { recursive: true });
  }

  // Copy public assets from each app into the assembled out folder.
  // This ensures files placed in apps/*/public (images, videos, fonts, etc.)
  // are available in the final static site without manual copying.
  const DESKTOP_PUBLIC = path.join(ROOT, 'apps', 'desktop', 'public');
  const WEB_PUBLIC = path.join(ROOT, 'apps', 'web', 'public');
  try {
    if (fs.existsSync(DESKTOP_PUBLIC)) {
      const desktopDest = path.join(OUT_ROOT, 'desktop');
      log('Copying desktop public assets from', DESKTOP_PUBLIC, 'to', desktopDest);
      fs.mkdirSync(desktopDest, { recursive: true });
      fs.cpSync(DESKTOP_PUBLIC, desktopDest, { recursive: true });
    } else {
      log('No desktop public/ directory found at', DESKTOP_PUBLIC);
    }
  } catch (e) {
    log('Warning: failed to copy desktop public assets:', e && e.message ? e.message : String(e));
  }

  try {
    if (fs.existsSync(WEB_PUBLIC)) {
      const webDest = OUT_ROOT;
      log('Copying web public assets from', WEB_PUBLIC, 'to', webDest);
      fs.cpSync(WEB_PUBLIC, webDest, { recursive: true });
    } else {
      log('No web public/ directory found at', WEB_PUBLIC);
    }
  } catch (e) {
    log('Warning: failed to copy web public assets:', e && e.message ? e.message : String(e));
  }

  // SPA fallbacks
  const index = path.join(OUT_ROOT, 'index.html');
  const fallback = path.join(OUT_ROOT, '404.html');
  if (fs.existsSync(index)) {
    try { fs.copyFileSync(index, fallback); log('Wrote', fallback); } catch (e) { log('Failed to copy index->404:', e.message); }
  }
  const dIndex = path.join(OUT_ROOT, 'desktop', 'index.html');
  const dFallback = path.join(OUT_ROOT, 'desktop', '404.html');
  if (fs.existsSync(dIndex)) {
    try { fs.copyFileSync(dIndex, dFallback); log('Wrote', dFallback); } catch (e) { log('Failed to copy desktop index->404:', e.message); }
  }

  // Run fix_export_paths.js on out/desktop if present.
  // Use DEPLOY_BASE_PATH environment variable when present so the fixer
  // rewrites asset references to the correct deployment subpath (e.g.
  // '/classes/863.25/people/HayleyBloch'). Fall back to the historic
  // '/htmaa2' base for GitHub Pages compatibility.
  const fixer = path.join(ROOT, 'scripts', 'fix_export_paths.js');
  if (fs.existsSync(fixer) && fs.existsSync(path.join(OUT_ROOT, 'desktop'))) {
    // For the desktop export we must include the '/desktop' suffix so
    // the fixer rewrites references to '/htmaa2/desktop/...' (or the
    // DEPLOY_BASE_PATH + '/desktop' if provided). Passing only
    // '/htmaa2' here caused double-prefixed paths like
    // '/htmaa2/desktop/htmaa2/desktop/...'.
    const deployBase = process.env.DEPLOY_BASE_PATH || '';
    const fixerBaseForDesktop = deployBase
      ? (deployBase.startsWith('/') ? deployBase : '/' + deployBase) + '/desktop'
      : '/htmaa2/desktop';
    log('Running path fixer on out/desktop with base', fixerBaseForDesktop);
    const r = spawnSync(process.execPath, [fixer, path.join(OUT_ROOT, 'desktop'), fixerBaseForDesktop], { stdio: 'inherit' });
    if (r.error) die('Path fixer execution failed: ' + r.error.message);
    if (r.status !== 0) die('Path fixer exited with status ' + r.status);
  } else {
    log('Path fixer skipped (missing script or desktop output)');
  }

  // Additional normalization: collapse any accidental repeated base prefixes
  // that may have been introduced by earlier rewrites (e.g. '/htmaa2/desktop/htmaa2/...').
  // This is a best-effort, idempotent pass over textual assets.
  function collapseRepeatedBase(dir, base) {
    try {
      if (!fs.existsSync(dir)) return;
      const exts = ['.html', '.htm', '.css', '.js', '.mjs'];
      const baseNoLeading = base.replace(/^\//, '');
      const mixPattern = new RegExp('(?:\\/' + baseNoLeading + '(?:\\/desktop)?\\/){2,}', 'g');
      const dupPattern = new RegExp('\\/' + baseNoLeading + '\\/' + baseNoLeading + '\\/', 'g');
      const files = [];
      (function walk(d) {
        const entries = fs.readdirSync(d, { withFileTypes: true });
        for (const e of entries) {
          const full = path.join(d, e.name);
          if (e.isDirectory()) walk(full);
          else if (exts.includes(path.extname(e.name).toLowerCase())) files.push(full);
        }
      })(dir);

      for (const f of files) {
        let content = fs.readFileSync(f, 'utf8');
        let newContent = content.replace(mixPattern, (m) => (m.indexOf('/desktop/') !== -1 ? base + '/desktop/' : base + '/'));
        newContent = newContent.replace(dupPattern, '/' + baseNoLeading + '/');
        // Repeat until stable
        let prev;
        do {
          prev = newContent;
          newContent = newContent.replace(mixPattern, (m) => (m.indexOf('/desktop/') !== -1 ? base + '/desktop/' : base + '/'));
          newContent = newContent.replace(dupPattern, '/' + baseNoLeading + '/');
        } while (newContent !== prev);
        if (newContent !== content) {
          fs.writeFileSync(f, newContent, 'utf8');
          log('Collapsed repeated base in', f);
        }
      }
    } catch (e) {
      log('Warning: collapseRepeatedBase failed:', e && e.message ? e.message : String(e));
    }
  }

  try {
    // Use a repo-level base for the general out/ normalization and a
    // desktop-specific base for the desktop subtree. Keep behavior
    // backwards-compatible when DEPLOY_BASE_PATH isn't provided.
    const repoBase = process.env.DEPLOY_BASE_PATH
      ? (process.env.DEPLOY_BASE_PATH.startsWith('/') ? process.env.DEPLOY_BASE_PATH : '/' + process.env.DEPLOY_BASE_PATH)
      : '/htmaa2';
    const desktopBase = process.env.DEPLOY_BASE_PATH
      ? (process.env.DEPLOY_BASE_PATH.startsWith('/') ? process.env.DEPLOY_BASE_PATH : '/' + process.env.DEPLOY_BASE_PATH) + '/desktop'
      : '/htmaa2/desktop';
    collapseRepeatedBase(path.join(OUT_ROOT, 'desktop'), desktopBase);
    collapseRepeatedBase(OUT_ROOT, repoBase);
  } catch (e) {
    log('Warning: post-assembly normalization failed:', e && e.message ? e.message : String(e));
  }

  // Extra pass: some compiled assets still end up with duplicated
  // '/desktop/desktop' segments (or '/htmaa2/desktop/desktop'). Do a
  // lightweight, idempotent sweep to collapse these into a single
  // '/desktop/' occurrence. This is safe for textual assets and helps
  // catch any remaining mis-rewrites from upstream builds.
  try {
    const dupPatterns = [
      [/\/desktop\/desktop\//g, '/desktop/'],
      [/\/htmaa2\/desktop\/desktop\//g, '/htmaa2/desktop/'],
      [/\/htmaa2\/desktop\/htmaa2\/desktop\//g, '/htmaa2/desktop/']
    ];
    const exts = ['.html', '.htm', '.css', '.js', '.mjs'];
    function sweepCollapse(d) {
      if (!fs.existsSync(d)) return;
      (function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) walk(full);
          else if (exts.includes(path.extname(e.name).toLowerCase())) {
            let content = fs.readFileSync(full, 'utf8');
            let updated = content;
            for (const [re, sub] of dupPatterns) updated = updated.replace(re, sub);
            if (updated !== content) {
              fs.writeFileSync(full, updated, 'utf8');
              log('Collapsed desktop duplicates in', full);
            }
          }
        }
      })(d);
    }

    sweepCollapse(path.join(OUT_ROOT, 'desktop'));
    sweepCollapse(OUT_ROOT);
  } catch (e) {
    log('Warning: duplicate-desktop collapse pass failed:', e && e.message ? e.message : String(e));
  }

  log('Assembled static site at', OUT_ROOT);
  process.exit(0);
} catch (err) {
  die(err && err.stack ? err.stack : String(err));
}
