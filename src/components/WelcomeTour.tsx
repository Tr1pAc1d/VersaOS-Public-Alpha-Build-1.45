import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Monitor, Settings, Network, UserPlus, Info, ArrowLeft, ArrowRight, FolderOpen, Mail, Palette, Shield, Keyboard, CheckCircle, Volume2, VolumeX, SkipForward, Wrench } from 'lucide-react';
import { useVFS } from '../hooks/useVFS';

// ── Agent V SVG Skins (mirrored from VesperaAssistant) ─────────────────────
const AGENT_SKINS: Record<string, Record<string, string>> = {
  smiley: {
    open: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="28" fill="#fce94f" stroke="#000" stroke-width="2"/><circle cx="20" cy="24" r="4" fill="#000"/><circle cx="40" cy="24" r="4" fill="#000"/><path d="M 18 38 Q 30 46 42 38" stroke="#000" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
    blink: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="28" fill="#fce94f" stroke="#000" stroke-width="2"/><line x1="16" y1="24" x2="24" y2="24" stroke="#000" stroke-width="2.5" stroke-linecap="round"/><line x1="36" y1="24" x2="44" y2="24" stroke="#000" stroke-width="2.5" stroke-linecap="round"/><path d="M 18 38 Q 30 46 42 38" stroke="#000" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
    thinking: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="28" fill="#fce94f" stroke="#000" stroke-width="2"/><circle cx="20" cy="24" r="4" fill="#000"/><circle cx="40" cy="24" r="4" fill="#000"/><circle cx="30" cy="40" r="4" fill="#000"/></svg>`,
  },
  classic: {
    open: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M 5 30 Q 30 5 55 30 Q 30 55 5 30" fill="white" stroke="#000080" stroke-width="3"/><circle cx="30" cy="30" r="10" fill="#000080"/><circle cx="32" cy="28" r="3" fill="#fff"/></svg>`,
    blink: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M 5 30 Q 30 25 55 30 Q 30 35 5 30" fill="white" stroke="#000080" stroke-width="3"/><line x1="15" y1="30" x2="45" y2="30" stroke="#000080" stroke-width="2" stroke-linecap="round"/></svg>`,
    thinking: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M 5 30 Q 30 5 55 30 Q 30 55 5 30" fill="white" stroke="#000080" stroke-width="3"/><circle cx="30" cy="30" r="10" fill="#000080"/><circle cx="32" cy="28" r="3" fill="#f00"/></svg>`,
  },
  robot: {
    open: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="40" height="40" rx="4" fill="#c0c0c0" stroke="#000" stroke-width="2"/><rect x="18" y="22" width="8" height="6" fill="#00ff00" stroke="#000"/><rect x="34" y="22" width="8" height="6" fill="#00ff00" stroke="#000"/><path d="M 22 40 L 38 40" stroke="#000" stroke-width="2" stroke-linecap="round"/><line x1="30" y1="10" x2="30" y2="2" stroke="#000" stroke-width="2"/><circle cx="30" cy="2" r="3" fill="#ff0000"/></svg>`,
    blink: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="40" height="40" rx="4" fill="#c0c0c0" stroke="#000" stroke-width="2"/><rect x="18" y="24" width="8" height="2" fill="#000"/><rect x="34" y="24" width="8" height="2" fill="#000"/><path d="M 22 40 L 38 40" stroke="#000" stroke-width="2" stroke-linecap="round"/><line x1="30" y1="10" x2="30" y2="2" stroke="#000" stroke-width="2"/><circle cx="30" cy="2" r="3" fill="#ff0000"/></svg>`,
    thinking: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="40" height="40" rx="4" fill="#c0c0c0" stroke="#000" stroke-width="2"/><rect x="18" y="22" width="8" height="6" fill="#ffff00" stroke="#000"/><rect x="34" y="22" width="8" height="6" fill="#ffff00" stroke="#000"/><path d="M 26 40 L 34 40 M 22 40 L 22 40 M 38 40 L 38 40" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-dasharray="2,2"/><line x1="30" y1="10" x2="30" y2="2" stroke="#000" stroke-width="2"/><circle cx="30" cy="2" r="3" fill="#ffff00"/></svg>`,
  }
};

// ── Tour Step Data ──────────────────────────────────────────────────────────
interface TourStep {
  id: string;
  title: string;
  icon: React.FC<{ size?: number; className?: string }>;
  narration: string;
  content: (ctx: { onLaunch: (id: string) => void }) => React.ReactNode;
}

// ── Shared screenshot frame component ──────────────────────────────────────
const HelpImg = ({ src, caption }: { src: string; caption: string }) => (
  <div className="p-2 bg-gray-200 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-md">
    <img
      src={src}
      alt={caption}
      className="max-w-full h-auto"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
    <p className="text-[10px] text-gray-600 mt-1 italic text-center">{caption}</p>
  </div>
);

const TOUR_STEPS: TourStep[] = [
  // ── 1. Intro ─────────────────────────────────────────────────────────────
  {
    id: 'intro',
    title: 'Welcome to Vespera OS',
    icon: Monitor,
    narration: "Welcome to Vespera OS 4.0! I'm Agent V, your desktop companion. This operating system was designed from the ground up for maximum productivity and multimedia integration. Let me walk you through the basics. You can access all of your applications and files through the Start Menu in the taskbar — that's the Vespera logo in the bottom-left corner. You can also double-click icons on the desktop to launch applications. Let's get started!",
    content: () => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Vespera OS: The Future is Now</h2>
        <p>
          Welcome to <strong>Vespera OS 4.0</strong>, the premier operating system designed for maximum productivity and multimedia integration. This tour will introduce you to the core features of your new desktop environment.
        </p>
        <p>
          Vespera OS provides a unified workspace interface. All of your installed applications and files can be accessed via the main <strong>Start Menu</strong> (Vespera logo) in the taskbar.
        </p>
        <div className="bg-[#ffffcc] border border-gray-400 p-3 mt-2 shadow-sm text-xs font-mono">
          <strong>TIP:</strong> You can double-click icons on the desktop to launch applications, or use the File Manager to browse the C:\ drive.
        </div>
      </div>
    )
  },

  // ── 2. Desktop ───────────────────────────────────────────────────────────
  {
    id: 'desktop',
    title: 'Your Desktop',
    icon: Monitor,
    narration: "This is your desktop — your personal workspace. You'll see shortcut icons here for commonly used applications. You can right-click anywhere on the empty desktop to access the Workspace Menu, which gives you quick access to programs, display settings, and system tools. You can also drag icons around to rearrange them however you like — your layout is saved automatically!",
    content: ({ onLaunch }) => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Your Personal Workspace</h2>
        <p>
          The desktop is your primary workspace in Vespera OS. You'll find <strong>shortcut icons</strong> here for commonly used applications like the File Manager, Web Browser, and System Tools.
        </p>
        <HelpImg src="/Help_Images/More/desktop right click context menu - menu help.png" caption="Right-clicking the desktop opens the Workspace Context Menu." />
        <div className="flex flex-col gap-2 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <p className="font-bold text-[#000080] mb-1">Desktop Tips:</p>
          <ul className="list-disc pl-5 text-xs text-gray-700 space-y-1">
            <li><strong>Right-click</strong> on empty desktop space to open the <strong>Workspace Menu</strong>.</li>
            <li><strong>Drag icons</strong> to rearrange them — your layout is saved automatically.</li>
            <li><strong>Double-click</strong> any icon to launch that application.</li>
            <li>Create new <strong>shortcuts</strong> via the Workspace Menu → New → Shortcut.</li>
          </ul>
        </div>
        <HelpImg src="/Help_Images/More/right clicking task menu - context menu - help menu.png" caption="Right-clicking the Taskbar opens a separate context menu for window and taskbar management." />
        <div className="bg-[#ffffcc] border border-gray-400 p-3 mt-2 shadow-sm text-xs font-mono">
          <strong>TIP:</strong> The Workspace Menu is your fastest route to programs, system tools, and display settings without opening the Start Menu.
        </div>
      </div>
    )
  },

  // ── 3. Taskbar ───────────────────────────────────────────────────────────
  {
    id: 'taskbar',
    title: 'The Taskbar',
    icon: Monitor,
    narration: "The taskbar at the bottom of your screen is your mission control. On the left is the Vespera Start Menu. In the center you'll see buttons for every open application. On the right is the system tray with the clock. Vespera OS also has a Full-Span mode that stretches the taskbar across the entire screen edge — great for a traditional desktop feel. And the WaveBar audio visualizer pulses in real time with your system audio!",
    content: () => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Your Mission Control</h2>
        <p>
          The <strong>Taskbar</strong> spans the bottom of the screen and is the nerve center of Vespera OS. It hosts the Start Menu, open application buttons, and the system tray.
        </p>
        <HelpImg src="/Help_Images/More/task menu when not spanning entire screen and floating - menu help.png" caption="Default floating taskbar — centered at the bottom of the screen." />
        <HelpImg src="/Help_Images/More/Task Menu Span Entire Screen - Help Menu.png" caption="Full-Span mode stretches the taskbar to cover the entire screen edge." />
        <HelpImg src="/Help_Images/More/Vespera Wave bar 1 - menu Help.png" caption="The WaveBar audio visualizer animates in real time with your system audio." />
        <HelpImg src="/Help_Images/More/Position Settings for Task Menu and Bar - Help Menu.png" caption="Taskbar position and layout settings — right-click the taskbar to access." />
        <div className="bg-[#ffffcc] border border-gray-400 p-3 mt-2 shadow-sm text-xs font-mono">
          <strong>TIP:</strong> Right-click the Taskbar to access Task Manager quickly, or to open Taskbar Settings and change position and appearance.
        </div>
      </div>
    )
  },

  // ── 4. Start Menu ────────────────────────────────────────────────────────
  {
    id: 'start_menu',
    title: 'The Start Menu',
    icon: Monitor,
    narration: "The Start Menu is your gateway to everything on Vespera OS! Click the Vespera logo in the bottom-left to open it. From there, you can browse Programs to see all installed applications organized into folders — Games, Accessories, Multimedia, System Tools, and more. The clock and system tray show your current time and active background services. You can also pin frequently used programs to the Shortcuts quick-launch area.",
    content: () => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Everything Starts Here</h2>
        <p>
          The <strong>Start Menu</strong> (Vespera logo) is your primary launcher. It provides access to all installed programs, system settings, and administrative tools.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <HelpImg src="/Help_Images/Control_Panel/Task_Menu/task_menu_start.png" caption="The Start Menu open at the top level." />
          <HelpImg src="/Help_Images/Control_Panel/Task_Menu/task_menu_programs.png" caption="Programs submenu showing installed app groups." />
          <HelpImg src="/Help_Images/Control_Panel/Task_Menu/Task_Menu_System_apps.png" caption="System Tools submenu with admin utilities." />
          <HelpImg src="/Help_Images/Control_Panel/Task_Menu/task_menu_clock.png" caption="System clock in the taskbar tray." />
        </div>
        <HelpImg src="/Help_Images/Control_Panel/Task_Menu/task_menu_Shortcuts.png" caption="Shortcuts quick-launch area for pinned apps." />
      </div>
    )
  },

  // ── 5. Files ─────────────────────────────────────────────────────────────
  {
    id: 'files',
    title: 'Managing Your Files',
    icon: FolderOpen,
    narration: "Vespera OS uses an advanced Virtual File System to store your documents, images, and settings safely. Use the File Explorer to browse your C drive, create new folders, and manage your personal data. Your key directories include the Desktop folder for workspace items, the Documents folder for your personal files, and the Vespera system directory for core OS configurations. You can right-click any file to copy, move, rename, or delete it. Everything persists across reboots!",
    content: ({ onLaunch }) => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">The Virtual File System</h2>
        <p>
          Vespera OS uses an advanced <strong>Virtual File System (VFS)</strong> to store your documents, images, and settings safely within your local environment.
        </p>
        <HelpImg src="/Help_Images/More/File Manager C drive screenshot - help menu.png" caption="File Manager showing the root of the C: drive." />
        <HelpImg src="/Help_Images/More/File Manager C drive slash vespera - help menu.png" caption="Browsing the C:\Vespera system directory." />
        <HelpImg src="/Help_Images/More/right clicking a file - context menu - help menu.png" caption="Right-clicking a file shows cut, copy, delete, rename, and properties options." />
        <HelpImg src="/Help_Images/More/hidden system files screenshot - file manager - menu help.png" caption='Enable "Show hidden files" in View options to reveal protected system files.' />
        <div className="flex flex-col gap-2 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <p className="font-bold text-[#000080] mb-1">Standard Directories:</p>
          <ul className="list-disc pl-5 text-xs text-gray-700 space-y-1">
            <li><strong>C:\Users\Public\Desktop</strong> — Items visible on your main workspace.</li>
            <li><strong>C:\Users\Public\Documents</strong> — Your personal text notes and saved work.</li>
            <li><strong>C:\Vespera</strong> — Core OS system files and configurations.</li>
          </ul>
        </div>
      </div>
    )
  },

  // ── 6. Recycle Bin ───────────────────────────────────────────────────────
  {
    id: 'recycle_bin',
    title: 'The Recycle Bin',
    icon: FolderOpen,
    narration: "When you delete a file in Vespera OS, it doesn't disappear immediately — it goes to the Recycle Bin! The Bin icon on your desktop changes appearance to show when it contains items. You can open it to review deleted files and restore anything you deleted by mistake. When you're sure you no longer need those files, right-click the Bin and choose Empty Recycle Bin to free up disk space permanently.",
    content: () => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Your Safety Net</h2>
        <p>
          The <strong>Recycle Bin</strong> catches all deleted files, giving you a chance to recover them before they're gone for good. It's one of the most important safety features of Vespera OS.
        </p>
        <div className="flex gap-3">
          <div className="flex-1">
            <HelpImg src="/Help_Images/More/Recycle bin empty - menu help.png" caption="Empty — no deleted files." />
          </div>
          <div className="flex-1">
            <HelpImg src="/Help_Images/More/Recycle bin full - menu help.png" caption="Full — contains deleted files." />
          </div>
        </div>
        <HelpImg src="/Help_Images/More/recycling bin - menu help.png" caption="Inside the Recycle Bin — right-click any file to restore it." />
        <div className="flex flex-col gap-2 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <ul className="list-disc pl-5 text-xs text-gray-700 space-y-1">
            <li>Delete a file by pressing <strong>Delete</strong> or right-clicking → Delete.</li>
            <li>Double-click the Recycle Bin to open it and see what's inside.</li>
            <li>Right-click a file inside the Bin and choose <strong>Restore</strong> to recover it.</li>
            <li>Right-click the Bin on the Desktop → <strong>Empty Recycle Bin</strong> to permanently delete all contents.</li>
          </ul>
        </div>
      </div>
    )
  },

  // ── 7. Network ───────────────────────────────────────────────────────────
  {
    id: 'network',
    title: 'Connecting to VesperaNET',
    icon: Network,
    narration: "Ready to surf the World Wide Web? Vespera OS features integrated Dial-Up Networking, perfectly configured for connecting to VesperaNET global nodes. First, open the Dial-Up Networking application and establish a connection. Once you hear that beautiful modem handshake, you can launch the Vespera Navigator web browser. You can also use VesperaConnect for encrypted remote desktop access to secure archive terminals.",
    content: ({ onLaunch }) => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">The Information Superhighway</h2>
        <p>
          Ready to surf the World Wide Web? Vespera OS features integrated <strong>Dial-Up Networking</strong> perfectly configured for connecting to VesperaNET global nodes.
        </p>
        <HelpImg src="/Help_Images/More/VesperaNet Dail-Up Connection - disconnected - menu help.png" caption='Dial-Up Networking — click "Dial Connection" to connect.' />
        <HelpImg src="/Help_Images/More/VesperaNet Dail-Up Connection - Connected - menu help.png" caption="Successfully connected to VesperaNET — ready to browse!" />
        <HelpImg src="/Help_Images/More/VesperaConnect - Remote Desktop login screen - Help Menu.png" caption="VesperaConnect — login to a remote terminal over VesperaNET." />
        <HelpImg src="/Help_Images/More/VesperaConnect - Remote Desktop connected - Help Menu.png" caption="Active VesperaConnect session showing the remote terminal desktop." />
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <p className="font-bold text-[#000080] mb-2">Getting Online:</p>
          <ol className="list-decimal pl-5 space-y-1 text-xs text-gray-700">
            <li>Open <strong>Dial-Up Networking</strong> from System Tools.</li>
            <li>Click "Dial Connection" to initiate the modem handshake.</li>
            <li>Wait for the secure authorization token to complete.</li>
            <li>Launch <strong>Vespera Navigator</strong> and start browsing!</li>
          </ol>
        </div>
      </div>
    )
  },

  // ── 8. VMail ─────────────────────────────────────────────────────────────
  {
    id: 'mail',
    title: 'VMail Communication',
    icon: Mail,
    narration: "VMail is your central hub for corporate and personal communications within the Vespera environment. Keep an eye out for important system bulletins and messages — they arrive automatically! The VMail client continuously syncs in the background, and you'll receive native alerts with a notification sound whenever new mail arrives. I'll even let you know personally when something new lands in your inbox!",
    content: ({ onLaunch }) => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Stay Connected</h2>
        <p>
          <strong>VMail</strong> is your central hub for corporate and personal communications within the Vespera environment. Keep an eye out for important system bulletins and messages.
        </p>
        <p>
          The VMail client continuously syncs in the background, ensuring you receive alerts natively through the operating system with a notification sound and pop-up dispatch.
        </p>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => onLaunch('vmail')}
            className="flex items-center gap-2 bg-[#c0c0c0] px-6 py-2 font-bold text-[#000080] border-[3px] border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
          >
            <Mail size={18} /> Open VMail Client
          </button>
        </div>
      </div>
    )
  },

  // ── 9. VStore ────────────────────────────────────────────────────────────
  {
    id: 'vstore',
    title: 'The VStore Catalyst',
    icon: UserPlus,
    narration: "Need more applications? The VStore Catalyst is a cloud-based software repository directly integrated into the operating system. Thousands of shareware and freeware titles are available for download. You can find graphic editors, games, productivity tools, and more. To purchase premium programs or track your download history, you'll need an active network connection and a VStore account.",
    content: ({ onLaunch }) => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Software at Your Fingertips</h2>
        <p>
          Need more applications? The <strong>VStore Catalyst</strong> is a cloud-based software repository directly integrated into the operating system. Thousands of shareware and freeware titles are available.
        </p>
        <HelpImg src="/Help_Images/More/vstore - main menu screenshot - menu help.png" caption="The VStore Catalyst main directory — browse and install software in one click." />
        <HelpImg src="/Help_Images/More/add or remove programs 1 - help menu.png" caption="Add or Remove Programs — manage all installed applications." />
        <HelpImg src="/Help_Images/More/add or remove programs example of uninstall wizard - help menu.png" caption="The uninstall wizard walks you through removing an application." />
        <p>
          To purchase premium programs or track your digital download history, you need an active network connection and a VStore account.
        </p>
        <div className="flex justify-center mt-4 border-t border-gray-400 pt-4">
          <button
            onClick={() => onLaunch('vstore')}
            className="flex items-center gap-2 bg-[#000080] text-white px-6 py-2 font-bold border-[3px] border-t-blue-400 border-l-blue-400 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 hover:bg-blue-800"
          >
            <UserPlus size={18} /> Launch VStore Directory
          </button>
        </div>
      </div>
    )
  },

  // ── 10. Multimedia ───────────────────────────────────────────────────────
  {
    id: 'multimedia',
    title: 'Multimedia Capabilities',
    icon: Palette,
    narration: "Vespera OS isn't just for business! We feature top-of-the-line multimedia capabilities. AxisPaint is a powerful bitmap graphics editor for creating art and UI prototypes. Meridian. TV lets you tune into cable television broadcasts right from your desktop through the integrated Channel Guide — including the Weather Channel with live radar! And Neural Solitaire is our built-in card game for when you need a break. Creative professionals rejoice!",
    content: ({ onLaunch }) => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Create & Consume</h2>
        <p>
          Vespera OS isn't just for business. We feature top-of-the-line multimedia capabilities seamlessly integrated into the desktop shell.
        </p>
        <HelpImg src="/Help_Images/More/Meridian TV app - Confirm and connect screen - help menu.png" caption='Meridian.TV — confirm and connect to a broadcast channel.' />
        <HelpImg src="/Help_Images/More/Meridian Tv App - Screenshot channel - help menu.png" caption="Meridian.TV displaying a live broadcast channel on your desktop." />
        <HelpImg src="/Help_Images/More/Weather channel app - meridian tv - help menu.png" caption="The Weather Channel viewable through Meridian.TV." />
        <HelpImg src="/Help_Images/More/Solitare screenshot main menu - help menu.png" caption="Neural Solitaire — the built-in card game." />
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>AxisPaint:</strong> A powerful bitmap graphics editor for UI prototyping and artistic endeavors.</li>
          <li><strong>Meridian.TV:</strong> Tune into cable television broadcasts and the Weather Channel live.</li>
          <li><strong>Neural Solitaire:</strong> Classic Klondike solitaire with authentic pixel-art cards.</li>
          <li><strong>VERSA Media Agent:</strong> Play audio files with full waveform visualization.</li>
          <li><strong>WaveBar:</strong> Quick access to volume sliders directly in the system tray.</li>
        </ul>
      </div>
    )
  },

  // ── 11. Customization ────────────────────────────────────────────────────
  {
    id: 'customization',
    title: 'Customizing Your Desktop',
    icon: Settings,
    narration: "Make Vespera OS truly yours! The Control Panel lets you change everything from your desktop wallpaper to window border themes via Plus! Themes. Configure screen resolution, run the screensaver, swap out mouse cursors, and change the taskbar color scheme. You can even assign custom icons to any shortcut. I personally recommend the starfield screensaver — it really makes it feel like you're flying through space!",
    content: ({ onLaunch }) => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Make it Yours</h2>
        <p>
          Vespera OS includes a highly flexible <strong>Control Panel</strong> that allows you to change everything from your desktop wallpaper to window border themes.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <HelpImg src="/Help_Images/More/Screen Saver Options control panel - Help menu.png" caption="Screen saver configuration options." />
          <HelpImg src="/Help_Images/More/control panel - plus themes options - help menu.png" caption="Plus! Themes for full visual style packs." />
          <HelpImg src="/Help_Images/More/control panel - cursor options - menu help.png" caption="Mouse cursor customization panel." />
          <HelpImg src="/Help_Images/More/Properties change icon screenshot - menu help.png" caption="Assign custom icons to any shortcut via Properties." />
        </div>
        <HelpImg src="/Help_Images/More/properties change icon choose icon screenshot - menu help.png" caption="The icon picker showing the full Vespera retro icon library." />
        <div className="grid grid-cols-2 gap-3">
          <HelpImg src="/Help_Images/Control_Panel/Task_Menu/black_Task_Menu.png" caption="Dark taskbar theme example." />
          <HelpImg src="/Help_Images/Control_Panel/Task_Menu/teal_task_menu_to_showcase_diff_options.png" caption="Teal taskbar theme example." />
        </div>
        <div className="flex justify-center mt-4 border-t border-gray-400 pt-4">
          <button
            onClick={() => onLaunch('control_panel')}
            className="flex items-center gap-2 bg-[#c0c0c0] px-6 py-2 font-bold text-[#000080] border-[3px] border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
          >
            <Settings size={18} /> Open Control Panel
          </button>
        </div>
      </div>
    )
  },

  // ── 12. System Utilities ─────────────────────────────────────────────────
  {
    id: 'system',
    title: 'System Utilities',
    icon: Shield,
    narration: "For power users, Vespera OS includes robust administrative tools. The Task Manager is your go-to utility for monitoring system health — it has three tabs. The Applications tab shows every running program and lets you end unresponsive tasks. The Performance tab displays real-time CPU, RAM, and hard disk usage with live graphs. VesperaConnect lets you reach remote terminals. And the System Properties panel gives you deep hardware information.",
    content: ({ onLaunch }) => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Under the Hood</h2>
        <p>
          For power users, Vespera OS includes robust administrative and tracking tools to monitor the environment's health.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <HelpImg src="/Help_Images/Control_Panel/System/system_general.png" caption="System Properties — General tab showing OS version and hardware." />
          <HelpImg src="/Help_Images/Control_Panel/System/system_device_manager.png" caption="Device Manager — view and manage all hardware devices." />
          <HelpImg src="/Help_Images/Control_Panel/System/system_performance.png" caption="Performance tab — shielding stability and heuristic processor load." />
          <HelpImg src="/Help_Images/More/add or remove programs 1 - help menu.png" caption="Add or Remove Programs — manage installed applications." />
        </div>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>Task Manager:</strong> Monitor running applications, CPU/RAM/HDD in real time, and configure startup programs.</li>
          <li><strong>Disk Defragmenter:</strong> Reorganize your hard drive sectors for optimal performance.</li>
          <li><strong>ScanDisk:</strong> Check your drive for errors and bad sectors.</li>
          <li><strong>VesperaConnect:</strong> Establish remote desktop sessions to secure archive terminals.</li>
          <li><strong>Add or Remove Programs:</strong> Manage installed software and run the uninstall wizard.</li>
        </ul>
        <div className="flex justify-center mt-2 border-t border-gray-400 pt-3">
          <button
            onClick={() => onLaunch('task_manager')}
            className="flex items-center gap-2 bg-[#c0c0c0] px-6 py-2 font-bold text-[#000080] border-[3px] border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
          >
            <Shield size={18} /> Open Task Manager
          </button>
        </div>
        <div className="bg-[#ffffcc] border border-gray-400 p-3 mt-1 shadow-sm text-xs font-mono">
          <strong>TIP:</strong> Right-click the taskbar at any time for quick access to the Task Manager, or press ⊞+R and type "taskmgr".
        </div>
        <div className="bg-red-900 border border-red-600 text-white p-3 mt-2 shadow-sm text-xs font-mono">
          <strong>SECURITY NOTICE:</strong> All network traffic on this machine is continually monitored by the RHID (Remote Host Intrusion Detection) module.
        </div>
      </div>
    )
  },

  // ── 13. Aetheris Workbench ────────────────────────────────────────────────
  {
    id: 'workbench',
    title: 'Aetheris Workbench Pro',
    icon: Wrench,
    narration: "For developers and power users, Vespera OS includes Aetheris Workbench Pro — a professional IDE for building your own applications! You can write JavaScript code using the System API to create custom apps with dialogs, window controls, and error handling. The Workbench validates your code, helps you manage project files, and even publishes directly to the VStore where other users can install your creations. It's a complete development environment right on your desktop!",
    content: ({ onLaunch }) => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Build Your Own Apps</h2>
        <p>
          <strong>Aetheris Workbench Pro</strong> is the professional integrated development environment for creating Vespera OS applications. Write, test, compile, and publish — all from one tool.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <HelpImg src="/Help_Images/More/VStore_Dev/Page One of making app for VStore - Help menu.png" caption="Workbench project setup — define your app's name, version, and category." />
          <HelpImg src="/Help_Images/More/VStore_Dev/Page Three of making app for VStore - Help menu.png" caption="The code editor with syntax highlighting and project file management." />
        </div>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li><strong>Code Editor:</strong> Write JavaScript with line numbers and syntax highlighting.</li>
          <li><strong>System API:</strong> Use System.alert(), System.confirm(), and System.reportError() for user interaction.</li>
          <li><strong>Project Files:</strong> Organize multiple files with descriptions in your project.</li>
          <li><strong>Live Preview:</strong> Test your app before publishing with the built-in preview.</li>
          <li><strong>One-Click Publish:</strong> Submit your app directly to the VStore Catalyst catalog.</li>
        </ul>
        <div className="bg-[#e6ffe6] border border-green-400 p-3 mt-2 shadow-sm text-xs">
          <strong>Developer Feature:</strong> Your published apps appear in VStore → Community Apps where other users can discover and install them!
        </div>
        <div className="flex justify-center mt-2 border-t border-gray-400 pt-3">
          <button
            onClick={() => onLaunch('workbench')}
            className="flex items-center gap-2 bg-[#c0c0c0] px-6 py-2 font-bold text-[#000080] border-[3px] border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
          >
            <Wrench size={18} /> Open Aetheris Workbench
          </button>
        </div>
      </div>
    )
  },

  // ── 14. Keyboard Shortcuts ───────────────────────────────────────────────
  {
    id: 'keyboard',
    title: 'Keyboard Shortcuts',
    icon: Keyboard,
    narration: "Let me share some keyboard shortcuts that will make you a Vespera power user in no time. Press the Windows key plus R to open the Run dialog — from there you can type any program name to launch it instantly. You can also resize, drag, and manage windows with the title bar buttons. And here's a fun one: try clicking on me five times really fast. I dare you!",
    content: () => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Power User Shortcuts</h2>
        <p>Master these keyboard shortcuts to navigate Vespera OS like a pro:</p>
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-inner">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#000080] text-white">
                <th className="text-left p-2 font-bold">Shortcut</th>
                <th className="text-left p-2 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200"><td className="p-2 font-mono font-bold">⊞ Win + R</td><td className="p-2">Open Run Dialog</td></tr>
              <tr className="border-b border-gray-200 bg-gray-50"><td className="p-2 font-mono font-bold">Title Bar Drag</td><td className="p-2">Move a window</td></tr>
              <tr className="border-b border-gray-200"><td className="p-2 font-mono font-bold">Edge Drag</td><td className="p-2">Resize a window</td></tr>
              <tr className="border-b border-gray-200 bg-gray-50"><td className="p-2 font-mono font-bold">□ Button</td><td className="p-2">Maximize / Restore window</td></tr>
              <tr className="border-b border-gray-200"><td className="p-2 font-mono font-bold">_ Button</td><td className="p-2">Minimize to taskbar</td></tr>
              <tr className="border-b border-gray-200 bg-gray-50"><td className="p-2 font-mono font-bold">Right-click Desktop</td><td className="p-2">Open Workspace Menu</td></tr>
              <tr className="bg-gray-50"><td className="p-2 font-mono font-bold">Right-click Taskbar</td><td className="p-2">Task Manager & Settings</td></tr>
            </tbody>
          </table>
        </div>
        <div className="bg-[#ffffcc] border border-gray-400 p-3 mt-2 shadow-sm text-xs font-mono">
          <strong>TIP:</strong> The Run dialog (⊞+R) is the fastest way to launch any application. Try typing "browser", "files", or "defrag"!
        </div>
      </div>
    )
  },

  // ── 14. Goodbye ──────────────────────────────────────────────────────────
  {
    id: 'goodbye',
    title: "You're All Set!",
    icon: CheckCircle,
    narration: "And that's the tour! You're now equipped with everything you need to navigate Vespera OS like a pro. Feel free to explore at your own pace. I'll still be around on the desktop if you need help — just click on me anytime. Remember, you can always re-run this tour from the Start Menu under Accessories. Welcome aboard, and enjoy Vespera OS!",
    content: ({ onLaunch }) => (
      <div className="flex flex-col gap-4 text-sm font-serif leading-relaxed text-black">
        <h2 className="text-2xl font-bold text-[#000080] border-b-2 border-gray-400 pb-2">Welcome Aboard!</h2>
        <p>
          You're now equipped with everything you need to navigate <strong>Vespera OS</strong> like a pro. Feel free to explore at your own pace — Agent V will always be around on the desktop if you need help.
        </p>
        <div className="bg-[#e6ffe6] border border-green-400 p-3 mt-2 shadow-sm text-xs">
          <strong>✓</strong> You can re-run this tour at any time from the <strong>Start Menu → Accessories → Welcome Tour</strong>.
        </div>
        <p className="font-bold text-[#000080] mt-4">Quick Launch:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {[
            { id: 'files', label: '📁 File Manager' },
            { id: 'browser', label: '🌐 Web Browser' },
            { id: 'control_panel', label: '⚙️ Control Panel' },
            { id: 'vstore', label: '🛒 VStore' },
            { id: 'help', label: '❓ Help Viewer' },
          ].map(app => (
            <button
              key={app.id}
              onClick={() => onLaunch(app.id)}
              className="text-xs bg-[#c0c0c0] px-3 py-1.5 font-bold text-[#000080] border-[2px] border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white hover:bg-[#d0d0d0]"
            >
              {app.label}
            </button>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-300 text-center text-xs text-gray-500 font-mono">
          Vespera OS 4.0 — © 1997 Vespera Systems, a division of Axis Innovations Inc.
          <br />All rights reserved.
        </div>
      </div>
    )
  },
];

// ── Props ───────────────────────────────────────────────────────────────────
interface WelcomeTourProps {
  onClose: () => void;
  onLaunchApp?: (appId: string) => void;
  agentVSkin?: 'classic' | 'robot' | 'smiley';
  agentVSpeak?: boolean;
}

// ── Component ───────────────────────────────────────────────────────────────
export const WelcomeTour: React.FC<WelcomeTourProps> = ({ onClose, onLaunchApp, agentVSkin = 'classic', agentVSpeak = false }) => {
  const { displaySettings, updateWelcomeTour } = useVFS();
  const [phase, setPhase] = useState<'splash' | 'tour'>('splash');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showNextTime, setShowNextTime] = useState(displaySettings.showWelcomeTour);
  const [guidedMode, setGuidedMode] = useState(false);
  const [muted, setMuted] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));
  const [narrationText, setNarrationText] = useState('');
  const [isNarrating, setIsNarrating] = useState(false);
  const [agentExpression, setAgentExpression] = useState<'open' | 'blink' | 'thinking'>('open');

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeStep = TOUR_STEPS[currentStepIndex];
  const skinSvgs = AGENT_SKINS[agentVSkin] || AGENT_SKINS.classic;

  // ── Blink animation ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'tour') return;
    blinkTimerRef.current = setInterval(() => {
      if (!isNarrating) {
        setAgentExpression('blink');
        setTimeout(() => setAgentExpression('open'), 150);
      }
    }, 2500 + Math.random() * 3000);
    return () => {
      if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
    };
  }, [phase, isNarrating]);

  // ── Stop narration helper ─────────────────────────────────────────────
  const stopNarration = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
      typewriterRef.current = null;
    }
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setIsNarrating(false);
    utteranceRef.current = null;
  }, []);

  // ── Start narration for current step ──────────────────────────────────
  const startNarration = useCallback((step: TourStep) => {
    stopNarration();

    const text = step.narration;
    setNarrationText('');
    setIsNarrating(true);
    setAgentExpression('thinking');

    // Typewriter effect
    let charIndex = 0;
    typewriterRef.current = setInterval(() => {
      charIndex++;
      setNarrationText(text.slice(0, charIndex));
      if (charIndex >= text.length) {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      }
    }, 25);

    // Speech synthesis (if not muted)
    if (!muted && 'speechSynthesis' in window) {
      setTimeout(() => setAgentExpression('open'), 400);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.1;
      utterance.rate = 0.95;
      utteranceRef.current = utterance;

      utterance.onend = () => {
        setIsNarrating(false);
        setAgentExpression('open');
        // Auto advance if enabled
        if (autoAdvance) {
          autoAdvanceTimerRef.current = setTimeout(() => {
            setCurrentStepIndex(prev => {
              if (prev < TOUR_STEPS.length - 1) return prev + 1;
              return prev;
            });
          }, 1500);
        }
      };

      utterance.onerror = () => {
        setIsNarrating(false);
        setAgentExpression('open');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // No speech — just typewriter, auto-advance after typewriter finishes
      setTimeout(() => setAgentExpression('open'), 400);
      const durationMs = text.length * 25 + 500;
      setTimeout(() => {
        setIsNarrating(false);
        setAgentExpression('open');
        if (autoAdvance && guidedMode) {
          autoAdvanceTimerRef.current = setTimeout(() => {
            setCurrentStepIndex(prev => {
              if (prev < TOUR_STEPS.length - 1) return prev + 1;
              return prev;
            });
          }, 1500);
        }
      }, durationMs);
    }
  }, [muted, autoAdvance, guidedMode, stopNarration]);

  // ── Narrate on step change (guided mode only) ────────────────────────
  useEffect(() => {
    if (phase === 'tour' && guidedMode) {
      startNarration(TOUR_STEPS[currentStepIndex]);
    } else {
      setNarrationText('');
      setIsNarrating(false);
    }
    // Track visited
    setVisitedSteps(prev => new Set(prev).add(currentStepIndex));
  }, [currentStepIndex, phase]); // intentionally limited deps to avoid re-trigger on mute/autoAdvance change

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopNarration();
    };
  }, [stopNarration]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleStartGuided = () => {
    setGuidedMode(true);
    setMuted(false);
    setPhase('tour');
  };

  const handleStartSilent = () => {
    setGuidedMode(false);
    setMuted(true);
    setPhase('tour');
  };

  const handleNext = () => {
    stopNarration();
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    stopNarration();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleStepClick = (index: number) => {
    stopNarration();
    setCurrentStepIndex(index);
  };

  const handleClose = () => {
    stopNarration();
    if (showNextTime !== displaySettings.showWelcomeTour) {
      updateWelcomeTour(showNextTime);
    }
    onClose();
  };

  const handleToggleMute = () => {
    if (!muted) {
      // Muting — cancel current speech
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
    setMuted(!muted);
  };

  // ── Splash Screen ────────────────────────────────────────────────────
  if (phase === 'splash') {
    return (
      <div className="w-full h-full flex flex-col bg-[#c0c0c0] font-sans text-black select-none">
        {/* Blue gradient header */}
        <div className="bg-gradient-to-r from-[#000080] to-[#3a6ea5] p-6 flex items-center gap-5 shadow-md">
          <div className="bg-white p-3 rounded-full shadow-inner border-2 border-gray-400">
            <Info size={36} className="text-[#000080]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-wider text-white" style={{ textShadow: '2px 2px 0 #000' }}>Welcome to Vespera OS</h1>
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mt-1">Getting Started Tour</p>
          </div>
        </div>

        {/* Splash content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
          {/* Agent V greeting */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16" dangerouslySetInnerHTML={{ __html: skinSvgs.open }} />
            <div className="max-w-md bg-[#ffffee] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-4 shadow-md relative text-sm">
              <div className="flex items-center gap-1 mb-2">
                <span className="font-bold text-[10px] text-[#000080]">ℹ️ Agent V</span>
              </div>
              <p>Hello! I'm <strong>Agent V</strong>, your desktop companion. I'll be guiding you through the features of <strong>Vespera OS 4.0</strong>.</p>
              <p className="mt-2">Would you like me to <strong>read each page aloud</strong> as we go, or would you prefer to read at your own pace?</p>
              {/* Speech bubble tail */}
              <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-[#ffffee]" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleStartGuided}
              className="flex items-center gap-2 bg-[#000080] text-white px-8 py-3 font-bold text-sm border-[3px] border-t-blue-400 border-l-blue-400 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 hover:bg-blue-800 shadow-md"
            >
              <Volume2 size={18} /> 🔊 Start Guided Tour
            </button>
            <button
              onClick={handleStartSilent}
              className="flex items-center gap-2 bg-[#c0c0c0] px-8 py-3 font-bold text-sm text-[#000080] border-[3px] border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white hover:bg-[#d0d0d0] shadow-md"
            >
              <VolumeX size={18} /> 📖 Start Silent Tour
            </button>
          </div>

          {/* Skip entirely */}
          <button
            onClick={handleClose}
            className="text-xs text-gray-500 hover:text-gray-700 hover:underline mt-2"
          >
            Skip tour entirely
          </button>
        </div>

        {/* Footer */}
        <div className="bg-[#ececec] border-t-2 border-t-gray-400 px-4 py-2 text-center shrink-0 shadow-[inset_0_1px_0_#fff]">
          <span className="text-[10px] text-gray-500 font-mono">Vespera OS 4.0 — © 1997 Vespera Systems, a division of Axis Innovations Inc.</span>
        </div>
      </div>
    );
  }

  // ── Tour Phase ───────────────────────────────────────────────────────
  const progressPct = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="w-full h-full flex flex-col bg-[#c0c0c0] font-sans text-black select-none">

      {/* Title Bar Graphic */}
      <div className="bg-gradient-to-r from-[#000080] to-[#3a6ea5] p-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-full shadow-inner border border-gray-400">
             <Info size={24} className="text-[#000080]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white" style={{ textShadow: '1px 1px 0 #000' }}>Vespera OS Tour</h1>
            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">Step {currentStepIndex + 1} of {TOUR_STEPS.length}</p>
          </div>
        </div>
        {/* Progress bar in header */}
        <div className="flex items-center gap-3">
          <div className="w-32 h-2.5 bg-[#000040] border border-blue-300 rounded-sm overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-300 to-cyan-300 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-blue-200 text-[10px] font-mono">{Math.round(progressPct)}%</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* Left Sidebar Steps */}
        <div className="w-44 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1.5 shrink-0 flex flex-col gap-0.5 shadow-inner overflow-y-auto">
          {TOUR_STEPS.map((step, index) => (
            <div
              key={step.id}
              onClick={() => handleStepClick(index)}
              className={`flex items-center gap-2 p-1.5 cursor-pointer transition-colors ${
                currentStepIndex === index
                  ? 'bg-[#000080] text-white font-bold'
                  : 'hover:bg-gray-200 text-black'
              }`}
            >
              {visitedSteps.has(index) && currentStepIndex !== index ? (
                <CheckCircle size={14} className="text-green-600 shrink-0" />
              ) : (
                <step.icon size={14} className={currentStepIndex === index ? 'text-white shrink-0' : 'text-gray-500 shrink-0'} />
              )}
              <span className="text-[11px] truncate">{step.title}</span>
            </div>
          ))}

          <div className="mt-auto border-t border-gray-300 pt-2 opacity-60 pointer-events-none">
             <div className="w-full aspect-square bg-[#ececec] border border-gray-300 flex items-center justify-center p-3">
                <img src="/Vespera Logo Small.png" alt="Vespera" className="w-full opacity-30 grayscale" />
             </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main content */}
          <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-5 shadow-inner overflow-y-auto">
            <div className="min-h-full">
              {activeStep.content({ onLaunch: onLaunchApp || (() => {}) })}
            </div>
          </div>

          {/* Agent V Narration Panel */}
          {guidedMode && (
            <div className="bg-[#ececec] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white mt-2 p-2 flex items-start gap-3 shrink-0 shadow-inner">
              {/* Agent Avatar */}
              <div className="shrink-0 flex flex-col items-center gap-1">
                <div
                  className={`w-10 h-10 ${isNarrating ? 'animate-pulse' : ''}`}
                  dangerouslySetInnerHTML={{ __html: skinSvgs[agentExpression] || skinSvgs.open }}
                />
                <span className="text-[8px] font-bold text-[#000080] uppercase tracking-wider">Agent V</span>
              </div>

              {/* Narration Bubble */}
              <div className="flex-1 min-h-[60px] max-h-[80px] overflow-y-auto bg-[#ffffee] border border-gray-400 p-2 text-xs font-serif relative shadow-sm">
                {narrationText ? (
                  <p className="leading-relaxed">{narrationText}<span className={`inline-block w-1.5 h-3 bg-[#000080] ml-0.5 ${isNarrating ? 'animate-pulse' : 'opacity-0'}`} /></p>
                ) : (
                  <p className="text-gray-400 italic">Agent V is listening...</p>
                )}
              </div>

              {/* Mute Toggle */}
              <div className="shrink-0 flex flex-col gap-1">
                <button
                  onClick={handleToggleMute}
                  title={muted ? 'Unmute narration' : 'Mute narration'}
                  className={`w-7 h-7 flex items-center justify-center border-[2px] ${
                    muted
                      ? 'bg-red-100 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-red-600'
                      : 'bg-[#c0c0c0] border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-[#000080]'
                  } active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white`}
                >
                  {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <label className="flex items-center gap-1 cursor-pointer" title="Auto-advance pages when narration finishes">
                  <div className={`bg-white border border-gray-500 w-3 h-3 flex items-center justify-center ${autoAdvance ? 'text-black' : ''}`}>
                    {autoAdvance && <span className="text-[8px] font-bold">✓</span>}
                  </div>
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-[8px] text-gray-600 whitespace-nowrap"><SkipForward size={8} className="inline" /> Auto</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-[#ececec] border-t-2 border-t-gray-400 px-3 py-2 flex items-center justify-between shrink-0 shadow-[inset_0_1px_0_#fff]">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white w-4 h-4 flex items-center justify-center">
            {showNextTime && <div className="text-black font-bold text-xs">✓</div>}
          </div>
          <input
            type="checkbox"
            checked={showNextTime}
            onChange={(e) => setShowNextTime(e.target.checked)}
            className="hidden"
          />
          <span className="text-xs text-black group-hover:underline">Show this Welcome Screen at startup</span>
        </label>

        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1 font-bold text-sm bg-[#c0c0c0] w-20 justify-center py-1 border-[3px] border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50 disabled:active:border-t-white disabled:active:border-l-white disabled:active:border-b-gray-800 disabled:active:border-r-gray-800"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 font-bold text-sm bg-[#c0c0c0] w-24 justify-center py-1 border-[3px] border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
          >
            {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : (
              <>Next <ArrowRight size={14} /></>
            )}
          </button>

          {currentStepIndex !== TOUR_STEPS.length - 1 && (
            <button
              onClick={handleClose}
              className="ml-3 flex items-center gap-1 font-bold text-sm text-gray-700 bg-[#ececec] px-3 py-1 border border-gray-400 hover:bg-[#d0d0d0] active:bg-[#a0a0a0]"
            >
              Skip Tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
