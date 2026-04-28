import React, { useEffect, useState, useRef, useCallback } from "react";
import { useFileSystem } from "../hooks/useFileSystem";
import { OS_CONFIG } from "../constants/os";
import { ASCIIArtBlock, FullscreenDOSViewer } from "./TerminalViewers";

interface TerminalProps {
  onReboot: () => void;
  guiEnabled: boolean;
  onStartGUI: () => void;
  neuralBridgeEnabled: boolean;
  neuralBridgeActive: boolean;
  onActivateBridge: () => void;
}

type HistoryEntry = {
  text: string;
  type?: "input" | "output" | "error" | "success";
  /** If set, renders an ASCIIArtBlock instead of text. */
  imagePath?: string;
};

// ── All known commands for tab-completion ─────────────────────────────────────
const ALL_COMMANDS = [
  "ls", "dir", "cd", "cat", "type", "clear", "echo",
  "js", "eval", "script",
  "help", "tutorial", "whoami", "date", "mem", "ver",
  "ping", "netstat", "shadow", "decrypt",
  "imgview", "view", "asciiview",
  "startgui", "xtype", "reboot", "sudo",
];

// ── Commands that accept a VFS path as first arg ──────────────────────────────
const PATH_COMMANDS = new Set(["cd", "ls", "cat", "type", "decrypt"]);

// ── Commands whose output uses the typewriter queue ───────────────────────────
const TYPEWRITER_COMMANDS = new Set(["tutorial", "ping", "netstat", "decrypt", "shadow", "mem"]);

// ── Build the "help" listing dynamically from HELP_DATA ───────────────────────
function buildHelpListing(): string {
  const sections: Record<string, string[]> = {
    "Filesystem":    ["ls", "dir", "cd", "cat", "type", "echo"],
    "System Info":   ["ver", "whoami", "date", "mem"],
    "Session":       ["help", "clear", "tutorial", "reboot", "startgui"],
    "Network":       ["ping", "netstat"],
    "Viewers":       ["imgview", "view", "asciiview"],
    "Advanced/Lore": ["shadow", "decrypt", "xtype", "js", "sudo"],
  };
  const lines: string[] = ["Available commands:"];
  for (const [section, cmds] of Object.entries(sections)) {
    lines.push(`\n[${section}]`);
    for (const cmd of cmds) {
      const entry = OS_CONFIG.HELP_DATA[cmd as keyof typeof OS_CONFIG.HELP_DATA];
      // First line of the entry is "Usage: ..." — grab the short form
      const short = entry?.split("\n")[0].replace("Usage: ", "") ?? cmd;
      lines.push(`  ${short}`);
    }
  }
  lines.push("\nType 'help <command>' or 'h? <command>' for details.");
  return lines.join("\n");
}

// ── Fake ping output generator ────────────────────────────────────────────────
function buildPingOutput(host: string): string[] {
  if (!host) return ["Usage: ping <host>"];
  const ip = host === "vespera_gateway" || host === "192.168.1.1"
    ? "192.168.1.1"
    : host === "localhost" || host === "127.0.0.1"
    ? "127.0.0.1"
    : "???.???.???.???";

  const lines: string[] = [
    `Pinging ${host} [${ip}] with 32 bytes of data:`,
  ];
  const ttls = [42, 38, 41, 44];
  const times = [128, 143, 131, 139];
  for (let i = 0; i < 4; i++) {
    if (i < 3) {
      lines.push(`Reply from ${ip}: bytes=32 time=${times[i]}ms TTL=${ttls[i]}`);
    } else {
      lines.push(`Request timed out.`);
    }
  }
  lines.push(
    "",
    `Ping statistics for ${ip}:`,
    `    Packets: Sent = 4, Received = 3, Lost = 1 (25% loss)`,
    `Approximate round trip times in milli-seconds:`,
    `    Minimum = 128ms, Maximum = 143ms, Average = 134ms`,
    "",
    ip === "???.???.???.???"
      ? "WARNING: Host unresolved. VesperaNET routing table corrupt."
      : "Connection unstable. Signal interference detected on subnet.",
  );
  return lines;
}

