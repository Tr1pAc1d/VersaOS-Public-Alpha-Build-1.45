const fs = require('fs');
let code = fs.readFileSync('src/components/GUIOS.tsx', 'utf8');

const regexWorkbenchConfig = /{\s*id:\s*"workbench",\s*title:\s*"AETHERIS Workbench Pro - \[C:\\\\VESPERA\\\\SRC\\\\DIAGNOSTIC\.SC\]",\s*x:\s*60,\s*y:\s*30,\s*width:\s*750,\s*height:\s*550,\s*isOpen:\s*false\s*},/g;

const newConfig = `{ id: "workbench", title: "AETHERIS Workbench Pro - [C:\\\\VESPERA\\\\SRC\\\\DIAGNOSTIC.SC]", x: 60, y: 30, width: 750, height: 550, isOpen: false },\n      { id: "open_dos", title: "Open-DOS Subsystem", x: 80, y: 40, width: 640, height: 480, isOpen: false },`;

code = code.replace(regexWorkbenchConfig, newConfig);

fs.writeFileSync('src/components/GUIOS.tsx', code);
console.log("fixed gui initial window");
