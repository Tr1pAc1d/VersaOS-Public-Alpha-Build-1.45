import React, { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { Monitor } from "lucide-react";
import { OS_CONFIG } from "../constants/os";

interface BootSequenceProps {
  onComplete: () => void;
  onEnterBIOS: () => void;
  fastBootEnabled: boolean;
  isColdBoot: boolean;
}

const SPLASH_MESSAGES = [
  OS_CONFIG.BIOS.NAME,
  "Copyright (C) 1991 American Megatrends Inc.",
  "",
  `CPU: ${OS_CONFIG.BIOS.CPU}`,
  `Speed: 50 MHz`,
  "",
  `Memory Test: ${OS_CONFIG.BIOS.RAM}`,
  "",
  "Wait...",
  "",
  "Detecting IDE Primary Master... [VESPERA-HDD-40MB]",
  "Detecting IDE Primary Slave... [NONE]",
  "",
  "Press <DEL> to enter SETUP",
  "",
];

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete, onEnterBIOS, fastBootEnabled, isColdBoot }) => {
  const INITIAL_MESSAGES = isColdBoot 
    ? ["VESPERA BIOS v1.04 - COLD BOOT DETECTED...", ...SPLASH_MESSAGES] 
    : SPLASH_MESSAGES;
    
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [waitingForInput, setWaitingForInput] = useState(false);

  useEffect(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); 
      
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio context failed", e);
    }
  }, []);

  useEffect(() => {
    if (index < INITIAL_MESSAGES.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => [...prev, INITIAL_MESSAGES[index]]);
        setIndex((prev) => prev + 1);
      }, fastBootEnabled ? 10 : 100);
      return () => clearTimeout(timer);
    } else {
      setWaitingForInput(true);
      // Auto-boot after 3 seconds if no key pressed
      const timer = setTimeout(onComplete, fastBootEnabled ? 300 : 3000);
      return () => clearTimeout(timer);
    }
  }, [index, onComplete, fastBootEnabled]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (waitingForInput && (e.key === "Delete" || e.key === "Delete")) {
        onEnterBIOS();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [waitingForInput, onEnterBIOS]);

  return (
    <div className="p-4 font-mono text-xs md:text-sm h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {visibleLines.map((line, i) => (
            <div key={i} className="min-h-[1.2em]">
              {line}
            </div>
          ))}
        </div>
        <pre className="text-red-600 font-bold leading-none text-[10px] md:text-xs">
          {OS_CONFIG.BIOS.LOGO}
        </pre>
      </div>
      {waitingForInput && (
        <motion.div
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-[#00ff41] ml-1 align-middle"
        />
      )}
    </div>
  );
};

