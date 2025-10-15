#!/usr/bin/env node
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const WEEK6_DIR = path.join(__dirname, '..', 'apps', 'desktop', 'public', 'images', 'Week-6');

function human(n) {
  if (n < 1024) return n + ' B';
  if (n < 1024*1024) return (n/1024).toFixed(1) + ' KB';
  return (n/(1024*1024)).toFixed(1) + ' MB';
}

async function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  const full = path.join(WEEK6_DIR, file);
  let statBefore;
  try { statBefore = fs.statSync(full); } catch (e) { console.error('stat failed', full, e); return; }

  const tmp = full + '.tmp';

  try {
    if (ext === '.jpg' || ext === '.jpeg') {
      await sharp(full)
        .jpeg({ quality: 75, mozjpeg: true })
        .toFile(tmp);
    } else if (ext === '.png') {
      // Re-encode PNG with palette to reduce size when possible
      await sharp(full)
        .png({ compressionLevel: 9, palette: true })
        .toFile(tmp);
    } else {
      // skip other files
      return;
    }

    const statAfter = fs.statSync(tmp);
    fs.renameSync(tmp, full);
    console.log(`${file}: ${human(statBefore.size)} -> ${human(statAfter.size)}`);
  } catch (err) {
    console.error('Failed processing', file, err.message || err);
    try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch (e) {}
  }
}

async function main() {
  if (!fs.existsSync(WEEK6_DIR)) {
    console.error('Week-6 directory not found:', WEEK6_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(WEEK6_DIR).filter(f => /\.(jpe?g|png)$/i.test(f));
  if (files.length === 0) { console.log('No JPG/PNG files found to compress.'); return; }

  for (const f of files) {
    // skip files that look already small
    await processFile(f);
  }

  console.log('Compression complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
