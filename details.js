// details.js - display single security information

document.addEventListener("DOMContentLoaded", () => {
  const marksDisplay = document.getElementById("marksDisplay");
  const detailsPanel = document.getElementById("detailsPanel");
  const chartCanvas = document.getElementById("priceChart");

  const securities = generateSecurities();
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const selected = securities.find(s => s.code === code) || securities[0];

  let marks = 1000;
  const portfolio = {};
  loadPortfolio();
  updatePortfolio();
  updateDetailsPage(selected);
  drawChart(selected);

  function generateSecurities() {
    return [
      { code: "WHT", name: "Wheat Futures", price: 120, desc: "Grain commodity.", volatility: 0.03 },
      { code: "OBL", name: "Oswald Bonds", price: 200, desc: "Infrastructure bond.", volatility: 0.02 },
      { code: "FMR", name: "Fae Mirror Shards", price: 350, desc: "Luxury magical good.", volatility: 0.08 },
      { code: "CNT", name: "Cattle Contracts", price: 160, desc: "Livestock asset.", volatility: 0.025 },
      { code: "BNS", name: "Beans Scrip", price: 95, desc: "Staple commodity.", volatility: 0.04 },
      { code: "CRN", name: "Corn Contracts", price: 110, desc: "Food staple.", volatility: 0.035 },
      { code: "GHM", name: "Golem Housing Mortgages", price: 280, desc: "Magical construction credit.", volatility: 0.06 },
      { code: "LLF", name: "Living Lumber Futures", price: 210, desc: "Fey-grown timber.", volatility: 0.05 },
      { code: "SLK", name: "Sunleaf Kettles", price: 75, desc: "Alchemical ingredient.", volatility: 0.07 },
      { code: "BRK", name: "Barony Roadkeepers Bond", price: 180, desc: "Civic infrastructure bond.", volatility: 0.03 },
      { code: "PRL", name: "Pearl Contracts", price: 260, desc: "Luxury marine goods.", volatility: 0.04 },
      { code: "SRL", name: "Salt Rail Shares", price: 190, desc: "Transportation network.", volatility: 0.05 }
    ];
  }

  function formatMarks(val) {
    return `₥${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function loadPortfolio() {
    const saved = JSON.parse(localStorage.getItem("fablePortfolio"));
    if (saved) {
      marks = saved.marks || 1000;
      Object.assign(portfolio, saved.portfolio || {});
    }
  }

  function updatePortfolio() {
    marksDisplay.textContent = formatMarks(marks);
  }

  function updateDetailsPage(sec) {
    detailsPanel.innerHTML = `
      <h3>${sec.code} - ${sec.name}</h3>
      <p>${sec.desc}</p>
      <p>Current Price: ${formatMarks(sec.price)}</p>
      <p>Volatility: ${sec.volatility}</p>
    `;
    document.getElementById("secTitle").textContent = `${sec.code} Details`;
  }

  function generatePriceHistory(base, vol) {
    const history = [];
    let current = base;
    for (let i = 0; i < 90; i++) {
      const change = current * (Math.random() * vol * 2 - vol);
      current = Math.max(1, current + change);
      history.push(current.toFixed(2));
    }
    return history;
  }

  function drawChart(sec) {
    if (!chartCanvas || !chartCanvas.getContext) return;
    const ctx = chartCanvas.getContext("2d");
    const data = generatePriceHistory(sec.price, sec.volatility);
    new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((_, i) => `Day ${i + 1}`),
        datasets: [{ label: `${sec.code} Price History`, data, borderColor: "#7ad9ff", backgroundColor: "rgba(122,217,255,0.1)", fill: true }]
      },
      options: { responsive: true, plugins: { legend: { display: true } } }
    });
  }
});
