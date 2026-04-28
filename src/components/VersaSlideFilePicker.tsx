import React, { useState } from 'react';
import { Folder, FolderOpen, Check, X } from 'lucide-react';
import { VFSNode } from '../hooks/useVFS';

interface VersaSlideFilePickerProps {
  vfs: any;
  defaultName?: string;
  folderOnly?: boolean;
  mode?: 'save' | 'open';
  allowedExtensions?: { value: string, label: string }[];
  title?: string;
  onConfirm: (folderId: string, filename: string) => void;
  onCancel: () => void;
}

const W95: React.CSSProperties = {
  fontFamily: 'MS Sans Serif, Arial, sans-serif',
  fontSize: '11px',
};

const W95Btn: React.CSSProperties = {
  ...W95,
  background: '#c0c0c0',
  border: '2px solid',
  borderColor: '#ffffff #808080 #808080 #ffffff',
  padding: '3px 12px',
  cursor: 'pointer',
  minWidth: 70,
};

// Recursive folder tree node
const FolderNode: React.FC<{
  node: VFSNode;
  vfs: any;
  depth: number;
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ node, vfs, depth, selectedId, onSelect }) => {
  const [expanded, setExpanded] = useState(depth === 0);
  const children = vfs.nodes.filter((n: VFSNode) => n.parentId === node.id && n.type === 'directory' && !n.isApp);
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        onClick={() => { onSelect(node.id); setExpanded(e => !e); }}
        style={{
          ...W95,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          padding: '2px 4px',
          paddingLeft: 6 + depth * 14,
          cursor: 'pointer',
          background: isSelected ? '#000080' : 'transparent',
          color: isSelected ? '#fff' : '#000',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 10, width: 10 }}>{children.length > 0 ? (expanded ? '▼' : '►') : ' '}</span>
        {expanded ? <FolderOpen size={13} /> : <Folder size={13} />}
        <span>{node.name}</span>
      </div>
      {expanded && children.map((c: VFSNode) => (
        <FolderNode key={c.id} node={c} vfs={vfs} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
};

export const VersaSlideFilePicker: React.FC<VersaSlideFilePickerProps> = ({
  vfs, 
  defaultName = 'Presentation1', 
  folderOnly = false, 
  mode = 'save',
  allowedExtensions = [
    { value: '.pptx', label: 'VersaSlide Presentation (*.pptx)' },
    { value: '.vsp', label: 'VersaSlide Project (*.vsp)' }
  ],
  title,
  onConfirm, 
  onCancel
}) => {
  const displayTitle = title || (mode === 'open' ? 'Open' : 'Save As...');
  // Find the true root (C:\)
  const rootNode = vfs.nodes.find((n: VFSNode) => n.id === 'root');

  const [selectedFolder, setSelectedFolder] = useState<string>('documents');
  const [filename, setFilename] = useState(defaultName.replace(/\.[^/.]+$/, ''));
  const [ext, setExt] = useState<string>(allowedExtensions[0]?.value || '');
  const [showCollisionWarning, setShowCollisionWarning] = useState<string | null>(null);

  const selectedFolderNode = vfs.nodes.find((n: VFSNode) => n.id === selectedFolder);

  const handleConfirm = () => {
    const finalName = filename.trim() || 'Presentation1';
    const fullName = `${finalName}${ext}`;
    
    if (mode === 'save') {
      const existing = vfs.nodes.find((n: VFSNode) => n.parentId === selectedFolder && n.name.toLowerCase() === fullName.toLowerCase());
      if (existing) {
        setShowCollisionWarning(fullName);
        return;
      }
    }
    
    onConfirm(selectedFolder, fullName);
  };

  return (
    // Overlay
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {showCollisionWarning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto' }}>
          <div style={{ width: 320, background: '#c0c0c0', border: '2px solid', borderColor: '#ffffff #808080 #808080 #ffffff', boxShadow: '4px 4px 8px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#000080', color: '#fff', padding: '3px 6px', ...W95, fontWeight: 'bold' }}>
              Confirm Save As
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <img src="/Icons/Extra Icons/directory_warning.ico" alt="Warning" style={{ width: 32, height: 32, imageRendering: 'pixelated' }} />
                <div style={{ ...W95 }}>
                  <span style={{ fontWeight: 'bold' }}>{showCollisionWarning}</span> already exists.<br/><br/>Do you want to replace it?
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button 
                  style={{ ...W95Btn, minWidth: 60 }} 
                  onClick={() => {
                    onConfirm(selectedFolder, showCollisionWarning);
                    setShowCollisionWarning(null);
                  }}
                >
                  Yes
                </button>
                <button 
                  style={{ ...W95Btn, minWidth: 60 }} 
                  onClick={() => setShowCollisionWarning(null)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog */}
      <div style={{ width: 480, background: '#c0c0c0', border: '2px solid', borderColor: '#ffffff #808080 #808080 #ffffff', boxShadow: '4px 4px 8px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', pointerEvents: showCollisionWarning ? 'none' : 'auto' }}>
        {/* Title bar */}
        <div style={{ background: '#000080', color: '#fff', padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...W95, fontWeight: 'bold' }}>
          <span>{folderOnly ? 'Select Folder' : displayTitle}</span>
          <button onClick={onCancel} style={{ background: '#c0c0c0', color: '#000', border: '2px solid', borderColor: '#fff #808080 #808080 #fff', width: 16, height: 14, cursor: 'pointer', fontSize: 10, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>×</button>
        </div>

        <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Save in label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ ...W95, minWidth: 60 }}>{mode === 'open' ? 'Look in:' : 'Save in:'}</label>
            <div style={{ flex: 1, background: '#fff', border: '2px solid', borderColor: '#808080 #fff #fff #808080', padding: '2px 4px', ...W95, fontWeight: 'bold' }}>
              {selectedFolderNode?.name || 'Documents'}
            </div>
          </div>

          {/* Folder and File panes */}
          <div style={{ display: 'flex', gap: 8, height: 200 }}>
            <div style={{ flex: 1, background: '#fff', border: '2px solid', borderColor: '#808080 #fff #fff #808080', overflow: 'auto' }}>
              {rootNode && (
                <FolderNode key={rootNode.id} node={rootNode} vfs={vfs} depth={0} selectedId={selectedFolder} onSelect={setSelectedFolder} />
              )}
            </div>
            {!folderOnly && (
              <div style={{ flex: 1, background: '#fff', border: '2px solid', borderColor: '#808080 #fff #fff #808080', overflow: 'auto', padding: 2 }}>
                {vfs.nodes.filter((n: VFSNode) => n.parentId === selectedFolder && n.type === 'file').map((file: VFSNode) => (
                  <div
                    key={file.id}
                    onClick={() => {
                      setFilename(file.name.replace(/\.[^/.]+$/, ''));
                      const fileExt = file.name.match(/\.[^/.]+$/)?.[0] || '';
                      if (allowedExtensions.some(e => e.value === fileExt)) setExt(fileExt);
                    }}
                    onDoubleClick={() => {
                      setFilename(file.name.replace(/\.[^/.]+$/, ''));
                      const fileExt = file.name.match(/\.[^/.]+$/)?.[0] || '';
                      const fullName = `${file.name.replace(/\.[^/.]+$/, '')}${fileExt}`;
                      if (mode === 'save') {
                        setShowCollisionWarning(fullName);
                      } else {
                        onConfirm(selectedFolder, fullName);
                      }
                    }}
                    style={{ ...W95, padding: '2px 4px', cursor: 'pointer', background: filename === file.name.replace(/\.[^/.]+$/, '') ? '#000080' : 'transparent', color: filename === file.name.replace(/\.[^/.]+$/, '') ? '#fff' : '#000', userSelect: 'none' }}
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          {!folderOnly && (
            <>
              {/* Filename */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ ...W95, minWidth: 60 }}>File name:</label>
                <input
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                  style={{ flex: 1, border: '2px solid', borderColor: '#808080 #fff #fff #808080', padding: '2px 4px', ...W95 }}
                  autoFocus
                />
              </div>

              {/* Save as type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <label style={{ ...W95, minWidth: 60 }}>{mode === 'open' ? 'Files of type:' : 'Save as type:'}</label>
                <select
                  value={ext}
                  onChange={e => setExt(e.target.value)}
                  style={{ flex: 1, border: '2px solid', borderColor: '#808080 #fff #fff #808080', padding: '2px 4px', ...W95 }}
                >
                  {allowedExtensions.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
            <button style={W95Btn} onClick={handleConfirm}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> {folderOnly ? 'Select' : mode === 'open' ? 'Open' : 'Save'}</span>
            </button>
            <button style={W95Btn} onClick={onCancel}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><X size={12} /> Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
