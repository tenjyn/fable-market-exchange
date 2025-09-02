// archive.js — renders saved news events

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('archiveList');
  if (!list) return;

  const archive = JSON.parse(localStorage.getItem('newsArchive')) || [];
  if (archive.length === 0) {
    list.innerHTML = '<li>No news events recorded yet.</li>';
    return;
  }

  archive.slice().reverse().forEach(entry => {
    const li = document.createElement('li');
    li.textContent = entry;
    list.appendChild(li);
  });
});
