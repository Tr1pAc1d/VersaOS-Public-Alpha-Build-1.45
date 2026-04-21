import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize, Download, ImageIcon } from 'lucide-react';
import { VFSNode } from '../hooks/useVFS';

interface VersaViewProps {
  vfs: {
    getNode: (id: string) => VFSNode | null;
  };
  fileId?: string;
  onClose: () => void;
}

export const VersaView: React.FC<VersaViewProps> = ({ vfs, fileId, onClose }) => {
  const [zoom, setZoom] = useState<number>(1);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("No Image Loaded");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fileId) {
      const node = vfs.getNode(fileId);
      if (node && node.type === 'file' && node.content) {
        setImageSrc(node.content);
        setImageName(node.name);
        setZoom(1);
      }
    }
  }, [fileId, vfs]);

  const handleExport = () => {
    if (!imageSrc) return;
    const a = document.createElement('a');
    a.href = imageSrc;
    a.download = imageName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const W95: React.CSSProperties = {
    fontFamily: '"MS Sans Serif", Arial, sans-serif',
    fontSize: 11,
  };

  const getContainerStyle = (): React.CSSProperties => {
     return {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        backgroundColor: '#808080',
        borderTop: '2px solid #404040',
        borderLeft: '2px solid #404040',
        borderBottom: '2px solid #ffffff',
        borderRight: '2px solid #ffffff',
     };
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#c0c0c0]" style={W95}>
      {/* Menu Bar */}
      <div className="flex px-1 py-0.5 border-b border-gray-500 shadow-[0_1px_0_#fff]">
        <span className="px-2 py-0.5 hover:bg-[#000080] hover:text-white cursor-default">File</span>
        <span className="px-2 py-0.5 hover:bg-[#000080] hover:text-white cursor-default">View</span>
        <span className="px-2 py-0.5 hover:bg-[#000080] hover:text-white cursor-default">Help</span>
      </div>

      {/* Toolbar */}
      <div className="flex gap-1 p-1 border-b border-gray-500 shadow-[0_1px_0_#fff]">
        <div className="flex gap-1 pr-2 border-r border-gray-500 shadow-[1px_0_0_#fff]">
          <button 
            className="p-1 active:bg-[#a0a0a0] border border-transparent hover:border-white hover:border-b-gray-500 hover:border-r-gray-500"
            title="Zoom In"
            onClick={() => setZoom(z => Math.min(5, z + 0.25))}
          >
            <ZoomIn size={16} />
          </button>
          <button 
            className="p-1 active:bg-[#a0a0a0] border border-transparent hover:border-white hover:border-b-gray-500 hover:border-r-gray-500"
            title="Zoom Out"
            onClick={() => setZoom(z => Math.max(0.1, z - 0.25))}
          >
            <ZoomOut size={16} />
          </button>
          <button 
            className="p-1 active:bg-[#a0a0a0] border border-transparent hover:border-white hover:border-b-gray-500 hover:border-r-gray-500"
            title="Actual Size"
            onClick={() => setZoom(1)}
          >
            <Maximize size={16} />
          </button>
        </div>
        <button 
          className="p-1 active:bg-[#a0a0a0] border border-transparent hover:border-white hover:border-b-gray-500 hover:border-r-gray-500 flex items-center gap-1 ml-1"
          title="Export to OS"
          onClick={handleExport}
        >
          <Download size={16} className="text-blue-700" />
          <span>Export</span>
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 p-1" style={{ minHeight: 0 }}>
        <div ref={containerRef} style={getContainerStyle()}>
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={imageName}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.1s',
                imageRendering: zoom > 1 ? 'pixelated' : 'auto',
                maxWidth: 'max-content',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.5)'
              }}
              draggable={false}
            />
          ) : (
             <div className="flex flex-col items-center justify-center text-white opacity-50">
                <ImageIcon size={48} className="mb-2" />
                <span>No Image Selected</span>
             </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-5 border-t border-white border-l border-l-white bg-[#c0c0c0] shadow-[inset_1px_1px_0_#808080,inset_-1px_-1px_0_#dfdfdf] flex items-center px-2 text-[11px]">
        {imageSrc ? `View: ${Math.round(zoom * 100)}%` : 'Ready'}
      </div>
    </div>
  );
};
