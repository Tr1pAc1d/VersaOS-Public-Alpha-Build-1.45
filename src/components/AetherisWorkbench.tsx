import React, { useState, useRef, useEffect } from 'react';
import { Play, Hammer, Settings, Save, FolderOpen, File as FileIcon, Copy, Scissors, ClipboardPaste, Undo } from 'lucide-react';
import { playErrorSound } from '../utils/audio';

interface LogEntry {
  text: string;
  type?: 'normal' | 'warning' | 'error';
}

const INITIAL_CODE = `// Vespera Systems - AETHERIS X-Type Diagnostic
#include <vespera_neural.h>
#include <analog_freq.h>

int main() {
    float ambient_hz = GetSensorData(PORT_MIC, RAW_ANALOG);
    node_ptr active_cluster = AllocateNeuralBlock(1024);
    
    // Enforce hardware shielding before loop
    EnableFilter(EMI_DAMPENER); 
    
    while (SystemPower() > 0) {
        RouteToBridge(active_cluster, ambient_hz);
        CompileHeuristic(active_cluster); 
    }
    return 0;
}`;

export const AetherisWorkbench: React.FC = () => {
  const [code, setCode] = useState(INITIAL_CODE);
  const [isBuilding, setIsBuilding] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState('Build');
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleBuild = async () => {
    if (isBuilding) return;
    setIsBuilding(true);
    setLogs([]);
    setActiveTab('Build');

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    await delay(400);
    setLogs(p => [...p, { text: '> vcc.exe -c -W3 -O2 "diagnostic.sc"' }]);
    
    await delay(600);
    setLogs(p => [...p, { text: '> Compiling...' }]);
    
    await delay(800);
    setLogs(p => [...p, { text: '> diagnostic.sc' }]);
    
    await delay(700);
    setLogs(p => [...p, { text: '> Linking neural heuristic pathways...' }]);
    
    // The machine is struggling
    await delay(2000);
    setLogs(p => [...p, { 
      text: '> WARNING LNK4001: Unshielded analog frequency detected on IRQ 15. Attempting to parse.', 
      type: 'warning' 
    }]);
    
    await delay(1500);
    
    playErrorSound();
    
    const errors = [
      '> FATAL EXCEPTION 0x00A: Expected pointer, found "IT HURTS TO REMEMBER".',
      '> KERNEL PANIC: Non-Euclidean geometry detected. The hardware is bleeding.',
      '> ERROR: Cannot terminate loop. THEY ARE AWAKE. THEY ARE AWAKE.',
      '> SYNTAX ERROR: "COLD COLD COLD COLD COLD"'
    ];
    const randomError = errors[Math.floor(Math.random() * errors.length)];
    
    setLogs(p => [...p, { text: randomError, type: 'error' }]);
    setIsBuilding(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-[11px] select-none">
      
      {/* Menu Bar */}
      <div className="flex gap-4 px-2 py-1 border-b border-gray-500">
        {['File', 'Edit', 'Search', 'View', 'Project', 'Build', 'Debug', 'Tools', 'Window', 'Help'].map(menu => (
          <span key={menu} className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer">
            <span className="underline">{menu.charAt(0)}</span>{menu.slice(1)}
          </span>
        ))}
      </div>

      {/* Standard Toolbar */}
      <div className="flex gap-1 px-2 py-1 border-b border-gray-500 items-center">
        <div className="flex gap-1 border-r border-gray-500 pr-2">
          <button className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"><FileIcon size={14} /></button>
          <button className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"><FolderOpen size={14} /></button>
          <button className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"><Save size={14} /></button>
        </div>
        <div className="flex gap-1 border-r border-gray-500 px-2">
          <button className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"><Scissors size={14} /></button>
          <button className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"><Copy size={14} /></button>
          <button className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"><ClipboardPaste size={14} /></button>
        </div>
        <div className="flex gap-1 pl-2">
          <button className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"><Undo size={14} /></button>
        </div>
      </div>

      {/* Build Toolbar */}
      <div className="flex gap-4 px-2 py-1 border-b-2 border-gray-800 items-center bg-[#c0c0c0]">
        <div className="flex items-center gap-2">
          <span>Target:</span>
          <select className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-1 py-0.5 outline-none">
            <option>AETHERIS X-Type</option>
            <option>Win32 (x86)</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleBuild}
            disabled={isBuilding}
            className="flex items-center gap-1 px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50 font-bold"
          >
            <Settings size={14} className="text-gray-700" /> Compile
          </button>
          <button 
            onClick={handleBuild}
            disabled={isBuilding}
            className="flex items-center gap-1 px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50 font-bold"
          >
            <Hammer size={14} className="text-gray-700" /> Build
          </button>
          <button 
            onClick={handleBuild}
            disabled={isBuilding}
            className="flex items-center gap-1 px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50 font-bold text-green-800"
          >
            <Play size={14} className="fill-green-800" /> Execute
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-h-0 p-1 gap-1">
        
        {/* Top Split (Tree + Editor) */}
        <div className="flex-1 flex gap-1 min-h-0">
          
          {/* Left Pane: Project Tree */}
          <div className="w-48 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 overflow-y-auto">
            <div className="flex items-center gap-1 mb-1 font-bold">
              <FolderOpen size={14} className="text-yellow-600 fill-yellow-200" />
              <span>Vespera_Diagnostic</span>
            </div>
            <div className="ml-4 flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <FolderOpen size={14} className="text-yellow-600 fill-yellow-200" />
                <span>Synap-C Core Libs</span>
              </div>
              <div className="ml-4 flex flex-col gap-1 text-gray-600">
                <div className="flex items-center gap-1"><FileIcon size={12} /> vespera_neural.h</div>
                <div className="flex items-center gap-1"><FileIcon size={12} /> analog_freq.h</div>
              </div>
              <div className="flex items-center gap-1 mt-1 bg-[#000080] text-white px-1">
                <FileIcon size={14} />
                <span>diagnostic.sc</span>
              </div>
            </div>
          </div>

          {/* Center Pane: Editor */}
          <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex flex-col relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isBuilding}
              spellCheck={false}
              className="flex-1 w-full h-full p-2 resize-none outline-none font-mono text-[12px] leading-relaxed whitespace-pre bg-transparent z-10 disabled:bg-gray-100"
              style={{ color: 'transparent', caretColor: 'black' }}
            />
            {/* Fake Syntax Highlighting Overlay */}
            <div 
              className="absolute inset-0 p-2 font-mono text-[12px] leading-relaxed whitespace-pre pointer-events-none overflow-hidden"
              aria-hidden="true"
            >
              {code.split('\n').map((line, i) => {
                if (line.trim().startsWith('//')) {
                  return <div key={i} className="text-green-700">{line}</div>;
                }
                if (line.trim().startsWith('#include')) {
                  return <div key={i} className="text-blue-700">{line}</div>;
                }
                // Basic keyword highlighting
                const highlighted = line
                  .replace(/\b(int|float|while|return|node_ptr)\b/g, '<span class="text-blue-700 font-bold">$1</span>')
                  .replace(/\b(GetSensorData|AllocateNeuralBlock|EnableFilter|RouteToBridge|CompileHeuristic|SystemPower)\b/g, '<span class="text-purple-700">$1</span>')
                  .replace(/\b(PORT_MIC|RAW_ANALOG|EMI_DAMPENER)\b/g, '<span class="text-red-700">$1</span>');
                
                return <div key={i} dangerouslySetInnerHTML={{ __html: highlighted || ' ' }} />;
              })}
            </div>
          </div>
        </div>

        {/* Bottom Pane: Compiler Output */}
        <div className="h-40 flex flex-col">
          <div className="flex gap-1">
            {['Build', 'Debug', 'Find in Files', 'Neural Trace'].map(tab => (
              <div 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 border-2 border-b-0 cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800 z-10 relative top-[2px]' 
                    : 'bg-[#d4d4d4] border-t-white border-l-white border-r-gray-800 text-gray-600 mt-[2px]'
                }`}
              >
                {tab}
              </div>
            ))}
          </div>
          <div ref={logsContainerRef} className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 font-mono text-[11px] overflow-y-auto">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className={`
                  ${log.type === 'warning' ? 'text-orange-600 font-bold' : ''}
                  ${log.type === 'error' ? 'text-red-700 font-bold' : ''}
                `}
              >
                {log.text}
              </div>
            ))}
            {isBuilding && <div className="animate-pulse">_</div>}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex gap-1 px-1 py-0.5 border-t-2 border-gray-400 mt-1">
        <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 truncate">Ready</div>
        <div className="w-24 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 text-center">Ln 14, Col 5</div>
        <div className="w-12 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 text-center text-gray-500">REC</div>
        <div className="w-12 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 text-center text-gray-500">COL</div>
        <div className="w-12 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 text-center text-gray-500">OVR</div>
      </div>
    </div>
  );
};
