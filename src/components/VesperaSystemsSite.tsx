import React, { useState, useEffect, useRef } from 'react';
import { UserCircle2, Lock, LogIn } from 'lucide-react';
import { VesperaHome } from './VesperaSitePages/VesperaHome';
import { VesperaAbout } from './VesperaSitePages/VesperaAbout';
import { VesperaXType } from './VesperaSitePages/VesperaXType';
import { VesperaProducts } from './VesperaSitePages/VesperaProducts';
import { VesperaDownloads } from './VesperaSitePages/VesperaDownloads';
import { VesperaStore } from './VesperaSitePages/VesperaStore';
import { VesperaPress } from './VesperaSitePages/VesperaPress';
import { VesperaAccount } from './VesperaSitePages/VesperaAccount';
import { VesperaWelcome } from './VesperaSitePages/VesperaWelcome';
import { Vespera404 } from './VesperaSitePages/Vespera404';
import { VesperaCareers } from './VesperaSitePages/VesperaCareers';
import { VesperaIntranet } from './VesperaSitePages/VesperaIntranet';
import { VesperaGuestbook } from './VesperaSitePages/VesperaGuestbook';
import { VesperaAxisLog } from './VesperaSitePages/VesperaAxisLog';
import { VesperaSupport } from './VesperaSitePages/VesperaSupport';
import { VesperaPageProps } from './VesperaSitePages/types';

