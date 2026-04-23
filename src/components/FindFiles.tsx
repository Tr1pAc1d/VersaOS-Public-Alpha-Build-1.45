import React, { useState, useMemo, useCallback } from 'react';
import { Search, FolderOpen, FileText } from 'lucide-react';
import { playUIClickSound, playErrorSound } from '../utils/audio';

type VfsNode = { id: string; name: string; type: string; parentId: string | null };

interface FindFilesProps {
  vfs: {
    nodes: VfsNode[];
    getNode: (id: string) => VfsNode | undefined;
  };
  onOpenFile: (fileId: string) => void;
  onOpenContainingFolder: (parentId: string) => void;
}

/** * and ? wildcard, case-insensitive */
function matchPattern(name: string, pattern: string): boolean {
  const p = pattern.trim();
  if (!p) return false;
  const esc = p.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  try {
    return new RegExp(`^${esc}$`, 'i').test(name);
  } catch {
    return name.toLowerCase() === p.toLowerCase();
  }
}

function buildPath(nodes: VfsNode[], nodeId: string): string {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return '';
  if (!node.parentId) return node.name;
  return `${buildPath(nodes, node.parentId)}\\${node.name}`;
}

export const FindFiles: React.FC<FindFilesProps> = ({ vfs, onOpenFile, onOpenContainingFolder }) => {
  const [pattern, setPattern] = useState('*.*');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<VfsNode[]>([]);
  const [status, setStatus] = useState('Enter a name pattern (* and ? wildcards) and click Search Now.');

  const runSearch = useCallback(() => {
    const pat = pattern.trim() || '*';
    playUIClickSound();
    setSearching(true);
    setResults([]);
    setStatus('Searching all fixed drives…');

    const delay = 280 + Math.random() * 400;
    window.setTimeout(() => {
      const hits = vfs.nodes.filter(
        (n) => (n.type === 'file' || n.type === 'shortcut') && matchPattern(n.name, pat),
      );
      setResults(hits);
      setSearching(false);
      setStatus(hits.length === 0 ? `Finished: no files matched "${pat}".` : `Finished: ${hits.length} item(s) found.`);
    }, delay);
  }, [pattern, vfs.nodes]);

  const rows = useMemo(() => {
    return results.map((n) => ({
      node: n,
      path: buildPath(vfs.nodes, n.id),
    }));
  }, [results, vfs.nodes]);

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans p-3 gap-2 select-none min-h-0">
      <div className="flex items-center gap-2 border-b-2 border-gray-500 pb-2 shrink-0">
        <Search className="text-[#000080]" size={20} />
        <div>
          <h1 className="text-sm font-bold">Find Files</h1>
          <p className="text-[10px] text-gray-700">Search drive C: by file name (read-only).</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2 shrink-0">
        <div className="flex flex-col gap-0.5 min-w-[180px] flex-1">
          <label className="text-[10px] font-bold text-gray-700">Named</label>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            disabled={searching}
            className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-sm font-mono bg-white"
            placeholder="*.*"
          />
        </div>
        <button
          type="button"
          disabled={searching}
          onClick={runSearch}
          className="px-4 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs font-bold disabled:opacity-50 hover:bg-[#dcdcdc] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white"
        >
          Search Now
        </button>
      </div>

      <p className="text-[10px] text-gray-700 shrink-0">{status}</p>

      <div className="flex-1 min-h-[120px] bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-auto text-xs font-mono">
        {rows.length === 0 ? (
          <div className="p-3 text-gray-500">No results yet.</div>
        ) : (
          <ul className="divide-y divide-gray-300">
            {rows.map(({ node, path }) => (
              <li
                key={node.id}
                className="flex items-center gap-2 px-2 py-1 hover:bg-[#000080] hover:text-white cursor-default group"
              >
                {node.type === 'directory' ? (
                  <FolderOpen size={14} className="shrink-0 text-yellow-700 group-hover:text-yellow-200" />
                ) : (
                  <FileText size={14} className="shrink-0 text-blue-800 group-hover:text-blue-200" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{node.name}</div>
                  <div className="text-[10px] opacity-80 truncate">{path}</div>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100">
                  {node.type === 'file' && (
                    <button
                      type="button"
                      className="px-1 py-0.5 border border-current text-[10px] font-bold"
                      onClick={() => {
                        playUIClickSound();
                        onOpenFile(node.id);
                      }}
                    >
                      Open
                    </button>
                  )}
                  <button
                    type="button"
                    className="px-1 py-0.5 border border-current text-[10px] font-bold"
                    onClick={() => {
                      const parent = node.parentId;
                      if (!parent) {
                        playErrorSound();
                        window.dispatchEvent(new CustomEvent('vespera-system-error', {
                          detail: { type: 'Access Error', title: 'Cannot Open Folder', message: `The file "${node.name}" is in a system root folder and cannot be opened.`, fatal: false }
                        }));
                        return;
                      }
                      playUIClickSound();
                      onOpenContainingFolder(parent);
                    }}
                  >
                    Folder
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
