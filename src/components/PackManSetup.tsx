import React, { useState, useEffect, useRef } from 'react';
import { Download, CheckCircle2, Ghost } from 'lucide-react';
import { startVStoreInstallWizardMusic, stopVStoreInstallWizardMusic } from '../utils/audio';

interface PackManSetupProps {
  vfs: any;
  onComplete: () => void;
  onCancel: () => void;
}

const INSTALL_FILES = [
  "PM_CORE.EXE", "PM_GFX.DLL", "PM_SND.DLL", "maze_gen.vxd", "ghost_ai.dll",
  "readme.txt", "license.rtf", "pellets.dat", "power_pill.sys", "high_scores.db",
  "waka_waka.wav", "game_over.wav", "level_1.map", "level_2.map", "input_hook.vxd",
  "namco_stub.rom", "arcade_sys.vxd", "crt_filter.dll"
];

const INSTALL_MESSAGES = [
  "Initializing Setup...",
  "Verifying Namco License...",
  "Extracting sprites...",
  "Loading retro assets...",
  "Decompressing AI patterns...",
  "Writing maps to disk...",
  "Updating system registry...",
  "Registering audio codecs...",
  "Creating desktop shortcuts..."
];

export const PackManSetup: React.FC<PackManSetupProps> = ({ vfs, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [launchNow, setLaunchNow] = useState(true);
  const [acceptedTos, setAcceptedTos] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const handleFinish = () => {
    // Perform actual VFS installation
    vfs.installApp(
      'PACMAN.EXE',
      'Pac-Man (Namco)',
      '1.0.0',
      'packman',
      true,     // place shortcut
      'ghost',  // custom icon type/name
    );

    onComplete();
  };

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [installLogs]);

  useEffect(() => {
    if (step !== 3) {
      stopVStoreInstallWizardMusic();
    }
  }, [step]);

  useEffect(() => {
    if (step === 3) { // Now step 3 is installing
      const totalDuration = 18000; // Increased to 18 seconds for fake lag
      const updateInterval = 150; // Update every 150ms
      const totalSteps = totalDuration / updateInterval;
      let currentStep = 0;
      let isLagging = false;
      let lagCounter = 0;

      const interval = setInterval(() => {
        // Fake lag logic
        if (isLagging) {
          lagCounter--;
          if (lagCounter <= 0) {
            isLagging = false; // end lag
          } else {
            return; // skip progress
          }
        } else if (Math.random() > 0.95) {
          isLagging = true;
          lagCounter = Math.floor(Math.random() * 15) + 5; // lag for 0.75 - 3 seconds
        }

        currentStep++;
        const newProgress = (currentStep / totalSteps) * 100;
        
        setProgress(newProgress);

        if (Math.random() > 0.4) {
          const file = INSTALL_FILES[Math.floor(Math.random() * INSTALL_FILES.length)];
          setCurrentFile(file);
          setInstallLogs(prev => {
            const newLogs = [...prev, `Extracting: C:\\VESPERA\\PROGRAMS\\PACMAN\\${file}`];
            return newLogs.slice(-25);
          });
        }

        if (Math.random() > 0.90) {
          setCurrentMessage(INSTALL_MESSAGES[Math.floor(Math.random() * INSTALL_MESSAGES.length)]);
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setCurrentFile("Done.");
          setCurrentMessage("Installation complete.");
          setInstallLogs(prev => [...prev, "Registering Namco components...", "Installation successful."]);
          setTimeout(() => setStep(4), 800);
        }
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-sm">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-black flex flex-col items-center justify-between p-4 text-white shrink-0 border-r-2 border-gray-400 shadow-[inset_-2px_0_0_rgba(0,0,0,0.1)]">
          <div className="flex flex-col items-center mt-8">
            <Ghost size={64} className="mb-4 text-red-600 animate-bounce" />
            <h2 className="text-xl font-bold text-center tracking-widest uppercase text-yellow-400 drop-shadow-[2px_2px_0_rgba(255,0,0,0.8)]">Pac-Man</h2>
            <p className="text-xs text-gray-400 mt-2">Setup Wizard</p>
          </div>
          
          <div className="mb-4 flex flex-col items-center">
            {/* Namco Logo ASCII/Retro style */}
            <div className="text-red-600 font-extrabold text-2xl tracking-tighter italic">
              NAMCO
            </div>
            <p className="text-[9px] text-gray-500 mt-1 text-center font-mono">
              © 1980, 1996<br/>Namco Ltd.<br/>All Rights Reserved.
            </p>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-6 flex flex-col overflow-y-auto">
          {step === 0 && (
            <>
              <h3 className="font-bold text-lg mb-4 text-[#000080]">Welcome to Pac-Man Setup</h3>
              <p className="mb-4">This wizard will guide you through the installation of the official Pac-Man arcade port (v1.0.0).</p>
              <p className="mb-4">Licensed by Namco Ltd. optimized for the Vespera OS graphical subsystem.</p>
              <p className="mb-4">It is recommended that you close all other applications before starting Setup. This will make it possible to update relevant audio/video drivers without rebooting.</p>
              <p>Click Next to continue.</p>
            </>
          )}

          {step === 1 && (
            <div className="flex flex-col h-full">
              <h3 className="font-bold text-lg mb-2 text-[#000080]">License Agreement</h3>
              <p className="mb-2 text-xs">Please read the following License Agreement carefully. You must accept the terms of this agreement before continuing.</p>
              <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 overflow-y-auto text-xs font-mono mb-4 text-gray-800">
                NAMCO END USER LICENSE AGREEMENT
                <br/><br/>
                IMPORTANT - READ CAREFULLY: This End User License Agreement ("EULA") is a legal agreement between you and Namco Ltd. for the Pac-Man software product identified above.
                <br/><br/>
                1. GRANT OF LICENSE. Namco grants you the non-exclusive right to use this software on your Vespera OS terminal.
                <br/>
                2. COPYRIGHT. All title and copyrights in and to the SOFTWARE PRODUCT are owned by Namco.
                <br/>
                3. DISCLAIMER OF WARRANTY. THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.
                <br/><br/>
                Namco Ltd.<br/>Tokyo, Japan 1980, 1996.
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tos" checked={acceptedTos} onChange={() => setAcceptedTos(true)} />
                  <span>I accept the agreement</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tos" checked={!acceptedTos} onChange={() => setAcceptedTos(false)} />
                  <span>I do not accept the agreement</span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <h3 className="font-bold text-lg mb-4 text-[#000080]">Choose Install Location</h3>
              <p className="mb-4">Setup will install Pac-Man in the following folder.</p>
              <div className="mb-4">
                <label className="block text-xs mb-1 font-bold">Destination Folder</label>
                <div className="flex gap-2">
                  <input type="text" value="C:\VESPERA\PROGRAMS\PACMAN" readOnly className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 bg-white outline-none font-mono text-xs" />
                  <button className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-4 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Browse...</button>
                </div>
              </div>
              <div className="text-xs space-y-1">
                <p>Space required: 1.2 MB</p>
                <p>Space available: 1.2 GB</p>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col h-full">
              <h3 className="font-bold text-lg mb-2 text-[#000080]">Installing</h3>
              <p className="mb-2">Please wait while Pac-Man (Namco) is being installed.</p>
              
              <div className="mb-1 text-xs font-bold truncate">
                {currentMessage || "Extracting files... "}
              </div>
              
              <div className="mb-2 text-xs truncate text-gray-700 font-mono">
                {currentFile}
              </div>

              <div className="w-full h-6 bg-[#c0c0c0] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-[2px] flex mb-2 shrink-0">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-full w-[4.5%] mx-[0.25%] ${i < (progress / 5) ? 'bg-[#000080]' : 'bg-transparent'}`}
                  />
                ))}
              </div>

              <div ref={logsContainerRef} className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 overflow-y-auto text-[10px] font-mono leading-tight">
                {installLogs.map((log, i) => (
                  <div key={i} className="truncate text-blue-900">{log}</div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <>
              <h3 className="font-bold text-lg mb-4 text-[#000080]">Installation Complete</h3>
              <p className="mb-4">Pac-Man has been successfully installed on your computer.</p>
              <div className="flex items-center gap-2 mt-2 bg-yellow-100 p-2 border border-yellow-400">
                <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                <span className="text-xs font-bold text-gray-800">Shortcut placed on Desktop. Ready to play!</span>
              </div>
              <label className="flex items-center gap-2 mt-auto pt-4 cursor-pointer">
                <input type="checkbox" checked={launchNow} onChange={e => setLaunchNow(e.target.checked)} className="cursor-pointer" />
                <span className="font-bold">Launch Pac-Man now</span>
              </label>
            </>
          )}
        </div>
      </div>

      <div className="border-t-2 border-gray-400 p-4 flex justify-end gap-2 bg-[#c0c0c0] shrink-0">
        {step < 4 && (
          <button 
            onClick={onCancel}
            disabled={step === 3}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        {step > 0 && step < 4 && (
          <button 
            onClick={() => setStep(step - 1)}
            disabled={step === 3}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50"
          >
            &lt; Back
          </button>
        )}
        {step < 3 && (
          <button 
            onClick={() => {
              const next = step + 1;
              if (next === 3) startVStoreInstallWizardMusic();
              setStep(next);
            }}
            disabled={step === 1 && !acceptedTos}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold disabled:opacity-50 disabled:font-normal"
          >
            Next &gt;
          </button>
        )}
        {step === 4 && (
          <button 
            onClick={handleFinish}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};
