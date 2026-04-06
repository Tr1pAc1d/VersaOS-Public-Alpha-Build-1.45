import React, { useState, useEffect, useRef } from 'react';
import { Store, Download, CheckCircle2, ArrowLeft, Search, Terminal, AlertTriangle, Globe, Monitor, User, Star, StarHalf, FileSignature, Award, HardDrive } from 'lucide-react';
import { VSTORE_APPS, VStoreApp, VStoreCategory } from '../data/vstoreApps';
import { VStoreAuth, VStoreAccount, getAccounts, getSession, saveAccount, setSession } from './VStoreAuth';
import { VStoreAccountSettings } from './VStoreAccountSettings';
import {
  playModemDialingSound,
  playVStoreLoadingSound,
  playInfoSound,
  playAlertSound,
  playHarshErrorSound,
} from '../utils/audio';

interface VStoreProps {
  onInstallApp: (appId: string) => void;
  installedApps: string[];
  onLaunchBrowser?: (url?: string) => void;
}

const CATEGORIES: VStoreCategory[] = [ 
  'Featured Apps',
  'Games & Entertainment',
  'Productivity',
  'System Utilities',
  'Networking',
  'System'
];

const VStoreBootSequence: React.FC<{ onComplete: () => void, account: VStoreAccount | null }> = ({ onComplete, account }) => {
  const [log, setLog] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let active = true;
    (async () => {
      const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
      const addLine = async (text: string, delay: number = 300) => {
        if (!active) return;
        setLog(prev => [...prev, text]);
        await wait(delay);
      };

      await wait(500);
      await addLine("INITIATING VSTORE SECURE TUNNEL...", 800);
      await addLine("ATZ", 300);
      await addLine("OK", 500);
      await addLine("ATDT 555-0199", 1400);
      await addLine("CONNECT 28800/ARQ/V34/LAPM/V42BIS", 400);
      await addLine("Handshake protocol v3.2 established.", 600);
      await addLine("Verifying RSA key parity... [0xA7FF902]", 400);
      await addLine(`Key accepted. Authenticated as: ${account?.memberId || 'GUEST'}`, 800);
      await addLine(`Loading ${account?.displayName || 'Guest'}'s download manifest...`, 500);
      await addLine(`Syncing ${account?.totalDownloads || 0} local active licenses...`, 300);
      await addLine("Fetching category indices from inode 0...", 300);
      await addLine("Parsing 42 active metadata blocks...", 900);
      await addLine("Resolving thumbnail CDNs...", 400);
      
      for(let i=0; i<3; i++) {
        if (!active) break;
        await addLine(`Downloading block chunk 0x${Math.floor(Math.random()*10000).toString(16).toUpperCase()}... [OK]`, 150 + Math.random() * 200);
      }
      
      await addLine("Validating software integrity signatures...", 700);
      await addLine("Syncing user license registry...", 600);
      await addLine("Connection secured. System nominal.", 400);
      await addLine("Handing over to GUI...", 800);
      
      if (active) onComplete();
    })();
    return () => { active = false; };
  }, [onComplete]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="absolute inset-0 z-[100] bg-[#004c66] flex flex-col items-center justify-center text-white font-mono p-4">
      <div className="w-full max-w-lg border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-black p-4 shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
         <div className="flex gap-4 items-center mb-4 border-b-2 border-gray-700 pb-3 text-yellow-500">
           <Store size={36} />
           <span className="text-xl font-bold tracking-widest">VSTORE CATALYST DIAL-UP</span>
         </div>
         <div ref={containerRef} className="h-48 overflow-y-auto text-[11px] space-y-1.5 text-green-400">
           {log.map((line, i) => <div key={i}>{'>'} {line}</div>)}
           <div className="animate-pulse">{'>'} _</div>
         </div>
      </div>
    </div>
  );
};

