// Lightweight preview server that mounts the exported `apps/web/out` under `/htmaa2`.
// Usage: node scripts/preview_static.js [port]
const express = require('express');
const path = require('path');

const PORT = Number(process.argv[2]) || 5000;
const app = express();

const outDir = path.join(__dirname, '..', 'apps', 'web', 'out');

app.use('/htmaa2', express.static(outDir, {
  extensions: ['html'],
  index: 'index.html',
}));

app.get('/', (req, res) => res.redirect('/htmaa2/'));
app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Preview server running at http://localhost:${PORT}/htmaa2/`);
  console.log(`Serving files from ${outDir}`);
});
