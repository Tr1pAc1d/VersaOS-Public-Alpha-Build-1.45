import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { RETRO_ICONS } from '../utils/retroIcons';
import { PNG_ICONS } from '../utils/pngIcons';

const ALL_ICONS = [...PNG_ICONS, ...RETRO_ICONS];

interface IconPickerProps {
  currentIconUrl?: string;
  onSelect: (iconUrl: string) => void;
  onCancel: () => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ currentIconUrl, onSelect, onCancel }) => {
  const [selectedIcon, setSelectedIcon] = useState(currentIconUrl || ALL_ICONS[0].url);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = ALL_ICONS.filter(icon => 
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOK = () => {
    onSelect(selectedIcon);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className="w-[450px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[2px_2px_10px_rgba(0,0,0,0.5)] flex flex-col font-sans">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-0.5 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#c0c0c0] flex items-center justify-center border border-t-white border-l-white border-b-gray-800 border-r-gray-800">
              <div className="w-2.5 h-0.5 bg-black" />
            </div>
            <span className="text-[11px] font-bold">Change Icon</span>
          </div>
          <button 
            onClick={onCancel}
            className="w-4 h-4 bg-[#c0c0c0] flex items-center justify-center border border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
          >
            <X size={10} className="text-black" />
          </button>
        </div>

        {/* Search / Path area simulating 90s picker */}
        <div className="p-3 bg-[#c0c0c0] flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-700">Look for icons in this file:</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-[11px] font-mono flex items-center gap-2">
                <Search size={12} className="text-gray-400" />
                <span>C:\VESPERA\SYSTEM\SHELL.DLL</span>
              </div>
              <button className="px-3 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] text-[10px] font-bold hover:bg-gray-200">
                Browse...
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Icon Grid */}
            <div className="flex-1">
              <label className="text-[10px] text-gray-700 block mb-1">Select an icon from the list below:</label>
              <div className="h-[200px] bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-x-hidden overflow-y-scroll p-2 pr-1 box-border scrollbar-windows">
                <div className="grid grid-cols-4 gap-2 justify-items-center">
                  {filteredIcons.map((icon) => (
                    <button
                      key={icon.id}
                      onClick={() => setSelectedIcon(icon.url)}
                      onDoubleClick={handleOK}
                      className={`w-11 h-11 flex flex-col items-center justify-center gap-1 p-1 transition-colors box-border ${selectedIcon === icon.url ? 'bg-[#000080] text-white' : 'hover:bg-gray-100'}`}
                      title={icon.name}
                    >
                      <img src={icon.url} alt={icon.id} className="w-8 h-8 pointer-events-none" style={{ imageRendering: 'pixelated' }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Pane */}
            <div className="w-[120px] flex flex-col gap-3">
              <div className="text-[10px] text-gray-700 font-bold uppercase tracking-tight">Preview</div>
              <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] flex flex-col items-center justify-center p-2 gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-white border border-gray-400 flex items-center justify-center shadow-sm">
                    <img src={selectedIcon} alt="32x32" className="w-[32px] h-[32px]" style={{ imageRendering: 'pixelated' }} />
                  </div>
                  <span className="text-[9px] text-gray-500 italic">32x32</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 bg-white border border-gray-400 flex items-center justify-center shadow-sm">
                    <img src={selectedIcon} alt="16x16" className="w-[16px] h-[16px]" style={{ imageRendering: 'pixelated' }} />
                  </div>
                  <span className="text-[9px] text-gray-500 italic">16x16</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-3 pt-0 flex justify-end gap-2">
          <button 
            onClick={handleOK}
            className="px-6 py-1 font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] text-[11px] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white hover:bg-gray-200"
          >
            OK
          </button>
          <button 
            onClick={onCancel}
            className="px-6 py-1 font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] text-[11px] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
