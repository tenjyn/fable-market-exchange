// dashboard.js — simple portfolio summary on dashboard page

document.addEventListener('DOMContentLoaded', () => {
  const summary = document.getElementById('dashboardSummary');
  if (!summary) return;

  try {
    const { marks, portfolio } = loadPortfolioData();
    const codes = Object.keys(portfolio);
    const holdings = codes.length ? codes.join(', ') : 'none yet';
    const fragment = document.createDocumentFragment();

    const fundsP = document.createElement('p');
    fundsP.textContent = 'Available Funds: ';
    const marksStrong = document.createElement('strong');
    marksStrong.textContent = `₥${marks.toFixed(2)}`;
    fundsP.appendChild(marksStrong);

    const holdingsP = document.createElement('p');
    holdingsP.textContent = 'Current Holdings: ';
    const holdingsEm = document.createElement('em');
    holdingsEm.textContent = holdings;
    holdingsP.appendChild(holdingsEm);

    fragment.append(fundsP, holdingsP);

    summary.textContent = '';
    summary.appendChild(fragment);
  } catch (e) {
    summary.textContent = 'Unable to load portfolio data.';
  }
});
