import React, { useState, useEffect, useRef } from 'react';
import { HardDrive, CheckCircle2 } from 'lucide-react';

interface SetupWizardProps {
  vfs: any;
  onComplete: () => void;
  onCancel: () => void;
}

const INSTALL_FILES = [
  "netmon.exe", "aetheris_core.dll", "sys_hook.vxd", "analog_freq.h", "netmon.ini",
  "readme.txt", "license.rtf", "vespera_ui.dll", "tcp_stack.sys", "ip_route.dll",
  "icmp_ping.exe", "traceroute.exe", "dns_resolve.dll", "arp_cache.sys", "mac_spoof.vxd",
  "packet_sniffer.dll", "promiscuous_mode.sys", "hex_dump.dll", "payload_decoder.exe",
  "emi_filter_bypass.vxd", "neural_bridge_api.dll", "ghost_in_the_machine.sys",
  "synap_c_compiler.exe", "heuristic_engine.dll", "fuzzy_logic.vxd", "memory_leak.sys",
  "vlb_bus_driver.dll", "irq_handler.sys", "dma_controller.vxd", "cmos_reader.dll",
  "bios_flash.exe", "boot_sector.sys", "fat32_driver.vxd", "ntfs_driver.dll",
  "registry_editor.exe", "event_viewer.dll", "task_manager.sys", "services.vxd",
  "device_manager.dll", "control_panel.exe", "system_properties.sys", "display_settings.vxd",
  "network_connections.dll", "internet_options.exe", "sound_settings.sys", "mouse_settings.vxd",
  "keyboard_settings.dll", "date_time.exe", "regional_settings.sys", "accessibility.vxd",
  "add_remove_programs.dll", "printers.exe", "fonts.sys", "scheduled_tasks.vxd"
];

const INSTALL_MESSAGES = [
  "Extracting files...",
  "Decompressing archives...",
  "Writing to disk...",
  "Updating system registry...",
  "Registering components...",
  "Creating shortcuts...",
  "Configuring network settings...",
  "Optimizing performance...",
  "Finalizing installation..."
];

