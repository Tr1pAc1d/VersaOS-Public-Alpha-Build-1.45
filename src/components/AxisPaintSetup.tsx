import React, { useState, useEffect, useRef } from 'react';
import { PenTool, CheckCircle2, Palette, Cpu, Download } from 'lucide-react';
import { startVStoreInstallWizardMusic, stopVStoreInstallWizardMusic } from '../utils/audio';

interface AxisPaintSetupProps {
  vfs: {
    installApp: (
      exeName: string,
      displayName: string,
      version: string,
      appId: string,
      placeShortcut?: boolean,
      shortcutIconType?: string
    ) => void;
  };
  onComplete: () => void;
  onCancel: () => void;
}

const INSTALL_FILES = [
  'AXIS_PAINT.EXE',
  'SYNAP_PAL.DLL',
  'HEUR_FILL.VXD',
  'BRUSH_SYNAP_C.DAT',
  'GDI_PLUS_STUB.DLL',
  'VGA_256CLUT.BIN',
  'AXIS_HELP.HLP',
  'LICENSE_AXIS.RTF',
  'UNINST.EXE',
  'PALETTE.INI',
  'CURVE_BEZ.SYS',
  'TEXT_GDI.DLL',
  'FLOOD_SCAN.DRV',
];

const INSTALL_MESSAGES = [
  'Initializing Axis Innovations installer…',
  'Verifying Synap-C brush signatures…',
  'Allocating 256-color LUT in protected memory…',
  'Registering heuristic flood-fill engine…',
  'Linking Vespera GDI compatibility shims…',
  'Writing program group entries…',
  'Deploying desktop shortcut…',
  'Finalizing neural-safe defaults…',
];

