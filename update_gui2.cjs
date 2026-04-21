const fs = require('fs');
let code = fs.readFileSync('src/components/GUIOS.tsx', 'utf8');

const regexWorkbench = /case "workbench":\s*return <AetherisWorkbench \/>;/g;
const newCase = `case "workbench":
          return <AetherisWorkbench />;
        case "open_dos":
          return <OpenDOSPrompt onReboot={onReboot} neuralBridgeActive={neuralBridgeActive} neuralBridgeEnabled={neuralBridgeEnabled} />;`;

code = code.replace(regexWorkbench, newCase);

fs.writeFileSync('src/components/GUIOS.tsx', code);
console.log('updated GUIOS');
