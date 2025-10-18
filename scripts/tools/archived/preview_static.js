#!/usr/bin/env node
// Archived: moved from scripts/preview_static.js
const express = require('express');
const path = require('path');

const PORT = Number(process.argv[2]) || 5000;
const app = express();

const outDir = path.join(__dirname, '..', '..', 'out');

app.use('/htmaa2', express.static(outDir, {
  extensions: ['html'],
  index: 'index.html',
}));

app.get('/', (req, res) => res.redirect('/htmaa2/'));
app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Archived preview server running at http://localhost:${PORT}/htmaa2/`);
  console.log(`Serving files from ${outDir}`);
});
