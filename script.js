let chart;
let ctx;
let gold = 1000;
let markets = {};
let npcPortfolios = {};
let allMarkets = ["WHEA", "BEAN", "CORN", "RICE", "CATT", "MOTH", "WAXR", "PHNX", "VRMS", "TRTI", "TOLL"];

let sectorMap = {
  "Agricultural Goods": ["WHEA", "BEAN", "CORN", "RICE", "CATT"],
  "Magical Commodities": ["MOTH", "WAXR", "PHNX"],
  "Infrastructure Securities": ["VRMS", "TRTI", "TOLL"]
};

window.addEventListener("DOMContentLoaded", () => {
  const filterPanel = document.createElement("div");
  filterPanel.style.marginBottom = "1rem";
  filterPanel.innerHTML = `<label>Filter by Sector: 
    <select id="sectorFilter">
      <option value="all">All Sectors</option>
      ${Object.keys(sectorMap).map(sector => `<option value="${sector}">${sector}</option>`).join('')}
    </select>
  </label>`;
  document.body.insertBefore(filterPanel, document.getElementById("productDropdown"));

  ctx = document.getElementById("priceChart").getContext("2d");
  const dropdown = document.getElementById("productDropdown");

  for (const [sector, codes] of Object.entries(sectorMap)) {
    const optGroup = document.createElement("optgroup");
    optGroup.label = sector;
    codes.forEach(code => {
      markets[code] = Array.from({ length: 50 }, () => 80 + Math.random() * 40);
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = code;
      optGroup.appendChild(opt);
    });
    dropdown.appendChild(optGroup);
  }

  dropdown.addEventListener("change", () => drawChart(dropdown.value));

  document.getElementById("sectorFilter").addEventListener("change", (e) => {
    const selectedSector = e.target.value;
    dropdown.innerHTML = "";
    for (const [sector, codes] of Object.entries(sectorMap)) {
      if (selectedSector !== "all" && sector !== selectedSector) continue;
      const optGroup = document.createElement("optgroup");
      optGroup.label = sector;
      codes.forEach(code => {
        const opt = document.createElement("option");
        opt.value = code;
        opt.textContent = code;
        optGroup.appendChild(opt);
      });
      dropdown.appendChild(optGroup);
    }
    if (dropdown.options.length > 0) {
      drawChart(dropdown.value);
    }
  });

  drawChart(dropdown.value || "WHEA");
  setInterval(simulateMarketUpdates, 6000);
  setInterval(simulateNPCTrade, 9000);
});

function getCurrentPrice(code) {
  return markets[code][markets[code].length - 1];
}

function drawChart(code) {
  const data = markets[code];
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{ label: code, data, borderColor: 'lime', tension: 0.3 }]
    },
    options: { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
  });

  const current = getCurrentPrice(code);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const avg = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2);
  const change = (current - data[0]).toFixed(2);
  const pctChange = ((change / data[0]) * 100).toFixed(2);
  document.getElementById("priceData").innerHTML = `
    <div><strong>Current Price:</strong> ${current.toFixed(2)} Marks</div>
    <div><strong>Average Price:</strong> ${avg} Marks</div>
    <div><strong>High:</strong> ${max.toFixed(2)} | <strong>Low:</strong> ${min.toFixed(2)}</div>
    <div><strong>Change:</strong> ${change} Marks (${pctChange}%) from start</div>
  `;
}

function simulateMarketUpdates() {
  allMarkets.forEach(code => {
    const volatility = Math.random() < 0.02 ? 50 : Math.floor(Math.random() * 8);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const current = getCurrentPrice(code);
    const newPrice = Math.max(1, current + direction * volatility);
    markets[code].push(newPrice);
    if (markets[code].length > 50) markets[code].shift();
    if (code === document.getElementById("productDropdown").value) drawChart(code);
  });
}

function simulateNPCTrade() {
  const npcList = [
    { name: "The Royal Frog Bank", sector: "Agricultural Goods" },
    { name: "TLBN: Respectible Moneylenders", sector: "Infrastructure Securities" },
    { name: "Oswald Bank", sector: "Magical Commodities" }
  ];

  npcList.forEach(npc => {
    if (!npcPortfolios[npc.name]) npcPortfolios[npc.name] = {};
  });

  const npc = npcList[Math.floor(Math.random() * npcList.length)];
  const candidates = sectorMap[npc.sector];
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const direction = Math.random() > 0.5 ? "bought" : "sold";
  const volume = Math.floor(Math.random() * 100 + 20);
  const amount = Math.floor(Math.random() * 20 + 5);

  if (!npcPortfolios[npc.name][target]) npcPortfolios[npc.name][target] = 0;
  npcPortfolios[npc.name][target] += (direction === "bought" ? amount : -amount);

  const message = `${new Date().toLocaleTimeString()} 🏦 ${npc.name} ${direction} ${amount} units of ${target} (vol: ${volume})`;

  const log = document.createElement("div");
  log.textContent = message;
  document.getElementById("eventArchive").prepend(log);
  document.getElementById("newsTicker").textContent = `🧾 ${npc.name} ${direction} ${target} (vol: ${volume})`;
  updateNPCPanel();
}

function updateNPCPanel() {
  const npcLog = document.getElementById("npcLog");
  npcLog.innerHTML = "";
  Object.entries(npcPortfolios).forEach(([name, holdings]) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${name}:</strong> ` + Object.entries(holdings)
      .filter(([_, qty]) => qty !== 0)
      .map(([code, qty]) => `${code}: ${qty}`).join(", ") || "(no holdings)";
    npcLog.appendChild(li);
  });
}
