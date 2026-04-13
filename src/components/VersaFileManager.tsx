import React, { useState, useEffect, useRef } from 'react';
import { Folder, FileText, ArrowUp, Monitor, ShieldAlert } from 'lucide-react';
import { VFSNode } from '../hooks/useVFS';
import { RETRO_ICONS } from '../utils/retroIcons';
import { playDiskLoadSound } from '../utils/audio';

interface VersaFileManagerProps {
  vfs: any;
  onOpenFile: (nodeId: string) => void;
  downloadedFiles?: string[];
  onLaunchApp?: (appId: string) => void;
  neuralBridgeActive?: boolean;
  onContextMenu?: (e: React.MouseEvent, nodeId: string) => void;
  /** Bump nonce and set id to jump the file manager to a folder (e.g. from Find Files). */
  focusDirectoryNonce?: number;
  focusDirectoryId?: string | null;
  isPickerMode?: boolean;
  onCancel?: () => void;
}

const iconMap: Record<string, string> = {
  '.EXE': 'file_exe',
  '.COM': 'file_exe',
  '.BAT': 'file_bat',
  '.SYS': 'mem_stick',
  '.VXD': 'mem_stick',
  '.DRV': 'mem_stick',
  '.DLL': 'file_generic3',
  '.INI': 'file_generic2',
  '.CFG': 'file_generic2',
  '.INF': 'file_generic2',
  '.TXT': 'file_txt',
  '.LOG': 'file_txt',
};

