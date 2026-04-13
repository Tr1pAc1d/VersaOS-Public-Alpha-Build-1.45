import React, { useState, useEffect } from 'react';
import { Monitor, Cpu, User, Package, Settings, ArrowLeft, HardDrive, Trash2, AlertCircle, Menu, ChevronRight, ChevronDown, FolderOpen, ArrowUp, ArrowDown, Plus, RotateCcw, Minus, Globe, Key, Shield, Download, CheckCircle, Sparkles, Loader, Volume2, MessageSquare, MousePointer2 } from 'lucide-react';
import { DEFAULT_WORKSPACE_MENU } from '../hooks/useVFS';
import { APP_DICTIONARY } from '../utils/appDictionary';
import { RETRO_ICONS } from '../utils/retroIcons';
import { SystemProperties } from './SystemProperties';
import { PLUS_THEMES, AVAILABLE_UPDATES, type SystemUpdate } from '../utils/plusThemes';
import { ScreensaverPreview, SCREENSAVER_OPTIONS, type ScreensaverType } from './Screensavers';

// ── Panel items definition ────────────────────────────────────────────────────
interface PanelItem {
  id: string;
  label: string;
  description: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  iconColor: string;
}

const PANEL_ITEMS: PanelItem[] = [
  {
    id: 'display',
    label: 'Display',
    description: 'Display: Configure your screen resolution and desktop colors.',
    Icon: Monitor,
    iconColor: 'text-[#008080]',
  },
  {
    id: 'system',
    label: 'System',
    description: 'System: View hardware information and manage device resources.',
    Icon: Cpu,
    iconColor: 'text-[#000080]',
  },
  {
    id: 'users',
    label: 'Users',
    description: 'Users: Manage user accounts and access permissions.',
    Icon: User,
    iconColor: 'text-[#4a4a8a]',
  },
  {
    id: 'addremove',
    label: 'Add/Remove\nPrograms',
    description: 'Add/Remove Programs: Install or remove software from your Vespera system.',
    Icon: Package,
    iconColor: 'text-[#7a4a00]',
  },
  {
    id: 'taskbar',
    label: 'Task Menu',
    description: 'Task Menu: Customize the appearance and behavior of the Task Menu.',
    Icon: Menu,
    iconColor: 'text-[#4a4a8a]',
  },
  {
    id: 'vespera_update',
    label: 'Vespera\nUpdate',
    description: 'Vespera Update: Check for and install system updates from VesperaNET.',
    Icon: Download,
    iconColor: 'text-[#006400]',
  },
  {
    id: 'agent_v',
    label: 'Agent V',
    description: 'Agent V: Personalize your Vespera desktop assistant.',
    Icon: MessageSquare,
    iconColor: 'text-[#000080]',
  },
];

const TASKBAR_THEMES = [
  { id: 'motif', name: 'Motif Blue (Classic)', hex: '#537096' },
  { id: 'win95', name: 'Standard Gray', hex: '#c0c0c0' },
  { id: 'dark', name: 'Terminal Dark Mode', hex: '#2d2d2d' },
  { id: 'hacker', name: 'Hacker Green', hex: '#003300' },
  { id: 'ocean', name: 'Deep Ocean', hex: '#004c66' },
  { id: 'sunset', name: 'Cyber Sunset', hex: '#8a2be2' },
  { id: 'gold', name: 'Executive Gold', hex: '#b8860b' },
  { id: 'rose', name: 'Rose Dust', hex: '#a86f7f' },
  { id: 'monochrome', name: 'Monochrome', hex: '#ececec' },
  { id: 'midnight', name: 'Midnight Violet', hex: '#191970' },
  { id: 'forest', name: 'Pine Forest', hex: '#228b22' },
  { id: 'crimson', name: 'Crimson Alert', hex: '#8b0000' },
  { id: 'teal', name: 'Windows 95 Teal', hex: '#008080' },
];

const WALLPAPERS = [
  { id: 'none',        name: '(None)',           url: '' },
  { id: 'bliss_98',   name: 'Retro Bliss 98',   url: '/wallpapers/bliss_98.png' },
  { id: 'starry',     name: 'Starry Pixel Night',url: '/wallpapers/starry_night.png' },
  { id: 'country_98', name: 'Country Hills 98',  url: '/wallpapers/country_98.png' },
  { id: 'sunset',     name: 'Tropical Sunset',   url: '/wallpapers/sunset_coast.png' },
  { id: 'abstract',   name: 'Abstract Color',   url: '/wallpapers/Abstract_Color.png' },
  { id: 'jungle',     name: 'Jungle Night',     url: '/wallpapers/Jungle_Night.png' },
  { id: 'neon',       name: 'Neon Sun',         url: '/wallpapers/Neon_Sun.png' },
  { id: 'tech',       name: 'Tech Storm',       url: '/wallpapers/Tech_Storm.png' },
  { id: 'tiles',      name: 'Tiles Abyss',      url: '/wallpapers/Tiles_Abyss.png' },
  { id: 'wow',        name: 'Wow Factor',       url: '/wallpapers/Wow_Factor.png' },
];

const COLORS = [
  { id: 'teal', name: 'Teal', hex: '#008080' },
  { id: 'vespera_navy', name: 'Vespera Navy', hex: '#000080' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'terminal_green', name: 'Terminal Green', hex: '#004000' },
  { id: 'neutral_grey', name: 'Neutral Grey', hex: '#5f8787' },
];

