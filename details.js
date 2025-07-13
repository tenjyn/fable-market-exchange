// details.js

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (!code) return;

  const security = getSecurityDetails(code);
  if (!security) return;

  renderDetails(security);
  drawSecurityChart(security);
  simulateNPCNews(security);
});

function getSecurityDetails(code) {
  const securities = [
    { code: "WHT", name: "Wheat Futures", price: 120, desc: "Grain commodity.", sector: "Grain", volatility: 0.03 },
    { code: "OBL", name: "Oswald Bonds", price: 200, desc: "Infrastructure bond.", sector: "Infrastructure", volatility: 0.02 },
    { code: "FMR", name: "Fae Mirror Shards", price: 350, desc: "Luxury magical good.", sector: "Magical", volatility: 0.08 },
    // Add more as needed
  ];
  return securities.find(s => s.code === code);
}

function renderDetails(security) {
  document.getElementById("securityTitle").textContent = `${security.name} (${security.code})`;
  document.getElementById("description").textContent = security.desc;
  document.getElementById("sector").textContent = security.sector;
  document.getElementById("volatility").textContent = security.volatility;
  document.getElementById("currentPrice").textContent = security.price.toFixed(2);
}

function drawSecurityChart(security) {
  const ctx = document.getElementById("historyChart").getContext("2d");
  const history = generateHistory(security.price, security.volatility);
  new Chart(ctx, {
    type: "line",
    data: {
      labels: history.map((_, i) => `Week ${i + 1}`),
      datasets: [{
        label: `${security.code} Price`,
        data: history,
        borderColor: "#00ffc8",
        backgroundColor: "rgba(0,255,200,0.05)",
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: { x: { display: true }, y: { beginAtZero: false } },
      plugins: { legend: { display: false } }
    }
  });
}

function generateHistory(start, vol) {
  let prices = [];
  let current = start;
  for (let i = 0; i < 52; i++) {
    const delta = current * (Math.random() * vol * 2 - vol);
    current = Math.max(1, current + delta);
    prices.push(current.toFixed(2));
  }
  return prices;
}

function simulateNPCNews(security) {
  const npcs = ["Oswald Bank", "Royal Frog Bank", "Glimmer Consortium", "TLBN"];
  const log = document.getElementById("npcActivityLog");

  function postFakeTrade() {
    const npc = npcs[Math.floor(Math.random() * npcs.length)];
    const action = Math.random() < 0.5 ? "buys" : "sells";
    const qty = Math.floor(Math.random() * 20 + 1);
    const msg = `🏦 ${npc} ${action} ${qty} units of ${security.code}`;

    const li = document.createElement("li");
    li.textContent = msg;
    log.prepend(li);
    document.getElementById("newsTicker").textContent = msg;
  }

  setInterval(postFakeTrade, 15000);
}
