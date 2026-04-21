const fs = require('fs');
let code = fs.readFileSync('src/components/Terminal.tsx', 'utf8');

// 1. Add Type Definition
code = code.replace(
  /export const Terminal.*?\{/,
  `type HistoryEntry = { text: string; type?: 'input' | 'output' | 'error' | 'success'};
export const Terminal: React.FC<TerminalProps> = ({ 
  onReboot, 
  guiEnabled, 
  onStartGUI,
  neuralBridgeEnabled,
  neuralBridgeActive,
  onActivateBridge
}) => {`
);

// 2. Change hook
code = code.replace(
  /const \[history, setHistory\] = useState<string\[\]>\(\[\]\);/g,
  `const [history, setHistory] = useState<HistoryEntry[]>([]);`
);

// 3. Update empty command handler
code = code.replace(
  /setHistory\(\(prev\) => \[\.\.\.prev, getPrompt\(\)\]\);/g,
  `setHistory((prev) => [...prev, { text: getPrompt(), type: 'input' }]);`
);

// 4. Update h? logic
code = code.replace(
  /setHistory\(\(prev\) => \[\.\.\.prev, \`\$\{getPrompt\(\)\}\$\{cmd\}\`, helpText \|\| \`No help available for: \$\{targetCmd\}\`\]\);/g,
  `setHistory((prev) => [...prev, { text: \`\${getPrompt()}\${cmd}\`, type: 'input' }, { text: helpText || \`No help available for: \${targetCmd}\`, type: 'success'}]);`
);

// 5. Update main handleCommand appender
code = code.replace(
  /setHistory\(\(prev\) => \[\.\.\.prev, \`\$\{getPrompt\(\)\}\$\{cmd\}\`, output\]\.filter\(Boolean\)\);/g,
  `
    const isError = output.toLowerCase().includes("error") || output.includes("Command not found");
    const outputItem = output ? [{ text: output, type: isError ? 'error' : 'success' as const }] : [];
    setHistory((prev) => [...prev, { text: \`\${getPrompt()}\${cmd}\`, type: 'input' }, ...outputItem]);
  `
);

// 6. Update HTML map render block
const htmlMapRegex = /\{history\.map\(\(line, i\) => \(\s*<div key=\{i\} className="whitespace-pre-wrap break-all">\s*\{line\}\s*<\/div>\s*\)\)\}/g;
code = code.replace(htmlMapRegex, `{history.map((item, i) => (
          <div 
            key={i} 
            className={\`whitespace-pre-wrap break-all \${item.type === 'error' ? 'text-red-500' : item.type === 'success' ? 'text-cyan-400' : 'text-[#00ff41]'}\`}
          >
            {item.text}
          </div>
        ))}`);

fs.writeFileSync('src/components/Terminal.tsx', code);
console.log('updated history type in Terminal');
