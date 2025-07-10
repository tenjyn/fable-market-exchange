let chart;
let ctx;
let gold = 1000;
let portfolio = {};
let markets = {};
let productDropdown;

const initialMarkets = ["WHEA", "BEAN", "CORN", "RICE", "CATT"];

const marketDescriptions = {
  WHEA: "Wheat – staple crop tied to harvests and storms.",
  BEAN: "Beans – hearty and beloved by Bushai traders.",
  CORN: "Corn – favored export, tracked by barony tariffs.",
  RICE: "Rice – dominant in the southern wetlands.",
  CATT: "Cattle – priced for meat, milk, and magical marrow."
};

const npcNames = [
  "The Royal Frog Bank 🐸",
  "Oswald Bank 🐺",
  "TLBN: Respectible Moneylenders 🪙"
];

function getCurrentPrice(code) {
  const series = markets[code];
  return series?.[series.length - 1] || 0;
}

function updateGoldDisplay() {
  document.getElementById("goldDisplay").textContent = gold.toFixed(2);
}


function updatePortfolioDisplay() {
  const container = document.getElementById("portfolioList");
  container.innerHTML = "";

  let hasHoldings = false;
  for (const [code, entries] of Object.entries(portfolio)) {
    let totalQty = 0;
    let totalCost = 0;
    entries.forEach(p => {
      totalQty += p.qty;
      totalCost += p.qty * p.price;
    });
    if (totalQty > 0) {
      hasHoldings = true;
      const avgCost = totalCost / totalQty;
      const currentPrice = getCurrentPrice(code);
      const gainLoss = (currentPrice - avgCost) * totalQty;

      const card = document.createElement("div");
      card.className = "asset-card";
      card.title = `Lots: ${entries.length}\nAvg Cost: ${avgCost.toFixed(2)}\nNow: ${currentPrice.toFixed(2)}\nP/L: ${gainLoss.toFixed(2)}`;

      const header = document.createElement("div");
      header.className = "asset-header";
      header.innerHTML = `<strong>${code}</strong> <span>${totalQty} @ ${avgCost.toFixed(2)} → ${currentPrice.toFixed(2)} (<span style="color:${gainLoss >= 0 ? 'lime' : 'red'}">${gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)}</span>)</span>`;

      const actions = document.createElement("div");
      actions.className = "asset-actions";

      const buyBtn = document.createElement("button");
      buyBtn.textContent = "Buy";
      buyBtn.onclick = () => {
        productDropdown.value = code;
        document.getElementById("tradeQty").value = 1;
        buyCurrent();
      };

      const sellBtn = document.createElement("button");
      sellBtn.textContent = "Sell";
      sellBtn.onclick = () => {
        productDropdown.value = code;
        document.getElementById("tradeQty").value = 1;
        sellCurrent();
      };

      actions.appendChild(buyBtn);
      actions.appendChild(sellBtn);
      card.appendChild(header);
      card.appendChild(actions);

      const miniCanvas = document.createElement("canvas");
      miniCanvas.width = 150;
      miniCanvas.height = 40;
      card.appendChild(miniCanvas);

      new Chart(miniCanvas.getContext("2d"), {
        type: 'line',
        data: {
          labels: markets[code].map((_, i) => i),
          datasets: [{
            data: markets[code],
            borderColor: 'lime',
            fill: false,
            pointRadius: 0,
            tension: 0.3
          }]
        },
        options: {
          responsive: false,
          scales: {
            x: { display: false },
            y: { display: false }
          },
          plugins: { legend: { display: false } }
        }
      });

      container.appendChild(card);
    }
  }
  if (!hasHoldings) container.innerHTML = "<em>No assets held.</em>";
}

  const ul = document.getElementById("portfolioList");
  ul.innerHTML = "";
  let hasHoldings = false;
  for (const [code, entries] of Object.entries(portfolio)) {
    let totalQty = 0;
    let totalCost = 0;
    entries.forEach(p => {
      totalQty += p.qty;
      totalCost += p.qty * p.price;
    });
    if (totalQty > 0) {
      hasHoldings = true;
      const avgCost = totalCost / totalQty;
      const currentPrice = getCurrentPrice(code);
      const gainLoss = (currentPrice - avgCost) * totalQty;
      const li = document.createElement("li");
      li.textContent = `${code}: ${totalQty} @ ${avgCost.toFixed(2)} → ${currentPrice.toFixed(2)} (P/L: ${gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)})`;
      ul.appendChild(li);
    }
  }
  if (!hasHoldings) ul.innerHTML = "<li>None owned</li>";
}

function updateSecurityDetails(code) {
  const price = getCurrentPrice(code);
  const prices = markets[code];
  if (!prices) return;
  const change = price - prices[prices.length - 2];
  const volatility = Math.sqrt(prices.reduce((acc, p) => acc + Math.pow(p - price, 2), 0) / prices.length);

  document.getElementById("priceData").textContent = `Current Price: ${price.toFixed(2)} Marks`;
  document.getElementById("descriptionData").textContent = marketDescriptions[code] || "No description available.";
  document.getElementById("volatilityData").textContent = `📊 Volatility: ${volatility.toFixed(2)}`;
  document.getElementById("changeData").textContent = `📈 Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)} Marks`;
}