/** Dedicated multi-step installer for Axis Paint 2.0 (VStore). */
export const AxisPaintSetup: React.FC<AxisPaintSetupProps> = ({ vfs, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [launchNow, setLaunchNow] = useState(true);
  const [acceptedTos, setAcceptedTos] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const handleFinish = () => {
    vfs.installApp(
      'AXIS_PAINT.EXE',
      'Axis Paint 2.0',
      '2.0.1',
      'axis_paint',
      true,
      'pen'
    );
    onComplete();
    if (launchNow) {
      window.dispatchEvent(new CustomEvent('launch-app', { detail: 'axis_paint' }));
    }
  };

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [installLogs]);

  useEffect(() => {
    if (step !== 3) {
      stopVStoreInstallWizardMusic();
    }
  }, [step]);

  useEffect(() => {
    if (step === 3) {
      const totalDuration = 16000;
      const updateInterval = 150;
      const totalSteps = totalDuration / updateInterval;
      let currentStep = 0;
      let isLagging = false;
      let lagCounter = 0;

      const interval = setInterval(() => {
        if (isLagging) {
          lagCounter--;
          if (lagCounter <= 0) isLagging = false;
          else return;
        } else if (Math.random() > 0.94) {
          isLagging = true;
          lagCounter = Math.floor(Math.random() * 12) + 4;
        }

        currentStep++;
        const newProgress = (currentStep / totalSteps) * 100;
        setProgress(newProgress);

        if (Math.random() > 0.35) {
          const file = INSTALL_FILES[Math.floor(Math.random() * INSTALL_FILES.length)];
          setCurrentFile(file);
          setInstallLogs((prev) => {
            const next = [...prev, `[COPY] C:\\PROGRAMS\\AXISPAINT\\${file}  —  OK`];
            return next.slice(-28);
          });
        }

        if (Math.random() > 0.88) {
          setCurrentMessage(INSTALL_MESSAGES[Math.floor(Math.random() * INSTALL_MESSAGES.length)]);
        }

        if (newProgress >= 100) {
          clearInterval(interval);
          setCurrentFile('AXIS_PAINT.EXE');
          setCurrentMessage('Installation sequence complete.');
          setInstallLogs((prev) => [
            ...prev,
            '[REG] HKLM\\SOFTWARE\\AxisInnovations\\AxisPaint\\2.0',
            '[LNK] Desktop\\Axis Paint 2.0',
            '— Ready —',
          ]);
          setTimeout(() => setStep(4), 700);
        }
      }, updateInterval);

      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="flex flex-col h-full bg-[#0f1419] text-[#c8d4e0] font-sans text-sm border border-[#1e3a5f]">
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[38%] bg-gradient-to-b from-[#0a1628] to-[#050a10] flex flex-col items-center justify-between p-4 shrink-0 border-r border-[#1e3a5f]">
          <div className="flex flex-col items-center mt-6 w-full">
            <div className="relative mb-3">
              <PenTool size={56} className="text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
              <Palette size={22} className="absolute -bottom-1 -right-2 text-[#5b8fc7]" />
            </div>
            <h2 className="text-lg font-black tracking-[0.2em] uppercase text-[#7eb8ff]">Axis Paint</h2>
            <p className="text-[10px] text-[#5a6d82] mt-1 font-mono">Setup Wizard · build 2.0.1</p>
            <div className="mt-4 w-full px-2 space-y-1.5 text-[9px] font-mono text-[#6b7c90] border border-[#1e3a5f] bg-black/40 p-2">
              <div className="flex items-center gap-2">
                <Cpu size={10} className="text-[#22c55e]" />
                <span>Synap-C imaging core</span>
              </div>
              <div className="flex items-center gap-2">
                <Download size={10} className="text-[#f59e0b]" />
                <span>Heuristic fill · 256 LUT</span>
              </div>
            </div>
          </div>
          <div className="mb-2 text-center">
            <p className="text-[9px] text-[#4a5568] font-mono leading-relaxed">
              Axis Innovations
              <br />
              Vespera OS · licensed component
            </p>
          </div>
        </div>

        <div className="w-[62%] p-5 flex flex-col overflow-y-auto bg-[#121a22]">
          {step === 0 && (
            <>
              <h3 className="font-bold text-base mb-3 text-[#7eb8ff] tracking-wide">Welcome to Axis Paint 2.0</h3>
              <p className="mb-3 text-[12px] leading-relaxed text-[#9ca8b8]">
                This wizard installs the official creative imaging suite for Vespera OS: raster editing, Synap-C brush
                profiles, and heuristic flood fill tuned for limited palettes.
              </p>
              <p className="mb-3 text-[12px] leading-relaxed text-[#9ca8b8]">
                Close memory-intensive terminals and neural bridge diagnostics before continuing. Axis Paint registers
                shell handlers for <span className="font-mono text-[#7eb8ff]">.PNG</span>,{' '}
                <span className="font-mono text-[#7eb8ff]">.JPG</span>, and Vespera document containers under{' '}
                <span className="font-mono">C:\PROGRAMS\AXISPAINT</span>.
              </p>
              <p className="text-[11px] text-[#6b7c90]">Click Next to review the license and deployment options.</p>
            </>
          )}

          {step === 1 && (
            <div className="flex flex-col h-full">
              <h3 className="font-bold text-base mb-2 text-[#7eb8ff]">Axis Innovations License</h3>
              <p className="mb-2 text-[11px] text-[#9ca8b8]">
                Read the following terms. Axis Paint includes proprietary Synap-C brush data; redistribution of brush
                packs outside Vespera OS is prohibited.
              </p>
              <div className="flex-1 bg-black/50 border border-[#2a3f5c] p-3 overflow-y-auto text-[10px] font-mono text-[#a8b8c8] mb-4 leading-relaxed">
                AXIS INNOVATIONS END USER LICENSE AGREEMENT (EULA) — AXIS PAINT 2.0
                <br />
                <br />
                1. GRANT. Axis Innovations grants you a non-exclusive license to use Axis Paint on a single Vespera OS
                workspace session.
                <br />
                <br />
                2. SYNAP-C ASSETS. Brush definitions, palette LUTs, and heuristic fill tables are trade secrets. You may
                not reverse engineer or export them to non-Vespera hosts.
                <br />
                <br />
                3. OUTPUT. Artwork you create is yours; bundled stock patterns remain property of Axis Innovations.
                <br />
                <br />
                4. WARRANTY DISCLAIMER. Software is provided &quot;AS IS&quot; without warranty of merchantability or
                fitness for a particular purpose.
                <br />
                <br />
                © 1996 Axis Innovations. All rights reserved.
              </div>
              <div className="flex flex-col gap-1.5 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="axis-tos" checked={acceptedTos} onChange={() => setAcceptedTos(true)} />
                  <span>I accept the agreement</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="axis-tos" checked={!acceptedTos} onChange={() => setAcceptedTos(false)} />
                  <span>I do not accept the agreement</span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <h3 className="font-bold text-base mb-3 text-[#7eb8ff]">Destination Location</h3>
              <p className="mb-3 text-[12px] text-[#9ca8b8]">
                Setup will deploy program files and register the application with the Vespera shell. Your documents and
                saved images remain under <span className="font-mono">DOCUMENTS</span> and{' '}
                <span className="font-mono">DESKTOP</span> unless you choose otherwise from within Axis Paint.
              </p>
              <div className="mb-3">
                <label className="block text-[10px] mb-1 font-bold text-[#7eb8ff]">Program folder</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="C:\PROGRAMS\AXISPAINT"
                    readOnly
                    className="flex-1 border border-[#2a3f5c] px-2 py-1.5 bg-black/40 outline-none font-mono text-[11px] text-[#a8d4ff]"
                  />
                  <button
                    type="button"
                    className="border border-[#3d5a80] px-3 py-1 text-[11px] text-[#9ca8b8] opacity-60 cursor-default"
                  >
                    Browse…
                  </button>
                </div>
              </div>
              <div className="text-[10px] space-y-1 text-[#6b7c90] font-mono">
                <p>Space required: 2.8 MB</p>
                <p>Space available on C: 1.18 GB</p>
                <p>Components: application, brushes, help, uninstaller</p>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col h-full min-h-0">
              <h3 className="font-bold text-base mb-2 text-[#7eb8ff]">Installing Axis Paint 2.0</h3>
              <p className="mb-2 text-[11px] text-[#9ca8b8]">Copying files and configuring the imaging subsystem…</p>
              <div className="mb-1 text-[11px] font-bold truncate text-[#7eb8ff]">{currentMessage || 'Working…'}</div>
              <div className="mb-2 text-[10px] truncate text-[#6b8cae] font-mono">{currentFile}</div>
              <div className="w-full h-6 bg-black/50 border border-[#2a3f5c] p-[2px] flex mb-2 shrink-0">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full w-[4.5%] mx-[0.25%] ${i < progress / 5 ? 'bg-[#1e5a8a]' : 'bg-transparent'}`}
                  />
                ))}
              </div>
              <div
                ref={logsContainerRef}
                className="flex-1 bg-black/40 border border-[#2a3f5c] p-2 overflow-y-auto text-[9px] font-mono leading-tight text-[#7a9ab8] min-h-[120px]"
              >
                {installLogs.map((log, i) => (
                  <div key={i} className="truncate">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <>
              <h3 className="font-bold text-base mb-3 text-[#7eb8ff]">Installation Complete</h3>
              <p className="mb-3 text-[12px] text-[#9ca8b8]">
                Axis Paint 2.0 is ready. A shortcut was placed on your desktop. You can save images to Desktop,
                Documents, or Downloads from the File menu.
              </p>
              <div className="flex items-center gap-2 mt-1 bg-[#0d2840]/80 p-2 border border-[#1e5a8a]">
                <CheckCircle2 size={16} className="text-[#22c55e] shrink-0" />
                <span className="text-[11px] font-bold text-[#a8d4ff]">Synap-C brushes registered · Heuristic fill active</span>
              </div>
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input type="checkbox" checked={launchNow} onChange={(e) => setLaunchNow(e.target.checked)} />
                <span className="font-bold text-[12px]">Launch Axis Paint 2.0 now</span>
              </label>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-[#1e3a5f] p-3 flex justify-end gap-2 bg-[#0a1018] shrink-0">
        {step < 4 && (
          <button
            type="button"
            onClick={onCancel}
            disabled={step === 3}
            className="border border-[#3d5a80] px-5 py-1 text-[12px] text-[#9ca8b8] hover:bg-[#1a2530] disabled:opacity-40"
          >
            Cancel
          </button>
        )}
        {step > 0 && step < 4 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 3}
            className="border border-[#3d5a80] px-5 py-1 text-[12px] text-[#9ca8b8] hover:bg-[#1a2530] disabled:opacity-40"
          >
            &lt; Back
          </button>
        )}
        {step < 3 && (
          <button
            type="button"
            onClick={() => {
              const next = step + 1;
              if (next === 3) startVStoreInstallWizardMusic();
              setStep(next);
            }}
            disabled={step === 1 && !acceptedTos}
            className="border border-[#5b8fc7] px-5 py-1 text-[12px] font-bold text-[#0a1628] bg-[#7eb8ff] hover:bg-[#9cc8ff] disabled:opacity-40 disabled:font-normal"
          >
            Next &gt;
          </button>
        )}
        {step === 4 && (
          <button
            type="button"
            onClick={handleFinish}
            className="border border-[#5b8fc7] px-6 py-1 text-[12px] font-bold text-[#0a1628] bg-[#7eb8ff] hover:bg-[#9cc8ff]"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};