export const VesperaSystemsSite: React.FC<VesperaPageProps> = (props) => {
  const { url, navigate, webAccount, setWebLoginModal, handleWebLogout } = props;
  
  const [loadingObj, setLoadingObj] = useState<{ isDialing: boolean; msg: string; progress: number }>({ isDialing: false, msg: '', progress: 0 });
  const [internalUrl, setInternalUrl] = useState(url);
  const prevUrl = useRef(url);
  const [isCorrupted, setIsCorrupted] = useState(false);
  const keySequence = useRef<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const key = e.key.toLowerCase();
      keySequence.current += key;
      if (keySequence.current.length > 4) {
        keySequence.current = keySequence.current.slice(-4);
      }
      if (keySequence.current === 'axis') {
        setIsCorrupted(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trigger fake dial-up loading when URL changes
  useEffect(() => {
    if (url !== prevUrl.current) {
      prevUrl.current = url;
      setLoadingObj({ isDialing: true, msg: 'Resolving Host...', progress: 0 });
      setInternalUrl(url); // Update internal URL immediately
      
      let step = 0;
      const msgs = [
        'Connecting to host...',
        'Host Contacted. Waiting for reply...',
        'Transferring graphic data...',
        'Rendering document...',
        'Done.'
      ];
      
      const interval = setInterval(() => {
        step++;
        if (step >= msgs.length - 1) {
          clearInterval(interval);
          setLoadingObj({ isDialing: false, msg: 'Done.', progress: 100 });
        } else {
          setLoadingObj({ isDialing: true, msg: msgs[step], progress: Math.floor((step / msgs.length) * 100) });
        }
      }, 150 + Math.random() * 200); // Faster loading
      
      return () => clearInterval(interval);
    }
  }, [url]);

  // Determine what page to render based on internalUrl
  const renderPage = () => {
    if (internalUrl === 'home') return <VesperaHome {...props} />;
    if (internalUrl === 'vespera:about') return <VesperaAbout {...props} />;
    if (internalUrl === 'vespera:xtype') return <VesperaXType {...props} />;
    if (internalUrl === 'vespera:products') return <VesperaProducts {...props} />;
    if (internalUrl === 'vespera:downloads' || internalUrl === 'vespera:downloads_member') return <VesperaDownloads {...props} />;
    if (internalUrl === 'vespera:store') return <VesperaStore {...props} />;
    if (internalUrl === 'vespera:press' || internalUrl === 'vespera:press/echosoft') return <VesperaPress {...props} />;
    if (internalUrl === 'vespera:account') return <VesperaAccount {...props} />;
    if (internalUrl === 'vespera:welcome') return <VesperaWelcome {...props} />;
    if (internalUrl === 'vespera:careers') return <VesperaCareers {...props} />;
    if (internalUrl === 'vespera:guestbook') return <VesperaGuestbook {...props} />;
    if (internalUrl === 'vespera:intranet') return <VesperaIntranet {...props} />;
    if (internalUrl === 'vespera:axis') return <VesperaAxisLog {...props} />;
    if (internalUrl === 'vespera:support') return <VesperaSupport {...props} />;
    return <Vespera404 {...props} />;
  };

  return (
    <div className={`flex flex-col min-h-full flex-1 w-full relative transition-all duration-1000 ${isCorrupted ? 'invert hue-rotate-180 contrast-125 sepia font-mono' : 'bg-white font-serif text-black'}`}>
      {/* Header */}
      <div className="bg-black text-white p-4 border-b-4 border-gray-400 flex justify-between items-end select-none">
        <div className="flex items-center gap-4">
          <img 
            src="/Vespera Website assets/Product Images/Vespera Logo.png" 
            alt="Vespera Systems Logo" 
            className="h-16 w-auto cursor-pointer object-contain invert grayscale brightness-200" 
            onClick={() => navigate('home')}
          />
          <div>
            <h1 className="text-4xl font-bold tracking-tighter cursor-pointer hidden md:block" onClick={() => navigate('home')}>VESPERA SYSTEMS</h1>
            <p className="text-sm font-mono text-[#00ff41]">"The Future is Now."</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p>Est. 1991</p>
        </div>
      </div>

      {/* Marquee */}
      <div className="bg-[#000080] text-white text-sm py-1 overflow-hidden whitespace-nowrap border-b-2 border-gray-400 select-none hidden sm:block">
        <marquee scrollamount="5" className="font-bold">
          Welcome to the Vespera Systems Corporate Portal! *** NEW: Vespera OS 1.0.4 is now available for enterprise customers! *** Check out our new Web Directory! ***
        </marquee>
      </div>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <div className="w-48 bg-[#c0c0c0] border-r-2 border-gray-400 p-4 flex flex-col gap-4 shrink-0 select-none">
          <div className="flex flex-col items-center gap-2 mb-2">
            <img src="/Vespera Logo Small.png" alt="Vespera Logo" className="w-12 h-12 object-contain" />
            <div className="bg-[#000080] text-white font-bold p-1 text-center border-2 border-t-gray-300 border-l-gray-300 border-b-black border-r-black w-full">
              Navigation
            </div>
          </div>
          <ul className="space-y-2 text-blue-800 underline font-bold text-sm">
            <li className="cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:about')}>Company Info</li>
            <li className="cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:products')}>Products & Services</li>
            <li className="cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:downloads')}>Downloads & Codecs</li>
            <li className="cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:store')}>Vespera Store</li>
            <li className="cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:careers')}>Careers</li>
            <li className="cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:guestbook')}>Community Guestbook</li>
            <li className="cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:press')}>Press Releases</li>
            <li className="cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:support')}>Technical Support</li>
          </ul>

          {/* VesperaNET Member Login Widget */}
          <div className="border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#d8d8d8] p-2 mt-4 max-w-full">
            <div className="bg-[#003366] text-[#ffcc00] font-bold text-[10px] text-center p-0.5 tracking-wider border border-[#001a33] mb-2 truncate">
              VESPERANET
            </div>
            {webAccount ? (
              <div className="flex flex-col items-center gap-1.5 overflow-hidden">
                <UserCircle2 size={24} className="text-[#003366]" />
                <p className="text-[10px] font-bold text-center text-[#003366] leading-tight truncate w-full">
                  Welcome,<br />{webAccount.displayName}
                </p>
                <p className="text-[9px] text-gray-500 font-mono truncate w-full">{webAccount.tier} Member</p>
                <button
                  onClick={handleWebLogout}
                  className="w-full text-[10px] font-bold text-center bg-[#c0c0c0] border border-t-white border-l-white border-b-gray-600 border-r-gray-600 py-0.5 hover:bg-[#d0d0d0] active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white mt-1"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <Lock size={18} className="text-gray-600" />
                <p className="text-[10px] text-center text-gray-700 leading-tight">
                  Member Access
                </p>
                <button
                  onClick={() => { setWebLoginModal(true); }}
                  className="w-full text-[10px] font-bold text-center bg-[#003366] text-[#ffcc00] border border-t-[#004c99] border-l-[#004c99] border-b-[#001a33] border-r-[#001a33] py-0.5 hover:brightness-125 active:border-t-[#001a33] active:border-l-[#001a33] active:border-b-[#004c99] active:border-r-[#004c99] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <LogIn size={10} /> Login
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-auto pt-8 flex flex-col items-center gap-4">
            
            {/* The VesperaNET Official Webring */}
            <div className="border border-gray-400 p-2 bg-white text-center w-full shadow-sm">
               <p className="text-[10px] font-bold text-[#000080] mb-1">Proud Member of the</p>
               <p className="text-xs font-bold text-black border-y border-black py-0.5 mb-1 bg-yellow-200">INTERNET WEBRING</p>
               <div className="flex justify-between text-[10px] font-bold mt-2">
                  <button 
                     onClick={() => navigate(Math.random() > 0.1 ? 'apple.com' : 'vespera:axis')}
                     className="bg-[#c0c0c0] px-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[#000080]"
                  >
                     [Prev]
                  </button>
                  <button 
                     onClick={() => navigate(Math.random() > 0.1 ? 'yahoo.com' : 'vespera:axis')}
                     className="bg-[#c0c0c0] px-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[#000080]"
                  >
                     [Next]
                  </button>
               </div>
            </div>

            <div className="border border-gray-500 p-1 bg-yellow-200 text-center text-xs font-bold w-full shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
              🚧 Under Construction 🚧
            </div>
            <div className="text-[10px] text-center border border-gray-400 p-1 bg-white">
              Best viewed with<br />
              <strong>Netscape Navigator 3.0</strong><br />
              at 800x600
            </div>
            
            <button onClick={() => navigate('vespera:intranet')} className="mt-8 text-[8px] text-gray-400 bg-transparent opacity-30 hover:opacity-100 hover:text-red-800 transition-all cursor-pointer underline border-none text-left">
              Employee Intranet Login
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] relative overflow-hidden">
          
          <div className="w-full max-w-full">
             {renderPage()}
             
             <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-300 pt-4 w-full relative">
                Copyright © 1991-1996 Vespera Systems Corporation. All rights reserved.<br/>
                Powered by the Wayback Machine.
                
                {/* Secret 6.0.0.6 Link */}
                <button 
                   onClick={() => navigate('http://6.0.0.6/')}
                   className="absolute bottom-0 right-0 w-2 h-2 opacity-0 cursor-pointer border-none bg-transparent"
                   title=" "
                ></button>
             </div>
          </div>

          {/* Dial-up Fake Loading Overlay */}
          {loadingObj.isDialing && (
            <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none flex items-end">
              <div className="bg-[#c0c0c0] font-mono text-xs border border-gray-500 shadow-md px-3 py-1.5 flex items-center gap-3 m-2 opacity-90 select-none">
                <span className="font-bold min-w-[170px]">{loadingObj.msg}</span>
                <div className="w-24 h-3 bg-white border border-gray-500 shadow-inner p-[1px]">
                  <div className="bg-[#000080] h-full transition-all duration-300" style={{ width: `${loadingObj.progress}%` }}></div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
