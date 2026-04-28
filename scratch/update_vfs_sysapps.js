const fs = require('fs');
let code = fs.readFileSync('src/hooks/useVFS.ts', 'utf8');

// Replace workbench icon
code = code.replace(
  /{ id: 'workbench',       name: 'WORKBENCH.EXE',  type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'AETHERIS Workbench Pro',   appVersion: '3.1',  customIcon: '\/Icons\/console_prompt-0.png',       content: '\[Application\]\\nName=AETHERIS Workbench Pro\\nVersion=3.1' },/,
  \{ id: 'workbench',       name: 'WORKBENCH.EXE',  type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'AETHERIS Workbench Pro',   appVersion: '3.1',  customIcon: '/Icons/executable_gear-0.png',       content: '[Application]\\\\nName=AETHERIS Workbench Pro\\\\nVersion=3.1' },\
);

// Inject Open-DOS App
code = code.replace(
  /{ id: 'workbench',/,
  \{ id: 'open_dos',        name: 'OPENDOS.EXE',    type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'Open-DOS Subsystem',       appVersion: '1.0',  customIcon: '/Icons/ms_dos-0.png',                content: '[Application]\\\\nName=Open-DOS Subsystem\\\\nVersion=1.0' },\\n    { id: 'workbench',\
);

// Add to Desktop Shortcut
code = code.replace(
  /{ id: 'workbench_lnk',    name: 'AETHERIS Workbench',type: 'shortcut', parentId: 'desktop', content: 'workbench',      targetId: 'workbench',      customIcon: '\/Icons\/console_prompt-0.png' },/,
  \{ id: 'workbench_lnk',    name: 'AETHERIS Workbench',type: 'shortcut', parentId: 'desktop', content: 'workbench',      targetId: 'workbench',      customIcon: '/Icons/executable_gear-0.png' },\\n    { id: 'open_dos_lnk',     name: 'Open-DOS',          type: 'shortcut', parentId: 'desktop', content: 'open_dos',       targetId: 'open_dos',       customIcon: '/Icons/ms_dos-0.png' },\
);

// Add to Workspace Menu Programs -> System Tools
code = code.replace(
  /{ id: 'wm_dialup',  label: 'Dial-Up Networking', icon: 'Phone',      action: 'dialup',       type: 'app', isSystem: true },/g,
  \{ id: 'wm_dialup',  label: 'Dial-Up Networking', icon: 'Phone',      action: 'dialup',       type: 'app', isSystem: true },\\n            { id: 'wm_open_dos',label: 'Open-DOS Subsystem', icon: 'Terminal',   action: 'open_dos',     type: 'app', isSystem: true },\
);

fs.writeFileSync('src/hooks/useVFS.ts', code);
console.log('done updating useVFS');
