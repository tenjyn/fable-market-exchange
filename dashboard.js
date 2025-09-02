// dashboard.js — simple portfolio summary on dashboard page

document.addEventListener('DOMContentLoaded', () => {
  const summary = document.getElementById('dashboardSummary');
  if (!summary) return;

  try {
    const { marks, portfolio } = loadPortfolioData();
    const codes = Object.keys(portfolio);
    const holdings = codes.length ? codes.join(', ') : 'none yet';
    summary.innerHTML = `
      <p>Available Funds: <strong>₥${marks.toFixed(2)}</strong></p>
      <p>Current Holdings: <em>${holdings}</em></p>
    `;
  } catch (e) {
    summary.textContent = 'Unable to load portfolio data.';
  }
});
