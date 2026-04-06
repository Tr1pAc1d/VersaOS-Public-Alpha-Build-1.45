import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, Zap, HardDrive, AlertTriangle, Settings } from 'lucide-react';

interface XTypeUtilityProps {
  neuralBridgeActive: boolean;
  neuralBridgeEnabled: boolean;
  neuralBoostEnabled: boolean;
  unrestrictedPollingEnabled: boolean;
  setUnrestrictedPollingEnabled?: (enabled: boolean) => void;
  onClose?: () => void;
}

const SynapticFluxCanvas: React.FC<{
  unrestrictedPollingEnabled: boolean;
  isOverclocked: boolean;
  neuralBridgeActive: boolean;
  neuralBridgeEnabled: boolean;
}> = ({ unrestrictedPollingEnabled, isOverclocked, neuralBridgeActive, neuralBridgeEnabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = canvas.width;
    const height = canvas.height;
    
    if (dataRef.current.length === 0) {
      dataRef.current = new Array(width).fill(height / 2);
    }

    const draw = () => {
      if (!neuralBridgeEnabled) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      const isHaunted = unrestrictedPollingEnabled || isOverclocked;
      const baseColor = isHaunted ? '#ef4444' : '#22c55e'; // red-500 or green-500

      let nextY = height / 2;
      if (neuralBridgeActive) {
        if (isHaunted) {
          if (Math.random() > 0.8) {
            nextY = height / 2 + (Math.random() * height - height / 2) * 0.9;
          } else {
            nextY = height / 2 + (Math.random() * 10 - 5);
          }
        } else {
          nextY = height / 2 + (Math.random() * 4 - 2);
        }
      }

      dataRef.current.push(nextY);
      dataRef.current.shift();

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 2;
      ctx.moveTo(0, dataRef.current[0]);
      for (let i = 1; i < width; i++) {
        ctx.lineTo(i, dataRef.current[i]);
      }
      ctx.stroke();

      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [unrestrictedPollingEnabled, isOverclocked, neuralBridgeActive, neuralBridgeEnabled]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={60} 
      className="w-full h-[60px] bg-black border-2 border-b-white border-r-white border-t-gray-600 border-l-gray-600"
    />
  );
};

const EmergencyConfirmDialog: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-[400px]">
      <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm flex justify-between items-center mb-4">
        <span>Emergency Disconnect</span>
        <button onClick={onCancel} className="bg-[#c0c0c0] text-black px-2 font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 hover:active:border-t-gray-800 hover:active:border-l-gray-800 hover:active:border-b-white hover:active:border-r-white">X</button>
      </div>
      <div className="px-4 pb-4 flex flex-col items-center text-center">
        <AlertTriangle size={48} className="text-red-600 mb-4 animate-pulse" />
        <p className="font-bold text-sm mb-6">
          WARNING: Immediate severing of the Neural Bridge may result in catastrophic synaptic backlash and data corruption. Proceed with emergency disconnect?
        </p>
        <div className="flex gap-4 w-full justify-center">
          <button onClick={onConfirm} className="px-6 py-2 font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
            [YES]
          </button>
          <button onClick={onCancel} className="px-6 py-2 font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
            [NO]
          </button>
        </div>
      </div>
    </div>
  </div>
);

