import fs from 'fs';
import path from 'path';

const guiFile = path.resolve('d:/VersaOS-main/src/components/GUIOS.tsx');
let guiContent = fs.readFileSync(guiFile, 'utf8');

// The original UI logic to be replaced
const originalClockCode = `{/* Left: Clock / Status (Recessed) */}
        {vfs.displaySettings?.taskbarShowClock !== false && (
          <div className={\`h-full flex items-center gap-1 border-2 p-1 \${theme.bgRecessed} \${theme.borderRecessed}\`}>
            <div className={\`h-full px-2 \${tTheme === 'dark' ? 'bg-[#000]' : 'bg-[#c0c0c0]'} border-2 \${tTheme === 'dark' ? 'border-t-[#222] border-l-[#222] border-b-[#555] border-r-[#555] text-green-500' : 'border-t-[#2a3f5c] border-l-[#2a3f5c] border-b-[#ffffff] border-r-[#ffffff] text-black'} flex flex-col items-center justify-center font-mono text-xs min-w-[60px]\`}>
              <span className="font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              {neuralBridgeActive && <span className="text-red-600 animate-pulse text-[10px] leading-none mt-1">SYNC</span>}
            </div>
          </div>
        )}`;

const updatedClockCode = `{/* Left: Clock / Status (Recessed) */}
        {vfs.displaySettings?.taskbarShowClock !== false && (() => {
          const bgCol = vfs.displaySettings?.clockBgColor || (tTheme === 'dark' ? '#000000' : '#c0c0c0');
          const textCol = vfs.displaySettings?.clockTextColor || (tTheme === 'dark' ? '#22c55e' : '#000000');
          const fontClass = vfs.displaySettings?.clockFont || 'font-mono';
          const is12Hour = vfs.displaySettings?.clockFormat === '12h';
          
          return (
            <div className={\`h-full flex items-center gap-1 border-2 p-1 \${theme.bgRecessed} \${theme.borderRecessed}\`}>
              <div 
                className={\`h-full px-2 border-2 \${tTheme === 'dark' ? 'border-t-[#222] border-l-[#222] border-b-[#555] border-r-[#555]' : 'border-t-[#2a3f5c] border-l-[#2a3f5c] border-b-[#ffffff] border-r-[#ffffff]'} flex flex-col items-center justify-center \${fontClass} text-xs min-w-[60px]\`}
                style={{ backgroundColor: bgCol, color: textCol }}
              >
                <span className="font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: is12Hour })}</span>
                {neuralBridgeActive && <span className="text-red-600 animate-pulse text-[10px] leading-none mt-1">SYNC</span>}
              </div>
            </div>
          );
        })()}`;

if (guiContent.includes(originalClockCode)) {
    guiContent = guiContent.replace(originalClockCode, updatedClockCode);
    fs.writeFileSync(guiFile, guiContent);
    console.log('Successfully updated GUIOS.tsx clock block.');
} else {
    console.error('Failed to locate GUIOS.tsx original clock code!');
}
