import React, { useState, useEffect } from 'react';
import { Package, X, ChevronRight, HardDrive, ShieldCheck, CheckCircle2, Terminal } from 'lucide-react';
import { APP_DICTIONARY } from '../utils/appDictionary';

interface GenericSetupWizardProps {
  appId: string;
  appName: string;
  appVersion?: string;
  onComplete: () => void;
  onCancel: () => void;
  vfs: any;
}

export const GenericSetupWizard: React.FC<GenericSetupWizardProps> = ({ 
  appId, 
  appName, 
  appVersion = '1.0.4',
  onComplete, 
  onCancel, 
  vfs 
}) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [installStatus, setInstallStatus] = useState('Initializing system resources...');
  const [launchOnFinish, setLaunchOnFinish] = useState(true);

  const appMeta = APP_DICTIONARY[appId] || APP_DICTIONARY['default'];

  useEffect(() => {
    if (step === 3) {
      let currentProgress = 0;
      const statusMsgs = [
        `Registering ${appName} modules...`,
        `Allocating memory vectors in C:\\PROGRAMS\\${appName.toUpperCase()}`,
        'Unpacking compressed data streams...',
        'Linking DLL dependencies...',
        'Finalizing registry entries...',
        'Creating system shortcuts...'
      ];

      const interval = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress >= 100) {
          currentProgress = 100;
          setProgress(100);
          setInstallStatus('Installation sequence complete.');
          clearInterval(interval);
          setTimeout(() => setStep(4), 500);
        } else {
          setProgress(currentProgress);
          setInstallStatus(statusMsgs[Math.floor((currentProgress / 101) * statusMsgs.length)]);
        }
      }, 400);

      return () => clearInterval(interval);
    }
  }, [step, appName]);

  const handleFinish = () => {
    // Use the official VFS installApp method
    vfs.installApp(
      `${appId}.exe`,
      appName,
      appVersion,
      appId,
      true, // create desktop shortcut
      'app' // icon type
    );

    onComplete();
    if (launchOnFinish) {
      window.dispatchEvent(new CustomEvent('launch-app', { detail: appId }));
    }
  };

  const renderContent = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <div className="flex h-full overflow-hidden">
            <div className="w-1/3 bg-[#000080] shadow-inner border-r border-gray-400 flex flex-col items-center justify-center gap-4 py-4 shrink-0">
               <Package size={64} className="text-white opacity-40 mb-2" />
               <div className="bg-white/10 w-full h-[1px]" />
               <p className="text-[10px] text-white/40 font-mono rotate-90 whitespace-nowrap mt-8 uppercase tracking-widest leading-none translate-y-4">
                 VESPERA CORE %ID_{appId.toUpperCase()}
               </p>
            </div>
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-[#000080] mb-2">Welcome to the {appName} Setup</h2>
              <p className="text-xs leading-relaxed text-black mb-4">
                This utility will guide you through the automated deployment of <strong>{appName}</strong> onto your Vespera OS desktop.
              </p>
              <div className="bg-white p-3 border border-gray-400 shadow-inner mb-4">
                 <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">System Advisory:</p>
                 <p className="text-[11px] leading-relaxed text-black italic">
                   Note: Close all other active terminal sessions before continuing to ensure maximum neural bridge stability.
                 </p>
              </div>
              <div className="mt-auto flex justify-end gap-2 pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-8 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold flex items-center gap-1"
                >Next <ChevronRight size={14} /></button>
                <button onClick={onCancel} className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold">Cancel</button>
              </div>
            </div>
          </div>
        );
      case 1: // EULA
        return (
          <div className="flex flex-col h-full p-6">
            <h2 className="text-lg font-bold text-[#000080] mb-2">End-User License Agreement</h2>
            <div className="flex-1 overflow-y-auto bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 text-[10px] font-mono shadow-inner leading-relaxed">
               <p className="font-bold border-b border-gray-200 pb-1 mb-2">VESPERA SYSTEMS GLOBAL LICENSE v4.0.2</p>
               <p>BY INSTALLING THIS SOFTWARE, YOU AGREE TO THE FOLLOWING TERMS:</p>
               <br/>
               <p>1. USE: THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.</p>
               <p>2. RESTRICTIONS: REVERSE ENGINEERING OF SYSTEM DRIVERS IS STRICTLY PROHIBITED UNDER THE AXIS INNOVATIONS CHARTER.</p>
               <p>3. TERMINATION: THIS LICENSE TERMINATES AUTOMATICALLY IF YOU VIOLATE KERNEL PROTECTION POLICIES.</p>
               <p>4. LIABILITY: VESPERA SYSTEMS IS NOT LIABLE FOR ANY DATA ANALYZER MISMATCHES OR MEMORY VECTOR CORRUPTION.</p>
               <br/>
               <p>DO YOU ACCEPT THESE TERMS?</p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setStep(2)} className="px-8 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold">I Agree</button>
              <button onClick={onCancel} className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold">I Decline</button>
            </div>
          </div>
        );
      case 2: // Location
        return (
          <div className="flex flex-col h-full p-6">
            <h2 className="text-lg font-bold text-[#000080] mb-2">Select Destination Path</h2>
            <p className="text-xs text-black mb-4">Installer will deploy {appName} to the following secure local directory:</p>
            <div className="flex flex-col gap-2 bg-[#dcdcdc] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-4 mb-4">
              <div className="flex items-center gap-3">
                <HardDrive size={32} className="text-gray-700" />
                <div className="bg-white border border-gray-400 p-1 flex-1 font-mono text-[11px] text-gray-800">
                  C:\PROGRAMS\{appName.toUpperCase().replace(/\s/g, '_')}
                </div>
              </div>
              <p className="text-[10px] text-gray-500 italic">Space required: {Math.floor(Math.random() * 10) + 1}.2 MB</p>
            </div>
            <div className="mt-auto flex justify-end gap-2 pt-4">
              <button onClick={() => setStep(3)} className="px-10 py-1.5 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 text-sm font-bold uppercase tracking-wider">Install</button>
              <button onClick={onCancel} className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold">Cancel</button>
            </div>
          </div>
        );
      case 3: // Installing
        return (
          <div className="flex flex-col h-full p-6 justify-center">
            <h2 className="text-lg font-bold text-[#000080] mb-1">Installing {appName}...</h2>
            <p className="text-[10px] text-gray-600 mb-6 uppercase tracking-widest">Deploying system modules</p>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end">
                 <p className="text-[11px] font-mono text-gray-700 h-4 truncate flex-1">{installStatus}</p>
                 <p className="text-[10px] text-gray-500 font-mono ml-2">{Math.floor(progress)}%</p>
              </div>
              <div className="h-6 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white w-full overflow-hidden relative p-[2px] flex gap-[2px]">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-full w-[4.5%] ${i < (progress / 5) ? 'bg-[#000080]' : 'bg-transparent'} transition-colors duration-200`}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 4: // Finish
        return (
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center gap-4 border-b-2 border-gray-300 pb-4 mb-4">
               <div className={`p-3 bg-[#ececec] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-sm`}>
                 {appMeta.customIcon ? (
                   <img src={appMeta.customIcon} alt="icon" className="w-[48px] h-[48px]" style={{ imageRendering: 'pixelated' }} draggable={false} />
                 ) : (
                   appMeta.icon && <appMeta.icon size={48} className={appMeta.color} />
                 )}
               </div>
               <div>
                 <h2 className="text-xl font-bold text-[#000080]">Setup Complete</h2>
                 <p className="text-xs text-black">{appName} was successfully deployed.</p>
               </div>
            </div>
            <div className="flex flex-col gap-4 py-2">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input 
                  type="checkbox" 
                  checked={launchOnFinish} 
                  onChange={(e) => setLaunchOnFinish(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium group-hover:text-blue-800">Launch {appName} now</span>
              </label>
              <div className="bg-blue-50 p-3 border border-blue-200 flex gap-3">
                 <ShieldCheck size={20} className="text-blue-800 shrink-0" />
                 <p className="text-[11px] leading-relaxed text-blue-900">
                   You may now access this application from your Desktop or the System Program Manager. System stability remains optimal.
                 </p>
              </div>
            </div>
            <div className="mt-auto flex justify-end">
              <button 
                onClick={handleFinish} 
                className="px-12 py-2 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 text-sm font-bold uppercase tracking-widest shadow-[2px_2px_0_rgba(0,0,0,0.3)]"
              >Finish</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#ececec] overflow-hidden select-none">
       {renderContent()}
    </div>
  );
};
