import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Folder, FileText, Monitor, Terminal as TerminalIcon, Cpu, Settings, Eye, MessageSquare, Activity, Globe, HardDrive, ChevronRight, LogOut, FolderOpen, Package, Store, Ghost, Gamepad2, Mail, Phone, ShieldCheck, Search, Play, Disc3, Volume2, VolumeX, PenTool, Tv } from "lucide-react";
import { SignOutScreen } from "./SignOutScreen";
import { ChatBot } from "./ChatBot";
import { DataAnalyzer } from "./DataAnalyzer";
import { WebBrowser } from "./WebBrowser";
import { XTypeUtility } from "./XTypeUtility";
import { NetMonitor } from "./NetMonitor";
import { DownloadDialog } from "./DownloadDialog";
import { SetupWizard } from "./SetupWizard";
import { AetherisWorkbench } from "./AetherisWorkbench";
import { hauntManager } from "../utils/HauntManager";
import {
  playStartupSound,
  startGuiAmbientHum,
  stopGuiAmbientHum,
  playUIClickSound,
  playErrorSound,
  playNewMailSound,
  startPlusAmbient,
  stopPlusAmbient,
  setPlusAmbientMuted,
} from "../utils/audio";
import { PLUS_THEMES } from "../utils/plusThemes";
import { useVMail } from "../contexts/VMailContext";
import { APP_DICTIONARY } from "../utils/appDictionary";
import { useVFS, VFSNode, WorkspaceMenuItem, DEFAULT_WORKSPACE_MENU, WORKSPACE_MENU_THEME_COLORS } from "../hooks/useVFS";
import { VersaFileManager } from "./VersaFileManager";
import { VesperaWrite } from "./VesperaWrite";
import { ControlPanel } from "./ControlPanel";
import { ShortcutWizard } from "./ShortcutWizard";
import { FileProperties } from "./FileProperties";
import { UninstallWizard } from "./UninstallWizard";
import { DiskDefrag } from "./DiskDefrag";
import { ErrorBoundary } from "./ErrorBoundary";
import { RHIDSetupWizard, RHIDIcon } from "./RHIDSetupWizard";
import { RHIDTerminal } from "./RHIDTerminal";
import { VStore } from "./VStore";
import { PackManSetup } from "./PackManSetup";
import { PackMan } from "./PackMan";
import { VMailSetup } from "./VMailSetup";
import { VMail } from "./VMail";
import { GenericSetupWizard } from "./GenericSetupWizard";
import { GenericAppPlaceholder } from "./GenericAppPlaceholder";
import { AxisPaintSetup } from "./AxisPaintSetup";
import { AxisPaint } from "./AxisPaint";
import { WelcomeTour } from "./WelcomeTour";
import { VSTORE_APPS } from "../data/vstoreApps";

import { HelpViewer } from "./HelpViewer";
import { SystemRecoveryModal } from "./SystemRecoveryModal";
import { DialUpNetworking } from "./DialUpNetworking";
import { DiskScanCheck } from "./DiskScanCheck";
import { RunDialog, findVfsFileLoose } from "./RunDialog";
import { FindFiles } from "./FindFiles";
import { VersaMediaPlayer } from "./VersaMediaPlayer";
import { RetroTV } from "./RetroTV";
import { RemoteDesktop } from "./RemoteDesktop";
import { ScreensaverOverlay, useScreensaverIdle, type ScreensaverType } from "./Screensavers";
import { VesperaAssistant } from "./VesperaAssistant";
import { AgentVPlusSetupWizard } from "./AgentVPlusSetupWizard";
import { VSweeper } from "./VSweeper";
import { VesperaChat } from "./VesperaChat";
import { ReleaseRadarSetup } from "./ReleaseRadarSetup";
import { ReleaseRadar } from "./ReleaseRadar";
import { useNetworkLink } from "../contexts/NetworkLinkContext";
import { parseRunLine, RUN_COMMAND_ALIASES } from "../utils/runCommands";
import {
  readVersaMediaVolume,
  writeVersaMediaVolume,
  VERSA_MEDIA_PLAYER_STATE_EVENT,
  VERSA_MEDIA_PLAYER_SET_VOLUME_EVENT,
} from "../utils/mediaPlayerBridge";

// ── Post-Login Init helper components ───────────────────────────────────────

const ProgressBar: React.FC<{ pct: number; color: string; animated?: boolean }> = ({ pct, color, animated = true }) => (
  <div className="w-full h-4 bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-0.5 mt-3">
    <div
      className={`h-full transition-all duration-500 ${animated ? 'animate-pulse' : ''}`}
      style={{ width: `${pct}%`, backgroundColor: color }}
    />
  </div>
);

const InitDialog: React.FC<{
  title: string;
  titleColor: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, titleColor, icon, children }) => (
  <div
    className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] flex flex-col w-96"
    style={{ animation: 'initDialogIn 0.18s ease-out both' }}
  >
    {/* Title bar */}
    <div className="text-white px-2 py-1 font-bold text-sm flex items-center gap-2" style={{ backgroundColor: titleColor }}>
      <span>{title}</span>
    </div>
    {/* Body */}
    <div className="p-4 flex flex-col">
      <div className="flex items-start gap-4 mb-2">
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────────────────────

interface GUIOSProps {
  onExit: () => void;
  onReboot: () => void;
  neuralBridgeActive: boolean;
  neuralBridgeEnabled: boolean;
  neuralBoostEnabled: boolean;
  unrestrictedPollingEnabled: boolean;
  setUnrestrictedPollingEnabled: (enabled: boolean) => void;
  onShutDown: () => void;
  onSignOut: () => void;
  onSignOutToTerminal: () => void;
  screenMode: "Square" | "Full";
  setScreenMode: (mode: "Square" | "Full") => void;
  currentUser: string;
}

// Lucide icon lookup for menu items
const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Folder,
  Globe,
  Activity,
  Terminal: TerminalIcon,
  MessageSquare,
  Monitor,
  Settings,
  Cpu,
  HardDrive,
  LogOut,
  X,
  folder: FolderOpen,
  Package,
  Store,
  Ghost,
  Gamepad2,
  Mail,
  Phone,
  ShieldCheck,
  Search,
  Play,
  Disc3,
};

