const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'public', 'Icons');
const outputFile = path.join(__dirname, 'src', 'utils', 'pngIcons.ts');

const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.png'));

const icons = files.map(file => {
  const id = file.replace('.png', '').replace(/[^a-zA-Z0-9]/g, '_');
  const name = file.replace('.png', '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return `{ id: '${id}', name: '${name}', url: '/Icons/${file}' }`;
});

const fileContent = `// Auto-generated list of all raster PNG icons
export const PNG_ICONS = [\n  ${icons.join(',\n  ')}\n];
`;

fs.writeFileSync(outputFile, fileContent);
console.log('Successfully wrote', files.length, 'icons to', outputFile);
