const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'public', 'npc_market_snapshot.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const snapshot = {
  timestamp: new Date().toISOString(),
  npcs: []
};
fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));
console.log('NPC snapshot written to', outputPath);
