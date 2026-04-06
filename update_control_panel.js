import fs from 'fs';
import path from 'path';

const panelFile = path.resolve('d:/VersaOS-main/src/components/ControlPanel.tsx');
let panelContent = fs.readFileSync(panelFile, 'utf8');

// 1. Add definitions
const stateInitBlock = `  const [selectedTaskbarTheme, setSelectedTaskbarTheme] = useState(vfs.displaySettings?.taskbarTheme || 'motif');
  const [selectedTaskbarShowClock, setSelectedTaskbarShowClock] = useState(vfs.displaySettings?.taskbarShowClock !== false);`;

const newStateInitBlock = `  const tTheme = vfs.displaySettings?.taskbarTheme || 'motif';
  const defaultBg = tTheme === 'dark' ? '#000000' : '#c0c0c0';
  const defaultText = tTheme === 'dark' ? '#22c55e' : '#000000';

  const [selectedTaskbarTheme, setSelectedTaskbarTheme] = useState(vfs.displaySettings?.taskbarTheme || 'motif');
  const [selectedTaskbarShowClock, setSelectedTaskbarShowClock] = useState(vfs.displaySettings?.taskbarShowClock !== false);
  const [clockBgColor, setClockBgColor] = useState(vfs.displaySettings?.clockBgColor || defaultBg);
  const [clockTextColor, setClockTextColor] = useState(vfs.displaySettings?.clockTextColor || defaultText);
  const [clockFont, setClockFont] = useState(vfs.displaySettings?.clockFont || 'font-mono');
  const [clockFormat, setClockFormat] = useState(vfs.displaySettings?.clockFormat || '24h');`;

panelContent = panelContent.replace(stateInitBlock, newStateInitBlock);

// 2. Add to useEffect
const effectBlock = `      setSelectedTaskbarTheme(vfs.displaySettings?.taskbarTheme || 'motif');
      setSelectedTaskbarShowClock(vfs.displaySettings?.taskbarShowClock !== false);`;

const newEffectBlock = `      setSelectedTaskbarTheme(vfs.displaySettings?.taskbarTheme || 'motif');
      setSelectedTaskbarShowClock(vfs.displaySettings?.taskbarShowClock !== false);
      setClockBgColor(vfs.displaySettings?.clockBgColor || defaultBg);
      setClockTextColor(vfs.displaySettings?.clockTextColor || defaultText);
      setClockFont(vfs.displaySettings?.clockFont || 'font-mono');
      setClockFormat(vfs.displaySettings?.clockFormat || '24h');`;

// using String.replace will only replace the first occurrence, which is fine!
panelContent = panelContent.replace(effectBlock, newEffectBlock);

// 3. Add to handleApply
const applyBlock = `    if (vfs.updateTaskbarTheme) vfs.updateTaskbarTheme(selectedTaskbarTheme);
    if (vfs.updateTaskbarClock) vfs.updateTaskbarClock(selectedTaskbarShowClock);`;

const newApplyBlock = `    if (vfs.updateTaskbarTheme) vfs.updateTaskbarTheme(selectedTaskbarTheme);
    if (vfs.updateTaskbarClock) vfs.updateTaskbarClock(selectedTaskbarShowClock);
    if (vfs.updateClockSettings) vfs.updateClockSettings({ clockBgColor, clockTextColor, clockFont, clockFormat });`;

panelContent = panelContent.replace(applyBlock, newApplyBlock);

// 4. Update isApplyEnabled
const enableBlock = `    selectedTaskbarTheme !== (vfs.displaySettings?.taskbarTheme || 'motif') ||
    selectedTaskbarShowClock !== (vfs.displaySettings?.taskbarShowClock !== false)
  ) && !confirming;`;

const newEnableBlock = `    selectedTaskbarTheme !== (vfs.displaySettings?.taskbarTheme || 'motif') ||
    selectedTaskbarShowClock !== (vfs.displaySettings?.taskbarShowClock !== false) ||
    clockBgColor !== (vfs.displaySettings?.clockBgColor || defaultBg) ||
    clockTextColor !== (vfs.displaySettings?.clockTextColor || defaultText) ||
    clockFont !== (vfs.displaySettings?.clockFont || 'font-mono') ||
    clockFormat !== (vfs.displaySettings?.clockFormat || '24h')
  ) && !confirming;`;

