// exchange-index.js - render all securities in a table

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("securitiesTable");
  if (!tableBody) return;

  function formatMarks(val) {
    return `₥${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  SECURITIES.forEach(sec => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${sec.code}</td>
      <td>${sec.name}</td>
      <td>${formatMarks(sec.price)}</td>
      <td>${sec.volatility}</td>
      <td>${sec.desc}</td>
    `;
    tableBody.appendChild(row);
  });
});

