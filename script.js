// script.js

document.addEventListener("DOMContentLoaded", () => {
  try {
    let marks = 1000;
    const portfolio = {};
    const securities = generateSecurities();
    let selected = null;
    let priceChart = null;
    const newsQueue = [];
    const npcNames = [
      "Royal Frog Bank",
      "TLBN: Respectable Moneylenders",
      "Oswald Bank",
      "Moth Syndicate",
      "Selden Grain Trust",
      "Glimmer Consortium",
      "Crestvale Estates",
      "Ironbrace Ventures",
      "Bushai Maritime Credit",
      "Magisterial Reserves of Lockhede"
    ];

    const dropdown = document.getElementById("productDropdown");
    const marksDisplay = document.getElementById("goldDisplay");
    const newsTicker = document.getElementById("newsTicker");
    const portfolioList = document.getElementById("portfolioList");
    const npcLog = document.getElementById("npcLog");
    const archive = document.getElementById("eventArchive");
    const detailsPanel = document.getElementById("detailsPanel");
    const tradeQtyInput = document.getElementById("tradeQty");
    const npcSelect = document.getElementById("npcSelect");
    const npcProfileOutput = document.getElementById("npcProfileOutput");

    const portfolioControls = document.createElement("div");
    portfolioControls.innerHTML = `
      <button id="resetPortfolioBtn">Reset Portfolio</button>
      <button id="exportPortfolioBtn">Export Portfolio</button>
      <pre id="exportOutput" style="background:#1e1e1e;padding:10px;border:1px solid #333;margin-top:10px;white-space:pre-wrap;"></pre>
      <p style="font-size: 12px; opacity: 0.7;">Note: 1 mark (₥1) ≈ $100 USD</p>
    `;
    document.body.appendChild(portfolioControls);

    document.getElementById("resetPortfolioBtn").addEventListener("click", resetPortfolio);
    document.getElementById("exportPortfolioBtn").addEventListener("click", () => {
      const data = {
        marks,
        portfolio
      };
      document.getElementById("exportOutput").textContent = JSON.stringify(data, null, 2);
    });

    if (!dropdown || !marksDisplay || !newsTicker || !portfolioList || !npcLog || !archive || !detailsPanel || !tradeQtyInput) {
      throw new Error("Critical UI element missing. Please check HTML structure. Ensure that an element with id 'detailsPanel' and 'tradeQty' exists in the HTML.");
    }

    loadPortfolio();

    const grouped = {};
    securities.forEach(sec => {
      if (!grouped[sec.sector]) grouped[sec.sector] = [];
      grouped[sec.sector].push(sec);
    });

    for (const sector in grouped) {
      const optgroup = document.createElement("optgroup");
      optgroup.label = sector;
      grouped[sector].forEach(sec => {
        const option = document.createElement("option");
        option.value = sec.code;
        option.textContent = `${sec.code} - ${sec.name}`;
        optgroup.appendChild(option);
      });
      dropdown.appendChild(optgroup);
    }

    dropdown.addEventListener("change", () => {
      selected = securities.find(s => s.code === dropdown.value);
      if (!selected) return;
      updateStats(selected);
      drawChart(selected);
      updateDetailsPage(selected);
    });

    document.getElementById("buyButton").addEventListener("click", () => trade("buy"));
    document.getElementById("sellButton").addEventListener("click", () => trade("sell"));

    function savePortfolio() {
      const data = {
        marks,
        portfolio
      };
      localStorage.setItem("fablePortfolio", JSON.stringify(data));
    }

    function loadPortfolio() {
      const saved = localStorage.getItem("fablePortfolio");
      if (saved) {
        const parsed = JSON.parse(saved);
        marks = parsed.marks || 1000;
        for (const key in parsed.portfolio) {
          portfolio[key] = parsed.portfolio[key];
        }
      }
    }

    function resetPortfolio() {
      localStorage.removeItem("fablePortfolio");
      location.reload();
    }

    function formatMarks(amount) {
      return `₥${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

    function updatePortfolio() {
      marksDisplay.textContent = formatMarks(marks);
      portfolioList.innerHTML = "";
      if (Object.keys(portfolio).length === 0) {
        portfolioList.innerHTML = "<li>None owned</li>";
        return;
      }
      for (const code in portfolio) {
        const sec = securities.find(s => s.code === code);
        const val = sec.price * portfolio[code];
        const li = document.createElement("li");
        const costBasis = 100 * portfolio[code]; // placeholder: replace with actual avg buy price
        const gain = val - costBasis;
        li.style.color = gain > 0 ? "#00ff99" : gain < 0 ? "#ff6666" : "#cccccc";
        li.textContent = `${code}: ${portfolio[code]} units (≈ ${formatMarks(val)}) | Gain: ${gain >= 0 ? '+' : ''}${formatMarks(gain)}`;
        portfolioList.appendChild(li);
      }
    }

    function trade(type) {
      if (!selected) return alert("Please select a security.");
      const qty = parseInt(tradeQtyInput.value);
      if (isNaN(qty) || qty <= 0) return alert("Invalid quantity.");

      const total = qty * selected.price;
      const key = selected.code;

      if (type === "buy" && marks >= total) {
        marks -= total;
        if (!portfolio[key]) portfolio[key] = 0;
        portfolio[key] += qty;
        logEvent(`✅ Bought ${qty} ${key} for ${formatMarks(total)}`);
      } else if (type === "sell" && portfolio[key] >= qty) {
        marks += total;
        portfolio[key] -= qty;
        if (portfolio[key] === 0) delete portfolio[key];
        logEvent(`🪙 Sold ${qty} ${key} for ${formatMarks(total)}`);
      } else {
        logEvent(`⚠️ Trade failed: Check quantity or funds.`);
      }

      updatePortfolio();
      savePortfolio();
    }

    function logEvent(message) {
      const time = new Date().toLocaleTimeString();
      const entry = document.createElement("div");
      entry.textContent = `[${time}] ${message}`;
      archive.prepend(entry);
      newsQueue.push(entry.textContent);
    }

    function drawChart(security) {
      const chartCanvas = document.getElementById("priceChart");
      if (!chartCanvas || !chartCanvas.getContext) return console.error("Chart canvas context not found.");
      const ctx = chartCanvas.getContext("2d");
      if (priceChart) priceChart.destroy();

      const history = generatePriceHistory(security.price, security.volatility);
      priceChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: history.map((_, i) => `Day ${i + 1}`),
          datasets: [{
            label: `${security.code} Price History`,
            data: history,
            borderColor: "#7ad9ff",
            backgroundColor: "rgba(122, 217, 255, 0.1)",
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
          scales: { x: { display: true }, y: { beginAtZero: false } }
        }
      });
    }

    setInterval(() => {
      if (document.readyState === "complete") {
        simulateNPC();
        rotateNewsTicker();
      }
    }, 15000);

  } catch (err) {
    console.error("Script Error:", err);
  }
});
