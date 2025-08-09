// script.js — updated for persistent portfolio, NPC profiles, and news ticker polish

import { generateSecurities, formatMarks, generatePriceHistory, loadJSON, saveJSON } from "./utils.js";

// Ensure Chart.js is loaded before this script

document.addEventListener("DOMContentLoaded", () => {
  try {
    let marks = 1000;
    const portfolio = {};
    const newsQueue = [];
    const newsArchive = loadJSON("newsArchive", []);
    const npcProfiles = {};
    const topStories = [];

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
    const marksDisplay = document.getElementById("marksDisplay");
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

    function trade(type) {
      if (!selected) return alert("Select a security.");
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
        logEvent(`⚠️ Trade failed.`);
      }
      updatePortfolio();
      savePortfolio();
    }

    function updatePortfolio() {
      marksDisplay.textContent = formatMarks(marks);
      portfolioList.innerHTML = Object.keys(portfolio).length === 0 ? "<li>None owned</li>" : "";
      for (const code in portfolio) {
        const sec = securities.find(s => s.code === code);
        const val = sec.price * portfolio[code];
        const li = document.createElement("li");
        li.textContent = `${code}: ${portfolio[code]} units (≈ ${formatMarks(val)})`;
        portfolioList.appendChild(li);
      }
    }

    function logEvent(message) {
      const time = new Date().toLocaleTimeString();
      const entry = `[${time}] ${message}`;
      newsArchive.push(entry);
      newsQueue.push(entry);
      archive.prepend(Object.assign(document.createElement("div"), { textContent: entry }));
      if (entry.includes("💥") || entry.includes("📉")) topStories.push(entry);
      saveJSON("newsArchive", newsArchive.slice(-100));
      renderTopStories();
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
      const msg = `🏦 ${name} ${action} ${qty} units of ${target.code}`;

      npcLog.prepend(Object.assign(document.createElement("li"), { textContent: msg }));
      newsQueue.push(msg);
      newsArchive.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      saveJSON("newsArchive", newsArchive.slice(-100));
      npc.history.push(msg);

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
      }
    }

    function rotateNewsTicker() {
      if (newsQueue.length > 0) newsTicker.textContent = newsQueue.shift();
    }

    function savePortfolio() {
      saveJSON("fablePortfolio", { marks, portfolio });
    }

    function loadPortfolio() {
      const saved = loadJSON("fablePortfolio", { marks: 1000, portfolio: {} });
      marks = saved.marks;
      Object.assign(portfolio, saved.portfolio);
      updatePortfolio();
    }

    // Initial load
    loadPortfolio();
    renderNewsArchive();
    renderTopStories();
    populateNPCDropdown();
    updatePortfolio();

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
