import React, { useState, useEffect } from 'react';
import { Music, Radio, Download, ExternalLink, Star, ArrowRight, Loader2 } from 'lucide-react';

interface AtlanticWavesSiteProps {
  onDownload: (filename: string, source: string) => void;
}

export const AtlanticWavesSite: React.FC<AtlanticWavesSiteProps> = ({ onDownload }) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing connection...');

  useEffect(() => {
    const statuses = [
      'Establishing handshake with Aetheris node...',
      'Downloading MIDI stream [04:22]...',
      'Unpacking high-fidelity textures...',
      'Rendering Star-Field-v2.0.gif...',
      'Syncing with Atlantic Waves database...',
      'Finalizing layout...'
    ];

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        setStatus(statuses[Math.floor((next / 100) * statuses.length)]);
        return next;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  const onDownloadClick = () => {
    onDownload('AW_RELEASE_RADAR_SETUP.EXE', 'http://www.atlanticwaves.ca/files/AW_RELEASE_RADAR_SETUP.EXE');
  };

  if (loading) {
    return (
      <div className="min-h-full bg-black flex flex-col items-center justify-center p-8 font-serif select-none">
        <div className="max-w-md w-full flex flex-col items-center gap-8">
           <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] via-[#ff00ff] to-[#00ffcc] animate-pulse">
              ATLANTIC WAVES
           </h1>
           
           <div className="w-full space-y-4">
              <div className="flex justify-between text-[#00ffcc] text-xs font-mono uppercase tracking-widest">
                 <span>{status}</span>
                 <span>{Math.floor(progress)}%</span>
              </div>
              
              <div className="h-6 bg-black border-2 border-[#00ffcc] p-1 flex gap-1">
                 {Array.from({ length: 20 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-full w-[4.5%] ${i < (progress / 5) ? 'bg-[#00ffcc]' : 'bg-transparent'} transition-colors duration-200`}
                    />
                 ))}
              </div>
           </div>

           <div className="flex flex-col items-center gap-2 text-gray-500 text-[10px] italic">
              <p>Best viewed in Netscape Navigator 3.0 or higher</p>
              <div className="flex gap-4">
                 <span>800x600 Resolution</span>
                 <span>16-bit Color</span>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#000033] text-[#00ffcc] font-serif p-4 selection:bg-[#ff00ff] selection:text-white">
      {/* Background Tiling - In a real 96 site this would be a starry gif */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 max-w-4xl mx-auto shadow-[0_0_20px_rgba(0,255,204,0.3)] bg-black/40 p-1 border-4 border-double border-[#00ffcc]">
        
        {/* Header Marquee */}
        <div className="bg-[#1a1a1a] border-b-2 border-[#00ffcc] py-1 overflow-hidden">
          <marquee scrollamount="4" className="text-sm font-bold tracking-widest text-[#ffff00]">
            *** WELCOME TO THE OFFICIAL ATLANTIC WAVES WEB PORTAL *** LATEST RELEASE: "NEON MIDNIGHT" BY VIRTUA-CORE OUT NOW! *** ENJOY THE WAVES ***
          </marquee>
        </div>

        {/* Visual Header */}
        <header className="text-center py-8 border-b-2 border-[#00ffcc] bg-gradient-to-b from-[#000033] to-black">
          <div className="inline-block relative">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] via-[#ff00ff] to-[#00ffcc] animate-pulse drop-shadow-[0_0_8px_rgba(0,255,204,0.8)]">
              ATLANTIC WAVES
            </h1>
            <div className="absolute -top-4 -right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full rotate-12 border border-white animate-bounce shadow-lg">
              HOT!
            </div>
          </div>
          <p className="mt-4 text-xl font-bold tracking-[0.2em] uppercase text-[#ff00ff]">Modern Sound • Retro Soul</p>
          
          <div className="flex justify-center gap-4 mt-6">
            <Star className="text-[#ffff00] animate-spin" size={24} />
            <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-[#00ffcc] to-transparent self-center"></div>
            <Star className="text-[#ffff00] animate-spin" size={24} />
          </div>
        </header>

        <div className="flex flex-col md:flex-row border-b-2 border-[#00ffcc]">
          {/* Navigation Bar */}
          <nav className="w-full md:w-48 bg-[#111] border-r-2 border-[#00ffcc] p-4 flex flex-col gap-4">
             <div className="p-2 border border-[#00ffcc] text-center text-xs font-bold bg-[#003366] text-white">
                WEBSITE CATEGORIES
             </div>
             <ul className="flex flex-col gap-2 text-sm font-bold">
                <li className="group flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                   <span className="text-[#ff00ff] group-hover:translate-x-1 transition-transform">»</span> Home
                </li>
                <li className="group flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                   <span className="text-[#ff00ff] group-hover:translate-x-1 transition-transform">»</span> Artist Roster
                </li>
                <li className="group flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                   <span className="text-[#ff00ff] group-hover:translate-x-1 transition-transform">»</span> Tour Dates
                </li>
                <li className="group flex items-center gap-2 cursor-pointer hover:text-white transition-colors text-white bg-[#006666] p-1">
                   <span className="text-[#ffff00]">»</span> Software
                </li>
                <li className="group flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                   <span className="text-[#ff00ff] group-hover:translate-x-1 transition-transform">»</span> Merch Store
                </li>
                <li className="group flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                   <span className="text-[#ff00ff] group-hover:translate-x-1 transition-transform">»</span> Contact Us
                </li>
             </ul>

             {/* Hit Counter */}
             <div className="mt-auto pt-8 flex flex-col items-center gap-2">
                <p className="text-[10px] uppercase font-bold text-gray-500">Visitor Count:</p>
                <div className="bg-black border-2 border-[#00ffcc] px-2 py-1 flex gap-1 font-mono text-xl tracking-widest text-[#00ffcc] shadow-[inset_0_0_5px_rgba(0,255,204,0.5)]">
                   <span>0</span><span>4</span><span>8</span><span>2</span><span>9</span>
                </div>
             </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 p-6 flex flex-col gap-8 bg-black/60">
             <section className="border-2 border-dashed border-[#ff00ff] p-4 bg-[#ff00ff]/5">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-4 text-[#ff00ff]">
                   <Radio size={24} /> EXCLUSIVE DOWNLOAD
                </h2>
                
                <div className="flex flex-col md:flex-row gap-6 items-center">
                   <div className="w-48 h-48 bg-gradient-to-br from-[#00ffcc] to-[#ff00ff] p-1 shadow-[0_0_15px_rgba(255,0,255,0.4)]">
                      <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center gap-2 border border-black p-4 text-center">
                         <Music size={64} className="text-[#00ffcc] animate-pulse" />
                         <p className="text-[10px] font-bold text-white uppercase tracking-tighter">Release Radar v1.0</p>
                      </div>
                   </div>

                   <div className="flex-1 space-y-4">
                      <p className="text-lg font-bold leading-relaxed">
                        Tired of missing the latest Atlantic Waves tracks? Get the <span className="text-white bg-[#006666] px-1 italic">AW RELEASE RADAR</span> application for Vespera OS!
                      </p>
                      <ul className="text-sm list-none space-y-2">
                        <li className="flex items-start gap-2">
                          <ArrowRight size={14} className="mt-1 text-[#ffff00] shrink-0" />
                          <span>Real-time artist update notifications.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight size={14} className="mt-1 text-[#ffff00] shrink-0" />
                          <span>Direct-to-Desktop song streaming.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight size={14} className="mt-1 text-[#ffff00] shrink-0" />
                          <span>Exclusive early access to limited edition WAVs.</span>
                        </li>
                      </ul>

                      <button 
                         onClick={onDownloadClick}
                         className="group relative inline-flex items-center gap-3 bg-[#00ffcc] text-black px-8 py-3 font-black text-lg uppercase tracking-widest border-4 border-white active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,204,0.6)] hover:bg-white hover:text-[#00ffcc] hover:border-[#00ffcc]"
                      >
                         <Download size={24} className="group-hover:animate-bounce" />
                         Download Installer
                         <div className="absolute -top-3 -right-3 bg-[#ff00ff] text-white text-[10px] p-1 border-2 border-white rotate-12 font-bold whitespace-nowrap">
                            FREE!
                         </div>
                      </button>
                      <p className="text-[10px] text-[#00ffcc]/60 italic font-mono mt-2">Compatible with Vespera OS 1.0 or higher. (4.2MB)</p>
                   </div>
                </div>
             </section>

             <section>
                <h3 className="text-xl font-bold border-b border-[#00ffcc] pb-2 mb-4">Latest Waves News</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="border border-[#00ffcc]/30 p-3 hover:bg-[#003366]/20 transition-all cursor-pointer">
                      <p className="text-[10px] text-[#ff00ff] font-bold">FEB 24, 1996</p>
                      <h4 className="font-bold text-white mt-1">Virtua-Core Tour Announced</h4>
                      <p className="text-xs mt-2 text-[#00ffcc]/80">Joining the East Coast Synthetic tour this spring! Check the dates in our tour section.</p>
                   </div>
                   <div className="border border-[#00ffcc]/30 p-3 hover:bg-[#003366]/20 transition-all cursor-pointer">
                      <p className="text-[10px] text-[#ff00ff] font-bold">JAN 12, 1996</p>
                      <h4 className="font-bold text-white mt-1">Newsletter Volume 4 Out</h4>
                      <p className="text-xs mt-2 text-[#00ffcc]/80">Sign up for our digital mailer to get secret codes for free synth-packs!</p>
                   </div>
                </div>
             </section>
          </main>
        </div>

        {/* Footer */}
        <footer className="bg-[#1a1a1a] p-4 text-center border-t-2 border-[#00ffcc] flex flex-col items-center gap-4">
           <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Legal Terms</span>
              <span className="hover:text-white cursor-pointer">Aetheris Webring</span>
           </div>
           
           <div className="flex items-center gap-2">
              <div className="w-12 h-8 bg-gray-500 rounded flex items-center justify-center text-black font-black text-[10px]">Netscape</div>
              <div className="w-12 h-8 bg-[#000080] rounded flex items-center justify-center text-white font-black text-[10px]">IE 3.0</div>
              <p className="text-[10px] font-bold">Best viewed at 800x600 resolution</p>
           </div>

           <p className="text-[11px] font-mono text-gray-500">
             © 1994-1996 Atlantic Waves Group • All Rights Reserved.
           </p>
        </footer>
      </div>

      <div className="text-center mt-8 pb-8">
         <p className="text-xs text-gray-600">Created with HotDog Pro v2.0</p>
      </div>
    </div>
  );
};
