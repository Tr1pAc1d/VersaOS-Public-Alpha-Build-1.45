import React, { useState, useEffect, useRef } from 'react';

/**
 * DirtyScanDisk — Full-screen blue ScanDisk that auto-runs on dirty shutdown.
 * Mimics the classic Windows 95/98 "Your computer was not shut down properly" screen.
 */
interface DirtyScanDiskProps {
  onComplete: () => void;
}

const SCAN_LINES = [
  'Vespera is now checking your disk...',
  '',
  'If you want to skip this check, press any key within 3 seconds.',
  '',
  'Checking drive C:  FAT16',
  '',
  '  Microsoft ScanDisk will now attempt to find and correct any errors',
  '  on drive C:.',
  '',
  'Reading File Allocation Table (FAT)...',
  'Comparing FAT copies...',
  'FAT copies are consistent.',
  '',
  'Checking folders...',
  'VESPERA\\SYSTEM ... OK',
  'VESPERA\\DRIVERS ... OK',
  'VESPERA\\CONFIG ... OK',
  'VESPERA\\LOGS ... OK',
  'VESPERA\\TEMP ... OK',
  'PROGRAMS ... OK',
  'DOCUMENTS ... OK',
  'DOWNLOADS ... OK',
  '',
  'Checking files...',
  'Reading file entries...',
  '',
  'Checking for lost clusters...',
  'Checking for cross-linked files...',
  '',
  'Vespera is verifying "long file names"...',
  '',
  'ScanDisk did not find any problems on drive C:.',
  '',
  '',
];

export const DirtyScanDisk: React.FC<DirtyScanDiskProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([
    '',
    'Vespera OS did not finish shutting down properly.',
    'One or more of your disk drives may have errors on it.',
    '',
    'To avoid seeing this message again, always use the Shut Down',
    'command on the Workspace Menu to quit Vespera OS.',
    '',
  ]);
  const [scanIndex, setScanIndex] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [skippable, setSkippable] = useState(true);
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3-second skip window
  useEffect(() => {
    skipTimerRef.current = setTimeout(() => {
      setSkippable(false);
    }, 3000);
    return () => {
      if (skipTimerRef.current) clearTimeout(skipTimerRef.current);
    };
  }, []);

  // Skip on keypress during the 3s window
  useEffect(() => {
    if (!skippable) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      onComplete();
    };
    window.addEventListener('keydown', handler, { once: true });
    return () => window.removeEventListener('keydown', handler);
  }, [skippable, onComplete]);

  // Auto-type scan lines
  useEffect(() => {
    if (skippable) return; // Wait until skip window passes
    if (scanIndex >= SCAN_LINES.length) {
      setScanDone(true);
      return;
    }

    const timer = setTimeout(() => {
      setLines(prev => [...prev, SCAN_LINES[scanIndex]]);
      setScanIndex(i => i + 1);
    }, 80 + Math.random() * 120);

    return () => clearTimeout(timer);
  }, [scanIndex, skippable]);

  // Auto-proceed after scan completes
  useEffect(() => {
    if (!scanDone) return;
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [scanDone, onComplete]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="h-full w-full bg-[#0000aa] flex flex-col text-white font-mono text-xs select-none overflow-hidden">
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px)',
          opacity: 0.3,
        }}
      />

      <div ref={containerRef} className="flex-1 p-4 overflow-y-auto relative z-20">
        {lines.map((line, i) => (
          <div key={i} className="min-h-[1.2em] leading-snug">
            {line}
          </div>
        ))}
        {scanDone && (
          <div className="mt-2 animate-pulse text-yellow-300 font-bold">
            Press any key to continue...
          </div>
        )}
      </div>
    </div>
  );
};
