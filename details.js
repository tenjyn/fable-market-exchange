// script.js (News Sorting + Top Stories)

document.addEventListener("DOMContentLoaded", () => {
  try {
    let marks = 1000;
    const portfolio = {};
    const newsQueue = [];
    const newsArchive = JSON.parse(localStorage.getItem("newsArchive")) || [];
    let topStories = [];

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

    if (!dropdown || !marksDisplay || !newsTicker || !portfolioList || !npcLog || !archive || !detailsPanel || !tradeQtyInput || !filterSelect || !topStoriesBox) {
      throw new Error("Critical UI element missing. Check HTML structure.");
    }

    renderNewsArchive();
    renderTopStories();
    loadPortfolio();

    filterSelect.addEventListener("change", renderNewsArchive);

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
      document.getElementById("priceData").textContent = `Current Price: ${formatMarks(security.price)}`;
      document.getElementById("descriptionData").textContent = security.desc;
      document.getElementById("volatilityData").textContent = `Volatility: ${security.volatility}`;
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

    function savePortfolio() {
      localStorage.setItem("fablePortfolio", JSON.stringify({ marks, portfolio }));
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

    function saveNewsArchive() {
      localStorage.setItem("newsArchive", JSON.stringify(newsArchive.slice(-100)));
    }

    function renderNewsArchive() {
      const filter = filterSelect.value;
      archive.innerHTML = "";
      newsArchive.forEach(entry => {
        if (
          filter === "all" ||
          (filter === "trades" && entry.includes("🏦")) ||
          (filter === "surges" && entry.includes("💥")) ||
          (filter === "crashes" && entry.includes("📉"))
        ) {
          const div = document.createElement("div");
          div.textContent = entry;
          archive.prepend(div);
        }
      });
    }

    function renderTopStories() {
      topStoriesBox.innerHTML = "";
      const highlights = newsArchive.filter(entry => entry.includes("💥") || entry.includes("📉"));
      highlights.slice(-5).reverse().forEach(story => {
        const p = document.createElement("p");
        p.textContent = story;
        topStoriesBox.appendChild(p);
      });
    }

    function logEvent(message) {
      const time = new Date().toLocaleTimeString();
      const entry = `[${time}] ${message}`;
      const div = document.createElement("div");
      div.textContent = entry;
      archive.prepend(div);
      newsQueue.push(entry);
      newsArchive.push(entry);
      if (entry.includes("💥") || entry.includes("📉")) topStories.push(entry);
      saveNewsArchive();
      renderTopStories();
    }

    function rotateNewsTicker() {
      if (newsQueue.length > 0) {
        const next = newsQueue.shift();
        newsTicker.textContent = next;
      }
    }

    function simulateNPC() {
      const npc = npcNames[Math.floor(Math.random() * npcNames.length)];
      const target = securities[Math.floor(Math.random() * securities.length)];
      const qty = Math.floor(Math.random() * 20 + 1);
      const action = Math.random() < 0.5 ? "buys" : "sells";
      const msg = `🏦 ${npc} ${action} ${qty} units of ${target.code}`;
      const item = document.createElement("li");
      item.textContent = msg;
      npcLog.prepend(item);
      newsQueue.push(msg);
      newsArchive.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      saveNewsArchive();

      if (Math.random() < 0.02) {
        const boomOrBust = Math.random() < 0.5 ? "💥 Magic Surge!" : "📉 Crash!";
        const factor = boomOrBust.includes("Surge") ? 1.25 : 0.75;
        target.price *= factor;
        const surgeMsg = `${boomOrBust} ${target.code} adjusted to ₥${target.price.toFixed(2)}`;
        logEvent(surgeMsg);
        updateStats(target);
        if (selected?.code === target.code) drawChart(target);
      }
    }

    function formatMarks(amount) {
      return `₥${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function loadPortfolio() {
      try {
        const savedRaw = localStorage.getItem("fablePortfolio");
        if (!savedRaw) return;
        const parsed = JSON.parse(savedRaw);
        marks = parsed.marks || 1000;
        Object.assign(portfolio, parsed.portfolio);
        updatePortfolio();
      } catch (e) {
        console.error("Failed to parse portfolio from localStorage", e);
        localStorage.removeItem("fablePortfolio");
      }
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
        li.textContent = `${code}: ${portfolio[code]} units (≈ ${formatMarks(val)})`;
        portfolioList.appendChild(li);
      }
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
