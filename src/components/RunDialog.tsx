import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { playUIClickSound, playErrorSound } from '../utils/audio';

const MRU_KEY = 'vespera_run_mru';
const MRU_MAX = 8;

function readMru(): string[] {
  try {
    const raw = localStorage.getItem(MRU_KEY);
    if (!raw) return [];
    const a = JSON.parse(raw);
    return Array.isArray(a) ? a.filter((x) => typeof x === 'string').slice(0, MRU_MAX) : [];
  } catch {
    return [];
  }
}

function writeMru(lines: string[]) {
  try {
    localStorage.setItem(MRU_KEY, JSON.stringify(lines.slice(0, MRU_MAX)));
  } catch {
    /* ignore */
  }
}

interface RunDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (line: string) => void;
}

export const RunDialog: React.FC<RunDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const [line, setLine] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [mru, setMru] = useState<string[]>(() => readMru());

  useEffect(() => {
    if (isOpen) {
      setMru(readMru());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        playUIClickSound();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pushMru = (entry: string) => {
    const t = entry.trim();
    if (!t) return;
    const next = [t, ...mru.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MRU_MAX);
    setMru(next);
    writeMru(next);
  };

  const doRun = () => {
    const t = line.trim();
    if (!t) {
      playErrorSound();
      return;
    }
    playUIClickSound();
    pushMru(t);
    onSubmit(t);
    setLine('');
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-[20000] flex items-center justify-center bg-black/40"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.45)] w-[min(420px,92vw)] font-sans text-black select-none"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm flex items-center gap-2">
          <Play size={14} className="shrink-0" />
          Run
        </div>
        <div className="p-4 flex flex-col gap-3">
          <p className="text-xs">Type the name of a program, folder, document, or Internet resource, and Vespera will open it for you.</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold whitespace-nowrap">Open:</span>
            <input
              ref={inputRef}
              type="text"
              value={line}
              onChange={(e) => setLine(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  doRun();
                }
              }}
              className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-sm font-mono bg-white"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          {mru.length > 0 && (
            <div className="text-[10px] text-gray-700">
              <span className="font-bold">Recent:</span>{' '}
              {mru.slice(0, 5).map((x, i) => (
                <button
                  key={i}
                  type="button"
                  className="underline text-[#000080] hover:text-red-700 mr-2"
                  onClick={() => {
                    playUIClickSound();
                    setLine(x);
                  }}
                >
                  {x.length > 40 ? `${x.slice(0, 37)}…` : x}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                playUIClickSound();
                onClose();
              }}
              className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-sm font-bold min-w-[72px] hover:bg-[#d8d8d8] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={doRun}
              className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-sm font-bold min-w-[72px] hover:bg-[#d8d8d8] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Exported for Run handler: resolve notepad + file argument against VFS. */
export function findVfsFileByName(
  nodes: { id: string; name: string; type: string }[],
  fileName: string,
): { id: string; name: string; type: string } | undefined {
  const want = fileName.trim().toLowerCase();
  if (!want) return undefined;
  return nodes.find((n) => n.type === 'file' && n.name.toLowerCase() === want);
}

export function findVfsFileLoose(
  nodes: { id: string; name: string; type: string }[],
  fileName: string,
): { id: string; name: string; type: string } | undefined {
  const want = fileName.trim().toLowerCase();
  if (!want) return undefined;
  const exact = nodes.find((n) => n.type === 'file' && n.name.toLowerCase() === want);
  if (exact) return exact;
  return nodes.find((n) => n.type === 'file' && n.name.toLowerCase().includes(want));
}
