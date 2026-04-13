import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';

interface AgentVPlusSetupWizardProps {
  vfs: any;
  onComplete: () => void;
  onCancel: () => void;
}

const INSTALL_FILES = [
  "vagent_monitor.skin", "vagent_wizard.skin", "vagent_cat.skin",
  "vagent_neural.skin", "vagent_ghost.skin", "skin_manifest.xml",
  "anim_monitor_blink.svg", "anim_monitor_think.svg", "anim_monitor_email.svg",
  "anim_wizard_blink.svg", "anim_wizard_think.svg", "anim_wizard_glow.svg",
  "anim_cat_blink.svg", "anim_cat_think.svg", "anim_cat_purr.svg",
  "anim_neural_blink.svg", "anim_neural_think.svg", "anim_neural_pulse.svg",
  "anim_ghost_blink.svg", "anim_ghost_think.svg", "anim_ghost_fire.svg",
  "plus_skin_registry.dll", "vagent_expression_engine.vxd",
  "svga_render_pipeline.dll", "animation_scheduler.sys",
  "companion_ai_module.dll", "skin_cache.dat", "expression_map.ini",
  "vagent_plus_readme.txt", "license_plus.rtf", "uninstall_plus.exe",
];

const INSTALL_MESSAGES = [
  "Unpacking PLUS! character assets...",
  "Registering SVG animation pipeline...",
  "Installing expression engine...",
  "Calibrating companion AI module...",
  "Linking skin manifest to Agent V core...",
  "Writing animation scheduler config...",
  "Optimizing SVGA render buffers...",
  "Registering 5 premium skins...",
  "Finalizing PLUS! integration...",
];

// Animated PLUS! star icon for the sidebar
const PlusStarIcon: React.FC<{ size?: number }> = ({ size = 72 }) => (
  <svg width={size} height={size} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
    {/* Outer glow */}
    <circle cx="36" cy="36" r="30" fill="none" stroke="#ffd700" strokeWidth="1" opacity="0.4">
      <animate attributeName="r" values="28;32;28" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
    </circle>
    {/* Star body */}
    <polygon
      points="36,4 43,26 66,26 48,40 54,62 36,49 18,62 24,40 6,26 29,26"
      fill="url(#plusGrad)"
      stroke="#b8860b"
      strokeWidth="1.5"
    >
      <animateTransform attributeName="transform" type="rotate" from="0 36 36" to="360 36 36" dur="20s" repeatCount="indefinite" />
    </polygon>
    {/* Center sparkle */}
    <text x="36" y="41" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" fontFamily="sans-serif">+</text>
    <defs>
      <linearGradient id="plusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="50%" stopColor="#ff8c00" />
        <stop offset="100%" stopColor="#b8860b" />
      </linearGradient>
    </defs>
  </svg>
);

// Preview skins mini-icons
const SKIN_PREVIEWS = [
  { name: 'Monitor', color: '#00ff00', bg: '#0a0a0a', icon: '▣' },
  { name: 'Wizard', color: '#c084fc', bg: '#2a1040', icon: '✦' },
  { name: 'Cat', color: '#fbbf24', bg: '#292524', icon: '🐱' },
  { name: 'Neural', color: '#06b6d4', bg: '#0a1628', icon: '◉' },
  { name: 'Ghost', color: '#e2e8f0', bg: '#1e1e2e', icon: '👻' },
];

