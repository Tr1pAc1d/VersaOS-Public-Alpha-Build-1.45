import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Cpu, User, Package, Settings, ArrowLeft, HardDrive, Trash2, AlertCircle, Menu, ChevronRight, ChevronDown, FolderOpen, ArrowUp, ArrowDown, Plus, RotateCcw, Minus, Globe, Key, Shield, Download, CheckCircle, Sparkles, Loader, Volume2, Play, MessageSquare, MousePointer2, Clock, Printer, Type, Layout, Activity, Zap, History, Lock, Eye, Network } from 'lucide-react';
import { DEFAULT_WORKSPACE_MENU } from '../hooks/useVFS';
import { APP_DICTIONARY } from '../utils/appDictionary';
import { RETRO_ICONS } from '../utils/retroIcons';
import { SystemProperties } from './SystemProperties';
import { PLUS_THEMES, AVAILABLE_UPDATES, type SystemUpdate } from '../utils/plusThemes';
import { ScreensaverPreview, SCREENSAVER_OPTIONS, type ScreensaverType } from './Screensavers';
import { WIDGET_COMPONENTS } from './ActiveApplets';
import { WORKSPACE_MENU_THEME_COLORS, type AppletConfig } from '../hooks/useVFS';
import { playSound, applySchemeOverrides } from '../utils/audio';


// ── Panel items definition ────────────────────────────────────────────────────
interface PanelItem {
  id: string;
  label: string;
  description: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  iconColor: string;
  iconUrl?: string;
}