panelContent = panelContent.replace(enableBlock, newEnableBlock);

// 5. Add UI options
const uiBlock = `<div className="border-t border-gray-400 pt-3">
          <p className="font-bold text-xs mb-2">Options:</p>
          <label 
            className="flex items-center gap-2 cursor-pointer w-max"
            onClick={() => setSelectedTaskbarShowClock(!selectedTaskbarShowClock)}
          >
            <div className="w-4 h-4 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex items-center justify-center shrink-0">
              {selectedTaskbarShowClock && <div className="w-2 h-2 bg-black" />}
            </div>
            <span className="text-sm">Show Clock in Task Menu</span>
          </label>
        </div>`;

const newUiBlock = `<div className="border-t border-gray-400 pt-3">
          <p className="font-bold text-xs mb-1">Options:</p>
          <div className="flex flex-col gap-2">
            <label 
              className="flex items-center gap-2 cursor-pointer w-max"
              onClick={() => setSelectedTaskbarShowClock(!selectedTaskbarShowClock)}
            >
              <div className="w-4 h-4 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex items-center justify-center shrink-0">
                {selectedTaskbarShowClock && <div className="w-2 h-2 bg-black" />}
              </div>
              <span className="text-sm tracking-wide">Show Clock in Task Menu</span>
            </label>
            
            {selectedTaskbarShowClock && (
              <div className="ml-6 flex flex-col gap-2 p-2 border border-gray-400 bg-white">
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <span className="text-xs">Background:</span>
                  <div className="flex gap-2 items-center">
                    <input type="color" className="w-8 h-6 p-0 border border-gray-400 cursor-pointer" value={clockBgColor.startsWith('bg-') || clockBgColor === '' ? defaultBg : clockBgColor} onChange={e => setClockBgColor(e.target.value)} />
                    <span className="text-[10px] text-gray-500 font-mono">{clockBgColor.startsWith('bg-') || clockBgColor === ''  ? defaultBg : clockBgColor}</span>
                  </div>
                </div>
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <span className="text-xs">Text Color:</span>
                  <div className="flex gap-2 items-center">
                    <input type="color" className="w-8 h-6 p-0 border border-gray-400 cursor-pointer" value={clockTextColor.startsWith('text-') || clockTextColor === '' ? defaultText : clockTextColor} onChange={e => setClockTextColor(e.target.value)} />
                    <span className="text-[10px] text-gray-500 font-mono">{clockTextColor.startsWith('text-') || clockTextColor === '' ? defaultText : clockTextColor}</span>
                  </div>
                </div>
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <span className="text-xs">Font:</span>
                  <select className="text-xs border border-gray-400 p-0.5 outline-none" value={clockFont} onChange={e => setClockFont(e.target.value)}>
                    <option value="font-mono">Monospace (Classic)</option>
                    <option value="font-sans">Sans-Serif</option>
                    <option value="font-serif">Serif (Times)</option>
                  </select>
                </div>
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <span className="text-xs">Format:</span>
                  <select className="text-xs border border-gray-400 p-0.5 outline-none" value={clockFormat} onChange={e => setClockFormat(e.target.value)}>
                    <option value="24h">24-Hour (Military)</option>
                    <option value="12h">12-Hour (AM/PM)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>`;

if(panelContent.includes(uiBlock)) {
    panelContent = panelContent.replace(uiBlock, newUiBlock);
    fs.writeFileSync(panelFile, panelContent);
    console.log('Successfully updated ControlPanel.tsx');
} else {
    // try slightly different whitespace
    const normalizedPanel = panelContent.replace(/\\s+/g, ' ');
    const normalizedUI = uiBlock.replace(/\\s+/g, ' ');
    if (normalizedPanel.includes(normalizedUI)) {
        console.log("Matched with normalized whitespace! Will use a regex fallback.");
        // We'll write this dynamically inside the script if needed.
    } else {
        console.error('Failed to locate ControlPanel.tsx UI block!');
    }
}