export const AgentVPlusSetupWizard: React.FC<AgentVPlusSetupWizardProps> = ({ vfs, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [acceptedWarning, setAcceptedWarning] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const handleFinish = () => {
    // Mark agentv_plus as installed
    try {
      const existing = JSON.parse(localStorage.getItem('vespera_installed_updates') || '[]');
      if (!existing.includes('agentv_plus')) {
        existing.push('agentv_plus');
        localStorage.setItem('vespera_installed_updates', JSON.stringify(existing));
      }
    } catch { /* ignore */ }
    onComplete();
  };

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [installLogs]);

  useEffect(() => {
    if (step === 3) {
      const totalDuration = 12000;
      const updateInterval = 80;
      const totalSteps = totalDuration / updateInterval;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const newProgress = (currentStep / totalSteps) * 100;
        setProgress(newProgress);

        if (Math.random() > 0.4) {
          const file = INSTALL_FILES[Math.floor(Math.random() * INSTALL_FILES.length)];
          setCurrentFile(file);
          setInstallLogs(prev => {
            const newLogs = [...prev, `Deploying: C:\\VESPERA\\SYSTEM\\AGENTV\\PLUS\\${file}`];
            return newLogs.slice(-20);
          });
        }

        if (Math.random() > 0.92) {
          setCurrentMessage(INSTALL_MESSAGES[Math.floor(Math.random() * INSTALL_MESSAGES.length)]);
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setCurrentFile("Done.");
          setCurrentMessage("PLUS! expansion installed successfully.");
          setInstallLogs(prev => [
            ...prev,
            "Registering 5 premium skins with Agent V core...",
            "Updating skin manifest...",
            "VAgent PLUS! Character Expansion installed successfully."
          ]);
          try {
            import('../utils/audio').then(m => m.playInstallCompleteSound());
          } catch { /* ignore */ }
          setTimeout(() => setStep(4), 1000);
        }
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-sm select-none">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar — Purple/Gold PLUS! themed */}
        <div
          className="w-1/3 flex flex-col items-center justify-center p-4 text-white shrink-0 relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #2a1040 0%, #4a1c5e 40%, #1a0a30 100%)',
          }}
        >
          {/* Decorative sparkle dots */}
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.3 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-yellow-300"
                style={{
                  width: 2 + Math.random() * 3,
                  height: 2 + Math.random() * 3,
                  left: `${10 + Math.random() * 80}%`,
                  top: `${5 + Math.random() * 90}%`,
                  animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          <PlusStarIcon size={72} />
          <h2 className="text-lg font-bold text-center mt-3 tracking-wide" style={{ textShadow: '0 0 10px #ffd700' }}>
            VAgent<br />PLUS!
          </h2>
          <p className="text-[10px] mt-2 opacity-70 text-center text-yellow-200">
            Character Expansion
          </p>
          <div className="mt-4 flex gap-1">
            {SKIN_PREVIEWS.map(s => (
              <div
                key={s.name}
                className="w-5 h-5 rounded-sm flex items-center justify-center text-[8px] border border-white/20"
                style={{ backgroundColor: s.bg, color: s.color }}
                title={s.name}
              >
                {s.icon}
              </div>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-5 flex flex-col overflow-y-auto">
          {step === 0 && (
            <>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#4a1c5e' }}>
                <Sparkles size={16} className="inline mr-1 text-yellow-600" />
                Welcome to VAgent PLUS! Setup
              </h3>
              <p className="mb-3 text-xs leading-relaxed">
                This wizard will install the <strong>VAgent PLUS! Character Expansion</strong> — a premium collection of 5 ultra-high-fidelity animated companion skins for your Agent V desktop assistant.
              </p>
              <div className="bg-white border border-gray-400 p-2 mb-3">
                <p className="text-[10px] font-bold mb-1" style={{ color: '#4a1c5e' }}>Included Skins:</p>
                <div className="grid grid-cols-1 gap-1">
                  {SKIN_PREVIEWS.map(s => (
                    <div key={s.name} className="flex items-center gap-2 text-[11px]">
                      <span className="w-4 h-4 rounded-sm flex items-center justify-center text-[10px] border border-gray-300" style={{ backgroundColor: s.bg, color: s.color }}>
                        {s.icon}
                      </span>
                      <span className="font-bold">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BETA WARNING */}
              <div className="bg-[#fff3cd] border-2 border-[#ffc107] p-2 mb-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={20} className="text-[#856404] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-[#856404] mb-1">⚠ PLUS! BETA NOTICE</p>
                    <p className="text-[10px] text-[#856404] leading-relaxed">
                      PLUS! features are <strong>beta features</strong> and may cause system instability, visual glitches, or unexpected behavior. Vespera Systems provides <strong>no warranty</strong> for PLUS! components. Install at your own risk.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs">Click Next to continue.</p>
            </>
          )}

          {step === 1 && (
            <>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#4a1c5e' }}>
                PLUS! License & Beta Acknowledgement
              </h3>
              <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 overflow-y-auto text-[10px] font-mono leading-relaxed whitespace-pre-wrap mb-3 min-h-[180px] max-h-[240px]">
{`VESPERA SYSTEMS — VAGENT PLUS! CHARACTER EXPANSION
END-USER LICENSE AGREEMENT & BETA ACKNOWLEDGEMENT
Version 1.0 — Build KB400833

Copyright (C) 1995-1996 Vespera Systems Corporation.
All Rights Reserved.

IMPORTANT — READ CAREFULLY:

1. BETA SOFTWARE DISCLAIMER
The VAgent PLUS! Character Expansion is classified as BETA
SOFTWARE. This means:
  (a) Features may be incomplete, unstable, or subject to change.
  (b) Visual rendering anomalies may occur during skin transitions.
  (c) The expression engine may consume additional system resources.
  (d) Vespera Systems assumes ZERO liability for any cognitive
      dissonance, temporal perception shifts, or existential
      unease caused by prolonged interaction with PLUS! companions.

2. GRANT OF LICENSE
By installing this expansion, you are granted a non-transferable,
non-exclusive license to use the 5 included character skins
(Monitor, Wizard, Cat, Neural, Ghost) on a single Vespera OS
installation.

3. RESTRICTIONS
  (a) You may not decompile or reverse-engineer the SVG animation
      pipeline or expression engine.
  (b) You may not redistribute skin assets outside of the Vespera
      Systems approved distribution channels.
  (c) Do NOT attempt to modify the Ghost skin's spectral frequency
      parameters. The values are calibrated for a reason.

4. KNOWN ISSUES
  - The Monitor skin may display residual phosphor patterns during
    rapid expression state changes.
  - The Neural skin's rotating node animation may cause minor
    GPU temperature increases on S3 Virge adapters.
  - The Ghost skin occasionally renders translucency artifacts
    at screen depths below 16-bit color.

5. TERMINATION
This license terminates automatically if you uninstall the
VAgent PLUS! Character Expansion or violate these terms.

BY PROCEEDING, YOU ACKNOWLEDGE THAT YOU HAVE READ AND AGREE
TO ALL TERMS ABOVE, INCLUDING THE BETA DISCLAIMER.`}
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={acceptedWarning}
                  onChange={e => setAcceptedWarning(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-purple-700"
                />
                <span className="text-xs font-bold">I understand this is beta software and accept all risks</span>
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="font-bold text-lg mb-3" style={{ color: '#4a1c5e' }}>
                Ready to Install
              </h3>
              <p className="mb-3 text-xs">The following components will be installed:</p>
              <div className="border border-gray-400 bg-white p-3 text-xs space-y-1 mb-3">
                <p className="font-bold" style={{ color: '#4a1c5e' }}>PLUS! Components:</p>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked disabled className="w-3 h-3 accent-purple-700" />
                  <span>Monitor CRT Skin (0.4 MB)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked disabled className="w-3 h-3 accent-purple-700" />
                  <span>Wizard Companion Skin (0.5 MB)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked disabled className="w-3 h-3 accent-purple-700" />
                  <span>Cat Companion Skin (0.3 MB)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked disabled className="w-3 h-3 accent-purple-700" />
                  <span>Neural Hub Skin (0.4 MB)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked disabled className="w-3 h-3 accent-purple-700" />
                  <span>Ghost Spectral Skin (0.3 MB)</span>
                </label>
                <div className="border-t border-gray-300 pt-1 mt-1">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked disabled className="w-3 h-3 accent-purple-700" />
                    <span>Expression Engine & Animation Scheduler (0.2 MB)</span>
                  </label>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs mb-1 font-bold">Destination:</label>
                <input
                  type="text"
                  value="C:\VESPERA\SYSTEM\AGENTV\PLUS"
                  readOnly
                  className="w-full border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 bg-white outline-none text-xs font-mono"
                />
              </div>
              <div className="text-[10px] text-gray-600">
                <p>Space required: 2.1 MB</p>
                <p>Space available: 1.2 GB</p>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col h-full">
              <h3 className="font-bold text-lg mb-2" style={{ color: '#4a1c5e' }}>
                <Sparkles size={14} className="inline mr-1 text-yellow-600" />
                Installing PLUS! Expansion
              </h3>
              <p className="mb-2 text-xs">Please wait while the VAgent PLUS! skins are being deployed...</p>

              <div className="mb-1 text-xs font-bold truncate" style={{ color: '#4a1c5e' }}>
                {currentMessage || "Unpacking PLUS! character assets..."}
              </div>

              <div className="mb-2 text-xs truncate text-gray-700">
                {currentFile}
              </div>

              {/* Purple/gold themed progress bar */}
              <div className="w-full h-6 bg-[#c0c0c0] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-[2px] flex mb-2 shrink-0">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full w-[4.5%] mx-[0.25%] transition-colors duration-150`}
                    style={{
                      backgroundColor: i < (progress / 5) ? '#6b21a8' : 'transparent',
                    }}
                  />
                ))}
              </div>

              <div
                ref={logsContainerRef}
                className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 overflow-y-auto text-[10px] font-mono leading-tight"
                style={{ backgroundColor: '#1a0a30', color: '#c084fc' }}
              >
                {installLogs.map((log, i) => (
                  <div key={i} className="truncate">{log}</div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <>
              <h3 className="font-bold text-lg mb-4" style={{ color: '#4a1c5e' }}>
                <Sparkles size={16} className="inline mr-1 text-yellow-600" />
                PLUS! Expansion Installed
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={20} className="text-green-600" />
                <span className="font-bold text-sm">VAgent PLUS! Character Expansion has been installed successfully.</span>
              </div>
              <p className="mb-3 text-xs">
                5 new premium companion skins are now available in <strong>Control Panel → Agent V Properties</strong>.
              </p>
              <div className="bg-white border border-gray-400 p-2 mb-3">
                <p className="text-[10px] font-bold mb-1" style={{ color: '#4a1c5e' }}>Newly available skins:</p>
                <div className="flex gap-2 mt-1">
                  {SKIN_PREVIEWS.map(s => (
                    <div key={s.name} className="flex flex-col items-center gap-0.5">
                      <div
                        className="w-8 h-8 rounded-sm flex items-center justify-center text-sm border border-gray-300"
                        style={{ backgroundColor: s.bg, color: s.color }}
                      >
                        {s.icon}
                      </div>
                      <span className="text-[8px] font-bold">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repeat the beta warning */}
              <div className="bg-[#fff3cd] border border-[#ffc107] p-2">
                <p className="text-[9px] text-[#856404]">
                  <AlertTriangle size={10} className="inline mr-0.5" />
                  Remember: PLUS! skins are beta features. Report any visual anomalies to your system administrator.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Buttons */}
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
        {step > 0 && step < 3 && (
          <button
            onClick={() => setStep(step - 1)}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
          >
            &lt; Back
          </button>
        )}
        {step === 0 && (
          <button
            onClick={() => setStep(1)}
            className="border-2 px-6 py-1 font-bold"
            style={{ backgroundColor: '#6b21a8', color: 'white', borderTopColor: '#a855f7', borderLeftColor: '#a855f7', borderBottomColor: '#3b0764', borderRightColor: '#3b0764' }}
          >
            Next &gt;
          </button>
        )}
        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            disabled={!acceptedWarning}
            className="border-2 px-6 py-1 font-bold disabled:opacity-50"
            style={{ backgroundColor: '#6b21a8', color: 'white', borderTopColor: '#a855f7', borderLeftColor: '#a855f7', borderBottomColor: '#3b0764', borderRightColor: '#3b0764' }}
          >
            Next &gt;
          </button>
        )}
        {step === 2 && (
          <button
            onClick={() => setStep(3)}
            className="border-2 px-6 py-1 font-bold"
            style={{ backgroundColor: '#6b21a8', color: 'white', borderTopColor: '#a855f7', borderLeftColor: '#a855f7', borderBottomColor: '#3b0764', borderRightColor: '#3b0764' }}
          >
            Install
          </button>
        )}
        {step === 4 && (
          <button
            onClick={handleFinish}
            className="border-2 px-6 py-1 font-bold"
            style={{ backgroundColor: '#6b21a8', color: 'white', borderTopColor: '#a855f7', borderLeftColor: '#a855f7', borderBottomColor: '#3b0764', borderRightColor: '#3b0764' }}
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};
