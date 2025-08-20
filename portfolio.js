// portfolio.js – full rewrite with profit/loss, trade history, and allocation chart support

document.addEventListener("DOMContentLoaded", () => {
  const totalValueEl = document.getElementById("totalValue");
  const totalPLEl = document.getElementById("totalPL");
  const holdingsTable = document.getElementById("holdingsTable");
  const tradeHistoryEl = document.getElementById("tradeHistory");
  const ctx = document.getElementById("allocationChart").getContext("2d");

  const securities = generateSecurities();
  const { portfolio, marks, tradeHistory } = loadPortfolio();

  renderPortfolio();
  renderTradeHistory();
  drawAllocationChart();

  function generateSecurities() {
    return [
      { code: "WHT", name: "Wheat Futures", price: 120, sector: "Grain" },
      { code: "OBL", name: "Oswald Bonds", price: 200, sector: "Infrastructure" },
      { code: "FMR", name: "Fae Mirror Shards", price: 350, sector: "Magical" },
      { code: "CNT", name: "Cattle Contracts", price: 160, sector: "Grain" },
      { code: "BNS", name: "Beans Scrip", price: 95, sector: "Grain" },
      { code: "CRN", name: "Corn Contracts", price: 110, sector: "Grain" },
      { code: "GHM", name: "Golem Housing Mortgages", price: 280, sector: "Infrastructure" },
      { code: "LLF", name: "Living Lumber Futures", price: 210, sector: "Magical" },
      { code: "SLK", name: "Sunleaf Kettles", price: 75, sector: "Magical" },
      { code: "BRK", name: "Barony Roadkeepers Bond", price: 180, sector: "Infrastructure" },
      { code: "PRL", name: "Pearl Contracts", price: 260, sector: "Magical" },
      { code: "SRL", name: "Salt Rail Shares", price: 190, sector: "Infrastructure" }
    ];
  }

  function loadPortfolio() {
    try {
      const raw = localStorage.getItem("fablePortfolio");
      const saved = raw ? JSON.parse(raw) : {};
      return {
        marks: saved.marks || 1000,
        portfolio: saved.portfolio || {},
        tradeHistory: saved.tradeHistory || []
      };
    } catch (e) {
      console.error("Failed to parse portfolio from localStorage", e);
      localStorage.removeItem("fablePortfolio");
      return { marks: 1000, portfolio: {}, tradeHistory: [] };
    }
  }

  function formatMarks(val) {
    return `₥${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  }

  function renderPortfolio() {
    let totalValue = 0;
    let totalPL = 0;
    holdingsTable.innerHTML = "";

    for (const code in portfolio) {
      const sec = securities.find(s => s.code === code);
      const holding = portfolio[code];
      const value = holding.units * sec.price;
      const pl = (sec.price - holding.avgCost) * holding.units;

      totalValue += value;
      totalPL += pl;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${code}</td>
        <td>${sec.name}</td>
        <td>${holding.units}</td>
        <td>${formatMarks(sec.price)}</td>
        <td>${formatMarks(value)}</td>
        <td style="color:${pl >= 0 ? 'lime' : 'crimson'}">${formatMarks(pl)}</td>
      `;
      holdingsTable.appendChild(row);
    }

    totalValueEl.textContent = formatMarks(totalValue);
    totalPLEl.textContent = `${totalPL >= 0 ? '+' : ''}${formatMarks(totalPL)}`;
    totalPLEl.style.color = totalPL >= 0 ? "lime" : "crimson";
  }

  function renderTradeHistory() {
    tradeHistoryEl.innerHTML = "";
    tradeHistory.slice().reverse().forEach(entry => {
      const li = document.createElement("li");
      li.textContent = entry;
      tradeHistoryEl.appendChild(li);
    });
  }

  function drawAllocationChart() {
    const labels = [];
    const values = [];
    const backgroundColors = [];

    for (const code in portfolio) {
      const sec = securities.find(s => s.code === code);
      const holding = portfolio[code];
      labels.push(code);
      values.push(holding.units * sec.price);
      backgroundColors.push(randomColor());
    }

    new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: backgroundColors }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } }
      }
    });
  }

  function randomColor() {
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}, 70%, 60%)`;
  }
});
