import React, { useState, useEffect } from "react";
import { OS_CONFIG } from "../constants/os";

interface BIOSProps {
  onBootOS: () => void;
  guiEnabled: boolean;
  setGuiEnabled: (enabled: boolean) => void;
  neuralBridgeEnabled: boolean;
  setNeuralBridgeEnabled: (enabled: boolean) => void;
  neuralBoostEnabled: boolean;
  setNeuralBoostEnabled: (enabled: boolean) => void;
  unrestrictedPollingEnabled: boolean;
  setUnrestrictedPollingEnabled: (enabled: boolean) => void;
  fastBootEnabled: boolean;
  setFastBootEnabled: (enabled: boolean) => void;
  onSecretBoot: () => void;
}

const MENU_ITEMS = [
  "STANDARD CMOS SETUP",
  "ADVANCED BIOS FEATURES",
  "CHIPSET FEATURES SETUP",
  "POWER MANAGEMENT SETUP",
  "PNP/PCI CONFIGURATION",
  "X-TYPE CO-PROCESSOR SETUP",
  "EXPERIMENTAL FEATURES",
  "INTEGRATED PERIPHERALS",
  "PC HEALTH STATUS",
  "LOAD BIOS DEFAULTS",
  "LOAD SETUP DEFAULTS",
  "SUPERVISOR PASSWORD",
  "USER PASSWORD",
  "IDE HDD AUTO DETECTION",
  "SAVE & EXIT SETUP",
  "EXIT WITHOUT SAVING",
  "BOOT AETHERIS OS",
  "SECRET DEBUG MENU",
];