export const VStore: React.FC<VStoreProps> = ({ onInstallApp, installedApps, onLaunchBrowser }) => {
  const [account, setAccount] = useState<VStoreAccount | null>(null);
  const [showAuth, setShowAuth] = useState(true);
  const [showEula, setShowEula] = useState(false);
  const [eulaAgreedSession, setEulaAgreedSession] = useState(false);
  const [pendingDownloadApp, setPendingDownloadApp] = useState<VStoreApp | null>(null);
  
  const [showSettings, setShowSettings] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<VStoreCategory | 'All Software' | 'My Downloads'>('Featured Apps');
  const [selectedApp, setSelectedApp] = useState<VStoreApp | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fakeErrorApp, setFakeErrorApp] = useState<string | null>(null);
  const [downloadingApp, setDownloadingApp] = useState<VStoreApp | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isBooting, setIsBooting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [systemLaunchDialog, setSystemLaunchDialog] = useState(false);
  const [systemWarningDialog, setSystemWarningDialog] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  // Parse session on mount
  useEffect(() => {
    if (!fakeErrorApp) return;
    playHarshErrorSound();
  }, [fakeErrorApp]);

  useEffect(() => {
    const s = getSession();
    if (s) {
      const accs = getAccounts();
      const existing = accs.find(a => a.username === s);
      if (existing) {
        setAccount(existing);
        setShowAuth(false);
        playModemDialingSound();
        playVStoreLoadingSound();
        setIsBooting(true);
        setShowWelcome(true);
      }
    }
  }, []);

  const handleLogin = (acc: VStoreAccount, isNewRegistration?: boolean) => {
    playModemDialingSound();
    playVStoreLoadingSound();
    setAccount(acc);
    setShowAuth(false);
    setIsBooting(true);
    setShowWelcome(true);
    if (isNewRegistration) {
      setJustRegistered(true);
    }
  };

  // Fake download progression
  useEffect(() => {
    if (downloadingApp) {
      setDownloadProgress(0);
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          const next = prev + Math.random() * 15;
          if (next >= 100) {
            clearInterval(interval);
            // Finished!
            setTimeout(() => {
              if (downloadingApp.functional) {
                onInstallApp(downloadingApp.id);
              } else {
                setFakeErrorApp(downloadingApp.name);
              }
              
              // Add points and history for registered users
              if (account && !account.isGuest) {
                const updatedAccount = { ...account };
                if (!updatedAccount.downloadHistory.includes(downloadingApp.id)) {
                  updatedAccount.downloadHistory = [...updatedAccount.downloadHistory, downloadingApp.id];
                }
                updatedAccount.totalDownloads += 1;
                updatedAccount.vstorePoints += 100;
                
                if (updatedAccount.totalDownloads >= 20) updatedAccount.tier = 'Platinum';
                else if (updatedAccount.totalDownloads >= 10) updatedAccount.tier = 'Gold';
                else if (updatedAccount.totalDownloads >= 5) updatedAccount.tier = 'Silver';
                
                saveAccount(updatedAccount);
                setAccount(updatedAccount);
              }
              
              setDownloadingApp(null);
            }, 300);
            return 100;
          }
          return next;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [downloadingApp, onInstallApp]);

  const handleInstallClick = (app: VStoreApp) => {
    setPurchaseError(null);

    if (app.ageRestricted && account?.isGuest) {
      playAlertSound();
      alert("Notice: Age-restricted software requires a registered Member Account to download.");
      return;
    }

    if (app.systemDownload) {
      // Show "Launching Vespera Navigator" dialog
      setSystemLaunchDialog(true);
      setTimeout(() => {
        setSystemLaunchDialog(false);
        if (onLaunchBrowser) onLaunchBrowser();
        setTimeout(() => setSystemWarningDialog(true), 2200);
      }, 1800);
      return;
    }

    // Purchase Lock
    if (app.price && !installedApps.includes(app.id) && (!account?.purchasedApps || !account.purchasedApps.includes(app.id))) {
      if (!account || account.isGuest) {
        playAlertSound();
        setPurchaseError("Restricted: Commercial downloads demand a verified Member Account.");
        return;
      }
      if ((account.balance || 0) < app.price) {
        playAlertSound();
        setPurchaseError(`Insufficient Digital Wallet Balance. Please add $${(app.price - (account.balance || 0)).toFixed(2)} in Account Settings.`);
        return;
      }
      
      // Attempt Purchase
      const updatedAccount = { ...account };
      updatedAccount.balance = (updatedAccount.balance || 0) - app.price;
      updatedAccount.purchasedApps = [...(updatedAccount.purchasedApps || []), app.id];
      saveAccount(updatedAccount);
      setAccount(updatedAccount);
    }

    if (!eulaAgreedSession) {
      setPendingDownloadApp(app);
      setShowEula(true);
      return;
    }

    setDownloadingApp(app);
  };

  const handleEulaAgree = () => {
    setEulaAgreedSession(true);
    setShowEula(false);
    if (pendingDownloadApp) {
      setDownloadingApp(pendingDownloadApp);
      setPendingDownloadApp(null);
    }
  };

  // Filter apps
  const filteredApps = VSTORE_APPS.filter(app => {
    if (searchQuery) {
      return app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             app.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeCategory === 'All Software') return true;
    if (activeCategory === 'My Downloads') {
      return account && !account.isGuest && account.downloadHistory.includes(app.id);
    }
    return app.category.includes(activeCategory);
  });

  return (
    <div className="flex flex-col h-full bg-[#004c66] font-sans text-white relative select-none">
      {showAuth && (
        <VStoreAuth 
          onLogin={handleLogin} 
          onCancel={() => {
            handleLogin({
              username: 'guest',
              displayName: 'Guest User',
              memberId: 'GUEST-00000',
              memberSince: new Date().toISOString(),
              vstorePoints: 0,
              downloadHistory: [],
              totalDownloads: 0,
              tier: 'Bronze',
              isGuest: true,
              balance: 0,
              purchasedApps: [],
              membershipLevel: 'Standard'
            });
          }} 
        />
      )}
      
      {isBooting && <VStoreBootSequence onComplete={() => {
        setIsBooting(false);
        if (justRegistered) {
          if (onLaunchBrowser) {
            onLaunchBrowser('vespera:welcome');
          }
          setJustRegistered(false);
        }
      }} account={account} />}
      
      {showWelcome && !isBooting && !showAuth && !showSettings && (
        <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#c0c0c0] w-[450px] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide">
              VStore Catalyst - Message of the Day
            </div>
            <div className="p-5 flex flex-col gap-4">
              <h2 className="text-xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Welcome to the Global Exchange</h2>
              <p className="text-[13px] leading-relaxed text-black">
                You are currently dialed into the <strong>Vespera OS Private Software Network</strong>. Here you will find the highest quality curated software, shareware, and system utilities available on the World Wide Web.
              </p>
              <div className="bg-white p-3 border border-black shadow-inner text-xs font-mono text-gray-700 space-y-1">
                <div>Last Server Sync: {new Date().toLocaleDateString()}</div>
                <div>Current Version: 4.02.1</div>
                <div>Network Traffic: High (<span className="text-green-600 font-bold">2,042 Users Online</span>)</div>
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  onClick={() => {
                    playInfoSound();
                    setShowWelcome(false);
                  }}
                  className="px-6 py-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold shadow-sm"
                >
                  Acknowledge & Enter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#002d3d] text-white p-3 border-b-4 border-[#006b8f] flex items-center justify-between shadow-xl z-20">
        <div className="flex items-center gap-3">
          <Store size={36} className="text-[#a8e6a8]" />
          <div>
            <h1 className="text-xl font-bold tracking-wider text-[#e0f2fe] drop-shadow-md">VSTORE CATALYST</h1>
            <p className="text-[10px] text-[#00a3cc] uppercase tracking-[0.2em] font-bold">Secure Global Software Repository</p>
          </div>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#001a22] border-2 border-t-[#001116] border-l-[#001116] border-b-[#006b8f] border-r-[#006b8f] px-2 py-1 w-64 shadow-inner">
          <Search size={14} className="text-[#0088aa]" />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedApp(null);
            }}
            className="bg-transparent border-none outline-none text-sm text-[#e0f2fe] w-full placeholder:text-[#005a7a] font-mono"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* Sidebar */}
        <div className="w-[200px] shrink-0 bg-[#003344] border-2 border-t-[#001a22] border-l-[#001a22] border-b-[#005a7a] border-r-[#005a7a] p-2 flex flex-col gap-2 relative">
          {/* Subtle horizontal scanline overlay via pure css */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
          
          <div className="bg-[#001a22] text-[#00a3cc] font-bold text-[10px] tracking-wider uppercase text-center py-1 mb-2 border border-[#002d3d] shadow-sm relative z-10">
            Directory Index
          </div>
          <ul className="text-sm space-y-1 relative z-10">
            <li 
              className={`cursor-pointer px-2 py-1.5 flex items-center gap-2 border ${activeCategory === 'All Software' && !searchQuery ? 'bg-[#006b8f] text-white font-bold border-[#00a3cc]' : 'hover:bg-[#002d3d] text-[#e0f2fe] border-transparent'}`}
              onClick={() => { setActiveCategory('All Software'); setSelectedApp(null); setSearchQuery(''); }}
            >
              <Terminal size={14} /> All Titles
            </li>
            <div className="h-[1px] bg-[#002d3d] my-1 mx-2" />
            {CATEGORIES.map(cat => (
              <li 
                key={cat}
                className={`cursor-pointer px-2 py-1.5 flex items-center gap-2 border ${activeCategory === cat && !searchQuery ? 'bg-[#006b8f] text-white font-bold border-[#00a3cc]' : 'hover:bg-[#002d3d] text-[#e0f2fe] border-transparent'}`}
                onClick={() => { setActiveCategory(cat); setSelectedApp(null); setSearchQuery(''); }}
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeCategory === cat && !searchQuery ? 'bg-[#fff]' : 'bg-[#a8e6a8]'}`} /> {cat}
              </li>
            ))}
            
            {account && !account.isGuest && (
              <>
                <div className="h-[1px] bg-[#002d3d] my-1 mx-2" />
                <li 
                  className={`cursor-pointer px-2 py-1.5 flex items-center gap-2 border ${activeCategory === 'My Downloads' && !searchQuery ? 'bg-[#006b8f] text-white font-bold border-[#00a3cc]' : 'hover:bg-[#002d3d] text-[#e0f2fe] border-transparent'}`}
                  onClick={() => { setActiveCategory('My Downloads'); setSelectedApp(null); setSearchQuery(''); }}
                >
                  <HardDrive size={14} /> My Downloads
                </li>
              </>
            )}
          </ul>

          {/* User Profile Panel */}
          <div className="mt-auto relative z-10 pt-2 border-t border-[#002d3d]">
            <div className="bg-[#001a22] border border-[#002d3d] p-2 flex flex-col gap-1.5 text-xs shadow-inner">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-[#003344] border border-[#005a7a] flex items-center justify-center shrink-0">
                  <User size={18} className={account?.isGuest ? 'text-gray-400' : 'text-[#a8e6a8]'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#e0f2fe] truncate">{account?.displayName || 'Guest'}</p>
                  <p className="text-[9px] text-[#00a3cc] font-mono truncate">{account?.memberId || 'GUEST-00000'}</p>
                </div>
              </div>
              <div className="bg-black text-[#a8e6a8] font-mono p-1 border border-[#002d3d] text-[10px] flex justify-between items-center">
                <span>TIER:</span>
                <span className="font-bold uppercase flex items-center gap-1">
                  {!account?.isGuest && <Award size={10} className={
                    account?.tier === 'Platinum' ? 'text-[#e5e4e2]' :
                    account?.tier === 'Gold' ? 'text-[#ffd700]' :
                    account?.tier === 'Silver' ? 'text-[#c0c0c0]' : 'text-[#cd7f32]'
                  } />}
                  {account?.tier || 'BRONZE'}
                </span>
              </div>
              {!account?.isGuest && (
                <div className="bg-black text-yellow-500 font-mono p-1 border border-[#002d3d] text-[10px] flex justify-between items-center mb-1">
                  <span>PTS:</span>
                  <span className="font-bold">{account?.vstorePoints || 0}</span>
                </div>
              )}
              <div className="flex gap-1 mt-auto">
                <button 
                  onClick={() => setShowSettings(true)}
                  className="flex-1 bg-[#c0c0c0] text-[#000080] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[10px] font-bold py-0.5"
                >
                  Acct Setup
                </button>
                <button 
                  onClick={() => {
                    setSession(null);
                    setAccount(null);
                    setShowAuth(true);
                    setIsBooting(false);
                    setShowSettings(false);
                  }}
                  className="flex-1 bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[10px] font-bold py-0.5"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {showSettings && account ? (
          <VStoreAccountSettings 
            account={account} 
            onUpdateAccount={setAccount} 
            onClose={() => setShowSettings(false)} 
          />
        ) : (
          <div className="flex-1 bg-[#ececec] text-black border-2 border-t-[#a0a0a0] border-l-[#a0a0a0] border-b-white border-r-white p-3 overflow-y-auto flex flex-col relative z-0">
            
            {selectedApp ? (
            // App Details View
            <div className="flex flex-col gap-4 h-full relative z-10">
              <div className="flex items-center gap-3 border-b-2 border-gray-400 pb-3">
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="flex items-center gap-1 bg-[#c0c0c0] px-3 py-1.5 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold text-xs hover:bg-[#d0d0d0]"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <h2 className="font-bold text-xl text-[#000080] truncate flex-1">{selectedApp.name}</h2>
                <div className={`px-2 py-1 text-[10px] font-bold border-2 ${selectedApp.functional ? 'bg-blue-600 text-white border-blue-300' : 'bg-gray-400 text-gray-800 border-gray-300'} shadow-sm`}>
                  {selectedApp.functional ? 'SYNAP-C COMPATIBLE' : 'LEGACY ARCHIVE'}
                </div>
              </div>

              <div className="flex gap-5 h-full overflow-hidden">
                {/* Left col: Image */}
                <div className="w-[45%] flex flex-col gap-3">
                  <div className="bg-black border-[5px] border-t-gray-800 border-l-gray-800 border-b-gray-400 border-r-gray-400 shadow-inner h-56 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img src={selectedApp.screenshotUrl} alt={selectedApp.name} className="object-cover w-full h-full opacity-90 hover:opacity-100 transition-opacity" draggable={false} onDragStart={(e) => e.preventDefault()} />
                  </div>
                  <div className="bg-[#ffffcc] border-2 border-yellow-600 p-3 text-xs shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                    <p className="font-bold text-yellow-900 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Terminal size={12} /> System Requirements
                    </p>
                    <p className="text-black font-mono leading-relaxed mt-2">{selectedApp.requirements}</p>
                  </div>
                </div>
                
                {/* Right col: Details */}
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                  <div className="flex items-start gap-4 p-3 bg-white border border-gray-300 shadow-sm">
                    <div className="w-16 h-16 bg-[#ececec] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex items-center justify-center shrink-0">
                      <selectedApp.icon size={36} className={selectedApp.color} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-xl leading-none mb-1 text-[#000080]">{selectedApp.name}</p>
                      <p className="text-xs font-bold text-gray-700 bg-gray-200 inline-block px-1 mb-1">Publisher: {selectedApp.developer}</p>
                      <p className="text-[11px] text-gray-500 font-mono">Version: {selectedApp.version} &nbsp;|&nbsp; Asset Size: {selectedApp.size}</p>
                      
                      <div className="flex items-center gap-1 mt-1">
                        {selectedApp.rating ? (
                          <>
                            <div className="flex text-yellow-500">
                              {[...Array(Math.floor(selectedApp.rating))].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                              {selectedApp.rating % 1 > 0 && <StarHalf size={12} fill="currentColor" />}
                            </div>
                            <span className="text-[10px] text-gray-600 font-mono ml-1">
                              ({selectedApp.downloadCount?.toLocaleString() || 0} downloads)
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1 border border-gray-300">Unrated New Release</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
                    <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-4 text-sm leading-relaxed font-serif shadow-inner shrink-0">
                      {selectedApp.description}
                    </div>
                    
                    {selectedApp.reviews && selectedApp.reviews.length > 0 && (
                      <div className="bg-[#ececec] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 shrink-0">
                        <h4 className="font-bold text-xs text-[#000080] border-b border-gray-400 pb-1 mb-2">Member Reviews</h4>
                        <div className="flex flex-col gap-2">
                          {selectedApp.reviews.map((rev, i) => (
                            <div key={i} className="bg-white border border-gray-300 p-2 shadow-sm text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-[#000080] truncate">{rev.user}</span>
                                <div className="flex text-yellow-500 border-l border-gray-200 pl-2 shrink-0">
                                  {[...Array(rev.rating)].map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                                </div>
                              </div>
                              <p className="text-gray-700 font-serif leading-snug">"{rev.comment}"</p>
                              <p className="text-[9px] text-gray-400 font-mono text-right mt-1">{rev.date}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {purchaseError && (
                    <div className="bg-red-100 border-2 border-red-600 text-red-800 p-2 mt-auto text-xs font-bold font-mono shadow-sm flex items-center gap-2 mb-2 shrink-0">
                       <AlertTriangle size={14} className="shrink-0" /> {purchaseError}
                    </div>
                  )}

                  <div className={`pt-3 border-t-2 border-gray-300 flex justify-end shrink-0 ${!purchaseError ? 'mt-auto' : ''}`}>
                    <button 
                      onClick={() => !installedApps.includes(selectedApp.id) && handleInstallClick(selectedApp)}
                      disabled={installedApps.includes(selectedApp.id)}
                      className={`flex items-center gap-2 px-8 py-3 font-bold text-sm border-[3px] shadow-[2px_2px_0_rgba(0,0,0,0.3)] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all ${
                        installedApps.includes(selectedApp.id) 
                          ? 'bg-[#008000] text-white border-t-gray-800 border-l-gray-800 border-b-white border-r-white cursor-default opacity-80 shadow-none translate-y-[2px] translate-x-[2px]'
                          : 'bg-[#000080] text-white border-t-blue-400 border-l-blue-400 border-b-[#000040] border-r-[#000040] hover:bg-blue-800'
                      }`}
                    >
                      {installedApps.includes(selectedApp.id) ? <CheckCircle2 size={20} /> : <Download size={20} />}
                      {installedApps.includes(selectedApp.id) ? 'ALREADY INSTALLED' : 
                        (selectedApp.price && !account?.purchasedApps?.includes(selectedApp.id)) 
                          ? `AUTHORIZE PURCHASE ($${selectedApp.price.toFixed(2)})` 
                          : 'INITIATE DOWNLOAD'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // App List View
            <>
              <div className="flex items-center justify-between mb-3 border-b-2 border-gray-400 pb-2">
                <h2 className="font-bold text-xl text-[#000080] tracking-wide relative z-10">
                  {searchQuery ? `Search Results: "${searchQuery}"` : activeCategory}
                </h2>
                <div className="text-xs font-bold text-gray-500 bg-white border border-gray-300 px-2 py-0.5 rounded cursor-default shadow-sm relative z-10">
                  {filteredApps.length} Titles Found
                </div>
              </div>

              {filteredApps.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3">
                  <Search size={48} className="text-gray-400 opacity-50" />
                  <span className="italic">No software packages found spanning current query vectors.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10 overflow-x-hidden p-1">
                  
                  {/* Deal of the Day */}
                  {activeCategory === 'Featured Apps' && !searchQuery && (() => {
                    const dealApp = VSTORE_APPS.find(a => a.id === 'paint_shop_pro') || VSTORE_APPS[0];
                    return (
                      <div 
                        className="col-span-1 md:col-span-2 border-2 border-[#b8860b] bg-[#fff8dc] p-3 shadow-md flex gap-4 cursor-pointer hover:bg-[#ffebcd] transition-colors group relative"
                        onClick={() => setSelectedApp(dealApp)}
                      >
                         <div className="absolute top-0 right-0 bg-red-600 text-white font-bold text-[9px] px-2 py-0.5 animate-pulse uppercase border-b-2 border-l-2 border-red-800">Deal of the Day - 60% Off!</div>
                         <div className="w-16 h-16 bg-white border-2 border-gray-400 flex items-center justify-center shrink-0">
                           <dealApp.icon size={36} className={dealApp.color} />
                         </div>
                         <div className="flex flex-col justify-center">
                           <h3 className="font-bold text-[#b8860b] group-hover:underline text-lg">{dealApp.name}</h3>
                           <p className="text-xs text-gray-700 truncate">{dealApp.description}</p>
                           <p className="text-[10px] font-bold mt-1 text-green-700">MSRP: <span className="line-through text-gray-500">$69.00</span> $27.60</p>
                         </div>
                      </div>
                    );
                  })()}

                  {filteredApps.map(app => (
                    <div 
                      key={app.id} 
                      className="group border border-gray-400 bg-white p-3 flex gap-4 hover:bg-[#e6e6fa] hover:border-[#000080] cursor-pointer shadow-sm hover:shadow-md transition-all active:translate-y-px"
                      onClick={() => setSelectedApp(app)}
                    >
                      <div className="w-14 h-14 bg-[#ececec] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex items-center justify-center shrink-0 shadow-inner group-hover:bg-white transition-colors relative">
                        {app.ageRestricted && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm">18+</div>}
                        <app.icon size={28} className={app.color} />
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h3 className="font-bold text-[13px] text-[#000080] truncate leading-tight group-hover:underline">{app.name}</h3>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-0.5 font-mono truncate">{app.developer}</p>
                        
                        <div className="flex items-center gap-1 mb-1.5 h-3">
                          {app.rating ? (
                            <div className="flex text-yellow-500">
                              {[...Array(Math.floor(app.rating))].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                              {app.rating % 1 > 0 && <StarHalf size={10} fill="currentColor" className="text-yellow-500" />}
                              <span className="text-[9px] text-gray-500 ml-1 mt-[1px] font-mono">({app.downloadCount?.toLocaleString() || 0})</span>
                            </div>
                          ) : (
                            <span className="text-[9px] text-gray-400 font-mono text-xs">New Release</span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-auto">
                           {installedApps.includes(app.id) ? (
                            <span className="text-[9px] bg-[#008000] text-white px-1.5 py-0.5 font-bold tracking-wider inline-flex items-center gap-1">
                               <CheckCircle2 size={10} /> INSTALLED
                            </span>
                          ) : app.functional ? (
                            <span className="text-[9px] bg-blue-600 text-white border border-blue-400 px-1.5 py-0.5 font-bold tracking-wider shadow-sm animate-pulse">
                              [INSTALLABLE]
                            </span>
                          ) : (
                            <span className="text-[9px] bg-gray-500 text-gray-100 border border-gray-400 px-1.5 py-0.5 font-bold tracking-wider opacity-60">
                              [ARCHIVE]
                            </span>
                          )}
                          <span className="text-[9px] text-gray-500 font-mono">
                            {app.price ? (
                              <span className="text-green-700 font-bold">${app.price.toFixed(2)}</span>
                            ) : (
                              app.size
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>

      {/* Dial-Up Downloading Modal */}
      {downloadingApp && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-[380px] flex flex-col shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide">
              VStore Secure File Transfer
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-gray-400 pb-3">
                <div className="w-10 h-10 border border-gray-500 bg-white shadow-inner flex items-center justify-center">
                   <Globe size={24} className="text-blue-800 animate-pulse" />
                </div>
                <div>
                  <p className="text-[13px] font-bold">Transferring Package Data...</p>
                  <p className="text-[11px] text-gray-700 font-mono mt-0.5 max-w-[250px] truncate">FROM: node_72.vstore.sys<br/>TO: LOCAL_HOST</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                 <p className="text-[11px] font-bold text-[#000080] truncate">Receiving: {downloadingApp.name}</p>
                 <div className="h-5 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white w-full overflow-hidden relative">
                   <div 
                     className="h-full bg-[#000080] transition-all duration-300 ease-out"
                     style={{ width: `${downloadProgress}%` }}
                   />
                   <div className="absolute inset-0 flex flex-col justify-evenly pointer-events-none opacity-20">
                      {[...Array(20)].map((_, i) => <div key={i} className="w-full h-px bg-white" />)}
                   </div>
                 </div>
              </div>
              
              <div className="flex justify-between text-[11px] font-mono bg-gray-200 p-1 border border-gray-400">
                <span>Size: {downloadingApp.size}</span>
                <span className="text-[#000080] font-bold text-right w-16">{Math.floor(downloadProgress)}%</span>
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  onClick={() => setDownloadingApp(null)}
                  className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
                >Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fake Download Error Dialog */}
      {fakeErrorApp && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/40">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] w-96 flex flex-col">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm flex justify-between items-center tracking-wide">
              <span>Network Exception</span>
              <button 
                onClick={() => setFakeErrorApp(null)}
                className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-5 h-5 flex items-center justify-center text-black font-bold text-xs active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
              >X</button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex gap-4 mb-2">
                <AlertTriangle size={36} className="text-yellow-600 shrink-0 mt-1" />
                <div className="text-[13px] leading-relaxed text-black flex flex-col gap-2">
                  <p className="font-bold underline text-red-800">Error 0x800C0005: Handshake Failed</p>
                  <p>The connection to the VStore archive server was unexpectedly terminated by the remote host.</p>
                  <p className="text-[11px] text-gray-700 bg-white p-2 border border-black font-mono">
                     Target Package: {fakeErrorApp}<br/>
                     Status: Remote server offline or routing failure.<br/>
                     Action: Update your Winsock TCP/IP stack.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => setFakeErrorApp(null)}
                  className="px-8 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold focus:outline-dotted focus:outline-1 focus:outline-offset-[-4px]"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Download: "Launching Vespera Navigator" Dialog */}
      {systemLaunchDialog && (
        <div className="absolute inset-0 z-[75] flex items-center justify-center bg-black/50">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] w-[380px] flex flex-col">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide">
              VStore Catalyst
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white flex items-center justify-center shadow-inner">
                  <Globe size={28} className="text-blue-800 animate-pulse" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-black">Launching Vespera Navigator...</p>
                  <p className="text-[11px] text-gray-600 font-mono mt-1">Redirecting to official download channel</p>
                </div>
              </div>
              <div className="h-4 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-hidden">
                <div className="h-full bg-[#000080] animate-pulse" style={{ width: '100%', animation: 'pulse 1s ease-in-out infinite, growBar 1.8s ease-out forwards' }} />
              </div>
              <p className="text-[10px] text-gray-500 font-mono text-center">NAVIGATOR.EXE /URL=www.vesperasystems.com/Downloads.html</p>
            </div>
          </div>
        </div>
      )}

      {/* System Download: Kernel Update Warning Dialog */}
      {systemWarningDialog && (
        <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/40">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] w-[420px] flex flex-col">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm flex justify-between items-center tracking-wide">
              <span>Vespera Systems — Notice</span>
              <button 
                onClick={() => setSystemWarningDialog(false)}
                className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-5 h-5 flex items-center justify-center text-black font-bold text-xs active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
              >X</button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <Monitor size={36} className="text-blue-800" />
                </div>
                <div className="text-[13px] leading-relaxed text-black flex flex-col gap-2">
                  <p className="font-bold text-[#000080]">Official Download Channel</p>
                  <p>Kernel Updates and Other software like this must be downloaded via official channels.</p>
                  <p className="text-[11px] text-gray-600 bg-white border border-gray-400 p-2 font-mono shadow-inner">
                    You have been redirected to:<br/>
                    <span className="text-blue-700 font-bold">http://www.vesperasystems.com/Downloads.html</span><br/><br/>
                    Please use the Vespera Navigator browser to download and install system software directly.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => setSystemWarningDialog(false)}
                  className="px-8 py-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold focus:outline-dotted focus:outline-1 focus:outline-offset-[-4px]"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EULA Modal */}
      {showEula && (
        <div className="absolute inset-0 z-[85] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#c0c0c0] w-[500px] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col text-black">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide flex justify-between">
              <span>End User License Agreement</span>
              <button 
                onClick={() => setShowEula(false)}
                className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-4 h-4 flex items-center justify-center text-black font-bold text-xs"
              >X</button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex gap-4 border-b border-gray-400 pb-2">
                <FileSignature size={32} className="text-blue-800 shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-lg text-[#000080] leading-tight">Software Licensing Agreement</h2>
                  <p className="text-[11px] text-gray-700">Please read the following terms carefully before downloading.</p>
                </div>
              </div>
              <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white h-40 overflow-y-scroll p-3 text-[11px] font-mono leading-relaxed shadow-inner">
                <p className="font-bold text-center mb-2">VESPERA SYSTEMS SHAREWARE AGREEMENT</p>
                <p>1. <strong>GRANT OF LICENSE.</strong> This End-User License Agreement ("EULA") is a legal agreement between you and the software author. By downloading this software from the VSTORE CATALYST network, you agree to be bound by its terms.</p>
                <p className="mt-2">2. <strong>EVALUATION PERIOD.</strong> Shareware distribution gives users a chance to try software before buying it. If you try a Shareware program and continue using it, you are expected to register the program with its author.</p>
                <p className="mt-2">3. <strong>DISTRIBUTION.</strong> You may distribute the UNREGISTERED shareware version of this software via BBS, diskette, CD-ROM, or Internet file transfer, provided NO FEE is charged for the software itself.</p>
                <p className="mt-2">4. <strong>DISCLAIMER OF WARRANTY.</strong> THIS SOFTWARE AND THE ACCOMPANYING FILES ARE SOLD "AS IS" AND WITHOUT WARRANTIES AS TO PERFORMANCE OR MERCHANTABILITY. THE AUTHOR IS NOT LIABLE FOR DATA LOSS, SYSTEM CORRUPTION, OR LOSS OF REVENUE.</p>
                <p className="mt-2">5. <strong>AGE RESTRICTIONS.</strong> Some software titles may contain animated blood, violence, or strong language. By accepting this EULA, you testify that you meet the age requirements for restricted software distributed under this gateway.</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setShowEula(false)}
                  className="px-5 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
                >I Disagree</button>
                <button 
                  onClick={handleEulaAgree}
                  className="px-5 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold text-[#000080]"
                >I Agree</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom Status Bar */}
      <div className="bg-[#c0c0c0] text-black h-6 border-t border-white px-2 flex items-center text-[10px] shrink-0 font-sans shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_-1px_0_rgba(0,0,0,0.4)] z-50">
        <div className="flex-1 flex items-center gap-1 border border-t-gray-500 border-l-gray-500 border-b-white border-r-white px-2 h-4/5 leading-none">
           Logged in as: <strong>{account?.displayName || 'Guest User'}</strong> | ID: <strong>{account?.memberId || 'GUEST-00'}</strong>
        </div>
        <div className="w-px h-4/5 bg-gray-500 mx-1 border-r border-white"></div>
        <div className="w-48 flex items-center gap-1 border border-t-gray-500 border-l-gray-500 border-b-white border-r-white px-2 h-4/5 leading-none text-[#000080]">
           Catalog Version: 1996.12.24
        </div>
        <div className="w-px h-4/5 bg-gray-500 mx-1 border-r border-white"></div>
        <div className="w-32 flex items-center gap-1 border border-t-gray-500 border-l-gray-500 border-b-white border-r-white px-2 h-4/5 leading-none">
           <Globe size={10} className="text-gray-500" /> 
           Pkts: 42,912
        </div>
        <div className="w-px h-4/5 bg-gray-500 mx-1 border-r border-white"></div>
        <div className="w-24 flex items-center justify-end gap-1.5 border border-t-gray-500 border-l-gray-500 border-b-white border-r-white px-2 h-4/5 leading-none bg-[#ececec]">
           <div className="flex flex-col gap-px items-center">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse blur-[1px]"></div>
           </div>
           28.8 Kbps
        </div>
      </div>
    </div>
  );
};
