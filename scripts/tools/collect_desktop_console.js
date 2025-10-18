#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function run(url, outFile) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    try { logs.push({ type: 'console', text: msg.text(), args: msg.args().length }); } catch (e) {}
  });
  page.on('pageerror', err => logs.push({ type: 'pageerror', message: err.message, stack: err.stack }));

  const requests = [];
  const failures = [];
  // Maintain a short ring of recent network events to correlate with console messages
  const recent = [];
  function pushRecent(item) {
    recent.push(item);
    if (recent.length > 20) recent.shift();
  }
  page.on('request', req => {
    const info = { type: 'request', url: req.url(), method: req.method(), resourceType: req.resourceType() };
    requests.push(info);
    pushRecent(info);
  });
  page.on('response', async res => {
    try {
      const ct = res.headers()['content-type'] || '';
      const info = { type: 'response', url: res.url(), status: res.status(), contentType: ct };
      requests.push(info);
      pushRecent(info);
      if (res.status() >= 400) {
        let text = '';
        try { text = await res.text(); } catch (e) {}
        failures.push({ url: res.url(), status: res.status(), snippet: (text || '').slice(0, 200) });
      }
    } catch (e) {}
  });

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => logs.push({ type: 'gotoError', message: e.message }));
  // Wait for the main application root to appear instead of using waitForTimeout,
  // which may not be available in some Puppeteer versions.
  try {
    await page.waitForSelector('main', { timeout: 5000 });
  } catch (e) {
    // fallback small delay
    await new Promise(r => setTimeout(r, 1500));
  }

  // Attach a snapshot of recent network events to each console log entry to help debug 404s
  const enrichedLogs = logs.map(l => ({...l, recentNetwork: recent.slice()}));
  const result = { url, logs: enrichedLogs, requests, failures };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2));

  await browser.close();
  return result;
}

if (require.main === module) {
  const url = process.argv[2] || 'http://localhost:5001/htmaa2/desktop/';
  const out = process.argv[3] || path.join(process.cwd(), 'desktop-console.json');
  run(url, out).then(() => console.log('Done')).catch(err => { console.error(err); process.exit(1); });
}
