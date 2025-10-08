#!/usr/bin/env node
const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

const requestedPort = parseInt(process.argv[2], 10) || 8080;

const ROOT_DIR = path.resolve(__dirname, '..');
const DESKTOP_OUT = path.join(ROOT_DIR, 'apps', 'desktop', 'out');
const WEB_OUT = path.join(ROOT_DIR, 'apps', 'web', 'out');

console.log('Repo root:', ROOT_DIR);

if (!fs.existsSync(WEB_OUT)) {
  die(`Error: web export not found at ${WEB_OUT}\nRun:\n  cd apps/web && NODE_ENV=production BUILD_FOR_GITHUB=true npm run build && NODE_ENV=production BUILD_FOR_GITHUB=true npx next export -o out`);
}

if (!fs.existsSync(DESKTOP_OUT)) {
  die(`Error: desktop export not found at ${DESKTOP_OUT}\nRun:\n  cd apps/desktop && NODE_ENV=production BUILD_FOR_GITHUB=true npm run build && NODE_ENV=production BUILD_FOR_GITHUB=true npx next export -o out`);
}

// Copy desktop out -> web/out/desktop
const targetDesktopDir = path.join(WEB_OUT, 'desktop');
console.log('Copying desktop export into', targetDesktopDir);
try {
  // fs.cp available in Node 16.7+. Use recursive copy.
  fs.mkdirSync(targetDesktopDir, { recursive: true });
  // Copy contents
  fs.cpSync(DESKTOP_OUT, targetDesktopDir, { recursive: true });
} catch (err) {
  die('Failed to copy desktop export: ' + err);
}

// Run the path fixer
const fixerScript = path.join(ROOT_DIR, 'scripts', 'fix_export_paths.js');
if (!fs.existsSync(fixerScript)) {
  die('Missing path fixer script: ' + fixerScript);
}

console.log('Running path fixer...');
const fixer = spawnSync(process.execPath, [fixerScript, WEB_OUT, '/htmaa2'], { stdio: 'inherit' });
if (fixer.error) {
  die('Failed to execute path fixer: ' + fixer.error.message);
}
if (fixer.status !== 0) {
  die('Path fixer exited with status ' + fixer.status, fixer.status || 2);
}

// Start preview server (use Node-only preview script to avoid external deps)
const previewScript = path.join(ROOT_DIR, 'scripts', 'preview_static_node.js');
if (!fs.existsSync(previewScript)) {
  die('Missing preview server script: ' + previewScript);
}

// Find a free port starting at the requested port and start the preview there.
const net = require('net');

function probePort(portToCheck) {
  return new Promise((resolve, reject) => {
    const server = net.createServer().unref();
    server.once('error', (err) => {
      server.close?.();
      reject(err);
    });
    server.once('listening', () => {
      server.close(() => resolve(portToCheck));
    });
    // Bind to localhost only to avoid permission issues
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
      // If port is in use or permission denied, try next
      if (err && (err.code === 'EADDRINUSE' || err.code === 'EACCES')) {
        continue;
      }
      // For other errors, also continue probing
      continue;
    }
  }
  throw new Error(`No free port found starting at ${start}`);
}

(async () => {
  try {
    const chosen = await findFreePort(requestedPort, 1000);
    console.log(`Starting Node-only preview server at http://localhost:${chosen}/htmaa/`);
    const preview = spawn(process.execPath, [previewScript, String(chosen)], { stdio: 'inherit' });

    preview.on('exit', (code, signal) => {
      if (signal) {
        console.log('Preview server terminated with signal', signal);
        process.exit(1);
      }
      process.exit(code);
    });
  } catch (err) {
    die('Failed to find a free port: ' + err.message);
  }
})();
