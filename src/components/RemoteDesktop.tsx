import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, X, Folder, FileText, Terminal as TerminalIcon, Settings, Activity, Globe, HardDrive, ChevronRight, FolderOpen, PenTool } from 'lucide-react';
import { useRemoteVFS } from '../hooks/useRemoteVFS';
import { VersaFileManager } from './VersaFileManager';
import { VesperaWrite } from './VesperaWrite';
import { AetherisWorkbench } from './AetherisWorkbench';
import { DataAnalyzer } from './DataAnalyzer';
import { WebBrowser } from './WebBrowser';
import { FileProperties } from './FileProperties';
import { ErrorBoundary } from './ErrorBoundary';
import { playUIClickSound } from '../utils/audio';
import { WORKSPACE_MENU_THEME_COLORS } from '../hooks/useVFS';

type Phase = 'connect' | 'connecting' | 'desktop';

interface RemoteWin {
  id: string; title: string; isOpen: boolean; isMinimized?: boolean; isMaximized?: boolean;
  x: number; y: number; width?: number; height?: number;
}

interface RemoteDesktopProps {
  onRequestClose: () => void;
}

const CONNECT_STEPS = [
  'Resolving VESPERA-SRV01.vesperanet.internal...',
  'Establishing secure channel (SSL 3.0)...',
  'Authenticating credentials...',
  'Loading remote session profile...',
  'Negotiating display protocol (RDP v4.0)...',
  'Mapping remote drives...',
  'Starting Vespera Workspace Manager...',
];