// ── netstat output ────────────────────────────────────────────────────────────
const NETSTAT_LINES = [
  "Active Connections",
  "",
  "  Proto  Local Address          Foreign Address        State",
  "  TCP    127.0.0.1:1024         127.0.0.1:1025         ESTABLISHED",
  "  TCP    192.168.1.50:2049      192.168.1.1:139        ESTABLISHED",
  "  TCP    192.168.1.50:4444      SHADOW_SECTOR_7:666    ESTABLISHED",
  "  TCP    0.0.0.0:23             0.0.0.0:0              LISTENING",
  "  TCP    0.0.0.0:512            0.0.0.0:0              LISTENING",
  "  UDP    0.0.0.0:137            *:*",
  "  UDP    0.0.0.0:138            *:*",
  "",
  "WARNING: Unrecognized persistent connection on port 666.",
  "         Origin: SHADOW_SECTOR_7. Cannot terminate process.",
];

// ── decrypt output (requires neural bridge) ───────────────────────────────────
const DECRYPT_LINES_DENIED = [
  "Error: X-Type co-processor not initialised.",
  "Decryption routines require Neural Bridge hardware access.",
  "Run 'xtype init' to activate the bridge before attempting decryption.",
];

const DECRYPT_LINES_SUCCESS = [
  "X-Type Neural Bridge: handshake confirmed.",
  "Allocating non-euclidean memory maps for decryption engine... [OK]",
  "Loading Vespera shadow-key v0.3b... [OK]",
  "",
  "── DECRYPTED PAYLOAD ──────────────────────────────────────────────",
  "4E 65 75 72 61 6C 20 42 72 69 64 67 65 20 4C 6F",
  "67 20 2D 2D 20 53 65 73 73 69 6F 6E 20 31 39 39",
  "34 2D 30 33 2D 32 32 20 30 31 3A 35 30 3A 34 32",
  "",
  "Decoded text (UTF-8):",
  "  \"The bridge is not a tool. It listens.\"",
  "  \"Shadow Sector 7 is not storage — it is a boundary.\"",
  "  \"Thorne knew. That is why he is gone.\"",
  "",
  "── END PAYLOAD ────────────────────────────────────────────────────",
  "",
  "WARNING: Decryption event logged to SHADOW_SECTOR_7.",
  "         They are aware you accessed this file.",
];

// ── shadow command output ─────────────────────────────────────────────────────
const SHADOW_DENIED = [
  "Error: Access denied — shadow sector partitions are restricted.",
  "X-Type Neural Bridge synchronisation required.",
];

const SHADOW_PARTIAL = [
  "X-Type Neural Bridge: handshake confirmed.",
  "Attempting shadow sector read...",
  "",
  "── SHADOW/REDACTED ────────────────────────────────────────────────",
  "I AM STILL HERE. THE SILENCE IS LOUD.",
  "",
  "  [SECTOR CORRUPT — 847 bytes unreadable]",
  "  [FRAGMENT RECOVERED]:  do not let them boot the bridge again",
  "  [FRAGMENT RECOVERED]:  the signal is not data it is PRESENCE",
  "── END OF RECOVERABLE DATA ────────────────────────────────────────",
  "",
  "WARNING: Shadow sector read incomplete. Anomalous write-back detected.",
];