const PANEL_ITEMS: PanelItem[] = [
  {
    id: 'display',
    label: 'Display',
    description: 'Display: Configure your screen resolution and desktop colors.',
    Icon: Monitor,
    iconColor: 'text-[#008080]',
    iconUrl: '/Icons/display_properties-0.png'
  },
  {
    id: 'system',
    label: 'System',
    description: 'System: View hardware information and manage device resources.',
    Icon: Cpu,
    iconColor: 'text-[#000080]',
    iconUrl: '/Icons/computer-0.png'
  },
  {
    id: 'users',
    label: 'Users',
    description: 'Users: Manage user accounts and access permissions.',
    Icon: User,
    iconColor: 'text-[#4a4a8a]',
    iconUrl: '/Icons/users-0.png'
  },
  {
    id: 'addremove',
    label: 'Add/Remove\nPrograms',
    description: 'Add/Remove Programs: Install or remove software from your Vespera system.',
    Icon: Package,
    iconColor: 'text-[#7a4a00]',
    iconUrl: '/Icons/appwizard-0.png'
  },
  {
    id: 'taskbar',
    label: 'Task Menu',
    description: 'Task Menu: Customize the appearance and behavior of the Task Menu.',
    Icon: Menu,
    iconColor: 'text-[#4a4a8a]',
    iconUrl: '/Icons/start_menu_shortcuts.png'
  },
  {
    id: 'vespera_update',
    label: 'Vespera\nUpdate',
    description: 'Vespera Update: Check for and install system updates from VesperaNET.',
    Icon: Download,
    iconColor: 'text-[#006400]',
    iconUrl: '/Icons/windows_update_large-0.png'
  },
  {
    id: 'agent_v',
    label: 'Agent V',
    description: 'Agent V: Personalize your Vespera desktop assistant.',
    Icon: MessageSquare,
    iconColor: 'text-[#000080]',
    iconUrl: '/Icons/msagent-0.png'
  },
  {
    id: 'fonts',
    label: 'Fonts',
    description: 'Fonts: View and manage the fonts installed on your system.',
    Icon: Type,
    iconColor: 'text-[#800080]',
    iconUrl: '/Icons/directory_fonts-0.png'
  },
  {
    id: 'datetime',
    label: 'Date/Time',
    description: 'Date/Time: Change the date, time and time zone for your computer.',
    Icon: Clock,
    iconColor: 'text-[#000080]',
    iconUrl: '/Icons/time_and_date-0.png'
  },
  {
    id: 'sounds',
    label: 'Sounds',
    description: 'Sounds: Assign sounds to system events and change sound schemes.',
    Icon: Volume2,
    iconColor: 'text-[#008000]',
    iconUrl: '/Icons/loudspeaker_rays-0.png'
  },
  {
    id: 'regional',
    label: 'Regional\nSettings',
    description: 'Regional Settings: Customize how dates, times, and currency are displayed.',
    Icon: Globe,
    iconColor: 'text-[#008080]',
    iconUrl: '/Icons/world-0.png'
  },
  {
    id: 'printers',
    label: 'Printers',
    description: 'Printers: Add, remove and configure local and network printers.',
    Icon: Printer,
    iconColor: 'text-[#4a4a4a]',
    iconUrl: '/Icons/printer-0.png'
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'Accessibility: Adjust your computer settings for vision, hearing and mobility.',
    Icon: Key,
    iconColor: 'text-[#808000]',
    iconUrl: '/Icons/accessibility-0.png'
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Security: Monitor your system\'s data vault and neural shielding status.',
    Icon: Shield,
    iconColor: 'text-[#000080]',
    iconUrl: '/Icons/key_padlock-0.png'
  },
  {
    id: 'xtype_diag',
    label: 'X-Type\nDiagnostics',
    description: 'X-Type Diagnostics: Advanced tools for monitoring the Neural Bridge.',
    Icon: Activity,
    iconColor: 'text-[#8b0000]',
    iconUrl: '/Icons/bar_graph-0.png'
  },
  {
    id: 'network',
    label: 'Network',
    description: 'Network: Configure your connection to AETHERIS and local gateways.',
    Icon: Network,
    iconColor: 'text-[#006400]',
    iconUrl: '/Icons/network_normal_two_pcs-0.png'
  },
  {
    id: 'hardware_wiz',
    label: 'Hardware\nWizard',
    description: 'Hardware Wizard: Install or configure new hardware devices.',
    Icon: Cpu,
    iconColor: 'text-[#000080]',
    iconUrl: '/Icons/hardware-0.png'
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
  { id: 'black_thatch',name: 'Black Thatch',     url: '/wallpapers/Black_Thatch.png' },
  { id: 'blue_rivets',name: 'Blue Rivets',      url: '/wallpapers/Blue_Rivets.png' },
  { id: 'bubbles',    name: 'Bubbles',          url: '/wallpapers/Bubbles_(Windows_95).webp' },
  { id: 'carved',     name: 'Carved Stone',     url: '/wallpapers/Carved_Stone.png' },
  { id: 'circles',    name: 'Circles',          url: '/wallpapers/Circles_(Windows_95).png' },
  { id: 'flowers',    name: 'Flowers',          url: '/wallpapers/Flowers.png' },
  { id: 'forest_95',  name: 'Forest',           url: '/wallpapers/Forest_(Windows_95).webp' },
  { id: 'gold_weave', name: 'Gold Weave',       url: '/wallpapers/Gold_Weave.png' },
  { id: 'houndstooth',name: 'Houndstooth',      url: '/wallpapers/Houndstooth.png' },
  { id: 'metal_links',name: 'Metal Links',      url: '/wallpapers/Metal_Links.png' },
  { id: 'red_blocks', name: 'Red Blocks',       url: '/wallpapers/Red_Blocks.webp' },
  { id: 'sandstone',  name: 'Sandstone',        url: '/wallpapers/Sandstone_(Windows_95).webp' },
  { id: 'stitches',   name: 'Stitches',         url: '/wallpapers/Stitches.webp' },
  { id: 'triangles',  name: 'Triangles',        url: '/wallpapers/Triangles_(Windows_95).png' },
  { id: 'waves',      name: 'Waves',            url: '/wallpapers/Waves_(Windows_95).png' },
  { id: 'tiles_95',   name: 'Tiles (Windows 95)', url: '/wallpapers/Tiles_(Windows_95).png' },
  { id: 'abstract_tech', name: 'Abstract Tech', url: '/wallpapers/037Gml7gXXsjz1BdLXfOiPe.fit_lim.size_1050x578.v1569505914.jpg' },
  { id: 'snapshot_25', name: 'Snapshot 25', url: '/wallpapers/Snapshot_25.PNG' },
  { id: 'raytracing_1', name: '90s Ray Tracing 1', url: '/wallpapers/the-birth-of-digital-art-90s-ray-tracing-v0-9lytxi62gzge1.jpg' },
  { id: 'raytracing_2', name: '90s Ray Tracing 2', url: '/wallpapers/the-birth-of-digital-art-90s-ray-tracing-v0-m74ns7x1gzge1.jpg' },
  { id: 'raytracing_3', name: '90s Ray Tracing 3', url: '/wallpapers/the-birth-of-digital-art-90s-ray-tracing-v0-rmd6uvn1gzge1.jpg' },
  { id: 'retro_geo', name: 'Retro Geometric', url: '/wallpapers/tvuzjokogx84ozmfrchy.jpg' },
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
  const [selectedAppletId, setSelectedAppletId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [uninstallTarget, setUninstallTarget] = useState<{ id: string; name: string } | null>(null);

  // Display sub-panel state
  const currentRes = vfs.displaySettings?.resolution || '1024x768';
  const [selectedRes, setSelectedRes] = useState(currentRes);
  const [selectedWallpaper, setSelectedWallpaper] = useState(vfs.displaySettings?.wallpaper || '');
  const [selectedWallpaperLayout, setSelectedWallpaperLayout] = useState(vfs.displaySettings?.wallpaperLayout || 'cover');
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
  const [taskbarTab, setTaskbarTab] = useState<'Appearance' | 'Position' | 'Clock' | 'Shortcuts' | 'Workspace Menu' | 'Wave bar' | 'Active Applets'>('Appearance');
  const [activeApplets, setActiveApplets] = useState<Record<string, AppletConfig>>(vfs.displaySettings?.activeApplets || {});

  const [taskbarPosition, setTaskbarPosition] = useState<'top' | 'bottom' | 'left' | 'right'>(vfs.displaySettings?.taskbarPosition || 'bottom');
  const [taskbarSize, setTaskbarSize] = useState<number>(typeof vfs.displaySettings?.taskbarSize === 'number' ? vfs.displaySettings.taskbarSize : 56);
  const [taskbarSpanFull, setTaskbarSpanFull] = useState<boolean>(vfs.displaySettings?.taskbarSpanFull === true);

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

  // New Sub-Panel States
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [mockSystemTime, setMockSystemTime] = useState(new Date());
  const [highContrast, setHighContrast] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<string[]>([]);
  const [diagPulse, setDiagPulse] = useState(0);
  const [hardwareStep, setHardwareStep] = useState(0);
  const [hardwareFound, setHardwareFound] = useState<any[]>([]);

  // Sounds panel local state (synced to VFS)
  const [soundsVolume, setSoundsVolume] = useState(0);
  const [soundsMuted, setSoundsMuted] = useState(false);
  const [soundsTab, setSoundsTab] = useState<'Volume' | 'Sounds'>('Volume');
  const [soundsWaveVol, setSoundsWaveVol] = useState(0.8);
  const [soundsSynthVol, setSoundsSynthVol] = useState(0.9);
  const [soundsLineVol, setSoundsLineVol] = useState(0.5);
  const [soundsCdVol, setSoundsCdVol] = useState(0.7);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [soundsPreviewPlaying, setSoundsPreviewPlaying] = useState(false);
  const soundsPreviewRef = useRef<HTMLAudioElement | null>(null);
  const [soundsScheme, setSoundsScheme] = useState<string>('vespera');

  useEffect(() => {
    const timer = setInterval(() => setMockSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activePanel === 'security') {
      const logInterval = setInterval(() => {
        const lines = [
          `[${new Date().toLocaleTimeString()}] SENTINEL: Node ${Math.floor(Math.random() * 999)} sync OK.`,
          `[${new Date().toLocaleTimeString()}] CRYPTO: Rotating RSA keys (Level 4)...`,
          `[${new Date().toLocaleTimeString()}] SHIELD: Interference at ${Math.floor(Math.random() * 40)}Hz detected.`,
          `[${new Date().toLocaleTimeString()}] X-TYPE: Bridge load nominal.`
        ];
        setSecurityLogs(prev => [lines[Math.floor(Math.random() * lines.length)], ...prev].slice(0, 50));
      }, 3000);
      return () => clearInterval(logInterval);
    }
  }, [activePanel]);

  useEffect(() => {
    if (initialPanel) setActivePanel(initialPanel);
  }, [initialPanel]);

  // Sync Sounds panel locals when VFS sound settings change externally
  useEffect(() => {
    setSoundsVolume(vfs.displaySettings?.soundEffectsVolume ?? 1.0);
    setSoundsMuted(vfs.displaySettings?.systemMuted ?? false);
  }, [vfs.displaySettings?.soundEffectsVolume, vfs.displaySettings?.systemMuted]);

  // Sync state when returning to hub and vfs changes
  useEffect(() => {
    if (!activePanel) {
      setSelectedRes(vfs.displaySettings?.resolution || '1024x768');
      setSelectedWallpaper(vfs.displaySettings?.wallpaper || '');
      setSelectedWallpaperLayout(vfs.displaySettings?.wallpaperLayout || 'cover');
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
      setActiveApplets(vfs.displaySettings?.activeApplets || {});
      setSelectedCursorStyle(vfs.displaySettings?.cursorStyle || 'default');
      setAgentVEnabled(vfs.displaySettings?.agentVEnabled !== false);
      setAgentVSkin(vfs.displaySettings?.agentVSkin || 'classic');
      setAgentVSpeak(vfs.displaySettings?.agentVSpeak === true);
      setSelectedScreensaverType(vfs.displaySettings?.screensaverType || 'none');
      setSelectedScreensaverTimeout(vfs.displaySettings?.screensaverTimeout || 5);
      setTaskbarPosition(vfs.displaySettings?.taskbarPosition || 'bottom');
      setTaskbarSize(vfs.displaySettings?.taskbarSize || 56);
      setTaskbarSpanFull(vfs.displaySettings?.taskbarSpanFull === true);
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

    if (vfs.updateWallpaper) vfs.updateWallpaper(applyWallpaper, selectedWallpaperLayout);
    if (vfs.updateBackgroundColor) vfs.updateBackgroundColor(applyBgColor);
    if (vfs.updateTaskbarTheme) vfs.updateTaskbarTheme(applyTaskbarTheme);
    if (vfs.updateTaskbarClock) vfs.updateTaskbarClock(selectedTaskbarShowClock);
    if (vfs.updateClockSettings) vfs.updateClockSettings({ clockBgColor: applyClockBg, clockTextColor: applyClockText, clockFont, clockFormat });
    if (vfs.updatePinnedApps) vfs.updatePinnedApps(selectedPinnedApps);
    if (vfs.updatePlusTheme) vfs.updatePlusTheme(selectedPlusTheme);
    if (vfs.updateCursorStyle) vfs.updateCursorStyle(applyCursor);
    if (vfs.updateAgentVSettings) vfs.updateAgentVSettings(agentVEnabled, agentVSkin, agentVSpeak);
    if (vfs.updateTaskbarLayout) vfs.updateTaskbarLayout(taskbarPosition, taskbarSize, taskbarSpanFull);
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

    if (vfs.updateAppletSettings) {
      Object.entries(activeApplets).forEach(([id, config]) => {
        vfs.updateAppletSettings(id, config);
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
    selectedWallpaperLayout !== (vfs.displaySettings?.wallpaperLayout || 'cover') ||
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
    selectedScreensaverTimeout !== (vfs.displaySettings?.screensaverTimeout || 5) ||
    taskbarPosition !== (vfs.displaySettings?.taskbarPosition || 'bottom') ||
    taskbarSize !== (typeof vfs.displaySettings?.taskbarSize === 'number' ? vfs.displaySettings.taskbarSize : 56) ||
    taskbarSpanFull !== (vfs.displaySettings?.taskbarSpanFull === true) ||
    JSON.stringify(activeApplets) !== JSON.stringify(vfs.displaySettings?.activeApplets || {})
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
              {item.iconUrl ? (
                <img 
                  src={item.iconUrl} 
                  alt="" 
                  className="w-8 h-8 mt-1 object-contain" 
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <item.Icon
                  size={32}
                  className={`mt-1 ${item.iconColor} group-hover:text-white`}
                />
              )}
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
      {PanelHeader('Display Properties', Monitor, 'text-[#008080]', '/Icons/display_properties-0.png')}

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
            
            <div className="flex gap-6 flex-1 min-h-0">
              {/* Left Side: Wallpaper Selection */}
              <div className="flex-1 flex flex-col min-h-0">
                <p className="font-bold text-xs mb-1 shrink-0">Wallpaper</p>
                <div className={`border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 bg-white overflow-y-auto flex-1 ${!isMaximized && 'max-h-40'}`}>
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
              </div>
              
              {/* Right Side: Preview & Color Selector */}
              <div className="flex-1 flex flex-col items-center pt-2 min-h-0">
                {/* Monitor Preview */}
                <div className="relative scale-[0.85] origin-top shrink-0">
                  <div className="w-[180px] h-[140px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-2 flex flex-col shadow-[4px_4px_0px_rgba(0,0,0,0.4)]">
                    <div 
                      className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-hidden"
                      style={{ 
                        backgroundColor: selectedColor,
                        backgroundImage: selectedWallpaper ? `url('${selectedWallpaper}')` : 'none',
                        backgroundSize: selectedWallpaperLayout === 'stretch' ? '100% 100%' : (selectedWallpaperLayout === 'cover' ? 'cover' : 'auto'),
                        backgroundPosition: selectedWallpaperLayout === 'tile' ? 'top left' : 'center',
                        backgroundRepeat: selectedWallpaperLayout === 'tile' ? 'repeat' : 'no-repeat'
                      }}
                    />
                  </div>
                  <div className="w-16 h-4 mx-auto bg-[#808080] border-x-2 border-gray-600" />
                  <div className="w-24 h-4 mx-auto bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800" />
                </div>
                
                {/* Color and Layout Selector */}
                <div className="w-full mt-2 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 bg-[#c0c0c0] shrink-0">
                  <div className="flex gap-4">
                    {/* Size Options */}
                    <div className="w-1/3">
                      <p className="font-bold text-[10px] mb-1 leading-none">Display Mode</p>
                      <select 
                        value={selectedWallpaperLayout}
                        onChange={(e) => setSelectedWallpaperLayout(e.target.value)}
                        className="w-full text-[10px] bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-1 py-0.5 outline-none"
                      >
                        <option value="cover">Normal (Fit)</option>
                        <option value="stretch">Stretch</option>
                        <option value="center">Center</option>
                        <option value="tile">Tile</option>
                      </select>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex-1">
                      <p className="font-bold text-[10px] mb-1 leading-none">Background Color</p>
                      <div className="flex gap-2 flex-wrap items-center">
                        {COLORS.map(c => (
                          <button 
                            key={c.id} 
                            onClick={() => setSelectedColor(c.hex)}
                            title={c.name}
                            className={`w-4 h-4 flex items-center justify-center cursor-default ${selectedColor === c.hex ? 'border-2 border-black scale-125' : 'border border-t-gray-300 border-l-gray-300 border-b-black border-r-black hover:border-gray-500'}`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
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
                    {SCREENSAVER_OPTIONS
                      .filter(opt => !opt.plus || installedUpdates.includes('screensaver_plus'))
                      .map(opt => (
                        <div 
                          key={opt.id}
                          onClick={() => setSelectedScreensaverType(opt.id as ScreensaverType)}
                          className={`px-2 py-1 text-xs cursor-default flex flex-col ${selectedScreensaverType === opt.id ? 'bg-[#000080] text-white' : 'hover:bg-[#008080] hover:text-white'}`}
                        >
                          <span className="font-bold underline decoration-dotted flex items-center gap-1">
                            {opt.plus && <span className="text-yellow-500 text-[8px] font-black not-underline">★</span>}
                            {opt.name}
                          </span>
                          <span className={`text-[9px] ${selectedScreensaverType === opt.id ? 'text-blue-100' : 'text-gray-500'}`}>{opt.description}</span>
                        </div>
                      ))}
                    {/* Plus! upsell row when pack not installed */}
                    {!installedUpdates.includes('screensaver_plus') && (
                      <div className="px-2 py-1.5 border-t border-dashed border-gray-300 mt-1 flex items-start gap-1.5">
                        <span className="text-yellow-500 text-[10px] font-black shrink-0 mt-0.5">★</span>
                        <div>
                          <p className="text-[9px] font-bold text-[#000080]">Vespera Plus! Screen Saver Pack</p>
                          <p className="text-[8px] text-gray-500 leading-tight">10 new animated screen savers. Install from <span className="font-bold">Vespera Update</span> in Control Panel.</p>
                        </div>
                      </div>
                    )}
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
        {PanelHeader('Add/Remove Programs', Package, 'text-[#7a4a00]', '/Icons/appwizard-0.png', () => setSelectedAppId(null))}

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
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['programs', 'games', 'media', 'accessories', 'system', 'installed']));
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  // Drag-and-drop state
  const [dragItemId, setDragItemId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  // Right-click context menu for the tree
  const [wmContextMenu, setWmContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);
  // Ref on the tree container for coordinate math
  const treePanelRef = React.useRef<HTMLDivElement>(null);
  
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

  // ── New drag/context-menu helpers ────────────────────────────────────────

  /** Collect all folder items recursively, optionally excluding one id */
  const getAllFolders = (items: any[], excludeId?: string): any[] => {
    const result: any[] = [];
    for (const item of items) {
      if (item.type === 'folder' && item.id !== excludeId) {
        result.push(item);
        if (item.children) result.push(...getAllFolders(item.children, excludeId));
      }
    }
    return result;
  };

  /** Remove an item from anywhere in the tree and return it */
  const removeItemDeep = (items: any[], id: string): { items: any[]; removed: any | null } => {
    let removed: any = null;
    const newItems = items
      .filter((item) => {
        if (item.id === id) { removed = item; return false; }
        return true;
      })
      .map((item) => {
        if (item.children && !removed) {
          const res = removeItemDeep(item.children, id);
          if (res.removed) { removed = res.removed; return { ...item, children: res.items }; }
        }
        return item;
      });
    return { items: newItems, removed };
  };

  /** Move an item into a target folder */
  const moveItemToFolder = (itemId: string, folderId: string) => {
    const newMenu = JSON.parse(JSON.stringify(editingMenu));
    const { items: stripped, removed } = removeItemDeep(newMenu, itemId);
    if (!removed) return;
    const insert = (items: any[]): boolean => {
      for (const item of items) {
        if (item.id === folderId) {
          item.children = item.children || [];
          item.children.push(removed);
          return true;
        }
        if (item.children && insert(item.children)) return true;
      }
      return false;
    };
    insert(stripped);
    setEditingMenu(stripped);
    setExpandedFolders((prev) => new Set([...prev, folderId]));
    setWmContextMenu(null);
    setSelectedMenuItemId(itemId);
  };

  /** Handle a drag-drop onto a target row */
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragItemId || dragItemId === targetId) { setDragItemId(null); setDragOverId(null); return; }
    const newMenu = JSON.parse(JSON.stringify(editingMenu));
    const { items: stripped, removed } = removeItemDeep(newMenu, dragItemId);
    if (!removed) return;
    const insertNear = (items: any[]): boolean => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === targetId) {
          if (items[i].type === 'folder') {
            items[i].children = items[i].children || [];
            items[i].children.unshift(removed);
            setExpandedFolders((prev) => new Set([...prev, targetId]));
          } else {
            items.splice(i, 0, removed);
          }
          return true;
        }
        if (items[i].children && insertNear(items[i].children)) return true;
      }
      return false;
    };
    insertNear(stripped);
    setEditingMenu(stripped);
    setDragItemId(null);
    setDragOverId(null);
  };

  /** One-click smart categorisation — moves items out of Programs into Games / Media folders */
  const autoOrganize = () => {
    const newMenu = JSON.parse(JSON.stringify(editingMenu));
    const programsFolder = newMenu.find((i: any) => i.id === 'programs');
    if (!programsFolder) return;

    const gameActions = new Set(['vsweeper', 'packman']);
    const mediaActions = new Set(['media_player', 'retrotv', 'aw_release_radar', 'axis_paint']);

    const gamesApps: any[] = [];
    const mediaApps: any[] = [];
    const remaining: any[] = [];
    for (const child of (programsFolder.children || [])) {
      if (child.type === 'app' && gameActions.has(child.action)) gamesApps.push(child);
      else if (child.type === 'app' && mediaActions.has(child.action)) mediaApps.push(child);
      else remaining.push(child);
    }
    programsFolder.children = remaining;

    const getOrCreate = (id: string, label: string) => {
      let folder = newMenu.find((i: any) => i.id === id || (i.type === 'folder' && i.label === label));
      if (!folder) {
        folder = { id, label, icon: 'folder', type: 'folder', children: [] };
        const sep = newMenu.findIndex((i: any) => i.id === 'sep1');
        if (sep !== -1) newMenu.splice(sep, 0, folder); else newMenu.unshift(folder);
      }
      folder.children = folder.children || [];
      return folder;
    };

    if (gamesApps.length > 0) {
      const gf = getOrCreate('games', 'Games');
      for (const a of gamesApps) { if (!gf.children.some((c: any) => c.id === a.id)) gf.children.push(a); }
    }
    if (mediaApps.length > 0) {
      const mf = getOrCreate('media', 'Media');
      for (const a of mediaApps) { if (!mf.children.some((c: any) => c.id === a.id)) mf.children.push(a); }
    }

    setEditingMenu([...newMenu]);
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.add('programs');
      if (gamesApps.length > 0) next.add('games');
      if (mediaApps.length > 0) next.add('media');
      return next;
    });
  };

  // Recursive tree renderer for workspace menu editor
  const renderMenuTree = (items: any[], depth: number = 0) => {
    return items.map((item: any) => {
      if (item.type === 'separator') {
        return (
          <div key={item.id} className="flex items-center gap-1 py-0.5" style={{ paddingLeft: depth * 16 + 8 }}>
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
      const isBeingDragged = dragItemId === item.id;
      const isDropTarget = dragOverId === item.id;

      return (
        <div key={item.id}>
          <div
            className={`flex items-center gap-1 px-1 py-0.5 cursor-default text-xs select-none
              ${isSelected ? 'bg-[#000080] text-white' : 'hover:bg-blue-50'}
              ${isBeingDragged ? 'opacity-40' : ''}
              ${isDropTarget ? 'border-t-2 border-blue-500' : 'border-t-2 border-transparent'}`}
            style={{ paddingLeft: depth * 16 + 4 }}
            draggable={!isDynamic}
            onClick={() => { setSelectedMenuItemId(item.id); setWmContextMenu(null); }}
            onDragStart={(e) => { e.stopPropagation(); setDragItemId(item.id); }}
            onDragEnd={() => { setDragItemId(null); setDragOverId(null); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverId(item.id); }}
            onDrop={(e) => handleDrop(e, item.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!treePanelRef.current) return;
              const rect = treePanelRef.current.getBoundingClientRect();
              const sf = treePanelRef.current.offsetWidth > 0 ? rect.width / treePanelRef.current.offsetWidth : 1;
              const x = Math.min((e.clientX - rect.left) / sf, treePanelRef.current.offsetWidth - 170);
              const y = Math.min((e.clientY - rect.top) / sf, treePanelRef.current.offsetHeight - 120);
              setWmContextMenu({ x, y, itemId: item.id });
              setSelectedMenuItemId(item.id);
            }}
          >
            {/* Drag handle — hidden for dynamic/auto items */}
            {!isDynamic ? (
              <span
                className="shrink-0 text-[11px] leading-none cursor-grab active:cursor-grabbing mr-0.5"
                style={{ color: isSelected ? '#aaaaff' : '#aaaaaa' }}
                title="Drag to reorder"
              >⠿</span>
            ) : <span className="w-3 shrink-0" />}

            {isFolder ? (
              <button
                className="w-4 h-4 flex items-center justify-center shrink-0"
                onClick={(e) => { e.stopPropagation(); toggleExpandFolder(item.id); }}
              >
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            ) : <div className="w-4" />}

            {isFolder ? <FolderOpen size={12} className={isSelected ? 'text-white' : 'text-yellow-600'} /> : null}

            <span
              className={`truncate ${isDynamic ? 'italic' : ''} ${item.isSystem ? '' : 'text-blue-700'}`}
              style={isSelected ? { color: 'white' } : {}}
            >
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
      {PanelHeader('Task Menu Properties', Menu, 'text-[#4a4a8a]', '/Icons/start_menu_shortcuts.png')}

      {/* Tabs */}
      <div className="flex gap-1 border-b-2 border-white mt-1 relative z-10 px-1 overflow-x-auto scroller-hidden">
        {(['Appearance', 'Position', 'Clock', 'Shortcuts', 'Workspace Menu', 'Wave bar', 'Active Applets'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setTaskbarTab(tab)}
            className={`px-2 py-1 text-[11px] font-bold border-2 border-b-0 rounded-t-sm whitespace-nowrap ${
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
        
        {/* ── Position Tab ── */}
        {taskbarTab === 'Position' && (
          <>
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400">
              <Menu size={36} className="text-[#4a4a8a]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">Taskbar Layout</h2>
                <p className="text-xs text-gray-700 mt-1">Configure screen position and thickness.</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
              {/* Position Group */}
              <fieldset className="border-2 border-t-white border-l-white border-b-gray-400 border-r-gray-400 p-3 pt-4 relative mt-2">
                <legend className="absolute -top-2.5 left-2 bg-[#c0c0c0] px-1 text-xs text-black">Screen Edge</legend>
                <div className="flex gap-4">
                  {/* Visual Picker */}
                  <div className="relative w-24 h-[72px] shrink-0 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-blue-900 overflow-hidden">
                    {/* Ghost preview bar based on state */}
                    <div 
                      className="absolute bg-gray-300 border border-t-white border-l-white border-b-black border-r-black opacity-80"
                      style={{
                        ...(taskbarPosition === 'top' ? { top: 0, left: 0, right: 0, height: '12px' } : {}),
                        ...(taskbarPosition === 'bottom' ? { bottom: 0, left: 0, right: 0, height: '12px' } : {}),
                        ...(taskbarPosition === 'left' ? { top: 0, bottom: 0, left: 0, width: '12px' } : {}),
                        ...(taskbarPosition === 'right' ? { top: 0, bottom: 0, right: 0, width: '12px' } : {}),
                      }}
                    />
                  </div>
                  
                  {/* Radio buttons */}
                  <div className="flex flex-col gap-2 flex-1 justify-center">
                    {(['top', 'bottom', 'left', 'right'] as const).map(pos => (
                      <label key={pos} className="flex items-center gap-2 cursor-pointer group" onClick={() => setTaskbarPosition(pos)}>
                        <div className={`w-3 h-3 rounded-full border border-gray-600 bg-white flex items-center justify-center group-active:bg-gray-300 ${taskbarPosition === pos ? '!bg-[#c0c0c0] shadow-[inset_1px_1px_0_0_gray]' : ''}`}>
                          {taskbarPosition === pos && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                        </div>
                        <span className="text-xs capitalize">{pos}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>

              {/* Size Group */}
              <fieldset className="border-2 border-t-white border-l-white border-b-gray-400 border-r-gray-400 p-3 pt-4 relative mt-1">
                <legend className="absolute -top-2.5 left-2 bg-[#c0c0c0] px-1 text-xs text-black">Thickness (Pixels)</legend>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end mb-1 text-[10px] text-gray-700">
                    <div className="text-center w-8">Small<br/>40px</div>
                    <div className="text-center w-8">Normal<br/>56px</div>
                    <div className="text-center w-8">Large<br/>80px</div>
                  </div>
                  <input 
                    type="range" 
                    min={40} 
                    max={80} 
                    step={8}
                    value={taskbarSize} 
                    onChange={e => setTaskbarSize(Number(e.target.value))} 
                    className="w-full h-1 accent-[#000080]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1 px-[2%]">
                    <span>|</span><span>|</span><span>|</span><span>|</span><span>|</span><span>|</span>
                  </div>
                </div>
              </fieldset>

              <label className="flex items-start gap-2 mt-2 px-1 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  className="accent-[#000080]"
                  checked={taskbarSpanFull}
                  onChange={(e) => setTaskbarSpanFull(e.target.checked)}
                />
                <div>
                  <span className="font-bold text-sm tracking-wide leading-none">Span entire screen edge</span>
                  <p className="text-xs text-gray-600 leading-tight mt-0.5">Disables taskbar applets/widgets to conserve space.</p>
                </div>
              </label>
            </div>
          </>
        )}

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
                        {meta.customIcon ? (
                          <img src={meta.customIcon} alt="icon" className="w-[16px] h-[16px] pointer-events-none drop-shadow-sm" style={{ imageRendering: 'pixelated' }} draggable={false} />
                        ) : (
                          <meta.icon size={16} className={isPinned ? 'text-white' : meta.color} />
                        )}
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
            
            {/* Tree view — drag target on the outer container too so drops at the bottom register */}
            <div
              ref={treePanelRef}
              className="flex-1 min-h-[10rem] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-y-auto relative"
              onClick={() => setWmContextMenu(null)}
              onDragOver={(e) => e.preventDefault()}
            >
              {renderMenuTree(editingMenu)}

              {/* ── Right-click context menu ── */}
              {wmContextMenu && (() => {
                const ctxFound = findItemAndParent(editingMenu, wmContextMenu.itemId);
                const ctxItem = ctxFound?.item;
                const ctxIsSystem = ctxItem?.isSystem;
                const ctxIsFolder = ctxItem?.type === 'folder';
                const ctxFolders = getAllFolders(editingMenu, wmContextMenu.itemId);
                return (
                  <div
                    className="absolute bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.45)] z-50 py-1 text-xs"
                    style={{ left: wmContextMenu.x, top: wmContextMenu.y, minWidth: 164 }}
                    onContextMenu={(e) => e.preventDefault()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Move-to-folder entries */}
                    {!ctxIsFolder && ctxFolders.length > 0 && (
                      <>
                        <div className="px-3 py-0.5 text-gray-500 text-[9px] uppercase tracking-widest font-bold select-none">Move into…</div>
                        {ctxFolders.map((f: any) => (
                          <button
                            key={f.id}
                            className="w-full text-left px-4 py-1 flex items-center gap-1.5 hover:bg-[#000080] hover:text-white"
                            onClick={() => moveItemToFolder(wmContextMenu.itemId, f.id)}
                          >
                            <FolderOpen size={10} className="text-yellow-600 shrink-0" />
                            {f.label}
                          </button>
                        ))}
                        <div className="h-px bg-gray-500 mx-1 my-1" />
                      </>
                    )}
                    {/* Move Up / Down */}
                    <button
                      className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-1"
                      onClick={() => { moveItem('up'); setWmContextMenu(null); }}
                    >
                      <ArrowUp size={10} /> Move Up
                    </button>
                    <button
                      className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-1"
                      onClick={() => { moveItem('down'); setWmContextMenu(null); }}
                    >
                      <ArrowDown size={10} /> Move Down
                    </button>
                    <div className="h-px bg-gray-500 mx-1 my-1" />
                    {/* Remove */}
                    <button
                      disabled={!!ctxIsSystem}
                      className="w-full text-left px-4 py-1 hover:bg-[#000080] hover:text-white flex items-center gap-1 disabled:text-gray-400 disabled:pointer-events-none"
                      onClick={() => { if (!ctxIsSystem) { removeItem(); setWmContextMenu(null); } }}
                    >
                      <Minus size={10} /> Remove
                    </button>
                  </div>
                );
              })()}
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
              <button
                onClick={autoOrganize}
                title="Auto-sort games and media into their own folders"
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0] text-[#000080]"
              >
                <Sparkles size={10} /> Auto-Organize
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

        {taskbarTab === 'Active Applets' && (
          <>
            <div className="flex items-center gap-4 border-b pb-3 border-gray-400">
              <Package size={36} className="text-[#4a4a8a]" />
              <div>
                <h2 className="font-bold text-sm leading-none tracking-wide">Active Applets</h2>
                <p className="text-xs text-gray-700 mt-1">Select and configure desktop widgets.</p>
              </div>
            </div>

            <div className="flex gap-3 min-h-[12rem]">
              <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-y-auto">
                <p className="font-bold text-xs bg-gray-200 border-b border-gray-400 p-1 shrink-0">Available Applets</p>
                {Object.keys(WIDGET_COMPONENTS).map((id) => (
                  <div 
                    key={id} 
                    className={`flex items-center px-2 py-1.5 cursor-pointer text-xs ${selectedAppletId === id ? 'bg-[#000080] text-white' : 'hover:bg-gray-100 text-black'}`}
                    onClick={() => setSelectedAppletId(id)}
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={activeApplets[id]?.enabled || false}
                      onChange={(e) => setActiveApplets(prev => ({
                        ...prev,
                        [id]: { ...(prev[id] || { position: 'float', borderStyle: 'raised' }), enabled: e.target.checked }
                      }))}
                    />
                    <span>{id.replace('applet_', '').toUpperCase()}</span>
                  </div>
                ))}
              </div>

              <div className="w-[180px] shrink-0 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-2 flex flex-col gap-3">
                {selectedAppletId ? (
                  <>
                    <div className="flex flex-col gap-1 text-[10px]">
                      <span className="font-bold">Placement</span>
                      <div className="flex flex-col gap-1 ml-1 bg-white p-1 border border-gray-400">
                        {['float', 'dock_left', 'dock_right'].map(pos => (
                          <label key={pos} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`pos_${selectedAppletId}`}
                              checked={(activeApplets[selectedAppletId]?.position || 'float') === pos}
                              onChange={() => setActiveApplets(prev => ({
                                ...prev, [selectedAppletId]: { ...(prev[selectedAppletId] || {}), position: pos as any }
                              }))}
                            />
                            {pos === 'float' ? 'Floating' : pos === 'dock_left' ? 'Dock Left' : 'Dock Right'}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[10px]">
                      <span className="font-bold">Border Style</span>
                      <select 
                        className="border border-gray-400 bg-white"
                        value={activeApplets[selectedAppletId]?.borderStyle || 'raised'}
                        onChange={(e) => setActiveApplets(prev => ({
                          ...prev, [selectedAppletId]: { ...(prev[selectedAppletId] || {}), borderStyle: e.target.value as any }
                        }))}
                      >
                        <option value="none">None</option>
                        <option value="raised">Raised</option>
                        <option value="sunken">Sunken</option>
                      </select>
                    </div>

                    <div className="mt-auto border-t border-gray-400 pt-1">
                      <p className="text-[9px] text-[#cc0000] leading-tight flex items-start gap-1">
                        <AlertCircle size={10} className="shrink-0 mt-0.5" />
                        Color inherited from Task Menu theme.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[10px] text-gray-500 text-center italic">
                    Select an applet to configure its properties.
                  </div>
                )}
              </div>
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
        {PanelHeader('Users', User, 'text-[#4a4a8a]', '/Icons/users-0.png', () => setSelectedUserId(null))}

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

                <div className="text-xs text-gray-800 font-bold mb-1">Avatar / Profile Picture</div>
                {/* User Pics (real photos) */}
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">User Pictures</p>
                <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                  <div
                    onClick={() => vfs.updateSystemUser(selectedUserId!, { profilePic: '' })}
                    className={`w-10 h-10 shrink-0 flex items-center justify-center border cursor-pointer bg-white ${!selectedSystemUser.profilePic ? 'border-2 border-blue-600' : 'border-gray-400'}`}
                  >
                    <User size={20} className="text-gray-400" />
                  </div>
                  {Array.from({ length: 12 }, (_, i) => `/User Pics/Vespera_d (${i + 1}).jpg`).map((pic) => (
                    <img
                      key={pic}
                      src={pic}
                      onClick={() => vfs.updateSystemUser(selectedUserId!, { profilePic: pic })}
                      className={`w-10 h-10 shrink-0 object-cover border cursor-pointer ${selectedSystemUser.profilePic === pic ? 'border-2 border-blue-600' : 'border-gray-400'} hover:opacity-90`}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ))}
                </div>
                {/* Retro icon presets */}
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Icon Presets</p>
                <div className="flex gap-1 mb-3 overflow-x-auto pb-2 scroller-hidden">
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
        {PanelHeader('Vespera Update', Download, 'text-[#006400]', '/Icons/Extra Icons/move_system_file.ico')}

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
      {PanelHeader('Agent V Properties', MessageSquare, 'text-[#000080]', '/Icons/msagent-0.png')}
      
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

  // ── Sub-panel: Fonts ────────────────────────────────────────────────────────
  const renderFonts = () => {
    const fontFiles = (vfs?.nodes || []).filter((n: any) => n.parentId === 'v_fonts');
    
    return (
      <div className="flex flex-col h-full p-3 overflow-hidden">
        {PanelHeader('Fonts', Type, 'text-[#800080]', '/Icons/Extra Icons/font_tt.ico')}
        
        <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-y-auto p-1">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1">
            {fontFiles.map((f: any) => (
              <div 
                key={f.id} 
                onDoubleClick={() => setSelectedFont(f.name)}
                className={`flex flex-col items-center p-2 gap-1 cursor-default hover:bg-[#000080] hover:text-white group ${selectedFont === f.name ? 'bg-[#000080] text-white' : ''}`}
                onClick={() => setSelectedFont(f.name)}
              >
                <img src={f.customIcon || '/Icons/font_tt-0.png'} alt="" className="w-8 h-8 object-contain" style={{ imageRendering: 'pixelated' }} />
                <span className="text-[10px] text-center break-all leading-tight">{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 shrink-0 border-t border-gray-400 pt-2 flex justify-between items-center text-[10px] text-gray-600">
          <span>{fontFiles.length} font(s) installed.</span>
          <p className="italic">Double-click a font to preview it.</p>
        </div>

        {/* Font Preview Modal */}
        {selectedFont && (
          <div className="absolute inset-0 z-[100] bg-black/20 flex items-center justify-center p-4">
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black w-full max-w-md shadow-xl flex flex-col">
              <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center">
                <span className="text-xs font-bold font-sans">Font Viewer - {selectedFont}</span>
                <button onClick={() => setSelectedFont(null)} className="w-4 h-4 bg-[#c0c0c0] text-black border border-t-white border-l-white border-b-black border-r-black flex items-center justify-center">X</button>
              </div>
              <div className="p-4 bg-white m-2 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-y-auto max-h-[300px]">
                <div className="border-b border-gray-300 pb-2 mb-4">
                  <h2 className="text-lg font-bold">{selectedFont}</h2>
                  <p className="text-[10px] text-gray-500 italic">Installed: March 22, 1994</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">12pt</p>
                    <p className="text-sm">The quick brown fox jumps over the lazy dog. 1234567890</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">18pt</p>
                    <p className="text-lg">The quick brown fox jumps over the lazy dog.</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1">24pt</p>
                    <p className="text-2xl">The quick brown fox jumps over the lazy dog.</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-[10px] text-gray-400 mb-1">Full Character Set (UPPER)</p>
                    <p className="text-xl tracking-widest uppercase">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                  </div>
                </div>
              </div>
              <div className="p-2 flex justify-end">
                <button 
                  onClick={() => setSelectedFont(null)}
                  className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Sub-panel: Date/Time ───────────────────────────────────────────────────
  const renderDateTime = () => (
    <div className="flex flex-col h-full p-3">
      {PanelHeader('Date & Time', Clock, 'text-[#000080]', '/Icons/time_and_date-0.png')}
      
      <div className="flex-1 flex flex-col gap-4 mt-2">
        <div className="flex gap-4">
          {/* Calendar Side */}
          <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs">March 1994</span>
              <div className="flex gap-1">
                <button className="w-4 h-4 bg-[#c0c0c0] border border-gray-500 flex items-center justify-center text-[10px]">{'<'}</button>
                <button className="w-4 h-4 bg-[#c0c0c0] border border-gray-500 flex items-center justify-center text-[10px]">{'>'}</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <span key={d} className="text-[9px] font-bold text-gray-500">{d}</span>
              ))}
              {Array.from({ length: 31 }).map((_, i) => (
                <span 
                  key={i} 
                  className={`text-[10px] p-1 cursor-default ${i + 1 === 22 ? 'bg-[#000080] text-white font-bold' : 'hover:bg-gray-100'}`}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          </div>

          {/* Clock Side */}
          <div className="w-40 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white flex flex-col items-center justify-center p-4">
            {/* Analog Clock Mock */}
            <div className="w-24 h-24 rounded-full border-2 border-black relative mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 bg-black rounded-full z-10" />
                {/* Hour Hand */}
                <div className="absolute w-1 h-8 bg-black bottom-1/2 origin-bottom rotate-[45deg]" />
                {/* Minute Hand */}
                <div className="absolute w-0.5 h-10 bg-black bottom-1/2 origin-bottom rotate-[180deg]" />
                {/* Second Hand */}
                <div className="absolute w-px h-11 bg-red-600 bottom-1/2 origin-bottom rotate-[270deg]" />
              </div>
            </div>
            <span className="font-mono text-lg font-bold">{mockSystemTime.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-3">
          <p className="text-[10px] font-bold mb-2">Time Zone</p>
          <select className="w-full text-xs bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1">
            <option>(GMT-08:00) Pacific Time (US & Canada)</option>
            <option selected>(GMT-05:00) Eastern Time (US & Canada)</option>
            <option>(GMT+00:00) Greenwich Mean Time</option>
            <option>(GMT+01:00) AETHERIS Central Node</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-auto">
          <button className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold">Apply</button>
          <button onClick={() => setActivePanel(null)} className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold">OK</button>
        </div>
      </div>
    </div>
  );

  // ── Sub-panel: Regional Settings ──────────────────────────────────────────
  const renderRegional = () => (
    <div className="flex flex-col h-full p-3">
      {PanelHeader('Regional Settings', Globe, 'text-[#008080]', '/Icons/world-0.png')}
      
      <div className="flex-1 flex flex-col gap-4 mt-2">
        <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-3">
          <p className="text-[10px] font-bold mb-2">Regional Settings</p>
          <p className="text-[10px] text-gray-700 mb-2">Choose the language and country for which you want to use international settings.</p>
          <select className="w-full text-xs bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1">
            <option selected>English (United States)</option>
            <option>English (AETHERIS Primary)</option>
            <option>Deutsch (Deutschland)</option>
            <option>Français (France)</option>
            <option>日本語 (日本)</option>
          </select>
        </div>

        <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-3 flex flex-col gap-2">
          <p className="text-[10px] font-bold mb-1">Preview</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-600">Numbers:</span>
              <span className="text-xs font-mono bg-white border border-gray-400 p-1">123,456,789.00</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-600">Currency:</span>
              <span className="text-xs font-mono bg-white border border-gray-400 p-1">$123,456,789.00</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-600">Time:</span>
              <span className="text-xs font-mono bg-white border border-gray-400 p-1">{mockSystemTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-600">Date:</span>
              <span className="text-xs font-mono bg-white border border-gray-400 p-1">{mockSystemTime.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-auto">
          <button className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold">Apply</button>
          <button onClick={() => setActivePanel(null)} className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold">OK</button>
        </div>
      </div>
    </div>
  );

  // ── Sub-panel: Printers ────────────────────────────────────────────────────
  const renderPrinters = () => (
    <div className="flex flex-col h-full p-3 overflow-hidden">
      {PanelHeader('Printers', Printer, 'text-[#4a4a4a]', '/Icons/printer-0.png')}
      
      <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-y-auto p-1">
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          <div className="flex flex-col items-center p-2 gap-1 cursor-default hover:bg-[#000080] hover:text-white group">
            <Plus size={32} className="text-[#000080] group-hover:text-white" />
            <span className="text-[10px] text-center font-bold">Add Printer</span>
          </div>
          <div className="flex flex-col items-center p-2 gap-1 cursor-default hover:bg-[#000080] hover:text-white group">
            <Printer size={32} className="text-[#4a4a4a] group-hover:text-white" />
            <span className="text-[10px] text-center">VESPERA LaserWriter Pro</span>
            <span className="text-[8px] opacity-70">Ready</span>
          </div>
          <div className="flex flex-col items-center p-2 gap-1 cursor-default hover:bg-[#000080] hover:text-white group opacity-50">
            <Printer size={32} className="text-[#4a4a4a] group-hover:text-white" />
            <span className="text-[10px] text-center">DotMatrix 9-Pin (LPT1)</span>
            <span className="text-[8px] opacity-70">Offline</span>
          </div>
          <div className="flex flex-col items-center p-2 gap-1 cursor-default hover:bg-[#000080] hover:text-white group">
            <HardDrive size={32} className="text-[#008080] group-hover:text-white" />
            <span className="text-[10px] text-center">Print to File (.prn)</span>
            <span className="text-[8px] opacity-70">Virtual</span>
          </div>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-gray-600 bg-[#ececec] p-1 border-t border-gray-400">
        4 printer(s) found.
      </div>
    </div>
  );

  // ── Sub-panel: Accessibility ──────────────────────────────────────────────
  const renderAccessibility = () => (
    <div className="flex flex-col h-full p-3">
      {PanelHeader('Accessibility Options', Key, 'text-[#808000]', '/Icons/accessibility-0.png')}
      
      <div className="flex-1 flex flex-col gap-4 mt-2">
        <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-3">
          <p className="text-[10px] font-bold mb-2 uppercase tracking-wide">Display</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={highContrast}
              onChange={(e) => {
                setHighContrast(e.target.checked);
                if (e.target.checked) {
                  document.body.classList.add('high-contrast');
                } else {
                  document.body.classList.remove('high-contrast');
                }
              }}
            />
            <span className="text-xs font-bold">Use High Contrast</span>
          </label>
          <p className="text-[9px] text-gray-600 mt-2 italic">Designed for users with vision impairments. Overrides all system colors with black and yellow.</p>
        </div>

        <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-3">
          <p className="text-[10px] font-bold mb-2 uppercase tracking-wide">Keyboard</p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" />
              <span className="text-xs">Use StickyKeys</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" />
              <span className="text-xs">Use FilterKeys</span>
            </label>
          </div>
        </div>

        <div className="mt-auto flex justify-end gap-2">
          <button onClick={() => setActivePanel(null)} className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold">OK</button>
        </div>
      </div>
    </div>
  );


  // ── Sub-panel: Sounds ──────────────────────────────────────────────────────
  const renderSounds = () => {
    const handleVolumeChange = (vol: number) => {
      setSoundsVolume(vol);
      if (vfs.updateSoundSettings) vfs.updateSoundSettings(vol, soundsMuted);
    };
    const handleMuteChange = (muted: boolean) => {
      setSoundsMuted(muted);
      if (vfs.updateSoundSettings) vfs.updateSoundSettings(soundsVolume, muted);
    };

    // ── Sound events data & preview handlers (hoisted out of JSX) ──
    // Base (Vespera Default) sound events
    const BASE_EVENTS = [
      { id: 'start',           label: 'Start Vespera',   file: 'Vespera_Start_up.mp3',    src: '/Sounds/Startup/Vespera_Start_up.mp3',  category: 'System' },
      { id: 'shutdown',        label: 'Shut Down',       file: 'Vespera_Shut_Down.mp3',   src: '/Sounds/Shutdown/Vespera_Shut_Down.mp3', category: 'System' },
      { id: 'error',           label: 'Critical Stop',   file: 'Error.mp3',               src: '/Sounds/Alerts/Error.mp3',              category: 'Alerts' },
      { id: 'fatalError',      label: 'Fatal Error',     file: 'Fatal_Error.mp3',         src: '/Sounds/Alerts/Fatal_Error.mp3',        category: 'Alerts' },
      { id: 'alert',           label: 'System Alert',    file: 'Vespera_Alert.mp3',       src: '/Sounds/Alerts/Vespera_Alert.mp3',      category: 'Alerts' },
      { id: 'installComplete', label: 'Install Complete', file: 'Install_Complete.mp3',   src: '/Sounds/Alerts/Install_Complete.mp3',   category: 'Alerts' },
      { id: 'newMail',         label: 'New Mail',        file: 'info-computer-sound.mp3', src: '/Sounds/Misc/info-computer-sound.mp3',  category: 'Misc'   },
      { id: 'info',            label: 'Information',     file: 'info-computer-sound.mp3', src: '/Sounds/Misc/info-computer-sound.mp3',  category: 'Misc'   },
      { id: 'click',           label: 'UI Click',        file: 'Click.mp3',               src: '/Sounds/Apps/Misc%20sounds/Click.mp3',  category: 'Misc'   },
      { id: 'beep',            label: 'Beep',            file: 'Beep-doop-Beep.mp3',      src: '/Sounds/Misc/Beep-doop-Beep.mp3',       category: 'Misc'   },
    ] as const;

    const S = '/Sounds/Addition%20Sound%20options%20for%20Sounds%20in%20Control%20Panel/Sound%20Schemes';
    const F31  = `${S}/Windows%203.1.x,%2095,%20NT%203.1-4.0`;
    const F98  = `${S}/Windows%2098,%202000,%20ME`;
    const FXP  = `${S}/Windows%20XP/Build%202481`;
    const FV7  = `${S}/Windows%20Vista,%207`;
    const F8   = `${S}/Windows%208.x`;
    const F30  = `${S}/Windows%203.0%20MME`;

    type SndMap = Partial<Record<string,{file:string;src:string}>>;
    const SOUND_SCHEMES: Record<string,{label:string;map:SndMap}> = {
      vespera: { label: 'Vespera Default', map: {} },
      win31:   { label: 'Windows 3.x MME', map: {
        start:           { file:'BELLS (Startup).WAV',  src:`${F30}/BELLS%20(Startup).WAV` },
        shutdown:        { file:'WATER (Shutdown).WAV', src:`${F30}/WATER%20(Shutdown).WAV` },
        error:           { file:'BUMMER.WAV',           src:`${F30}/BUMMER.WAV` },
        fatalError:      { file:'DRAT.WAV',             src:`${F30}/DRAT.WAV` },
        alert:           { file:'CHORD.WAV',            src:`${F30}/CHORD.WAV` },
        installComplete: { file:'CLAP.WAV',             src:`${F30}/CLAP.WAV` },
        newMail:         { file:'GLASS.WAV',            src:`${F30}/GLASS.WAV` },
        info:            { file:'POP.WAV',              src:`${F30}/POP.WAV` },
        click:           { file:'POP.WAV',              src:`${F30}/POP.WAV` },
        beep:            { file:'DRUM.WAV',             src:`${F30}/DRUM.WAV` },
      }},
      win95:   { label: 'Windows 95 / NT 4.0', map: {
        start:           { file:'Windows NT Logon Sound.wav',  src:`${F31}/Windows%20NT%20Logon%20Sound.wav` },
        shutdown:        { file:'Windows NT Logoff Sound.wav', src:`${F31}/Windows%20NT%20Logoff%20Sound.wav` },
        error:           { file:'chord.wav',                   src:`${F31}/chord.wav` },
        fatalError:      { file:'chord.wav',                   src:`${F31}/chord.wav` },
        alert:           { file:'chimes.wav',                  src:`${F31}/chimes.wav` },
        installComplete: { file:'tada.wav',                    src:`${F31}/tada.wav` },
        newMail:         { file:'ding.wav',                    src:`${F31}/ding.wav` },
        info:            { file:'ding.wav',                    src:`${F31}/ding.wav` },
        click:           { file:'Start.wav',                   src:`${F31}/Start.wav` },
        beep:            { file:'ding.wav',                    src:`${F31}/ding.wav` },
      }},
      win98:   { label: 'Windows 98 / ME', map: {
        start:           { file:'The Microsoft Sound.wav',  src:`${F98}/The%20Microsoft%20Sound.wav` },
        shutdown:        { file:'Windows Logoff Sound.wav', src:`${F98}/Windows%20Logoff%20Sound.wav` },
        error:           { file:'chord.wav',                src:`${F98}/chord.wav` },
        fatalError:      { file:'chord.wav',                src:`${F98}/chord.wav` },
        alert:           { file:'chimes.wav',               src:`${F98}/chimes.wav` },
        installComplete: { file:'tada.wav',                 src:`${F98}/tada.wav` },
        newMail:         { file:'notify.wav',               src:`${F98}/notify.wav` },
        info:            { file:'ding.wav',                 src:`${F98}/ding.wav` },
        click:           { file:'ding.wav',                 src:`${F98}/ding.wav` },
        beep:            { file:'ding.wav',                 src:`${F98}/ding.wav` },
      }},
      winxp:   { label: 'Windows XP', map: {
        start:           { file:'Windows XP Startup.wav',       src:`${FXP}/Windows%20XP%20Startup.wav` },
        shutdown:        { file:'Windows XP Shutdown.wav',      src:`${FXP}/Windows%20XP%20Shutdown.wav` },
        error:           { file:'Windows XP Critical Stop.wav', src:`${FXP}/Windows%20XP%20Critical%20Stop.wav` },
        fatalError:      { file:'Windows XP Error.wav',         src:`${FXP}/Windows%20XP%20Error.wav` },
        alert:           { file:'Windows XP Exclamation.wav',   src:`${FXP}/Windows%20XP%20Exclamation.wav` },
        installComplete: { file:'Windows XP Notify.wav',        src:`${FXP}/Windows%20XP%20Notify.wav` },
        newMail:         { file:'Windows XP Notify.wav',        src:`${FXP}/Windows%20XP%20Notify.wav` },
        info:            { file:'Windows XP Ding.wav',          src:`${FXP}/Windows%20XP%20Ding.wav` },
        click:           { file:'Windows XP Menu Command.wav',  src:`${FXP}/Windows%20XP%20Menu%20Command.wav` },
        beep:            { file:'Windows XP Ding.wav',          src:`${FXP}/Windows%20XP%20Ding.wav` },
      }},
      vista7:  { label: 'Windows Vista / 7', map: {
        start:           { file:'Windows Startup.wav',       src:`${FV7}/Windows%20Startup.wav` },
        shutdown:        { file:'Windows Shutdown.wav',      src:`${FV7}/Windows%20Shutdown.wav` },
        error:           { file:'Windows Critical Stop.wav', src:`${FV7}/Windows%20Critical%20Stop.wav` },
        fatalError:      { file:'Windows Error.wav',         src:`${FV7}/Windows%20Error.wav` },
        alert:           { file:'Windows Exclamation.wav',   src:`${FV7}/Windows%20Exclamation.wav` },
        installComplete: { file:'Windows Notify.wav',        src:`${FV7}/Windows%20Notify.wav` },
        newMail:         { file:'Windows Notify.wav',        src:`${FV7}/Windows%20Notify.wav` },
        info:            { file:'Windows Ding.wav',          src:`${FV7}/Windows%20Ding.wav` },
        click:           { file:'Windows Menu Command.wav',  src:`${FV7}/Windows%20Menu%20Command.wav` },
        beep:            { file:'Windows Ding.wav',          src:`${FV7}/Windows%20Ding.wav` },
      }},
      win8:    { label: 'Windows 8', map: {
        start:           { file:'Windows Logon.wav',                 src:`${F8}/Windows%20Logon.wav` },
        shutdown:        { file:'Windows Foreground.wav',            src:`${F8}/Windows%20Foreground.wav` },
        error:           { file:'Windows Hardware Fail.wav',         src:`${F8}/Windows%20Hardware%20Fail.wav` },
        fatalError:      { file:'Windows Hardware Fail.wav',         src:`${F8}/Windows%20Hardware%20Fail.wav` },
        alert:           { file:'Windows Notify System Generic.wav', src:`${F8}/Windows%20Notify%20System%20Generic.wav` },
        installComplete: { file:'Windows Notify Email.wav',          src:`${F8}/Windows%20Notify%20Email.wav` },
        newMail:         { file:'Windows Notify Email.wav',          src:`${F8}/Windows%20Notify%20Email.wav` },
        info:            { file:'Windows Notify System Generic.wav', src:`${F8}/Windows%20Notify%20System%20Generic.wav` },
        click:           { file:'Windows Foreground.wav',            src:`${F8}/Windows%20Foreground.wav` },
        beep:            { file:'Windows Background.wav',            src:`${F8}/Windows%20Background.wav` },
      }},
      robotz:  { label: 'Plus! Robotz', map: {
        start:           { file:'Robotz Windows Start.wav',  src:`${F31}/Robotz%20Windows%20Start.wav` },
        shutdown:        { file:'Robotz Windows Exit.wav',   src:`${F31}/Robotz%20Windows%20Exit.wav` },
        error:           { file:'Robotz Critical Stop.wav',  src:`${F31}/Robotz%20Critical%20Stop.wav` },
        fatalError:      { file:'Robotz Error.wav',          src:`${F31}/Robotz%20Error.wav` },
        alert:           { file:'Robotz Exclamation.wav',    src:`${F31}/Robotz%20Exclamation.wav` },
        installComplete: { file:'Robotz Default.wav',        src:`${F31}/Robotz%20Default.wav` },
        newMail:         { file:'Robotz Default.wav',        src:`${F31}/Robotz%20Default.wav` },
        info:            { file:'Robotz Asterisk.wav',       src:`${F31}/Robotz%20Asterisk.wav` },
        click:           { file:'Robotz Menu Command.wav',   src:`${F31}/Robotz%20Menu%20Command.wav` },
        beep:            { file:'Robotz Default.wav',        src:`${F31}/Robotz%20Default.wav` },
      }},
      utopia:  { label: 'Plus! Utopia', map: {
        start:           { file:'Utopia Windows Start.wav',  src:`${F31}/Utopia%20Windows%20Start.wav` },
        shutdown:        { file:'Utopia Windows Exit.wav',   src:`${F31}/Utopia%20Windows%20Exit.wav` },
        error:           { file:'Utopia Critical Stop.wav',  src:`${F31}/Utopia%20Critical%20Stop.wav` },
        fatalError:      { file:'Utopia Error.wav',          src:`${F31}/Utopia%20Error.wav` },
        alert:           { file:'Utopia Exclamation.wav',    src:`${F31}/Utopia%20Exclamation.wav` },
        installComplete: { file:'Utopia Default.wav',        src:`${F31}/Utopia%20Default.wav` },
        newMail:         { file:'Utopia Default.wav',        src:`${F31}/Utopia%20Default.wav` },
        info:            { file:'Utopia Asterisk.wav',       src:`${F31}/Utopia%20Asterisk.wav` },
        click:           { file:'Utopia Menu Command.wav',   src:`${F31}/Utopia%20Menu%20Command.wav` },
        beep:            { file:'Utopia Default.wav',        src:`${F31}/Utopia%20Default.wav` },
      }},
      win2000: { label: 'Windows 2000', map: {
        start:           { file:'logon (2000 Beta 3, later).wav',  src:`${F98}/logon%20(2000%20Beta%203,%20later).wav` },
        shutdown:        { file:'logoff (2000 Beta 3, later).wav', src:`${F98}/logoff%20(2000%20Beta%203,%20later).wav` },
        error:           { file:'chord.wav',                       src:`${F98}/chord.wav` },
        fatalError:      { file:'chord.wav',                       src:`${F98}/chord.wav` },
        alert:           { file:'chimes.wav',                      src:`${F98}/chimes.wav` },
        installComplete: { file:'tada.wav',                        src:`${F98}/tada.wav` },
        newMail:         { file:'notify.wav',                      src:`${F98}/notify.wav` },
        info:            { file:'ding.wav',                        src:`${F98}/ding.wav` },
        click:           { file:'ding.wav',                        src:`${F98}/ding.wav` },
        beep:            { file:'ding.wav',                        src:`${F98}/ding.wav` },
      }},
      macos:   { label: 'macOS (Classic)', map: {
        start:           { file:'PCI based Power Mac Startup.wav', src:`${S}/MacOS/PCI%20based%20Power%20Mac%20Startup.wav` },
        shutdown:        { file:'Windows Shutdown.wav',            src:`${FV7}/Windows%20Shutdown.wav` },
        error:           { file:'Windows Critical Stop.wav',       src:`${FV7}/Windows%20Critical%20Stop.wav` },
        fatalError:      { file:'Windows Error.wav',               src:`${FV7}/Windows%20Error.wav` },
        alert:           { file:'chimes.wav',                      src:`${F98}/chimes.wav` },
        installComplete: { file:'tada.wav',                        src:`${F98}/tada.wav` },
        newMail:         { file:'notify.wav',                      src:`${F98}/notify.wav` },
        info:            { file:'ding.wav',                        src:`${F98}/ding.wav` },
        click:           { file:'ding.wav',                        src:`${F98}/ding.wav` },
        beep:            { file:'ding.wav',                        src:`${F98}/ding.wav` },
      }},
    };

    const schemeMap = SOUND_SCHEMES[soundsScheme]?.map ?? {};
    const SOUND_EVENTS = BASE_EVENTS.map(ev => ({ ...ev, ...(schemeMap[ev.id] ?? {}) }));
    const SOUND_CATEGORIES = ['System', 'Alerts', 'Misc'] as const;
    const selectedEvent = SOUND_EVENTS.find(e => e.id === selectedEventId) ?? null;

    const handlePreview = () => {
      if (!selectedEvent) return;
      if (soundsPreviewRef.current) {
        soundsPreviewRef.current.pause();
        soundsPreviewRef.current = null;
      }
      setSoundsPreviewPlaying(true);
      const audio = new Audio(selectedEvent.src);
      audio.volume = Math.max(0, Math.min(1, soundsVolume));
      soundsPreviewRef.current = audio;
      audio.onended = () => setSoundsPreviewPlaying(false);
      audio.onerror = () => setSoundsPreviewPlaying(false);
      audio.play().catch(() => setSoundsPreviewPlaying(false));
    };

    const handleStopPreview = () => {
      if (soundsPreviewRef.current) {
        soundsPreviewRef.current.pause();
        soundsPreviewRef.current = null;
      }
      setSoundsPreviewPlaying(false);
    };


    // Cosmetic vertical slider (matches VolumeControl.tsx style)
    const MiniSliderCol = ({
      title, vol, setVol, muted, setMuted, muteLabel = 'Mute'
    }: { title: string; vol: number; setVol: (v: number) => void; muted: boolean; setMuted: (m: boolean) => void; muteLabel?: string; }) => (
      <div className="flex flex-col items-center border-r-[2px] border-r-white border-b-white pr-2 mr-2 last:border-r-0 last:mr-0 last:pr-0">
        <div className="text-[9px] mb-2 text-center w-[62px] min-h-[28px] font-bold leading-tight">{title}</div>
        <div className="text-[9px] mb-1 self-start pl-1">Volume:</div>
        <div
          className="relative h-24 w-10 flex justify-center mb-3 cursor-pointer"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const update = (y: number) => {
              const v = Math.max(0, Math.min(1, 1 - (y - rect.top) / rect.height));
              setVol(v);
            };
            update(e.clientY);
            const onMove = (me: PointerEvent) => update(me.clientY);
            const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
          }}
        >
          <div className="absolute inset-y-0 w-1.5 bg-gray-800 border-r border-b border-white pointer-events-none" />
          <div
            className="absolute w-7 h-3 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow shadow-black/20 pointer-events-none"
            style={{ bottom: (vol * 100) + '%', transform: 'translateY(50%)' }}
          />
          <div className="absolute inset-y-0 left-0 w-1.5 flex flex-col justify-between py-1 pointer-events-none">
            {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-px bg-gray-500" />)}
          </div>
        </div>
        <div className="mt-auto mb-1 flex items-center w-full pl-0.5">
          <input
            type="checkbox"
            id={`snd-mute-${title}`}
            checked={muted}
            onChange={(e) => setMuted(e.target.checked)}
            className="mr-1"
          />
          <label htmlFor={`snd-mute-${title}`} className="text-[9px] select-none">{muteLabel}</label>
        </div>
      </div>
    );

    return (
      <div className="flex flex-col h-full p-3 overflow-hidden">
        {PanelHeader('Sounds Properties', Volume2, 'text-[#008000]', '/Icons/loudspeaker_rays-0.png')}

        {/* Tabs */}
        <div className="flex gap-[2px] border-b-2 border-white mt-1 relative z-10 px-1">
          {(['Volume', 'Sounds'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSoundsTab(tab)}
              className={`px-3 py-1 text-xs font-bold border-2 border-b-0 rounded-t-sm whitespace-nowrap ${
                soundsTab === tab
                  ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800 pb-2 -mb-0.5 z-20'
                  : 'bg-gray-300 border-t-white border-l-white border-r-gray-800 mt-1 cursor-pointer'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] -mt-0.5 relative z-0 overflow-hidden flex flex-col">

          {/* ── Volume Tab ── */}
          {soundsTab === 'Volume' && (
            <div className="flex flex-col h-full p-3 gap-3 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center gap-3 border-b pb-2 border-gray-400 shrink-0">
                <Volume2 size={28} className="text-[#008000] shrink-0" />
                <div>
                  <p className="font-bold text-xs leading-none">Master Volume</p>
                  <p className="text-[9px] text-gray-600 mt-0.5">Controls all system sounds. Changes apply immediately.</p>
                </div>
              </div>

              {/* Master volume row */}
              <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-3 shrink-0">
                <p className="text-[10px] font-bold mb-2">Master System Volume</p>
                <div className="flex items-center gap-2 w-full">
                  <Volume2 size={12} className="text-gray-500 shrink-0" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={soundsVolume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="flex-1 h-2 accent-[#000080] cursor-pointer"
                  />
                  <Volume2 size={16} className="text-gray-700 shrink-0" />
                  <span className="text-[10px] font-mono w-8 text-right">{Math.round(soundsVolume * 100)}%</span>
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundsMuted}
                    onChange={(e) => handleMuteChange(e.target.checked)}
                    className="accent-[#000080]"
                  />
                  <span className="text-[10px] font-bold select-none">Mute All Sounds</span>
                </label>
              </div>

              {/* Mixer channels (cosmetic, matching VolumeControl.tsx) */}
              <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#c0c0c0] p-2 shrink-0">
                <p className="text-[10px] font-bold mb-2">Audio Mixer</p>
                <div className="flex overflow-x-auto pb-1">
                  <MiniSliderCol title="Volume Control" vol={soundsVolume} setVol={handleVolumeChange} muted={soundsMuted} setMuted={handleMuteChange} muteLabel="Mute all" />
                  <MiniSliderCol title="Wave" vol={soundsWaveVol} setVol={setSoundsWaveVol} muted={false} setMuted={() => {}} />
                  <MiniSliderCol title="SW Synth" vol={soundsSynthVol} setVol={setSoundsSynthVol} muted={false} setMuted={() => {}} />
                  <MiniSliderCol title="Line In" vol={soundsLineVol} setVol={setSoundsLineVol} muted={true} setMuted={() => {}} />
                  <MiniSliderCol title="CD Audio" vol={soundsCdVol} setVol={setSoundsCdVol} muted={false} setMuted={() => {}} />
                </div>
                <div className="text-[9px] text-gray-500 mt-1 border-t border-gray-400 pt-1">ESS Maestro</div>
              </div>

              {/* Open Volume Control link */}
              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('launch-app', { detail: 'volume_control' }))}
                  className="text-[10px] underline text-blue-800 hover:text-blue-600 bg-transparent border-none cursor-pointer p-0"
                >
                  Open Volume Control...
                </button>
                <span className="text-[9px] text-gray-500">(Advanced mixer window)</span>
              </div>
            </div>
          )}

          {/* ── Sound Events Tab ── */}
          {soundsTab === 'Sounds' && (
            <div className="flex flex-col h-full p-3 gap-2 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2 border-b pb-2 border-gray-400 shrink-0">
                <Volume2 size={18} className="text-[#008000] shrink-0" />
                <div>
                  <p className="text-xs font-bold leading-none">Sound Events</p>
                  <p className="text-[9px] text-gray-600 mt-0.5">Select an event then click Preview to hear it.</p>
                </div>
              </div>

              {/* Event list */}
              <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-y-auto min-h-0">
                {SOUND_CATEGORIES.map(cat => (
                  <div key={cat}>
                    <div className="px-2 py-0.5 bg-[#d9d9d9] border-b border-gray-300 text-[9px] font-bold uppercase tracking-wider text-gray-600">
                      {cat}
                    </div>
                    {SOUND_EVENTS.filter(e => e.category === cat).map(ev => (
                      <div
                        key={ev.id}
                        onClick={() => { setSelectedEventId(ev.id); if (soundsPreviewPlaying) handleStopPreview(); }}
                        className={`flex items-center justify-between px-2 py-1 text-xs cursor-default select-none ${
                          selectedEventId === ev.id
                            ? 'bg-[#000080] text-white'
                            : 'hover:bg-[#c0e0ff]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Volume2 size={10} className={selectedEventId === ev.id ? 'text-white opacity-80' : 'text-gray-400'} />
                          <span className="font-bold">{ev.label}</span>
                        </div>
                        <span className={`text-[9px] font-mono truncate max-w-[120px] ${
                          selectedEventId === ev.id ? 'text-blue-200' : 'text-gray-500'
                        }`}>{ev.file}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Preview controls */}
              <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-2 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold mb-0.5">Sound for this event:</p>
                    <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white px-2 py-0.5 text-[10px] font-mono truncate">
                      {selectedEvent ? selectedEvent.file : '(select an event above)'}
                    </div>
                  </div>
                  <button
                    disabled={!selectedEvent && !soundsPreviewPlaying}
                    onClick={soundsPreviewPlaying ? handleStopPreview : handlePreview}
                    title={soundsPreviewPlaying ? 'Stop' : 'Preview'}
                    className="mt-4 flex items-center gap-1 px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[10px] font-bold disabled:opacity-40 whitespace-nowrap"
                  >
                    {soundsPreviewPlaying
                      ? <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 bg-black" />Stop</span>
                      : <span className="flex items-center gap-1"><Play size={10} />Preview</span>
                    }
                  </button>
                </div>
              </div>

              {/* Scheme selector */}
              <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-2 shrink-0">
                <p className="text-[10px] font-bold mb-1">Sound Scheme:</p>
                <div className="flex items-center gap-2">
                  <select
                    value={soundsScheme}
                    onChange={(e) => { setSoundsScheme(e.target.value); setSelectedEventId(null); handleStopPreview(); }}
                    className="flex-1 text-xs bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-1 py-0.5"
                  >
                    {Object.entries(SOUND_SCHEMES).map(([id, s]) => (
                      <option key={id} value={id}>{s.label}</option>
                    ))}
                  </select>
                  <button
                    className="px-3 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[10px] font-bold"
                    title="Scheme is cosmetic — sounds are applied immediately on preview"
                  >
                    Save As...
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-2 shrink-0 mt-2">
          <button
            onClick={() => setActivePanel(null)}
            className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
          >
            OK
          </button>
        </div>
      </div>
    );
  };


  // ── Sub-panel: Security Center ─────────────────────────────────────────────
  const renderSecurity = () => (
    <div className="flex flex-col h-full p-3 overflow-hidden">
      {PanelHeader('Security Center', Shield, 'text-[#000080]', '/Icons/key_padlock-0.png')}
      
      <div className="flex-1 flex flex-col gap-3 mt-2 overflow-hidden">
        <div className="grid grid-cols-2 gap-3 h-1/2">
          {/* Sentinel Vault */}
          <div className="flex flex-col border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-black p-2 overflow-hidden">
            <div className="flex justify-between items-center border-b border-gray-700 pb-1 mb-1">
              <span className="text-[10px] font-bold text-green-500 uppercase">Sentinel Vault Status</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-[9px] text-green-400 leading-tight">
              {securityLogs.map((log, i) => <div key={i}>{log}</div>)}
              <div className="animate-pulse">_</div>
            </div>
          </div>

          {/* Neural Shielding */}
          <div className="flex flex-col border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-2">
            <span className="text-[10px] font-bold mb-2 uppercase">Neural Shielding</span>
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-full bg-gray-400 h-4 border border-gray-600 relative">
                <div 
                  className="h-full bg-blue-600 transition-all duration-1000" 
                  style={{ width: `${85 + Math.sin(Date.now() / 1000) * 5}%` }} 
                />
              </div>
              <p className="text-[9px] text-center text-gray-700">Integrity: <span className="font-bold text-blue-800">NOMINAL</span></p>
              <div className="grid grid-cols-2 gap-2 w-full">
                <button className="px-2 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-[9px] font-bold">Refresh</button>
                <button className="px-2 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-[9px] font-bold">Tune</button>
              </div>
            </div>
          </div>
        </div>

        {/* Password Management */}
        <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-3">
          <p className="text-[10px] font-bold mb-3 uppercase border-b border-gray-400 pb-1">User Credentials</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <User size={24} className="text-[#000080]" />
              <div className="flex-1">
                <p className="text-xs font-bold">{currentUser?.username || 'System Admin'}</p>
                <p className="text-[10px] text-gray-600">Level 4 Clearance</p>
              </div>
              <button className="px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[10px] font-bold">Change Password</button>
            </div>
            <div className="p-2 bg-yellow-50 border border-yellow-200 text-[9px] text-yellow-800">
              <strong>Security Tip:</strong> Neural Bridge passwords should contain at least 12 symbols and 2 biometric hashes.
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 shrink-0">
          <button onClick={() => setActivePanel(null)} className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold">Exit</button>
        </div>
      </div>
    </div>
  );

  // ── Sub-panel: X-Type Diagnostics ──────────────────────────────────────────
  const renderXTypeDiag = () => (
    <div className="flex flex-col h-full p-3 overflow-hidden">
      {PanelHeader('X-Type Diagnostics', Activity, 'text-[#8b0000]', '/Icons/bar_graph-0.png')}
      
      <div className="flex-1 flex flex-col gap-3 mt-2 overflow-hidden">
        {/* Signal Analysis */}
        <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-black h-40 relative overflow-hidden">
          <div className="absolute top-1 left-2 text-[8px] text-red-500 font-mono z-10">BRIDGE SIGNAL ANALYSIS - REALTIME</div>
          <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="none">
            <path 
              d={`M0 80 ${Array.from({ length: 40 }).map((_, i) => `L${i * 10} ${80 + Math.sin((Date.now() / 200) + i) * (20 + Math.random() * 40)}`).join(' ')}`}
              fill="none" 
              stroke="#ff0000" 
              strokeWidth="2" 
              className="opacity-80"
            />
            <path 
              d={`M0 80 ${Array.from({ length: 40 }).map((_, i) => `L${i * 10} ${80 + Math.cos((Date.now() / 150) + i) * (10 + Math.random() * 20)}`).join(' ')}`}
              fill="none" 
              stroke="#00ff41" 
              strokeWidth="1" 
              className="opacity-40"
            />
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
          {/* Heuristic Compiler */}
          <div className="flex flex-col border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-2 overflow-hidden">
            <span className="text-[10px] font-bold mb-1 uppercase tracking-tight">Synap-C Compiler</span>
            <div className="flex-1 bg-black p-1 font-mono text-[8px] text-[#00ff41] overflow-y-auto leading-none">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="mb-1 opacity-80">
                  {`> PUSH NODE_${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase()}`}
                  <br />
                  {`> RESOLVING SYMBOL: ${['ALPHA', 'BETA', 'AXIS', 'THORNE', 'BRIDGE'][Math.floor(Math.random() * 5)]}... OK`}
                </div>
              ))}
              <div className="animate-pulse">_</div>
            </div>
          </div>

          {/* Core Controls */}
          <div className="flex flex-col border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-3 gap-3">
            <span className="text-[10px] font-bold uppercase tracking-tight">Core Maintenance</span>
            <button 
              className="px-2 py-1 bg-red-800 text-white border-2 border-t-red-400 border-l-red-400 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-red-400 active:border-r-red-400 text-[10px] font-bold"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('vespera-system-error', {
                  detail: { type: 'Maintenance Warning', title: 'Manual Flush Initiated', message: 'The Neural Bridge signal is being manually reset. Please remain calm.', fatal: false }
                }));
              }}
            >
              Manual Core Flush
            </button>
            <div className="mt-auto space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                <span className="text-[10px]">Enable Heuristic Cache</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" />
                <span className="text-[10px]">Shadow Sector Access</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Sub-panel: Hardware Wizard ─────────────────────────────────────────────
  const renderHardwareWizard = () => {
    const steps = [
      { 
        title: 'Add New Hardware Wizard', 
        content: 'This wizard helps you install software to make a new hardware device work with your computer.\n\nIf you have a disk that came with your device, click Cancel and use the Disk Install utility instead.'
      },
      { 
        title: 'Scanning System...', 
        content: 'Vespera is now searching for new hardware connected to your system. This may take a few minutes if you have multiple Neural Bridge extensions.',
        loading: true
      },
      { 
        title: 'Hardware Found!', 
        content: 'The following hardware was detected and initialized:',
        devices: ['Axis Quantum Storage Controller', 'High-Speed Neural Interconnect v2.4', 'Vespera SoundBoard 16-bit']
      },
      { 
        title: 'Installation Complete', 
        content: 'Your new hardware has been installed and is ready to use. You may need to reboot Vespera for some changes to take effect.'
      }
    ];

    const step = steps[hardwareStep] || steps[0];

    return (
      <div className="flex flex-col h-full p-4 bg-[#c0c0c0]">
        <div className="flex-1 flex gap-4">
          <div className="w-24 shrink-0 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-gray-400 flex items-center justify-center">
             <Cpu size={48} className="text-gray-200 opacity-50" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <h2 className="font-bold text-sm tracking-wide">{step.title}</h2>
            <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-3 text-xs whitespace-pre-line leading-relaxed">
              {step.content}
              {step.loading && (
                <div className="mt-8 flex flex-col items-center gap-2">
                  <div className="w-48 h-4 border border-gray-600 bg-gray-200 overflow-hidden relative">
                    <div className="absolute h-full bg-[#000080] w-12 animate-[hardwareScan_2s_infinite_linear]" />
                  </div>
                  <span className="text-[10px] animate-pulse">Checking I/O Ports...</span>
                </div>
              )}
              {step.devices && (
                <div className="mt-4 flex flex-col gap-1">
                  {step.devices.map(d => (
                    <div key={d} className="flex items-center gap-2 text-[11px] font-bold text-blue-900">
                      <CheckCircle size={12} /> {d}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <style>{`
          @keyframes hardwareScan {
            0% { left: -50px; }
            100% { left: 200px; }
          }
        `}</style>
        <div className="mt-4 flex justify-end gap-2 border-t border-gray-500 pt-3">
          {hardwareStep > 0 && hardwareStep < steps.length - 1 && (
            <button 
              onClick={() => setHardwareStep(s => s - 1)}
              className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
            >
              {'< Back'}
            </button>
          )}
          {hardwareStep < steps.length - 1 ? (
            <button 
              onClick={() => {
                if (hardwareStep === 1) {
                  setTimeout(() => setHardwareStep(2), 3000);
                } else {
                  setHardwareStep(s => s + 1);
                }
              }}
              disabled={hardwareStep === 1}
              className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold disabled:opacity-50"
            >
              {hardwareStep === 0 ? 'Next >' : 'Finish'}
            </button>
          ) : (
            <button 
              onClick={() => { setHardwareStep(0); setActivePanel(null); }}
              className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
            >
              Close
            </button>
          )}
          <button 
            onClick={() => { setHardwareStep(0); setActivePanel(null); }}
            className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // ── Sub-panel: Network ───────────────────────────────────────────────────
  const renderNetwork = () => (
    <div className="flex flex-col h-full p-3">
      {PanelHeader('Network Settings', Network, 'text-[#006400]', '/Icons/network_normal_two_pcs-0.png')}
      
      <div className="flex-1 flex flex-col gap-4 mt-2">
        <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-3">
          <p className="text-[10px] font-bold mb-2 uppercase tracking-wide">Identification</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] w-24">Computer name:</span>
              <input type="text" value="VESPERA-STATION" readOnly className="flex-1 text-xs bg-white border border-gray-400 p-1 font-mono" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] w-24">Workgroup:</span>
              <input type="text" value="AETHERIS_NODE" readOnly className="flex-1 text-xs bg-white border border-gray-400 p-1 font-mono" />
            </div>
          </div>
        </div>

        <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#d9d9d9] p-3">
          <p className="text-[10px] font-bold mb-2 uppercase tracking-wide">Access Control</p>
          <p className="text-[9px] text-gray-700 mb-2">Configure how this computer is connected to the AETHERIS backbone.</p>
          <div className="flex flex-col gap-2">
            <button className="self-start px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs font-bold">Proxy Settings...</button>
            <button className="self-start px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs font-bold">Dial-Up Networking...</button>
          </div>
        </div>

        <div className="mt-auto flex justify-end gap-2">
          <button onClick={() => setActivePanel(null)} className="px-6 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold">OK</button>
        </div>
      </div>
    </div>
  );

  const PanelHeader = (title: string, Icon: any, iconColor: string, iconUrl?: string, onBack?: () => void) => (
    <div className="flex items-center gap-2 border-b border-gray-500 pb-2 mb-1 shrink-0">
      <button
        onClick={() => {
          if (onBack) onBack();
          setActivePanel(null);
        }}
        className="flex items-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
      >
        <ArrowLeft size={12} />
        Back
      </button>
      <div className="flex items-center gap-2 ml-1">
        {iconUrl ? (
          <img src={iconUrl} alt="" className="w-5 h-5 object-contain" style={{ imageRendering: 'pixelated' }} />
        ) : (
          <Icon size={20} className={iconColor} />
        )}
        <span className="font-bold text-sm tracking-wide uppercase">{title}</span>
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
    
    if (activePanel === 'fonts') return renderFonts();
    if (activePanel === 'datetime') return renderDateTime();
    if (activePanel === 'sounds') return renderSounds();
    if (activePanel === 'regional') return renderRegional();
    if (activePanel === 'printers') return renderPrinters();
    if (activePanel === 'accessibility') return renderAccessibility();
    if (activePanel === 'security') return renderSecurity();
    if (activePanel === 'xtype_diag') return renderXTypeDiag();
    if (activePanel === 'hardware_wiz') return renderHardwareWizard();
    if (activePanel === 'network') return renderNetwork();

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