function drawChart(code) {
  if (!markets[code]) return;
  updateSecurityDetails(code);
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line",
    data: {
      labels: markets[code].map((_, i) => i),
      datasets: [{
        label: `${code} Price History`,
        data: markets[code],
        borderColor: 'lime',
        backgroundColor: 'rgba(0,255,0,0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { display: false },
        y: { beginAtZero: false, ticks: { color: '#fff' }, grid: { color: '#333' } }
      },
      plugins: {
        legend: { labels: { color: '#fff' } }
      }
    }
  });
}

function logTrade(action, code, qty, price) {
  const msg = `${new Date().toLocaleTimeString()} 💱 ${action.toUpperCase()} ${qty} ${code} @ ${price.toFixed(2)}`;
  const log = document.createElement("div");
  log.textContent = msg;
  document.getElementById("eventArchive").prepend(log);
}

function buyCurrent() {
  const code = productDropdown.value;
  const qty = parseInt(document.getElementById("tradeQty").value);
  const price = getCurrentPrice(code);
  const cost = qty * price;
  if (gold >= cost) {
    gold -= cost;
    if (!portfolio[code]) portfolio[code] = [];
    portfolio[code].push({ qty, price });
    updatePortfolioDisplay();
    updateGoldDisplay();
    updatePortfolioDisplay();
    saveGame();
    logTrade("buy", code, qty, price);
  } else {
    alert("Not enough Marks!");
  }
}

function sellCurrent() {
  const code = productDropdown.value;
  const qty = parseInt(document.getElementById("tradeQty").value);
  const price = getCurrentPrice(code);
  if (!portfolio[code] || portfolio[code].length === 0) return alert("Nothing to sell.");

  let remaining = qty;
  let gained = 0;
  while (remaining > 0 && portfolio[code].length > 0) {
    const lot = portfolio[code][0];
    const sellQty = Math.min(lot.qty, remaining);
    gained += sellQty * price;
    lot.qty -= sellQty;
    if (lot.qty === 0) portfolio[code].shift();
    remaining -= sellQty;
  }
  gold += gained;
  updateGoldDisplay();
  updatePortfolioDisplay();
  saveGame();
  logTrade("sell", code, qty, price);
}

function simulateNPCTrade() {
  const code = initialMarkets[Math.floor(Math.random() * initialMarkets.length)];
  const direction = Math.random() > 0.5 ? "buy" : "sell";
  const volume = Math.floor(Math.random() * 10 + 1);
  const npc = npcNames[Math.floor(Math.random() * npcNames.length)];
  const news = `${new Date().toLocaleTimeString()} 🧾 ${npc} ${direction} ${code} (vol: ${volume})`;
  const log = document.createElement("li");
  log.textContent = news;
  document.getElementById("npcLog").prepend(log);
  document.getElementById("newsTicker").textContent = news;
}

function saveGame() {
  localStorage.setItem("portfolio", JSON.stringify(portfolio));
  localStorage.setItem("gold", gold.toString());
}

function loadGame() {
  portfolio = JSON.parse(localStorage.getItem("portfolio")) || {};
  gold = parseFloat(localStorage.getItem("gold")) || 1000;
}

window.addEventListener("DOMContentLoaded", () => {
  ctx = document.getElementById("priceChart").getContext("2d");
  productDropdown = document.getElementById("productDropdown");
  loadGame();
  initialMarkets.forEach(code => {
    markets[code] = Array.from({ length: 50 }, () => 80 + Math.random() * 40);
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = `${code} – ${marketDescriptions[code] || ""}`;
    productDropdown.appendChild(opt);
  });
  productDropdown.addEventListener("change", () => drawChart(productDropdown.value));
  document.getElementById("buyButton").addEventListener("click", buyCurrent);
  document.getElementById("sellButton").addEventListener("click", sellCurrent);
  updateGoldDisplay();
  updatePortfolioDisplay();
  drawChart(productDropdown.value || "WHEA");
  document.getElementById("exportCSV").addEventListener("click", exportPortfolioToCSV);
  setInterval(simulateNPCTrade, 10000);
});

function exportPortfolioToCSV() {
  let csv = "Security,Quantity,Average Cost,Current Price,Gain/Loss\n";
  for (const [code, entries] of Object.entries(portfolio)) {
    let totalQty = 0, totalCost = 0;
    entries.forEach(p => {
      totalQty += p.qty;
      totalCost += p.qty * p.price;
    });
    if (totalQty > 0) {
      const avgCost = totalCost / totalQty;
      const currentPrice = getCurrentPrice(code);
      const gainLoss = (currentPrice - avgCost) * totalQty;
      csv += `${code},${totalQty},${avgCost.toFixed(2)},${currentPrice.toFixed(2)},${gainLoss.toFixed(2)}\n`;
    }
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "portfolio.csv";
  a.click();
  URL.revokeObjectURL(url);
}
