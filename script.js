// script.js

document.addEventListener("DOMContentLoaded", () => {
  try {
    let marks = 1000;
    const portfolio = {};
    const priceBasis = {}; // Track cost basis for P/L
    const newsQueue = [];
    const newsArchive = JSON.parse(localStorage.getItem("newsArchive")) || [];
    const npcProfiles = {};

    const securities = generateSecurities();
    let selected = null;
    let priceChart = null;

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
    const marksDisplay = document.getElementById("marksDisplay") || document.getElementById("goldDisplay");
    const newsTicker = document.getElementById("newsTicker");
    const portfolioList = document.getElementById("portfolioList");
    const npcLog = document.getElementById("npcLog");
    const archive = document.getElementById("eventArchive");
    const detailsPanel = document.getElementById("detailsPanel");
    const tradeQtyInput = document.getElementById("tradeQty");
    const filterSelect = document.getElementById("newsFilter");
    const topStoriesBox = document.getElementById("topStories");
    const npcSelect = document.getElementById("npcSelect");
    const npcProfileOutput = document.getElementById("npcProfileOutput");

    if (!dropdown || !marksDisplay || !newsTicker || !portfolioList || !npcLog || !archive || !detailsPanel || !tradeQtyInput || !filterSelect || !topStoriesBox || !npcSelect || !npcProfileOutput) {
      throw new Error("Critical UI element missing. Check HTML structure.");
    }

    function generateSecurities() {
      return [
        { code: "WHT", name: "Wheat Futures", price: 120, desc: "Grain commodity.", sector: "Grain", volatility: 0.03 },
        { code: "OBL", name: "Oswald Bonds", price: 200, desc: "Infrastructure bond.", sector: "Infrastructure", volatility: 0.02 },
        { code: "FMR", name: "Fae Mirror Shards", price: 350, desc: "Luxury magical good.", sector: "Magical", volatility: 0.08 },
        { code: "CNT", name: "Cattle Contracts", price: 160, desc: "Livestock asset.", sector: "Grain", volatility: 0.025 },
        { code: "BNS", name: "Beans Scrip", price: 95, desc: "Staple commodity.", sector: "Grain", volatility: 0.04 },
        { code: "CRN", name: "Corn Contracts", price: 110, desc: "Food staple.", sector: "Grain", volatility: 0.035 }
      ];
    }

    function formatMarks(amount) {
      return `₥${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function updateStats(security) {
      document.getElementById("priceData").textContent = `Current Price: ${formatMarks(security.price)}`;
      document.getElementById("descriptionData").textContent = security.desc;
      document.getElementById("volatilityData").textContent = `Volatility: ${security.volatility}`;
    }

    function drawChart(security) {
      const chartCanvas = document.getElementById("priceChart");
      if (!chartCanvas || !chartCanvas.getContext) return;
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

    function generatePriceHistory(base, vol) {
      let prices = [];
      let current = base;
      for (let i = 0; i < 90; i++) {
        const delta = current * (Math.random() * vol * 2 - vol);
        current = Math.max(1, current + delta);
        prices.push(current.toFixed(2));
      }
      return prices;
    }

    function trade(type) {
      if (!selected) return alert("Please select a security.");
      const qty = parseInt(tradeQtyInput.value);
      if (isNaN(qty) || qty <= 0) return alert("Invalid quantity.");
      const total = qty * selected.price;
      const key = selected.code;
      if (type === "buy" && marks >= total) {
        marks -= total;
        if (!portfolio[key]) {
          portfolio[key] = 0;
          priceBasis[key] = 0;
        }
        priceBasis[key] = ((priceBasis[key] * portfolio[key]) + total) / (portfolio[key] + qty);
        portfolio[key] += qty;
        logEvent(`✅ Bought ${qty} ${key} for ${formatMarks(total)}`);
      } else if (type === "sell" && portfolio[key] >= qty) {
        marks += total;
        portfolio[key] -= qty;
        if (portfolio[key] === 0) {
          delete portfolio[key];
          delete priceBasis[key];
        }
        logEvent(`🪙 Sold ${qty} ${key} for ${formatMarks(total)}`);
      } else {
        logEvent(`⚠️ Trade failed: Check quantity or marks.`);
      }
      updatePortfolio();
      savePortfolio();
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
        const basis = priceBasis[code] || 0;
        const change = ((sec.price - basis) / basis * 100).toFixed(2);
        const li = document.createElement("li");
        li.textContent = `${code}: ${portfolio[code]} units (≈ ${formatMarks(val)}) — P/L: ${change}%`;
        portfolioList.appendChild(li);
      }
    }

    function savePortfolio() {
      localStorage.setItem("fablePortfolio", JSON.stringify({ marks, portfolio, priceBasis }));
    }

    function loadPortfolio() {
      const saved = JSON.parse(localStorage.getItem("fablePortfolio"));
      if (saved) {
        marks = saved.marks || 1000;
        Object.assign(portfolio, saved.portfolio);
        Object.assign(priceBasis, saved.priceBasis);
        updatePortfolio();
      }
    }

    function logEvent(message) {
      const time = new Date().toLocaleTimeString();
      const entry = `[${time}] ${message}`;
      const div = document.createElement("div");
      div.textContent = entry;
      archive.prepend(div);
      newsQueue.push(entry);
      newsArchive.push(entry);
      localStorage.setItem("newsArchive", JSON.stringify(newsArchive.slice(-100)));
    }

    function rotateNewsTicker() {
      if (newsQueue.length > 0) {
        newsTicker.textContent = newsQueue.shift();
      }
    }

    function simulateNPC() {
      const npc = npcNames[Math.floor(Math.random() * npcNames.length)];
      const target = securities[Math.floor(Math.random() * securities.length)];
      const qty = Math.floor(Math.random() * 20 + 1);
      const action = Math.random() < 0.5 ? "buys" : "sells";
      const msg = `🏦 ${npc} ${action} ${qty} units of ${target.code}`;
      npcLog.prepend(Object.assign(document.createElement("li"), { textContent: msg }));
      newsQueue.push(msg);
      newsArchive.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

      if (!npcProfiles[npc]) npcProfiles[npc] = { trades: [], holdings: {} };
      npcProfiles[npc].trades.push(msg);
      if (!npcProfiles[npc].holdings[target.code]) npcProfiles[npc].holdings[target.code] = 0;
      npcProfiles[npc].holdings[target.code] += action === "buys" ? qty : -qty;

      if (Math.random() < 0.02) {
        const boom = Math.random() < 0.5;
        const surgeMsg = boom ? `💥 Magic Surge!` : `📉 Crash!`;
        const factor = boom ? 1.25 : 0.75;
        target.price *= factor;
        logEvent(`${surgeMsg} ${target.code} now ₥${target.price.toFixed(2)}`);
        if (selected?.code === target.code) {
          updateStats(target);
          drawChart(target);
        }
      }
    }

    function resetNews() {
      newsArchive.length = 0;
      archive.innerHTML = "";
      topStoriesBox.innerHTML = "";
      localStorage.removeItem("newsArchive");
    }

    function renderNPCProfile() {
      const npc = npcSelect.value;
      const data = npcProfiles[npc];
      if (!data) return;
      let html = `<h3>${npc}</h3>`;
      html += `<h4>Holdings</h4><ul>`;
      for (const code in data.holdings) {
        html += `<li>${code}: ${data.holdings[code]} units</li>`;
      }
      html += `</ul><h4>Recent Trades</h4><ul>`;
      data.trades.slice(-5).reverse().forEach(t => html += `<li>${t}</li>`);
      html += `</ul>`;
      npcProfileOutput.innerHTML = html;
    }

    npcNames.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      npcSelect.appendChild(option);
    });

    npcSelect.addEventListener("change", renderNPCProfile);

    dropdown.addEventListener("change", () => {
      selected = securities.find(s => s.code === dropdown.value);
      if (!selected) return;
      updateStats(selected);
      drawChart(selected);
    });

    document.getElementById("buyButton").addEventListener("click", () => trade("buy"));
    document.getElementById("sellButton").addEventListener("click", () => trade("sell"));

    loadPortfolio();
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
