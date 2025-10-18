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
    const fixerBase = process.env.DEPLOY_BASE_PATH || '/htmaa2';
    log('Running path fixer on out/desktop with base', fixerBase);
    const r = spawnSync(process.execPath, [fixer, path.join(OUT_ROOT, 'desktop'), fixerBase], { stdio: 'inherit' });
    if (r.error) die('Path fixer execution failed: ' + r.error.message);
    if (r.status !== 0) die('Path fixer exited with status ' + r.status);
  } else {
    log('Path fixer skipped (missing script or desktop output)');
  }

  log('Assembled static site at', OUT_ROOT);
  process.exit(0);
} catch (err) {
  die(err && err.stack ? err.stack : String(err));
}
