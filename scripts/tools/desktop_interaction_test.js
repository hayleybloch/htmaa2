#!/usr/bin/env node
const fs = require('fs');
const puppeteer = require('puppeteer');

async function run(url, outFile) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push({ type: 'console', text: msg.text() }));
  page.on('pageerror', err => logs.push({ type: 'pageerror', message: err.message, stack: err.stack }));

  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('main');

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function clickTooltip(name) {
    try {
      const sel = `button[data-tooltip="${name}"]`;
      await page.waitForSelector(sel, { timeout: 2000 });
      await page.click(sel);
      logs.push({ type: 'action', action: 'click', target: name });
      await sleep(500);
    } catch (e) {
      logs.push({ type: 'actionError', action: 'click', target: name, message: e.message });
    }
  }

  // Click a few dock apps to trigger UI behavior
  await clickTooltip('Finder');
  await clickTooltip('About');
  await clickTooltip('Terminal');

  const requests = [];
  const failures = [];
  const recent = [];
  function pushRecent(i) { recent.push(i); if (recent.length > 20) recent.shift(); }
  page.on('request', req => { const info = { type: 'request', url: req.url(), method: req.method(), resourceType: req.resourceType() }; requests.push(info); pushRecent(info); });
  page.on('response', async res => {
    try {
      const info = { type: 'response', url: res.url(), status: res.status(), contentType: res.headers()['content-type'] || '' };
      requests.push(info); pushRecent(info);
      if (res.status() >= 400) {
        let text = '';
        try { text = await res.text(); } catch (e) {}
        failures.push({ url: res.url(), status: res.status(), snippet: (text || '').slice(0, 200) });
      }
    } catch (e) {}
  });

  // give some time for actions to run
  await sleep(1000);

  // Attach recent network snapshot to logs
  const enrichedLogs = logs.map(l => ({...l, recentNetwork: recent.slice()}));
  const result = { url, logs: enrichedLogs, requests, failures };
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
  await browser.close();
  return result;
}

if (require.main === module) {
  const url = process.argv[2] || 'http://localhost:5003/htmaa2/desktop/';
  const out = process.argv[3] || 'htmaa2/desktop-interaction.json';
  run(url, out).then(r => console.log('Done, wrote', out)).catch(err => { console.error(err); process.exit(1); });
}
