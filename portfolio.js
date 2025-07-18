// portfolio.js – full rewrite with profit/loss, trade history, and allocation chart support

document.addEventListener("DOMContentLoaded", () => {
  const totalValueEl = document.getElementById("totalValue");
  const totalPLEl = document.getElementById("totalPL");
  const holdingsTable = document.getElementById("holdingsTable");
  const tradeHistoryEl = document.getElementById("tradeHistory");
  const ctx = document.getElementById("allocationChart").getContext("2d");

  const securities = generateSecurities();
  const stored = loadPortfolio();
  const portfolio = stored.portfolio;
  let marks = stored.marks;
  const tradeHistory = stored.tradeHistory;

  const productDropdown = document.getElementById("productDropdown");
  const tradeQtyInput = document.getElementById("tradeQty");
  const buyButton = document.getElementById("buyButton");
  const sellButton = document.getElementById("sellButton");
  const priceData = document.getElementById("priceData");
  const descriptionData = document.getElementById("descriptionData");
  const volatilityData = document.getElementById("volatilityData");
  const priceChartEl = document.getElementById("priceChart");
  const marksDisplay = document.getElementById("marksDisplay");
  const priceCtx = priceChartEl ? priceChartEl.getContext("2d") : null;
  let priceChart = null;
  let selectedSecurity = null;

  renderPortfolio();
  renderTradeHistory();
  drawAllocationChart();

  if (productDropdown && tradeQtyInput && buyButton && sellButton) {
    securities.forEach(sec => {
      const opt = document.createElement("option");
      opt.value = sec.code;
      opt.textContent = `${sec.code} - ${sec.name}`;
      productDropdown.appendChild(opt);
    });

    productDropdown.addEventListener("change", () => {
      selectedSecurity = securities.find(s => s.code === productDropdown.value);
      updatePriceDisplay();
      drawPriceChart();
    });

    buyButton.addEventListener("click", () => trade("buy"));
    sellButton.addEventListener("click", () => trade("sell"));

    selectedSecurity = securities[0];
    productDropdown.value = selectedSecurity.code;
    updatePriceDisplay();
    drawPriceChart();
    updateFundsDisplay();
  }

  function generateSecurities() {
    return [
      { code: "WHT", name: "Wheat Futures", price: 120, desc: "Grain commodity.", sector: "Grain", volatility: 0.03 },
      { code: "OBL", name: "Oswald Bonds", price: 200, desc: "Infrastructure bond.", sector: "Infrastructure", volatility: 0.02 },
      { code: "FMR", name: "Fae Mirror Shards", price: 350, desc: "Luxury magical good.", sector: "Magical", volatility: 0.08 },
      { code: "CNT", name: "Cattle Contracts", price: 160, desc: "Livestock asset.", sector: "Grain", volatility: 0.025 },
      { code: "BNS", name: "Beans Scrip", price: 95, desc: "Staple commodity.", sector: "Grain", volatility: 0.04 },
      { code: "CRN", name: "Corn Contracts", price: 110, desc: "Food staple.", sector: "Grain", volatility: 0.035 },
      { code: "GHM", name: "Golem Housing Mortgages", price: 280, desc: "Magical construction credit.", sector: "Infrastructure", volatility: 0.06 },
      { code: "LLF", name: "Living Lumber Futures", price: 210, desc: "Fey-grown timber.", sector: "Magical", volatility: 0.05 },
      { code: "SLK", name: "Sunleaf Kettles", price: 75, desc: "Alchemical ingredient.", sector: "Magical", volatility: 0.07 },
      { code: "BRK", name: "Barony Roadkeepers Bond", price: 180, desc: "Civic infrastructure bond.", sector: "Infrastructure", volatility: 0.03 },
      { code: "PRL", name: "Pearl Contracts", price: 260, desc: "Luxury marine goods.", sector: "Magical", volatility: 0.04 },
      { code: "SRL", name: "Salt Rail Shares", price: 190, desc: "Transportation network.", sector: "Infrastructure", volatility: 0.05 }
    ];
  }

  function loadPortfolio() {
    const saved = JSON.parse(localStorage.getItem("fablePortfolio")) || {};
    return {
      marks: saved.marks || 1000,
      portfolio: saved.portfolio || {},
      tradeHistory: saved.tradeHistory || []
    };
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

  function drawPriceChart() {
    if (!priceCtx || !selectedSecurity) return;
    if (priceChart) priceChart.destroy();
    const history = generatePriceHistory(
      selectedSecurity.price,
      selectedSecurity.volatility || 0.05
    );
    priceChart = new Chart(priceCtx, {
      type: "line",
      data: {
        labels: history.map((_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: `${selectedSecurity.code} Price`,
            data: history,
            borderColor: "#7ad9ff",
            backgroundColor: "rgba(122,217,255,0.1)",
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { x: { display: false }, y: { beginAtZero: false } }
      }
    });
  }

  function generatePriceHistory(base, vol) {
    const history = [];
    let current = base;
    for (let i = 0; i < 60; i++) {
      const change = current * (Math.random() * vol * 2 - vol);
      current = Math.max(1, current + change);
      history.push(current.toFixed(2));
    }
    return history;
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

  function updatePriceDisplay() {
    if (priceData && selectedSecurity) {
      priceData.textContent = `Price: ${formatMarks(selectedSecurity.price)}`;
    }
    if (descriptionData && selectedSecurity) {
      descriptionData.textContent = selectedSecurity.desc || "";
    }
    if (volatilityData && selectedSecurity) {
      volatilityData.textContent =
        selectedSecurity.volatility != null
          ? `Volatility: ${selectedSecurity.volatility}`
          : "";
    }
  }

  function updateFundsDisplay() {
    if (marksDisplay) marksDisplay.textContent = formatMarks(marks);
  }

  function trade(type) {
    if (!selectedSecurity) return alert("Select a security.");
    const qty = parseInt(tradeQtyInput.value);
    if (isNaN(qty) || qty <= 0) return alert("Invalid quantity.");
    const cost = qty * selectedSecurity.price;
    const key = selectedSecurity.code;
    if (type === "buy" && marks >= cost) {
      marks -= cost;
      if (!portfolio[key]) portfolio[key] = { units: 0, avgCost: 0 };
      const hold = portfolio[key];
      hold.avgCost = (hold.avgCost * hold.units + cost) / (hold.units + qty);
      hold.units += qty;
      tradeHistory.push(`BUY ${qty} ${key} @ ${formatMarks(selectedSecurity.price)}`);
    } else if (type === "sell" && portfolio[key] && portfolio[key].units >= qty) {
      marks += cost;
      portfolio[key].units -= qty;
      tradeHistory.push(`SELL ${qty} ${key} @ ${formatMarks(selectedSecurity.price)}`);
      if (portfolio[key].units === 0) delete portfolio[key];
    } else {
      return alert("Trade failed.");
    }
    savePortfolio();
    renderPortfolio();
    renderTradeHistory();
    updateFundsDisplay();
  }

  function savePortfolio() {
    localStorage.setItem(
      "fablePortfolio",
      JSON.stringify({ marks, portfolio, tradeHistory })
    );
  }

  function randomColor() {
    const h = Math.floor(Math.random() * 360);
    return `hsl(${h}, 70%, 60%)`;
  }
});
