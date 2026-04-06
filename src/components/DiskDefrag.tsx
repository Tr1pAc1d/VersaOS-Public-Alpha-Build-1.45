import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, AlertTriangle } from 'lucide-react';
import { playGlitchCorruptSound } from '../utils/audio';

interface Cluster {
  id: number;
  status: 'empty' | 'used' | 'system' | 'active' | 'glitch';
}

export const DiskDefrag: React.FC = () => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isDefragging, setIsDefragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCluster, setCurrentCluster] = useState(0);
  const [fragLevel, setFragLevel] = useState(42);
  const [statusText, setStatusText] = useState('Drive C: Select Defragment to begin optimization.');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const GRID_SIZE = 150; // 10x15

  // Initialize Disk
  useEffect(() => {
    initializeDisk();
  }, []);

  const initializeDisk = () => {
    const newClusters: Cluster[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      let status: Cluster['status'] = 'empty';
      const rand = Math.random();
      if (rand < 0.05) status = 'system';
      else if (rand < 0.5) status = 'used';
      newClusters.push({ id: i, status });
    }
    setClusters(newClusters);
    setProgress(0);
    setCurrentCluster(0);
    setFragLevel(42);
    setIsDefragging(false);
    setStatusText('Drive C: Select Defragment to begin optimization.');
  };

  const startDefrag = () => {
    if (isDefragging) return;
    setIsDefragging(true);
    setStatusText('Defragmenting Drive C: Analyzing clusters...');
    
    let index = 0;
    timerRef.current = setInterval(() => {
      setClusters(prev => {
        const next = [...prev];
        
        // Reset old active
        if (index > 0 && next[index - 1].status === 'active') {
          // Logic: If we moved data, it should be used, else if it was empty it stays empty
          // For simplicity, we'll just restore used/empty based on our "movement"
        }

        // Defrag logic: Find the first empty slot and move a used block there
        const firstEmpty = next.findIndex(c => c.status === 'empty');
        const lastUsed = [...next].reverse().findIndex(c => c.status === 'used');
        const lastUsedIdx = GRID_SIZE - 1 - lastUsed;

        if (firstEmpty !== -1 && lastUsedIdx > firstEmpty) {
          next[firstEmpty].status = 'used';
          next[lastUsedIdx].status = 'empty';
        }

        // Highlight current scan
        const scanIdx = index % GRID_SIZE;
        const prevStatus = next[scanIdx].status;
        next[scanIdx].status = 'active';

        // Glitch chance
        if (Math.random() > 0.98) {
          const glitchIdx = Math.floor(Math.random() * GRID_SIZE);
          const oldStatus = next[glitchIdx].status;
          next[glitchIdx].status = 'glitch';
          playGlitchCorruptSound();
          setTimeout(() => {
            setClusters(c => {
              const updated = [...c];
              updated[glitchIdx].status = oldStatus;
              return updated;
            });
          }, 100);
        }

        // Restore status after a moment
        setTimeout(() => {
          setClusters(c => {
            const updated = [...c];
            if (updated[scanIdx]?.status === 'active') {
               updated[scanIdx].status = prevStatus === 'active' ? 'used' : prevStatus;
            }
            return updated;
          });
        }, 50);

        return next;
      });

      index++;
      setCurrentCluster(index);
      
      const newProgress = Math.min((index / (GRID_SIZE * 4)) * 100, 100);
      setProgress(newProgress);
      setFragLevel(prev => Math.max(0, 42 - (newProgress * 0.42)));

      if (newProgress >= 100) {
        clearInterval(timerRef.current!);
        setIsDefragging(false);
        setStatusText('Defragmentation Complete. Drive C: is optimized.');
      } else {
        setStatusText(`Defragmenting Drive C: Optimizing cluster ${index}...`);
      }
    }, 100);
  };

  const stopDefrag = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsDefragging(false);
    setStatusText('Defragmentation Halted.');
  };

  const getStatusColor = (status: Cluster['status']) => {
    switch (status) {
      case 'used': return 'bg-[#0000ff]'; // Blue
      case 'empty': return 'bg-[#ffffff]'; // White
      case 'system': return 'bg-[#ff0000]'; // Red
      case 'active': return 'bg-[#ffff00]'; // Yellow
      case 'glitch': return 'bg-[#800080]'; // Purple
      default: return 'bg-[#ffffff]';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] p-2 font-sans select-none text-black">
      {/* Legend */}
      <div className="flex gap-4 mb-4 text-[10px] bg-white p-2 border-2 border-inset border-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#0000ff] border border-gray-600" />
          <span>Used</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#ffffff] border border-gray-600" />
          <span>Empty</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#ff0000] border border-gray-600" />
          <span>System</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#ffff00] border border-gray-600" />
          <span>Reading</span>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 bg-white border-2 border-inset border-gray-400 p-2 overflow-hidden mb-4 rounded-sm shadow-inner">
        <div className="grid grid-cols-15 gap-[2px] h-full">
          {clusters.map(cluster => (
            <div 
              key={cluster.id}
              className={`w-full h-full aspect-square border-t border-l border-white border-b border-r border-gray-500 shadow-sm transition-colors duration-75 ${getStatusColor(cluster.status)}`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button 
            onClick={startDefrag}
            disabled={isDefragging}
            className={`px-4 py-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white flex items-center gap-2 text-sm font-bold ${isDefragging ? 'opacity-50' : 'hover:bg-gray-100'}`}
          >
            <Play size={14} fill="currentColor" /> Defragment
          </button>
          <button 
            onClick={stopDefrag}
            disabled={!isDefragging}
            className={`px-4 py-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white flex items-center gap-2 text-sm font-bold ${!isDefragging ? 'opacity-50' : 'hover:bg-gray-100'}`}
          >
            <Square size={14} fill="currentColor" /> Stop
          </button>
          <button 
            onClick={initializeDisk}
            className="px-4 py-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold hover:bg-gray-100"
          >
            Reset
          </button>
        </div>

        {/* Progress Logic */}
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex justify-between text-[11px] font-bold italic">
            <span>Optimization Progress: {Math.round(progress)}%</span>
            <span>Fragmentation: {Math.round(fragLevel)}%</span>
          </div>
          <div className="h-4 bg-white border-2 border-inset border-gray-400 p-[2px]">
            <div 
              className="h-full bg-[#000080]" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status Area */}
        <div className="mt-2 bg-[#425a7a] text-white p-1 border-2 border-inset border-gray-600 text-[10px] font-mono flex items-center gap-2">
          <AlertTriangle size={12} className={isDefragging ? 'text-yellow-400' : 'text-transparent'} />
          <span>{statusText}</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .grid-cols-15 {
          grid-template-columns: repeat(15, minmax(0, 1fr));
        }
      `}} />
    </div>
  );
};
