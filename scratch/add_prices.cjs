const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'vstoreApps.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Map of app IDs to their 1996-era prices
const prices = {
  // Premium commercial games
  'doom95': 49.95,
  'simcity2k': 44.95,
  'quake96': 54.95,
  'msfs95': 59.95,
  'duke3d': 49.95,
  'myst_demo': null, // demo is free
  'descent': 39.95,
  'kq5': 34.95,
  'quakeworld': null, // free multiplayer client
  
  // Productivity (commercial)
  'word95': 339.00,
  'excel95': 339.00,
  'photoshop4': 895.00,
  'coreldraw': 595.00,
  'page_maker': 499.00,
  'filemaker': 199.00,
  'wordperfect': 295.00,
  'mathcad': 349.00,
  
  // System Utilities (paid)
  'norton': 69.95,
  'partitionmagic': 69.95,
  'winfax': 79.95,
  'zonealarm': 39.95,

  // Shareware / Freeware (no price - already null by default)
  // winamp, mirc, icq, eudora, realplayer etc are free/shareware
  
  // Entertainment (paid)
  'afterdark': 29.95,
  'encarta': 54.95,
  'connectix': 49.95,
  
  // From filler apps
  'lemmings': 29.95,
  'warcraft2': 49.95,
  'oregon_trail': 24.95,
  'norton_commander': 49.95,
  'paint_shop_pro': 69.00,
  'lotus_123': 399.00,
  'borland_delphi': 499.00,
  'diablo': 49.95,
  'wing_commander': 54.95,
  'civilisation': 44.95,
};

let count = 0;
for (const [id, price] of Object.entries(prices)) {
  if (price === null) continue;
  
  // Find the app block and add price before functional:
  const idPattern = `id: '${id}',`;
  const idx = content.indexOf(idPattern);
  if (idx === -1) {
    console.log(`  Warning: app '${id}' not found`);
    continue;
  }
  
  // Find the 'functional:' line after this id
  const funcIdx = content.indexOf('functional:', idx);
  if (funcIdx === -1 || funcIdx - idx > 800) {
    console.log(`  Warning: 'functional:' not found near '${id}'`);
    continue;
  }
  
  // Check if price already exists between id and functional
  const block = content.substring(idx, funcIdx);
  if (block.includes('price:')) {
    console.log(`  Skipping '${id}' — already has price`);
    continue;
  }
  
  // Insert price line before the functional line
  const lineStart = content.lastIndexOf('\n', funcIdx);
  const indent = '    ';
  const priceLine = `${indent}price: ${price},\n`;
  content = content.substring(0, lineStart + 1) + priceLine + content.substring(lineStart + 1);
  console.log(`  Added price $${price} to '${id}'`);
  count++;
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`\nDone! Added prices to ${count} apps.`);
