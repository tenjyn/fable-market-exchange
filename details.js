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
    const marksDisplay = document.getElementById("goldDisplay");
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
      const saved = localStorage.getItem("fablePortfolio");
      if (saved) {
        const parsed = JSON.parse(saved);
        marks = parsed.marks || 1000;
        Object.assign(portfolio, parsed.portfolio);
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