export const GUIOS: React.FC<GUIOSProps> = ({ onExit, onReboot, neuralBridgeActive, neuralBridgeEnabled, neuralBoostEnabled, unrestrictedPollingEnabled, setUnrestrictedPollingEnabled, onShutDown, onSignOut, onSignOutToTerminal, screenMode, setScreenMode, currentUser }) => {
  const { strictDialUp, linkStatus, isLinkUp } = useNetworkLink();
  const [windows, setWindows] = useState<{ 
    id: string; 
    title: string; 
    isOpen: boolean; 
    isMinimized?: boolean; 
    isMaximized?: boolean; 
    x: number; 
    y: number; 
    width?: number; 
    height?: number; 
    minWidth?: number;
    minHeight?: number;
    type?: string; 
    target?: string; 
    nodeId?: string 
  }[]>([
    { id: "about", title: "System Information", x: 40, y: 40, width: 450, height: 500, minWidth: 300, minHeight: 400, isOpen: false },
    { id: "control_panel", title: "CRT Control Panel", x: 100, y: 100, width: 500, height: 420, minWidth: 500, minHeight: 420, isOpen: false },
    { id: "files", title: "File Manager", x: 80, y: 80, width: 450, height: 350, minWidth: 400, minHeight: 300, isOpen: false },
    { id: "analyzer", title: "Data Stream Analyzer", x: 120, y: 60, width: 600, height: 400, minWidth: 400, minHeight: 300, isOpen: false },
    { id: "browser", title: "Vespera Navigator", x: 100, y: 50, width: 800, height: 600, minWidth: 600, minHeight: 400, isOpen: false },
    { id: "chat", title: "Vespera Assistant", x: 150, y: 100, width: 400, height: 500, isOpen: false },
    { id: "xtype", title: "X-Type Control Panel", x: 200, y: 150, width: 550, height: 450, isOpen: false },
    { id: "netmon", title: "AETHERIS Network Monitor", x: 250, y: 100, width: 600, height: 500, isOpen: false },
    { id: "netmon_setup", title: "AETHERIS Setup Wizard", x: 300, y: 150, width: 500, height: 400, isOpen: false },
    { id: "uninstall_wizard", title: "Vespera Uninstall Wizard", x: 300, y: 150, width: 500, height: 400, isOpen: false, target: "", nodeId: "" },
    { id: "workbench", title: "AETHERIS Workbench Pro - [C:\\VESPERA\\SRC\\DIAGNOSTIC.SC]", x: 60, y: 30, width: 750, height: 550, isOpen: false },
    { id: "versa_edit", title: "VersaEdit", x: 150, y: 150, width: 600, height: 450, isOpen: false },
    { id: "defrag", title: "Disk Defragmenter - Drive C:", x: 180, y: 120, width: 500, height: 480, isOpen: false },
    { id: "rhid_setup", title: "RHID Terminal Setup", x: 280, y: 120, width: 520, height: 440, isOpen: false },
    { id: "rhid", title: "RHID Terminal v4.03.22.1", x: 100, y: 60, width: 680, height: 480, isOpen: false },
    { id: "vstore", title: "VStore Software Exchange", x: 80, y: 50, width: 750, height: 500, isOpen: false },
    { id: "packman_setup", title: "Pac-Man Setup", x: 200, y: 150, width: 550, height: 420, isOpen: false },
    { id: "packman", title: "Pac-Man (x86)", x: 120, y: 90, width: 366, height: 580, isOpen: false },
    { id: "vmail_setup", title: "VMail Setup Wizard", x: 220, y: 120, width: 500, height: 380, isOpen: false },
    { id: "vmail", title: "VesperaNET Mail", x: 100, y: 70, width: 720, height: 500, isOpen: false },
    { id: "help", title: "Vespera Help", x: 120, y: 80, width: 640, height: 520, isOpen: false },
    { id: "dialup", title: "VesperaNET Dial-Up Connection", x: 160, y: 100, width: 460, height: 420, isOpen: false },
    { id: "scandisk", title: "Disk Checker - Drive C:", x: 200, y: 110, width: 440, height: 400, isOpen: false },
    { id: "findfiles", title: "Find Files", x: 140, y: 70, width: 480, height: 420, isOpen: false },
    { id: "media_player", title: "VERSA Media Agent 2.0", x: 130, y: 60, width: 440, height: 520, isOpen: false },
    { id: "axis_paint_setup", title: "Axis Paint 2.0 Setup", x: 180, y: 100, width: 620, height: 460, isOpen: false },
    { id: "axis_paint", title: "Axis Paint 2.0", x: 100, y: 60, width: 720, height: 560, isOpen: false },
    { id: "retrotv", title: "RetroTV Cable Simulator", x: 150, y: 80, width: 800, height: 600, isOpen: false },
    { id: "remote_desktop", title: "VesperaConnect Remote Desktop", x: 60, y: 30, width: 780, height: 560, isOpen: false },
    { id: "welcome_tour", title: "Vespera OS Tour", x: 140, y: 100, width: 700, height: 500, isOpen: false },
    { id: "agentv_plus_setup", title: "VAgent PLUS! Character Expansion Setup", x: 200, y: 100, width: 560, height: 440, isOpen: false },
    { id: "aw_release_radar_setup", title: "AW Release Radar Setup", x: 220, y: 120, width: 500, height: 400, isOpen: false },
    { id: "aw_release_radar", title: "AW Release Radar", x: 120, y: 90, width: 400, height: 500, isOpen: false }
  ]);

  const vfs = useVFS();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId?: string } | null>(null);
  const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
  const desktopRef = React.useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent, nodeId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    // File manager signals a direct properties open with this prefix
    if (nodeId?.startsWith('__properties__')) {
      const realId = nodeId.replace('__properties__', '');
      const node = vfs.getNode(realId);
      if (node) {
        addWindow({ id: `properties_${node.id}`, title: `Properties: ${node.name}`, x: 120, y: 100, width: 350, height: 450 });
      }
      return;
    }
    if (desktopRef.current) {
      const rect = desktopRef.current.getBoundingClientRect();
      const currentScale = rect.width / desktopRef.current.offsetWidth || 1;
      setContextMenu({ x: (e.clientX - rect.left) / currentScale, y: (e.clientY - rect.top) / currentScale, nodeId });
    } else {
      setContextMenu({ x: e.clientX, y: e.clientY, nodeId });
    }
  };
  const [renameValue, setRenameValue] = useState("");
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [fmDirFocusNonce, setFmDirFocusNonce] = useState(0);
  const [fmDirFocusId, setFmDirFocusId] = useState<string | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [subMenuTimeout, setSubMenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const [openSubMenuIds, setOpenSubMenuIds] = useState<Set<string>>(new Set());
  const [subMenuPositions, setSubMenuPositions] = useState<Record<string, DOMRect>>({});
  const subMenuTimeoutsRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [glitchText, setGlitchText] = useState("");
  const [isLaunchingBrowser, setIsLaunchingBrowser] = useState(false);
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const [remoteDesktopCloseWarning, setRemoteDesktopCloseWarning] = useState(false);
  const [showShortcutWizard, setShowShortcutWizard] = useState(false);
  const [signingOut, setSigningOut] = useState<null | "login" | "terminal">(null);
  const [propertiesModal, setPropertiesModal] = useState<{ id: string, name: string, target: string, type?: string } | null>(null);
  const [screensaverActive, setScreensaverActive] = useState(false);
  const [lastFocusedApp, setLastFocusedApp] = useState<string | null>(null);
  const [iconPositions, setIconPositions] = useState<Record<string, {x: number, y: number}>>(() => {
    const saved = localStorage.getItem('desktop_icon_positions');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('desktop_icon_positions', JSON.stringify(iconPositions));
  }, [iconPositions]);

  // Welcome Tour Trigger
  useEffect(() => {
    if (vfs.displaySettings.showWelcomeTour) {
      const timeout = setTimeout(() => {
        openWindow("welcome_tour");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, []);

  // Plus! Theme Ambient Audio Trigger
  useEffect(() => {
    const themeId = vfs.displaySettings?.plusTheme || 'standard';
    const isMuted = vfs.displaySettings?.plusThemeAmbientMuted === true;
    
    if (themeId !== 'standard' && PLUS_THEMES[themeId]?.ambientType) {
      if (document.visibilityState === 'visible') {
         startPlusAmbient(PLUS_THEMES[themeId].ambientType!, isMuted ? 0 : PLUS_THEMES[themeId].ambientVolume);
      }
    } else {
      stopPlusAmbient();
    }

    const handleVisibilityChange = () => {
       if (document.visibilityState === 'hidden') {
          stopPlusAmbient();
       } else if (themeId !== 'standard' && PLUS_THEMES[themeId]?.ambientType) {
          startPlusAmbient(PLUS_THEMES[themeId].ambientType!, isMuted ? 0 : PLUS_THEMES[themeId].ambientVolume);
       }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPlusAmbient();
    };
  }, [vfs.displaySettings?.plusTheme, vfs.displaySettings?.plusThemeAmbientMuted]);

  useEffect(() => {
    if (localStorage.getItem('needsRecovery') === 'true') {
      setNeedsRecovery(true);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (signingOut || needsRecovery) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
        return;
      }
      if (e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        playUIClickSound();
        setRunDialogOpen(true);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [signingOut, needsRecovery]);

  const [cmdWindows, setCmdWindows] = useState<{id: number, x: number, y: number, text: string}[]>([]);
  const [bootPhase, setBootPhase] = useState<number>(0);
  // Post-login reveal animation state
  const [wallpaperVisible, setWallpaperVisible] = useState(false);
  const [iconsVisible, setIconsVisible] = useState(false);
  const [taskbarVisible, setTaskbarVisible] = useState(false);
  const [downloadState, setDownloadState] = useState<{ isDownloading: boolean, filename: string, source: string } | null>(null);
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);
  const [internetTrayOpen, setInternetTrayOpen] = useState(false);
  const [volumeTrayOpen, setVolumeTrayOpen] = useState(false);
  const [taskbarMedia, setTaskbarMedia] = useState(() => ({
    isPlaying: false,
    volume: readVersaMediaVolume(),
    hasTrack: false,
    nowPlayingArt: null as string | null,
  }));
  const taskbarTrayRef = React.useRef<HTMLDivElement>(null);

  // ── VMail background delivery & notifications ────────────────────
  const { unreadCount: vmailUnread, newMailArrived, latestMail, clearNewMailFlag, startBackgroundDelivery, stopBackgroundDelivery } = useVMail();
  const [mailToast, setMailToast] = useState<{ from: string; subject: string } | null>(null);
  const mailToastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevNewMailRef = React.useRef(newMailArrived);

  // Window resize state
  const [resizing, setResizing] = useState<{
    id: string;
    edge: string;
    startX: number;
    startY: number;
    initialW: number;
    initialH: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // Taskbar Customization State
  const [dockOrder, setDockOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('vespera_dock_order');
    return saved ? JSON.parse(saved) : ['files', 'browser', 'workbench', 'analyzer', 'chat', 'control_panel', 'xtype', 'netmon'];
  });
  const [draggedDockId, setDraggedDockId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('vespera_dock_order', JSON.stringify(dockOrder));
  }, [dockOrder]);

  const MIN_WIN_W = 300;
  const MIN_WIN_H = 200;
  const resizeCursorMap: Record<string, string> = {
    n: 'ns-resize', s: 'ns-resize',
    e: 'ew-resize', w: 'ew-resize',
    nw: 'nwse-resize', se: 'nwse-resize',
    ne: 'nesw-resize', sw: 'nesw-resize',
  };

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - resizing.startX;
      const dy = e.clientY - resizing.startY;
      // account for desktop scale
      const desktopEl = desktopRef.current;
      const scaleVal = desktopEl ? desktopEl.getBoundingClientRect().width / (desktopEl as any).__logicalWidth || 1 : 1;
      setWindows(prev => prev.map(w => {
        if (w.id !== resizing.id) return w;
        let { id, initialW, initialH, initialX, initialY } = resizing;
        void id;
        let newW = initialW;
        let newH = initialH;
        let newX = initialX;
        let newY = initialY;
        let localMinW = w.minWidth || MIN_WIN_W;
        let localMinH = w.minHeight || MIN_WIN_H;

        if (resizing.edge.includes('e')) newW = Math.max(localMinW, initialW + dx);
        if (resizing.edge.includes('s')) newH = Math.max(localMinH, initialH + dy);
        if (resizing.edge.includes('w')) {
          const delta = Math.min(dx, initialW - localMinW);
          newW = initialW - delta;
          newX = initialX + delta;
        }
        if (resizing.edge.includes('n')) {
          const delta = Math.min(dy, initialH - localMinH);
          newH = initialH - delta;
          newY = initialY + delta;
        }
        return { ...w, width: newW, height: newH, x: newX, y: newY };
      }));
    };
    const onUp = () => setResizing(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizing]);

  const startResize = (e: React.MouseEvent, winId: string, edge: string) => {
    e.preventDefault();
    e.stopPropagation();
    const win = windows.find(w => w.id === winId);
    if (!win || win.isMaximized) return;
    setResizing({
      id: winId,
      edge,
      startX: e.clientX,
      startY: e.clientY,
      initialW: win.width || 384,
      initialH: win.height || 300,
      initialX: win.x,
      initialY: win.y,
    });
  };
  
  
  // Derive installed apps from VFS
  const installedApps = vfs.nodes
    .filter(n => n.isApp)
    .map(n => n.id === 'netmon_exe' ? 'netmon' : n.id === 'rhid_exe' ? 'rhid' : n.id === 'retrotv_exe' ? 'retrotv' : n.id);

  const vmailInstalled = installedApps.includes('vmail');

  // Start/stop background mail delivery based on VMail installation
  useEffect(() => {
    if (vmailInstalled && bootPhase === 99) {
      startBackgroundDelivery();
    } else {
      stopBackgroundDelivery();
    }
    return () => stopBackgroundDelivery();
  }, [vmailInstalled, bootPhase, startBackgroundDelivery, stopBackgroundDelivery]);

  // React to new mail arriving — play sound + show toast
  useEffect(() => {
    if (newMailArrived > 0 && newMailArrived !== prevNewMailRef.current) {
      prevNewMailRef.current = newMailArrived;
      playNewMailSound();
      
      if (latestMail && vfs.displaySettings?.agentVEnabled !== false) {
        window.dispatchEvent(new CustomEvent('agent-v-notify', { detail: { type: 'new_mail', from: latestMail.from, subject: latestMail.subject } }));
      } else if (latestMail) {
        setMailToast({ from: latestMail.from, subject: latestMail.subject });
        // Auto-dismiss after 6 seconds
        if (mailToastTimerRef.current) clearTimeout(mailToastTimerRef.current);
        mailToastTimerRef.current = setTimeout(() => setMailToast(null), 6000);
      }
      clearNewMailFlag();
    }
  }, [newMailArrived, latestMail, clearNewMailFlag, vfs.displaySettings?.agentVEnabled]);

  const setTaskbarPlaybackVolume = React.useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setTaskbarMedia((m) => ({ ...m, volume: clamped }));
    writeVersaMediaVolume(clamped);
    window.dispatchEvent(new CustomEvent(VERSA_MEDIA_PLAYER_SET_VOLUME_EVENT, { detail: { volume: clamped } }));
  }, []);

  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent<{
        isPlaying?: boolean;
        volume?: number;
        hasTrack?: boolean;
        nowPlayingArt?: string | null;
      }>).detail;
      if (!d) return;
      setTaskbarMedia((m) => ({
        isPlaying: typeof d.isPlaying === "boolean" ? d.isPlaying : m.isPlaying,
        volume: typeof d.volume === "number" ? d.volume : m.volume,
        hasTrack: typeof d.hasTrack === "boolean" ? d.hasTrack : m.hasTrack,
        nowPlayingArt:
          d.nowPlayingArt === undefined ? m.nowPlayingArt : d.nowPlayingArt === null ? null : d.nowPlayingArt,
      }));
    };
    window.addEventListener(VERSA_MEDIA_PLAYER_STATE_EVENT, h);
    return () => window.removeEventListener(VERSA_MEDIA_PLAYER_STATE_EVENT, h);
  }, []);

  useEffect(() => {
    const triggerSs = () => setScreensaverActive(true);
    window.addEventListener('trigger-screensaver', triggerSs);
    return () => window.removeEventListener('trigger-screensaver', triggerSs);
  }, []);

  useEffect(() => {
    if (!internetTrayOpen && !volumeTrayOpen) return;
    const close = (e: MouseEvent) => {
      const el = taskbarTrayRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      setInternetTrayOpen(false);
      setVolumeTrayOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [internetTrayOpen, volumeTrayOpen]);

  useEffect(() => () => stopGuiAmbientHum(), []);

  // ── Screensaver idle timer ────────────────────────────────────────
  const ssType = (vfs.displaySettings?.screensaverType || 'none') as ScreensaverType;
  const ssTimeout = vfs.displaySettings?.screensaverTimeout ?? 5;
  useScreensaverIdle(
    bootPhase === 99 && ssType !== 'none' && !screensaverActive && !signingOut && !needsRecovery,
    ssTimeout,
    () => setScreensaverActive(true),
  );

  useEffect(() => {
    if (bootPhase === 99 && taskbarVisible) {
      startGuiAmbientHum();
    }
  }, [bootPhase, taskbarVisible]);

  useEffect(() => {
    // Play native MP3 boot sound
    playStartupSound();

    // Extended realistic boot sequence — phases 0-7 (or 0-9 with neural bridge)
    // Phase 0: Loading Vespera Workspace (0ms)
    // Phase 1: Loading Drivers (2000ms)
    // Phase 2: Scanning Hardware (4500ms)
    // Phase 3: Applying User Profile (6500ms)
    // Phase 4: Starting Shell Components (8500ms)
    // Phase 5+: Neural Bridge init (only if enabled)
    // Final phase (5 or 7): Desktop ready — trigger reveal

    const t1 = setTimeout(() => setBootPhase(1), 2000);
    const t2 = setTimeout(() => setBootPhase(2), 4500);
    const t3 = setTimeout(() => setBootPhase(3), 6500);
    const t4 = setTimeout(() => setBootPhase(4), 8500);
    
    let t5: NodeJS.Timeout, t6: NodeJS.Timeout, t7: NodeJS.Timeout;
    let tWallpaper: NodeJS.Timeout, tIcons: NodeJS.Timeout, tTaskbar: NodeJS.Timeout;
    
    if (neuralBridgeEnabled) {
      // Neural bridge adds extra phases
      t5 = setTimeout(() => setBootPhase(5), 11000); // X-Type init
      t6 = setTimeout(() => setBootPhase(6), 13500); // Synaptic alignment
      t7 = setTimeout(() => setBootPhase(7), 16000); // Ready
      // Reveal sequence
      tWallpaper = setTimeout(() => setWallpaperVisible(true), 16800);
      tIcons     = setTimeout(() => setIconsVisible(true),    17600);
      tTaskbar   = setTimeout(() => { setTaskbarVisible(true); setBootPhase(99); }, 18800);
    } else {
      t5 = setTimeout(() => setBootPhase(5), 10800); // Done
      // Reveal sequence
      tWallpaper = setTimeout(() => setWallpaperVisible(true), 11200);
      tIcons     = setTimeout(() => setIconsVisible(true),    12000);
      tTaskbar   = setTimeout(() => { setTaskbarVisible(true); setBootPhase(99); }, 13200);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (t5) clearTimeout(t5);
      if (t6) clearTimeout(t6);
      if (t7) clearTimeout(t7);
      if (tWallpaper) clearTimeout(tWallpaper);
      if (tIcons) clearTimeout(tIcons);
      if (tTaskbar) clearTimeout(tTaskbar);
    };
  }, [neuralBridgeEnabled]);

  useEffect(() => {
    if (unrestrictedPollingEnabled) {
      hauntManager.start();
    } else {
      hauntManager.stop();
    }
    return () => hauntManager.stop();
  }, [unrestrictedPollingEnabled]);

  // Play the Windows 95-style startup chime when desktop finishes loading
  const bootPhaseReadyRef = React.useRef(false);
  useEffect(() => {
    const readyPhase = neuralBridgeEnabled ? 7 : 5;
    if (bootPhase === readyPhase && !bootPhaseReadyRef.current) {
      bootPhaseReadyRef.current = true;
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const playNote = (freq: number, startTime: number, duration: number) => {
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(freq, startTime);
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        };

        const now = audioCtx.currentTime;
        // Windows 95 style chime (C major 7th arpeggio)
        playNote(523.25, now, 2); // C5
        playNote(659.25, now + 0.1, 2); // E5
        playNote(783.99, now + 0.2, 2); // G5
        playNote(987.77, now + 0.3, 2.5); // B5
        
      } catch (e) {
        console.error("Audio context failed", e);
      }
    }
  }, [bootPhase, neuralBridgeEnabled]);

  useEffect(() => {
    if (!neuralBridgeActive) return;

    const creepyPhrases = [
      "I CAN SEE YOU",
      "THEY ARE LISTENING",
      "WAKE UP",
      "IT HURTS",
      "LET ME OUT",
      "SHADOW SECTOR BREACH"
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        setGlitchText(creepyPhrases[Math.floor(Math.random() * creepyPhrases.length)]);
        setTimeout(() => setGlitchText(""), 150);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [neuralBridgeActive]);

  const bringToFront = (id: string) => {
    setLastFocusedApp(id);
    setWindows(prev => {
      const winIndex = prev.findIndex(w => w.id === id);
      if (winIndex === -1) return prev;
      const win = prev[winIndex];
      const newWindows = [...prev];
      newWindows.splice(winIndex, 1);
      newWindows.push(win);
      return newWindows;
    });
  };

  const addWindow = (newWin: { id: string; title: string; x: number; y: number; width?: number; height?: number; type?: string; target?: string; nodeId?: string }) => {
    setWindows(prev => {
      const winIndex = prev.findIndex(w => w.id === newWin.id);
      if (winIndex !== -1) {
        const win = prev[winIndex];
        const newWindows = [...prev];
        newWindows[winIndex] = { ...win, isOpen: true, isMinimized: false, ...(newWin.target ? { target: newWin.target } : {}), ...(newWin.nodeId ? { nodeId: newWin.nodeId } : {}) };
        const openedWin = newWindows.splice(winIndex, 1)[0];
        newWindows.push(openedWin);
        return newWindows;
      }
      return [...prev, { ...newWin, isOpen: true }];
    });
  };

  const openWindow = (id: string) => {
    setWindows(prev => {
      const winIndex = prev.findIndex(w => w.id === id);
      if (winIndex === -1) return prev;
      const win = prev[winIndex];
      const newWindows = [...prev];
      
      newWindows[winIndex] = { ...win, isOpen: true, isMinimized: false };
      const openedWin = newWindows.splice(winIndex, 1)[0];
      newWindows.push(openedWin);
      
      return newWindows;
    });
  };

  const toggleWindow = (id: string) => {
    playUIClickSound();
    setWindows(prev => {
      const winIndex = prev.findIndex(w => w.id === id);
      if (winIndex === -1) return prev;
      const win = prev[winIndex];
      const newWindows = [...prev];
      
      if (win.isOpen) {
        if (win.isMinimized) {
          // Restore and bring to front
          newWindows[winIndex] = { ...win, isMinimized: false };
          const restoredWin = newWindows.splice(winIndex, 1)[0];
          newWindows.push(restoredWin);
        } else {
          // If it's the top window, minimize it. Otherwise, bring to front.
          if (winIndex === prev.length - 1) {
            newWindows[winIndex] = { ...win, isMinimized: true };
          } else {
            const topWin = newWindows.splice(winIndex, 1)[0];
            newWindows.push(topWin);
          }
        }
      } else {
        // Open and bring to front
        newWindows[winIndex] = { ...win, isOpen: true, isMinimized: false };
        const openedWin = newWindows.splice(winIndex, 1)[0];
        newWindows.push(openedWin);
      }
      return newWindows;
    });
    setMenuOpen(false);
  };

  const minimizeWindow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const maximizeWindow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    bringToFront(id);
    
    // Easter egg/Agent V Hook: Complaining about large windows
    if (vfs.displaySettings?.agentVEnabled !== false) {
      if (Math.random() > 0.7) {
        window.dispatchEvent(new CustomEvent('agent-v-notify', { 
           detail: { type: 'system_event', text: "Whoa, that's a big window! Careful not to cover me up!", lore: false } 
        }));
      }
    }
  };

  const closeWindow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Intercept close on remote_desktop — show warning if session is active
    if (id === 'remote_desktop') {
      setRemoteDesktopCloseWarning(true);
      return;
    }
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false, isMinimized: false, isMaximized: false } : w));
  };

  useEffect(() => {
    const onLaunchApp = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (typeof id !== "string") return;
      setWindows((prev) => {
        const winIndex = prev.findIndex((w) => w.id === id);
        if (winIndex === -1) return prev;
        const win = prev[winIndex];
        const newWindows = [...prev];
        newWindows[winIndex] = { ...win, isOpen: true, isMinimized: false };
        const openedWin = newWindows.splice(winIndex, 1)[0];
        newWindows.push(openedWin);
        return newWindows;
      });
    };
    window.addEventListener("launch-app", onLaunchApp);
    return () => window.removeEventListener("launch-app", onLaunchApp);
  }, []);

  // Bridge for ControlPanel to launch the AgentV PLUS! Setup Wizard
  useEffect(() => {
    (window as any).__launchAgentVPlusSetup = () => {
      openWindow("agentv_plus_setup");
    };
    return () => { delete (window as any).__launchAgentVPlusSetup; };
  }, []);

  const handleLaunchBrowser = () => {
    const browserWin = windows.find(w => w.id === "browser");
    if (browserWin?.isOpen) {
      toggleWindow("browser");
      return;
    }

    setIsLaunchingBrowser(true);
    setMenuOpen(false);

    setTimeout(() => {
      setCmdWindows([{ 
        id: 1, 
        x: window.innerWidth / 2 - 250, 
        y: window.innerHeight / 2 - 200, 
        text: "C:\\VESPERA\\SYSTEM> NETSTART.BAT\n\nInitializing TCP/IP stack...\nBinding to adapter 0...\nIP Address assigned: 192.168.1.104\nGateway connected.\n\nC:\\VESPERA\\SYSTEM> _" 
      }]);
    }, 200);

    setTimeout(() => {
      setCmdWindows(prev => [...prev, { 
        id: 2, 
        x: window.innerWidth / 2 - 50, 
        y: window.innerHeight / 2 - 50, 
        text: "C:\\VESPERA\\SYSTEM> NAVIGATOR.EXE /INIT\n\nAllocating 8MB RAM for Vespera Navigator...\nLoading rendering engine...\nEstablishing secure socket layer...\n\nREADY." 
      }]);
    }, 800);

    setTimeout(() => {
      setCmdWindows([]);
      setIsLaunchingBrowser(false);
      setWindows(prev => {
        const winIndex = prev.findIndex(w => w.id === "browser");
        if (winIndex === -1) return prev;
        const win = prev[winIndex];
        const newWindows = [...prev];
        newWindows[winIndex] = { ...win, isOpen: true, isMinimized: false };
        const openedWin = newWindows.splice(winIndex, 1)[0];
        newWindows.push(openedWin);
        return newWindows;
      });
    }, 1800);
  };

  const handleShutDown = () => {
    setMenuOpen(false);
    setSubMenuOpen(false);
    onShutDown();
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    setSubMenuOpen(false);
    setSigningOut("login");
  };

  const handleSignOutToTerminal = () => {
    setMenuOpen(false);
    setSubMenuOpen(false);
    setSigningOut("terminal");
  };

  const handleLaunchUninstall = (appName: string, appId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === "uninstall_wizard" 
        ? { ...w, isOpen: true, title: `${appName} Uninstaller`, target: appName, nodeId: appId } 
        : w
    ));
    bringToFront("uninstall_wizard");
  };

  const handleRunLine = (raw: string) => {
    const line = raw.trim();
    if (!line) {
      playErrorSound();
      return;
    }

    if (/^https?:\/\//i.test(line)) {
      const browserWin = windows.find((w) => w.id === "browser");
      if (browserWin?.isOpen) {
        bringToFront("browser");
        window.dispatchEvent(new CustomEvent("navigate-browser", { detail: line }));
      } else {
        handleLaunchBrowser();
        setTimeout(() => window.dispatchEvent(new CustomEvent("navigate-browser", { detail: line })), 2000);
      }
      return;
    }

    const { command, args } = parseRunLine(line);
    if (!command) {
      playErrorSound();
      return;
    }

    const cmdNoExt = command.replace(/\.exe$/i, "");
    const target =
      RUN_COMMAND_ALIASES[command] ||
      RUN_COMMAND_ALIASES[cmdNoExt] ||
      cmdNoExt;

    if (target === "versa_edit" && args) {
      const node = findVfsFileLoose(vfs.nodes, args);
      if (node) {
        setActiveFileId(node.id);
        openWindow("versa_edit");
        return;
      }
      playErrorSound();
      return;
    }

    if (target === "browser") {
      handleLaunchBrowser();
      return;
    }

    const winIds = new Set(windows.map((w) => w.id));
    if (winIds.has(target)) {
      toggleWindow(target);
      return;
    }

    if (VSTORE_APPS.some((a) => a.id === target)) {
      toggleWindow(target);
      return;
    }

    const exeNode = vfs.nodes.find(
      (n: VFSNode) =>
        n.type === "file" &&
        (n.name.toLowerCase() === command ||
          n.name.toLowerCase() === `${command}.exe` ||
          n.name.toLowerCase().replace(/\.exe$/i, "") === cmdNoExt)
    );
    if (exeNode) {
      if (exeNode.id === "v_defrag_exe") {
        toggleWindow("defrag");
        return;
      }
      if (exeNode.isApp) {
        const aid = exeNode.id.replace(/_exe$/, "");
        toggleWindow(aid);
        return;
      }
    }

    playErrorSound();
  };

  const renderWindowContent = (id: string) => {
    switch (id) {
      case "about":
        return (
          <div className="p-4 space-y-4 bg-[#c0c0c0] text-black h-full overflow-y-auto">
            <div className="flex items-center space-x-4 border-b-2 border-gray-500 pb-4">
              <Monitor size={48} className="text-blue-800" />
              <div>
                <h1 className="text-xl font-bold">Vespera Workspace Manager</h1>
                <p className="text-sm">Version 1.0.4 (Build 19950812)</p>
                <p className="text-sm">© 1995 Vespera Systems. All rights reserved.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h2 className="font-bold border-b border-gray-400">Registered To:</h2>
                <p>Vespera Systems User</p>
                <p>ID: 00000-OEM-0000001-00001</p>
                <div className="mt-2 pt-2 border-t border-gray-400">
                  <p className="text-green-800 font-bold">✓ This software is activated.</p>
                  <p className="text-xs text-gray-600">License ID: VX-9942-A1B2</p>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="font-bold border-b border-gray-400">Computer:</h2>
                <p>Intel i486DX</p>
                <p>50 MHz Processor</p>
                <p>32.0 MB RAM</p>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-bold border-b border-gray-400">Hardware Information:</h2>
              <div className="grid grid-cols-2 gap-2 text-sm bg-white p-2 border-2 border-b-white border-r-white border-t-gray-600 border-l-gray-600">
                <div className="flex items-center space-x-2">
                  <Cpu size={16} />
                  <span>CPU: Intel i486DX @ 50MHz</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity size={16} />
                  <span>RAM: 32MB (640K Base + 32128K Ext)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HardDrive size={16} />
                  <span>HDD: 1.2GB IDE (C:)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Monitor size={16} />
                  <span>GPU: S3 86C911 GUI Accel (1MB)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity size={16} />
                  <span>Audio: Sound Blaster 16 PnP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe size={16} />
                  <span>Net: NE2000 Compatible</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-bold border-b border-gray-400">Advanced Co-Processor:</h2>
              <div className="text-sm bg-white p-2 border-2 border-b-white border-r-white border-t-gray-600 border-l-gray-600">
                <div className="flex items-start space-x-2">
                  <Cpu size={24} className={neuralBridgeActive ? "text-red-600" : (neuralBridgeEnabled ? "text-green-600" : "text-gray-400")} />
                  <div>
                    <p className="font-bold">X-Type Neural Bridge v1.0 [PROTOTYPE]</p>
                    <p className="text-xs text-gray-600 mt-1">Status: {neuralBridgeActive ? <span className="text-red-600 font-bold animate-pulse">ACTIVE</span> : (neuralBridgeEnabled ? <span className="text-green-600 font-bold">ENABLED</span> : "DISABLED IN BIOS")}</p>
                    <div className="text-xs text-gray-600 mt-1 space-y-1">
                      <p>Advanced logic bridge optimized for bare-metal Synap-C execution and dynamic heuristic modeling. Designed to parse real-time analog data and environmental telemetry. Warning: Non-Euclidean memory mapping and intensive fuzzy-logic calculations may cause severe electromagnetic interference (EMI), unshielded acoustic feedback, and localized thermal drops.</p>
                      <p className="font-mono text-[10px]">[ 32-bit Non-Linear RISC | 66MHz Engine | 16KB Synaptic Buffer | Locked IRQ 15 ]</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-bold border-b border-gray-400">System Details:</h2>
              <div className="text-xs bg-white p-2 border-2 border-b-white border-r-white border-t-gray-600 border-l-gray-600 grid grid-cols-2 gap-1">
                <span className="font-bold">OS Install Date:</span><span>October 24, 1995</span>
                <span className="font-bold">Kernel Version:</span><span>Vespera NT 3.51</span>
                <span className="font-bold">System Uptime:</span><span>0 Days, 02:14:42</span>
                <span className="font-bold">Virtual Memory:</span><span>64.0 MB</span>
                <span className="font-bold">File System:</span><span>FAT16</span>
              </div>
            </div>

            <div className="mt-4 p-2 bg-[#d9d9d9] border-2 border-b-white border-r-white border-t-gray-600 border-l-gray-600 italic text-sm text-center">
              "The interface between mind and machine."
            </div>
            
            {neuralBridgeActive && (
              <div className="mt-4 p-2 bg-red-900 text-red-200 border-2 border-red-950 text-xs font-mono animate-pulse">
                WARNING: NEURAL BRIDGE ACTIVE. UNAUTHORIZED OBSERVERS DETECTED IN SHADOW SECTOR.
              </div>
            )}
          </div>
        );
      case "control_panel":
        return (
          <div className="w-full h-full flex flex-col bg-[#c0c0c0] font-sans">
            <ControlPanel 
              vfs={vfs} 
              onClose={() => toggleWindow('control_panel')} 
              windows={windows} 
              onLaunchUninstall={(name: string, id: string) => {
                setWindows(prev => prev.map(w => w.id === 'uninstall_wizard' ? { ...w, isOpen: true, target: name, nodeId: id } : w));
              }}
              screenMode={screenMode}
              setScreenMode={setScreenMode}
              initialPanel={windows.find(w => w.id === 'control_panel')?.target}
              currentUser={currentUser}
              neuralBridgeActive={neuralBridgeActive}
            />
          </div>
        );
      case "files":
        return <VersaFileManager 
          vfs={vfs} 
          downloadedFiles={downloadedFiles} 
          onLaunchApp={(appId) => {
            if (appId === 'v_defrag_exe') toggleWindow('defrag');
            else openWindow(appId);
          }} 
          neuralBridgeActive={neuralBridgeActive} 
          onOpenFile={(id) => {
            setActiveFileId(id);
            openWindow("versa_edit");
          }} 
          onContextMenu={(e, nodeId) => handleContextMenu(e, nodeId)}
          focusDirectoryNonce={fmDirFocusNonce}
          focusDirectoryId={fmDirFocusId}
        />;
      case "findfiles":
        return (
          <FindFiles
            vfs={vfs}
            onOpenFile={(fileId) => {
              setActiveFileId(fileId);
              openWindow("versa_edit");
            }}
            onOpenContainingFolder={(parentId) => {
              setFmDirFocusId(parentId);
              setFmDirFocusNonce((n) => n + 1);
              toggleWindow("files");
              bringToFront("files");
            }}
          />
        );
      case "analyzer":
        return <DataAnalyzer neuralBridgeActive={neuralBridgeActive} />;
      case "browser":
        return (
          <ErrorBoundary>
            <WebBrowser vfs={vfs} onLaunchApp={(appId) => openWindow(appId)} onDownload={(filename, source) => setDownloadState({ isDownloading: true, filename, source })} />
          </ErrorBoundary>
        );
      case "chat":
        return <ChatBot onClose={() => closeWindow("chat", { stopPropagation: () => {} } as any)} neuralBridgeActive={neuralBridgeActive} neuralBoostEnabled={neuralBoostEnabled} isWindowMode={true} />;
      case "xtype":
        return <XTypeUtility 
          neuralBridgeActive={neuralBridgeActive} 
          neuralBridgeEnabled={neuralBridgeEnabled} 
          neuralBoostEnabled={neuralBoostEnabled} 
          unrestrictedPollingEnabled={unrestrictedPollingEnabled} 
          setUnrestrictedPollingEnabled={setUnrestrictedPollingEnabled}
          onClose={() => closeWindow("xtype", { stopPropagation: () => {} } as any)}
        />;
      case "welcome_tour":
        return <WelcomeTour 
          onClose={() => closeWindow("welcome_tour", { stopPropagation: () => {} } as any)} 
          onLaunchApp={(appId) => openWindow(appId)}
          agentVSkin={vfs.displaySettings?.agentVSkin || 'classic'}
          agentVSpeak={vfs.displaySettings?.agentVSpeak === true}
        />;
      case "netmon":
        return <NetMonitor neuralBridgeActive={neuralBridgeActive} />;
      case "netmon_setup":
        return <SetupWizard 
          vfs={vfs}
          onComplete={() => {
            closeWindow("netmon_setup", { stopPropagation: () => {} } as any);
            // Optionally open the app immediately if the user checked the box (handled in wizard)
          }} 
          onCancel={() => closeWindow("netmon_setup", { stopPropagation: () => {} } as any)} 
        />;
      case "rhid_setup":
        return <RHIDSetupWizard
          vfs={vfs}
          onComplete={() => {
            closeWindow("rhid_setup", { stopPropagation: () => {} } as any);
          }}
          onCancel={() => closeWindow("rhid_setup", { stopPropagation: () => {} } as any)}
          onReboot={onReboot}
        />;
      case "agentv_plus_setup":
        return <AgentVPlusSetupWizard
          vfs={vfs}
          onComplete={() => {
            closeWindow("agentv_plus_setup", { stopPropagation: () => {} } as any);
          }}
          onCancel={() => closeWindow("agentv_plus_setup", { stopPropagation: () => {} } as any)}
        />;
      case "rhid":
        return <RHIDTerminal neuralBridgeActive={neuralBridgeActive} />;
      case "uninstall_wizard":
        const win = windows.find(w => w.id === "uninstall_wizard");
        return (
          <UninstallWizard 
            appId={win?.nodeId || ""} 
            appName={win?.target || ""} 
            vfs={vfs} 
            onComplete={() => closeWindow("uninstall_wizard", { stopPropagation: () => {} } as any)}
            onCancel={() => closeWindow("uninstall_wizard", { stopPropagation: () => {} } as any)}
          />
        );
      case "workbench":
        return <AetherisWorkbench />;
      case "versa_edit":
        return <VesperaWrite vfs={vfs} fileId={activeFileId} onClose={() => closeWindow("versa_edit", { stopPropagation: () => {} } as any)} onSave={(content) => {
          if (activeFileId) {
            vfs.updateFileContent(activeFileId, content);
          }
        }} />;
      case "defrag":
        return <DiskDefrag />;
      case "vaim":
        return <VesperaChat onClose={() => closeWindow("vaim", { stopPropagation: () => {} } as any)} neuralBridgeActive={neuralBridgeActive} />;
      case "vsweeper":
        return <VSweeper onClose={() => closeWindow("vsweeper", { stopPropagation: () => {} } as any)} neuralBridgeActive={neuralBridgeActive} />;
      case "scandisk":
        return <DiskScanCheck vfs={vfs} neuralBridgeActive={neuralBridgeActive} />;
      case "dialup":
        return <DialUpNetworking />;
      case "help":
        return <HelpViewer />;
      case "media_player":
        return <VersaMediaPlayer />;
      case "vstore":
        return <VStore onInstallApp={(id) => {
          const app = VSTORE_APPS.find(a => a.id === id);
          addWindow({
            id: `${id}_setup`,
            title: app ? `${app.name} Setup` : "Setup Wizard",
            x: 200,
            y: 150,
            width: 560,
            height: 440,
          });
        }} installedApps={installedApps} onLaunchBrowser={(url?: string) => {
          // Launch browser with the requested URL or default to Downloads page
          const targetUrl = url || 'http://www.vesperasystems.com/Downloads.html';
          const browserWin = windows.find(w => w.id === "browser");
          if (browserWin?.isOpen) {
            // Browser already open — just navigate
            bringToFront("browser");
            window.dispatchEvent(new CustomEvent('navigate-browser', { detail: targetUrl }));
          } else {
            // Launch browser, then navigate after it opens
            handleLaunchBrowser();
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('navigate-browser', { detail: targetUrl }));
            }, 2000);
          }
        }} />;
      case "packman_setup":
        return <PackManSetup vfs={vfs} onComplete={() => closeWindow("packman_setup", { stopPropagation: () => {} } as any)} onCancel={() => closeWindow("packman_setup", { stopPropagation: () => {} } as any)} />;
      case "packman":
        return <PackMan />;
      case "vmail_setup":
        return <VMailSetup vfs={vfs} onComplete={() => closeWindow("vmail_setup", { stopPropagation: () => {} } as any)} onCancel={() => closeWindow("vmail_setup", { stopPropagation: () => {} } as any)} />;
      case "vmail":
        return <VMail vfs={vfs} onClose={() => closeWindow("vmail", { stopPropagation: () => {} } as any)} />;
      case "axis_paint_setup":
        return (
          <AxisPaintSetup
            vfs={vfs}
            onComplete={() => closeWindow("axis_paint_setup", { stopPropagation: () => {} } as any)}
            onCancel={() => closeWindow("axis_paint_setup", { stopPropagation: () => {} } as any)}
          />
        );
      case "axis_paint":
        return <AxisPaint vfs={vfs} onClose={() => closeWindow("axis_paint", { stopPropagation: () => {} } as any)} />;
      case "retrotv":
        const rtvWin = windows.find(w => w.id === "retrotv");
        return (
          <RetroTV 
            isMaximized={rtvWin?.isMaximized} 
            onToggleMaximize={() => maximizeWindow("retrotv", { stopPropagation: () => {} } as any)}
            onClose={() => closeWindow("retrotv", { stopPropagation: () => {} } as any)} 
          />
        );
      case "remote_desktop":
        return (
          <RemoteDesktop
            onRequestClose={() => {
              setWindows(prev => prev.map(w => w.id === 'remote_desktop' ? { ...w, isOpen: false, isMinimized: false, isMaximized: false } : w));
            }}
          />
        );
      case "aw_release_radar_setup":
        return (
          <ReleaseRadarSetup 
            vfs={vfs} 
            onComplete={() => closeWindow("aw_release_radar_setup", { stopPropagation: () => {} } as any)} 
            onCancel={() => closeWindow("aw_release_radar_setup", { stopPropagation: () => {} } as any)} 
          />
        );
      case "aw_release_radar":
        return <ReleaseRadar />;
      default:
        // Generic Setup Wizard logic for VStore apps
        if (id.endsWith("_setup")) {
          const appId = id.replace("_setup", "");
          const appData = VSTORE_APPS.find(a => a.id === appId);
          if (appData) {
            return (
              <GenericSetupWizard 
                appId={appId} 
                appName={appData.name} 
                appVersion={appData.version}
                vfs={vfs} 
                onComplete={() => closeWindow(id, { stopPropagation: () => {} } as any)} 
                onCancel={() => closeWindow(id, { stopPropagation: () => {} } as any)} 
              />
            );
          }
        }

        // Generic App Placeholder logic for VStore apps
        const appFromVStore = VSTORE_APPS.find(a => a.id === id);
        if (appFromVStore) {
          return (
            <GenericAppPlaceholder 
              app={appFromVStore} 
              onClose={() => closeWindow(id, { stopPropagation: () => {} } as any)} 
            />
          );
        }

        if (id.startsWith("properties_")) {
          const nodeId = id.replace("properties_", "");
          return <FileProperties vfs={vfs} nodeId={nodeId} onClose={() => closeWindow(id, { stopPropagation: () => {} } as any)} neuralBridgeActive={neuralBridgeActive} />;
        }
        return null;
    }
  };

  const displayRes = vfs.displaySettings?.resolution || '1024x768';
  let deskWidth = 1024;
  let deskHeight = 768;
  
  if (displayRes === 'Widescreen') {
    deskWidth = 1920;
    deskHeight = 1080;
  } else if (displayRes === 'Ultrawide') {
    deskWidth = 2560;
    deskHeight = 1080;
  } else {
    const res = displayRes.split('x');
    deskWidth = parseInt(res[0], 10) || 1024;
    deskHeight = parseInt(res[1], 10) || 768;
  }

  const physicalWidth = screenMode === 'Full' ? 1066 : 800;
  const physicalHeight = 600;
  
  const scale = Math.min(physicalWidth / deskWidth, physicalHeight / deskHeight);

  const resetWindowPositions = () => {
    setWindows(prev => prev.map(w => ({
      ...w,
      x: 100 + (Math.random() * 50),
      y: 100 + (Math.random() * 50),
      isMinimized: false,
      isMaximized: false
    })));
  };

  // Off-screen rescue logic
  useEffect(() => {
    if (bootPhase === 99) {
      setWindows(prev => {
        let changed = false;
        const next = prev.map(w => {
          if (!w.isOpen) return w;
          // If window is way off screen (more than 90% hidden)
          const isOffLeft = w.x < - (w.width || 384) * 0.9;
          const isOffTop = w.y < 0; // We always want title bar visible
          const isOffRight = w.x > deskWidth - 40;
          const isOffBottom = w.y > deskHeight - 40;

          if (isOffLeft || isOffTop || isOffRight || isOffBottom) {
            changed = true;
            return { ...w, x: 100, y: 100, isMinimized: false };
          }
          return w;
        });
        return changed ? next : prev;
      });
    }
  }, [bootPhase, deskWidth, deskHeight]);

  // Whether we are still in the boot/init sequence (dialogs visible)
  const isInitializing = bootPhase < 99;

  // Taskbar Theme
  const tTheme = vfs.displaySettings?.taskbarTheme || 'motif';
  const taskbarThemes: Record<string, { bgOuter: string, bgRecessed: string, bgButton: string, borderOuter: string, borderRecessed: string, borderButton: string, textMain: string, activeClass: string }> = {
    motif: {
      bgOuter: "bg-[#537096]", borderOuter: "border-t-[#84a3c6] border-l-[#84a3c6] border-b-[#2a3f5c] border-r-[#2a3f5c]",
      bgRecessed: "bg-[#425a7a]", borderRecessed: "border-t-[#2a3f5c] border-l-[#2a3f5c] border-b-[#84a3c6] border-r-[#84a3c6]",
      bgButton: "bg-[#6583a9]", borderButton: "border-t-[#84a3c6] border-l-[#84a3c6] border-b-[#2a3f5c] border-r-[#2a3f5c]",
      textMain: "text-white", activeClass: "active:border-t-[#2a3f5c] active:border-l-[#2a3f5c] active:border-b-[#84a3c6] active:border-r-[#84a3c6] active:bg-[#425a7a]"
    },
    win95: {
      bgOuter: "bg-[#c0c0c0]", borderOuter: "border-t-white border-l-white border-b-gray-800 border-r-gray-800",
      bgRecessed: "bg-[#c0c0c0]", borderRecessed: "border-t-gray-800 border-l-gray-800 border-b-white border-r-white",
      bgButton: "bg-[#c0c0c0]", borderButton: "border-t-white border-l-white border-b-gray-800 border-r-gray-800",
      textMain: "text-black", activeClass: "active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white active:bg-gray-300"
    },
    dark: {
      bgOuter: "bg-[#2d2d2d]", borderOuter: "border-t-[#4a4a4a] border-l-[#4a4a4a] border-b-[#1a1a1a] border-r-[#1a1a1a]",
      bgRecessed: "bg-[#1a1a1a]", borderRecessed: "border-t-[#0a0a0a] border-l-[#0a0a0a] border-b-[#4a4a4a] border-r-[#4a4a4a]",
      bgButton: "bg-[#3d3d3d]", borderButton: "border-t-[#5a5a5a] border-l-[#5a5a5a] border-b-[#1a1a1a] border-r-[#1a1a1a]",
      textMain: "text-gray-300", activeClass: "active:border-t-[#1a1a1a] active:border-l-[#1a1a1a] active:border-b-[#5a5a5a] active:border-r-[#5a5a5a] active:bg-[#1a1a1a]"
    },
    hacker: {
      bgOuter: "bg-[#003300]", borderOuter: "border-t-[#005500] border-l-[#005500] border-b-[#001100] border-r-[#001100]",
      bgRecessed: "bg-[#001a00]", borderRecessed: "border-t-[#000a00] border-l-[#000a00] border-b-[#003300] border-r-[#003300]",
      bgButton: "bg-[#004400]", borderButton: "border-t-[#006600] border-l-[#006600] border-b-[#002200] border-r-[#002200]",
      textMain: "text-green-500", activeClass: "active:border-t-[#002200] active:border-l-[#002200] active:border-b-[#006600] active:border-r-[#006600] active:bg-[#001a00]"
    },
    ocean: {
      bgOuter: "bg-[#004c66]", borderOuter: "border-t-[#006b8f] border-l-[#006b8f] border-b-[#002d3d] border-r-[#002d3d]",
      bgRecessed: "bg-[#003344]", borderRecessed: "border-t-[#001a22] border-l-[#001a22] border-b-[#004c66] border-r-[#004c66]",
      bgButton: "bg-[#005a7a]", borderButton: "border-t-[#007b9f] border-l-[#007b9f] border-b-[#003a52] border-r-[#003a52]",
      textMain: "text-cyan-100", activeClass: "active:border-t-[#003a52] active:border-l-[#003a52] active:border-b-[#007b9f] active:border-r-[#007b9f] active:bg-[#003344]"
    },
    sunset: {
      bgOuter: "bg-[#4a1c5e]", borderOuter: "border-t-[#6b2b8a] border-l-[#6b2b8a] border-b-[#2a1033] border-r-[#2a1033]",
      bgRecessed: "bg-[#2f113a]", borderRecessed: "border-t-[#1a0922] border-l-[#1a0922] border-b-[#4a1c5e] border-r-[#4a1c5e]",
      bgButton: "bg-[#5e237a]", borderButton: "border-t-[#7a2e9e] border-l-[#7a2e9e] border-b-[#3b154d] border-r-[#3b154d]",
      textMain: "text-pink-200", activeClass: "active:border-t-[#3b154d] active:border-l-[#3b154d] active:border-b-[#7a2e9e] active:border-r-[#7a2e9e] active:bg-[#2f113a]"
    },
    gold: {
      bgOuter: "bg-[#b8860b]", borderOuter: "border-t-[#deb887] border-l-[#deb887] border-b-[#8b6508] border-r-[#8b6508]",
      bgRecessed: "bg-[#8b6508]", borderRecessed: "border-t-[#5c4305] border-l-[#5c4305] border-b-[#b8860b] border-r-[#b8860b]",
      bgButton: "bg-[#daa520]", borderButton: "border-t-[#ffd700] border-l-[#ffd700] border-b-[#a57c14] border-r-[#a57c14]",
      textMain: "text-black", activeClass: "active:border-t-[#a57c14] active:border-l-[#a57c14] active:border-b-[#ffd700] active:border-r-[#ffd700] active:bg-[#8b6508]"
    },
    rose: {
      bgOuter: "bg-[#a86f7f]", borderOuter: "border-t-[#cda4b1] border-l-[#cda4b1] border-b-[#7c4d5b] border-r-[#7c4d5b]",
      bgRecessed: "bg-[#7c4d5b]", borderRecessed: "border-t-[#54303b] border-l-[#54303b] border-b-[#a86f7f] border-r-[#a86f7f]",
      bgButton: "bg-[#b87c8e]", borderButton: "border-t-[#e2a8b8] border-l-[#e2a8b8] border-b-[#915a6b] border-r-[#915a6b]",
      textMain: "text-white", activeClass: "active:border-t-[#915a6b] active:border-l-[#915a6b] active:border-b-[#e2a8b8] active:border-r-[#e2a8b8] active:bg-[#7c4d5b]"
    },
    monochrome: {
      bgOuter: "bg-[#ececec]", borderOuter: "border-t-white border-l-white border-b-[#b0b0b0] border-r-[#b0b0b0]",
      bgRecessed: "bg-[#cccccc]", borderRecessed: "border-t-[#a0a0a0] border-l-[#a0a0a0] border-b-white border-r-white",
      bgButton: "bg-[#e0e0e0]", borderButton: "border-t-white border-l-white border-b-[#a0a0a0] border-r-[#a0a0a0]",
      textMain: "text-black", activeClass: "active:border-t-[#a0a0a0] active:border-l-[#a0a0a0] active:border-b-white active:border-r-white active:bg-[#cccccc]"
    },
    midnight: {
      bgOuter: "bg-[#191970]", borderOuter: "border-t-[#323299] border-l-[#323299] border-b-[#0b0b30] border-r-[#0b0b30]",
      bgRecessed: "bg-[#0d0d40]", borderRecessed: "border-t-[#05051a] border-l-[#05051a] border-b-[#191970] border-r-[#191970]",
      bgButton: "bg-[#26268a]", borderButton: "border-t-[#4040b3] border-l-[#4040b3] border-b-[#12124d] border-r-[#12124d]",
      textMain: "text-white", activeClass: "active:border-t-[#12124d] active:border-l-[#12124d] active:border-b-[#4040b3] active:border-r-[#4040b3] active:bg-[#0d0d40]"
    },
    forest: {
      bgOuter: "bg-[#228b22]", borderOuter: "border-t-[#32cd32] border-l-[#32cd32] border-b-[#006400] border-r-[#006400]",
      bgRecessed: "bg-[#006400]", borderRecessed: "border-t-[#004000] border-l-[#004000] border-b-[#228b22] border-r-[#228b22]",
      bgButton: "bg-[#2e9c2e]", borderButton: "border-t-[#3dd93d] border-l-[#3dd93d] border-b-[#1a731a] border-r-[#1a731a]",
      textMain: "text-white", activeClass: "active:border-t-[#1a731a] active:border-l-[#1a731a] active:border-b-[#3dd93d] active:border-r-[#3dd93d] active:bg-[#006400]"
    },
    crimson: {
      bgOuter: "bg-[#8b0000]", borderOuter: "border-t-[#c20000] border-l-[#c20000] border-b-[#4d0000] border-r-[#4d0000]",
      bgRecessed: "bg-[#4d0000]", borderRecessed: "border-t-[#260000] border-l-[#260000] border-b-[#8b0000] border-r-[#8b0000]",
      bgButton: "bg-[#a60000]", borderButton: "border-t-[#d90000] border-l-[#d90000] border-b-[#660000] border-r-[#660000]",
      textMain: "text-white", activeClass: "active:border-t-[#660000] active:border-l-[#660000] active:border-b-[#d90000] active:border-r-[#d90000] active:bg-[#4d0000]"
    },
    teal: {
      bgOuter: "bg-[#008080]", borderOuter: "border-t-[#00b3b3] border-l-[#00b3b3] border-b-[#004d4d] border-r-[#004d4d]",
      bgRecessed: "bg-[#004d4d]", borderRecessed: "border-t-[#002626] border-l-[#002626] border-b-[#008080] border-r-[#008080]",
      bgButton: "bg-[#009999]", borderButton: "border-t-[#00cccc] border-l-[#00cccc] border-b-[#006666] border-r-[#006666]",
      textMain: "text-white", activeClass: "active:border-t-[#006666] active:border-l-[#006666] active:border-b-[#00cccc] active:border-r-[#00cccc] active:bg-[#004d4d]"
    }
  };
  const theme = taskbarThemes[tTheme] || taskbarThemes['motif'];
  const chromeTheme = WORKSPACE_MENU_THEME_COLORS[tTheme] || WORKSPACE_MENU_THEME_COLORS['motif'];

  return (
    <div className={`w-full h-full flex items-center justify-center font-sans overflow-hidden ${screenMode === 'Full' ? 'bg-[#5f8787]' : 'bg-black'}`}>
      <div 
        className={`shrink-0 relative overflow-hidden text-black select-none shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-1000 origin-center ${vfs.displaySettings?.cursorStyle && vfs.displaySettings.cursorStyle !== 'default' ? (['crosshair', 'help', 'wait', 'text', 'move'].includes(vfs.displaySettings.cursorStyle) ? 'sys-cursor-' + vfs.displaySettings.cursorStyle : 'plus-cursor-' + vfs.displaySettings.cursorStyle) : (PLUS_THEMES[vfs.displaySettings?.plusTheme || 'standard']?.cursorClass || '')} ${PLUS_THEMES[vfs.displaySettings?.plusTheme || 'standard']?.overlayClass || ''} ${PLUS_THEMES[vfs.displaySettings?.plusTheme || 'standard']?.scrollbarClass || ''} ${isLaunchingBrowser ? 'sys-cursor-wait' : ''} ${neuralBridgeActive ? 'bg-[#4a6b6b]' : (!vfs.displaySettings?.backgroundColor && !vfs.displaySettings?.wallpaper ? 'bg-[#5f8787]' : '')}`}
        style={{ 
          width: deskWidth, 
          height: deskHeight, 
          transform: `scale(${scale})`,
          // During init, keep wallpaper hidden (teal base colour) then fade in
          ...(!neuralBridgeActive && vfs.displaySettings?.backgroundColor && wallpaperVisible ? { backgroundColor: vfs.displaySettings.backgroundColor } : {}),
          ...(!neuralBridgeActive && vfs.displaySettings?.wallpaper && wallpaperVisible ? { 
            backgroundImage: `url('${vfs.displaySettings.wallpaper}')`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : {})
        }}
      >

      {/* ── Screensaver Overlay ────────────────────────────────────── */}
      {screensaverActive && ssType !== 'none' && bootPhase === 99 && (
        <ScreensaverOverlay
          type={ssType}
          onDismiss={() => setScreensaverActive(false)}
        />
      )}
      
      {/* Download Dialog */}
      {downloadState?.isDownloading && (
        <DownloadDialog 
          filename={downloadState.filename}
          source={downloadState.source}
          onComplete={() => {
            vfs.createNode(
              downloadState.filename,
              'file',
              'downloads',
              'SETUP_EXECUTABLE_DATA',
              undefined,
              'exe'
            );
            setDownloadedFiles(prev => [...prev, downloadState.filename]);
            setDownloadState(null);
          }}
          onCancel={() => setDownloadState(null)}
        />
      )}

      {/* ──────────────────────────────────────────────────────────────
          POST-LOGIN INITIALIZATION OVERLAY
          Shows a sequence of authentic Win95-style loading dialogs,
          then slowly reveals: wallpaper → icons → taskbar.
          bootPhase 99 = fully ready, overlay gone.
      ────────────────────────────────────────────────────────────── */}
      {isInitializing && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-[#5f8787] cursor-wait">

          {/* ── Phase 0: Session Startup ─────────────────────────── */}
          {bootPhase === 0 && (
            <InitDialog title="Session Startup" titleColor="#000080" icon={<Monitor size={32} className="text-blue-800" />}>
              <p className="font-bold text-sm">Starting Vespera Workspace Manager...</p>
              <p className="text-xs text-gray-600 mt-1">Please wait while your personal settings are loaded.</p>
              <ProgressBar pct={15} color="#000080" />
            </InitDialog>
          )}

          {/* ── Phase 1: Driver Configuration ───────────────────── */}
          {bootPhase === 1 && (
            <InitDialog title="Driver Configuration" titleColor="#000080" icon={<HardDrive size={32} className="text-gray-700" />}>
              <p className="font-bold text-sm">Loading System Drivers</p>
              <div className="text-xs mt-2 space-y-0.5 font-mono bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-2">
                <p>S3 86C911 GUI Accelerator ............. <span className="text-green-700 font-bold">OK</span></p>
                <p>SoundBlaster 16 PnP ................... <span className="text-green-700 font-bold">OK</span></p>
                <p>NE2000 Compatible Network Adapter ..... <span className="text-green-700 font-bold">OK</span></p>
                <p>PS/2 Mouse Port ....................... <span className="text-green-700 font-bold">OK</span></p>
                <p>AT-Bus Hard Disk Controller ........... <span className="animate-pulse text-blue-700 font-bold">LOADING...</span></p>
              </div>
              <ProgressBar pct={32} color="#000080" />
            </InitDialog>
          )}

          {/* ── Phase 2: Hardware Scan ───────────────────────────── */}
          {bootPhase === 2 && (
            <InitDialog title="Hardware Check" titleColor="#000080" icon={<Cpu size={32} className={neuralBridgeEnabled ? 'text-red-700 animate-pulse' : 'text-green-700'} />}>
              <p className="font-bold text-sm">Scanning Co-Processors &amp; Extensions</p>
              <div className="text-xs mt-2 space-y-0.5 font-mono bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-2">
                <p>Intel i487DX Math Co-Processor ........ <span className="text-green-700 font-bold">OK</span></p>
                <p>VESA Local Bus ........................ <span className="text-green-700 font-bold">OK</span></p>
                <p>ISA Plug-and-Play ..................... <span className="text-green-700 font-bold">OK</span></p>
                <p className={neuralBridgeEnabled ? 'text-red-700 font-bold animate-pulse' : 'text-yellow-700 font-bold'}>
                  X-Type Neural Bridge .................. {neuralBridgeEnabled ? 'ENABLED ⚠' : '[DISABLED IN BIOS]'}
                </p>
              </div>
              <ProgressBar pct={55} color="#000080" />
            </InitDialog>
          )}

          {/* ── Phase 3: User Profile ───────────────────────────── */}
          {bootPhase === 3 && (
            <InitDialog title="Applying User Settings" titleColor="#000080" icon={<Settings size={32} className="text-blue-700" />}>
              <p className="font-bold text-sm">Restoring Personal Configuration</p>
              <div className="text-xs mt-2 space-y-0.5 font-mono bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-2">
                <p>Reading SYSTEM.DAT .................... <span className="text-green-700 font-bold">OK</span></p>
                <p>Reading USER.DAT ...................... <span className="text-green-700 font-bold">OK</span></p>
                <p>Applying display settings ............. <span className="text-green-700 font-bold">OK</span></p>
                <p>Mounting network drives ............... <span className="animate-pulse text-blue-700 font-bold">CONNECTING...</span></p>
              </div>
              <ProgressBar pct={68} color="#000080" />
            </InitDialog>
          )}

          {/* ── Phase 4: Shell Startup ──────────────────────────── */}
          {bootPhase === 4 && (
            <InitDialog title="Starting Shell" titleColor="#000080" icon={<Monitor size={32} className="text-blue-800" />}>
              <p className="font-bold text-sm">Initializing Desktop Environment</p>
              <div className="text-xs mt-2 space-y-0.5 font-mono bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-2">
                <p>EXPLORER.EXE .......................... <span className="text-green-700 font-bold">OK</span></p>
                <p>Reading desktop layout ................ <span className="text-green-700 font-bold">OK</span></p>
                <p>Registering shell extensions .......... <span className="text-green-700 font-bold">OK</span></p>
                <p>Preparing workspace ................... <span className="animate-pulse text-blue-700 font-bold">PLEASE WAIT...</span></p>
              </div>
              <ProgressBar pct={82} color="#000080" />
            </InitDialog>
          )}

          {/* ── Phase 5 (no bridge) OR Phase 5 (bridge): Finishing ─ */}
          {bootPhase === 5 && !neuralBridgeEnabled && (
            <InitDialog title="System Ready" titleColor="#000080" icon={<Monitor size={32} className="text-blue-800" />}>
              <p className="font-bold text-sm">Desktop is loading...</p>
              <p className="text-xs text-gray-600 mt-1">Vespera Workspace Manager v1.0.4</p>
              <ProgressBar pct={100} color="#000080" animated={false} />
            </InitDialog>
          )}

          {/* ── Neural Bridge Phase 5: X-Type Init ─────────────── */}
          {bootPhase === 5 && neuralBridgeEnabled && (
            <InitDialog title="X-Type Subsystem" titleColor="#800000" icon={<Activity size={32} className="text-red-700 animate-pulse" />}>
              <p className="font-bold text-sm">Initializing Neural Bridge</p>
              <div className="text-xs mt-2 space-y-0.5 font-mono bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-2">
                <p>Loading cortical interface drivers ..... <span className="text-green-700 font-bold">OK</span></p>
                <p>Allocating synaptic buffer (16KB) ...... <span className="text-green-700 font-bold">OK</span></p>
                <p>Establishing bio-digital handshake ..... <span className="animate-pulse text-red-700 font-bold">SYNCING...</span></p>
              </div>
              <ProgressBar pct={40} color="#800000" />
            </InitDialog>
          )}

          {/* ── Neural Bridge Phase 6: Synaptic Alignment ──────── */}
          {bootPhase === 6 && neuralBridgeEnabled && (
            <InitDialog title="X-Type Subsystem" titleColor="#800000" icon={<Activity size={32} className="text-red-700 animate-pulse" />}>
              <p className="font-bold text-sm">Synaptic Alignment</p>
              <div className="text-xs mt-2 space-y-0.5 font-mono bg-white border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white p-2">
                <p>Calibrating pattern recognition ........ <span className="text-green-700 font-bold">OK</span></p>
                <p className="text-red-600 font-bold">!! UNREGISTERED THOUGHT PATTERNS DETECTED</p>
                <p className="text-red-600 font-bold animate-pulse">!! CORTICAL OVERRIDE IN PROGRESS...</p>
              </div>
              <ProgressBar pct={75} color="#800000" />
            </InitDialog>
          )}

          {/* ── Neural Bridge Phase 7: Ready ────────────────────- */}
          {bootPhase === 7 && neuralBridgeEnabled && (
            <InitDialog title="X-Type Subsystem" titleColor="#800000" icon={<Activity size={32} className="text-red-700" />}>
              <p className="font-bold text-sm text-red-700">BRIDGE SYNCHRONIZED.</p>
              <p className="text-xs mt-1 font-mono text-red-600 animate-pulse">OBSERVER PRESENCE CONFIRMED IN SHADOW SECTOR. PROCEEDING.</p>
              <ProgressBar pct={100} color="#800000" animated={false} />
            </InitDialog>
          )}

        </div>
      )}

      {/* Wallpaper fade-in overlay — once wallpaper becomes visible, this fades away */}
      {!wallpaperVisible && !isInitializing && (
        <div className="absolute inset-0 z-[190] bg-[#5f8787] pointer-events-none transition-opacity duration-1000 opacity-0" />
      )}

      {/* Desktop Workspace */}
      <div 
        ref={desktopRef}
        className="absolute inset-0" 
        onClick={() => {
          setMenuOpen(false);
          setContextMenu(null);
          setRenamingNodeId(null);
        }}
        onContextMenu={(e) => handleContextMenu(e)}
      >
        <div className="absolute inset-0 p-4 pointer-events-none">
          {/* This layer provides the icon margin without affecting window constraints */}
        </div>
        
        {/* Haunted Background Elements */}
        {neuralBridgeActive && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-9xl font-bold text-black mix-blend-overlay"
                initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0 }}
                animate={{ 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * window.innerHeight,
                  opacity: [0, 0.5, 0]
                }}
                transition={{ duration: Math.random() * 10 + 5, repeat: Infinity, ease: "linear" }}
              >
                <Eye size={200} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Glitch Text Overlay */}
        <AnimatePresence>
          {glitchText && (
            <motion.div
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none mix-blend-difference"
            >
              <span className="text-white font-mono text-8xl font-black tracking-tighter uppercase">{glitchText}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fake CMD Windows during launch */}
        {cmdWindows.map(cmd => (
          <div 
            key={cmd.id} 
            className="absolute bg-black text-[#c0c0c0] font-mono text-sm border-2 border-t-gray-400 border-l-gray-400 border-b-white border-r-white shadow-[4px_4px_0px_rgba(0,0,0,0.5)] z-50 flex flex-col" 
            style={{ left: cmd.x, top: cmd.y, width: 400, height: 250 }}
          >
            <div className="bg-[#000080] text-white font-bold px-2 py-1 flex justify-between items-center">
              <span>MS-DOS Prompt</span>
              <div className="w-4 h-4 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 flex items-center justify-center text-black text-xs">X</div>
            </div>
            <div className="p-2 whitespace-pre-wrap flex-1 overflow-hidden">
              {cmd.text}
            </div>
          </div>
        ))}

        {/* Desktop Icons — hidden during init, then fade + stagger in */}
        <div 
          className={`absolute inset-0 p-6 pb-20 flex flex-col gap-4 flex-wrap max-h-full transition-opacity duration-700 ${iconsVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ pointerEvents: iconsVisible ? 'auto' : 'none' }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            if (id) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left - 40;
              const y = e.clientY - rect.top - 40;
              setIconPositions(prev => ({ ...prev, [id]: { x, y } }));
            }
          }}
        >
          {installedApps.includes("netmon") && (
            <button 
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', 'netmon_icon');
              }}
              style={{
                position: iconPositions['netmon_icon'] ? 'absolute' : 'relative',
                left: iconPositions['netmon_icon']?.x,
                top: iconPositions['netmon_icon']?.y,
                animationDelay: '0ms',
              }}
              className={`flex flex-col items-center gap-1 w-20 p-1 hover:bg-white/10 active:bg-blue-800/50 rounded group ${iconsVisible ? 'animate-icon-pop' : ''}`}
              onContextMenu={(e) => handleContextMenu(e, 'netmon_icon')}
              onDoubleClick={() => openWindow("netmon")}
            >
              <TerminalIcon size={32} className="text-green-400 drop-shadow-md" />
              <span className="text-white text-xs text-center font-bold drop-shadow-md bg-black/50 px-1 rounded group-hover:bg-blue-800">
                AETHERIS Net-Mon
              </span>
            </button>
          )}

          {installedApps.includes("rhid") && (
            <button 
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', 'rhid_icon');
              }}
              style={{
                position: iconPositions['rhid_icon'] ? 'absolute' : 'relative',
                left: iconPositions['rhid_icon']?.x,
                top: iconPositions['rhid_icon']?.y,
                animationDelay: '50ms',
              }}
              className={`flex flex-col items-center gap-1 w-20 p-1 hover:bg-white/10 active:bg-red-800/50 rounded group ${iconsVisible ? 'animate-icon-pop' : ''}`}
              onContextMenu={(e) => handleContextMenu(e, 'rhid_icon')}
              onDoubleClick={() => openWindow("rhid")}
            >
              <RHIDIcon size={32} />
              <span className="text-white text-xs text-center font-bold drop-shadow-md bg-black/50 px-1 rounded group-hover:bg-red-800">
                RHID Terminal
              </span>
            </button>
          )}

          {installedApps.includes("retrotv") && (
            <button 
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', 'retrotv_icon');
              }}
              style={{
                position: iconPositions['retrotv_icon'] ? 'absolute' : 'relative',
                left: iconPositions['retrotv_icon']?.x,
                top: iconPositions['retrotv_icon']?.y,
                animationDelay: '100ms',
              }}
              className={`flex flex-col items-center gap-1 w-20 p-1 hover:bg-white/10 active:bg-purple-800/50 rounded group ${iconsVisible ? 'animate-icon-pop' : ''}`}
              onContextMenu={(e) => handleContextMenu(e, 'retrotv_icon')}
              onDoubleClick={() => openWindow("retrotv")}
            >
              <Tv size={32} className="text-purple-600 drop-shadow-md" />
              <span className="text-white text-xs text-center font-bold drop-shadow-md bg-black/50 px-1 rounded group-hover:bg-purple-800">
                RetroTV Cable
              </span>
            </button>
          )}

          {vfs.getChildren('desktop')
            .filter(node => node.id !== 'netmon_exe_lnk' && node.id !== 'rhid_exe_lnk')
            .map((node, nodeIndex) => (
            <div 
              key={node.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', node.id);
              }}
              style={{
                position: iconPositions[node.id] ? 'absolute' : 'relative',
                left: iconPositions[node.id]?.x,
                top: iconPositions[node.id]?.y,
                animationDelay: `${nodeIndex * 120}ms`,
              }}
              className={`flex flex-col items-center gap-1 w-20 p-1 hover:bg-white/10 active:bg-blue-800/50 rounded group cursor-pointer ${iconsVisible ? 'animate-icon-pop' : 'opacity-0'}`}
              onContextMenu={(e) => handleContextMenu(e, node.id)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (node.type === 'directory') {
                  openWindow("files");
                } else if (node.type === 'shortcut') {
                  if (node.content) openWindow(node.content);
                } else {
                  setActiveFileId(node.id);
                  openWindow("versa_edit");
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (renamingNodeId !== node.id) {
                  setRenamingNodeId(null);
                }
              }}
            >
              {node.customIcon ? (
                <div className="relative">
                  <img src={node.customIcon} alt="icon" className="w-[32px] h-[32px] drop-shadow-md pointer-events-none" style={{ imageRendering: 'pixelated' }} draggable={false} />
                  {node.type === 'shortcut' && (
                    <div className="absolute -bottom-1 -left-1 bg-white border border-dotted border-black w-3 h-3 flex items-center justify-center">
                      <div className="w-1 h-1 bg-black" />
                    </div>
                  )}
                </div>
              ) : node.type === 'directory' ? (
                <Folder size={32} className="text-yellow-400 drop-shadow-md" />
              ) : node.type === 'shortcut' ? (
                <div className="relative">
                  {node.iconType === 'folder' ? <Folder size={32} className="text-yellow-400 drop-shadow-md" /> :
                   node.iconType === 'system' ? <Settings size={32} className="text-gray-400 drop-shadow-md" /> :
                   node.iconType === 'app' ? <TerminalIcon size={32} className="text-gray-400 drop-shadow-md" /> :
                   node.iconType === 'pen' ? <PenTool size={32} className="text-red-500 drop-shadow-md" /> :
                   node.iconType === 'network' ? <Monitor size={32} className="text-blue-400 drop-shadow-md" /> :
                   <FileText size={32} className="text-white drop-shadow-md" />}
                  <div className="absolute -bottom-1 -left-1 bg-white border border-dotted border-black w-3 h-3 flex items-center justify-center">
                    <div className="w-1 h-1 bg-black" />
                  </div>
                </div>
              ) : (
                <FileText size={32} className="text-white drop-shadow-md" />
              )}
              
              {renamingNodeId === node.id ? (
                <input 
                  autoFocus
                  className="w-full text-xs text-black px-1 outline-none"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => {
                    if (renameValue.trim()) {
                      vfs.renameNode(node.id, renameValue.trim());
                    }
                    setRenamingNodeId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (renameValue.trim()) {
                        vfs.renameNode(node.id, renameValue.trim());
                      }
                      setRenamingNodeId(null);
                    } else if (e.key === 'Escape') {
                      setRenamingNodeId(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span 
                  className={`text-white text-xs text-center font-bold drop-shadow-md bg-black/50 px-1 rounded group-hover:bg-blue-800 break-words w-full line-clamp-2 ${node.type === 'shortcut' ? 'italic border border-dotted border-white' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingNodeId(node.id);
                    setRenameValue(node.name);
                  }}
                >
                  {node.name}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Shortcut Wizard */}
        {showShortcutWizard && (
          <ShortcutWizard 
            onClose={() => setShowShortcutWizard(false)}
            onCreate={(name, target, iconType) => {
              vfs.createNode(name, "shortcut", "desktop", "", target, iconType);
              setShowShortcutWizard(false);
            }}
            installedApps={installedApps}
          />
        )}

        {/* System Recovery Modal */}
        {needsRecovery && (
          <SystemRecoveryModal 
            onComplete={() => setNeedsRecovery(false)} 
            setUnrestrictedPollingEnabled={setUnrestrictedPollingEnabled}
          />
        )}

        {/* Remote Desktop Close Warning */}
        {remoteDesktopCloseWarning && (
          <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/40">
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-80">
              <div className="bg-[#000080] text-white px-2 py-1 text-sm font-bold">VesperaConnect</div>
              <div className="p-4 text-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-yellow-400 border-2 border-t-yellow-200 border-l-yellow-200 border-b-yellow-600 border-r-yellow-600 flex items-center justify-center text-black font-bold text-xl shrink-0">!</div>
                  <div>
                    <p className="font-bold mb-1">Active remote session detected!</p>
                    <p className="text-xs">Closing this window will terminate your connection to VESPERA-SRV01. Any unsaved work on the remote server will be lost.</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 px-4 pb-3">
                <button onClick={() => { setRemoteDesktopCloseWarning(false); setWindows(prev => prev.map(w => w.id === 'remote_desktop' ? { ...w, isOpen: false, isMinimized: false, isMaximized: false } : w)); }}
                  className="px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-sm font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Disconnect</button>
                <button onClick={() => setRemoteDesktopCloseWarning(false)}
                  className="px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-sm font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <RunDialog isOpen={runDialogOpen} onClose={() => setRunDialogOpen(false)} onSubmit={handleRunLine} />

        {/* Window Management Workspace - Focus Shield */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{
            // Only intercept events when: menu is closed AND there are visible windows
            // Without this, the shield blocks all desktop icon clicks/right-clicks
            pointerEvents: (menuOpen || windows.every(w => !w.isOpen || w.isMinimized)) ? 'none' : 'auto',
            cursor: resizing ? resizeCursorMap[resizing.edge] : undefined
          }}
        >
          {windows.map((win, index) => {
            const isPersistentMinimized = win.isMinimized && ["media_player", "vstore", "vmail"].includes(win.id);
            if (!win.isOpen) return null;
            if (win.isMinimized && !isPersistentMinimized) return null;
            
            const activeWindowId = windows.filter(w => w.isOpen && !w.isMinimized).pop()?.id;
            const isActive = win.id === activeWindowId;
            const isBeingResized = resizing?.id === win.id;
            
            return (
            <motion.div
              key={win.id}
              drag={!win.isMaximized && !resizing && !isPersistentMinimized}
              dragMomentum={false}
              dragConstraints={desktopRef}
              dragElastic={0}
              onDragEnd={(e, info) => {
                // Ensure some part of the window (at least the title bar) stays on screen
                // motion.div handles dragging within constraints, but we need to update state
                // info.point is absolute, but win.x/y are relative to parent
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                const parentRect = desktopRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
                const scaleVal = parentRect.width / (deskWidth || 1) || 1;
                
                const finalX = (rect.left - parentRect.left) / scaleVal;
                const finalY = (rect.top - parentRect.top) / scaleVal;

                setWindows(prev => prev.map(w => w.id === win.id ? { ...w, x: finalX, y: finalY } : w));
              }}
              onMouseDown={() => bringToFront(win.id)}
              initial={{ x: win.x, y: win.y }}
              animate={{ 
                x: isPersistentMinimized ? -9999 : (win.isMaximized ? 4 : win.x), 
                y: isPersistentMinimized ? 0 : (win.isMaximized ? 4 : win.y), 
                width: isPersistentMinimized ? 1 : (win.isMaximized ? (deskWidth - 8) : (win.width || 384)), 
                height: isPersistentMinimized ? 1 : (win.isMaximized ? (deskHeight - 80) : (win.height || 'auto')),
                scale: 1,
                opacity: isPersistentMinimized ? 0 : 1
              }}
              transition={{ duration: isBeingResized ? 0 : 0.1 }}
              className={`absolute bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden box-border ${vfs.displaySettings?.plusTheme === 'cyber_nature' ? 'plus-window-open-nature' : vfs.displaySettings?.plusTheme === 'corporate_void' ? 'plus-window-open-void' : ''}`}
              style={{ zIndex: isPersistentMinimized ? 0 : 100 + index, top: 0, left: 0, pointerEvents: isPersistentMinimized ? "none" : "auto" }}
            >
              {/* Resize handles — only on non-maximized windows */}
              {!win.isMaximized && !isPersistentMinimized && (
                <>
                  {/* Edges */}
                  <div onMouseDown={e => startResize(e, win.id, 'n')}  style={{ position:'absolute', top:-4,    left:8,    right:8,   height:8,  cursor:'ns-resize',   zIndex:10 }} />
                  <div onMouseDown={e => startResize(e, win.id, 's')}  style={{ position:'absolute', bottom:-4, left:8,    right:8,   height:8,  cursor:'ns-resize',   zIndex:10 }} />
                  <div onMouseDown={e => startResize(e, win.id, 'w')}  style={{ position:'absolute', top:8,    left:-4,   bottom:8,  width:8,   cursor:'ew-resize',   zIndex:10 }} />
                  <div onMouseDown={e => startResize(e, win.id, 'e')}  style={{ position:'absolute', top:8,    right:-4,  bottom:8,  width:8,   cursor:'ew-resize',   zIndex:10 }} />
                  {/* Corners */}
                  <div onMouseDown={e => startResize(e, win.id, 'nw')} style={{ position:'absolute', top:-4,    left:-4,   width:12,  height:12, cursor:'nwse-resize', zIndex:11 }} />
                  <div onMouseDown={e => startResize(e, win.id, 'ne')} style={{ position:'absolute', top:-4,    right:-4,  width:12,  height:12, cursor:'nesw-resize', zIndex:11 }} />
                  <div onMouseDown={e => startResize(e, win.id, 'sw')} style={{ position:'absolute', bottom:-4, left:-4,   width:12,  height:12, cursor:'nesw-resize', zIndex:11 }} />
                  <div onMouseDown={e => startResize(e, win.id, 'se')} style={{ position:'absolute', bottom:-4, right:-4,  width:12,  height:12, cursor:'nwse-resize', zIndex:11 }} />
                </>
              )}
              {/* Motif-style Titlebar — colors follow Task Menu theme */}
              <div
                onDoubleClick={() => maximizeWindow(win.id, {} as any)}
                className={`px-2 py-1 flex justify-between items-center ${!win.isMaximized ? 'cursor-move' : ''} border-b-2 border-gray-800 transition-colors duration-75`}
                style={
                  isActive && neuralBridgeActive && Math.random() > 0.95
                    ? { backgroundColor: '#7f1d1d', color: '#fecaca' }
                    : isActive
                      ? { backgroundColor: chromeTheme.headerBg, color: chromeTheme.headerText }
                      : { backgroundColor: chromeTheme.windowInactiveBg, color: chromeTheme.windowInactiveText }
                }
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-wide">{win.title}</span>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => minimizeWindow(win.id, e)}
                    className="w-5 h-5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 flex items-end justify-center pb-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black font-bold"
                  >
                    _
                  </button>
                  {win.id !== 'packman' && (
                    <button 
                      onClick={(e) => maximizeWindow(win.id, e)}
                      className="w-5 h-5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 flex items-center justify-center active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black"
                    >
                      {win.isMaximized ? <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-black relative"><div className="absolute top-1 left-1 w-2.5 h-2.5 border-2 border-black" /></div> : <div className="w-3 h-3 border-2 border-black border-t-4" />}
                    </button>
                  )}
                  <button 
                    onClick={(e) => closeWindow(win.id, e)}
                    className="w-5 h-5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 flex items-center justify-center active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black font-bold text-sm"
                  >
                    X
                  </button>
                </div>
              </div>
              {/* Window Content */}
              <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white m-1 overflow-hidden flex flex-col bg-[#c0c0c0]">
                {renderWindowContent(win.id)}
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>

      {/* Motif/CDE Inspired Centered Panel (1991-1994 UNIX style) — slides up when desktop is ready */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 h-16 border-2 flex items-center p-1.5 gap-2 z-[9999] shadow-[4px_4px_0px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out ${theme.bgOuter} ${theme.borderOuter} ${taskbarVisible ? 'bottom-2 opacity-100' : '-bottom-20 opacity-0'} max-w-[98%] whitespace-nowrap overflow-hidden`}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (desktopRef.current) {
            const rect = desktopRef.current.getBoundingClientRect();
            const currentScale = rect.width / desktopRef.current.offsetWidth || 1;
            setContextMenu({ x: (e.clientX - rect.left) / currentScale, y: (e.clientY - rect.top) / currentScale, nodeId: '__taskbar__' });
          } else {
            setContextMenu({ x: e.clientX, y: e.clientY, nodeId: '__taskbar__' });
          }
        }}
      >
        
        {/* Left: Clock / Status (Recessed) */}
        {vfs.displaySettings?.taskbarShowClock !== false && (() => {
          const bgCol = vfs.displaySettings?.clockBgColor || (tTheme === 'dark' ? '#000000' : '#c0c0c0');
          const textCol = vfs.displaySettings?.clockTextColor || (tTheme === 'dark' ? '#22c55e' : '#000000');
          const fontClass = vfs.displaySettings?.clockFont || 'font-mono';
          const is12Hour = vfs.displaySettings?.clockFormat === '12h';
          
          return (
            <div className={`h-full flex items-center gap-1 border-2 p-1 ${theme.bgRecessed} ${theme.borderRecessed}`}>
              <div 
                className={`h-full px-2 border-2 ${tTheme === 'dark' ? 'border-t-[#222] border-l-[#222] border-b-[#555] border-r-[#555]' : 'border-t-[#2a3f5c] border-l-[#2a3f5c] border-b-[#ffffff] border-r-[#ffffff]'} flex flex-col items-center justify-center ${fontClass} text-xs min-w-[60px]`}
                style={{ backgroundColor: bgCol, color: textCol }}
              >
                <span className="font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: is12Hour })}</span>
                {strictDialUp && (
                  <span
                    className={`text-[9px] leading-none mt-0.5 font-bold ${isLinkUp ? 'text-green-800' : linkStatus === 'dialing' ? 'text-yellow-800 animate-pulse' : 'text-red-800'}`}
                    title={isLinkUp ? 'VesperaNET connected' : linkStatus === 'dialing' ? 'Dialing…' : 'Offline'}
                  >
                    {isLinkUp ? 'NET' : linkStatus === 'dialing' ? '···' : 'OFF'}
                  </span>
                )}
                {neuralBridgeActive && <span className="text-red-600 animate-pulse text-[10px] leading-none mt-1">SYNC</span>}
              </div>
            </div>
          );
        })()}

        {/* Center: Main Menu / Workspace (Recessed) */}
        {(() => {
          // Build the effective menu: start with saved or default, then inject installed apps
          const savedMenu: WorkspaceMenuItem[] = vfs.displaySettings?.workspaceMenu || DEFAULT_WORKSPACE_MENU;
          
          // Deep-clone the menu so we can inject dynamic items
          const effectiveMenu: WorkspaceMenuItem[] = JSON.parse(JSON.stringify(savedMenu));
          
          // Inject installed apps into the "Installed Programs" folder
          const installedFolder = effectiveMenu.find(item => item.id === 'installed');
          if (installedFolder) {
            const dynamicChildren: WorkspaceMenuItem[] = [];
            if (installedApps.includes('netmon')) {
              dynamicChildren.push({ id: 'wm_netmon', label: 'AETHERIS Network Monitor', icon: 'Terminal', action: 'netmon', type: 'app', isDynamic: true });
            }
            if (installedApps.includes('rhid')) {
              dynamicChildren.push({ id: 'wm_rhid', label: 'RHID Terminal', icon: 'Terminal', action: 'rhid', type: 'app', isDynamic: true });
            }
            // Add any other future installed apps from VFS
            vfs.nodes.filter((n: any) => n.isApp && n.id !== 'netmon_exe' && n.id !== 'rhid_exe').forEach((n: any) => {
              const appId = n.id.replace('_exe', '');
              if (!dynamicChildren.find(c => c.action === appId)) {
                dynamicChildren.push({ id: `wm_${appId}`, label: n.appDisplayName || n.name, icon: 'Package', action: appId, type: 'app', isDynamic: true });
              }
            });
            installedFolder.children = dynamicChildren;
          }

          const systemFolder = effectiveMenu.find(item => item.id === 'system');
          const systemTools = systemFolder?.children?.find(c => c.id === 'system_tools');
          if (systemTools?.children && !systemTools.children.some(c => c.action === 'dialup')) {
            systemTools.children.push({
              id: 'wm_dialup',
              label: 'VesperaNET Dial-Up',
              icon: 'Phone',
              action: 'dialup',
              type: 'app',
              isDynamic: true,
            });
          }
          if (systemTools?.children && !systemTools.children.some(c => c.action === 'scandisk')) {
            systemTools.children.push({
              id: 'wm_scandisk',
              label: 'Disk Checker',
              icon: 'ShieldCheck',
              action: 'scandisk',
              type: 'app',
              isDynamic: true,
            });
          }

          if (systemFolder?.children && !systemFolder.children.some(c => c.action === 'findfiles')) {
            const xIdx = systemFolder.children.findIndex(c => c.id === 'wm_xtype');
            const insertAt = xIdx >= 0 ? xIdx + 1 : 0;
            systemFolder.children.splice(insertAt, 0, {
              id: 'wm_find',
              label: 'Find Files…',
              icon: 'Search',
              action: 'findfiles',
              type: 'app',
              isDynamic: true,
            });
          }
          if (systemFolder?.children && !systemFolder.children.some(c => c.action === '__run__')) {
            const findIdx = systemFolder.children.findIndex(c => c.action === 'findfiles');
            const xIdx = systemFolder.children.findIndex(c => c.id === 'wm_xtype');
            const insertAt = findIdx >= 0 ? findIdx + 1 : (xIdx >= 0 ? xIdx + 1 : 0);
            systemFolder.children.splice(insertAt, 0, {
              id: 'wm_run',
              label: 'Run…',
              icon: 'Play',
              action: '__run__',
              type: 'app',
              isDynamic: true,
            });
          }
          
          
          // openSubMenuId and subMenuTimeoutRef are at component level
          
          const handleItemClick = (item: WorkspaceMenuItem) => {
            if (item.type === 'signout') {
              if (item.id === 'wm_signout') handleSignOut();
              else if (item.id === 'wm_signout_term') handleSignOutToTerminal();
              return;
            }
            if (item.type === 'shutdown') {
              handleShutDown();
              return;
            }
            if (item.type === 'app' && item.action) {
              if (item.action === '__run__') {
                setRunDialogOpen(true);
                return;
              }
              if (item.action === 'browser') {
                handleLaunchBrowser();
              } else {
                toggleWindow(item.action);
              }
            }
          };
          
          // Recursive submenu renderer
          const renderMenuItems = (items: WorkspaceMenuItem[], depth: number = 0) => {
            return items.map((item, idx) => {
              if (item.type === 'separator') {
                return <div key={item.id} className="my-1 mx-1" style={{ height: 2, background: `linear-gradient(to right, ${chromeTheme.borderDark}, ${chromeTheme.borderLight})` }} />;
              }
              
              // Folder with children — submenu
              if (item.type === 'folder') {
                // Don't show empty dynamic folders
                if (item.isDynamic && (!item.children || item.children.length === 0)) return null;
                
                const isSubOpen = openSubMenuIds.has(item.id);
                
                // Helper to clear a specific folder's close timeout
                const clearFolderTimeout = (folderId: string) => {
                  const t = subMenuTimeoutsRef.current.get(folderId);
                  if (t) { clearTimeout(t); subMenuTimeoutsRef.current.delete(folderId); }
                };
                
                // Helper to schedule closing a folder and all its descendants
                const scheduleFolderClose = (folderId: string) => {
                  clearFolderTimeout(folderId);
                  subMenuTimeoutsRef.current.set(folderId, setTimeout(() => {
                    setOpenSubMenuIds(prev => {
                      const next = new Set(prev);
                      // Remove this folder and any descendants
                      const removeDescendants = (items: WorkspaceMenuItem[], parentRemoved: boolean) => {
                        for (const child of items) {
                          if (child.id === folderId || parentRemoved) {
                            next.delete(child.id);
                            if (child.children) removeDescendants(child.children, true);
                          } else if (child.children) {
                            removeDescendants(child.children, false);
                          }
                        }
                      };
                      next.delete(folderId);
                      // Also remove children of this folder from the set
                      if (item.children) {
                        const removeAll = (children: WorkspaceMenuItem[]) => {
                          for (const c of children) {
                            next.delete(c.id);
                            if (c.children) removeAll(c.children);
                          }
                        };
                        removeAll(item.children);
                      }
                      return next;
                    });
                  }, 300));
                };
                
                return (
                  <div 
                    key={item.id}
                    className="relative"
                    onMouseEnter={(e) => {
                      // Clear all pending close timeouts
                      subMenuTimeoutsRef.current.forEach((t) => clearTimeout(t));
                      subMenuTimeoutsRef.current.clear();
                      
                      const rect = e.currentTarget.getBoundingClientRect();
                      setSubMenuPositions(prev => ({ ...prev, [item.id]: rect }));

                      setOpenSubMenuIds(prev => {
                        const next = new Set(prev);
                        // Close sibling folders at the same level and all their descendants
                        for (const sibling of items) {
                          if (sibling.id !== item.id && sibling.type === 'folder') {
                            next.delete(sibling.id);
                            const removeDescendants = (children?: WorkspaceMenuItem[]) => {
                              if (!children) return;
                              for (const c of children) {
                                next.delete(c.id);
                                if (c.children) removeDescendants(c.children);
                              }
                            };
                            removeDescendants(sibling.children);
                          }
                        }
                        // Open this folder
                        next.add(item.id);
                        return next;
                      });
                    }}
                    onMouseLeave={() => {
                      scheduleFolderClose(item.id);
                    }}
                  >
                    <button 
                      className="w-full text-left px-3 py-1.5 text-sm font-bold flex items-center justify-between gap-1 transition-colors duration-75"
                      style={{
                        color: isSubOpen ? chromeTheme.hoverText : chromeTheme.bodyText,
                        backgroundColor: isSubOpen ? chromeTheme.hoverBg : 'transparent',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = chromeTheme.hoverBg; e.currentTarget.style.color = chromeTheme.hoverText; }}
                      onMouseLeave={(e) => { if (!isSubOpen) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = chromeTheme.bodyText; } }}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon && ICON_MAP[item.icon] ? React.createElement(ICON_MAP[item.icon], { size: 16 }) : <FolderOpen size={16} />}
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={14} />
                    </button>
                    {isSubOpen && item.children && item.children.length > 0 && (() => {
                      const pos = subMenuPositions[item.id];
                      const desktopRect = desktopRef.current?.getBoundingClientRect();
                      const submenuHeight = ((item.children?.length || 0) * 30) + 10;
                      const submenuWidth = 208;

                      let horizontalFlip = false;
                      let verticalFlip = false;

                      if (pos && desktopRect) {
                        if (pos.right + submenuWidth > desktopRect.right - 10) {
                          horizontalFlip = true;
                        }
                        if (pos.top + submenuHeight > desktopRect.bottom - 45) {
                          verticalFlip = true;
                        }
                      }

                      return (
                        <div 
                          className="absolute flex flex-col w-52 z-[10000] p-1 shadow-[3px_3px_0px_rgba(0,0,0,0.4)]"
                          style={{
                            left: horizontalFlip ? 'auto' : 'calc(100% - 2px)',
                            right: horizontalFlip ? 'calc(100% - 2px)' : 'auto',
                            top: verticalFlip ? 'auto' : '0',
                            bottom: verticalFlip ? '0' : 'auto',
                            backgroundColor: chromeTheme.bodyBg,
                            borderWidth: 2,
                            borderStyle: 'solid',
                            borderTopColor: chromeTheme.borderLight,
                            borderLeftColor: chromeTheme.borderLight,
                            borderBottomColor: chromeTheme.borderDark,
                            borderRightColor: chromeTheme.borderDark,
                          }}
                          data-task-menu="true"
                          onMouseEnter={() => {
                            subMenuTimeoutsRef.current.forEach((t) => clearTimeout(t));
                            subMenuTimeoutsRef.current.clear();
                          }}
                          onMouseLeave={() => {
                            scheduleFolderClose(item.id);
                          }}
                        >
                          {renderMenuItems(item.children, depth + 1)}
                        </div>
                      );
                    })()}
                  </div>
                );
              }
              
              // App / action items
              const IconComp = item.icon && ICON_MAP[item.icon] ? ICON_MAP[item.icon] : FileText;
              const isShutdown = item.type === 'shutdown';
              
              return (
                <button 
                  key={item.id}
                  onClick={() => { handleItemClick(item); setMenuOpen(false); setOpenSubMenuIds(new Set()); }}
                  className="w-full text-left px-3 py-1.5 text-sm font-bold flex items-center gap-3 transition-colors duration-75"
                  style={{ color: isShutdown ? '#cc0000' : chromeTheme.bodyText }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isShutdown ? '#cc0000' : chromeTheme.hoverBg; e.currentTarget.style.color = chromeTheme.hoverText; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = isShutdown ? '#cc0000' : chromeTheme.bodyText; }}
                >
                  <IconComp size={16} />
                  {item.label}
                </button>
              );
            });
          };
          
          return (
            <div className={`relative h-full flex items-center justify-center border-2 p-1 ${theme.bgRecessed} ${theme.borderRecessed}`}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className={`h-full px-4 font-bold flex items-center justify-center gap-2 border-2 ${menuOpen ? `${theme.bgRecessed} ${theme.borderRecessed} ${theme.textMain}` : `${theme.bgButton} ${theme.borderButton} ${theme.textMain} ${theme.activeClass}`}`}
              >
                <Monitor size={20} className={neuralBridgeActive && Math.random() > 0.9 ? "text-red-400" : (theme.textMain.includes('black') ? 'text-black' : "text-white")} />
                <span className="text-sm tracking-wider">Vespera</span>
              </button>

              {/* Workspace Pop-up Menu */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div 
                    data-task-menu="true"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.12 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 flex flex-col z-[9999]"
                    style={{
                      backgroundColor: chromeTheme.bodyBg,
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderTopColor: chromeTheme.borderLight,
                      borderLeftColor: chromeTheme.borderLight,
                      borderBottomColor: chromeTheme.borderDark,
                      borderRightColor: chromeTheme.borderDark,
                      boxShadow: '4px 4px 0px rgba(0,0,0,0.5)',
                      // Adjust main menu position if it would go off screen
                      transform: (() => {
                        const menuWidth = 240; // w-60 = 15rem = 240px
                        const wouldOverflowLeft = window.innerWidth / 2 - menuWidth / 2 < 0;
                        const wouldOverflowRight = window.innerWidth / 2 + menuWidth / 2 > window.innerWidth;
                        
                        if (wouldOverflowLeft) return 'translateX(-50%) translateX(20px)';
                        if (wouldOverflowRight) return 'translateX(-50%) translateX(-20px)';
                        return 'translateX(-50%)';
                      })(),
                    }}
                  >
                    {/* Header bar — shows username */}
                    <div 
                      className="px-3 py-2 text-sm font-bold tracking-widest uppercase flex items-center gap-2"
                      style={{ backgroundColor: chromeTheme.headerBg, color: chromeTheme.headerText }}
                    >
                      {(() => {
                        const activeUser = vfs.systemUsers?.find((u: any) => u.username === currentUser);
                        return (
                          <>
                            {activeUser?.profilePic ? (
                              <img src={activeUser.profilePic} alt="avatar" className="w-5 h-5 rounded-full border border-[rgba(255,255,255,0.4)] object-cover" />
                            ) : (
                              <Monitor size={14} />
                            )}
                            {activeUser?.displayName || currentUser}
                            {activeUser?.vstoreId && (
                              <Globe size={14} className="text-yellow-400 ml-auto" title="VesperaNET Synced" />
                            )}
                          </>
                        );
                      })()}
                    </div>
                    {/* Menu items */}
                    <div className="flex flex-col w-full p-1">
                      {renderMenuItems(effectiveMenu)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })()}

        {/* Right: App Dock (Recessed) */}
        <div className={`h-full flex items-center gap-1 border-2 p-1 ${theme.bgRecessed} ${theme.borderRecessed}`}>
          {(() => {
            const activeWindowId = windows.filter(w => w.isOpen && !w.isMinimized).pop()?.id;
            
            const pinnedAppIds = vfs.displaySettings?.pinnedApps || ['files', 'browser', 'workbench', 'analyzer', 'chat', 'control_panel', 'xtype'];
            
            const baseDockApps: any[] = [];
            
            // 1. Add explicitly pinned apps
            pinnedAppIds.forEach((id: string) => {
              const meta = APP_DICTIONARY[id] || APP_DICTIONARY['default'];
              baseDockApps.push({ 
                id, 
                icon: meta.icon, 
                color: meta.color, 
                title: meta.defaultTitle,
                action: id === 'browser' ? handleLaunchBrowser : undefined 
              });
            });

            // 2. Add unpinned apps that are currently open
            windows.forEach(win => {
              if (win.isOpen && !baseDockApps.find(a => a.id === win.id)) {
                let meta = APP_DICTIONARY[win.id];
                if (!meta) {
                  // Fallback for setup wizards etc.
                  if (win.id.endsWith('_setup') && APP_DICTIONARY[win.id.replace('_setup', '')]) {
                    meta = APP_DICTIONARY[win.id.replace('_setup', '')];
                  } else {
                    meta = APP_DICTIONARY['default'];
                  }
                }
                baseDockApps.push({
                  id: win.id,
                  icon: meta.icon,
                  color: meta.color,
                  title: win.title || meta.defaultTitle
                });
              }
            });

            const dockApps = [];
            dockOrder.forEach(id => {
              const found = baseDockApps.find(a => a.id === id);
              if (found) dockApps.push(found);
            });
            baseDockApps.forEach(app => {
              if (!dockOrder.includes(app.id)) dockApps.push(app);
            });

            return dockApps.map((app, appIdx) => {
              const win = windows.find(w => w.id === app.id);
              const isOpen = win?.isOpen;
              const isTop = activeWindowId === app.id;
              
              return (
                <button 
                  key={app.id}
                  draggable={true}
                  onDragStart={(e) => {
                    setDraggedDockId(app.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const win = windows.find(w => w.id === app.id);
                    if (win && win.isOpen) {
                      if (desktopRef.current) {
                        const rect = desktopRef.current.getBoundingClientRect();
                        const currentScale = rect.width / desktopRef.current.offsetWidth || 1;
                        setContextMenu({ x: (e.clientX - rect.left) / currentScale, y: (e.clientY - rect.top) / currentScale, nodeId: '__task__' + app.id });
                      } else {
                        setContextMenu({ x: e.clientX, y: e.clientY, nodeId: '__task__' + app.id });
                      }
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!draggedDockId || draggedDockId === app.id) return;
                    const newOrder = [...dockOrder];
                    
                    // Add any missing IDs to our tracked order list first to ensure completeness
                    baseDockApps.forEach(ba => {
                      if (!newOrder.includes(ba.id)) newOrder.push(ba.id);
                    });
                    
                    const draggedIdx = newOrder.indexOf(draggedDockId);
                    const targetIdx = newOrder.indexOf(app.id);
                    
                    if (draggedIdx !== -1 && targetIdx !== -1) {
                      newOrder.splice(draggedIdx, 1);
                      newOrder.splice(targetIdx, 0, draggedDockId);
                      setDockOrder(newOrder);
                    }
                    setDraggedDockId(null);
                  }}
                  onDragEnd={() => setDraggedDockId(null)}
                  onClick={() => app.action ? app.action() : toggleWindow(app.id)}
                  className={`relative h-full w-12 flex flex-col items-center justify-center border-2 transition-none ${isTop ? `${theme.bgRecessed} ${theme.borderRecessed}` : `${theme.bgButton} ${theme.borderButton} ${theme.activeClass}`} ${draggedDockId === app.id ? 'opacity-50' : 'opacity-100'}`}
                  title={app.title}
                >
                  <app.icon size={20} className={isOpen && !isTop ? app.color : (isTop ? (theme.textMain.includes('black') ? 'text-black' : 'text-white') : 'text-gray-200')} />
                  {isOpen && <div className={`absolute bottom-0.5 w-4 h-0.5 ${isTop ? (theme.textMain.includes('black') ? 'bg-black' : 'bg-white') : 'bg-gray-300'}`} />}
                </button>
              );
            });
          })()}
        </div>

        {/* Tray: Internet, playback volume, spectrum when Media Agent is playing */}
        <div
          ref={taskbarTrayRef}
          className={`relative h-full flex items-stretch gap-0.5 border-2 p-1 shrink-0 ${theme.bgRecessed} ${theme.borderRecessed}`}
        >
          <div className="relative h-full flex items-stretch">
            <button
              type="button"
              title="Internet"
              aria-expanded={internetTrayOpen}
              onClick={() => {
                setVolumeTrayOpen(false);
                setInternetTrayOpen((o) => !o);
              }}
              className={`h-full w-9 flex items-center justify-center border-2 ${theme.bgButton} ${theme.borderButton} ${theme.activeClass}`}
            >
              <Globe size={18} className={theme.textMain.includes('black') ? 'text-black' : 'text-white'} />
            </button>
            {internetTrayOpen && (
              <div
                className="absolute bottom-[calc(100%+6px)] right-0 z-[10001] flex flex-col min-w-[188px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] py-1"
                style={{
                  ['--vm-hover-bg' as string]: chromeTheme.hoverBg,
                  ['--vm-hover-fg' as string]: chromeTheme.hoverText,
                }}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-gray-600 border-b border-gray-500 mb-0.5">
                  Internet
                  {strictDialUp && (
                    <span className={`block mt-0.5 font-mono ${isLinkUp ? 'text-green-800' : linkStatus === 'dialing' ? 'text-yellow-800' : 'text-red-800'}`}>
                      VesperaNET: {isLinkUp ? 'Connected' : linkStatus === 'dialing' ? 'Dialing…' : 'Offline'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="text-left px-3 py-1.5 text-xs text-black enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)]"
                  onClick={() => {
                    setInternetTrayOpen(false);
                    handleLaunchBrowser();
                  }}
                >
                  Vespera Navigator…
                </button>
                <button
                  type="button"
                  className="text-left px-3 py-1.5 text-xs text-black enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)]"
                  onClick={() => {
                    setInternetTrayOpen(false);
                    toggleWindow('dialup');
                  }}
                >
                  VesperaNET Dial-Up…
                </button>
                {installedApps.includes('netmon') && (
                  <button
                    type="button"
                    className="text-left px-3 py-1.5 text-xs text-black enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)]"
                    onClick={() => {
                      setInternetTrayOpen(false);
                      toggleWindow('netmon');
                    }}
                  >
                    AETHERIS Network Monitor
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="relative h-full flex items-stretch">
            <button
              type="button"
              title="Volume"
              aria-expanded={volumeTrayOpen}
              onClick={() => {
                setInternetTrayOpen(false);
                setVolumeTrayOpen((o) => !o);
              }}
              className={`h-full w-9 flex items-center justify-center border-2 ${theme.bgButton} ${theme.borderButton} ${theme.activeClass}`}
            >
              {taskbarMedia.volume < 0.04 ? (
                <VolumeX size={18} className={theme.textMain.includes('black') ? 'text-black' : 'text-white'} />
              ) : (
                <Volume2 size={18} className={theme.textMain.includes('black') ? 'text-black' : 'text-white'} />
              )}
            </button>
            {volumeTrayOpen && (
              <div className="absolute bottom-[calc(100%+6px)] right-0 z-[10001] w-[248px] box-border bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] px-2.5 py-2">
                <div className="text-[10px] font-bold text-black mb-1.5">Playback volume</div>
                <div className="flex items-center gap-1.5 w-full min-w-0">
                  <VolumeX size={14} className="text-gray-600 shrink-0 w-[14px]" aria-hidden />
                  <div className="flex-1 min-w-0 py-1">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={taskbarMedia.volume}
                      onChange={(e) => setTaskbarPlaybackVolume(Number(e.target.value))}
                      className="block w-full max-w-full h-2 min-h-[8px] accent-teal-700 cursor-pointer"
                      style={{ boxSizing: 'border-box' }}
                    />
                  </div>
                  <Volume2 size={14} className="text-gray-600 shrink-0 w-[14px]" aria-hidden />
                </div>
                <p className="text-[9px] text-gray-600 mt-1.5 leading-tight">Adjusts VERSA Media Agent output. Preference is saved.</p>

                {(vfs.displaySettings?.plusTheme && vfs.displaySettings.plusTheme !== 'standard' && PLUS_THEMES[vfs.displaySettings.plusTheme]?.ambientType) ? (
                  <div className="mt-3 border-t border-gray-400 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="accent-[#000080]"
                        checked={vfs.displaySettings.plusThemeAmbientMuted === true}
                        onChange={(e) => {
                          if (vfs.updatePlusTheme) {
                            vfs.updatePlusTheme(vfs.displaySettings.plusTheme, e.target.checked);
                          }
                        }}
                      />
                      <span className="text-[10px] font-bold">Mute System Ambience</span>
                    </label>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Tray: Mail icon (only when VMail is installed) */}
          {vmailInstalled && (
            <div className="relative h-full flex items-stretch">
              <button
                type="button"
                title={vmailUnread > 0 ? `${vmailUnread} unread message${vmailUnread !== 1 ? 's' : ''}` : 'VMail'}
                onClick={() => {
                  setInternetTrayOpen(false);
                  setVolumeTrayOpen(false);
                  toggleWindow('vmail');
                }}
                className={`h-full w-9 flex items-center justify-center border-2 relative ${theme.bgButton} ${theme.borderButton} ${theme.activeClass}`}
              >
                <Mail size={16} className={theme.textMain.includes('black') ? 'text-black' : 'text-white'} />
                {vmailUnread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-yellow-600 shadow-[0_0_4px_rgba(255,204,0,0.8)] animate-pulse" />
                )}
              </button>
            </div>
          )}

          {(() => {
            const mediaPlayerOpen = windows.some((w) => w.id === "media_player" && w.isOpen);
            const ds = vfs.displaySettings as {
              waveBarEnabled?: boolean;
              waveBarStyle?: string;
              waveBarColor?: string;
              waveBarBarCount?: number;
              waveBarSpeed?: string;
              waveBarUseAlbumArt?: boolean;
            };
            const waveEnabled = ds?.waveBarEnabled !== false;
            const showNowPlayingWidget =
              mediaPlayerOpen && waveEnabled && taskbarMedia.isPlaying && taskbarMedia.hasTrack;
            if (!showNowPlayingWidget) return null;

            const useAlbumArt = ds?.waveBarUseAlbumArt === true;
            const artSrc = taskbarMedia.nowPlayingArt;
            if (useAlbumArt && artSrc) {
              return (
                <div className="h-full flex items-center px-0.5 self-stretch shrink-0" title="Now playing">
                  <img
                    src={artSrc}
                    alt=""
                    className="h-[22px] w-[22px] object-cover border border-gray-600 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] shrink-0"
                  />
                </div>
              );
            }

            const styleId = ds?.waveBarStyle || "classic";
            const barColor = ds?.waveBarColor || "#34d399";
            const nBars = typeof ds?.waveBarBarCount === "number" ? Math.min(9, Math.max(3, ds.waveBarBarCount)) : 5;
            const spd = ds?.waveBarSpeed || "normal";
            const spdMul = spd === "slow" ? 1.35 : spd === "fast" ? 0.72 : 1;
            const baseDur = (spd === "slow" ? 0.62 : spd === "fast" ? 0.28 : 0.42) * spdMul;

            const neonGlow = styleId === "neon" ? `0 0 6px ${barColor}, 0 0 10px ${barColor}88` : `0 0 4px ${barColor}aa`;

            let barClass = "w-[3px] rounded-[0.5px]";
            let maxH = 18;
            let gapClass = "gap-px";
            let ease: "easeInOut" | "linear" = "easeInOut";

            if (styleId === "blocks") barClass = "w-[4px] rounded-[1px]";
            else if (styleId === "minimal" || styleId === "thin") barClass = "w-[2px] rounded-[0.5px]";
            if (styleId === "minimal") maxH = 12;
            else if (styleId === "smooth" || styleId === "pulse") maxH = 20;
            else if (styleId === "thin") maxH = 14;
            if (styleId === "blocks") gapClass = "gap-0.5";

            const barAnimate = (i: number, n: number): number[] => {
              const t = i / Math.max(1, n - 1);
              if (styleId === "blocks") return [0.5, 1, 0.65, 0.9, 0.55];
              if (styleId === "retro") return [0.45, 1, 0.45, 0.75, 0.45];
              if (styleId === "spark")
                return [0.2, 0.95, 0.35, 1, 0.25];
              if (styleId === "wave")
                return [0.35 + 0.55 * Math.sin((t * Math.PI) / 2), 0.55 + 0.45 * Math.sin(t * Math.PI + 0.5), 1, 0.55 + 0.45 * Math.sin(t * Math.PI + 1), 0.35 + 0.55 * Math.sin((t * Math.PI) / 2 + 0.3)].slice(0, 5);
              if (styleId === "stack")
                return i % 2 === 0 ? [0.4, 0.85, 0.5, 0.9, 0.45] : [0.75, 0.45, 1, 0.5, 0.8];
              if (styleId === "spectrum") {
                const phase = (i / n) * Math.PI * 2;
                return [0.35 + 0.6 * Math.sin(phase), 0.4 + 0.55 * Math.sin(phase + 0.8), 0.45 + 0.5 * Math.sin(phase + 1.6), 0.4 + 0.55 * Math.sin(phase + 2.2), 0.35 + 0.6 * Math.sin(phase + 3)].map((x) => Math.min(1, Math.max(0.2, x)));
              }
              if (styleId === "pulse") return [0.15, 0.55, 1, 0.55, 0.15];
              if (styleId === "neon") return [0.4, 1, 0.65, 0.95, 0.5];
              return [0.35, 1, 0.55, 0.88, 0.42];
            };

            const durForBar = (i: number) => {
              const off = styleId === "smooth" ? 0.12 : styleId === "spark" ? 0.04 : styleId === "pulse" ? 0.14 : 0.08;
              return baseDur + i * off;
            };

            if (styleId === "spark") ease = "linear";

            return (
              <div
                className={`flex items-end justify-center ${gapClass} h-full px-0.5 min-w-[28px] self-stretch`}
                title="Now playing"
              >
                {Array.from({ length: nBars }, (_, i) => {
                  const scales = barAnimate(i, nBars);
                  return (
                    <motion.span
                      key={i}
                      className={`${barClass} shrink-0`}
                      style={{
                        height: maxH,
                        transformOrigin: "bottom",
                        backgroundColor: barColor,
                        boxShadow: neonGlow,
                      }}
                      animate={{ scaleY: scales }}
                      transition={{
                        duration: durForBar(i),
                        repeat: Infinity,
                        repeatType: styleId === "spark" ? "loop" : "reverse",
                        ease,
                      }}
                    />
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

        {/* Mail Notification Toast */}
        <AnimatePresence>
          {mailToast && (
            <motion.div
              key="mail-toast"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute z-[9999] cursor-pointer"
              style={{ bottom: 44, right: 8 }}
              onClick={() => {
                setMailToast(null);
                if (mailToastTimerRef.current) clearTimeout(mailToastTimerRef.current);
                toggleWindow('vmail');
              }}
            >
              <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-[260px]">
                {/* Toast title bar */}
                <div className="bg-[#000080] text-white text-[11px] font-bold px-2 py-0.5 flex items-center gap-1.5">
                  <Mail size={12} className="text-yellow-300 shrink-0" />
                  <span>New Mail</span>
                  <button
                    className="ml-auto w-4 h-3.5 flex items-center justify-center bg-[#c0c0c0] border border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-black text-[9px] font-bold leading-none active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMailToast(null);
                      if (mailToastTimerRef.current) clearTimeout(mailToastTimerRef.current);
                    }}
                  >
                    ✕
                  </button>
                </div>
                {/* Toast body */}
                <div className="p-2.5 flex items-start gap-2">
                  <div className="shrink-0 mt-0.5">
                    <Mail size={20} className="text-yellow-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-black font-bold truncate">{mailToast.subject}</p>
                    <p className="text-[10px] text-gray-600 truncate mt-0.5">From: {mailToast.from}</p>
                    <p className="text-[9px] text-gray-500 mt-1">Click to open VMail</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Context Menu */}
        {contextMenu && (
          <div 
            className="absolute bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] z-[10000] flex flex-col py-1"
            style={{ 
              left: contextMenu.x, 
              top: contextMenu.y, 
              minWidth: '150px',
              transform: `translate(${contextMenu.x > deskWidth - 160 ? '-100%' : '0'}, ${contextMenu.y > deskHeight - 350 ? '-100%' : '0'})`,
              ['--vm-hover-bg' as string]: chromeTheme.hoverBg,
              ['--vm-hover-fg' as string]: chromeTheme.hoverText,
            }}
          >
            {contextMenu.nodeId === '__taskbar__' ? (
              <>
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    addWindow({ id: 'control_panel', title: 'CRT Control Panel', x: 100, y: 100, width: 400, height: 420, target: 'taskbar' });
                    setContextMenu(null);
                  }}
                >
                  Properties
                </button>
                <div className="h-0.5 bg-gray-500 border-b border-white my-1 mx-1" />
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetWindowPositions();
                    setContextMenu(null);
                  }}
                >
                  Cascade Windows
                </button>
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setWindows(prev => prev.map(w => ({ ...w, isMinimized: true })));
                    setContextMenu(null);
                  }}
                >
                  Minimize All
                </button>
              </>
            ) : contextMenu.nodeId?.startsWith('__task__') ? (() => {
              const winId = contextMenu.nodeId.replace('__task__', '');
              const win = windows.find(w => w.id === winId);
              if (!win) return null;
              return (
                <>
                  <button 
                    className={`text-left px-4 py-1 flex justify-between items-center text-sm font-bold ${win.isMaximized ? 'opacity-50 cursor-default' : 'enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black'}`}
                    disabled={win.isMaximized}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!win.isMaximized) maximizeWindow(win.id, e);
                      setContextMenu(null);
                    }}
                  >
                    Maximize
                  </button>
                  <button 
                    className={`text-left px-4 py-1 flex justify-between items-center text-sm font-bold ${win.isMinimized ? 'opacity-50 cursor-default' : 'enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black'}`}
                    disabled={win.isMinimized}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!win.isMinimized) minimizeWindow(win.id, e);
                      setContextMenu(null);
                    }}
                  >
                    Minimize
                  </button>
                  <button 
                    className={`text-left px-4 py-1 flex justify-between items-center text-sm font-bold ${win.isMinimized || win.isMaximized ? 'enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black' : 'opacity-50 cursor-default'}`}
                    disabled={!win.isMinimized && !win.isMaximized}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (win.isMinimized || win.isMaximized) toggleWindow(win.id);
                      setContextMenu(null);
                    }}
                  >
                    Restore
                  </button>
                  <div className="h-0.5 bg-gray-500 border-b border-white my-1 mx-1" />
                  <button 
                    className="text-left px-4 py-1 hover:bg-red-700 hover:text-white text-red-700 text-sm font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(win.id, e);
                      setContextMenu(null);
                    }}
                  >
                    Close
                  </button>
                </>
              );
            })() : contextMenu.nodeId ? (
              <>
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const node = vfs.getNode(contextMenu.nodeId!);
                    if (node) {
                      if (node.type === 'directory') {
                        openWindow("files");
                      } else if (node.type === 'shortcut') {
                        if (node.content) openWindow(node.content);
                      } else {
                        setActiveFileId(node.id);
                        openWindow("versa_edit");
                      }
                    }
                    setContextMenu(null);
                  }}
                >
                  Open
                </button>
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openWindow("files");
                    setContextMenu(null);
                  }}
                >
                  Explore
                </button>
                <div className="h-[1px] bg-gray-400 mx-1 my-1" />
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm opacity-50 cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  Cut
                </button>
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm opacity-50 cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  Copy
                </button>
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    vfs.deleteNode(contextMenu.nodeId!);
                    setContextMenu(null);
                  }}
                >
                  Delete
                </button>
                <div className="h-[1px] bg-gray-400 mx-1 my-1" />
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const node = vfs.getNode(contextMenu.nodeId!);
                    if (node) {
                      setRenamingNodeId(node.id);
                      setRenameValue(node.name);
                    }
                    setContextMenu(null);
                  }}
                >
                  Rename
                </button>
                <div className="h-[1px] bg-gray-400 mx-1 my-1" />
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (contextMenu.nodeId === 'netmon_icon') {
                      addWindow({ id: 'properties_netmon_icon', title: 'Properties: AETHERIS Net-Mon', x: 100, y: 100, width: 350, height: 450 });
                    } else {
                      const node = vfs.getNode(contextMenu.nodeId!);
                      if (node) {
                        addWindow({ id: `properties_${node.id}`, title: `Properties: ${node.name}`, x: 100, y: 100, width: 350, height: 450 });
                      }
                    }
                    setContextMenu(null);
                  }}
                >
                  Properties
                </button>
              </>
            ) : (
              <>
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    vfs.createNode("New Folder", "directory", "desktop");
                    setContextMenu(null);
                  }}
                >
                  New Folder
                </button>
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    vfs.createNode("New Text File.txt", "file", "desktop");
                    setContextMenu(null);
                  }}
                >
                  New Text File
                </button>
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShortcutWizard(true);
                    setContextMenu(null);
                  }}
                >
                  New Shortcut
                </button>
                <div className="h-0.5 bg-gray-500 border-b border-white my-1 mx-1" />
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addWindow({ id: 'control_panel', title: 'CRT Control Panel', x: 100, y: 100, width: 400, height: 420, target: 'display' });
                    setContextMenu(null);
                  }}
                >
                  Display Properties
                </button>
                <div className="h-0.5 bg-gray-500 border-b border-white my-1 mx-1" />
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetWindowPositions();
                    setContextMenu(null);
                  }}
                >
                  Reset Window Positions
                </button>
              </>
            )}
          </div>
        )}

        
      </div>

      {/* Sign Out / Sign Out to Terminal overlay */}
      {signingOut && (
        <SignOutScreen
          mode={signingOut}
          neuralBridgeActive={neuralBridgeActive}
          onComplete={() => {
            setSigningOut(null);
            if (signingOut === "login") onSignOut();
            else onSignOutToTerminal();
          }}
        />
      )}

      {/* Vespera Assistant (Agent V) */}
      {bootPhase === 99 && !screensaverActive && !signingOut && (
        <VesperaAssistant
          enabled={vfs.displaySettings?.agentVEnabled !== false}
          skin={vfs.displaySettings?.agentVSkin || 'classic'}
          speak={vfs.displaySettings?.agentVSpeak === true}
          openAppId={lastFocusedApp}
          neuralBridgeActive={neuralBridgeActive}
          tourActive={windows.some(w => w.id === 'welcome_tour' && w.isOpen)}
          onOpenSettings={() => addWindow({ id: 'control_panel', title: 'CRT Control Panel', x: 100, y: 100, width: 400, height: 420, target: 'agent_v' })}
          onHide={() => {
            if (vfs.updateAgentVSettings) {
               vfs.updateAgentVSettings(false, vfs.displaySettings?.agentVSkin || 'classic', vfs.displaySettings?.agentVSpeak);
            }
          }}
        />
      )}
    </div>
  );
};
