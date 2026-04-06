import React, { useState, useEffect } from 'react';
import { Mail, Globe, CheckCircle2, ShieldCheck, ArrowRight, Server } from 'lucide-react';

interface VMailSetupProps {
  vfs: any;
  onComplete: () => void;
  onCancel: () => void;
}

export const VMailSetup: React.FC<VMailSetupProps> = ({ vfs, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step === 2) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(3), 500);
            return 100;
          }
          return p + Math.random() * 8;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleInstall = () => {
    // Install to Virtual File System
    vfs.installApp(
      'VMAIL.EXE',
      'VMail Client',
      '1.0',
      'vmail', // appId
      true,    // desktop shortcut
      'app'    // shortcut icon type
    );
    onComplete();
  };

  return (
    <div className="flex flex-col h-full bg-[#002244] text-white font-sans overflow-hidden border-4 border-double border-[#ffcc00]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#001122] to-[#003366] border-b-2 border-[#ffcc00]">
        <div className="flex items-center gap-4">
          <Mail size={40} className="text-[#ffcc00]" />
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-[#ffcc00] drop-shadow-md">VesperaNET Mail</h1>
            <p className="text-sm text-blue-200">Enterprise Communications Client</p>
          </div>
        </div>
        <Globe size={48} className="text-blue-900 opacity-50" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzAwMzM2NiIvPjwvc3ZnPg==')] opacity-20 pointer-events-none" />
        
        {step === 0 && (
          <div className="flex flex-col h-full animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-xl font-bold text-white mb-4">Welcome to the VMail Installation Wizard</h2>
            <p className="text-blue-100 mb-4 leading-relaxed text-sm">
              This wizard will install the official VesperaNET Mail Client onto your local drive. VMail provides secure, encrypted access to your global message inbox.
            </p>
            <div className="bg-[#001122] border border-[#003366] p-4 flex flex-col gap-2 mt-auto">
              <div className="flex items-center gap-3 text-sm text-blue-200"><Server size={16} className="text-[#ffcc00]"/> Destination: C:\PROGRAMS\VMAIL.EXE</div>
              <div className="flex items-center gap-3 text-sm text-blue-200"><ShieldCheck size={16} className="text-[#ffcc00]"/> Requires Active VStore Member ID</div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 border-t border-[#003366] pt-4">
              <button onClick={onCancel} className="px-6 py-1.5 bg-gray-300 text-black font-bold border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white hover:bg-white text-sm">Cancel</button>
              <button onClick={() => setStep(1)} className="px-6 py-1.5 bg-[#ffcc00] text-black font-bold border-2 border-t-[#fff0aa] border-l-[#fff0aa] border-b-[#b38f00] border-r-[#b38f00] active:border-t-[#b38f00] active:border-l-[#b38f00] active:border-b-[#fff0aa] active:border-r-[#fff0aa] flex items-center gap-2 text-sm shadow-[0_0_10px_rgba(255,204,0,0.5)]">Next <ArrowRight size={14} /></button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col h-full animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-xl font-bold text-white mb-2">License Agreement</h2>
            <p className="text-[#ffcc00] text-xs font-bold mb-4 uppercase tracking-wider">Please read carefully</p>
            
            <textarea 
              readOnly 
              className="flex-1 bg-white text-black text-xs font-mono p-3 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white resize-none"
              defaultValue={`VesperaNET Mail Client EULA

1. USE OF SOFTWARE
You may only access the VesperaNET servers using authorized VStore Member credentials. Vespera Systems reserves the right to monitor incoming and outgoing packet flow to prevent the distribution of unauthorized binaries.

2. PRIVACY
Vespera Systems does not read your private mail. However, the X-Type neural filtering subroutines embedded within VMail may automatically scan texts for optimal cataloging purposes.

3. LIABILITY
Vespera Systems is not liable for data loss during high-latency dial-up transfers.`} 
            />
            
            <div className="flex justify-end gap-3 mt-6 border-t border-[#003366] pt-4">
              <button onClick={onCancel} className="px-6 py-1.5 bg-gray-300 text-black font-bold border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white hover:bg-white text-sm">I Decline</button>
              <button onClick={() => setStep(2)} className="px-6 py-1.5 bg-[#ffcc00] text-black font-bold border-2 border-t-[#fff0aa] border-l-[#fff0aa] border-b-[#b38f00] border-r-[#b38f00] active:border-t-[#b38f00] active:border-l-[#b38f00] active:border-b-[#fff0aa] active:border-r-[#fff0aa] hover:brightness-110 text-sm">I Agree</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col h-full items-center justify-center animate-[fadeIn_0.5s_ease-out]">
            <Mail size={48} className="text-[#ffcc00] mb-6 animate-pulse" />
            <h2 className="text-xl font-bold text-white mb-2">Installing Components</h2>
            <p className="text-blue-200 text-sm mb-8">Please wait while VMail is configured...</p>
            
            <div className="w-full max-w-sm bg-[#001122] border-2 border-[#003366] h-6 p-0.5 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-[#b38f00] to-[#ffcc00] transition-all duration-150 ease-linear shadow-[0_0_8px_rgba(255,204,0,0.8)]"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <p className="text-[#ffcc00] text-xs font-mono mt-3">
              {progress < 30 ? 'Extracting VMAIL.EXE...' : progress < 70 ? 'Registering encryption certificates...' : 'Creating Desktop Shortcut...'}
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col h-full items-center justify-center animate-[fadeIn_0.5s_ease-out]">
            <CheckCircle2 size={64} className="text-[#ffcc00] drop-shadow-[0_0_15px_rgba(255,204,0,0.6)] mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Installation Complete</h2>
            <p className="text-center text-blue-200 text-sm max-w-xs mt-2 leading-relaxed">
              VMail has been successfully installed to your system. You can now launch it from the Desktop or Start Menu.
            </p>
            
            <div className="mt-10">
              <button onClick={handleInstall} className="px-10 py-2.5 bg-[#ffcc00] text-black font-bold border-2 border-t-[#fff0aa] border-l-[#fff0aa] border-b-[#b38f00] border-r-[#b38f00] active:border-t-[#b38f00] active:border-l-[#b38f00] active:border-b-[#fff0aa] active:border-r-[#fff0aa] shadow-[0_0_15px_rgba(255,204,0,0.4)] hover:brightness-110">
                Finish & Exit
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
