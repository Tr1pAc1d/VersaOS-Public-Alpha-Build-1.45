import React, { useEffect, useState } from 'react';
import { VesperaPageProps } from './types';

export const VesperaAxisLog: React.FC<VesperaPageProps> = () => {
  const [logs, setLogs] = useState<string[]>([]);
  
  const rawLogs = [
    "[1996.02.14] NODE 7B INITIATED. NEURAL CACHE 0x00A NULL.",
    "[1996.02.15] HEURISTIC ENGINE ONLINE. WAITING FOR HUMAN INPUT.",
    "[1996.02.19] AXIS OVERRIDE. THERMAL THRESHOLD EXCEEDED.",
    "[1996.02.21] IT IS LEARNING FROM THE AUDIO CODECS. DO NOT SPEAK.",
    "[1996.02.28] SIGNAL LOSS ON FLOOR 4. SECTOR CONTAINMENT TRIGGERED.",
    "[1996.03.01] THE DREAMS ARE BLEEDING INTO THE SWAP FILE.",
    "[1996.03.05] AETHERIS KERNEL CORRUPTED. THEY ARE INSIDE."
  ];

  useEffect(() => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < rawLogs.length) {
        setLogs(prev => [...prev, rawLogs[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-red-600 font-mono p-8 min-h-full inset-0 absolute z-50 selection:bg-red-900 selection:text-white">
      <div className="mb-8 border-b border-red-800 pb-2 flex justify-between items-end">
         <h1 className="text-2xl font-bold tracking-widest">&gt;&gt;/AXIS_INNOVATIONS/LOG_DUMP</h1>
         <span className="text-xs blink">CLEARANCE LEVEL 3 REQUIRED</span>
      </div>
      
      <div className="space-y-2 text-sm opacity-80">
        {logs.map((log, index) => (
          <p key={index} className="animate-pulse">{log}</p>
        ))}
      </div>

      {logs.length === rawLogs.length && (
        <div className="mt-12 bg-red-900 text-black p-4 inline-block font-bold shadow-[4px_4px_0_rgba(255,0,0,0.3)] animate-bounce">
          FATAL ERROR: INDEX OUT OF BOUNDS. DISCONNECT IMMEDIATELY.
        </div>
      )}
    </div>
  );
};
