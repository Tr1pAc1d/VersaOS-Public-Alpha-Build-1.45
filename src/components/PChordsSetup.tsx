import React, { useState, useEffect } from 'react';
import { Music, HardDrive, ChevronRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PChordsSetupProps {
  vfs: any;
  onComplete: () => void;
  onCancel: () => void;
}

const INSTALL_STEPS = [
  'Extracting script.js → C:\\PROGRAMS\\Audio\\Utilities\\PChords\\',
  'Extracting style.css → C:\\PROGRAMS\\Audio\\Utilities\\PChords\\',
  'Extracting index.html → C:\\PROGRAMS\\Audio\\Utilities\\PChords\\',
  'Writing app.manifest.json5...',
  'Registering audio codec interfaces...',
  'Binding OscillatorNode factory to Synap-C audio bridge...',
  'Creating Start Menu entry: Programs > Audio > PChords',
  'Creating desktop shortcut...',
  'Finalizing installation manifest...',
];

export const PChordsSetup: React.FC<PChordsSetupProps> = ({ vfs, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [launchOnFinish, setLaunchOnFinish] = useState(true);

  useEffect(() => {
    if (step !== 3) return;

    let currentProgress = 0;
    let stepIndex = 0;

    const interval = setInterval(() => {
      const increment = 6 + Math.random() * 6;
      currentProgress = Math.min(100, currentProgress + increment);

      const newStepIndex = Math.floor((currentProgress / 100) * INSTALL_STEPS.length);
      if (newStepIndex > stepIndex && newStepIndex < INSTALL_STEPS.length) {
        stepIndex = newStepIndex;
        setLogLines(prev => [...prev, INSTALL_STEPS[stepIndex]]);
      }

      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setLogLines(prev => [...prev, 'Installation complete. [OK]']);
        setTimeout(() => setStep(4), 600);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [step]);

  const handleFinish = () => {
    // 1. Create the folder structure in C:\PROGRAMS\Audio\Utilities\PChords
    //    prog_audio already exists (id: 'prog_audio', parentId: 'programs')
    //    Create Utilities subdirectory
    const utilitiesDir = vfs.createNode('Utilities', 'directory', 'prog_audio', '', undefined, undefined, {
      customIcon: '/Icons/directory_closed-4.png'
    });

    // Create PChords subdirectory inside Utilities
    const pchordsDir = vfs.createNode('PChords', 'directory', utilitiesDir.id, '', undefined, undefined, {
      customIcon: '/Icons/directory_closed-4.png'
    });

    // Populate the source files (mirrors the screenshot's 8-item folder)
    vfs.createNode('app.manifest.json5', 'file', pchordsDir.id, '{\n  "name": "PChords",\n  "version": "1.0.0",\n  "exec": "pchords",\n  "type": "app"\n}', undefined, undefined, {
      customIcon: '/Icons/settings_gear-2.png'
    });
    vfs.createNode('icon-16.png', 'file', pchordsDir.id, '[BINARY: 16x16 PNG]', undefined, undefined, {
      customIcon: '/Icons/paint_file-4.png'
    });
    vfs.createNode('icon-32.png', 'file', pchordsDir.id, '[BINARY: 32x32 PNG]', undefined, undefined, {
      customIcon: '/Icons/paint_file-4.png'
    });
    vfs.createNode('index.html', 'file', pchordsDir.id, '<!DOCTYPE html>\n<html>\n<head><title>PChords</title><link rel="stylesheet" href="style.css"></head>\n<body><script src="script.js"></script></body>\n</html>', undefined, undefined, {
      customIcon: '/Icons/world-2.png'
    });
    vfs.createNode('PChords', 'shortcut', pchordsDir.id, 'pchords', 'pchords', undefined, {
      customIcon: '/Icons/multimedia-4.png'
    });
    vfs.createNode('README.md', 'file', pchordsDir.id, '# PChords\n\nPolyphonic web synthesizer. Click root notes and chord types to play.\n\nSource: windows93.net/apps/pchords\nRebuilt natively for Vespera OS.', undefined, undefined, {
      customIcon: '/Icons/notepad-2.png'
    });
    vfs.createNode('script.js', 'file', pchordsDir.id, '// PChords synthesis engine\n// Rebuilt as native Vespera OS component (PChords.tsx)\n// Original: windows93.net', undefined, undefined, {
      customIcon: '/Icons/executable_gear-0.png'
    });
    vfs.createNode('style.css', 'file', pchordsDir.id, '/* PChords retro styles */\n/* Rebuilt as native Vespera OS component */\nbody { margin: 0; background: #2968a3; }', undefined, undefined, {
      customIcon: '/Icons/paint_old-0.png'
    });

    // 2. Register the app in the VFS programs directory (with shortcut)
    vfs.installApp(
      'PCHORDS.EXE',
      'PChords',
      '1.0.0',
      'pchords',
      true,
      'app'
    );

    onComplete();
    if (launchOnFinish) {
      window.dispatchEvent(new CustomEvent('launch-app', { detail: 'pchords' }));
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex h-full overflow-hidden">
            {/* Left sidebar */}
            <div className="w-1/3 bg-[#2968a3] flex flex-col items-center justify-center gap-3 py-4 shrink-0 border-r border-gray-500">
              <Music size={64} className="text-white opacity-60 mb-2" />
              <div className="bg-white/20 w-3/4 h-[1px]" />
              <p className="text-[9px] text-white/50 font-mono uppercase tracking-widest mt-4 text-center px-2">
                PCHORDS v1.0.0
              </p>
              <p className="text-[8px] text-white/30 font-mono text-center px-2">
                POLYPHONIC SYNTH<br/>FOR VESPERA OS
              </p>
            </div>
            {/* Content */}
            <div className="flex-1 flex flex-col p-5 overflow-y-auto bg-[#ececec]">
              <h2 className="text-xl font-bold text-[#000080] mb-2">Welcome to PChords Setup</h2>
              <p className="text-xs leading-relaxed text-black mb-3">
                This wizard will install <strong>PChords Polyphonic Synthesizer</strong> on your Vespera OS workstation.
              </p>
              <div className="bg-white border border-gray-400 shadow-inner p-3 mb-3 text-[11px] font-mono leading-relaxed text-gray-700">
                <p className="font-bold text-black mb-1">Install Summary:</p>
                <p>Destination: C:\PROGRAMS\Audio\Utilities\PChords</p>
                <p>Size: 12 KB</p>
                <p>Desktop shortcut: Yes</p>
                <p>Audio: Vespera OS Web Audio Bridge</p>
              </div>
              <div className="bg-[#ffffcc] border border-yellow-600 p-2 text-[10px] text-yellow-900 mb-3">
                ⚠ Close all audio applications before proceeding.
              </div>
              <div className="mt-auto flex justify-end gap-2 pt-3">
                <button onClick={() => setStep(1)}
                  className="px-8 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold flex items-center gap-1">
                  Next <ChevronRight size={14} />
                </button>
                <button onClick={onCancel}
                  className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col h-full p-6 bg-[#ececec]">
            <h2 className="text-lg font-bold text-[#000080] mb-2">License Agreement</h2>
            <div className="flex-1 overflow-y-auto bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 text-[10px] font-mono shadow-inner leading-relaxed mb-3">
              <p className="font-bold border-b border-gray-200 pb-1 mb-2">PCHORDS — VESPERA OS PORT LICENSE</p>
              <p>PChords was originally developed for Windows 93 (windows93.net).</p>
              <br />
              <p>This is a faithful native recreation for Vespera OS, using the Web Audio API.</p>
              <p>All chord algorithms, scale logic, and synthesizer behavior replicate the original.</p>
              <br />
              <p>BY CLICKING "I AGREE" YOU ACKNOWLEDGE:</p>
              <p>1. This software is provided for entertainment and education purposes.</p>
              <p>2. Sound output requires a compatible audio adapter (SoundBlaster 16 or higher recommended).</p>
              <p>3. Vespera Systems assumes no liability for any involuntary percussion performances.</p>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setStep(2)}
                className="px-8 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold">
                I Agree
              </button>
              <button onClick={onCancel}
                className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold">
                I Decline
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col h-full p-6 bg-[#ececec]">
            <h2 className="text-lg font-bold text-[#000080] mb-2">Select Destination</h2>
            <p className="text-xs text-black mb-4">PChords will be installed at the following location:</p>
            <div className="flex items-center gap-3 bg-[#dcdcdc] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-4 mb-4">
              <HardDrive size={32} className="text-gray-700" />
              <div className="bg-white border border-gray-400 p-1 flex-1 font-mono text-[11px] text-gray-800">
                C:\PROGRAMS\Audio\Utilities\PChords
              </div>
            </div>
            <div className="text-[10px] font-mono text-gray-600 bg-white border border-gray-300 p-2 mb-4">
              <div className="flex justify-between"><span>Space Required:</span><span>12 KB</span></div>
              <div className="flex justify-between"><span>Space Available:</span><span>1,204 MB</span></div>
            </div>
            <div className="mt-auto flex justify-end gap-2 pt-4">
              <button onClick={() => { setLogLines([]); setStep(3); }}
                className="px-10 py-1.5 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 text-sm font-bold uppercase tracking-wider">
                Install
              </button>
              <button onClick={onCancel}
                className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold">
                Cancel
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col h-full p-6 bg-[#ececec]">
            <h2 className="text-lg font-bold text-[#000080] mb-1">Installing PChords...</h2>
            <p className="text-[10px] text-gray-500 mb-4 uppercase tracking-widest">Deploying audio synthesis modules</p>

            {/* Blocky progress bar */}
            <div className="h-6 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white w-full overflow-hidden relative p-[2px] flex gap-[2px] mb-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i}
                  className={`h-full w-[4.5%] transition-colors duration-150 ${i < (progress / 5) ? 'bg-[#000080]' : 'bg-transparent'}`}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-500 font-mono text-right mb-3">{Math.floor(progress)}%</p>

            {/* Terminal log */}
            <div className="flex-1 bg-black border-2 border-t-gray-900 border-l-gray-900 border-b-gray-600 border-r-gray-600 p-2 overflow-y-auto font-mono text-[9px] text-green-400 leading-relaxed">
              {logLines.map((line, i) => (
                <div key={i}>&gt; {line}</div>
              ))}
              <div className="animate-pulse text-green-300">&gt; _</div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col h-full p-6 bg-[#ececec]">
            <div className="flex items-center gap-4 border-b-2 border-gray-300 pb-4 mb-4">
              <div className="p-3 bg-[#ececec] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-sm">
                <Music size={48} className="text-[#2968a3]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#000080]">Setup Complete</h2>
                <p className="text-xs text-black">PChords was successfully installed to Vespera OS.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-300 p-3 font-mono text-[10px] text-gray-700 mb-4 leading-relaxed">
              <p>✓ C:\PROGRAMS\Audio\Utilities\PChords\PCHORDS.EXE</p>
              <p>✓ C:\PROGRAMS\Audio\Utilities\PChords\script.js</p>
              <p>✓ C:\PROGRAMS\Audio\Utilities\PChords\style.css</p>
              <p>✓ C:\PROGRAMS\Audio\Utilities\PChords\index.html</p>
              <p>✓ C:\PROGRAMS\Audio\Utilities\PChords\app.manifest.json5</p>
              <p>✓ Desktop shortcut created</p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none mb-3">
              <input type="checkbox" checked={launchOnFinish}
                onChange={(e) => setLaunchOnFinish(e.target.checked)}
                className="w-4 h-4" />
              <span className="text-sm font-medium">Launch PChords now</span>
            </label>

            <div className="bg-blue-50 p-3 border border-blue-200 flex gap-3 mb-4">
              <ShieldCheck size={20} className="text-blue-800 shrink-0" />
              <p className="text-[11px] leading-relaxed text-blue-900">
                PChords is now accessible from your Desktop, File Manager at
                <span className="font-mono"> C:\PROGRAMS\Audio\Utilities\PChords\</span>, and the Installed Programs menu.
              </p>
            </div>

            <div className="mt-auto flex justify-end">
              <button onClick={handleFinish}
                className="px-12 py-2 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 text-sm font-bold uppercase tracking-widest shadow-[2px_2px_0_rgba(0,0,0,0.3)]">
                Finish
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#ececec] overflow-hidden select-none">
      {renderStep()}
    </div>
  );
};
