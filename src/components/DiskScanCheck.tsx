import React, { useState, useCallback, useRef, useEffect } from 'react';
import { HardDrive, Search, FileWarning } from 'lucide-react';
import { playUIClickSound } from '../utils/audio';

type VfsApi = {
  nodes: { id: string; name: string; type: string; parentId: string | null }[];
  getNode: (id: string) => { id: string; name: string; type: string; parentId: string | null; content?: string } | undefined;
  updateFileContent: (id: string, content: string) => void;
  createNode: (
    name: string,
    type: 'file' | 'directory' | 'shortcut',
    parentId: string,
    content?: string,
    targetId?: string,
    iconType?: string,
    extra?: Record<string, unknown>
  ) => { id: string };
};

interface DiskScanCheckProps {
  vfs: VfsApi;
  neuralBridgeActive?: boolean;
}

type ScanMode = 'quick' | 'thorough';
type Phase = 'idle' | 'running' | 'done' | 'error';

const LOG_NAME = 'SCANCHK.LOG';
const LOG_PARENT = 'v_logs';

function formatSessionLog(params: {
  checked: number;
  dirs: number;
  files: number;
  mode: ScanMode;
  neuralBridgeActive: boolean;
  hadGlitch: boolean;
}): string {
  const when = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const lines = [
    `--- Vespera Disk Checker session ${when} ---`,
    `Drive C: (FAT16)  Mode: ${params.mode === 'thorough' ? 'THOROUGH' : 'QUICK'}`,
    `Folders scanned: ${params.dirs}  Files scanned: ${params.files}  Total entries: ${params.checked}`,
    `Lost clusters: 0  Cross-linked files: 0  Invalid filenames: 0`,
  ];

  if (params.mode === 'thorough') {
    lines.push(
      `FAT mirrors: consistent  |  Free cluster estimate: within spec  |  Bad sector map: 0 pending`,
      `Directory depth scan: max depth OK  |  LFN / 8.3 alias table: reconciled`,
      `Volume label "VESPERA" matches boot block  |  Last known clean shutdown flag: SET`,
    );
  }

  lines.push(
    params.hadGlitch
      ? `Surface analysis: completed with 1 transient read retry (sector remapped).`
      : `Surface analysis: no errors detected.`,
    params.neuralBridgeActive
      ? `NOTICE: X-Type analog bus noise suppressed during FAT verification pass.`
      : null,
    `Result: ${params.hadGlitch ? 'COMPLETE (minor)' : 'COMPLETE — volume appears consistent.'}`,
    '',
  );

  return lines.filter(Boolean).join('\n');
}

const THOROUGH_PREFLIGHT: { label: string; ms: number }[] = [
  { label: 'Reading master boot record & partition table… OK', ms: 820 },
  { label: 'Comparing FAT copy #1 with FAT copy #2 (mirror verify)…', ms: 1100 },
  { label: 'Walking free-cluster bitmap; marking suspicious chains… none found', ms: 950 },
  { label: 'Validating root directory entries (. and ..)…', ms: 780 },
  { label: 'Cross-checking parent directory pointers (thorough pass)…', ms: 1050 },
  { label: 'IDE interface: soft reset channel 0; ready for surface pass', ms: 640 },
  { label: 'Building in-memory path index for deep tree traversal…', ms: 880 },
];

function thoroughDetailLine(
  n: { name: string; type: string },
  subStep: number,
  index: number,
): string {
  const kind = n.type === 'directory' ? 'DIR' : n.type === 'shortcut' ? 'LNK' : 'FILE';
  const clusterHint = 2 + ((index * 7 + subStep * 3) % 509);
  switch (subStep) {
    case 0:
      return `[${kind}] FAT: tracing cluster chain starting at ${clusterHint} — ${n.name}`;
    case 1:
      return `[${kind}] Verifying directory entry checksum (soft)… OK — ${n.name}`;
    default:
      return n.type === 'directory'
        ? `[DIR] Enumerating . / .. ; short name alias stable — ${n.name}`
        : `[${kind}] EOF marker & allocation size consistent — ${n.name}`;
  }
}

