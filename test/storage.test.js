const test = require('node:test');
const assert = require('node:assert/strict');
let loadPortfolioData, savePortfolioData;

class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

test.beforeEach(() => {
  global.localStorage.clear();
  delete require.cache[require.resolve('../storage.js')];
  ({ loadPortfolioData, savePortfolioData } = require('../storage.js'));
});

test('loadPortfolioData returns defaults when storage empty', () => {
  const data = loadPortfolioData();
  assert.deepEqual(data, { marks: 1000, portfolio: {}, tradeHistory: [] });
});

test('loadPortfolioData converts numeric portfolio entries', () => {
  localStorage.setItem('fablePortfolio', JSON.stringify({
    marks: 1200,
    portfolio: { WHT: 5 },
    tradeHistory: []
  }));
  const data = loadPortfolioData();
  assert.deepEqual(data.portfolio, { WHT: { units: 5, avgCost: 0 } });
  assert.strictEqual(data.marks, 1200);
});

test('savePortfolioData writes data to localStorage', () => {
  const payload = { marks: 500, portfolio: { WHT: { units: 2, avgCost: 100 } }, tradeHistory: ['a'] };
  savePortfolioData(payload);
  const raw = localStorage.getItem('fablePortfolio');
  assert.ok(raw);
  const parsed = JSON.parse(raw);
  assert.deepEqual(parsed, payload);
});

test('loadPortfolioData handles invalid JSON', () => {
  localStorage.setItem('fablePortfolio', '{bad json');
  const originalError = console.error;
  console.error = () => {};
  const data = loadPortfolioData();
  console.error = originalError;
  assert.deepEqual(data, { marks: 1000, portfolio: {}, tradeHistory: [] });
  assert.strictEqual(localStorage.getItem('fablePortfolio'), null);
});

test('loadPortfolioData caches values until savePortfolioData updates', () => {
  localStorage.setItem('fablePortfolio', JSON.stringify({
    marks: 1000,
    portfolio: { WHT: { units: 1, avgCost: 0 } },
    tradeHistory: []
  }));

  const first = loadPortfolioData();

  // modify storage directly; load should still return cached data
  localStorage.setItem('fablePortfolio', JSON.stringify({
    marks: 2000,
    portfolio: { WHT: { units: 2, avgCost: 0 } },
    tradeHistory: []
  }));
  const second = loadPortfolioData();
  assert.deepEqual(second, first);

  // saving new data updates the cache
  const newData = { marks: 3000, portfolio: { WHT: { units: 3, avgCost: 0 } }, tradeHistory: [] };
  savePortfolioData(newData);
  const third = loadPortfolioData();
  assert.deepEqual(third, newData);
});
