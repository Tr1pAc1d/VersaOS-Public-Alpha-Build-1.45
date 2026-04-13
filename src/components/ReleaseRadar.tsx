import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, Volume2, Search, Radio, Disc } from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number; // in seconds
  cover: string;
}

const TRACKS: Track[] = [
  { id: 1, title: 'Neon Midnight', artist: 'Virtua-Core', duration: 242, cover: 'https://placehold.co/400/00ffcc/000033/png?text=NEON' },
  { id: 2, title: 'Aetheris Node', artist: 'Aetheris-9', duration: 315, cover: 'https://placehold.co/400/ff00ff/000033/png?text=AETHER' },
  { id: 3, title: 'Synthetic Rain', artist: 'EchoSoft', duration: 198, cover: 'https://placehold.co/400/00ffff/000033/png?text=SYNTH' },
  { id: 4, title: 'Binary Sunset', artist: 'Bit-Crush', duration: 254, cover: 'https://placehold.co/400/ffff00/000033/png?text=BINARY' },
  { id: 5, title: 'Deep Sweep', artist: 'Sub-Sonic', duration: 210, cover: 'https://placehold.co/400/ff3300/000033/png?text=DEEP' },
];

export const ReleaseRadar: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPulse, setScanPulse] = useState(0);
  
  const currentTrack = TRACKS[currentTrackIndex];
  
  const progressPercent = (currentTime / currentTrack.duration) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const handleNext = () => {
    setCurrentTrackIndex(prev => (prev + 1) % TRACKS.length);
    setCurrentTime(0);
  };

  const handlePrev = () => {
    setCurrentTrackIndex(prev => (prev - 1 + TRACKS.length) % TRACKS.length);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    setCurrentTime(pct * currentTrack.duration);
  };

  const handleScan = () => {
    setIsScanning(true);
    let count = 0;
    const interval = setInterval(() => {
      setScanPulse(prev => (prev + 1) % 100);
      count++;
      if (count > 20) {
        clearInterval(interval);
        setIsScanning(false);
        setScanPulse(0);
      }
    }, 100);
  };

  return (
    <div className="w-[400px] h-[500px] bg-[#000022] text-[#00ffcc] font-serif flex flex-col border-4 border-[#00ffcc] shadow-[0_0_20px_rgba(0,255,204,0.3)] overflow-hidden select-none relative group">
      {/* Scanning Overlay */}
      {isScanning && (
        <div className="absolute inset-0 z-50 bg-cyan-900/40 pointer-events-none border-b-4 border-cyan-400/80 transition-all duration-100" style={{ top: `${scanPulse}%` }}></div>
      )}

      {/* Header */}
      <div className="bg-[#000044] border-b-2 border-[#00ffcc] px-4 py-2 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
           <Radio size={16} className="text-[#ff00ff] animate-pulse" />
           <span className="font-black italic tracking-tighter text-sm">RELEASE RADAR v1.0</span>
        </div>
        <div className="flex gap-2 text-[10px] font-mono">
           <span className="text-[#ff00ff]">SIGNAL: HIGH</span>
        </div>
      </div>

      {/* Album Art Area */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center p-4">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#00ffcc 1px, transparent 0), linear-gradient(90deg, #00ffcc 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
         
         <div className="relative w-48 h-48 border-4 border-double border-[#ff00ff] p-1 shadow-[0_0_30px_rgba(255,0,255,0.4)] transition-transform duration-500 hover:scale-105">
             <img src={currentTrack.cover} alt="album art" className="w-full h-full object-cover" />
             <div className="absolute inset-0 ring-1 ring-inset ring-white/20"></div>
             {isPlaying && (
                <div className="absolute -bottom-2 -right-2 bg-black border border-[#00ffcc] p-1">
                   <Disc className="animate-spin text-[#00ffcc]" size={24} />
                </div>
             )}
         </div>

         <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl font-black italic tracking-tighter text-white truncate drop-shadow-md">{currentTrack.title}</h2>
            <p className="text-xs uppercase tracking-widest text-[#ff00ff] font-bold">{currentTrack.artist}</p>
         </div>
      </div>

      {/* Controls & Progress */}
      <div className="bg-[#000033] p-4 border-t-2 border-[#00ffcc] flex flex-col gap-4">
         {/* Progress Bar */}
         <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-widest">
               <span>{formatTime(currentTime)}</span>
               <span>{formatTime(currentTrack.duration)}</span>
            </div>
            <div 
              className="h-4 bg-black border border-[#00ffcc] relative cursor-pointer group/progress overflow-hidden"
              onClick={handleProgressClick}
            >
               {/* Progress Fill */}
               <div className="h-full bg-gradient-to-r from-[#00ffcc] to-[#ff00ff] transition-all duration-200" style={{ width: `${progressPercent}%` }}></div>
               
               {/* Hover Preview Line */}
               <div className="absolute inset-0 opacity-0 group-hover/progress:opacity-20 bg-white pointer-events-none transition-opacity"></div>
               
               {/* Grid Pattern on progress bar */}
               <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #000 1px, transparent 0)', backgroundSize: '10px 100%' }}></div>
            </div>
         </div>

         {/* Audio Controls */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <button onClick={handlePrev} className="p-2 border border-[#00ffcc] hover:bg-[#00ffcc] hover:text-black transition-colors active:translate-y-[1px]">
                  <SkipBack size={18} fill="currentColor" />
               </button>
               <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  className="p-3 bg-[#00ffcc] text-black border-2 border-white hover:bg-white transition-all active:scale-95 shadow-[0_0_10px_#00ffcc]"
               >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
               </button>
               <button onClick={handleNext} className="p-2 border border-[#00ffcc] hover:bg-[#00ffcc] hover:text-black transition-colors active:translate-y-[1px]">
                  <SkipForward size={18} fill="currentColor" />
               </button>
            </div>

            <div className="flex items-center gap-4">
               <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="px-3 py-1 bg-black border-2 border-[#ff00ff] text-[#ff00ff] text-[10px] font-black italic tracking-tighter hover:bg-[#ff00ff] hover:text-white transition-all disabled:opacity-50"
               >
                  {isScanning ? 'SCANNING...' : 'SCAN FOR WAVES'}
               </button>
               <div className="flex items-center gap-2 group/vol">
                  <Volume2 size={14} className="text-[#00ffcc] group-hover/vol:animate-bounce" />
                  <div className="w-16 h-1.5 bg-black border border-[#00ffcc]/30 relative overflow-hidden">
                     <div className="h-full bg-[#00ffcc]" style={{ width: `${volume * 100}%` }}></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Track List Drawer (Mini) */}
      <div className="max-h-24 overflow-y-auto bg-black border-t-2 border-[#00ffcc] p-2 custom-scrollbar">
         <div className="flex flex-col gap-1">
            {TRACKS.map((t, idx) => (
               <div 
                 key={t.id} 
                 onClick={() => { setCurrentTrackIndex(idx); setCurrentTime(0); setIsPlaying(true); }}
                 className={`flex items-center justify-between px-2 py-1 text-[10px] cursor-pointer border ${currentTrackIndex === idx ? 'bg-[#00ffcc] text-black border-white' : 'hover:bg-[#003333] border-transparent'}`}
               >
                  <div className="flex items-center gap-2 truncate">
                     <Music size={10} className={currentTrackIndex === idx ? 'text-black' : 'text-[#ff00ff]'} />
                     <span className="truncate">{t.title}</span>
                  </div>
                  <span className="font-mono opacity-60 shrink-0 ml-2">{formatTime(t.duration)}</span>
               </div>
            ))}
         </div>
      </div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }}></div>
    </div>
  );
};
