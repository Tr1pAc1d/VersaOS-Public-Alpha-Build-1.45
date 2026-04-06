import React, { useEffect, useRef, useMemo, useState } from 'react';
import { playFatalErrorSound } from '../utils/audio';

interface KernelPanicProps {
  onReboot: () => void;
}

export const KernelPanic: React.FC<KernelPanicProps> = ({ onReboot }) => {
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [renderedLines, setRenderedLines] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    playFatalErrorSound();
  }, []);

  const dumpLines = useMemo(() => {
    return [
      "AETHERIS KERNEL PANIC",
      "=====================",
      "",
      "Fatal exception 0E has occurred at 0028:C0011E36 in VxD VMM(01) + 00010E36.",
      "The current application will be terminated.",
      "",
      "CPU Registers:",
      "EAX=00000000 EBX=00F312A2 ECX=00000008 EDX=FFFFFFFF",
      "ESI=00000100 EDI=0000A1F4 EBP=00000000 ESP=00000000",
      "CS=0028 DS=0020 ES=0020 FS=0000 GS=0000 SS=0020",
      "EIP=00011E36 EFL=00000246",
      "",
      "Call Trace:",
      "[<c010a0f0>] do_page_fault+0x120/0x3a0",
      "[<c010a000>] do_page_fault+0x30/0x3a0",
      "[<c010a0f0>] do_page_fault+0x120/0x3a0",
      "[<c010a000>] do_page_fault+0x30/0x3a0",
      "[<c010a0f0>] do_page_fault+0x120/0x3a0",
      "",
      "Stack Dump:",
      "00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000",
      "00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000",
      "00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000",
      "00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000",
      "",
      "System Error Codes:",
      "ERR_MEM_ALLOC_FAIL: 0x00000001",
      "ERR_PAGE_FAULT_IN_NON_EUCLIDEAN_AREA: 0x00000002",
      "ERR_X_TYPE_BRIDGE_DESYNCHRONIZATION: 0x00000003",
      "ERR_UNHANDLED_COGNITIVE_RESONANCE: 0x00000004",
      "",
      "Dumping physical memory to disk... FAILED.",
      "Storage medium unresponsive.",
      "Recursive auditory feedback loop detected.",
      "",
      "System halted."
    ];
  }, []);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      const chunkSize = Math.floor(Math.random() * 10) + 5;
      const nextIndex = Math.min(currentIndex + chunkSize, dumpLines.length);
      
      setRenderedLines(dumpLines.slice(0, nextIndex));
      currentIndex = nextIndex;

      if (currentIndex >= dumpLines.length) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [dumpLines]);

  const handleReboot = () => {
    if (!isComplete) return;
    localStorage.setItem('needsRecovery', 'true');
    onReboot();
  };

  useEffect(() => {
    const handleKeyDown = () => {
      handleReboot();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onReboot, isComplete]);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [renderedLines]);

  return (
    <div 
      className="fixed inset-0 bg-black z-[9999] flex flex-col p-4 sm:p-8 font-mono text-[#00FF00] overflow-hidden text-sm sm:text-base leading-relaxed cursor-pointer"
      onClick={handleReboot}
    >
      <div ref={logsContainerRef} className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {renderedLines.map((line, i) => (
          <div key={i}>{line || '\u00A0'}</div>
        ))}
        {isComplete && (
          <div className="mt-8 animate-pulse font-bold">Press any key or click to reboot_</div>
        )}
      </div>
    </div>
  );
};
