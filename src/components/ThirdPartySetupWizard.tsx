import React, { useState, useEffect, useRef } from 'react';
import { Package, ChevronRight, HardDrive, ShieldCheck, CheckCircle2, Terminal, AlertTriangle } from 'lucide-react';
import type { AppManifest } from '../types/pluginTypes';
import { registerApp } from '../utils/systemRegistry';

interface ThirdPartySetupWizardProps {
  manifest: AppManifest;
  vfs: any;
  onComplete: (manifest: AppManifest) => void;
  onCancel: () => void;
}

/** Clutter files injected into every plugin's Program_Files folder for OS realism. */
function buildClutterFiles(baseName: string, upperBase: string, pfDirId: string, appId: string) {
  return [
    {
      id: `pf_dll_${appId}`,
      name: `${upperBase}32.DLL`,
      type: 'file' as const,
      parentId: pfDirId,
      content: `[System.Runtime.InteropServices]\nEntryPoint=${appId}\nStatus=OK`,
      customIcon: '/Icons/gears_tweakui_a-0.png',
    },
    {
      id: `pf_sys_${appId}`,
      name: `${upperBase}.SYS`,
      type: 'file' as const,
      parentId: pfDirId,
      content: 'MODE=STRICT\nDEPENDENCY_CHECK=1\nSANDBOX=1',
      customIcon: '/Icons/file_gears-2.png',
    },
    {
      id: `pf_vxd_${appId}`,
      name: `${upperBase}_RT.VXD`,
      type: 'file' as const,
      parentId: pfDirId,
      content: 'VXDTYPE=PLUGIN_RUNTIME\nVERSION=4',
      customIcon: '/Icons/memory-1.png',
    },
    {
      id: `pf_cfg_${appId}`,
      name: 'config.ini',
      type: 'file' as const,
      parentId: pfDirId,
      content: '[Settings]\nSandboxed=1\nUseHardwareAcceleration=0\nLanguage=en-US',
      customIcon: '/Icons/notepad_file_gear-0.png',
    },
    {
      id: `pf_rdm_${appId}`,
      name: 'ReadMe.txt',
      type: 'file' as const,
      parentId: pfDirId,
      content: `Application: ${baseName}\nVersion: 1.0\n\nThird-party plugin installed via VStore Developer Import.\nDo not modify these core files.`,
      customIcon: '/Icons/notepad-2.png',
    },
  ];
}

const INSTALL_LOG_LINES = (name: string, upper: string) => [
  `Verifying VStore signature for ${name}...`,
  `Allocating Program_Files directory...`,
  `Extracting: C:\\VESPERA\\Program_Files\\${upper}\\${upper}.EXE`,
  `Extracting: C:\\VESPERA\\Program_Files\\${upper}\\${upper}32.DLL`,
  `Extracting: C:\\VESPERA\\Program_Files\\${upper}\\${upper}.SYS`,
  `Extracting: C:\\VESPERA\\Program_Files\\${upper}\\${upper}_RT.VXD`,
  `Extracting: C:\\VESPERA\\Program_Files\\${upper}\\config.ini`,
  `Extracting: C:\\VESPERA\\Program_Files\\${upper}\\ReadMe.txt`,
  `Registering plugin manifest in system registry...`,
  `Creating desktop shortcut...`,
  `Linking DLL dependency vectors...`,
  `Registration sequence complete.`,
];

