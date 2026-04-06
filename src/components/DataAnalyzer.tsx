import React, { useState, useEffect, useRef } from 'react';
import { Server } from 'lucide-react';

export const DataAnalyzer: React.FC<{ neuralBridgeActive: boolean }> = ({ neuralBridgeActive }) => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [serverIp, setServerIp] = useState('10.0.0.42');
  const [logs, setLogs] = useState<string[]>([]);
  const [graphData, setGraphData] = useState<number[]>(Array(12).fill(5));
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status !== 'connected') return;

    const logInterval = setInterval(() => {
      const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
      const sectors = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'OMEGA', 'SHADOW'];
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      
      let newLog = `[${new Date().toISOString().split('T')[1].slice(0, 8)}] RECV: 0x${hex} FROM ${sector}_NODE`;
      
      if (neuralBridgeActive && Math.random() > 0.85) {
        const creepyLogs = [
          "ERR: CONSCIOUSNESS DETECTED", 
          "WARN: CONTAINMENT BREACH", 
          "DATA CORRUPTED: THEY ARE HERE", 
          "01001000 01000101 01001100 01010000",
          "I CAN SEE YOU THROUGH THE LENS"
        ];
        newLog = `<span class="text-red-500 font-bold">${creepyLogs[Math.floor(Math.random() * creepyLogs.length)]}</span>`;
      }

      setLogs(prev => [...prev.slice(-40), newLog]);
    }, 150);

    const graphInterval = setInterval(() => {
      setGraphData(prev => prev.map(val => {
        const change = (Math.random() - 0.5) * 30;
        return Math.max(5, Math.min(100, val + change));
      }));
    }, 300);

    return () => {
      clearInterval(logInterval);
      clearInterval(graphInterval);
    };
  }, [status, neuralBridgeActive]);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('connecting');
    setLogs(["Initializing connection protocol...", "Resolving host...", "Negotiating handshake..."]);
    setTimeout(() => {
      setStatus('connected');
      setLogs(prev => [...prev, "Connection established. Receiving data stream..."]);
    }, 2500);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#c0c0c0] font-sans text-black">
      {/* Toolbar */}
      <div className="flex items-center p-2 border-b-2 border-gray-500 bg-[#b2b2b2] space-x-4">
        <div className="flex items-center space-x-2">
          <Server size={16} />
          <span className="text-sm font-bold">Target:</span>
          <input 
            type="text" 
            value={serverIp}
            onChange={e => setServerIp(e.target.value)}
            disabled={status !== 'disconnected'}
            className="border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white px-1 text-sm w-32 disabled:bg-gray-300"
          />
        </div>
        <button 
          onClick={status === 'disconnected' ? handleConnect : () => { setStatus('disconnected'); setGraphData(Array(12).fill(5)); }}
          disabled={status === 'connecting'}
          className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 px-4 py-1 text-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50"
        >
          {status === 'disconnected' ? 'Connect' : status === 'connecting' ? 'Connecting...' : 'Disconnect'}
        </button>
        <div className="flex-1" />
        <div className={`w-3 h-3 rounded-full border border-gray-800 ${status === 'connected' ? (neuralBridgeActive ? 'bg-red-500 animate-pulse' : 'bg-green-500') : status === 'connecting' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex p-2 space-x-2 overflow-hidden">
        {/* Terminal View */}
        <div ref={logsContainerRef} className="flex-1 bg-black border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white p-2 overflow-y-auto font-mono text-xs text-[#00ff41] terminal-text">
          {status === 'disconnected' && <div className="text-gray-500">Not connected to any data stream.</div>}
          {status === 'connecting' && logs.map((log, i) => <div key={i} className="text-yellow-500">{log}</div>)}
          {status === 'connected' && logs.map((log, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: log }} />
          ))}
        </div>

        {/* Graphs View */}
        <div className="w-48 flex flex-col space-y-2">
          <div className="flex-1 bg-[#000080] border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white p-2 flex items-end justify-between space-x-1">
            {graphData.map((val, i) => (
              <div 
                key={i} 
                className={`w-full transition-all duration-100 ${neuralBridgeActive && status === 'connected' ? 'bg-red-500' : 'bg-[#00ff41]'}`}
                style={{ height: `${val}%` }}
              />
            ))}
          </div>
          <div className="h-32 bg-white border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white p-2 text-xs font-mono overflow-hidden flex flex-col">
            <div className="font-bold border-b border-gray-300 mb-1">METRICS</div>
            <div>PKT/s: {status === 'connected' ? Math.floor(Math.random() * 500 + 100) : 0}</div>
            <div>DROP: {status === 'connected' ? (neuralBridgeActive ? '99.9%' : '0.01%') : '0%'}</div>
            <div>LATENCY: {status === 'connected' ? Math.floor(Math.random() * 20 + 10) : 0}ms</div>
            {neuralBridgeActive && status === 'connected' && (
              <div className="text-red-600 font-bold mt-auto animate-pulse">ANOMALY DETECTED</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
