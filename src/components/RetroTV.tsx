import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Maximize2, Minimize2, Volume2, VolumeX, Power, ChevronUp, ChevronDown, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RetroTVProps {
  onClose: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const RETRO_CHANNELS = [
  { id: 'cartoons', name: 'Nick at Nite: 90s Toon Network', network: 'NICK', genre: 'Cartoons', videoId: 'Q16No-wDVC0' },
  { id: 'haiti_vibe', name: 'VH1: Vespera World Vibe', network: 'VH1', genre: 'Music', videoId: 'FBN2z0mgALk' },
  { id: 'janet_blackcat', name: 'MTV: Janet Jackson Spotlight', network: 'MTV', genre: 'Music', videoId: 'qH-rPt1ftSo' },
  { id: 'apache_gangsta', name: 'MTV: 90s Hip Hop Central', network: 'MTV', genre: 'Music', videoId: '84DR3VfFO-k' },
  { id: 'boss_idgaf', name: 'MTV Jam: Late Night Street Beats', network: 'MTV', genre: 'Music', videoId: 'XRvpGGc9Jv8' },
  { id: 'janet_if', name: 'MTV: R&B Soul Classics', network: 'MTV', genre: 'Music', videoId: 'BTSd4vqnMwo' },
  { id: 'brandy_bestfriend', name: 'BET: Brandy & Friends', network: 'BET', genre: 'Music', videoId: 'gFMdIj2UPRk' },
  { id: 'method_man_mary', name: 'BET: Method Man Mix', network: 'BET', genre: 'Music', videoId: 'XW1HNWqdVbk' },
  { id: 'toni_braxton_high', name: 'BET: Toni Braxton After Hours', network: 'BET', genre: 'Music', videoId: 'wIgOL21S98o' },
  // Music Expanded
  { id: 'bowie_americans', name: 'VH1: V-Music Hits', network: 'VH1', genre: 'Music', videoId: 'LT3cERVRoQo' },
  { id: 'kp_swing', name: 'BET: Street Jam', network: 'BET', genre: 'Music', videoId: '7MEUqIlyG14' },
  { id: 'mariah_roof', name: 'MTV: Mariah Carey Marathon', network: 'MTV', genre: 'Music', videoId: 'qi5oxzttjgo' },
  // AMW True Crime
  { id: 'amw_nov22_91', name: 'Court TV: True Crime - AMW 91', network: 'COURT', genre: 'Crime', videoId: 'H6_FHUlJUjI' },
  { id: 'amw_dennis_92', name: 'Court TV: True Crime - AMW 92', network: 'COURT', genre: 'Crime', videoId: '0qYd1MPnKow' },
  { id: 'amw_biggie_97', name: 'Court TV: True Crime - AMW 97', network: 'COURT', genre: 'Crime', videoId: '2ayO8T9lAIY' },
  { id: 'amw_apr24_99', name: 'Court TV: True Crime - AMW 99', network: 'COURT', genre: 'Crime', videoId: 'uRNcvXyImTg' },
  // Global News
  { id: 'tva_sept_92', name: 'TVA: Nouvelles 90s', network: 'TVA', genre: 'News', videoId: 'ekozLVDa9gg' },
  // UPN - Moesha Marathon
  { id: 'moesha_s01e01', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'eYWlbEYQUjA' },
  { id: 'moesha_s01e02', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'rZbMkTBwAlk' },
  { id: 'moesha_s01e03', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'v1JqbwYU-9g' },
  { id: 'moesha_s01e04', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'g5vgy6_L9-Y' },
  { id: 'moesha_s01e05', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'shR8Zx1TX2U' },
  { id: 'moesha_s01e06', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: '6E4CyjhqYXc' },
  { id: 'moesha_s01e07', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'WYO_4OM1CNc' },
  { id: 'moesha_s01e08', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: '4ZmJavS_5ek' },
  { id: 'moesha_s01e09', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'vZwrRgWBSQE' },
  { id: 'moesha_s01e10', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'mMxhZLn5x9g' },
  { id: 'moesha_s01e11', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'rwWgNqKy39M' },
  { id: 'moesha_s01e12', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'J5_nJ7hA4tk' },
  { id: 'moesha_s01e13', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'w7-EKmxL9LQ' },
  { id: 'moesha_s01e14', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'uzNDpDPcT0M' },
  { id: 'moesha_s02e01', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'UBJfBmmmVTQ' },
  { id: 'moesha_s02e02', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'xbMefkux6f0' },
  { id: 'moesha_s02e03', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'A9-ZKq6iXQM' },
  { id: 'moesha_s02e04', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'BVQyXHAN05I' },
  { id: 'moesha_s02e05', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: '_OKFrl5PQXM' },
  { id: 'moesha_s02e06', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'jHJSSlRtoBo' },
  { id: 'moesha_s02e08', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'DHwG2TJLtcQ' },
  { id: 'moesha_s02e11', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'loutZ8ncOPk' },
  { id: 'moesha_s02e12', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'z9_jzEEZyoY' },
  { id: 'moesha_s02e13', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: '3GAAT9VXz_I' },
  { id: 'moesha_s02e14', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 'yL70Sm70IdI' },
  { id: 'moesha_s02e15', name: 'UPN: MOESHA Network', network: 'UPN', genre: 'Sitcom', videoId: 's0H89ji3Yjg' },
  // Final Networks
  { id: 'cnn_headline_94', name: 'CNN Headline News', network: 'CNN', genre: 'News', videoId: 'nKjhTvUPzrw' },
  { id: 'best_man_trailer', name: 'Cinema Previews', network: 'HBO', genre: 'Cinema', videoId: 'F6QrNMNPYus' }
];

const COMMERCIAL_POOL = [
  'UspnuAphzN8', 'll8Bho3c_pw', 'b6A0HIRWtCU', 'OatUMBSDQyo', 
  'ib3csdQVpS8', '8t5HROVIFkM', 'vBDSkBYekn8', '0HnyI2Jd5ZM',
  '1HBgJojaOGQ', 'H9KesJyxFhY', 'hUzxINj1RZs', 'QFrVzQSfjzk',
  '7pOBN5oiYJo', 'Aj8_tQOSPNg', '4ygUsLp8XeA', 'r6dHDj_l5E8',
  '1ONB7YoMZj4', 'Eu6E22KOnao', 'ygj7IVggyYQ', 'oaoZzdoJsXQ'
];

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

// ── stylized network logos ──────────────────────────────────────────────────
const ChannelLogo: React.FC<{ network: string }> = ({ network }) => {
  switch (network) {
    case 'MTV':
      return (
        <div className="w-8 h-6 bg-[#FFFF00] flex items-center justify-center font-black italic text-black text-[10px] border border-black shadow-[1px_1px_0px_#fff]">
          M<span className="text-[6px] not-italic ml-0.5 mt-1 border-l border-black pl-0.5">TV</span>
        </div>
      );
    case 'BET':
      return (
        <div className="w-8 h-6 bg-black flex items-center justify-center font-bold text-white text-[9px] border border-gray-500 relative">
          BET
          <span className="absolute -top-1 right-0 text-yellow-400 text-[8px]">★</span>
        </div>
      );
    case 'UPN':
      return (
        <div className="w-8 h-6 bg-[#000080] flex items-center justify-center font-bold text-white text-[9px] border border-white rounded-sm">
          UPN
        </div>
      );
    case 'NICK':
      return (
        <div className="w-8 h-6 bg-orange-500 rounded-full flex items-center justify-center font-black text-white text-[7px]">
          NICK
        </div>
      );
    case 'COURT':
      return (
        <div className="w-8 h-6 bg-red-900 flex items-center justify-center font-serif text-white text-[8px] border-l-2 border-yellow-600">
          CT
        </div>
      );
    case 'CNN':
      return (
        <div className="w-8 h-6 bg-red-600 flex items-center justify-center font-bold text-white text-[9px] border border-white">
          CNN
        </div>
      );
    case 'HBO':
      return (
        <div className="w-8 h-6 bg-black flex items-center justify-center font-bold text-white text-[10px] rounded-full border border-gray-400">
          HBO
        </div>
      );
    case 'VH1':
      return (
        <div className="w-8 h-6 bg-purple-600 flex items-center justify-center font-bold text-white text-[9px] border border-pink-300">
          VH1
        </div>
      );
    default:
      return (
        <div className="w-8 h-6 bg-gray-700 flex items-center justify-center font-bold text-gray-400 text-[10px]">
          TV
        </div>
      );
  }
};

export const RetroTV: React.FC<RetroTVProps> = ({ onClose, isMaximized = false, onToggleMaximize }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPowered, setIsPowered] = useState(true);
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);
  const [volume, setVolume] = useState(0.8);

  const [playbackTime, setPlaybackTime] = useState(0);
  const [isCommercial, setIsCommercial] = useState(false);
  
  const mainPlayerRef = useRef<any>(null);
  const adPlayerRef = useRef<any>(null);
  const apiInitialized = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize YouTube API
  useEffect(() => {
    const loadAPI = () => {
      if (window.YT && window.YT.Player) {
        onAPIReady();
        return;
      }
      
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        onAPIReady();
      };
    };

    const onAPIReady = () => {
      if (apiInitialized.current) return;
      apiInitialized.current = true;
      
      mainPlayerRef.current = new window.YT.Player('main-player', {
        height: '100%',
        width: '100%',
        videoId: RETRO_CHANNELS[0].videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(isMuted ? 0 : volume * 100);
            if (isPowered) e.target.playVideo();
          }
        }
      });

      adPlayerRef.current = new window.YT.Player('ad-player', {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(isMuted ? 0 : volume * 100);
          }
        }
      });
    };

    loadAPI();

    return () => {
      if (mainPlayerRef.current) mainPlayerRef.current.destroy();
      if (adPlayerRef.current) adPlayerRef.current.destroy();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer Logic
  useEffect(() => {
    if (!isPowered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setPlaybackTime((t) => {
        const nextTime = t + 1;
        
        if (!isCommercial && nextTime >= 60) {
          triggerCommercial();
          return 0;
        }

        if (isCommercial && nextTime >= 30) {
          endCommercial();
          return 0;
        }

        return nextTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPowered, isCommercial]);

  const triggerCommercial = () => {
    setIsSwitching(true);
    if (mainPlayerRef.current) mainPlayerRef.current.pauseVideo();
    
    const randomAd = COMMERCIAL_POOL[Math.floor(Math.random() * COMMERCIAL_POOL.length)];
    const randomStart = Math.floor(Math.random() * 600);

    if (adPlayerRef.current) {
      adPlayerRef.current.loadVideoById({
        videoId: randomAd,
        startSeconds: randomStart
      });
      adPlayerRef.current.playVideo();
    }
    
    setIsCommercial(true);
    setTimeout(() => setIsSwitching(false), 800);
  };

  const endCommercial = () => {
    setIsSwitching(true);
    if (adPlayerRef.current) adPlayerRef.current.stopVideo();
    if (mainPlayerRef.current) mainPlayerRef.current.playVideo();
    
    setIsCommercial(false);
    setTimeout(() => setIsSwitching(false), 800);
  };

  const jumpToChannel = (index: number) => {
    if (!isPowered) return;
    setIsSwitching(true);
    setPlaybackTime(0);
    setIsCommercial(false);
    if (adPlayerRef.current) adPlayerRef.current.stopVideo();
    
    setTimeout(() => {
      setCurrentChannelIndex(index);
      if (mainPlayerRef.current) {
        mainPlayerRef.current.loadVideoById(RETRO_CHANNELS[index].videoId);
      }
      setIsSwitching(false);
    }, 450);
  };

  const changeChannel = (dir: number) => {
    let nextIndex = currentChannelIndex + dir;
    if (nextIndex < 0) nextIndex = RETRO_CHANNELS.length - 1;
    if (nextIndex >= RETRO_CHANNELS.length) nextIndex = 0;
    jumpToChannel(nextIndex);
  };

  // Sync Volume & Power
  useEffect(() => {
    const vol = isMuted ? 0 : volume * 100;
    if (mainPlayerRef.current) mainPlayerRef.current.setVolume(vol);
    if (adPlayerRef.current) adPlayerRef.current.setVolume(vol);
  }, [volume, isMuted]);

  useEffect(() => {
    if (mainPlayerRef.current) {
      if (isPowered && !isCommercial) mainPlayerRef.current.playVideo();
      else mainPlayerRef.current.pauseVideo();
    }
    if (adPlayerRef.current) {
      if (isPowered && isCommercial) adPlayerRef.current.playVideo();
      else adPlayerRef.current.pauseVideo();
    }
  }, [isPowered]);

  const currentChannelName = RETRO_CHANNELS[currentChannelIndex].name;

  return (
    <div 
      className={`bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] flex transition-all ${
        isMaximized ? 'fixed inset-0 w-full h-full flex-row' : 'w-[800px] h-[600px] flex-col'
      }`}
      style={{ zIndex: 1000 }}
    >
      <div className={`flex flex-col flex-1 ${isMaximized ? 'h-full border-r-2 border-gray-400' : ''}`}>
        {/* Title bar */}
        <div className="bg-[#000080] text-white px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border border-black shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5)]"></div>
            <div className="w-4 h-4 bg-yellow-500 rounded-full border border-black shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5)]"></div>
            <div className="w-4 h-4 bg-green-500 rounded-full border border-black shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5)]"></div>
            <span className="ml-2 text-sm font-bold tracking-tight uppercase">RetroTV Cable</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMuted(!isMuted)} className="p-1 hover:bg-[#0000a0] rounded active:bg-[#000040]">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button onClick={onToggleMaximize} className="p-1 hover:bg-[#0000a0] rounded active:bg-[#000040]">
              {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={onClose} className="p-1 hover:bg-[#800000] rounded active:bg-[#400000]"><X size={16} /></button>
          </div>
        </div>

        <div className="flex-1 bg-black relative flex flex-col justify-center items-center overflow-hidden">
          <div className="relative aspect-video w-full max-w-[100%] h-auto max-h-[100%] overflow-hidden bg-black shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            
            {/* Main Video Overlay */}
            <div className={`absolute inset-0 transition-opacity duration-500 ${isPowered ? 'opacity-100' : 'opacity-0'}`}>
              <div id="main-player" className={`${isPowered ? '' : 'pointer-events-none'}`} />
            </div>

            {/* Ad Video Overlay */}
            <div className={`absolute inset-0 transition-opacity duration-500 z-10 ${isPowered && isCommercial ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div id="ad-player" />
            </div>

            {/* Shield */}
            <div 
              className="absolute inset-0 z-40 bg-transparent cursor-default" 
              style={{ pointerEvents: 'auto' }}
              onContextMenu={(e) => e.preventDefault()}
            />

            {!isPowered && (
              <motion.div initial={{ scaleX: 1, scaleY: 1 }} animate={{ scaleX: 0, scaleY: 0 }} className="absolute inset-0 bg-black flex items-center justify-center z-50">
                <div className="w-1 h-1 bg-white rounded-full blur-sm" />
              </motion.div>
            )}

            <AnimatePresence>
              {isSwitching && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-[url('https://media.giphy.com/media/oEI9uWUic8vS/giphy.gif')] mix-blend-overlay pointer-events-none" />
              )}
            </AnimatePresence>

            {isPowered && !isSwitching && (
              <div className="absolute top-4 left-6 flex flex-col items-start gap-1 z-20">
                <div className="text-green-500 font-mono text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,1)] uppercase tracking-widest">
                   {isCommercial ? 'BREAK' : `CH ${currentChannelIndex + 2}`}
                </div>
                {!isCommercial && (
                  <div className="text-green-500 font-mono text-xs opacity-80 drop-shadow-md">
                    {RETRO_CHANNELS[currentChannelIndex].network}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="w-full h-16 bg-[#2a2a2a] border-t-4 border-black flex items-center justify-between px-8 text-[#888] shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)]">
            <button onClick={() => setIsPowered(!isPowered)} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${isPowered ? 'bg-green-900 border-green-500 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-gray-800 border-gray-600 text-gray-500'}`}>
              <Power size={20} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase">Channel</span>
              <div className="flex flex-col gap-1">
                <button onClick={() => changeChannel(1)} className="p-0.5 bg-[#333] border border-[#444] rounded shadow-sm hover:bg-[#444] active:bg-[#111]"><ChevronUp size={14} /></button>
                <button onClick={() => changeChannel(-1)} className="p-0.5 bg-[#333] border border-[#444] rounded shadow-sm hover:bg-[#444] active:bg-[#111]"><ChevronDown size={14} /></button>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex gap-1 h-3 items-end">
                {[...Array(5)].map((_, i) => <div key={i} className={`w-1.5 transition-all ${i / 4 < volume ? 'bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'bg-gray-700'}`} style={{ height: `${20 + i * 20}%` }} />)}
              </div>
              <div className="flex gap-4 mt-2">
                <button onClick={() => setVolume(v => Math.max(0, v - 0.1))} className="text-[10px] hover:text-white uppercase">Vol -</button>
                <button onClick={() => setVolume(v => Math.min(1, v + 0.1))} className="text-[10px] hover:text-white uppercase">Vol +</button>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-end">
               <div className="text-[10px] font-mono tracking-tighter text-[#555]">DualLink Pro v2.3</div>
               <div className="text-[9px] text-[#444]">CALIFORNIA ELECTRONICS</div>
            </div>
          </div>
        </div>

        <div className="bg-[#c0c0c0] border-t-2 border-white px-2 py-0.5 flex items-center justify-between text-[10px]">
          <span className="text-gray-700 font-bold uppercase">{isPowered ? (isCommercial ? 'Stay Tuned' : currentChannelName) : 'System Offline'}</span>
          <span className="text-gray-700 font-mono italic">{isPowered ? (isCommercial ? 'ADS OVERLAY ACTIVE' : 'PROGRAM RESUMABLE') : 'WAITING...'}</span>
        </div>
      </div>

      {/* Channel Guide Sidebar */}
      {isMaximized && (
        <div className="w-[300px] h-full bg-[#000080] border-l-4 border-black flex flex-col shadow-[-4px_0_10px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="bg-[#000040] text-yellow-400 p-3 border-b-2 border-yellow-400/30 flex items-center gap-2">
            <List size={18} />
            <span className="font-mono text-sm font-bold tracking-widest uppercase">Select Program</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-1">
            {RETRO_CHANNELS.map((ch, idx) => {
              const isActive = currentChannelIndex === idx;
              return (
                <button
                  key={ch.id}
                  onClick={() => jumpToChannel(idx)}
                  className={`w-full text-left p-2.5 font-mono text-[11px] transition-all flex gap-3 items-center group relative border-b border-yellow-400/10 ${
                    isActive 
                      ? 'bg-yellow-400 text-black shadow-[4px_4px_0_black] z-10' 
                      : 'text-yellow-200/70 hover:bg-[#0000a0] hover:text-yellow-100'
                  }`}
                >
                  <div className="shrink-0 scale-90">
                    <ChannelLogo network={ch.network || ''} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-1 overflow-hidden">
                      <span className="font-bold truncate">CH {idx + 2}: {ch.name.includes(':') ? ch.name.split(':')[1].trim() : ch.name}</span>
                      {ch.genre && (
                        <span className={`text-[8px] px-1 border uppercase font-bold ${
                          isActive ? 'bg-black text-yellow-400 border-black' : 'bg-blue-900/40 text-yellow-500 border-yellow-700/50'
                        }`}>
                          {ch.genre}
                        </span>
                      )}
                    </div>
                    
                    {isActive && (
                      <div className="mt-1 h-0.5 w-full bg-black/30 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-black/60"
                          initial={{ width: 0 }}
                          animate={{ width: `${(playbackTime / 60) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {isActive && <List size={12} className="shrink-0 animate-pulse" />}
                </button>
              );
            })}
          </div>

          <div className="bg-black/40 p-2 text-[9px] font-mono text-blue-300 flex justify-between items-center italic">
            <span>VESPERA CABLE NETWORK</span>
            <span>v2.3 GUIDE</span>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000040; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4444ff; border: 2px solid #000040; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6666ff; }
      `}} />
    </div>
  );
};
