const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class LocalStorageMock {
  constructor() { this.store = {}; }
  clear() { this.store = {}; }
  getItem(key) { return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
}

function createDom() {
  let domContentLoaded;
  const summary = { innerHTML: '' };
  const document = {
    getElementById(id) { return id === 'dashboardSummary' ? summary : null; },
    addEventListener(event, cb) { if (event === 'DOMContentLoaded') domContentLoaded = cb; }
  };
  return { document, summary, trigger: () => domContentLoaded && domContentLoaded() };
}

test('dashboard bundle populates summary', () => {
  global.localStorage = new LocalStorageMock();
  const { document, summary, trigger } = createDom();
  global.document = document;
  const bundle = fs.readFileSync('dist/dashboard.bundle.min.js', 'utf8');
  vm.runInThisContext(bundle);
  localStorage.setItem('fablePortfolio', JSON.stringify({ marks: 1234.56, portfolio: { XYZ: { units: 1, avgCost: 0 } }, tradeHistory: [] }));
  trigger();
  assert.ok(summary.innerHTML.includes('₥1234.56'));
  assert.ok(summary.innerHTML.includes('XYZ'));
});
