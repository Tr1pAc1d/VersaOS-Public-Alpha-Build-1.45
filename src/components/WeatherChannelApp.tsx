import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudRain, Radio, Satellite } from 'lucide-react';

interface Props {
  onClose: (e: React.MouseEvent) => void;
  isMaximized?: boolean;
}

export const WeatherChannelApp: React.FC<Props> = ({ onClose, isMaximized }) => {
  const [stage, setStage] = useState<'loading' | 'ready'>('loading');
  const [loadPct, setLoadPct] = useState(0);

  useEffect(() => {
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.floor(Math.random() * 15) + 5;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        setTimeout(() => setStage('ready'), 400);
      }
      setLoadPct(Math.min(pct, 100));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#c0c0c0]">
      <div className="w-full h-full flex flex-col relative bg-black overflow-hidden border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white">
        
        {/* Fake Loading Interface */}
        <AnimatePresence>
          {stage === 'loading' && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-50 bg-[#001040] flex flex-col items-center justify-center text-white"
            >
              <Satellite size={64} className="mb-6 text-blue-400 animate-pulse" />
              <h2 className="text-2xl font-bold mb-8 tracking-[0.2em] text-white">THE WEATHER CHANNEL</h2>
              
              <div className="w-72 h-6 bg-gray-900 border-2 border-gray-500 p-0.5 relative flex items-center justify-center">
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-blue-600 transition-all duration-200" 
                  style={{ width: `${loadPct}%` }} 
                />
                <span className="relative z-10 text-xs font-mono font-bold">
                  {loadPct < 30 ? 'CONNECTING TO SATELLITE UPLINK...' : 
                   loadPct < 70 ? 'DOWNLOADING METEOROLOGICAL DATA...' : 
                   'INITIALIZING INTERACTIVE RADAR...'}
                </span>
              </div>
              <div className="mt-4 text-xs text-blue-300 font-mono tracking-wider">
                VesperaNET Broadcast System v2.1
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The actual retroactive weather site */}
        <iframe 
          src="https://weather.com/retro/"
          className="flex-1 w-full h-full border-none"
          title="The Weather Channel Interactive"
          style={{ opacity: stage === 'ready' ? 1 : 0 }}
        />
      </div>
    </div>
  );
};