export const KernelBoot: React.FC<{ onComplete: () => void, fastBootEnabled: boolean }> = ({ onComplete, fastBootEnabled }) => {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  const KERNEL_MESSAGES = [
    "Loading AETHERIS Kernel...",
    "Initializing Vespera-K v4.2...",
    "Calibrating delay loop... 10.24 BogoMIPS",
    "Memory: 32128k/32768k available (1024k kernel code, 384k reserved, 512k data)",
    "CPU: 80486DX at 33MHz",
    "Checking 386/387 coupling... OK, FPU using exception 16 error reporting.",
    "Checking 'hlt' instruction... OK.",
    "POSIX conformance testing by UNIFIX",
    "PCI: PCI BIOS revision 2.10 entry at 0xf0120",
    "PCI: Probing PCI hardware",
    "Linux NET4.0 for Linux 2.0",
    "Based upon Swansea University Computer Society NET3.039",
    "NET4: Unix domain sockets 1.0 for Linux NET4.0.",
    "NET4: Linux TCP/IP 1.0 for NET4.0",
    "IP Protocols: ICMP, UDP, TCP",
    "VFS: Diskquotas version dquot_5.6.0 initialized",
    "Checking disk integrity: /dev/hda1",
    "Disk integrity: 100% OK",
    "Partition check:",
    " hda: hda1 hda2",
    "VFS: Mounted root (ext2 filesystem) readonly.",
    "Adding Swap: 8188k swap-space (priority -1)",
    "",
    "Loading drivers:",
    "  [OK] vga_driver.sys",
    "  [OK] kbd_driver.sys",
    "  [OK] mouse_driver.sys",
    "  [OK] net_stack.sys",
    "  [OK] floppy_driver.sys",
    "  [OK] ide_driver.sys",
    "",
    "Starting system services:",
    "  [OK] init",
    "  [OK] syslogd",
    "  [OK] klogd",
    "  [OK] crond",
    "  [OK] portmap",
    "  [OK] aetheris_daemon",
    "",
    "WARNING: Unrecognized signal detected in shadow sectors.",
    "WARNING: System clock desynchronized.",
    "",
    "Welcome to AETHERIS OS",
    "Login: thorne",
    "Password: **********",
    "Last login: Fri Mar 22 01:50:42 1994 on tty1",
    "",
  ];

  useEffect(() => {
    if (index < KERNEL_MESSAGES.length) {
      // Make the boot sequence slower and variable
      const delay = fastBootEnabled ? 5 : (Math.random() * 80 + 40); 
      const timer = setTimeout(() => {
        setVisibleLines((prev) => [...prev, KERNEL_MESSAGES[index]]);
        setIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, fastBootEnabled ? 100 : 1500);
      return () => clearTimeout(timer);
    }
  }, [index, onComplete, fastBootEnabled]);

  return (
    <div className="p-4 font-mono text-xs md:text-sm h-full overflow-hidden">
      {visibleLines.map((line, i) => (
        <div key={i} className="min-h-[1.2em]">
          {line}
        </div>
      ))}
    </div>
  );
};

export const GUIBootSplash: React.FC<{ onComplete: () => void, fastBootEnabled: boolean }> = ({ onComplete, fastBootEnabled }) => {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  const GUI_SPLASH_MESSAGES = [
    OS_CONFIG.BIOS.NAME,
    "Copyright (C) 1991 American Megatrends Inc.",
    "",
    "Warm Boot Initiated...",
    `CPU: ${OS_CONFIG.BIOS.CPU}`,
    "VGA: S3 86C911 GUI Accelerator (1MB VRAM) - ACTIVE",
    "X-Type Neural Bridge v1.0 - SYNCING...",
    "",
    "Wait...",
  ];

  useEffect(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
      
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio context failed", e);
    }
  }, []);

  useEffect(() => {
    if (index < GUI_SPLASH_MESSAGES.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => [...prev, GUI_SPLASH_MESSAGES[index]]);
        setIndex((prev) => prev + 1);
      }, fastBootEnabled ? 10 : 150);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, fastBootEnabled ? 200 : 2000);
      return () => clearTimeout(timer);
    }
  }, [index, onComplete, fastBootEnabled]);

  return (
    <div className="p-4 font-mono text-xs md:text-sm h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {visibleLines.map((line, i) => (
            <div key={i} className="min-h-[1.2em]">
              {line}
            </div>
          ))}
        </div>
        <pre className="text-red-600 font-bold leading-none text-[10px] md:text-xs">
          {OS_CONFIG.BIOS.LOGO}
        </pre>
      </div>
      <motion.div
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-2 h-4 bg-[#00ff41] ml-1 align-middle"
      />
    </div>
  );
};

