document.addEventListener("DOMContentLoaded", () => {
  const npcLog = document.getElementById("npcLog");

  function render(log) {
    npcLog.innerHTML = "";
    log.slice().reverse().forEach(entry => {
      npcLog.appendChild(Object.assign(document.createElement("li"), { textContent: entry }));
    });
  }

  let cached = JSON.parse(localStorage.getItem("npcTradeLog")) || [];
  render(cached);

  window.addEventListener("storage", e => {
    if (e.key === "npcTradeLog") {
      const updated = JSON.parse(e.newValue || "[]");
      if (updated.length < cached.length) {
        render(updated);
      } else {
        updated.slice(cached.length).forEach(entry => {
          npcLog.prepend(Object.assign(document.createElement("li"), { textContent: entry }));
        });
      }
      cached = updated;
    }
  });
});
