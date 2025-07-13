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

    const npcProfiles = {};
    npcNames.forEach(name => {
      npcProfiles[name] = { name, holdings: {}, tradeLog: [], totalPnL: 0 };
    });

    const dropdown = document.getElementById("productDropdown");
    const goldDisplay = document.getElementById("goldDisplay");
    const newsTicker = document.getElementById("newsTicker");
    const portfolioList = document.getElementById("portfolioList");
    const npcLog = document.getElementById("npcLog");
    const archive = document.getElementById("eventArchive");
    const detailsPanel = document.getElementById("detailsPanel");
    const tradeQtyInput = document.getElementById("tradeQty");
    const npcSelect = document.getElementById("npcSelect");
    const npcProfileOutput = document.getElementById("npcProfileOutput");

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

    npcNames.forEach(npc => {
      const opt = document.createElement("option");
      opt.value = npc;
      opt.textContent = npc;
      npcSelect.appendChild(opt);
    });

    npcSelect.addEventListener("change", () => {
      const npc = npcProfiles[npcSelect.value];
      if (!npc) return;
      const profileText = `📊 ${npc.name}\n\nHoldings:\n` +
        Object.entries(npc.holdings).map(([k, v]) => `• ${k}: ${v}`).join("\n") +
        `\n\nTotal P/L: ${npc.totalPnL.toFixed(2)} Marks\n\nRecent Trades:\n` +
        npc.tradeLog.slice(-5).join("\n");
      npcProfileOutput.textContent = profileText;
    });

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

      if (!portfolio[key]) {
        portfolio[key] = { qty: 0, costBasis: 0 };
      }

      if (type === "buy" && gold >= total) {
        gold -= total;
        portfolio[key].qty += qty;
        portfolio[key].costBasis += total;
        logEvent(`✅ Bought ${qty} ${key} for ${total.toFixed(2)} Marks`);
      } else if (type === "sell" && portfolio[key].qty >= qty) {
        gold += total;
        portfolio[key].costBasis *= (portfolio[key].qty - qty) / portfolio[key].qty;
        portfolio[key].qty -= qty;
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
        const secData = portfolio[code];
        const currentVal = sec.price * secData.qty;
        const gain = currentVal - secData.costBasis;
        const gainPct = (gain / secData.costBasis) * 100;
        const li = document.createElement("li");
        li.textContent = `${code}: ${secData.qty} units (≈ ${currentVal.toFixed(2)} Marks, P/L: ${gain.toFixed(2)} Marks, ${gainPct.toFixed(2)}%)`;
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
      const npc = npcNames[Math.floor(Math.random() * npcNames.length)];
      const target = securities[Math.floor(Math.random() * securities.length)];
      const qty = Math.floor(Math.random() * 20 + 1);
      const action = Math.random() < 0.5 ? "buy" : "sell";

      const npcData = npcProfiles[npc];
      if (!npcData.holdings[target.code]) npcData.holdings[target.code] = 0;

      if (action === "buy") {
        npcData.holdings[target.code] += qty;
        npcData.totalPnL -= qty * target.price;
      } else {
        npcData.holdings[target.code] = Math.max(0, npcData.holdings[target.code] - qty);
        npcData.totalPnL += qty * target.price;
      }

      const msg = `🏦 ${npc} ${action}s ${qty} units of ${target.code}`;
      npcData.tradeLog.push(msg);

      const item = document.createElement("li");
      item.textContent = msg;
      npcLog.prepend(item);
      newsQueue.push(msg);
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
