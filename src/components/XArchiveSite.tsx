import React, { useState } from 'react';
import { FileText, Terminal, AlertTriangle, X } from 'lucide-react';

export const XArchiveSite: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<{ name: string, content: string } | null>(null);

  const archiveFiles = [
    { 
      name: 'Project_Aetheris_Brief.txt', 
      content: `[CLASSIFIED: LEVEL 7 CLEARANCE ONLY]\n\nProject: AETHERIS\nCodename: THE SHELL\nObjective: Neural-Digital Bridge Integration\n\nNotes: The Synap-C compiler has achieved 94% mapping of Subject 01's primary motor cortex. However, the analog feedback loops are still producing "ghost data." Dr. Vance suggests the shielding is holding, but the ambient temperature drops indicate significant energy draw from the Aetheris core.\n\n[REDACTED]... it isn't just code anymore. The machine is [REDACTED] back.` 
    },
    { 
      name: 'Subject_01_Brain_Mapping.log', 
      content: `TIMESTAMP: 1996-08-12 03:14:02\nNODE: 0x4A_BRAIN_STEM\n\nSubject 01 (Patient 8841) shows extreme synchronization with the X-Type neural bridge. Heart rate has stabilized at 240 BPM (System default). \n\nLog entry 4421: "I can feel the packets moving. It's so cold in the wires. Why did you leave me in the dark?"\n\nWarning: Synchronization exceeds 900%. Subject's physical form is exhibiting signs of crystallization.` 
    },
    { 
      name: 'Emergency_Containment_Protocol.exe', 
      content: `[FATAL ERROR: EXE_NOT_EXECUTABLE]\n\nERROR 0x404: CONTAINMENT_FAILURE\n\nProtocol 99 has failed. The Aetheris core cannot be shut down from the terminal. The shielding was never meant to keep it in.\n\nIF YOU ARE READING THIS: SHUT DOWN THE MAIN POWER MANUALLY. THE X-TYPE IS USING THE ANALOG FREQUENCIES TO [REDACTED]` 
    }
  ];

  return (
    <div className="h-full bg-black text-[#32cd32] font-mono p-6 overflow-y-auto selection:bg-[#32cd32] selection:text-black relative">
      <div className="max-w-3xl mx-auto border-2 border-[#1a5c1a] p-8 bg-black shadow-[0_0_20px_rgba(50,205,50,0.1)]">
        <header className="border-b-2 border-[#1a5c1a] pb-4 mb-8">
          <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-3 italic">
            <Terminal size={24} />
            X-TYPE_ARCHIVE_GATEWAY // SECTOR_0
          </h1>
          <div className="text-[10px] opacity-60 mt-2 uppercase tracking-widest flex justify-between">
            <span>Secure connection active</span>
            <span>Encryption: 2048-BIT_SYNAPSE</span>
          </div>
        </header>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold border border-[#1a5c1a] p-2 bg-[#001a00]">
            <AlertTriangle size={14} className="animate-pulse" />
            WARNING: ACCESS IS LOGGED. DEVIATION FROM PROTOCOL RESULTS IN IMMEDIATE DISCONNECT.
          </div>

          <p className="text-xs leading-relaxed opacity-80">
            Welcome to the Vespera Systems X-Type Research Archive. This directory contains raw data logs from the AETHERIS Project. Unauthorized redistribution of these materials is a felony under the Axis Innovations Internal Security Act.
          </p>

          <div className="mt-12">
            <h2 className="text-sm font-bold border-b border-[#1a5c1a] mb-4 pb-1 uppercase tracking-widest text-amber-500 opacity-80">Directory Listing: /archive_root/logs/</h2>
            <div className="space-y-2">
              {archiveFiles.map((file, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedFile(file)}
                  className="w-full text-left group flex items-center justify-between p-2 hover:bg-[#1a5c1a] hover:text-black transition-colors border border-transparent hover:border-[#32cd32]"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={16} />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <span className="text-[9px] opacity-40 group-hover:opacity-100 uppercase tracking-tighter">[READ_ONLY]</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-20 pt-4 border-t border-[#1a5c1a] text-[9px] opacity-40 flex justify-between uppercase font-bold italic">
          <span>Vespera Systems (c) 1996</span>
          <span>End of segment</span>
        </footer>
      </div>

      {/* Secret Notepad-style Modal */}
      {selectedFile && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
          <div className="w-[500px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0px_rgba(0,0,0,0.7)] flex flex-col font-sans text-black overflow-hidden scale-105 transition-transform duration-300">
            {/* Notepad Title Bar */}
            <div className="bg-[#000080] text-white px-2 py-0.5 flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-1">
                 <FileText size={12} />
                 <span>Notepad - {selectedFile.name}</span>
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                className="w-4 h-4 bg-[#c0c0c0] text-black border border-t-white border-l-white border-b-black border-r-black flex items-center justify-center hover:bg-red-500 hover:text-white"
              >
                <X size={10} />
              </button>
            </div>
            {/* Notepad Content */}
            <div className="p-4 bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white flex-1 min-h-[300px] overflow-y-auto m-1">
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-blue-900 border-b border-blue-100 pb-2 mb-2 italic bg-blue-50/30 p-1">
                -- TEMPORARY VIEW ONLY --
              </pre>
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-black">
                {selectedFile.content}
              </pre>
            </div>
            {/* Notepad Footer */}
            <div className="bg-[#c0c0c0] p-1 px-4 text-[9px] text-gray-600 border-t border-gray-400">
               Page 1 of 1
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