export const GUIKernelBoot: React.FC<{ onComplete: () => void, neuralBridgeActive: boolean, fastBootEnabled: boolean }> = ({ onComplete, neuralBridgeActive, fastBootEnabled }) => {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const BASE_MESSAGES = [
    "Loading Vespera Desktop Environment...",
    "Initializing X-Server (v11R5)...",
    "Probing PCI bus...",
    "Found S3 86C911 GUI Accelerator at 0x03C0",
    "Mapping VRAM at 0xA0000... [OK]",
    "Loading S3 86C911 drivers... [OK]",
    "Setting video mode 1024x768x8... [OK]",
    "Initializing input devices...",
    "PS/2 Mouse detected on IRQ 12",
    "Keyboard detected on IRQ 1",
    "Starting Motif Window Manager (mwm)... [OK]",
    "Mounting virtual file systems... [OK]",
    "Mounting /dev/pts... [OK]",
    "Mounting /proc... [OK]",
    "Starting network subsystem...",
    "Bringing up loopback interface... [OK]",
    "Bringing up eth0... [OK]",
    "Loading font server (xfs)... [OK]",
    "Initializing color palette (256 colors)... [OK]",
    "Setting root window background... [OK]",
    "Loading window decorations... [OK]",
    "Starting session manager (vsm)... [OK]",
  ];

  const NORMAL_MESSAGES = [
    "Establishing standard bridge connection... [OK]",
    "Allocating memory segments... [OK]",
    "Loading user preferences... [OK]",
    "Starting Vespera Session Manager...",
    "Loading user profile 'thorne'...",
    "Executing .xinitrc...",
    "Starting dtlogin... [OK]",
  ];

  const CREEPY_MESSAGES = [
    "Establishing Neural Bridge connection...",
    "Handshake initiated...",
    "Allocating shared memory segments... [OK]",
    "...",
    "WARNING: Anomalous data stream detected on port 666.",
    "Analyzing stream signature...",
    "Signature unknown. Origin: SHADOW_SECTOR_7.",
    "Bypassing security protocols... [OK]",
    "Entity 'UNKNOWN' has joined the session.",
    "They are listening.",
    "...",
    "Resuming boot sequence...",
    "Starting Vespera Session Manager...",
    "Loading user profile 'thorne'...",
    "Executing .xinitrc...",
    "Starting dtlogin... [OK]",
  ];

  const GUI_KERNEL_MESSAGES = neuralBridgeActive 
    ? [...BASE_MESSAGES, ...CREEPY_MESSAGES] 
    : [...BASE_MESSAGES, ...NORMAL_MESSAGES];

  useEffect(() => {
    if (index < GUI_KERNEL_MESSAGES.length) {
      // Make the creepy messages type slower, and normal messages slightly slower than before
      const line = GUI_KERNEL_MESSAGES[index];
      const isCreepy = line.includes("WARNING") || line.includes("Entity") || line.includes("listening") || line.includes("SHADOW_SECTOR");
      const delay = fastBootEnabled ? 5 : (isCreepy ? 1200 : Math.random() * 80 + 40); // Slower overall
      
      const timer = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
        setIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, fastBootEnabled ? 100 : 1500);
      return () => clearTimeout(timer);
    }
  }, [index, onComplete, GUI_KERNEL_MESSAGES, fastBootEnabled]);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div ref={logsContainerRef} className="p-4 font-mono text-xs md:text-sm h-full overflow-y-auto no-scrollbar">
      {visibleLines.map((line, i) => {
        const isCreepy = line.includes("WARNING") || line.includes("Entity") || line.includes("listening") || line.includes("SHADOW_SECTOR");
        return (
          <div key={i} className={`min-h-[1.2em] ${isCreepy ? 'text-red-500 font-bold' : ''}`}>
            {line}
          </div>
        );
      })}
      <motion.div
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-2 h-4 bg-[#00ff41] ml-1 align-middle"
      />
    </div>
  );
};

