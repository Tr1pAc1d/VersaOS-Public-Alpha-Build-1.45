import React, { useState, useRef, useEffect } from 'react';
import { VFSNode } from '../contexts/FileSystemContext';
import { FileText, Folder, Settings, Terminal, Globe, Trash2 } from 'lucide-react';

interface DesktopIconProps {
  node: VFSNode;
  isSelected: boolean;
  onSelect: (id: string, multi: boolean) => void;
  onOpen: (node: VFSNode) => void;
  onRename: (id: string, newName: string) => void;
  onContextMenu: (e: React.MouseEvent, node: VFSNode) => void;
  isRenaming: boolean;
  setRenamingId: (id: string | null) => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  node,
  isSelected,
  onSelect,
  onOpen,
  onRename,
  onContextMenu,
  isRenaming,
  setRenamingId
}) => {
  const [editName, setEditName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    if (editName.trim() && editName !== node.name) {
      onRename(node.id, editName.trim());
    } else {
      setEditName(node.name);
    }
    setRenamingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(node.name);
      setRenamingId(null);
    }
  };

  const renderIcon = () => {
    if (node.customIcon) {
      return (
        <div className="relative">
          <img src={node.customIcon} alt="icon" className="w-[32px] h-[32px]" style={{ imageRendering: 'pixelated' }} draggable={false} />
          {node.type === 'shortcut' && (
            <div className="absolute -bottom-1 -left-1 bg-white border border-dotted border-black w-3 h-3 flex items-center justify-center">
              <div className="w-1 h-1 bg-black" />
            </div>
          )}
        </div>
      );
    }

    if (node.type === 'shortcut') {
      let IconComponent = FileText;
      switch (node.iconType) {
        case 'folder': IconComponent = Folder; break;
        case 'system': IconComponent = Settings; break;
        case 'app': IconComponent = Terminal; break;
        case 'network': IconComponent = Globe; break;
        case 'trash': IconComponent = Trash2; break;
        default: IconComponent = FileText; break;
      }
      return (
        <div className="relative">
          <IconComponent size={32} className="text-black fill-white" strokeWidth={1.5} />
          <div className="absolute -bottom-1 -left-1 bg-white border border-dotted border-black w-3 h-3 flex items-center justify-center">
            <div className="w-1 h-1 bg-black" />
          </div>
        </div>
      );
    }

    switch (node.type) {
      case 'folder': return <Folder size={32} className="text-[#E0E0E0] fill-[#c0c0c0] drop-shadow-none" strokeWidth={1.5} />;
      case 'text': return <FileText size={32} className="text-black fill-white" strokeWidth={1.5} />;
      case 'app': return <Terminal size={32} className="text-black fill-[#888888]" strokeWidth={1.5} />;
      case 'system': return <Settings size={32} className="text-black fill-[#888888]" strokeWidth={1.5} />;
      default: return <FileText size={32} className="text-black fill-white" strokeWidth={1.5} />;
    }
  };

  return (
    <div
      className="flex flex-col items-center w-20 m-2 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id, e.ctrlKey || e.metaKey);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onOpen(node);
      }}
      onContextMenu={(e) => {
        e.stopPropagation();
        onSelect(node.id, false);
        onContextMenu(e, node);
      }}
    >
      <div className="mb-1 pointer-events-none">
        {renderIcon()}
      </div>
      
      {isRenaming ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={handleKeyDown}
          className="w-full text-center text-xs font-sans bg-[#c0c0c0] text-black border-2 border-t-[#000000] border-l-[#000000] border-b-[#ffffff] border-r-[#ffffff] outline-none px-1"
        />
      ) : (
        <div className={`text-center text-xs font-sans px-1 break-words w-full ${node.type === 'shortcut' ? 'italic border border-dotted border-black' : ''} ${isSelected ? 'bg-black text-white' : 'text-black bg-transparent'}`}>
          {node.name}
        </div>
      )}
    </div>
  );
};
