#!/usr/bin/env node
// Lightweight static preview server for assembled `out/` directory.
// Usage: node scripts/preview_static_node.js [port]
const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 5002;
const repoRoot = path.resolve(__dirname, '..');
const outDir = path.join(repoRoot, 'out');

function findBestBase() {
  // Prefer explicit env var
  const envBase = process.env.DEPLOY_BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH;
  if (envBase) return envBase.replace(/\/$/, '');

  // If there's a top-level folder named "htmaa2", prefer that
  const ht = path.join(outDir, 'htmaa2');
  if (fs.existsSync(ht) && fs.statSync(ht).isDirectory()) return '/htmaa2';

  // Otherwise, look for a folder that looks like a deployed base (contains 'desktop' or 'web')
  try {
    const children = fs.readdirSync(outDir).filter(n => n !== 'assets' && n !== '_next');
    for (const name of children) {
      const full = path.join(outDir, name);
      if (!fs.statSync(full).isDirectory()) continue;
      // If directory contains a nested `desktop` or `_next`, treat it as base
      const desktop = path.join(full, 'desktop');
      const next = path.join(full, '_next');
      if (fs.existsSync(desktop) || fs.existsSync(next)) return '/' + name;
    }
    // fallback: first directory
    if (children.length) return '/' + children[0];
  } catch (e) {
    // ignore
  }
  return '/';
}

if (!fs.existsSync(outDir)) {
  console.error('out/ directory not found at', outDir);
  process.exit(2);
}

const app = express();

// Serve static files from out/ at root so absolute paths like /classes/... work
app.use(express.static(outDir, { extensions: ['html'], index: false }));

const base = findBestBase();

// If base is root, serve index.html from out/index.html
if (base === '/' || base === '') {
  app.get('/', (req, res) => res.sendFile(path.join(outDir, 'index.html')));
} else {
  // Mount a static handler at the base path as well
  const basePrefix = base.replace(/\/$/, '');
  app.use(basePrefix, express.static(outDir, { extensions: ['html'], index: 'index.html' }));
  // Redirect root to the base path
  app.get('/', (req, res) => res.redirect(basePrefix + '/'));
}

app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Preview static server running at http://localhost:${PORT}${base === '/' ? '/' : base + '/'}`);
  console.log(`Serving files from ${outDir}`);
});
