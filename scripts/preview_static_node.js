#!/usr/bin/env node
// Very small static server using only Node core modules.
// Serves repo-root out/ under the /htmaa2 path so exported files resolve exactly
// Usage: node scripts/preview_static_node.js [port]

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Default web/static preview port (serves repo-root out/ under /htmaa2)
const PORT = Number(process.argv[2]) || 5001;
const root = path.join(__dirname, '..', 'out');

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
  const rawParsed = url.parse(req.url);
  // Decode percent-encoded pathnames so files with spaces or other encoded
  // characters map correctly to the filesystem. Fall back to the raw
  // pathname on decode errors.
  let decodedPathname = rawParsed.pathname || '/';
  try {
    decodedPathname = decodeURIComponent(decodedPathname);
  } catch (e) {
    // Malformed percent-encoding — keep the raw pathname
  }
  // Collapse repeated slashes to avoid mismatches like //htmaa2//desktop
  decodedPathname = decodedPathname.replace(/\/+/g, '/');
  // Extra normalization: collapse known duplicated base prefixes that
  // sometimes sneak into compiled bundles (e.g. '/htmaa2/desktop/htmaa2/desktop/...')
  // Make this idempotent and conservative so we don't change valid paths.
  (function collapseDuplicates() {
    const patterns = [
      [/\/htmaa2\/desktop\/htmaa2\/desktop\//g, '/htmaa2/desktop/'],
      [/\/htmaa2\/desktop\/htmaa2\//g, '/htmaa2/desktop/'],
      [/\/desktop\/desktop\//g, '/desktop/'],
      [/\/htmaa2\/htmaa2\//g, '/htmaa2/']
    ];
    let prev;
    do {
      prev = decodedPathname;
      for (const [re, sub] of patterns) decodedPathname = decodedPathname.replace(re, sub);
    } while (decodedPathname !== prev);
  })();
  const parsed = Object.assign({}, rawParsed, { pathname: decodedPathname });

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
  } else if (parsed.pathname === '/desktop' || parsed.pathname === '/desktop/') {
    // Allow unprefixed /desktop/ to map to the desktop index for local preview
    filePath = path.join(root, 'desktop', 'index.html');
  } else if (parsed.pathname.startsWith('/desktop/')) {
    // Map /desktop/... -> out/desktop/...
    const relPath = parsed.pathname.replace(/^\/desktop\//, '');
    filePath = path.join(root, 'desktop', relPath);
  } else if (parsed.pathname.startsWith('/assets/')) {
    // Map /assets/... -> out/assets/...
    const relPath = parsed.pathname.replace(/^\//, '');
    filePath = path.join(root, relPath);
  } else if (parsed.pathname.startsWith('/icons/')) {
    // Some built bundles request /icons/... when previewing on localhost.
    // Prefer repo-root out/icons/..., fall back to out/desktop/icons/...
    const relPath = parsed.pathname.replace(/^\//, '');
    const candidate = path.join(root, relPath);
    if (fs.existsSync(candidate)) {
      filePath = candidate;
    } else {
      filePath = path.join(root, 'desktop', relPath);
    }
  } else if (parsed.pathname.startsWith('/fonts/')) {
    // Map /fonts/... -> out/desktop/fonts/...
    // Prefer repo-root out/fonts/..., fall back to out/desktop/fonts/...
    const relPath = parsed.pathname.replace(/^\//, '');
    const candidate = path.join(root, relPath);
    if (fs.existsSync(candidate)) {
      filePath = candidate;
    } else {
      filePath = path.join(root, 'desktop', relPath);
    }
  } else if (parsed.pathname.startsWith('/sounds/')) {
    // Map /sounds/... -> out/desktop/sounds/...
    // Prefer repo-root out/sounds/..., fall back to out/desktop/sounds/...
    const relPath = parsed.pathname.replace(/^\//, '');
    const candidate = path.join(root, relPath);
    if (fs.existsSync(candidate)) {
      filePath = candidate;
    } else {
      filePath = path.join(root, 'desktop', relPath);
    }
  } else if (parsed.pathname.startsWith('/images/')) {
    // Map /images/... -> out/desktop/images/... (covers generic image roots)
    // Prefer repo-root out/images/..., fall back to out/desktop/images/...
    const relPath = parsed.pathname.replace(/^\//, '');
    const candidate = path.join(root, relPath);
    if (fs.existsSync(candidate)) {
      filePath = candidate;
    } else {
      filePath = path.join(root, 'desktop', relPath);
    }
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

  // If the exact desktop-prefixed asset doesn't exist, try a fallback
  // to the repository-level location. Many compiled bundles request
  // "/htmaa2/desktop/assets/..." while shared assets live at
  // "out/assets/..." (copied from the web app). Try that before
  // returning a 404 to make local previews more forgiving.
  try {
    if (!fs.existsSync(filePath) && parsed.pathname.startsWith('/htmaa2/desktop/')) {
      const altRel = parsed.pathname.replace(/^\/htmaa2\/desktop\//, '');
      const altCandidate = path.join(root, altRel);
      if (fs.existsSync(altCandidate)) {
        console.log('Fallback mapping:', parsed.pathname, '=>', altCandidate);
        filePath = altCandidate;
      }
    }
  } catch (e) {
    // ignore filesystem lookup errors and continue to normal handling
  }

  // Debug logging for troubleshooting missing assets
  console.log('Request:', parsed.pathname, '=>', filePath);

  serveFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Static preview server running at http://localhost:${PORT}/htmaa2/`);
  console.log(`Serving from ${root}`);
});