export const ThirdPartySetupWizard: React.FC<ThirdPartySetupWizardProps> = ({
  manifest,
  vfs,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [eulaChecked, setEulaChecked] = useState(false);
  const [launchOnFinish, setLaunchOnFinish] = useState(true);
  const logsRef = useRef<HTMLDivElement>(null);

  const upper = manifest.name.replace(/\s+/g, '_').toUpperCase();
  const baseName = manifest.name;
  const appId = `plugin_${manifest.id}`;
  const pfDirId = `pf_dir_${appId}`;
  const installPath = `C:\\VESPERA\\Program_Files\\${upper}`;

  // Auto-scroll logs
  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logLines]);

  // Drive the install progress bar
  useEffect(() => {
    if (step !== 3) return;
    const lines = INSTALL_LOG_LINES(baseName, upper);
    let lineIdx = 0;
    let prog = 0;

    const interval = setInterval(() => {
      prog += Math.random() * 12 + 4;
      if (prog >= 100) {
        prog = 100;
        setProgress(100);
        setLogLines(prev => [...prev, ...lines.slice(lineIdx), 'Installation successful.']);
        clearInterval(interval);
        setTimeout(() => setStep(4), 800);
        return;
      }
      setProgress(prog);
      if (lineIdx < lines.length) {
        setLogLines(prev => [...prev, lines[lineIdx]]);
        lineIdx++;
      }
    }, 350);

    return () => clearInterval(interval);
  }, [step]);

  // ── VFS install ────────────────────────────────────────────────────────────
  const handleFinish = () => {
    // 0. Ensure the plugin is registered in the system registry (idempotent).
    //    This handles cases where registerApp was skipped or its event missed.
    try {
      registerApp(manifest); // fires 'plugin-installed' event → GUIOS adds window to state
    } catch {
      // registerApp throws only if manifest invalid; fire the event manually as fallback
      window.dispatchEvent(new CustomEvent('plugin-installed', {
        detail: {
          manifest,
          windowId: `plugin_${manifest.id}`,
          installedAt: new Date().toISOString(),
        },
      }));
    }

    // 1. Create the plugin exe node (isApp = true, so dependency check works)
    vfs.installApp(
      `${upper}.EXE`,
      manifest.name,
      manifest.version,
      appId,
      true,           // desktop shortcut
      'app',
      manifest.iconUrl || undefined,  // custom icon → applied to shortcut + exe node
    );

    // 2. Create the .ico file node
    const iconFileId = `pf_ico_${appId}`;
    if (!vfs.nodes.find((n: any) => n.id === iconFileId)) {
      vfs.createNode(
        `${upper}.ico`,
        'file',
        pfDirId,
        `[ICON]\nSource=${manifest.iconUrl}`,
        undefined,
        undefined,
        { id: iconFileId, customIcon: manifest.iconUrl || '/Icons/application_hourglass-0.png' },
      );
    }

    // 3. Create clutter files (dll, sys, vxd, ini, readme)
    const clutterFiles = buildClutterFiles(baseName, upper, pfDirId, appId);
    clutterFiles.forEach(f => {
      if (!vfs.nodes.find((n: any) => n.id === f.id)) {
        vfs.createNode(f.name, f.type, f.parentId, f.content, undefined, undefined, {
          id: f.id,
          customIcon: f.customIcon,
        });
      }
    });

    onComplete(manifest);

    if (launchOnFinish) {
      // Give GUIOS time to process the plugin-installed event and add the window
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('launch-app', { detail: `plugin_${manifest.id}` }));
      }, 600);
    }
  };

  // ── Steps ──────────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {

      // ── Step 0: Welcome ──────────────────────────────────────────────────
      case 0:
        return (
          <div className="flex h-full overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 flex flex-col items-center justify-center gap-4 py-6 shrink-0 border-r border-gray-600 relative overflow-hidden" style={{ backgroundImage: 'url("/Vespera Setup Wizard background image.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-[#000080]/55 pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center justify-center gap-4 w-full px-4">
                <div className="w-16 h-16 border-2 border-white/20 bg-white/10 flex items-center justify-center overflow-hidden backdrop-blur-sm">
                  {manifest.iconUrl ? (
                    <img
                      src={manifest.iconUrl}
                      alt={manifest.name}
                      className="w-12 h-12 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <Package size={40} className="text-white opacity-80" />
                  )}
                </div>
                <p className="text-[9px] text-white/70 font-mono uppercase tracking-widest text-center px-2 leading-relaxed drop-shadow">
                  Vespera<br/>Plugin<br/>Installer
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-[#000080] mb-1">Welcome to the {manifest.name} Setup</h2>
              <p className="text-[11px] text-gray-600 font-mono mb-4">v{manifest.version} · by {manifest.author}</p>

              <p className="text-xs leading-relaxed text-black mb-3">
                This wizard will install <strong>{manifest.name}</strong> — a third-party plugin — into your Vespera OS environment.
              </p>
              <p className="text-xs leading-relaxed text-black mb-4">
                {manifest.description}
              </p>

              <div className="bg-[#fffbe6] border border-yellow-500 p-3 text-[10px] font-mono text-yellow-900 flex gap-2 items-start mb-4">
                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-yellow-600" />
                <span>
                  This is a <strong>third-party plugin</strong> imported via VStore Developer Import.
                  Vespera Systems does not guarantee the safety or quality of community software.
                </span>
              </div>

              <div className="mt-auto flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold flex items-center gap-1"
                >
                  Next <ChevronRight size={14} />
                </button>
                <button
                  onClick={onCancel}
                  className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );

      // ── Step 1: EULA ─────────────────────────────────────────────────────
      case 1:
        return (
          <div className="flex flex-col h-full p-6">
            <h2 className="text-lg font-bold text-[#000080] mb-2">End-User License Agreement</h2>
            <div className="flex-1 overflow-y-auto bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 text-[10px] font-mono shadow-inner leading-relaxed">
              <p className="font-bold border-b border-gray-200 pb-1 mb-2">VESPERA SYSTEMS — PLUGIN LICENSE v1.0</p>
              <p>BY INSTALLING THIS PLUGIN, YOU AGREE TO THE FOLLOWING TERMS:</p>
              <br />
              <p>1. THIRD-PARTY SOFTWARE: This plugin is provided by a third-party developer and is not produced, endorsed, or audited by Vespera Systems or Axis Innovations.</p>
              <br />
              <p>2. USE: THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. THE AUTHOR BEARS SOLE RESPONSIBILITY FOR ITS BEHAVIOR.</p>
              <br />
              <p>3. SANDBOX: This plugin will execute within the Vespera OS plugin sandbox. It may access only the System API methods exposed at runtime.</p>
              <br />
              <p>4. RESTRICTIONS: REVERSE ENGINEERING OF SYSTEM DRIVERS AND KERNEL INTERFACES IS PROHIBITED UNDER THE AXIS INNOVATIONS CHARTER.</p>
              <br />
              <p>5. TERMINATION: This license terminates automatically upon uninstallation or violation of any kernel protection policy.</p>
              <br />
              <p>DO YOU ACCEPT THESE TERMS?</p>
            </div>
            <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
              <input type="checkbox" checked={eulaChecked} onChange={e => setEulaChecked(e.target.checked)} className="w-4 h-4" />
              <span className="text-xs">I accept the terms in the License Agreement</span>
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setStep(2)}
                disabled={!eulaChecked}
                className="px-8 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next &gt;
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      // ── Step 2: Install Location ─────────────────────────────────────────
      case 2:
        return (
          <div className="flex flex-col h-full p-6">
            <h2 className="text-lg font-bold text-[#000080] mb-2">Select Destination Path</h2>
            <p className="text-xs text-black mb-4">
              The installer will deploy <strong>{manifest.name}</strong> to the following directory:
            </p>
            <div className="flex flex-col gap-3 bg-[#dcdcdc] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-4 mb-4">
              <div className="flex items-center gap-3">
                <HardDrive size={32} className="text-gray-700 shrink-0" />
                <div className="bg-white border border-gray-400 p-2 flex-1 font-mono text-[11px] text-gray-800">
                  {installPath}
                </div>
              </div>
              <p className="text-[10px] text-gray-500 italic">Space required: {manifest.size || '~1.0 MB'}</p>
            </div>

            <div className="bg-white border border-gray-300 p-3 text-[10px] font-mono text-gray-700 mb-4">
              <p className="font-bold mb-1">Files that will be created:</p>
              <ul className="space-y-0.5 text-gray-600">
                <li>• {upper}.EXE — application entry point</li>
                <li>• {upper}.ico — application icon</li>
                <li>• {upper}32.DLL — runtime library</li>
                <li>• {upper}.SYS — system driver stub</li>
                <li>• {upper}_RT.VXD — virtual device extension</li>
                <li>• config.ini, ReadMe.txt</li>
              </ul>
            </div>

            <div className="mt-auto flex justify-end gap-2 pt-4">
              <button
                onClick={() => { setLogLines([]); setProgress(0); setStep(3); }}
                className="px-10 py-1.5 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 text-sm font-bold uppercase tracking-wider"
              >
                Install
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        );

      // ── Step 3: Installing ───────────────────────────────────────────────
      case 3:
        return (
          <div className="flex flex-col h-full p-6">
            <h2 className="text-lg font-bold text-[#000080] mb-1">Installing {manifest.name}...</h2>
            <p className="text-[10px] text-gray-500 font-mono mb-4 uppercase tracking-widest">Deploying plugin modules to system registry</p>

            <div className="h-6 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white w-full overflow-hidden relative p-[2px] flex gap-[2px] mb-3">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-full w-[4.5%] ${i < (progress / 5) ? 'bg-[#000080]' : 'bg-transparent'} transition-colors duration-200`}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-500 font-mono text-right mb-3">{Math.floor(progress)}%</p>

            <div
              ref={logsRef}
              className="flex-1 bg-black text-[#00ff41] font-mono text-[10px] p-2 overflow-y-auto border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white leading-relaxed"
            >
              {logLines.map((line, i) => (
                <div key={i}>&gt; {line}</div>
              ))}
              {progress < 100 && <div className="animate-pulse">&gt; _</div>}
            </div>
          </div>
        );

      // ── Step 4: Finish ───────────────────────────────────────────────────
      case 4:
        return (
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center gap-4 border-b-2 border-gray-300 pb-4 mb-4">
              <div className="p-3 bg-[#ececec] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-sm flex items-center justify-center w-20 h-20 shrink-0">
                {manifest.iconUrl ? (
                  <img
                    src={manifest.iconUrl}
                    alt={manifest.name}
                    className="w-12 h-12 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <Package size={48} className="text-blue-800" />
                )}
              </div>
              <div>
                <CheckCircle2 size={20} className="text-green-600 mb-1" />
                <h2 className="text-xl font-bold text-[#000080]">Setup Complete</h2>
                <p className="text-xs text-black">{manifest.name} v{manifest.version} was successfully installed.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 py-2">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={launchOnFinish}
                  onChange={e => setLaunchOnFinish(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium group-hover:text-blue-800">Launch {manifest.name} now</span>
              </label>

              <div className="bg-blue-50 p-3 border border-blue-200 flex gap-3">
                <ShieldCheck size={20} className="text-blue-800 shrink-0" />
                <div className="text-[11px] leading-relaxed text-blue-900">
                  <p><strong>{manifest.name}</strong> is now accessible from your Desktop and Start → Installed Programs.</p>
                  <p className="mt-1 text-[10px] font-mono text-blue-700">Installed to: {installPath}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex justify-end">
              <button
                onClick={handleFinish}
                className="px-12 py-2 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 text-sm font-bold uppercase tracking-widest shadow-[2px_2px_0_rgba(0,0,0,0.3)]"
              >
                Finish
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#ececec] overflow-hidden select-none">
      {/* Progress indicator strip */}
      <div className="flex items-center gap-0 border-b border-gray-400 bg-[#c0c0c0] px-4 py-1.5 text-[10px] font-bold text-gray-700 shrink-0">
        {['Welcome', 'License', 'Location', 'Installing', 'Finish'].map((label, i) => (
          <React.Fragment key={label}>
            <span className={`${step === i ? 'text-[#000080] underline' : step > i ? 'text-gray-500' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < 4 && <span className="mx-2 text-gray-400">›</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {renderStep()}
      </div>
    </div>
  );
};
