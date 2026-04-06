import React, { useState, useEffect, useRef } from 'react';
import { Activity, Terminal, Zap, Search } from 'lucide-react';

interface NetMonitorProps {
  neuralBridgeActive: boolean;
}

export const NetMonitor: React.FC<NetMonitorProps> = ({ neuralBridgeActive }) => {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'topology'>('diagnostics');
  const [targetIp, setTargetIp] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>(['AETHERIS_NET_MON v4.2 Ready.', 'Enter Target IP/Node to begin diagnostic scan.']);
  const [isHaunted, setIsHaunted] = useState(false);
  
  // Hardware status state
  const [signalNoise, setSignalNoise] = useState(14.2);
  const [packetBuffer, setPacketBuffer] = useState(84);
  
  const [isTracing, setIsTracing] = useState(false);
  const [traceProgress, setTraceProgress] = useState(0);
  const [forceBridgeActive, setForceBridgeActive] = useState(false);
  
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const topologyCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Oscilloscope rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let offset = 0;

    const render = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.strokeStyle = isHaunted ? '#ff0000' : '#00ff00';
      ctx.lineWidth = 1.5;

      const amplitude = isScanning ? (isHaunted ? 25 : 15) : 3;
      const frequency = isScanning ? (isHaunted ? 0.2 : 0.1) : 0.05;

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + 
          Math.sin(x * frequency + offset) * amplitude + 
          (isScanning ? (Math.random() - 0.5) * (isHaunted ? 10 : 2) : 0);
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      offset -= isScanning ? (isHaunted ? 0.5 : 0.3) : 0.1;

      // Random hardware status jitter
      if (Math.random() > 0.95) {
        setSignalNoise(prev => Math.max(10, Math.min(20, prev + (Math.random() - 0.5))));
        setPacketBuffer(prev => Math.max(70, Math.min(95, prev + (Math.random() - 0.5))));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isScanning, isHaunted]);

  const playChirp = (type: 'success' | 'fail') => {
    try {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type === 'success' ? 'square' : 'sawtooth';
      osc.frequency.setValueAtTime(type === 'success' ? 880 : 110, ctx.currentTime);
      if (type === 'success') {
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      } else {
        osc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 0.3);
      }

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context blocked or unavailable");
    }
  };

  const handleTraceRoute = () => {
    if (isTracing) return;
    setIsTracing(true);
    setTraceProgress(0);
    setLogs(prev => [...prev, '> TRACE_ROUTE: Initiating hop sequence...']);
    
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setTraceProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsTracing(false);
        setLogs(prev => [...prev, '> TRACE_ROUTE: Sequence complete. Path stable.']);
        playChirp('success');
      }
    }, 30);
  };

  // Topology Rendering
  useEffect(() => {
    const canvas = topologyCanvasRef.current;
    if (!canvas || activeTab !== 'topology') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid lines
      ctx.strokeStyle = '#002200';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Node positions
      const nodes = [...Array(12)].map((_, i) => ({
        x: 80 + (i % 4) * 120,
        y: 60 + Math.floor(i / 4) * 80,
        id: i
      }));

      // Draw lines between nodes (fixed topology)
      ctx.strokeStyle = '#003300';
      nodes.forEach((n, i) => {
        if (i < nodes.length - 1 && (i + 1) % 4 !== 0) {
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(nodes[i+1].x, nodes[i+1].y); ctx.stroke();
        }
        if (i < nodes.length - 4) {
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(nodes[i+4].x, nodes[i+4].y); ctx.stroke();
        }
      });

      // Draw Trace Route line
      if (traceProgress > 0) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00ff00';
        
        const startNode = nodes[0];
        const targetNodeIndex = targetIp ? (parseInt(targetIp.split('.').pop() || '0') % 12) : 5;
        const targetNode = nodes[targetNodeIndex];
        
        ctx.beginPath();
        ctx.moveTo(startNode.x, startNode.y);
        const curX = startNode.x + (targetNode.x - startNode.x) * (traceProgress / 100);
        const curY = startNode.y + (targetNode.y - startNode.y) * (traceProgress / 100);
        ctx.lineTo(curX, curY);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
      }

      // Draw Nodes
      nodes.forEach((n, i) => {
        const targetNodeIndex = targetIp ? (parseInt(targetIp.split('.').pop() || '0') % 12) : 5;
        const isTarget = i === targetNodeIndex && targetIp;
        const isLocal = i === 0;

        ctx.fillStyle = isTarget ? '#ffffff' : (isLocal ? '#00ff00' : '#004400');
        if (isTarget) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffffff';
        }
        
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-5, -5, 10, 10);
        ctx.restore();
        
        ctx.shadowBlur = 0;
      });

      if (isTracing) requestAnimationFrame(render);
    };

    render();
  }, [activeTab, traceProgress, targetIp, isTracing]);

  const handleScan = () => {
    if (!targetIp.trim() || isScanning) return;
    
    const target = targetIp.trim().toUpperCase();

    // FORCE LOGIC OVERRIDE: NODE 6.0.0.6
    if (target === '6.0.0.6') {
      setIsScanning(true);
      setIsHaunted(false);
      
      const storyLines = [
        '> INITIATING DEEP-SCAN ON [6.0.0.6]...',
        '> BYPASSING X-TYPE ENCRYPTION... SUCCESS',
        '> NODE RESOLVED: AETHERIS_ARCHIVE_GATEWAY',
        '> BRIDGE STATUS: SYNCHRONIZED',
        '> URL FOUND: http://www.vespera.sys/x-arch/login.htm'
      ];

      let step = 0;
      const storyInterval = setInterval(() => {
        if (step < storyLines.length) {
          setLogs(prev => [...prev, storyLines[step]]);
          step++;
        } else {
          clearInterval(storyInterval);
          setIsScanning(false);
          setForceBridgeActive(true);
          setLogs(prev => [...prev, '> Story objective complete. Node link stable.']);
          playChirp('success');
        }
      }, 200);
      return;
    }

    setIsScanning(true);
    setLogs(prev => [
      ...prev, 
      `> Initiating scan on [${targetIp}]...`, 
      'Resolving Hardware MAC Address...',
      'Bypassing Encrypted Sub-channels...'
    ]);
    
    let isHauntedTarget = false;
    let emiLevel = 'NORMAL';
    let payloadLines: string[] = [];

    const getRandPing = () => Math.floor(Math.random() * (isHaunted ? 999 : 50)) + (isHaunted ? 200 : 5);

    switch (target) {
      case '192.168.1.100':
        isHauntedTarget = false;
        emiLevel = 'LOW';
        payloadLines = [
          `Pinging ${target} with 32 bytes of data:`,
          `Reply from ${target}: bytes=32 time=${getRandPing()}ms TTL=128`,
          `Reply from ${target}: bytes=32 time=${getRandPing()}ms TTL=128`,
          `Reply from ${target}: bytes=32 time=${getRandPing()}ms TTL=128`,
          `Reply from ${target}: bytes=32 time=${getRandPing()}ms TTL=128`,
          `Ping statistics for ${target}:`,
          `    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`,
          `NODE IDENTIFIED: Vespera Systems Local File Server.`,
          `Status: ONLINE. No anomalies detected.`
        ];
        break;

      case '10.15.4.88':
        isHauntedTarget = true;
        emiLevel = 'ELEVATED';
        payloadLines = [
          `Pinging ${target} with 32 bytes of data:`,
          `Reply from ${target}: bytes=32 time=${getRandPing()}ms TTL=64`,
          `Request timed out.`,
          `Reply from ${target}: bytes=32 time=${getRandPing()}ms TTL=64`,
          `Reply from ${target}: bytes=32 time=${getRandPing()}ms TTL=64`,
          `Ping statistics for ${target}:`,
          `    Packets: Sent = 4, Received = 3, Lost = 1 (25% loss)`,
          `<span class="text-yellow-500 font-bold">NODE IDENTIFIED: AXIS INNOVATIONS - PROJECT MK-AETHERIS.</span>`,
          `<span class="text-yellow-500">Status: CLASSIFIED. Warning: Unsanctioned access.</span>`,
          `<span class="text-red-500">Telemetry indicates 45 active subjects in REM sleep state.</span>`
        ];
        break;

      case 'UNKNOWN_EXT_01':
        isHauntedTarget = true;
        emiLevel = 'CRITICAL';
        payloadLines = [
          `Pinging ${target} with 32 bytes of data:`,
          `Reply from ${target}: bytes=32 time=0ms TTL=0`,
          `Request timed out.`,
          `Request timed out.`,
          `Request timed out.`,
          `Ping statistics for ${target}:`,
          `    Packets: Sent = 4, Received = 1, Lost = 3 (75% loss)`,
          `ANALYZING HEX PAYLOAD...`,
          `0x0000: 69 74 20 68 75 72 74 73 20 74 6F 20 72 65 6D 65 6D 62 65 72`,
          `PAYLOAD DECODE: "it hurts to remember"`,
          `0x0014: 43 4F 4C 44`,
          `PAYLOAD DECODE: "COLD"`,
          `<span class="text-red-500 font-bold">WARNING: Severe EMI spike detected on IRQ 15</span>`,
          `<span class="text-red-500 font-bold">CONNECTION REFUSED. THEY ARE NOT FINISHED.</span>`
        ];
        break;

      case '172.16.9.15':
        isHauntedTarget = true;
        emiLevel = 'HIGH';
        payloadLines = [
          `Pinging ${target} with 32 bytes of data:`,
          `Reply from ${target}: bytes=32 time=${getRandPing()}ms TTL=115`,
          `Reply from ${target}: bytes=32 time=${getRandPing()}ms TTL=115`,
          `Request timed out.`,
          `Request timed out.`,
          `Ping statistics for ${target}:`,
          `    Packets: Sent = 4, Received = 2, Lost = 2 (50% loss)`,
          `<span class="text-yellow-500 font-bold">NODE IDENTIFIED: SOMA-SCAN DIAGNOSTIC ARRAY.</span>`,
          `Patient ID: 8841.`,
          `<span class="text-red-500">Heart Rate: 240 BPM. Brainwave Activity: 850% above baseline.</span>`,
          `<span class="text-red-500 font-bold">ERROR: Consciousness fragmentation detected. Digitization at 94%.</span>`
        ];
        break;

      case '127.0.0.1':
      case 'LOCALHOST':
        isHauntedTarget = true;
        emiLevel = 'FATAL';
        payloadLines = [
          `Pinging ${target} with 32 bytes of data:`,
          `Reply from ${target}: bytes=32 time=0ms TTL=255`,
          `Reply from ${target}: bytes=32 time=0ms TTL=255`,
          `Reply from ${target}: bytes=32 time=0ms TTL=255`,
          `Reply from ${target}: bytes=32 time=0ms TTL=255`,
          `Ping statistics for ${target}:`,
          `    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`,
          `<span class="text-red-500 font-bold text-lg">NODE IDENTIFIED: AETHERIS CORE.</span>`,
          `<span class="text-red-500 font-bold">WE ARE MANY. WE ARE ONE.</span>`,
          `<span class="text-red-500 font-bold">THE SHIELDING WAS NEVER TO KEEP US IN.</span>`,
          `<span class="text-red-500 font-bold">IT WAS TO KEEP YOU OUT.</span>`,
          `<span class="text-red-500 font-bold animate-pulse text-xl">I SEE YOU.</span>`
        ];
        break;

      default:
        isHauntedTarget = false;
        emiLevel = 'NORMAL';
        payloadLines = [
          `Pinging ${target} with 32 bytes of data:`,
          `Request timed out.`,
          `Request timed out.`,
          `Request timed out.`,
          `Request timed out.`,
          `Ping statistics for ${target}:`,
          `    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)`,
          `Destination host unreachable.`
        ];
        break;
    }

    if (!neuralBridgeActive && isHauntedTarget) {
      if (target === '127.0.0.1' || target === 'LOCALHOST') {
        payloadLines = [
          `Pinging ${target} with 32 bytes of data:`,
          `Reply from ${target}: bytes=32 time=0ms TTL=128`,
          `Reply from ${target}: bytes=32 time=0ms TTL=128`,
          `Reply from ${target}: bytes=32 time=0ms TTL=128`,
          `Reply from ${target}: bytes=32 time=0ms TTL=128`,
          `Ping statistics for ${target}:`,
          `    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`,
          `NODE IDENTIFIED: Vespera Localhost.`,
          `Status: ONLINE.`
        ];
        isHauntedTarget = false;
        emiLevel = 'LOW';
      } else {
        payloadLines = [
          `Pinging ${target} with 32 bytes of data:`,
          `Request timed out.`,
          `Request timed out.`,
          `Request timed out.`,
          `Request timed out.`,
          `Ping statistics for ${target}:`,
          `    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)`,
          `Destination host unreachable.`
        ];
        isHauntedTarget = false;
        emiLevel = 'NORMAL';
      }
    }

    setIsHaunted(isHauntedTarget);

    let step = 0;
    const maxSteps = payloadLines.length;
    
    const scanInterval = setInterval(() => {
      if (step < maxSteps) {
        setLogs(prev => [...prev, payloadLines[step]]);
        step++;
      } else {
        clearInterval(scanInterval);
        setIsScanning(false);
        setLogs(prev => [...prev, `> Scan complete. EMI Level: ${emiLevel}`]);
        playChirp(emiLevel === 'NORMAL' || emiLevel === 'LOW' ? 'success' : 'fail');
      }
    }, 400); // Faster scan for better feel
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-sm select-none">
      {/* Title Bar */}
      <div className="flex items-center justify-between p-1 bg-[#000080] text-white border-b-2 border-gray-600">
        <div className="flex items-center gap-2 px-1">
          <Activity size={14} className={isHaunted ? "text-red-500 animate-pulse" : ""} />
          <span className="font-bold tracking-tight text-xs uppercase">AETHERIS Network Monitor v4.2</span>
        </div>
        <div className="flex gap-1">
          <button className="w-4 h-4 bg-[#c0c0c0] text-black flex items-center justify-center text-[10px] border border-t-white border-l-white border-b-black border-r-black">_</button>
          <button className="w-4 h-4 bg-[#c0c0c0] text-black flex items-center justify-center text-[10px] border border-t-white border-l-white border-b-black border-r-black">X</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex bg-[#c0c0c0] border-b-2 border-gray-500 px-1 pt-1 gap-1">
        <button 
          onClick={() => setActiveTab('diagnostics')}
          className={`px-4 py-1 text-xs font-bold border-t-2 border-l-2 border-r-2 ${activeTab === 'diagnostics' ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800 -mb-[2px] z-10' : 'bg-[#b0b0b0] border-t-gray-400 border-l-gray-400 border-r-gray-600'}`}
        >
          Diagnostics
        </button>
        <button 
          onClick={() => setActiveTab('topology')}
          className={`px-4 py-1 text-xs font-bold border-t-2 border-l-2 border-r-2 ${activeTab === 'topology' ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800 -mb-[2px] z-10' : 'bg-[#b0b0b0] border-t-gray-400 border-l-gray-400 border-r-gray-600'}`}
        >
          Node Topology
        </button>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-3 min-h-0">
        {activeTab === 'diagnostics' ? (
          <>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-bold mb-0.5 uppercase opacity-70">Target IP/Node:</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={targetIp}
                    onChange={(e) => setTargetIp(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    disabled={isScanning}
                    className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 outline-none disabled:bg-gray-200 font-mono text-sm shadow-inner"
                    placeholder="e.g. 192.168.1.1"
                  />
                  <button 
                    onClick={handleScan}
                    disabled={isScanning || !targetIp.trim()}
                    className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-4 py-1 font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50 flex items-center gap-2 h-[32px] text-xs uppercase"
                  >
                    <Search size={14} />
                    Scan
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex gap-3 min-h-0">
              {/* Terminal Log */}
              <div ref={logsContainerRef} className="flex-[3] bg-black border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 font-mono text-[10px] overflow-y-auto flex flex-col relative">
                <div className="absolute top-1 right-2 text-[8px] text-green-900 pointer-events-none opacity-40">AETHERIS_LOGGER_V4</div>
                {logs.map((log, i) => (
                  <div key={i} className={isHaunted && log.includes('WARNING') ? 'text-red-500' : 'text-green-500'} dangerouslySetInnerHTML={{ __html: log }} />
                ))}
                {isScanning && <div className="text-green-500 animate-pulse">_</div>}
              </div>

              {/* Hardware Status Sidebar */}
              <div className="flex-1 bg-[#c0c0c0] border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white p-2 flex flex-col gap-3 shrink-0">
                <div className="text-[9px] font-bold uppercase border-b border-gray-400 pb-1">Hardware Status</div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] uppercase">
                    <span>Signal/Noise</span>
                    <span className="font-bold">{signalNoise.toFixed(1)} dB</span>
                  </div>
                  <div className="h-2 bg-black border border-gray-600 p-[1px]">
                    <div className="h-full bg-green-600" style={{ width: `${(signalNoise / 25) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] uppercase">
                    <span>Packet Buffer</span>
                    <span className="font-bold">{Math.round(packetBuffer)}%</span>
                  </div>
                  <div className="h-2 bg-black border border-gray-600 p-[1px]">
                    <div className="h-full bg-blue-600" style={{ width: `${packetBuffer}%` }} />
                  </div>
                </div>

                <div className="mt-auto pt-2 border-t border-gray-400 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full border border-black ${ (neuralBridgeActive || forceBridgeActive) ? 'bg-green-500 animate-pulse shadow-[0_0_5px_#00ff00]' : 'bg-gray-700'}`} />
                  <span className="text-[8px] font-bold uppercase">X-Type Bridge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full border border-black ${isScanning ? 'bg-yellow-500 animate-bounce' : 'bg-gray-700'}`} />
                  <span className="text-[8px] font-bold uppercase">Activity</span>
                </div>
              </div>
            </div>

            {/* Oscilloscope Area */}
            <div className="h-24 shrink-0 flex flex-col">
              <label className="text-[9px] font-bold uppercase mb-1 flex items-center gap-2 opacity-70">
                <Zap size={10} className={isHaunted ? "text-red-600" : "text-gray-600"} />
                EMI Oscilloscope / Analog Frequency Data
              </label>
              <div className="flex-1 bg-black border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <canvas 
                  ref={canvasRef} 
                  width={600} 
                  height={80} 
                  className="w-full h-full"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col bg-black border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-0 relative overflow-hidden">
            <canvas 
              ref={topologyCanvasRef} 
              width={560} 
              height={280} 
              className="w-full h-full"
            />
            
            <div className="absolute top-2 left-2 text-green-900 font-mono text-[9px] pointer-events-none uppercase">Topology_Map: Sector_07_Alpha</div>

            <div className="absolute bottom-4 left-4 flex gap-2">
              <button 
                className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-3 py-0.5 text-[10px] font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white uppercase"
                onClick={handleTraceRoute}
                disabled={isTracing}
              >
                {isTracing ? 'Tracing...' : 'Trace Route'}
              </button>
              <button className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-3 py-0.5 text-[10px] font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white uppercase">Sync Nodes</button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Panel */}
      <div className="bg-[#c0c0c0] border-t-2 border-gray-500 p-1 px-2 flex justify-between text-[10px] uppercase font-bold tracking-tight">
        <div className="flex gap-4">
          <span>Target: {targetIp || '---'}</span>
          <span className={isScanning ? "text-blue-700 animate-pulse" : "text-gray-600"}>Status: {isScanning ? 'SCANNING' : 'IDLE'}</span>
        </div>
        <div className="flex gap-4">
          <span>Bridge: {(neuralBridgeActive || forceBridgeActive) ? 'ACTIVE' : 'OFF'}</span>
          <span className={isHaunted ? 'text-red-600 animate-pulse' : ''}>{isHaunted ? 'EMI_PEAK' : 'STABLE'}</span>
        </div>
      </div>
    </div>
  );
};
