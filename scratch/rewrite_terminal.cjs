const fs = require('fs');
let code = fs.readFileSync('src/components/Terminal.tsx', 'utf8');

// 1. In JS case, replace args.join(" ") with full preserved string extract
const pattern1 = /const scriptCode = args\.join\(" "\);/g;
code = code.replace(pattern1, 'const scriptCode = cmd.substring(command.length).trim();');

// 2. Wrap `eval` block to improve resilience and allow statements without return wrapper
const pattern2 = /const evaluated = new Function\(`return \(\$\{scriptCode\}\)`\)\(\);/g;
code = code.replace(pattern2, `
          // Try executing as standalone function (handles function declarations, IIFEs, statements).
          let evaluated;
          try {
            evaluated = new Function(scriptCode)();
          } catch(e1) {
            // Fallback for raw expressions like "1 + 1" which fail new Function("1+1")() but work in eval
            evaluated = eval(scriptCode);
          }
`);

// 3. Change input to textarea and add handleKeyDown
const inputHtmlRegex = /<input([\\s\\S]*?)spellCheck=\{false\}\s*\/>/g;
const textAreaReplacement = `<textarea
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCommand(input);
                setInput('');
              }
            }}
            rows={Math.max(1, input.split('\\n').length)}
            className="flex-1 bg-transparent border-none outline-none text-[#00ff41] caret-block resize-none overflow-hidden"
            spellCheck={false}
          />`;

code = code.replace(inputHtmlRegex, textAreaReplacement);

fs.writeFileSync('src/components/Terminal.tsx', code);
console.log('rewrote terminal');
