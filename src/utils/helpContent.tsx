import React from 'react';
import { Home, Monitor, Settings, User, Mail, ShieldAlert, Cpu, Globe, Folder, Layers, Activity, Search, HelpCircle, HardDrive } from 'lucide-react';

export interface HelpTopic {
  id: string;
  title: string;
  icon?: any;
  image?: string;
  description: string;
  steps?: string[];
  children?: HelpTopic[];
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'welcome',
    title: 'Welcome to Vespera OS',
    icon: Home,
    description: 'Welcome to Vespera OS, a powerful and intuitive computing environment designed for advanced agentic workloads. This system provides a unified interface for the high-performance hardware developed by Vespera Systems.',
    steps: [
      'Use the Workspace Menu (bottom left) to access your applications.',
      'Double-click icons on the Desktop to launch software or open files.',
      'Right-click any object to view its properties or manage its lifecycle.'
    ]
  },
  {
    id: 'company_info',
    title: 'About Vespera Systems',
    icon: Globe,
    description: 'Vespera Systems is a world-class technology firm focusing on the convergence of heuristic computing and traditional architecture. Founded in 1975, we are a key subsidiary of Axis Innovations.',
    children: [
      {
        id: 'origins',
        title: 'Company Origins',
        description: 'Vespera was established to bridge the gap between human intuition and raw computational power. Our early breakthroughs in Synap-C indexing set the standard for modern operating systems.',
      },
      {
        id: 'axis_innovations',
        title: 'Axis Innovations',
        description: 'Axis Innovations is the parent company of Vespera Systems, providing the oversight and resource network necessary to push the boundaries of agentic computing globally.',
      }
    ]
  },
  {
    id: 'desktop_basics',
    title: 'Desktop & Navigation',
    icon: Monitor,
    description: 'The Vespera desktop consists of three primary components: the Workspace background, the Icons for files and shortcuts, and the Taskbar.',
    children: [
      {
        id: 'taskbar',
        title: 'The Taskbar',
        description: 'The taskbar allows you to switch between open windows. Use the Workspace Menu (bottom left) to launch programs and the Status Area (bottom right) to see the system clock.',
      },
      {
        id: 'shortcuts',
        title: 'Shortcuts & Folders',
        description: 'Shortcuts provide quick access to programs located in C:\\PROGRAMS. Folders allow you to organize files efficiently. Look for the small arrow on an icon to identify a shortcut.',
      }
    ]
  },
  {
    id: 'file_management',
    title: 'File Management',
    icon: Folder,
    description: 'The File Manager is your gateway to the system drive (C:). Understanding file extensions is critical for system maintenance.',
    children: [
      {
        id: 'file_extensions',
        title: 'File Extensions',
        description: 'Files are categorized by their extensions:',
        steps: [
          '.EXE / .COM: Executable programs and system utilities.',
          '.DLL / .SYS: System libraries and drivers. Do not modify or delete these.',
          '.TXT / .LOG: Plain text documentation and system records.',
          '.LNK: Desktop or menu shortcut files.'
        ]
      },
      {
        id: 'hidden_files',
        title: 'System & Hidden Files',
        description: 'Many files in the C:\\VESPERA\\SYSTEM directory are critical to OS operation. These are often protected to prevent accidental deletion.',
      }
    ]
  },
  {
    id: 'network_services',
    title: 'Network & Internet',
    icon: Globe,
    description: 'Vespera OS includes a full suite of network services through the VesperaNET ecosystem.',
    children: [
      {
        id: 'browser',
        title: 'Vespera Navigator',
        description: 'The primary web browser for accessing corporate and external information. Supports multi-tab browsing and secure HTTPS/SSL transactions.',
      },
      {
        id: 'vespera_net',
        title: 'VesperaNET Accounts',
        image: '/Help_Images/Control_Panel/Users/users_linked.png',
        description: 'Link your system account to a VesperaNET Global ID in the Control Panel to synchronize settings and access member-only software downloads.',
      },
      {
        id: 'user_accounts',
        title: 'Account Management',
        image: '/Help_Images/Control_Panel/Users/users_main_screen.png',
        description: 'Manage local system users and account permissions.',
      }
    ]
  },
  {
    id: 'advanced_tools',
    title: 'Advanced Utilities',
    icon: Cpu,
    description: 'Specialized tools for system performance and monitoring.',
    children: [
      {
        id: 'xtype_utility',
        title: 'X-Type Control Panel',
        image: '/Help_Images/Control_Panel/CM_home.png',
        description: 'Manage your X-Type hardware expansion card. Monitor neural bridge stability and thermal metrics from this panel.',
      },
      {
        id: 'disk_defrag',
        title: 'Disk Defragmenter',
        description: 'Regular defragmentation is necessary to maintain file access speeds on C: drive. Recommend monthly optimization.',
      },
      {
        id: 'data_analyzer',
        title: 'Data Stream Analyzer',
        description: 'Analyze incoming packet streams and system heuristics. Used primarily by network administrators.',
      },
      {
        id: 'display_settings',
        title: 'Display Properties',
        icon: Monitor,
        image: '/Help_Images/Control_Panel/Display Properties/CM_Display_Properties_Settings_Tab.png',
        description: 'Configure your monitor and display adapter settings.',
        children: [
          {
            id: 'display_bg',
            title: 'Desktop Background',
            image: '/Help_Images/Control_Panel/Display Properties/CM_Display_Properties_background_Tab.png',
            description: 'Customize the appearance of your Workspace with wallpapers or solid colors.',
          },
          {
            id: 'display_monitor',
            title: 'Monitor Information',
            image: '/Help_Images/Control_Panel/Display Properties/CM_Display_Properties_Monitor_Tab.png',
            description: 'View technical specifications for your CRT display device.',
          }
        ]
      },
      {
        id: 'system_properties',
        title: 'System Properties',
        icon: Settings,
        description: 'The System Properties module in the Control Panel provides a comprehensive overview of your Vespera systems hardware and performance.',
        children: [
          {
            id: 'sys_general',
            title: 'General Settings',
            image: '/Help_Images/Control_Panel/System/system_general.png',
            description: 'Displays your OS version, build information, and a summary of your core hardware including CPU and RAM.',
          },
          {
            id: 'sys_device_mgr',
            title: 'Device Manager',
            image: '/Help_Images/Control_Panel/System/system_device_manager.png',
            description: 'An interactive tree view of all installed hardware. From here, you can view resources such as IRQs and DMA channels.',
            steps: [
              'Double-click a category to expand it.',
              'Select a device and click Properties, or double-click the device itself to view technical details.',
              'Right-click devices for advanced management options.'
            ]
          },
          {
             id: 'sys_hw_profiles',
             title: 'Hardware Profiles',
             image: '/Help_Images/Control_Panel/System/system_hardware_profiles.png',
             description: 'Manage boot configurations to start your system with specific hardware disabled. Useful for Safe Mode or diagnostic boots.',
          },
          {
             id: 'sys_user_profiles',
             title: 'User Profiles',
             image: '/Help_Images/Control_Panel/System/system_user_profiles.png',
             description: 'Displays a list of all user profiles registered on the active machine, allowing customized desktop settings per user.',
          },
          {
             id: 'sys_performance',
             title: 'Performance Monitor',
             image: '/Help_Images/Control_Panel/System/system_performance.png',
             description: 'Monitors real-time Shielding Stability and Heuristic Processor Load. Allows deep configuration of Virtual Memory and Environment Variables.',
          }
        ]
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: ShieldAlert,
    description: 'Guidance on resolving common system messages and restrictions.',
    children: [
      {
        id: 'system_violations',
        title: 'Addressing System Violations',
        description: 'A "System Violation" or "Access Denied" message occurs when an unauthorized action is attempted on protected files.',
        steps: [
          'Verify your account has Administrator privileges in the Control Panel.',
          'Ensure the target file is not currently locked by another system process.',
          'Some files in VESPERA\\SYSTEM require X-Type hardware keys to access.'
        ]
      },
      {
        id: 'errors',
        title: 'Common Errors',
        description: 'If the system hangs or a Kernel Panic occurs, perform a hard reset using the keyboard shortcut CTRL+ALT+SYS.',
      }
    ]
  }
];
