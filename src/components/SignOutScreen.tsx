import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react";

interface SignOutScreenProps {
  /** "login" = go back to login screen | "terminal" = drop to terminal | "shutdown" = power off */
  mode: "login" | "terminal" | "shutdown";
  onComplete: () => void;
  neuralBridgeActive: boolean;
  openAppsCount?: number;
}

/**
 * Vespera OS sign-out sequence — styled to match the GUILogin screen.
 *
 * Phases:
 *  0 – closing apps (1 s)
 *  1 – saving session (1 s)
 *  2 – syncing disk (0.8 s)
 *  3 – logging off text (1 s)
 *  4 – CRT vertical collapse (0.3 s)
 *  5 – CRT horizontal collapse (0.2 s)
 *  6 – blackout (0.1 s)
 *  7 – amber flicker (0.1 s)
 *  8 – complete
 */
export const SignOutScreen: React.FC<SignOutScreenProps> = ({ mode, onComplete, neuralBridgeActive, openAppsCount = 0 }) => {
  const [phase, setPhase] = useState(0);
  const [dots, setDots] = useState(".");
  const [progress, setProgress] = useState(0);
  const initialOpenAppsRef = React.useRef(openAppsCount);

  // Animated ellipsis
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 400);
    return () => clearInterval(id);
  }, []);

  // Animate save-progress bar
  useEffect(() => {
    if (phase !== 1 && phase !== 2) return;
    setProgress(0);
    const id = setInterval(() => setProgress(p => Math.min(p + Math.random() * 18 + 6, 100)), 120);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    const appsToClose = initialOpenAppsRef.current;
    const closeAppsDuration = Math.max(1000, 800 + appsToClose * 400);

    const timings: [number, number][] = [
      [1, closeAppsDuration],
      [2, closeAppsDuration + 1000],
      [3, closeAppsDuration + 1800],
      [4, closeAppsDuration + 2800],
      [5, closeAppsDuration + 3100],
      [6, closeAppsDuration + 3300],
    ];
    if (mode === "shutdown") timings.push([7, closeAppsDuration + 3500]);
    
    const handles = timings.map(([p, t]) => setTimeout(() => setPhase(p), t));
    const done = setTimeout(() => onComplete(), closeAppsDuration + (mode === "shutdown" ? 4500 : 3500));
    return () => { handles.forEach(clearTimeout); clearTimeout(done); };
  }, [onComplete]);

  const isText = phase <= 3;

  const closingApps = [
    "Closing VersaFile Manager" + (phase >= 1 ? "   [done]" : dots),
    ...(phase >= 1 ? ["Closing Vespera Navigator   [done]"] : []),
    ...(phase >= 1 ? ["Closing AETHERIS Workbench  [done]"] : []),
    ...(phase >= 1 ? ["Flushing memory pools       [done]"] : []),
  ];

  return (
    <div className="fixed inset-0 z-[9998] select-none pointer-events-auto flex items-center justify-center overflow-hidden">

      {/* ── Phases 0-3: main UI ── */}
      {isText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
          {/* CRT scanlines overlay over the desktop */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,#000 3px,#000 4px)' }} />

          {/* Neural bridge creep */}
          {neuralBridgeActive && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center mix-blend-difference opacity-10">
              <span className="text-red-500 text-7xl font-black tracking-widest transform -rotate-6 animate-pulse">
                DETACHING
              </span>
            </div>
          )}

          {/* ── Dialog panel ── */}
          <div className="relative z-10 w-[400px] shadow-[0_8px_32px_rgba(0,0,0,0.7)]">

            {/* Title bar */}
            <div className="bg-gradient-to-r from-[#000080] to-[#1a6ea5] px-3 py-1.5 flex items-center gap-2">
              <LogOut size={14} className="text-white shrink-0" />
              <span className="text-white text-xs font-bold tracking-widest uppercase flex-1">
                {mode === "terminal" ? "Sign Out to Terminal" : mode === "shutdown" ? "Shut Down System" : "Sign Out"}
              </span>
              <span className="text-blue-300 text-[9px] font-mono">Vespera OS 4.0</span>
            </div>

            {/* Body */}
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 p-4 flex flex-col gap-3">

              {/* Closing Applications */}
              <div>
                <p className="text-[10px] font-bold text-black mb-1 uppercase tracking-wide">
                  {phase === 0 ? `Closing Applications${dots}` : "Closing Applications   [done]"}
                </p>
                <div className="bg-white border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white p-2 font-mono text-[10px] text-black space-y-0.5">
                  {closingApps.map((line, i) => (
                    <p key={i} className={line.includes("[done]") ? "text-gray-600" : "text-black"}>{line}</p>
                  ))}
                </div>
              </div>

              {/* Saving session */}
              {phase >= 1 && (
                <div>
                  <p className="text-[10px] font-bold text-black mb-1 uppercase tracking-wide">
                    {phase === 1 ? `Saving session data${dots}` : "Saving session data   [done]"}
                  </p>
                  {phase === 1 && (
                    <div className="w-full h-3 bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-0.5">
                      <div className="h-full bg-[#000080] transition-all duration-100" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </div>
              )}

              {/* Sync disk */}
              {phase >= 2 && (
                <div>
                  <p className="text-[10px] font-bold text-black mb-1 uppercase tracking-wide">
                    {phase === 2 ? `Synchronising disk cache${dots}` : "Synchronising disk cache   [done]"}
                  </p>
                  {phase === 2 && (
                    <div className="w-full h-3 bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-0.5">
                      <div className="h-full bg-[#000080] transition-all duration-100" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </div>
              )}

              {/* Logging off */}
              {phase >= 3 && (
                <p className="text-xs font-bold text-black text-center py-1 border-t border-gray-400">
                  {mode === "terminal" ? `Terminating GUI session${dots}` : mode === "shutdown" ? `Preparing to shut down${dots}` : `Logging off user${dots}`}
                </p>
              )}

              {neuralBridgeActive && (
                <p className="text-red-700 font-mono text-[9px] opacity-60 animate-pulse text-center tracking-widest">
                  ⚠ DETACHING SYNAPTIC BRIDGE...
                </p>
              )}
            </div>

            {/* Status bar */}
            <div className="bg-[#c0c0c0] border-t border-gray-500 px-3 py-0.5 flex items-center justify-between">
              <span className="text-[9px] text-gray-600 font-mono">
                {mode === "terminal" ? "Preparing shell environment..." : mode === "shutdown" ? "Saving system state before power off..." : "Please wait while your session is closed..."}
              </span>
              <span className="text-[9px] text-gray-400 font-mono">VESPERA_HQ</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Phase 4: CRT Vertical collapse ── */}
      {phase === 4 && (
        <>
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0"
            style={{ backgroundColor: '#1a6b6b', animation: "crtCollapseY 0.3s ease-in-out forwards" }} />
        </>
      )}

      {/* ── Phase 5: CRT Horizontal collapse ── */}
      {phase === 5 && (
        <>
          <div className="absolute inset-0 bg-black" />
          <div className="absolute left-0 right-0 h-[2px] bg-white shadow-[0_0_15px_#fff] top-1/2"
            style={{ animation: "crtCollapseX 0.2s ease-in-out forwards" }} />
        </>
      )}

      {/* ── Phase 6: Blackout ── */}
      {phase >= 6 && <div className="absolute inset-0 bg-black z-40" />}

      {/* ── Phase 7: Amber VESPERA flicker (Shutdown only) ── */}
      {phase >= 7 && mode === "shutdown" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
          <div className="text-center" style={{ animation: "flicker 0.1s infinite alternate" }}>
            <h1 className="text-4xl font-black text-orange-600 tracking-[0.2em] shadow-[0_0_20px_#ea580c]">
              VESPERA
            </h1>
            <p className="text-orange-500 font-mono text-xs mt-2 tracking-widest uppercase">
              IT IS NOW SAFE TO TURN OFF YOUR NEURAL LINK.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes crtCollapseY {
          from { transform: scaleY(1); }
          to   { transform: scaleY(0.005); }
        }
        @keyframes crtCollapseX {
          from { transform: scaleY(0.005) scaleX(1); }
          to   { transform: scaleY(0.005) scaleX(0.005); }
        }
        @keyframes flicker {
          from { opacity: 1; }
          to   { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
