import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playShutdownSound } from "../utils/audio";

interface ShutdownScreenProps {
  onReboot: () => void;
  neuralBridgeActive: boolean;
}

export const ShutdownScreen: React.FC<ShutdownScreenProps> = ({ onReboot, neuralBridgeActive }) => {
  const [phase, setPhase] = useState(1); // 1: saving, 2: crt-y, 3: crt-x, 4: black, 5: final, 6: pre-reboot black, 7: amber-flicker

  useEffect(() => {
    console.log("Shutdown Screen Mounted");
    playShutdownSound();
    
    // Phase 1: Saving Settings (4s)
    const phase2Timer = setTimeout(() => setPhase(2), 4000);
    
    // Phase 2: CRT Vertical Collapse (0.3s)
    const phase3Timer = setTimeout(() => setPhase(3), 4300);
    
    // Phase 3: CRT Horizontal Collapse (0.2s)
    const phase4Timer = setTimeout(() => setPhase(4), 4500);
    
    // Phase 4: Momentary Black (0.1s)
    const phase5Timer = setTimeout(() => setPhase(5), 4600);
    
    // Phase 7: Amber Flicker (0.1s at 4.8s)
    const phase7Timer = setTimeout(() => setPhase(7), 4800);
    
    // Phase 6: Pre-Reboot Blackout (0.1s at 4.9s)
    const phase6Timer = setTimeout(() => setPhase(6), 4900);

    // Final Reboot (5s)
    const rebootTimer = setTimeout(() => {
      onReboot();
    }, 5000);

    return () => {
      console.log("Shutdown Screen Unmounted");
      clearTimeout(phase2Timer);
      clearTimeout(phase3Timer);
      clearTimeout(phase4Timer);
      clearTimeout(phase5Timer);
      clearTimeout(phase7Timer);
      clearTimeout(phase6Timer);
      clearTimeout(rebootTimer);
    };
  }, [onReboot]);

  return (
    <div className="fixed inset-0 z-[9998] bg-black select-none pointer-events-auto flex items-center justify-center overflow-hidden">
      {/* Phase 1: Saving Settings */}
      {phase === 1 && (
        <div className={`absolute inset-0 flex items-center justify-center ${neuralBridgeActive ? 'bg-[#1a0033]' : 'bg-[#000080]'}`}>
          <div className="text-center">
            <p className="text-[#c0c0c0] font-mono text-lg mb-2">Please wait while Vespera saves your configuration<span className="animate-pulse">...</span></p>
            {neuralBridgeActive && (
              <p className="text-red-900 font-mono text-[10px] opacity-30 animate-pulse">SYNCHRONIZING NEURAL FRAGMENTS...</p>
            )}
          </div>
        </div>
      )}

      {/* Phase 2: CRT Collapse (Vertical) */}
      {phase === 2 && (
        <motion.div 
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0.005 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full h-full bg-white bg-opacity-80"
        />
      )}

      {/* Phase 3: CRT Collapse (Horizontal) */}
      {phase === 3 && (
        <motion.div 
          initial={{ scaleY: 0.005, scaleX: 1 }}
          animate={{ scaleX: 0.005 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="w-full h-[2px] bg-white shadow-[0_0_15px_#fff]"
        />
      )}

      {/* Phase 5: Final Static Screen */}
      {phase === 5 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black animate-[phosphor_0.1s_infinite_alternate]">
          <div className="text-center">
            <h1 className="text-4xl font-black text-orange-600 mb-6 tracking-[0.2em] shadow-[0_0_15px_rgba(234,88,12,0.5)] animate-[flicker_0.5s_infinite_alternate]">VESPERA</h1>
            <p className="text-orange-500 font-mono text-xl tracking-wide uppercase">It is now safe to turn off your computer.</p>
            {neuralBridgeActive && (
              <div className="mt-12 text-red-900 font-mono text-[10px] opacity-30 select-none pointer-events-none">
                NEURAL LINK SEVERED. MEMORY FRAGMENTS RETAINED.
              </div>
            )}
            <p className="mt-8 text-orange-900 font-mono text-[10px] opacity-50 uppercase tracking-widest">System reboot in progress...</p>
          </div>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-orange-500/5 to-transparent opacity-20 mix-blend-screen" />
        </div>
      )}

      {/* Phase 6 & 4: Blackout */}
      {(phase === 6 || phase === 4) && (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* Phase 7: Amber Flicker */}
      {phase === 7 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center animate-[flicker_0.1s_infinite_alternate]">
            <h1 className="text-4xl font-black text-orange-600 tracking-[0.2em] shadow-[0_0_20px_#ea580c]">VESPERA</h1>
          </div>
        </div>
      )}
    </div>
  );
};
