import React from 'react';
import { X, RefreshCw, AlertCircle, Terminal } from 'lucide-react';

interface GenericAppPlaceholderProps {
  app: any;
  onClose: () => void;
}

export const GenericAppPlaceholder: React.FC<GenericAppPlaceholderProps> = ({ app, onClose }) => {
  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] font-sans text-black select-none">
      {/* Header */}
      <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center font-bold text-sm h-7 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          {app.icon && <app.icon size={14} className={app.color} />}
          <span className="truncate">{app.name.toUpperCase()} v{app.version}</span>
        </div>
        <button onClick={onClose} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-5 h-5 flex items-center justify-center text-black font-bold text-xs active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">X</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        {/* Banner */}
        <div className="bg-[#000080] p-4 text-white flex items-center gap-4 border-b-2 border-gray-400 shadow-inner shrink-0 leading-tight">
          <div className="p-3 bg-white/10 rounded-sm">
            {app.icon && <app.icon size={48} className={app.color} />}
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase">{app.name}</h1>
            <p className="text-[10px] opacity-70 font-mono tracking-widest">{app.developer.toUpperCase()} // LICENSED_COMODO_ID_42</p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex gap-4 h-full overflow-hidden">
           {/* Left Column */}
           <div className="flex-1 flex flex-col gap-3 min-w-0">
             <div className="bg-white p-3 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-inner flex-1 overflow-y-auto">
               <div className="flex items-start gap-2 mb-4">
                 <AlertCircle size={20} className="text-[#000080] shrink-0" />
                 <div>
                   <p className="font-bold text-[#000080] text-sm">Application Telemetry Active</p>
                   <p className="text-xs text-gray-600 mt-1">This module is currently operating in <strong>Reduced Interface Mode</strong>. Full synaptic rendering is pending system approval.</p>
                 </div>
               </div>

               <div className="space-y-3 font-mono text-[10px]">
                 <div className="bg-blue-50 border-l-2 border-[#000080] p-2 text-blue-900 leading-normal">
                   <strong>SESSION_ADDR:</strong> {Math.random().toString(36).substr(2, 8).toUpperCase()}<br/>
                   <strong>SYSTEM_VER:</strong> VESPERA_KERN_4.03<br/>
                   <strong>STATUS:</strong> HYBRID_NEURAL_LINK_PENDING
                 </div>
                 
                 <p className="border-b border-gray-200 pb-1 font-bold text-gray-500">ENGINE_OUTPUT:</p>
                 <div className="text-green-800 opacity-80 leading-tight space-y-1">
                   <p>[OK] Memory vector alignment successful</p>
                   <p>[OK] X-Type shielding confirmed at 94%</p>
                   <p>[WAIT] Requesting peer-to-peer manifest...</p>
                   <p className="animate-pulse">_</p>
                 </div>
               </div>
             </div>
             
             {/* Bottom Options */}
             <div className="flex gap-2">
                <button className="flex-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1.5 text-xs font-bold hover:bg-gray-200 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white text-[#000080] flex items-center justify-center gap-2">
                  <RefreshCw size={14} /> RECONNECT_NODE
                </button>
                <button className="flex-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1.5 text-xs font-bold hover:bg-gray-200 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white flex items-center justify-center gap-2">
                  <Terminal size={14} /> DIAG_SHELL
                </button>
             </div>
           </div>

           {/* Right Column / Sidebar */}
           <div className="w-40 flex flex-col gap-3 shrink-0">
              <div className="bg-[#dcdcdc] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-2 shadow-sm">
                <h3 className="text-[10px] font-bold text-gray-600 border-b border-gray-400 mb-1">SYSTEM_INFO</h3>
                <div className="text-[9px] font-mono text-gray-800 space-y-1">
                   <p>PID: {Math.floor(Math.random() * 9000) + 1000}</p>
                   <p>MEM: {Math.floor(Math.random() * 400) + 50} KB</p>
                   <p>FREQ: 33.6 MHz</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-300 p-2 shadow-sm flex flex-col gap-2">
                 <div className="flex items-center gap-1">
                    <AlertCircle size={10} className="text-amber-600" />
                    <span className="text-[9px] font-bold text-amber-700 uppercase">Warning</span>
                 </div>
                 <p className="text-[8px] text-amber-800 leading-tight">
                   Unrestricted neural bridge polling is currently disabled. Interactive functions may be limited.
                 </p>
              </div>

              <div className="mt-auto bg-white border border-gray-400 p-2">
                 <p className="text-[9px] text-center text-gray-400 font-mono italic">Built for Axis V-OS</p>
              </div>
           </div>
        </div>
      </div>

      {/* Footer / Taskbar Sim */}
      <div className="bg-[#c0c0c0] border-t-2 border-white p-1 h-6 flex justify-end gap-2 px-4 shrink-0">
         <span className="text-[9px] text-gray-500 font-bold tracking-widest self-center uppercase italic">READY_STATE_STABLE</span>
      </div>
    </div>
  );
};
