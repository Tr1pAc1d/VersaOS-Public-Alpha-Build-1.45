import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";
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
import { MinecraftClassic } from "./MinecraftClassic";
import { hauntManager } from "../utils/HauntManager";
import { ActiveAppletsManager, TaskbarAppletSlot } from "./ActiveApplets";
import {
  playStartupSound,
  startGuiAmbientHum,
  stopGuiAmbientHum,
  playUIClickSound,
  playErrorSound,
  playFatalErrorSound,
  playNewMailSound,
  startPlusAmbient,
  stopPlusAmbient,
  setPlusAmbientMuted,
  setGlobalVolumeScale,
  setGlobalMuted,
} from "../utils/audio";
import { PLUS_THEMES } from "../utils/plusThemes";
import { useVMail } from "../contexts/VMailContext";
import { APP_DICTIONARY, getCompatibleApps } from "../utils/appDictionary";
import { useVFS, VFSNode, WorkspaceMenuItem, DEFAULT_WORKSPACE_MENU, WORKSPACE_MENU_THEME_COLORS, DEFAULT_VFS } from "../hooks/useVFS";
import { VersaFileManager } from "./VersaFileManager";
import { VesperaWrite } from "./VesperaWrite";
import { ControlPanel } from "./ControlPanel";
import { ShortcutWizard } from "./ShortcutWizard";
import { FileProperties } from "./FileProperties";
import { UninstallWizard } from "./UninstallWizard";
import { DiskDefrag } from "./DiskDefrag";
import { ErrorBoundary } from "./ErrorBoundary";
import { RHIDSetupWizard, RHIDIcon } from "./RHIDSetupWizard";
import { OfflineCacheSetupWizard } from "./OfflineCacheSetupWizard";
import { RHIDTerminal } from "./RHIDTerminal";
import { OpenDOSPrompt } from "./OpenDOSPrompt";
import { VStore } from "./VStore";
import { PackManSetup } from "./PackManSetup";
import { PackMan } from "./PackMan";
import { LeaveMeAlone } from "./LeaveMeAlone";
import { VMailSetup } from "./VMailSetup";
import { VMail } from "./VMail";
import { GenericSetupWizard } from "./GenericSetupWizard";
import { GenericAppPlaceholder } from "./GenericAppPlaceholder";
import { AxisPaintSetup } from "./AxisPaintSetup";
import { AxisPaint } from "./AxisPaint";
import { WelcomeTour } from "./WelcomeTour";
import { VolumeControl } from "./VolumeControl";
import { VersaView } from "./VersaView";
import { VersaZip } from "./VersaZip";
import { VersaSlide } from "./VersaSlide";
import { VersaSlideSetup } from "./VersaSlideSetup";
import { VSTORE_APPS } from "../data/vstoreApps";

import { HelpViewer } from "./HelpViewer";
import { SystemRecoveryModal } from "./SystemRecoveryModal";
import { DialUpNetworking } from "./DialUpNetworking";
import { DiskScanCheck } from "./DiskScanCheck";
import { RunDialog, findVfsFileLoose } from "./RunDialog";
import { FindFiles } from "./FindFiles";
import { VersaMediaPlayer } from "./VersaMediaPlayer";
import { VideoPlayerPopup } from "./VideoPlayerPopup";
import { RetroTV } from "./RetroTV";
import { RemoteDesktop } from "./RemoteDesktop";
import { ScreensaverOverlay, useScreensaverIdle, type ScreensaverType } from "./Screensavers";
import { VesperaAssistant } from "./VesperaAssistant";
import { AgentVPlusSetupWizard } from "./AgentVPlusSetupWizard";
import { VSweeper } from "./VSweeper";
import { NeuralSolitaire } from "./NeuralSolitaire";
import { VesperaChat } from "./VesperaChat";
import { VMessengerSetup } from "./VMessengerSetup";
import { ReleaseRadarSetup } from "./ReleaseRadarSetup";
import { ReleaseRadar } from "./ReleaseRadar";
import { TaskManager } from "./TaskManager";
import { useNetworkLink } from "../contexts/NetworkLinkContext";
import { parseRunLine, RUN_COMMAND_ALIASES } from "../utils/runCommands";
import {
  readVersaMediaVolume,
  writeVersaMediaVolume,
  VERSA_MEDIA_PLAYER_STATE_EVENT,
  VERSA_MEDIA_PLAYER_SET_VOLUME_EVENT,
} from "../utils/mediaPlayerBridge";
import { WeatherChannelApp } from "./WeatherChannelApp";
import { PChords } from "./PChords";
import { PChordsSetup } from "./PChordsSetup";
import { PluginSandbox } from "./PluginSandbox";
import { ThirdPartySetupWizard } from "./ThirdPartySetupWizard";
import { getPlugins, System } from "../utils/systemRegistry";
import type { AppManifest, InstalledPlugin } from "../types/pluginTypes";

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