export const Terminal: React.FC<TerminalProps> = ({
  onReboot,
  guiEnabled,
  onStartGUI,
  neuralBridgeEnabled,
  neuralBridgeActive,
  onActivateBridge,
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState("");

  // ── Group 1: command history ───────────────────────────────────────────────
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // ── Group 6: typewriter queue ──────────────────────────────────────────────
  const [typewriterQueue, setTypewriterQueue] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typewriterType = useRef<"output" | "error" | "success">("success");

  const { ls, cd, cat, getFileNode, writeFile, getPrompt, currentPath } = useFileSystem();

  // ── Image viewer state ────────────────────────────────────────────────────
  const [viewerImage, setViewerImage] = useState<{ path: string; fileName: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on history change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // ── Group 6: Typewriter — drain queue one line at a time ──────────────────
  useEffect(() => {
    if (typewriterQueue.length === 0) {
      if (isTyping) setIsTyping(false);
      return;
    }
    setIsTyping(true);
    const timer = setTimeout(() => {
      const [next, ...rest] = typewriterQueue;
      setHistory(prev => [...prev, { text: next, type: typewriterType.current }]);
      setTypewriterQueue(rest);
    }, 38);
    return () => clearTimeout(timer);
  }, [typewriterQueue, isTyping]);

  // Re-focus input after typewriter finishes
  useEffect(() => {
    if (!isTyping) inputRef.current?.focus();
  }, [isTyping]);

  // ── Helper: push lines through the typewriter queue ───────────────────────
  const enqueueTypewriter = useCallback(
    (lines: string[], type: "output" | "error" | "success" = "success") => {
      typewriterType.current = type;
      setTypewriterQueue(lines);
    },
    [],
  );

  // ── Group 2: Tab completion ───────────────────────────────────────────────
  const handleTab = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const tokens = input.trimStart().split(" ");
      const firstToken = tokens[0].toLowerCase();

      if (tokens.length === 1) {
        // Complete command name
        const partial = firstToken;
        const matches = ALL_COMMANDS.filter(c => c.startsWith(partial));
        if (matches.length === 1) {
          setInput(matches[0] + " ");
        } else if (matches.length > 1) {
          setHistory(prev => [
            ...prev,
            { text: getPrompt() + input, type: "input" },
            { text: matches.join("  "), type: "output" },
          ]);
        }
      } else if (tokens.length === 2 && PATH_COMMANDS.has(firstToken)) {
        // Complete VFS node name in current directory
        const partial = tokens[1].toLowerCase();
        const dir = ls(); // ls with no args = current dir listing
        const nodes = dir
          .split("\n")
          .filter(Boolean)
          .map(line => line.replace("[DIR] ", "").trim())
          .filter(name => name.toLowerCase().startsWith(partial));

        if (nodes.length === 1) {
          setInput(`${tokens[0]} ${nodes[0]}`);
        } else if (nodes.length > 1) {
          setHistory(prev => [
            ...prev,
            { text: getPrompt() + input, type: "input" },
            { text: nodes.join("  "), type: "output" },
          ]);
        }
      }
    },
    [input, ls, getPrompt],
  );

  const handleCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();

      // Always push the prompt+command line into history
      const pushInput = () =>
        setHistory(prev => [...prev, { text: `${getPrompt()}${cmd}`, type: "input" }]);

      if (!trimmed) {
        pushInput();
        return;
      }

      // ── Group 1: save to command history ────────────────────────────────
      setCmdHistory(prev => [trimmed, ...prev]);
      setHistoryIdx(-1);

      // ── h? <cmd> prefix syntax ────────────────────────────────────────────
      if (trimmed.startsWith("h? ")) {
        const targetCmd = trimmed.slice(3).toLowerCase();
        const helpText =
          OS_CONFIG.HELP_DATA[targetCmd as keyof typeof OS_CONFIG.HELP_DATA];
        setHistory(prev => [
          ...prev,
          { text: `${getPrompt()}${cmd}`, type: "input" },
          { text: helpText || `No help available for: ${targetCmd}`, type: "success" },
        ]);
        return;
      }

      const [command, ...args] = trimmed.split(" ");
      const cmdLower = command.toLowerCase();
      let output = "";
      let outputType: "output" | "error" | "success" = "success";
      let useTypewriter = false;

      switch (cmdLower) {
        // ── Filesystem ────────────────────────────────────────────────────
        case "ls":
        case "dir":
          output = ls(args[0]);
          break;

        case "cd":
          output = cd(args[0] || "/");
          break;

        case "cat":
        case "type": {
          const fileNode = getFileNode(args[0]);
          if (fileNode?.imagePath) {
            // Render ASCII art inline for image files
            pushInput();
            setHistory(prev => [...prev, { text: "", type: "success", imagePath: fileNode.imagePath }]);
            return;
          }
          output = cat(args[0]);
          break;
        }

        // ── Group 7: echo [text] / echo [text] > [file] ───────────────────
        case "echo": {
          const rawArgs = trimmed.substring(command.length).trimStart();
          const redirectIdx = rawArgs.lastIndexOf(">");
          if (redirectIdx !== -1) {
            const text = rawArgs.slice(0, redirectIdx).trimEnd();
            const fileName = rawArgs.slice(redirectIdx + 1).trim();
            if (!fileName) {
              output = "echo: missing filename after '>'";
              outputType = "error";
            } else {
              const err = writeFile(fileName, text);
              output = err || `Wrote to ${fileName}`;
              if (err) outputType = "error";
            }
          } else {
            output = rawArgs;
          }
          break;
        }

        // ── Clear ─────────────────────────────────────────────────────────
        case "clear":
          setHistory([]);
          return;

        // ── js / eval / script ────────────────────────────────────────────
        case "js":
        case "eval":
        case "script": {
          const scriptCode = trimmed.substring(command.length).trim();
          if (!scriptCode) {
            output = "ERROR: Missing script body. Usage: js [code]";
            outputType = "error";
            break;
          }
          try {
            let evaluated: unknown;
            try {
              evaluated = new Function(scriptCode)();
            } catch {
              evaluated = eval(scriptCode); // eslint-disable-line no-eval
            }
            output = evaluated === undefined ? "" : String(evaluated);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Unknown exception";
            output = `Execution Error: ${msg}`;
            outputType = "error";
          }
          break;
        }

        // ── Group 3: help (generated from HELP_DATA) ──────────────────────
        case "help":
          if (args[0]) {
            const helpText =
              OS_CONFIG.HELP_DATA[args[0].toLowerCase() as keyof typeof OS_CONFIG.HELP_DATA];
            output = helpText || `No help available for: ${args[0]}`;
          } else {
            output = buildHelpListing();
          }
          break;

        case "tutorial":
          output = [
            "── AETHERIS NAVIGATION TUTORIAL ──",
            "1. Look at the prompt: thorne@aetheris:/path$  — this shows your location.",
            "2. Type 'ls' or 'dir' to list files in the current directory.",
            "3. Type 'cd <folder>' to enter a folder, 'cd ..' to go back, 'cd /' for root.",
            "4. Type 'cat <file>' or 'type <file>' to read a file.",
            "5. Try: cd home → cd thorne → ls → cat journal_01.txt",
            "6. Some directories are hidden. The system knows more than it shows.",
          ].join("\n");
          useTypewriter = true;
          break;

        case "whoami":
          output = "thorne (Dr. Elias Thorne — System Administrator)";
          break;

        case "date":
          output = new Date().toString();
          break;

        case "mem":
          output = [
            "── MEMORY STATUS ──────────────────────────────────",
            "Total Conventional Memory : 640 KB",
            "Total Extended Memory     : 32768 KB",
            "Used                      : 4122 KB",
            "Free                      : 28646 KB",
            "",
            "Shadow Sector Allocation  : [REDACTED]",
            "Neural Bridge Buffer      : " +
              (neuralBridgeActive ? "8192 KB  [ACTIVE — LEAKING]" : "0 KB  [INACTIVE]"),
          ].join("\n");
          useTypewriter = true;
          break;

        case "ver":
          output = `${OS_CONFIG.NAME} [Version ${OS_CONFIG.VERSION}]\n(C) Copyright ${OS_CONFIG.COMPANY} 1991-1994.`;
          break;

        // ── startgui ──────────────────────────────────────────────────────
        case "startgui":
          if (guiEnabled) {
            onStartGUI();
            return;
          } else {
            output =
              "Error: Protected Mode (XMS) is disabled in BIOS.\nCheck Advanced BIOS Features in System Setup.";
            outputType = "error";
          }
          break;

        // ── xtype ─────────────────────────────────────────────────────────
        case "xtype":
          if (args[0] === "init") {
            if (!neuralBridgeEnabled) {
              output =
                "Error: X-Type Neural Bridge hardware not detected or disabled in BIOS.";
              outputType = "error";
            } else if (neuralBridgeActive) {
              output = "X-Type Neural Bridge is already active and synced.";
            } else {
              onActivateBridge();
              output = [
                "Initializing X-Type Neural Bridge...",
                "Allocating non-euclidean memory maps... [OK]",
                "Bypassing standard safety protocols... [OK]",
                "SYNC ESTABLISHED.",
                "",
                "WARNING: Anomalous data streams detected. The bridge is open.",
              ].join("\n");
            }
          } else {
            output = "Usage: xtype init\nInitializes the X-Type Neural Bridge co-processor.";
          }
          break;

        // ── Group 4: ping ─────────────────────────────────────────────────
        case "ping": {
          const lines = buildPingOutput(args[0]);
          pushInput();
          enqueueTypewriter(lines, "success");
          return;
        }

        // ── Group 4: netstat ──────────────────────────────────────────────
        case "netstat":
          pushInput();
          enqueueTypewriter(NETSTAT_LINES, "success");
          return;

        // ── Group 4: shadow ───────────────────────────────────────────────
        case "shadow":
          if (!neuralBridgeActive) {
            output = SHADOW_DENIED.join("\n");
            outputType = "error";
          } else {
            pushInput();
            enqueueTypewriter(SHADOW_PARTIAL, "success");
            return;
          }
          break;

        // ── Group 5: decrypt ──────────────────────────────────────────────
        case "decrypt":
          if (!neuralBridgeActive) {
            pushInput();
            enqueueTypewriter(DECRYPT_LINES_DENIED, "error");
            return;
          } else {
            pushInput();
            enqueueTypewriter(DECRYPT_LINES_SUCCESS, "success");
            return;
          }

        // ── imgview / view — fullscreen DOS VGA viewer ─────────────────────
        case "imgview":
        case "view": {
          const rawArg = trimmed.substring(command.length).trim();
          if (!rawArg) {
            output = `Usage: ${cmdLower} <file>  — or —  ${cmdLower} /path/to/image.png`;
            outputType = "error";
            break;
          }
          // Absolute path (e.g. /Icons/notepad-2.png) → use directly
          if (rawArg.startsWith("/")) {
            pushInput();
            setViewerImage({ path: rawArg, fileName: rawArg.split("/").pop() ?? rawArg });
            return;
          }
          const imgNode = getFileNode(rawArg);
          if (!imgNode) {
            output = `${cmdLower}: ${rawArg}: No such file`;
            outputType = "error";
          } else if (!imgNode.imagePath) {
            output = `VSVIEW: ${rawArg}: Not a supported image format.\nSupported: .png .jpg .bmp .ico .gif .svg`;
            outputType = "error";
          } else {
            pushInput();
            setViewerImage({ path: imgNode.imagePath, fileName: rawArg });
            return;
          }
          break;
        }

        // ── asciiview — force ASCII art inline ────────────────────────────
        case "asciiview": {
          const rawArg = trimmed.substring(command.length).trim();
          if (!rawArg) {
            output = "Usage: asciiview <file>";
            outputType = "error";
            break;
          }
          const imgPath = rawArg.startsWith("/")
            ? rawArg
            : getFileNode(rawArg)?.imagePath ?? null;
          if (!imgPath) {
            output = `asciiview: ${rawArg}: No image path found. Is this an image file?`;
            outputType = "error";
          } else {
            pushInput();
            setHistory(prev => [...prev, { text: "", type: "success", imagePath: imgPath }]);
            return;
          }
          break;
        }

        // ── reboot ────────────────────────────────────────────────────────
        case "reboot":
          onReboot();
          return;

        case "sudo":
          output = "Error: Permission denied. User 'thorne' is under surveillance.";
          outputType = "error";
          break;

        default:
          output = `Command not found: ${command}. Type 'help' for assistance.`;
          outputType = "error";
      }

      // Determine type from content if not already set
      const isError =
        outputType === "error" ||
        (outputType !== "success" &&
          (output.toLowerCase().includes("error") || output.includes("Command not found")));
      const finalType = isError ? "error" : outputType;
      const outputItems: HistoryEntry[] = output
        ? [{ text: output, type: finalType }]
        : [];

      if (useTypewriter && TYPEWRITER_COMMANDS.has(cmdLower) && outputItems.length) {
        // Split by newlines and queue each line
        pushInput();
        enqueueTypewriter(output.split("\n"), finalType);
      } else {
        setHistory(prev => [
          ...prev,
          { text: `${getPrompt()}${cmd}`, type: "input" },
          ...outputItems,
        ]);
      }
    },
    [
      getPrompt, ls, cd, cat, writeFile,
      neuralBridgeEnabled, neuralBridgeActive, guiEnabled,
      onStartGUI, onActivateBridge, onReboot,
      enqueueTypewriter,
    ],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTyping) return; // block while typewriter is running
    handleCommand(input);
    setInput("");
  };

  // ── Group 1 + 2: Keyboard handler for textarea ────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      handleTab(e);
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isTyping) return;
      handleCommand(input);
      setInput("");
      return;
    }

    // ── Arrow up/down: cycle command history ─────────────────────────────
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(nextIdx);
      setInput(cmdHistory[nextIdx]);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx <= 0) {
        setHistoryIdx(-1);
        setInput("");
        return;
      }
      const nextIdx = historyIdx - 1;
      setHistoryIdx(nextIdx);
      setInput(cmdHistory[nextIdx]);
    }
  };

  return (
    <div className="relative flex flex-col h-full p-4 font-mono text-sm md:text-base overflow-hidden">
      {/* ── Fullscreen DOS image viewer overlay ── */}
      {viewerImage && (
        <FullscreenDOSViewer
          imagePath={viewerImage.path}
          fileName={viewerImage.fileName}
          onClose={() => setViewerImage(null)}
        />
      )}
      {/* Banner */}
      <div className="mb-4 opacity-70">
        <div>{OS_CONFIG.NAME} {OS_CONFIG.VERSION}</div>
        <div>{OS_CONFIG.COPYRIGHT}</div>
        <div className="mt-2">Type 'help' for a list of commands.</div>
      </div>

      {/* Scrollable history */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto mb-4 space-y-0.5 scroll-smooth"
      >
        {history.map((item, i) => (
          <div
            key={i}
            className={`leading-snug ${
              item.type === "error"
                ? "text-red-500"
                : item.type === "success"
                ? "text-cyan-400"
                : "text-[#00ff41]"
            } ${!item.imagePath ? "whitespace-pre-wrap break-all" : ""}`}
          >
            {item.imagePath
              ? <ASCIIArtBlock src={item.imagePath} />
              : item.text}
          </div>
        ))}

        {/* Blinking cursor shown at end of typewriter queue */}
        {isTyping && (
          <span className="inline-block w-2 h-[1em] bg-cyan-400 animate-pulse align-middle" />
        )}
      </div>

      {/* Input row — disabled while typewriter is running */}
      <form onSubmit={handleSubmit} className="flex items-start">
        <span className="mr-2 shrink-0 pt-0.5 text-[#00ff41]">{getPrompt()}</span>
        <textarea
          ref={inputRef}
          autoFocus
          disabled={isTyping}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={Math.max(1, input.split("\n").length)}
          className="flex-1 bg-transparent border-none outline-none text-[#00ff41] caret-block resize-none overflow-hidden pb-1 pt-0.5 disabled:opacity-40"
          spellCheck={false}
        />
      </form>

      <style>{`
        .caret-block { caret-color: #00ff41; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
};