const EmergencyShutdownSequence: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [dialogs, setDialogs] = useState<{ id: number; title: string; x: number; y: number }[]>([]);

  useEffect(() => {
    const logMessages = [
      "Initiating emergency disconnect...",
      "Sending SIGKILL to Neural Handshake...",
      "Flushing VRAM buffers...",
      "Severing EMI frequencies...",
      "Force closing PID 0x044...",
      "Dumping core memory...",
      "WARNING: Synaptic backlash detected.",
      "Isolating corrupted sectors...",
      "Halting analog polling...",
      "Disengaging neural boost...",
      "Terminating background processes...",
      "Syncing file systems...",
      "Unmounting /dev/sda1...",
      "Powering down auxiliary cores...",
      "System halted."
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < logMessages.length) {
        setLogs(prev => [...prev, logMessages[logIndex]]);
        logIndex++;
      } else {
        const randomHex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');
        setLogs(prev => [...prev, `ERR: 0x${randomHex} - Unhandled exception in kernel space`]);
      }
    }, 150);

    const dialogTitles = ["Memory Dump Failed", "Unsafe Disconnect Detected", "I/O Port Timeout", "Fatal Exception 0E"];
    const dialogTimeouts: NodeJS.Timeout[] = [];

    dialogTitles.forEach((title, index) => {
      const timeout = setTimeout(() => {
        setDialogs(prev => [...prev, {
          id: index,
          title,
          x: Math.random() * 50 + 10,
          y: Math.random() * 50 + 10
        }]);
      }, 1000 + index * 1200);
      dialogTimeouts.push(timeout);
    });

    const finishTimeout = setTimeout(() => {
      setLogs([]);
      setDialogs([]);
      localStorage.setItem('bios_analog_polling', 'Filtered');
      localStorage.setItem('needsRecovery', 'true');
      window.location.reload();
    }, 6000);

    return () => {
      clearInterval(logInterval);
      dialogTimeouts.forEach(clearTimeout);
      clearTimeout(finishTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-green-500 font-mono p-4 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto flex flex-col justify-end whitespace-pre-wrap break-all text-sm">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
      {dialogs.map(dialog => (
        <div 
          key={dialog.id} 
          className="absolute bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-64 text-black font-sans"
          style={{ left: `${dialog.x}%`, top: `${dialog.y}%` }}
        >
          <div className="bg-[#000080] text-white px-2 py-1 font-bold text-xs mb-2">
            {dialog.title}
          </div>
          <div className="p-2 flex items-center gap-3">
            <AlertTriangle size={24} className="text-red-600" />
            <span className="text-xs font-bold">System Error.</span>
          </div>
          <div className="flex justify-center mt-2 mb-1">
            <button className="px-4 py-1 text-xs font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800">
              OK
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const XTypeUtility: React.FC<XTypeUtilityProps> = ({ neuralBridgeActive, neuralBridgeEnabled, neuralBoostEnabled, unrestrictedPollingEnabled, setUnrestrictedPollingEnabled, onClose }) => {
  const [cpuUsage, setCpuUsage] = useState<number[]>(Array(20).fill(0));
  const [synapticLoad, setSynapticLoad] = useState<number[]>(Array(20).fill(0));
  const [temperature, setTemperature] = useState(45);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);

  const [activeTab, setActiveTab] = useState<'Overview' | 'Telemetry' | 'Advanced Tuning'>('Overview');
  const [multiplier, setMultiplier] = useState('1.0x');
  const [baseVoltage, setBaseVoltage] = useState(1200);
  const [localNeuralBoost, setLocalNeuralBoost] = useState(neuralBoostEnabled);
  const isOverclocked = multiplier === '2.0x';
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isEmergencyShuttingDown, setIsEmergencyShuttingDown] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "Loading kernel modules...",
    `Checking IRQ conflicts... ${neuralBridgeEnabled ? "OK" : "FAILED"}`,
    neuralBridgeEnabled ? (neuralBridgeActive ? "Bio-digital interface established." : "Awaiting neural handshake...") : "ERR: CO-PROCESSOR NOT RESPONDING"
  ]);
  const [eccSetting, setEccSetting] = useState<'strict' | 'permissive' | 'raw'>('strict');
  const [isTuning, setIsTuning] = useState(false);

  const runSelfTest = () => {
    setTerminalLogs(prev => [...prev, "Initiating Level 1 Diagnostic..."]);
    setTimeout(() => setTerminalLogs(prev => [...prev, "Checking sector 0x44... OK"]), 500);
    setTimeout(() => setTerminalLogs(prev => [...prev, "Checking sector 0x45... OK"]), 1000);
    setTimeout(() => setTerminalLogs(prev => [...prev, "Verifying checksums... MATCH"]), 1500);
    setTimeout(() => setTerminalLogs(prev => [...prev, "Self-Test Complete. No errors found."]), 2000);
  };

  const applyTuning = () => {
    setIsTuning(true);
    setTimeout(() => {
      setIsTuning(false);
      setTerminalLogs(prev => [...prev, "Tuning applied. Reboot recommended."]);
    }, 1000);
  };

  useEffect(() => {
    if (isInitializing) {
      const t1 = setTimeout(() => setLoadingStep(1), 800);
      const t2 = setTimeout(() => setLoadingStep(2), 1600);
      const t3 = setTimeout(() => setLoadingStep(3), 2400);
      const t4 = setTimeout(() => setIsInitializing(false), 3200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  }, [isInitializing]);

  useEffect(() => {
    if (!neuralBridgeEnabled || isInitializing) return;

    const interval = setInterval(() => {
      setCpuUsage(prev => {
        const base = neuralBridgeActive ? 40 : 10;
        const variance = unrestrictedPollingEnabled ? 60 : 40;
        const next = [...prev.slice(1), Math.floor(Math.random() * variance) + base];
        return next;
      });
      
      setSynapticLoad(prev => {
        const base = neuralBridgeActive ? 30 : 0;
        const variance = unrestrictedPollingEnabled ? 70 : 60;
        const next = [...prev.slice(1), neuralBridgeActive ? Math.floor(Math.random() * variance) + base : 0];
        return next;
      });

      setTemperature(prev => {
        let target = 45;
        if (neuralBridgeActive) {
          target = (neuralBoostEnabled || localNeuralBoost) ? 85 : 65;
          if (unrestrictedPollingEnabled || isOverclocked) target += 10;
        }
        const diff = target - prev;
        return prev + (diff * 0.1) + (Math.random() * 2 - 1);
      });
    }, unrestrictedPollingEnabled || isOverclocked ? 250 : 500);

    return () => clearInterval(interval);
  }, [neuralBridgeActive, neuralBoostEnabled, neuralBridgeEnabled, isInitializing, unrestrictedPollingEnabled, isOverclocked, localNeuralBoost]);

  const renderGraph = (data: number[], color: string, height: number = 60) => {
    const max = 100;
    return (
      <div className="flex items-end h-[60px] gap-[2px] bg-black p-1 border-2 border-b-white border-r-white border-t-gray-600 border-l-gray-600">
        {data.map((val, i) => (
          <div 
            key={i} 
            className={`w-full ${color} transition-all duration-300`} 
            style={{ height: `${(val / max) * 100}%` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#c0c0c0] text-black h-full flex flex-col font-sans text-sm relative">
      {/* Menu Bar */}
      <div className="flex bg-[#c0c0c0] border-b-2 border-gray-500 px-2 py-1 relative z-50">
        {['File', 'Diagnostics', 'View', 'Help'].map(menu => (
          <div key={menu} className="relative">
            <div 
              onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}
              className={`px-3 py-1 cursor-pointer text-sm font-bold border-2 ${activeMenu === menu ? 'bg-[#000080] text-white border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : 'hover:bg-[#000080] hover:text-white border-transparent active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white'}`}
            >
              {menu}
            </div>
            {activeMenu === menu && (
              <div className="absolute top-full left-0 mt-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] min-w-[150px]">
                {menu === 'File' && (
                  <>
                    <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer text-sm" onClick={() => { setActiveMenu(null); }}>Save Diagnostics Log</div>
                    <div className="border-t-2 border-gray-500 my-1"></div>
                    <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer text-sm" onClick={() => { setActiveMenu(null); if (onClose) onClose(); }}>Exit</div>
                  </>
                )}
                {menu === 'Diagnostics' && (
                  <>
                    <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer text-sm" onClick={() => { 
                      setActiveMenu(null); 
                      setActiveTab('Telemetry');
                      runSelfTest();
                    }}>Run Self-Test</div>
                    <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer text-sm" onClick={() => { setActiveMenu(null); setTerminalLogs(prev => [...prev, "VRAM Purged."]); }}>Purge VRAM</div>
                  </>
                )}
                {menu === 'View' && (
                  <div className="px-4 py-1 text-gray-500 text-sm">No options available</div>
                )}
                {menu === 'Help' && (
                  <div className="px-4 py-1 text-gray-500 text-sm">No options available</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 flex flex-col flex-1 overflow-hidden">
        {isInitializing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-80">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Cpu className="text-blue-800" />
                Initializing X-Type Utility
              </h3>
              <div className="space-y-2 font-mono text-xs">
                <p>{loadingStep >= 0 ? "Loading kernel drivers..." : ""}</p>
                <p>{loadingStep >= 1 ? "Scanning memory sectors..." : ""}</p>
                <p>{loadingStep >= 2 ? "Establishing hardware interrupts..." : ""}</p>
                <p>{loadingStep >= 3 ? "Ready." : ""}</p>
              </div>
              <div className="mt-4 border-2 border-gray-500 h-4 w-full p-0.5">
                <div className="bg-blue-800 h-full transition-all duration-300" style={{ width: `${(loadingStep / 3) * 100}%` }} />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 border-b-2 border-gray-500 pb-4 mb-4">
          <Cpu size={48} className={neuralBridgeActive ? "text-red-700" : "text-gray-600"} />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider">X-Type Control Panel</h1>
            <p className="text-xs font-bold text-gray-600">Advanced Co-Processor Diagnostics</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-[-2px] relative z-10">
          {(['Overview', 'Telemetry', 'Advanced Tuning'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 font-bold text-sm border-2 border-t-white border-l-white border-r-gray-800 ${
                activeTab === tab 
                  ? 'bg-[#c0c0c0] border-b-[#c0c0c0]' 
                  : 'bg-[#a0a0a0] border-b-gray-800'
              }`}
            >
              [ {tab} ]
            </button>
          ))}
        </div>

        <div className="border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-4 flex-1 flex flex-col bg-[#c0c0c0] relative z-0 overflow-y-auto">
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="space-y-4">
                <div className="bg-white p-2 border-2 border-b-white border-r-white border-t-gray-600 border-l-gray-600">
                  <h2 className="font-bold border-b border-gray-400 mb-2 flex items-center gap-2">
                    <Activity size={16} /> System Status
                  </h2>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <span className="font-bold">Hardware:</span>
                    <span className={neuralBridgeEnabled ? "text-green-700 font-bold" : "text-gray-500"}>
                      {neuralBridgeEnabled ? "DETECTED" : "NOT FOUND"}
                    </span>
                    
                    <span className="font-bold">Bridge State:</span>
                    <span className={neuralBridgeActive ? "text-red-700 font-bold animate-pulse" : "text-gray-500"}>
                      {neuralBridgeActive ? "ACTIVE (SYNCED)" : "DORMANT"}
                    </span>

                    <span className="font-bold">Neural Boost:</span>
                    <span className={(neuralBoostEnabled || localNeuralBoost) ? "text-yellow-600 font-bold" : "text-gray-500"}>
                      {(neuralBoostEnabled || localNeuralBoost) ? "ENGAGED" : "DISABLED"}
                    </span>

                    <span className="font-bold">Analog Polling:</span>
                    <span className={unrestrictedPollingEnabled ? "text-red-600 font-bold animate-pulse" : "text-gray-500"}>
                      {unrestrictedPollingEnabled ? "UNRESTRICTED" : "FILTERED"}
                    </span>
                  </div>
                </div>

                {unrestrictedPollingEnabled && (
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 border-2 border-t-red-300 border-l-red-300 border-b-red-900 border-r-red-900 active:border-t-red-900 active:border-l-red-900 active:border-b-red-300 active:border-r-red-300 animate-pulse flex items-center justify-center gap-2 shadow-lg"
                  >
                    <AlertTriangle size={20} />
                    EMERGENCY: DISABLE ANALOG POLLING
                  </button>
                )}
              </div>

              <div className="space-y-4 flex flex-col">
                <div className="bg-white p-2 border-2 border-b-white border-r-white border-t-gray-600 border-l-gray-600 flex-1 relative">
                  <h2 className="font-bold border-b border-gray-400 mb-2 flex items-center gap-2">
                    <HardDrive size={16} /> Memory Mapping
                  </h2>
                  {!neuralBridgeEnabled && (
                    <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-4 py-1 text-red-700 font-bold text-xs tracking-widest shadow-md">
                        OFFLINE
                      </div>
                    </div>
                  )}
                  <div className={`text-xs font-mono space-y-1 ${!neuralBridgeEnabled ? 'opacity-30 grayscale' : ''}`}>
                    <div className="flex justify-between"><span>Base RAM:</span><span>32768 KB</span></div>
                    <div className="flex justify-between"><span>Extended:</span><span>16384 KB</span></div>
                    <div className="flex justify-between"><span>VLB Bus Speed:</span><span>33 MHz</span></div>
                    <div className="flex justify-between"><span>IRQ Assignment:</span><span>15 (Locked)</span></div>
                    <div className="flex justify-between"><span>DMA Channel:</span><span>03</span></div>
                    <div className="flex justify-between"><span>I/O Port Range:</span><span>0x0300-0x031F</span></div>
                    <div className="flex justify-between text-red-700 font-bold mt-2 pt-2 border-t border-gray-300">
                      <span>Shadow Sector:</span>
                      <span>{neuralBridgeEnabled ? (neuralBridgeActive ? "ALLOCATED" : "UNMAPPED") : "NOT FOUND"}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div className="w-full h-4 bg-gray-200 border border-gray-400 flex">
                        <div className="h-full bg-blue-800 w-1/2" />
                        {neuralBridgeEnabled && neuralBridgeActive && <div className="h-full bg-red-700 w-1/4 animate-pulse" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Telemetry' && (
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="bg-white p-2 border-2 border-b-white border-r-white border-t-gray-600 border-l-gray-600 relative h-full flex flex-col">
                <h2 className="font-bold border-b border-gray-400 mb-2 flex items-center gap-2">
                  <Zap size={16} /> Telemetry
                </h2>
                {!neuralBridgeEnabled && (
                  <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-4 py-1 text-red-700 font-bold text-xs tracking-widest shadow-md">
                      OFFLINE
                    </div>
                  </div>
                )}
                <div className={`space-y-3 flex-1 ${!neuralBridgeEnabled ? 'opacity-30 grayscale' : ''}`}>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold">Core Load</span>
                      <span>{neuralBridgeEnabled ? cpuUsage[cpuUsage.length - 1] : 0}%</span>
                    </div>
                    {renderGraph(neuralBridgeEnabled ? cpuUsage : Array(20).fill(0), "bg-blue-800")}
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold">Synaptic Flux</span>
                      <span>{neuralBridgeEnabled ? synapticLoad[synapticLoad.length - 1] : 0}%</span>
                    </div>
                    <SynapticFluxCanvas 
                      unrestrictedPollingEnabled={unrestrictedPollingEnabled}
                      isOverclocked={isOverclocked}
                      neuralBridgeActive={neuralBridgeActive}
                      neuralBridgeEnabled={neuralBridgeEnabled}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex flex-col h-full">
                <div className="bg-black text-green-500 p-2 font-mono text-xs border-2 border-b-white border-r-white border-t-gray-600 border-l-gray-600 flex-1 overflow-hidden relative">
                  <div className="absolute inset-0 p-2 flex flex-col justify-end">
                    {terminalLogs.map((log, i) => (
                      <div key={i} className={
                        log.includes("CRITICAL") || log.includes("WARNING: CLOCK") ? "text-red-500 animate-pulse" :
                        log.includes("WARNING") ? "text-yellow-400" :
                        log.includes("ERR") ? "text-red-500" :
                        log.includes("Loading") || log.includes("Checking") ? "opacity-70" :
                        ""
                      }>{log}</div>
                    ))}
                    {neuralBridgeEnabled && (neuralBoostEnabled || localNeuralBoost) && <div className="text-yellow-400">WARNING: Thermal limits overridden.</div>}
                    {neuralBridgeEnabled && unrestrictedPollingEnabled && <div className="text-red-500 animate-pulse">CRITICAL: EMI FILTERS BYPASSED. ANALOG NOISE DETECTED.</div>}
                    {isOverclocked && <div className="text-red-500 animate-pulse">WARNING: CLOCK MULTIPLIER EXCEEDS SAFE LIMITS.</div>}
                    <div>&gt; _</div>
                  </div>
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
                </div>

                <div className="flex items-center justify-between bg-[#c0c0c0] p-2 border-2 border-b-gray-600 border-r-gray-600 border-t-white border-l-white">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={20} className={neuralBridgeEnabled && temperature > 75 ? "text-red-600 animate-pulse" : "text-gray-500"} />
                    <span className="font-bold text-xs">Core Temp:</span>
                  </div>
                  <span className={`font-mono font-bold ${neuralBridgeEnabled && temperature > 75 ? "text-red-600" : "text-black"}`}>
                    {neuralBridgeEnabled ? temperature.toFixed(1) : "---"}°C
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Advanced Tuning' && (
            <div className="bg-white p-4 border-2 border-b-white border-r-white border-t-gray-600 border-l-gray-600 h-full flex flex-col relative">
              <h2 className="font-bold border-b border-gray-400 mb-4 flex items-center gap-2">
                <Settings size={16} /> Hardware Tuning
              </h2>
              {!neuralBridgeEnabled && (
                <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-4 py-1 text-red-700 font-bold text-xs tracking-widest shadow-md">
                    OFFLINE
                  </div>
                </div>
              )}
              {isTuning && (
                <div className="absolute inset-0 z-20 bg-white/50 flex items-center justify-center cursor-wait">
                </div>
              )}
              <div className={`space-y-6 max-w-md flex-1 ${!neuralBridgeEnabled ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-sm">Clock Multiplier:</label>
                  <select 
                    value={multiplier} 
                    onChange={e => setMultiplier(e.target.value)}
                    className="bg-[#c0c0c0] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-sm font-bold outline-none"
                  >
                    <option value="1.0x">1.0x</option>
                    <option value="1.5x">1.5x</option>
                    <option value="2.0x">2.0x (Warning)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-sm">Base Voltage (mV):</label>
                  <input 
                    type="number" 
                    value={baseVoltage} 
                    onChange={e => setBaseVoltage(Number(e.target.value))}
                    step={50}
                    min={800}
                    max={1600}
                    className="w-24 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-sm font-mono outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-sm">Neural Boost:</label>
                  <button 
                    onClick={() => setLocalNeuralBoost(!localNeuralBoost)}
                    className={`w-12 h-6 border-2 flex items-center px-0.5 ${
                      localNeuralBoost 
                        ? 'bg-green-500 border-t-gray-800 border-l-gray-800 border-b-white border-r-white justify-end' 
                        : 'bg-gray-400 border-t-gray-800 border-l-gray-800 border-b-white border-r-white justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800" />
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-400">
                  <h3 className="font-bold text-sm mb-3">Memory ECC Settings</h3>
                  <div className="space-y-2">
                    {(['strict', 'permissive', 'raw'] as const).map(setting => (
                      <label key={setting} className="flex items-center gap-2 cursor-pointer">
                        <div className={`w-4 h-4 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white flex items-center justify-center rounded-full`}>
                          {eccSetting === setting && <div className="w-2 h-2 bg-black rounded-full" />}
                        </div>
                        <input 
                          type="radio" 
                          name="eccSetting" 
                          value={setting} 
                          checked={eccSetting === setting} 
                          onChange={() => setEccSetting(setting)} 
                          className="hidden" 
                        />
                        <span className="text-sm">
                          {setting === 'strict' && 'Strict ECC'}
                          {setting === 'permissive' && 'Permissive'}
                          {setting === 'raw' && 'Raw (Unsafe)'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button 
                  onClick={applyTuning}
                  disabled={!neuralBridgeEnabled || isTuning}
                  className="px-6 py-2 font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50"
                >
                  Apply Tuning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfirmDialog && (
        <EmergencyConfirmDialog 
          onConfirm={() => {
            setShowConfirmDialog(false);
            setIsEmergencyShuttingDown(true);
          }}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
      
      {isEmergencyShuttingDown && <EmergencyShutdownSequence />}
    </div>
  );
};
