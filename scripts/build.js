const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const BUILD_TIME = new Date().toISOString();
const BUILD_TIME_SHORT = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });

// Clean and create dist
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
fs.mkdirSync(DIST, { recursive: true });

// Copy index.html and inject build time
let index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
index = index.replace(/__BUILD_TIME__/g, BUILD_TIME_SHORT);
fs.writeFileSync(path.join(DIST, 'index.html'), index);

// Copy Assets recursively (Node 16.7+)
const assetsSrc = path.join(ROOT, 'Assets');
const assetsDest = path.join(DIST, 'Assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDest, { recursive: true });
}

// Write build info for debugging (e.g. /build-info.json)
fs.writeFileSync(
  path.join(DIST, 'build-info.json'),
  JSON.stringify({
    built: BUILD_TIME,
    builtShort: BUILD_TIME_SHORT,
    branch: process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || 'unknown',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'unknown'
  }, null, 2)
);

console.log('Build done. Built:', BUILD_TIME_SHORT);
