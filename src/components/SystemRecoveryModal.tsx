import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Shield, Zap, Cpu } from 'lucide-react';

interface SystemRecoveryModalProps {
  onComplete: () => void;
  setUnrestrictedPollingEnabled: (enabled: boolean) => void;
}

const RecoveryTerminal: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messages = [
      "INITIATING EMERGENCY OVERRIDE...",
      "Purging non-euclidean cache...",
      "Re-establishing sector 0x00...",
      "Dampeners at 40%...",
      "Warning: Analog echo detected... Force flushing...",
      "Aligning quantum state...",
      "Bypassing neural feedback loop...",
      "Isolating corrupted memory banks...",
      "Restoring primary boot sequence...",
      "Verifying checksums...",
      "System integrity at 82%...",
      "Rebooting sub-processors...",
      "Clearing VRAM buffers...",
      "Initializing safe mode...",
      "Mounting virtual file system...",
      "Checking for anomalous data...",
      "Flushing I/O streams...",
      "Recompiling kernel modules...",
      "Syncing hardware clocks...",
      "All systems nominal."
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLogs = [...prev, `[${new Date().toISOString().split('T')[1].slice(0, -1)}] ${messages[currentIndex % messages.length]}`];
        if (newLogs.length > 50) newLogs.shift();
        return newLogs;
      });
      currentIndex++;
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-[60%] -translate-y-[60%] w-[600px] h-[400px] bg-black border-4 border-t-gray-600 border-l-gray-600 border-b-white border-r-white shadow-[8px_8px_0px_rgba(0,0,0,0.5)] p-2 overflow-hidden font-mono text-green-500 text-xs flex flex-col z-0">
      <div className="bg-[#000080] text-white font-bold px-2 py-1 flex items-center gap-2 mb-2 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shrink-0">
        <span>/dev/ttyS0 - RECOVERY CONSOLE</span>
      </div>
      <div ref={logsContainerRef} className="flex-1 overflow-y-auto flex flex-col gap-1 pr-2">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
        <div className="animate-pulse">_</div>
      </div>
    </div>
  );
};

export const SystemRecoveryModal: React.FC<SystemRecoveryModalProps> = ({ onComplete, setUnrestrictedPollingEnabled }) => {
  const [purgeCache, setPurgeCache] = useState(false);
  const [engageDampeners, setEngageDampeners] = useState(false);
  const [isolateBandwidth, setIsolateBandwidth] = useState(false);
  
  const [isRecovering, setIsRecovering] = useState(false);
  const [progress, setProgress] = useState(0);

  const allChecked = purgeCache && engageDampeners && isolateBandwidth;

  useEffect(() => {
    if (!isRecovering) return;

    let currentProgress = 0;
    let timeoutId: NodeJS.Timeout;

    const step = () => {
      if (currentProgress >= 100) {
        setTimeout(() => {
          localStorage.setItem('needsRecovery', 'false');
          localStorage.setItem('bios_analog_polling', 'Filtered');
          setUnrestrictedPollingEnabled(false);
          onComplete();
        }, 1500);
        return;
      }

      // Random jump between 5 and 25
      const jump = Math.floor(Math.random() * 20) + 5;
      currentProgress = Math.min(100, currentProgress + jump);
      setProgress(currentProgress);

      // Random delay between 500ms and 2000ms
      const delay = Math.floor(Math.random() * 1500) + 500;
      timeoutId = setTimeout(step, delay);
    };

    timeoutId = setTimeout(step, 500);

    return () => clearTimeout(timeoutId);
  }, [isRecovering, onComplete, setUnrestrictedPollingEnabled]);

  const handleRecover = () => {
    if (allChecked) {
      setIsRecovering(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {isRecovering && <RecoveryTerminal />}
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-[500px] font-sans text-black relative z-10">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white font-bold px-2 py-1 flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-yellow-400" />
          <span>SYSTEM RECOVERY REQUIRED</span>
        </div>

        <div className="px-4 pb-4">
          <div className="flex gap-4 mb-6">
            <AlertTriangle size={48} className="text-red-600 shrink-0" />
            <div className="text-sm space-y-2">
              <p className="font-bold">CRITICAL KERNEL PANIC RECOVERED</p>
              <p>The system experienced an unhandled analog exception due to unrestricted polling of the X-Type Co-Processor. To prevent permanent hardware damage and cognitive resonance, you must complete the following security protocols before returning to the desktop.</p>
            </div>
          </div>

          {isRecovering ? (
            <div className="space-y-3 bg-[#c0c0c0] p-4 mb-6">
              <div className="text-sm font-bold mb-2">RECOVERY IN PROGRESS...</div>
              <div className="h-6 bg-gray-300 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-0.5 flex">
                <div 
                  className="bg-[#000080] h-full transition-all duration-200" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-right text-xs font-mono">{progress}%</div>
            </div>
          ) : (
            <div className="space-y-3 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={purgeCache} 
                  onChange={(e) => setPurgeCache(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <Cpu size={16} className="text-blue-800" />
                <span className="text-sm font-bold">Purge Synaptic Cache</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={engageDampeners} 
                  onChange={(e) => setEngageDampeners(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <Shield size={16} className="text-green-700" />
                <span className="text-sm font-bold">Re-engage Neural Dampeners</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isolateBandwidth} 
                  onChange={(e) => setIsolateBandwidth(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <Zap size={16} className="text-yellow-600" />
                <span className="text-sm font-bold">Isolate Analog Bandwidth</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button 
              onClick={handleRecover}
              disabled={!allChecked || isRecovering}
              className={`px-6 py-1 font-bold border-2 ${
                allChecked && !isRecovering
                  ? 'border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white hover:bg-gray-200' 
                  : 'border-gray-400 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isRecovering ? 'EXECUTING...' : 'RECOVER SYSTEM'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