export const SetupWizard: React.FC<SetupWizardProps> = ({ vfs, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [launchNow, setLaunchNow] = useState(true);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const handleFinish = () => {
    // Perform actual VFS installation
    vfs.installApp(
      'AETHERIS_NET_MON.EXE',
      'AETHERIS Network Monitor v4.2',
      '4.2',
      'netmon_exe',
      true,      // place shortcut
      'network', // iconType
    );

    // Install Meridian. TV as a preinstalled system app
    vfs.installApp(
      'RETROTV.EXE',
      'Meridian. TV',
      '1.0',
      'retrotv_exe',
      true,      // place shortcut
      'app', // iconType
    );

    // Call onComplete which closes the window in GUIOS
    onComplete();
  };

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [installLogs]);

  useEffect(() => {
    if (step === 2) {
      const totalDuration = 30000; // 30 seconds
      const updateInterval = 100; // Update every 100ms
      const totalSteps = totalDuration / updateInterval;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const newProgress = (currentStep / totalSteps) * 100;
        
        setProgress(newProgress);

        // Update file and message randomly
        if (Math.random() > 0.5) {
          const file = INSTALL_FILES[Math.floor(Math.random() * INSTALL_FILES.length)];
          setCurrentFile(file);
          setInstallLogs(prev => {
            const newLogs = [...prev, `Extracting: C:\\VESPERA\\SYSTEM\\AETHERIS\\${file}`];
            return newLogs.slice(-20); // Keep last 20 logs
          });
        }

        if (Math.random() > 0.95) {
          setCurrentMessage(INSTALL_MESSAGES[Math.floor(Math.random() * INSTALL_MESSAGES.length)]);
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setCurrentFile("Done.");
          setCurrentMessage("Installation complete.");
          setInstallLogs(prev => [...prev, "Registering components...", "Installation successful."]);
          import('../utils/audio').then(m => m.playInstallCompleteSound());
          setTimeout(() => setStep(3), 1000);
        }
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-sm">
      {/* Sidebar and Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-1/3 flex flex-col items-center justify-center p-4 text-white shrink-0 relative overflow-hidden" style={{ backgroundImage: 'url("/Vespera Setup Wizard background image.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-[#000080]/55 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <HardDrive size={64} className="mb-2 opacity-90" />
            <h2 className="text-xl font-bold text-center drop-shadow">AETHERIS<br/>Setup</h2>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-6 flex flex-col overflow-y-auto">
          {step === 0 && (
            <>
              <h3 className="font-bold text-lg mb-4">Welcome to the AETHERIS Network Monitor Setup Wizard</h3>
              <p className="mb-4">This wizard will guide you through the installation of AETHERIS Network Monitor v4.2.</p>
              <p className="mb-4">It is recommended that you close all other applications before starting Setup. This will make it possible to update relevant system files without having to reboot your computer.</p>
              <p>Click Next to continue.</p>
            </>
          )}

          {step === 1 && (
            <>
              <h3 className="font-bold text-lg mb-4">Choose Install Location</h3>
              <p className="mb-4">Choose the folder in which to install AETHERIS Network Monitor.</p>
              <p className="mb-2">Setup will install AETHERIS Network Monitor in the following folder. To install in a different folder, click Browse and select another folder.</p>
              <div className="mb-4">
                <label className="block text-xs mb-1">Destination Folder</label>
                <div className="flex gap-2">
                  <input type="text" value="C:\VESPERA\SYSTEM\AETHERIS" readOnly className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 bg-white outline-none" />
                  <button className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-4 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50">Browse...</button>
                </div>
              </div>
              <div className="text-xs space-y-1">
                <p>Space required: 4.5 MB</p>
                <p>Space available: 1.2 GB</p>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col h-full">
              <h3 className="font-bold text-lg mb-2">Installing</h3>
              <p className="mb-2">Please wait while AETHERIS Network Monitor is being installed.</p>
              
              <div className="mb-1 text-xs font-bold truncate">
                {currentMessage || "Extracting files..."}
              </div>
              
              <div className="mb-2 text-xs truncate text-gray-700">
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

              {/* Detailed Installation Logs */}
              <div ref={logsContainerRef} className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 overflow-y-auto text-[10px] font-mono leading-tight">
                {installLogs.map((log, i) => (
                  <div key={i} className="truncate">{log}</div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <>
              <h3 className="font-bold text-lg mb-4">Completing the AETHERIS Network Monitor Setup Wizard</h3>
              <p className="mb-4">AETHERIS Network Monitor has been installed on your computer.</p>
              <p className="mb-4">Click Finish to close this wizard.</p>
              <div className="flex items-center gap-2 mt-4">
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-sm font-bold">Installation Successful</span>
              </div>
              <label className="flex items-center gap-2 mt-auto pt-4 cursor-pointer">
                <input type="checkbox" checked={launchNow} onChange={e => setLaunchNow(e.target.checked)} />
                <span>Launch AETHERIS Network Monitor now</span>
              </label>
            </>
          )}
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="border-t-2 border-gray-400 p-4 flex justify-end gap-2 bg-[#c0c0c0] shrink-0">
        {step < 3 && (
          <button 
            onClick={onCancel}
            disabled={step === 2}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        {step > 0 && step < 3 && (
          <button 
            onClick={() => setStep(step - 1)}
            disabled={step === 2}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50"
          >
            &lt; Back
          </button>
        )}
        {step === 0 && (
          <button 
            onClick={() => setStep(1)}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold"
          >
            Next &gt;
          </button>
        )}
        {step === 1 && (
          <button 
            onClick={() => setStep(2)}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold"
          >
            Install
          </button>
        )}
        {step === 3 && (
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
