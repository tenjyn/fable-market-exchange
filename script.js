// script.js

document.addEventListener("DOMContentLoaded", () => {
  // Global Variables
  let gold = 1000;
  const portfolio = {};
  const securities = generateSecurities();
  let selected = null;
  let priceChart = null;

  const dropdown = document.getElementById("productDropdown");
  const goldDisplay = document.getElementById("goldDisplay");
  const newsTicker = document.getElementById("newsTicker");
  const portfolioList = document.getElementById("portfolioList");

  // Populate dropdown
  securities.forEach(sec => {
    const option = document.createElement("option");
    option.value = sec.code;
    option.textContent = `${sec.code} - ${sec.name}`;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener("change", () => {
    selected = securities.find(s => s.code === dropdown.value);
    updateStats(selected);
    drawChart(selected);
  });

  document.getElementById("buyButton").addEventListener("click", () => trade("buy"));
  document.getElementById("sellButton").addEventListener("click", () => trade("sell"));

  function generateSecurities() {
    return [
      { code: "WHT", name: "Wheat Futures", price: 120, desc: "Grain commodity.", sector: "Grain", volatility: 0.03 },
      { code: "OBL", name: "Oswald Bonds", price: 200, desc: "Infrastructure bond.", sector: "Infrastructure", volatility: 0.02 },
      { code: "FMR", name: "Fae Mirror Shards", price: 350, desc: "Luxury magical good.", sector: "Magical", volatility: 0.08 }
    ];
  }

  function updateStats(security) {
    document.getElementById("priceData").textContent = `Current Price: ${security.price.toFixed(2)} Marks`;
    document.getElementById("descriptionData").textContent = security.desc;
    document.getElementById("volatilityData").textContent = `Volatility: ${security.volatility}`;
  }

  function drawChart(security) {
    const ctx = document.getElementById("priceChart").getContext("2d");
    if (priceChart) priceChart.destroy();
    const history = generatePriceHistory(security.price, security.volatility);
    priceChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: history.map((_, i) => `T-${history.length - i}`),
        datasets: [{
          label: security.code,
          data: history,
          borderColor: "#7ad9ff",
          backgroundColor: "rgba(122, 217, 255, 0.1)",
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { beginAtZero: false }
        }
      }
    });
  }

  function generatePriceHistory(base, vol) {
    const history = [];
    let current = base;
    for (let i = 0; i < 30; i++) {
      const change = current * (Math.random() * vol * 2 - vol);
      current = Math.max(1, current + change);
      history.push(current.toFixed(2));
    }
    return history;
  }

  function trade(type) {
    if (!selected) return;
    const qty = parseInt(document.getElementById("tradeQty").value);
    if (isNaN(qty) || qty <= 0) return;
    const total = qty * selected.price;
    const key = selected.code;

    if (type === "buy" && gold >= total) {
      gold -= total;
      if (!portfolio[key]) portfolio[key] = 0;
      portfolio[key] += qty;
      logEvent(`✅ Bought ${qty} ${key} for ${total.toFixed(2)} Marks`);
    } else if (type === "sell" && portfolio[key] >= qty) {
      gold += total;
      portfolio[key] -= qty;
      if (portfolio[key] === 0) delete portfolio[key];
      logEvent(`🪙 Sold ${qty} ${key} for ${total.toFixed(2)} Marks`);
    } else {
      logEvent(`⚠️ Trade failed: Check quantity or funds.`);
    }

    updatePortfolio();
  }

  function updatePortfolio() {
    goldDisplay.textContent = gold.toFixed(2);
    portfolioList.innerHTML = "";
    if (Object.keys(portfolio).length === 0) {
      portfolioList.innerHTML = "<li>None owned</li>";
      return;
    }
    for (const code in portfolio) {
      const sec = securities.find(s => s.code === code);
      const val = sec.price * portfolio[code];
      const li = document.createElement("li");
      li.textContent = `${code}: ${portfolio[code]} units (≈ ${val.toFixed(2)} Marks)`;
      portfolioList.appendChild(li);
    }
  }

  function logEvent(message) {
    const archive = document.getElementById("eventArchive");
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement("div");
    entry.textContent = `[${time}] ${message}`;
    archive.prepend(entry);
  }
});
