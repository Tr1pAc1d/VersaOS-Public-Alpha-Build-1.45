import React from 'react';
import { Home, Monitor, Settings, User, Mail, ShieldAlert, Cpu, Globe, Folder, Layers, Activity, Search, HelpCircle, HardDrive, Gamepad2, Recycle, ShoppingBag, Tv, Network, Trash2, Code2, Terminal, BookOpen, Package, FileCode } from 'lucide-react';

export interface HelpTopic {
  id: string;
  title: string;
  icon?: any;
  image?: string;
  images?: { src: string; caption: string }[];
  description: string;
  steps?: string[];
  children?: HelpTopic[];
}

export const HELP_TOPICS: HelpTopic[] = [
  // ── Welcome ──────────────────────────────────────────────────────────────
  {
    id: 'welcome',
    title: 'Welcome to Vespera OS',
    icon: Home,
    description: 'Welcome to Vespera OS, a powerful and intuitive computing environment designed for advanced agentic workloads. This system provides a unified interface for the high-performance hardware developed by Vespera Systems. Use the table of contents on the left to navigate through topics, or follow along with the step-by-step guides below.',
    steps: [
      'Use the Workspace Menu (Start button, bottom-left) to access all your applications.',
      'Double-click icons on the Desktop to launch software or open files.',
      'Right-click any object to view its context menu — properties, cut/copy/paste, and more.',
      'Drag windows by their title bar to reposition them. Resize from any edge or corner.',
      'Use the Help Viewer (this app) anytime from Start → Help & Support.',
    ],
  },

  // ── About Vespera Systems ─────────────────────────────────────────────────
  {
    id: 'company_info',
    title: 'About Vespera Systems',
    icon: Globe,
    description: 'Vespera Systems is a world-class technology firm focusing on the convergence of heuristic computing and traditional architecture. Founded in 1975, we are a key subsidiary of Axis Innovations.',
    children: [
      {
        id: 'origins',
        title: 'Company Origins',
        description: 'Vespera was established to bridge the gap between human intuition and raw computational power. Our early breakthroughs in Synap-C indexing set the standard for modern operating systems. Every component of Vespera OS is built to push the boundaries of what a personal computer can do.',
      },
      {
        id: 'axis_innovations',
        title: 'Axis Innovations',
        description: 'Axis Innovations is the parent company of Vespera Systems, providing the oversight and resource network necessary to push the boundaries of agentic computing globally. Their research divisions cover neural interface hardware, quantum cryptography modules, and next-generation display technology.',
      },
    ],
  },

  // ── Desktop & Navigation ──────────────────────────────────────────────────
  {
    id: 'desktop_basics',
    title: 'Desktop & Navigation',
    icon: Monitor,
    description: 'The Vespera desktop consists of three primary components: the Workspace background, Icons for files and shortcuts, and the Taskbar at the bottom of the screen. Mastering these three elements is key to productive computing.',
    children: [
      {
        id: 'taskbar',
        title: 'The Taskbar',
        description: 'The taskbar spans the bottom of your screen and is the control center of Vespera OS. It shows the Workspace Menu (Start) on the left, open application buttons in the center, and the system tray with the clock on the right.',
        image: '/Help_Images/More/task menu when not spanning entire screen and floating - menu help.png',
        steps: [
          'Click the Vespera logo (Start button) to access all programs, settings, and documents.',
          'Right-click the taskbar itself to access Task Manager or taskbar properties.',
          'The system tray (bottom right) shows the clock and background app icons.',
          'Click any application button in the taskbar to switch to that window.',
        ],
      },
      {
        id: 'taskbar_spanning',
        title: 'Full-Span Taskbar Mode',
        description: 'Vespera OS supports a Full-Span mode that stretches the taskbar to cover the entire bottom edge of the monitor, similar to a traditional desktop operating system. In this mode, the WaveBars move to the far right end of the taskbar.',
        images: [
          { src: '/Help_Images/More/Task Menu Span Entire Screen - Help Menu.png', caption: 'Taskbar spanning the entire screen edge.' },
          { src: '/Help_Images/More/task menu when not spanning entire screen and floating - menu help.png', caption: 'Default floating taskbar mode, centered at the bottom.' },
          { src: '/Help_Images/More/Task menu Wave bars when spanned entire screen - help menu.png', caption: 'WaveBars repositioned to the far right in Full-Span mode.' },
        ],
        steps: [
          'Right-click the Desktop and choose "Workspace Menu" to open the context menu.',
          'Or navigate via Start → Control Panel → Taskbar & Start Menu.',
          'Enable the "Full Span" toggle to stretch the taskbar to the full screen width.',
          'The WaveBar audio visualizers will move to the far-right side of the taskbar automatically.',
        ],
      },
      {
        id: 'taskbar_position',
        title: 'Taskbar Position & Settings',
        description: 'The taskbar can be positioned on different sides of the screen and configured through the Taskbar Properties dialog. You can also enable or disable the WaveBars, change the clock format, and more.',
        images: [
          { src: '/Help_Images/More/Position Settings for Task Menu and Bar - Help Menu.png', caption: 'Taskbar position and layout settings dialog.' },
          { src: '/Help_Images/More/Task menu Settings - Workspace Menu Layout - help menu.png', caption: 'Workspace Menu layout options.' },
          { src: '/Help_Images/More/task menu when positioned on left side of screen - spanning entire edge - menu help.png', caption: 'Taskbar anchored to the left side of the screen in full-span mode.' },
        ],
        steps: [
          'Right-click the Taskbar and select "Properties" or "Taskbar Settings".',
          'Choose from Bottom (default), Left, or other positions.',
          'Toggle "Full Span" to extend the bar to the full screen edge.',
          'Enable or disable the WaveBar audio visualizers from this menu.',
        ],
      },
      {
        id: 'wavebar',
        title: 'WaveBar Audio Visualizer',
        description: 'The WaveBar is Vespera OS\'s signature audio visualizer, displayed in the system tray area of the taskbar. It animates in real time with the system audio output, giving you both a visual confirmation that audio is playing and a quick-access volume indicator.',
        image: '/Help_Images/More/Vespera Wave bar 1 - menu Help.png',
        steps: [
          'The WaveBar appears in the taskbar whenever audio is playing.',
          'Click the WaveBar to open the volume mixer.',
          'In Full-Span mode, the WaveBar relocates to the far right of the taskbar.',
        ],
      },
      {
        id: 'desktop_context_menu',
        title: 'Desktop Right-Click Menu',
        description: 'Right-clicking on an empty area of the Desktop opens the Workspace Context Menu, which provides quick access to display settings, refresh, new file/shortcut creation, and properties.',
        image: '/Help_Images/More/desktop right click context menu - menu help.png',
        steps: [
          'Right-click any empty area of the Desktop.',
          'Choose "Display Properties" to change wallpaper or resolution.',
          'Choose "New → Shortcut" to create a new desktop shortcut.',
          'Choose "Arrange Icons" to auto-sort the desktop.',
          'Click "Refresh" to reload the desktop icon layout.',
        ],
      },
      {
        id: 'right_click_taskbar',
        title: 'Right-Clicking the Taskbar',
        description: 'Right-clicking on the Taskbar itself (or on a running application button) brings up a different context menu with options specific to window management and taskbar configuration.',
        image: '/Help_Images/More/right clicking task menu - context menu - help menu.png',
        steps: [
          'Right-click on the Taskbar bar (not on an app button).',
          'Select "Task Manager" for process management.',
          'Select "Properties" to open Taskbar Settings.',
          'For an open window\'s button, right-click to Restore, Minimize, Maximize, or Close.',
        ],
      },
      {
        id: 'shortcuts',
        title: 'Shortcuts & Folders',
        description: 'Shortcuts provide quick access to programs located in C:\\PROGRAMS. Folders allow you to organize files efficiently. Look for the small arrow overlay on an icon to identify it as a shortcut rather than the actual file.',
        images: [
          { src: '/Help_Images/More/create shortcut box - menu help.png', caption: 'The "Create Shortcut" wizard launched from the Desktop context menu.' },
          { src: '/Help_Images/More/file properties screenshot - menu help.png', caption: 'File Properties dialog showing path, size, and dates.' },
        ],
        steps: [
          'Right-click the Desktop → New → Shortcut to open the Create Shortcut wizard.',
          'Type the path to the application or file, or click Browse to locate it.',
          'Give the shortcut a name and click Finish.',
          'To change a shortcut\'s icon, right-click it → Properties → Change Icon.',
        ],
      },
      {
        id: 'change_icon',
        title: 'Changing Icons',
        description: 'Any shortcut or folder on the desktop can have its icon customized. Vespera OS ships with a large library of retro-style pixel icons, and you can assign any of them to your shortcuts.',
        images: [
          { src: '/Help_Images/More/Properties change icon screenshot - menu help.png', caption: 'Right-click → Properties → Change Icon dialog.' },
          { src: '/Help_Images/More/properties change icon choose icon screenshot - menu help.png', caption: 'The icon picker showing the full Vespera icon library.' },
        ],
        steps: [
          'Right-click the icon you want to change and select "Properties".',
          'Click the "Change Icon..." button.',
          'Browse the icon library and click the one you want.',
          'Click OK to apply. The desktop shortcut will update immediately.',
        ],
      },
    ],
  },

  // ── File Management ───────────────────────────────────────────────────────
  {
    id: 'file_management',
    title: 'File Management',
    icon: Folder,
    description: 'The File Manager is your gateway to the system drive (C:). It provides a traditional dual-pane interface with a folder tree on the left and file listing on the right. Understanding file extensions is critical for system maintenance.',
    children: [
      {
        id: 'file_manager_overview',
        title: 'File Manager Overview',
        description: 'The Vespera File Manager provides a familiar interface for browsing your C: drive. The left panel shows the directory tree, and the right panel lists files within the selected folder.',
        images: [
          { src: '/Help_Images/More/File Manager C drive screenshot - help menu.png', caption: 'File Manager showing the root of the C: drive.' },
          { src: '/Help_Images/More/File Manager C drive slash vespera - help menu.png', caption: 'Browsing the C:\\Vespera system directory.' },
        ],
        steps: [
          'Open the File Manager from the Desktop shortcut or Start → Programs → Accessories.',
          'Click any folder in the left pane to navigate to it.',
          'Double-click a file to open it with its associated application.',
          'Use the toolbar buttons to go Up, Back, or forward in the directory tree.',
        ],
      },
      {
        id: 'file_context_menu',
        title: 'Right-Clicking Files',
        description: 'Right-clicking on any file or folder in the File Manager opens a context menu with options such as Open, Cut, Copy, Delete, Rename, and Properties.',
        image: '/Help_Images/More/right clicking a file - context menu - help menu.png',
        steps: [
          'Right-click any file or folder.',
          'Select "Open" to launch the file with the default application.',
          'Select "Properties" to see file details (size, dates, attributes).',
          'Select "Send To" to move or copy files to another location quickly.',
          'Select "Delete" to move the file to the Recycle Bin.',
        ],
      },
      {
        id: 'file_extensions',
        title: 'File Extensions',
        description: 'Files are categorized by their extensions, which determine which application opens them. Vespera OS uses file extension associations to automatically launch the correct program.',
        steps: [
          '.EXE / .COM — Executable programs and system utilities.',
          '.DLL / .SYS — System libraries and drivers. Do not modify or delete these.',
          '.TXT / .LOG — Plain text documentation and system records.',
          '.LNK — Desktop or menu shortcut files.',
          '.BMP / .PNG / .JPG — Image files, openable with AxisPaint.',
          '.WAV / .MP3 — Audio files, playable with the VERSA Media Agent.',
        ],
      },
      {
        id: 'hidden_files',
        title: 'System & Hidden Files',
        description: 'Many files in the C:\\VESPERA\\SYSTEM directory are critical to OS operation and are protected from accidental modification. You can toggle the display of hidden and system files in the File Manager\'s View menu.',
        image: '/Help_Images/More/hidden system files screenshot - file manager - menu help.png',
        steps: [
          'Open the File Manager.',
          'Go to View → Folder Options → View tab.',
          'Toggle "Show hidden files and folders" to reveal protected files.',
          'These files are hidden for a reason — avoid modifying them unless you know what you\'re doing.',
        ],
      },
    ],
  },

  // ── Recycle Bin ───────────────────────────────────────────────────────────
  {
    id: 'recycle_bin',
    title: 'Recycle Bin',
    icon: Trash2,
    description: 'The Recycle Bin acts as a safety net for deleted files. When you delete a file, it moves to the Recycle Bin rather than being permanently removed. You can restore files from the Bin or empty it to free up disk space.',
    images: [
      { src: '/Help_Images/More/Recycle bin empty - menu help.png', caption: 'The Recycle Bin icon when empty.' },
      { src: '/Help_Images/More/Recycle bin full - menu help.png', caption: 'The Recycle Bin icon when it contains deleted files.' },
      { src: '/Help_Images/More/recycling bin - menu help.png', caption: 'Inside the Recycle Bin showing deleted file listings.' },
    ],
    steps: [
      'To delete a file, right-click it and choose "Delete", or press the Delete key.',
      'Double-click the Recycle Bin on the Desktop to open it and see deleted files.',
      'To restore a file, right-click it inside the Bin and choose "Restore".',
      'To permanently delete all files, right-click the Bin and choose "Empty Recycle Bin".',
      'The Bin icon changes appearance when it contains files vs. when it is empty.',
    ],
  },

  // ── Network & Internet ────────────────────────────────────────────────────
  {
    id: 'network_services',
    title: 'Network & Internet',
    icon: Globe,
    description: 'Vespera OS includes a full suite of network services through the VesperaNET ecosystem, from Dial-Up modem connectivity to a full-featured web browser and secure remote desktop access.',
    children: [
      {
        id: 'dialup',
        title: 'Dial-Up Networking (VesperaNET)',
        description: 'Connect to the internet via VesperaNET Dial-Up, Vespera OS\'s integrated modem connection service. Experience the authentic sound of a 56K modem handshake as you get connected to the World Wide Web.',
        images: [
          { src: '/Help_Images/Dial-UP/Dail-Up APP.png', caption: 'The VesperaNET Dial-Up Networking application.' },
          { src: '/Help_Images/More/VesperaNet Dail-Up Connection - disconnected - menu help.png', caption: 'Dial-Up connection window — not yet connected.' },
          { src: '/Help_Images/More/VesperaNet Dail-Up Connection - Connected - menu help.png', caption: 'Successfully connected to VesperaNET.' },
        ],
        steps: [
          'Open "Dial-Up Networking" from Start → System Tools.',
          'Click "Dial Connection" to initiate the modem handshake.',
          'Wait for the handshake animation and connection tone to complete.',
          'Once connected, launch Vespera Navigator to start browsing.',
          'Click "Disconnect" in the system tray to end the session.',
        ],
      },
      {
        id: 'browser',
        title: 'Vespera Navigator',
        description: 'The primary web browser for accessing corporate and external information through VesperaNET. Supports multi-tab browsing and secure HTTPS/SSL transactions.',
        steps: [
          'Launch Vespera Navigator from the Start Menu or the Desktop shortcut.',
          'Type a URL in the address bar and press Enter to navigate.',
          'Use the Back and Forward buttons to navigate your history.',
          'The Favorites menu stores your most-visited sites for quick access.',
        ],
      },
      {
        id: 'vesperaconnect',
        title: 'VesperaConnect Remote Desktop',
        description: 'VesperaConnect allows you to establish encrypted remote desktop sessions, connecting to secure Vespera archive terminals over the VesperaNET infrastructure. Ideal for accessing locked research data.',
        images: [
          { src: '/Help_Images/More/VesperaConnect - Remote Desktop login screen - Help Menu.png', caption: 'VesperaConnect login screen — enter the terminal address and credentials.' },
          { src: '/Help_Images/More/VesperaConnect - Remote Desktop connected - Help Menu.png', caption: 'Active VesperaConnect session showing the remote terminal desktop.' },
        ],
        steps: [
          'Launch VesperaConnect from Start → System Tools → Remote Desktop.',
          'Enter the hostname or IP address of the remote terminal.',
          'Input your authorized VesperaNET credentials.',
          'Click "Connect" — the remote desktop will load in the window.',
          'Use the toolbar at the top to disconnect when finished.',
        ],
      },
      {
        id: 'vespera_net',
        title: 'VesperaNET Account Linking',
        description: 'Link your system account to a VesperaNET Global ID in the Control Panel to synchronize settings and access member-only software downloads.',
        image: '/Help_Images/Control_Panel/Users/users_linked.png',
      },
      {
        id: 'user_accounts',
        title: 'User Account Management',
        description: 'Manage local system users and account permissions through the Control Panel. Create new users, change passwords, and set privilege levels.',
        image: '/Help_Images/Control_Panel/Users/users_main_screen.png',
        steps: [
          'Open Control Panel → User Accounts.',
          'Click "Add User" to create a new local account.',
          'Select a user and click "Properties" to change their password or privilege level.',
          'Administrator accounts can modify system files; Standard accounts are restricted.',
        ],
      },
    ],
  },

  // ── Applications ──────────────────────────────────────────────────────────
  {
    id: 'applications',
    title: 'Applications & Software',
    icon: Layers,
    description: 'Vespera OS comes with a rich suite of built-in applications covering productivity, multimedia, communications, and entertainment. Additional software can be downloaded from the VStore Catalyst.',
    children: [
      {
        id: 'vstore',
        title: 'VStore Catalyst',
        description: 'The VStore Catalyst is a cloud-based software repository directly integrated into Vespera OS. Browse thousands of shareware and freeware titles, install apps with one click, and manage your download history.',
        image: '/Help_Images/More/vstore - main menu screenshot - menu help.png',
        steps: [
          'Launch VStore from the Desktop shortcut or Start → Programs → VStore.',
          'Browse categories or use the search bar to find software.',
          'Click a title to see its description, screenshots, and reviews.',
          'Click "Download & Install" to automatically download and install the app.',
          'Installed apps appear in Start → Programs automatically.',
        ],
      },
      {
        id: 'add_remove',
        title: 'Add or Remove Programs',
        description: 'The Add or Remove Programs control panel lets you see all installed software, get detailed information about each application, and uninstall programs you no longer need.',
        images: [
          { src: '/Help_Images/More/add or remove programs 1 - help menu.png', caption: 'Add or Remove Programs — list of all installed applications.' },
          { src: '/Help_Images/More/add or remove programs example of uninstall wizard - help menu.png', caption: 'Uninstall wizard for removing a selected application.' },
          { src: '/Help_Images/More/add remove programs - uninstalling screenshot - menu help.png', caption: 'Uninstall in progress — do not power off the system.' },
          { src: '/Help_Images/More/are you sure you want to uninstall message - add remove programs - menu help.png', caption: 'Confirmation dialog before uninstallation begins.' },
        ],
        steps: [
          'Open Start → Control Panel → Add or Remove Programs.',
          'The list shows every installed application with its size and install date.',
          'Click a program to select it, then click "Remove" to begin uninstall.',
          'Confirm the uninstall prompt — the wizard will remove all associated files.',
          'Restart may be required after uninstalling certain system-level applications.',
        ],
      },
      {
        id: 'meridian_tv',
        title: 'Meridian.TV — Broadcast App',
        description: 'Meridian.TV is Vespera OS\'s integrated cable television viewer. Tune into live broadcast channels including news, movies, and the Vespera Weather Channel directly from your desktop.',
        images: [
          { src: '/Help_Images/More/Meridian TV app - Confirm and connect screen - help menu.png', caption: 'Meridian.TV — confirm channel connection screen.' },
          { src: '/Help_Images/More/Meridian Tv App - Screenshot channel - help menu.png', caption: 'Meridian.TV displaying a live broadcast channel.' },
          { src: '/Help_Images/More/Weather channel app - meridian tv - help menu.png', caption: 'The Weather Channel as viewed through Meridian.TV.' },
        ],
        steps: [
          'Launch Meridian.TV from Start → Programs → Multimedia.',
          'Select a channel from the Channel Guide panel on the left.',
          'Click "Confirm & Connect" to tune in.',
          'Use the volume controls to adjust the broadcast audio.',
          'Switch to the Weather Channel for live weather data and radar overlays.',
        ],
      },
      {
        id: 'solitaire',
        title: 'Neural Solitaire',
        description: 'Neural Solitaire is the built-in card game for Vespera OS, featuring authentic pixel-art playing cards and full Klondike Solitaire gameplay. Challenge yourself with timed or casual modes.',
        images: [
          { src: '/Help_Images/More/Solitare screenshot main menu - help menu.png', caption: 'Neural Solitaire main menu with mode selection.' },
          { src: '/Help_Images/More/Solitare screenshot gameplay - help menu.png', caption: 'Active Klondike Solitaire game in progress.' },
        ],
        steps: [
          'Launch Neural Solitaire from Start → Programs → Games.',
          'Choose "New Game" from the main menu.',
          'Drag cards from the tableau to build sequences in descending order, alternating colors.',
          'Move Aces to the foundation piles (top right) and build up by suit.',
          'Draw from the stock pile (top left) when no moves are available on the tableau.',
          'Complete all four foundation piles to win!',
        ],
      },
    ],
  },

  // ── Advanced Utilities ────────────────────────────────────────────────────
  {
    id: 'advanced_tools',
    title: 'Advanced Utilities',
    icon: Cpu,
    description: 'Specialized tools for system performance, monitoring, and maintenance. These utilities are geared toward power users and system administrators.',
    children: [
      {
        id: 'xtype_utility',
        title: 'X-Type Control Module',
        image: '/Help_Images/Control_Panel/CM_home.png',
        description: 'Manage your X-Type hardware expansion card from this Control Panel applet. Monitor neural bridge stability, thermal metrics, and heuristic processor load in real time.',
      },
      {
        id: 'disk_defrag',
        title: 'Disk Defragmenter',
        description: 'Regular defragmentation is necessary to maintain file access speeds on the C: drive. The Disk Defragmenter rearranges fragmented data so your hard drive can work more efficiently. Recommended monthly.',
        steps: [
          'Open Start → System Tools → Disk Defragmenter.',
          'Select the C: drive in the volume list.',
          'Click "Analyze" to see the current fragmentation level.',
          'Click "Defragment" to begin the optimization process.',
          'Do not use the computer during defragmentation for best results.',
        ],
      },
      {
        id: 'data_analyzer',
        title: 'Data Stream Analyzer',
        description: 'Analyze incoming packet streams and system heuristics. Used primarily by network administrators to monitor traffic patterns, diagnose connectivity issues, and track bandwidth usage.',
      },
      {
        id: 'display_settings',
        title: 'Display Properties',
        icon: Monitor,
        description: 'Configure your monitor and display adapter settings from the Control Panel Display Properties dialog. Adjust resolution, color depth, refresh rate, and screensaver.',
        image: '/Help_Images/Control_Panel/Display Properties/CM_Display_Properties_Settings_Tab.png',
        children: [
          {
            id: 'display_bg',
            title: 'Desktop Background',
            image: '/Help_Images/Control_Panel/Display Properties/CM_Display_Properties_background_Tab.png',
            description: 'Customize the appearance of your Workspace with wallpapers, tiled patterns, or solid colors. Vespera OS includes several built-in wallpapers including the iconic Vespera gradient background.',
            steps: [
              'Open Control Panel → Display → Background tab.',
              'Choose a wallpaper from the list or click "Browse" to select a custom image.',
              'Choose "Tile", "Center", or "Stretch" for the display mode.',
              'Click "Apply" to preview, then "OK" to save.',
            ],
          },
          {
            id: 'display_monitor',
            title: 'Monitor Information',
            image: '/Help_Images/Control_Panel/Display Properties/CM_Display_Properties_Monitor_Tab.png',
            description: 'View technical specifications for your CRT display device, including the monitor model, maximum supported refresh rate, and power management options.',
          },
          {
            id: 'screensaver',
            title: 'Screen Saver Options',
            image: '/Help_Images/More/Screen Saver Options control panel - Help menu.png',
            description: 'Configure an automatic screen saver that activates after a period of inactivity. Vespera OS includes several built-in screensavers including the iconic Starfield and Matrix Rain effects.',
            steps: [
              'Open Control Panel → Display → Screen Saver tab.',
              'Select a screensaver from the dropdown menu.',
              'Click "Preview" to see a full-screen preview.',
              'Set the wait time (in minutes) before the screensaver activates.',
              'Enable "Password protected" to require login after screensaver activates.',
            ],
          },
          {
            id: 'plus_themes',
            title: 'Plus! Themes',
            image: '/Help_Images/More/control panel - plus themes options - help menu.png',
            description: 'The Vespera Plus! Themes panel lets you switch between visual style packs that change window borders, colors, and system sounds all at once. Themes range from classic Motif to futuristic neon styles.',
            steps: [
              'Open Control Panel → Display → Plus! Themes tab.',
              'Select a theme from the dropdown and click "Apply".',
              'The entire OS visual style will update immediately.',
              'You can reset to the default Vespera theme at any time.',
            ],
          },
          {
            id: 'cursor_options',
            title: 'Cursor & Mouse Options',
            image: '/Help_Images/More/control panel - cursor options - menu help.png',
            description: 'Customize your mouse cursor appearance, speed, and button behavior in the Mouse control panel. Choose from classic arrow, animated cursors, or high-visibility options.',
            steps: [
              'Open Control Panel → Mouse.',
              'The Pointers tab lets you customize each cursor state (normal, busy, text, link, etc.).',
              'Use "Browse" to select .ANI or .CUR cursor files.',
              'The Motion tab controls pointer speed and acceleration.',
            ],
          },
        ],
      },
      {
        id: 'system_properties',
        title: 'System Properties',
        icon: Settings,
        description: 'The System Properties module in the Control Panel provides a comprehensive overview of your Vespera system\'s hardware, performance, and user profile configuration.',
        children: [
          {
            id: 'sys_general',
            title: 'General Settings',
            image: '/Help_Images/Control_Panel/System/system_general.png',
            description: 'Displays your OS version, build information, registered user, and a summary of your core hardware including CPU model and total installed RAM.',
          },
          {
            id: 'sys_device_mgr',
            title: 'Device Manager',
            image: '/Help_Images/Control_Panel/System/system_device_manager.png',
            description: 'An interactive tree view of all installed hardware devices. From here you can view resources such as IRQs and DMA channels, update drivers, and disable devices.',
            steps: [
              'Open Control Panel → System → Device Manager tab.',
              'Double-click a category (e.g., "Display Adapters") to expand it.',
              'Select a device and click "Properties" to view technical details.',
              'Right-click a device for options: Update Driver, Disable, or Remove.',
              'A yellow exclamation icon indicates a driver conflict — update or reinstall the driver.',
            ],
          },
          {
            id: 'sys_hw_profiles',
            title: 'Hardware Profiles',
            image: '/Help_Images/Control_Panel/System/system_hardware_profiles.png',
            description: 'Hardware Profiles let you manage boot configurations, allowing the system to start with specific hardware disabled. This is useful for Safe Mode boots, diagnostic sessions, or laptop docking configurations.',
          },
          {
            id: 'sys_user_profiles',
            title: 'User Profiles',
            image: '/Help_Images/Control_Panel/System/system_user_profiles.png',
            description: 'Displays a list of all user profiles registered on the active machine. Each user can have their own wallpaper, icon layout, and application settings that load when they log in.',
          },
          {
            id: 'sys_performance',
            title: 'Performance Monitor',
            image: '/Help_Images/Control_Panel/System/system_performance.png',
            description: 'Monitors real-time Shielding Stability and Heuristic Processor Load. Allows deep configuration of Virtual Memory (page file) size and Environment Variables.',
          },
        ],
      },
      {
        id: 'task_menu_apps',
        title: 'Start Menu Applications',
        description: 'The Start Menu provides quick access to all installed applications, organized by category. The System Tools folder contains critical utilities for power users.',
        images: [
          { src: '/Help_Images/Control_Panel/Task_Menu/task_menu_start.png', caption: 'The main Start Menu open, showing top-level categories.' },
          { src: '/Help_Images/Control_Panel/Task_Menu/task_menu_programs.png', caption: 'Programs submenu showing installed application groups.' },
          { src: '/Help_Images/Control_Panel/Task_Menu/Task_Menu_System_apps.png', caption: 'System Tools submenu with administrative utilities.' },
          { src: '/Help_Images/Control_Panel/Task_Menu/task_menu_Shortcuts.png', caption: 'The Shortcuts section of the Start Menu for pinned apps.' },
          { src: '/Help_Images/Control_Panel/Task_Menu/task_menu_clock.png', caption: 'System clock in the taskbar tray with hover time display.' },
        ],
        steps: [
          'Click the Vespera logo to open the Start Menu.',
          'Navigate Programs to see all installed applications, organized into folders.',
          'System Tools contains Disk Defragmenter, ScanDisk, Task Manager, and more.',
          'Pin frequently-used apps to the Shortcuts Quick Launch area.',
        ],
      },
      {
        id: 'task_menu_themes',
        title: 'Taskbar Theme Variants',
        description: 'The taskbar can be restyled using different color themes from the Plus! Themes panel. Here are examples of different taskbar color schemes available in Vespera OS.',
        images: [
          { src: '/Help_Images/Control_Panel/Task_Menu/black_Task_Menu.png', caption: 'Dark/Black taskbar theme.' },
          { src: '/Help_Images/Control_Panel/Task_Menu/teal_task_menu_to_showcase_diff_options.png', caption: 'Teal taskbar theme demonstrating color customization.' },
          { src: '/Help_Images/Control_Panel/Task_Menu/Task_Menu_Wave_Bars_custom_options.png', caption: 'WaveBar custom color and style options.' },
          { src: '/Help_Images/Control_Panel/Task_Menu/workspace_menu_task_menu.png', caption: 'Workspace Menu (right-click) in a themed taskbar environment.' },
        ],
      },
    ],
  },

  // ── Troubleshooting ───────────────────────────────────────────────────────
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: ShieldAlert,
    description: 'Guidance on resolving common system messages, restrictions, and error states. If your system is behaving unexpectedly, consult the steps below before contacting support.',
    children: [
      {
        id: 'system_violations',
        title: 'Addressing System Violations',
        description: 'A "System Violation" or "Access Denied" message occurs when an unauthorized action is attempted on protected files or system resources.',
        steps: [
          'Verify your account has Administrator privileges in Control Panel → User Accounts.',
          'Ensure the target file is not currently locked by another system process.',
          'Some files in VESPERA\\SYSTEM require X-Type hardware keys to access.',
          'If the issue persists, try restarting the system and retrying the operation.',
        ],
      },
      {
        id: 'errors',
        title: 'Common Errors',
        description: 'If the system hangs or a Kernel Panic occurs, perform a hard reset using the keyboard shortcut CTRL+ALT+SYS. This forces an immediate restart without the normal shutdown sequence. Data in unsaved documents may be lost.',
        steps: [
          'If a window is unresponsive, right-click its taskbar button and choose "Close Window".',
          'Open Task Manager (right-click Taskbar → Task Manager) and End Task on the frozen process.',
          'If the entire OS freezes, press CTRL+ALT+SYS to force a hard reset.',
          'After a crash, ScanDisk may run automatically at next boot to check drive integrity.',
        ],
      },
      {
        id: 'scandisk',
        title: 'ScanDisk & Disk Errors',
        description: 'ScanDisk checks your C: drive for file system errors and bad sectors. It runs automatically after an improper shutdown and can also be run manually as preventive maintenance.',
        steps: [
          'Launch ScanDisk from Start → System Tools → ScanDisk.',
          'Select "Standard" for a quick file system check, or "Thorough" to also scan for physical bad sectors.',
          'Check "Automatically fix errors" to repair issues without manual confirmation.',
          'Click "Start" to begin the scan. The process may take several minutes.',
          'Review the summary report when complete.',
        ],
      },
    ],
  },

  // ── Developer Guide ────────────────────────────────────────────────────────
  {
    id: 'developer_guide',
    title: 'Developer Guide',
    icon: Code2,
    description: 'Welcome to the Vespera OS Plugin SDK documentation. This section covers everything you need to build, package, and publish a third-party application for Vespera OS. Plugins are distributed as a single JSON object called an AppManifest, installed via the VStore Developer Import tab.',
    children: [
      {
        id: 'dev_overview',
        title: 'What is the Plugin API?',
        icon: BookOpen,
        description: 'The Vespera Plugin API lets third-party developers ship self-contained applications that run inside the Vespera OS windowing system without requiring a build step or server deployment. Your entire app — UI, logic, and assets — is bundled into a single JSON manifest and executed securely inside a sandboxed window.',
        steps: [
          'A plugin is a JSON object (AppManifest) containing metadata and raw JavaScript source code.',
          'The JavaScript is run via the Vespera Plugin Runtime (new Function() sandbox).',
          'Your code receives a container <div> to render into and a System API object for OS interaction.',
          'After installation, your app appears on the desktop and in Start → Installed Programs.',
          'The plugin persists across sessions via the Vespera Plugin Registry (localStorage).',
        ],
      },
      {
        id: 'dev_manifest',
        title: 'Formatting the AppManifest',
        icon: FileCode,
        description: 'The AppManifest is a JSON object with 7 required fields and 2 optional ones. All string values must be non-empty. The "id" field must be unique across all installed plugins.',
        steps: [
          '"id" — A unique slug for your plugin. Use only lowercase letters, numbers, and underscores. Max 48 characters. Example: "my_calculator"',
          '"name" — Human-readable display name shown in the title bar. Example: "My Calculator"',
          '"version" — Semver string. Example: "1.0.0"',
          '"description" — One or two sentences describing what the plugin does.',
          '"author" — Your name or organization.',
          '"iconUrl" — A URL or inline data-URI for a square PNG/ICO image (64×64 recommended). This becomes the desktop icon.',
          '"entryCode" — Raw JavaScript source. Must declare a top-level init(container, System) function.',
          '"size" (optional) — Human-readable file size string, e.g. "2.4 MB". Defaults to "~1.0 MB".',
          '"category" (optional) — The VStore category the plugin appears under. Defaults to "Featured Apps".',
        ],
      },
      {
        id: 'dev_init',
        title: 'The init() Function',
        icon: Terminal,
        description: 'Your plugin\'s entryCode must declare a top-level function named init. This is the entry point that Vespera OS calls when the user opens your app window. The function receives two arguments: container and System.',
        steps: [
          'function init(container, System) { ... } — declare init at the top level of entryCode.',
          'container — An HTMLDivElement. Render your app\'s HTML into this element. It fills the entire plugin window.',
          'System.openWindow(id) — Opens a registered Vespera OS window by its ID (e.g. "files", "browser").',
          'System.notify(message) — Fires a desktop notification toast from your plugin.',
          'System.getManifest() — Returns your plugin\'s own AppManifest object for runtime self-inspection.',
          'System.version — A string containing the current Vespera OS version (e.g. "1.45").',
          'You may use any vanilla JS or browser APIs (fetch, localStorage, canvas, Web Audio, etc.).',
          'Do NOT attempt to import external modules via import() — the sandbox does not support ES module loading.',
          'Keep all of your code inside a single IIFE or closure to avoid polluting the global scope.',
        ],
      },
      {
        id: 'dev_vfs',
        title: 'Program Files Structure',
        icon: Package,
        description: 'When a plugin is installed, Vespera OS automatically creates a dedicated folder inside C:\\VESPERA\\Program_Files\\<AppName>\\ containing the following files. Deleting the .DLL or .SYS file will prevent the plugin from launching — a retro-style dependency error will appear instead.',
        steps: [
          '<AppName>.EXE — The executable stub registered in the VFS as isApp:true.',
          '<AppName>.ico — The plugin\'s icon file (sourced from your manifest "iconUrl").',
          '<AppName>32.DLL — Runtime library stub. Required for launch. Do not delete.',
          '<AppName>.SYS — System driver stub. Required for launch. Do not delete.',
          '<AppName>_RT.VXD — Virtual device extension. Adds OS realism.',
          'config.ini — Default configuration file.',
          'ReadMe.txt — Auto-generated readme with your plugin name and version.',
        ],
      },
      {
        id: 'dev_publishing',
        title: 'Publishing to VStore',
        icon: Code2,
        description: 'There are two ways to deliver your plugin to a Vespera OS user: by sharing the raw JSON manifest for copy-paste, or by hosting the manifest JSON file at a public URL for the Fetch import path.',
        steps: [
          'Open VStore Catalyst from the Desktop or Start Menu.',
          'Log in (any account tier — Developer Import is available to all users).',
          'Click "Developer Import" in the left sidebar.',
          'Method A — Paste: Copy your JSON manifest,  then paste it into the "Paste Manifest JSON" textarea and click "Install Plugin".',
          'Method B — Fetch: Host your manifest JSON at a public URL (e.g. GitHub Gist raw URL), enter it in the "Fetch Manifest from URL" field, click Fetch, then Install Plugin.',
          'The manifest is validated first. If any required field is missing, a descriptive error is shown.',
          'On success, the ThirdPartySetupWizard launches automatically to complete the installation.',
          'After installation, your app icon appears on the Desktop and in Start → Installed Programs.',
        ],
      },
    ],
  },
];
