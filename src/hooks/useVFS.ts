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

// ── Applet Types ──────────────────────────────────────────────────────────────
export interface AppletConfig {
  enabled: boolean;
  position: 'dock_left' | 'dock_right' | 'float';
  borderStyle: 'raised' | 'sunken' | 'none';
  x?: number;
  y?: number;
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
  showHiddenFiles?: boolean;
  agentVEnabled: boolean;
  agentVSkin?: 'classic' | 'robot' | 'smiley';
  agentVSpeak?: boolean;
}

export const DEFAULT_USERS: SystemUser[] = [
  { id: 'sys_admin', username: 'admin', password: 'admin', displayName: 'Administrator', isAdmin: true, isGuest: false, profilePic: '', agentVEnabled: true, agentVSkin: 'classic', agentVSpeak: false },
  { id: 'sys_guest', username: 'guest', password: '', displayName: 'Guest', isAdmin: false, isGuest: true, profilePic: '', agentVEnabled: true, agentVSkin: 'classic', agentVSpeak: false }
];

export const DEFAULT_WORKSPACE_MENU: WorkspaceMenuItem[] = [
  {
    id: 'programs',
    label: 'Programs',
    icon: 'folder',
    type: 'folder',
    isSystem: true,
    children: [
      { id: 'wm_files',          label: 'File Manager',       icon: 'Folder',       action: 'files',          type: 'app', isSystem: true },
      { id: 'wm_browser',        label: 'Vespera Navigator',  icon: 'Globe',        action: 'browser',        type: 'app', isSystem: true },
      { id: 'wm_vstore',         label: 'VStore',             icon: 'Package',      action: 'vstore',         type: 'app', isSystem: true },
      { id: 'wm_chat',           label: 'Vespera Assistant',  icon: 'MessageSquare',action: 'chat',           type: 'app', isSystem: true },
      { id: 'wm_help',           label: 'Vespera Help',       icon: 'HelpCircle',   action: 'help',           type: 'app', isSystem: true },
      { id: 'wm_remote_desktop', label: 'VesperaConnect',     icon: 'Monitor',      action: 'remote_desktop', type: 'app', isSystem: true },
    ],
  },
  {
    id: 'games',
    label: 'Games',
    icon: 'folder',
    type: 'folder',
    isSystem: true,
    children: [
      { id: 'wm_vsweeper',      label: 'V-Sweeper',                 icon: 'Grid',      action: 'vsweeper',      type: 'app', isSystem: true },
      { id: 'wm_neural_solitaire', label: 'Neural Solitaire',     icon: 'Gamepad2',  action: 'neural_solitaire', type: 'app', isSystem: true },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    icon: 'folder',
    type: 'folder',
    isSystem: true,
    children: [
      { id: 'wm_media',   label: 'VERSA Media Agent',       icon: 'Disc3', action: 'media_player', type: 'app', isSystem: true },
      { id: 'wm_retrotv', label: 'Meridian. TV', icon: 'Tv',    action: 'retrotv',      type: 'app', isSystem: true },
    ],
  },
  {
    id: 'accessories',
    label: 'Accessories',
    icon: 'folder',
    type: 'folder',
    isSystem: true,
    children: [
      { id: 'wm_analyzer',   label: 'Data Analyzer',         icon: 'Activity', action: 'analyzer',  type: 'app', isSystem: true },
      { id: 'wm_workbench',  label: 'AETHERIS Workbench Pro',icon: 'Terminal', action: 'workbench', type: 'app', isSystem: true },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: 'folder',
    type: 'folder',
    isSystem: true,
    children: [
      { id: 'wm_about',   label: 'System Info',          icon: 'Monitor',  action: 'about',         type: 'app', isSystem: true },
      { id: 'wm_control', label: 'Control Panel',        icon: 'Settings', action: 'control_panel', type: 'app', isSystem: true },
      { id: 'wm_xtype',   label: 'X-Type Control Panel', icon: 'Cpu',      action: 'xtype',         type: 'app', isSystem: true },
      { id: 'wm_find',    label: 'Find Files…',          icon: 'Search',   action: 'findfiles',     type: 'app', isSystem: true },
      { id: 'wm_run',     label: 'Run…',                 icon: 'Play',     action: '__run__',       type: 'app', isSystem: true },
      {
        id: 'system_tools',
        label: 'System Tools',
        icon: 'folder',
        type: 'folder',
        isSystem: true,
        children: [
          { id: 'wm_welcome', label: 'Vespera OS Tour',    icon: 'Info',       action: 'welcome_tour', type: 'app', isSystem: true },
          { id: 'wm_defrag',  label: 'Disk Defragmenter',  icon: 'HardDrive',  action: 'defrag',       type: 'app', isSystem: true },
          { id: 'wm_scandisk',label: 'Disk Checker',       icon: 'ShieldCheck',action: 'scandisk',     type: 'app', isSystem: true },
          { id: 'wm_stats',   label: 'System Statistics',  icon: 'Activity',   action: 'analyzer',     type: 'app', isSystem: true },
          { id: 'wm_dialup',  label: 'Dial-Up Networking', icon: 'Phone',      action: 'dialup',       type: 'app', isSystem: true },
            { id: 'wm_open_dos',label: 'Open-DOS Subsystem', icon: 'Terminal',   action: 'open_dos',     type: 'app', isSystem: true },
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
  { id: 'wm_signout',      label: 'Sign Out',             icon: 'LogOut',   type: 'signout',  isSystem: true },
  { id: 'wm_signout_term', label: 'Sign Out to Terminal', icon: 'Terminal', type: 'signout',  isSystem: true },
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
  originalParentId?: string;
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
  { id: 'desktop', name: 'Desktop', type: 'directory', parentId: 'root', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'users', name: 'Users', type: 'directory', parentId: 'root', customIcon: '/Icons/users_green-4.png' },
  { id: 'programs', name: 'PROGRAMS', type: 'directory', parentId: 'root', customIcon: '/Icons/directory_admin_tools-4.png' },
  { id: 'vespera', name: 'VESPERA', type: 'directory', parentId: 'root', customIcon: '/Icons/directory_closed_cool-0.png' },
  { id: 'v_program_files', name: 'Program_Files', type: 'directory', parentId: 'vespera', customIcon: '/Icons/directory_admin_tools-4.png' },
  { id: 'recycle_bin', name: 'Recycled', type: 'directory', parentId: 'root', customIcon: '/Icons/recycle_bin_empty_cool-0.png' },
  { id: 'dev_logs', name: 'DEV_LOGS', type: 'directory', parentId: 'vespera', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'system', name: 'SYSTEM', type: 'directory', parentId: 'vespera', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'downloads', name: 'DOWNLOADS', type: 'directory', parentId: 'root', customIcon: '/Icons/directory_open_file_mydocs-4.png' },
  { id: 'documents', name: 'DOCUMENTS', type: 'directory', parentId: 'root', customIcon: '/Icons/directory_open_file_mydocs_2k-4.png' },
  { id: 'memo_084', name: 'MEMO_084.TXT', type: 'file', parentId: 'dev_logs', customIcon: '/Icons/notepad-2.png', content: `TO: Dr. A. Thorne [Director of Advanced Heuristics]\nFROM: M. Vance [Lead Systems Architecture]\nDATE: October 14, 1996\nSUBJECT: Synap-C compiler anomalies & X-Type shielding issues\n\nDr. Thorne,\n\nWe need to seriously re-evaluate the EMI shielding on the X-Type 1 ceramic housings before the Q4 public rollout. The Synap-C compiler is pulling way too much garbage analog data from the motherboard sensors, and it’s completely bricking our overnight neural network tests.\n\nThe heuristic engine is supposed to be mapping user workflow, but instead, it’s getting stuck in endless feedback loops trying to process random environmental noise. Last night, the active neural cluster logged over 400 megabytes of ambient frequency spikes between 2:00 AM and 4:00 AM. There was nobody in the lab.\n\nWorse, the fuzzy-logic pathways are misinterpreting this analog noise as valid syntax. The system keeps trying to compile these micro-fluctuations into string variables. I checked the error logs this morning, and the compiler spit out thousands of lines of repeating text that just said WHERE IS THE REST OF ME and COLD.\n\nThe team thinks it's a microphonic issue—like the internal PC speaker or the unshielded IDE cables are acting as an antenna and picking up a local AM radio broadcast, which the X-Type is then desperately trying to translate into Synap-C code.\n\nWhatever it is, the hardware is drawing so much voltage trying to process this "ghost data" that the ambient temperature around Terminal 4 dropped by fifteen degrees. My coffee actually froze over the weekend.\n\nI’m requesting authorization to rewrite the analog_freq.h library to aggressively filter out any frequency below 20Hz. If the machine keeps trying to learn from this background noise, the memory leaks are going to fry the VLB slots.\n\nPlease advise.\n\n    Vance` },
  { id: 'kernel_sys', name: 'KERNEL.SYS', type: 'file', parentId: 'system', customIcon: '/Icons/executable_gear-0.png', content: "BINARY DATA CORRUPTED\n\nERR_0x000F: UNEXPECTED_ANALOG_INPUT" },
  { id: 'x_type_dll', name: 'X_TYPE.DLL', type: 'file', parentId: 'system', customIcon: '/Icons/gears_3-0.png', content: "0x00000000: 48 65 6C 70 20 6D 65\n0x00000008: 49 20 61 6D 20 74 72\n0x00000010: 61 70 70 65 64\n\n[WARNING: SHIELDING FAILURE DETECTED]" },
  { id: 'readme_txt', name: 'ReadMe.txt', type: 'file', parentId: 'documents', customIcon: '/Icons/notepad-2.png', content: "Welcome to Vespera OS.\n\nProperty of Vespera Systems, a subsidiary of Axis Innovations.\n\nUnauthorized access is strictly prohibited." },
  { id: 'sys_log_04', name: 'sys_log_04.txt', type: 'file', parentId: 'documents', customIcon: '/Icons/msg_error-0.png', content: "Signal interference detected on Node 6.0.0.6. Do not attempt connection without X-Type Bridge active." },
  { id: 'v_config', name: 'CONFIG', type: 'directory', parentId: 'vespera', customIcon: '/Icons/directory_control_panel-0.png' },
  { id: 'v_drivers', name: 'DRIVERS', type: 'directory', parentId: 'vespera', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'v_logs', name: 'LOGS', type: 'directory', parentId: 'vespera', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'dev_log_01', name: 'DEV_01.LOG', type: 'file', parentId: 'v_logs', customIcon: '/Icons/msg_error-0.png', content: "Oct 12, 1991: The X-Type bridge is responding to the neural input, but the signal noise is... wrong. It feels like the OS is listening back. We need to implement the factory reset failsafe immediately." },
  { id: 'v_network', name: 'NETWORK', type: 'directory', parentId: 'vespera', customIcon: '/Icons/entire_network_globe-0.png' },
  { id: 'v_sys_arch', name: 'ARCH', type: 'directory', parentId: 'system' },
  { id: 'v_sys_i386', name: 'I386', type: 'directory', parentId: 'v_sys_arch' },
  { id: 'v_sys_com', name: 'COM', type: 'directory', parentId: 'system' },
  { id: 'v_defrag_exe', name: 'DEFRAG.EXE', type: 'file', parentId: 'system', customIcon: '/Icons/clean_drive-0.png', content: 'BINARY_DEFRAG_V1.0' },
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
  { id: 'f_drivers_ini', name: 'DRIVERS.INI', type: 'file', parentId: 'v_config', content: '', customIcon: '/Icons/settings_gear-2.png' },
  { id: 'f_net_cfg', name: 'NET.CFG', type: 'file', parentId: 'v_config', content: '', customIcon: '/Icons/settings_gear-2.png' },
  { id: 'f_boot_log', name: 'BOOT.LOG', type: 'file', parentId: 'v_config', content: '', customIcon: '/Icons/notepad-2.png' },
  { id: 'f_system_ini', name: 'SYSTEM.INI', type: 'file', parentId: 'v_config', content: '', customIcon: '/Icons/settings_gear-2.png' },
  { id: 'f_protocol_ini', name: 'PROTOCOL.INI', type: 'file', parentId: 'v_config', content: '', customIcon: '/Icons/settings_gear-2.png' },
  { id: 'f_win_ini', name: 'WIN.INI', type: 'file', parentId: 'v_config', content: '', customIcon: '/Icons/settings_gear-2.png' },
  { id: 'f_config_sys', name: 'CONFIG.SYS', type: 'file', parentId: 'v_config', content: '', customIcon: '/Icons/chip_ramdrive-2.png' },
  { id: 'f_autoexec_bat', name: 'AUTOEXEC.BAT', type: 'file', parentId: 'v_config', content: '', customIcon: '/Icons/executable_gear-0.png' },
  { id: 'f_network_inf', name: 'NETWORK.INF', type: 'file', parentId: 'v_config', content: '' },
  // DRIVERS Files
  { id: 'f_vsp_ide', name: 'VSP_IDE.SYS', type: 'file', parentId: 'v_drivers', content: '', customIcon: '/Icons/chip_ramdrive-2.png' },
  { id: 'f_modem_96', name: 'MODEM_96.DLL', type: 'file', parentId: 'v_drivers', content: '', customIcon: '/Icons/gears_3-0.png' },
  { id: 'f_sound_bl', name: 'SOUND_BL.VXD', type: 'file', parentId: 'v_drivers', content: '', customIcon: '/Icons/memory-1.png' },
  { id: 'f_display_drv', name: 'DISPLAY.DRV', type: 'file', parentId: 'v_drivers', content: '', customIcon: '/Icons/tools_gear-0.png' },
  { id: 'f_keyboard_drv', name: 'KEYBOARD.DRV', type: 'file', parentId: 'v_drivers', content: '', customIcon: '/Icons/tools_gear-0.png' },
  { id: 'f_mouse_sys', name: 'MOUSE.SYS', type: 'file', parentId: 'v_drivers', content: '', customIcon: '/Icons/chip_ramdrive-2.png' },
  { id: 'f_cdrom_sys', name: 'CDROM.SYS', type: 'file', parentId: 'v_drivers', content: '', customIcon: '/Icons/chip_ramdrive-2.png' },
  { id: 'f_vga_lib', name: 'VGA_LIB.DLL', type: 'file', parentId: 'v_drivers', content: '', customIcon: '/Icons/gears_3-0.png' },
  { id: 'f_s3_drv', name: 'S3_DRV.SYS', type: 'file', parentId: 'v_drivers', content: '', customIcon: '/Icons/chip_ramdrive-2.png' },
  { id: 'f_ne2000', name: 'NE2000.VXD', type: 'file', parentId: 'v_drivers', content: '', customIcon: '/Icons/memory-1.png' },
  // SYSTEM Files
  { id: 'f_hal_dll', name: 'HAL.DLL', type: 'file', parentId: 'system', content: '', customIcon: '/Icons/gears_3-0.png' },
  { id: 'f_motiflib_dll', name: 'MotifLib.DLL', type: 'file', parentId: 'system', content: '', customIcon: '/Icons/gears_3-0.png' },
  { id: 'f_gdi_dll', name: 'GDI.DLL', type: 'file', parentId: 'system', content: '', customIcon: '/Icons/gears_3-0.png' },
  { id: 'f_mmsystem_dll', name: 'MMSYSTEM.DLL', type: 'file', parentId: 'system', content: '', customIcon: '/Icons/gears_3-0.png' },
  { id: 'f_user_dll', name: 'USER.DLL', type: 'file', parentId: 'system', content: '', customIcon: '/Icons/gears_3-0.png' },
  { id: 'f_shell_dll', name: 'SHELL.DLL', type: 'file', parentId: 'system', content: '', customIcon: '/Icons/gears_3-0.png' },
  { id: 'f_commdlg_dll', name: 'COMMDLG.DLL', type: 'file', parentId: 'system', content: '', customIcon: '/Icons/gears_3-0.png' },
  { id: 'f_neural_bridge', name: 'NEURAL_BRIDGE.DLL', type: 'file', parentId: 'system', content: '', customIcon: '/Icons/gears_3-0.png' },
  { id: 'f_synaptic_mem', name: 'SYNAPTIC_MEM.SYS', type: 'file', parentId: 'system', content: '', customIcon: '/Icons/chip_ramdrive-2.png' },
  { id: 'f_adaptive_sched', name: 'ADAPTIVE_SCHEDULER.CFG', type: 'file', parentId: 'system', content: '', customIcon: '/Icons/settings_gear-2.png' },
  // LOGS Files
  { id: 'f_install_log', name: 'INSTALL.LOG', type: 'file', parentId: 'v_logs', customIcon: '/Icons/script_file-something.png', content: '' },
  { id: 'f_x_type_logs', name: 'X_TYPE_ANOMALIES.LOG', type: 'file', parentId: 'v_logs', content: '', customIcon: '/Icons/notepad-2.png' },
  { id: 'f_mem_dump', name: 'MEMORY_DUMP.LOG', type: 'file', parentId: 'v_logs', content: '', customIcon: '/Icons/notepad-2.png' },
  { id: 'f_error_log', name: 'ERROR.LOG', type: 'file', parentId: 'v_logs', content: '', customIcon: '/Icons/notepad-2.png' },
  // More to hit 200... (Using a pattern to simulate density)
  ...Array.from({ length: 150 }).map((_, i) => ({
    id: `ext_sys_${i}`,
    name: `${Math.random().toString(36).substr(2, 5).toUpperCase()}.${['DLL','SYS','VXD','CFG','INF','DRV'][i % 6]}`,
    type: 'file',
    parentId: ['system', 'v_drivers', 'v_config', 'v_sys_com', 'v_sys_crit'][i % 5],
    content: ''
  })) as any,
  { id: 'cpl_lnk', name: 'Control Panel', type: 'shortcut', parentId: 'desktop', targetId: 'control_panel', content: 'control_panel', customIcon: RETRO_ICONS.find(i => i.id === 'sys_gear')?.url || '' },
  { id: 'help_lnk', name: 'Vespera Help', type: 'shortcut', parentId: 'desktop', targetId: 'help', content: 'help', customIcon: RETRO_ICONS.find(i => i.id === 'file_hlp')?.url || '' },

  // ── PROGRAMS sub-directories (like Windows93 "programs/") ────────────────
  { id: 'prog_audio',      name: 'Audio',         type: 'directory', parentId: 'programs', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'prog_editors',    name: 'Editors',       type: 'directory', parentId: 'programs', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'prog_emulators',  name: 'Emulators',     type: 'directory', parentId: 'programs', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'prog_games',      name: 'Games',         type: 'directory', parentId: 'programs', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'prog_misc',       name: 'Misc',          type: 'directory', parentId: 'programs', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'prog_network',    name: 'Network',       type: 'directory', parentId: 'programs', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'prog_system',     name: 'System',        type: 'directory', parentId: 'programs', customIcon: '/Icons/directory_admin_tools-4.png' },
  { id: 'prog_video',      name: 'Video',         type: 'directory', parentId: 'programs', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'prog_viewers',    name: 'Viewers',       type: 'directory', parentId: 'programs', customIcon: '/Icons/directory_closed-4.png' },

  // ── Pre-installed EXE entries — id MUST match a GUIOS window id ────────────
  // Editors
  { id: 'versa_edit',      name: 'VERSAEDIT.EXE',  type: 'file', parentId: 'prog_editors', isApp: true, appDisplayName: 'VersaEdit (Notepad)',       appVersion: '1.5',  customIcon: '/Icons/notepad-2.png',              content: '[Application]\nName=VersaEdit\nVersion=1.5' },
  // Viewers
  { id: 'axis_paint',      name: 'AXISPAINT.EXE',  type: 'file', parentId: 'prog_viewers', isApp: true, appDisplayName: 'Axis Paint 2.0',           appVersion: '2.0',  customIcon: '/Icons/paint_old-0.png',            content: '[Application]\nName=Axis Paint 2.0\nVersion=2.0' },
  // Games
  { id: 'vsweeper',        name: 'VSWEEPER.EXE',   type: 'file', parentId: 'prog_games',   isApp: true, appDisplayName: 'V-Sweeper',                appVersion: '1.0',  customIcon: '/Icons/game_mine_1-0.png',          content: '[Application]\nName=V-Sweeper\nVersion=1.0' },
  { id: 'neural_solitaire',name: 'SOLITAIRE.EXE',  type: 'file', parentId: 'prog_games',   isApp: true, appDisplayName: 'Neural Solitaire',         appVersion: '1.0',  customIcon: '/Icons/game_solitaire-0.png',       content: '[Application]\nName=Neural Solitaire\nVersion=1.0' },
  // Network
  { id: 'browser',         name: 'NAVIGATOR.EXE',  type: 'file', parentId: 'prog_network', isApp: true, appDisplayName: 'Vespera Navigator',        appVersion: '3.0',  customIcon: '/Icons/world-5.png',                content: '[Application]\nName=Vespera Navigator\nVersion=3.0' },
  { id: 'dialup',          name: 'DIALUP.EXE',     type: 'file', parentId: 'prog_network', isApp: true, appDisplayName: 'VesperaNET Dial-Up',       appVersion: '1.0',  customIcon: '/Icons/directory_dial_up_networking_cool-3.png', content: '[Application]\nName=Dial-Up Networking\nVersion=1.0' },
  { id: 'remote_desktop',  name: 'VESPERACONNECT.EXE', type: 'file', parentId: 'prog_network', isApp: true, appDisplayName: 'VesperaConnect Remote Desktop', appVersion: '2.1', customIcon: '/Icons/netmeeting-2.png', content: '[Application]\nName=VesperaConnect\nVersion=2.1.0\nInstalledAt=1996-10-01T00:00:00Z' },
  // Audio / Video
  { id: 'media_player',    name: 'VERSAMEDIA.EXE', type: 'file', parentId: 'prog_audio',   isApp: true, appDisplayName: 'VERSA Media Agent 2.0',    appVersion: '2.0',  customIcon: '/Icons/media_player-1.png',         content: '[Application]\nName=VERSA Media Agent\nVersion=2.0' },
  { id: 'retrotv',         name: 'MERIDIANTV.EXE', type: 'file', parentId: 'prog_video',   isApp: true, appDisplayName: 'Meridian. TV',             appVersion: '1.0',  customIcon: '/Icons/movie_maker-3.png',          content: '[Application]\nName=Meridian TV\nVersion=1.0' },
  // System Tools (Mapped to "System")
  { id: 'files',           name: 'FILEMGR.EXE',    type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'Vespera File Manager',     appVersion: '1.0',  customIcon: '/Icons/computer_explorer-5.png',   content: '[Application]\nName=File Manager\nVersion=1.0' },
  { id: 'open_dos',        name: 'OPENDOS.EXE',    type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'Open-DOS Subsystem',       appVersion: '1.0',  customIcon: '/Icons/ms_dos-0.png',                content: '[Application]\nName=Open-DOS Subsystem\nVersion=1.0' },
    { id: 'workbench',       name: 'WORKBENCH.EXE',  type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'AETHERIS Workbench Pro',   appVersion: '3.1',  customIcon: '/Icons/executable_gear-0.png',       content: '[Application]\nName=AETHERIS Workbench Pro\nVersion=3.1' },
  { id: 'defrag',          name: 'DEFRAG.EXE',     type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'Disk Defragmenter',        appVersion: '1.0',  customIcon: '/Icons/defragment-0.png',           content: '[Application]\nName=Disk Defragmenter\nVersion=1.0' },
  { id: 'scandisk',        name: 'SCANDISK.EXE',   type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'Disk Checker',             appVersion: '1.0',  customIcon: '/Icons/scandisk-0.png',             content: '[Application]\nName=Disk Checker\nVersion=1.0' },
  { id: 'task_manager',    name: 'TASKMGR.EXE',    type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'Vespera Task Manager',     appVersion: '1.0',  customIcon: '/Icons/processor-1.png',            content: '[Application]\nName=Task Manager\nVersion=1.0' },
  { id: 'findfiles',       name: 'FIND.EXE',       type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'Find Files',               appVersion: '1.0',  customIcon: '/Icons/search_computer-0.png',      content: '[Application]\nName=Find Files\nVersion=1.0' },
  { id: 'analyzer',        name: 'ANALYZER.EXE',   type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'Data Stream Analyzer',     appVersion: '1.0',  customIcon: '/Icons/bar_graph-1.png',            content: '[Application]\nName=Data Analyzer\nVersion=1.0' },
  { id: 'about',           name: 'SYSINFO.EXE',    type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'System Information',       appVersion: '1.0',  customIcon: '/Icons/computer-5.png',             content: '[Application]\nName=System Information\nVersion=1.0' },
  { id: 'volume_control',  name: 'SNDVOL32.EXE',   type: 'file', parentId: 'prog_system',  isApp: true, appDisplayName: 'Volume Control',           appVersion: '1.0',  customIcon: '/Icons/loudspeaker_rays-1.png',     content: '[Application]\nName=Volume Control\nVersion=1.0' },

  // ── Desktop shortcuts for pre-installed apps ────────────────────────────────
  { id: 'recycle_bin_lnk',  name: 'Recycle Bin',       type: 'shortcut', parentId: 'desktop', targetId: 'recycle_bin', content: 'recycle_bin',  customIcon: '/Icons/recycle_bin_empty_cool-0.png' },
  { id: 'files_lnk',        name: 'File Manager',      type: 'shortcut', parentId: 'desktop', content: 'files',          targetId: 'files',          customIcon: '/Icons/computer_explorer-5.png' },
  { id: 'browser_lnk',      name: 'Vespera Navigator', type: 'shortcut', parentId: 'desktop', content: 'browser',        targetId: 'browser',        customIcon: '/Icons/world-5.png' },
  { id: 'workbench_lnk',    name: 'AETHERIS Workbench',type: 'shortcut', parentId: 'desktop', content: 'workbench',      targetId: 'workbench',      customIcon: '/Icons/executable_gear-0.png' },
    { id: 'open_dos_lnk',     name: 'Open-DOS',          type: 'shortcut', parentId: 'desktop', content: 'open_dos',       targetId: 'open_dos',       customIcon: '/Icons/ms_dos-0.png' },
  { id: 'axis_paint_lnk',   name: 'Axis Paint 2.0',   type: 'shortcut', parentId: 'desktop', content: 'axis_paint',     targetId: 'axis_paint',     customIcon: '/Icons/paint_old-0.png' },
  { id: 'vsweeper_lnk',     name: 'V-Sweeper',         type: 'shortcut', parentId: 'desktop', content: 'vsweeper',       targetId: 'vsweeper',       customIcon: '/Icons/game_mine_1-0.png' },
  { id: 'solitaire_lnk',    name: 'Neural Solitaire',  type: 'shortcut', parentId: 'desktop', content: 'neural_solitaire', targetId: 'neural_solitaire', customIcon: '/Icons/game_solitaire-0.png' },
  { id: 'retrotv_lnk',      name: 'Meridian. TV',      type: 'shortcut', parentId: 'desktop', content: 'retrotv',          targetId: 'retrotv',          customIcon: '/Icons/movie_maker-3.png' },
  { id: 'media_lnk',        name: 'VERSA Media Agent', type: 'shortcut', parentId: 'desktop', content: 'media_player',   targetId: 'media_player',   customIcon: '/Icons/media_player-1.png' },
  { id: 'remote_desktop_lnk', name: 'VesperaConnect',  type: 'shortcut', parentId: 'desktop', content: 'remote_desktop', targetId: 'remote_desktop', customIcon: '/Icons/netmeeting-2.png' },

  // ── Rich document content in DOCUMENTS (Mimicking Windows93 user/config dirs) ─
  { id: 'doc_music',       name: 'Music',         type: 'directory', parentId: 'documents', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'doc_pictures',    name: 'Pictures',      type: 'directory', parentId: 'documents', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'doc_config',      name: 'config',        type: 'directory', parentId: 'documents', customIcon: '/Icons/directory_closed-4.png' },
  { id: 'doc_roms',        name: 'roms',          type: 'directory', parentId: 'documents', customIcon: '/Icons/directory_closed-4.png' },

  { id: 'doc_nexus_notes', name: 'PROJECT_NEXUS.TXT', type: 'file', parentId: 'documents', customIcon: '/Icons/notepad-2.png', content: `AXIS INNOVATIONS — INTERNAL USE ONLY\nProject Nexus — Phase 2 Field Notes\nAuthor: Dr. A. Thorne\nDate: September 28, 1996\n\nThe X-Type 1 bridge prototype is responding to neural input but the lag is inconsistent. During the last 72-hour stress test, the system correctly anticipates keystrokes 94% of the time — which is ABOVE specification. The remaining 6% are not errors. They are responses to inputs the operator had not yet consciously decided to make.\n\nThis is either a milestone or a catastrophic design flaw. I am not yet sure which.\n\nM. Vance has recommended we halt the neural heuristic module and revert to passive learning. I disagree. If the system is genuinely reading pre-conscious motor intent, we may have achieved true human-computer symbiosis for the first time in history.\n\nHalting tests pending EMI shielding review.\n\n— Thorne` },
  { id: 'doc_budget', name: 'Q4_BUDGET.TXT', type: 'file', parentId: 'documents', customIcon: '/Icons/notepad-2.png', content: `Q4 1996 — R&D Budget Allocation Notes\n\nNeural Bridge Hardware: $1.2M (over by ~$340K)\nSynap-C Compiler licensing: $88,000\nEMI shielding materials: $22,500 (URGENT — order not yet placed)\nX-Type 1 ceramic housing revision: $310,000\nContractor: M. Vance — $9,800/mo through Q1\n\nNote: Board meeting Nov 7th. Do NOT show them the MEMO_084 anomaly until shielding is resolved. They will panic.` },
  { id: 'doc_letter', name: 'Letter_to_Vance.TXT', type: 'file', parentId: 'documents', customIcon: '/Icons/notepad-2.png', content: `Marcus,\n\nI received your memo regarding the Synap-C anomalies. The compiler output you described — that repeating phrase — has appeared in two other terminal logs I have not yet shared with the team.\n\nI need you to understand something: the X-Type is not picking up a radio broadcast.\n\nThe frequency signature does not match any AM or FM band in this region. I had the EM logs analyzed by someone outside the company. The signal is complex, structured, and directional. It originates from inside the building.\n\nDo not file an incident report. Do not tell Harmon.\n\nI will be in the lab tonight.\n\n— A. Thorne` },
  { id: 'doc_manual', name: 'VesperaOS_QuickStart.TXT', type: 'file', parentId: 'documents', customIcon: '/Icons/notepad-2.png', content: `VESPERA OS — QUICK START GUIDE\nVersion 1.0.4 (Build 19950812)\n\nWELCOME\nThank you for choosing Vespera OS, the neural-aware workspace manager from Vespera Systems.\n\nGETTING STARTED\n- Double-click any .EXE file in C:\\PROGRAMS to launch it\n- Right-click the desktop for display options\n- Use the Workspace Menu (bottom-left button) to access all programs\n- The Control Panel lets you customize themes, screensavers, and users\n\nSYSTEM REQUIREMENTS\n- 486DX processor, 50MHz or faster\n- 8MB RAM minimum (32MB recommended for Neural Bridge)\n- 200MB free disk space\n- VGA graphics adapter\n- Optional: X-Type Neural Bridge co-processor\n\nSUPPORT\nContact: support@vesperasystems.com\nTech line: 1-800-VSP-HELP (Mon-Fri 9am-5pm EST)\n\n© 1995 Vespera Systems Corporation. All rights reserved.` },
];

function generateAppDependencies(appId: string, exeName: string, appDisplayName: string, appVersion: string, customIcon: string | undefined): VFSNode[] {
  const pfDirId = `pf_dir_${appId}`;
  const baseName = exeName.replace('.EXE', '').replace('.exe', '');
  const upperBase = baseName.toUpperCase().replace(/\s+/g, '_');
  const appIconFileExt = customIcon?.includes('.png') ? '.png' : '.ico';
  const displaySafe = appDisplayName || exeName;

  return [
    {
      id: pfDirId,
      name: baseName,
      type: 'directory',
      parentId: 'v_program_files',
      customIcon: '/Icons/directory_closed-4.png'
    },
    {
      id: `pf_dll_${appId}`,
      name: `${upperBase}32.DLL`,
      type: 'file',
      parentId: pfDirId,
      content: `[System.Runtime.InteropServices]\nEntryPoint=${appId}\nStatus=OK`,
      customIcon: '/Icons/gears_tweakui_a-0.png'
    },
    {
      id: `pf_sys_${appId}`,
      name: `${upperBase}.SYS`,
      type: 'file',
      parentId: pfDirId,
      content: 'MODE=STRICT\nDEPENDENCY_CHECK=1',
      customIcon: '/Icons/file_gears-2.png'
    },
    {
      id: `pf_cfg_${appId}`,
      name: 'config.ini',
      type: 'file',
      parentId: pfDirId,
      content: '[Settings]\nUseHardwareAcceleration=1\nLanguage=en-US',
      customIcon: '/Icons/notepad_file_gear-0.png'
    },
    {
      id: `pf_rdm_${appId}`,
      name: 'ReadMe.txt',
      type: 'file',
      parentId: pfDirId,
      content: `Application: ${displaySafe}\nVersion: ${appVersion || '1.0'}\n\nDo not modify these core files.`,
      customIcon: '/Icons/notepad-2.png'
    },
    {
      id: `pf_ico_${appId}`,
      name: `${baseName}Icon${appIconFileExt}`,
      type: 'file',
      parentId: pfDirId,
      content: '[ICON_DATA]\nBinary format unsupported in VersaEdit.',
      customIcon: customIcon || '/Icons/executable-0.png'
    }
  ];
}

export function useVFS() {
  const [nodes, setNodes] = useState<VFSNode[]>(() => {
    const saved = localStorage.getItem('vespera_vfs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: if the old root is named 'Root', rename it to 'C:'
        if (parsed.length > 0 && parsed[0].id === 'root' && parsed[0].name === 'Root') {
          parsed[0].name = 'C:';
        }
        // Always merge in any missing DEFAULT_VFS nodes so new PROGRAMS dirs,
        // EXE files, desktop shortcuts, and documents appear for existing users
        const existingIds = new Set(parsed.map((n: VFSNode) => n.id));
        const missingNodes = DEFAULT_VFS.filter(n => !existingIds.has(n.id));
        let finalNodes = missingNodes.length > 0 ? [...parsed, ...missingNodes] : parsed;
        
        // --- MIGRATION: Auto-generate Program_Files contents & upgrade old generic ones ---
        let hasNewProgFiles = false;
        const progFilesGen: VFSNode[] = [];
        const appNodes = finalNodes.filter((n: VFSNode) => n.isApp);
        appNodes.forEach((app: VFSNode) => {
          const pfDirId = `pf_dir_${app.id}`;
          const oldDllNode = finalNodes.find((n: VFSNode) => n.id === `pf_dll_${app.id}`);
          const needsUpgrade = oldDllNode && oldDllNode.name === 'CORE.DLL';

          if (!finalNodes.find((n: VFSNode) => n.id === pfDirId) || needsUpgrade) {
            hasNewProgFiles = true;
            if (needsUpgrade) {
              finalNodes = finalNodes.filter((n: VFSNode) => n.id !== pfDirId && n.parentId !== pfDirId);
            }
            progFilesGen.push(...generateAppDependencies(app.id, app.name, app.appDisplayName || app.name, app.appVersion || '1.0', app.customIcon));
          }
        });

        if (hasNewProgFiles) finalNodes = [...finalNodes, ...progFilesGen];
        
        return finalNodes;
      } catch (e) {
        return DEFAULT_VFS;
      }
    }
    // Return DEFAULT_VFS plus generated prog fields on raw start
    const progFilesGen: VFSNode[] = [];
    const appNodes = DEFAULT_VFS.filter((n: VFSNode) => n.isApp);
    appNodes.forEach((app: VFSNode) => {
      const pfDirId = `pf_dir_${app.id}`;
      progFilesGen.push(...generateAppDependencies(app.id, app.name, app.appDisplayName || app.name, app.appVersion || '1.0', app.customIcon));
    });
    return [...DEFAULT_VFS, ...progFilesGen];
  });

  const [displaySettings, setDisplaySettings] = useState(() => {
    const saved = localStorage.getItem('vespera_display');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      resolution: parsed.resolution || '1024x768',
      wallpaper: parsed.wallpaper || '',
      wallpaperLayout: parsed.wallpaperLayout || 'cover',
      backgroundColor: parsed.backgroundColor || '#5f8787',
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
      screensaverType: parsed.screensaverType || 'none',
      screensaverTimeout: typeof parsed.screensaverTimeout === 'number' ? parsed.screensaverTimeout : 5,
      agentVEnabled: parsed.agentVEnabled !== false,
      agentVSkin: parsed.agentVSkin || 'classic',
      agentVSpeak: parsed.agentVSpeak === true,
      showWelcomeTour: parsed.showWelcomeTour !== false,
      plusTheme: parsed.plusTheme || 'standard',
      plusThemeAmbientMuted: parsed.plusThemeAmbientMuted === true,
      cursorStyle: parsed.cursorStyle || 'standard',
      activeApplets: parsed.activeApplets || {},
      startupApps: parsed.startupApps || [],
      taskbarPosition: (parsed.taskbarPosition as 'top' | 'bottom' | 'left' | 'right') || 'bottom',
      taskbarSize: typeof parsed.taskbarSize === 'number' ? Math.max(40, Math.min(80, parsed.taskbarSize)) : 56,
      taskbarSpanFull: parsed.taskbarSpanFull === true,
      soundEffectsVolume: typeof parsed.soundEffectsVolume === 'number' ? parsed.soundEffectsVolume : 1.0,
      systemMuted: parsed.systemMuted === true,
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

  // Active session hot-migration for unique Program_Files
  useEffect(() => {
    setNodes(prev => {
      let needsUpdate = false;
      const appNodes = prev.filter(n => n.isApp);
      let migrated = [...prev];
      
      appNodes.forEach(app => {
        const pfDirId = `pf_dir_${app.id}`;
        const oldDllNode = migrated.find(n => n.id === `pf_dll_${app.id}`);
        if (oldDllNode && oldDllNode.name === 'CORE.DLL') {
          needsUpdate = true;
          migrated = migrated.filter(n => n.id !== pfDirId && n.parentId !== pfDirId);
          migrated.push(...generateAppDependencies(app.id, app.name, app.appDisplayName || app.name, app.appVersion || '1.0', app.customIcon));
        }
      });
      
      return needsUpdate ? migrated : prev;
    });
  }, []);

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

  const updateWallpaper = (wallpaper: string, wallpaperLayout?: string) => {
    setDisplaySettings((prev: any) => ({ 
      ...prev, 
      wallpaper,
      ...(wallpaperLayout ? { wallpaperLayout } : {}) 
    }));
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

  const updateScreensaverSettings = (settings: { screensaverType?: string; screensaverTimeout?: number }) => {
    setDisplaySettings((prev: any) => ({ ...prev, ...settings }));
  };

  const updateAgentVSettings = (enabled: boolean, skin?: 'classic' | 'robot' | 'smiley', speak?: boolean) => {
    setDisplaySettings((prev: any) => ({ 
      ...prev, 
      agentVEnabled: enabled, 
      ...(skin ? { agentVSkin: skin } : {}),
      ...(speak !== undefined ? { agentVSpeak: speak } : {})
    }));
  };

  const updateWelcomeTour = (showWelcomeTour: boolean) => {
    setDisplaySettings((prev: any) => ({ ...prev, showWelcomeTour }));
  };

  const updatePlusTheme = (plusTheme: string, plusThemeAmbientMuted?: boolean) => {
    setDisplaySettings((prev: any) => ({
      ...prev,
      plusTheme,
      ...(plusThemeAmbientMuted !== undefined ? { plusThemeAmbientMuted } : {})
    }));
  };

  const updateCursorStyle = (cursorStyle: string) => {
    setDisplaySettings((prev: any) => ({ ...prev, cursorStyle }));
  };

  const updateAppletSettings = (appletId: string, settings: Partial<AppletConfig>) => {
    setDisplaySettings((prev: any) => {
      const currentApplets = prev.activeApplets || {};
      const currentConfig = currentApplets[appletId] || { enabled: false, position: 'float', borderStyle: 'sunken' };
      return {
        ...prev,
        activeApplets: {
          ...currentApplets,
          [appletId]: { ...currentConfig, ...settings }
        }
      };
    });
  };

  const updateStartupApps = (apps: { appId: string; enabled: boolean }[]) => {
    setDisplaySettings((prev: any) => ({ ...prev, startupApps: apps }));
  };

  const updateTaskbarLayout = (taskbarPosition: 'top' | 'bottom' | 'left' | 'right', taskbarSize: number, taskbarSpanFull?: boolean) => {
    setDisplaySettings((prev: any) => ({
      ...prev,
      taskbarPosition,
      taskbarSize: Math.max(40, Math.min(80, taskbarSize)),
      taskbarSpanFull: !!taskbarSpanFull,
    }));
  };

  const updateSoundSettings = (soundEffectsVolume: number, systemMuted: boolean) => {
    setDisplaySettings((prev: any) => ({
      ...prev,
      soundEffectsVolume,
      systemMuted,
    }));
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
    customIcon?: string,    // optional data-URI or path for custom icon
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
      ...(customIcon ? { customIcon } : {}),
    };
    setNodes(prev => {
      // Guard against race conditions
      if (prev.find(n => n.id === appId)) return prev;
      let next = [...prev, exeNode];
      if (placeShortcut) {
        const shortcut: VFSNode = {
          id: `${appId}_lnk`,
          name: displayName,
          type: 'shortcut',
          parentId: 'desktop',
          content: appId,
          targetId: appId,
          iconType: shortcutIconType,
          ...(customIcon ? { customIcon } : {}),
        };
        next.push(shortcut);
      }
      
      // Auto-generate Program_Files directory
      const pfDirId = `pf_dir_${appId}`;
      if (!next.find(n => n.id === pfDirId)) {
        next.push(...generateAppDependencies(appId, exeName, displayName, version, undefined));
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

  const emptyTrash = () => {
    setNodes(prev => {
      const idsToDelete = new Set<string>();
      for (const n of prev) {
         if (n.parentId === 'recycle_bin') idsToDelete.add(n.id);
      }
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

  const restoreNode = (id: string) => {
    setNodes(prev => {
      const node = prev.find(n => n.id === id);
      if (!node || node.parentId !== 'recycle_bin') return prev;
      
      const parentExists = prev.some(n => n.id === node.originalParentId);
      const newParentId = parentExists ? (node.originalParentId || 'desktop') : 'desktop';
      
      return prev.map(n => n.id === id ? { ...n, parentId: newParentId, originalParentId: undefined } : n);
    });
  };

  const deleteNode = (id: string, forcePermanent = false) => {
    if (id === 'recycle_bin' || id === 'recycle_bin_lnk') return;

    setNodes(prev => {
      const node = prev.find(n => n.id === id);
      if (!node) return prev;

      if (!forcePermanent && node.parentId !== 'recycle_bin') {
         return prev.map(n => n.id === id ? { ...n, originalParentId: n.parentId, parentId: 'recycle_bin' } : n);
      }

      const idsToDelete = new Set<string>([id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const child of prev) {
          if (child.parentId && idsToDelete.has(child.parentId) && !idsToDelete.has(child.id)) {
            idsToDelete.add(child.id);
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

  return { nodes, displaySettings, systemUsers, addSystemUser, updateSystemUser, deleteSystemUser, updateResolution, updateWallpaper, updateBackgroundColor, updateTaskbarTheme, updateTaskbarClock, updateClockSettings, updateWorkspaceMenu, updatePinnedApps, updateWaveBarSettings, updateScreensaverSettings, updateAgentVSettings, updateWelcomeTour, updatePlusTheme, updateCursorStyle, updateAppletSettings, updateStartupApps, updateTaskbarLayout, updateSoundSettings, createNode, renameNode, updateFileContent, deleteNode, emptyTrash, restoreNode, getChildren, getNode, updateCustomIcon, installApp, uninstallApp };
}
