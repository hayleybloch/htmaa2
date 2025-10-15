#!/usr/bin/env node
// Dev helper: watch src for changes, build & export static Next apps, copy desktop export into web/out/desktop,
// run the path fixer, and serve the combined out/ directory statically. This is intended for local testing
// before committing and pushing to a static site host.

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const net = require('net');

const ROOT_DIR = path.resolve(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const DESKTOP_DIR = path.join(APPS_DIR, 'desktop');
const WEB_DIR = path.join(APPS_DIR, 'web');
const DESKTOP_OUT = path.join(DESKTOP_DIR, 'out');
const WEB_OUT = path.join(WEB_DIR, 'out');
const PREVIEW_PORT = parseInt(process.argv[2], 10) || 8080;

function runCommand(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
    p.on('exit', (code, signal) => {
      if (signal) return reject(new Error(`Process ${cmd} killed by signal ${signal}`));
      if (code === 0) return resolve();
      reject(new Error(`Process ${cmd} exited with code ${code}`));
    });
    p.on('error', (err) => reject(err));
  });
}

async function buildAndExport(appDir) {
  console.log(`Building ${appDir}...`);
  await runCommand('npm', ['run', 'build'], { cwd: appDir });
  console.log(`Exporting ${appDir} to out/ ...`);
  // Modern Next can produce a static `out/` during `next build` when `output: 'export'`
  // Check whether the out/ directory exists; if so, skip calling `next export`.
  const outDir = path.join(appDir, 'out');
  if (fs.existsSync(outDir)) {
    console.log('Found out/ after build, skipping `next export`.');
    return;
  }

  // Fallback: try running `npx next export` for older Next versions that still support it.
  try {
    await runCommand('npx', ['next', 'export'], { cwd: appDir });
  } catch (err) {
    console.warn('`npx next export` failed or is not supported by this Next version.');
    console.warn('If you rely on static export, enable `output: "export"` in next.config.js or use a build that writes to `out/`.');
    throw err;
  }
}

function copyDesktopIntoWeb() {
  const targetDesktopDir = path.join(WEB_OUT, 'desktop');
  console.log('Copying desktop export into', targetDesktopDir);
  fs.mkdirSync(targetDesktopDir, { recursive: true });
  // fs.cpSync is available in Node >=16.7
  try {
    fs.cpSync(DESKTOP_OUT, targetDesktopDir, { recursive: true });
  } catch (err) {
    // fallback to manual copy
    const { readdirSync, statSync, mkdirSync, copyFileSync } = fs;
    function copyRecursive(src, dest) {
      const stats = statSync(src);
      if (stats.isDirectory()) {
        mkdirSync(dest, { recursive: true });
        for (const entry of readdirSync(src)) {
          copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
      } else {
        copyFileSync(src, dest);
      }
    }
    copyRecursive(DESKTOP_OUT, targetDesktopDir);
  }
  // Ensure hashed _next static assets from web/out/_next/static are available under desktop/_next/static
  try {
    const webNextStatic = path.join(WEB_OUT, '_next', 'static');
    const desktopNextStatic = path.join(targetDesktopDir, '_next', 'static');
    if (fs.existsSync(webNextStatic)) {
      fs.mkdirSync(desktopNextStatic, { recursive: true });
      // copy files from webNextStatic into desktopNextStatic, but don't delete existing desktop assets
      try {
        // prefer fs.cpSync when available
        fs.cpSync(webNextStatic, desktopNextStatic, { recursive: true });
      } catch (e) {
        // fallback to manual copy
        function copyIfMissing(src, dest) {
          const entries = fs.readdirSync(src, { withFileTypes: true });
          for (const ent of entries) {
            const s = path.join(src, ent.name);
            const d = path.join(dest, ent.name);
            if (ent.isDirectory()) {
              if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
              copyIfMissing(s, d);
            } else {
              // overwrite to ensure consistent assets
              fs.copyFileSync(s, d);
            }
          }
        }
        copyIfMissing(webNextStatic, desktopNextStatic);
      }
    }
  } catch (err) {
    console.warn('Failed to merge _next static assets into desktop:', err && err.message);
  }
}

function runPathFixer() {
  const fixerScript = path.join(ROOT_DIR, 'scripts', 'fix_export_paths.js');
  if (!fs.existsSync(fixerScript)) throw new Error('Missing path fixer script: ' + fixerScript);
  console.log('Running path fixer...');
  const r = spawnSync(process.execPath, [fixerScript, WEB_OUT, '/htmaa2'], { stdio: 'inherit' });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error('Path fixer failed with status ' + r.status);
}

let previewProcess = null;
async function probePort(portToCheck) {
  return new Promise((resolve, reject) => {
    const server = net.createServer().unref();
    server.once('error', (err) => {
      server.close?.();
      reject(err);
    });
    server.once('listening', () => {
      server.close(() => resolve(portToCheck));
    });
    server.listen(portToCheck, '127.0.0.1');
  });
}

async function findFreePort(start, maxAttempts = 100) {
  for (let i = 0; i < maxAttempts; i++) {
    const p = start + i;
    try {
      await probePort(p);
      return p;
    } catch (err) {
      if (err && (err.code === 'EADDRINUSE' || err.code === 'EACCES')) continue;
      continue;
    }
  }
  throw new Error(`No free port found starting at ${start}`);
}

async function startPreview() {
  const previewScript = path.join(ROOT_DIR, 'scripts', 'preview_static_node.js');
  if (!fs.existsSync(previewScript)) throw new Error('Missing preview server script: ' + previewScript);
  if (previewProcess) {
    console.log('Stopping existing preview server...');
    previewProcess.kill('SIGINT');
  }
  const chosen = await findFreePort(PREVIEW_PORT, 1000);
  console.log(`Starting preview server on port ${chosen}...`);
  previewProcess = spawn(process.execPath, [previewScript, String(chosen)], { stdio: 'inherit' });
}

let busy = false;
let pending = false;

async function rebuildAll() {
  if (busy) {
    pending = true;
    return;
  }
  busy = true;
  try {
    // Build and export web and desktop
    await buildAndExport(WEB_DIR);
    await buildAndExport(DESKTOP_DIR);

    // Ensure web/out exists
    if (!fs.existsSync(WEB_OUT)) throw new Error('web export missing after build');
    if (!fs.existsSync(DESKTOP_OUT)) throw new Error('desktop export missing after build');

    copyDesktopIntoWeb();
    runPathFixer();

    startPreview();
    console.log('Rebuild and preview ready.');
  } catch (err) {
    console.error('Rebuild failed:', err);
  } finally {
    busy = false;
    if (pending) {
      pending = false;
      console.log('Pending changes detected, rebuilding...');
      rebuildAll();
    }
  }
}

async function main() {
  console.log('Starting full static dev preview...');
  console.log('Watching', DESKTOP_DIR, 'and', WEB_DIR, 'for changes.');

  // Initial build
  await rebuildAll();

  const watcher = chokidar.watch([path.join(WEB_DIR, 'pages'), path.join(WEB_DIR, 'public'), path.join(DESKTOP_DIR, 'pages'), path.join(DESKTOP_DIR, 'public')], {
    ignored: /(^|[\\])\../, // ignore dotfiles
    ignoreInitial: true,
    persistent: true,
  });

  watcher.on('all', (event, changedPath) => {
    console.log(`Detected ${event} on ${changedPath}`);
    rebuildAll();
  });

  process.on('SIGINT', () => {
    console.log('Shutting down...');
    watcher.close();
    if (previewProcess) previewProcess.kill('SIGINT');
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