export const RemoteDesktop: React.FC<RemoteDesktopProps> = ({ onRequestClose }) => {
  const vfs = useRemoteVFS();
  const [phase, setPhase] = useState<Phase>('connect');
  const [connectStep, setConnectStep] = useState(0);
  const [username, setUsername] = useState('sysadmin');
  const [password, setPassword] = useState('vespera');
  const [server] = useState('VESPERA-SRV01.vesperanet.internal');
  const [error, setError] = useState('');
  const [showCloseWarning, setShowCloseWarning] = useState(false);

  // Desktop state
  const [windows, setWindows] = useState<RemoteWin[]>([
    { id: 'r_files', title: 'Server File Manager', x: 40, y: 30, width: 420, height: 320, isOpen: false },
    { id: 'r_edit', title: 'VesperaWrite', x: 80, y: 50, width: 500, height: 380, isOpen: false },
    { id: 'r_workbench', title: 'AETHERIS Workbench Pro', x: 60, y: 20, width: 600, height: 420, isOpen: false },
    { id: 'r_analyzer', title: 'Data Analyzer', x: 100, y: 40, width: 500, height: 350, isOpen: false },
    { id: 'r_about', title: 'Server Information', x: 50, y: 60, width: 400, height: 440, isOpen: false },
    { id: 'r_browser', title: 'Vespera Navigator', x: 30, y: 20, width: 650, height: 450, isOpen: false },
    { id: 'r_terminal', title: 'Server Terminal', x: 70, y: 35, width: 550, height: 380, isOpen: false },
  ]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string } | null>(null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const desktopRef = useRef<HTMLDivElement>(null);

  // Resizing state
  const [resizing, setResizing] = useState<{
    id: string; edge: string; startX: number; startY: number;
    initialW: number; initialH: number; initialX: number; initialY: number;
  } | null>(null);

  const MIN_WIN_W = 220;
  const MIN_WIN_H = 160;

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - resizing.startX;
      const dy = e.clientY - resizing.startY;
      setWindows(prev => prev.map(w => {
        if (w.id !== resizing.id) return w;
        let newW = resizing.initialW, newH = resizing.initialH, newX = resizing.initialX, newY = resizing.initialY;
        if (resizing.edge.includes('e')) newW = Math.max(MIN_WIN_W, resizing.initialW + dx);
        if (resizing.edge.includes('s')) newH = Math.max(MIN_WIN_H, resizing.initialH + dy);
        if (resizing.edge.includes('w')) { const d = Math.min(dx, resizing.initialW - MIN_WIN_W); newW = resizing.initialW - d; newX = resizing.initialX + d; }
        if (resizing.edge.includes('n')) { const d = Math.min(dy, resizing.initialH - MIN_WIN_H); newH = resizing.initialH - d; newY = resizing.initialY + d; }
        return { ...w, width: newW, height: newH, x: newX, y: newY };
      }));
    };
    const onUp = () => setResizing(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [resizing]);

  const startResize = (e: React.MouseEvent, winId: string, edge: string) => {
    e.preventDefault(); e.stopPropagation();
    const win = windows.find(w => w.id === winId);
    if (!win || win.isMaximized) return;
    setResizing({ id: winId, edge, startX: e.clientX, startY: e.clientY, initialW: win.width || 384, initialH: win.height || 300, initialX: win.x, initialY: win.y });
  };

  // Connection animation
  useEffect(() => {
    if (phase !== 'connecting') return;
    if (connectStep >= CONNECT_STEPS.length) {
      const t = setTimeout(() => setPhase('desktop'), 600);
      return () => clearTimeout(t);
    }
    const delay = 800 + Math.random() * 1200;
    const t = setTimeout(() => setConnectStep(s => s + 1), delay);
    return () => clearTimeout(t);
  }, [phase, connectStep]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError('Username required.'); return; }
    setError('');
    setConnectStep(0);
    setPhase('connecting');
  };

  const handleDisconnect = () => {
    setPhase('connect');
    setWindows(prev => prev.map(w => ({ ...w, isOpen: false, isMinimized: false, isMaximized: false })));
    setMenuOpen(false);
    setContextMenu(null);
  };

  // Window management helpers
  const bringToFront = (id: string) => {
    setWindows(prev => { const i = prev.findIndex(w => w.id === id); if (i === -1) return prev; const n = [...prev]; const w = n.splice(i, 1)[0]; n.push(w); return n; });
  };
  const openWindow = (id: string) => {
    setWindows(prev => { const i = prev.findIndex(w => w.id === id); if (i === -1) return prev; const n = [...prev]; n[i] = { ...n[i], isOpen: true, isMinimized: false }; const w = n.splice(i, 1)[0]; n.push(w); return n; });
  };
  const toggleWindow = (id: string) => {
    playUIClickSound();
    setWindows(prev => { const i = prev.findIndex(w => w.id === id); if (i === -1) return prev; const win = prev[i]; const n = [...prev]; if (win.isOpen) { if (win.isMinimized) { n[i] = { ...win, isMinimized: false }; const w = n.splice(i, 1)[0]; n.push(w); } else if (i === prev.length - 1) { n[i] = { ...win, isMinimized: true }; } else { const w = n.splice(i, 1)[0]; n.push(w); } } else { n[i] = { ...win, isOpen: true, isMinimized: false }; const w = n.splice(i, 1)[0]; n.push(w); } return n; });
    setMenuOpen(false);
  };
  const minimizeWindow = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w)); };
  const maximizeWindow = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)); bringToFront(id); };
  const closeWindow = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false, isMinimized: false, isMaximized: false } : w)); };

  const handleContextMenu = (e: React.MouseEvent, nodeId?: string) => {
    e.preventDefault(); e.stopPropagation();
    if (nodeId?.startsWith('__properties__')) {
      const realId = nodeId.replace('__properties__', '');
      const node = vfs.getNode(realId);
      if (node) {
        const propId = `r_properties_${node.id}`;
        setWindows(prev => {
          if (prev.find(w => w.id === propId)) return prev.map(w => w.id === propId ? { ...w, isOpen: true } : w);
          return [...prev, { id: propId, title: `Properties: ${node.name}`, x: 120, y: 80, width: 350, height: 420, isOpen: true }];
        });
        bringToFront(propId);
      }
      return;
    }
    if (desktopRef.current) {
      const rect = desktopRef.current.getBoundingClientRect();
      setContextMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top, nodeId });
    } else {
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
    }
  };

  // Terminal state
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'Vespera Server Terminal v2.1 — VESPERA-SRV01',
    '(C) 1996 Vespera Systems. All rights reserved.',
    '',
    'Type HELP for a list of commands.',
    '',
    'D:\\>',
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [terminalLines]);

  const handleTerminalCmd = (cmd: string) => {
    const trimmed = cmd.trim().toUpperCase();
    const newLines = [...terminalLines, `D:\\> ${cmd}`];
    if (!trimmed) { setTerminalLines([...newLines, 'D:\\>']); return; }
    if (trimmed === 'HELP') {
      newLines.push('Available commands:', '  DIR     — List files', '  CLS     — Clear screen', '  HELP    — This message',
        '  VER     — System version', '  WHOAMI  — Current user', '  PING    — Test network', '  EXIT    — Close terminal', '');
    } else if (trimmed === 'VER') {
      newLines.push('VesperaServer NT 3.51 SP4', 'X-Type Monitor Service v1.2 [ACTIVE]', '');
    } else if (trimmed === 'CLS') {
      setTerminalLines(['D:\\>']); setTerminalInput(''); return;
    } else if (trimmed === 'WHOAMI') {
      newLines.push(`VESPERANET\\${username}`, '');
    } else if (trimmed === 'DIR') {
      const children = vfs.getChildren('root');
      newLines.push(' Volume in drive D is VESPERA-SRV01', ' Directory of D:\\', '');
      children.forEach(c => { newLines.push(`  ${c.type === 'directory' ? '<DIR>' : '     '} ${c.name}`); });
      newLines.push(`        ${children.length} item(s)`, '');
    } else if (trimmed.startsWith('PING')) {
      newLines.push('Pinging VESPERA-SRV01 [10.0.6.1] with 32 bytes of data:', '',
        'Reply from 10.0.6.1: bytes=32 time<1ms TTL=128', 'Reply from 10.0.6.1: bytes=32 time<1ms TTL=128', '');
    } else if (trimmed === 'EXIT') {
      closeWindow('r_terminal', { stopPropagation: () => {} } as any); return;
    } else {
      newLines.push(`'${cmd}' is not recognized as an internal or external command.`, '');
    }
    newLines.push('D:\\>');
    setTerminalLines(newLines);
    setTerminalInput('');
  };

  const renderWindowContent = (id: string) => {
    switch (id) {
      case 'r_files':
        return <VersaFileManager vfs={vfs as any} downloadedFiles={[]} onLaunchApp={() => {}} neuralBridgeActive={false}
          onOpenFile={(fid) => { setActiveFileId(fid); openWindow('r_edit'); }}
          onContextMenu={(e, nodeId) => handleContextMenu(e, nodeId)}
          focusDirectoryNonce={0} focusDirectoryId={null} />;
      case 'r_edit':
        return <VesperaWrite vfs={vfs as any} fileId={activeFileId}
          onClose={() => closeWindow('r_edit', { stopPropagation: () => {} } as any)}
          onSave={(content) => { if (activeFileId) vfs.updateFileContent(activeFileId, content); }} />;
      case 'r_workbench':
        return <AetherisWorkbench />;
      case 'r_analyzer':
        return <DataAnalyzer neuralBridgeActive={false} />;
      case 'r_browser':
        return <ErrorBoundary><WebBrowser vfs={vfs as any} onLaunchApp={() => {}} onDownload={() => {}} /></ErrorBoundary>;
      case 'r_terminal':
        return (
          <div className="flex flex-col h-full bg-black text-[#c0c0c0] font-mono text-xs p-2 overflow-hidden">
            <div className="flex-1 overflow-y-auto whitespace-pre-wrap">
              {terminalLines.map((l, i) => <div key={i}>{l}</div>)}
              <div ref={terminalEndRef} />
            </div>
            <div className="flex items-center mt-1">
              <span className="shrink-0">D:\&gt;&nbsp;</span>
              <input className="flex-1 bg-transparent outline-none text-[#c0c0c0] font-mono text-xs"
                value={terminalInput} onChange={e => setTerminalInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleTerminalCmd(terminalInput); }}
                autoFocus />
            </div>
          </div>
        );
      case 'r_about':
        return (
          <div className="p-4 space-y-3 bg-[#c0c0c0] text-black h-full overflow-y-auto text-sm">
            <div className="flex items-center gap-3 border-b-2 border-gray-500 pb-3">
              <Monitor size={40} className="text-blue-800" />
              <div>
                <h1 className="text-lg font-bold">VESPERA-SRV01</h1>
                <p className="text-xs">VesperaServer NT 3.51 SP4 (Build 19961015)</p>
                <p className="text-xs">© 1996 Vespera Systems. All rights reserved.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <h2 className="font-bold border-b border-gray-400">Server Role:</h2>
                <p>Primary Domain Controller</p>
                <p>Domain: VESPERANET</p>
                <p>IP: 10.0.6.1</p>
              </div>
              <div className="space-y-1">
                <h2 className="font-bold border-b border-gray-400">Hardware:</h2>
                <p>Intel Pentium Pro 200MHz</p>
                <p>128 MB EDO RAM</p>
                <p>Seagate Barracuda 4.3GB (D:)</p>
              </div>
            </div>
            <div className="text-xs bg-white p-2 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white space-y-1">
              <p><strong>NIC:</strong> 3Com EtherLink III 10Mbps</p>
              <p><strong>UPS:</strong> APC Smart-UPS 1000VA</p>
              <p><strong>Services:</strong> File Sharing, RDP, X-Type Monitor</p>
              <p className="text-red-700 font-bold mt-2">⚠ X-Type Monitoring Service: ACTIVE</p>
            </div>
            <div className="p-2 bg-[#d9d9d9] border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white italic text-xs text-center">
              "This server is designated under Directive 7 for X-Type anomaly containment."
            </div>
          </div>
        );
      default:
        if (id.startsWith('r_properties_')) {
          const nodeId = id.replace('r_properties_', '');
          return <FileProperties vfs={vfs as any} nodeId={nodeId} onClose={() => closeWindow(id, { stopPropagation: () => {} } as any)} neuralBridgeActive={false} />;
        }
        return null;
    }
  };

  const theme = WORKSPACE_MENU_THEME_COLORS[vfs.displaySettings?.taskbarTheme || 'midnight'] || WORKSPACE_MENU_THEME_COLORS.midnight;

  // ── RENDER: Connection Dialog ──
  if (phase === 'connect') {
    return (
      <div className="flex flex-col h-full bg-[#c0c0c0] select-none">
        <div className="flex-1 flex items-center justify-center bg-[#008080]">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-[370px]">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm flex items-center gap-2">
              <Monitor size={14} />
              <span>VesperaConnect — Remote Desktop Client</span>
            </div>
            <form onSubmit={handleConnect} className="p-4">
              <div className="flex items-start mb-4">
                <div className="w-12 h-12 mr-3 bg-[#000080] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex items-center justify-center shrink-0">
                  <Monitor size={28} className="text-white" />
                </div>
                <p className="text-xs leading-relaxed">Connect to a remote VesperaSystems server desktop. Your session will run inside a secure RDP tunnel.</p>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center"><label className="w-20 text-xs font-bold">Server:</label>
                  <input readOnly className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-xs bg-[#e8e8e8] text-gray-600 font-mono" value={server} /></div>
                <div className="flex items-center"><label className="w-20 text-xs font-bold">Username:</label>
                  <input className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-xs bg-white" value={username} onChange={e => setUsername(e.target.value)} /></div>
                <div className="flex items-center"><label className="w-20 text-xs font-bold">Password:</label>
                  <input type="password" className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-xs bg-white" value={password} onChange={e => setPassword(e.target.value)} /></div>
                <div className="flex items-center"><label className="w-20 text-xs font-bold">Domain:</label>
                  <select className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-xs bg-white">
                    <option>VESPERANET</option><option>SECTOR7_LABS</option>
                  </select></div>
              </div>
              {error && <p className="text-red-600 text-xs font-bold mb-2">{error}</p>}
              <div className="flex justify-end gap-2">
                <button type="submit" className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Connect</button>
                <button type="button" onClick={onRequestClose} className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER: Connecting Animation ──
  if (phase === 'connecting') {
    return (
      <div className="flex flex-col h-full bg-[#c0c0c0] select-none">
        <div className="flex-1 flex items-center justify-center bg-[#000]">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-[420px]">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-xs flex items-center gap-2">
              <Monitor size={12} /><span>Connecting to {server}...</span>
            </div>
            <div className="p-4 space-y-2">
              {CONNECT_STEPS.map((step, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs font-mono ${i < connectStep ? 'text-black' : i === connectStep ? 'text-blue-800' : 'text-gray-400'}`}>
                  <span className="w-4 text-center">{i < connectStep ? '✓' : i === connectStep ? '►' : '○'}</span>
                  <span>{step}</span>
                  {i === connectStep && <span className="animate-pulse">...</span>}
                </div>
              ))}
              <div className="h-5 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white mt-3 overflow-hidden">
                <div className="h-full bg-[#000080] transition-all duration-500" style={{ width: `${(connectStep / CONNECT_STEPS.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER: Remote Desktop ──
  const desktopItems = vfs.getChildren('desktop');

  return (
    <div className="flex flex-col h-full select-none overflow-hidden" onClick={() => { setMenuOpen(false); setContextMenu(null); }}>
      {/* Disconnect Toolbar */}
      <div className="flex items-center h-6 bg-gradient-to-r from-[#191970] via-[#000080] to-[#191970] border-b border-[#000040] px-2 gap-2 shrink-0 z-[500]">
        <Monitor size={10} className="text-cyan-300" />
        <span className="text-[10px] text-cyan-200 font-mono flex-1 truncate">{server} — Remote Session ({username})</span>
        <button onClick={handleDisconnect} className="text-[9px] bg-[#c0c0c0] text-black px-2 border border-t-white border-l-white border-b-gray-800 border-r-gray-800 hover:bg-red-200 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Disconnect</button>
      </div>

      {/* Desktop Area */}
      <div ref={desktopRef} className="flex-1 relative overflow-hidden"
        style={{ backgroundImage: vfs.displaySettings?.wallpaper ? `url(${vfs.displaySettings.wallpaper})` : undefined, backgroundColor: vfs.displaySettings?.backgroundColor || '#000080', backgroundSize: 'cover', backgroundPosition: 'center' }}
        onContextMenu={e => handleContextMenu(e)}
      >
        {/* Session Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[1]">
          <span className="text-white/8 text-4xl font-bold tracking-[0.3em] rotate-[-15deg] select-none">REMOTE SESSION</span>
        </div>

        {/* Desktop Icons */}
        <div className="absolute inset-0 p-3 pb-12 flex flex-col gap-3 flex-wrap max-h-[calc(100%-3rem)] z-[2]">
          {desktopItems.map((node, i) => (
            <div key={node.id} className="flex flex-col items-center gap-0.5 w-16 p-1 hover:bg-white/10 active:bg-blue-800/50 rounded group cursor-pointer"
              onDoubleClick={e => { e.stopPropagation(); if (node.type === 'shortcut' && node.content) openWindow(node.content === 'files' ? 'r_files' : node.content === 'server_terminal' ? 'r_terminal' : node.content); else if (node.type === 'directory') openWindow('r_files'); else { setActiveFileId(node.id); openWindow('r_edit'); } }}
              onContextMenu={e => handleContextMenu(e, node.id)}
            >
              {node.type === 'directory' ? <Folder size={28} className="text-yellow-400 drop-shadow-md" />
                : node.type === 'shortcut' ? (
                  <div className="relative">
                    {node.iconType === 'Terminal' ? <TerminalIcon size={28} className="text-green-400 drop-shadow-md" /> : node.iconType === 'Folder' ? <Folder size={28} className="text-yellow-400 drop-shadow-md" /> : <FileText size={28} className="text-white drop-shadow-md" />}
                    <div className="absolute -bottom-0.5 -left-0.5 bg-white border border-dotted border-black w-2.5 h-2.5 flex items-center justify-center"><div className="w-0.5 h-0.5 bg-black" /></div>
                  </div>
                ) : <FileText size={28} className="text-white drop-shadow-md" />}
              {renamingNodeId === node.id ? (
                <input autoFocus className="w-full text-[10px] text-black px-0.5 outline-none" value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => { if (renameValue.trim()) vfs.renameNode(node.id, renameValue.trim()); setRenamingNodeId(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') { if (renameValue.trim()) vfs.renameNode(node.id, renameValue.trim()); setRenamingNodeId(null); } else if (e.key === 'Escape') setRenamingNodeId(null); }}
                  onClick={e => e.stopPropagation()} />
              ) : (
                <span className="text-white text-[10px] text-center font-bold drop-shadow-md bg-black/50 px-0.5 rounded group-hover:bg-blue-800 break-words w-full line-clamp-2">{node.name}</span>
              )}
            </div>
          ))}
        </div>

        {/* Context Menu */}
        {contextMenu && !contextMenu.nodeId && (
          <div className="absolute bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-md z-[400] text-xs min-w-[140px]" style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={e => e.stopPropagation()}>
            <button className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white" onClick={() => { vfs.createNode('New Folder', 'directory', 'desktop'); setContextMenu(null); }}>New Folder</button>
            <button className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white" onClick={() => { vfs.createNode('New File.txt', 'file', 'desktop', ''); setContextMenu(null); }}>New File</button>
            <div className="border-t border-gray-400 mx-1" />
            <button className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white" onClick={() => { openWindow('r_about'); setContextMenu(null); }}>Server Properties</button>
          </div>
        )}
        {contextMenu && contextMenu.nodeId && (
          <div className="absolute bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-md z-[400] text-xs min-w-[140px]" style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={e => e.stopPropagation()}>
            <button className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white" onClick={() => {
              const n = vfs.getNode(contextMenu.nodeId!); if (n) { if (n.type === 'shortcut' && n.content) openWindow(n.content === 'files' ? 'r_files' : n.content === 'server_terminal' ? 'r_terminal' : n.content); else if (n.type === 'directory') openWindow('r_files'); else { setActiveFileId(n.id); openWindow('r_edit'); } } setContextMenu(null);
            }}>Open</button>
            <button className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white" onClick={() => { setRenamingNodeId(contextMenu.nodeId!); const n = vfs.getNode(contextMenu.nodeId!); setRenameValue(n?.name || ''); setContextMenu(null); }}>Rename</button>
            <button className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white text-red-700" onClick={() => { vfs.deleteNode(contextMenu.nodeId!); setContextMenu(null); }}>Delete</button>
            <div className="border-t border-gray-400 mx-1" />
            <button className="w-full text-left px-3 py-1 hover:bg-[#000080] hover:text-white" onClick={() => {
              handleContextMenu({ preventDefault: () => {}, stopPropagation: () => {}, clientX: contextMenu.x, clientY: contextMenu.y } as any, `__properties__${contextMenu.nodeId}`); setContextMenu(null);
            }}>Properties</button>
          </div>
        )}

        {/* Windows */}
        <div className="absolute inset-0 overflow-hidden z-[50]" style={{ pointerEvents: windows.every(w => !w.isOpen || w.isMinimized) ? 'none' : 'auto' }}>
          {windows.map((win, index) => {
            if (!win.isOpen || win.isMinimized) return null;
            const activeWinId = windows.filter(w => w.isOpen && !w.isMinimized).pop()?.id;
            const isActive = win.id === activeWinId;
            return (
              <motion.div key={win.id} drag={!win.isMaximized && !resizing} dragMomentum={false}
                onDragEnd={(_, info) => { setWindows(prev => prev.map(w => w.id === win.id ? { ...w, x: w.x + info.offset.x, y: w.y + info.offset.y } : w)); }}
                onMouseDown={() => bringToFront(win.id)} initial={{ x: win.x, y: win.y }}
                animate={{ x: win.isMaximized ? 0 : win.x, y: win.isMaximized ? 0 : win.y, width: win.isMaximized ? '100%' : (win.width || 384), height: win.isMaximized ? 'calc(100% - 40px)' : (win.height || 300) }}
                transition={{ duration: resizing?.id === win.id ? 0 : 0.1 }}
                className="absolute bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden"
                style={{ zIndex: 100 + index, top: 0, left: 0 }}>
                {!win.isMaximized && <>
                  <div onMouseDown={e => startResize(e, win.id, 'n')} style={{ position:'absolute', top:-3, left:6, right:6, height:6, cursor:'ns-resize', zIndex:10 }} />
                  <div onMouseDown={e => startResize(e, win.id, 's')} style={{ position:'absolute', bottom:-3, left:6, right:6, height:6, cursor:'ns-resize', zIndex:10 }} />
                  <div onMouseDown={e => startResize(e, win.id, 'w')} style={{ position:'absolute', top:6, left:-3, bottom:6, width:6, cursor:'ew-resize', zIndex:10 }} />
                  <div onMouseDown={e => startResize(e, win.id, 'e')} style={{ position:'absolute', top:6, right:-3, bottom:6, width:6, cursor:'ew-resize', zIndex:10 }} />
                  <div onMouseDown={e => startResize(e, win.id, 'nw')} style={{ position:'absolute', top:-3, left:-3, width:10, height:10, cursor:'nwse-resize', zIndex:11 }} />
                  <div onMouseDown={e => startResize(e, win.id, 'ne')} style={{ position:'absolute', top:-3, right:-3, width:10, height:10, cursor:'nesw-resize', zIndex:11 }} />
                  <div onMouseDown={e => startResize(e, win.id, 'sw')} style={{ position:'absolute', bottom:-3, left:-3, width:10, height:10, cursor:'nesw-resize', zIndex:11 }} />
                  <div onMouseDown={e => startResize(e, win.id, 'se')} style={{ position:'absolute', bottom:-3, right:-3, width:10, height:10, cursor:'nwse-resize', zIndex:11 }} />
                </>}
                {/* Titlebar */}
                <div onDoubleClick={() => maximizeWindow(win.id, {} as any)}
                  className={`px-2 py-1 flex justify-between items-center ${!win.isMaximized ? 'cursor-move' : ''} border-b-2 border-gray-800`}
                  style={isActive ? { backgroundColor: theme.headerBg, color: theme.headerText } : { backgroundColor: theme.windowInactiveBg, color: theme.windowInactiveText }}>
                  <span className="text-xs font-bold truncate">{win.title}</span>
                  <div className="flex gap-0.5 shrink-0">
                    <button onClick={e => minimizeWindow(win.id, e)} className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-b-gray-800 border-r-gray-800 flex items-end justify-center pb-0.5 text-black font-bold text-[9px]">_</button>
                    <button onClick={e => maximizeWindow(win.id, e)} className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-b-gray-800 border-r-gray-800 flex items-center justify-center text-black">
                      {win.isMaximized ? <div className="w-2 h-2 border-t border-l border-black relative"><div className="absolute top-0.5 left-0.5 w-2 h-2 border border-black" /></div> : <div className="w-2.5 h-2.5 border border-black border-t-2" />}
                    </button>
                    <button onClick={e => closeWindow(win.id, e)} className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-b-gray-800 border-r-gray-800 flex items-center justify-center text-black font-bold text-[9px]">X</button>
                  </div>
                </div>
                <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white m-0.5 overflow-hidden flex flex-col bg-[#c0c0c0]">
                  {renderWindowContent(win.id)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Taskbar */}
      <div className="h-8 flex items-center px-1 gap-1 shrink-0 z-[500] border-t-2"
        style={{ backgroundColor: theme.headerBg, borderColor: theme.borderLight }}>
        {/* Workspace Menu Button */}
        <div className="relative">
          <button onClick={e => { e.stopPropagation(); playUIClickSound(); setMenuOpen(!menuOpen); }}
            className="h-6 px-2 border border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs font-bold flex items-center gap-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
            style={{ backgroundColor: theme.headerBg, color: theme.headerText }}>
            <Monitor size={12} /> Server
          </button>
          {menuOpen && (
            <div className="absolute bottom-7 left-0 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-md min-w-[180px] text-xs z-[600]"
              onClick={e => e.stopPropagation()}>
              {[
                { label: 'Server Files', action: 'r_files', icon: <Folder size={14} className="text-yellow-500" /> },
                { label: 'Server Terminal', action: 'r_terminal', icon: <TerminalIcon size={14} className="text-green-400" /> },
                { label: 'Vespera Navigator', action: 'r_browser', icon: <Globe size={14} className="text-blue-300" /> },
                { label: 'Workbench', action: 'r_workbench', icon: <TerminalIcon size={14} className="text-blue-400" /> },
                { label: 'Data Analyzer', action: 'r_analyzer', icon: <Activity size={14} className="text-green-400" /> },
                { label: 'Server Info', action: 'r_about', icon: <Monitor size={14} className="text-blue-600" /> },
              ].map(item => (
                <button key={item.action} className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#000080] hover:text-white"
                  onClick={() => { toggleWindow(item.action); setMenuOpen(false); }}>{item.icon}<span>{item.label}</span></button>
              ))}
              <div className="border-t border-gray-400 mx-1" />
              <button className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#000080] hover:text-white text-red-700 font-bold"
                onClick={handleDisconnect}><X size={14} /><span>Disconnect</span></button>
            </div>
          )}
        </div>
        {/* Open window buttons */}
        <div className="flex-1 flex items-center gap-0.5 overflow-hidden">
          {windows.filter(w => w.isOpen).map(w => (
            <button key={w.id} onClick={() => toggleWindow(w.id)}
              className={`h-5 px-2 text-[10px] font-bold truncate max-w-[120px] border ${w.isMinimized ? 'border-t-white border-l-white border-b-gray-800 border-r-gray-800 opacity-60' : 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white'}`}
              style={{ backgroundColor: theme.windowInactiveBg, color: theme.headerText }}>{w.title}</button>
          ))}
        </div>
        {/* Clock */}
        <div className="h-5 px-2 border border-t-gray-800 border-l-gray-800 border-b-white border-r-white text-[10px] font-mono flex items-center"
          style={{ backgroundColor: theme.windowInactiveBg, color: theme.headerText }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: vfs.displaySettings?.clockFormat === '12h' })}
        </div>
      </div>

      {/* Close Warning Modal */}
      {showCloseWarning && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-md w-72">
            <div className="bg-[#000080] text-white px-2 py-1 text-xs font-bold">VesperaConnect</div>
            <div className="p-4 text-xs">
              <p className="font-bold mb-2">Active remote session detected!</p>
              <p>Closing this window will disconnect your session. All unsaved work on the remote server will be lost.</p>
            </div>
            <div className="flex justify-end gap-2 p-2">
              <button onClick={() => { setShowCloseWarning(false); handleDisconnect(); onRequestClose(); }}
                className="px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs font-bold">Disconnect</button>
              <button onClick={() => setShowCloseWarning(false)}
                className="px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
