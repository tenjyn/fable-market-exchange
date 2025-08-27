function loadPortfolioData() {
  try {
    const raw = localStorage.getItem("fablePortfolio");
    const saved = raw ? JSON.parse(raw) : {};
    const portfolio = {};
    const savedPortfolio = saved.portfolio || {};
    for (const code in savedPortfolio) {
      const entry = savedPortfolio[code];
      portfolio[code] = typeof entry === "number" ? { units: entry, avgCost: 0 } : entry;
    }
    return {
      marks: saved.marks || 1000,
      portfolio,
      tradeHistory: saved.tradeHistory || []
    };
  } catch (e) {
    console.error("Failed to parse portfolio from localStorage", e);
    localStorage.removeItem("fablePortfolio");
    return { marks: 1000, portfolio: {}, tradeHistory: [] };
  }
}

function savePortfolioData(data) {
  localStorage.setItem("fablePortfolio", JSON.stringify(data));
}
