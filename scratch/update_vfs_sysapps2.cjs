const fs = require('fs');
let code = fs.readFileSync('src/hooks/useVFS.ts', 'utf8');

// Workbench Icon Replacement
const oldWorkbench = "{ id: 'workbench',       name: 'WORKBENCH.EXE',  type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'AETHERIS Workbench Pro',   appVersion: '3.1',  customIcon: '/Icons/console_prompt-0.png',       content: '[Application]\\nName=AETHERIS Workbench Pro\\nVersion=3.1' },";
const newWorkbench = "{ id: 'workbench',       name: 'WORKBENCH.EXE',  type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'AETHERIS Workbench Pro',   appVersion: '3.1',  customIcon: '/Icons/executable_gear-0.png',       content: '[Application]\\nName=AETHERIS Workbench Pro\\nVersion=3.1' },";
code = code.replace(oldWorkbench, newWorkbench);

// Add Open-DOS App BEFORE Workbench
const openDosApp = "{ id: 'open_dos',        name: 'OPENDOS.EXE',    type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'Open-DOS Subsystem',       appVersion: '1.0',  customIcon: '/Icons/ms_dos-0.png',                content: '[Application]\\nName=Open-DOS Subsystem\\nVersion=1.0' },\n    ";
code = code.replace(newWorkbench, openDosApp + newWorkbench);

// Desktop Link Replacements
const oldLnk = "{ id: 'workbench_lnk',    name: 'AETHERIS Workbench',type: 'shortcut', parentId: 'desktop', content: 'workbench',      targetId: 'workbench',      customIcon: '/Icons/console_prompt-0.png' },";
const newWorkbenchLnk = "{ id: 'workbench_lnk',    name: 'AETHERIS Workbench',type: 'shortcut', parentId: 'desktop', content: 'workbench',      targetId: 'workbench',      customIcon: '/Icons/executable_gear-0.png' },";
const openDosLnk = "\n    { id: 'open_dos_lnk',     name: 'Open-DOS',          type: 'shortcut', parentId: 'desktop', content: 'open_dos',       targetId: 'open_dos',       customIcon: '/Icons/ms_dos-0.png' },";
code = code.replace(oldLnk, newWorkbenchLnk + openDosLnk);

// Workspace Menu modifications
const oldDialup = "{ id: 'wm_dialup',  label: 'Dial-Up Networking', icon: 'Phone',      action: 'dialup',       type: 'app', isSystem: true },";
code = code.replace(oldDialup, oldDialup + "\n            { id: 'wm_open_dos',label: 'Open-DOS Subsystem', icon: 'Terminal',   action: 'open_dos',     type: 'app', isSystem: true },");

fs.writeFileSync('src/hooks/useVFS.ts', code);
console.log('done updating useVFS');
