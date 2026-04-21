import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useFileSystem } from "../hooks/useFileSystem";
import { OS_CONFIG } from "../constants/os";

interface TerminalProps {
  onReboot: () => void;
  guiEnabled: boolean;
  onStartGUI: () => void;
  neuralBridgeEnabled: boolean;
  neuralBridgeActive: boolean;
  onActivateBridge: () => void;
}

type HistoryEntry = { text: string; type?: 'input' | 'output' | 'error' | 'success'};
export const Terminal: React.FC<TerminalProps> = ({ 
  onReboot, 
  guiEnabled, 
  onStartGUI,
  neuralBridgeEnabled,
  neuralBridgeActive,
  onActivateBridge
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState("");
  const { ls, cd, cat, getPrompt } = useFileSystem();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) {
      setHistory((prev) => [...prev, { text: getPrompt(), type: 'input' }]);
      return;
    }

    // Handle "h? command" syntax
    if (trimmed.startsWith("h? ")) {
      const targetCmd = trimmed.slice(3).toLowerCase();
      const helpText = OS_CONFIG.HELP_DATA[targetCmd as keyof typeof OS_CONFIG.HELP_DATA];
      setHistory((prev) => [...prev, { text: `${getPrompt()}${cmd}`, type: 'input' }, { text: helpText || `No help available for: ${targetCmd}`, type: 'success'}]);
      return;
    }

    const [command, ...args] = trimmed.split(" ");
    let output = "";

    switch (command.toLowerCase()) {
      case "ls":
      case "dir":
        output = ls(args[0]);
        break;
      case "cd":
        output = cd(args[0] || "/");
        break;
      case "cat":
      case "type":
        output = cat(args[0]);
        break;
      case "clear":
        setHistory([]);
        return;
      case "js":
      case "eval":
      case "script": {
        const scriptCode = cmd.substring(command.length).trim();
        if (!scriptCode) {
          output = "ERROR: Missing script body. Usage: js [code]";
          break;
        }
        try {
          // A rudimentary secure evaluation context restricted purely to the browser state.
          
          // Try executing as standalone function (handles function declarations, IIFEs, statements).
          let evaluated;
          try {
            evaluated = new Function(scriptCode)();
          } catch(e1) {
            // Fallback for raw expressions like "1 + 1" which fail new Function("1+1")() but work in eval
            evaluated = eval(scriptCode);
          }

          output = evaluated === undefined ? "" : String(evaluated);
        } catch (err: any) {
          output = `Execution Error: ${err.message || 'Unknown exception'}`;
        }
        break;
      }
      case "help":
        if (args[0]) {
          const helpText = OS_CONFIG.HELP_DATA[args[0].toLowerCase() as keyof typeof OS_CONFIG.HELP_DATA];
          output = helpText || `No help available for: ${args[0]}`;
        } else {
          output = "Available commands:\nls [dir] - List directory contents (alias: dir)\ncd [dir] - Change directory\ncat [file] - Read file content (alias: type)\nclear - Clear terminal\njs [code] - Evaluate generic JS execution strings (Open-DOS Subsystem Feature)\nwhoami - Display current user\ndate - Display system date\nmem - Display memory status\nver - Display OS version\ntutorial - Start navigation guide\nreboot - Restart system\nstartgui - Launch Desktop Environment\nxtype [args] - Neural Bridge interface\nhelp [cmd] - Show help for a command (or use h? [cmd])";
        }
        break;
      case "tutorial":
        output = "--- AETHERIS NAVIGATION TUTORIAL ---\n1. To see where you are, look at the prompt: thorne@aetheris:/path$\n2. To see what's in the current folder, type 'ls' or 'dir'.\n3. To enter a folder, type 'cd foldername'.\n4. To go back to the previous folder, type 'cd ..'.\n5. To read a file, type 'cat filename.txt' or 'type filename.txt'.\n6. Try navigating to 'home/thorne' to find Dr. Thorne's files.";
        break;
      case "whoami":
        output = "thorne (Dr. Elias Thorne - System Administrator)";
        break;
      case "date":
        output = new Date().toString();
        break;
      case "mem":
        output = "Total Conventional Memory: 640 KB\nTotal Extended Memory: 32768 KB\nUsed: 4122 KB\nFree: 28646 KB\n\nShadow Sector Allocation: [REDACTED]";
        break;
      case "ver":
        output = `${OS_CONFIG.NAME} [Version ${OS_CONFIG.VERSION}]\n(C) Copyright ${OS_CONFIG.COMPANY} 1991-1994.`;
        break;
      case "startgui":
        if (guiEnabled) {
          onStartGUI();
          return;
        } else {
          output = "Error: Protected Mode (XMS) is disabled in BIOS.\nCheck Advanced BIOS Features in System Setup.";
        }
        break;
      case "xtype":
        if (args[0] === "init") {
          if (!neuralBridgeEnabled) {
            output = "Error: X-Type Neural Bridge hardware not detected or disabled in BIOS.";
          } else if (neuralBridgeActive) {
            output = "X-Type Neural Bridge is already active and synced.";
          } else {
            onActivateBridge();
            output = "Initializing X-Type Neural Bridge...\nAllocating non-euclidean memory maps... [OK]\nBypassing standard safety protocols... [OK]\nSYNC ESTABLISHED.\n\nWARNING: Anomalous data streams detected. The bridge is open.";
          }
        } else {
          output = "Usage: xtype init\nInitializes the X-Type Neural Bridge co-processor.";
        }
        break;
      case "reboot":
        onReboot();
        return;
      case "sudo":
        output = "Error: Permission denied. User 'thorne' is under surveillance.";
        break;
      default:
        output = `Command not found: ${command}. Type 'help' for assistance.`;
    }

    
    const isError = output.toLowerCase().includes("error") || output.includes("Command not found");
    const outputItem = output ? [{ text: output, type: isError ? 'error' : 'success' as const }] : [];
    setHistory((prev) => [...prev, { text: `${getPrompt()}${cmd}`, type: 'input' }, ...outputItem]);
  
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full p-4 font-mono text-sm md:text-base overflow-hidden">
      <div className="mb-4 opacity-70">
        <div>{OS_CONFIG.NAME} {OS_CONFIG.VERSION}</div>
        <div>{OS_CONFIG.COPYRIGHT}</div>
        <div className="mt-2">Type 'help' for a list of commands.</div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-4 space-y-1 scroll-smooth"
      >
        {history.map((item, i) => (
          <div 
            key={i} 
            className={`whitespace-pre-wrap break-all ${item.type === 'error' ? 'text-red-500' : item.type === 'success' ? 'text-cyan-400' : 'text-[#00ff41]'}`}
          >
            {item.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-start">
        <span className="mr-2 shrink-0 pt-0.5">{getPrompt()}</span>
        <textarea
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleCommand(input);
              setInput("");
            }
          }}
          rows={Math.max(1, input.split('\n').length)}
          className="flex-1 bg-transparent border-none outline-none text-[#00ff41] caret-block resize-none overflow-hidden pb-1 pt-0.5"
          spellCheck={false}
        />
      </form>
      
      <style>{`
        .caret-block {
          caret-color: #00ff41;
        }
      `}</style>
    </div>
  );
};
