import { Folder, Globe, Terminal, Activity, MessageSquare, Settings, Cpu, HardDrive, Monitor, Store, Ghost, FileText, Package, Mail, HelpCircle, Music, PenTool, Gamepad2, Wrench, Phone, ShieldCheck, Search, Disc3, Tv, Grid, Image as ImageIcon } from 'lucide-react';

export const APP_DICTIONARY: Record<string, { icon: any, customIcon?: string, color: string, defaultTitle: string, isSystem?: boolean }> = {
  'files': { icon: Folder, customIcon: '/Icons/computer_explorer-5.png', color: 'text-yellow-400', defaultTitle: 'File Manager', isSystem: true },
  'browser': { icon: Globe, customIcon: '/Icons/world-5.png', color: 'text-blue-300', defaultTitle: 'Vespera Navigator', isSystem: true },
  'workbench': { icon: Terminal, customIcon: '/Icons/executable_gear-0.png', color: 'text-blue-400', defaultTitle: 'AETHERIS Workbench Pro', isSystem: true },
  'open_dos': { icon: Terminal, customIcon: '/Icons/ms_dos-0.png', color: 'text-gray-300', defaultTitle: 'Open-DOS Subsystem', isSystem: true },
  'analyzer': { icon: Activity, customIcon: '/Icons/bar_graph-1.png', color: 'text-green-400', defaultTitle: 'Data Analyzer', isSystem: true },
  'chat': { icon: MessageSquare, customIcon: '/Icons/message_envelope_open-0.png', color: 'text-purple-400', defaultTitle: 'Vespera Assistant', isSystem: true },
  'control_panel': { icon: Settings, customIcon: '/Icons/directory_control_panel-3.png', color: 'text-gray-300', defaultTitle: 'Control Panel', isSystem: true },
  'xtype': { icon: Cpu, customIcon: '/Icons/chip_ramdrive-2.png', color: 'text-red-500', defaultTitle: 'X-Type Control Panel', isSystem: true },
  'netmon': { icon: Terminal, customIcon: '/Icons/entire_network_globe-0.png', color: 'text-green-400', defaultTitle: 'AETHERIS Network Monitor' },
  'rhid': { icon: Terminal, customIcon: '/Icons/server_window.png', color: 'text-red-400', defaultTitle: 'RHID Terminal' },
  'about': { icon: Monitor, customIcon: '/Icons/computer-5.png', color: 'text-blue-600', defaultTitle: 'System Information', isSystem: true },
  'volume_control': { icon: Settings, customIcon: '/Icons/loudspeaker_rays-1.png', color: 'text-yellow-400', defaultTitle: 'Volume Control', isSystem: true },
  'defrag': { icon: HardDrive, customIcon: '/Icons/defragment-0.png', color: 'text-gray-500', defaultTitle: 'Disk Defragmenter', isSystem: true },
  'scandisk': { icon: ShieldCheck, customIcon: '/Icons/scandisk-0.png', color: 'text-blue-700', defaultTitle: 'Disk Checker', isSystem: true },
  'findfiles': { icon: Search, customIcon: '/Icons/search_computer-0.png', color: 'text-gray-700', defaultTitle: 'Find Files', isSystem: true },
  'media_player': { icon: Disc3, customIcon: '/Icons/media_player-1.png', color: 'text-purple-400', defaultTitle: 'VERSA Media Agent 2.0', isSystem: true },
  'dialup': { icon: Phone, customIcon: '/Icons/directory_dial_up_networking_cool-3.png', color: 'text-teal-600', defaultTitle: 'VesperaNET Dial-Up', isSystem: true },
  'vstore': { icon: Store, customIcon: '/Icons/package-1.png', color: 'text-green-500', defaultTitle: 'VStore Software Exchange', isSystem: true },
  'v_messenger': { icon: MessageSquare, customIcon: '/Icons/msn_cool-3.png', color: 'text-blue-400', defaultTitle: 'Vespera Messenger' },
  'v_sonic': { icon: Music, customIcon: '/Icons/cd_audio_cd_a-4.png', color: 'text-orange-400', defaultTitle: 'Vespera Sonic' },
  'axis_paint': { icon: PenTool, customIcon: '/Icons/paint_old-0.png', color: 'text-red-500', defaultTitle: 'Axis Paint 2.0' },
  'neural_solitaire': { icon: Gamepad2, customIcon: '/Icons/game_solitaire-0.png', color: 'text-green-600', defaultTitle: 'Neural Solitaire', isSystem: true },
  'stock_ticker': { icon: Activity, customIcon: '/Icons/bar_graph_default-1.png', color: 'text-green-400', defaultTitle: 'AETHERIS Stock Ticker' },
  'xtype_bios': { icon: Cpu, customIcon: '/Icons/chip_ramdrive-4.png', color: 'text-red-600', defaultTitle: 'X-Type BIOS Configurator' },
  'disk_physician': { icon: Wrench, customIcon: '/Icons/tools_gear-0.png', color: 'text-gray-600', defaultTitle: 'Disk Physician v3.1' },
  'aura_gallery': { icon: Monitor, customIcon: '/Icons/display_properties-4.png', color: 'text-purple-500', defaultTitle: 'Aura Screen Saver Gallery' },
  'packman': { icon: Ghost, customIcon: '/Icons/pacman_icon.ico', color: 'text-yellow-500', defaultTitle: 'Pac-Man (x86)' },
  'packman_setup': { icon: Ghost, customIcon: '/Icons/pacman_icon.ico', color: 'text-yellow-500', defaultTitle: 'Pac-Man (x86) Setup' },
  'leave_me_alone': { icon: Gamepad2, customIcon: '/Games_VStore/Leave Me Alone/Leave_Me_Alone_Icon.png', color: 'text-[#8dc63f]', defaultTitle: 'Leave Me Alone' },
  'leave_me_alone_setup': { icon: Gamepad2, customIcon: '/Games_VStore/Leave Me Alone/Leave_Me_Alone_Icon.png', color: 'text-[#8dc63f]', defaultTitle: 'Leave Me Alone Setup' },
  'retrotv': { icon: Tv, customIcon: '/Icons/movie_maker-3.png', color: 'text-purple-600', defaultTitle: 'Meridian. TV', isSystem: true },
  'remote_desktop': { icon: Monitor, customIcon: '/Icons/netmeeting-2.png', color: 'text-blue-600', defaultTitle: 'VesperaConnect Remote Desktop', isSystem: true },
  'vsweeper': { icon: Grid, customIcon: '/Icons/game_mine_1-0.png', color: 'text-gray-400', defaultTitle: 'V-Sweeper', isSystem: true },
  'aw_release_radar': { icon: Music, customIcon: '/Icons/multimedia-2.png', color: 'text-cyan-400', defaultTitle: 'AW Release Radar' },
  'pchords': { icon: Music, customIcon: '/Icons/pchords_icon.png', color: 'text-[#2968a3]', defaultTitle: 'PChords' },
  'task_manager': { icon: Activity, customIcon: '/Icons/processor-1.png', color: 'text-green-400', defaultTitle: 'Vespera Task Manager', isSystem: true },
  'versa_view': { icon: ImageIcon, customIcon: '/Icons/magnifying_glass_4-1.png', color: 'text-teal-600', defaultTitle: 'VersaView Image Viewer', isSystem: true },
  'default': { icon: Package, customIcon: '/Icons/application_hourglass-0.png', color: 'text-gray-400', defaultTitle: 'Application' }
};

export const getCompatibleApps = (filename: string): string[] => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['txt', 'log', 'bat', 'cfg', 'ini'].includes(ext)) return ['versa_edit', 'workbench', 'open_dos'];
  if (['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'ico'].includes(ext)) return ['versa_view', 'axis_paint', 'browser'];
  if (['htm', 'html'].includes(ext)) return ['browser', 'versa_edit'];
  if (['mp3', 'wav', 'mid', 'ogg'].includes(ext)) return ['media_player'];
  return [];
};