export const BIOS: React.FC<BIOSProps> = ({ onBootOS, guiEnabled, setGuiEnabled, neuralBridgeEnabled, setNeuralBridgeEnabled, neuralBoostEnabled, setNeuralBoostEnabled, unrestrictedPollingEnabled, setUnrestrictedPollingEnabled, fastBootEnabled, setFastBootEnabled, onSecretBoot }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSubMenu, setShowSubMenu] = useState<string | null>(null);
  const [xTypeSelection, setXTypeSelection] = useState(0);
  const [zeroKeyHeld, setZeroKeyHeld] = useState(false);
  const [zeroHoldProgress, setZeroHoldProgress] = useState(0);

  const [nineKeyHeld, setNineKeyHeld] = useState(false);
  const [nineHoldProgress, setNineHoldProgress] = useState(0);
  const [showFactoryReset, setShowFactoryReset] = useState(false);
  
  const [wipingSectors, setWipingSectors] = useState(false);
  const [wipingProgress, setWipingProgress] = useState(0);
  const [secretSelection, setSecretSelection] = useState(0);

  // Dummy state for other toggles to make it feel interactive
  const [biosState, setBiosState] = useState({
    virusWarning: false,
    cpuCache: true,
    quickBoot: true,
    swapFloppy: false,
    bootUpNumLock: true,
    shadowRam: true,
    haltOn: "All Errors"
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (zeroKeyHeld && zeroHoldProgress < 100) {
      interval = setInterval(() => {
        setZeroHoldProgress(p => Math.min(p + (100 / 30), 100)); // 3 seconds = 30 * 100ms
      }, 100);
    } else if (!zeroKeyHeld) {
      setZeroHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [zeroKeyHeld, zeroHoldProgress]);

  useEffect(() => {
    if (zeroHoldProgress >= 100) {
      setZeroKeyHeld(false);
      setZeroHoldProgress(0);
      onSecretBoot();
    }
  }, [zeroHoldProgress, onSecretBoot]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (nineKeyHeld && nineHoldProgress < 100) {
      interval = setInterval(() => {
        setNineHoldProgress(p => Math.min(p + (100 / 20), 100)); // 2 seconds = 20 * 100ms
      }, 100);
    } else if (!nineKeyHeld) {
      setNineHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [nineKeyHeld, nineHoldProgress]);

  useEffect(() => {
    if (nineHoldProgress >= 100) {
      setNineKeyHeld(false);
      setNineHoldProgress(0);
      setShowFactoryReset(true);
    }
  }, [nineHoldProgress]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (wipingSectors) {
      interval = setInterval(() => {
        setWipingProgress(p => p + (100 / 10)); // 1 second = 10 * 100ms
      }, 100);
    }
    return () => clearInterval(interval);
  }, [wipingSectors]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (wipingSectors) return;

      if (showFactoryReset) {
        if (e.key.toLowerCase() === 'y' && !wipingSectors) {
          setWipingSectors(true);
          localStorage.clear();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else if (e.key.toLowerCase() === 'n' || e.key === 'Escape') {
          setShowFactoryReset(false);
        }
        return;
      }

      if (e.key === "0" && !e.repeat) {
        setZeroKeyHeld(true);
      }
      
      if (e.key === "9" && !e.repeat) {
        setNineKeyHeld(true);
      }

      if (e.key === "F8") {
        setShowFactoryReset(true);
      }

      if (showSubMenu) {
        if (e.key === "Escape") {
          setShowSubMenu(null);
          setXTypeSelection(0);
        }
        
        if (e.key === "Enter") {
          if (showSubMenu === "ADVANCED BIOS FEATURES") {
            setGuiEnabled(!guiEnabled);
          } else if (showSubMenu === "POWER MANAGEMENT SETUP") {
            setFastBootEnabled(!fastBootEnabled);
          } else if (showSubMenu === "X-TYPE CO-PROCESSOR SETUP") {
            if (xTypeSelection === 0) {
              setNeuralBridgeEnabled(!neuralBridgeEnabled);
            } else if (xTypeSelection === 1) {
              setNeuralBoostEnabled(!neuralBoostEnabled);
            } else if (xTypeSelection === 2) {
              setUnrestrictedPollingEnabled(!unrestrictedPollingEnabled);
            }
          } else if (showSubMenu === "EXPERIMENTAL FEATURES") {
            setBiosState(prev => ({ ...prev, quickBoot: !prev.quickBoot }));
          } else if (showSubMenu === "SECRET DEBUG MENU") {
            if (secretSelection === 0) setGuiEnabled(!guiEnabled);
            else if (secretSelection === 1) setFastBootEnabled(!fastBootEnabled);
            else if (secretSelection === 2) setShowFactoryReset(true);
          }
        } else if (showSubMenu === "X-TYPE CO-PROCESSOR SETUP") {
          if (e.key === "ArrowUp") setXTypeSelection(prev => (prev > 0 ? prev - 1 : 2));
          if (e.key === "ArrowDown") setXTypeSelection(prev => (prev < 2 ? prev + 1 : 0));
        } else if (showSubMenu === "SECRET DEBUG MENU") {
          if (e.key === "ArrowUp") setSecretSelection(prev => (prev > 0 ? prev - 1 : 2));
          if (e.key === "ArrowDown") setSecretSelection(prev => (prev < 2 ? prev + 1 : 0));
        }
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : MENU_ITEMS.length - 1));
          break;
        case "ArrowDown":
          setSelectedIndex((prev) => (prev < MENU_ITEMS.length - 1 ? prev + 1 : 0));
          break;
        case "Enter":
          if (MENU_ITEMS[selectedIndex] === "BOOT AETHERIS OS") {
            onBootOS();
          } else {
            setShowSubMenu(MENU_ITEMS[selectedIndex]);
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "0") {
        setZeroKeyHeld(false);
      }
      if (e.key === "9") {
        setNineKeyHeld(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedIndex, showSubMenu, onBootOS, guiEnabled, setGuiEnabled, neuralBridgeEnabled, setNeuralBridgeEnabled, neuralBoostEnabled, setNeuralBoostEnabled, unrestrictedPollingEnabled, setUnrestrictedPollingEnabled, xTypeSelection, fastBootEnabled, setFastBootEnabled, showFactoryReset, wipingSectors, secretSelection]);

  const renderSubMenu = () => {
    if (!showSubMenu) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none">
        <div className="bg-[#aaaaaa] text-[#0000aa] p-8 border-4 border-white shadow-2xl max-w-lg w-full pointer-events-auto">
          <h2 className="font-bold border-b border-[#0000aa] mb-4 text-xl">{showSubMenu}</h2>
          <div className="space-y-2 text-sm">
            {showSubMenu === "ADVANCED BIOS FEATURES" && (
              <>
                <div className="flex justify-between"><span>CPU Type:</span> <span>{OS_CONFIG.BIOS.CPU}</span></div>
                <div className="flex justify-between"><span>Co-Processor:</span> <span className="text-red-800 font-bold">{OS_CONFIG.BIOS.CO_PROCESSOR}</span></div>
                <div className="flex justify-between"><span>Base Memory:</span> <span>640 KB</span></div>
                <div className="flex justify-between"><span>Extended Memory:</span> <span>32128 KB</span></div>
                <div className="flex justify-between"><span>Video Adapter:</span> <span>{OS_CONFIG.BIOS.GPU}</span></div>
                <div className="flex justify-between"><span>Boot Sequence:</span> <span>A, C, SCSI</span></div>
                <div className="flex justify-between"><span>Virus Warning:</span> <span>{biosState.virusWarning ? "Enabled" : "Disabled"}</span></div>
                <div className="flex justify-between"><span>CPU Internal Cache:</span> <span>{biosState.cpuCache ? "Enabled" : "Disabled"}</span></div>
                <div className="flex justify-between items-center cursor-pointer hover:bg-[#0000aa] hover:text-white px-1">
                  <span>Protected Mode (XMS) Support:</span> 
                  <span className="font-bold">[{guiEnabled ? "Enabled" : "Disabled"}]</span>
                </div>
                <div className="flex justify-between"><span>Swap Floppy Drive:</span> <span>{biosState.swapFloppy ? "Enabled" : "Disabled"}</span></div>
                <div className="flex justify-between"><span>Boot Up NumLock Status:</span> <span>{biosState.bootUpNumLock ? "On" : "Off"}</span></div>
                <div className="mt-4 text-[10px] italic">Press ENTER to toggle highlighted option. Required for advanced OS features.</div>
              </>
            )}
            {showSubMenu === "STANDARD CMOS SETUP" && (
              <>
                <div className="flex justify-between"><span>Date:</span> <span>Mar 22 1994</span></div>
                <div className="flex justify-between"><span>Time:</span> <span>01:59:44</span></div>
                <div className="flex justify-between"><span>Primary Master:</span> <span>40 MB HDD</span></div>
                <div className="flex justify-between"><span>Primary Slave:</span> <span>None</span></div>
                <div className="flex justify-between"><span>Floppy Drive A:</span> <span>1.44M, 3.5 in.</span></div>
                <div className="flex justify-between"><span>Floppy Drive B:</span> <span>1.2M, 5.25 in.</span></div>
                <div className="flex justify-between"><span>Video:</span> <span>EGA/VGA</span></div>
                <div className="flex justify-between"><span>Halt On:</span> <span>{biosState.haltOn}</span></div>
              </>
            )}
            {showSubMenu === "X-TYPE CO-PROCESSOR SETUP" && (
              <>
                <div className="text-red-700 font-bold mb-2 underline">NEURAL BRIDGE DIAGNOSTICS:</div>
                <div className="flex justify-between"><span>Hardware Status:</span> <span className="text-green-800">DETECTED (IRQ 15)</span></div>
                <div className="flex justify-between"><span>Synaptic Latency:</span> <span>0.002ms</span></div>
                <div className="flex justify-between"><span>Signal Source:</span> <span className="animate-pulse">UNKNOWN_EXT_01</span></div>
                <div className="flex justify-between"><span>Feedback Loop:</span> <span>ENABLED</span></div>
                <div className="flex justify-between"><span>Memory Mapping:</span> <span>NON-EUCLIDEAN</span></div>
                <div className="mt-4 border-t border-[#0000aa] pt-2 space-y-2">
                  <div className={`flex justify-between items-center cursor-pointer px-1 ${xTypeSelection === 0 ? 'bg-[#0000aa] text-white' : 'hover:bg-[#0000aa] hover:text-white'}`}>
                    <span>ENABLE X-TYPE NEURAL BRIDGE:</span> 
                    <span className="font-bold">[{neuralBridgeEnabled ? "ENABLED" : "DISABLED"}]</span>
                  </div>
                  <div className={`flex justify-between items-center cursor-pointer px-1 ${xTypeSelection === 1 ? 'bg-[#0000aa] text-white' : 'hover:bg-[#0000aa] hover:text-white'}`}>
                    <span>HEURISTIC PROCESSING BOOST:</span> 
                    <span className="font-bold">[{neuralBoostEnabled ? "ENABLED" : "DISABLED"}]</span>
                  </div>
                  <div className={`flex justify-between items-center cursor-pointer px-1 ${xTypeSelection === 2 ? 'bg-[#0000aa] text-white' : 'hover:bg-[#0000aa] hover:text-white'}`}>
                    <span>UNRESTRICTED ANALOG POLLING:</span> 
                    <span className="font-bold">[{unrestrictedPollingEnabled ? "ENABLED" : "DISABLED"}]</span>
                  </div>
                  <div className="text-[10px] mt-1 italic">
                    {xTypeSelection === 2 
                      ? "Warning: Bypasses EMI hardware filters to maximize heuristic data intake. May cause severe acoustic resonance and unpredictable cognitive anomalies."
                      : "Press ENTER to toggle highlighted option. WARNING: May cause system instability."}
                  </div>
                </div>
                <div className="mt-4 p-2 bg-black text-green-400 text-xs font-mono">
                  LOG: Attempting to map non-euclidean data structures to memory address 0x0000... FAILED. Retrying with neural bypass... SUCCESS.
                </div>
                <div className="mt-2 text-[10px] text-gray-600 italic">"It doesn't just process data. It perceives it." - Thorne</div>
              </>
            )}
            {showSubMenu === "EXPERIMENTAL FEATURES" && (
              <>
                <div className="flex justify-between items-center cursor-pointer hover:bg-[#0000aa] hover:text-white px-1">
                  <span>Quick Power On Self Test:</span> 
                  <span className="font-bold">[{biosState.quickBoot ? "Enabled" : "Disabled"}]</span>
                </div>
                <div className="text-[10px] mt-1 italic">Press ENTER to toggle highlighted option.</div>
                <div className="mt-4">
                  <div className="flex justify-between"><span>Shadow Sector Access:</span> <span className="text-red-800">LOCKED</span></div>
                  <div className="flex justify-between"><span>Temporal Sync:</span> <span>DISABLED</span></div>
                </div>
              </>
            )}
            {showSubMenu === "CHIPSET FEATURES SETUP" && (
              <>
                <div className="flex justify-between"><span>DRAM Read Wait State:</span> <span>0 WS</span></div>
                <div className="flex justify-between"><span>DRAM Write Wait State:</span> <span>0 WS</span></div>
                <div className="flex justify-between"><span>Cache Read Hit:</span> <span>99.9%</span></div>
                <div className="flex justify-between"><span>Shadow RAM Cache:</span> <span>{biosState.shadowRam ? "ENABLED" : "DISABLED"}</span></div>
                <div className="flex justify-between"><span>8-bit I/O Recovery Time:</span> <span>1 CLK</span></div>
                <div className="flex justify-between"><span>16-bit I/O Recovery Time:</span> <span>1 CLK</span></div>
                <div className="flex justify-between"><span>ISA Bus Clock:</span> <span>PCICLK/4</span></div>
              </>
            )}
            {showSubMenu === "POWER MANAGEMENT SETUP" && (
              <>
                <div className="text-red-700 font-bold mb-2 underline">POWER MANAGEMENT:</div>
                <div className="flex justify-between items-center cursor-pointer hover:bg-[#0000aa] hover:text-white px-1">
                  <span>Fast Boot Mode (Debug):</span> 
                  <span className="font-bold">[{fastBootEnabled ? "Enabled" : "Disabled"}]</span>
                </div>
                <div className="text-[10px] mt-1 italic">Press ENTER to toggle. Speeds up GUI loading sequence.</div>
                <div className="mt-4 border-t border-[#0000aa] pt-2 space-y-2">
                  <div className="flex justify-between"><span>Power Management:</span> <span>User Define</span></div>
                  <div className="flex justify-between"><span>PM Control by APM:</span> <span>Yes</span></div>
                  <div className="flex justify-between"><span>Video Off Method:</span> <span>DPMS</span></div>
                  <div className="flex justify-between"><span>Standby Mode:</span> <span>Off</span></div>
                  <div className="flex justify-between"><span>Suspend Mode:</span> <span>Off</span></div>
                  <div className="flex justify-between"><span>HDD Power Down:</span> <span>Off</span></div>
                </div>
              </>
            )}
            {showSubMenu === "PC HEALTH STATUS" && (
              <>
                <div className="flex justify-between"><span>CPU Temperature:</span> <span>42°C</span></div>
                <div className="flex justify-between"><span>System Temperature:</span> <span>31°C</span></div>
                <div className="flex justify-between"><span>CPU Fan Speed:</span> <span>3200 RPM</span></div>
                <div className="flex justify-between"><span>Vcore:</span> <span>5.01V</span></div>
                <div className="flex justify-between"><span>+12V:</span> <span>12.12V</span></div>
                <div className="flex justify-between"><span>+5V:</span> <span>5.05V</span></div>
                <div className="flex justify-between"><span>+3.3V:</span> <span>3.32V</span></div>
              </>
            )}
            {showSubMenu === "SECRET DEBUG MENU" && (
              <>
                <div className="text-red-700 font-bold mb-2 underline">VESPERA INTERNAL DEBUG:</div>
                <div className={`flex justify-between items-center cursor-pointer px-1 ${secretSelection === 0 ? 'bg-[#0000aa] text-white' : 'hover:bg-[#0000aa] hover:text-white'}`}>
                  <span>Protected Mode:</span> <span className="font-bold">[{guiEnabled ? "ENABLED" : "DISABLED"}]</span>
                </div>
                <div className={`flex justify-between items-center cursor-pointer px-1 ${secretSelection === 1 ? 'bg-[#0000aa] text-white' : 'hover:bg-[#0000aa] hover:text-white'}`}>
                  <span>Fast Boot:</span> <span className="font-bold">[{fastBootEnabled ? "ENABLED" : "DISABLED"}]</span>
                </div>
                <div className="mt-4 border-t border-[#0000aa] pt-2">
                  <div className="text-xs italic">Hold '0' for 3 seconds to quick-launch GUI OS. Press ENTER to select.</div>
                  <div 
                     className={`mt-4 text-white font-bold cursor-pointer text-center py-1 border-2 shadow-[2px_2px_0px_#000] focus:outline-none ${secretSelection === 2 ? 'bg-red-600 border-red-500' : 'bg-red-800 border-red-900'}`}
                     onClick={() => setShowFactoryReset(true)}
                  >
                     [ F8: FACTORY RESET ]
                  </div>
                </div>
              </>
            )}
            {["PNP/PCI CONFIGURATION", "SUPERVISOR PASSWORD", "USER PASSWORD", "IDE HDD AUTO DETECTION", "INTEGRATED PERIPHERALS"].includes(showSubMenu) && (
              <div className="text-center py-4 text-red-800 font-bold">
                ACCESS DENIED: ENCRYPTED BY DR. THORNE
                <div className="text-xs mt-2 text-gray-700">"Security is the only thing keeping them out."</div>
              </div>
            )}
            {["LOAD BIOS DEFAULTS", "LOAD SETUP DEFAULTS", "SAVE & EXIT SETUP", "EXIT WITHOUT SAVING"].includes(showSubMenu) && (
              <div className="text-center py-4">
                Are you sure you want to perform this action? (Y/N)
                <div className="text-xs mt-2 text-gray-700">Keyboard input disabled for this action.</div>
              </div>
            )}
          </div>
          <div className="mt-6 text-center text-xs border-t border-[#0000aa] pt-2">Press ESC to return</div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-[#0000aa] text-white font-mono p-4 py-5 flex flex-col border-4 border-double border-white select-none shadow-[20px_20px_0px_rgba(30,30,120,0.5)] relative">
      {/* Header */}
      <div className="text-center bg-[#aaaaaa] text-[#0000aa] font-bold py-1 mb-4">
        {OS_CONFIG.BIOS.NAME} - {OS_CONFIG.BIOS.VERSION}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-2 px-8">
        {MENU_ITEMS.map((item, index) => (
          <div
            key={item}
            className={`px-2 py-1 cursor-pointer ${
              selectedIndex === index ? "bg-red-600 text-yellow-300" : ""
            }`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-4 border-t border-white pt-2 text-xs grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div>ESC : Quit &nbsp;&nbsp; DEL : Enter Setup</div>
          <div>F8 : Factory Reset</div>
          <div className="text-yellow-300">Hold '9' : Clear App Storage</div>
        </div>
        <div className="space-y-1">
          <div>↑ ↓ : Select Item &nbsp;&nbsp; ENTER : Select</div>
          <div>F10 : Save & Exit Setup</div>
          <div className="text-yellow-300">Hold '0' : Quick-Launch GUI OS</div>
        </div>
      </div>

      <div className="mt-4 bg-[#aaaaaa] text-[#0000aa] px-2 py-1 text-center font-bold">
        {MENU_ITEMS[selectedIndex] === "BOOT AETHERIS OS" 
          ? "Launch the primary operating system from IDE-0" 
          : "Configure system settings and hardware parameters"}
      </div>

      {/* Submenu Overlay */}
      {renderSubMenu()}

      {/* Secret Zero Key Progress */}
      {zeroKeyHeld && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-64 bg-black border-2 border-white p-1 z-50">
          <div className="text-xs text-center text-white mb-1">INITIATING QUICK LAUNCH...</div>
          <div className="w-full h-2 bg-gray-800">
            <div className="h-full bg-red-600 transition-all duration-100 ease-linear" style={{ width: `${zeroHoldProgress}%` }} />
          </div>
        </div>
      )}

      {/* Secret Nine Key Progress */}
      {nineKeyHeld && !showFactoryReset && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-72 bg-black border-2 border-red-800 p-1 z-50">
          <div className="text-xs text-center text-red-400 mb-1 animate-pulse">⚠ INITIATING STORAGE CLEAR... HOLD TO CONFIRM</div>
          <div className="w-full h-2 bg-gray-800">
            <div className="h-full bg-red-600 transition-all duration-100 ease-linear" style={{ width: `${nineHoldProgress}%` }} />
          </div>
        </div>
      )}

      {/* Factory Reset Modal Overlay */}
      {showFactoryReset && (
        <div tabIndex={0} autoFocus className="absolute inset-0 z-50 bg-black flex items-center justify-center p-8 text-white font-mono text-center flex-col focus:outline-none">
          <div className="max-w-xl w-full">
            <h1 className="text-red-600 text-3xl font-bold mb-8 animate-pulse">WARNING</h1>
            <p className="mb-4 text-lg">ALL SAVED APP STATE WILL BE ERASED.</p>
            <p className="mb-8 text-gray-400 text-sm">This operation will clear all local storage, including saved VFS data, configuration, and installed applications. The app will reload after wipe.</p>
            {!wipingSectors ? (
              <p className="text-xl">PROCEED? (Y/N)</p>
            ) : (
              <div className="mt-8">
                <p className="mb-2 text-red-500 animate-pulse">CLEARING STORAGE...</p>
                <div className="w-full h-4 bg-gray-800 border-2 border-white">
                  <div className="h-full bg-red-600 transition-none" style={{ width: `${wipingProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
