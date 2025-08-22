const { calculateTotalCost, formatMarks } = require('../utils');

describe('utils', () => {
  test('calculateTotalCost multiplies quantity by price', () => {
    expect(calculateTotalCost(3, 50)).toBe(150);
  });

  test('formatMarks formats number with currency symbol', () => {
    expect(formatMarks(100)).toBe('₥100.00');
  });
});
