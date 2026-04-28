import React, { useState, useRef, useEffect } from 'react';
import { FileText, Folder, Archive, ArrowDown, Trash2, Plus } from 'lucide-react';
import { VFSNode } from '../hooks/useVFS';

interface VersaZipProps {
  vfs: any;
  zipNodeId?: string | null;
  onClose?: () => void;
}

export const VersaZip: React.FC<VersaZipProps> = ({ vfs, zipNodeId, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);
  const [zipDialog, setZipDialog] = useState<{ progress: number; fileName: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const zipNode: VFSNode | undefined = zipNodeId ? vfs.getNode(zipNodeId) : undefined;
  const contents: VFSNode[] = zipNodeId ? vfs.getChildren(zipNodeId) : [];

  const isZipValid = zipNode && (zipNode.type === 'directory' || zipNode.name?.toLowerCase().endsWith('.zip'));

  // Fake compression animation then move files into zip
  const compressInto = (ids: string[]) => {
    if (!zipNodeId) return;
    const valid = ids.filter(id => {
      const n = vfs.getNode(id);
      return n && n.id !== zipNodeId && n.id !== 'recycle_bin';
    });
    if (valid.length === 0) return;
    let prog = 0;
    setZipDialog({ progress: 0, fileName: zipNode?.name || 'Archive.zip' });
    if (timerRef.current) clearInterval(timerRef.current);
    
    const targetDuration = Math.floor(Math.random() * 25000) + 5000; // 5 to 30 seconds
    const updateInterval = 250;
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += updateInterval;
      prog = Math.min(100, (elapsed / targetDuration) * 100 + (Math.random() * 5));
      
      if (elapsed >= targetDuration || prog >= 100) {
        prog = 100;
        clearInterval(timerRef.current!);
        timerRef.current = null;
        if (valid.length > 0) vfs.queueMove(valid, zipNodeId);
        setTimeout(() => setZipDialog(null), 400);
      }
      setZipDialog({ progress: Math.floor(prog), fileName: zipNode?.name || 'Archive.zip' });
    }, updateInterval);
  };

  // Extract all / selected back to parent
  const extractFiles = (ids: string[]) => {
    if (!zipNode) return;
    const parentId = zipNode.parentId || 'desktop';
    const validIds = ids.filter(id => vfs.getNode(id));
    if (validIds.length > 0) vfs.queueMove(validIds, parentId);
    setSelectedIds(new Set());
  };

  const getIcon = (node: VFSNode) => {
    if (node.customIcon) return <img src={node.customIcon} alt="" className="w-4 h-4 pointer-events-none" style={{ imageRendering: 'pixelated' }} />;
    if (node.type === 'directory') return <Folder size={16} className="text-yellow-600 pointer-events-none" />;
    const name = node.name.toUpperCase();
    if (name.endsWith('.TXT') || name.endsWith('.LOG')) return <FileText size={16} className="text-gray-700 pointer-events-none" />;
    return <FileText size={16} className="text-gray-600 pointer-events-none" />;
  };

  const formatSize = (node: VFSNode) => {
    if (node.type === 'directory') return '—';
    const len = node.content?.length ?? 0;
    if (len < 1024) return `${len} B`;
    return `${(len / 1024).toFixed(1)} KB`;
  };

  const getType = (node: VFSNode) => {
    if (node.type === 'directory') return 'Folder';
    const dot = node.name.lastIndexOf('.');
    return dot === -1 ? 'File' : `${node.name.slice(dot + 1).toUpperCase()} File`;
  };

  if (!isZipValid) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#c0c0c0] p-8 text-center gap-3">
        <Archive size={48} className="text-gray-500" />
        <p className="text-black text-sm font-bold">No archive selected.</p>
        <p className="text-gray-600 text-xs">Double-click a .zip file to open it here.</p>
      </div>
    );
  }

  const totalSize = contents.reduce((acc, n) => acc + (n.content?.length ?? 0), 0);

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] select-none text-black relative">

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b-2 border-t-gray-800 border-gray-400 bg-[#c0c0c0]">
        <button
          className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-[#d4d4d4] active:bg-[#a0a0a0] border border-transparent hover:border-gray-500 rounded-none text-xs disabled:opacity-40"
          disabled={contents.length === 0}
          onClick={() => extractFiles(contents.map(n => n.id))}
          title="Extract All"
        >
          <ArrowDown size={20} className="text-[#000080]" />
          <span>Extract All</span>
        </button>
        <button
          className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-[#d4d4d4] active:bg-[#a0a0a0] border border-transparent hover:border-gray-500 rounded-none text-xs disabled:opacity-40"
          disabled={selectedIds.size === 0}
          onClick={() => extractFiles(Array.from(selectedIds))}
          title="Extract Selected"
        >
          <ArrowDown size={20} className="text-[#005500]" />
          <span>Extract</span>
        </button>
        <div className="w-px h-10 bg-gray-500 mx-1" />
        <button
          className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-[#d4d4d4] active:bg-[#a0a0a0] border border-transparent hover:border-gray-500 rounded-none text-xs disabled:opacity-40"
          disabled={selectedIds.size === 0}
          onClick={() => {
            Array.from(selectedIds).forEach(id => vfs.deleteNode(id));
            setSelectedIds(new Set());
          }}
          title="Delete from Archive"
        >
          <Trash2 size={20} className="text-red-700" />
          <span>Delete</span>
        </button>
        <div className="w-px h-10 bg-gray-500 mx-1" />
        <div
          className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-[#d4d4d4] border border-dashed border-gray-500 rounded-none text-xs cursor-default opacity-70"
          title="Drag files here to add them to the archive"
        >
          <Plus size={20} className="text-gray-600" />
          <span>Drag to Add</span>
        </div>
      </div>

      {/* Archive info bar */}
      <div className="bg-[#f0f0f0] border-b border-gray-400 px-3 py-1 flex items-center gap-2 text-xs">
        <img src="/Icons/Extra Icons/directory_zipper.ico" alt="" className="w-4 h-4" style={{ imageRendering: 'pixelated' }} />
        <span className="font-bold">{zipNode.name}</span>
        <span className="text-gray-500 ml-auto">{contents.length} file{contents.length !== 1 ? 's' : ''}</span>
      </div>

      {/* File List */}
      <div
        ref={dropAreaRef}
        className={`flex-1 overflow-y-auto bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white transition-colors ${isDragOver ? 'bg-blue-50 !border-blue-400' : ''}`}
        onClick={() => setSelectedIds(new Set())}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
        onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={(e) => { if (!dropAreaRef.current?.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
          const data = e.dataTransfer.getData('text/plain');
          if (!data) return;
          try {
            const ids: string[] = data.startsWith('[') ? JSON.parse(data) : [data];
            compressInto(ids);
          } catch {}
        }}
      >
        {/* Column Headers */}
        <div className="flex border-b border-gray-300 bg-[#c0c0c0] sticky top-0 z-10">
          <div className="flex-1 px-2 py-1 text-xs font-bold border-r border-gray-400">Name</div>
          <div className="w-20 px-2 py-1 text-xs font-bold border-r border-gray-400 text-right">Size</div>
          <div className="w-24 px-2 py-1 text-xs font-bold border-r border-gray-400">Type</div>
          <div className="w-28 px-2 py-1 text-xs font-bold">Compressed</div>
        </div>

        {contents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400 italic text-xs">
            <Archive size={32} className="opacity-40" />
            <span>Empty archive — drag files here to add them</span>
          </div>
        ) : (
          contents.map(node => (
            <div
              key={node.id}
              className={`flex items-center cursor-default border-b border-gray-100 hover:bg-[#d4e4ff] pointer-events-auto ${selectedIds.has(node.id) ? 'bg-[#000080] text-white hover:bg-[#000080]' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (e.ctrlKey || e.metaKey) {
                  setSelectedIds(prev => {
                    const next = new Set(prev);
                    if (next.has(node.id)) next.delete(node.id); else next.add(node.id);
                    return next;
                  });
                } else {
                  setSelectedIds(new Set([node.id]));
                }
              }}
              onDoubleClick={() => extractFiles([node.id])}
            >
              <div className="flex-1 px-2 py-1 flex items-center gap-2 text-xs">
                {getIcon(node)}
                <span className="pointer-events-none">{node.name}</span>
              </div>
              <div className="w-20 px-2 py-1 text-xs text-right pointer-events-none">{formatSize(node)}</div>
              <div className="w-24 px-2 py-1 text-xs pointer-events-none">{getType(node)}</div>
              <div className="w-28 px-2 py-1 text-xs pointer-events-none text-gray-500">—</div>
            </div>
          ))
        )}

        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-[#000080] text-white px-4 py-2 text-sm font-bold border-2 border-blue-300">
              Drop to add to archive
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-[#c0c0c0] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 px-2 text-xs flex justify-between">
        <span>{selectedIds.size > 0 ? `${selectedIds.size} object(s) selected` : `${contents.length} object(s)`}</span>
        <span>Total size: {totalSize < 1024 ? `${totalSize} B` : `${(totalSize / 1024).toFixed(1)} KB`}</span>
      </div>

      {/* Compression Dialog */}
      {zipDialog && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/30">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-72">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide flex items-center gap-2">
              <img src="/Icons/Extra Icons/directory_zipper.ico" alt="" className="w-4 h-4" style={{ imageRendering: 'pixelated' }} />
              Adding to Archive
            </div>
            <div className="p-4">
              <div className="text-sm text-black mb-2">Adding to: <span className="font-bold">{zipDialog.fileName}</span></div>
              <div className="text-xs text-black mb-3">Please wait while files are compressed...</div>
              <div className="w-full h-5 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-hidden">
                <div className="h-full bg-[#000080] transition-all duration-100" style={{ width: `${zipDialog.progress}%` }} />
              </div>
              <div className="text-xs text-right text-black mt-1">{zipDialog.progress}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
