#!/usr/bin/env node
// Probes a list of URLs on the local static preview server and fails
// (exit code != 0) if any return non-2xx.

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configurable via env or defaults
const BASE = process.env.BASE_URL || 'http://localhost:5001/htmaa2';
const TIMEOUT = Number(process.env.PROBE_TIMEOUT_MS || 5000);

const probes = [
  // desktop subtree examples (percent-encoded + normal)
  '/desktop/images/Week-2/fusion%20assembly.mp4',
  '/desktop/images/Week-2/fusion%20assembled%20box%20picture.png',
  '/desktop/images/Week-1/maker%20world.png',
  // root assets
  '/favicon.ico',
  '/desktop/index.html'
];

function head(url) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const opts = { method: 'HEAD', timeout: TIMEOUT };
    const req = lib.request(u, opts, (res) => {
      resolve({ status: res.statusCode });
      res.resume();
    });
    req.on('timeout', () => {
      req.destroy(new Error('timeout'));
      resolve({ status: 0, error: 'timeout' });
    });
    req.on('error', (err) => resolve({ status: 0, error: err && err.message }));
    req.end();
  });
}

async function run() {
  const failures = [];
  console.log('Probing', BASE);
  for (const p of probes) {
    const full = BASE.replace(/\/$/, '') + p;
    process.stdout.write(`Checking ${full} ... `);
    const r = await head(full);
    if (r.status >= 200 && r.status < 300) {
      console.log(`OK (${r.status})`);
    } else {
      console.log(`FAIL (${r.status}${r.error ? ' - ' + r.error : ''})`);
      failures.push({ url: full, result: r });
    }
  }

  if (failures.length) {
    console.error('\nStatic probe failures:');
    failures.forEach((f) => console.error(`${f.url} => ${JSON.stringify(f.result)}`));
    process.exit(2);
  }

  console.log('\nAll static probes OK.');
  process.exit(0);
}

run();