export const VersaFileManager: React.FC<VersaFileManagerProps> = ({ 
  vfs, 
  onOpenFile, 
  downloadedFiles = [], 
  onLaunchApp,
  neuralBridgeActive = false,
  onContextMenu,
  focusDirectoryNonce = 0,
  focusDirectoryId = null,
  isPickerMode = false,
  onCancel,
}) => {
  useEffect(() => {
    playDiskLoadSound();
  }, []);

  useEffect(() => {
    if (!focusDirectoryNonce || !focusDirectoryId) return;
    const n = vfs.getNode(focusDirectoryId);
    if (n && n.type === 'directory') {
      setCurrentDir((prev) => (prev === focusDirectoryId ? prev : focusDirectoryId));
      setSelectedNode(null);
    }
  }, [focusDirectoryNonce, focusDirectoryId, vfs]);

  const [currentDir, setCurrentDir] = useState<string>('root');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [associationModal, setAssociationModal] = useState<{ isOpen: boolean, nodeId: string, fileName: string }>({ isOpen: false, nodeId: '', fileName: '' });
  const [accessDeniedModal, setAccessDeniedModal] = useState<{ isOpen: boolean, fileName: string }>({ isOpen: false, fileName: '' });
  // File-manager-local context menu
  const [fmCtx, setFmCtx] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [fmRenamingId, setFmRenamingId] = useState<string | null>(null);
  const [fmRenameValue, setFmRenameValue] = useState('');
  const fmAreaRef = useRef<HTMLDivElement>(null);

  const currentDirNode = vfs.getNode(currentDir);

  const TECHNICAL_EXTENSIONS = ['.DLL', '.SYS', '.CFG', '.INI', '.VXD', '.INF'];
  const PROTECTED_EXTENSIONS = ['.DLL', '.SYS', '.VXD'];

  // Resolve absolute path
  const getAbsolutePath = (nodeId: string): string => {
    const node = vfs.getNode(nodeId);
    if (!node) return '';
    if (!node.parentId) return node.name.toUpperCase();
    return `${getAbsolutePath(node.parentId)}\\${node.name.toUpperCase()}`;
  };

  const getFileIcon = (node: VFSNode) => {
    if (node.customIcon) return node.customIcon;
    const dotIndex = node.name.lastIndexOf('.');
    if (dotIndex === -1) return null;
    const ext = node.name.slice(dotIndex).toUpperCase();
    const iconId = iconMap[ext];
    if (iconId) {
      return RETRO_ICONS.find(i => i.id === iconId)?.url || null;
    }
    return null;
  };

  const isHidden = (node: VFSNode) => {
    if (node.name.startsWith('.')) return true;
    const path = getAbsolutePath(node.id).toUpperCase();
    return path.includes('\\SYSTEM\\') || path.endsWith('\\SYSTEM');
  };

  const absolutePath = getAbsolutePath(currentDir);
  const [pathInput, setPathInput] = useState(absolutePath);
  const [pathError, setPathError] = useState(false);

  useEffect(() => {
    setPathInput(absolutePath);
  }, [absolutePath]);

  const handlePathSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const targetPath = pathInput.trim().toUpperCase();
      let foundNode = null;
      
      const allNodes = vfs.nodes || [];
      for (const node of allNodes) {
        if (node.type === 'directory') {
           const path = getAbsolutePath(node.id).toUpperCase();
           if (path === targetPath) {
             foundNode = node;
             break;
           }
        }
      }
      
      if (foundNode) {
        setCurrentDir(foundNode.id);
        setSelectedNode(null);
      } else {
        setPathError(true);
      }
    }
  };

  let children = vfs.getChildren(currentDir);

  const handleDoubleClick = (node: VFSNode) => {
    if (node.type === 'directory') {
      setCurrentDir(node.id);
      setSelectedNode(null);
    } else if (node.type === 'shortcut') {
      if (isPickerMode) {
        onOpenFile(node.id);
      } else if (node.content && onLaunchApp) {
        onLaunchApp(node.content);
      }
    } else {
      if (isPickerMode) {
        onOpenFile(node.id);
        return;
      }
      const upperName = node.name.toUpperCase();
      
      if (upperName.endsWith('.TXT') || upperName.endsWith('.LOG')) {
        onOpenFile(node.id);
        return;
      }

      const isTechnical = TECHNICAL_EXTENSIONS.some(ext => upperName.endsWith(ext));

      if (isTechnical) {
        setAssociationModal({ isOpen: true, nodeId: node.id, fileName: node.name });
        return;
      }

      if (node.name.endsWith('.EXE') && currentDirNode?.name === 'DOWNLOADS' && onLaunchApp) {
        if (node.name === 'AETHERIS_NET_MON_SETUP.EXE') {
          onLaunchApp('netmon_setup');
        } else if (node.name === 'RHID_SUBSYSTEM_SETUP.EXE') {
          onLaunchApp('rhid_setup');
        } else if (node.name === 'AW_RELEASE_RADAR_SETUP.EXE') {
          onLaunchApp('aw_release_radar_setup');
        } else {
          onLaunchApp(node.id); // Default to opening it as an app if it's an exe (handled by GUIOS if configured)
        }
      } else {
        onOpenFile(node.id);
      }
    }
  };

  const handleProgramSelect = (programId: string) => {
    const upperName = associationModal.fileName.toUpperCase();
    const isProtected = PROTECTED_EXTENSIONS.some(ext => upperName.endsWith(ext));

    if (isProtected) {
      setAccessDeniedModal({ isOpen: true, fileName: associationModal.fileName });
      setAssociationModal({ ...associationModal, isOpen: false });
    } else {
      setAssociationModal({ ...associationModal, isOpen: false });
      if (programId === 'versa_edit') {
        onOpenFile(associationModal.nodeId);
      } else if (onLaunchApp) {
        onLaunchApp(programId);
      }
    }
  };

  const handleUp = () => {
    if (currentDirNode?.parentId) {
      setCurrentDir(currentDirNode.parentId);
      setSelectedNode(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans relative">
      {/* Menu Bar */}
      <div className="flex gap-4 px-2 py-1 border-b border-gray-500 text-sm">
        <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">File</span>
        <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Directory</span>
        <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">View</span>
        <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Help</span>
      </div>

      {/* Address Bar */}
      <div className="flex items-center gap-2 p-2 border-b-2 border-gray-500 bg-[#c0c0c0]">
        <button 
          onClick={handleUp}
          disabled={!currentDirNode?.parentId}
          className="p-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50"
        >
          <ArrowUp size={16} />
        </button>
        <span className="text-sm font-bold ml-2">Path:</span>
        <input 
          type="text"
          value={pathInput}
          onChange={(e) => setPathInput(e.target.value)}
          onKeyDown={handlePathSubmit}
          className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-sm font-mono truncate outline-none"
        />
      </div>
      
      {/* Main Content Split Pane */}
      <div className="flex flex-1 overflow-hidden p-2 gap-2 relative">
        {/* Left Sidebar */}
        <div className="w-32 flex flex-col gap-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#c0c0c0] p-2 shrink-0 overflow-y-auto">
          <div className="font-bold text-xs mb-2 border-b-2 border-gray-500 pb-1 text-black">Quick Links</div>
          <button onClick={() => { setCurrentDir('root'); setSelectedNode(null); }} className="text-left text-xs text-black hover:bg-[#000080] hover:text-white px-1 py-1 w-full truncate border border-transparent active:border-dotted active:border-black">C:\</button>
          <button onClick={() => { setCurrentDir('desktop'); setSelectedNode(null); }} className="text-left text-xs text-black hover:bg-[#000080] hover:text-white px-1 py-1 w-full truncate border border-transparent active:border-dotted active:border-black">Desktop</button>
          <button onClick={() => { setCurrentDir('documents'); setSelectedNode(null); }} className="text-left text-xs text-black hover:bg-[#000080] hover:text-white px-1 py-1 w-full truncate border border-transparent active:border-dotted active:border-black">Documents</button>
          <button onClick={() => { setCurrentDir('vespera'); setSelectedNode(null); }} className="text-left text-xs text-black hover:bg-[#000080] hover:text-white px-1 py-1 w-full truncate border border-transparent active:border-dotted active:border-black">System</button>
        </div>

        {/* File Area */}
        <div 
          ref={fmAreaRef}
          className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-y-auto flex flex-wrap gap-4 content-start p-2 relative"
          onClick={() => { setFmCtx(null); setFmRenamingId(null); }}
          onContextMenu={(e) => {
            // Right-click on empty area of file pane — no-op (suppress browser menu)
            e.preventDefault();
            e.stopPropagation();
            setFmCtx(null);
          }}
        >
          {children.map((node: VFSNode) => {
            const iconUrl = getFileIcon(node);
            const hidden = isHidden(node);
            const isRenaming = fmRenamingId === node.id;
            
            return (
            <div 
              key={node.id}
              onClick={(e) => { e.stopPropagation(); setSelectedNode(node.id); setFmCtx(null); }}
              onDoubleClick={() => handleDoubleClick(node)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedNode(node.id);
                const rect = fmAreaRef.current?.getBoundingClientRect();
                setFmCtx({
                  x: e.clientX - (rect?.left ?? 0),
                  y: e.clientY - (rect?.top ?? 0),
                  nodeId: node.id,
                });
              }}
              className={`flex flex-col items-center gap-1 w-20 p-2 cursor-pointer border border-transparent ${selectedNode === node.id ? 'bg-[#000080] text-white border-dotted !border-white' : 'hover:border-dotted hover:border-gray-400'}`}
              style={{ opacity: hidden ? 0.5 : 1 }}
            >
              {iconUrl ? (
                <div className="relative">
                  <img src={iconUrl} alt="icon" className="w-[32px] h-[32px] drop-shadow-md pointer-events-none" style={{ imageRendering: 'pixelated' }} draggable={false} />
                  {node.type === 'shortcut' && (
                    <div className="absolute -bottom-1 -left-1 bg-white border border-dotted border-black w-3 h-3 flex items-center justify-center">
                      <div className="w-1 h-1 bg-black" />
                    </div>
                  )}
                </div>
              ) : node.type === 'directory' ? (
                <Folder size={32} className={selectedNode === node.id ? 'text-white' : 'text-yellow-600'} />
              ) : node.type === 'shortcut' ? (
                <div className="relative">
                  <Monitor size={32} className={selectedNode === node.id ? 'text-white' : 'text-blue-600'} />
                  <div className="absolute -bottom-1 -left-1 bg-white rounded-sm p-0.5">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M10 9l-6 6 6 6"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>
                  </div>
                </div>
              ) : (
                <FileText size={32} className={selectedNode === node.id ? 'text-white' : 'text-gray-600'} />
              )}
              {isRenaming ? (
                <input
                  autoFocus
                  className="text-xs text-center w-full border bg-white text-black border-[#000080] outline-none px-0.5"
                  value={fmRenameValue}
                  onChange={e => setFmRenameValue(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      if (fmRenameValue.trim()) vfs.renameNode(node.id, fmRenameValue.trim());
                      setFmRenamingId(null);
                    }
                    if (e.key === 'Escape') setFmRenamingId(null);
                  }}
                  onBlur={() => {
                    if (fmRenameValue.trim()) vfs.renameNode(node.id, fmRenameValue.trim());
                    setFmRenamingId(null);
                  }}
                />
              ) : (
                <span className="text-xs text-center break-words w-full line-clamp-2">
                  {node.name}
                </span>
              )}
            </div>
          )})}
          
          {neuralBridgeActive && currentDirNode?.parentId === null && (
            <div className="flex flex-col items-center gap-1 w-20 p-2 cursor-pointer border border-transparent hover:border-dotted hover:border-red-400 group">
              <Folder size={32} className="text-red-800 group-hover:text-red-400 group-hover:animate-ping" />
              <span className="text-xs text-center break-words w-full font-mono text-red-900">
                SHADOW_SECTOR
              </span>
            </div>
          )}

          {children.length === 0 && (!neuralBridgeActive || currentDirNode?.parentId !== null) && (
            <div className="w-full text-center text-gray-500 text-sm mt-4 italic">
              0 object(s)
            </div>
          )}

          {/* ── File Manager context menu ── */}
          {fmCtx && (() => {
            const ctxNode = vfs.getNode(fmCtx.nodeId);
            if (!ctxNode) return null;
            return (
              <div
                className="absolute bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] z-[200] flex flex-col py-1"
                style={{ left: fmCtx.x, top: fmCtx.y, minWidth: 160 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Open */}
                <button
                  className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm font-bold"
                  onClick={() => {
                    handleDoubleClick(ctxNode);
                    setFmCtx(null);
                  }}
                >
                  Open
                </button>
                <div className="h-[1px] bg-gray-400 mx-1 my-1" />
                {/* Cut / Copy (greyed) */}
                <button className="text-left px-4 py-1 text-black text-sm opacity-40 cursor-default">Cut</button>
                <button className="text-left px-4 py-1 text-black text-sm opacity-40 cursor-default">Copy</button>
                {/* Delete */}
                <button
                  className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm"
                  onClick={() => {
                    vfs.deleteNode(fmCtx.nodeId);
                    setFmCtx(null);
                  }}
                >
                  Delete
                </button>
                <div className="h-[1px] bg-gray-400 mx-1 my-1" />
                {/* Rename */}
                <button
                  className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm"
                  onClick={() => {
                    setFmRenamingId(ctxNode.id);
                    setFmRenameValue(ctxNode.name);
                    setFmCtx(null);
                  }}
                >
                  Rename
                </button>
                <div className="h-[1px] bg-gray-400 mx-1 my-1" />
                {/* Properties — bubble up to GUIOS FileProperties window */}
                <button
                  className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm"
                  onClick={() => {
                    if (onContextMenu) onContextMenu(
                      { preventDefault: () => {}, stopPropagation: () => {}, clientX: 0, clientY: 0 } as any,
                      `__properties__${fmCtx.nodeId}`
                    );
                    setFmCtx(null);
                  }}
                >
                  Properties
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[#c0c0c0] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 px-2 text-xs text-black flex justify-between tracking-wide">
        <span>{children.length} object(s)</span>
        <span>Free Space: 42.1 MB</span>
      </div>

      {/* Picker Footer */}
      {isPickerMode && (
        <div className="bg-[#c0c0c0] border-t border-gray-500 p-2 flex justify-end gap-2 shadow-inner drop-shadow-md">
           <button 
             disabled={!selectedNode || vfs.getNode(selectedNode)?.type === 'directory'}
             onClick={() => { if (selectedNode) onOpenFile(selectedNode); }}
             className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black hover:bg-[#d0d0d0] disabled:opacity-50"
           >
             Insert Object
           </button>
           <button 
             onClick={() => { if (onCancel) onCancel(); }}
             className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black hover:bg-[#d0d0d0]"
           >
             Cancel
           </button>
        </div>
      )}

      {/* Modals */}
      {pathError && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/20">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-80 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide">Error</div>
            <div className="p-4 flex gap-4 items-center">
              <ShieldAlert size={32} className="text-black fill-yellow-400" strokeWidth={1.5} />
              <span className="text-sm">Directory not found.</span>
            </div>
            <div className="p-3 flex justify-center">
              <button 
                onClick={() => { setPathError(false); setPathInput(absolutePath); }} 
                className="px-8 py-1 font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white focus:outline-none"
                autoFocus
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {associationModal.isOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/20">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-96 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide">File Association</div>
            <div className="p-4 flex flex-col gap-3">
              <span className="text-sm font-bold">Vespera OS cannot open this file directly.</span>
              <span className="text-xs italic">What program do you want to use to open [ {associationModal.fileName} ]?</span>
              
              <div className="flex flex-col gap-1 border-2 border-inset border-gray-800 bg-white p-1 max-h-40 overflow-y-auto">
                {['browser', 'versa_edit', 'workbench'].map(pid => (
                  <div 
                    key={pid}
                    onClick={() => handleProgramSelect(pid)}
                    className="px-2 py-1 text-xs cursor-pointer hover:bg-[#000080] hover:text-white"
                  >
                    {pid === 'browser' ? 'Vespera Navigator' : pid === 'versa_edit' ? 'Notepad' : 'AETHERIS Workbench'}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 flex justify-end gap-2 border-t border-gray-400">
              <button 
                onClick={() => setAssociationModal({ ...associationModal, isOpen: false })} 
                className="px-4 py-1 text-xs border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {accessDeniedModal.isOpen && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/30">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-[#800000] border-r-[#800000] w-[400px] shadow-[8px_8px_0px_rgba(0,0,0,0.6)]">
            <div className="bg-[#800000] text-white px-2 py-1 font-bold text-sm tracking-wide flex justify-between items-center">
              <span>SYSTEM ACCESS VIOLATION</span>
              <span className="cursor-pointer" onClick={() => setAccessDeniedModal({ isOpen: false, fileName: '' })}>×</span>
            </div>
            <div className="p-6 flex gap-4 items-start">
              <div className="w-12 h-12 bg-red-600 rounded-sm flex items-center justify-center border-2 border-t-white border-l-white border-b-black border-r-black shrink-0 shadow-lg">
                <span className="text-white text-3xl font-bold">!</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold uppercase text-red-900 underline">Access Denied</span>
                <p className="text-xs leading-relaxed">
                  The file <span className="font-mono bg-white px-1 border border-gray-400">[{accessDeniedModal.fileName}]</span> is a protected system component.
                </p>
                <p className="text-xs font-bold text-[#800000] border-t border-gray-400 pt-2">
                  Modifying or accessing this component requires X-TYPE Admin level access, which is currently LOCKED.
                </p>
              </div>
            </div>
            <div className="p-4 flex justify-center bg-gray-300 border-t border-gray-500">
              <button 
                onClick={() => setAccessDeniedModal({ isOpen: false, fileName: '' })} 
                className="px-10 py-1 font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white focus:outline-none hover:bg-gray-200"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