export const DiskScanCheck: React.FC<DiskScanCheckProps> = ({ vfs, neuralBridgeActive }) => {
  const [mode, setMode] = useState<ScanMode>('quick');
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState('');
  const [lastSummary, setLastSummary] = useState<string | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const ensureLogFile = useCallback((): string | null => {
    const parent = vfs.getNode(LOG_PARENT);
    if (!parent || parent.type !== 'directory') return null;
    const existing = vfs.nodes.find(
      (n) => n.parentId === LOG_PARENT && n.name.toUpperCase() === LOG_NAME.toUpperCase() && n.type === 'file'
    );
    if (existing) return existing.id;
    const created = vfs.createNode(LOG_NAME, 'file', LOG_PARENT, '');
    return created.id;
  }, [vfs]);

  const runScan = useCallback(() => {
    if (phase === 'running') return;
    playUIClickSound();
    cancelRef.current = false;

    const logId = ensureLogFile();
    if (!logId) {
      setPhase('error');
      setLastSummary('Could not access VESPERA\\LOGS. Volume metadata missing.');
      return;
    }

    const all = vfs.nodes.filter((n) => n.id !== 'root');
    const ordered = [...all].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    const maxQuick = Math.min(120, Math.max(24, Math.ceil(ordered.length * 0.15)));
    const toScan = mode === 'thorough' ? ordered : ordered.slice(0, maxQuick);

    let preflightIdx = 0;
    let i = 0;
    let subStep = 0;
    let dirs = 0;
    let files = 0;
    const hadGlitchRef = { v: false };

    const subStepsPerNode = mode === 'thorough' ? 3 : 1;
    const preflightUnits = mode === 'thorough' ? THOROUGH_PREFLIGHT.length : 0;
    const totalUnits = preflightUnits + toScan.length * subStepsPerNode;
    let doneUnits = 0;

    const bumpProgress = () => {
      doneUnits = Math.min(doneUnits + 1, totalUnits);
      setProgress(Math.min(99, Math.round((doneUnits / totalUnits) * 100)));
    };

    setPhase('running');
    setProgress(0);
    setCurrentLabel(mode === 'thorough' ? 'Initializing thorough surface & FAT analysis…' : 'Preparing volume bitmap…');
    setLastSummary(null);

    const step = () => {
      if (cancelRef.current) {
        setPhase('idle');
        setCurrentLabel('Stopped by user.');
        return;
      }

      if (i >= toScan.length) {
        const checked = toScan.length;
        const block = formatSessionLog({
          checked,
          dirs,
          files,
          mode,
          neuralBridgeActive: !!neuralBridgeActive,
          hadGlitch: hadGlitchRef.v,
        });
        const prev = vfs.getNode(logId)?.content || '';
        const nextContent = prev ? `${prev}\n${block}` : block;
        vfs.updateFileContent(logId, nextContent);
        setProgress(100);
        setCurrentLabel('Scan complete. Report appended to SCANCHK.LOG');
        setLastSummary(`Logged ${checked} entries to VESPERA\\LOGS\\${LOG_NAME}`);
        setPhase('done');
        playUIClickSound();
        return;
      }

      if (mode === 'thorough' && preflightIdx < THOROUGH_PREFLIGHT.length) {
        const p = THOROUGH_PREFLIGHT[preflightIdx];
        setCurrentLabel(p.label);
        bumpProgress();
        preflightIdx++;
        window.setTimeout(step, p.ms);
        return;
      }

      const n = toScan[i];

      if (mode === 'quick') {
        if (n.type === 'directory') dirs++;
        else files++;
        setCurrentLabel(`Checking ${n.type === 'directory' ? 'folder' : 'file'}: ${n.name}`);
        bumpProgress();
        if (neuralBridgeActive && Math.random() > 0.992) {
          hadGlitchRef.v = true;
        }
        i++;
        const delay = 6 + Math.random() * 14;
        window.setTimeout(step, delay);
        return;
      }

      // Thorough: three detailed sub-steps per entry
      if (subStep < 3) {
        setCurrentLabel(thoroughDetailLine(n, subStep, i));
        bumpProgress();
        if (neuralBridgeActive && Math.random() > 0.985) {
          hadGlitchRef.v = true;
        }
        subStep++;
        const subDelay = 72 + Math.random() * 88;
        window.setTimeout(step, subDelay);
        return;
      }

      if (n.type === 'directory') dirs++;
      else files++;
      subStep = 0;
      i++;
      const betweenDelay = 28 + Math.random() * 42;
      window.setTimeout(step, betweenDelay);
    };

    const startDelay = mode === 'thorough' ? 650 : 400;
    window.setTimeout(step, startDelay);
  }, [phase, mode, vfs, ensureLogFile, neuralBridgeActive]);

  const stopScan = () => {
    playUIClickSound();
    cancelRef.current = true;
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans p-3 gap-3 select-none overflow-y-auto">
      <div className="flex items-start gap-2 border-b-2 border-gray-500 pb-2">
        <HardDrive className="text-[#000080] shrink-0 mt-0.5" size={22} />
        <div>
          <h1 className="text-sm font-bold">Disk Checker</h1>
          <p className="text-[11px] text-gray-700">Check drive C: for errors (read-only). Results append to VESPERA\LOGS\SCANCHK.LOG.</p>
        </div>
      </div>

      <div className="flex gap-4 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="scanmode"
            checked={mode === 'quick'}
            disabled={phase === 'running'}
            onChange={() => {
              playUIClickSound();
              setMode('quick');
            }}
          />
          <span>Quick scan</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="scanmode"
            checked={mode === 'thorough'}
            disabled={phase === 'running'}
            onChange={() => {
              playUIClickSound();
              setMode('thorough');
            }}
          />
          <span>Thorough</span>
        </label>
      </div>
      {mode === 'thorough' && phase !== 'running' && (
        <p className="text-[10px] text-gray-600 -mt-1 leading-snug">
          Thorough mode runs a FAT mirror pass, free-cluster walk, then three verification steps per file or folder — expect a noticeably longer scan on large disks.
        </p>
      )}

      <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 min-h-[80px] text-xs font-mono leading-snug break-words">
        {phase === 'error' ? (
          <span className="text-red-800 flex items-center gap-1">
            <FileWarning size={14} /> {lastSummary}
          </span>
        ) : (
          <span className="text-gray-800">{currentLabel || 'Ready.'}</span>
        )}
      </div>

      <div className="w-full h-5 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-0.5">
        <div
          className="h-full bg-[#000080] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-[10px] text-gray-600 -mt-1">{progress}%</div>

      {lastSummary && phase !== 'error' && (
        <p className="text-[11px] text-green-900 font-bold">{lastSummary}</p>
      )}

      <div className="flex flex-wrap gap-2 mt-auto">
        <button
          type="button"
          disabled={phase === 'running'}
          onClick={runScan}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs font-bold disabled:opacity-50 hover:bg-[#d8d8d8] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white"
        >
          <Search size={14} /> Start
        </button>
        <button
          type="button"
          disabled={phase !== 'running'}
          onClick={stopScan}
          className="px-3 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs font-bold disabled:opacity-50 hover:bg-[#d8d8d8] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white"
        >
          Stop
        </button>
      </div>
    </div>
  );
};
