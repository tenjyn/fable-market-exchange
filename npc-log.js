document.addEventListener("DOMContentLoaded", () => {
  const npcLog = document.getElementById("npcLog");
  function render() {
    const log = JSON.parse(localStorage.getItem("npcTradeLog")) || [];
    npcLog.innerHTML = "";
    log.slice().reverse().forEach(entry => {
      npcLog.appendChild(Object.assign(document.createElement("li"), { textContent: entry }));
    });
  }
  render();
  setInterval(render, 5000);
});
