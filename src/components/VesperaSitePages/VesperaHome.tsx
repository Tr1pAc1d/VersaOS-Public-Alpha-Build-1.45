import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity, Globe, Search, Monitor, Hourglass, UserCircle2, ShieldCheck, Mail, FileDown, Download, X, AlertTriangle } from 'lucide-react';
import { VesperaPageProps } from './types';

type VMailDialogState = 'choice' | 'loading' | null;

const DIAL_STEPS = [
  { msg: 'Resolving host: vesperamail.vespera.net...', pct: 10 },
  { msg: 'Dialing VesperaNET relay node...', pct: 20 },
  { msg: 'Carrier detected at 28,800 bps...', pct: 32 },
  { msg: 'Negotiating SSL handshake...', pct: 45 },
  { msg: 'Verifying member credentials...', pct: 58 },
  { msg: 'Synchronizing inbox vectors...', pct: 72 },
  { msg: 'Decrypting message headers...', pct: 86 },
  { msg: 'Rendering document...', pct: 100 },
];

export const VesperaHome: React.FC<VesperaPageProps> = ({ webAccount, navigate, onLaunchApp, hasVMail }) => {
  const [vmailDialog, setVmailDialog] = useState<VMailDialogState>(null);
  const [dialStep, setDialStep] = useState(0);
  const [dialPct, setDialPct] = useState(0);

  useEffect(() => {
    if (vmailDialog !== 'loading') return;
    setDialStep(0);
    setDialPct(0);

    let step = 0;
    const advance = () => {
      if (step >= DIAL_STEPS.length) return;
      setDialStep(step);
      setDialPct(DIAL_STEPS[step].pct);
      step++;
      if (step < DIAL_STEPS.length) {
        setTimeout(advance, 600 + Math.random() * 400);
      } else {
        // Done — navigate after a short pause
        setTimeout(() => {
          setVmailDialog(null);
          navigate('vesperamail.vespera.net');
        }, 700);
      }
    };
    setTimeout(advance, 300);
  }, [vmailDialog]);

  return (
    <>
      {webAccount && (
        <div className="mb-6 border-4 border-double border-[#003366] bg-gradient-to-r from-[#001a33] to-[#003366] text-white p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border-2 border-[#ffcc00] bg-[#002244] flex items-center justify-center shadow-inner shrink-0">
              <UserCircle2 size={36} className="text-[#ffcc00]" />
            </div>
            <div className="flex-1">
              <p className="text-[#ffcc00] text-lg font-bold tracking-wide">Welcome back, {webAccount.displayName}</p>
              <p className="text-xs text-blue-200 mt-0.5">
                Member ID: {webAccount.memberId} &bull; {webAccount.tier} Tier &bull; {webAccount.vstorePoints} Points
              </p>
            </div>
            <ShieldCheck size={28} className="text-[#ffcc00] shrink-0 opacity-60" />
          </div>
          <div className="mt-3 pt-3 border-t border-blue-700 grid grid-cols-3 gap-2 text-center text-xs">
            <div 
              className="bg-[#002244] border border-[#004c99] p-2 shadow-inner cursor-pointer hover:bg-[#003366] transition-colors"
              onClick={() => setVmailDialog('choice')}
            >
              <Mail size={16} className="mx-auto mb-1 text-[#ffcc00]" />
              <span className="text-blue-200 font-bold">VMail Inbox</span>
            </div>
            <div 
              className="bg-[#002244] border border-[#004c99] p-2 shadow-inner cursor-pointer hover:bg-[#003366] transition-colors"
              onClick={() => navigate('vespera:account')}
            >
              <Globe size={16} className="mx-auto mb-1 text-[#ffcc00]" />
              <span className="text-blue-200 font-bold">My Account</span>
            </div>
            <div 
              className="bg-[#002244] border border-[#004c99] p-2 shadow-inner cursor-pointer hover:bg-[#003366] transition-colors"
              onClick={() => navigate('vespera:downloads_member')}
            >
              <FileDown size={16} className="mx-auto mb-1 text-[#ffcc00]" />
              <span className="text-blue-200 font-bold">My Downloads</span>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">
        {webAccount ? `Member Portal — ${webAccount.displayName}` : 'Welcome to Vespera'}
      </h2>
      
      <div className="mb-8 text-sm leading-relaxed space-y-4">
        <p className="font-bold text-lg text-[#000080]">
          {webAccount ? 'VesperaNET Member Services — Secure Access Granted' : 'Vespera Systems: The Future is Now.'}
        </p>
        <p>
          {webAccount 
            ? `Thank you for being a valued VesperaNET ${webAccount.tier} member since ${new Date(webAccount.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}. Your account credentials have been verified via 128-bit SSL handshake. All member services are now available.`
            : 'Vespera Systems is a leading provider of advanced operating environments and hardware for the modern enterprise. We bridge the gap between human intuition and raw computational power.'
          }
        </p>
        {!webAccount && (
          <p>
            Explore our site to learn more about our <span className="text-blue-700 underline cursor-pointer" onClick={() => navigate('vespera:about')}>origins</span>, our software solutions, or visit our curated Web Directory below to surf the Information Superhighway.
          </p>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Our Products & Services</h2>
      
      <div className="mb-10">
        <h3 className="font-bold text-lg text-black bg-gray-200 p-1 border border-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.2)] mb-4">Featured Hardware & Software</h3>
        <div className="grid grid-cols-4 gap-4">
          <div onClick={() => navigate('vespera:store')} className="cursor-pointer border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-3 flex flex-col items-center text-center hover:bg-[#d0d0d0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
            <img src="/Vespera Website assets/Product Images/Vespera Workplace RHID Edition Box.png" alt="Horizon Desktop PC" className="w-12 h-12 object-contain mb-2" />
            <span className="font-bold text-xs leading-tight">Horizon Desktop PC</span>
          </div>
          <div onClick={() => navigate('vespera:xtype')} className="cursor-pointer border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-3 flex flex-col items-center text-center hover:bg-[#d0d0d0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
            <Cpu size={32} className="text-red-800 mb-2" />
            <span className="font-bold text-xs leading-tight">X-Type Expansion Card</span>
          </div>
          <div onClick={() => navigate('vespera:products')} className="cursor-pointer border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-3 flex flex-col items-center text-center hover:bg-[#d0d0d0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
            <img src="/Vespera Website assets/Product Images/Vespera Workplace RHID Second Edition Box.png" alt="Omni-Task Suite" className="w-12 h-12 object-contain mb-2" />
            <span className="font-bold text-xs leading-tight">Omni-Task Suite</span>
          </div>
          <div onClick={() => onLaunchApp?.('vmail')} className="cursor-pointer border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-3 flex flex-col items-center text-center hover:bg-[#d0d0d0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
            <img src="/Vespera Website assets/Product Images/VMail Product box.png" alt="VMail" className="w-12 h-12 object-contain mb-2" />
            <span className="font-bold text-xs leading-tight">Vespera VMail</span>
          </div>
          <div onClick={() => navigate('vespera:products')} className="cursor-pointer border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-3 flex flex-col items-center text-center hover:bg-[#d0d0d0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
            <HardDrive size={32} className="text-gray-800 mb-2" />
            <span className="font-bold text-xs">DeepSweep Utility</span>
          </div>
          <div onClick={() => navigate('vespera:products')} className="cursor-pointer border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-3 flex flex-col items-center text-center hover:bg-[#d0d0d0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
            <Activity size={32} className="text-teal-800 mb-2" />
            <span className="font-bold text-xs">Soma-Scan Diagnostic</span>
          </div>
          <div onClick={() => navigate('vespera:products')} className="cursor-pointer border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-3 flex flex-col items-center text-center hover:bg-[#d0d0d0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
            <Globe size={32} className="text-orange-800 mb-2" />
            <span className="font-bold text-xs">AETHERIS Logistics Node</span>
          </div>
        </div>
      </div>

      {/* VesperaMail Banner Ad */}
      <div 
        onClick={() => setVmailDialog('choice')}
        className="mb-8 cursor-pointer border-4 border-double border-[#ffcc00] bg-gradient-to-r from-[#001122] via-[#002244] to-[#001122] p-4 flex items-center justify-between shadow-[4px_4px_0px_rgba(0,0,0,0.4)] hover:brightness-110 transition-all select-none"
      >
        <div className="flex items-center gap-4">
          <div className="border-2 border-[#ffcc00] bg-black p-2 flex items-center justify-center shrink-0">
            <Mail size={32} className="text-[#ffcc00]" />
          </div>
          <div>
            <p className="text-[#ffcc00] font-bold text-lg tracking-widest font-mono">VESPERANET MAIL</p>
            <p className="text-blue-200 text-xs mt-0.5">Enterprise-grade encrypted digital mail. Now on the web.</p>
            <p className="text-[#ffcc00]/60 font-mono text-[10px] mt-1">http://vesperamail.vespera.net/</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="bg-[#ffcc00] text-black font-bold text-xs px-4 py-1.5 border-2 border-t-[#fff0aa] border-l-[#fff0aa] border-b-[#b38f00] border-r-[#b38f00] shadow-sm">
            LAUNCH VMAIL →
          </div>
          <p className="text-blue-300 text-[10px] mt-1 font-mono">128-bit SSL</p>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-3 text-[#000080] bg-gray-200 p-1 border border-gray-400 shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">Vespera Web Directory</h3>
      
      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <h4 className="font-bold mb-2 flex items-center gap-2"><Search size={16}/> Search & Portals</h4>
          <ul className="list-disc list-inside text-blue-700 underline cursor-pointer space-y-1">
            <li onClick={() => navigate('yahoo.com')} className="hover:text-red-600">Yahoo!</li>
            <li onClick={() => navigate('altavista.com')} className="hover:text-red-600">AltaVista</li>
            <li onClick={() => navigate('excite.com')} className="hover:text-red-600">Excite</li>
            <li onClick={() => navigate('aol.com')} className="hover:text-red-600">America Online</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-2 flex items-center gap-2"><Globe size={16}/> News & Entertainment</h4>
          <ul className="list-disc list-inside text-blue-700 underline cursor-pointer space-y-1">
            <li onClick={() => navigate('vespera:news')} className="hover:text-red-600 font-bold">AETHERIS News Network</li>
            <li onClick={() => navigate('cnn.com')} className="hover:text-red-600">CNN Interactive</li>
            <li onClick={() => navigate('spacejam.com')} className="hover:text-red-600">Space Jam (1996)</li>
            <li onClick={() => navigate('mtv.com')} className="hover:text-red-600">MTV</li>
            <li onClick={() => navigate('blockbuster.com')} className="hover:text-red-600">Blockbuster Video</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-2 flex items-center gap-2"><Monitor size={16}/> Technology</h4>
          <ul className="list-disc list-inside text-blue-700 underline cursor-pointer space-y-1">
            <li onClick={() => navigate('apple.com')} className="hover:text-red-600">Apple Computer</li>
            <li onClick={() => navigate('microsoft.com')} className="hover:text-red-600">Microsoft</li>
            <li onClick={() => navigate('netscape.com')} className="hover:text-red-600">Netscape</li>
            <li onClick={() => navigate('geocities.com')} className="hover:text-red-600">GeoCities</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-2 flex items-center gap-2"><Hourglass size={16}/> Shopping</h4>
          <ul className="list-disc list-inside text-blue-700 underline cursor-pointer space-y-1">
            <li onClick={() => navigate('amazon.com')} className="hover:text-red-600">Amazon.com</li>
            <li onClick={() => navigate('ebay.com')} className="hover:text-red-600">eBay (AuctionWeb)</li>
            <li onClick={() => navigate('toysrus.com')} className="hover:text-red-600">Toys "R" Us</li>
          </ul>
        </div>
      </div>
      
      {/* 90s Web Elements */}
      <div className="mt-12 flex justify-center space-x-4 mb-4 opacity-80">
         <img src="https://web.archive.org/web/19991129013009im_/http://www.geocities.com/SiliconValley/Way/6253/netscape3.gif" alt="Netscape Enhanced" className="h-8"/>
         <img src="https://web.archive.org/web/19991129013009im_/http://www.geocities.com/SiliconValley/Way/6253/html20.gif" alt="Valid HTML 2.0" className="h-8"/>
      </div>
      <div className="text-center font-mono text-xs border-t border-gray-400 pt-2 text-gray-600">
         You are visitor number: 
         <span className="bg-black text-red-500 font-bold px-1 ml-1 font-mono tracking-widest border border-gray-400 inline-block rotate-1">12,492,044</span>
      </div>

      {/* VMail Choice Dialog */}
      {vmailDialog === 'choice' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setVmailDialog(null)}>
          <div
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] w-[420px] flex flex-col font-sans text-black select-none"
            onClick={e => e.stopPropagation()}
          >
            {/* Title Bar */}
            <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span className="font-bold text-sm tracking-wide">VesperaNET Mail — Open With</span>
              </div>
              <button
                onClick={() => setVmailDialog(null)}
                className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-4 h-4 flex items-center justify-center text-black font-bold text-[10px] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
              >X</button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-4">
              <div className="flex gap-3 items-start border-b border-gray-400 pb-4">
                <Mail size={32} className="text-[#000080] shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-sm">How would you like to access VMail?</p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    VMail is available as a native desktop application or as a web-based client via Vespera Navigator.
                  </p>
                </div>
              </div>

              {/* Option 1 — VStore / Open Local */}
              <button
                onClick={() => { setVmailDialog(null); onLaunchApp?.(hasVMail ? 'vmail' : 'vstore'); }}
                className="flex items-center gap-4 p-3 bg-[#ececec] border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 hover:bg-white active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white text-left group"
              >
                <div className="w-10 h-10 bg-[#000080] border border-gray-400 flex items-center justify-center shrink-0">
                  <Download size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm group-hover:text-[#000080]">
                    {hasVMail ? 'Launch VMail' : 'Download via VStore'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {hasVMail ? 'Open your locally installed VMail client.' : 'Install VMail as a native desktop application. Requires VStore account.'}
                  </p>
                </div>
              </button>

              {/* Option 2 — Browser */}
              <button
                onClick={() => setVmailDialog('loading')}
                className="flex items-center gap-4 p-3 bg-[#ececec] border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 hover:bg-white active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white text-left group"
              >
                <div className="w-10 h-10 bg-[#003366] border border-gray-400 flex items-center justify-center shrink-0">
                  <Globe size={20} className="text-[#ffcc00]" />
                </div>
                <div>
                  <p className="font-bold text-sm group-hover:text-[#000080]">Open in Navigator</p>
                  <p className="text-xs text-gray-600">Access VMail through Vespera Navigator. Requires active VesperaNET connection.</p>
                </div>
              </button>

              <div className="flex items-center gap-2 text-[10px] text-gray-500 border-t border-gray-300 pt-2">
                <AlertTriangle size={12} className="text-yellow-700 shrink-0" />
                Web client performance may vary on connections below 28.8 Kbps.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fake Dial-Up Loading Overlay */}
      {vmailDialog === 'loading' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] w-[380px] flex flex-col font-sans text-black select-none">
            <div className="bg-[#000080] text-white px-2 py-1 flex items-center gap-2">
              <Globe size={14} className="text-[#ffcc00]" />
              <span className="font-bold text-sm">Vespera Navigator — Connecting...</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-gray-400 pb-3">
                <div className="w-10 h-10 bg-[#003366] border border-gray-500 flex items-center justify-center shrink-0">
                  <Globe size={20} className="text-[#ffcc00] animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-sm">Opening vesperamail.vespera.net</p>
                  <p className="text-[11px] text-gray-600 font-mono mt-0.5">http://vesperamail.vespera.net/client</p>
                </div>
              </div>

              {/* Status line */}
              <p className="text-[11px] font-mono text-[#000080] font-bold h-4 truncate">
                {DIAL_STEPS[dialStep]?.msg || 'Connecting...'}
              </p>

              {/* Progress bar — Win95 block style */}
              <div className="w-full h-6 bg-[#c0c0c0] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-[2px] flex">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 mx-px transition-all duration-300 ${
                      i < Math.round((dialPct / 100) * 20) ? 'bg-[#000080]' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>

              <p className="text-[10px] text-gray-500 font-mono text-right">{dialPct}% — 28,800 bps</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