export const GUILoadingScreen: React.FC<{ onComplete: () => void, neuralBridgeActive: boolean, fastBootEnabled: boolean }> = ({ onComplete, neuralBridgeActive, fastBootEnabled }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Loading Vespera OS kernel...");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, fastBootEnabled ? 100 : 1500);
          return 100;
        }
        // Slow, authentic 1996-era progress
        const nextP = Math.min(p + Math.floor(Math.random() * 4) + 1, 100);
        if (nextP > 15 && p <= 15) setStatus("Initialising memory subsystem...");
        if (nextP > 30 && p <= 30) setStatus("Loading hardware abstraction layer...");
        if (nextP > 45 && p <= 45) setStatus("Starting Vespera kernel modules...");
        if (nextP > 60 && p <= 60) setStatus("Mounting filesystem volumes...");
        if (nextP > 75 && p <= 75) setStatus("Starting session services...");
        if (nextP > 88 && p <= 88) setStatus("Preparing desktop environment...");
        if (nextP > 96 && p <= 96) setStatus("Almost ready...");
        if (nextP >= 100) setStatus("Ready.");
        return nextP;
      });
    }, fastBootEnabled ? 20 : 420);
    return () => clearInterval(interval);
  }, [onComplete, fastBootEnabled]);

  // Chunked CRT-style progress blocks
  const TOTAL_BLOCKS = 28;
  const filledBlocks = Math.round((progress / 100) * TOTAL_BLOCKS);

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center font-mono relative overflow-hidden select-none">

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.35) 2px,rgba(0,0,0,0.35) 4px)",
          opacity: 0.18,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ boxShadow: "inset 0 0 130px rgba(0,0,0,0.9)" }}
      />

      {/* Neural glitch flash */}
      {neuralBridgeActive && progress > 66 && progress < 69 && (
        <div className="absolute inset-0 bg-red-900/20 z-20 flex items-center justify-center pointer-events-none">
          <span className="text-red-900/30 font-mono text-9xl font-black tracking-tighter mix-blend-overlay">WAKE UP</span>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-30 flex flex-col items-center">

        {/* ── Crescent-moon / V-chevron logo ── */}
        <div className="mb-5" style={{ width: 132, height: 152 }}>
          <svg viewBox="0 0 132 152" width="132" height="152">
            <defs>
              <radialGradient id="gls_bg" cx="50%" cy="42%" r="58%">
                <stop offset="0%" stopColor="#1e3f80" />
                <stop offset="55%" stopColor="#0d1e55" />
                <stop offset="100%" stopColor="#040a20" />
              </radialGradient>
              <radialGradient id="gls_moon" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffe877" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#ffe877" stopOpacity="0" />
              </radialGradient>
              <filter id="gls_glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <clipPath id="gls_clip">
                <circle cx="66" cy="60" r="57"/>
              </clipPath>
            </defs>

            {/* Circle body */}
            <circle cx="66" cy="60" r="58" fill="url(#gls_bg)" stroke="#3d5fa0" strokeWidth="1.5"/>

            {/* Horizontal sunrise bands */}
            {[0,1,2,3,4].map(i => (
              <rect key={i} clipPath="url(#gls_clip)"
                x="10" y={54 + i * 6} width="112" height="4"
                fill={i % 2 === 0 ? "#c8923a" : "#7a5618"}
                opacity={0.55 - i * 0.07}
              />
            ))}

            {/* Moon glow halo */}
            <circle cx="60" cy="32" r="21" fill="url(#gls_moon)" opacity="0.5"/>

            {/* Crescent moon */}
            <path d="M71,17 A21,21,0,1,1,50,46 A14,14,0,1,0,71,17 Z"
              fill="#f5d060" filter="url(#gls_glow)"/>

            {/* Stars */}
            <circle cx="90" cy="21" r="2.6" fill="#ffe080" opacity="0.9" filter="url(#gls_glow)"/>
            <circle cx="83" cy="13" r="1.7" fill="#ffe080" opacity="0.85" filter="url(#gls_glow)"/>
            <circle cx="96" cy="30" r="1.3" fill="#ffe080" opacity="0.75"/>
            {/* 4-point star */}
            <g filter="url(#gls_glow)">
              <polygon points="87,7 88.3,11 92.5,11 89.2,13.4 90.5,17.4 87,15 83.5,17.4 84.8,13.4 81.5,11 85.7,11"
                fill="#ffe080" opacity="0.7" transform="scale(0.52) translate(85,-5)"/>
            </g>

            {/* V chevron — gold layer */}
            <polygon points="66,91 38,51 50,51 66,76 82,51 94,51" fill="#c8923a"/>
            {/* V chevron — shadow overlay for depth */}
            <polygon points="66,89 41,55 50,55 66,73 82,55 91,55" fill="#08163a" opacity="0.5"/>

            {/* Teardrop tip */}
            <polygon points="56,117 66,138 76,117" fill="#0d1e55"/>
          </svg>
        </div>

        {/* ── OS Name ── */}
        <h1
          className="font-black uppercase mb-1"
          style={{
            fontSize: "2.6rem",
            letterSpacing: "0.17em",
            color: "#ffe066",
            textShadow: "0 0 14px #ffe066, 0 0 36px #f09800, 0 0 66px #b06000",
            fontFamily: "'Arial Black', Impact, sans-serif",
          }}
        >
          VESPERA OS
        </h1>
        <p
          className="font-bold uppercase mb-8 text-white text-sm"
          style={{
            letterSpacing: "0.36em",
            textShadow: "0 0 10px rgba(255,255,255,0.5)",
          }}
        >
          OPERATING SYSTEM
        </p>

        {/* ── Status text ── */}
        <p
          className="text-[12px] font-mono mb-2 tracking-wide"
          style={{ color: "#c0d4e8", textShadow: "0 0 6px #80aec8" }}
        >
          {status}
        </p>

        {/* ── CRT block progress bar ── */}
        <div
          className="relative flex items-center gap-[2px] p-[3px] mb-6"
          style={{
            width: 316,
            border: "1px solid #3a5870",
            backgroundColor: "#060e1a",
            boxShadow: "0 0 10px rgba(60,140,220,0.2), inset 0 0 8px rgba(0,0,20,0.9)",
          }}
        >
          {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 13,
                backgroundColor:
                  i < filledBlocks
                    ? i === filledBlocks - 1
                      ? "#78c8ff"
                      : "#3e8ccc"
                    : "transparent",
                boxShadow: i < filledBlocks ? "0 0 4px #3e8ccc" : "none",
                transition: "background-color 0.1s",
              }}
            />
          ))}
        </div>

        {/* ── Copyright footer ── */}
        <p className="text-[11px] font-mono text-center leading-relaxed" style={{ color: "#5a8090" }}>
          Copyright (C) 1996 Vespera Technologies, Inc.<br/>
          Version 1.2 Build 450
        </p>

      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
};
