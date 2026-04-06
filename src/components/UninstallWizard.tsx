import React, { useState, useEffect } from 'react';
import { Package, Trash2, AlertCircle } from 'lucide-react';

interface UninstallWizardProps {
  appId: string;
  appName: string;
  vfs: any;
  onComplete: () => void;
  onCancel: () => void;
}

export const UninstallWizard: React.FC<UninstallWizardProps> = ({ appId, appName, vfs, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing uninstaller...');

  useEffect(() => {
    if (step === 1) {
      const duration = 8000; // 8 seconds
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(100, (elapsed / duration) * 100);
        setProgress(newProgress);

        if (newProgress < 25) {
          setStatusText('Scanning registry entries...');
        } else if (newProgress < 50) {
          setStatusText(`Removing C:\\Programs\\${appId}.exe...`);
        } else if (newProgress < 75) {
          setStatusText('Deleting shortcuts...');
        } else if (newProgress < 100) {
          setStatusText('Cleaning system temporary files...');
        } else {
          setStatusText('Uninstallation complete.');
          setStep(2);
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [step, appId]);

  const handleFinish = () => {
    vfs.uninstallApp(appId);
    onComplete();
  };

  return (
    <div className="flex h-full bg-[#c0c0c0] font-sans text-black overflow-hidden select-none">
      {/* Sidebar */}
      <div className="w-36 bg-[#808080] p-4 flex flex-col items-center gap-4 border-r-2 border-white shadow-inner">
        <div className="w-16 h-16 bg-[#c0c0c0] border-2 border-b-white border-r-white border-t-gray-700 border-l-gray-700 flex items-center justify-center">
          <Trash2 size={40} className="text-gray-700" />
        </div>
        <div className="text-white text-xs font-bold text-center leading-tight uppercase tracking-widest opacity-80 mt-2">
          Vespera<br/>Control<br/>De-Install
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col">
        {step === 0 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold">Uninstall {appName}</h2>
            <p className="text-xs leading-relaxed">
              This wizard will remove <b>{appName}</b> and all of its components from your computer.
            </p>
            <p className="text-xs leading-relaxed mt-2">
              Before continuing, please ensure the application is not currently running.
            </p>
            <div className="mt-auto flex justify-end gap-2">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-1 text-sm font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
              >
                Next &gt;
              </button>
              <button 
                onClick={onCancel}
                className="px-6 py-1 text-sm font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold">Removing Components</h2>
            <p className="text-xs">Please wait while the system removes {appName}.</p>
            
            <div className="mt-4">
              <p className="text-[10px] font-bold mb-1 uppercase tracking-tight text-gray-700">{statusText}</p>
              <div className="w-full h-5 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-0.5">
                <div 
                  className="h-full bg-[#000080]" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-auto flex justify-end gap-2 opacity-50 pointer-events-none">
              <button className="px-6 py-1 text-sm font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800">
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-lg font-bold">Uninstallation Complete</h2>
            <div className="flex items-center gap-3 p-3 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white">
              <AlertCircle className="text-blue-700" size={24} />
              <p className="text-xs font-bold">{appName} has been successfully removed from your system.</p>
            </div>
            <p className="text-xs leading-relaxed">
              Some configuration files may remain in your temporary folder. You may delete them manually or they will be purged on the next system reboot.
            </p>
            <div className="mt-auto flex justify-end">
              <button 
                onClick={handleFinish}
                className="px-6 py-1 text-sm font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
