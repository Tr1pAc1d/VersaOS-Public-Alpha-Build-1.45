import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Home, RefreshCw, Search, Globe, Hourglass, Plus, X, Monitor, Cpu, Layers, Music, HardDrive, Activity, AlertTriangle, FileDown, CheckCircle2, Lock, UserCircle2, KeyRound, LogIn, ShieldCheck, Mail } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { AetherisNewsNetwork } from './AetherisNewsNetwork';
import { XArchiveSite } from './XArchiveSite';
import { getAccounts, VStoreAccount } from './VStoreAuth';
import { playBrowserBootSound, playDownloadFailedSound, playInfoSound } from '../utils/audio';
import { useNetworkLink, isOfflineAllowedUrl } from '../contexts/NetworkLinkContext';

/** Safe UUID fallback for insecure (HTTP) contexts where crypto.randomUUID() is unavailable */
const genId = (): string =>
  (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);

interface TabData {
  id: string;
  url: string;
  addressBar: string;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
}

interface WebBrowserProps {
  onDownload?: (filename: string, source: string) => void;
  onLaunchApp?: (appId: string) => void;
  vfs?: {
    installApp: (exeName: string, displayName: string, version: string, appId: string, placeShortcut?: boolean, shortcutIconType?: string) => any;
    nodes: any[];
  };
}

