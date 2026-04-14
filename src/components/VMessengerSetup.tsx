import React, { useState, useEffect, useRef } from 'react';
import { Download, CheckCircle2, MessageSquare } from 'lucide-react';
import { startVStoreInstallWizardMusic, stopVStoreInstallWizardMusic } from '../utils/audio';

interface VMessengerSetupProps {
  vfs: any;
  onComplete: () => void;
  onCancel: () => void;
}

const INSTALL_FILES = [
  "VAIM_CORE.EXE", "chat_ai.dll", "net_tunnel.vxd", "emily_ai.dll", "elias_enc.dll",
  "readme.txt", "license.rtf", "sounds/door_open.wav", "sounds/door_close.wav", "sounds/new_im.wav",
  "buddy_list.db", "history_log.dat", "protocol_8.sys", "neural_bridge.vxd", "ui_skin_98.dll"
];

const INSTALL_MESSAGES = [
  "Initializing Setup...",
  "Authenticating with VesperaNET...",
  "Extracting messenger templates...",
  "Establishing Protocol 8 bindings...",
  "Loading neural chat bot AI...",
  "Writing database schemas...",
  "Updating system registry...",
  "Registering audio codecs...",
  "Creating desktop shortcuts..."
];

export const VMessengerSetup: React.FC<VMessengerSetupProps> = ({ vfs, onComplete, onCancel }) => {
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
      'VAIM.EXE',
      'Vespera Messenger',
      '1.0 Beta',
      'v_messenger',
      true,     // place shortcut
      'message-square',  // custom icon type/name
    );

    if (launchNow) {
      window.dispatchEvent(new CustomEvent('launch-app', { detail: 'v_messenger' }));
    }

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
    if (step === 3) {
      const totalDuration = 15000;
      const updateInterval = 150;
      const totalSteps = totalDuration / updateInterval;
      let currentStep = 0;
      let isLagging = false;
      let lagCounter = 0;

      const interval = setInterval(() => {
        if (isLagging) {
          lagCounter--;
          if (lagCounter <= 0) {
            isLagging = false;
          } else {
            return;
          }
        } else if (Math.random() > 0.95) {
          isLagging = true;
          lagCounter = Math.floor(Math.random() * 15) + 5;
        }

        currentStep++;
        const newProgress = (currentStep / totalSteps) * 100;
        
        setProgress(newProgress);

        if (Math.random() > 0.4) {
          const file = INSTALL_FILES[Math.floor(Math.random() * INSTALL_FILES.length)];
          setCurrentFile(file);
          setInstallLogs(prev => {
            const newLogs = [...prev, `Extracting: C:\\VESPERA\\PROGRAMS\\MESSENGER\\${file}`];
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
          setInstallLogs(prev => [...prev, "Registering TCP/IP sockets...", "Installation successful."]);
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
        <div className="w-1/3 bg-[#000080] flex flex-col items-center justify-between p-4 text-white shrink-0 shadow-[inset_-2px_0_0_rgba(0,0,0,0.3)]">
          <div className="flex flex-col items-center mt-8">
            <MessageSquare size={64} className="mb-4 text-yellow-400" />
            <h2 className="text-xl font-bold text-center tracking-wide drop-shadow-md leading-tight">Vespera<br/>Messenger</h2>
            <p className="text-xs text-blue-200 mt-2 font-bold bg-[#000040] px-2 py-1 shadow-inner">Setup Wizard</p>
          </div>
          
          <div className="mb-4 flex flex-col items-center bg-[#000040] p-3 border border-blue-900 shadow-inner w-full">
            <div className="text-white font-bold text-lg tracking-widest uppercase">
              vAIM
            </div>
            <p className="text-[9px] text-blue-300 mt-1 text-center font-mono leading-tight">
              Beta 1.0<br/>Vespera Systems<br/>AETHERIS Network
            </p>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-6 flex flex-col overflow-y-auto">
          {step === 0 && (
            <>
              <h3 className="font-bold text-lg mb-4 text-[#000080]">Welcome to vAIM Setup</h3>
              <p className="mb-4">This wizard will guide you through the installation of Vespera Messenger (vAIM) Beta 1.0.</p>
              <p className="mb-4">Chat with your friends and explore our experimental neural-learning A.I. chat bots.</p>
              <p className="mb-4">It is recommended that you close all other network applications before starting Setup to prevent Winsock errors.</p>
              <p className="mt-auto">Click Next to continue.</p>
            </>
          )}

          {step === 1 && (
            <div className="flex flex-col h-full">
              <h3 className="font-bold text-lg mb-2 text-[#000080]">License Agreement</h3>
              <p className="mb-2 text-xs">Please read the following License Agreement carefully. You must accept the terms of this agreement before continuing.</p>
              <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 overflow-y-auto text-xs font-mono mb-4 text-gray-800">
                VESPERA SYSTEMS NETWORK AGREEMENT
                <br/><br/>
                IMPORTANT: By installing this software, you agree that your chat interactions may be logged and submitted to the AETHERIS neural bridge for experimental intelligence training.
                <br/><br/>
                1. DO NOT IGNORE PROTOCOL 8. If you encounter entities claiming to be Elias Thorne, disconnect immediately.
                <br/>
                2. NO WARRANTY. The VesperaNET messenger is provided "AS IS". Vespera Systems is not liable for data corruption or unauthorized shadow sector access.
                <br/><br/>
                Vespera Systems Corp.
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
              <p className="mb-4">Setup will install Vespera Messenger in the following folder.</p>
              <div className="mb-4">
                <label className="block text-xs mb-1 font-bold">Destination Folder</label>
                <div className="flex gap-2">
                  <input type="text" value="C:\VESPERA\PROGRAMS\MESSENGER" readOnly className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 bg-white outline-none font-mono text-xs" />
                  <button className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-4 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Browse...</button>
                </div>
              </div>
              <div className="text-xs space-y-1">
                <p>Space required: 850 KB</p>
                <p>Space available: 1.2 GB</p>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col h-full">
              <h3 className="font-bold text-lg mb-2 text-[#000080]">Installing</h3>
              <p className="mb-2">Please wait while Vespera Messenger is being installed.</p>
              
              <div className="mb-1 text-xs font-bold truncate">
                {currentMessage || "Extracting files... "}
              </div>
              
              <div className="mb-2 text-xs truncate text-gray-700 font-mono">
                {currentFile}
              </div>

              <div className="w-full h-6 bg-[#c0c0c0] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-0.5 flex mb-2 shrink-0">
                <div 
                  className="h-full bg-[#000080]" 
                  style={{ width: `${progress}%` }}
                />
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
              <p className="mb-4">Vespera Messenger has been successfully installed on your computer.</p>
              <div className="flex items-center gap-2 mt-2 bg-blue-100 p-2 border border-blue-400">
                <CheckCircle2 size={16} className="text-blue-800 shrink-0" />
                <span className="text-xs font-bold text-gray-800">Shortcut placed on Desktop. Ready to connect!</span>
              </div>
              <label className="flex items-center gap-2 mt-auto pt-4 cursor-pointer">
                <input type="checkbox" checked={launchNow} onChange={e => setLaunchNow(e.target.checked)} className="cursor-pointer" />
                <span className="font-bold text-xs">Launch Vespera Messenger now</span>
              </label>
            </>
          )}
        </div>
      </div>

      <div className="border-t-2 border-gray-400 p-4 flex justify-end gap-2 bg-[#c0c0c0] shrink-0 shadow-[inset_0_2px_0_rgba(255,255,255,0.8)]">
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
