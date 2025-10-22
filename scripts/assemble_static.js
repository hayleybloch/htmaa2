#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else if (stat.isFile()) {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function removeDir(p) {
  if (!fs.existsSync(p)) return;
  for (const entry of fs.readdirSync(p)) {
    const full = path.join(p, entry);
    const st = fs.statSync(full);
    if (st.isDirectory()) removeDir(full);
    else fs.unlinkSync(full);
  }
  fs.rmdirSync(p);
}

const repoRoot = path.resolve(__dirname, '..');
const apps = [
  { name: 'web', appDir: path.join(repoRoot, 'apps', 'web') },
  { name: 'desktop', appDir: path.join(repoRoot, 'apps', 'desktop') },
];

const outRoot = path.join(repoRoot, 'out');
if (!fs.existsSync(outRoot)) fs.mkdirSync(outRoot);

for (const { name, appDir } of apps) {
  console.log('Assembling', name);

  const nextDir = path.join(appDir, '.next');
  const publicDir = path.join(appDir, 'public');

  const outAppDir = path.join(outRoot, name);
  // Clean previous out folder for the app
  if (fs.existsSync(outAppDir)) {
    removeDir(outAppDir);
  }
  fs.mkdirSync(outAppDir, { recursive: true });

  // Copy .next to out/<app>/_next
  if (fs.existsSync(nextDir)) {
    const destNext = path.join(outAppDir, '_next');
    console.log('  copying', nextDir, '->', destNext);
    copyRecursive(nextDir, destNext);
  } else {
    console.log('  no .next found at', nextDir);
  }

  // Copy public to out/<app>/
  if (fs.existsSync(publicDir)) {
    console.log('  copying public', publicDir, '->', outAppDir);
    copyRecursive(publicDir, outAppDir);
  } else {
    console.log('  no public dir at', publicDir);
  }

  // If there's an exported out/ inside the app (next export), copy it too
  const exportedOut = path.join(appDir, 'out');
  if (fs.existsSync(exportedOut)) {
    console.log('  copying exported out', exportedOut, '->', outAppDir);
    copyRecursive(exportedOut, outAppDir);
  }
}

// Also copy Eleventy public output (repo-level public directory)
const eleventyPublic = path.join(repoRoot, 'public');
if (fs.existsSync(eleventyPublic)) {
  console.log('Copying Eleventy public -> out/');
  copyRecursive(eleventyPublic, outRoot);
} else {
  console.log('No Eleventy public/ found at', eleventyPublic);
}

console.log('Assemble complete. Output at', outRoot);
