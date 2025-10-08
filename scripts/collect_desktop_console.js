const puppeteer = require('puppeteer');

(async () => {
  const url = process.argv[2] || 'http://localhost:3001/';
  const out = {console: [], pageErrors: [], requests: [], responses: []};

  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();

  page.on('console', msg => {
    try {
      out.console.push({type: msg.type(), text: msg.text()});
    } catch (err) { out.console.push({type:'error', text: String(msg)}); }
  });
  page.on('pageerror', err => out.pageErrors.push(String(err)));
  page.on('requestfailed', req => out.requests.push({url: req.url(), failure: req.failure()}));
  page.on('requestfinished', req => out.requests.push({url: req.url(), status: 'finished'}));
  page.on('response', res => {
    const r = {url: res.url(), status: res.status(), ok: res.ok(), headers: res.headers()};
    out.responses.push(r);
  });

  try {
    const resp = await page.goto(url, {waitUntil: 'networkidle2', timeout: 15000});
    out.gotoStatus = resp ? {status: resp.status(), url: resp.url()} : null;
  } catch (err) {
    out.gotoError = String(err);
  }

  // Wait a moment for any async errors
  await new Promise((res) => setTimeout(res, 1200));

  // Try to unhide the document and capture innerHTML snapshot
  const snapshot = await page.evaluate(() => {
    const root = document.getElementById('__next');
    const html = root ? root.innerHTML.slice(0, 3000) : null;
    const hasNextData = typeof window.__NEXT_DATA__ !== 'undefined';
    const scripts = Array.from(document.scripts).map(s => ({src: s.src, defer: s.defer, type: s.type}));
    return {html, hasNextData, scripts};
  });

  out.snapshot = snapshot;

  console.log('---COLLECTED CONSOLE/ERRORS/NETWORK---');
  console.log(JSON.stringify(out, null, 2));

  await browser.close();
  process.exit(0);
})();