const DesktopWindow = React.memo(({
  winId,
  dragConstraints,
  onDragEnd,
  onMouseDown,
  initial,
  animate,
  transition,
  className,
  style,
  disableDrag,
  children
}: any) => {
  const dragControls = useDragControls();
  return (
    <motion.div
      key={winId}
      drag={!disableDrag}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={dragConstraints}
      dragElastic={0}
      onDragEnd={onDragEnd}
      onMouseDown={onMouseDown}
      initial={initial}
      animate={animate}
      transition={transition}
      className={className}
      style={style}
    >
      {children(dragControls)}
    </motion.div>
  );
});

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
  const [fatalError, setFatalError] = useState<{title: string, message: string, type?: string} | null>(null);
  const [systemWarnings, setSystemWarnings] = useState<Array<{id: string, title: string, message: string, pluginId?: string}>>([]);
  
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
    nodeId?: string;
    videoUrl?: string;
    videoTitle?: string;
  }[]>([
    { id: "about", title: "System Information", x: 40, y: 40, width: 450, height: 500, minWidth: 300, minHeight: 400, isOpen: false },
    { id: "control_panel", title: "Control Panel", x: 100, y: 100, width: 460, height: 600, minWidth: 460, minHeight: 500, isOpen: false },
    { id: "files", title: "File Manager", x: 80, y: 80, width: 450, height: 350, minWidth: 400, minHeight: 300, isOpen: false },
    { id: "analyzer", title: "Data Stream Analyzer", x: 120, y: 60, width: 600, height: 400, minWidth: 400, minHeight: 300, isOpen: false },
    { id: "browser", title: "Vespera Navigator", x: 100, y: 50, width: 800, height: 600, minWidth: 600, minHeight: 400, isOpen: false },
    { id: "chat", title: "Vespera Assistant", x: 150, y: 100, width: 400, height: 500, isOpen: false },
    { id: "xtype", title: "X-Type Control Panel", x: 200, y: 150, width: 550, height: 450, isOpen: false },
    { id: "netmon", title: "AETHERIS Network Monitor", x: 250, y: 100, width: 600, height: 500, isOpen: false },
    { id: "netmon_setup", title: "AETHERIS Setup Wizard", x: 300, y: 150, width: 500, height: 400, isOpen: false },
    { id: "uninstall_wizard", title: "Vespera Uninstall Wizard", x: 300, y: 150, width: 500, height: 400, isOpen: false, target: "", nodeId: "" },
    { id: "workbench", title: "AETHERIS Workbench Pro - [C:\\VESPERA\\SRC\\DIAGNOSTIC.SC]", x: 60, y: 30, width: 750, height: 550, isOpen: false },
    { id: "minecraft_classic", title: "Minecraft Classic", x: 100, y: 50, width: 800, height: 600, minWidth: 640, minHeight: 480, isOpen: false },
      { id: "open_dos", title: "Open-DOS Subsystem", x: 80, y: 40, width: 640, height: 480, isOpen: false },
    { id: "versa_edit", title: "VersaEdit", x: 150, y: 150, width: 600, height: 450, isOpen: false },
    { id: "defrag", title: "Disk Defragmenter - Drive C:", x: 180, y: 120, width: 500, height: 480, isOpen: false },
    { id: "rhid_setup", title: "RHID Terminal Setup", x: 280, y: 120, width: 520, height: 440, isOpen: false },
    { id: "rhid", title: "RHID Terminal v4.03.22.1", x: 100, y: 60, width: 680, height: 480, isOpen: false },
    { id: "vstore", title: "VStore Software Exchange", x: 80, y: 50, width: 750, height: 500, isOpen: false },
    { id: "packman_setup", title: "Pac-Man Setup", x: 200, y: 150, width: 550, height: 420, isOpen: false },
    { id: "packman", title: "Pac-Man (x86)", x: 120, y: 90, width: 366, height: 580, isOpen: false },
    { id: "leave_me_alone_setup", title: "Leave Me Alone Setup", x: 200, y: 130, width: 550, height: 420, isOpen: false },
    { id: "leave_me_alone", title: "Leave Me Alone", x: 140, y: 60, width: 510, height: 728, isOpen: false },
    { id: "vmail_setup", title: "VMail Setup Wizard", x: 220, y: 120, width: 500, height: 380, isOpen: false },
    { id: "vmail", title: "VesperaNET Mail", x: 100, y: 70, width: 720, height: 500, isOpen: false },
    { id: "help", title: "Vespera Help", x: 120, y: 80, width: 640, height: 520, isOpen: false },
    { id: "dialup", title: "VesperaNET Dial-Up Connection", x: 160, y: 100, width: 460, height: 420, isOpen: false },
    { id: "scandisk", title: "Disk Checker - Drive C:", x: 200, y: 110, width: 440, height: 400, isOpen: false },
    { id: "findfiles", title: "Find Files", x: 140, y: 70, width: 480, height: 420, isOpen: false },
    { id: "media_player", title: "VERSA Media Agent 2.0", x: 100, y: 50, width: 600, height: 650, minWidth: 500, minHeight: 550, isOpen: false },
    { id: "video_player_popup", title: "Video Player", x: 200, y: 100, width: 640, height: 480, minWidth: 320, minHeight: 240, isOpen: false },
    { id: "vsweeper", title: "V-Sweeper", x: 160, y: 120, width: 240, height: 330, isOpen: false },
    { id: "neural_solitaire", title: "Neural Solitaire", x: 80, y: 40, width: 730, height: 580, minWidth: 600, minHeight: 460, isOpen: false },
    { id: "axis_paint_setup", title: "Axis Paint 2.0 Setup", x: 180, y: 100, width: 620, height: 460, isOpen: false },
    { id: "axis_paint", title: "Axis Paint 2.0", x: 100, y: 60, width: 720, height: 560, isOpen: false },
    { id: "retrotv", title: "Meridian. TV", x: 150, y: 80, width: 800, height: 600, isOpen: false },
    { id: "remote_desktop", title: "VesperaConnect Remote Desktop", x: 60, y: 30, width: 780, height: 560, isOpen: false },
    { id: "welcome_tour", title: "Vespera OS Tour", x: 140, y: 100, width: 700, height: 500, isOpen: false },
    { id: "agentv_plus_setup", title: "VAgent PLUS! Character Expansion Setup", x: 200, y: 100, width: 560, height: 440, isOpen: false },
    { id: "aw_release_radar_setup", title: "AW Release Radar Setup", x: 220, y: 120, width: 500, height: 400, isOpen: false },
    { id: "aw_release_radar", title: "AW Release Radar", x: 120, y: 90, width: 400, height: 500, isOpen: false },
    { id: "task_manager", title: "Vespera Task Manager", x: 100, y: 60, width: 480, height: 420, minWidth: 420, minHeight: 380, isOpen: false },
    { id: "v_messenger_setup", title: "Vespera Messenger Setup", x: 220, y: 120, width: 500, height: 420, isOpen: false },
    { id: "v_messenger", title: "Vespera Messenger", x: 180, y: 100, width: 420, height: 500, minWidth: 350, minHeight: 400, isOpen: false },
    { id: "weather_channel", title: "The Weather Channel - Interactive", x: 200, y: 150, width: 640, height: 480, isOpen: false },
    { id: "pchords", title: "PChords", x: 250, y: 100, width: 500, height: 450, minWidth: 400, minHeight: 350, isOpen: false },
    { id: "pchords_setup", title: "PChords Setup", x: 200, y: 130, width: 560, height: 440, isOpen: false },
    { id: "volume_control", title: "Volume Control", x: 180, y: 120, width: 490, height: 320, minWidth: 460, minHeight: 280, isOpen: false },
    { id: "versa_view", title: "VersaView Image Viewer", x: 140, y: 100, width: 600, height: 500, isOpen: false },
    { id: "versaslide_setup", title: "VersaSlide Setup", x: 200, y: 130, width: 560, height: 440, isOpen: false },
    { id: "versaslide", title: "VersaSlide Presentation Suite", x: 80, y: 40, width: 900, height: 640, minWidth: 700, minHeight: 500, isOpen: false },
    { id: "versa_zip", title: "VersaZip Archive Manager", x: 140, y: 100, width: 520, height: 420, minWidth: 400, minHeight: 300, isOpen: false }
  ]);

  const vfs = useVFS();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId?: string } | null>(null);
  const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
  const [selectedDesktopNodes, setSelectedDesktopNodes] = useState<Set<string>>(new Set());
  const [lassoSelection, setLassoSelection] = useState<{ startX: number, startY: number, currentX: number, currentY: number, active: boolean } | null>(null);
  const [deskZipDialog, setDeskZipDialog] = useState<{ progress: number; fileName: string } | null>(null);
  const deskZipTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  /** Create a zip on the desktop from currently selected desktop icons */
  const compressDesktopToZip = (parentId: string = 'desktop') => {
    const ids: string[] = Array.from(selectedDesktopNodes).filter((id: any) => {
      const n = vfs.getNode(id as string);
      return n && !n.name.toLowerCase().endsWith('.zip');
    }) as string[];
    if (ids.length === 0) return;
    const zipNode = vfs.createNode('Archive.zip', 'directory', parentId, undefined, undefined, undefined, { customIcon: '/Icons/Extra Icons/directory_zipper.ico' });
    let prog = 0;
    setDeskZipDialog({ progress: 0, fileName: 'Archive.zip' });
    if (deskZipTimerRef.current) clearInterval(deskZipTimerRef.current);
    
    const targetDuration = Math.floor(Math.random() * 25000) + 5000; // 5 to 30 seconds
    const updateInterval = 250;
    let elapsed = 0;

    deskZipTimerRef.current = setInterval(() => {
      elapsed += updateInterval;
      prog = Math.min(100, (elapsed / targetDuration) * 100 + (Math.random() * 5));
      
      if (elapsed >= targetDuration || prog >= 100) {
        prog = 100;
        clearInterval(deskZipTimerRef.current!);
        deskZipTimerRef.current = null;
        ids.forEach((id: string) => {
          const n = vfs.getNode(id);
          if (n && n.id !== zipNode.id && n.id !== 'recycle_bin') {
            vfs.updateNode(id, { parentId: zipNode.id });
          }
        });
        setSelectedDesktopNodes(new Set());
        setTimeout(() => setDeskZipDialog(null), 400);
      }
      setDeskZipDialog({ progress: Math.floor(prog), fileName: 'Archive.zip' });
    }, updateInterval);
    setContextMenu(null);
  };
  const desktopRef = React.useRef<HTMLDivElement>(null);
  // Tracks the current logical desktop dimensions so event handlers can center windows
  const deskDimsRef = React.useRef<{ w: number; h: number }>({ w: 1024, h: 768 });

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

  useEffect(() => {
    if (!contextMenu) {
      setOpenWithNodeId(null);
    }
  }, [contextMenu]);

  const [renameValue, setRenameValue] = useState("");
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeZipId, setActiveZipId] = useState<string | null>(null);
  const [activeSlideFileId, setActiveSlideFileId] = useState<string | null>(null);
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
  const [openWithNodeId, setOpenWithNodeId] = useState<string | null>(null);
  const [openWithPos, setOpenWithPos] = useState<{ x: number; y: number } | null>(null);
  const [signingOut, setSigningOut] = useState<null | "login" | "terminal" | "shutdown">(null);
  const [appLaunchError, setAppLaunchError] = useState<{ title: string, message: string } | null>(null);
  const [propertiesModal, setPropertiesModal] = useState<{ id: string, name: string, target: string, type?: string } | null>(null);
  const [screensaverActive, setScreensaverActive] = useState(false);
  const [lastFocusedApp, setLastFocusedApp] = useState<string | null>(null);

  // ── Konami code unlock state ───────────────────────────────────────────
  const [konamiUnlocked, setKonamiUnlocked] = useState(() => {
    try { return localStorage.getItem('vespera_konami_unlocked') === 'true'; }
    catch { return false; }
  });

  // ── Plugin architecture state ───────────────────────────────────────────
  const [activePluginSetup, setActivePluginSetup] = useState<AppManifest | null>(null);
  const [iconPositions, setIconPositions] = useState<Record<string, {x: number, y: number}>>(() => {
    const saved = localStorage.getItem('desktop_icon_positions');
    return saved ? JSON.parse(saved) : {};
  });

  // ── Minecraft active state (disables window drag when playing) ────────────
  const [minecraftActive, setMinecraftActive] = useState(false);

  useEffect(() => {
    const handleMinecraftActive = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setMinecraftActive(customEvent.detail);
    };
    window.addEventListener('minecraft-active', handleMinecraftActive);
    return () => window.removeEventListener('minecraft-active', handleMinecraftActive);
  }, []);

  useEffect(() => {
    localStorage.setItem('desktop_icon_positions', JSON.stringify(iconPositions));
  }, [iconPositions]);

  // ── Plugin: hydrate window list from localStorage on mount ──────────────────
  useEffect(() => {
    const addPluginWindows = (plugins: InstalledPlugin[]) => {
      plugins.forEach(p => {
        const wid = p.windowId;
        setWindows(prev => {
          if (prev.find(w => w.id === wid)) return prev;
          return [...prev, {
            id: wid,
            title: p.manifest.name,
            x: 120, y: 80, width: 640, height: 480,
            minWidth: 400, minHeight: 300,
            isOpen: false,
            type: 'plugin',
          }];
        });
      });
    };

    // Hydrate on mount
    addPluginWindows(getPlugins());

    // React to new plugins installed during the session
    const onInstalled = (e: Event) => {
      const record = (e as CustomEvent<InstalledPlugin>).detail;
      setWindows(prev => {
        if (prev.find(w => w.id === record.windowId)) return prev;
        return [...prev, {
          id: record.windowId,
          title: record.manifest.name,
          x: 120, y: 80, width: 640, height: 480,
          minWidth: 400, minHeight: 300,
          isOpen: false,
          type: 'plugin',
        }];
      });
    };
    window.addEventListener('plugin-installed', onInstalled);
    return () => window.removeEventListener('plugin-installed', onInstalled);
  }, []);

  // Welcome Tour Trigger
  useEffect(() => {
    if (vfs.displaySettings.showWelcomeTour) {
      const timeout = setTimeout(() => {
        openWindow("welcome_tour");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, []);

  // ─── Global Error and BSOD Handler ─────────────────────────────────────────
  useEffect(() => {
    let isWritingError = false;

    const handleSystemError = async (e: Event) => {
      const ev = e as CustomEvent<{ type?: string, title: string, message: string, fatal: boolean, pluginId?: string }>;
      const d = ev.detail;
      
      // Play appropriate error sound
      if (d.fatal) {
        playFatalErrorSound();
      } else {
        playErrorSound();
      }
      
      // Update UI state
      if (d.fatal) {
        setFatalError({ title: d.title, message: d.message, type: d.type });
      } else {
        setSystemWarnings(w => [...w, { id: Math.random().toString(36).substr(2, 9), ...d }]);
      }

      // VFS Persistence
      if (isWritingError) return; // Prevent infinite crash loop if VFS fails
      isWritingError = true;
      try {
        let logsFolder = vfs.getChildren('prog_system').find((n: any) => n.name === 'logs');
        if (!logsFolder) {
           vfs.createNode('logs', 'directory', 'prog_system', '');
           logsFolder = vfs.getChildren('prog_system').find((n: any) => n.name === 'logs');
        }
        if (logsFolder) {
           let errFile = vfs.getChildren(logsFolder.id).find((n: any) => n.name === 'error.log');
           if (!errFile) {
             vfs.createNode('error.log', 'file', logsFolder.id, '[System Log Initialized]\\n', undefined, 'file');
             errFile = vfs.getChildren(logsFolder.id).find((n: any) => n.name === 'error.log');
           }
           if (errFile) {
             const timestamp = new Date().toISOString();
             const typeStr = d.type ? `[${d.type}]` : '[Error]';
             const curContent = errFile.content || '';
             // Log rotation: split by newline, keep last 99, append new line
             const lines = curContent.split('\\n').filter(Boolean);
             if (lines.length > 99) {
               lines.splice(0, lines.length - 99);
             }
             const newLog = `${timestamp} ${typeStr} ${d.title}: ${d.message}\\n`;
             vfs.updateFileContent(errFile.id, lines.join('\\n') + (lines.length > 0 ? '\\n' : '') + newLog);
           }
        }
      } catch (err) {
        /* Ignore failure during error logging */
      } finally {
        isWritingError = false;
      }
    };

    window.addEventListener('vespera-system-error', handleSystemError);

    // Global uncaught fallback
    const handleGlobalError = (msg: any, url: any, lineNo: any, columnNo: any, error: any) => {
      // Ignore some noise
      if (typeof msg === 'string' && msg.includes('ResizeObserver')) return false;

      const stack = error?.stack || String(msg);
      // Heuristic: eval / <anonymous> generally indicates a plugin boundary failure
      const isPlugin = stack.includes('eval') || stack.includes('anonymous');

      window.dispatchEvent(new CustomEvent('vespera-system-error', {
        detail: {
          type: isPlugin ? 'Application Error' : 'System Kernel Exception',
          title: isPlugin ? 'Plugin Execution Fault' : 'Core OS Fault',
          message: String(msg),
          fatal: !isPlugin // Only core faults are fatal
        }
      }));
      return false; // let default handler run too
    };

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      const stack = e.reason?.stack || String(e.reason);
      const isPlugin = stack.includes('eval') || stack.includes('anonymous');
      window.dispatchEvent(new CustomEvent('vespera-system-error', {
        detail: {
          type: isPlugin ? 'Application Error' : 'System Kernel Exception',
          title: 'Unhandled Promise Rejection',
          message: String(e.reason?.message || e.reason),
          fatal: !isPlugin
        }
      }));
    };

    window.onerror = handleGlobalError;
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('vespera-system-error', handleSystemError);
      window.onerror = null;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [vfs]);

  // Startup Apps Auto-Launch
  useEffect(() => {
    const rawApps = vfs.displaySettings?.startupApps;
    const startupApps = Array.isArray(rawApps) ? rawApps : [];
    const enabledApps = startupApps.filter(a => a && a.enabled);
    if (enabledApps.length === 0) return;
    const timers = enabledApps.map((app, i) =>
      setTimeout(() => openWindow(app.appId), 2000 + i * 800)
    );
    return () => timers.forEach(t => clearTimeout(t));
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
    setGlobalVolumeScale(vfs.displaySettings?.soundEffectsVolume ?? 1.0);
    setGlobalMuted(vfs.displaySettings?.systemMuted ?? false);
  }, [vfs.displaySettings?.soundEffectsVolume, vfs.displaySettings?.systemMuted]);

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

  // ── Konami code detection ───────────────────────────────────────────────
  useEffect(() => {
    const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'KeyB', 'KeyA', 'Enter'];
    const sequence: string[] = [];
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) {
        return;
      }
      // Use e.code primarily (e.g., "ArrowUp", "KeyB"), fallback to e.key
      const key = e.code || e.key;
      if (!key) return;
      sequence.push(key);
      if (sequence.length > KONAMI_CODE.length) sequence.shift();
      // Debug logging
      console.log('[Konami] Key:', key, 'Sequence:', sequence.join(','));
      if (sequence.join(',') === KONAMI_CODE.join(',')) {
        console.log('[Konami] MATCH! Unlocking...');
        setKonamiUnlocked(true);
        localStorage.setItem('vespera_konami_unlocked', 'true');
        sequence.length = 0;
        window.dispatchEvent(new CustomEvent('vespera-system-error', {
          detail: { type: 'Secret Unlocked', title: 'Minecraft Classic Revealed', message: 'The Konami Code has unlocked a hidden treasure! Minecraft Classic is now available in the VStore.', fatal: false }
        }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // ── Global System Notifications History ─────────────────────────────
  const [notificationHistory, setNotificationHistory] = useState<{ id: string; type: 'mail' | 'system' | 'app'; title: string; message: string; route?: any; timestamp: number }[]>([]);
  const [notificationTrayOpen, setNotificationTrayOpen] = useState(false);

  // ── Global System Toasts (Fake Update Reminders) ──────────────────────
  const [systemToasts, setSystemToasts] = useState<{ id: string; title: string; message: string; icon?: React.ReactNode; route?: any }[]>([]);

  useEffect(() => {
    const handleSystemNotify = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; title?: string; icon?: any; route?: any; duration?: number; type?: 'mail' | 'system' | 'app' }>;
      const { message, title = 'System Notification', icon, route, duration = 10000, type = 'system' } = customEvent.detail;
      const id = Math.random().toString(36).substr(2, 9);
      
      const notifSettings = vfs.displaySettings?.notificationSettings || { muted: false, hideMail: false, hideSystem: false, hideApps: false };
      
      setNotificationHistory(prev => [{ id, type, title, message, route, timestamp: Date.now() }, ...prev].slice(0, 50));

      if (type === 'system' && notifSettings.hideSystem) return;
      if (type === 'app' && notifSettings.hideApps) return;

      setSystemToasts(prev => [...prev, { id, title, message, icon, route }]);
      if (!notifSettings.muted) import('../utils/audio').then(m => m.playInfoSound());
      
      setTimeout(() => {
        setSystemToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    };
    window.addEventListener('vespera-system-notify', handleSystemNotify);
    
    // Also listen to the old plugin notify to route it through the same system
    const handlePluginNotify = (e: Event) => {
      const { message, pluginId } = (e as CustomEvent).detail;
      window.dispatchEvent(new CustomEvent('vespera-system-notify', { detail: { title: `App: ${pluginId}`, message, type: 'app' } }));
    };
    window.addEventListener('vespera-plugin-notify', handlePluginNotify);

    return () => {
      window.removeEventListener('vespera-system-notify', handleSystemNotify);
      window.removeEventListener('vespera-plugin-notify', handlePluginNotify);
    };
  }, []);

  // ── Random Fake Reminder Generator ──────────────────────────────────────
  useEffect(() => {
    if (bootPhase !== 99) return;
    
    const REMINDERS = [
      {
        title: 'New Hardware Found',
        message: 'A newer driver software package was found for S3 86C911 GUI Accelerator. Click here to open Device Manager.',
        route: { panel: 'system', initialTab: 'Device Manager', initialDevice: 'gpu_s3' }
      },
      {
        title: 'Vespera Update',
        message: 'Critical Vespera OS Service Pack 1 is ready to download. Click here to open Vespera Update.',
        route: { panel: 'vespera_update' }
      },
      {
        title: 'Hardware Update Wizard',
        message: 'NE2000 Compatible Ethernet Adapter requires a firmware refresh to maintain AETHERIS connection.',
        route: { panel: 'system', initialTab: 'Device Manager', initialDevice: 'nic_ne2k' }
      }
    ];

    const interval = setInterval(() => {
      // 10% chance every 60 seconds to show a random notification
      if (Math.random() < 0.10) {
        const reminder = REMINDERS[Math.floor(Math.random() * REMINDERS.length)];
        window.dispatchEvent(new CustomEvent('vespera-system-notify', {
           detail: { title: reminder.title, message: reminder.message, route: reminder.route, duration: 15000 }
        }));
      }
    }, 60000);
    
    // Initial reminder shortly after boot
    const initialTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('vespera-system-notify', {
         detail: { 
           title: 'System Maintenance', 
           message: 'It has been 30 days since your last system backup. Please check Vespera Update for new security patches.',
           route: { panel: 'vespera_update' },
           duration: 12000
         }
      }));
    }, 35000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, [bootPhase]);

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
    .filter((n: VFSNode) => n.isApp && !DEFAULT_VFS.find(d => d.id === n.id))
    .map((n: VFSNode) => n.id === 'netmon_exe' ? 'netmon' : n.id === 'rhid_exe' ? 'rhid' : n.id === 'retrotv_exe' ? 'retrotv' : n.id.replace('_exe', ''));

  const vmailInstalled = installedApps.includes('vmail');

  const arrangeIcons = (by: 'name' | 'type') => {
    const desktopNodes = vfs.getChildren('desktop').filter(node => node.id !== 'netmon_exe_lnk' && node.id !== 'rhid_exe_lnk');
    const sorted = [...desktopNodes].sort((a, b) => {
      if (by === 'name') return a.name.localeCompare(b.name);
      if (by === 'type') return (a.type || '').localeCompare(b.type || '') || a.name.localeCompare(b.name);
      return 0;
    });
    
    const allIcons: string[] = [];
    if (installedApps.includes('netmon')) allIcons.push('netmon_icon');
    if (installedApps.includes('rhid')) allIcons.push('rhid_icon');
    if (installedApps.includes('retrotv')) allIcons.push('retrotv_icon');
    allIcons.push(...sorted.map(n => n.id));
    
    const cellW = 80;
    const cellH = 100;
    const padX = 24;
    const padY = 24;
    
    let currentX = padX;
    let currentY = padY;
    
    const newPositions: Record<string, {x: number, y: number}> = {};
    for (const id of allIcons) {
      newPositions[id] = { x: currentX, y: currentY };
      currentY += cellH;
      if (currentY + cellH > deskDimsRef.current.h) {
        currentY = padY;
        currentX += cellW;
      }
    }
    setIconPositions(newPositions);
  };
  // Start/stop background mail delivery based on VMail installation
  useEffect(() => {
    if (vmailInstalled && bootPhase === 99) {
      startBackgroundDelivery();
    } else {
      stopBackgroundDelivery();
    }
    return () => stopBackgroundDelivery();
  }, [vmailInstalled, bootPhase, startBackgroundDelivery, stopBackgroundDelivery]);

  // Auto-assign grid positions for any icon that doesn't have a saved position
  // This prevents new icons from overlapping when they first appear
  useEffect(() => {
    if (!iconsVisible) return;
    const cellW = 80, cellH = 100, padX = 24, padY = 24;
    const deskW = deskDimsRef.current.w || 1024;
    const deskH = deskDimsRef.current.h || 768;

    const desktopNodes = vfs.getChildren('desktop').filter(
      (n: VFSNode) => n.id !== 'netmon_exe_lnk' && n.id !== 'rhid_exe_lnk'
    );
    const allIconIds = [
      ...(installedApps.includes('netmon') ? ['netmon_icon'] : []),
      ...(installedApps.includes('rhid') ? ['rhid_icon'] : []),
      ...(installedApps.includes('retrotv') ? ['retrotv_icon'] : []),
      ...desktopNodes.map((n: VFSNode) => n.id),
    ];

    const unpositioned = allIconIds.filter(id => !iconPositions[id]);
    if (unpositioned.length === 0) return;

    // Build set of already-occupied cells
    const occupied = new Set<string>();
    Object.values(iconPositions).forEach((pos: any) => {
      const cx = Math.round((pos.x - padX) / cellW) * cellW + padX;
      const cy = Math.round((pos.y - padY) / cellH) * cellH + padY;
      occupied.add(`${cx},${cy}`);
    });

    const maxCols = Math.max(1, Math.floor((deskW - padX) / cellW));
    const maxRows = Math.max(1, Math.floor((deskH - padY - 80) / cellH)); // 80 = taskbar reserve

    const newPositions: Record<string, { x: number; y: number }> = {};
    for (const id of unpositioned) {
      let placed = false;
      outer: for (let col = 0; col < maxCols; col++) {
        for (let row = 0; row < maxRows; row++) {
          const x = padX + col * cellW;
          const y = padY + row * cellH;
          const key = `${x},${y}`;
          if (!occupied.has(key)) {
            newPositions[id] = { x, y };
            occupied.add(key);
            placed = true;
            break outer;
          }
        }
      }
      // Fallback: place off-grid if somehow all cells are taken
      if (!placed) {
        newPositions[id] = { x: padX, y: padY + Object.keys(newPositions).length * cellH };
      }
    }

    if (Object.keys(newPositions).length > 0) {
      setIconPositions(prev => ({ ...prev, ...newPositions }));
    }
  }, [iconsVisible, vfs.nodes, installedApps]);


  // React to new mail arriving — play sound + show toast
  useEffect(() => {
    if (newMailArrived > 0 && newMailArrived !== prevNewMailRef.current) {
      prevNewMailRef.current = newMailArrived;
      
      const notifSettings = vfs.displaySettings?.notificationSettings || { muted: false, hideMail: false, hideSystem: false, hideApps: false };

      if (latestMail) {
        const id = Math.random().toString(36).substr(2, 9);
        setNotificationHistory(prev => [{
          id, type: 'mail', title: `New Mail: ${latestMail.from}`, message: latestMail.subject, timestamp: Date.now()
        }, ...prev].slice(0, 50));
      }

      if (!notifSettings.muted) playNewMailSound();
      
      if (latestMail && vfs.displaySettings?.agentVEnabled !== false) {
        window.dispatchEvent(new CustomEvent('agent-v-notify', { detail: { type: 'new_mail', from: latestMail.from, subject: latestMail.subject } }));
      } else if (latestMail && !notifSettings.hideMail) {
        setMailToast({ from: latestMail.from, subject: latestMail.subject });
        // Auto-dismiss after 6 seconds
        if (mailToastTimerRef.current) clearTimeout(mailToastTimerRef.current);
        mailToastTimerRef.current = setTimeout(() => setMailToast(null), 6000);
      }
      clearNewMailFlag();
    }
  }, [newMailArrived, latestMail, clearNewMailFlag, vfs.displaySettings?.agentVEnabled, vfs.displaySettings?.notificationSettings]);

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
    if (!internetTrayOpen && !volumeTrayOpen && !notificationTrayOpen) return;
    const close = (e: MouseEvent) => {
      const el = taskbarTrayRef.current;
      if (el && e.target instanceof Node && el.contains(e.target)) return;
      setInternetTrayOpen(false);
      setVolumeTrayOpen(false);
      setNotificationTrayOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [internetTrayOpen, volumeTrayOpen, notificationTrayOpen]);

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

  // ── Make desktop fade out sequentially when logging off ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (signingOut) {
      const openW = windows.filter(w => w.isOpen);
      let appCloseTime = 0;
      
      openW.forEach((w, idx) => {
        appCloseTime = (idx + 1) * 400;
        setTimeout(() => {
          setWindows(prev => prev.map(win => win.id === w.id ? { ...win, isOpen: false } : win));
        }, appCloseTime);
      });
      
      setTimeout(() => setIconsVisible(false), appCloseTime + 400);
      setTimeout(() => setTaskbarVisible(false), appCloseTime + 1000);
      setTimeout(() => setWallpaperVisible(false), appCloseTime + 1800);
    }
  }, [signingOut]);

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

  const verifyAppIntegrity = (id: string): boolean => {
    const appNode = vfs.nodes.find((n: any) => n.id === id && n.isApp);
    if (!appNode) return true; // not an app, skip check
    const pfDirId = `pf_dir_${id}`;
    const pfDir = vfs.nodes.find((n: any) => n.id === pfDirId && n.parentId === 'v_program_files');
    if (!pfDir) return false;
    const deps = vfs.nodes.filter((n: any) => n.parentId === pfDirId);
    return deps.some((d: any) => d.name.toUpperCase().endsWith('.DLL') || d.name.toUpperCase().endsWith('.SYS'));
  };

  const throwAppIntegrityError = (id: string) => {
    const appNode = vfs.nodes.find((n: any) => n.id === id);
    playErrorSound();
    setAppLaunchError({
      title: `${appNode?.appDisplayName || appNode?.name || id} - Missing Dependency`,
      message: `The required system components (.dll, .sys) could not be located in C:\\VESPERA\\Program_Files.\n\nPlease reinstall the application.`
    });
  };

  const openWindow = (id: string) => {
    // Handle special format for apps that need file context: "appId:nodeId"
    let actualId = id;
    let nodeId: string | undefined;
    
    if (id.includes(':')) {
      const parts = id.split(':');
      actualId = parts[0];
      nodeId = parts[1];
    }
    
    // First verify if this is an application and has its necessary program files
    if (!verifyAppIntegrity(actualId)) {
      throwAppIntegrityError(actualId);
      return;
    }

    setWindows(prev => {
      const winIndex = prev.findIndex(w => w.id === actualId);
      if (winIndex === -1) return prev;
      const win = prev[winIndex];
      const newWindows = [...prev];

      // Center control_panel on every open so it always spawns in the middle
      let posOverride: { x?: number; y?: number } = {};
      if (actualId === 'control_panel') {
        const { w, h } = deskDimsRef.current;
        const winW = win.width || 460;
        const winH = win.height || 600;
        posOverride = {
          x: Math.max(0, Math.round((w - winW) / 2)),
          y: Math.max(0, Math.round((h - winH) / 2)),
        };
      }
      
      newWindows[winIndex] = { ...win, ...posOverride, isOpen: true, isMinimized: false, ...(nodeId ? { nodeId } : {}) };
      const openedWin = newWindows.splice(winIndex, 1)[0];
      newWindows.push(openedWin);
      
      return newWindows;
    });
  };

  const toggleWindow = (id: string) => {
    playUIClickSound();

    // Dependency check for apps being launched
    const targetWin = windows.find(w => w.id === id);
    if (targetWin && !targetWin.isOpen) {
      if (!verifyAppIntegrity(id)) {
        throwAppIntegrityError(id);
        return; // Halt toggle
      }
    }

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
      if (!verifyAppIntegrity(id)) {
        throwAppIntegrityError(id);
        return;
      }
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

    // Plugin window shell control APIs
    const onPluginSetTitle = (e: Event) => {
      const { windowId, title } = (e as CustomEvent).detail;
      setWindows(prev => prev.map(w => w.id === windowId ? { ...w, title } : w));
    };
    const onPluginResize = (e: Event) => {
      const { windowId, width, height } = (e as CustomEvent).detail;
      setWindows(prev => prev.map(w => w.id === windowId ? { ...w, width, height } : w));
    };
    const onPluginMove = (e: Event) => {
      const { windowId, x, y } = (e as CustomEvent).detail;
      setWindows(prev => prev.map(w => w.id === windowId ? { ...w, x, y } : w));
    };
    const onPluginClose = (e: Event) => {
      const { windowId } = (e as CustomEvent).detail;
      setWindows(prev => prev.map(w => w.id === windowId ? { ...w, isOpen: false, isMinimized: false, isMaximized: false } : w));
    };
    const onPluginMinimize = (e: Event) => {
      const { windowId } = (e as CustomEvent).detail;
      setWindows(prev => prev.map(w => w.id === windowId ? { ...w, isMinimized: true } : w));
    };
    const onPluginMaximize = (e: Event) => {
      const { windowId } = (e as CustomEvent).detail;
      setWindows(prev => prev.map(w => w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w));
    };
    const onPluginAlwaysOnTop = (e: Event) => {
      const { windowId, value } = (e as CustomEvent).detail;
      setWindows(prev => prev.map(w => w.id === windowId ? { ...w, alwaysOnTop: !!value } : w));
    };

    window.addEventListener('vespera-plugin-set-title', onPluginSetTitle);
    window.addEventListener('vespera-plugin-resize', onPluginResize);
    window.addEventListener('vespera-plugin-move', onPluginMove);
    window.addEventListener('vespera-plugin-close', onPluginClose);
    window.addEventListener('vespera-plugin-minimize', onPluginMinimize);
    window.addEventListener('vespera-plugin-maximize', onPluginMaximize);
    window.addEventListener('vespera-plugin-always-on-top', onPluginAlwaysOnTop);

    return () => {
      window.removeEventListener("launch-app", onLaunchApp);
      window.removeEventListener('vespera-plugin-set-title', onPluginSetTitle);
      window.removeEventListener('vespera-plugin-resize', onPluginResize);
      window.removeEventListener('vespera-plugin-move', onPluginMove);
      window.removeEventListener('vespera-plugin-close', onPluginClose);
      window.removeEventListener('vespera-plugin-minimize', onPluginMinimize);
      window.removeEventListener('vespera-plugin-maximize', onPluginMaximize);
      window.removeEventListener('vespera-plugin-always-on-top', onPluginAlwaysOnTop);
    };
  }, [vfs.nodes]);

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

    if (!verifyAppIntegrity("browser")) {
      throwAppIntegrityError("browser");
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
    setSigningOut("shutdown");
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
      window.dispatchEvent(new CustomEvent('vespera-system-error', {
        detail: { type: 'Input Error', title: 'Cannot Start Program', message: 'Please type a program name, folder, or document to open.', fatal: false }
      }));
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
      window.dispatchEvent(new CustomEvent('vespera-system-error', {
        detail: { type: 'Command Error', title: 'Invalid Command', message: `Cannot recognize the command "${line}".`, fatal: false }
      }));
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
      window.dispatchEvent(new CustomEvent('vespera-system-error', {
        detail: { type: 'File Not Found', title: 'Cannot Find File', message: `Cannot find a file named "${args}". Please check the file name and try again.`, fatal: false }
      }));
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
    window.dispatchEvent(new CustomEvent('vespera-system-error', {
      detail: { type: 'Command Error', title: 'Cannot Find Program', message: `Cannot find the program "${command}". Make sure you typed the name correctly, and then try again.`, fatal: false }
    }));
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
            const node = vfs.nodes.find((n: VFSNode) => n.id === id);
            const name = node?.name?.toLowerCase() || '';
            if (name.endsWith('.zip')) {
              setActiveZipId(id);
              setWindows((prev: any[]) => prev.map(w => w.id === 'versa_zip' ? { ...w, title: `VersaZip - ${node?.name}` } : w));
              openWindow('versa_zip');
            } else if (name.endsWith('.vsp') || name.endsWith('.pptx')) {
              setActiveSlideFileId(id);
              openWindow('versaslide');
            } else {
              setActiveFileId(id);
              openWindow('versa_edit');
            }
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
      case "offline_cache_setup":
        return <OfflineCacheSetupWizard
          vfs={vfs}
          onComplete={() => {
            closeWindow(win.id, { stopPropagation: () => {} } as any);
          }}
          onCancel={() => closeWindow(win.id, { stopPropagation: () => {} } as any)}
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
        const wbWin = windows.find(w => w.id === "workbench");
        return (
          <AetherisWorkbench
            vfs={vfs}
            initialProjectFileId={wbWin?.nodeId}
            onOpenSetupWizard={(manifest: AppManifest) => {
              setActivePluginSetup(manifest);
              addWindow({
                id: `plugin_${manifest.id}_setup`,
                title: `${manifest.name} Setup`,
                x: 180, y: 100, width: 580, height: 460,
              });
              openWindow(`plugin_${manifest.id}_setup`);
            }}
          />
        );
      case "minecraft_classic":
        return <MinecraftClassic />;
      case "open_dos":
        return <OpenDOSPrompt onReboot={onReboot} neuralBridgeActive={neuralBridgeActive} neuralBridgeEnabled={neuralBridgeEnabled} />;
      case "versa_edit":
        return <VesperaWrite vfs={vfs} fileId={activeFileId} onClose={() => closeWindow("versa_edit", { stopPropagation: () => {} } as any)} onSave={(content) => {
          if (activeFileId) {
            vfs.updateFileContent(activeFileId, content);
          }
        }} />;
      case "defrag":
        return <DiskDefrag />;
      case "v_messenger":
        return <VesperaChat onClose={() => closeWindow("v_messenger", { stopPropagation: () => {} } as any)} neuralBridgeActive={neuralBridgeActive} />;
      case "v_messenger_setup":
        return <VMessengerSetup vfs={vfs} onComplete={() => closeWindow("v_messenger_setup", { stopPropagation: () => {} } as any)} onCancel={() => closeWindow("v_messenger_setup", { stopPropagation: () => {} } as any)} />;
      case "vsweeper":
        return <VSweeper vfs={vfs} onClose={() => closeWindow("vsweeper", { stopPropagation: () => {} } as any)} neuralBridgeActive={neuralBridgeActive} />;
      case "neural_solitaire":
        return <NeuralSolitaire />;
      case "scandisk":
        return <DiskScanCheck vfs={vfs} neuralBridgeActive={neuralBridgeActive} />;
      case "dialup":
        return <DialUpNetworking />;
      case "help":
        return <HelpViewer />;
      case "media_player":
        return (
          <VersaMediaPlayer
            onOpenVideoPopup={(videoUrl, title) => {
              // Store video info in window state and open popup
              setWindows(prev => prev.map(w => w.id === "video_player_popup" ? { ...w, isOpen: true, isMinimized: false, videoUrl, videoTitle: title } : w));
              bringToFront("video_player_popup");
            }}
          />
        );
      case "video_player_popup":
        const popupWin = windows.find(w => w.id === "video_player_popup");
        return <VideoPlayerPopup onClose={() => closeWindow("video_player_popup", { stopPropagation: () => {} } as any)} videoUrl={popupWin?.videoUrl} videoTitle={popupWin?.videoTitle} />;
      case "vstore":
        return <VStore onInstallApp={(id) => {
          // ── Community / plugin app: route to ThirdPartySetupWizard ──
          if (id.startsWith('community_')) {
            const pluginId = id.replace(/^community_/, '');

            // Primary: look up from the plugin registry (vespera_plugins)
            let manifest = getPlugins().find(p => p.manifest.id === pluginId)?.manifest;

            // Fallback: read full manifest stored in vstore_community_apps._manifest
            if (!manifest) {
              try {
                const raw = localStorage.getItem('vstore_community_apps');
                if (raw) {
                  const list = JSON.parse(raw) as Array<any>;
                  const stored = list.find((a: any) => a.id === id);
                  if (stored?._manifest) {
                    // Re-register so it's in the registry going forward
                    try { System.registerApp(stored._manifest); } catch { /* ignore dup */ }
                    manifest = stored._manifest as AppManifest;
                  }
                }
              } catch { /* ignore */ }
            }

            if (manifest) {
              setActivePluginSetup(manifest);
              const winId = `plugin_${pluginId}_setup`;
              addWindow({
                id: winId,
                title: `${manifest.name} Setup`,
                x: 180, y: 100, width: 580, height: 460,
              });
              openWindow(winId);
              return;
            }
          }
          // ── Standard VStore app: route to GenericSetupWizard ──
          const app = VSTORE_APPS.find(a => a.id === id);
          addWindow({
            id: `${id}_setup`,
            title: app ? `${app.name} Setup` : "Setup Wizard",
            x: 200,
            y: 150,
            width: 560,
            height: 440,
          });
        }} installedApps={installedApps} vfs={vfs} konamiUnlocked={konamiUnlocked}
        onOpenSetupWizard={(manifest: AppManifest) => {
          // Open the ThirdPartySetupWizard for a freshly imported plugin
          setActivePluginSetup(manifest);
          addWindow({
            id: `plugin_${manifest.id}_setup`,
            title: `${manifest.name} Setup`,
            x: 180, y: 100, width: 580, height: 460,
          });
          openWindow(`plugin_${manifest.id}_setup`);
        }}
        onLaunchBrowser={(url?: string) => {
          const targetUrl = url || 'http://www.vesperasystems.com/Downloads.html';
          const browserWin = windows.find(w => w.id === "browser");
          if (browserWin?.isOpen) {
            bringToFront("browser");
            window.dispatchEvent(new CustomEvent('navigate-browser', { detail: targetUrl }));
          } else {
            handleLaunchBrowser();
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('navigate-browser', { detail: targetUrl }));
            }, 2000);
          }
        }} />;
      case "versa_view":
        const vvNode = vfs.getNode(activeFileId || "");
        return <VersaView vfs={vfs} fileId={activeFileId || undefined} onClose={() => closeWindow("versa_view", { stopPropagation: () => {} } as any)} />;
      case "versa_zip":
        return <VersaZip vfs={vfs} zipNodeId={activeZipId} onClose={() => closeWindow("versa_zip", { stopPropagation: () => {} } as any)} />;
      case "packman_setup":
        return <PackManSetup vfs={vfs} onComplete={() => closeWindow("packman_setup", { stopPropagation: () => {} } as any)} onCancel={() => closeWindow("packman_setup", { stopPropagation: () => {} } as any)} />;
      case "packman":
        return <PackMan />;
      case "leave_me_alone_setup":
        return <GenericSetupWizard appId="leave_me_alone" appName="Leave Me Alone" appVersion="0.2.1" customIcon="/Games_VStore/Leave Me Alone/Leave_Me_Alone_Icon.png" vfs={vfs} onComplete={() => closeWindow("leave_me_alone_setup", { stopPropagation: () => {} } as any)} onCancel={() => closeWindow("leave_me_alone_setup", { stopPropagation: () => {} } as any)} />;
      case "leave_me_alone":
        return <LeaveMeAlone />;
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
      case "versaslide_setup":
        return <VersaSlideSetup vfs={vfs} onComplete={() => closeWindow("versaslide_setup", { stopPropagation: () => {} } as any)} onCancel={() => closeWindow("versaslide_setup", { stopPropagation: () => {} } as any)} />;
      case "versaslide": {
        const slideFileNode = activeSlideFileId ? vfs.nodes.find((n: VFSNode) => n.id === activeSlideFileId) : null;
        return <VersaSlide vfs={vfs} initialFileId={activeSlideFileId || undefined} initialFileName={slideFileNode?.name} onClose={() => { closeWindow("versaslide", { stopPropagation: () => {} } as any); setActiveSlideFileId(null); }} />;
      }
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
      case "weather_channel":
        const wcWin = windows.find(w => w.id === "weather_channel");
        return (
          <WeatherChannelApp 
            onClose={() => closeWindow("weather_channel", { stopPropagation: () => {} } as any)}
            isMaximized={wcWin?.isMaximized}
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
      case "task_manager":
        return <TaskManager
          windows={windows}
          onEndTask={(id) => closeWindow(id, { stopPropagation: () => {} } as any)}
          onSwitchTo={(id) => { bringToFront(id); setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false } : w)); }}
          vfs={vfs}
        />;
      case "pchords_setup":
        return <PChordsSetup
          vfs={vfs}
          onComplete={() => closeWindow("pchords_setup", { stopPropagation: () => {} } as any)}
          onCancel={() => closeWindow("pchords_setup", { stopPropagation: () => {} } as any)}
        />;
      case "pchords":
        return <PChords />;
      case "volume_control":
        return <VolumeControl />;
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

        // ── Third-party plugin setup wizard ─────────────────────────────────────────────
        if (id.endsWith('_setup') && id.startsWith('plugin_')) {
          const pluginId = id.replace(/^plugin_/, '').replace(/_setup$/, '');
          // Prefer registry lookup (works across sessions); fall back to in-flight state
          const fromRegistry = getPlugins().find(p => p.manifest.id === pluginId);
          const manifest = fromRegistry?.manifest ?? activePluginSetup;
          if (manifest) {
            return (
              <ThirdPartySetupWizard
                manifest={manifest}
                vfs={vfs}
                onComplete={() => {
                  setActivePluginSetup(null);
                  closeWindow(id, { stopPropagation: () => {} } as any);
                }}
                onCancel={() => {
                  setActivePluginSetup(null);
                  closeWindow(id, { stopPropagation: () => {} } as any);
                }}
              />
            );
          }
        }

        // ── Third-party plugin runtime sandbox ──────────────────────────────────────────
        if (id.startsWith('plugin_')) {
          // id is `plugin_${manifest.id}`, strip the prefix
          const pluginId = id.replace(/^plugin_/, '');
          return <PluginSandbox pluginId={pluginId} />;
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
    
    // Auto-adjust width for 'Full' wide screen mode if we are on a 4:3 res like 800x600/1024x768
    if (screenMode === 'Full' && deskWidth / deskHeight <= 1.5) {
      deskWidth = Math.round(deskHeight * (1066 / 600)); // ~16.0/9.0
    }
  }

  const physicalWidth = screenMode === 'Full' ? 1066 : 800;
  const physicalHeight = 600;
  
  const scale = Math.min(physicalWidth / deskWidth, physicalHeight / deskHeight);

  // Keep the deskDimsRef in sync so that centering math in event handlers is always correct
  deskDimsRef.current = { w: deskWidth, h: deskHeight };

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

  // ── Taskbar layout ─────────────────────────────────────────────────────────
  const taskbarPosition = (vfs.displaySettings?.taskbarPosition || 'bottom') as 'top' | 'bottom' | 'left' | 'right';
  const taskbarSize = Math.max(40, Math.min(80, Number(vfs.displaySettings?.taskbarSize) || 40));
  const taskbarSpanFull = vfs.displaySettings?.taskbarSpanFull === true;
  const isVerticalTaskbar = taskbarPosition === 'left' || taskbarPosition === 'right';

  // Work area for maximized windows — excludes whichever edge the taskbar occupies
  const tbReserve = taskbarSize + (taskbarSpanFull ? 2 : 10); // taskbar px + gap (smaller if full span)
  const maxWinX = taskbarPosition === 'left' ? (tbReserve - 2) : -2;
  const maxWinY = taskbarPosition === 'top'  ? (tbReserve - 2) : -2;
  const maxWinW = isVerticalTaskbar  ? (deskWidth  - tbReserve + 4) : (deskWidth  + 4);
  const maxWinH = (taskbarPosition === 'bottom' || taskbarPosition === 'top')
    ? (deskHeight - tbReserve + (taskbarSpanFull ? 4 : 0))
    : (deskHeight + 4);

  // Inline-style object for the outer taskbar div — handles all 4 edges
  const taskbarPositionStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = {
      position: 'absolute',
      zIndex: 9999,
      boxShadow: '4px 4px 0px rgba(0,0,0,0.5)',
      transition: 'all 0.7s ease-out',
    };
    if (!taskbarVisible) return { ...base, opacity: 0, pointerEvents: 'none',
      ...(taskbarPosition === 'bottom' ? { bottom: -80, left: taskbarSpanFull ? -2 : '50%', transform: taskbarSpanFull ? 'none' : 'translateX(-50%)', width: taskbarSpanFull ? 'calc(100% + 4px)' : undefined, height: taskbarSize } :
          taskbarPosition === 'top'    ? { top: -80,    left: taskbarSpanFull ? -2 : '50%', transform: taskbarSpanFull ? 'none' : 'translateX(-50%)', width: taskbarSpanFull ? 'calc(100% + 4px)' : undefined, height: taskbarSize } :
          taskbarPosition === 'left'   ? { left: -80,   top: taskbarSpanFull ? -2 : '50%',  transform: taskbarSpanFull ? 'none' : 'translateY(-50%)', height: taskbarSpanFull ? 'calc(100% + 4px)' : undefined, width: taskbarSize } :
                                         { right: -80,  top: taskbarSpanFull ? -2 : '50%',  transform: taskbarSpanFull ? 'none' : 'translateY(-50%)', height: taskbarSpanFull ? 'calc(100% + 4px)' : undefined, width: taskbarSize })
    };
    if (taskbarPosition === 'bottom') return { ...base, opacity: 1, bottom: taskbarSpanFull ? -2 : 8, left: taskbarSpanFull ? -2 : '50%', transform: taskbarSpanFull ? 'none' : 'translateX(-50%)', height: taskbarSize, width: taskbarSpanFull ? 'calc(100% + 4px)' : undefined, maxWidth: taskbarSpanFull ? 'none' : '98%' };
    if (taskbarPosition === 'top')    return { ...base, opacity: 1, top: taskbarSpanFull ? -2 : 8,    left: taskbarSpanFull ? -2 : '50%', transform: taskbarSpanFull ? 'none' : 'translateX(-50%)', height: taskbarSize, width: taskbarSpanFull ? 'calc(100% + 4px)' : undefined, maxWidth: taskbarSpanFull ? 'none' : '98%' };
    if (taskbarPosition === 'left')   return { ...base, opacity: 1, left: taskbarSpanFull ? -2 : 8,   top: taskbarSpanFull ? -2 : '50%',  transform: taskbarSpanFull ? 'none' : 'translateY(-50%)', width: taskbarSize,  height: taskbarSpanFull ? 'calc(100% + 4px)' : undefined, maxHeight: taskbarSpanFull ? 'none' : '98%' };
    /* right */                       return { ...base, opacity: 1, right: taskbarSpanFull ? -2 : 8,  top: taskbarSpanFull ? -2 : '50%',  transform: taskbarSpanFull ? 'none' : 'translateY(-50%)', width: taskbarSize,  height: taskbarSpanFull ? 'calc(100% + 4px)' : undefined, maxHeight: taskbarSpanFull ? 'none' : '98%' };
  })();

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
            backgroundSize: vfs.displaySettings.wallpaperLayout === 'stretch' ? '100% 100%' : (vfs.displaySettings.wallpaperLayout === 'cover' || !vfs.displaySettings.wallpaperLayout ? 'cover' : 'auto'),
            backgroundPosition: vfs.displaySettings.wallpaperLayout === 'tile' ? 'top left' : 'center',
            backgroundRepeat: vfs.displaySettings.wallpaperLayout === 'tile' ? 'repeat' : 'no-repeat'
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

      {/* Desktop Zip Compression Dialog */}
      {vfs.currentCollision && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/30">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-80">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide flex items-center gap-2">
              <img src="/Icons/Extra Icons/directory_warning.ico" alt="" className="w-4 h-4" style={{ imageRendering: 'pixelated' }} />
              Confirm File Replace
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex gap-4 items-start">
                <img src="/Icons/Extra Icons/directory_warning.ico" alt="" className="w-8 h-8 mt-1" style={{ imageRendering: 'pixelated' }} />
                <div className="text-sm text-black">
                  This folder already contains a file named <span className="font-bold">{vfs.getNode(vfs.currentCollision.sourceId)?.name}</span>.
                  <br /><br />
                  Would you like to replace the existing file, or keep both?
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  className="px-4 py-1 text-sm bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
                  onClick={() => vfs.resolveCollision('replace')}
                >
                  Replace
                </button>
                <button 
                  className="px-4 py-1 text-sm bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold"
                  onClick={() => vfs.resolveCollision('keep_both')}
                >
                  Keep Both
                </button>
                <button 
                  className="px-4 py-1 text-sm bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
                  onClick={() => vfs.resolveCollision('skip')}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deskZipDialog && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/30 pointer-events-auto">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-72">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide flex items-center gap-2">
              <img src="/Icons/Extra Icons/directory_zipper.ico" alt="" className="w-4 h-4" style={{ imageRendering: 'pixelated' }} />
              Compressing Files
            </div>
            <div className="p-4">
              <div className="text-sm text-black mb-2 truncate">Compressing: <span className="font-bold">{deskZipDialog.fileName}</span></div>
              <div className="text-xs text-black mb-3">Please wait while files are compressed...</div>
              <div className="w-full h-5 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-hidden">
                <div className="h-full bg-[#000080] transition-all duration-100" style={{ width: `${deskZipDialog.progress}%` }} />
              </div>
              <div className="text-xs text-right text-black mt-1">{deskZipDialog.progress}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Workspace */}
      <div 
        ref={desktopRef}
        className="absolute inset-0" 
        onMouseDown={(e) => {
          if (e.target === desktopRef.current || (e.target as HTMLElement).classList.contains('desktop-icon-container')) {
            const rect = desktopRef.current?.getBoundingClientRect();
            const scale = rect ? rect.width / (desktopRef.current as any).offsetWidth || 1 : 1;
            const startX = rect ? (e.clientX - rect.left) / scale : e.clientX;
            const startY = rect ? (e.clientY - rect.top) / scale : e.clientY;
            setLassoSelection({
              startX,
              startY,
              currentX: startX,
              currentY: startY,
              active: true
            });
            if (!e.ctrlKey && !e.metaKey) {
              setSelectedDesktopNodes(new Set());
            }
          }
        }}
        onMouseMove={(e) => {
          if (lassoSelection?.active) {
            const rect = desktopRef.current?.getBoundingClientRect();
            const scale = rect ? rect.width / (desktopRef.current as any).offsetWidth || 1 : 1;
            const currentX = rect ? (e.clientX - rect.left) / scale : e.clientX;
            const currentY = rect ? (e.clientY - rect.top) / scale : e.clientY;
            setLassoSelection(prev => prev ? { ...prev, currentX, currentY } : null);
          }
        }}
        onMouseUp={(e) => {
          if (lassoSelection?.active) {
            const rect = desktopRef.current?.getBoundingClientRect();
            if (rect) {
              const scale = rect.width / (desktopRef.current as any).offsetWidth || 1;
              const left = Math.min(lassoSelection.startX, lassoSelection.currentX);
              const right = Math.max(lassoSelection.startX, lassoSelection.currentX);
              const top = Math.min(lassoSelection.startY, lassoSelection.currentY);
              const bottom = Math.max(lassoSelection.startY, lassoSelection.currentY);
              
              const newSelected = new Set((e.ctrlKey || e.metaKey) ? selectedDesktopNodes : []);
              // Get all icon elements on desktop
              const icons = document.querySelectorAll('.desktop-icon-node');
              icons.forEach((icon: Element) => {
                const iconRect = (icon as HTMLElement).getBoundingClientRect();
                const iLeft = (iconRect.left - rect.left) / scale;
                const iRight = (iconRect.right - rect.left) / scale;
                const iTop = (iconRect.top - rect.top) / scale;
                const iBottom = (iconRect.bottom - rect.top) / scale;
                // Check intersection
                if (iLeft < right && iRight > left && iTop < bottom && iBottom > top) {
                  const nodeId = icon.getAttribute('data-nodeid');
                  if (nodeId) newSelected.add(nodeId);
                }
              });
              setSelectedDesktopNodes(newSelected);
            }
            setLassoSelection(null);
          }
        }}
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

        {/* Lasso Visualizer */}
        {lassoSelection?.active && (
          <div 
            className="absolute bg-blue-500/20 border border-blue-400/50 pointer-events-none z-[100]"
            style={{
              left: Math.min(lassoSelection.startX, lassoSelection.currentX),
              top: Math.min(lassoSelection.startY, lassoSelection.currentY),
              width: Math.abs(lassoSelection.currentX - lassoSelection.startX),
              height: Math.abs(lassoSelection.currentY - lassoSelection.startY)
            }}
          />
        )}

        {/* Desktop Icons — hidden during init, then fade + stagger in */}
        <div 
          className={`desktop-icon-container absolute inset-0 p-6 flex flex-col gap-4 flex-wrap max-h-full transition-opacity duration-700 ${iconsVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            pointerEvents: iconsVisible ? 'auto' : 'none',
            paddingBottom: taskbarPosition === 'bottom' ? tbReserve : undefined,
            paddingTop: taskbarPosition === 'top' ? tbReserve : undefined,
            paddingLeft: taskbarPosition === 'left' ? tbReserve : undefined,
            paddingRight: taskbarPosition === 'right' ? tbReserve : undefined,
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('text/plain');
            if (data) {
              try {
                const ids: string[] = data.startsWith('[') ? JSON.parse(data) : [data];
                const rect = e.currentTarget.getBoundingClientRect();
                const scale = rect.width / (e.currentTarget as any).offsetWidth || 1;

                const cellW = 80;
                const cellH = 100;
                const padX = 24;
                const padY = 24;

                ids.forEach((id, i) => {
                  const draggedNode = vfs.getNode(id);
                  if (!draggedNode || draggedNode.id === 'recycle_bin') return;

                  // Move to desktop if not already there
                  if (draggedNode.parentId !== 'desktop') {
                    vfs.queueMove([id], 'desktop');
                  }

                  // Compute grid-snapped drop position (stagger multi-drop)
                  let x = (e.clientX - rect.left) / scale - 40 + (i % 3) * cellW;
                  let y = (e.clientY - rect.top) / scale - 40 + Math.floor(i / 3) * cellH;
                  x = Math.round((x - padX) / cellW) * cellW + padX;
                  y = Math.round((y - padY) / cellH) * cellH + padY;
                  
                  setIconPositions(prev => {
                    let finalX = x;
                    let finalY = y;
                    const maxW = deskDimsRef.current.w - cellW;
                    const maxH = deskDimsRef.current.h - cellH;
                    
                    finalX = Math.max(padX, Math.min(finalX, maxW));
                    finalY = Math.max(padY, Math.min(finalY, maxH));
                    
                    let attempts = 0;
                    const isOccupied = (tx: number, ty: number) => {
                      return Object.entries(prev).some(([key, pos]: [string, any]) => {
                        if (key === id) return false;
                        return Math.abs(pos.x - tx) < 10 && Math.abs(pos.y - ty) < 10;
                      });
                    };

                    while (isOccupied(finalX, finalY) && attempts < 50) {
                      finalY += cellH;
                      if (finalY > maxH) {
                        finalY = padY;
                        finalX += cellW;
                        if (finalX > maxW) {
                           finalX = padX;
                        }
                      }
                      attempts++;
                    }

                    return { ...prev, [id]: { x: finalX, y: finalY } };
                  });
                });
              } catch (e) {}
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



          {vfs.getChildren('desktop')
            .filter(node => node.id !== 'netmon_exe_lnk' && node.id !== 'rhid_exe_lnk')
            .map((node, nodeIndex) => {
              let renderIcon = node.customIcon;
              if (node.id === 'recycle_bin_lnk') {
                const trashItems = vfs.getChildren('recycle_bin');
                renderIcon = trashItems.length > 0 ? '/Icons/recycle_bin_full_cool-0.png' : '/Icons/recycle_bin_empty_cool-0.png';
              }
              return (
            <div 
              key={node.id}
              data-nodeid={node.id}
              draggable
              onDragStart={(e) => {
                let dragSet = selectedDesktopNodes;
                if (!dragSet.has(node.id)) {
                  dragSet = new Set([node.id]);
                  setSelectedDesktopNodes(dragSet);
                }
                e.dataTransfer.setData('text/plain', JSON.stringify(Array.from(dragSet)));
              }}
              style={{
                position: iconPositions[node.id] ? 'absolute' : 'relative',
                left: iconPositions[node.id]?.x,
                top: iconPositions[node.id]?.y,
                animationDelay: `${nodeIndex * 120}ms`,
              }}
              className={`desktop-icon-node flex flex-col items-center gap-1 w-20 p-1 rounded group cursor-pointer transition-colors ${iconsVisible ? 'animate-icon-pop' : 'opacity-0'} ${selectedDesktopNodes.has(node.id) ? 'bg-blue-800/60 outline outline-1 outline-white/50' : 'hover:bg-white/10 active:bg-blue-800/50'}`}
              onContextMenu={(e) => handleContextMenu(e, node.id)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (node.type === 'directory' || node.name?.toLowerCase().endsWith('.zip')) {
                  // .zip archives open in VersaZip, not the file manager
                  if (node.name?.toLowerCase().endsWith('.zip')) {
                    setActiveZipId(node.id);
                    openWindow('versa_zip');
                    // Update window title to match archive name
                    setWindows(prev => prev.map(w => w.id === 'versa_zip' ? { ...w, title: `VersaZip - ${node.name}` } : w));
                  } else {
                    setFmDirFocusId(node.id);
                    setFmDirFocusNonce(n => n + 1);
                    openWindow("files");
                  }
                } else if (node.type === 'shortcut') {
                  if (node.id === 'recycle_bin_lnk') {
                    setFmDirFocusId('recycle_bin');
                    setFmDirFocusNonce(n => n + 1);
                    openWindow('files');
                  } else if (node.content) {
                    openWindow(node.content);
                  }
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
                if (e.ctrlKey || e.metaKey) {
                  setSelectedDesktopNodes(prev => {
                    const next = new Set(prev);
                    if (next.has(node.id)) next.delete(node.id);
                    else next.add(node.id);
                    return next;
                  });
                } else {
                  setSelectedDesktopNodes(new Set([node.id]));
                }
              }}
              onDragOver={(e) => {
                if (node.type === 'directory' || (node.type === 'shortcut' && node.iconType === 'folder')) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onDrop={(e) => {
                const targetFolderId = node.type === 'directory' ? node.id : (node.type === 'shortcut' && node.iconType === 'folder' ? node.content : null);
                if (targetFolderId) {
                  e.preventDefault();
                  e.stopPropagation();
                  const data = e.dataTransfer.getData('text/plain');
                  try {
                    const ids = JSON.parse(data);
                    if (Array.isArray(ids)) {
                      ids.forEach(id => {
                        const draggedNode = vfs.getNode(id);
                        if (draggedNode && draggedNode.id !== targetFolderId && draggedNode.id !== 'recycle_bin') {
                          vfs.updateNode(id, { parentId: targetFolderId });
                        }
                      });
                      setSelectedDesktopNodes(new Set());
                    }
                  } catch (err) {
                    // fallback
                  }
                }
              }}
            >
              {renderIcon ? (
                <div className="relative pointer-events-none">
                  <img src={renderIcon} alt="icon" className="w-[32px] h-[32px] drop-shadow-md pointer-events-none" style={{ imageRendering: 'pixelated' }} draggable={false} />
                  {node.type === 'shortcut' && (
                    <div className="absolute -bottom-1 -left-1 bg-white border border-dotted border-black w-3 h-3 flex items-center justify-center">
                      <div className="w-1 h-1 bg-black" />
                    </div>
                  )}
                </div>
              ) : node.type === 'directory' ? (
                <Folder size={32} className="text-yellow-400 drop-shadow-md pointer-events-none" />
              ) : node.type === 'shortcut' ? (
                <div className="relative pointer-events-none">
                  {renderIcon ? (
                    <img
                      src={renderIcon}
                      alt={node.name}
                      className="w-8 h-8 object-contain drop-shadow-md pointer-events-none"
                      style={{ imageRendering: 'pixelated' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : node.iconType === 'folder' ? <Folder size={32} className="text-yellow-400 drop-shadow-md pointer-events-none" /> :
                   node.iconType === 'system' ? <Settings size={32} className="text-gray-400 drop-shadow-md pointer-events-none" /> :
                   node.iconType === 'app' ? <TerminalIcon size={32} className="text-gray-400 drop-shadow-md pointer-events-none" /> :
                   node.iconType === 'pen' ? <PenTool size={32} className="text-red-500 drop-shadow-md pointer-events-none" /> :
                   node.iconType === 'network' ? <Monitor size={32} className="text-blue-400 drop-shadow-md pointer-events-none" /> :
                   <FileText size={32} className="text-white drop-shadow-md pointer-events-none" />}
                  <div className="absolute -bottom-1 -left-1 bg-white border border-dotted border-black w-3 h-3 flex items-center justify-center">
                    <div className="w-1 h-1 bg-black" />
                  </div>
                </div>
              ) : (
                <FileText size={32} className="text-white drop-shadow-md pointer-events-none" />
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
            )})}
        </div>

        {/* Shortcut Wizard */}
        {showShortcutWizard && (
          <ShortcutWizard 
            onClose={() => setShowShortcutWizard(false)}
            onCreate={(name, target, customIcon) => {
              vfs.createNode(name, "shortcut", "desktop", target, target, 'app', { customIcon });
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

        {/* Desktop Widgets / Applets Base Layer */}
        <ActiveAppletsManager 
          vfs={vfs} 
          chromeTheme={chromeTheme} 
          desktopRef={desktopRef} 
        />

        {/* Window Management Workspace */}
        <div 
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            cursor: resizing ? resizeCursorMap[resizing.edge] : undefined
          }}
        >
          {windows.map((win, index) => {
            const isPersistentMinimized = win.isMinimized && ["media_player", "vstore", "vmail", "workbench", "versaslide"].includes(win.id);
            if (!win.isOpen) return null;
            if (win.isMinimized && !isPersistentMinimized) return null;
            
            const activeWindowId = windows.filter(w => w.isOpen && !w.isMinimized).pop()?.id;
            const isActive = win.id === activeWindowId;
            const isBeingResized = resizing?.id === win.id;
            
            return (
            <DesktopWindow
              key={win.id}
              winId={win.id}
              disableDrag={win.id === 'minecraft_classic' && minecraftActive}
              dragConstraints={win.isMaximized ? false : desktopRef}
              onDragEnd={(e: any, info: any) => {
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
                x: isPersistentMinimized ? -9999 : (win.isMaximized ? maxWinX : win.x), 
                y: isPersistentMinimized ? 0 : (win.isMaximized ? maxWinY : win.y), 
                width: isPersistentMinimized ? 1 : (win.isMaximized ? maxWinW : (win.width || 384)), 
                height: isPersistentMinimized ? 1 : (win.isMaximized ? maxWinH : (win.height || 'auto')),
                scale: 1,
                opacity: isPersistentMinimized ? 0 : 1
              }}
              transition={{ duration: isBeingResized ? 0 : 0.1 }}
              className={`absolute bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden box-border ${vfs.displaySettings?.plusTheme === 'cyber_nature' ? 'plus-window-open-nature' : vfs.displaySettings?.plusTheme === 'corporate_void' ? 'plus-window-open-void' : ''}`}
              style={{ zIndex: isPersistentMinimized ? 0 : 100 + index, top: 0, left: 0, pointerEvents: isPersistentMinimized ? "none" : "auto" }}
            >
              {(dragControls: any) => (
                <>
                  {/* Resize handles — only on non-maximized windows, disabled for active Minecraft */}
                  {!win.isMaximized && !isPersistentMinimized && win.id !== 'vsweeper' && !(win.id === 'minecraft_classic' && minecraftActive) && (
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
                    onPointerDown={(e) => {
                      // Disable dragging for Minecraft window when active (to allow game mouse capture)
                      if (!win.isMaximized && !resizing && !isPersistentMinimized && !(win.id === 'minecraft_classic' && minecraftActive)) {
                        dragControls.start(e);
                      }
                    }}
                    onDoubleClick={() => { if (win.id !== 'vsweeper') maximizeWindow(win.id, {} as any) }}
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
                  {win.id !== 'vsweeper' && (
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
              <div 
                className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white m-1 overflow-hidden flex flex-col bg-[#c0c0c0]"
                onPointerDown={(e) => e.stopPropagation()}
              >
                {renderWindowContent(win.id)}
              </div>
              </>
              )}
            </DesktopWindow>
            );
          })}
        </div>
      </div>

      {/* Motif/CDE Inspired Centered Panel (1991-1994 UNIX style) — slides up when desktop is ready */}
      <div 
        className={`border-2 flex p-1.5 gap-2 overflow-visible transition-all duration-700 ease-out ${theme.bgOuter} ${theme.borderOuter} ${isVerticalTaskbar ? 'flex-col items-center' : 'items-center'}`}
        style={taskbarPositionStyle}
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
        {/* Dock Left Applet */}
        {!taskbarSpanFull && <div style={{ order: -20, height: '100%', display: 'flex' }}><TaskbarAppletSlot side="dock_left" vfs={vfs} chromeTheme={chromeTheme} /></div>}
        
        {/* Left: Clock / Status (Recessed) */}
        {vfs.displaySettings?.taskbarShowClock !== false && (() => {
          const bgCol = vfs.displaySettings?.clockBgColor || (tTheme === 'dark' ? '#000000' : '#c0c0c0');
          const textCol = vfs.displaySettings?.clockTextColor || (tTheme === 'dark' ? '#22c55e' : '#000000');
          const fontClass = vfs.displaySettings?.clockFont || 'font-mono';
          const is12Hour = vfs.displaySettings?.clockFormat === '12h';
          
          return (
            <div className={`${isVerticalTaskbar ? 'w-full py-1' : 'h-full'} flex items-center gap-1 border-2 p-1 ${theme.bgRecessed} ${theme.borderRecessed}`} style={{ order: vfs.displaySettings?.taskbarClockPosition === 'left' ? -10 : 10 }}>
              <div 
                className={`${isVerticalTaskbar ? 'w-full py-2 min-w-0 text-[10px] leading-tight break-words text-center' : 'h-full px-2 min-w-[60px] text-xs'} border-2 ${tTheme === 'dark' ? 'border-t-[#222] border-l-[#222] border-b-[#555] border-r-[#555]' : 'border-t-[#2a3f5c] border-l-[#2a3f5c] border-b-[#ffffff] border-r-[#ffffff]'} flex flex-col items-center justify-center ${fontClass}`}
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
          // Recursive find for 'installed' folder in case the user moved it
          const findFolderDeep = (items: WorkspaceMenuItem[], id: string): WorkspaceMenuItem | undefined => {
            for (const item of items) {
              if (item.id === id) return item;
              if (item.children) {
                const found = findFolderDeep(item.children, id);
                if (found) return found;
              }
            }
            return undefined;
          };
          const installedFolder = findFolderDeep(effectiveMenu, 'installed');
          if (installedFolder) {
            const dynamicChildren: WorkspaceMenuItem[] = [];
            if (installedApps.includes('netmon')) {
              dynamicChildren.push({ id: 'wm_netmon', label: 'AETHERIS Network Monitor', icon: 'Terminal', action: 'netmon', type: 'app', isDynamic: true });
            }
            if (installedApps.includes('rhid')) {
              dynamicChildren.push({ id: 'wm_rhid', label: 'RHID Terminal', icon: 'Terminal', action: 'rhid', type: 'app', isDynamic: true });
            }
            // Add any other user-installed apps
            vfs.nodes.filter((n: any) => n.isApp && !DEFAULT_VFS.find(d => d.id === n.id) && n.id !== 'netmon_exe' && n.id !== 'rhid_exe').forEach((n: any) => {
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
          if (systemTools?.children && !systemTools.children.some(c => c.action === 'task_manager')) {
            systemTools.children.push({
              id: 'wm_taskmgr',
              label: 'Task Manager',
              icon: 'Activity',
              action: 'task_manager',
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
                  }, 750));
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
                      className="w-full text-left px-3 py-1.5 text-sm font-bold flex items-center justify-between gap-1 transition-colors duration-75 whitespace-normal"
                      style={{
                        color: isSubOpen ? chromeTheme.hoverText : chromeTheme.bodyText,
                        backgroundColor: isSubOpen ? chromeTheme.hoverBg : 'transparent',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = chromeTheme.hoverBg; e.currentTarget.style.color = chromeTheme.hoverText; }}
                      onMouseLeave={(e) => { if (!isSubOpen) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = chromeTheme.bodyText; } }}
                    >
                      <div className="flex items-center gap-3 shrink-0 text-left">
                        {item.customIcon ? (
                          <img src={item.customIcon} alt="icon" className="w-[16px] h-[16px] pointer-events-none drop-shadow-sm shrink-0" style={{ imageRendering: 'pixelated' }} draggable={false} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : item.icon && ICON_MAP[item.icon] ? (
                          React.createElement(ICON_MAP[item.icon], { size: 16, className: 'shrink-0' })
                        ) : (
                          <FolderOpen size={16} className="shrink-0" />
                        )}
                        <span className="break-words text-left leading-tight">{item.label}</span>
                      </div>
                      <ChevronRight size={14} className="shrink-0 opacity-70" />
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
              let customImgSrc = item.customIcon || null;
              if (!customImgSrc && item.action) {
                const node = vfs.nodes.find(n => n.id === item.action || n.id === `${item.action}_exe` || (n.isApp && n.id.replace('_exe', '') === item.action));
                if (node && node.customIcon) {
                  customImgSrc = node.customIcon;
                } else if (APP_DICTIONARY[item.action] && APP_DICTIONARY[item.action].customIcon) {
                  customImgSrc = APP_DICTIONARY[item.action].customIcon;
                }
              }
              const IconComp = item.icon && ICON_MAP[item.icon] ? ICON_MAP[item.icon] : FileText;
              const isShutdown = item.type === 'shutdown';
              
              return (
                <button 
                  key={item.id}
                  onClick={() => { handleItemClick(item); setMenuOpen(false); setOpenSubMenuIds(new Set()); }}
                  className="w-full text-left px-3 py-1.5 text-sm font-bold flex items-center gap-3 transition-colors duration-75 whitespace-normal"
                  style={{ color: isShutdown ? '#cc0000' : chromeTheme.bodyText }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isShutdown ? '#cc0000' : chromeTheme.hoverBg; e.currentTarget.style.color = chromeTheme.hoverText; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = isShutdown ? '#cc0000' : chromeTheme.bodyText; }}
                >
                  {customImgSrc ? (
                    <img src={customImgSrc} alt="icon" className="w-[16px] h-[16px] pointer-events-none drop-shadow-sm shrink-0" style={{ imageRendering: 'pixelated' }} draggable={false} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <IconComp size={16} className="shrink-0" />
                  )}
                  <span className="break-words leading-tight text-left text-sm">{item.label}</span>
                </button>
              );
            });
          };
          
          return (
            <div className={`relative ${isVerticalTaskbar ? 'w-full' : 'h-full'} flex items-center justify-center border-2 p-1 shrink-0 ${theme.bgRecessed} ${theme.borderRecessed}`} style={{ order: 0 }}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className={`${isVerticalTaskbar ? 'w-full py-3 flex-col' : 'h-full px-4'} font-bold flex items-center justify-center gap-2 border-2 ${menuOpen ? `${theme.bgRecessed} ${theme.borderRecessed} ${theme.textMain}` : `${theme.bgButton} ${theme.borderButton} ${theme.textMain} ${theme.activeClass}`}`}
              >
                <Monitor size={20} className={neuralBridgeActive && Math.random() > 0.9 ? "text-red-400" : (theme.textMain.includes('black') ? 'text-black' : "text-white")} />
                {isVerticalTaskbar ? (
                  taskbarSize >= 48 && (
                    <span 
                      className="text-sm tracking-wider font-bold uppercase mt-1 mb-1 relative" 
                      style={{ 
                        writingMode: 'vertical-rl', 
                        transform: taskbarPosition === 'left' ? 'rotate(180deg)' : 'none', 
                        textOrientation: 'mixed' 
                      }}
                    >
                      Vespera
                    </span>
                  )
                ) : (
                  <span className="text-sm tracking-wider">Vespera</span>
                )}
              </button>

              {/* Workspace Pop-up Menu */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div 
                    data-task-menu="true"
                    initial={{ opacity: 0, y: taskbarPosition === 'top' ? -10 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: taskbarPosition === 'top' ? -10 : 10 }}
                    transition={{ duration: 0.12 }}
                    className={`absolute w-60 flex flex-col z-[9999] ${taskbarPosition === 'bottom' ? 'bottom-full mb-2 left-1/2' : taskbarPosition === 'top' ? 'top-full mt-2 left-1/2' : taskbarPosition === 'left' ? 'left-full ml-2 top-1/2' : 'right-full mr-2 top-1/2'}`}
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
                        if (isVerticalTaskbar) return 'translateY(-50%)'; // Center it vertically relative to the button
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
        <div className={`${isVerticalTaskbar ? 'w-full flex-col min-h-0' : 'h-full min-w-0'} flex items-center gap-1 border-2 p-1 overflow-y-auto flex-1 ${theme.bgRecessed} ${theme.borderRecessed}`} style={{ order: 0 }}>
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
                customIcon: meta.customIcon,
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
                  customIcon: meta.customIcon,
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
                  className={`relative shrink-0 flex flex-col items-center justify-center border-2 transition-none ${isVerticalTaskbar ? 'w-full h-12' : 'h-full w-12'} ${isTop ? `${theme.bgRecessed} ${theme.borderRecessed}` : `${theme.bgButton} ${theme.borderButton} ${theme.activeClass}`} ${draggedDockId === app.id ? 'opacity-50' : 'opacity-100'}`}
                  title={app.title}
                >
                  {app.customIcon ? (
                    <img src={app.customIcon} alt="icon" className={`w-[24px] h-[24px] pointer-events-none drop-shadow-md ${!isOpen || isTop ? '' : 'filter brightness-75'}`} style={{ imageRendering: 'pixelated' }} draggable={false} />
                  ) : (
                    <app.icon size={20} className={isOpen && !isTop ? app.color : (isTop ? (theme.textMain.includes('black') ? 'text-black' : 'text-white') : 'text-gray-200')} />
                  )}
                  {isOpen && <div className={`absolute ${isVerticalTaskbar ? 'right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-4' : 'bottom-0.5 w-4 h-0.5'} ${isTop ? (theme.textMain.includes('black') ? 'bg-black' : 'bg-white') : 'bg-gray-300'}`} />}
                </button>
              );
            });
          })()}
        </div>

        {/* Tray: Internet, playback volume, spectrum when Media Agent is playing */}
        <div
          ref={taskbarTrayRef}
          className={`relative ${isVerticalTaskbar ? 'w-full flex-col' : 'h-full'} flex items-stretch gap-0.5 border-2 p-1 shrink-0 ${theme.bgRecessed} ${theme.borderRecessed}`}
          style={{ order: vfs.displaySettings?.taskbarTrayPosition === 'left' ? -5 : 5 }}
        >
          <div className={`relative ${isVerticalTaskbar ? 'w-full' : 'h-full'} flex items-stretch`}>
            <button
              type="button"
              title="Internet"
              aria-expanded={internetTrayOpen}
              onClick={() => {
                setVolumeTrayOpen(false);
                setInternetTrayOpen((o) => !o);
              }}
              className={`${isVerticalTaskbar ? 'w-full py-2' : 'h-full w-9'} flex items-center justify-center border-2 ${theme.bgButton} ${theme.borderButton} ${theme.activeClass}`}
            >
              <Globe size={18} className={theme.textMain.includes('black') ? 'text-black' : 'text-white'} />
            </button>
            {internetTrayOpen && (
              <div
                className={`absolute z-[10001] flex flex-col min-w-[188px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] py-1 ${taskbarPosition === 'bottom' ? 'bottom-[calc(100%+6px)] right-0' : taskbarPosition === 'top' ? 'top-[calc(100%+6px)] right-0' : taskbarPosition === 'left' ? 'left-[calc(100%+6px)] top-0' : 'right-[calc(100%+6px)] top-0'}`}
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

          <div className={`relative ${isVerticalTaskbar ? 'w-full' : 'h-full'} flex items-stretch`}>
            <button
              type="button"
              title="Volume"
              aria-expanded={volumeTrayOpen}
              onClick={() => {
                setInternetTrayOpen(false);
                setVolumeTrayOpen((o) => !o);
              }}
              onDoubleClick={() => {
                setVolumeTrayOpen(false);
                if (!windows.find(w => w.id === "volume_control")?.isOpen) {
                  openWindow("volume_control");
                }
              }}
              className={`${isVerticalTaskbar ? 'w-full py-2' : 'h-full w-9'} flex items-center justify-center border-2 ${theme.bgButton} ${theme.borderButton} ${theme.activeClass}`}
            >
              {taskbarMedia.volume < 0.04 ? (
                <VolumeX size={18} className={theme.textMain.includes('black') ? 'text-black' : 'text-white'} />
              ) : (
                <Volume2 size={18} className={theme.textMain.includes('black') ? 'text-black' : 'text-white'} />
              )}
            </button>
            {volumeTrayOpen && (
              <div className={`absolute z-[10001] w-[248px] box-border bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] px-2.5 py-2 ${taskbarPosition === 'bottom' ? 'bottom-[calc(100%+6px)] right-0' : taskbarPosition === 'top' ? 'top-[calc(100%+6px)] right-0' : taskbarPosition === 'left' ? 'left-[calc(100%+6px)] top-0' : 'right-[calc(100%+6px)] top-0'}`}>
                <div className="flex justify-between items-end mb-1.5">
                  <div className="text-[10px] font-bold text-black">Master System Volume</div>
                  <button 
                    className="text-[9px] underline text-blue-800 hover:text-blue-600 cursor-pointer p-0 border-none bg-transparent"
                    onClick={() => {
                      setVolumeTrayOpen(false);
                      openWindow('volume_control');
                    }}
                  >
                    Volume Control...
                  </button>
                </div>
                <div className="flex items-center gap-1.5 w-full min-w-0 mb-3">
                  <VolumeX size={14} className="text-gray-600 shrink-0 w-[14px]" aria-hidden />
                  <div className="flex-1 min-w-0 py-1">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={vfs.displaySettings?.soundEffectsVolume ?? 1.0}
                      onChange={(e) => vfs.updateSoundSettings(Number(e.target.value), vfs.displaySettings?.systemMuted ?? false)}
                      className="block w-full max-w-full h-2 min-h-[8px] accent-[#000080] cursor-pointer"
                      style={{ boxSizing: 'border-box' }}
                    />
                  </div>
                  <Volume2 size={14} className="text-gray-600 shrink-0 w-[14px]" aria-hidden />
                </div>

                <div className="text-[10px] font-bold text-black mb-1.5 pt-2 border-t border-gray-400">Media Playback volume</div>
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
                <p className="text-[9px] text-gray-600 mt-1.5 leading-tight mb-2">Adjusts VERSA Media Agent output. Preference is saved.</p>

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
                  setNotificationTrayOpen(false);
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

          {/* Tray: Notification History icon */}
          <div className="relative h-full flex items-stretch">
            <button
              type="button"
              title="System Notifications"
              aria-expanded={notificationTrayOpen}
              onClick={() => {
                setInternetTrayOpen(false);
                setVolumeTrayOpen(false);
                setNotificationTrayOpen(o => !o);
              }}
              className={`h-full w-9 flex items-center justify-center border-2 relative ${theme.bgButton} ${theme.borderButton} ${theme.activeClass}`}
            >
              <MessageSquare size={16} className={theme.textMain.includes('black') ? 'text-black' : 'text-white'} />
              {notificationHistory.length > 0 && (
                <span className="absolute top-[6px] right-[6px] w-[5px] h-[5px] bg-[#000080] border border-white rounded-none" />
              )}
            </button>
            {notificationTrayOpen && (
              <div className={`absolute z-[10001] w-[300px] max-h-[400px] overflow-hidden flex flex-col box-border bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] ${taskbarPosition === 'bottom' ? 'bottom-[calc(100%+6px)] right-0' : taskbarPosition === 'top' ? 'top-[calc(100%+6px)] right-0' : taskbarPosition === 'left' ? 'left-[calc(100%+6px)] top-0' : 'right-[calc(100%+6px)] top-0'}`}>
                <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex justify-between items-center text-white shrink-0">
                  <span className="text-[10px] font-bold tracking-wider">Notification History</span>
                  <button 
                    className="text-[9px] underline text-[#aaffaa] hover:text-white cursor-pointer p-0 border-none bg-transparent font-bold"
                    onClick={() => setNotificationHistory([])}
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white mx-1 my-1">
                  {notificationHistory.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-[10px] italic">No notifications</div>
                  ) : (
                    notificationHistory.map((notif, index) => (
                      <div 
                        key={`${notif.id}-${index}`} 
                        className={`p-2 border-b border-gray-300 hover:bg-[#000080] hover:text-white group cursor-pointer ${index === notificationHistory.length - 1 ? 'border-b-0' : ''}`}
                        onClick={() => {
                          setNotificationTrayOpen(false);
                          if (notif.route) {
                            if (notif.route.panel) {
                              openWindow('control_panel');
                              setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('vespera-open-control-panel-route', { detail: notif.route }));
                              }, 100);
                            } else {
                              openWindow(notif.route);
                            }
                          }
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {notif.type === 'mail' && <Mail size={12} className="shrink-0 text-blue-600 group-hover:text-white" />}
                          {notif.type === 'system' && <Settings size={12} className="shrink-0 text-gray-600 group-hover:text-white" />}
                          {notif.type === 'app' && <Activity size={12} className="shrink-0 text-green-600 group-hover:text-white" />}
                          <span className="font-bold text-[10px] truncate leading-tight flex-1" style={{ color: 'inherit' }}>{notif.title}</span>
                          <span className="text-[9px] opacity-70 shrink-0">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[9px] leading-tight opacity-90 line-clamp-2" style={{ color: 'inherit' }}>{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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

        {/* Dock Right Applet */}
        {!taskbarSpanFull && (
          <TaskbarAppletSlot 
            side="dock_right" 
            vfs={vfs} 
            chromeTheme={chromeTheme} 
            collapsed={
              ((vfs.displaySettings?.pinnedApps?.length || 7) + 
              windows.filter(w => w.isOpen && !(vfs.displaySettings?.pinnedApps || ['files', 'browser', 'workbench', 'analyzer', 'chat', 'control_panel', 'xtype']).includes(w.id)).length) > 7
            } 
          />
        )}
      </div>

        {/* System Notification Toasts */}
        <AnimatePresence>
          {systemToasts.map((toast, index) => (
            <motion.div
              key={toast.id}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`absolute z-[9999] cursor-pointer ${taskbarPosition === 'right' ? 'top-8 right-[calc(80px+8px)]' : taskbarPosition === 'top' ? 'top-[calc(80px+8px)] right-8' : taskbarPosition === 'left' ? 'top-8 left-[calc(80px+8px)]' : 'bottom-[calc(80px+8px)] right-8'}`}
              style={{ transform: `translateY(-${index * 80}px)` }}
              onClick={() => {
                setSystemToasts(prev => prev.filter(t => t.id !== toast.id));
                if (toast.route) {
                  window.dispatchEvent(new CustomEvent('vespera-open-control-panel-route', { detail: toast.route }));
                  addWindow({ id: 'control_panel', title: 'Control Panel', x: Math.max(0, Math.round((deskDimsRef.current.w - 460) / 2)), y: Math.max(0, Math.round((deskDimsRef.current.h - 600) / 2)), width: 460, height: 600, target: 'control_panel' });
                }
              }}
            >
              <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-[260px] mb-2">
                <div className="bg-[#000080] text-white text-[11px] font-bold px-2 py-0.5 flex items-center gap-1.5">
                  <span className="truncate">{toast.title}</span>
                  <button
                    className="ml-auto w-4 h-3.5 flex items-center justify-center bg-[#c0c0c0] border border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-black text-[9px] font-bold leading-none active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSystemToasts(prev => prev.filter(t => t.id !== toast.id));
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="p-2.5 flex items-start gap-2">
                  <div className="shrink-0 mt-0.5">
                    {toast.icon || <Settings size={20} className="text-[#000080]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-black leading-tight">{toast.message}</p>
                    {toast.route && <p className="text-[9px] text-gray-500 mt-1">Click to view details</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Mail Notification Toast */}
        <AnimatePresence>
          {mailToast && (
            <motion.div
              key="mail-toast"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`absolute z-[9999] cursor-pointer ${taskbarPosition === 'right' ? 'top-8 right-[calc(80px+8px)]' : taskbarPosition === 'top' ? 'top-[calc(80px+8px)] right-8' : taskbarPosition === 'left' ? 'top-8 left-[calc(80px+8px)]' : 'bottom-[calc(80px+8px)] right-8'}`}
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
                    openWindow("task_manager");
                    setContextMenu(null);
                  }}
                >
                  Task Manager
                </button>
                <div className="h-0.5 bg-gray-500 border-b border-white my-1 mx-1" />
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    addWindow({ id: 'control_panel', title: 'Control Panel', x: Math.max(0, Math.round((deskDimsRef.current.w - 460) / 2)), y: Math.max(0, Math.round((deskDimsRef.current.h - 600) / 2)), width: 460, height: 600, target: 'taskbar' });
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
                <div 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm flex justify-between items-center relative cursor-default"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setOpenWithNodeId(contextMenu.nodeId!);
                    setOpenWithPos({ x: rect.width - 4, y: 0 });
                  }}
                  onMouseLeave={() => {
                    // We handle closing via the main context menu close or if we hover elsewhere
                  }}
                >
                  <span>Open with</span>
                  <ChevronRight size={14} />
                  
                  {openWithNodeId === contextMenu.nodeId && openWithPos && (
                    <div 
                      className="absolute bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] z-[201] flex flex-col py-1"
                      style={{ left: openWithPos.x, top: openWithPos.y, minWidth: 160 }}
                      onClick={e => e.stopPropagation()}
                    >
                      {(() => {
                        const node = vfs.getNode(contextMenu.nodeId!);
                        const apps = node ? getCompatibleApps(node.name) : [];
                        if (apps.length === 0) return <div className="px-4 py-1 text-gray-500 italic text-xs">No apps found</div>;
                        
                        return apps.map(appId => {
                          const appInfo = APP_DICTIONARY[appId] || APP_DICTIONARY['default'];
                          return (
                            <button
                              key={appId}
                              className="text-left px-4 py-1 hover:bg-[#000080] hover:text-white text-black text-sm flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveFileId(contextMenu.nodeId!);
                                openWindow(appId);
                                setContextMenu(null);
                                setOpenWithNodeId(null);
                              }}
                            >
                              {appInfo.customIcon ? (
                                <img src={appInfo.customIcon} alt="" className="w-4 h-4" />
                              ) : (
                                <appInfo.icon size={14} />
                              )}
                              <span>{appInfo.defaultTitle}</span>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
                {(() => {
                  const node = vfs.getNode(contextMenu.nodeId!);
                  if (node && node.type === 'file' && node.content?.startsWith('data:image/')) {
                    return (
                      <button 
                        className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-[#000080] font-bold text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const a = document.createElement('a');
                          a.href = node.content as string;
                          a.download = node.name;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          setContextMenu(null);
                        }}
                      >
                        Export to real OS
                      </button>
                    );
                  }
                  return null;
                })()}
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
                <div className="h-[1px] bg-gray-400 mx-1 my-1" />
                {selectedDesktopNodes.size > 1 && selectedDesktopNodes.has(contextMenu.nodeId) && (
                  <>
                    <button 
                      className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        compressDesktopToZip('desktop');
                      }}
                    >
                      Compress to .zip ({selectedDesktopNodes.size} items)
                    </button>
                    <div className="h-[1px] bg-gray-400 mx-1 my-1" />
                  </>
                )}
                {contextMenu.nodeId === 'recycle_bin_lnk' && (
                  <>
                    <button 
                      className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        vfs.emptyTrash();
                        setContextMenu(null);
                      }}
                    >
                      Empty Recycle Bin
                    </button>
                    <div className="h-[1px] bg-gray-400 mx-1 my-1" />
                  </>
                )}
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
                    vfs.createNode("New Folder", "directory", "desktop", undefined, undefined, undefined, { customIcon: "/Icons/Extra Icons/directory_closed.ico" });
                    setContextMenu(null);
                  }}
                >
                  New Folder
                </button>
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    vfs.createNode("New Text File.txt", "file", "desktop", undefined, undefined, undefined, { customIcon: "/Icons/Extra Icons/message_file.ico" });
                    setContextMenu(null);
                  }}
                >
                  New Text File
                </button>
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    vfs.createNode("Archive.zip", "directory", "desktop", undefined, undefined, undefined, { customIcon: "/Icons/Extra Icons/directory_zipper.ico" });
                    setContextMenu(null);
                  }}
                >
                  New Zip File
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
                {/* Compress selected items to zip — only shown when 2+ items are selected */}
                {selectedDesktopNodes.size > 1 && (
                  <button 
                    className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      compressDesktopToZip('desktop');
                    }}
                  >
                    Compress to .zip ({selectedDesktopNodes.size} items)
                  </button>
                )}
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    arrangeIcons('name');
                    setContextMenu(null);
                  }}
                >
                  Arrange Icons by Name
                </button>
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    arrangeIcons('type');
                    setContextMenu(null);
                  }}
                >
                  Arrange Icons by Type
                </button>
                <div className="h-0.5 bg-gray-500 border-b border-white my-1 mx-1" />
                <button 
                  className="text-left px-4 py-1 enabled:hover:[background-color:var(--vm-hover-bg)] enabled:hover:[color:var(--vm-hover-fg)] text-black text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addWindow({ id: 'control_panel', title: 'Control Panel', x: Math.max(0, Math.round((deskDimsRef.current.w - 460) / 2)), y: Math.max(0, Math.round((deskDimsRef.current.h - 600) / 2)), width: 460, height: 600, target: 'display' });
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

      {/* Missing Dependencies Error Modal */}
      {appLaunchError && (
        <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="w-[280px] bg-[#c0c0c0] shadow-[2px_2px_0_#000,-2px_-2px_0_#dfdfdf,2px_-2px_0_#000,-2px_2px_0_#dfdfdf] border-2 border-white flex flex-col p-0.5 pointer-events-auto">
            <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-0.5 text-white font-bold tracking-wider relative flex justify-between items-center text-xs">
              <span className="truncate">{appLaunchError.title}</span>
              <button 
                onClick={() => setAppLaunchError(null)} 
                className="w-3 h-3 bg-[#c0c0c0] border border-white border-b-gray-800 border-r-gray-800 flex items-center justify-center text-black font-bold outline-none font-mono text-[8px] hover:active:border-t-gray-800 hover:active:border-l-gray-800 hover:active:border-b-white hover:active:border-r-white"
              >
                X
              </button>
            </div>
            <div className="p-3 flex flex-row gap-3 items-start bg-[#c0c0c0]">
              <div className="shrink-0 w-6 h-6 rounded-full bg-red-600 border border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex items-center justify-center text-white font-bold text-sm shadow-md">
                X
              </div>
              <p className="text-black text-xs whitespace-pre-wrap leading-tight">{appLaunchError.message}</p>
            </div>
            <div className="p-2 flex justify-center border-t border-gray-400 bg-[#c0c0c0]">
              <button 
                onClick={() => setAppLaunchError(null)} 
                className="px-4 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-black text-xs outline-none active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white focus:outline-dotted focus:outline-1 focus:-outline-offset-4 focus:outline-black font-bold"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global System Warnings */}
      {systemWarnings.map((warning, index) => {
        const metaInfo = warning.pluginId ? (APP_DICTIONARY[warning.pluginId] || APP_DICTIONARY['default']) : null;
        return (
          <div key={warning.id} className="absolute inset-0 z-[99999] flex items-center justify-center pointer-events-none" style={{ marginTop: index * 20, marginLeft: index * 20 }}>
            <div className="w-[320px] bg-[#c0c0c0] shadow-[2px_2px_0_#000,-2px_-2px_0_#dfdfdf,2px_-2px_0_#000,-2px_2px_0_#dfdfdf] border-2 border-white flex flex-col p-0.5 pointer-events-auto">
              <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-0.5 text-white font-bold tracking-wider flex justify-between items-center text-xs">
                <span className="truncate">{warning.type || 'System Warning'}</span>
                <button 
                  onClick={() => setSystemWarnings(w => w.filter(x => x.id !== warning.id))} 
                  className="w-3 h-3 bg-[#c0c0c0] border border-white border-b-gray-800 border-r-gray-800 flex items-center justify-center text-black font-bold outline-none font-mono text-[8px] hover:active:border-t-gray-800 hover:active:border-l-gray-800 hover:active:border-b-white hover:active:border-r-white"
                >X</button>
              </div>
              <div className="p-3 flex flex-row gap-3 items-start bg-[#c0c0c0]">
                <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                  {metaInfo ? (
                     metaInfo.customIcon ? (
                        <img src={metaInfo.customIcon} alt="Icon" className="w-6 h-6 drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
                     ) : <metaInfo.icon size={24} className={metaInfo.color} />
                  ) : (
                     <div className="w-6 h-6 rounded-full bg-yellow-500 border border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex items-center justify-center text-black font-bold text-sm shadow-md">!</div>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="font-bold text-xs text-black">{warning.title}</span>
                  <p className="text-black text-xs whitespace-pre-wrap leading-tight max-h-[150px] overflow-y-auto">{warning.message}</p>
                </div>
              </div>
              <div className="p-2 flex justify-center border-t border-gray-400 bg-[#c0c0c0]">
                <button 
                  onClick={() => setSystemWarnings(w => w.filter(x => x.id !== warning.id))} 
                  className="px-4 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-black text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white focus:outline-dotted focus:outline-1 focus:-outline-offset-4 focus:outline-black"
                >OK</button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Global BSOD */}
      {fatalError && (
        <div className="absolute inset-0 z-[100000] bg-[#0000aa] flex flex-col font-mono text-white p-8 sm:p-12 select-none overflow-hidden cursor-none pointer-events-auto">
          <div className="bg-white text-[#0000aa] px-3 py-1 inline-block self-center sm:self-start font-bold mb-10 text-lg uppercase tracking-widest shadow-[4px_4px_0_rgba(0,0,0,0.3)]">
            Vespera OS Kernel Panel
          </div>
          <p className="mb-6 text-sm sm:text-base leading-relaxed">
            A fatal exception has occurred inside the neural simulation bridge. The current architecture has been aggressively halted to prevent quantum degradation and localized cascade failure.
          </p>
          <div className="mb-10 text-sm sm:text-base">
            <span className="opacity-70 uppercase tracking-widest text-[10px] sm:text-xs">Exception Code:</span>
            <br/>
            <span className="text-white mt-1 block">ERR_ {fatalError.type?.replace(/ /g, '_').toUpperCase() || 'FATAL_FAULT'}</span>
            <br/>
            <span className="opacity-70 uppercase tracking-widest text-[10px] sm:text-xs">Diagnostic Info:</span>
            <br/>
            <span className="text-[#aaffaa] mt-1 block font-bold">{fatalError.title}</span>
            <span className="mt-2 block whitespace-pre-wrap">{fatalError.message}</span>
          </div>
          <div className="mb-10 text-[10px] sm:text-xs opacity-70 leading-loose">
            * Hardware address 0x011A8B2E FFFF:0000 triggered a page fault.<br/>
            * Process Explorer.exe halted with exit code 0x0000000A.<br/>
            * VFS State: PRESERVED.<br/>
            * React Node Tree: ABORTED.
          </div>
          <p className="mt-auto flex items-center gap-3 text-sm sm:text-base">
            <span className="w-2.5 h-5 bg-white animate-[pulse_1s_steps(2,start)_infinite] block shadow-[0_0_10px_#fff]"></span> 
            Press F5 or refresh your browser to physically reboot the simulation engine.
          </p>
        </div>
      )}

      {/* Sign Out / Sign Out to Terminal overlay */}
      {signingOut && (
        <SignOutScreen
          mode={signingOut}
          neuralBridgeActive={neuralBridgeActive}
          openAppsCount={windows.filter(w => w.isOpen).length}
          onComplete={() => {
            setSigningOut(null);
            if (signingOut === "login") onSignOut();
            else if (signingOut === "shutdown") onShutDown();
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
          onOpenSettings={() => addWindow({ id: 'control_panel', title: 'Control Panel', x: Math.max(0, Math.round((deskDimsRef.current.w - 460) / 2)), y: Math.max(0, Math.round((deskDimsRef.current.h - 600) / 2)), width: 460, height: 600, target: 'agent_v' })}
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
