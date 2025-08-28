if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('site-nav');
    if (!nav) return;
    const pages = [
      { href: 'dashboard.html', label: 'Dashboard' },
      { href: 'portfolio.html', label: 'Portfolio' },
      { href: 'index.html', label: 'Exchange' },
      { href: 'archive.html', label: 'Archive' },
      { href: 'civic-report.html', label: 'The Civic Report' }
    ];
    const current = (location.pathname.split('/').pop() || 'index.html');
    pages.forEach((p, i) => {
      const a = document.createElement('a');
      a.href = p.href;
      a.textContent = p.label;
      if (current === p.href) a.classList.add('active');
      nav.appendChild(a);
      if (i < pages.length - 1) nav.appendChild(document.createTextNode(' | '));
    });
  });
}
