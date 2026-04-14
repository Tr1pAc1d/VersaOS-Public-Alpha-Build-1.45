import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Home, RefreshCw, Search, Globe, Hourglass, Plus, X, Monitor, Cpu, Layers, Music, HardDrive, Activity, AlertTriangle, FileDown, CheckCircle2, Lock, UserCircle2, KeyRound, LogIn, ShieldCheck, Mail } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { AetherisNewsNetwork } from './AetherisNewsNetwork';
import { XArchiveSite } from './XArchiveSite';
import { VesperaSystemsSite } from './VesperaSystemsSite';
import { AtlanticWavesSite } from './AtlanticWavesSite';
import { MeridianBroadcastingSite } from './MeridianBroadcastingSite';
import { VMail } from './VMail';
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
      if (fullUrl === 'vespera:guestbook') return 'http://www.vesperasystems.com/Guestbook.html';
      if (fullUrl === 'vespera:x-arch') return 'http://www.vespera.sys/x-arch/login.htm';
      if (fullUrl === 'vespera:axis') return 'http://axis.vesperasystems.com/syslog.txt';
      if (fullUrl === 'vespera:vmail') return 'http://vesperamail.vespera.net/client';
      if (fullUrl === 'vespera:support') return 'http://www.vesperasystems.com/Technical-Support.html';
      if (fullUrl === 'vespera:404') return 'http://www.vesperasystems.com/404.html';
      return fullUrl;
    }
    if (fullUrl === 'atlanticwaves:home') return 'http://www.atlanticwaves.ca/index.html';
    if (fullUrl === 'mbn:home') return 'http://www.mbn-online.net/index.html';
    
    // Improved regex to handle standard and iframe-friendly (if_) Wayback URLs
    const match = fullUrl.match(/web\.archive\.org\/web\/\d+(?:[a-z]{2}_)?\/(.*)/i);
    if (match && match[1]) {
      let displayUrl = match[1];
      // Ensure it's a clean URL without duplicating protocols if possible
      if (!displayUrl.startsWith('http')) {
        displayUrl = 'http://' + displayUrl;
      }
      return displayUrl;
    }
    return fullUrl;
  };

  const navigate = (newUrl: string) => {
    let finalUrl = newUrl;
    const normalizedUrl = newUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    if (normalizedUrl === 'vesperasystems.com' || normalizedUrl === 'www.vesperasystems.com' || normalizedUrl === 'vesperasystems.com/index.html') {
      finalUrl = 'home';
    } else if (normalizedUrl === 'atlanticwaves.ca' || normalizedUrl === 'www.atlanticwaves.ca') {
      finalUrl = 'atlanticwaves:home';
    } else if (normalizedUrl === 'mbn-online.net' || normalizedUrl === 'www.mbn-online.net') {
      finalUrl = 'mbn:home';
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
    } else if (newUrl.toLowerCase().includes('guestbook.html')) {
      finalUrl = 'vespera:guestbook';
    } else if (newUrl.toLowerCase().includes('aetherisnews.com')) {
      finalUrl = 'vespera:news';
    } else if (newUrl.toLowerCase().includes('axis.vesperasystems.com/syslog.txt')) {
      finalUrl = 'vespera:axis';
    } else if (newUrl.toLowerCase().includes('vesperamail.vespera.net')) {
      finalUrl = 'vespera:vmail';
    } else if (newUrl.toLowerCase().includes('technical-support.html')) {
      finalUrl = 'vespera:support';
    } else if (newUrl.toLowerCase().includes('404.html')) {
      finalUrl = 'vespera:404';
    } else if (newUrl.toLowerCase().includes('vespera.sys/x-arch/login.htm')) {
      finalUrl = 'vespera:x-arch';
    } else if (newUrl !== 'home' && !newUrl.startsWith('vespera:') && !newUrl.startsWith('atlanticwaves:') && !newUrl.startsWith('mbn:')) {
      // If it's not already a wayback URL, make it one
      if (!newUrl.includes('web.archive.org')) {
        const cleanUrl = newUrl.replace(/^https?:\/\//, '');
        // Use late 1996 timestamp to get pages from 1996-1999 era
        // Using 'if_' suffix for better framing compatibility
        finalUrl = `https://web.archive.org/web/19961231235959if_/http://${cleanUrl}`;
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
      isLoading: finalUrl !== 'home' && !finalUrl.startsWith('vespera:') && !finalUrl.startsWith('mbn:') && !finalUrl.startsWith('atlanticwaves:')
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
        isLoading: prevUrl !== 'home' && !prevUrl.startsWith('vespera:') && !prevUrl.startsWith('mbn:') && !prevUrl.startsWith('atlanticwaves:')
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
        isLoading: nextUrl !== 'home' && !nextUrl.startsWith('vespera:') && !nextUrl.startsWith('mbn:') && !nextUrl.startsWith('atlanticwaves:')
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
      <div className="flex-1 bg-white border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white m-2 overflow-auto relative flex flex-col">
        {activeTab.url === 'vespera:news' ? (
          <AetherisNewsNetwork />
        ) : activeTab.url === 'vespera:x-arch' ? (
          <XArchiveSite />
        ) : activeTab.url === 'vespera:vmail' ? (
          <VMail onClose={() => navigate('home')} />
        ) : activeTab.url === 'atlanticwaves:home' ? (
          <AtlanticWavesSite 
            onDownload={(filename: string, source: string) => {
              if (onDownload) onDownload(filename, source);
            }} 
          />
        ) : activeTab.url === 'mbn:home' ? (
          <MeridianBroadcastingSite />
        ) : (activeTab.url === 'home' || activeTab.url.startsWith('vespera:')) ? (
          <VesperaSystemsSite 
            url={activeTab.url}
            navigate={navigate}
            webAccount={webAccount}
            onLaunchApp={onLaunchApp}
            onDownload={onDownload}
            setWebLoginModal={setWebLoginModal}
            handleWebLogout={handleWebLogout}
            startFailingDownload={startFailingDownload}
            xtypeImage={xtypeImage}
            hasVMail={vfs?.nodes?.some((n: any) => n.id === 'vmail')}
          />
        ) : (
            <iframe 
              src={activeTab.url} 
              onLoad={() => updateActiveTab({ isLoading: false })}
              className="absolute inset-0 w-full h-full border-none bg-white"
              title="Web Browser"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
        )}
      </div>

      {/* Netscape-style Status Bar */}
      <div className="flex items-center px-2 py-0.5 border-t-2 border-t-gray-700 bg-[#c0c0c0] text-xs font-mono select-none shrink-0">
        <div className="flex-1 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white px-2 py-0.5 bg-[#c0c0c0] truncate">
          {activeTab.isLoading
            ? `Opening: ${activeTab.addressBar}...`
            : (activeTab.url === 'home' || activeTab.url.startsWith('vespera:') || activeTab.url.startsWith('mbn:') || activeTab.url.startsWith('atlanticwaves:'))
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
