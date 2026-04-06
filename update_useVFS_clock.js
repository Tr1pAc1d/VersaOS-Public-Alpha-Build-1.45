import fs from 'fs';
import path from 'path';

const useVFSFile = path.resolve('d:/VersaOS-main/src/hooks/useVFS.ts');
let vfsContent = fs.readFileSync(useVFSFile, 'utf8');

// 1. Update setDisplaySettings initialization
vfsContent = vfsContent.replace(
  `taskbarShowClock: parsed.taskbarShowClock !== undefined ? parsed.taskbarShowClock : true`,
  `taskbarShowClock: parsed.taskbarShowClock !== undefined ? parsed.taskbarShowClock : true,
      clockBgColor: parsed.clockBgColor || '',
      clockTextColor: parsed.clockTextColor || '',
      clockFont: parsed.clockFont || 'font-mono',
      clockFormat: parsed.clockFormat || '24h'`
);

// 2. Add updateClockSettings
const taskbarClockDef = `const updateTaskbarClock = (taskbarShowClock: boolean) => {
    setDisplaySettings((prev: any) => ({ ...prev, taskbarShowClock }));
  };`;

const clockSettingsDef = `  const updateClockSettings = (settings: { clockBgColor?: string; clockTextColor?: string; clockFont?: string; clockFormat?: '12h' | '24h' }) => {
    setDisplaySettings((prev: any) => ({ ...prev, ...settings }));
  };`;

if(vfsContent.includes(taskbarClockDef)) {
  vfsContent = vfsContent.replace(taskbarClockDef, taskbarClockDef + '\n\n' + clockSettingsDef);
}

// 3. Update export
vfsContent = vfsContent.replace(
  `updateTaskbarTheme, updateTaskbarClock, createNode`,
  `updateTaskbarTheme, updateTaskbarClock, updateClockSettings, createNode`
);

fs.writeFileSync(useVFSFile, vfsContent);
console.log('Successfully updated useVFS.ts');
