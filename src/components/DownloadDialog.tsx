import React, { useState, useEffect } from 'react';
import { FileDown, Folder } from 'lucide-react';

interface DownloadDialogProps {
  filename: string;
  source: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const DownloadDialog: React.FC<DownloadDialogProps> = ({ filename, source, onComplete, onCancel }) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(134); // 2 Min 14 Sec in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (Math.random() * 5 + 2);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return next;
      });
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 500);

    return () => clearInterval(interval);
  }, [onComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} Min ${s} Sec`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-96 flex flex-col font-sans text-black select-none">
        
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center">
          <span className="font-bold text-sm">File Download</span>
          <button onClick={onCancel} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-4 h-4 flex items-center justify-center text-black font-bold text-xs active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
            X
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <FileDown size={32} className="text-gray-600 mt-2" />
            <div className="flex flex-col gap-1 text-sm">
              <p>Saving:</p>
              <p className="font-bold">{filename}</p>
              <p>from {source}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span>Estimated time left:</span>
              <span>{formatTime(timeLeft)} ({Math.round(progress)}% of 1.2MB)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Download to:</span>
              <span>C:\VESPERA\DOWNLOADS</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Transfer rate:</span>
              <span>4.2 KB/Sec</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-6 bg-[#c0c0c0] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-[2px] flex">
            {/* Render dark blue blocks */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className={`h-full w-[4.5%] mx-[0.25%] ${i < (progress / 5) ? 'bg-[#000080]' : 'bg-transparent'}`}
              />
            ))}
          </div>

          <div className="flex justify-end mt-2">
            <button 
              onClick={onCancel}
              className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 text-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
