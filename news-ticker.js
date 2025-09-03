// news-ticker.js - handles persistent scrolling news banner

document.addEventListener('DOMContentLoaded', () => {
  const ticker = document.getElementById('newsContent');
  if (!ticker) return;

  function formatMarks(amount) {
    return `₥${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function renderTicker() {
    const archive = JSON.parse(localStorage.getItem('newsArchive')) || [];
    const prices = (JSON.parse(localStorage.getItem('securitiesData')) || []).map(s => {
      const change = s.basePrice ? ((s.price - s.basePrice) / s.basePrice) * 100 : 0;
      return `${s.code} ${formatMarks(s.price)} (${change.toFixed(2)}%)`;
    });
    const items = [...prices, ...archive];
    if (items.length === 0) {
      ticker.textContent = 'No news yet';
      return;
    }
    const content = items.join('  |  ');
    ticker.textContent = content + '  |  ' + content;

    ticker.style.animation = 'none';
    void ticker.offsetWidth;
    ticker.style.animation = '';
    ticker.style.animation = 'ticker 30s linear infinite';
  }

  renderTicker();
  setInterval(renderTicker, 15000);
});
