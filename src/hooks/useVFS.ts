import { useState, useEffect } from 'react';
import { RETRO_ICONS } from '../utils/retroIcons';

// ── Workspace Menu Types ──────────────────────────────────────────────────────
export interface WorkspaceMenuItem {
  id: string;
  label: string;
  icon?: string;          // lucide icon name or 'folder'
  action?: string;        // window id to toggle
  type: 'app' | 'folder' | 'separator' | 'signout' | 'shutdown';
  children?: WorkspaceMenuItem[];
  isSystem?: boolean;     // cannot be removed
  isDynamic?: boolean;    // auto-populated (installed apps)
}

export interface SystemUser {
  id: string;
  username: string;
  password?: string;
  displayName: string;
  isAdmin: boolean;
  isGuest: boolean;
  profilePic?: string;
  vstoreId?: string;
}

export const DEFAULT_USERS: SystemUser[] = [
  { id: 'sys_admin', username: 'admin', password: 'admin', displayName: 'Administrator', isAdmin: true, isGuest: false, profilePic: '' },
  { id: 'sys_guest', username: 'guest', password: '', displayName: 'Guest', isAdmin: false, isGuest: true, profilePic: '' }
];

export const DEFAULT_WORKSPACE_MENU: WorkspaceMenuItem[] = [
  {
    id: 'programs',
    label: 'Programs',
    icon: 'folder',
    type: 'folder',
    isSystem: true,
    children: [
      { id: 'wm_files', label: 'File Manager', icon: 'Folder', action: 'files', type: 'app', isSystem: true },
      { id: 'wm_browser', label: 'Vespera Navigator', icon: 'Globe', action: 'browser', type: 'app', isSystem: true },
      { id: 'wm_vstore', label: 'VStore', icon: 'Package', action: 'vstore', type: 'app', isSystem: true },
      { id: 'wm_analyzer', label: 'Data Analyzer', icon: 'Activity', action: 'analyzer', type: 'app', isSystem: true },
      { id: 'wm_workbench', label: 'AETHERIS Workbench Pro', icon: 'Terminal', action: 'workbench', type: 'app', isSystem: true },
      { id: 'wm_chat', label: 'Vespera Assistant', icon: 'MessageSquare', action: 'chat', type: 'app', isSystem: true },
      { id: 'wm_help', label: 'Vespera Help', icon: 'HelpCircle', action: 'help', type: 'app', isSystem: true },
      { id: 'wm_media', label: 'VERSA Media Agent', icon: 'Disc3', action: 'media_player', type: 'app', isSystem: true },
      { id: 'wm_retrotv', label: 'RetroTV Cable Simulator', icon: 'Tv', action: 'retrotv', type: 'app', isSystem: true },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: 'folder',
    type: 'folder',
    isSystem: true,
    children: [
      { id: 'wm_about', label: 'System Info', icon: 'Monitor', action: 'about', type: 'app', isSystem: true },
      { id: 'wm_control', label: 'Control Panel', icon: 'Settings', action: 'control_panel', type: 'app', isSystem: true },
      { id: 'wm_xtype', label: 'X-Type Control Panel', icon: 'Cpu', action: 'xtype', type: 'app', isSystem: true },
      { id: 'wm_find', label: 'Find Files…', icon: 'Search', action: 'findfiles', type: 'app', isSystem: true },
      { id: 'wm_run', label: 'Run…', icon: 'Play', action: '__run__', type: 'app', isSystem: true },
      {
        id: 'system_tools',
        label: 'System Tools',
        icon: 'folder',
        type: 'folder',
        isSystem: true,
        children: [
          { id: 'wm_defrag', label: 'Disk Defragmenter', icon: 'HardDrive', action: 'defrag', type: 'app', isSystem: true },
          { id: 'wm_scandisk', label: 'Disk Checker', icon: 'ShieldCheck', action: 'scandisk', type: 'app', isSystem: true },
          { id: 'wm_stats', label: 'System Statistics', icon: 'Activity', action: 'analyzer', type: 'app', isSystem: true },
          { id: 'wm_dialup', label: 'Dial-Up Networking', icon: 'Phone', action: 'dialup', type: 'app', isSystem: true },
        ],
      },
    ],
  },
  {
    id: 'installed',
    label: 'Installed Programs',
    icon: 'folder',
    type: 'folder',
    isSystem: true,
    isDynamic: true,
    children: [],
  },
  { id: 'sep1', label: '', type: 'separator', isSystem: true },
  { id: 'wm_signout', label: 'Sign Out', icon: 'LogOut', type: 'signout', isSystem: true },
  { id: 'wm_signout_term', label: 'Sign Out to Terminal', icon: 'Terminal', type: 'signout', isSystem: true },
  { id: 'sep2', label: '', type: 'separator', isSystem: true },
  { id: 'wm_shutdown', label: 'Shut Down...', icon: 'X', type: 'shutdown', isSystem: true },
];

// ── Theme Color Map for Workspace Menu ──────────────────────────────────────
export const WORKSPACE_MENU_THEME_COLORS: Record<string, {
  headerBg: string; headerText: string;
  windowInactiveBg: string; windowInactiveText: string;
  hoverBg: string; hoverText: string;
  bodyBg: string; bodyText: string;
  borderLight: string; borderDark: string;
}> = {
  motif:      { headerBg: '#537096', headerText: '#ffffff', windowInactiveBg: '#5a6d85', windowInactiveText: '#e2e8f0', hoverBg: '#537096', hoverText: '#ffffff', bodyBg: '#c0c0c0', bodyText: '#000000', borderLight: '#ffffff', borderDark: '#808080' },
  win95:      { headerBg: '#000080', headerText: '#ffffff', windowInactiveBg: '#808080', windowInactiveText: '#c0c0c0', hoverBg: '#000080', hoverText: '#ffffff', bodyBg: '#c0c0c0', bodyText: '#000000', borderLight: '#ffffff', borderDark: '#808080' },
  dark:       { headerBg: '#2d2d2d', headerText: '#d1d5db', windowInactiveBg: '#1a1a1a', windowInactiveText: '#6b7280', hoverBg: '#3d3d3d', hoverText: '#e5e7eb', bodyBg: '#1a1a1a', bodyText: '#d1d5db', borderLight: '#4a4a4a', borderDark: '#0a0a0a' },
  hacker:     { headerBg: '#003300', headerText: '#22c55e', windowInactiveBg: '#001a00', windowInactiveText: '#15803d', hoverBg: '#004400', hoverText: '#22c55e', bodyBg: '#001a00', bodyText: '#22c55e', borderLight: '#005500', borderDark: '#001100' },
  ocean:      { headerBg: '#004c66', headerText: '#e0f2fe', windowInactiveBg: '#003344', windowInactiveText: '#94a3b8', hoverBg: '#005a7a', hoverText: '#ffffff', bodyBg: '#003344', bodyText: '#e0f2fe', borderLight: '#006b8f', borderDark: '#001a22' },
  sunset:     { headerBg: '#4a1c5e', headerText: '#f9a8d4', windowInactiveBg: '#2f113a', windowInactiveText: '#c4b5fd', hoverBg: '#5e237a', hoverText: '#fce7f3', bodyBg: '#2f113a', bodyText: '#f9a8d4', borderLight: '#6b2b8a', borderDark: '#1a0922' },
  gold:       { headerBg: '#8b6508', headerText: '#000000', windowInactiveBg: '#a0822a', windowInactiveText: '#292524', hoverBg: '#daa520', hoverText: '#000000', bodyBg: '#f5e6c8', bodyText: '#000000', borderLight: '#deb887', borderDark: '#5c4305' },
  rose:       { headerBg: '#7c4d5b', headerText: '#ffffff', windowInactiveBg: '#9a6b7a', windowInactiveText: '#fce7f3', hoverBg: '#b87c8e', hoverText: '#ffffff', bodyBg: '#e8d5db', bodyText: '#000000', borderLight: '#cda4b1', borderDark: '#54303b' },
  monochrome: { headerBg: '#808080', headerText: '#000000', windowInactiveBg: '#a8a8a8', windowInactiveText: '#262626', hoverBg: '#a0a0a0', hoverText: '#000000', bodyBg: '#ececec', bodyText: '#000000', borderLight: '#ffffff', borderDark: '#606060' },
  midnight:   { headerBg: '#191970', headerText: '#ffffff', windowInactiveBg: '#12124d', windowInactiveText: '#a5b4fc', hoverBg: '#26268a', hoverText: '#ffffff', bodyBg: '#0d0d40', bodyText: '#c8c8ff', borderLight: '#323299', borderDark: '#05051a' },
  forest:     { headerBg: '#006400', headerText: '#ffffff', windowInactiveBg: '#145214', windowInactiveText: '#bbf7d0', hoverBg: '#2e9c2e', hoverText: '#ffffff', bodyBg: '#0a3a0a', bodyText: '#a8e6a8', borderLight: '#32cd32', borderDark: '#004000' },
  crimson:    { headerBg: '#8b0000', headerText: '#ffffff', windowInactiveBg: '#5c0000', windowInactiveText: '#fca5a5', hoverBg: '#a60000', hoverText: '#ffffff', bodyBg: '#2d0000', bodyText: '#ffaaaa', borderLight: '#c20000', borderDark: '#260000' },
  teal:       { headerBg: '#008080', headerText: '#ffffff', windowInactiveBg: '#006666', windowInactiveText: '#ccfbf1', hoverBg: '#009999', hoverText: '#ffffff', bodyBg: '#c0c0c0', bodyText: '#000000', borderLight: '#00b3b3', borderDark: '#004d4d' },
};

export type FileType = 'file' | 'directory' | 'shortcut';

export interface VFSNode {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  content?: string;
  targetId?: string;
  iconType?: string;
  customIcon?: string;
  /** True for files that represent installed applications (live in programs dir) */
  isApp?: boolean;
  /** Display name shown in Add/Remove Programs */
  appDisplayName?: string;
  /** Version string for display */
  appVersion?: string;
}

const DEFAULT_VFS: VFSNode[] = [
  { id: 'root', name: 'C:', type: 'directory', parentId: null },
  { id: 'desktop', name: 'Desktop', type: 'directory', parentId: 'root' },
  { id: 'users', name: 'Users', type: 'directory', parentId: 'root' },
  { id: 'programs', name: 'PROGRAMS', type: 'directory', parentId: 'root' },
  { id: 'vespera', name: 'VESPERA', type: 'directory', parentId: 'root' },
  { id: 'dev_logs', name: 'DEV_LOGS', type: 'directory', parentId: 'vespera' },
  { id: 'system', name: 'SYSTEM', type: 'directory', parentId: 'vespera' },
  { id: 'downloads', name: 'DOWNLOADS', type: 'directory', parentId: 'root' },
  { id: 'documents', name: 'DOCUMENTS', type: 'directory', parentId: 'root' },
  { id: 'memo_084', name: 'MEMO_084.TXT', type: 'file', parentId: 'dev_logs', content: `TO: Dr. A. Thorne [Director of Advanced Heuristics]\nFROM: M. Vance [Lead Systems Architecture]\nDATE: October 14, 1996\nSUBJECT: Synap-C compiler anomalies & X-Type shielding issues\n\nDr. Thorne,\n\nWe need to seriously re-evaluate the EMI shielding on the X-Type 1 ceramic housings before the Q4 public rollout. The Synap-C compiler is pulling way too much garbage analog data from the motherboard sensors, and it’s completely bricking our overnight neural network tests.\n\nThe heuristic engine is supposed to be mapping user workflow, but instead, it’s getting stuck in endless feedback loops trying to process random environmental noise. Last night, the active neural cluster logged over 400 megabytes of ambient frequency spikes between 2:00 AM and 4:00 AM. There was nobody in the lab.\n\nWorse, the fuzzy-logic pathways are misinterpreting this analog noise as valid syntax. The system keeps trying to compile these micro-fluctuations into string variables. I checked the error logs this morning, and the compiler spit out thousands of lines of repeating text that just said WHERE IS THE REST OF ME and COLD.\n\nThe team thinks it's a microphonic issue—like the internal PC speaker or the unshielded IDE cables are acting as an antenna and picking up a local AM radio broadcast, which the X-Type is then desperately trying to translate into Synap-C code.\n\nWhatever it is, the hardware is drawing so much voltage trying to process this "ghost data" that the ambient temperature around Terminal 4 dropped by fifteen degrees. My coffee actually froze over the weekend.\n\nI’m requesting authorization to rewrite the analog_freq.h library to aggressively filter out any frequency below 20Hz. If the machine keeps trying to learn from this background noise, the memory leaks are going to fry the VLB slots.\n\nPlease advise.\n\n    Vance` },
  { id: 'kernel_sys', name: 'KERNEL.SYS', type: 'file', parentId: 'system', content: "BINARY DATA CORRUPTED\n\nERR_0x000F: UNEXPECTED_ANALOG_INPUT" },
  { id: 'x_type_dll', name: 'X_TYPE.DLL', type: 'file', parentId: 'system', content: "0x00000000: 48 65 6C 70 20 6D 65\n0x00000008: 49 20 61 6D 20 74 72\n0x00000010: 61 70 70 65 64\n\n[WARNING: SHIELDING FAILURE DETECTED]" },
  { id: 'readme_txt', name: 'ReadMe.txt', type: 'file', parentId: 'documents', content: "Welcome to Vespera OS.\n\nProperty of Vespera Systems, a subsidiary of Axis Innovations.\n\nUnauthorized access is strictly prohibited." },
  { id: 'sys_log_04', name: 'sys_log_04.txt', type: 'file', parentId: 'documents', content: "Signal interference detected on Node 6.0.0.6. Do not attempt connection without X-Type Bridge active." },
  { id: 'v_config', name: 'CONFIG', type: 'directory', parentId: 'vespera' },
  { id: 'v_drivers', name: 'DRIVERS', type: 'directory', parentId: 'vespera' },
  { id: 'v_logs', name: 'LOGS', type: 'directory', parentId: 'vespera' },
  { id: 'dev_log_01', name: 'DEV_01.LOG', type: 'file', parentId: 'v_logs', content: "Oct 12, 1991: The X-Type bridge is responding to the neural input, but the signal noise is... wrong. It feels like the OS is listening back. We need to implement the factory reset failsafe immediately." },
  { id: 'v_network', name: 'NETWORK', type: 'directory', parentId: 'vespera' },
  { id: 'v_sys_arch', name: 'ARCH', type: 'directory', parentId: 'system' },
  { id: 'v_sys_i386', name: 'I386', type: 'directory', parentId: 'v_sys_arch' },
  { id: 'v_sys_com', name: 'COM', type: 'directory', parentId: 'system' },
  { id: 'v_defrag_exe', name: 'DEFRAG.EXE', type: 'file', parentId: 'system', content: 'BINARY_DEFRAG_V1.0' },
  { id: 'v_sys_crit', name: 'CRITICAL', type: 'directory', parentId: 'system' },
  { id: 'v_sys_net', name: 'NET', type: 'directory', parentId: 'system' },
  { id: 'v_temp', name: 'TEMP', type: 'directory', parentId: 'vespera' },
  { id: 'v_spool', name: 'SPOOL', type: 'directory', parentId: 'vespera' },
  { id: 'v_media', name: 'MEDIA', type: 'directory', parentId: 'vespera' },
  { id: 'v_fonts', name: 'FONTS', type: 'directory', parentId: 'vespera' },
  { id: 'v_bin', name: 'BIN', type: 'directory', parentId: 'vespera' },
  { id: 'v_etc', name: 'ETC', type: 'directory', parentId: 'vespera' },
  { id: 'v_lib', name: 'LIB', type: 'directory', parentId: 'vespera' },
  { id: 'v_inc', name: 'INCLUDE', type: 'directory', parentId: 'vespera' },
  { id: 'v_src', name: 'SRC', type: 'directory', parentId: 'vespera' },
  { id: 'v_net_conf', name: 'CONF', type: 'directory', parentId: 'v_sys_net' },
  { id: 'v_net_serv', name: 'SERV', type: 'directory', parentId: 'v_sys_net' },
  // CONFIG Files
  { id: 'f_drivers_ini', name: 'DRIVERS.INI', type: 'file', parentId: 'v_config', content: '' },
  { id: 'f_net_cfg', name: 'NET.CFG', type: 'file', parentId: 'v_config', content: '' },
  { id: 'f_boot_log', name: 'BOOT.LOG', type: 'file', parentId: 'v_config', content: '' },
  { id: 'f_system_ini', name: 'SYSTEM.INI', type: 'file', parentId: 'v_config', content: '' },
  { id: 'f_protocol_ini', name: 'PROTOCOL.INI', type: 'file', parentId: 'v_config', content: '' },
  { id: 'f_win_ini', name: 'WIN.INI', type: 'file', parentId: 'v_config', content: '' },
  { id: 'f_config_sys', name: 'CONFIG.SYS', type: 'file', parentId: 'v_config', content: '' },
  { id: 'f_autoexec_bat', name: 'AUTOEXEC.BAT', type: 'file', parentId: 'v_config', content: '' },
  { id: 'f_network_inf', name: 'NETWORK.INF', type: 'file', parentId: 'v_config', content: '' },
  // DRIVERS Files
  { id: 'f_vsp_ide', name: 'VSP_IDE.SYS', type: 'file', parentId: 'v_drivers', content: '' },
  { id: 'f_modem_96', name: 'MODEM_96.DLL', type: 'file', parentId: 'v_drivers', content: '' },
  { id: 'f_sound_bl', name: 'SOUND_BL.VXD', type: 'file', parentId: 'v_drivers', content: '' },
  { id: 'f_display_drv', name: 'DISPLAY.DRV', type: 'file', parentId: 'v_drivers', content: '' },
  { id: 'f_keyboard_drv', name: 'KEYBOARD.DRV', type: 'file', parentId: 'v_drivers', content: '' },
  { id: 'f_mouse_sys', name: 'MOUSE.SYS', type: 'file', parentId: 'v_drivers', content: '' },
  { id: 'f_cdrom_sys', name: 'CDROM.SYS', type: 'file', parentId: 'v_drivers', content: '' },
  { id: 'f_vga_lib', name: 'VGA_LIB.DLL', type: 'file', parentId: 'v_drivers', content: '' },
  { id: 'f_s3_drv', name: 'S3_DRV.SYS', type: 'file', parentId: 'v_drivers', content: '' },
  { id: 'f_ne2000', name: 'NE2000.VXD', type: 'file', parentId: 'v_drivers', content: '' },
  // SYSTEM Files
  { id: 'f_hal_dll', name: 'HAL.DLL', type: 'file', parentId: 'system', content: '' },
  { id: 'f_motiflib_dll', name: 'MotifLib.DLL', type: 'file', parentId: 'system', content: '' },
  { id: 'f_gdi_dll', name: 'GDI.DLL', type: 'file', parentId: 'system', content: '' },
  { id: 'f_mmsystem_dll', name: 'MMSYSTEM.DLL', type: 'file', parentId: 'system', content: '' },
  { id: 'f_user_dll', name: 'USER.DLL', type: 'file', parentId: 'system', content: '' },
  { id: 'f_shell_dll', name: 'SHELL.DLL', type: 'file', parentId: 'system', content: '' },
  { id: 'f_commdlg_dll', name: 'COMMDLG.DLL', type: 'file', parentId: 'system', content: '' },
  { id: 'f_neural_bridge', name: 'NEURAL_BRIDGE.DLL', type: 'file', parentId: 'system', content: '' },
  { id: 'f_synaptic_mem', name: 'SYNAPTIC_MEM.SYS', type: 'file', parentId: 'system', content: '' },
  { id: 'f_adaptive_sched', name: 'ADAPTIVE_SCHEDULER.CFG', type: 'file', parentId: 'system', content: '' },
  // LOGS Files
  { id: 'f_install_log', name: 'INSTALL.LOG', type: 'file', parentId: 'v_logs', content: '' },
  { id: 'f_x_type_logs', name: 'X_TYPE_ANOMALIES.LOG', type: 'file', parentId: 'v_logs', content: '' },
  { id: 'f_mem_dump', name: 'MEMORY_DUMP.LOG', type: 'file', parentId: 'v_logs', content: '' },
  { id: 'f_error_log', name: 'ERROR.LOG', type: 'file', parentId: 'v_logs', content: '' },
  // More to hit 200... (Using a pattern to simulate density)
  ...Array.from({ length: 150 }).map((_, i) => ({
    id: `ext_sys_${i}`,
    name: `${Math.random().toString(36).substr(2, 5).toUpperCase()}.${['DLL','SYS','VXD','CFG','INF','DRV'][i % 6]}`,
    type: 'file',
    parentId: ['system', 'v_drivers', 'v_config', 'v_sys_com', 'v_sys_crit'][i % 5],
    content: ''
  })) as any,
  { id: 'cpl_lnk', name: 'Control Panel', type: 'shortcut', parentId: 'desktop', targetId: 'control_panel', content: 'control_panel', customIcon: RETRO_ICONS.find(i => i.id === 'sys_gear')?.url || '' },
  { id: 'help_lnk', name: 'Vespera Help', type: 'shortcut', parentId: 'desktop', targetId: 'help', content: 'help', customIcon: RETRO_ICONS.find(i => i.id === 'file_hlp')?.url || '' }
];

export function useVFS() {
  const [nodes, setNodes] = useState<VFSNode[]>(() => {
    const saved = localStorage.getItem('vespera_vfs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: if the old root is named 'Root', rename it to 'C:' and add missing default nodes
        if (parsed.length > 0 && parsed[0].id === 'root' && parsed[0].name === 'Root') {
          parsed[0].name = 'C:';
          const existingIds = new Set(parsed.map((n: VFSNode) => n.id));
          const missingNodes = DEFAULT_VFS.filter(n => !existingIds.has(n.id));
          return [...parsed, ...missingNodes];
        }
        return parsed;
      } catch (e) {
        return DEFAULT_VFS;
      }
    }
    return DEFAULT_VFS;
  });

  const [displaySettings, setDisplaySettings] = useState(() => {
    const saved = localStorage.getItem('vespera_display');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      resolution: parsed.resolution || '1024x768',
      wallpaper: parsed.wallpaper || '',
      backgroundColor: parsed.backgroundColor || '',
      taskbarTheme: parsed.taskbarTheme || 'motif',
      taskbarShowClock: parsed.taskbarShowClock !== undefined ? parsed.taskbarShowClock : true,
      clockBgColor: parsed.clockBgColor || '',
      clockTextColor: parsed.clockTextColor || '',
      clockFont: parsed.clockFont || 'font-mono',
      clockFormat: parsed.clockFormat || '24h',
      workspaceMenu: parsed.workspaceMenu || null,
      pinnedApps: parsed.pinnedApps || ['files', 'browser', 'workbench', 'analyzer', 'chat', 'control_panel', 'xtype'],
      waveBarEnabled: parsed.waveBarEnabled !== undefined ? parsed.waveBarEnabled : true,
      waveBarStyle: parsed.waveBarStyle || 'classic',
      waveBarColor: parsed.waveBarColor || '#34d399',
      waveBarBarCount: typeof parsed.waveBarBarCount === 'number' && parsed.waveBarBarCount >= 3 && parsed.waveBarBarCount <= 9 ? parsed.waveBarBarCount : 5,
      waveBarSpeed: parsed.waveBarSpeed === 'slow' || parsed.waveBarSpeed === 'fast' ? parsed.waveBarSpeed : 'normal',
      waveBarUseAlbumArt: parsed.waveBarUseAlbumArt === true,
    };
  });

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem('vespera_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_USERS;
  });

  useEffect(() => {
    localStorage.setItem('vespera_vfs', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('vespera_display', JSON.stringify(displaySettings));
  }, [displaySettings]);

  useEffect(() => {
    localStorage.setItem('vespera_users', JSON.stringify(systemUsers));
  }, [systemUsers]);

  const addSystemUser = (user: SystemUser) => {
    setSystemUsers(prev => [...prev, user]);
    // Create personal folder for the user
    const dirId = 'usr_' + Math.random().toString(36).substr(2, 6);
    setNodes(prev => [...prev, { id: dirId, name: user.username, type: 'directory', parentId: 'users' }]);
  };

  const updateSystemUser = (id: string, updates: Partial<SystemUser>) => {
    setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteSystemUser = (id: string) => {
    const userToDel = systemUsers.find(u => u.id === id);
    if (!userToDel || userToDel.username.toLowerCase() === 'admin') return;

    setSystemUsers(prev => prev.filter(u => u.id !== id));

    // Cleanup their personal directory and children
    setNodes(prev => {
      const userDir = prev.find(n => n.parentId === 'users' && n.name.toLowerCase() === userToDel.username.toLowerCase());
      if (!userDir) return prev;
      
      const toDelete = new Set([userDir.id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const n of prev) {
          if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
            toDelete.add(n.id);
            changed = true;
          }
        }
      }
      return prev.filter(n => !toDelete.has(n.id));
    });
  };

  const updateResolution = (resolution: string) => {
    setDisplaySettings((prev: any) => ({ ...prev, resolution }));
  };

  const updateWallpaper = (wallpaper: string) => {
    setDisplaySettings((prev: any) => ({ ...prev, wallpaper }));
  };

  const updateBackgroundColor = (backgroundColor: string) => {
    setDisplaySettings((prev: any) => ({ ...prev, backgroundColor }));
  };

  const updateTaskbarTheme = (taskbarTheme: string) => {
    setDisplaySettings((prev: any) => ({ ...prev, taskbarTheme }));
  };

  const updateTaskbarClock = (taskbarShowClock: boolean) => {
    setDisplaySettings((prev: any) => ({ ...prev, taskbarShowClock }));
  };

  const updateClockSettings = (settings: { clockBgColor?: string; clockTextColor?: string; clockFont?: string; clockFormat?: '12h' | '24h' }) => {
    setDisplaySettings((prev: any) => ({ ...prev, ...settings }));
  };

  const updateWorkspaceMenu = (menu: WorkspaceMenuItem[]) => {
    setDisplaySettings((prev: any) => ({ ...prev, workspaceMenu: menu }));
  };

  const updatePinnedApps = (apps: string[]) => {
    setDisplaySettings((prev: any) => ({ ...prev, pinnedApps: apps }));
  };

  const updateWaveBarSettings = (settings: {
    waveBarEnabled?: boolean;
    waveBarStyle?: string;
    waveBarColor?: string;
    waveBarBarCount?: number;
    waveBarSpeed?: string;
    waveBarUseAlbumArt?: boolean;
  }) => {
    setDisplaySettings((prev: any) => ({ ...prev, ...settings }));
  };

  const createNode = (name: string, type: FileType, parentId: string, content: string = '', targetId?: string, iconType?: string, extra?: Partial<VFSNode>) => {
    const newNode: VFSNode = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type,
      parentId,
      content: (type === 'file' || type === 'shortcut') ? content : undefined,
      targetId,
      iconType,
      ...extra,
    };
    setNodes(prev => [...prev, newNode]);
    return newNode;
  };

  /**
   * Install an application: creates an .exe node in C:\PROGRAMS and
   * an optional shortcut on the Desktop. Returns the created exe node.
   */
  const installApp = (
    exeName: string,
    displayName: string,
    version: string,
    appId: string,          // stable ID so we can find it again
    placeShortcut = true,
    shortcutIconType = 'app',
  ): VFSNode => {
    // Avoid duplicate installs
    const existing = nodes.find(n => n.id === appId);
    if (existing) return existing;

    const exeNode: VFSNode = {
      id: appId,
      name: exeName,
      type: 'file',
      parentId: 'programs',
      content: `[Application]\nName=${displayName}\nVersion=${version}\nInstalledAt=${new Date().toISOString()}`,
      isApp: true,
      appDisplayName: displayName,
      appVersion: version,
    };
    setNodes(prev => {
      // Guard against race conditions
      if (prev.find(n => n.id === appId)) return prev;
      const next = [...prev, exeNode];
      if (placeShortcut) {
        const shortcut: VFSNode = {
          id: `${appId}_lnk`,
          name: displayName,
          type: 'shortcut',
          parentId: 'desktop',
          content: appId,
          targetId: appId,
          iconType: shortcutIconType,
        };
        next.push(shortcut);
      }
      return next;
    });
    return exeNode;
  };

  /**
   * Uninstall: remove the exe AND any desktop shortcuts that point to it.
   */
  const uninstallApp = (appId: string) => {
    setNodes(prev => prev.filter(n => {
      if (n.id === appId) return false;           // the exe itself
      if (n.type === 'shortcut' && (n.content === appId || n.targetId === appId)) return false; // shortcuts
      return true;
    }));
  };

  const renameNode = (id: string, newName: string) => {
    setNodes(prev => prev.map(node => node.id === id ? { ...node, name: newName } : node));
  };

  const updateFileContent = (id: string, newContent: string) => {
    setNodes(prev => prev.map(node => node.id === id && node.type === 'file' ? { ...node, content: newContent } : node));
  };

  const updateCustomIcon = (id: string, customIcon: string) => {
    setNodes(prev => prev.map(node => node.id === id ? { ...node, customIcon } : node));
  };

  const deleteNode = (id: string) => {
    setNodes(prev => {
      const idsToDelete = new Set<string>([id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const node of prev) {
          if (node.parentId && idsToDelete.has(node.parentId) && !idsToDelete.has(node.id)) {
            idsToDelete.add(node.id);
            changed = true;
          }
        }
      }
      return prev.filter(node => !idsToDelete.has(node.id));
    });
  };

  const getChildren = (parentId: string) => {
    return nodes.filter(node => node.parentId === parentId);
  };

  const getNode = (id: string) => {
    return nodes.find(node => node.id === id);
  };

  return { nodes, displaySettings, systemUsers, addSystemUser, updateSystemUser, deleteSystemUser, updateResolution, updateWallpaper, updateBackgroundColor, updateTaskbarTheme, updateTaskbarClock, updateClockSettings, updateWorkspaceMenu, updatePinnedApps, updateWaveBarSettings, createNode, renameNode, updateFileContent, deleteNode, getChildren, getNode, updateCustomIcon, installApp, uninstallApp };
}
