// script.js — updated for persistent portfolio, NPC profiles, and news ticker polish

// Ensure Chart.js is loaded before this script

document.addEventListener("DOMContentLoaded", () => {
  try {
    const {
      marks: loadedMarks,
      portfolio: loadedPortfolio,
      tradeHistory: loadedHistory
    } = loadPortfolioData();
    let marks = loadedMarks;
    const portfolio = loadedPortfolio;
    const tradeHistory = loadedHistory;
    const newsArchive = JSON.parse(localStorage.getItem("newsArchive")) || [];
    const npcProfiles = {};
    const topStories = [];
    const npcTradeLog = JSON.parse(localStorage.getItem("npcTradeLog")) || [];

    const securities = SECURITIES.map(sec => ({ ...sec, basePrice: sec.price }));
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
    const marksDisplay = document.getElementById("marksDisplay");
    const newsTicker = document.getElementById("newsContent");
    const portfolioList = document.getElementById("portfolioList");
    const recentTrades = document.getElementById("recentTrades");
    const npcLog = document.getElementById("npcLog");
    const archive = document.getElementById("eventArchive");
    const detailsPanel = document.getElementById("detailsPanel");
    const tradeQtyInput = document.getElementById("tradeQty");
    const filterSelect = document.getElementById("newsFilter");
    const topStoriesBox = document.getElementById("topStories");
    const npcSelect = document.getElementById("npcSelect");
    const npcProfileOutput = document.getElementById("npcProfileOutput");
    const gainersBox = document.getElementById("topGainers");
    const losersBox = document.getElementById("topLosers");

    if (
      !dropdown ||
      !marksDisplay ||
      !newsTicker ||
      !portfolioList ||
      !recentTrades ||
      !npcLog ||
      !archive ||
      !detailsPanel ||
      !tradeQtyInput ||
      !filterSelect ||
      !topStoriesBox ||
      !npcSelect ||
      !npcProfileOutput ||
      !gainersBox ||
      !losersBox
    ) {
      throw new Error("Critical UI element missing. Check HTML structure.");
    }

    // Populate dropdown
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

    filterSelect.addEventListener("change", renderNewsArchive);
    npcSelect.addEventListener("change", () => {
      const name = npcSelect.value;
      renderNPCProfile(name);
    });

    // Main functions

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
          datasets: [{ label: `${security.code} Price History`, data: history, borderColor: "#7ad9ff", backgroundColor: "rgba(122, 217, 255, 0.1)", fill: true }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } },
          scales: { x: { display: true }, y: { beginAtZero: false } }
        }
      });
    }

    function generatePriceHistory(base, vol) {
      const history = [];
      let current = base;
      for (let i = 0; i < 90; i++) {
        const change = current * (Math.random() * vol * 2 - vol);
        current = Math.max(1, current + change);
        history.push(Number(current.toFixed(2)));
      }
      return history;
    }

    function updateDetailsPage(security) {
      detailsPanel.innerHTML = `
        <h3>${security.name} (${security.code})</h3>
        <p>${security.desc}</p>
        <p>Price: ${formatMarks(security.price)}</p>
        <p>Volatility: ${security.volatility}</p>
      `;
    }

    function trade(type) {
      if (!selected) return alert("Select a security.");
      const qty = parseInt(tradeQtyInput.value);
      if (isNaN(qty) || qty <= 0) return alert("Invalid quantity.");
      const total = qty * selected.price;
      const key = selected.code;
      const time = new Date().toLocaleTimeString();
      if (type === "buy" && marks >= total) {
        marks -= total;
        if (!portfolio[key]) portfolio[key] = { units: 0, avgCost: selected.price };
        const holding = portfolio[key];
        const newUnits = holding.units + qty;
        holding.avgCost = ((holding.avgCost * holding.units) + total) / newUnits;
        holding.units = newUnits;
        logEvent(`🏦 ✅ Bought ${qty} ${key} at ${formatMarks(selected.price)} each for ${formatMarks(total)}`);
      tradeHistory.push(`[${time}] Bought ${qty} ${key} at ${formatMarks(selected.price)}`);
    } else if (type === "sell" && portfolio[key] && portfolio[key].units >= qty) {
      marks += total;
      const holding = portfolio[key];
      holding.units -= qty;
      if (holding.units === 0) delete portfolio[key];
      logEvent(`🏦 🪙 Sold ${qty} ${key} at ${formatMarks(selected.price)} each for ${formatMarks(total)}`);
      tradeHistory.push(`[${time}] Sold ${qty} ${key} at ${formatMarks(selected.price)}`);
    } else {
      logEvent(`🏦 ⚠️ Trade failed.`);
    }
    updatePortfolio();
    renderRecentTrades();
    savePortfolio();
    tradeQtyInput.value = "";
    }

    function updatePortfolio() {
      marksDisplay.textContent = formatMarks(marks);
      portfolioList.innerHTML = Object.keys(portfolio).length === 0 ? "<li>None owned</li>" : "";
      for (const code in portfolio) {
        const sec = securities.find(s => s.code === code);
        const holding = portfolio[code];
        const val = sec.price * holding.units;
        const li = document.createElement("li");
        li.textContent = `${code}: ${holding.units} units (avg ${formatMarks(holding.avgCost)} ≈ ${formatMarks(val)})`;
        portfolioList.appendChild(li);
      }
    }

    function renderRecentTrades() {
      recentTrades.innerHTML = "";
      tradeHistory.slice(-5).forEach(entry => {
        recentTrades.prepend(Object.assign(document.createElement("li"), { textContent: entry }));
      });
    }

    function savePortfolio() {
      savePortfolioData({ marks, portfolio, tradeHistory });
    }

    function logEvent(message) {
      const time = new Date().toLocaleTimeString();
      const entry = `[${time}] ${message}`;
      newsArchive.push(entry);
      if (entry.includes("💥") || entry.includes("📉")) topStories.push(entry);
      localStorage.setItem("newsArchive", JSON.stringify(newsArchive.slice(-100)));
      renderTopStories();
      renderNewsArchive();
      refreshTicker();
    }

    function renderNewsArchive() {
      const filter = filterSelect.value;
      archive.innerHTML = "";
      newsArchive.forEach(entry => {
        if (filter === "all" || (filter === "trades" && entry.includes("🏦")) || (filter === "surges" && entry.includes("💥")) || (filter === "crashes" && entry.includes("📉"))) {
          archive.prepend(Object.assign(document.createElement("div"), { textContent: entry }));
        }
      });
    }

    function renderTopStories() {
      topStoriesBox.innerHTML = "";
      topStories.slice(-5).reverse().forEach(story => {
        const p = document.createElement("p");
        p.textContent = story;
        topStoriesBox.appendChild(p);
      });
    }

    function refreshTicker() {
      if (!newsTicker) return;
      const content = newsArchive.join("  |  ");
      newsTicker.textContent = content + "  |  " + content;
      newsTicker.style.animation = "none";
      void newsTicker.offsetWidth;
      newsTicker.style.animation = "";
      newsTicker.style.animation = "ticker 30s linear infinite";
    }

    function updateMarketSummary() {
      const withChange = securities.map(s => ({
        code: s.code,
        change: ((s.price - s.basePrice) / s.basePrice) * 100
      }));
      const gainers = [...withChange].sort((a, b) => b.change - a.change).slice(0, 3);
      const losers = [...withChange].sort((a, b) => a.change - b.change).slice(0, 3);
      gainersBox.innerHTML = `<h3>Top Gainers</h3>${gainers
        .map(g => `<p>${g.code}: ${g.change.toFixed(2)}%</p>`)
        .join("")}`;
      losersBox.innerHTML = `<h3>Top Losers</h3>${losers
        .map(l => `<p>${l.code}: ${l.change.toFixed(2)}%</p>`)
        .join("")}`;
    }

    function populateNPCDropdown() {
      npcNames.forEach(name => {
        npcProfiles[name] = { holdings: {}, history: [], pnl: 0 };
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        npcSelect.appendChild(opt);
      });
    }

    function renderNPCProfile(name) {
      const npc = npcProfiles[name];
      if (!npc) return;
      npcProfileOutput.innerHTML = `
        <h3>${name}</h3>
        <p>P/L: ${formatMarks(npc.pnl)}</p>
        <p>Holdings:</p>
        <ul>${Object.entries(npc.holdings).map(([k, v]) => `<li>${k}: ${v}</li>`).join("")}</ul>
        <p>Recent:</p>
        <ul>${npc.history.slice(-5).map(e => `<li>${e}</li>`).join("")}</ul>
      `;
    }

    function simulateNPC() {
      const name = npcNames[Math.floor(Math.random() * npcNames.length)];
      const target = securities[Math.floor(Math.random() * securities.length)];
      const qty = Math.floor(Math.random() * 20 + 1);
      const action = Math.random() < 0.5 ? "buys" : "sells";
      const npc = npcProfiles[name];
      const msg = `🏦 ${name} ${action} ${qty} units of ${target.code} at ${formatMarks(target.price)}`;
      const time = new Date().toLocaleTimeString();
      const entry = `[${time}] ${msg}`;

      if (npcLog) {
        npcLog.prepend(Object.assign(document.createElement("li"), { textContent: entry }));
      }
      npcTradeLog.push(entry);
      localStorage.setItem("npcTradeLog", JSON.stringify(npcTradeLog.slice(-100)));
      logEvent(msg);
      npc.history.push(entry);

      if (action === "buys") {
        npc.holdings[target.code] = (npc.holdings[target.code] || 0) + qty;
        npc.pnl -= qty * target.price;
      } else {
        npc.pnl += qty * target.price;
        npc.holdings[target.code] = Math.max(0, (npc.holdings[target.code] || 0) - qty);
      }

      if (Math.random() < 0.02) {
        const boomOrBust = Math.random() < 0.5 ? "💥 Magic Surge!" : "📉 Crash!";
        const factor = boomOrBust.includes("Surge") ? 1.25 : 0.75;
        target.price *= factor;
        logEvent(`${boomOrBust} ${target.code} adjusted to ${formatMarks(target.price)}`);
        if (selected?.code === target.code) drawChart(target);
        updateStats(target);
        updateMarketSummary();
      }
    }

    // Initial load
    renderNewsArchive();
    renderTopStories();
    populateNPCDropdown();
    updatePortfolio();
    refreshTicker();


    function runSimulations() {
      if (document.readyState === "complete") {
        simulateNPC();
        updateMarketSummary();
      }
    }

    let intervalId = setInterval(runSimulations, 15000);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        clearInterval(intervalId);
        intervalId = null;
      } else if (!intervalId) {
        intervalId = setInterval(runSimulations, 15000);
      }
    });

    window.addEventListener("beforeunload", () => clearInterval(intervalId));

  } catch (err) {
    console.error("Script Error:", err);
  }
});
