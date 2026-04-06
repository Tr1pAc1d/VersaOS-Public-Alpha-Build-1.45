import React, { useState, useEffect } from "react";

interface SignOutScreenProps {
  /** "login" = go back to login screen | "terminal" = drop to terminal */
  mode: "login" | "terminal";
  onComplete: () => void;
  neuralBridgeActive: boolean;
}

/**
 * Realistic 1990s-style logoff/sign-out sequence.
 *
 * Phases (login mode):
 *  0 – "Closing applications..." (1 s)
 *  1 – "Saving session data..." (1 s)
 *  2 – "Synchronising disk..." (0.8 s)
 *  3 – "Logging off user…" (1 s)
 *  4 – CRT vertical collapse (0.3 s)
 *  5 – CRT horizontal collapse (0.2 s)
 *  6 – black flash (0.1 s)
 *  7 – amber VESPERA flicker (0.1 s)
 *  8 – complete → onComplete()
 *
 * Terminal mode is identical but messages reference "terminal" instead.
 */
export const SignOutScreen: React.FC<SignOutScreenProps> = ({ mode, onComplete, neuralBridgeActive }) => {
  const [phase, setPhase] = useState(0);
  const [dots, setDots] = useState(".");

  // Animated ellipsis
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Phase timings (ms from mount)
    const timings = [
      [1,  1000],   // closing apps
      [2,  2000],   // saving session
      [3,  2800],   // syncing disk
      [4,  3800],   // logging off (text)
      [5,  4600],   // CRT Y collapse
      [6,  4900],   // CRT X collapse
      [7,  5100],   // blackout
      [8,  5300],   // amber flicker
    ] as const;

    const handles = timings.map(([p, t]) => setTimeout(() => setPhase(p), t));
    const done = setTimeout(() => onComplete(), 5500);

    return () => {
      handles.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [onComplete]);

  const titleBg = neuralBridgeActive ? "#1a0033" : "#000080";
  const isText  = phase <= 4; // phases 0-4 show text UI

  // Message rows per phase
  const closingApps: string[] = [
    "Closing VersaFile Manager" + (phase >= 1 ? "   [done]" : dots),
    ...(phase >= 1 ? ["Closing Vespera Navigator   [done]"] : []),
    ...(phase >= 1 ? ["Closing AETHERIS Workbench  [done]"] : []),
  ];

  return (
    <div className="fixed inset-0 z-[9998] bg-black select-none pointer-events-auto flex items-center justify-center overflow-hidden">

      {/* ── Phases 0-4: text logoff UI ─────────────────────────────── */}
      {isText && (
        <div
          className="flex flex-col items-center justify-center w-full h-full"
          style={{ backgroundColor: titleBg }}
        >
          <div className="w-96 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
            {/* Title bar */}
            <div className="px-2 py-1 font-bold text-sm text-white flex items-center gap-2" style={{ backgroundColor: titleBg }}>
              <span>{mode === "terminal" ? "Sign Out to Terminal" : "Sign Out"}</span>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">

              {/* Phase 0: closing apps */}
              <div>
                <p className="text-xs font-bold text-black mb-1">Closing Applications{dots}</p>
                <div className="bg-white border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white p-2 font-mono text-[11px] text-black space-y-0.5 min-h-[52px]">
                  {closingApps.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>

              {/* Phase 1: saving session */}
              {phase >= 1 && (
                <div>
                  <p className="text-xs font-bold text-black mb-1">
                    {phase === 1 ? `Saving session data${dots}` : "Saving session data   [done]"}
                  </p>
                  {phase === 1 && (
                    <div className="w-full h-4 bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-0.5">
                      <div className="h-full bg-[#000080] animate-pulse" style={{ width: "60%" }} />
                    </div>
                  )}
                </div>
              )}

              {/* Phase 2: sync disk */}
              {phase >= 2 && (
                <div>
                  <p className="text-xs font-bold text-black mb-1">
                    {phase === 2 ? `Synchronising disk cache${dots}` : "Synchronising disk cache   [done]"}
                  </p>
                  {phase === 2 && (
                    <div className="w-full h-4 bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-0.5">
                      <div className="h-full bg-[#000080] animate-pulse" style={{ width: "85%" }} />
                    </div>
                  )}
                </div>
              )}

              {/* Phase 3: logging off */}
              {phase >= 3 && (
                <p className="text-sm font-bold text-black text-center mt-2">
                  {mode === "terminal"
                    ? `Terminating GUI session${dots}`
                    : `Logging off user${dots}`}
                </p>
              )}

              {neuralBridgeActive && (
                <p className="text-red-900 font-mono text-[10px] opacity-40 animate-pulse text-center">
                  DETACHING SYNAPTIC BRIDGE...
                </p>
              )}
            </div>
          </div>

          {/* Bottom status */}
          <p className="text-[#c0c0c0] font-mono text-xs mt-6 opacity-60">
            {mode === "terminal"
              ? "Please wait while the shell environment is prepared..."
              : "Please wait while your session is closed..."}
          </p>
        </div>
      )}

      {/* ── Phase 5: CRT Vertical collapse ─────────────────────────── */}
      {phase === 5 && (
        <div
          className="w-full h-full bg-white bg-opacity-80"
          style={{ animation: "crtCollapseY 0.3s ease-in-out forwards" }}
        />
      )}

      {/* ── Phase 6: CRT Horizontal collapse ───────────────────────── */}
      {phase === 6 && (
        <div
          className="w-full h-[2px] bg-white shadow-[0_0_15px_#fff]"
          style={{ animation: "crtCollapseX 0.2s ease-in-out forwards" }}
        />
      )}

      {/* ── Phase 7: Blackout ──────────────────────────────────────── */}
      {phase === 7 && (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* ── Phase 8: Amber VESPERA flicker ─────────────────────────── */}
      {phase === 8 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center" style={{ animation: "flicker 0.1s infinite alternate" }}>
            <h1 className="text-4xl font-black text-orange-600 tracking-[0.2em] shadow-[0_0_20px_#ea580c]">
              VESPERA
            </h1>
            <p className="text-orange-500 font-mono text-xs mt-2 tracking-widest uppercase">
              {mode === "terminal" ? "Returning to shell..." : "Returning to login..."}
            </p>
          </div>
        </div>
      )}

      {/* Keyframes injected inline (in case global CSS doesn't have them) */}
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
