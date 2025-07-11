// generate-npc-json.js

const fs = require('fs');

const npcSnapshot = [
  {
    name: "The Royal Frog Bank 🐸",
    gold: 1000,
    portfolio: {
      WHEA: [{ qty: 10, price: 85.25 }],
      CORN: [{ qty: 5, price: 78.10 }]
    }
  },
  {
    name: "Fé Luminous Exchange ✨",
    gold: 870,
    portfolio: {
      PHNX: [{ qty: 3, price: 140.0 }],
      TRTI: [{ qty: 2, price: 97.0 }]
    }
  },
  {
    name: "House Vaelwright & Sons 📘",
    gold: 960,
    portfolio: {
      CATT: [{ qty: 4, price: 88.3 }]
    }
  }
];

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync(
  'public/npc_market_snapshot.json',
  JSON.stringify(npcSnapshot, null, 2)
);

console.log("✅ NPC snapshot written to /public/npc_market_snapshot.json");
