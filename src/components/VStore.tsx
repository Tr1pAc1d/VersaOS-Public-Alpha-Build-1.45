import React, { useState, useEffect, useRef } from 'react';
import { Store, Download, CheckCircle2, ArrowLeft, Search, Terminal, AlertTriangle, Globe, Monitor, User, Star, StarHalf, FileSignature, Award, HardDrive, Code2, Package } from 'lucide-react';
import { VSTORE_APPS, VStoreApp, VStoreCategory } from '../data/vstoreApps';
import { VStoreAuth, VStoreAccount, getAccounts, getSession, saveAccount, setSession } from './VStoreAuth';
import { VStoreAccountSettings } from './VStoreAccountSettings';
import { System, validateManifest } from '../utils/systemRegistry';
import type { AppManifest } from '../types/pluginTypes';
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
  vfs?: any;
  onOpenSetupWizard?: (manifest: AppManifest) => void;
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

export const VStore: React.FC<VStoreProps> = ({ onInstallApp, installedApps, onLaunchBrowser, vfs, onOpenSetupWizard }) => {
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

  // ── Developer Portal state ─────────────────────────────────────────────
  const [showDevPortal, setShowDevPortal] = useState(false);
  const [devPortalStep, setDevPortalStep] = useState(0);
  // Step 0 — App Details
  const [devAppName, setDevAppName] = useState('');
  const [devAppVersion, setDevAppVersion] = useState('1.0.0');
  const [devAppAuthor, setDevAppAuthor] = useState('');
  const [devAppCategory, setDevAppCategory] = useState<VStoreCategory>('Featured Apps');
  const [devAppDescription, setDevAppDescription] = useState('');
  const [devAppRequirements, setDevAppRequirements] = useState('');
  const [devAppSize, setDevAppSize] = useState('');
  const [devAppPrice, setDevAppPrice] = useState('');
  // Step 1 — Media & Code
  const [devIconDataUrl, setDevIconDataUrl] = useState<string>('');
  const [devIconFileName, setDevIconFileName] = useState('');
  const [devScreenshotUrl, setDevScreenshotUrl] = useState('');
  const [devEntryCode, setDevEntryCode] = useState('');
  // Step 2 — Preview is computed from above
  // Step 3 — Submission
  const [devSubmitting, setDevSubmitting] = useState(false);
  const [devSubmitProgress, setDevSubmitProgress] = useState(0);
  const [devSubmitLog, setDevSubmitLog] = useState<string[]>([]);
  const [devSubmitDone, setDevSubmitDone] = useState(false);
  const [devPortalError, setDevPortalError] = useState<string | null>(null);
  // Community apps added this session
  const [communityApps, setCommunityApps] = useState<VStoreApp[]>(() => {
    try {
      const raw = localStorage.getItem('vstore_community_apps');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

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

  // Merge built-in and community-published apps into one catalog
  const allApps = [...VSTORE_APPS, ...communityApps];

  // Filter apps
  const filteredApps = allApps.filter(app => {
    if (searchQuery) {
      return app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             app.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeCategory === 'All Software') return true;
    if (activeCategory === 'My Downloads') {
      return account && !account.isGuest && account.downloadHistory.includes(app.id);
    }
    const cats = Array.isArray(app.category) ? app.category : [app.category];
    return cats.includes(activeCategory as VStoreCategory);
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
                  onClick={() => { setActiveCategory('My Downloads'); setSelectedApp(null); setSearchQuery(''); setShowDevPortal(false); }}
                >
                  <HardDrive size={14} /> My Downloads
                </li>
              </>
            )}

            {/* Developer Portal — requires registered account */}
            <div className="h-[1px] bg-[#002d3d] my-1 mx-2" />
            <li
              className={`cursor-pointer px-2 py-1.5 flex items-center gap-2 border ${
                showDevPortal
                  ? 'bg-[#006b8f] text-white font-bold border-[#00a3cc]'
                  : 'hover:bg-[#002d3d] text-[#e0f2fe] border-transparent'
              }`}
              onClick={() => {
                setShowDevPortal(true);
                setSelectedApp(null);
                setSearchQuery('');
                setDevPortalStep(0);
                setDevPortalError(null);
                setDevSubmitDone(false);
              }}
            >
              <Code2 size={14} /> Developer Portal
            </li>
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
        ) : showDevPortal ? (
          // ── Developer Portal ──────────────────────────────────────
          (() => {
            // Account gate
            if (!account || account.isGuest) {
              return (
                <div className="flex-1 bg-[#ececec] border-2 border-t-[#a0a0a0] border-l-[#a0a0a0] border-b-white border-r-white flex flex-col items-center justify-center gap-4 p-8">
                  <Code2 size={40} className="text-gray-400" />
                  <p className="text-[#000080] font-bold text-lg">VesperaNET Account Required</p>
                  <p className="text-xs text-gray-600 text-center max-w-xs">
                    Publishing software to VStore Catalyst requires a registered VesperaNET member account.
                    Guest access does not include Developer Portal privileges.
                  </p>
                  <button
                    onClick={() => { setShowAuth(true); }}
                    className="px-8 py-2 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black text-sm font-bold"
                  >
                    Sign In / Register
                  </button>
                </div>
              );
            }

            const STEPS = ['App Details', 'Media & Code', 'Preview Listing', 'Submit'];
            const devAppId = devAppName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 48) || 'my_app';
            const previewApp: VStoreApp = {
              id: `community_${devAppId}`,
              name: devAppName || 'Untitled App',
              developer: devAppAuthor || account.displayName,
              version: devAppVersion || '1.0.0',
              size: devAppSize || '~1.0 MB',
              icon: Package,
              customIcon: devIconDataUrl || undefined,
              color: 'text-blue-500',
              category: devAppCategory,
              description: devAppDescription || 'No description provided.',
              requirements: devAppRequirements || 'Vespera OS',
              screenshotUrl: devScreenshotUrl || 'https://placehold.co/400x300/004c66/FFFFFF/png?text=No+Screenshot',
              functional: true,
              price: devAppPrice ? parseFloat(devAppPrice) || undefined : undefined,
              rating: 5,
              downloadCount: 0,
              reviews: [],
            };

            const canNext0 = devAppName.trim() && devAppDescription.trim() && devAppAuthor.trim();
            const canNext1 = devEntryCode.trim().length > 10;

            const handleSubmit = () => {
              setDevPortalError(null);
              if (!canNext0 || !canNext1) {
                setDevPortalError('Please complete all required fields before submitting.');
                return;
              }
              setDevSubmitting(true);
              setDevSubmitProgress(0);
              setDevSubmitLog([]);
              const logs = [
                `Validating manifest for "${devAppName}"...`,
                `Compressing application entry point...`,
                `Uploading to VStore Catalyst servers...`,
                `Verifying VesperaNET member credentials (${account.memberId})...`,
                `Creating application catalog entry...`,
                `Registering in VStore directory index...`,
                `Generating install manifest...`,
                `Publishing to distribution network...`,
                `Submission complete. Thank you, ${account.displayName}!`,
              ];
              let logIdx = 0;
              let prog = 0;
              const iv = setInterval(() => {
                prog += Math.random() * 14 + 6;
                if (prog >= 100) {
                  prog = 100;
                  setDevSubmitProgress(100);
                  if (logIdx < logs.length) setDevSubmitLog(prev => [...prev, logs[logIdx++]]);
                  clearInterval(iv);

                  // Build the full plugin manifest (with defaults for optional fields)
                  const fullManifest = {
                    id: devAppId,
                    name: devAppName,
                    version: devAppVersion || '1.0.0',
                    description: devAppDescription,
                    author: devAppAuthor,
                    iconUrl: devIconDataUrl || '/Icons/application_hourglass-0.png',
                    entryCode: devEntryCode,
                    size: devAppSize || '~1.0 MB',
                    category: devAppCategory,
                  };

                  // Register with system plugin registry
                  try {
                    System.registerApp(fullManifest);
                  } catch (e) { /* already registered or validation error */ }

                  // Save catalog entry with _manifest embedded for cross-session fallback
                  const newCommunityApps = [
                    ...communityApps.filter(a => a.id !== previewApp.id),
                    { ...previewApp, _manifest: fullManifest } as any,
                  ];
                  setCommunityApps(newCommunityApps);
                  localStorage.setItem('vstore_community_apps', JSON.stringify(newCommunityApps));

                  // Open setup wizard in GUIOS
                  if (onOpenSetupWizard) {
                    setTimeout(() => onOpenSetupWizard(fullManifest), 600);
                  }

                  setTimeout(() => { setDevSubmitting(false); setDevSubmitDone(true); }, 400);
                  return;
                }
                setDevSubmitProgress(prog);
                if (logIdx < logs.length) setDevSubmitLog(prev => [...prev, logs[logIdx++]]);
              }, 300);
            };

            return (
              <div className="flex-1 bg-[#ececec] text-black border-2 border-t-[#a0a0a0] border-l-[#a0a0a0] border-b-white border-r-white flex flex-col overflow-hidden">
                {/* Portal header */}
                <div className="flex items-center gap-3 px-4 py-2 bg-[#c0c0c0] border-b border-gray-400 shrink-0">
                  <Code2 size={18} className="text-[#000080]" />
                  <div className="flex-1">
                    <p className="font-bold text-[#000080] text-sm">VStore Developer Portal</p>
                    <p className="text-[9px] text-gray-500 font-mono">VSTORE CATALYST • SOFTWARE SUBMISSION • MEMBER: {account.memberId}</p>
                  </div>
                  {/* Step breadcrumb */}
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    {STEPS.map((s, i) => (
                      <React.Fragment key={s}>
                        <span className={`${
                          devPortalStep === i ? 'text-[#000080] font-bold underline' :
                          devPortalStep > i ? 'text-gray-400' : 'text-gray-500'
                        }`}>{s}</span>
                        {i < STEPS.length - 1 && <span className="text-gray-400 mx-0.5">›</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {devSubmitDone ? (
                  /* ── Success screen ── */
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                    <CheckCircle2 size={56} className="text-green-600" />
                    <p className="text-xl font-bold text-[#000080]">Application Published!</p>
                    <p className="text-sm text-gray-700 text-center">
                      <strong>{devAppName}</strong> has been submitted to VStore Catalyst and is now available in the catalog.
                      The setup wizard has been launched to install it on this machine.
                    </p>
                    <div className="bg-white border border-gray-400 p-3 text-[10px] font-mono text-gray-700 w-full max-w-sm">
                      <p className="font-bold mb-1">Submission Summary</p>
                      <p>App ID: community_{devAppId}</p>
                      <p>Version: {devAppVersion}</p>
                      <p>Category: {devAppCategory}</p>
                      <p>Developer: {devAppAuthor}</p>
                      <p>VStore Member: {account.memberId}</p>
                    </div>
                    <button
                      onClick={() => {
                        setDevSubmitDone(false);
                        setDevPortalStep(0);
                        setDevAppName(''); setDevAppVersion('1.0.0'); setDevAppAuthor('');
                        setDevAppDescription(''); setDevAppRequirements(''); setDevAppSize('');
                        setDevAppPrice(''); setDevIconDataUrl(''); setDevIconFileName('');
                        setDevScreenshotUrl(''); setDevEntryCode('');
                        setShowDevPortal(false);
                      }}
                      className="px-8 py-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-sm font-bold"
                    >
                      Back to Catalog
                    </button>
                  </div>
                ) : devSubmitting ? (
                  /* ─── Submitting screen ─── */
                  <div className="flex-1 flex flex-col p-6 gap-4 justify-center">
                    <p className="text-lg font-bold text-[#000080]">Submitting to VStore Catalyst...</p>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Uploading to distribution network • DO NOT CLOSE</p>
                    <div className="h-6 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-hidden p-[2px] flex gap-[2px]">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className={`h-full w-[4.5%] ${i < (devSubmitProgress / 5) ? 'bg-[#000080]' : 'bg-transparent'} transition-colors duration-200`} />
                      ))}
                    </div>
                    <p className="text-[10px] font-mono text-right text-gray-500">{Math.floor(devSubmitProgress)}%</p>
                    <div className="bg-black text-[#00ff41] font-mono text-[10px] p-3 flex-1 overflow-y-auto border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white">
                      {devSubmitLog.map((l, i) => <div key={i}>&gt; {l}</div>)}
                      {devSubmitProgress < 100 && <div className="animate-pulse">&gt; _</div>}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    {devPortalError && (
                      <div className="bg-red-100 border border-red-600 text-red-800 p-2 text-xs font-mono flex gap-2 items-start">
                        <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {devPortalError}
                      </div>
                    )}

                    {/* ── STEP 0: App Details ── */}
                    {devPortalStep === 0 && (
                      <>
                        <div className="bg-[#000080] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest">Step 1 of 4 — Application Information</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-[11px] font-bold text-gray-700">Application Name *</label>
                            <input value={devAppName} onChange={e => setDevAppName(e.target.value)}
                              className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-sm bg-white outline-none"
                              placeholder="e.g. My Retro Calculator"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-gray-700">Version *</label>
                            <input value={devAppVersion} onChange={e => setDevAppVersion(e.target.value)}
                              className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-xs bg-white outline-none"
                              placeholder="1.0.0"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-gray-700">Developer / Publisher *</label>
                            <input value={devAppAuthor} onChange={e => setDevAppAuthor(e.target.value)}
                              className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-xs bg-white outline-none"
                              placeholder="Your name or company"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-gray-700">Category</label>
                            <select value={devAppCategory} onChange={e => setDevAppCategory(e.target.value as VStoreCategory)}
                              className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1.5 text-xs bg-white outline-none"
                            >
                              {(['Featured Apps','Games & Entertainment','Productivity','System Utilities','Networking','System','Desktop Applets'] as VStoreCategory[]).map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-gray-700">Price (USD, leave blank for Free)</label>
                            <input value={devAppPrice} onChange={e => setDevAppPrice(e.target.value)}
                              className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-xs bg-white outline-none"
                              placeholder="e.g. 9.95"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-gray-700">File Size</label>
                            <input value={devAppSize} onChange={e => setDevAppSize(e.target.value)}
                              className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-xs bg-white outline-none"
                              placeholder="e.g. 1.2 MB"
                            />
                          </div>
                          <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-[11px] font-bold text-gray-700">Description * <span className="font-normal text-gray-500">(shown in VStore listing)</span></label>
                            <textarea value={devAppDescription} onChange={e => setDevAppDescription(e.target.value)}
                              rows={4}
                              className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 text-xs bg-white outline-none resize-none"
                              placeholder="Describe what your application does..."
                            />
                          </div>
                          <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-[11px] font-bold text-gray-700">System Requirements</label>
                            <input value={devAppRequirements} onChange={e => setDevAppRequirements(e.target.value)}
                              className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-xs bg-white outline-none"
                              placeholder="e.g. Vespera OS, 4MB RAM, Mouse"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-auto pt-3 border-t border-gray-300">
                          <button
                            onClick={() => {
                              if (!canNext0) { setDevPortalError('Application Name, Description, and Developer are required.'); return; }
                              setDevPortalError(null); setDevPortalStep(1);
                            }}
                            className="px-10 py-2 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black text-sm font-bold"
                          >
                            Next &gt;
                          </button>
                        </div>
                      </>
                    )}

                    {/* ── STEP 1: Media & Code ── */}
                    {devPortalStep === 1 && (
                      <>
                        <div className="bg-[#000080] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest">Step 2 of 4 — Media &amp; Application Code</div>

                        {/* Icon upload */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-bold text-gray-700">Application Icon <span className="font-normal text-gray-500">(upload a PNG or ICO file)</span></label>
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white flex items-center justify-center shrink-0 overflow-hidden">
                              {devIconDataUrl ? (
                                <img src={devIconDataUrl} alt="icon" className="w-12 h-12 object-contain" style={{ imageRendering: 'pixelated' }} />
                              ) : (
                                <Package size={28} className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex flex-col gap-2 flex-1">
                              <label className="px-4 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs font-bold cursor-pointer inline-block text-center">
                                Browse...
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setDevIconFileName(file.name);
                                    const reader = new FileReader();
                                    reader.onload = ev => setDevIconDataUrl(ev.target?.result as string);
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                              <p className="text-[10px] text-gray-500 font-mono">
                                {devIconFileName || 'No file selected'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Screenshot URL */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-bold text-gray-700">Screenshot URL <span className="font-normal text-gray-500">(optional — shown in app detail view)</span></label>
                          <input value={devScreenshotUrl} onChange={e => setDevScreenshotUrl(e.target.value)}
                            className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 text-xs bg-white outline-none font-mono"
                            placeholder="https://example.com/screenshot.png"
                          />
                        </div>

                        {/* Entry Code */}
                        <div className="flex flex-col gap-1 flex-1">
                          <label className="text-[11px] font-bold text-gray-700">
                            Application Source Code * <span className="font-normal text-gray-500">— must declare <code>function init(container, System)</code></span>
                          </label>
                          <textarea
                            value={devEntryCode}
                            onChange={e => { setDevEntryCode(e.target.value); setDevPortalError(null); }}
                            spellCheck={false}
                            rows={12}
                            className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 bg-[#1e1e1e] text-[#d4d4d4] outline-none text-[11px] font-mono resize-none leading-relaxed"
                            placeholder={`function init(container, System) {\n  container.style.cssText = 'font-family:monospace;padding:24px;background:#1a1a2e;color:#e0e0ff;height:100%';\n  container.innerHTML = '<h2>Hello from ' + System.getManifest().name + '!</h2>';\n}`}
                          />
                          <p className="text-[9px] text-gray-500 font-mono">See Help → Developer Guide for the full API reference.</p>
                        </div>

                        <div className="flex justify-between mt-auto pt-3 border-t border-gray-300">
                          <button onClick={() => { setDevPortalError(null); setDevPortalStep(0); }}
                            className="px-6 py-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-sm font-bold">
                            &lt; Back
                          </button>
                          <button
                            onClick={() => {
                              if (!canNext1) { setDevPortalError('Application source code is required and must be more than 10 characters.'); return; }
                              setDevPortalError(null); setDevPortalStep(2);
                            }}
                            className="px-10 py-2 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black text-sm font-bold"
                          >
                            Preview Listing &gt;
                          </button>
                        </div>
                      </>
                    )}

                    {/* ── STEP 2: Preview ── */}
                    {devPortalStep === 2 && (
                      <>
                        <div className="bg-[#000080] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest">Step 3 of 4 — Preview VStore Listing</div>
                        <p className="text-xs text-gray-600">This is exactly how your application will appear to users in the VStore Catalyst catalog.</p>

                        {/* Mini VStore card preview */}
                        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-4 flex gap-4">
                          <div className="w-16 h-16 bg-[#ececec] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                            {devIconDataUrl
                              ? <img src={devIconDataUrl} className="w-12 h-12 object-contain" style={{ imageRendering: 'pixelated' }} alt="icon" />
                              : <Package size={32} className="text-gray-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-bold text-sm text-[#000080]">{previewApp.name}</p>
                                <p className="text-[11px] text-gray-600">{previewApp.developer} • v{previewApp.version}</p>
                              </div>
                              <div className="shrink-0 text-right">
                                {previewApp.price
                                  ? <span className="bg-[#000080] text-white px-2 py-0.5 text-[10px] font-bold">${previewApp.price.toFixed(2)}</span>
                                  : <span className="bg-green-700 text-white px-2 py-0.5 text-[10px] font-bold">FREE</span>}
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-700 mt-1.5 leading-relaxed line-clamp-3">{previewApp.description}</p>
                            <div className="flex gap-3 mt-2 text-[10px] text-gray-500 font-mono">
                              <span>Category: {previewApp.category}</span>
                              <span>Size: {previewApp.size}</span>
                            </div>
                          </div>
                        </div>

                        {devScreenshotUrl && (
                          <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-hidden">
                            <img src={devScreenshotUrl} alt="screenshot" className="w-full object-cover max-h-48" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                        )}

                        <div className="bg-[#fffbe6] border border-yellow-500 p-3 text-[11px] font-mono text-yellow-900 flex gap-2 items-start">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5 text-yellow-600" />
                          <span>By submitting, you confirm this application complies with the VStore Acceptable Use Policy and does not contain malicious code. Your VesperaNET member ID will be recorded with this submission.</span>
                        </div>

                        <div className="flex justify-between mt-auto pt-3 border-t border-gray-300">
                          <button onClick={() => { setDevPortalError(null); setDevPortalStep(1); }}
                            className="px-6 py-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-sm font-bold">
                            &lt; Back
                          </button>
                          <button onClick={() => { setDevPortalError(null); setDevPortalStep(3); }}
                            className="px-10 py-2 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black text-sm font-bold">
                            Continue to Submit &gt;
                          </button>
                        </div>
                      </>
                    )}

                    {/* ── STEP 3: Submit ── */}
                    {devPortalStep === 3 && (
                      <>
                        <div className="bg-[#000080] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest">Step 4 of 4 — Submit Application</div>

                        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-4 flex flex-col gap-3">
                          <p className="text-sm font-bold text-[#000080]">Submission Checklist</p>
                          {[
                            { label: 'Application name provided', ok: !!devAppName.trim() },
                            { label: 'Description provided', ok: !!devAppDescription.trim() },
                            { label: 'Developer name provided', ok: !!devAppAuthor.trim() },
                            { label: 'Application code provided', ok: devEntryCode.trim().length > 10 },
                            { label: 'Icon uploaded', ok: !!devIconDataUrl },
                          ].map(item => (
                            <div key={item.label} className="flex items-center gap-2 text-xs">
                              {item.ok
                                ? <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                                : <AlertTriangle size={14} className="text-yellow-600 shrink-0" />}
                              <span className={item.ok ? 'text-gray-700' : 'text-yellow-800 font-bold'}>{item.label}</span>
                            </div>
                          ))}
                        </div>

                        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-4 text-xs">
                          <p className="font-bold text-[#000080] mb-2">What happens next?</p>
                          <ul className="list-disc pl-4 space-y-1 text-gray-700">
                            <li>Your application is published to the <strong>VStore Catalyst Community</strong> category.</li>
                            <li>It will appear in the catalog immediately for other users to discover.</li>
                            <li>The Setup Wizard will launch to install it on <em>this machine</em> right away.</li>
                            <li>Your VesperaNET ID (<strong>{account.memberId}</strong>) is recorded as the publisher.</li>
                          </ul>
                        </div>

                        <div className="flex justify-between mt-auto pt-3 border-t border-gray-300">
                          <button onClick={() => { setDevPortalError(null); setDevPortalStep(2); }}
                            className="px-6 py-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-sm font-bold">
                            &lt; Back
                          </button>
                          <button
                            onClick={handleSubmit}
                            className="px-10 py-2 bg-[#008000] text-white border-2 border-t-green-400 border-l-green-400 border-b-green-900 border-r-green-900 text-sm font-bold flex items-center gap-2"
                          >
                            <CheckCircle2 size={16} /> Publish to VStore
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })()
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
                      {selectedApp.customIcon ? <img src={selectedApp.customIcon} alt="icon" className="w-[36px] h-[36px] pointer-events-none" style={{ imageRendering: 'pixelated' }} draggable={false} /> : <selectedApp.icon size={36} className={selectedApp.color} />}
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

                  {/* Not-yet-available notice for non-functional apps */}
                  {!selectedApp.functional && (
                    <div className="mt-auto mb-2 bg-[#fffbe6] border-2 border-[#b8860b] p-3 text-[11px] font-mono text-[#5c4000] flex gap-3 items-start shrink-0">
                      <AlertTriangle size={16} className="text-[#b8860b] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold uppercase tracking-wide mb-0.5">Archive Entry — Not Yet Available</p>
                        <p>This title is catalogued for future release on the Vespera platform. Check back after a system update.</p>
                      </div>
                    </div>
                  )}

                  <div className={`pt-3 border-t-2 border-gray-300 flex justify-end shrink-0 ${!purchaseError && selectedApp.functional ? 'mt-auto' : ''}`}>
                    {installedApps.includes(selectedApp.id) ? (
                      <button disabled className="flex items-center gap-2 px-8 py-3 font-bold text-sm border-[3px] bg-[#008000] text-white border-t-gray-800 border-l-gray-800 border-b-white border-r-white cursor-default opacity-80 shadow-none translate-y-[2px] translate-x-[2px]">
                        <CheckCircle2 size={20} /> ALREADY INSTALLED
                      </button>
                    ) : selectedApp.functional ? (
                      <button
                        onClick={() => handleInstallClick(selectedApp)}
                        className="flex items-center gap-2 px-8 py-3 font-bold text-sm border-[3px] shadow-[2px_2px_0_rgba(0,0,0,0.3)] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all bg-[#000080] text-white border-t-blue-400 border-l-blue-400 border-b-[#000040] border-r-[#000040] hover:bg-blue-800"
                      >
                        <Download size={20} />
                        {(selectedApp.price && !account?.purchasedApps?.includes(selectedApp.id))
                          ? `AUTHORIZE PURCHASE ($${selectedApp.price.toFixed(2)})`
                          : 'INITIATE DOWNLOAD'}
                      </button>
                    ) : (
                      <button disabled className="flex items-center gap-2 px-8 py-3 font-bold text-sm border-[3px] bg-[#808080] text-gray-300 border-t-gray-600 border-l-gray-600 border-b-gray-900 border-r-gray-900 cursor-not-allowed opacity-60">
                        <Download size={20} /> NOT YET AVAILABLE
                      </button>
                    )}
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
                           {dealApp.customIcon ? <img src={dealApp.customIcon} alt="icon" className="w-[36px] h-[36px] pointer-events-none" style={{ imageRendering: 'pixelated' }} draggable={false} /> : <dealApp.icon size={36} className={dealApp.color} />}
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
                      {/* Icon box — brighter border for functional apps */}
                      <div className={`w-14 h-14 border-2 flex items-center justify-center shrink-0 shadow-inner transition-colors relative ${
                        app.functional
                          ? 'bg-[#ececec] border-t-gray-800 border-l-gray-800 border-b-white border-r-white group-hover:bg-white'
                          : 'bg-[#d8d8d8] border-t-gray-600 border-l-gray-600 border-b-gray-400 border-r-gray-400 opacity-70'
                      }`}>
                        {app.ageRestricted && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm">18+</div>}
                        {app.customIcon
                          ? <img src={app.customIcon} alt="icon" className={`w-[28px] h-[28px] pointer-events-none ${!app.functional ? 'grayscale opacity-60' : ''}`} style={{ imageRendering: 'pixelated' }} draggable={false} />
                          : <app.icon size={28} className={app.functional ? app.color : 'text-gray-400'} />}
                      </div>

                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h3 className={`font-bold text-[13px] truncate leading-tight group-hover:underline ${app.functional ? 'text-[#000080]' : 'text-gray-500'}`}>{app.name}</h3>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-0.5 font-mono truncate">{app.developer}</p>

                        <div className="flex items-center gap-1 mb-1.5 h-3">
                          {app.rating ? (
                            <div className={`flex ${app.functional ? 'text-yellow-500' : 'text-gray-400'}`}>
                              {[...Array(Math.floor(app.rating))].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                              {app.rating % 1 > 0 && <StarHalf size={10} fill="currentColor" />}
                              <span className="text-[9px] text-gray-500 ml-1 mt-[1px] font-mono">({app.downloadCount?.toLocaleString() || 0})</span>
                            </div>
                          ) : (
                            <span className="text-[9px] text-gray-400 font-mono">New Release</span>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-auto">
                          {installedApps.includes(app.id) ? (
                            <span className="text-[9px] bg-[#008000] text-white px-1.5 py-0.5 font-bold tracking-wider inline-flex items-center gap-1">
                              <CheckCircle2 size={10} /> INSTALLED
                            </span>
                          ) : app.functional ? (
                            <span className="text-[9px] bg-[#006000] text-[#90ff90] border border-[#004000] px-1.5 py-0.5 font-bold tracking-wider shadow-sm animate-pulse inline-flex items-center gap-1">
                              <Download size={8} /> AVAILABLE
                            </span>
                          ) : (
                            <span className="text-[9px] bg-[#404040] text-gray-400 border border-[#303030] px-1.5 py-0.5 font-bold tracking-wider opacity-70">
                              COMING SOON
                            </span>
                          )}
                          <span className="text-[9px] text-gray-500 font-mono">
                            {app.price ? (
                              <span className={app.functional ? 'text-green-700 font-bold' : 'text-gray-400 line-through'}>${app.price.toFixed(2)}</span>
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
