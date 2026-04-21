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

  // ── Bookmarks State ─────────────────────────────────────────────
  const DEFAULT_BOOKMARKS = [
    { name: 'Vespera Systems', url: 'home' },
    { name: 'AETHERIS News Network', url: 'vespera:news' },
    { name: 'Meridian Broadcasting Network', url: 'mbn:home' },
    { name: 'Atlantic Waves', url: 'atlanticwaves:home' },
    { name: 'X-Arch Login', url: 'vespera:x-arch' },
  ];
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('navigator_bookmarks');
      if (saved) return JSON.parse(saved);
      return DEFAULT_BOOKMARKS;
    } catch { return DEFAULT_BOOKMARKS; }
  });
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [bookmarkNameInput, setBookmarkNameInput] = useState('');

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmarkNameInput.trim()) return;
    
    // For WayBack Machine proxy URLs, store the target URL directly
    const targetUrl = activeTab.url === 'home' ? 'home' : activeTab.addressBar;
    
    const newB = [...bookmarks, { name: bookmarkNameInput.trim(), url: targetUrl }];
    setBookmarks(newB);
    localStorage.setItem('navigator_bookmarks', JSON.stringify(newB));
    setIsBookmarkModalOpen(false);
  };

  const handleRemoveBookmark = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newB = [...bookmarks];
    newB.splice(index, 1);
    setBookmarks(newB);
    localStorage.setItem('navigator_bookmarks', JSON.stringify(newB));
  };

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
  
  // ── Internet Options & View Source & Print Spooler State ──────────
  const [isInternetOptionsOpen, setIsInternetOptionsOpen] = useState(false);
  const [internetOptionsTab, setInternetOptionsTab] = useState('General');
  const [homepageInput, setHomepageInput] = useState(() => {
    return localStorage.getItem('navigator_homepage') || 'http://www.vesperasystems.com/index.html';
  });
  
  const [isViewSourceOpen, setIsViewSourceOpen] = useState(false);
  
  const [isPrintSpoolerOpen, setIsPrintSpoolerOpen] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [printError, setPrintError] = useState('');

  // ── Multiple Downloads Manager State ──────────────────────────────
  interface DownloadJob {
    id: string;
    filename: string;
    size: string;
    progress: number;
    phase: 'downloading' | 'error' | 'completed';
    attempt: number;
  }
  const [downloads, setDownloads] = useState<DownloadJob[]>([]);
  const [isDownloadManagerOpen, setIsDownloadManagerOpen] = useState(false);

  // Still support the legacy single download trigger for backward compatibility
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
    setDownloads(prev => [...prev, {
      id: genId(),
      filename,
      size: info.sizeMB,
      progress: 0,
      phase: 'downloading',
      attempt: prev.filter(d => d.filename === filename).length + 1
    }]);
    setIsDownloadManagerOpen(true);
  };
  
  // Animate the multiple failing download progress
  useEffect(() => {
    if (!downloads.some(d => d.phase === 'downloading')) return;
    
    const intervalId = setInterval(() => {
      setDownloads(prev => {
        let changed = false;
        let playSound = false;
        const nextState = prev.map(d => {
          if (d.phase !== 'downloading') return d;
          
          const failAt = 37 + Math.random() * 25 + (d.attempt * 5); // Attempt pushes fail point further
          const remaining = failAt - d.progress;
          const increment = remaining > 15 ? (Math.random() * 4 + 1.5) : (Math.random() * 1.5 + 0.3);
          const nextProg = d.progress + increment;
          changed = true;
          
          if (nextProg >= failAt) {
            playSound = true;
            return { ...d, progress: Math.min(nextProg, failAt), phase: 'error' };
          }
          return { ...d, progress: nextProg };
        });
        if (playSound) playDownloadFailedSound();
        return changed ? nextState : prev;
      });
    }, 600);
    
    return () => clearInterval(intervalId);
  }, [downloads]);

  // ── Print Spooler Logic ───────────────────────────────────────
  const startPrintJob = () => {
    setIsPrintSpoolerOpen(true);
    setPrintProgress(0);
    setPrintError('');
  };

  useEffect(() => {
    if (!isPrintSpoolerOpen || printError) return;
    if (printProgress >= 82) {
      const timer = setTimeout(() => {
        setPrintError('Spooler SubSystem App Error: LPT1 Out of Paper / Win32 Exception');
        playDownloadFailedSound(); 
      }, 800);
      return () => clearTimeout(timer);
    }
    const interval = setInterval(() => {
      setPrintProgress(p => Math.min(p + (Math.random() * 15 + 5), 82));
    }, 400);
    return () => clearInterval(interval);
  }, [isPrintSpoolerOpen, printProgress, printError]);

  const getSimulatedSourceCode = (url: string) => {
    if (url === 'home' || url.startsWith('vespera:')) {
      return `<html>\n  <head>\n    <title>Vespera Web Interface</title>\n    <meta name="generator" content="Vespera SiteWeaver 2.0">\n  </head>\n  <body bgcolor="#c0c0c0" text="#000000">\n    <center>\n      <table border="0" cellpadding="0" cellspacing="0" width="800">\n        <tr>\n          <td>\n            <marquee direction="left" scrollamount="3">Connecting Human Intuition with Computational Power...</marquee>\n            <h1>Welcome to the Vespera Network Services</h1>\n            <hr width="100%">\n            <!-- BEGIN VESPERA SCRIPT APPLET -->\n            <applet code="VesperaSecureProtocol.class" width="1" height="1"></applet>\n            <!-- END VESPERA SCRIPT APPLET -->\n          </td>\n        </tr>\n      </table>\n    </center>\n  </body>\n</html>`;
    }
    return `<html>\n  <head><title>Wayback Machine Sandbox</title></head>\n  <body>\n    <!-- Page source blocked by Vespera WebNavigator Sandbox Layer -->\n    <!-- Direct inspection of cross-origin frames is disabled to prevent XSS injection. -->\n    <iframe src="${url}" width="100%" height="100%"></iframe>\n  </body>\n</html>`;
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
        finalUrl = `https://web.archive.org/web/19961231235959id_/http://${cleanUrl}`;
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
      <div className="flex items-end px-1 pt-1 space-x-1 bg-[#b2b2b2] border-b border-gray-500 overflow-x-auto scrollbar-hide">
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
          className="px-2 py-1 border-2 border-b-0 cursor-pointer bg-[#a0a0a0] border-t-gray-300 border-l-gray-300 border-r-gray-600 active:bg-[#c0c0c0] active:border-t-white active:border-l-white active:border-r-gray-800 text-gray-600 flex items-center justify-center min-w-[28px] hover:text-black"
          title="New Tab"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>

      {/* Browser Toolbar - Netscape/IE style */}
      <div className="flex items-center py-0.5 px-1 space-x-0.5 border-b-2 border-b-gray-700 border-t border-t-white bg-[#c0c0c0]">
        {/* Back button */}
        <button
          onClick={goBack}
          disabled={activeTab.historyIndex === 0}
          title="Back"
          className="flex items-center justify-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white disabled:opacity-40 text-black text-[10px] font-bold"
        >
          <ArrowLeft size={13} /><span>Back</span>
        </button>
        {/* Forward button */}
        <button
          onClick={goForward}
          disabled={activeTab.historyIndex === activeTab.history.length - 1}
          title="Forward"
          className="flex items-center justify-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white disabled:opacity-40 text-black text-[10px] font-bold"
        >
          <ArrowRight size={13} /><span>Forward</span>
        </button>
        {/* Stop/Refresh button */}
        <button
          onClick={() => updateActiveTab({ isLoading: false })}
          title="Stop/Refresh"
          className="flex items-center justify-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white text-black text-[10px] font-bold"
        >
          <RefreshCw size={13} className={activeTab.isLoading ? 'animate-spin text-blue-900' : ''} />
          <span>Reload</span>
        </button>
        {/* Home button */}
        <button
          onClick={() => navigate(homepageInput)}
          title="Home"
          className="flex items-center justify-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white text-black text-[10px] font-bold"
        >
          <Home size={13} /><span>Home</span>
        </button>

        <div className="w-px h-5 bg-gray-600 mx-1" />

        <button
          onClick={() => setIsInternetOptionsOpen(true)}
          title="Internet Options"
          className="flex items-center justify-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white text-black text-[10px] font-bold"
        >
          <Monitor size={13} className="text-gray-700" /><span>Options</span>
        </button>

        <button
          onClick={() => setIsViewSourceOpen(true)}
          title="View HTML Source"
          className="flex items-center justify-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white text-black text-[10px] font-bold"
        >
          <FileDown size={13} className="text-gray-700" /><span>Source</span>
        </button>

        <button
          onClick={startPrintJob}
          title="Print Page"
          className="flex items-center justify-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white text-black text-[10px] font-bold"
        >
          <span className="font-serif font-black px-1 leading-none text-xs">P</span><span>Print</span>
        </button>

        <button
          onClick={() => setIsDownloadManagerOpen(true)}
          title="Downloads Manager"
          className="flex items-center justify-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white text-black text-[10px] font-bold"
        >
          <HardDrive size={13} className="text-gray-700" /><span>Downloads</span>
        </button>

        <div className="w-px h-5 bg-gray-600 mx-1" />

        {/* Address bar */}
        <form onSubmit={handleAddressSubmit} className="flex-1 flex items-center space-x-1">
          <span className="text-[10px] font-bold whitespace-nowrap hidden sm:block">Address</span>
          <input
            type="text"
            value={activeTab.addressBar}
            onChange={e => updateActiveTab({ addressBar: e.target.value })}
            className="flex-1 border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white px-1 py-px text-xs bg-white font-mono"
            placeholder="http://www.vesperasystems.com"
          />
          <button
            type="submit"
            className="px-2 py-px bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white text-xs font-bold mr-1"
          >
            Go
          </button>
        </form>

        {/* The Classic Spinning Logo Indicator */}
        <div className="w-7 h-7 bg-black border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white flex items-center justify-center shrink-0">
          <Globe 
            size={20} 
            className={`text-blue-500 ${activeTab.isLoading ? 'animate-spin' : ''}`} 
          />
        </div>
      </div>
      
      {/* Bookmarks Toolbar */}
      <div className="flex items-center py-0.5 px-2 space-x-2 border-b-2 border-b-gray-700 bg-[#c0c0c0] text-[10px] font-bold overflow-x-auto whitespace-nowrap scrollbar-hide">
        <span className="text-gray-700 mr-1 select-none flex items-center">Bookmarks:</span>
        <button 
          onClick={() => {
            let defaultName = "New Bookmark";
            if (activeTab.url === 'home') defaultName = "Vespera Systems";
            else if (activeTab.url.startsWith('mbn:')) defaultName = "Meridian Broadcasting";
            else if (activeTab.url.startsWith('vespera:news')) defaultName = "AETHERIS News";
            else defaultName = activeTab.addressBar.replace('http://', '').split('/')[0];
            
            setBookmarkNameInput(defaultName);
            setIsBookmarkModalOpen(true);
          }} 
          className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-[#a0a0a0] active:bg-[#808080] border border-transparent hover:border-gray-500 text-green-800"
          title="Bookmark the current page"
        >
          <Plus size={10} className="text-green-800" /> Add Page
        </button>
        <div className="w-[1px] h-3 bg-gray-500 shrink-0"></div>
        {bookmarks.map((b: any, i: number) => (
          <button 
             key={i} 
             onClick={() => navigate(b.url)} 
             className="flex items-center gap-1 pl-1.5 pr-0.5 py-0.5 hover:bg-[#a0a0a0] active:bg-[#808080] border border-transparent hover:border-gray-500 group relative"
          >
            <Globe size={10} className="text-blue-800" /> 
            <span className="mr-1">{b.name}</span>
            <div 
              onClick={(e) => handleRemoveBookmark(e, i)}
              className="hidden group-hover:flex items-center justify-center w-3 h-3 hover:bg-red-500 hover:text-white rounded-sm ml-1"
              title="Remove Bookmark"
            >
              <X size={8} />
            </div>
          </button>
        ))}
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
      <div className="flex-1 bg-white border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white m-2 overflow-hidden relative flex flex-col">
        {tabs.map(tab => (
          <div 
            key={tab.id} 
            className="absolute inset-0 flex flex-col overflow-auto bg-white" 
            style={{ display: tab.id === activeTabId ? 'flex' : 'none' }}
          >
            {tab.url === 'vespera:news' ? (
              <AetherisNewsNetwork />
            ) : tab.url === 'vespera:x-arch' ? (
              <XArchiveSite />
            ) : tab.url === 'vespera:vmail' ? (
              <VMail onClose={() => navigate('home')} />
            ) : tab.url === 'atlanticwaves:home' ? (
              <AtlanticWavesSite 
                onDownload={(filename: string, source: string) => {
                  if (onDownload) onDownload(filename, source);
                }} 
              />
            ) : tab.url === 'mbn:home' ? (
              <MeridianBroadcastingSite />
            ) : (tab.url === 'home' || tab.url.startsWith('vespera:')) ? (
              <VesperaSystemsSite 
                url={tab.url}
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
                  src={tab.url} 
                  onLoad={() => {
                    if (tab.id === activeTabId) {
                      updateActiveTab({ isLoading: false });
                    } else {
                      setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, isLoading: false } : t));
                    }
                  }}
                  className="absolute inset-0 w-full h-full border-none bg-white"
                  title="Web Browser"
                />
            )}
          </div>
        ))}
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
      
      {/* ── Add Bookmark Dialog ── */}
      {isBookmarkModalOpen && (
        <div className="absolute inset-0 z-[300] flex items-center justify-center bg-transparent">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1 w-[340px] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] flex flex-col font-sans text-black">
            <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center select-none font-bold text-xs mb-2">
              <span>Add Bookmark</span>
              <button 
                onClick={() => setIsBookmarkModalOpen(false)}
                className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-4 h-4 flex items-center justify-center text-black active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
              >X</button>
            </div>
            <form onSubmit={handleAddBookmark} className="p-2 flex flex-col gap-3 text-xs">
               <div className="flex flex-col gap-1">
                 <label className="font-bold flex items-center gap-2">Name:</label>
                 <input 
                   autoFocus 
                   value={bookmarkNameInput} 
                   onChange={e => setBookmarkNameInput(e.target.value)} 
                   className="w-full border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1" 
                 />
               </div>
               <div className="flex flex-col gap-1">
                 <label className="font-bold">Location:</label>
                 <input 
                   disabled 
                   value={activeTab.url === 'home' ? 'http://www.vesperasystems.com/index.html' : activeTab.addressBar} 
                   className="w-full bg-gray-200 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-gray-500" 
                 />
               </div>
               <div className="flex justify-end gap-2 mt-4 border-t border-gray-400 pt-3">
                 <button type="button" onClick={() => setIsBookmarkModalOpen(false)} className="px-5 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Cancel</button>
                 <button type="submit" className="px-5 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold">OK</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Internet Options Modal ── */}
      {isInternetOptionsOpen && (
        <div className="absolute inset-0 z-[300] flex items-center justify-center bg-transparent">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1 w-[400px] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] flex flex-col font-sans text-black">
            <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center select-none font-bold text-xs mb-2">
              <span>Internet Options</span>
              <button 
                onClick={() => setIsInternetOptionsOpen(false)}
                className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-4 h-4 flex items-center justify-center text-black active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
              >X</button>
            </div>
            
            {/* Tabs */}
            <div className="flex px-2 pt-2 -mb-[2px] z-10 relative text-xs">
               <div onClick={() => setInternetOptionsTab('General')} className={`px-3 py-1 cursor-pointer border-2 border-b-0 ${internetOptionsTab === 'General' ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800' : 'bg-[#a0a0a0] border-t-gray-300 border-l-gray-300 border-r-gray-600'}`}>General</div>
               <div onClick={() => setInternetOptionsTab('Security')} className={`px-3 py-1 cursor-pointer border-2 border-b-0 ${internetOptionsTab === 'Security' ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800' : 'bg-[#a0a0a0] border-t-gray-300 border-l-gray-300 border-r-gray-600'}`}>Security</div>
            </div>
            <div className="border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-4 bg-[#c0c0c0] text-xs">
               {internetOptionsTab === 'General' && (
                 <div className="flex flex-col gap-4">
                   <div className="border border-gray-400 p-3 pt-4 relative">
                     <span className="absolute -top-2 left-2 bg-[#c0c0c0] px-1 text-gray-800 font-bold">Home page</span>
                     <div className="flex items-start gap-3">
                       <Home size={28} className="text-gray-500 shrink-0 mt-1" />
                       <div className="flex flex-col flex-1 gap-2">
                         <p className="text-gray-700">You can change which page to use for your home page.</p>
                         <div className="flex items-center gap-2">
                           <label>Address:</label>
                           <input value={homepageInput} onChange={e => setHomepageInput(e.target.value)} className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1" />
                         </div>
                         <div className="flex gap-2">
                           <button onClick={() => setHomepageInput(activeTab.url === 'home' ? 'http://www.vesperasystems.com/index.html' : activeTab.addressBar)} className="px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Use Current</button>
                           <button onClick={() => setHomepageInput('http://www.vesperasystems.com/index.html')} className="px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Use Default</button>
                         </div>
                       </div>
                     </div>
                   </div>
                   <div className="border border-gray-400 p-3 pt-4 relative">
                     <span className="absolute -top-2 left-2 bg-[#c0c0c0] px-1 text-gray-800 font-bold">Temporary Internet files</span>
                     <p className="mb-2 text-gray-700">Pages you view on the Internet are stored in a special folder for quick viewing later.</p>
                     <div className="flex gap-2 justify-center">
                       <button onClick={() => {
                         localStorage.removeItem('navigator_bookmarks');
                         setBookmarks(DEFAULT_BOOKMARKS);
                         alert('Cache and history wiped locally.');
                       }} className="px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Delete Files...</button>
                     </div>
                   </div>
                 </div>
               )}
               {internetOptionsTab === 'Security' && (
                 <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-center p-4">
                     <ShieldCheck size={48} className="text-[#000080]" />
                   </div>
                   <p>Select a Web content zone to specify its security settings.</p>
                   <div className="border border-gray-400 p-2">
                     <label className="flex items-center gap-2 mb-2"><input type="radio" name="sec" checked readOnly/> High (most secure)</label>
                     <label className="flex items-center gap-2 mb-2"><input type="radio" name="sec" disabled/> Medium (safe browsing)</label>
                     <label className="flex items-center gap-2"><input type="radio" name="sec" disabled/> Custom</label>
                   </div>
                   <p className="text-gray-500 italic mt-2">ActiveX controls and unsanctioned plugins are blocked by default on Vespera terminals.</p>
                 </div>
               )}
            </div>
            
            <div className="flex justify-end gap-2 mt-2 p-1 text-xs">
              <button onClick={() => {
                localStorage.setItem('navigator_homepage', homepageInput);
                setIsInternetOptionsOpen(false);
              }} className="px-5 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold">OK</button>
              <button onClick={() => setIsInternetOptionsOpen(false)} className="px-5 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Cancel</button>
              <button disabled className="px-5 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 opacity-50">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Source Modal ── */}
      {isViewSourceOpen && (
        <div className="absolute inset-4 z-[300] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 flex flex-col shadow-[4px_4px_10px_rgba(0,0,0,0.5)]">
           <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center select-none font-bold text-xs">
              <div className="flex items-center gap-2">
                <FileDown size={14}/>
                <span>Source - {activeTab.addressBar}</span>
              </div>
              <button 
                onClick={() => setIsViewSourceOpen(false)}
                className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-4 h-4 flex items-center justify-center text-black active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
              >X</button>
            </div>
            <div className="flex bg-[#c0c0c0] text-xs px-2 py-1 gap-4 border-b border-gray-400">
               <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">File</span>
               <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Edit</span>
               <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Search</span>
               <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">Help</span>
            </div>
            <div className="flex-1 bg-white p-2">
               <textarea 
                 readOnly 
                 value={getSimulatedSourceCode(activeTab.url)} 
                 className="w-full h-full resize-none outline-none font-mono text-xs whitespace-pre text-black border-none"
               />
            </div>
        </div>
      )}

      {/* ── Print Spooler Modal ── */}
      {isPrintSpoolerOpen && (
        <div className="absolute inset-0 z-[400] flex items-center justify-center bg-transparent">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1 w-[350px] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] flex flex-col font-sans text-black select-none">
            <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center font-bold text-xs mb-2">
              <span>Print Spooler</span>
            </div>
            <div className="p-4 flex flex-col gap-4 text-xs text-center border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white m-1 shadow-inner">
               {!printError ? (
                 <>
                   <div className="flex justify-center mb-2 animate-bounce mt-4"><span className="bg-gray-200 border-2 border-gray-800 p-2">🖨️</span></div>
                   <p className="font-bold text-base">Printing Document to LPT1...</p>
                   <p className="text-gray-600 mb-2">{activeTab.addressBar}</p>
                   <div className="w-full h-6 bg-[#c0c0c0] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-[2px] flex">
                     {Array.from({ length: 20 }).map((_, i) => (
                       <div key={i} className={`h-full w-[4.5%] mx-[0.25%] ${i < (printProgress / 5) ? 'bg-[#000080]' : 'bg-transparent'}`} />
                     ))}
                   </div>
                   <p>{Math.round(printProgress)}% completed.</p>
                 </>
               ) : (
                 <>
                   <div className="flex justify-center mb-2 mt-4"><AlertTriangle size={36} className="text-red-600" /></div>
                   <p className="font-bold text-red-600 text-sm">{printError}</p>
                   <p className="mt-2 mb-4">Please check paper tray and printer connection.</p>
                   <button onClick={() => setIsPrintSpoolerOpen(false)} className="mb-2 mx-auto px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold">Close</button>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* ── Downloads Manager Modal ── */}
      {isDownloadManagerOpen && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-transparent mt-12 mb-12 ml-12">
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[2px_2px_10px_rgba(0,0,0,0.5)] w-[500px] flex flex-col font-sans text-black select-none">
              <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <HardDrive size={14} />
                  <span className="font-bold text-xs tracking-wide">Download Manager</span>
                </div>
                <button onClick={() => setIsDownloadManagerOpen(false)} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-4 h-4 flex items-center justify-center text-black font-bold text-xs active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
                  X
                </button>
              </div>
              <div className="p-2 flex flex-col">
                <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white h-[200px] overflow-y-auto mb-2">
                  {downloads.length === 0 ? (
                    <div className="text-gray-500 italic p-2 text-xs">No active or past downloads.</div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="bg-[#c0c0c0] border-b-2 border-gray-800 text-left sticky top-0 shadow-sm z-10 text-[10px]">
                         <tr>
                            <th className="px-2 py-0.5 border-r border-gray-400 font-normal">File Name</th>
                            <th className="px-2 py-0.5 border-r border-gray-400 font-normal w-16">Size</th>
                            <th className="px-2 py-0.5 border-r border-gray-400 font-normal w-16">Status</th>
                            <th className="px-2 py-0.5 font-normal w-36">Progress</th>
                         </tr>
                      </thead>
                      <tbody>
                        {downloads.map(d => (
                           <tr key={d.id} className="border-b border-dashed border-gray-300 hover:bg-[#000080] hover:text-white group">
                              <td className="px-2 py-1.5 truncate max-w-[150px] font-bold group-hover:text-white">{d.filename}</td>
                              <td className="px-2 py-1.5 text-gray-600 group-hover:text-gray-300">{d.size}</td>
                              <td className="px-2 py-1.5">
                                {d.phase === 'downloading' ? <span className="text-blue-600 font-bold group-hover:text-blue-300 animate-pulse">Running</span> :
                                 d.phase === 'error' ? <span className="text-red-600 font-bold group-hover:text-red-300">Errors</span> :
                                 <span className="text-green-600 font-bold group-hover:text-green-300">Complete</span>}
                              </td>
                              <td className="px-2 py-1.5">
                                <div className="w-full h-3 bg-white border border-gray-400 flex">
                                  <div className={`h-full ${d.phase === 'error' ? 'bg-red-500' : 'bg-[#000080]'}`} style={{ width: `${Math.round(d.progress)}%` }}></div>
                                </div>
                              </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setDownloads([])} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-4 py-1 text-xs active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
                    Clear List
                  </button>
                  <button onClick={() => setIsDownloadManagerOpen(false)} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-6 py-1 text-xs active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold">
                    Close
                  </button>
                </div>
              </div>
            </div>
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
