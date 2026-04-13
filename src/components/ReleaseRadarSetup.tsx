import React, { useState, useEffect, useRef } from 'react';
import { Music, CheckCircle2, Radio, Sparkles } from 'lucide-react';

interface ReleaseRadarSetupProps {
  vfs: any;
  onComplete: () => void;
  onCancel: () => void;
}

const INSTALL_FILES = [
  "release_radar.exe", "aw_audio_engine.dll", "neon_filters.vxd", "wave_synth.h", "radar_config.ini",
  "artist_roster.db", "stream_buffer.sys", "atlantic_waves_ui.dll", "spectrum_analyzer.vxd",
  "midi_driver.sys", "v-core_lib.dll", "aetheris_link.sys", "latency_fixer.vxd"
];

export const ReleaseRadarSetup: React.FC<ReleaseRadarSetupProps> = ({ vfs, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const handleFinish = () => {
    vfs.installApp(
      'AW_RELEASE_RADAR.EXE',
      'AW Release Radar',
      '1.0',
      'aw_release_radar',
      true,      // place shortcut
      'music',   // iconType
    );
    onComplete();
  };

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [installLogs]);

  useEffect(() => {
    if (step === 2) {
      const totalDuration = 5000; // 5 seconds for this special installer
      const updateInterval = 100;
      const totalSteps = totalDuration / updateInterval;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const newProgress = (currentStep / totalSteps) * 100;
        setProgress(newProgress);

        if (Math.random() > 0.4) {
          const file = INSTALL_FILES[Math.floor(Math.random() * INSTALL_FILES.length)];
          setCurrentFile(file);
          setInstallLogs(prev => [...prev, `Streaming: C:\\VESPERA\\PROGRAMS\\ATLANTIC_WAVES\\${file}`].slice(-15));
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setStep(3);
        }
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="flex flex-col h-full bg-[#000033] text-[#00ffcc] font-serif text-sm border-4 border-double border-[#00ffcc]">
      {/* Visual Header */}
      <div className="bg-black border-b-2 border-[#00ffcc] px-4 py-2 flex items-center justify-between">
         <span className="font-black italic tracking-tighter text-[#ff00ff]">ATLANTIC WAVES INSTALLER</span>
         <Sparkles size={16} className="text-[#ffff00] animate-pulse" />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-gradient-to-b from-[#00ffcc] via-[#ff00ff] to-[#00ffcc] flex flex-col items-center justify-center p-4 text-black shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '10px 10px' }}></div>
          <Music size={64} className="mb-4 relative z-10 drop-shadow-lg" />
          <h2 className="text-xl font-black italic text-center relative z-10 tracking-tighter">RELEASE<br/>RADAR</h2>
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-6 flex flex-col bg-black/40">
          {step === 0 && (
            <>
              <h3 className="font-bold text-lg mb-4 text-[#ff00ff]">Welcome to the Official Atlantic Waves Release Radar Setup</h3>
              <p className="mb-4 leading-relaxed">This installer will provision the official Release Radar application on your Vespera OS desktop.</p>
              <p className="mb-4 italic">Experience the latest waves from Virtua-Core, Aetheris-9, and the rest of the Atlantic Waves roster.</p>
              <p className="mt-auto text-xs opacity-60 italic">Licensed for non-commercial synaptic use only.</p>
            </>
          )}

          {step === 1 && (
            <>
              <h3 className="font-bold text-lg mb-4 text-[#ff00ff]">Stationary Point</h3>
              <p className="mb-4">Select the node where you would like to store the Release Radar telemetry.</p>
              <div className="mb-4">
                <label className="block text-xs mb-1 opacity-60">Installation Path</label>
                <div className="flex gap-2">
                  <input type="text" value="C:\VESPERA\PROGRAMS\ATLANTIC_WAVES" readOnly className="flex-1 border-2 border-[#00ffcc] bg-black px-2 py-1 text-[#00ffcc] outline-none" />
                </div>
              </div>
              <div className="text-xs space-y-1 opacity-60">
                <p>Telemetry Size: 4.2 MB</p>
                <p>Node Capacity: Sufficient</p>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col h-full">
              <h3 className="font-bold text-lg mb-2 text-[#ff00ff]">Syncing Waves...</h3>
              <div className="mb-1 text-xs font-mono">
                {currentFile ? `Extracting ${currentFile}` : "Initializing handshake..."}
              </div>

              <div className="w-full h-6 bg-black border-2 border-[#00ffcc] p-[2px] flex mb-2 shrink-0">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-full w-[4.5%] mx-[1%] ${i < (progress / 5) ? 'bg-[#ff00ff] shadow-[0_0_5px_#ff00ff]' : 'bg-transparent'}`}
                  />
                ))}
              </div>

              <div ref={logsContainerRef} className="flex-1 bg-black/60 border border-[#00ffcc]/30 p-2 overflow-y-auto text-[10px] font-mono leading-tight text-[#00ffcc]/60">
                {installLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center text-center h-full gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#00ffcc] flex items-center justify-center animate-bounce shadow-[0_0_15px_#00ffcc]">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#00ffcc]">Setup Complete</h3>
                <p className="text-sm mt-2">The Release Radar has been successfully synced to your workstation.</p>
              </div>
              <Radio size={48} className="text-[#ff00ff] opacity-20 absolute bottom-8 right-8" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="border-t-2 border-[#00ffcc] p-4 flex justify-end gap-3 bg-black/20 shrink-0">
        {step < 3 && (
            <button 
              onClick={onCancel}
              disabled={step === 2}
              className="bg-black border-2 border-[#00ffcc] px-6 py-1 text-xs font-bold hover:bg-[#00ffcc] hover:text-black transition-colors disabled:opacity-30"
            >
              ABORT
            </button>
        )}
        {step === 0 && (
          <button 
            onClick={() => setStep(1)}
            className="bg-[#00ffcc] text-black border-2 border-white px-6 py-1 text-xs font-black italic hover:scale-105 active:scale-95 transition-all shadow-[0_0_10px_#00ffcc]"
          >
            PROCEED &gt;&gt;
          </button>
        )}
        {step === 1 && (
          <button 
            onClick={() => setStep(2)}
            className="bg-[#ff00ff] text-white border-2 border-white px-6 py-1 text-xs font-black italic hover:scale-105 active:scale-95 transition-all shadow-[0_0_10px_#ff00ff]"
          >
            SYNC NOW
          </button>
        )}
        {step === 3 && (
          <button 
            onClick={handleFinish}
            className="bg-[#00ffcc] text-black border-2 border-white px-10 py-2 text-xs font-black italic hover:scale-105 active:scale-95 transition-all shadow-[0_0_10px_#00ffcc]"
          >
            ENJOY THE WAVES
          </button>
        )}
      </div>
    </div>
  );
};
