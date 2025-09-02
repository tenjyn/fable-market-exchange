// news-ticker.js - handles persistent scrolling news banner

document.addEventListener('DOMContentLoaded', () => {
  const ticker = document.getElementById('newsContent');
  if (!ticker) return;

  const archive = JSON.parse(localStorage.getItem('newsArchive')) || [];
  if (archive.length === 0) {
    ticker.textContent = 'No news yet';
    return;
  }

  const content = archive.join('  |  ');
  ticker.textContent = content + '  |  ' + content;

  ticker.style.animation = 'none';
  void ticker.offsetWidth;
  ticker.style.animation = '';
  ticker.style.animation = 'ticker 30s linear infinite';
});