// ── Main Component ────────────────────────────────────────────────────────────
export const ControlPanel = ({ vfs, onClose, windows, onLaunchUninstall, screenMode, setScreenMode, initialPanel, currentUser, neuralBridgeActive }: any) => {
  const isMaximized = windows?.find((w: any) => w.id === 'control_panel')?.isMaximized;
  const [activePanel, setActivePanel] = useState<string | null>(initialPanel || null);
  const [hoverDesc, setHoverDesc] = useState<string>('');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [uninstallTarget, setUninstallTarget] = useState<{ id: string; name: string } | null>(null);

  // Display sub-panel state
  const currentRes = vfs.displaySettings?.resolution || '1024x768';
  const [selectedRes, setSelectedRes] = useState(currentRes);
  const [selectedWallpaper, setSelectedWallpaper] = useState(vfs.displaySettings?.wallpaper || '');
  const [selectedColor, setSelectedColor] = useState(vfs.displaySettings?.backgroundColor || '#5f8787');
  const tTheme = vfs.displaySettings?.taskbarTheme || 'motif';
  const defaultBg = tTheme === 'dark' ? '#000000' : '#c0c0c0';
  const defaultText = tTheme === 'dark' ? '#22c55e' : '#000000';

  const [selectedTaskbarTheme, setSelectedTaskbarTheme] = useState(vfs.displaySettings?.taskbarTheme || 'motif');
  const [selectedTaskbarShowClock, setSelectedTaskbarShowClock] = useState(vfs.displaySettings?.taskbarShowClock !== false);
  const [clockBgColor, setClockBgColor] = useState(vfs.displaySettings?.clockBgColor || defaultBg);
  const [clockTextColor, setClockTextColor] = useState(vfs.displaySettings?.clockTextColor || defaultText);
  const [clockFont, setClockFont] = useState(vfs.displaySettings?.clockFont || 'font-mono');
  const [clockFormat, setClockFormat] = useState(vfs.displaySettings?.clockFormat || '24h');
  const [selectedPinnedApps, setSelectedPinnedApps] = useState<string[]>(vfs.displaySettings?.pinnedApps || ['files', 'browser', 'workbench', 'analyzer', 'chat', 'control_panel', 'xtype']);
  const [waveBarEnabled, setWaveBarEnabled] = useState(vfs.displaySettings?.waveBarEnabled !== false);
  const [waveBarStyle, setWaveBarStyle] = useState(vfs.displaySettings?.waveBarStyle || 'classic');
  const [waveBarColor, setWaveBarColor] = useState(vfs.displaySettings?.waveBarColor || '#34d399');
  const [waveBarBarCount, setWaveBarBarCount] = useState(
    typeof vfs.displaySettings?.waveBarBarCount === 'number' ? vfs.displaySettings.waveBarBarCount : 5
  );
  const [waveBarSpeed, setWaveBarSpeed] = useState(vfs.displaySettings?.waveBarSpeed || 'normal');
  const [waveBarUseAlbumArt, setWaveBarUseAlbumArt] = useState(vfs.displaySettings?.waveBarUseAlbumArt === true);
  
  // Screensaver state
  const [selectedScreensaverType, setSelectedScreensaverType] = useState<ScreensaverType>(vfs.displaySettings?.screensaverType || 'none');
  const [selectedScreensaverTimeout, setSelectedScreensaverTimeout] = useState<number>(vfs.displaySettings?.screensaverTimeout || 5);

  const [displayTab, setDisplayTab] = useState<'Background' | 'Screen Saver' | 'Settings' | 'Monitor' | 'Cursors' | 'Themes'>('Background');
  const [taskbarTab, setTaskbarTab] = useState<'Appearance' | 'Clock' | 'Shortcuts' | 'Workspace Menu' | 'Wave bar'>('Appearance');
  
  const [confirming, setConfirming] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [previousRes, setPreviousRes] = useState(currentRes);
  const [previousScreenMode, setPreviousScreenMode] = useState(screenMode);

  // Cursor settings
  const [selectedCursorStyle, setSelectedCursorStyle] = useState(vfs.displaySettings?.cursorStyle || 'default');

  // Plus! Theme state
  const [selectedPlusTheme, setSelectedPlusTheme] = useState(vfs.displaySettings?.plusTheme || 'standard');

  // Agent V internal state
  const [agentVEnabled, setAgentVEnabled] = useState(vfs.displaySettings?.agentVEnabled !== false);
  const [agentVSkin, setAgentVSkin] = useState(vfs.displaySettings?.agentVSkin || 'classic');
  const [agentVSpeak, setAgentVSpeak] = useState(vfs.displaySettings?.agentVSpeak === true);

  // Vespera Update state
  const [installedUpdates, setInstalledUpdates] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('vespera_installed_updates') || '[]'); } catch { return []; }
  });
  const [updateScanPhase, setUpdateScanPhase] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [updateScanProgress, setUpdateScanProgress] = useState(0);
  const [updateScanStatus, setUpdateScanStatus] = useState('');
  const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);
  const [updateInstallPhase, setUpdateInstallPhase] = useState<'idle' | 'eula' | 'installing' | 'done'>('idle');
  const [updateInstallProgress, setUpdateInstallProgress] = useState(0);
  const [updateInstallStatus, setUpdateInstallStatus] = useState('');
  const [updateInstallTarget, setUpdateInstallTarget] = useState<SystemUpdate | null>(null);

  useEffect(() => {
    if (initialPanel) setActivePanel(initialPanel);
  }, [initialPanel]);

  // Sync state when returning to hub and vfs changes
  useEffect(() => {
    if (!activePanel) {
      setSelectedRes(vfs.displaySettings?.resolution || '1024x768');
      setSelectedWallpaper(vfs.displaySettings?.wallpaper || '');
      setSelectedColor(vfs.displaySettings?.backgroundColor || '#5f8787');
      setSelectedTaskbarTheme(vfs.displaySettings?.taskbarTheme || 'motif');
      setSelectedTaskbarShowClock(vfs.displaySettings?.taskbarShowClock !== false);
      setClockBgColor(vfs.displaySettings?.clockBgColor || defaultBg);
      setClockTextColor(vfs.displaySettings?.clockTextColor || defaultText);
      setClockFont(vfs.displaySettings?.clockFont || 'font-mono');
      setClockFormat(vfs.displaySettings?.clockFormat || '24h');
      setSelectedPinnedApps(vfs.displaySettings?.pinnedApps || ['files', 'browser', 'workbench', 'analyzer', 'chat', 'control_panel', 'xtype']);
      setWaveBarEnabled(vfs.displaySettings?.waveBarEnabled !== false);
      setWaveBarStyle(vfs.displaySettings?.waveBarStyle || 'classic');
      setWaveBarColor(vfs.displaySettings?.waveBarColor || '#34d399');
      setWaveBarBarCount(typeof vfs.displaySettings?.waveBarBarCount === 'number' ? vfs.displaySettings.waveBarBarCount : 5);
      setWaveBarSpeed(vfs.displaySettings?.waveBarSpeed || 'normal');
      setWaveBarUseAlbumArt(vfs.displaySettings?.waveBarUseAlbumArt === true);
      setSelectedCursorStyle(vfs.displaySettings?.cursorStyle || 'default');
      setAgentVEnabled(vfs.displaySettings?.agentVEnabled !== false);
      setAgentVSkin(vfs.displaySettings?.agentVSkin || 'classic');
      setAgentVSpeak(vfs.displaySettings?.agentVSpeak === true);
      setSelectedScreensaverType(vfs.displaySettings?.screensaverType || 'none');
      setSelectedScreensaverTimeout(vfs.displaySettings?.screensaverTimeout || 5);
    }
  }, [activePanel, vfs.displaySettings]);

  // Confirmation countdown timer
  useEffect(() => {
    let timer: any;
    if (confirming) {
      timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            handleCancel();
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [confirming]);

  const handleApply = () => {
    let applyWallpaper = selectedWallpaper;
    let applyBgColor = selectedColor;
    let applyTaskbarTheme = selectedTaskbarTheme;
    let applyClockBg = clockBgColor;
    let applyClockText = clockTextColor;
    let applyCursor = selectedCursorStyle;

    // Handle deep theme dispatch
    if (selectedPlusTheme !== vfs.displaySettings?.plusTheme) {
      if (selectedPlusTheme !== 'standard' && PLUS_THEMES[selectedPlusTheme]) {
        const p = PLUS_THEMES[selectedPlusTheme];
        if (p.defaultWallpaper !== undefined) applyWallpaper = p.defaultWallpaper;
        if (p.defaultBackgroundColor !== undefined) applyBgColor = p.defaultBackgroundColor;
        if (p.defaultTaskbarTheme !== undefined) applyTaskbarTheme = p.defaultTaskbarTheme;
        if (p.defaultClockBgColor !== undefined) applyClockBg = p.defaultClockBgColor;
        if (p.defaultClockColor !== undefined) applyClockText = p.defaultClockColor;
        
        // Extract cursor ID from the theme's cursorClass (e.g. 'plus-cursor-nature' → 'nature')
        applyCursor = p.cursorClass ? p.cursorClass.replace('plus-cursor-', '') : 'default';
        setSelectedCursorStyle(applyCursor);
      } else if (selectedPlusTheme === 'standard') {
        applyCursor = 'default';
        setSelectedCursorStyle(applyCursor);
      }

      setSelectedWallpaper(applyWallpaper);
      setSelectedColor(applyBgColor);
      setSelectedTaskbarTheme(applyTaskbarTheme);
      setClockBgColor(applyClockBg);
      setClockTextColor(applyClockText);
    }

    if (vfs.updateWallpaper) vfs.updateWallpaper(applyWallpaper);
    if (vfs.updateBackgroundColor) vfs.updateBackgroundColor(applyBgColor);
    if (vfs.updateTaskbarTheme) vfs.updateTaskbarTheme(applyTaskbarTheme);
    if (vfs.updateTaskbarClock) vfs.updateTaskbarClock(selectedTaskbarShowClock);
    if (vfs.updateClockSettings) vfs.updateClockSettings({ clockBgColor: applyClockBg, clockTextColor: applyClockText, clockFont, clockFormat });
    if (vfs.updatePinnedApps) vfs.updatePinnedApps(selectedPinnedApps);
    if (vfs.updatePlusTheme) vfs.updatePlusTheme(selectedPlusTheme);
    if (vfs.updateCursorStyle) vfs.updateCursorStyle(applyCursor);
    if (vfs.updateWaveBarSettings) {
      vfs.updateWaveBarSettings({
        waveBarEnabled,
        waveBarStyle,
        waveBarColor,
        waveBarBarCount,
        waveBarSpeed,
        waveBarUseAlbumArt,
      });
    }

    if (vfs.updateScreensaverSettings) {
      vfs.updateScreensaverSettings({
        screensaverType: selectedScreensaverType,
        screensaverTimeout: selectedScreensaverTimeout,
      });
    }

    if (selectedRes !== (vfs.displaySettings?.resolution || '1024x768')) {
      setPreviousRes(vfs.displaySettings?.resolution || '1024x768');
      setPreviousScreenMode(screenMode);
      vfs.updateResolution(selectedRes);
      if (selectedRes === 'Widescreen' || selectedRes === 'Ultrawide') {
        setScreenMode('Full');
      } else {
        setScreenMode('Square');
      }
      setConfirming(true);
      setCountdown(15);
    }
  };

  const handleConfirm = () => setConfirming(false);

  const handleCancel = () => {
    vfs.updateResolution(previousRes);
    setSelectedRes(previousRes);
    setScreenMode(previousScreenMode);
    setConfirming(false);
  };

  const isApplyEnabled = (
    selectedRes !== (vfs.displaySettings?.resolution || '1024x768') ||
    selectedWallpaper !== (vfs.displaySettings?.wallpaper || '') ||
    selectedColor !== (vfs.displaySettings?.backgroundColor || '#5f8787') ||
    selectedTaskbarTheme !== (vfs.displaySettings?.taskbarTheme || 'motif') ||
    selectedTaskbarShowClock !== (vfs.displaySettings?.taskbarShowClock !== false) ||
    clockBgColor !== (vfs.displaySettings?.clockBgColor || defaultBg) ||
    clockTextColor !== (vfs.displaySettings?.clockTextColor || defaultText) ||
    clockFont !== (vfs.displaySettings?.clockFont || 'font-mono') ||
    clockFormat !== (vfs.displaySettings?.clockFormat || '24h') ||
    JSON.stringify(selectedPinnedApps) !== JSON.stringify(vfs.displaySettings?.pinnedApps || ['files', 'browser', 'workbench', 'analyzer', 'chat', 'control_panel', 'xtype']) ||
    waveBarEnabled !== (vfs.displaySettings?.waveBarEnabled !== false) ||
    waveBarStyle !== (vfs.displaySettings?.waveBarStyle || 'classic') ||
    waveBarColor !== (vfs.displaySettings?.waveBarColor || '#34d399') ||
    waveBarBarCount !== (typeof vfs.displaySettings?.waveBarBarCount === 'number' ? vfs.displaySettings.waveBarBarCount : 5) ||
    waveBarSpeed !== (vfs.displaySettings?.waveBarSpeed || 'normal') ||
    waveBarUseAlbumArt !== (vfs.displaySettings?.waveBarUseAlbumArt === true) ||
    selectedPlusTheme !== (vfs.displaySettings?.plusTheme || 'standard') ||
    selectedCursorStyle !== (vfs.displaySettings?.cursorStyle || 'default') ||
    agentVEnabled !== (vfs.displaySettings?.agentVEnabled !== false) ||
    agentVSkin !== (vfs.displaySettings?.agentVSkin || 'classic') ||
    agentVSpeak !== (vfs.displaySettings?.agentVSpeak === true) ||
    selectedScreensaverType !== (vfs.displaySettings?.screensaverType || 'none') ||
    selectedScreensaverTimeout !== (vfs.displaySettings?.screensaverTimeout || 5)
  ) && !confirming;

  // ── Hub view ─────────────────────────────────────────────────────────────────
  const renderHub = () => (
    <div className="flex h-full">
      {/* Left description pane */}
      <div className="w-36 shrink-0 bg-[#c0c0c0] border-r-2 border-r-gray-500 p-3 flex flex-col gap-2">
        <div className="bg-[#000080] text-white text-[10px] font-bold px-1 py-0.5 text-center tracking-wide">
          Control Panel
        </div>
        <p className="text-[10px] leading-tight text-gray-800 mt-1">
          Use these settings to customize your Vespera System.
        </p>
        <div className="mt-auto border-t border-gray-500 pt-2">
          <p className="text-[9px] text-gray-600 italic leading-tight">
            Vespera OS 1.0.4<br />© 1995 Vespera Systems
          </p>
        </div>
      </div>

      {/* Icon grid */}
      <div className="flex-1 flex flex-col border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white m-2 bg-white overflow-auto">
        <div className="flex flex-wrap gap-1 p-3">
          {PANEL_ITEMS.map((item) => (
            <button
              key={item.id}
              onMouseEnter={() => setHoverDesc(item.description)}
              onMouseLeave={() => setHoverDesc('')}
              onDoubleClick={() => setActivePanel(item.id)}
              onClick={() => setHoverDesc(item.description)}
              className="flex flex-col items-center justify-start w-20 h-20 p-1 gap-1 hover:bg-[#000080] hover:text-white group rounded-none cursor-default select-none"
              title={item.description}
            >
              <item.Icon
                size={32}
                className={`mt-1 ${item.iconColor} group-hover:text-white`}
              />
              <span className="text-[10px] font-bold text-center leading-tight whitespace-pre-line group-hover:text-white">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Display sub-panel ─────────────────────────────────────────────────────────
  const renderDisplay = () => (
    <div className="flex flex-col h-full p-3 gap-2">
      {/* Back bar */}
      <div className="flex items-center gap-2 border-b border-gray-500 pb-2">
        <button
          onClick={() => setActivePanel(null)}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
        >
          <ArrowLeft size={12} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Monitor size={20} className="text-[#008080]" />
          <span className="font-bold text-sm tracking-wide">Display Properties</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-[2px] border-b-2 border-white mt-1 relative z-10 px-1 overflow-x-auto">
        {(['Background', 'Screen Saver', 'Settings', 'Monitor', 'Cursors', ...(installedUpdates.includes('plus_pack') ? ['Themes' as const] : [])] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setDisplayTab(tab)}
            className={`px-2 py-1 text-xs font-bold border-2 border-b-0 rounded-t-sm whitespace-nowrap ${
              displayTab === tab 
                ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800 pb-2 -mb-0.5 z-20' 
                : 'bg-gray-300 border-t-white border-l-white border-r-gray-800 mt-1 cursor-pointer'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-4 bg-[#c0c0c0] flex flex-col gap-4 relative z-0 -mt-2 overflow-y-auto min-h-0">
        
        {displayTab === 'Background' && (
          <>
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400">
              <Monitor size={36} className="text-[#008080]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">Desktop Background</h2>
                <p className="text-xs text-gray-700 mt-1">Select a background pattern or color.</p>
              </div>
            </div>
            
            <div className="flex gap-4 min-h-0">
              <div className={`flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 ${isMaximized ? 'h-96' : 'h-32'} transition-all bg-white overflow-y-auto`}>
                <p className="font-bold text-xs mb-1">Wallpaper</p>
                {WALLPAPERS.map(wp => (
                  <div 
                    key={wp.id} 
                    onClick={() => setSelectedWallpaper(wp.url)}
                    className={`px-2 py-1 text-xs cursor-default ${selectedWallpaper === wp.url ? 'bg-[#000080] text-white' : 'hover:bg-[#008080] hover:text-white'}`}
                  >
                    {wp.name}
                  </div>
                ))}
              </div>
              
              <div className={`flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 ${isMaximized ? 'h-96' : 'h-32'} transition-all bg-white overflow-y-auto`}>
                <p className="font-bold text-xs mb-1">Color</p>
                {COLORS.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedColor(c.hex)}
                    className={`px-2 py-1 text-xs cursor-default flex items-center gap-2 ${selectedColor === c.hex ? 'bg-[#000080] text-white' : 'hover:bg-[#008080] hover:text-white'}`}
                  >
                    <div className="w-3 h-3 border border-gray-500" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {displayTab === 'Screen Saver' && (
          <div className="flex flex-col h-full gap-4">
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400 shrink-0">
              <Monitor size={36} className="text-[#008080]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">Screen Saver Properties</h2>
                <p className="text-xs text-gray-700 mt-1">Select a screen saver and set the activation timeout.</p>
              </div>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
              {/* Left Side: Preview Monitor */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="relative scale-[0.85] origin-top">
                  {/* Monitor Frame */}
                  <div className="w-[180px] h-[140px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-2 flex flex-col shadow-[4px_4px_0px_rgba(0,0,0,0.4)]">
                    <div className="flex-1 bg-black border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-hidden relative">
                      <ScreensaverPreview type={selectedScreensaverType} />
                    </div>
                  </div>
                  {/* Monitor Stand */}
                  <div className="w-16 h-4 mx-auto bg-[#808080] border-x-2 border-gray-600" />
                  <div className="w-24 h-4 mx-auto bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800" />
                </div>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('trigger-screensaver'))}
                  className="px-4 py-1 text-xs font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0] hover:bg-gray-100"
                >
                  Preview Full
                </button>
              </div>

              {/* Right Side: Configuration */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 bg-[#c0c0c0] flex-1 min-h-0 flex flex-col">
                  <p className="font-bold text-xs mb-1.5 shrink-0">Screen Saver:</p>
                  <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex-1 overflow-y-auto min-h-0">
                    {SCREENSAVER_OPTIONS.map(opt => (
                      <div 
                        key={opt.id}
                        onClick={() => setSelectedScreensaverType(opt.id as ScreensaverType)}
                        className={`px-2 py-1 text-xs cursor-default flex flex-col ${selectedScreensaverType === opt.id ? 'bg-[#000080] text-white' : 'hover:bg-[#008080] hover:text-white'}`}
                      >
                        <span className="font-bold underline decoration-dotted">{opt.name}</span>
                        <span className={`text-[9px] ${selectedScreensaverType === opt.id ? 'text-blue-100' : 'text-gray-500'}`}>{opt.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 bg-[#c0c0c0] shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold whitespace-nowrap">Wait:</span>
                    <input 
                      type="number" 
                      min="1" 
                      max="999"
                      value={selectedScreensaverTimeout}
                      onChange={(e) => setSelectedScreensaverTimeout(parseInt(e.target.value) || 1)}
                      className="w-14 px-1 py-0.5 text-xs border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white focus:outline-none"
                    />
                    <span className="text-xs">minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {displayTab === 'Settings' && (
          <>
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400">
              <Monitor size={36} className="text-[#008080]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">CRT Monitor Properties</h2>
                <p className="text-xs text-gray-700 mt-1">Configure screen space bounds for your display.</p>
              </div>
            </div>

            <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 bg-[#c0c0c0]">
              <p className="font-bold text-xs mb-2">Screen resolution:</p>
              <div className="flex flex-col gap-2 pl-2 overflow-y-auto h-24">
                {([
                  '640x480', 
                  '800x600', 
                  '1024x768', 
                  '1152x864', 
                  '1280x1024', 
                  '1600x1200', 
                  'Widescreen',
                  'Ultrawide'
                ] as const).map((res) => (
                  <label key={res} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resolution"
                      value={res}
                      checked={selectedRes === res}
                      onChange={() => setSelectedRes(res)}
                    />
                    <span className="text-xs tracking-wide">
                      {res === 'Widescreen' 
                        ? 'Widescreen CRT (Fullscreen)' 
                        : res === 'Ultrawide'
                          ? 'Ultrawide CRT (Cinematic)'
                          : res === '1280x1024' 
                            ? '1280 by 1024 pixels (5:4 LCD)' 
                            : res.replace('x', ' by ') + ' pixels'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {displayTab === 'Monitor' && (
          <>
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400">
              <Monitor size={36} className="text-[#008080]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">Display Information</h2>
                <p className="text-xs text-gray-700 mt-1">Hardware adapter and monitor specifications.</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-start gap-2">
                <Cpu size={24} className="text-[#000080]" />
                <div>
                  <p className="font-bold">Display Adapter</p>
                  <p>S3 86C911 GUI Accelerator (1MB VRAM)</p>
                  <p className="text-gray-600">Driver Version: 1.0.4.B</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Monitor size={24} className="text-[#008080]" />
                <div>
                  <p className="font-bold">Monitor Type</p>
                  <p>Standard VGA/SVGA Color CRT</p>
                  <p className="text-gray-600">Refresh Rate: 60 Hertz (Interlaced)</p>
                </div>
              </div>
              <div className="mt-1 p-2 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white">
                <p className="font-bold text-[#000080] border-b border-gray-300 pb-1 mb-1">Color Palette</p>
                <p>High Color (16-bit) Optimized rendering enabled. For demanding GUI applications, True Color (24-bit) is not recommended on this hardware.</p>
              </div>
            </div>
          </>
        )}

        {displayTab === 'Cursors' && (
          <>
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400">
              <MousePointer2 size={36} className="text-[#008080]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">Mouse Properties</h2>
                <p className="text-xs text-gray-700 mt-1">Customize the appearance of your mouse pointer.</p>
              </div>
            </div>
            
            <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 bg-[#c0c0c0] flex flex-col gap-3 min-h-0 flex-1">
              <p className="font-bold text-xs mb-1 shrink-0">Scheme</p>
              <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 flex-1 overflow-y-auto">
                {[
                  { id: 'default', name: 'Windows Standard' },
                  { id: 'crosshair', name: 'Precision Crosshair' },
                  { id: 'help', name: 'Help Select' },
                  { id: 'wait', name: 'Hourglass (Busy)' },
                  { id: 'text', name: 'Text Select' },
                  { id: 'move', name: 'Move' },
                  ...(installedUpdates.includes('plus_pack') ? [
                    { id: 'blueglass', name: 'Plus! Blue Glass (Vista)' },
                    { id: 'bluesilver', name: 'Plus! Blue Silver (Corporate)' },
                    { id: 'ghostly', name: 'Plus! Ghostly Specter' },
                    { id: 'redblack', name: 'Plus! Red-Black Pro' },
                    { id: 'greenglow', name: 'Plus! Green Glow' },
                    { id: 'earth', name: 'Plus! Earth & Nature' }
                  ] : [])
                ].map((c) => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer py-1 text-xs">
                    <input
                      type="radio"
                      name="cursorstyle"
                      value={c.id}
                      checked={selectedCursorStyle === c.id}
                      onChange={() => setSelectedCursorStyle(c.id)}
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {displayTab === 'Themes' && installedUpdates.includes('plus_pack') && (
          <div className="flex flex-col h-full gap-3">
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400 shrink-0">
              <Sparkles size={36} className="text-[#008080]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">Vespera Plus! Themes</h2>
                <p className="text-xs text-gray-700 mt-1">Transform your desktop with immersive visual and audio enhancements.</p>
              </div>
            </div>

            <div className="flex gap-4 flex-1 min-h-0">
              <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-2 min-h-0 flex flex-col">
                <p className="font-bold text-xs mb-2 shrink-0">Installed Themes</p>
                <div className="flex flex-col gap-1 overflow-y-auto flex-1 pb-2">
                  {Object.values(PLUS_THEMES).map(theme => (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedPlusTheme(theme.id)}
                      className={`px-2 py-1.5 text-xs cursor-default ${selectedPlusTheme === theme.id ? 'bg-[#000080] text-white font-bold' : 'hover:bg-[#008080] hover:text-white'}`}
                    >
                      {theme.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-[45%] shrink-0 flex flex-col gap-3">
                <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#c0c0c0] p-3 text-[10px] leading-relaxed relative overflow-hidden">
                  <div className="font-bold mb-1 border-b border-gray-400 pb-1 flex justify-between">
                    <span>{PLUS_THEMES[selectedPlusTheme]?.name}</span>
                  </div>
                  <p>{PLUS_THEMES[selectedPlusTheme]?.description}</p>
                  
                  {PLUS_THEMES[selectedPlusTheme]?.ambientType && (
                    <div className="mt-2 flex items-center gap-1.5 text-blue-800 bg-blue-50/50 p-1">
                      <Volume2 size={10} className="shrink-0" />
                      <span className="italic">Includes structural ambient audio.</span>
                    </div>
                  )}

                  <div className="mt-4 flex justify-center">
                    {/* Tiny preview monitor */}
                    <div className="relative">
                      <div className="w-[100px] h-[75px] bg-[#a0a0a0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1 pb-0">
                        <div className="w-full h-full border border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex overflow-hidden">
                          {PLUS_THEMES[selectedPlusTheme]?.previewColors.map((color, idx) => (
                            <div key={idx} className="flex-1 h-full" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      </div>
                      <div className="w-[60px] h-[8px] mx-auto bg-[#c0c0c0] border-x border-gray-500" />
                      <div className="w-[80px] h-[6px] mx-auto bg-[#a0a0a0] border border-t-white border-l-white border-b-gray-800 border-r-gray-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto flex justify-end pt-1 shrink-0">
          <button
            onClick={handleApply}
            disabled={!isApplyEnabled}
            className="px-6 py-1 text-sm font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0] disabled:opacity-50 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-dotted"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  // ── Add/Remove Programs panel ──────────────────────────────────────────────
  const renderAddRemove = () => {
    const installedApps = (vfs?.nodes || []).filter((n: any) => n.isApp && n.parentId === 'programs');

    return (
      <div className="flex flex-col h-full p-3 gap-3">
        {/* Back bar */}
        <div className="flex items-center gap-2 border-b border-gray-500 pb-2">
          <button
            onClick={() => { setActivePanel(null); setSelectedAppId(null); }}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
          >
            <ArrowLeft size={12} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Package size={20} className="text-[#7a4a00]" />
            <span className="font-bold text-sm tracking-wide">Add/Remove Programs</span>
          </div>
        </div>

        {/* Two-pane layout */}
        <div className="flex flex-1 gap-3 overflow-hidden">
          {/* Left: installed programs list */}
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-xs font-bold mb-1">Installed Programs:</p>
            {/* Sunken Motif list box */}
            <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-y-auto">
              {installedApps.length === 0 ? (
                <div className="p-3 text-xs text-gray-500 italic">
                  No installed programs found.<br />
                  Download software from the Vespera Navigator browser.
                </div>
              ) : (
                installedApps.map((app: any) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 cursor-default border-b border-gray-200 text-xs ${
                      selectedAppId === app.id
                        ? 'bg-[#000080] text-white'
                        : 'hover:bg-blue-50 text-black'
                    }`}
                  >
                    <HardDrive size={14} className={selectedAppId === app.id ? 'text-white' : 'text-gray-500'} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{app.appDisplayName || app.name}</p>
                      {app.appVersion && (
                        <p className={`text-[10px] ${selectedAppId === app.id ? 'text-blue-200' : 'text-gray-500'}`}>
                          Version {app.appVersion}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action buttons row */}
            <div className="flex gap-2 mt-2 justify-end">
              <button
                disabled={!selectedAppId}
                onClick={handleUninstallRequest}
                className="flex items-center gap-1 px-4 py-1 text-xs font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={12} />
                Uninstall
              </button>
            </div>
          </div>

          {/* Right: info pane */}
          <div className="w-36 shrink-0 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#c0c0c0] p-2 flex flex-col gap-2">
            <p className="text-[10px] font-bold border-b border-gray-500 pb-1">Details</p>
            {selectedAppId ? (() => {
              const app = installedApps.find((a: any) => a.id === selectedAppId);
              return app ? (
                <>
                  <Package size={28} className="text-[#7a4a00] mx-auto mt-2" />
                  <p className="text-[10px] font-bold text-center">{app.appDisplayName || app.name}</p>
                  {app.appVersion && <p className="text-[9px] text-center text-gray-600">v{app.appVersion}</p>}
                  <p className="text-[9px] text-gray-600 mt-1 leading-tight">
                    Click Uninstall to remove this program and all associated shortcuts.
                  </p>
                </>
              ) : null;
            })() : (
              <p className="text-[9px] text-gray-500 italic leading-tight mt-1">
                Select a program from the list to see its details.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Task Menu panel ────────────────────────────────────────────────────────
  // Workspace menu editor state
  const DEFAULT_WS_MENU = DEFAULT_WORKSPACE_MENU;
  const currentWorkspaceMenu = vfs.displaySettings?.workspaceMenu || DEFAULT_WS_MENU;
  const [editingMenu, setEditingMenu] = useState<any[]>(JSON.parse(JSON.stringify(currentWorkspaceMenu)));
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['programs', 'system', 'installed']));
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Sync editing menu when panel changes
  useEffect(() => {
    if (taskbarTab === 'Workspace Menu') {
      setEditingMenu(JSON.parse(JSON.stringify(vfs.displaySettings?.workspaceMenu || DEFAULT_WS_MENU)));
    }
  }, [taskbarTab]);
  
  const toggleExpandFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  // Find item and its parent array for reordering
  const findItemAndParent = (items: any[], targetId: string): { item: any, parent: any[], index: number } | null => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === targetId) return { item: items[i], parent: items, index: i };
      if (items[i].children) {
        const result = findItemAndParent(items[i].children, targetId);
        if (result) return result;
      }
    }
    return null;
  };
  
  const moveItem = (direction: 'up' | 'down') => {
    if (!selectedMenuItemId) return;
    const newMenu = JSON.parse(JSON.stringify(editingMenu));
    const found = findItemAndParent(newMenu, selectedMenuItemId);
    if (!found) return;
    const { parent, index } = found;
    if (direction === 'up' && index > 0) {
      [parent[index - 1], parent[index]] = [parent[index], parent[index - 1]];
    } else if (direction === 'down' && index < parent.length - 1) {
      [parent[index + 1], parent[index]] = [parent[index], parent[index + 1]];
    }
    setEditingMenu(newMenu);
  };
  
  const addFolder = () => {
    const name = newFolderName.trim() || 'New Folder';
    const id = 'custom_' + Math.random().toString(36).substr(2, 6);
    const newFolder = { id, label: name, icon: 'folder', type: 'folder', children: [] };
    // Insert before separator
    const sepIdx = editingMenu.findIndex((item: any) => item.id === 'sep1');
    const newMenu = [...editingMenu];
    if (sepIdx !== -1) {
      newMenu.splice(sepIdx, 0, newFolder);
    } else {
      newMenu.push(newFolder);
    }
    setEditingMenu(newMenu);
    setNewFolderName('');
  };
  
  const removeItem = () => {
    if (!selectedMenuItemId) return;
    const newMenu = JSON.parse(JSON.stringify(editingMenu));
    const found = findItemAndParent(newMenu, selectedMenuItemId);
    if (!found || found.item.isSystem) return;
    found.parent.splice(found.index, 1);
    setEditingMenu(newMenu);
    setSelectedMenuItemId(null);
  };
  
  const restoreDefaults = () => {
    setEditingMenu(JSON.parse(JSON.stringify(DEFAULT_WS_MENU)));
  };
  
  const applyWorkspaceMenu = () => {
    if (vfs.updateWorkspaceMenu) vfs.updateWorkspaceMenu(editingMenu);
  };
  
  const isWorkspaceMenuChanged = JSON.stringify(editingMenu) !== JSON.stringify(vfs.displaySettings?.workspaceMenu || DEFAULT_WS_MENU);
  
  // Recursive tree renderer for workspace menu editor
  const renderMenuTree = (items: any[], depth: number = 0) => {
    return items.map((item: any) => {
      if (item.type === 'separator') {
        return (
          <div key={item.id} className="flex items-center gap-1 pl-2 py-0.5" style={{ paddingLeft: depth * 16 + 8 }}>
            <div className="flex-1 h-[1px] bg-gray-400" />
            <span className="text-[9px] text-gray-500 italic">separator</span>
            <div className="flex-1 h-[1px] bg-gray-400" />
          </div>
        );
      }
      
      const isFolder = item.type === 'folder';
      const isExpanded = expandedFolders.has(item.id);
      const isSelected = selectedMenuItemId === item.id;
      const isDynamic = item.isDynamic;
      
      return (
        <div key={item.id}>
          <div
            className={`flex items-center gap-1 px-1 py-0.5 cursor-default text-xs ${isSelected ? 'bg-[#000080] text-white' : 'hover:bg-blue-50'}`}
            style={{ paddingLeft: depth * 16 + 4 }}
            onClick={() => setSelectedMenuItemId(item.id)}
          >
            {isFolder ? (
              <button
                className="w-4 h-4 flex items-center justify-center shrink-0"
                onClick={(e) => { e.stopPropagation(); toggleExpandFolder(item.id); }}
              >
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            ) : <div className="w-4" />}
            {isFolder ? <FolderOpen size={12} className={isSelected ? 'text-white' : 'text-yellow-600'} /> : null}
            <span className={`truncate ${isDynamic ? 'italic' : ''} ${item.isSystem ? '' : 'text-blue-700'}`} style={isSelected ? { color: 'white' } : {}}>
              {item.label || '---'}
              {isDynamic ? ' (auto)' : ''}
            </span>
          </div>
          {isFolder && isExpanded && item.children && (
            <div>{renderMenuTree(item.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };
  
  const renderTaskbarPanel = () => (
    <div className="flex flex-col h-full p-3 gap-2">
      {/* Back bar */}
      <div className="flex items-center gap-2 border-b border-gray-500 pb-2">
        <button
          onClick={() => setActivePanel(null)}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
        >
          <ArrowLeft size={12} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Menu size={20} className="text-[#4a4a8a]" />
          <span className="font-bold text-sm tracking-wide">Task Menu Properties</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b-2 border-white mt-1 relative z-10 px-1 overflow-x-auto scroller-hidden">
        {(['Appearance', 'Clock', 'Shortcuts', 'Workspace Menu', 'Wave bar'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setTaskbarTab(tab)}
            className={`px-2 py-1 text-[11px] font-bold border-2 border-b-0 rounded-t-sm ${
              taskbarTab === tab 
                ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800 pb-2 -mb-0.5 z-20' 
                : 'bg-gray-300 border-t-white border-l-white border-r-gray-800 mt-1 cursor-pointer'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-3 bg-[#c0c0c0] flex flex-col gap-3 relative z-0 -mt-2 overflow-y-auto min-h-0">
        
        {/* ── Appearance Tab ── */}
        {taskbarTab === 'Appearance' && (
          <>
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400">
              <Menu size={36} className="text-[#4a4a8a]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">Task Menu Appearance</h2>
                <p className="text-xs text-gray-700 mt-1">Select a color theme and style for the launcher dock.</p>
              </div>
            </div>

            <div className="flex-1 min-h-[12rem] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 bg-white flex flex-col overflow-y-auto">
              <p className="font-bold text-xs mb-2 text-[#000080]">Available Themes:</p>
              <div className="flex flex-col gap-1">
                {TASKBAR_THEMES.map(theme => (
                  <label 
                    key={theme.id}
                    className={`flex items-center gap-3 px-2 py-2 cursor-pointer border ${selectedTaskbarTheme === theme.id ? 'bg-[#000080] text-white border-[#000080]' : 'hover:bg-gray-100 border-transparent text-black'}`}
                    onClick={() => setSelectedTaskbarTheme(theme.id)}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center shrink-0" style={{ borderColor: selectedTaskbarTheme === theme.id ? 'white' : 'gray' }}>
                       {selectedTaskbarTheme === theme.id && <div className="w-2 h-2 rounded-full bg-white shrink-0" />}
                    </div>
                    <div className="w-6 h-6 border border-gray-500 shrink-0" style={{ backgroundColor: theme.hex }} />
                    <span className="text-xs font-bold tracking-wide select-none">{theme.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Clock Tab ── */}
        {taskbarTab === 'Clock' && (
          <>
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400">
              <Menu size={36} className="text-[#4a4a8a]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">Clock Settings</h2>
                <p className="text-xs text-gray-700 mt-1">Configure the taskbar clock display.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label 
                className="flex items-center gap-2 cursor-pointer w-max"
                onClick={() => setSelectedTaskbarShowClock(!selectedTaskbarShowClock)}
              >
                <div className="w-4 h-4 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex items-center justify-center shrink-0">
                  {selectedTaskbarShowClock && <div className="w-2 h-2 bg-black" />}
                </div>
                <span className="text-sm tracking-wide">Show Clock in Task Menu</span>
              </label>
              
              {selectedTaskbarShowClock && (
                <div className="ml-6 flex flex-col gap-2 p-2 border border-gray-400 bg-white">
                  <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                    <span className="text-xs">Background:</span>
                    <div className="flex gap-2 items-center">
                      <input type="color" className="w-8 h-6 p-0 border border-gray-400 cursor-pointer" value={clockBgColor.startsWith('bg-') || clockBgColor === '' ? defaultBg : clockBgColor} onChange={e => setClockBgColor(e.target.value)} />
                      <span className="text-[10px] text-gray-500 font-mono">{clockBgColor.startsWith('bg-') || clockBgColor === ''  ? defaultBg : clockBgColor}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                    <span className="text-xs">Text Color:</span>
                    <div className="flex gap-2 items-center">
                      <input type="color" className="w-8 h-6 p-0 border border-gray-400 cursor-pointer" value={clockTextColor.startsWith('text-') || clockTextColor === '' ? defaultText : clockTextColor} onChange={e => setClockTextColor(e.target.value)} />
                      <span className="text-[10px] text-gray-500 font-mono">{clockTextColor.startsWith('text-') || clockTextColor === '' ? defaultText : clockTextColor}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                    <span className="text-xs">Font:</span>
                    <select className="text-xs border border-gray-400 p-0.5 outline-none" value={clockFont} onChange={e => setClockFont(e.target.value)}>
                      <option value="font-mono">Monospace (Classic)</option>
                      <option value="font-sans">Sans-Serif</option>
                      <option value="font-serif">Serif (Times)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                    <span className="text-xs">Format:</span>
                    <select className="text-xs border border-gray-400 p-0.5 outline-none" value={clockFormat} onChange={e => setClockFormat(e.target.value)}>
                      <option value="24h">24-Hour (Military)</option>
                      <option value="12h">12-Hour (AM/PM)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Shortcuts Tab ── */}
        {taskbarTab === 'Shortcuts' && (
          <>
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400">
              <Package size={36} className="text-[#4a4a8a]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">Taskbar Shortcuts</h2>
                <p className="text-xs text-gray-700 mt-1">Select which applications stay pinned to your taskbar.</p>
              </div>
            </div>

            <div className="flex-1 min-h-[12rem] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 bg-white flex flex-col overflow-y-auto">
              <p className="font-bold text-xs mb-2 text-[#000080]">Available Applications:</p>
              <div className="flex flex-col gap-1">
                {(() => {
                  const installedAppIds = (vfs?.nodes || []).filter((n: any) => n.isApp && n.parentId === 'programs').map((n:any) => n.id);
                  return Object.entries(APP_DICTIONARY).filter(([k]) => k !== 'default').map(([appId, meta]) => {
                    // Only show if it's a system app or it's currently installed
                    if (!meta.isSystem && !installedAppIds.includes(appId)) return null;
                    
                    const isPinned = selectedPinnedApps.includes(appId);
                    
                    return (
                      <label 
                        key={appId}
                        className={`flex items-center gap-3 px-2 py-2 cursor-pointer border ${isPinned ? 'bg-[#000080] text-white border-[#000080]' : 'hover:bg-gray-100 border-transparent text-black'}`}
                        onClick={() => {
                          setSelectedPinnedApps(prev => {
                            if (prev.includes(appId)) return prev.filter(id => id !== appId);
                            return [...prev, appId];
                          });
                        }}
                      >
                        <div className="w-4 h-4 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex items-center justify-center shrink-0">
                          {isPinned && <div className="w-2 h-2 bg-black" />}
                        </div>
                        <meta.icon size={16} className={isPinned ? 'text-white' : meta.color} />
                        <span className="text-xs font-bold tracking-wide select-none">{meta.defaultTitle}</span>
                      </label>
                    );
                  });
                })()}
              </div>
            </div>
          </>
        )}

        {/* ── Workspace Menu Tab ── */}
        {taskbarTab === 'Workspace Menu' && (
          <>
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400">
              <FolderOpen size={36} className="text-[#4a4a8a]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">Workspace Menu Layout</h2>
                <p className="text-xs text-gray-700 mt-1">Customize folders and items in the Workspace pop-up menu.</p>
              </div>
            </div>
            
            {/* Tree view */}
            <div className="flex-1 min-h-[10rem] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-y-auto">
              {renderMenuTree(editingMenu)}
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => moveItem('up')}
                disabled={!selectedMenuItemId}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowUp size={10} /> Move Up
              </button>
              <button
                onClick={() => moveItem('down')}
                disabled={!selectedMenuItemId}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowDown size={10} /> Move Down
              </button>
              <button
                onClick={removeItem}
                disabled={!selectedMenuItemId || (() => { const f = findItemAndParent(editingMenu, selectedMenuItemId || ''); return !f || f.item.isSystem; })()}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus size={10} /> Remove
              </button>
              <button
                onClick={restoreDefaults}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0]"
              >
                <RotateCcw size={10} /> Restore Defaults
              </button>
            </div>
            
            {/* New Folder row */}
            <div className="flex items-center gap-2 border-t border-gray-400 pt-2">
              <span className="text-xs font-bold shrink-0">New Folder:</span>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="flex-1 text-xs border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-1 py-0.5 outline-none"
                onKeyDown={(e) => { if (e.key === 'Enter') addFolder(); }}
              />
              <button
                onClick={addFolder}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0]"
              >
                <Plus size={10} /> Add
              </button>
            </div>
          </>
        )}

        {taskbarTab === 'Wave bar' && (
          <>
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400">
              <Menu size={36} className="text-[#4a4a8a]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">Task Menu Wave Bar</h2>
                <p className="text-xs text-gray-700 mt-1">
                  Animated bars beside the clock while VERSA Media Agent is open and playing (including when the player window is minimized).
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label
                className="flex items-center gap-2 cursor-pointer w-max"
                onClick={() => setWaveBarEnabled(!waveBarEnabled)}
              >
                <div className="w-4 h-4 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex items-center justify-center shrink-0">
                  {waveBarEnabled && <div className="w-2 h-2 bg-black" />}
                </div>
                <span className="text-sm tracking-wide">Show wave bar when music is playing</span>
              </label>
              {waveBarEnabled && (
                <label
                  className="flex items-center gap-2 cursor-pointer w-max ml-0"
                  onClick={() => setWaveBarUseAlbumArt(!waveBarUseAlbumArt)}
                >
                  <div className="w-4 h-4 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex items-center justify-center shrink-0">
                    {waveBarUseAlbumArt && <div className="w-2 h-2 bg-black" />}
                  </div>
                  <span className="text-sm tracking-wide">Show album cover instead of wave bar (when artwork is available)</span>
                </label>
              )}
              {waveBarEnabled && waveBarUseAlbumArt && (
                <p className="text-[10px] text-gray-600 ml-6 max-w-md leading-tight">
                  Uses embedded ID3 art or the cover image next to the file. If no art is found, the animated wave bar is shown.
                </p>
              )}
              {waveBarEnabled && (
                <div className="ml-6 flex flex-col gap-3 p-2 border border-gray-400 bg-white">
                  <div className="grid grid-cols-[96px_1fr] items-center gap-2">
                    <span className="text-xs">Style:</span>
                    <select
                      className="text-xs border border-gray-400 p-0.5 outline-none max-w-full"
                      value={waveBarStyle}
                      onChange={(e) => setWaveBarStyle(e.target.value)}
                    >
                      <option value="classic">Classic</option>
                      <option value="smooth">Smooth</option>
                      <option value="blocks">Blocks</option>
                      <option value="minimal">Minimal</option>
                      <option value="thin">Thin</option>
                      <option value="pulse">Pulse</option>
                      <option value="neon">Neon</option>
                      <option value="stack">Stack</option>
                      <option value="retro">Retro</option>
                      <option value="spark">Spark</option>
                      <option value="wave">Wave</option>
                      <option value="spectrum">Spectrum</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-[96px_1fr] items-center gap-2">
                    <span className="text-xs">Bar color:</span>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        className="w-8 h-6 p-0 border border-gray-400 cursor-pointer"
                        value={waveBarColor}
                        onChange={(e) => setWaveBarColor(e.target.value)}
                      />
                      <span className="text-[10px] text-gray-500 font-mono">{waveBarColor}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-[96px] shrink-0">Number of bars:</span>
                      <input
                        type="range"
                        min={3}
                        max={9}
                        step={1}
                        value={waveBarBarCount}
                        onChange={(e) => setWaveBarBarCount(Number(e.target.value))}
                        className="flex-1 max-w-[220px] accent-teal-700"
                      />
                    </div>
                    <span className="text-[10px] text-gray-600 ml-[96px]">{waveBarBarCount} bars</span>
                  </div>
                  <div className="grid grid-cols-[96px_1fr] items-center gap-2">
                    <span className="text-xs">Animation:</span>
                    <select
                      className="text-xs border border-gray-400 p-0.5 outline-none"
                      value={waveBarSpeed}
                      onChange={(e) => setWaveBarSpeed(e.target.value)}
                    >
                      <option value="slow">Slow</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Fast</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-auto flex justify-end pt-1">
            <button
              onClick={() => {
                handleApply();
                if (isWorkspaceMenuChanged) applyWorkspaceMenu();
              }}
              disabled={!isApplyEnabled && !isWorkspaceMenuChanged}
          className="px-6 py-1 text-sm font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0] disabled:opacity-50 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-dotted"
        >
          Apply
        </button>
      </div>
    </div>
  );

  // ── Stub panels for System ───────────────────────────────────────────
  const renderStub = (item: PanelItem) => (
    <div className="flex flex-col h-full p-3 gap-3">
      <div className="flex items-center gap-2 border-b border-gray-500 pb-2">
        <button
          onClick={() => setActivePanel(null)}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
        >
          <ArrowLeft size={12} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <item.Icon size={20} className={item.iconColor} />
          <span className="font-bold text-sm tracking-wide">{item.label.replace('\n', ' ')}</span>
        </div>
      </div>
      <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#c0c0c0] flex items-center justify-center">
        <div className="text-center px-6">
          <item.Icon size={48} className={`${item.iconColor} mx-auto mb-3`} />
          <p className="font-bold text-sm mb-1">{item.label.replace('\n', ' ')}</p>
          <p className="text-xs text-gray-600">This module is not available in this build of Vespera OS.</p>
          <p className="text-[10px] text-gray-500 mt-3 italic">Contact your system administrator.</p>
        </div>
      </div>
    </div>
  );

  // ── Users Panel ───────────────────────────────────────────────────────────
  const renderUsers = () => {
    const selectedSystemUser = vfs.systemUsers?.find((u: any) => u.id === selectedUserId);
    
    // Check global session from VStore
    const activeGlobalSession = localStorage.getItem('vstore_session');

    return (
      <div className="flex flex-col h-full p-3 gap-3">
        {/* Back bar */}
        <div className="flex items-center gap-2 border-b border-gray-500 pb-2">
          <button
            onClick={() => { setActivePanel(null); setSelectedUserId(null); }}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
          >
            <ArrowLeft size={12} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <User size={20} className="text-[#4a4a8a]" />
            <span className="font-bold text-sm tracking-wide">Users</span>
          </div>
        </div>

        {/* Two-pane layout */}
        <div className="flex flex-1 gap-3 overflow-hidden">
          {/* Left: Account list */}
          <div className="flex flex-col w-48 shrink-0 min-w-0">
            <p className="text-xs font-bold mb-1">System Accounts:</p>
            {/* Sunken list box */}
            <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-y-auto">
              {(vfs.systemUsers || []).map((user: any) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`flex items-center gap-2 px-2 py-1.5 cursor-default border-b border-gray-200 text-xs ${
                    selectedUserId === user.id
                      ? 'bg-[#000080] text-white'
                      : 'hover:bg-blue-50 text-black'
                  }`}
                >
                  {user.profilePic ? (
                    <img src={user.profilePic} className="w-4 h-4 border border-gray-400" />
                  ) : (
                    <User size={14} className={selectedUserId === user.id ? 'text-white' : 'text-gray-500'} />
                  )}
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <span>
                      <span className="font-bold truncate">{user.displayName}</span>
                      <span className="text-[9px] opacity-70 ml-1">({user.username})</span>
                    </span>
                    {user.vstoreId && <Globe size={10} className={selectedUserId === user.id ? 'text-yellow-400' : 'text-blue-500'} />}
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons row */}
            <div className="flex gap-2 mt-2 justify-end">
              <button
                onClick={() => {
                  const tag = Math.random().toString(36).substr(2, 4);
                  vfs.addSystemUser({ 
                    id: 'usr_' + tag, 
                    username: 'newuser_' + tag, 
                    password: '', 
                    displayName: 'New User', 
                    isAdmin: false, 
                    isGuest: false 
                  });
                }}
                className="flex items-center gap-1 px-3 py-1 text-xs font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0]"
              >
                <Plus size={12} /> Add
              </button>
              <button
                disabled={!selectedUserId || selectedSystemUser?.username === 'admin'}
                onClick={() => {
                   if (selectedUserId) {
                     vfs.deleteSystemUser(selectedUserId);
                     setSelectedUserId(null);
                   }
                }}
                className="flex items-center gap-1 px-3 py-1 text-xs font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>

          {/* Right: info pane */}
          <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#c0c0c0] p-3 flex flex-col gap-2 overflow-y-auto">
            {selectedSystemUser ? (
              <>
                <div className="flex gap-3 mb-2 items-start border-b border-gray-400 pb-3">
                  <div className="w-16 h-16 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white shrink-0 flex items-center justify-center overflow-hidden">
                    {selectedSystemUser.profilePic ? (
                      <img src={selectedSystemUser.profilePic} className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-xs font-bold flex flex-col">
                      Display Name
                      <input 
                        type="text" 
                        value={selectedSystemUser.displayName}
                        onChange={e => vfs.updateSystemUser(selectedUserId!, { displayName: e.target.value })}
                        className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white text-xs px-1 py-0.5 mt-0.5 font-normal"
                      />
                    </label>
                    <label className="text-xs font-bold flex flex-col">
                      Login Username
                      <input 
                        type="text" 
                        disabled={selectedSystemUser.username === 'admin'}
                        value={selectedSystemUser.username}
                        onChange={e => vfs.updateSystemUser(selectedUserId!, { username: e.target.value.toLowerCase().trim() })}
                        className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white text-xs px-1 py-0.5 mt-0.5 font-normal disabled:opacity-60 disabled:bg-gray-200"
                      />
                    </label>
                  </div>
                </div>

                <div className="text-xs text-gray-800 font-bold mb-1">Avatar Preset</div>
                <div className="flex gap-1 mb-3 overflow-x-auto pb-2 scroller-hidden">
                  <div 
                    onClick={() => vfs.updateSystemUser(selectedUserId!, { profilePic: '' })}
                    className={`w-8 h-8 shrink-0 flex items-center justify-center border cursor-pointer bg-white ${!selectedSystemUser.profilePic ? 'border-2 border-blue-600' : 'border-gray-400'}`}
                  >
                     <User size={16} className="text-gray-500" />
                  </div>
                  {RETRO_ICONS.filter(i => i.id.startsWith('user_') || i.id.startsWith('sys_globe')).map(ico => (
                    <img 
                      key={ico.id}
                      src={ico.url}
                      onClick={() => vfs.updateSystemUser(selectedUserId!, { profilePic: ico.url })}
                      className={`w-8 h-8 shrink-0 object-scale-down border cursor-pointer bg-white ${selectedSystemUser.profilePic === ico.url ? 'border-2 border-blue-600 p-0.5' : 'border-gray-400 p-1'} hover:bg-gray-100`}
                    />
                  ))}
                </div>

                <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 mb-3">
                  <div className="text-xs font-bold text-[#000080] border-b border-gray-200 pb-1 mb-2 flex items-center gap-1">
                    <Key size={12} /> Security & Passwords
                  </div>
                  <label className="text-xs flex items-center gap-2 mb-2">
                    <input 
                      type="password"
                      placeholder="Enter new password"
                      value={selectedSystemUser.password}
                      onChange={e => vfs.updateSystemUser(selectedUserId!, { password: e.target.value })}
                      className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-1 py-0.5 outline-none font-mono"
                    />
                  </label>
                  <label className="text-xs flex items-center gap-2 mt-2 w-max cursor-pointer">
                    <div className={`w-3 h-3 flex items-center justify-center border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white`}>
                       {selectedSystemUser.isAdmin && <div className="w-1.5 h-1.5 bg-black" />}
                    </div>
                    <span>Administrator (Full System Access)</span>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      disabled={selectedSystemUser.username === 'admin'}
                      checked={selectedSystemUser.isAdmin} 
                      onChange={e => vfs.updateSystemUser(selectedUserId!, { isAdmin: e.target.checked })} 
                    />
                  </label>
                </div>

                <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2">
                  <div className="text-xs font-bold text-[#000080] border-b border-gray-200 pb-1 mb-2 flex flex-col gap-0.5">
                    <span className="flex items-center gap-1"><Globe size={12} /> VesperaNET Integration</span>
                    <span className="text-[9px] font-normal text-gray-500">Link your system account to the global network.</span>
                  </div>
                  {selectedSystemUser.vstoreId ? (
                    <div className="text-xs flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-green-700 font-bold bg-green-50 p-1 border border-green-200">
                        <Shield size={14} /> Linked to: {selectedSystemUser.vstoreId}
                      </div>
                      <button 
                         onClick={() => vfs.updateSystemUser(selectedUserId!, { vstoreId: '' })}
                         className="self-start text-[10px] underline text-blue-800"
                      >
                         Unlink Account
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs flex flex-col gap-2">
                      {!activeGlobalSession ? (
                        <div className="text-[10px] text-red-600 italic">No global session detected. Please log into VStore first.</div>
                      ) : (
                         <div className="text-[10px] text-blue-600">Detected global session: <b>{activeGlobalSession}</b></div>
                      )}
                      
                      <button 
                         disabled={!activeGlobalSession}
                         onClick={() => vfs.updateSystemUser(selectedUserId!, { vstoreId: activeGlobalSession })}
                         className="self-start px-3 py-1 font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0] disabled:opacity-50"
                      >
                         Link to "{activeGlobalSession || '...'}"
                      </button>
                    </div>
                  )}
                </div>

              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 opacity-50">
                <User size={48} className="mb-2 text-gray-600" />
                <p className="text-sm font-bold text-gray-800">No Account Selected</p>
                <p className="text-[10px] text-gray-600 mt-1">Select an account from the list to view its properties.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Vespera Update panel ──────────────────────────────────────────────────────
  const renderVesperaUpdate = () => {
    const startScan = () => {
      setUpdateScanPhase('scanning');
      setUpdateScanProgress(0);
      setUpdateScanStatus('Connecting to VesperaNET...');
      
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 15;
        if (p > 30) setUpdateScanStatus('Authenticating system signature...');
        if (p > 60) setUpdateScanStatus('Querying update manifest...');
        
        if (p >= 100) {
          clearInterval(interval);
          setUpdateScanPhase('done');
          setUpdateScanProgress(100);
          setUpdateScanStatus('Scan complete.');
        } else {
          setUpdateScanProgress(p);
        }
      }, 500);
    };

    const beginInstall = () => {
      const update = AVAILABLE_UPDATES.find(u => u.id === selectedUpdateId);
      if (!update) return;
      // agentv_plus has its own dedicated setup wizard
      if (update.id === 'agentv_plus') {
        if (typeof (window as any).__launchAgentVPlusSetup === 'function') {
          (window as any).__launchAgentVPlusSetup();
        }
        return;
      }
      setUpdateInstallTarget(update);
      setUpdateInstallPhase('eula');
    };

    const confirmEula = () => {
      if (!updateInstallTarget) return;
      setUpdateInstallPhase('installing');
      setUpdateInstallProgress(0);
      setUpdateInstallStatus('Initializing setup...');
      
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * (100 / (updateInstallTarget.installDuration * 2));
        if (p > 10) setUpdateInstallStatus('Extracting temporary files...');
        if (p > 40) setUpdateInstallStatus('Modifying system configuration...');
        if (p > 70) setUpdateInstallStatus('Registering components...');
        if (p > 90) setUpdateInstallStatus('Finalizing installation...');
        
        if (p >= 100) {
          clearInterval(interval);
          setUpdateInstallPhase('done');
          setUpdateInstallProgress(100);
          setUpdateInstallStatus('Installation complete.');
          const newInstalled = [...installedUpdates, updateInstallTarget.id];
          setInstalledUpdates(newInstalled);
          localStorage.setItem('vespera_installed_updates', JSON.stringify(newInstalled));
        } else {
          setUpdateInstallProgress(p);
        }
      }, 500);
    };

    const resetUpdateView = () => {
      setUpdateInstallPhase('idle');
      setUpdateInstallTarget(null);
      setSelectedUpdateId(null);
      if (vfs.playUIClickSound) vfs.playUIClickSound();
    };

    return (
      <div className="flex flex-col h-full p-3 gap-3 bg-[#c0c0c0]">
        <div className="flex items-center gap-2 border-b border-gray-500 pb-2 bg-[#c0c0c0]">
          <button
            onClick={() => { setActivePanel(null); }}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white text-xs font-bold"
          >
            <ArrowLeft size={12} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Download size={20} className="text-[#006400]" />
            <span className="font-bold text-sm tracking-wide">Vespera Update</span>
          </div>
        </div>

        {updateInstallPhase === 'idle' && (
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            {updateScanPhase === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <Globe size={48} className="text-[#006400] mb-4" />
                <p className="font-bold text-sm mb-2">Keep your Vespera system up to date.</p>
                <p className="text-xs text-gray-700 mb-6 max-w-[250px]">Connect to VesperaNET to scan for system updates, security patches, and structural enhancements.</p>
                <button
                  onClick={startScan}
                  className="px-6 py-2 font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white"
                >
                  Scan for Updates
                </button>
              </div>
            )}

            {updateScanPhase === 'scanning' && (
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <Loader size={32} className="text-[#006400] mb-4 animate-spin" />
                <p className="font-bold text-sm mb-2">{updateScanStatus}</p>
                <div className="w-64 h-4 bg-black p-0.5 border-2 border-white shadow-[inset_0_0_5px_rgba(0,0,0,0.8)]">
                  <div className="h-full bg-[#000080]" style={{ width: `${updateScanProgress}%` }} />
                </div>
              </div>
            )}

            {updateScanPhase === 'done' && (
              <div className="flex-1 flex flex-col gap-2 min-h-0 bg-[#c0c0c0]">
                <p className="font-bold text-sm shrink-0">Available Updates</p>
                <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-y-auto">
                  {AVAILABLE_UPDATES.filter(u => !installedUpdates.includes(u.id)).length === 0 ? (
                    <div className="p-4 flex flex-col items-center justify-center h-full text-gray-500">
                      <CheckCircle size={32} className="mb-2 text-green-600" />
                      <p className="text-sm font-bold text-black" >Your system is up to date.</p>
                    </div>
                  ) : (
                    AVAILABLE_UPDATES.filter(u => !installedUpdates.includes(u.id)).map(update => (
                      <div
                        key={update.id}
                        onClick={() => setSelectedUpdateId(update.id)}
                        className={`p-2 border-b border-gray-200 cursor-default flex items-start gap-3 ${selectedUpdateId === update.id ? 'bg-[#000080] text-white' : 'hover:bg-gray-100'}`}
                      >
                        <Package size={24} className={`shrink-0 ${selectedUpdateId === update.id ? 'text-white' : 'text-[#7a4a00]'}`} />
                        <div>
                          <p className="font-bold text-xs">{update.name}</p>
                          <p className={`text-[10px] mt-0.5 ${selectedUpdateId === update.id ? 'text-gray-300' : 'text-gray-600'}`}>{update.size} • {update.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {AVAILABLE_UPDATES.filter(u => !installedUpdates.includes(u.id)).length > 0 && (
                  <div className="flex justify-end pt-2 shrink-0">
                    <button
                      disabled={!selectedUpdateId}
                      onClick={beginInstall}
                      className="px-6 py-1 font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white disabled:opacity-50"
                    >
                      Install Update
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {updateInstallPhase === 'eula' && updateInstallTarget && (
          <div className="flex-1 flex flex-col gap-3 min-h-0 bg-[#c0c0c0]">
            <p className="font-bold text-sm shrink-0 flex items-center gap-2">
              <AlertCircle size={16} className="text-blue-800" /> End User License Agreement
            </p>
            <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-y-auto p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed">
              VESPERA SYSTEMS - STRUCTURAL MODIFICATION ADDENDUM
              {'\n\n'}By proceeding with the installation of "{updateInstallTarget.name}", the USER acknowledges that deep-structural OS modifications carry absolute risk.
              {updateInstallTarget.id === 'plus_pack' && '\n\nWARNING: The Vespera Plus! features rely on undocumented sensory-stimulus hooks. Prolonged exposure to Cyber-Nature or Corporate-Void environments may induce cognitive disassociation. Vespera Systems assumes ZERO liability for subjective reality degradation.'}
              {updateInstallTarget.id === 'agentv_plus' && '\n\nBETA NOTICE: The VAgent PLUS! Character Expansion is classified as beta software. PLUS! companion skins may cause visual rendering anomalies, increased GPU utilization, or expression engine instability. Vespera Systems assumes ZERO liability for any cognitive dissonance induced by prolonged companion interaction.'}
              {updateInstallTarget.lore && '\n\nNOTE: Administrator logging has been permanently enabled to monitor all inbound X-Type transmissions as per Directive 4.'}
              {'\n\n'}Do you agree to all terms?
            </div>
            <div className="flex justify-end gap-2 pt-2 shrink-0">
              <button onClick={resetUpdateView} className="px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white font-bold">Decline</button>
              <button onClick={confirmEula} className="px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white font-bold">I Agree</button>
            </div>
          </div>
        )}

        {updateInstallPhase === 'installing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 mt-8 bg-[#c0c0c0]">
            <Package size={36} className="text-blue-800 mb-4 animate-bounce" />
            <p className="font-bold text-sm mb-1 text-center">Installing {updateInstallTarget?.name}</p>
            <p className="text-[10px] text-gray-700 mb-4 h-4">{updateInstallStatus}</p>
            <div className="w-[80%] h-5 bg-white border-2 border-gray-600 p-[2px] mb-8 shadow-inner">
              <div className="h-full bg-[#000080]" style={{ width: `${updateInstallProgress}%`, transition: 'width 0.2s linear' }} />
            </div>
          </div>
        )}

        {updateInstallPhase === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 mt-8 bg-[#c0c0c0]">
            <CheckCircle size={48} className="text-green-600 mb-4" />
            <p className="font-bold text-sm mb-2 text-center text-black">Installation Successful</p>
            <p className="text-xs text-gray-700 mb-6 text-center">
              The update "{updateInstallTarget?.name}" has been successfully installed to your system.
              {updateInstallTarget?.id === 'plus_pack' && " \nYou can access your new themes from the Display Properties module."}
            </p>
            <button onClick={resetUpdateView} className="px-6 py-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white font-bold text-sm">Finish</button>
          </div>
        )}
      </div>
    );
  };

  // ── Agent V Settings ──────────────────────────────────────────────────────────
  const renderAgentVSettings = () => (
    <div className="flex flex-col h-full p-3 gap-2">
      <div className="flex items-center gap-2 border-b border-gray-500 pb-2">
        <button
          onClick={() => setActivePanel(null)}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
        >
          <ArrowLeft size={12} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-[#000080]" />
          <span className="font-bold text-sm tracking-wide">Agent V Properties</span>
        </div>
      </div>
      
      <div className="flex-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-4 bg-[#c0c0c0] flex flex-col gap-4 relative z-0 overflow-y-auto min-h-0">
        <div className="flex items-center gap-4 border-b pb-3 border-gray-400">
          <MessageSquare size={36} className="text-[#000080]" />
          <div>
            <h2 className="font-bold text-sm leading-none tracking-wide">Agent V Preferences</h2>
            <p className="text-xs text-gray-700 mt-1">Configure your personal assistant's behavior and appearance.</p>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer mt-2">
          <input
            type="checkbox"
            checked={agentVEnabled}
            onChange={(e) => setAgentVEnabled(e.target.checked)}
          />
          <span className="text-xs font-bold">Enable Agent V Assistant</span>
        </label>
        
        <div className={`border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 bg-[#c0c0c0] flex flex-col gap-3 ${!agentVEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <p className="font-bold text-xs">Appearance (Skin)</p>
          <div className="flex gap-4">
             {['classic', 'robot', 'smiley'].map(skin => (
               <label key={skin} className="flex flex-col items-center gap-2 cursor-pointer">
                 <div className={`w-12 h-12 border-2 flex items-center justify-center ${agentVSkin === skin ? 'border-blue-800 bg-blue-100' : 'border-transparent hover:border-gray-500'}`}>
                   <span className="text-[9px] uppercase font-bold text-center tracking-widest leading-none">{skin}</span>
                 </div>
                 <input
                   type="radio"
                   name="agentskin"
                   value={skin}
                   checked={agentVSkin === skin}
                   onChange={() => setAgentVSkin(skin)}
                 />
               </label>
             ))}
          </div>

          {/* PLUS! Skins Section */}
          <div className="border-t border-gray-400 pt-2 mt-1">
            <div className="flex items-center gap-1 mb-2">
              <span className="font-bold text-xs" style={{ color: '#6b21a8' }}>✦ PLUS! Skins</span>
              {!installedUpdates.includes('agentv_plus') && (
                <span className="text-[9px] px-1 py-0.5 bg-yellow-100 border border-yellow-400 text-yellow-800 font-bold">BETA</span>
              )}
            </div>
            {installedUpdates.includes('agentv_plus') ? (
              <>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { id: 'monitor', label: 'Monitor', icon: '▣', bg: '#0a0a0a', fg: '#00ff00' },
                    { id: 'wizard', label: 'Wizard', icon: '✦', bg: '#2a1040', fg: '#c084fc' },
                    { id: 'cat', label: 'Cat', icon: '🐱', bg: '#292524', fg: '#fbbf24' },
                    { id: 'neural', label: 'Neural', icon: '◉', bg: '#0a1628', fg: '#06b6d4' },
                    { id: 'ghost', label: 'Ghost', icon: '👻', bg: '#1e1e2e', fg: '#e2e8f0' },
                  ].map(s => (
                    <label key={s.id} className="flex flex-col items-center gap-1 cursor-pointer">
                      <div 
                        className={`w-12 h-12 border-2 flex items-center justify-center text-lg ${agentVSkin === s.id ? 'border-purple-700 shadow-[0_0_6px_rgba(107,33,168,0.5)]' : 'border-gray-500 hover:border-purple-400'}`}
                        style={{ backgroundColor: s.bg, color: s.fg }}
                      >
                        {s.icon}
                      </div>
                      <span className="text-[8px] uppercase font-bold tracking-wider" style={{ color: '#6b21a8' }}>{s.label}</span>
                      <input
                        type="radio"
                        name="agentskin"
                        value={s.id}
                        checked={agentVSkin === s.id}
                        onChange={() => setAgentVSkin(s.id)}
                        className="accent-purple-700"
                      />
                    </label>
                  ))}
                </div>
                <p className="text-[9px] text-gray-600 mt-1 italic">⚠ PLUS! skins are beta features and may cause visual anomalies.</p>
              </>
            ) : (
              <>
                <div className="flex gap-3 flex-wrap opacity-60">
                  {[
                    { id: 'monitor', label: 'Monitor', icon: '▣', bg: '#0a0a0a', fg: '#00ff00' },
                    { id: 'wizard', label: 'Wizard', icon: '✦', bg: '#2a1040', fg: '#c084fc' },
                    { id: 'cat', label: 'Cat', icon: '🐱', bg: '#292524', fg: '#fbbf24' },
                    { id: 'neural', label: 'Neural', icon: '◉', bg: '#0a1628', fg: '#06b6d4' },
                    { id: 'ghost', label: 'Ghost', icon: '👻', bg: '#1e1e2e', fg: '#e2e8f0' },
                  ].map(s => (
                    <div key={s.id} className="flex flex-col items-center gap-1">
                      <div 
                        className="w-12 h-12 border-2 border-gray-600 flex items-center justify-center text-lg relative"
                        style={{ backgroundColor: s.bg, color: s.fg }}
                      >
                        {s.icon}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-lg">🔒</span>
                        </div>
                      </div>
                      <span className="text-[8px] uppercase font-bold tracking-wider text-gray-500">{s.label}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (typeof (window as any).__launchAgentVPlusSetup === 'function') {
                      (window as any).__launchAgentVPlusSetup();
                    }
                  }}
                  className="mt-2 self-start px-4 py-1 text-xs font-bold border-2 text-white"
                  style={{ backgroundColor: '#6b21a8', borderTopColor: '#a855f7', borderLeftColor: '#a855f7', borderBottomColor: '#3b0764', borderRightColor: '#3b0764' }}
                >
                  ✦ Get PLUS! Expansion
                </button>
                <p className="text-[9px] text-gray-500 italic mt-0.5">Install the VAgent PLUS! Character Expansion from Vespera Update to unlock 5 premium skins.</p>
              </>
            )}
          </div>

          <p className="font-bold text-xs mt-2 border-t border-gray-400 pt-2">Audio Responses</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agentVSpeak}
              onChange={(e) => setAgentVSpeak(e.target.checked)}
            />
            <span className="text-xs">Use Synth Voice when speaking</span>
          </label>
        </div>

        <div className="mt-auto flex justify-end pt-1 shrink-0">
          <button
            onClick={handleApply}
            disabled={!isApplyEnabled}
            className="px-6 py-1 text-sm font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0] disabled:opacity-50 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-dotted"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  // ── Active panel router ───────────────────────────────────────────────────────
  const renderActivePanel = () => {
    if (!activePanel) return renderHub();
    if (activePanel === 'display') return renderDisplay();
    if (activePanel === 'addremove') return renderAddRemove();
    if (activePanel === 'taskbar') return renderTaskbarPanel();
    if (activePanel === 'users') return renderUsers();
    if (activePanel === 'vespera_update') return renderVesperaUpdate();
    if (activePanel === 'agent_v') return renderAgentVSettings();
    if (activePanel === 'system') return <SystemProperties onBack={() => setActivePanel(null)} vfs={vfs} currentUser={currentUser} neuralBridgeActive={neuralBridgeActive} />;
    const item = PANEL_ITEMS.find(p => p.id === activePanel);
    return item ? renderStub(item) : renderHub();
  };

  const [uninstallError, setUninstallError] = useState<string | null>(null);

  const handleUninstallRequest = () => {
    const app = (vfs?.nodes || []).find((a: any) => a.id === selectedAppId);
    if (!app) return;

    // "File in Use" check for Network Monitor
    if ((app.id === 'netmon_exe' || app.id === 'netmon') && windows?.find((w: any) => w.id === 'netmon')?.isOpen) {
      setUninstallError("UNINSTALL ERROR: The application is currently in use. Please close all Aetheris Network Monitor windows and try again.");
      return;
    }

    setUninstallTarget({ id: app.id, name: app.appDisplayName || app.name });
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] font-sans text-black relative select-none">
      {/* Title bar decoration - hub crumb */}
      {activePanel && (
        <div className="flex items-center gap-1 px-2 pt-1 text-[10px] text-gray-600">
          <span
            className="cursor-pointer hover:underline"
            onClick={() => setActivePanel(null)}
          >
            Control Panel
          </span>
          <span>›</span>
          <span className="font-bold">{PANEL_ITEMS.find(p => p.id === activePanel)?.label.replace('\n', ' ')}</span>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {renderActivePanel()}
      </div>

      {/* Status bar */}
      <div className="shrink-0 border-t-2 border-t-gray-700 bg-[#c0c0c0] px-2 py-0.5 flex items-center">
        <div className="flex-1 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white px-2 py-0.5 text-[10px] font-mono truncate min-h-[18px]">
          {hoverDesc || (activePanel
            ? PANEL_ITEMS.find(p => p.id === activePanel)?.description
            : 'Control Panel — Double-click an icon to open its settings.'
          )}
        </div>
        <div className="ml-1 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white px-2 py-0.5 text-[10px] font-mono whitespace-nowrap">
          {PANEL_ITEMS.length} object(s)
        </div>
      </div>

      {/* Resolution confirmation modal */}
      {confirming && (
        <div className="absolute inset-0 z-[99999] flex items-center justify-center pointer-events-auto">
          <div className="bg-[#c0c0c0] w-[380px] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[8px_8px_0px_rgba(0,0,0,0.5)] flex flex-col">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide flex justify-between">
              <span>Display Settings Recovery</span>
            </div>
            <div className="p-4 flex flex-col gap-4 items-center text-center">
              <Settings size={32} className="text-[#008080]" />
              <p className="text-sm font-bold tracking-wide">Display settings have been updated.</p>
              <p className="text-sm">
                Do you want to keep these settings?<br />
                Reverting in <span className="font-bold text-red-600 animate-pulse">{countdown}</span> seconds...
              </p>
              <div className="grid grid-cols-2 gap-4 mt-2 w-full">
                <button
                  onClick={handleConfirm}
                  className="px-2 py-1 font-bold text-sm border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0]"
                >
                  Keep Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 font-bold text-sm border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0]"
                >
                  Revert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uninstall Error Modal */}
      {uninstallError && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
          <div className="bg-[#c0c0c0] w-[360px] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[4px_4px_10px_rgba(0,0,0,0.5)] flex flex-col">
            <div className="bg-red-800 text-white px-2 py-1 font-bold text-xs uppercase tracking-widest flex justify-between">
              <span>UNINSTALL ERROR</span>
              <button 
                onClick={() => setUninstallError(null)}
                className="w-4 h-4 bg-[#c0c0c0] text-black border border-t-white border-l-white border-b-black border-r-black flex items-center justify-center"
              >
                X
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4 items-center text-center">
              <AlertCircle size={48} className="text-red-700" />
              <p className="text-xs font-bold leading-relaxed">{uninstallError}</p>
              <button
                onClick={() => setUninstallError(null)}
                className="px-8 py-1 font-bold text-sm border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uninstall confirmation modal */}
      {uninstallTarget && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
          <div className="bg-[#c0c0c0] w-[360px] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[4px_4px_10px_rgba(0,0,0,0.5)] flex flex-col">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide">
              Add/Remove Programs
            </div>
            <div className="p-4 flex flex-col gap-3 items-center text-center">
              <Trash2 size={28} className="text-red-700" />
              <p className="text-sm font-bold">Are you sure you want to remove this component?</p>
              <p className="text-xs border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white px-3 py-2 w-full font-mono">
                {uninstallTarget.name}
              </p>
              <p className="text-xs text-gray-600">
                All associated shortcuts will also be removed.
              </p>
              <div className="flex gap-4 mt-1">
                <button
                  onClick={() => {
                    if (uninstallTarget.id === 'rhid_exe') {
                      setUninstallError("Kernel and Major System updates cannot be uninstalled. Please seek admin.");
                      setUninstallTarget(null);
                    } else {
                      onLaunchUninstall?.(uninstallTarget.name, uninstallTarget.id);
                      setUninstallTarget(null);
                    }
                  }}
                  className="px-6 py-1 font-bold text-sm border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0]"
                >
                  Yes
                </button>
                <button
                  onClick={() => setUninstallTarget(null)}
                  className="px-6 py-1 font-bold text-sm border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0]"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
