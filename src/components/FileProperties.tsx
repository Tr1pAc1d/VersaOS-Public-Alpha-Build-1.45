import React, { useState } from 'react';
import { FileText, Folder, Monitor, Terminal as TerminalIcon, ShieldAlert, Settings } from 'lucide-react';
import { useVFS, VFSNode } from '../hooks/useVFS';
import { RETRO_ICONS } from '../utils/retroIcons';
import { IconPicker } from './IconPicker';

interface FilePropertiesProps {
  nodeId: string;
  onClose: () => void;
  neuralBridgeActive?: boolean;
  vfs: ReturnType<typeof useVFS>;
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

const getSeed = (str: string) => str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

export const FileProperties: React.FC<FilePropertiesProps> = ({ nodeId, onClose, neuralBridgeActive, vfs }) => {
  const node = vfs.getNode(nodeId);
  const [activeTab, setActiveTab] = useState<'general' | 'sharing' | 'security' | 'customize'>('general');
  const [name, setName] = useState(node?.name || '');
  const [showIconPicker, setShowIconPicker] = useState(false);

  if (!node) {
    return <div className="p-4 bg-[#c0c0c0] h-full font-mono text-xs">ERR_NODE_NOT_FOUND: {nodeId}</div>;
  }
  
  const getFileIcon = (n: VFSNode) => {
    if (n.customIcon) return n.customIcon;
    if (n.type === 'directory') return null;
    const dotIndex = n.name.lastIndexOf('.');
    if (dotIndex === -1) return null;
    const ext = n.name.slice(dotIndex).toUpperCase();
    const iconId = iconMap[ext];
    return RETRO_ICONS.find(i => i.id === iconId)?.url || null;
  };

  const seed = getSeed(node.id + node.name);
  const iconUrl = getFileIcon(node);

  const getFileIconUI = (size: number = 32) => {
    if (iconUrl) {
      return <img src={iconUrl} alt="icon" className={`w-[${size}px] h-[${size}px]`} style={{ imageRendering: 'pixelated' }} />;
    }
    return node.type === 'directory' ? <Folder size={size} className="text-yellow-600" /> : <FileText size={size} className="text-gray-600" />;
  };

  const getAbsolutePath = (id: string): string => {
    const n = vfs.getNode(id);
    if (!n) return '';
    if (!n.parentId) return n.name.toUpperCase();
    const parentPath = getAbsolutePath(n.parentId);
    return `${parentPath}${parentPath.endsWith('\\') ? '' : '\\'}${n.name.toUpperCase()}`;
  };

  const getFileType = (n: VFSNode) => {
    if (n.type === 'directory') return 'File Folder';
    if (n.type === 'shortcut') return 'Shortcut';
    const dotIndex = n.name.lastIndexOf('.');
    if (dotIndex === -1) return 'Generic File';
    const ext = n.name.slice(dotIndex).toUpperCase();
    switch (ext) {
      case '.EXE': return 'Application';
      case '.DLL': return 'Application Extension';
      case '.SYS': return 'System File';
      case '.VXD': return 'Virtual Device Driver';
      case '.INI':
      case '.CFG': return 'Configuration Settings';
      case '.TXT': return 'Text Document';
      case '.LOG': return 'System Log File';
      default: return `${ext.slice(1)} File`;
    }
  };

  const calculateSize = (n: VFSNode) => {
    if (n.type === 'directory') return 'System Managed';
    const ext = n.name.split('.').pop()?.toUpperCase();
    
    // Deterministic ranges
    if (ext === 'SYS' || ext === 'VXD') {
      const size = 4 + (seed % 61); // 4 - 65 KB
      return `${size} KB`;
    }
    if (ext === 'DLL') {
      const size = 120 + (seed % 2281); // 120 - 2400 KB
      return `${size.toLocaleString()} KB`;
    }
    if (['TXT', 'LOG', 'INI', 'CFG', 'INF'].includes(ext || '')) {
      const size = 1 + (seed % 12); // 1 - 13 KB
      return `${size} KB`;
    }

    if (n.content) {
      const bytes = n.content.length;
      return `${Math.ceil(bytes / 1024)} KB`;
    }
    return '1 KB';
  };

  const getHistoricalDate = () => {
    const daysOffset = seed % 240;
    const date = new Date(1991, 7, 1);
    date.setDate(date.getDate() + daysOffset);
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const createdDate = getHistoricalDate();
  const modifiedDate = getHistoricalDate();
  const accessedDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const fullPath = getAbsolutePath(node.id);
  const isSystem = fullPath.includes('\\SYSTEM') || fullPath.includes('\\CRITICAL');
  const isHidden = node.name.startsWith('.');

  const handleApply = () => {
    if (name !== node.name && name.trim()) {
      vfs.renameNode(node.id, name.trim());
    }
  };

  const handleOK = () => {
    handleApply();
    onClose();
  };

  const motifBtnClass = "px-6 py-1 font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0]";

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-[11px] relative p-1 select-none">
      {/* Tabs Row */}
      <div className="flex px-1 gap-0.5 h-8 items-end">
        {[
          { id: 'general', label: 'General' },
          { id: 'sharing', label: 'Sharing' },
          { id: 'security', label: 'Security' },
          { id: 'customize', label: 'Customize' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1 font-bold border-2 border-b-0 transition-all ${activeTab === tab.id ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800 z-10 translate-y-[2px] h-7' : 'bg-[#b0b0b0] border-t-white border-l-white border-r-gray-800 cursor-pointer h-6 opacity-80 hover:opacity-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-4 flex flex-col gap-3 overflow-hidden shadow-inner relative">
        {activeTab === 'general' && (
          <div className="flex flex-col gap-3 h-full">
            <div className="flex gap-4">
              <div className="w-12 h-12 flex items-center justify-center border-2 border-inset border-gray-400 p-1 bg-white shadow-sm shrink-0">
                {getFileIconUI(32)}
              </div>
              <div className="flex-1 min-w-0">
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 font-mono text-sm outline-none focus:ring-1 focus:ring-[#000080]"
                />
              </div>
            </div>

            <hr className="border-t-white border-b-gray-400" />

            <div className="grid grid-cols-[80px_1fr] gap-y-1 gap-x-2 leading-tight">
              <span className="text-gray-700">Type of file:</span>
              <span className="font-bold">{getFileType(node)}</span>

              <span className="text-gray-700">Location:</span>
              <span className="font-mono text-[9px] break-all leading-tight">{getAbsolutePath(node.parentId || node.id)}</span>

              <span className="text-gray-700">Size:</span>
              <span className="font-bold">{calculateSize(node)}</span>
            </div>

            <hr className="border-t-white border-b-gray-400" />

            <div className="grid grid-cols-[80px_1fr] gap-y-1 gap-x-2 text-[10px]">
              <span className="text-gray-700">Created:</span>
              <span>{createdDate}</span>

              <span className="text-gray-700">Modified:</span>
              <span>{modifiedDate}</span>

              <span className="text-gray-700">Accessed:</span>
              <span>{accessedDate}</span>
            </div>

            <hr className="border-t-white border-b-gray-400" />

            <div className="flex flex-col gap-2">
              <span className="text-gray-700">Attributes:</span>
              <div className="flex gap-4 ml-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white flex items-center justify-center">
                    {(isSystem || isHidden) && <div className="w-2 h-2 bg-black" />}
                  </div>
                  <span>Read-only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white flex items-center justify-center">
                    {isHidden && <div className="w-2 h-2 bg-black" />}
                  </div>
                  <span>Hidden</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white flex items-center justify-center">
                    {(isSystem || seed % 3 === 0) && <div className="w-2 h-2 bg-black" />}
                  </div>
                  <span>Archive</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sharing' && (
          <div className="flex flex-col gap-4 italic text-gray-600 p-2 items-center justify-center h-full">
            <Settings size={48} className="opacity-20" />
            <p className="text-center font-bold">Network Sharing Services are currently unavailable in this sector.</p>
            <p className="text-[10px] text-center">Contact your system administrator for peer-to-peer relay privileges.</p>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="flex flex-col gap-4 italic text-gray-600 p-2 items-center justify-center h-full">
            <ShieldAlert size={48} className="text-red-800 opacity-20" />
            <p className="text-center font-bold">Security permissions are locked by Kernel Directive 6.0.0.6.</p>
            <p className="text-[10px] text-center">Encryption: X-TYPE RSA (4096-bit). Access denied.</p>
          </div>
        )}

        {activeTab === 'customize' && (
          <div className="flex flex-col gap-6 items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <span className="text-gray-700 font-bold uppercase tracking-wider text-[10px]">Current Icon Appearance</span>
              <div className="w-24 h-24 flex items-center justify-center border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white shadow-inner p-4 grayscale-[0.2]">
                {getFileIconUI(64)}
              </div>
            </div>
            
            <button 
              onClick={() => setShowIconPicker(true)}
              className="px-6 py-2 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white hover:bg-gray-100 font-bold text-xs"
            >
              Change Icon...
            </button>
            <p className="text-[9px] text-gray-500 text-center px-4">Modify the visual representation of this node within the Vespera Shell.</p>
          </div>
        )}
      </div>

      {showIconPicker && (
        <IconPicker 
          currentIconUrl={iconUrl || ''} 
          onSelect={(newUrl) => {
            vfs.updateCustomIcon(node.id, newUrl);
            setShowIconPicker(false);
          }}
          onCancel={() => setShowIconPicker(false)}
        />
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 p-2 pt-3 shrink-0">
        <button onClick={handleOK} className={motifBtnClass}>OK</button>
        <button onClick={onClose} className={motifBtnClass}>Cancel</button>
        <button onClick={handleApply} className={motifBtnClass}>Apply</button>
      </div>
    </div>
  );
};
