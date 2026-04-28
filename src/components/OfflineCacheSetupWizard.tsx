import React, { useState, useEffect } from 'react';
import { CheckCircle2, HardDrive } from 'lucide-react';

interface OfflineCacheSetupWizardProps {
  vfs: any;
  onComplete: () => void;
  onCancel: () => void;
}

export const OfflineCacheSetupWizard: React.FC<OfflineCacheSetupWizardProps> = ({ vfs, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFakeCaching, setIsFakeCaching] = useState(false);

  useEffect(() => {
    if (step === 2) {
      setIsFakeCaching(true);
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsFakeCaching(false);
              setStep(3);
            }, 500);
            return 100;
          }
          return p + Math.random() * 15 + 5;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-sm shadow-[0_0_20px_rgba(51,255,51,0.2)]">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-1/3 flex flex-col items-center justify-center p-4 text-white shrink-0" style={{ backgroundColor: '#002200' }}>
          <HardDrive size={72} className="text-[#33ff33]" />
          <h2 className="text-xl font-bold text-center mt-3 text-[#33ff33]">Offline<br/>Cache</h2>
          <p className="text-[10px] mt-2 opacity-70 text-center text-[#88ff88]">Agent v1.2</p>
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-6 flex flex-col overflow-y-auto bg-[#001100] text-[#33ff33] font-mono border-l-2 border-l-[#33ff33]">
          {step === 0 && (
            <>
              <h3 className="font-bold text-lg mb-4">Welcome to the Offline Caching Utility Setup</h3>
              <p className="mb-4 text-xs text-white">This program will install a background service that periodically pulls the latest HTML, CSS, and forum threads from the V-Script Archive to your local drive.</p>
              <p className="mb-4 text-[10px] text-[#aaaaaa]">This ensures you have access even during Axis Innovations DDoS attacks. The utility will run silently in the background.</p>
              <p className="text-xs text-[#88ff88] mt-auto">Click Next to continue.</p>
            </>
          )}

          {step === 1 && (
            <>
              <h3 className="font-bold text-lg mb-4">Select Installation Directory</h3>
              <p className="mb-2 text-xs text-white">Setup will install the Offline Cache Agent in the following folder.</p>
              <div className="bg-black border border-[#114411] p-2 mb-4 text-[10px] text-gray-400">
                C:\VESPERA\SYSTEM\ARCHIVE_CACHE\
              </div>
              <div className="flex items-start gap-2 mb-4">
                <input type="checkbox" defaultChecked className="mt-1" />
                <p className="text-[10px] text-[#aaaaaa]">Install stealth service to bypass V-Shield port scanning.</p>
              </div>
              <p className="text-xs text-[#88ff88] mt-auto">Click Install to continue.</p>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col h-full justify-center">
              <h3 className="font-bold text-lg mb-4">Installing...</h3>
              <p className="text-[10px] text-[#aaaaaa] mb-2">Injecting rootkit caching modules...</p>
              <div className="w-full bg-black border border-[#114411] h-6 mb-2 p-[2px] overflow-hidden flex">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full w-[4.5%] mx-[0.25%] ${i < (progress / 5) ? 'bg-[#33ff33]' : 'bg-transparent'}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-right">{Math.round(progress)}%</p>
            </div>
          )}

          {step === 3 && (
            <>
              <h3 className="font-bold text-lg mb-4">Installation Complete</h3>
              <div className="flex items-center gap-2 mb-4 text-white">
                <CheckCircle2 size={20} className="text-[#33ff33]" />
                <span className="font-bold text-sm">Offline Cache Agent installed.</span>
              </div>
              <p className="mb-4 text-xs text-[#aaaaaa]">The Offline Caching Utility is now running silently in the background. The Archive will remain accessible even if our primary nodes fall.</p>
              <p className="text-xs text-[#88ff88] mt-auto">Click Finish to exit setup.</p>
            </>
          )}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="border-t-2 border-t-[#33ff33] p-4 flex justify-end gap-2 shrink-0" style={{ backgroundColor: '#002200' }}>
        {step < 3 && (
          <button
            onClick={onCancel}
            disabled={step === 2}
            className="border border-[#114411] text-[#aaaaaa] px-6 py-1 text-xs hover:bg-[#112211] disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        {step > 0 && step < 2 && (
          <button
            onClick={() => setStep(step - 1)}
            className="border border-[#114411] text-[#aaaaaa] px-6 py-1 text-xs hover:bg-[#112211]"
          >
            &lt; Back
          </button>
        )}
        {step === 0 && (
          <button
            onClick={() => setStep(1)}
            className="border border-[#33ff33] text-[#33ff33] px-6 py-1 text-xs hover:bg-[#33ff33] hover:text-black font-bold"
          >
            Next &gt;
          </button>
        )}
        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            className="border border-[#33ff33] text-[#33ff33] px-6 py-1 text-xs hover:bg-[#33ff33] hover:text-black font-bold bg-[#004400]"
          >
            Install
          </button>
        )}
        {step === 3 && (
          <button
            onClick={() => onComplete()}
            className="border border-[#33ff33] text-[#33ff33] px-6 py-1 text-xs hover:bg-[#33ff33] hover:text-black font-bold bg-[#004400]"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};
