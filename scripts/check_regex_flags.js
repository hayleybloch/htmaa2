const fs = require('fs');
const path = require('path');
const dir = path.resolve(process.argv[2] || 'out/desktop/_next/static/chunks');

function walk(d) {
  let r = [];
  for (const e of fs.readdirSync(d)) {
    const f = path.join(d, e);
    if (fs.statSync(f).isDirectory()) r = r.concat(walk(f));
    else r.push(f);
  }
  return r;
}

const files = walk(dir);
const regex = /\/(?:[^\\\/]|\\.)+\/[a-zA-Z]*/g;
const validFlags = new Set(['g','i','m','s','u','y']);
let problems = [];
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = regex.exec(s)) !== null) {
    const full = m[0];
    const lastSlash = full.lastIndexOf('/');
    const flags = full.slice(lastSlash + 1);
    for (const ch of flags) {
      if (!validFlags.has(ch)) {
        problems.push({ file: f, match: full, flags, idx: m.index });
        break;
      }
    }
  }
}

if (problems.length === 0) {
  console.log('NO_PROBLEMS');
  process.exit(0);
}
console.log(JSON.stringify(problems, null, 2));
