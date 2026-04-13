import { useState, useEffect } from "react";
import { initVesperaAudio, playBootAfterBiosSound, playGlitchCorruptSound } from "./utils/audio";
import { BootSequence, KernelBoot, GUIBootSplash, GUIKernelBoot, GUILoadingScreen } from "./components/BootSequence";
import { Terminal } from "./components/Terminal";
import { BIOS } from "./components/BIOS";
import { GUIOS } from "./components/GUIOS";
import { GUILogin } from "./components/GUILogin";

import { KernelPanic } from "./components/KernelPanic";
import { ShutdownScreen } from "./components/ShutdownScreen";
import { NetworkLinkProvider } from "./contexts/NetworkLinkContext";
import { VMailProvider } from "./contexts/VMailContext";

type AppState = "OFF" | "SPLASH" | "BIOS" | "KERNEL_BOOT" | "TERMINAL" | "GUI_BOOT_SPLASH" | "GUI_KERNEL_BOOT" | "GUI_LOADING_SCREEN" | "GUI_LOGIN" | "GUI_OS" | "KERNEL_PANIC" | "SHUTDOWN";

export default function App() {
  useEffect(() => {
    initVesperaAudio();
  }, []);

  const [appState, setAppState] = useState<AppState>("SPLASH");
  const [rebootKey, setRebootKey] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [guiEnabled, setGuiEnabled] = useState(false);
  const [neuralBridgeEnabled, setNeuralBridgeEnabled] = useState(false);
  const [neuralBoostEnabled, setNeuralBoostEnabled] = useState(false);
  const [unrestrictedPollingEnabled, setUnrestrictedPollingEnabled] = useState(false);
  const [neuralBridgeActive, setNeuralBridgeActive] = useState(false);
  const [fastBootEnabled, setFastBootEnabled] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [screenMode, setScreenMode] = useState<"Square" | "Full">("Square");
  const [isResSwapping, setIsResSwapping] = useState(false);
  const [resSwapPhase, setResSwapPhase] = useState<"NONE" | "BLACKOUT" | "FLICKER" | "EXPAND" | "FADEIN">("NONE");
  const [windowScale, setWindowScale] = useState(1);

  const triggerInternalReboot = () => {
    setNeuralBridgeActive(false);
    setUnrestrictedPollingEnabled(false);
    setCurrentUser(null);
    setRebootKey(prev => prev + 1);
    setAppState("SPLASH");
  };

  const handleSoftReboot = () => {
    triggerInternalReboot();
  };

  const triggerSystemReboot = () => {
    triggerInternalReboot();
  };

  const handleSignOut = () => {
    // Clear user session, return to GUI login screen
    setCurrentUser(null);
    setAppState("GUI_LOGIN");
  };

  const handleSignOutToTerminal = () => {
    // Clear user session & GUI state, drop back to the terminal
    setNeuralBridgeActive(false);
    setCurrentUser(null);
    setAppState("TERMINAL");
  };

  // Safety Failsafe: Hard-redirect / Hardware Reload if hung
  useEffect(() => {
    if (appState === "OFF") {
      const failsafe = setTimeout(() => {
        if (appState === "OFF") {
          console.warn("System reboot hung. Triggering hardware reload...");
          window.location.reload(); 
        }
      }, 2000);
      return () => clearTimeout(failsafe);
    }
  }, [appState]);

  // Failsafe for resolution swap hang
  useEffect(() => {
    if (isResSwapping) {
      const failsafe = setTimeout(() => {
        setIsResSwapping(false);
        setResSwapPhase("NONE");
        console.warn("Resolution swap hung. Triggered 1500ms safety recovery.");
      }, 1500);
      return () => clearTimeout(failsafe);
    }
  }, [isResSwapping]);

  // Kernel Panic Timer
  useEffect(() => {
    if (appState === "GUI_OS" && neuralBridgeActive && unrestrictedPollingEnabled) {
      const timer = setTimeout(() => {
        setAppState("KERNEL_PANIC");
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [appState, neuralBridgeActive, unrestrictedPollingEnabled]);

  // Random glitch effect - only if neural bridge is active
  useEffect(() => {
    if (!neuralBridgeActive) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.98) {
        setGlitch(true);
        playGlitchCorruptSound();
        setTimeout(() => setGlitch(false), 100);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [neuralBridgeActive]);

  // Window resize fluid magnifier
  useEffect(() => {
    const handleResize = () => {
      const containerWidth = screenMode === 'Full' ? 1066 : 800;
      const containerHeight = 600;
      const scaleX = window.innerWidth / containerWidth;
      const scaleY = window.innerHeight / containerHeight;
      setWindowScale(Math.min(scaleX, scaleY) * 0.95); // 0.95 gives a nice margin around the monitor
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [screenMode]);

  const renderContent = () => {
    const isColdBoot = rebootKey > 0;
    
    switch (appState) {
      case "SPLASH":
        return (
          <div className="relative z-[9999]">
            <BootSequence 
              key={`boot-${rebootKey}`}
              onComplete={() => {
                playBootAfterBiosSound();
                setAppState("KERNEL_BOOT");
              }} 
              onEnterBIOS={() => setAppState("BIOS")} 
              fastBootEnabled={fastBootEnabled}
              isColdBoot={isColdBoot}
            />
          </div>
        );
      case "BIOS":
        return (
          <div className="relative z-[9999]">
            <BIOS 
              key={`bios-${rebootKey}`}
              onBootOS={() => {
                playBootAfterBiosSound();
                setAppState("KERNEL_BOOT");
              }} 
              onSecretBoot={() => {
                setGuiEnabled(true);
                setFastBootEnabled(true);
                setAppState("GUI_OS");
              }}
              guiEnabled={guiEnabled}
              setGuiEnabled={setGuiEnabled}
              neuralBridgeEnabled={neuralBridgeEnabled}
              setNeuralBridgeEnabled={setNeuralBridgeEnabled}
              neuralBoostEnabled={neuralBoostEnabled}
              setNeuralBoostEnabled={setNeuralBoostEnabled}
              unrestrictedPollingEnabled={unrestrictedPollingEnabled}
              setUnrestrictedPollingEnabled={setUnrestrictedPollingEnabled}
              fastBootEnabled={fastBootEnabled}
              setFastBootEnabled={setFastBootEnabled}
            />
          </div>
        );
      case "KERNEL_BOOT":
        return <KernelBoot key={`kernel-${rebootKey}`} onComplete={() => setAppState("TERMINAL")} fastBootEnabled={fastBootEnabled} />;
      case "TERMINAL":
        return (
          <Terminal 
            key={`term-${rebootKey}`}
            onReboot={triggerInternalReboot} 
            guiEnabled={guiEnabled}
            onStartGUI={() => setAppState("GUI_BOOT_SPLASH")}
            neuralBridgeEnabled={neuralBridgeEnabled}
            neuralBridgeActive={neuralBridgeActive}
            onActivateBridge={() => setNeuralBridgeActive(true)}
          />
        );
      case "GUI_BOOT_SPLASH":
        return <GUIBootSplash key={`gui-boot-${rebootKey}`} onComplete={() => setAppState("GUI_KERNEL_BOOT")} fastBootEnabled={fastBootEnabled} />;
      case "GUI_KERNEL_BOOT":
        return <GUIKernelBoot key={`gui-kernel-${rebootKey}`} onComplete={() => setAppState("GUI_LOADING_SCREEN")} neuralBridgeActive={neuralBridgeActive} fastBootEnabled={fastBootEnabled} />;
      case "GUI_LOADING_SCREEN":
        return <GUILoadingScreen 
          key={`gui-load-${rebootKey}`} 
          onComplete={() => {
            if (screenMode === "Full") {
              setResSwapPhase("BLACKOUT");
              setIsResSwapping(true);
              // Animation sequence:
              // 100ms: Flicker
              setTimeout(() => setResSwapPhase("FLICKER"), 100);
              // 250ms: Expand
              setTimeout(() => setResSwapPhase("EXPAND"), 250);
              // 400ms: Fade in Desktop
              setTimeout(() => {
                setResSwapPhase("FADEIN");
                setAppState("GUI_LOGIN");
              }, 400);
              // 800ms: End swapping
              setTimeout(() => {
                setIsResSwapping(false);
                setResSwapPhase("NONE");
              }, 800);
            } else {
              setAppState("GUI_LOGIN");
            }
          }} 
          neuralBridgeActive={neuralBridgeActive} 
          fastBootEnabled={fastBootEnabled} 
        />;
      case "GUI_LOGIN":
        return <GUILogin 
          key={`gui-login-${rebootKey}`} 
          onLogin={(user) => { setCurrentUser(user); setAppState("GUI_OS"); }} 
          neuralBridgeActive={neuralBridgeActive} 
          isVisible={!isResSwapping || resSwapPhase === "FADEIN"}
          onShutdown={() => setAppState("SHUTDOWN")}
        />;
      case "GUI_OS":
        return (
          <NetworkLinkProvider key={`net-${rebootKey}`}>
            <VMailProvider>
              <GUIOS 
                key={`gui-os-${rebootKey}`}
                onExit={() => {
                  setNeuralBridgeActive(false);
                  setAppState("BIOS");
                }} 
                onReboot={triggerInternalReboot}
                neuralBridgeActive={neuralBridgeActive} 
                neuralBridgeEnabled={neuralBridgeEnabled} 
                neuralBoostEnabled={neuralBoostEnabled} 
                unrestrictedPollingEnabled={unrestrictedPollingEnabled} 
                setUnrestrictedPollingEnabled={setUnrestrictedPollingEnabled} 
                onShutDown={() => setAppState("SHUTDOWN")}
                onSignOut={handleSignOut}
                onSignOutToTerminal={handleSignOutToTerminal}
                screenMode={screenMode}
                setScreenMode={setScreenMode}
                currentUser={currentUser || 'thorne'}
              />
            </VMailProvider>
          </NetworkLinkProvider>
        );
      case "KERNEL_PANIC":
        return <KernelPanic key={`panic-${rebootKey}`} onReboot={triggerInternalReboot} />;
      case "SHUTDOWN":
        return (
          <ShutdownScreen 
            key={`shutdown-${rebootKey}`}
            onReboot={triggerInternalReboot}
            neuralBridgeActive={neuralBridgeActive}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative h-screen w-screen bg-[#000000] overflow-hidden ${glitch ? 'crt-flicker' : ''}`}>
      {/* CRT Effects */}
      <div className="crt-overlay" />
      <div className="scanline" />
      
      {/* Main Content Multi-Mount Container (Viewport Shell) */}
      <main 
        key={rebootKey} 
        className={`fixed inset-0 z-10 flex items-center justify-center bg-[#000000] overflow-hidden select-none
          ${isResSwapping && resSwapPhase === 'BLACKOUT' ? 'opacity-0' : 'opacity-100'}
          transition-opacity duration-300
        `}
      >
        {/* The "Physical" Display Container (4:3 Box vs Fullscreen) */}
        <div 
          className={`box-content relative overflow-hidden transition-all duration-[800ms] ease-in-out origin-center
            ${screenMode === 'Full' ? 'w-[1066px] max-w-[1066px] h-[600px]' : 'w-[800px] max-w-[800px] h-[600px] aspect-[4/3]'} border-4 border-double border-white/20 shadow-[0_0_100px_rgba(0,0,0,1)]
            ${appState === 'BIOS' ? '' : (appState === 'GUI_OS' || appState === 'GUI_LOADING_SCREEN' || appState === 'GUI_LOGIN') ? 'bg-[#5f8787]' : 'bg-black'}
            ${resSwapPhase === 'EXPAND' ? 'contrast-125' : ''}
            ${['SPLASH', 'KERNEL_BOOT', 'TERMINAL', 'GUI_BOOT_SPLASH', 'GUI_KERNEL_BOOT', 'KERNEL_PANIC'].includes(appState) ? 'text-glow' : ''}
          `}
          style={{ transform: `scale(${windowScale}) ${resSwapPhase === 'EXPAND' ? 'scaleX(1.05)' : ''}` }}
        >
          {renderContent()}

          {/* Resolution Swap Flicker Overlay */}
          {resSwapPhase === 'FLICKER' && (
            <div className="absolute inset-0 z-[10002] bg-white opacity-20 animate-pulse pointer-events-none" />
          )}
          {resSwapPhase === 'FLICKER' && (
            <div className="absolute inset-0 z-[10003] bg-[url('https://media.giphy.com/media/oEI9uWUic8vS/giphy.gif')] opacity-10 mix-blend-screen pointer-events-none" />
          )}
        </div>
      </main>

      {/* Vignette effect */}
      <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-50" />
    </div>
  );
}
