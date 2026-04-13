const fs = require('fs');
const file = 'd:\\VersaOS-main\\src\\components\\WebBrowser.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const importIdx = lines.findIndex(l => l.includes('import { XArchiveSite }'));
lines.splice(importIdx + 1, 0, "import { VesperaSystemsSite } from './VesperaSystemsSite';");

const startIdx = lines.findIndex(l => l.includes("{(activeTab.url === 'home' || activeTab.url.startsWith('vespera:')) ? ("));
const endIdx = lines.findIndex((l, idx) => idx > startIdx && l.includes("        ) : (") && lines[idx+1].includes("          <iframe"));

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `        {(activeTab.url === 'home' || activeTab.url.startsWith('vespera:')) ? (
          <VesperaSystemsSite 
            url={activeTab.url}
            navigate={navigate}
            webAccount={webAccount}
            onLaunchApp={onLaunchApp}
            onDownload={onDownload}
            setWebLoginModal={setWebLoginModal}
            handleWebLogout={handleWebLogout}
            startFailingDownload={startFailingDownload}
            xtypeImage={xtypeImage}
          />`;
    lines.splice(startIdx, endIdx - startIdx, replacement);
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log("Successfully patched WebBrowser.tsx");
} else {
    console.log("Could not find slice indices.", startIdx, endIdx);
}
