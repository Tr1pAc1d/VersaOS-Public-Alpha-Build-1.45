import React, { useState, useEffect, useRef } from 'react';
import { Folder, FileText, ArrowUp, Monitor, ShieldAlert, ChevronRight } from 'lucide-react';
import { APP_DICTIONARY, getCompatibleApps } from '../utils/appDictionary';
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

  const lastProcessedNonce = useRef<number>(0);

  useEffect(() => {
    if (!focusDirectoryNonce || !focusDirectoryId) return;
    if (focusDirectoryNonce === lastProcessedNonce.current) return;
    lastProcessedNonce.current = focusDirectoryNonce;
    
    const n = vfs.getNode(focusDirectoryId);
    if (n && n.type === 'directory') {
      setCurrentDir((prev) => (prev === focusDirectoryId ? prev : focusDirectoryId));
      setSelectedNodes(new Set());
    }
  }, [focusDirectoryNonce, focusDirectoryId, vfs]);

  const [currentDir, setCurrentDir] = useState<string>('root');
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [lassoSelection, setLassoSelection] = useState<{ startX: number, startY: number, currentX: number, currentY: number, active: boolean } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [associationModal, setAssociationModal] = useState<{ isOpen: boolean, nodeId: string, fileName: string }>({ isOpen: false, nodeId: '', fileName: '' });
  const [accessDeniedModal, setAccessDeniedModal] = useState<{ isOpen: boolean, fileName: string }>({ isOpen: false, fileName: '' });
  // File-manager-local context menu (on a file/folder node)
  const [fmCtx, setFmCtx] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  // Background (empty-area) context menu
  const [fmBgCtx, setFmBgCtx] = useState<{ x: number; y: number } | null>(null);
  // Zip compression dialog
  const [zipDialog, setZipDialog] = useState<{ active: boolean; progress: number; fileName: string } | null>(null);
  const zipTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => { if (!fmCtx) setOpenWithNodeId(null); }, [fmCtx]);
  const [fmRenamingId, setFmRenamingId] = useState<string | null>(null);
  const [fmRenameValue, setFmRenameValue] = useState('');
  const [openWithNodeId, setOpenWithNodeId] = useState<string | null>(null);
  const [openWithPos, setOpenWithPos] = useState<{ x: number; y: number } | null>(null);
  const fmAreaRef = useRef<HTMLDivElement>(null);

  const currentDirNode = vfs.getNode(currentDir);

  /** Returns true for nodes that are zip archives (directory type + .zip name) */
  const isZipNode = (node: VFSNode) => node.type === 'directory' && node.name.toLowerCase().endsWith('.zip');

  /** Simulate compression then move files into the zip node */
  const compressIntoZip = (fileIds: string[], zipNodeId: string, zipName: string) => {
    let prog = 0;
    setZipDialog({ active: true, progress: 0, fileName: zipName });
    if (zipTimerRef.current) clearInterval(zipTimerRef.current);
    
    const targetDuration = Math.floor(Math.random() * 25000) + 5000; // 5 to 30 seconds
    const updateInterval = 250;
    let elapsed = 0;

    zipTimerRef.current = setInterval(() => {
      elapsed += updateInterval;
      prog = Math.min(100, (elapsed / targetDuration) * 100 + (Math.random() * 5));
      
      if (elapsed >= targetDuration || prog >= 100) {
        prog = 100;
        clearInterval(zipTimerRef.current!);
        zipTimerRef.current = null;
        const validIds = fileIds.filter(id => {
          const n = vfs.getNode(id);
          return n && n.id !== zipNodeId && n.id !== 'recycle_bin';
        });
        if (validIds.length > 0) vfs.queueMove(validIds, zipNodeId);
        setTimeout(() => setZipDialog(null), 400);
      }
      setZipDialog({ active: true, progress: Math.floor(prog), fileName: zipName });
    }, updateInterval);
  };

  /** Create a new zip archive from the currently selected nodes */
  const addSelectedToZip = () => {
    const ids = Array.from(selectedNodes).filter(id => {
      const n = vfs.getNode(id);
      return n && !isZipNode(n);
    });
    if (ids.length === 0) return;
    const zipNode = vfs.createNode('Archive.zip', 'directory', currentDir, undefined, undefined, undefined, { customIcon: '/Icons/Extra Icons/directory_zipper.ico' });
    compressIntoZip(ids, zipNode.id, 'Archive.zip');
    setSelectedNodes(new Set());
    setFmCtx(null);
    setFmBgCtx(null);
  };

  const TECHNICAL_EXTENSIONS = ['.DLL', '.SYS', '.VXD', '.INF', '.DRV'];
  const PROTECTED_EXTENSIONS = ['.DLL', '.SYS', '.VXD'];

  // File-type router: returns the app window ID that should open this file, or null
  const getDefaultApp = (node: VFSNode): string | null => {
    // Executable app nodes — launch directly by node id
    if (node.isApp && node.name.toUpperCase().endsWith('.EXE') && onLaunchApp) return node.id;
    const name = node.name.toUpperCase();
    if (name.endsWith('.TXT') || name.endsWith('.LOG') || name.endsWith('.BAT') ||
        name.endsWith('.CFG') || name.endsWith('.INI')) return 'versa_edit';
    if (name.endsWith('.HTM') || name.endsWith('.HTML')) return 'browser';
    if (name.endsWith('.BMP') || name.endsWith('.PNG') || name.endsWith('.JPG') ||
        name.endsWith('.GIF') || name.endsWith('.ICO') || name.endsWith('.WEBP')) return 'versa_view';
    if (name.endsWith('.MP3') || name.endsWith('.WAV') || name.endsWith('.MID') ||
        name.endsWith('.OGG')) return 'media_player';
    if (name.endsWith('.AWJ')) return 'workbench';  // Aetheris Workbench Project files
    // Zip archives open in VersaZip archive manager
    if (name.endsWith('.ZIP')) return 'versa_zip';
    return null;
  };

  // Resolve absolute path
  const getAbsolutePath = (nodeId: string): string => {
    const node = vfs.getNode(nodeId);
    if (!node) return '';
    if (!node.parentId) return node.name;
    return `${getAbsolutePath(node.parentId)}\\${node.name}`;
  };

  const getFileIcon = (node: VFSNode) => {
    if (node.customIcon) return node.customIcon;
    if (node.type === 'directory') return '/Icons/directory_closed-4.png';
    if (node.type === 'shortcut') return '/Icons/computer-4.png';

    const dotIndex = node.name.lastIndexOf('.');
    const ext = dotIndex === -1 ? '' : node.name.slice(dotIndex).toUpperCase();

    switch (ext) {
      case '.EXE':
      case '.COM':
      case '.BAT':
        return '/Icons/executable_gear-0.png';
      case '.SYS':
      case '.VXD':
      case '.DRV':
      case '.DLL':
        return '/Icons/gears_3-0.png';
      case '.INI':
      case '.CFG':
      case '.INF':
        return '/Icons/settings_gear-2.png';
      case '.AWJ':
        return '/Icons/Extra Icons/java_ocx.ico';  // Aetheris Workbench Project
      case '.TXT':
      case '.LOG':
        return '/Icons/Extra Icons/file_lines.ico';
      case '.PNG':
      case '.JPG':
      case '.JPEG':
      case '.BMP':
      case '.GIF':
        return '/Icons/Extra Icons/imagPNG.ico';
      case '.PPTX':
      case '.VSP':
        return '/Icons/Microsoft_PowerPoint_1994.svg';
      default:
        return '/Icons/notepad-2.png';
    }
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
        setSelectedNodes(new Set());
      } else {
        setPathError(true);
      }
    }
  };

  let children = vfs.getChildren(currentDir);

  const handleDoubleClick = (node: VFSNode) => {
    // Zip archives (by name) open in VersaZip
    if (node.name.toLowerCase().endsWith('.zip')) {
      // Ensure it's a directory type (migrate stale file-type zips)
      if (node.type === 'file') vfs.updateNode(node.id, { type: 'directory' as any });
      onOpenFile(node.id);
      if (onLaunchApp) onLaunchApp('versa_zip');
      return;
    }
    // Regular directories navigate into them
    if (node.type === 'directory') {
      setCurrentDir(node.id);
      setSelectedNodes(new Set());
      return;
    }

    if (node.type === 'shortcut') {
      if (isPickerMode) {
        onOpenFile(node.id);
      } else if (node.content && onLaunchApp) {
        onLaunchApp(node.content);
      }
      return;
    }

    // Plain file handling
    if (isPickerMode) {
      onOpenFile(node.id);
      return;
    }

    const upperName = node.name.toUpperCase();

    // 1. Executable app — launch the associated app window
    if (node.isApp && upperName.endsWith('.EXE') && onLaunchApp) {
      onLaunchApp(node.id);
      return;
    }

    // 2. Legacy DOWNLOADS folder special-cases (setup wizards)
    if (upperName.endsWith('.EXE') && currentDirNode?.name === 'DOWNLOADS' && onLaunchApp) {
      if (node.name === 'AETHERIS_NET_MON_SETUP.EXE') {
        onLaunchApp('netmon_setup');
      } else if (node.name === 'RHID_SUBSYSTEM_SETUP.EXE') {
        onLaunchApp('rhid_setup');
      } else if (node.name === 'AW_RELEASE_RADAR_SETUP.EXE') {
        onLaunchApp('aw_release_radar_setup');
      } else if (onLaunchApp) {
        onLaunchApp(node.id);
      }
      return;
    }

    // 3. File-type router — open with the right built-in app
    const defaultApp = getDefaultApp(node);
    if (defaultApp) {
      if (defaultApp === 'versa_edit') {
        onOpenFile(node.id); // VersaEdit opened via onOpenFile which sets activeFileId
      } else if (defaultApp === 'workbench') {
        // Aetheris Workbench Project files (.awj) - pass nodeId to open specific file
        onLaunchApp(`${defaultApp}:${node.id}`);
      } else if (onLaunchApp) {
        onLaunchApp(defaultApp);
      }
      return;
    }

    // 4. Protected system files — show access denied error
    const isProtected = PROTECTED_EXTENSIONS.some(ext => upperName.endsWith(ext));
    if (isProtected) {
      window.dispatchEvent(new CustomEvent('vespera-system-error', {
        detail: { type: 'Access Denied', title: 'System File Access Denied', message: `Cannot open ${node.name}. This is a protected system file required for Vespera OS operation. Modification or direct access is restricted.`, fatal: false }
      }));
      setAssociationModal({ isOpen: true, nodeId: node.id, fileName: node.name });
      return;
    }

    // 5. Other technical files — show association dialog
    const isTechnical = TECHNICAL_EXTENSIONS.some(ext => upperName.endsWith(ext));
    if (isTechnical) {
      setAssociationModal({ isOpen: true, nodeId: node.id, fileName: node.name });
      return;
    }

    // 6. Fallback — open in VersaEdit
    onOpenFile(node.id);
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
      setSelectedNodes(new Set());
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
          <button onClick={() => { setCurrentDir('root'); setSelectedNodes(new Set()); }} className="text-left text-xs text-black hover:bg-[#000080] hover:text-white px-1 py-1 w-full truncate border border-transparent active:border-dotted active:border-black">C:\</button>
          <button onClick={() => { setCurrentDir('desktop'); setSelectedNodes(new Set()); }} className="text-left text-xs text-black hover:bg-[#000080] hover:text-white px-1 py-1 w-full truncate border border-transparent active:border-dotted active:border-black">Desktop</button>
          <button onClick={() => { setCurrentDir('documents'); setSelectedNodes(new Set()); }} className="text-left text-xs text-black hover:bg-[#000080] hover:text-white px-1 py-1 w-full truncate border border-transparent active:border-dotted active:border-black">Documents</button>
          <button onClick={() => { setCurrentDir('vespera'); setSelectedNodes(new Set()); }} className="text-left text-xs text-black hover:bg-[#000080] hover:text-white px-1 py-1 w-full truncate border border-transparent active:border-dotted active:border-black">System</button>
        </div>

        {/* File Area */}
        <div 
          ref={fmAreaRef}
          className={`fm-icon-container flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-y-auto flex flex-wrap gap-4 content-start p-2 relative transition-colors ${isDragOver ? 'bg-blue-50 !border-blue-400' : ''}`}
          onMouseDown={(e) => {
            if (e.target === fmAreaRef.current || (e.target as HTMLElement).classList.contains('fm-icon-container')) {
              setLassoSelection({
                startX: e.clientX,
                startY: e.clientY,
                currentX: e.clientX,
                currentY: e.clientY,
                active: true
              });
              if (!e.ctrlKey && !e.metaKey) {
                setSelectedNodes(new Set());
              }
            }
          }}
          onMouseMove={(e) => {
            if (lassoSelection?.active) {
              setLassoSelection(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);
            }
          }}
          onMouseUp={(e) => {
            if (lassoSelection?.active) {
              const rect = fmAreaRef.current?.getBoundingClientRect();
              if (rect) {
                const left = Math.min(lassoSelection.startX, lassoSelection.currentX) - rect.left;
                const right = Math.max(lassoSelection.startX, lassoSelection.currentX) - rect.left;
                const top = Math.min(lassoSelection.startY, lassoSelection.currentY) - rect.top;
                const bottom = Math.max(lassoSelection.startY, lassoSelection.currentY) - rect.top;
                
                const newSelected = new Set((e.ctrlKey || e.metaKey) ? selectedNodes : []);
                const icons = document.querySelectorAll('.fm-icon-node');
                icons.forEach((icon: Element) => {
                  const iconRect = (icon as HTMLElement).getBoundingClientRect();
                  const iLeft = iconRect.left - rect.left;
                  const iRight = iconRect.right - rect.left;
                  const iTop = iconRect.top - rect.top;
                  const iBottom = iconRect.bottom - rect.top;
                  if (iLeft < right && iRight > left && iTop < bottom && iBottom > top) {
                    const nodeId = icon.getAttribute('data-nodeid');
                    if (nodeId) newSelected.add(nodeId);
                  }
                });
                setSelectedNodes(newSelected);
              }
              setLassoSelection(null);
            }
          }}
          onClick={() => { setFmCtx(null); setFmBgCtx(null); setFmRenamingId(null); if (!lassoSelection?.active) setSelectedNodes(new Set()); }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFmCtx(null);
            const rect = fmAreaRef.current?.getBoundingClientRect();
            setFmBgCtx({
              x: e.clientX - (rect?.left ?? 0),
              y: e.clientY - (rect?.top ?? 0),
            });
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            setIsDragOver(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            // Only clear if leaving the file area entirely (not entering a child)
            if (!fmAreaRef.current?.contains(e.relatedTarget as Node)) {
              setIsDragOver(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            const data = e.dataTransfer.getData('text/plain');
            if (!data) return;
            try {
              const ids: string[] = data.startsWith('[') ? JSON.parse(data) : [data];
              const validIds = ids.filter(id => {
                const n = vfs.getNode(id);
                return n && n.id !== currentDir && n.id !== 'recycle_bin';
              });
              if (validIds.length > 0) vfs.queueMove(validIds, currentDir);
              setSelectedNodes(new Set());
            } catch (err) {}
          }}
        >
          {lassoSelection?.active && (
            <div 
              className="absolute bg-blue-500/20 border border-blue-400/50 pointer-events-none z-[100]"
              style={{
                left: Math.min(lassoSelection.startX, lassoSelection.currentX) - (fmAreaRef.current?.getBoundingClientRect().left ?? 0) + (fmAreaRef.current?.scrollLeft ?? 0),
                top: Math.min(lassoSelection.startY, lassoSelection.currentY) - (fmAreaRef.current?.getBoundingClientRect().top ?? 0) + (fmAreaRef.current?.scrollTop ?? 0),
                width: Math.abs(lassoSelection.currentX - lassoSelection.startX),
                height: Math.abs(lassoSelection.currentY - lassoSelection.startY)
              }}
            />
          )}
          {children.map((node: VFSNode) => {
            const iconUrl = getFileIcon(node);
            const hidden = isHidden(node);
            const isRenaming = fmRenamingId === node.id;
            
            return (
            <div 
              key={node.id}
              data-nodeid={node.id}
              onClick={(e) => { 
                e.stopPropagation(); 
                setFmCtx(null);
                if (e.ctrlKey || e.metaKey) {
                  setSelectedNodes(prev => {
                    const next = new Set(prev);
                    if (next.has(node.id)) next.delete(node.id);
                    else next.add(node.id);
                    return next;
                  });
                } else {
                  setSelectedNodes(new Set([node.id]));
                }
              }}
              draggable
              onDragStart={(e) => {
                let dragSet = selectedNodes;
                if (!dragSet.has(node.id)) {
                  dragSet = new Set([node.id]);
                  setSelectedNodes(dragSet);
                }
                e.dataTransfer.setData('text/plain', JSON.stringify(Array.from(dragSet)));
              }}
              onDragOver={(e) => {
                const isDropTarget = node.type === 'directory' || node.name.toLowerCase().endsWith('.zip') || (node.type === 'shortcut' && node.iconType === 'folder');
                if (isDropTarget) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onDrop={(e) => {
                const isZip = node.name.toLowerCase().endsWith('.zip');
                const targetFolderId = (node.type === 'directory' || isZip) ? node.id : (node.type === 'shortcut' && node.iconType === 'folder' ? node.content : null);
                if (targetFolderId) {
                  e.preventDefault();
                  e.stopPropagation();
                  const data = e.dataTransfer.getData('text/plain');
                  try {
                    const ids: string[] = data.startsWith('[') ? JSON.parse(data) : [data];
                    if (isZip) {
                      // Ensure zip is migrated to directory before compressing into it
                      if (node.type === 'file') vfs.updateNode(node.id, { type: 'directory' as any });
                      compressIntoZip(ids, targetFolderId, node.name);
                    } else {
                      const validIds = ids.filter(id => {
                        const draggedNode = vfs.getNode(id);
                        return draggedNode && draggedNode.id !== targetFolderId && draggedNode.id !== 'recycle_bin';
                      });
                      if (validIds.length > 0) vfs.queueMove(validIds, targetFolderId);
                    }
                    setSelectedNodes(new Set());
                  } catch (err) {}
                }
              }}
              onDoubleClick={() => handleDoubleClick(node)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedNodes(new Set([node.id]));
                const rect = fmAreaRef.current?.getBoundingClientRect();
                setFmCtx({
                  x: e.clientX - (rect?.left ?? 0),
                  y: e.clientY - (rect?.top ?? 0),
                  nodeId: node.id,
                });
              }}
              className={`fm-icon-node flex flex-col items-center gap-1 w-20 p-2 cursor-pointer border border-transparent transition-colors ${selectedNodes.has(node.id) ? 'bg-[#000080] text-white border-dotted !border-white' : isZipNode(node) ? 'hover:border-dotted hover:border-yellow-500' : 'hover:border-dotted hover:border-gray-400'}`}
              style={{ opacity: hidden ? 0.5 : 1 }}
            >
              {iconUrl ? (
                <div className="relative pointer-events-none">
                  <img src={iconUrl} alt="icon" className="w-[32px] h-[32px] drop-shadow-md pointer-events-none" style={{ imageRendering: 'pixelated' }} draggable={false} />
                  {node.type === 'shortcut' && (
                    <div className="absolute -bottom-1 -left-1 bg-white border border-dotted border-black w-3 h-3 flex items-center justify-center">
                      <div className="w-1 h-1 bg-black" />
                    </div>
                  )}
                </div>
              ) : node.type === 'directory' ? (
                isZipNode(node) ? (
                  <img src="/Icons/Extra Icons/directory_zipper.ico" alt="zip" className={`w-[32px] h-[32px] pointer-events-none`} style={{ imageRendering: 'pixelated' }} draggable={false} />
                ) : (
                  <Folder size={32} className={`pointer-events-none ${selectedNodes.has(node.id) ? 'text-white' : 'text-yellow-600'}`} />
                )
              ) : node.type === 'shortcut' ? (
                <div className="relative pointer-events-none">
                  <Monitor size={32} className={`pointer-events-none ${selectedNodes.has(node.id) ? 'text-white' : 'text-blue-600'}`} />
                  <div className="absolute -bottom-1 -left-1 bg-white rounded-sm p-0.5 pointer-events-none">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M10 9l-6 6 6 6"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>
                  </div>
                </div>
              ) : (
                <FileText size={32} className={`pointer-events-none ${selectedNodes.has(node.id) ? 'text-white' : 'text-gray-600'}`} />
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
                <span className="text-xs text-center break-words w-full line-clamp-2 pointer-events-none">
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
                <div 
                  className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm flex justify-between items-center relative cursor-default group"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setOpenWithNodeId(ctxNode.id);
                    setOpenWithPos({ x: rect.width - 4, y: 0 });
                  }}
                >
                  <span>Open with</span>
                  <ChevronRight size={14} className="opacity-60 group-hover:opacity-100" />
                  
                  {openWithNodeId === ctxNode.id && openWithPos && (
                    <div 
                      className="absolute bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] z-[201] flex flex-col py-1"
                      style={{ left: openWithPos.x, top: openWithPos.y, minWidth: 160 }}
                      onClick={e => e.stopPropagation()}
                    >
                      {(() => {
                        const apps = getCompatibleApps(ctxNode.name);
                        if (apps.length === 0) return <div className="px-4 py-1 text-gray-500 italic text-xs">No apps found</div>;
                        
                        return apps.map(appId => {
                          const appInfo = APP_DICTIONARY[appId] || APP_DICTIONARY['default'];
                          return (
                            <button
                              key={appId}
                              className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenFile(ctxNode.id); // Set active file
                                if (onLaunchApp) onLaunchApp(appId);
                                setFmCtx(null);
                                setOpenWithNodeId(null);
                              }}
                            >
                              {appInfo.customIcon ? (
                                <img src={appInfo.customIcon} alt="" className="w-4 h-4" />
                              ) : (
                                <appInfo.icon size={14} />
                              )}
                              <span>{appInfo.defaultTitle}</span>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
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
                  {currentDir === 'recycle_bin' ? 'Delete permanently' : 'Delete'}
                </button>
                {currentDir === 'recycle_bin' ? (
                  <button
                    className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm"
                    onClick={() => {
                      vfs.restoreNode(fmCtx.nodeId);
                      setFmCtx(null);
                    }}
                  >
                    Restore
                  </button>
                ) : (
                  <>
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
                  </>
                )}
                {ctxNode.type === 'file' && ctxNode.content?.startsWith('data:image/') && (
                  <>
                    <div className="h-[1px] bg-gray-400 mx-1 my-1" />
                    <button
                      className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm font-bold text-[#000080] hover:text-white"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = ctxNode.content as string;
                        a.download = ctxNode.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        setFmCtx(null);
                      }}
                    >
                      Export to real OS
                    </button>
                  </>
                )}
                {/* Add to Zip — when multiple items are selected */}
                {selectedNodes.size > 1 && (
                  <>
                    <div className="h-[1px] bg-gray-400 mx-1 my-1" />
                    <button
                      className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm"
                      onClick={() => addSelectedToZip()}
                    >
                      Add to Zip ({selectedNodes.size} files)
                    </button>
                  </>
                )}
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

          {/* ── Background (empty area) context menu ── */}
          {fmBgCtx && (
            <div
              className="absolute bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] z-[200] flex flex-col py-1"
              style={{ left: fmBgCtx.x, top: fmBgCtx.y, minWidth: 160 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm"
                onClick={() => {
                  vfs.createNode("New Folder", "directory", currentDir, undefined, undefined, undefined, { customIcon: "/Icons/Extra Icons/directory_closed.ico" });
                  setFmBgCtx(null);
                }}
              >
                New Folder
              </button>
              <button
                className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm"
                onClick={() => {
                  vfs.createNode("New Text File.txt", "file", currentDir, undefined, undefined, undefined, { customIcon: "/Icons/Extra Icons/message_file.ico" });
                  setFmBgCtx(null);
                }}
              >
                New Text File
              </button>
              <button
                className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm"
                onClick={() => {
                  vfs.createNode("Archive.zip", "directory", currentDir, undefined, undefined, undefined, { customIcon: "/Icons/Extra Icons/directory_zipper.ico" });
                  setFmBgCtx(null);
                }}
              >
                New Zip File
              </button>
              {/* Add to Zip when multiple files selected */}
              {selectedNodes.size > 1 && (
                <>
                  <div className="h-[1px] bg-gray-400 mx-1 my-1" />
                  <button
                    className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm"
                    onClick={() => addSelectedToZip()}
                  >
                    Add to Zip ({selectedNodes.size} files)
                  </button>
                </>
              )}
            </div>
          )}
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
             disabled={selectedNodes.size === 0 || Array.from(selectedNodes).some(id => vfs.getNode(id)?.type === 'directory')}
             onClick={() => { if (selectedNodes.size > 0) onOpenFile(Array.from(selectedNodes)[0]); }}
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

      {/* ── Zip Compression Dialog ── */}
      {zipDialog && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/30">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-72">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide flex items-center gap-2">
              <img src="/Icons/Extra Icons/directory_zipper.ico" alt="" className="w-4 h-4" style={{ imageRendering: 'pixelated' }} />
              Compressing Files
            </div>
            <div className="p-4">
              <div className="text-sm text-black mb-2 truncate">Compressing: <span className="font-bold">{zipDialog.fileName}</span></div>
              <div className="text-xs text-black mb-3">Please wait while files are compressed...</div>
              <div className="w-full h-5 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-hidden">
                <div
                  className="h-full bg-[#000080] transition-all duration-100"
                  style={{ width: `${zipDialog.progress}%` }}
                />
              </div>
              <div className="text-xs text-right text-black mt-1">{zipDialog.progress}%</div>
            </div>
          </div>
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

