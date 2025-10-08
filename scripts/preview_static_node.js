#!/usr/bin/env node
// Very small static server using only Node core modules.
// Serves apps/web/out under the /htmaa2 path so exported files resolve exactly
// Usage: node scripts/preview_static_node.js [port]

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = Number(process.argv[2]) || 5000;
const root = path.join(__dirname, '..', 'apps', 'web', 'out');

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

function send404(res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('404 Not Found');
}

function serveFile(res, filePath) {
  fs.stat(filePath, (err, st) => {
    if (err) return send404(res);
    if (st.isDirectory()) {
      const index = path.join(filePath, 'index.html');
      return fs.stat(index, (ie, ist) => {
        if (ie) return send404(res);
        fs.createReadStream(index).pipe(res);
      });
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  // Redirect root to /htmaa2/
  if (parsed.pathname === '/') {
    res.writeHead(302, { Location: '/htmaa2/' });
    return res.end();
  }

  // Serve both the /htmaa2 prefixed site and common root asset paths so
  // previews work whether code requests /assets/... or /htmaa2/assets/...
  let filePath = null;

  // Redirect root to /htmaa2/
  if (parsed.pathname === '/') {
    res.writeHead(302, { Location: '/htmaa2/' });
    return res.end();
  }

  if (parsed.pathname.startsWith('/htmaa2/')) {
    // Map /htmaa2/... -> out/...
    const relPath = parsed.pathname.replace(/^\/htmaa2\//, '');
    filePath = path.join(root, relPath);
  } else if (parsed.pathname.startsWith('/assets/')) {
    // Map /assets/... -> out/assets/...
    const relPath = parsed.pathname.replace(/^\//, '');
    filePath = path.join(root, relPath);
  } else if (parsed.pathname.startsWith('/_next/')) {
    // Map /_next/... -> out/_next/...
    const relPath = parsed.pathname.replace(/^\//, '');
    filePath = path.join(root, relPath);
  } else if (parsed.pathname === '/favicon.ico') {
    filePath = path.join(root, 'favicon.ico');
  } else {
    return send404(res);
  }

  // Security: prevent path traversal
  if (!filePath.startsWith(root)) {
    console.log('Blocked path traversal:', parsed.pathname, filePath);
    return send404(res);
  }

  // Debug logging for troubleshooting missing assets
  console.log('Request:', parsed.pathname, '=>', filePath);

  serveFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Static preview server running at http://localhost:${PORT}/htmaa2/`);
  console.log(`Serving from ${root}`);
});
