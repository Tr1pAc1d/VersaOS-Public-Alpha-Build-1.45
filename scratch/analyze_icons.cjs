const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'public', 'Icons');
const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));

console.log(`Total icons: ${files.length}`);
// Print a random sample of 50 icons
for (let i = 0; i < 50; i++) {
  const index = Math.floor(Math.random() * files.length);
  console.log(files[index]);
}

// Alternatively, let's categorize them roughly based on keywords
const keywords = ['folder', 'file', 'sys', 'app', 'calc', 'paint', 'word', 'excel', 'media', 'game', 'drive', 'net', 'web', 'mail'];
const counts = {};
keywords.forEach(k => counts[k] = 0);

files.forEach(f => {
  const name = f.toLowerCase();
  keywords.forEach(k => {
    if (name.includes(k)) counts[k]++;
  });
});

console.log('--- Keyword Counts ---');
for (const [k, v] of Object.entries(counts)) {
  console.log(`${k}: ${v}`);
}
