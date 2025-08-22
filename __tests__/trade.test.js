const { calculateTrade } = require('../script');

describe('calculateTrade', () => {
  const security = { code: 'ABC', price: 100 };

  test('handles buy when enough marks', () => {
    const { success, marks, portfolio } = calculateTrade(1000, {}, security, 2, 'buy');
    expect(success).toBe(true);
    expect(marks).toBe(800);
    expect(portfolio.ABC).toBe(2);
  });

  test('handles sell with sufficient holdings', () => {
    const { success, marks, portfolio } = calculateTrade(500, { ABC: 5 }, security, 3, 'sell');
    expect(success).toBe(true);
    expect(marks).toBe(800);
    expect(portfolio.ABC).toBe(2);
  });

  test('fails when funds insufficient', () => {
    const { success, marks, portfolio } = calculateTrade(100, {}, security, 2, 'buy');
    expect(success).toBe(false);
    expect(marks).toBe(100);
    expect(portfolio).toEqual({});
  });
});
