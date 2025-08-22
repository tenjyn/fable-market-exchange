function calculateTotalCost(qty, price) {
  return qty * price;
}

function formatMarks(amount) {
  return `₥${Number(amount).toFixed(2)}`;
}

if (typeof module !== 'undefined') {
  module.exports = { calculateTotalCost, formatMarks };
}