export const WebBrowser: React.FC<WebBrowserProps> = ({ onDownload, onLaunchApp, vfs }) => {
  const { isLinkUp, strictDialUp, linkStatus } = useNetworkLink();
  const isLinkUpRef = useRef(isLinkUp);
  isLinkUpRef.current = isLinkUp;

  useEffect(() => {
    playBrowserBootSound();
  }, []);

  const [tabs, setTabs] = useState<TabData[]>([{
    id: genId(),
    url: 'home',
    addressBar: 'http://www.vesperasystems.com/index.html',
    history: ['home'],
    historyIndex: 0,
    isLoading: false
  }]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installDone, setInstallDone] = useState<Set<string>>(() => {
    const done = new Set<string>();
    const nodes = vfs?.nodes || [];
    if (nodes.some((n: any) => n.id === 'netmon_exe')) done.add('netmon_exe');
    if (nodes.some((n: any) => n.id === 'rhid_exe')) done.add('rhid_exe');
    return done;
  });

  // ── VesperaNET Web Login State ────────────────────────────────────
  const [webLoginModal, setWebLoginModal] = useState(false);
  const [webUser, setWebUser] = useState('');
  const [webPass, setWebPass] = useState('');
  const [webLoginError, setWebLoginError] = useState('');
  const [webAuthenticating, setWebAuthenticating] = useState(false);
  const [webAccount, setWebAccount] = useState<VStoreAccount | null>(() => {
    // Restore session from localStorage
    const saved = localStorage.getItem('vesperanet_web_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Verify account still exists
        const accounts = getAccounts();
        const found = accounts.find(a => a.username.toLowerCase() === parsed.username?.toLowerCase());
        return found || null;
      } catch { return null; }
    }
    return null;
  });

  const handleWebLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setWebLoginError('');
    setWebAuthenticating(true);
    setTimeout(() => {
      const accounts = getAccounts();
      const account = accounts.find(a => a.username.toLowerCase() === webUser.toLowerCase());
      if (!account) {
        setWebLoginError('Member ID not found in VStore directory.');
      } else if (account.isGuest) {
        setWebLoginError('Guest accounts cannot access Member Services.');
      } else if (account.password !== webPass) {
        setWebLoginError('Invalid password. Check your credentials.');
      } else {
        setWebAccount(account);
        localStorage.setItem('vesperanet_web_session', JSON.stringify({ username: account.username }));
        setWebLoginModal(false);
        setWebUser('');
        setWebPass('');
      }
      setWebAuthenticating(false);
    }, 1500);
  };

  const handleWebLogout = () => {
    setWebAccount(null);
    localStorage.removeItem('vesperanet_web_session');
  };
  
  // ── Failing download state ──────────────────────────────────────
  const [failingDownload, setFailingDownload] = useState<{
    filename: string;
    size: string;
    progress: number;
    phase: 'downloading' | 'error';
    attempt: number;
  } | null>(null);
  
  const FAILING_DOWNLOADS: Record<string, { size: string; sizeMB: string }> = {
    'VSCRIPT_31.EXE': { size: '4.2 MB', sizeMB: '4.2MB' },
    'CORENET_TK.ZIP': { size: '850 KB', sizeMB: '850KB' },
    'AURA_CODEC.EXE': { size: '1.1 MB', sizeMB: '1.1MB' },
    'VOS_SP1.EXE': { size: '12.5 MB', sizeMB: '12.5MB' },
  };
  
  const startFailingDownload = (filename: string) => {
    const info = FAILING_DOWNLOADS[filename];
    if (!info) return;
    setFailingDownload(prev => ({ 
      filename, 
      size: info.sizeMB, 
      progress: 0, 
      phase: 'downloading',
      attempt: prev?.filename === filename ? prev.attempt + 1 : 1
    }));
  };
  
  // Animate the failing download progress
  useEffect(() => {
    if (!failingDownload || failingDownload.phase !== 'downloading') return;
    
    // Fail at a random point between 37-62%
    const failAt = 37 + Math.random() * 25;
    
    const intervalId = setInterval(() => {
      setFailingDownload(prev => {
        if (!prev || prev.phase !== 'downloading') return prev;
        // Slow down as we approach the fail point
        const remaining = failAt - prev.progress;
        const increment = remaining > 15 ? (Math.random() * 4 + 1.5) : (Math.random() * 1.5 + 0.3);
        const next = prev.progress + increment;
        if (next >= failAt) {
          return { ...prev, progress: Math.min(next, failAt), phase: 'error' };
        }
        return { ...prev, progress: next };
      });
    }, 600);
    
    return () => clearInterval(intervalId);
  }, [failingDownload?.filename, failingDownload?.phase, failingDownload?.attempt]);

  useEffect(() => {
    if (failingDownload?.phase === 'error') {
      playDownloadFailedSound();
    }
  }, [failingDownload?.phase, failingDownload?.filename, failingDownload?.attempt]);
  
  const dismissFailingDownload = () => {
    setFailingDownload(null);
  };

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const updateActiveTab = (updates: Partial<TabData>) => {
    setTabs(prev => prev.map(tab => tab.id === activeTabId ? { ...tab, ...updates } : tab));
  };

  const addNewTab = () => {
    const newTab: TabData = {
      id: genId(),
      url: 'home',
      addressBar: 'http://www.vesperasystems.com/index.html',
      history: ['home'],
      historyIndex: 0,
      isLoading: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      // If closing the last tab, just reset it
      setTabs([{
        id: genId(),
        url: 'home',
        addressBar: 'http://www.vesperasystems.com/index.html',
        history: ['home'],
        historyIndex: 0,
        isLoading: false
      }]);
    } else {
      const newTabs = tabs.filter(t => t.id !== id);
      setTabs(newTabs);
      if (activeTabId === id) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
    }
  };

  const getDisplayUrl = (fullUrl: string) => {
    if (fullUrl === 'home') return 'http://www.vesperasystems.com/index.html';
    if (fullUrl.startsWith('vespera:')) {
      if (fullUrl === 'vespera:about') return 'http://www.vesperasystems.com/Company-Info.html';
      if (fullUrl === 'vespera:xtype') return 'http://www.vesperasystems.com/Products/X-Type.html';
      if (fullUrl === 'vespera:products') return 'http://www.vesperasystems.com/Products-and-Services.html';
      if (fullUrl === 'vespera:account') return 'http://www.vesperasystems.com/Network-Member.html';
      if (fullUrl === 'vespera:downloads_member') return 'http://www.vesperasystems.com/Network-Downloads.html';
      if (fullUrl === 'vespera:downloads') return 'http://www.vesperasystems.com/Downloads.html';
      if (fullUrl === 'vespera:welcome') return 'http://www.vesperasystems.com/Network-Welcome.html';
      if (fullUrl === 'vespera:store') return 'http://www.vesperasystems.com/Store.html';
      if (fullUrl === 'vespera:press') return 'http://www.vesperasystems.com/Press-Releases.html';
      if (fullUrl === 'vespera:press/echosoft') return 'http://www.vesperasystems.com/Press/EchoSoft-Acquisition.html';
      if (fullUrl === 'vespera:news') return 'http://www.aetherisnews.com/index.html';
      if (fullUrl === 'vespera:x-arch') return 'http://www.vespera.sys/x-arch/login.htm';
      if (fullUrl === 'vespera:404') return 'http://www.vesperasystems.com/404.html';
      return fullUrl;
    }
    const match = fullUrl.match(/web\.archive\.org\/web\/\d+\/(.*)/);
    if (match && match[1]) {
      return match[1];
    }
    return fullUrl;
  };

  const navigate = (newUrl: string) => {
    let finalUrl = newUrl;
    
    // Map fake URLs back to internal vespera: routes
    if (newUrl.toLowerCase() === 'http://www.vesperasystems.com/index.html' || newUrl.toLowerCase() === 'www.vesperasystems.com/index.html' || newUrl.toLowerCase() === 'vesperasystems.com/index.html' || newUrl.toLowerCase() === 'http://www.vesperasystems.com' || newUrl.toLowerCase() === 'www.vesperasystems.com' || newUrl.toLowerCase() === 'vesperasystems.com') {
      finalUrl = 'home';
    } else if (newUrl.toLowerCase().includes('company-info.html')) {
      finalUrl = 'vespera:about';
    } else if (newUrl.toLowerCase().includes('products/x-type.html')) {
      finalUrl = 'vespera:xtype';
    } else if (newUrl.toLowerCase().includes('products-and-services.html')) {
      finalUrl = 'vespera:products';
    } else if (newUrl.toLowerCase().includes('network-member.html')) {
      finalUrl = 'vespera:account';
    } else if (newUrl.toLowerCase().includes('network-downloads.html')) {
      finalUrl = 'vespera:downloads_member';
    } else if (newUrl.toLowerCase().includes('downloads.html')) {
      finalUrl = 'vespera:downloads';
    } else if (newUrl.toLowerCase().includes('network-welcome.html')) {
      finalUrl = 'vespera:welcome';
    } else if (newUrl.toLowerCase().includes('store.html')) {
      finalUrl = 'vespera:store';
    } else if (newUrl.toLowerCase().includes('press/echosoft-acquisition.html')) {
      finalUrl = 'vespera:press/echosoft';
    } else if (newUrl.toLowerCase().includes('press-releases.html')) {
      finalUrl = 'vespera:press';
    } else if (newUrl.toLowerCase().includes('aetherisnews.com')) {
      finalUrl = 'vespera:news';
    } else if (newUrl.toLowerCase().includes('404.html')) {
      finalUrl = 'vespera:404';
    } else if (newUrl.toLowerCase().includes('vespera.sys/x-arch/login.htm')) {
      finalUrl = 'vespera:x-arch';
    } else if (newUrl !== 'home' && !newUrl.startsWith('vespera:')) {
      // If it's not already a wayback URL, make it one
      if (!newUrl.includes('web.archive.org')) {
        const cleanUrl = newUrl.replace(/^https?:\/\//, '');
        // Use late 1996 timestamp to get pages from 1996-1999 era
        finalUrl = `https://web.archive.org/web/19961231235959/http://${cleanUrl}`;
      }
    }

    if (!isLinkUpRef.current && !isOfflineAllowedUrl(finalUrl)) {
      playInfoSound();
      return;
    }
    
    const newHistory = activeTab.history.slice(0, activeTab.historyIndex + 1);
    newHistory.push(finalUrl);
    
    updateActiveTab({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      url: finalUrl,
      addressBar: getDisplayUrl(finalUrl),
      isLoading: finalUrl !== 'home' && !finalUrl.startsWith('vespera:')
    });
  };

  const goBack = () => {
    if (activeTab.historyIndex > 0) {
      const newIndex = activeTab.historyIndex - 1;
      const prevUrl = activeTab.history[newIndex];
      updateActiveTab({
        historyIndex: newIndex,
        url: prevUrl,
        addressBar: getDisplayUrl(prevUrl),
        isLoading: prevUrl !== 'home' && !prevUrl.startsWith('vespera:')
      });
    }
  };

  const goForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const newIndex = activeTab.historyIndex + 1;
      const nextUrl = activeTab.history[newIndex];
      updateActiveTab({
        historyIndex: newIndex,
        url: nextUrl,
        addressBar: getDisplayUrl(nextUrl),
        isLoading: nextUrl !== 'home' && !nextUrl.startsWith('vespera:')
      });
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab.addressBar.trim()) {
      navigate(activeTab.addressBar.trim());
    }
  };

  useEffect(() => {
    const handleNavigate = (e: CustomEvent<string>) => {
      navigate(e.detail);
    };
    window.addEventListener('navigate-browser' as any, handleNavigate);
    return () => window.removeEventListener('navigate-browser' as any, handleNavigate);
  }, [activeTabId]);

  const [xtypeImage, setXtypeImage] = useState<string | null>(localStorage.getItem('xtypeImage'));
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    const generateImage = async () => {
      if (xtypeImage || isGeneratingImage) return;
      setIsGeneratingImage(true);
      try {
        const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
        if (!apiKey) {
          console.warn("VITE_GEMINI_API_KEY is missing. Mocking image generation.");
          setXtypeImage("https://picsum.photos/seed/xtype-neural-bridge/300/200?grayscale");
          return;
        }
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: 'A 1990s style computer expansion card, VESA Local Bus, thick ceramic housing, slightly sinister, glowing red accents, complex circuitry, retro-tech, macro photography, high detail, isolated on a white background, product photography',
        });
        
        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            const base64 = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            setXtypeImage(base64);
            localStorage.setItem('xtypeImage', base64);
            break;
          }
        }
      } catch (e) {
        console.error('Failed to generate X-Type image:', e);
      } finally {
        setIsGeneratingImage(false);
      }
    };

    if (activeTab.url === 'vespera:xtype') {
      generateImage();
    }
  }, [activeTab.url, xtypeImage, isGeneratingImage]);

  return (
    <div className="flex flex-col h-full w-full bg-[#c0c0c0] text-black font-sans relative overflow-hidden z-0">
      {/* Tabs Bar */}
      <div className="flex items-end px-2 pt-2 space-x-1 bg-[#b2b2b2] border-b border-gray-500 overflow-x-auto">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`flex items-center px-3 py-1 border-2 border-b-0 cursor-pointer min-w-[120px] max-w-[200px] ${
              activeTabId === tab.id 
                ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800 z-10 relative top-[1px]' 
                : 'bg-[#a0a0a0] border-t-gray-300 border-l-gray-300 border-r-gray-600 text-gray-600'
            }`}
          >
            <span className="truncate flex-1 text-xs font-bold">
              {tab.url === 'home' ? 'Vespera Navigator' : getDisplayUrl(tab.url) || 'New Tab'}
            </span>
            <button 
              onClick={(e) => closeTab(e, tab.id)}
              className="ml-2 hover:bg-gray-400 p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button 
          onClick={addNewTab}
          className="p-1 mb-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Browser Toolbar - Netscape/IE style */}
      <div className="flex items-center p-1 px-2 space-x-1 border-b-2 border-b-gray-700 border-t border-t-white bg-[#c0c0c0]">
        {/* Back button */}
        <button
          onClick={goBack}
          disabled={activeTab.historyIndex === 0}
          title="Back"
          className="flex flex-col items-center justify-center p-1 min-w-[36px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white disabled:opacity-40 text-black"
        >
          <ArrowLeft size={18} />
          <span className="text-[9px] font-bold leading-none mt-0.5">Back</span>
        </button>
        {/* Forward button */}
        <button
          onClick={goForward}
          disabled={activeTab.historyIndex === activeTab.history.length - 1}
          title="Forward"
          className="flex flex-col items-center justify-center p-1 min-w-[36px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white disabled:opacity-40 text-black"
        >
          <ArrowRight size={18} />
          <span className="text-[9px] font-bold leading-none mt-0.5">Forward</span>
        </button>
        {/* Stop/Refresh button */}
        <button
          onClick={() => updateActiveTab({ isLoading: false })}
          title="Stop/Refresh"
          className="flex flex-col items-center justify-center p-1 min-w-[36px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white text-black"
        >
          <RefreshCw size={18} className={activeTab.isLoading ? 'animate-spin' : ''} />
          <span className="text-[9px] font-bold leading-none mt-0.5">Reload</span>
        </button>
        {/* Home button */}
        <button
          onClick={() => navigate('home')}
          title="Home"
          className="flex flex-col items-center justify-center p-1 min-w-[36px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white text-black"
        >
          <Home size={18} />
          <span className="text-[9px] font-bold leading-none mt-0.5">Home</span>
        </button>

        {/* Separator */}
        <div className="w-px h-8 bg-gray-600 mx-1" />

        {/* Address bar */}
        <form onSubmit={handleAddressSubmit} className="flex-1 flex items-center space-x-1">
          <span className="text-xs font-bold whitespace-nowrap">Address&nbsp;</span>
          <input
            type="text"
            value={activeTab.addressBar}
            onChange={e => updateActiveTab({ addressBar: e.target.value })}
            className="flex-1 border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white px-2 py-0.5 text-sm bg-white font-mono"
            placeholder="http://www.vesperasystems.com"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white text-sm font-bold"
          >
            Go
          </button>
          {activeTab.isLoading && (
            <Hourglass size={14} className="animate-spin text-black ml-1" />
          )}
        </form>
      </div>

      {strictDialUp && !isLinkUp && (
        <div
          className={`mx-2 mt-1 px-2 py-1 border-2 text-xs font-bold ${
            linkStatus === 'dialing'
              ? 'bg-yellow-100 border-yellow-800 text-yellow-950'
              : 'bg-amber-100 border-amber-800 text-amber-950'
          }`}
        >
          {linkStatus === 'dialing'
            ? 'Dialing VesperaNET… External Web will unlock when the handshake completes.'
            : 'Not connected to VesperaNET — external Web pages are blocked. Use Start → System → System Tools → VesperaNET Dial-Up to connect, or stay on the Vespera home site.'}
        </div>
      )}

      {/* Browser Content */}
      <div className="flex-1 bg-white border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white m-2 overflow-auto relative">
        {activeTab.url === 'vespera:news' && <AetherisNewsNetwork />}
        {activeTab.url === 'vespera:x-arch' && <XArchiveSite />}
        {(activeTab.url === 'home' || activeTab.url.startsWith('vespera:')) ? (
          <div className="flex flex-col min-h-full bg-white font-serif text-black">
            {/* Header */}
            <div className="bg-black text-white p-4 border-b-4 border-gray-400 flex justify-between items-end">
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
            <div className="bg-[#000080] text-white text-sm py-1 overflow-hidden whitespace-nowrap border-b-2 border-gray-400">
              <marquee scrollamount="5" className="font-bold">
                Welcome to the Vespera Systems Corporate Portal! *** NEW: Vespera OS 1.0.4 is now available for enterprise customers! *** Check out our new Web Directory! ***
              </marquee>
            </div>

            <div className="flex flex-1">
              {/* Sidebar */}
              <div className="w-48 bg-[#c0c0c0] border-r-2 border-gray-400 p-4 flex flex-col gap-4">
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
                  <li className="cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:press')}>Press Releases</li>
                  <li className="cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:404')}>Technical Support</li>
                </ul>

                {/* ── VesperaNET Member Login Widget ── */}
                <div className="border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#d8d8d8] p-2 mt-4">
                  <div className="bg-[#003366] text-[#ffcc00] font-bold text-[10px] text-center p-0.5 tracking-wider border border-[#001a33] mb-2">
                    VESPERANET
                  </div>
                  {webAccount ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <UserCircle2 size={24} className="text-[#003366]" />
                      <p className="text-[10px] font-bold text-center text-[#003366] leading-tight">
                        Welcome,<br/>{webAccount.displayName}
                      </p>
                      <p className="text-[9px] text-gray-500 font-mono">{webAccount.tier} Member</p>
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
                        Member Services
                      </p>
                      <button
                        onClick={() => { setWebLoginModal(true); setWebLoginError(''); }}
                        className="w-full text-[10px] font-bold text-center bg-[#003366] text-[#ffcc00] border border-t-[#004c99] border-l-[#004c99] border-b-[#001a33] border-r-[#001a33] py-0.5 hover:brightness-125 active:border-t-[#001a33] active:border-l-[#001a33] active:border-b-[#004c99] active:border-r-[#004c99] flex items-center justify-center gap-1"
                      >
                        <LogIn size={10} /> Network Login
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-auto pt-8 flex flex-col items-center gap-4">
                  <div className="border border-gray-500 p-1 bg-yellow-200 text-center text-xs font-bold w-full shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                    🚧 Under Construction 🚧
                  </div>
                  <div className="text-[10px] text-center border border-gray-400 p-1 bg-white">
                    Best viewed with<br/>
                    <strong>Netscape Navigator 3.0</strong><br/>
                    at 800x600
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                {activeTab.url === 'home' && (
                  <>
                    {/* ── Logged-in Member Services Banner ── */}
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
                            onClick={() => onLaunchApp?.('vmail')}
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
                        <div onClick={() => navigate('vespera:404')} className="cursor-pointer border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-3 flex flex-col items-center text-center hover:bg-[#d0d0d0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
                          <HardDrive size={32} className="text-gray-800 mb-2" />
                          <span className="font-bold text-xs">DeepSweep Utility</span>
                        </div>
                        <div onClick={() => navigate('vespera:404')} className="cursor-pointer border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-3 flex flex-col items-center text-center hover:bg-[#d0d0d0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
                          <Activity size={32} className="text-teal-800 mb-2" />
                          <span className="font-bold text-xs">Soma-Scan Diagnostic</span>
                        </div>
                        <div onClick={() => navigate('vespera:404')} className="cursor-pointer border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-3 flex flex-col items-center text-center hover:bg-[#d0d0d0] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
                          <Globe size={32} className="text-orange-800 mb-2" />
                          <span className="font-bold text-xs">AETHERIS Logistics Node</span>
                        </div>
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
                  </>
                )}
                {activeTab.url === 'vespera:account' && webAccount && (
                  <>
                    <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Network Member Profile</h2>
                    
                    <div className="bg-[#f0f0f0] p-6 border-2 border-t-white border-l-white border-b-gray-400 border-r-gray-400 shadow-md max-w-2xl mx-auto mb-8">
                       <div className="flex items-start gap-4 mb-6">
                         <div className="w-20 h-20 bg-[#000080] flex items-center justify-center border-2 border-[#ffcc00] shadow-inner">
                           <UserCircle2 size={48} className="text-[#ffcc00]" />
                         </div>
                         <div>
                           <h3 className="text-2xl font-bold text-black border-b border-gray-400 pb-1 mb-2">{webAccount.displayName}</h3>
                           <p className="text-xs text-gray-600 font-mono">ACCOUNT ID: {webAccount.memberId}</p>
                           <p className="text-xs text-[#000080] font-bold mt-1">STATUS: {webAccount.tier.toUpperCase()} MEMBER VERIFIED</p>
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mb-6 border-t border-b border-gray-400 py-4">
                         <div><span className="text-gray-600 font-bold block mb-1">MEMBER SINCE:</span>{new Date(webAccount.memberSince).toLocaleDateString()}</div>
                         <div><span className="text-gray-600 font-bold block mb-1">CURRENT TIER:</span>{webAccount.tier}</div>
                         <div><span className="text-gray-600 font-bold block mb-1">VSTORE POINTS:</span>{webAccount.vstorePoints}</div>
                         <div><span className="text-gray-600 font-bold block mb-1">EST. WALLET BALANCE:</span>${webAccount.balance.toFixed(2)}</div>
                         <div><span className="text-gray-600 font-bold block mb-1">DOWNLOAD COUNT:</span>{webAccount.totalDownloads}</div>
                       </div>

                       <div className="bg-white p-4 border border-gray-400">
                         <h4 className="font-bold text-[#000080] border-b border-gray-300 pb-1 mb-3">Upgrade Membership</h4>
                         <p className="text-xs text-black mb-4">
                           Ready to experience the raw power of VesperaNET Gold? Gain access to unmetered file transfers and the exclusive SysAdmin lounge.
                         </p>
                         <form className="flex flex-col gap-3 text-xs font-bold" onSubmit={(e) => { e.preventDefault(); alert('Automatic upgrades are currently offline. Please dial 1-800-VESPERA for operator assistance.'); }}>
                            <div className="flex items-center gap-2">
                              <input type="radio" id="gold" name="tier" defaultChecked />
                              <label htmlFor="gold" className="text-orange-600">Gold Tier ($19.95/mo)</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="radio" id="plat" name="tier" disabled />
                              <label htmlFor="plat" className="text-gray-400">Platinum Tier (Requires Corporate Token)</label>
                            </div>
                            <div className="mt-3">
                              <label className="block mb-1">Valid Credit Card Number:</label>
                              <input type="password" placeholder="XXXX-XXXX-XXXX-XXXX" className="border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white p-1" />
                            </div>
                            <button type="submit" className="mt-2 w-1/3 px-4 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-black active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs whitespace-nowrap">
                              Process Upgrade
                            </button>
                         </form>
                       </div>
                    </div>
                  </>
                )}

                {activeTab.url === 'vespera:downloads_member' && webAccount && (
                  <>
                    <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">My Downloads & Licenses</h2>
                    
                    <div className="max-w-3xl mx-auto mt-6 bg-white border border-gray-400 p-1">
                      <div className="bg-[#000080] text-white p-2 font-bold mb-2 text-sm flex items-center justify-between">
                        <span>Software License Registry</span>
                        <span className="font-mono text-xs text-[#ffcc00]">ID: {webAccount.memberId}</span>
                      </div>
                      
                      {webAccount.purchasedApps.length === 0 && webAccount.downloadHistory.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-bold">
                          There are no downloads associated with this account.
                        </div>
                      ) : (
                        <table className="w-full text-sm text-left border-collapse">
                          <thead>
                            <tr className="bg-[#c0c0c0] border-b border-gray-400">
                              <th className="p-2 border-r border-gray-400">Date/Time</th>
                              <th className="p-2 border-r border-gray-400">Software Asset</th>
                              <th className="p-2 border-r border-gray-400">Type</th>
                              <th className="p-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...webAccount.purchasedApps, ...webAccount.downloadHistory.filter(d => !webAccount.purchasedApps.includes(d))].map((item, id) => (
                               <tr key={id} className={`border-b border-gray-200 \${id % 2 === 0 ? 'bg-white' : 'bg-[#f8f8f8]'}`}>
                                 <td className="p-2 font-mono text-xs">{new Date(webAccount.memberSince).toLocaleDateString()}</td>
                                 <td className="p-2 font-bold text-[#000080]">{item.toUpperCase()}</td>
                                 <td className="p-2 text-xs italic text-gray-600">{webAccount.purchasedApps.includes(item) ? 'Purchased License' : 'Freeware Download'}</td>
                                 <td className="p-2 text-center">
                                   <button 
                                     onClick={() => {
                                        if (onDownload) {
                                          onDownload(`\${item}.zip`, 'http://vesperasystems.com/vault');
                                        }
                                     }}
                                     className="px-2 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-[10px] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold"
                                   >
                                     Re-Download
                                   </button>
                                 </td>
                               </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </>
                )}

                {activeTab.url === 'vespera:about' && (
                  <>
                    <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">About Vespera Systems</h2>
                    
                    <div className="mb-8 text-sm leading-relaxed space-y-4">
                      <div>
                        <h3 className="font-bold text-md text-[#000080]">Our Origins</h3>
                        <p>Founded in 1975 by the visionary Dr. Thorne, Vespera Systems began as an elite computational think-tank dedicated to a singular, ambitious goal: bridging the gap between human intuition and raw computational power. For over two decades, our dedicated team of engineers and data scientists has operated at the vanguard of technological research, translating complex theoretical computing into practical, world-changing solutions.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-md text-[#000080]">A Legacy of Cross-Sector Innovation</h3>
                        <p>What began in the laboratory has now revolutionized the globe. Long before our entry into the personal computing market, Vespera's proprietary algorithms silently powered the world's most critical infrastructure. Today, Vespera Systems provides cutting-edge technology across a multitude of vital sectors. From state-of-the-art medical diagnostic software that saves lives, to complex logistical frameworks, right down to the everyday third-party utility applications that keep your home office running smoothly—Vespera is the invisible engine driving the modern world.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-md text-[#000080]">The Power of Vespera OS & AETHERIS</h3>
                        <p>Our flagship operating environment, Vespera OS, is built upon the rock-solid foundation of our proprietary AETHERIS architecture. Designed for the rigorous demands of the modern enterprise, Vespera OS brings unparalleled stability, true preemptive multitasking, and a seamless, intuitive graphical interface directly to your desktop. Whether you are analyzing complex data streams or surfing the Information Superhighway, Vespera ensures your workflow is uninterrupted and absolute.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-md text-[#000080]">The Public Coding Languages</h3>
                        <p className="mb-2">The public knows Vespera as a pioneer in software development. While Synap-C is our brand-new, cutting-edge language meant for the X-Type, we maintain two legacy languages that run the normal, everyday world.</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>
                            <strong>V-Script (Visual Vespera):</strong> Introduced in 1990, this highly popular, user-friendly, object-oriented language is the equivalent of Visual Basic. Third-party developers use V-Script to build 90% of the shareware, desktop games, and business applications available for Vespera OS. If you are coding a point-of-sale system for a grocery store or a digital encyclopedia on a CD-ROM, you are writing it in V-Script.
                          </li>
                          <li>
                            <strong>CoreNet (C-Net):</strong> Our ultra-reliable, low-level language developed back in the late 1970s. It is entirely text-based, highly efficient, and requires virtually no system memory to run. CoreNet is the invisible backbone of modern infrastructure, used to program embedded systems like Automotive Engine Control Units (ECUs), traffic light grids, hospital heart monitors, and banking mainframes. It isn't flashy, but it never crashes.
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-md text-[#000080]">Hardware and Embedded Systems</h3>
                        <p className="mb-2">Vespera doesn't just make desktop PCs. We manufacture the microcontrollers that third-party companies buy in bulk to put inside their own products.</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>
                            <strong>Vespera Logic-7 Microcontrollers:</strong> "The brain inside your vehicle." Vespera has lucrative contracts with major auto manufacturers. The Logic-7 chips control electronic fuel injection, anti-lock brakes (ABS), and early digital dashboard displays in thousands of 1990s sedans.
                          </li>
                          <li>
                            <strong>AETHERIS Net-Switches:</strong> Before the internet was in every home, corporations relied on local intranets. Vespera sells massive, humming rack-mounted network switches that connect office buildings together. <span className="text-[10px] text-gray-400 italic">(Internal Note: Routing background data packets to Axis Innovations).</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-md text-[#000080]">Strategic Acquisitions & Partnerships</h3>
                        <p className="mb-2">At Vespera Systems, we believe in fostering innovation by welcoming brilliant new brands into our family. By integrating these forward-thinking technologies, we strengthen our ecosystem and empower our partners and users with the best tools available.</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>
                            <strong>Prism Graphics Corporation (Joined 1992):</strong> We proudly welcomed the talented team at Prism to help us evolve their popular "Prism Presenter" into what is now Vespera Slide Deck. Together, we've made it the corporate standard for seamless boardroom presentations within the Omni-Task Office Suite.
                          </li>
                          <li>
                            <strong>EchoSoft Audio (Joined 1994):</strong> Recognizing the revolutionary potential of this German startup's digital audio compression, Vespera brought EchoSoft into the fold. Their groundbreaking work lives on as the foundation of our crystal-clear Aura Media Player.
                          </li>
                          <li>
                            <strong>Sentinel Data Vaults (Joined 1988):</strong> To ensure our users have absolute peace of mind, we integrated this pioneering data-security firm into the Vespera family. Their trusted encryption algorithms now provide enterprise-grade security directly within the AETHERIS kernel. <span className="text-[10px] text-gray-400 italic">(Internal Note: Unbreakable encryption required for digital containment fields).</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-md text-[#000080]">The Next Evolution: X-Type Neural Bridge</h3>
                        <p>At Vespera, we don't just build computers; we build partners. With the upcoming rollout of our experimental X-Type Neural Bridge technology, Vespera is completely redefining the user experience. The X-Type co-processor goes beyond traditional keyboard and mouse inputs. By utilizing advanced heuristic processing, it adapts to your unique workflow. It learns. It anticipates. It understands.</p>
                        <p className="mt-2">We believe the machine should adapt to the mind, not the other way around. Vespera isn't just building the next generation of hardware; we are building the next step in human-machine evolution.</p>
                        <p className="mt-2 font-bold italic text-[#000080]">Welcome to the future.</p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab.url === 'vespera:xtype' && (
                  <>
                    <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">The X-Type Neural Bridge (Model X-1)</h2>
                    <h3 className="text-xl font-bold mb-6 text-red-700 italic">"The Machine That Learns."</h3>
                    
                    <div className="mb-8 border-4 border-gray-400 p-2 bg-white flex justify-center items-center min-h-[300px]">
                      {xtypeImage ? (
                        <img src={xtypeImage} alt="X-Type Neural Bridge Expansion Card" className="max-w-full h-auto border border-gray-300 shadow-md" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Hourglass size={32} className="animate-spin mb-2" />
                          <span className="font-bold text-sm">Generating Neural Bridge Schematic...</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-8 text-sm leading-relaxed space-y-6">
                      <div>
                        <h3 className="font-bold text-lg text-white bg-[#000080] p-1 px-2 mb-2">Product Overview</h3>
                        <p>The X-Type Neural Bridge is not merely a hardware upgrade; it is a paradigm shift in modern computational architecture. Designed to integrate seamlessly with standard enterprise mainboards, the X-Type offloads complex heuristic and predictive calculations from your primary CPU.</p>
                        <p className="mt-2">Powered by Vespera's patented Adaptive Synaptic Framework, the X-1 doesn't just process data—it perceives it. By establishing a localized neural feedback loop, the co-processor actively learns your workflow, optimizing application load times and anticipating your commands before they are even fully typed. It is the ultimate bridge between human intuition and raw processing power.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg text-white bg-[#000080] p-1 px-2 mb-2">Hardware Compatibility & System Requirements</h3>
                        <p className="mb-2">To ensure absolute stability and optimal heuristic indexing, the X-Type 1 must be installed in a system meeting the following verified specifications:</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li><strong>Expansion Bus:</strong> 1 VESA Local Bus (VLB) Type II slot required.
                            <p className="ml-6 text-xs italic text-gray-700 mt-1">Note: The X-Type requires direct, unmitigated 32-bit access to the CPU's memory bus. Standard 16-bit ISA slots are strictly incompatible with non-Euclidean data structures.</p>
                          </li>
                          <li><strong>Processor (CPU):</strong> Intel i486DX (33MHz, 50MHz, or 66MHz) or 100% verified compatible architecture.</li>
                          <li><strong>System Memory:</strong> 8MB Fast Page Mode (FPM) RAM minimum. 16MB highly recommended for deep-state pattern recognition.</li>
                          <li><strong>Storage:</strong> IDE Hard Drive with a minimum of 15MB contiguous free space reserved strictly for the Neural Swap File.</li>
                          <li><strong>Power Supply:</strong> 250W minimum AT power supply. The X-Type draws significant localized voltage to maintain the stability of the synaptic bridge.</li>
                          <li><strong>Operating System:</strong> Vespera OS 1.0.4 or higher (Requires AETHERIS Kernel v4.2+).</li>
                        </ul>
                      </div>

                      <div className="border-2 border-red-600 bg-red-50 p-4 shadow-sm">
                        <h3 className="font-bold text-lg text-red-800 mb-2 flex items-center gap-2">⚠️ Important Installation Notice</h3>
                        <p className="mb-2">Due to the immense processing density of the X-Type Neural Bridge, the ceramic housing generates significant thermal output. Ensure your desktop casing is well-ventilated.</p>
                        <p className="mb-2">During the initial 48-hour calibration period, users may experience the following normal byproducts of the neural mapping process:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2 mb-2">
                          <li>Minor electromagnetic interference on CRT monitors (image ghosting).</li>
                          <li>Localized temperature drops in the immediate vicinity of the workstation.</li>
                          <li>Low-frequency auditory resonance (humming or whispering sounds) emanating from the internal PC speaker.</li>
                        </ul>
                        <p className="font-bold text-red-900">These are standard diagnostic feedback loops and are not a cause for alarm. Do not interrupt the power cycle during an active cognitive sync.</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg text-white bg-[#000080] p-1 px-2 mb-2">Vespera Technical Support & Knowledge Base</h3>
                        <h4 className="font-bold text-md mb-3 border-b border-gray-400 pb-1 text-[#000080]">Troubleshooting the X-Type Neural Bridge and Vespera OS</h4>
                        <p className="mb-4">Welcome to the Vespera Support Portal. As with any revolutionary technology, integrating the X-Type Neural Bridge into existing hardware may require minor system adjustments. Below are the most common inquiries from our enterprise and home users.</p>
                        
                        <div className="space-y-4">
                          <div className="bg-gray-100 p-3 border border-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                            <p className="font-bold text-[#000080] mb-1">Q: My internal PC speaker is emitting a low, rhythmic whispering sound. Sometimes, when the room is quiet, it sounds like a human voice.</p>
                            <p><strong>A:</strong> This is a known, harmless hardware quirk. The X-Type co-processor draws significant localized voltage, which can cause Electromagnetic Interference (EMI) with unshielded audio cables or older PC speakers. The "voice" you hear is simply the internal speaker acting as a crude antenna, picking up stray AM radio frequencies or cellular cross-talk. To resolve this, you can disable the internal speaker via the Vespera OS Control Panel.</p>
                          </div>

                          <div className="bg-gray-100 p-3 border border-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                            <p className="font-bold text-[#000080] mb-1">Q: Strange text files keep appearing on my C:\ drive. They are named with random numbers (e.g., 1975_LOG.TXT) and the text inside just says "IT PERCEIVES" over and over. Is this a virus?</p>
                            <p><strong>A:</strong> Rest assured, Vespera OS is highly secure. What you are seeing is our DeepSweep disk utility doing its job! DeepSweep regularly recovers corrupted temporary files and orphan data fragments from deleted sectors. Occasionally, the heuristic indexing of the X-Type chip will misinterpret random binary code as text. Please delete these files and empty your Recycle Bin. Do not attempt to execute or respond to these files.</p>
                          </div>

                          <div className="bg-gray-100 p-3 border border-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                            <p className="font-bold text-[#000080] mb-1">Q: During the AMIBIOS boot sequence, I get an error reading: "Attempting to map non-euclidean data structures... FAILED. Retrying with neural bypass." Is my motherboard broken?</p>
                            <p><strong>A:</strong> Your hardware is perfectly fine. The X-Type chip utilizes non-Euclidean memory mapping to store complex behavioral predictions. If your system RAM (Fast Page Mode) is slightly delayed, the bridge will safely default to a "neural bypass" to prevent data corruption. To eliminate this message, ensure your X-Type card is firmly seated in the VLB slot and that IRQ 15 is reserved exclusively for the co-processor.</p>
                          </div>

                          <div className="bg-gray-100 p-3 border border-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                            <p className="font-bold text-[#000080] mb-1">Q: Ever since installing the X-Type, my office is freezing cold, and my CRT monitor occasionally displays shadows or silhouettes that aren't part of my desktop wallpaper.</p>
                            <p><strong>A:</strong> The X-Type features a state-of-the-art ceramic thermal sink. When the heuristic engine is running at 100% capacity, it rapidly pulls heat from the surrounding environment, which can cause localized temperature drops around your desk. As for the monitor "shadows," this is a common issue with older Cathode Ray Tube (CRT) monitors struggling to keep up with the X-Type's 32-bit graphical acceleration. We recommend upgrading to a Vespera-certified Horizon monitor.</p>
                          </div>

                          <div className="bg-gray-100 p-3 border border-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                            <p className="font-bold text-[#000080] mb-1">Q: I tried to uninstall the X-Type card, but the AETHERIS terminal won't let me shut down the PC. The terminal just says "CONNECTION REFUSED. THEY ARE NOT FINISHED."</p>
                            <p><strong>A:</strong> Please remember that the X-Type is an adaptive learning device. Interrupting a cognitive sync cycle can damage the localized neural loop. The system is simply completing a background defragmentation. Please leave the workstation powered on, step away from the desk, and allow the process to finish. Under no circumstances should you physically remove the power cable during this phase.</p>
                          </div>
                        </div>

                        <p className="mt-8 text-center italic border-t border-gray-300 pt-4">
                          Still experiencing issues? Click here to submit a ticket to <span className="line-through text-gray-500">Axis Innovations... er,</span> Vespera Systems Tier 2 Support.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab.url === 'vespera:products' && (
                  <>
                    <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Products & Services</h2>
                    <div className="mb-8 text-sm leading-relaxed space-y-6">
                      <div>
                        <h3 className="font-bold text-lg text-white bg-[#000080] p-1 px-2 mb-2">Vespera OS & Software Solutions</h3>
                        <p className="mb-2">Vespera Systems provides the definitive software ecosystem for the modern enterprise. Our software is designed with absolute efficiency and uncompromising stability in mind.</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li><strong>Vespera OS:</strong> The flagship operating environment. Preemptive multitasking, secure memory allocation, and an intuitive graphical interface.</li>
                          <li><strong>Omni-Task Office Suite:</strong> Featuring Vespera Slide Deck (formerly Prism Presenter), Omni-Word, and Omni-Calc. The corporate standard for productivity.</li>
                          <li><strong>Aura Media Player:</strong> Revolutionary digital audio compression. <span className="italic text-gray-600 text-xs">Note: Aura's advanced analog frequency filtering reduces unexpected vocal artifacts during playback of highly compressed files.</span></li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white bg-[#000080] p-1 px-2 mb-2">Hardware & Embedded Systems</h3>
                        <p className="mb-2">Beyond the desktop, Vespera manufactures the microcontrollers and networking infrastructure that power the 21st century.</p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li><strong>Horizon Desktop PCs:</strong> Turn-key workstations built to harness the full power of Vespera OS.</li>
                          <li><strong>Vespera Logic-7 Microcontrollers:</strong> The brain inside your vehicle. Controlling electronic fuel injection, ABS, and digital displays in thousands of sedans worldwide.</li>
                          <li><strong>AETHERIS Net-Switches:</strong> Massive, rack-mounted network switches that connect office buildings together with unbreakable Sentinel encryption.</li>
                          <li><strong className="text-red-700 cursor-pointer hover:underline" onClick={() => navigate('vespera:xtype')}>X-Type Neural Bridge (Model X-1):</strong> Our experimental co-processor designed to boost heuristic processing. The machine that learns.</li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}

                {activeTab.url === 'vespera:downloads' && (
                  <>
                    <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Developer Network & Downloads</h2>
                    <p className="mb-4 text-sm">Access the latest development tools, system updates, and media codecs. Vespera Systems provides robust support for our proprietary languages.</p>
                    
                    <table className="w-full text-sm border-2 border-gray-800 bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.2)] mb-8">
                      <thead className="bg-[#000080] text-white text-left">
                        <tr>
                          <th className="p-2 border-r border-gray-400">Filename</th>
                          <th className="p-2 border-r border-gray-400">Description</th>
                          <th className="p-2 border-r border-gray-400">Size</th>
                          <th className="p-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-300 hover:bg-gray-100">
                          <td className="p-2 border-r border-gray-300 font-mono font-bold">AETHERIS_NET_MON_SETUP.EXE</td>
                          <td className="p-2 border-r border-gray-300">AETHERIS Network Monitor v4.2 Setup. Advanced diagnostic tool for node routing and EMI frequency analysis.</td>
                          <td className="p-2 border-r border-gray-300">1.2 MB</td>
                          <td className="p-2">
                            <button
                                onClick={() => onDownload?.('AETHERIS_NET_MON_SETUP.EXE', 'vesperasystems.com')}
                                className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-2 py-1 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
                              >
                                Download
                              </button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-300 hover:bg-red-50" style={{ borderLeft: '3px solid #CC0000' }}>
                          <td className="p-2 border-r border-gray-300 font-mono font-bold" style={{ color: '#8B0000' }}>RHID_SUBSYSTEM_SETUP.EXE</td>
                          <td className="p-2 border-r border-gray-300">RHID Subsystem for Vespera OS v4.03.22.1 &mdash; Kernel &amp; Linux Subsystem Update for Vespera Systems. Based on Red Hat 3.0.3 RHID altered distribution. Provides POSIX-compliant shell environment.</td>
                          <td className="p-2 border-r border-gray-300">2.8 MB</td>
                          <td className="p-2">
                            <button
                                onClick={() => onDownload?.('RHID_SUBSYSTEM_SETUP.EXE', 'vesperasystems.com')}
                                className="border-2 px-2 py-1 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
                                style={{ backgroundColor: '#CC0000', color: 'white', borderTopColor: '#FF4444', borderLeftColor: '#FF4444', borderBottomColor: '#660000', borderRightColor: '#660000' }}
                              >
                                Download
                              </button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-300 hover:bg-gray-100">
                          <td className="p-2 border-r border-gray-300 font-mono font-bold">VSCRIPT_31.EXE</td>
                          <td className="p-2 border-r border-gray-300">V-Script (Visual Vespera) IDE v3.1. The industry standard for point-and-click application development.</td>
                          <td className="p-2 border-r border-gray-300">4.2 MB</td>
                          <td className="p-2"><button onClick={() => startFailingDownload('VSCRIPT_31.EXE')} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-2 py-1 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Download</button></td>
                        </tr>
                        <tr className="border-b border-gray-300 hover:bg-gray-100">
                          <td className="p-2 border-r border-gray-300 font-mono font-bold">CORENET_TK.ZIP</td>
                          <td className="p-2 border-r border-gray-300">CoreNet Embedded Toolkit v4.0. Low-level compiler for Logic-7 microcontrollers.</td>
                          <td className="p-2 border-r border-gray-300">850 KB</td>
                          <td className="p-2"><button onClick={() => startFailingDownload('CORENET_TK.ZIP')} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-2 py-1 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Download</button></td>
                        </tr>
                        <tr className="border-b border-gray-300 hover:bg-gray-100">
                          <td className="p-2 border-r border-gray-300 font-mono font-bold">AURA_CODEC.EXE</td>
                          <td className="p-2 border-r border-gray-300">Aura Audio/Video Codec Pack v2.0. Required for playback of .AUR media files.</td>
                          <td className="p-2 border-r border-gray-300">1.1 MB</td>
                          <td className="p-2"><button onClick={() => startFailingDownload('AURA_CODEC.EXE')} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-2 py-1 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Download</button></td>
                        </tr>
                        <tr className="border-b border-gray-300 hover:bg-gray-100">
                          <td className="p-2 border-r border-gray-300 font-mono font-bold">VOS_SP1.EXE</td>
                          <td className="p-2 border-r border-gray-300">Vespera OS Service Pack 1. Includes critical security patches for AETHERIS networking.</td>
                          <td className="p-2 border-r border-gray-300">12.5 MB</td>
                          <td className="p-2"><button onClick={() => startFailingDownload('VOS_SP1.EXE')} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-2 py-1 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Download</button></td>
                        </tr>
                        <tr className="bg-red-50 hover:bg-red-100">
                          <td className="p-2 border-r border-gray-300 font-mono font-bold text-red-800">SYNAP_C_SDK.TAR.GZ</td>
                          <td className="p-2 border-r border-gray-300 text-red-900">Synap-C Neural Compiler SDK. <br/><span className="text-xs font-bold">RESTRICTED: AXIS INNOVATIONS CLEARANCE REQUIRED.</span></td>
                          <td className="p-2 border-r border-gray-300 text-red-800">[REDACTED]</td>
                          <td className="p-2"><button onClick={() => alert("ACCESS DENIED. UNAUTHORIZED DOWNLOAD ATTEMPT LOGGED.")} className="bg-red-800 text-white border-2 border-t-red-400 border-l-red-400 border-b-red-950 border-r-red-950 px-2 py-1 text-xs font-bold active:border-t-red-950 active:border-l-red-950 active:border-b-red-400 active:border-r-red-400">Download</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                {activeTab.url === 'vespera:store' && (
                  <>
                    <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Vespera Direct Sales</h2>
                    <p className="mb-6 text-sm">Order the latest Vespera hardware and software directly from our secure AETHERIS-encrypted storefront. Please allow 4-6 weeks for delivery.</p>
                    
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      {/* Product 1 */}
                      <div className="border-2 border-gray-400 bg-white p-4 flex flex-col shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                        <div className="h-40 bg-gray-200 mb-4 border border-gray-400 flex items-center justify-center overflow-hidden bg-[url('/exemplary-retro-a-world-globe-wireframe-interconnected-lines-with-transparent-background-detailed-free-png.png')] bg-center bg-no-repeat bg-contain">
                          <img src="/Vespera Website assets/Product Images/Vespera Workplace RHID Edition Box.png" alt="Horizon Desktop PC" className="object-contain h-full w-auto hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h3 className="font-bold text-lg text-[#000080]">Horizon Desktop PC (VOS 1.0.4)</h3>
                        <p className="text-xs text-gray-600 mb-2">Intel i486DX 50MHz, 16MB RAM, 1.2GB HDD</p>
                        <p className="text-sm flex-1">The ultimate workstation for Vespera OS. Pre-configured for maximum stability and enterprise networking.</p>
                        <div className="mt-4 flex justify-between items-center border-t border-gray-300 pt-3">
                          <span className="font-bold text-lg">$2,499.00</span>
                          <button className="bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black px-4 py-1 text-sm font-bold active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400">Add to Cart</button>
                        </div>
                      </div>

                      {/* Product 2 */}
                      <div className="border-2 border-gray-400 bg-white p-4 flex flex-col shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                        <div className="h-40 bg-gray-200 mb-4 border border-gray-400 flex items-center justify-center overflow-hidden bg-[url('/exemplary-retro-a-world-globe-wireframe-interconnected-lines-with-transparent-background-detailed-free-png.png')] bg-center bg-no-repeat bg-contain">
                          <img src="/Vespera Website assets/Product Images/Vespera Workplace RHID Second Edition Box.png" alt="Omni-Task Suite" className="object-contain h-full w-auto hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h3 className="font-bold text-lg text-[#000080]">Omni-Task Office Suite 2.0</h3>
                        <p className="text-xs text-gray-600 mb-2">CD-ROM Edition</p>
                        <p className="text-sm flex-1">Includes Vespera Slide Deck, Omni-Word, and Omni-Calc. The definitive productivity suite for the modern professional.</p>
                        <div className="mt-4 flex justify-between items-center border-t border-gray-300 pt-3">
                          <span className="font-bold text-lg">$399.00</span>
                          <button className="bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black px-4 py-1 text-sm font-bold active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400">Add to Cart</button>
                        </div>
                      </div>

                      {/* Product 3 */}
                      <div className="border-2 border-gray-400 bg-white p-4 flex flex-col shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                        <div className="h-40 bg-gray-200 mb-4 border border-gray-400 flex items-center justify-center overflow-hidden bg-[url('/exemplary-retro-a-world-globe-wireframe-interconnected-lines-with-transparent-background-detailed-free-png.png')] bg-center bg-no-repeat bg-contain">
                          <img src="/Vespera Website assets/Product Images/VMail Product box.png" alt="Vespera VMail" className="object-contain h-full w-auto hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h3 className="font-bold text-lg text-[#000080]">Vespera VMail Pro</h3>
                        <p className="text-xs text-gray-600 mb-2">VesperaNET Member Exclusive</p>
                        <p className="text-sm flex-1">Secure, encrypted email for the corporate professional. Fully integrated with VStore Catalyst and VesperaNET global directories.</p>
                        <div className="mt-4 flex justify-between items-center border-t border-gray-300 pt-3">
                          <span className="font-bold text-lg">$89.00</span>
                          <button className="bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black px-4 py-1 text-sm font-bold active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400">Add to Cart</button>
                        </div>
                      </div>

                      {/* Product 4 */}
                      <div className="border-2 border-red-600 bg-red-50 p-4 flex flex-col shadow-[4px_4px_0px_rgba(0,0,0,0.2)] relative overflow-hidden">
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">Experimental</div>
                        <div className="h-40 bg-gray-200 mb-4 border border-gray-400 flex items-center justify-center overflow-hidden">
                          {xtypeImage ? (
                            <img src={xtypeImage} alt="X-Type Expansion Card" className="object-cover w-full h-full" />
                          ) : (
                            <Cpu size={48} className="text-red-800" />
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-red-800">X-Type Neural Bridge</h3>
                        <p className="text-xs text-red-600 mb-2">Model X-1 (VLB Architecture)</p>
                        <p className="text-sm flex-1 text-red-900">The machine that learns. Offload heuristic processing and establish a localized neural feedback loop. <br/><br/><span className="italic text-xs">Warning: Requires robust EMI shielding.</span></p>
                        <div className="mt-4 flex justify-between items-center border-t border-red-300 pt-3">
                          <span className="font-bold text-lg text-red-800">$899.00</span>
                          <button className="bg-red-800 text-white border-2 border-t-red-400 border-l-red-400 border-b-black border-r-black px-4 py-1 text-sm font-bold active:border-t-black active:border-l-black active:border-b-red-400 active:border-r-red-400">Add to Cart</button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab.url === 'vespera:press' && (
                  <>
                    <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Press Releases</h2>
                    <p className="mb-6 text-sm">Read the latest news and corporate announcements from Vespera Systems.</p>
                    <ul className="space-y-4 text-sm">
                      <li>
                        <span className="font-bold">10/12/94</span> - <span className="text-blue-700 underline cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:press/echosoft')}>Vespera Systems Finalizes Acquisition of EchoSoft Audio</span>
                      </li>
                      <li>
                        <span className="font-bold">08/24/93</span> - <span className="text-blue-700 underline cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:404')}>Vespera Announces Omni-Task Office Suite 2.0</span>
                      </li>
                      <li>
                        <span className="font-bold">11/05/92</span> - <span className="text-blue-700 underline cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:404')}>Prism Graphics Corporation Joins the Vespera Family</span>
                      </li>
                    </ul>
                  </>
                )}

                {activeTab.url === 'vespera:press/echosoft' && (
                  <div className="font-serif text-sm leading-relaxed max-w-3xl bg-[#fffff0] p-8 border-4 border-double border-gray-800 shadow-md mx-auto">
                    <div className="text-center border-b-4 border-gray-800 pb-4 mb-6">
                      <h2 className="text-4xl font-bold font-serif tracking-widest uppercase">Vespera News</h2>
                      <p className="text-xs uppercase tracking-widest mt-1 text-gray-600">Corporate Announcements & Press</p>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2 leading-tight">VESPERA SYSTEMS FINALIZES ACQUISITION OF ECHOSOFT AUDIO, CEMENTING LEADERSHIP IN MULTIMEDIA AND SIGNAL PROCESSING</h3>
                    <p className="text-xs text-gray-600 mb-6 italic border-b border-gray-300 pb-4">Published: October 12, 1994 | Contact: Vespera Systems Public Relations</p>
                    
                    <p className="mb-4 text-justify"><strong className="text-lg">S</strong><strong>ILICON VALLEY, CA –</strong> Vespera Systems, a global leader in advanced operating environments and enterprise hardware, today announced the completion of its acquisition of EchoSoft Audio, a pioneer in analog-to-digital signal processing, in a stock transaction valued at approximately $45 million.</p>
                    
                    <p className="mb-4 text-justify">The acquisition brings EchoSoft’s revolutionary spectral compression algorithms under the Vespera umbrella. EchoSoft’s proprietary technology is widely recognized for its unprecedented ability to isolate micro-fluctuations in analog frequencies, virtually eliminating background noise and delivering perfect digital fidelity.</p>
                    
                    <p className="mb-4 text-justify border-l-4 border-gray-400 pl-4 italic bg-gray-100 py-2">"The multimedia revolution is here, and audio is no longer just a peripheral—it is a core component of the computing experience," said Dr. Arthur Thorne, Founder and Director of Advanced Heuristics at Vespera Systems. "EchoSoft's unique approach to analog frequency isolation allows for the detection and digital translation of micro-acoustic data previously lost to background noise. By integrating their algorithms directly into the AETHERIS architecture, we are ensuring that Vespera hardware doesn't just process sound; it truly listens."</p>
                    
                    <p className="mb-4 text-justify">Starting in Q1 1995, EchoSoft’s core engineering team will be relocated to Vespera’s advanced R&D facility. Their technology will be heavily utilized in the development of the upcoming Aura Media Player, bundled natively with future releases of Vespera OS.</p>
                    
                    <p className="mb-4 text-justify">Furthermore, Vespera Systems plans to integrate EchoSoft’s deep-level frequency parsing into its new Synap-C development environment. This will allow third-party developers, automotive ECU manufacturers, and industrial hardware partners to utilize highly sensitive environmental audio-telemetry in their own embedded systems.</p>
                    
                    <p className="mb-6 text-justify border-l-4 border-gray-400 pl-4 italic bg-gray-100 py-2">"We are thrilled to join the Vespera family," said Dieter Vogel, former CEO of EchoSoft Audio. "Our mission was always to capture the invisible spectrum of sound. With Vespera's unparalleled hardware capabilities and the upcoming X-Type architectures, the potential applications for our frequency-mapping software are limitless."</p>
                    
                    <div className="border-t-2 border-gray-800 pt-4 mt-8">
                      <h4 className="font-bold mb-2 uppercase text-xs tracking-wider">About Vespera Systems</h4>
                      <p className="text-xs text-justify text-gray-700 mb-8">Founded in 1975, Vespera Systems develops, manufactures, licenses, and supports a wide range of software and hardware products for computing devices. From the Vespera OS graphical environment to the CoreNet embedded frameworks powering modern infrastructure, Vespera’s mission is to bridge the gap between human intuition and raw computational power. The Future is Now.</p>
                    </div>
                    
                    <button onClick={() => navigate('vespera:press')} className="text-blue-700 underline hover:text-red-600 font-sans font-bold text-sm">&lt;&lt; Return to News Index</button>
                  </div>
                )}

                {activeTab.url === 'vespera:welcome' && (
                  <div className="flex flex-col h-full items-center py-12 px-6">
                    <div className="bg-[#004c66] w-full p-8 text-white border-4 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] max-w-3xl flex flex-col items-center text-center">
                      <Globe size={48} className="mb-4 text-[#e0e0e0]" />
                      <h2 className="text-4xl font-bold mb-2 tracking-widest text-shadow-sm"><span className="text-[#ffff00]">VESPERA</span>NET</h2>
                      <h3 className="text-lg uppercase tracking-widest mb-8 border-b border-[#006680] pb-2">Global Access Established</h3>
                      
                      <div className="w-full bg-[#c0c0c0] text-black border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-6 shadow-inner text-left">
                        <h4 className="text-xl font-bold border-b-2 border-[#000080] pb-2 text-[#000080] flex items-center gap-2">
                          <CheckCircle2 size={24} className="text-green-700" /> Account Verification Successful
                        </h4>
                        <p className="mt-4 text-sm leading-relaxed font-semibold">
                          Thank you for registering a Global Member ID with Vespera Systems. Your digital authentication profile is now permanently active on the VesperaNET secure mainframe.
                        </p>
                        <p className="mt-4 text-sm leading-relaxed">
                          With your assigned Member ID, you can instantly log in to the <strong>VStore Catalyst Software Exchange</strong> to securely manage your digital wallet, review lifetime download histories, and purchase premium applications spanning enterprise productivity, system utilities, and legacy entertainment.
                        </p>
                        
                        <div className="bg-[#ffffcc] border border-gray-400 p-3 mt-6 text-xs flex gap-3 items-start">
                          <AlertTriangle size={24} className="text-red-700 shrink-0" />
                          <div>
                            <strong className="text-red-700 uppercase">System Security Warning:</strong> Do not share your VStore Member ID or password on public boards. Vespera Systems administrators will NEVER ask for your dial-up password, authentication protocols, or vault billing profiles.
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <button onClick={() => navigate('vespera:store')} className="px-8 py-2 bg-[#000080] text-white font-bold border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400">
                            Continue to VStore Portal &gt;&gt;
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab.url === 'vespera:404' && (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <h2 className="text-4xl font-bold mb-4 text-red-600 border-b-2 border-red-600 pb-2 w-full text-center">404 - Not Found</h2>
                    <p className="text-lg mb-4 font-bold">The requested document could not be found on this server.</p>
                    <p className="text-sm">Please check the URL or return to the <span className="text-blue-600 underline cursor-pointer" onClick={() => navigate('home')}>homepage</span>.</p>
                  </div>
                )}
                
                <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
                  Copyright © 1991-1996 Vespera Systems Corporation. All rights reserved.<br/>
                  Powered by the Wayback Machine.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <iframe 
            src={activeTab.url} 
            onLoad={() => updateActiveTab({ isLoading: false })}
            className="absolute inset-0 w-full h-full border-none bg-white"
            title="Web Browser"
            sandbox="allow-same-origin allow-scripts allow-forms"
          />
        )}
      </div>

      {/* Netscape-style Status Bar */}
      <div className="flex items-center px-2 py-0.5 border-t-2 border-t-gray-700 bg-[#c0c0c0] text-xs font-mono select-none shrink-0">
        <div className="flex-1 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white px-2 py-0.5 bg-[#c0c0c0] truncate">
          {activeTab.isLoading
            ? `Opening: ${activeTab.addressBar}...`
            : activeTab.url === 'home' || activeTab.url.startsWith('vespera:')
              ? `Document: Done`
              : `Wayback Machine: ${activeTab.addressBar}`}
        </div>
        <div className="ml-1 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white px-2 py-0.5 bg-[#c0c0c0] whitespace-nowrap">
          Vespera Navigator 2.0
        </div>
        {activeTab.isLoading && (
          <div className="ml-1 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white px-2 py-0.5 bg-[#000080] text-white animate-pulse whitespace-nowrap">
            ■■■░░░░
          </div>
        )}
      </div>
      
      {/* ── Failing Download Dialog ── */}
      {failingDownload && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/20">
          {failingDownload.phase === 'downloading' && (
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-96 flex flex-col font-sans text-black select-none">
              <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center">
                <span className="font-bold text-sm">File Download</span>
                <button onClick={dismissFailingDownload} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-4 h-4 flex items-center justify-center text-black font-bold text-xs active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
                  X
                </button>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <FileDown size={32} className="text-gray-600 mt-2" />
                  <div className="flex flex-col gap-1 text-sm">
                    <p>Saving:</p>
                    <p className="font-bold">{failingDownload.filename}</p>
                    <p>from download.vesperasystems.com</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span>Estimated time left:</span>
                    <span>{Math.max(1, Math.floor((100 - failingDownload.progress) / 8))} Min {Math.floor(Math.random() * 50 + 10)} Sec ({Math.round(failingDownload.progress)}% of {failingDownload.size})</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Download to:</span>
                    <span>C:\VESPERA\DOWNLOADS</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Transfer rate:</span>
                    <span>{(Math.random() * 3 + 1.5).toFixed(1)} KB/Sec</span>
                  </div>
                </div>
                <div className="w-full h-6 bg-[#c0c0c0] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-[2px] flex">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className={`h-full w-[4.5%] mx-[0.25%] ${i < (failingDownload.progress / 5) ? 'bg-[#000080]' : 'bg-transparent'}`} />
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <button onClick={dismissFailingDownload} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 text-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {failingDownload.phase === 'error' && (
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-[420px] flex flex-col font-sans text-black select-none">
              <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center">
                <span className="font-bold text-sm">Download Error</span>
                <button onClick={dismissFailingDownload} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-4 h-4 flex items-center justify-center text-black font-bold text-xs active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
                  X
                </button>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-start gap-4">
                  <AlertTriangle size={32} className="text-yellow-600 mt-1 shrink-0" />
                  <div className="flex flex-col gap-2 text-sm">
                    <p className="font-bold">Download failed at {Math.round(failingDownload.progress)}%</p>
                    <p>An error occurred while downloading <strong>{failingDownload.filename}</strong>:</p>
                    <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 text-xs font-mono">
                      <p className="text-red-700 font-bold">ERROR: Connection to download server lost.</p>
                      <p className="mt-1">Unable to establish a secure connection to</p>
                      <p>download.vesperasystems.com:443</p>
                      <p className="mt-1">The server may be temporarily unavailable or</p>
                      <p>your AETHERIS network configuration may need</p>
                      <p>to be updated. (Error Code: 0x800C0005)</p>
                    </div>
                    <p className="text-xs text-gray-600 italic">Please verify your Internet connection and try again later.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-1">
                  <button onClick={() => startFailingDownload(failingDownload.filename)} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-5 py-1 text-sm font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
                    Retry
                  </button>
                  <button onClick={dismissFailingDownload} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-5 py-1 text-sm font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VesperaNET Floating Login Modal ── */}
      {webLoginModal && (
        <div className="absolute inset-0 z-[120] bg-black/40 flex items-center justify-center font-sans" onClick={() => { if (!webAuthenticating) { setWebLoginModal(false); } }}>
          <div 
            className="bg-[#c0c0c0] w-[380px] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col text-black select-none"
            onClick={e => e.stopPropagation()}
          >
            {/* Title Bar */}
            <div className="bg-[#003366] text-[#ffcc00] px-2 py-1 font-bold text-sm tracking-wide flex justify-between items-center border-b border-[#001a33]">
              <span className="flex items-center gap-1.5"><Globe size={14} /> VesperaNET: Member Login</span>
              <button 
                onClick={() => setWebLoginModal(false)} 
                disabled={webAuthenticating}
                className="bg-[#c0c0c0] text-black w-4 h-4 font-bold flex items-center justify-center border border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs hover:bg-gray-200 disabled:opacity-50"
              >
                X
              </button>
            </div>
            {/* Body */}
            <div className="p-5 flex flex-col gap-4">
              <div className="flex gap-4 border-b border-gray-400 pb-4">
                <div className="w-14 h-14 border-2 border-[#003366] bg-[#001a33] flex items-center justify-center shadow-inner shrink-0">
                  <ShieldCheck size={32} className="text-[#ffcc00]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#003366] tracking-wide">VESPERANET SECURE GATEWAY</h2>
                  <p className="text-[10px] text-gray-600 leading-tight mt-1">
                    Access Member Services using your VStore credentials. Your connection is secured via 128-bit RSA encryption.
                  </p>
                </div>
              </div>

              {webLoginError && (
                <div className="bg-[#ffffcc] border border-[#cccc99] p-2 text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" /> {webLoginError}
                </div>
              )}

              <form onSubmit={handleWebLogin} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1"><UserCircle2 size={12}/> VStore Username</label>
                  <input 
                    disabled={webAuthenticating}
                    type="text" 
                    value={webUser} 
                    onChange={e => setWebUser(e.target.value)} 
                    className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-sm bg-white focus:bg-[#fffff0] outline-none" 
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1"><KeyRound size={12}/> Password</label>
                  <input 
                    disabled={webAuthenticating}
                    type="password" 
                    value={webPass} 
                    onChange={e => setWebPass(e.target.value)} 
                    className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-sm bg-white focus:bg-[#fffff0] outline-none font-mono" 
                  />
                </div>

                <div className="mt-2 flex justify-between items-center border-t border-gray-400 pt-3">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {webAuthenticating ? 'Verifying credentials...' : 'Waiting for input.'}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setWebLoginModal(false)} 
                      disabled={webAuthenticating}
                      className="px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold text-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white hover:bg-[#d0d0d0] disabled:opacity-70"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={webAuthenticating} 
                      type="submit" 
                      className="px-4 py-1 bg-[#003366] text-[#ffcc00] border-2 border-t-[#004c99] border-l-[#004c99] border-b-[#001a33] border-r-[#001a33] font-bold text-sm active:border-t-[#001a33] active:border-l-[#001a33] active:border-b-[#004c99] active:border-r-[#004c99] hover:brightness-125 disabled:opacity-70 flex items-center gap-1"
                    >
                      <LogIn size={14}/> Sign In
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
