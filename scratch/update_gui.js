const fs = require('fs');
let code = fs.readFileSync('src/components/GUIOS.tsx', 'utf8');

const oldWorkbench = \      case "workbench":\\n        return <AetherisWorkbench />;\;
const newCase = \      case "workbench":\\n        return <AetherisWorkbench />;\\n      case "open_dos":\\n        return <OpenDOSPrompt onReboot={onReboot} neuralBridgeActive={neuralBridgeActive} neuralBridgeEnabled={neuralBridgeEnabled} />;\;

code = code.replace(oldWorkbench, newCase);

fs.writeFileSync('src/components/GUIOS.tsx', code);
