#!/usr/bin/env node
// Small static server to serve only the assembled desktop subtree (out/desktop)
// Usage: node scripts/preview_desktop_node.js [port]

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = Number(process.argv[2]) || 5002;
const root = path.join(__dirname, '..', 'out', 'desktop');

const mime = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

function send404(res, reqPath) {
  try {
    if (reqPath) console.log('404 Not Found for', reqPath);
  } catch (e) {}
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('404 Not Found');
}

function serveFile(res, filePath, reqPath) {
  fs.stat(filePath, (err, st) => {
    if (err) return send404(res, reqPath || filePath);
    if (st.isDirectory()) {
      const index = path.join(filePath, 'index.html');
      return fs.stat(index, (ie, ist) => {
        if (ie) return send404(res, reqPath || index);
        fs.createReadStream(index).pipe(res);
      });
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res).on('error', (e) => {
      console.error('Stream error for', filePath, e && e.message);
      send404(res, reqPath || filePath);
    });
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);

  // Decode the URL pathname so percent-encoded characters (eg. %20) map to
  // filesystem filenames containing literal spaces. Fall back to the raw
  // pathname if decoding fails for any reason.
  let pathname = parsed.pathname || '';
  try {
    pathname = decodeURIComponent(pathname);
  } catch (e) {
    // If decode fails, keep the original encoded pathname
    pathname = parsed.pathname || '';
  }

  // Normalize path and disallow traversal
  let rel = pathname.replace(/^\//, '');

  // Support requests that include the deployment base path (e.g. /htmaa2/desktop/...)
  // The assembled output (and earlier path-fixer runs) sometimes produce repeated
  // leading prefixes like '/htmaa2/desktop/htmaa2/desktop/...'. Iteratively
  // strip any number of leading 'htmaa2/desktop/' segments so the remaining
  // path can be resolved relative to the desktop export root.
  const basePrefix = 'htmaa2/desktop/';
  if (rel === 'htmaa2/desktop' || rel === 'htmaa2/desktop/') {
    rel = 'index.html';
  } else {
    while (rel.startsWith(basePrefix)) {
      rel = rel.slice(basePrefix.length);
    }
  }

  if (!rel) rel = 'index.html';
  // Collapse repeated slashes (defensive) and construct the final file path.
  rel = rel.replace(/\/+/g, '/');
  const filePath = path.join(root, rel);

  if (!filePath.startsWith(root)) {
    console.log('Blocked path traversal:', parsed.pathname, filePath);
    return send404(res);
  }

  console.log('Desktop preview request:', parsed.pathname, '=>', filePath);
  serveFile(res, filePath, parsed.pathname);
});

server.listen(PORT, () => {
  console.log(`Desktop static preview server running at http://localhost:${PORT}/`);
  console.log(`Serving from ${root}`);
});
