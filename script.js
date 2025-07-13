// script.js

document.addEventListener("DOMContentLoaded", () => {
  try {
    let gold = 1000;
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
    const goldDisplay = document.getElementById("goldDisplay");
    const newsTicker = document.getElementById("newsTicker");
    const portfolioList = document.getElementById("portfolioList");
    const npcLog = document.getElementById("npcLog");
    const archive = document.getElementById("eventArchive");
    const detailsPanel = document.getElementById("detailsPanel");
    const tradeQtyInput = document.getElementById("tradeQty");

    if (!dropdown || !goldDisplay || !newsTicker || !portfolioList || !npcLog || !archive || !detailsPanel || !tradeQtyInput) {
      throw new Error("Critical UI element missing. Please check HTML structure. Ensure that an element with id 'detailsPanel' and 'tradeQty' exists in the HTML.");
    }

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

    function updateStats(security) {
      document.getElementById("priceData").textContent = `Current Price: ${security.price.toFixed(2)} Marks`;
      document.getElementById("descriptionData").textContent = security.desc;
      document.getElementById("volatilityData").textContent = `Volatility: ${security.volatility}`;
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

    function updateDetailsPage(security) {
      detailsPanel.innerHTML = `
        <h3>${security.name} (${security.code})</h3>
        <p><strong>Sector:</strong> ${security.sector}</p>
        <p><strong>Description:</strong> ${security.desc}</p>
        <p><strong>Volatility:</strong> ${security.volatility}</p>
        <p><strong>Current Price:</strong> ${security.price.toFixed(2)} Marks</p>
        <p><strong>NPC Trading Activity:</strong> check the archive below for updates.</p>
        <p><strong>Notes:</strong> This security has exhibited ${security.volatility < 0.03 ? 'low' : security.volatility < 0.06 ? 'moderate' : 'high'} volatility trends in the last cycle.</p>
      `;
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

    function trade(type) {
      if (!selected) return alert("Please select a security.");
      const qty = parseInt(tradeQtyInput.value);
      if (isNaN(qty) || qty <= 0) return alert("Invalid quantity.");

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
      const time = new Date().toLocaleTimeString();
      const entry = document.createElement("div");
      entry.textContent = `[${time}] ${message}`;
      archive.prepend(entry);
      newsQueue.push(entry.textContent);
    }

    function simulateNPC() {
      if (!newsTicker || !npcLog || !securities || securities.length === 0) return;
      const npc = npcNames[Math.floor(Math.random() * npcNames.length)];
      const target = securities[Math.floor(Math.random() * securities.length)];
      const qty = Math.floor(Math.random() * 20 + 1);
      const action = Math.random() < 0.5 ? "buy" : "sell";
      const msg = `🏦 ${npc} ${action}s ${qty} units of ${target.code}`;
      const item = document.createElement("li");
      item.textContent = msg;
      npcLog.prepend(item);
      newsQueue.push(msg);

      if (Math.random() < 0.02) {
        const boomOrBust = Math.random() < 0.5 ? "💥 Magic Surge!" : "📉 Crash!";
        const factor = boomOrBust.includes("Surge") ? 1.25 : 0.75;
        target.price *= factor;
        logEvent(`${boomOrBust} ${target.code} adjusted to ${target.price.toFixed(2)} Marks.`);
        updateStats(target);
        if (selected?.code === target.code) drawChart(target);
      }
    }

    function rotateNewsTicker() {
      if (newsQueue.length > 0) {
        const next = newsQueue.shift();
        newsTicker.textContent = next;
      }
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
