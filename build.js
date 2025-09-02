const fs = require('fs');
const path = require('path');

// files to bundle
const files = ['storage.js', 'dashboard.js'];
let combined = files.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');

// simple minification: remove comments and extra whitespace
combined = combined
  .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
  .replace(/\/\/.*\n/g, '') // line comments
  .replace(/\s+/g, ' ') // collapse whitespace
  .trim();

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

fs.writeFileSync(path.join(distDir, 'dashboard.bundle.min.js'), combined);
console.log('Bundled and minified to dist/dashboard.bundle.min.js');
