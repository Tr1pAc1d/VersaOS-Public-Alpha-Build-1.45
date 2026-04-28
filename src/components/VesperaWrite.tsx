import React, { useState, useEffect } from 'react';
import { useVFS, VFSNode } from '../hooks/useVFS';
import { VersaSlideFilePicker } from './VersaSlideFilePicker';

interface VesperaWriteProps {
  vfs: ReturnType<typeof useVFS>;
  fileId: string | null;
  onSave: (content: string) => void;
  onClose: () => void;
}

export const VesperaWrite: React.FC<VesperaWriteProps> = ({ vfs, fileId, onSave, onClose }) => {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Untitled');
  
  const [fontSize, setFontSize] = useState('12px');
  
  const [currentFileId, setCurrentFileId] = useState<string | null>(fileId);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [showOpenDlg, setShowOpenDlg] = useState(false);
  
  useEffect(() => {
    if (fileId) {
      const node = vfs.getNode(fileId);
      if (node && node.type === 'file') {
        setContent(node.content || '');
        setFileName(node.name);
        setCurrentFileId(node.id);
      }
    } else {
      setContent('');
      setFileName('Untitled');
      setCurrentFileId(null);
    }
  }, [fileId]);

  const handleSave = () => {
    if (currentFileId) {
      vfs.updateFileContent(currentFileId, content);
      onSave(content);
    } else {
      setShowSaveAs(true);
    }
  };

  const handleSaveAs = (folderId: string, filename: string) => {
    const extMatch = filename.match(/\.[^/.]+$/);
    const ext = extMatch ? extMatch[0].toLowerCase() : '.txt';
    let finalName = filename;
    if (!extMatch) finalName += '.txt';
    
    const existing = vfs.nodes.find((n: VFSNode) => n.parentId === folderId && n.name === finalName);
    if (existing) {
      vfs.updateFileContent(existing.id, content);
      setCurrentFileId(existing.id);
    } else {
      const node = vfs.createNode(finalName, 'file', folderId, content, undefined, 'file', { customIcon: '/Icons/Microsoft Office/97_word_32.png' });
      setCurrentFileId(node.id);
    }
    setFileName(finalName);
    setShowSaveAs(false);
  };

  const handleOpen = () => {
    setShowOpenDlg(true);
  };

  const performOpen = (folderId: string, filename: string) => {
    const existing = vfs.nodes.find((n: VFSNode) => n.parentId === folderId && n.name === filename);
    if (existing && existing.type === 'file') {
      setContent(existing.content || '');
      setFileName(existing.name);
      setCurrentFileId(existing.id);
    } else {
      alert('File not found.');
    }
    setShowOpenDlg(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-sm select-text">
      {/* Menu Bar */}
      <div className="flex gap-4 px-2 py-0.5 border-b border-white select-none">
        <div className="relative group cursor-pointer">
          <span className="px-2 hover:bg-[#000080] hover:text-white">File</span>
          <div className="absolute left-0 top-full hidden group-hover:block bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-lg z-[100] min-w-[120px] py-1">
            <div onClick={handleOpen} className="px-4 py-1 hover:bg-[#000080] hover:text-white text-black">Open...</div>
            <div onClick={handleSave} className="px-4 py-1 hover:bg-[#000080] hover:text-white text-black">Save</div>
            <div onClick={() => setShowSaveAs(true)} className="px-4 py-1 hover:bg-[#000080] hover:text-white text-black">Save As...</div>
            <div className="h-[1px] bg-gray-600 my-1 mx-1" />
            <div onClick={onClose} className="px-4 py-1 hover:bg-[#000080] hover:text-white text-black">Exit</div>
          </div>
        </div>
        <div className="relative group cursor-pointer">
          <span className="px-2 hover:bg-[#000080] hover:text-white">Edit</span>
          <div className="absolute left-0 top-full hidden group-hover:block bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-lg z-[100] min-w-[120px] py-1">
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white text-black opacity-50 cursor-default">Cut</div>
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white text-black opacity-50 cursor-default">Copy</div>
            <div className="px-4 py-1 hover:bg-[#000080] hover:text-white text-black opacity-50 cursor-default">Paste</div>
          </div>
        </div>
        <div className="relative group cursor-pointer">
          <span className="px-2 hover:bg-[#000080] hover:text-white">Format</span>
          <div className="absolute left-0 top-full hidden group-hover:block bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-lg z-[100] min-w-[140px] py-1">
            <div className="px-2 py-1 text-[10px] font-bold text-gray-600 uppercase border-b border-gray-400 mb-1">Font Size</div>
            {['10px', '12px', '14px', '16px', '18px', '24px'].map(size => (
              <div 
                key={size}
                onClick={() => setFontSize(size)} 
                className={`px-4 py-1 hover:bg-[#000080] hover:text-white text-black flex justify-between items-center ${fontSize === size ? 'bg-gray-300' : ''}`}
              >
                <span>{size}</span>
                {fontSize === size && <span className="text-[10px]">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white m-1 relative overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full resize-none bg-white p-2 font-mono focus:outline-none overflow-y-scroll custom-scrollbar"
          style={{ fontSize }}
          spellCheck={false}
          autoFocus
        />
        
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 16px;
            background: #c0c0c0;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c0c0c0;
            border: 2px solid;
            border-color: #ffffff #808080 #808080 #ffffff;
            box-shadow: inset 1px 1px 0px #c0c0c0;
          }
          .custom-scrollbar::-webkit-scrollbar-button {
            background: #c0c0c0;
            border: 2px solid;
            border-color: #ffffff #808080 #808080 #ffffff;
            height: 16px;
          }
        `}} />
      </div>
      
      {/* Status Bar */}
      <div className="px-2 py-0.5 text-[10px] border-t border-gray-600 flex justify-between bg-[#c0c0c0]">
        <span>File: {fileName}</span>
        <span>Size: {fontSize}</span>
      </div>

      {showSaveAs && (
        <VersaSlideFilePicker
          vfs={vfs as any}
          title="Save As"
          defaultName={fileName === 'Untitled' ? 'New Text File' : fileName.replace(/\.[^/.]+$/, '')}
          allowedExtensions={[{ value: '.txt', label: 'Text Document (*.txt)' }, { value: '.md', label: 'Markdown Document (*.md)' }, { value: '.csv', label: 'Comma Separated Values (*.csv)' }]}
          onConfirm={handleSaveAs}
          onCancel={() => setShowSaveAs(false)}
        />
      )}

      {showOpenDlg && (
        <VersaSlideFilePicker
          vfs={vfs as any}
          title="Open"
          mode="open"
          allowedExtensions={[{ value: '.txt', label: 'Text Document (*.txt)' }, { value: '.md', label: 'Markdown Document (*.md)' }, { value: '.csv', label: 'Comma Separated Values (*.csv)' }]}
          onConfirm={performOpen}
          onCancel={() => setShowOpenDlg(false)}
        />
      )}
    </div>
  );
};

