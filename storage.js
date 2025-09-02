let cachedData;

function loadPortfolioData() {
  if (cachedData) {
    return cachedData;
  }
  try {
    const raw = localStorage.getItem("fablePortfolio");
    const saved = raw ? JSON.parse(raw) : {};
    const portfolio = {};
    const savedPortfolio = saved.portfolio || {};
    for (const code in savedPortfolio) {
      const entry = savedPortfolio[code];
      portfolio[code] = typeof entry === "number" ? { units: entry, avgCost: 0 } : entry;
    }
    cachedData = {
      marks: saved.marks || 1000,
      portfolio,
      tradeHistory: saved.tradeHistory || []
    };
    return cachedData;
  } catch (e) {
    console.error("Failed to parse portfolio from localStorage", e);
    localStorage.removeItem("fablePortfolio");
    cachedData = { marks: 1000, portfolio: {}, tradeHistory: [] };
    return cachedData;
  }
}

function savePortfolioData(data) {
  localStorage.setItem("fablePortfolio", JSON.stringify(data));
  cachedData = data;
}

if (typeof module !== "undefined") {
  module.exports = { loadPortfolioData, savePortfolioData };
}
