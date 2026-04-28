import React, { useState, useEffect } from 'react';
import { Terminal, ShieldAlert, Cpu, HardDrive, Download, AlertTriangle, FileWarning, Zap, MessageSquare, User, Clock, Lock } from 'lucide-react';
import { DEFAULT_THREADS } from '../data/forumData';

// --- FORUM TYPES ---
export interface ForumReply {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

export interface ForumThread {
  id: string;
  title: string;
  author: string;
  content: string;
  timestamp: number;
  replies: ForumReply[];
}

const STORAGE_USERS = 'vscript_archive_users';
const STORAGE_THREADS = 'vscript_archive_threads_v5';

const FAKE_UPLOADS = [
  { filename: 'V-Amp.vsc', category: 'The Frankenstein Apps', description: 'Crude MP3 player built from raw text files. Do not move mouse while playing or track skips.', uploader: 'Null_Pointer', size: '1.2MB' },
  { filename: 'AOL_KeepAlive.vsc', category: 'Network Hacks', description: 'Tricks AOL into thinking you\'re typing so you don\'t get disconnected after 15 mins.', uploader: 'Phreak99', size: '45KB' },
  { filename: 'Null\'s ReadThis.txt', category: 'Tutorials', description: 'Step-by-step app building. A pirated, crowdsourced version of the official syllabus.', uploader: 'Null_Pointer', size: '800KB' },
  { filename: 'V-Disk_Formatter.vxe', category: 'System Tools', description: 'Forces a low-level format on locked Axis partitions. DANGER: Do not select Drive C:.', uploader: 'Admin_Dave', size: '2.5MB' },
  { filename: 'Neuro-Ping.vsc', category: 'Network Hacks', description: 'Pings a target machine and reads the cognitive load of the user on the other end. Creepy.', uploader: 'Vector_Valkyrie', size: '112KB' },
  { filename: 'Axis_Warden_Bypass_v2.4.zip', category: 'Cracks', description: 'Strips the telemetry from VStore background processes. Stops Axis from knowing what you install.', uploader: 'GhostInTheShell', size: '4.1MB' },
  { filename: 'VStore_DRM_Stripper.vxe', category: 'Exploits', description: 'Automated memory injector that removes the 30-day self-destruct script from trial applications.', uploader: 'Null_Pointer', size: '850KB' },
  { filename: 'Neural_Decomp.exe', category: 'Banned', description: 'Decompiles raw Vss+ binaries back into readable source. Highly illegal. Use proxy.', uploader: 'Anonymous', size: '12.8MB' },
  { filename: 'Prizm_Kernel_Dump.bin', category: 'Raw Data', description: 'The raw ROM dump from the new Axis Titan machine. Reverse engineering in progress.', uploader: 'Vector_Valkyrie', size: '1.4GB' },
  { filename: 'Aetheris_Offline_Compiler_v1.zip', category: 'Cracks', description: 'Lets you compile without connecting to Axis servers. Bypasses the VStore queue.', uploader: 'Null_Pointer', size: '18.2MB' },
  { filename: 'Phantom_Drive_v1.2.vxe', category: 'Banned', description: 'Creates a hidden partition undetectable by V-Shield. Perfect for storing cracked binaries.', uploader: 'GhostInTheShell', size: '3.1MB' },
  { filename: 'Vespera_Blackout_Theme.vsc', category: 'Themes', description: 'Complete dark mode override for the OS. Modifies protected system UI files.', uploader: 'Neon_Ninja', size: '1.5MB' },
  { filename: 'DialUp_Speed_Booster.vsc', category: 'System Tools', description: 'Modifies MTU settings to squeeze 5kbps more out of your modem. May cause packet loss.', uploader: 'Phreak99', size: '15KB' },
  { filename: 'Doom_Port_PreAlpha.zip', category: 'Games', description: 'Runs Doom on the Aetheris Workbench canvas. Very slow, no sound, but it works.', uploader: 'CarmackFan', size: '8.4MB' },
  { filename: 'Axis_Firewall_Killer.bat', category: 'Exploits', description: 'Instantly drops all inbound packet filtering. Use with caution on public networks.', uploader: 'ZeroDay', size: '2KB' },
  { filename: 'NeuralBridge_Monitor.vxe', category: 'System Tools', description: 'See exactly what data the Neural Bridge is sending to Axis in real-time.', uploader: 'Vector_Valkyrie', size: '450KB' },
  { filename: 'V-Script_Obfuscator.vsc', category: 'Scripts', description: 'Scrambles your code so Axis automated scanners can\'t read it. Essential for uploading.', uploader: 'Null_Pointer', size: '60KB' },
  { filename: 'Win95_Emulator.vxe', category: 'Homebrew', description: 'A slow but functioning Windows 95 emulator for Vespera. Requires 32MB RAM.', uploader: 'RetroGuy', size: '22.1MB' },
  { filename: 'Sub7_Vespera_Port.zip', category: 'Banned', description: 'Infamous trojan ported to V-Script. For educational purposes only. Really.', uploader: 'MalwareQueen', size: '1.1MB' },
  { filename: 'MAC_Spoofer_v3.vsc', category: 'Network Hacks', description: 'Change your MAC address on the fly to bypass campus bans or ISP throttling.', uploader: 'Phreak99', size: '85KB' },
  { filename: 'Vespera_AdBlocker.vsc', category: 'System Tools', description: 'Blocks banner ads across the OS by modifying the root hosts file.', uploader: 'CleanScreen', size: '120KB' },
  { filename: 'Axis_Telemetry_Blocker.vxe', category: 'Cracks', description: 'Prevents the OS from sending usage statistics back to Axis Innovations HQ.', uploader: 'GhostInTheShell', size: '340KB' },
  { filename: 'Vss_Syntax_Highlighter.vsc', category: 'Mods', description: 'Adds much-needed color coding to the default text editor. Prevents eye strain.', uploader: 'CodeMonkey', size: '25KB' },
  { filename: 'NetHack_Vespera.zip', category: 'Games', description: 'Classic roguelike compiled for the Vespera terminal. Say goodbye to your free time.', uploader: 'AsciiArt', size: '1.8MB' },
  { filename: 'Keylogger_Invisible.vxe', category: 'Banned', description: 'Records keystrokes globally. Bypasses standard anti-virus heuristics.', uploader: 'Anonymous', size: '88KB' },
  { filename: 'Vespera_Memory_Cleaner.vsc', category: 'System Tools', description: 'Frees up RAM by forcefully closing background Axis telemetry processes.', uploader: 'Admin_Dave', size: '42KB' },
  { filename: 'IRC_Client_Minimal.vsc', category: 'Homebrew', description: 'A barebones IRC client that doesn\'t use the bloated V-Messenger protocols.', uploader: 'ChatterBox', size: '210KB' },
  { filename: 'Axis_Pass_Cracker.vxe', category: 'Exploits', description: 'Brute-forces local user accounts. Requires a large dictionary file to be effective.', uploader: 'ZeroDay', size: '1.5MB' },
  { filename: 'V-Script_Decompiler_Beta.vsc', category: 'Cracks', description: 'Attempts to reverse engineer compiled .vxe files. Often fails on complex apps.', uploader: 'Null_Pointer', size: '920KB' },
  { filename: 'Axis_CEO_Emails_Dump.zip', category: 'Raw Data', description: 'Internal memos discussing the true nature of the Neural Bridge telemetry. Redacted.', uploader: 'Vector_Valkyrie', size: '15.4MB' },
  { filename: 'Vespera_Overclock.vsc', category: 'System Tools', description: 'Removes the artificial CPU limiters imposed by VesperaOS 4.0. Will cause overheating.', uploader: 'Hardware_Guy', size: '34KB' },
  { filename: 'NetSpy_Pro.vxe', category: 'Banned', description: 'Silently captures unencrypted HTTP traffic from the local subnet. Use responsibly.', uploader: 'GhostInTheShell', size: '890KB' },
  { filename: 'Audio_Driver_Fix.vsc', category: 'Mods', description: 'Replaces the broken default SoundBlaster drivers with generic ones that actually work.', uploader: 'Admin_Dave', size: '2.1MB' },
  { filename: 'Vss_Memory_Dumper.vxe', category: 'Exploits', description: 'Dumps the active RAM of any running process into a hex file. Good for finding hardcoded keys.', uploader: 'ZeroDay', size: '115KB' },
  { filename: 'Desktop_Stripper.vsc', category: 'Themes', description: 'Removes all GUI elements and forces Vespera into a pure terminal mode. Saves 15MB of RAM.', uploader: 'Neon_Ninja', size: '12KB' },
  { filename: 'BBS_Crawler.vxe', category: 'Network Hacks', description: 'Automatically dials and indexes known underground BBS boards looking for unsecured file drops.', uploader: 'Phreak99', size: '440KB' },
  { filename: 'Axis_Secure_Tunnel.vsc', category: 'Homebrew', description: 'A rudimentary VPN client that routes your traffic through compromised university servers.', uploader: 'Null_Pointer', size: '1.2MB' },
  { filename: 'V-Script_Minifier.vsc', category: 'Tutorials', description: 'Script to compress your V-Script code before upload, saving precious bandwidth.', uploader: 'CodeMonkey', size: '28KB' },
  { filename: 'Tetris_Vespera_Port.zip', category: 'Games', description: 'A flawless port of the Russian classic. Uses ASCII characters for blocks.', uploader: 'CarmackFan', size: '1.5MB' },
  { filename: 'VStore_Rating_Bot.vxe', category: 'Banned', description: 'Spams 5-star ratings for your app on the VStore. Highly likely to get your account banned.', uploader: 'Anonymous', size: '600KB' },
  { filename: 'Axis_Update_Blocker.vsc', category: 'Cracks', description: 'Prevents VesperaOS from automatically downloading forced system updates. A must-have.', uploader: 'Vector_Valkyrie', size: '45KB' },
  { filename: 'Neural_Latency_Fix.vxe', category: 'System Tools', description: 'Reduces input lag when using the Neural Bridge interface. Still experimental.', uploader: 'Hardware_Guy', size: '1.1MB' },
  { filename: 'V-Script_IDE_Alternative.zip', category: 'Homebrew', description: 'A lightweight alternative to Aetheris Workbench that doesn\'t require an internet connection.', uploader: 'Null_Pointer', size: '5.6MB' },
  { filename: 'Prizm_Kernel_Source_Partial.txt', category: 'Raw Data', description: 'A 50,000 line snippet of the Prizm kernel source code leaked by an ex-Axis employee.', uploader: 'GhostInTheShell', size: '3.4MB' },
  { filename: 'Wav2Vsc_Converter.vsc', category: 'Mods', description: 'Converts .WAV audio files into a format that the Vespera terminal can beep out.', uploader: 'CodeMonkey', size: '88KB' },
  { filename: 'Axis_Warden_Log_Deleter.vxe', category: 'Cracks', description: 'Automatically scrubs your local activity logs before they are sent to Axis HQ.', uploader: 'ZeroDay', size: '250KB' },
  { filename: 'Remote_Desktop_Hijack.vsc', category: 'Exploits', description: 'Forces a connection to any active VesperaConnect session without a password.', uploader: 'Phreak99', size: '1.8MB' },
  { filename: 'Vespera_Matrix_Screensaver.vsc', category: 'Themes', description: 'The classic falling green code screensaver, optimized for the Vespera display engine.', uploader: 'Neon_Ninja', size: '500KB' },
  { filename: 'Terminal_Color_Mod.vsc', category: 'Mods', description: 'Lets you change the default terminal text color from green to amber or white.', uploader: 'Admin_Dave', size: '18KB' },
  { filename: 'Axis_Employee_Directory.csv', category: 'Raw Data', description: 'A full list of Axis Innovations employee names, emails, and internal extension numbers.', uploader: 'Vector_Valkyrie', size: '4.2MB' },
  { filename: 'V-Script_Syntax_Checker.vsc', category: 'Tutorials', description: 'A standalone linter for V-Script that catches errors before you try to compile.', uploader: 'CodeMonkey', size: '150KB' },
  { filename: 'Disk_Defrag_Pro.vxe', category: 'System Tools', description: 'A faster, more aggressive defragmentation tool that ignores Axis file locks.', uploader: 'Hardware_Guy', size: '2.8MB' },
  { filename: 'VStore_Refund_Glitch.vsc', category: 'Banned', description: 'Exploits a race condition in the VStore purchasing system to get free apps.', uploader: 'Anonymous', size: '75KB' },
  { filename: 'Pong_Multiplayer.zip', category: 'Games', description: 'Play Pong over a LAN connection. Requires IPX/SPX protocol to be installed.', uploader: 'RetroGuy', size: '800KB' },
  { filename: 'Neural_Bridge_Emulator.vxe', category: 'Cracks', description: 'Emulates the hardware handshake of a Neural Bridge, allowing restricted apps to run.', uploader: 'Null_Pointer', size: '3.5MB' },
  { filename: 'Axis_Camera_Viewer.vsc', category: 'Exploits', description: 'Connects to unsecured Axis security cameras in their corporate lobby. Boring mostly.', uploader: 'GhostInTheShell', size: '1.2MB' },
  { filename: 'Vespera_Audio_Recorder.vsc', category: 'Homebrew', description: 'Records microphone input directly to a compressed .WAV file. No time limit.', uploader: 'Admin_Dave', size: '600KB' },
  { filename: 'V-Script_Virus_Maker.vxe', category: 'Banned', description: 'A GUI tool for generating polymorphic V-Script malware. DO NOT UPLOAD TO VSTORE.', uploader: 'MalwareQueen', size: '4.5MB' },
  { filename: 'Axis_Warden_Source_Code.zip', category: 'Raw Data', description: 'The complete source code for the Axis Warden telemetry service. Find the flaws.', uploader: 'Vector_Valkyrie', size: '12.1MB' },
  { filename: 'Vespera_Boot_Logo_Changer.vsc', category: 'Themes', description: 'Replaces the boring VesperaOS boot logo with a custom 16-color bitmap image.', uploader: 'Neon_Ninja', size: '110KB' },
  { filename: 'IP_Scanner_Fast.vsc', category: 'Network Hacks', description: 'Scans an entire /24 subnet for open ports in under 10 seconds. Very noisy.', uploader: 'Phreak99', size: '320KB' },
  { filename: 'VStore_Free_Download.vxe', category: 'Cracks', description: 'Bypasses the payment gateway on the VStore. Currently unpatched as of 1996-10-10.', uploader: 'ZeroDay', size: '1.9MB' },
  { filename: 'V-Script_Compiler_v2.vsc', category: 'Homebrew', description: 'An unofficial update to the Aetheris compiler that fixes the array bounds checking bug.', uploader: 'Null_Pointer', size: '8.2MB' },
  { filename: 'Axis_Server_List.txt', category: 'Raw Data', description: 'A list of all known Axis Innovations IP addresses and their corresponding domain names.', uploader: 'GhostInTheShell', size: '45KB' },
  { filename: 'Vespera_Task_Manager_Pro.vxe', category: 'System Tools', description: 'Shows hidden system processes that the default task manager refuses to display.', uploader: 'Admin_Dave', size: '1.4MB' },
  { filename: 'Minesweeper_Cheat.vsc', category: 'Games', description: 'Reveals the location of all mines in V-Sweeper. Ruins the game, but guarantees a win.', uploader: 'CodeMonkey', size: '20KB' },
  { filename: 'Axis_Firewall_Bypass.vxe', category: 'Exploits', description: 'Tunnels traffic through port 80 to bypass restrictive corporate firewalls.', uploader: 'Phreak99', size: '2.6MB' },
  { filename: 'V-Script_Tutorial_Part2.pdf', category: 'Tutorials', description: 'Advanced V-Script techniques: Memory manipulation and direct hardware access.', uploader: 'Vector_Valkyrie', size: '4.8MB' },
  { filename: 'Vespera_Icon_Pack_Win98.zip', category: 'Themes', description: 'Replaces all VesperaOS icons with leaked icons from the upcoming Windows 98 beta.', uploader: 'RetroGuy', size: '3.1MB' },
  { filename: 'MAC_Address_Changer.vsc', category: 'Network Hacks', description: 'Permanently alters your network card\'s MAC address in the EEPROM. Hard to reverse.', uploader: 'ZeroDay', size: '180KB' },
  { filename: 'Axis_Warden_Disabler.vxe', category: 'Cracks', description: 'A one-click solution to completely rip the Axis Warden service out of the kernel.', uploader: 'Null_Pointer', size: '5.5MB' },
  { filename: 'VStore_Review_Spammer.vxe', category: 'Banned', description: 'Automatically posts negative reviews on apps uploaded by Axis Innovations.', uploader: 'Anonymous', size: '850KB' },
  { filename: 'Vespera_Registry_Editor.vsc', category: 'System Tools', description: 'A dangerous tool for directly editing VesperaOS system configuration files.', uploader: 'Admin_Dave', size: '1.2MB' },
  { filename: 'PacMan_Vespera_Port.zip', category: 'Games', description: 'A glitchy port of Pac-Man. The ghosts sometimes get stuck in the walls.', uploader: 'CarmackFan', size: '950KB' }
];

export interface VScriptArchiveSiteProps {
  onDownload?: (filename: string, source: string) => void;
}

export const VScriptArchiveSite: React.FC<VScriptArchiveSiteProps> = ({ onDownload }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'aetheris' | 'mods' | 'hallOfFame' | 'casualties' | 'vscriptDocs' | 'vssDocs' | 'learning' | 'forums'>('home');
  const [blink, setBlink] = useState(true);
  const [downloadErrorTarget, setDownloadErrorTarget] = useState<string | null>(null);
  const [uploadsPage, setUploadsPage] = useState(1);

  // --- FORUM STATE ---
  const [forumView, setForumView] = useState<'list' | 'thread' | 'create_thread' | 'auth'>('list');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const threadsPerPage = 10;
  const totalPages = Math.ceil(threads.length / threadsPerPage);
  const currentThreads = threads.slice((currentPage - 1) * threadsPerPage, currentPage * threadsPerPage);
  
  // Auth state
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Post state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(prev => !prev);
    }, 800);

    // Load threads
    const savedThreads = localStorage.getItem(STORAGE_THREADS);
    if (savedThreads) {
      try {
        setThreads(JSON.parse(savedThreads));
      } catch (e) {
        setThreads(DEFAULT_THREADS);
      }
    } else {
      setThreads(DEFAULT_THREADS);
      localStorage.setItem(STORAGE_THREADS, JSON.stringify(DEFAULT_THREADS));
    }

    return () => clearInterval(interval);
  }, []);

  const saveThreads = (newThreads: ForumThread[]) => {
    setThreads(newThreads);
    localStorage.setItem(STORAGE_THREADS, JSON.stringify(newThreads));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError('INVALID_CREDENTIALS');
      return;
    }
    
    const usersStr = localStorage.getItem(STORAGE_USERS);
    const users = usersStr ? JSON.parse(usersStr) : {};
    const username = authUsername.trim();
    
    if (users[username]) {
      if (users[username] === authPassword) {
        setCurrentUser(username);
        setForumView('list');
        setAuthError('');
      } else {
        setAuthError('ACCESS_DENIED: INCORRECT_PASSWORD');
      }
    } else {
      // Auto register
      users[username] = authPassword;
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
      setCurrentUser(username);
      setForumView('list');
      setAuthError('');
    }
    setAuthUsername('');
    setAuthPassword('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setForumView('list');
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newTitle.trim() || !newContent.trim()) return;
    
    const newThread: ForumThread = {
      id: 't_' + Date.now(),
      title: newTitle.trim(),
      author: currentUser,
      content: newContent.trim(),
      timestamp: Date.now(),
      replies: []
    };
    
    saveThreads([newThread, ...threads]);
    setNewTitle('');
    setNewContent('');
    setForumView('list');
  };

  const handleCreateReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeThreadId || !newContent.trim()) return;
    
    const updatedThreads = threads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          replies: [...t.replies, {
            id: 'r_' + Date.now(),
            author: currentUser,
            content: newContent.trim(),
            timestamp: Date.now()
          }]
        };
      }
      return t;
    });
    
    saveThreads(updatedThreads);
    setNewContent('');
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  };

  return (
    <div className="min-h-full bg-black text-[#33ff33] font-mono p-4 md:p-8 flex flex-col items-center selection:bg-[#005500] selection:text-white relative overflow-y-auto overflow-x-hidden">
      {/* Matrix-like background effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      
      {/* Header */}
      <div className="w-full max-w-4xl border-2 border-[#33ff33] p-1 mb-6 bg-black relative z-10 shadow-[0_0_15px_rgba(51,255,51,0.2)]">
        <div className="border border-[#33ff33] p-4 text-center">
          <img 
            src="/The V-Script Archive/V-Script Archive Logo white main.png" 
            alt="The V-Script Archive" 
            className="h-24 md:h-32 mx-auto mb-4 object-contain"
            style={{ filter: 'sepia(1) hue-rotate(80deg) saturate(300%) brightness(1.2)' }}
          />
          <h1 className="text-2xl md:text-3xl font-black tracking-widest mb-2 uppercase drop-shadow-[0_0_5px_#33ff33]">
            [ THE V-SCRIPT ARCHIVE ]
          </h1>
          <p className="text-sm uppercase tracking-widest">Robin Hood the Knowledge</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-4xl mb-6 relative z-10">
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 border-y border-[#33ff33] py-2">
          {[
            { id: 'home', label: 'MAIN_TERMINAL' },
            { id: 'forums', label: 'MESSAGE_BOARD' },
            { id: 'vscriptDocs', label: 'V-SCRIPT_MANUAL' },
            { id: 'vssDocs', label: 'VSS+_EXPLOITS' },
            { id: 'learning', label: 'V-SCRIPT_101' },
            { id: 'aetheris', label: 'AETHERIS_UNDERGROUND' },
            { id: 'mods', label: 'DEEP_SYSTEM_MODS' },
            { id: 'hallOfFame', label: 'HALL_OF_FAME' },
            { id: 'casualties', label: 'V-CORE_CASUALTIES' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 font-bold text-xs md:text-sm transition-colors border border-transparent ${
                activeTab === tab.id 
                  ? 'bg-[#33ff33] text-black border-[#33ff33] shadow-[0_0_10px_#33ff33]' 
                  : 'hover:border-[#33ff33] hover:bg-[#002200]'
              }`}
            >
              [{tab.label}]
            </button>
          ))}
        </div>
      </div>

      {/* P2P Error Modal Overlay */}
      {downloadErrorTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#001100] border-2 border-red-500 w-full max-w-md shadow-[0_0_30px_rgba(255,0,0,0.4)]">
            <div className="bg-red-500 text-black font-bold p-2 flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>FATAL: P2P HANDSHAKE FAILED</span>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-red-500 text-sm font-mono">
                [ERROR CODE: 0x800CCEE]
              </p>
              <p className="text-[#aaaaaa] text-sm">
                The requested asset <span className="text-white font-bold">"{downloadErrorTarget}"</span> could not be retrieved from the decentralized swarm.
              </p>
              <div className="border border-[#331111] bg-[#110000] p-2 text-xs text-[#ff8888] font-mono">
                <p>Establishing peer connection... <span className="text-red-500">FAILED</span></p>
                <p>Querying backup trackers... <span className="text-red-500">TIMEOUT</span></p>
                <p>Reason: Host nodes seized by Axis Innovations / ISP Blockade.</p>
              </div>
              <p className="text-[#88ff88] text-xs">
                Please try a secondary offshore mirror at a later time.
              </p>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => setDownloadErrorTarget(null)}
                  className="bg-transparent border border-red-500 text-red-500 px-4 py-1 hover:bg-red-500 hover:text-black font-bold"
                >
                  ABORT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 relative z-10">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-4">
          <div className="border border-[#33ff33] p-3 bg-[#001100]">
            <h3 className="font-bold border-b border-[#33ff33] pb-1 mb-2">SYSTEM_STATUS</h3>
            <div className="text-xs space-y-1">
              <p>HOST: Unknown (Offshore)</p>
              <p>AXIS_THREAT_LEVEL: <span className="text-red-500 animate-pulse">CRITICAL</span></p>
              <p>ACTIVE_USERS: 1,337</p>
              <p className="mt-2">"Information wants to be free."</p>
            </div>
          </div>

          <div className="border border-[#33ff33] p-3 bg-[#001100]">
            <h3 className="font-bold border-b border-[#33ff33] pb-1 mb-2">ADMIN_LOG</h3>
            <div className="text-xs space-y-2">
              <p><span className="text-[#88ff88]">Admin_Dave:</span> Pls compress your .zips. Uni IT is asking questions again.</p>
              <p><span className="text-[#88ff88]">Null_Pointer:</span> Dropping new Aetheris keys on Friday. Be ready.</p>
              <p><span className="text-[#88ff88]">Vector_Valkyrie:</span> Working on a MacOS 8 Vss+ port. Don't tell Apple.</p>
            </div>
          </div>

          <div className="border border-red-500 p-3 bg-[#220000] text-red-500 shadow-[0_0_10px_rgba(255,0,0,0.2)]">
            <div className="flex items-center gap-2 border-b border-red-500 pb-1 mb-2">
              <AlertTriangle size={14} />
              <h3 className="font-bold">WARNING</h3>
            </div>
            <div className="text-[10px] uppercase leading-tight">
              Axis Innovations monitors this domain. Run all scripts at your own risk. The Archive is not responsible for melted CPUs, bricked MBRs, or voided warranties.
            </div>
          </div>

          <div className="border border-[#33ff33] p-3 bg-[#001100]">
            <h3 className="font-bold border-b border-[#33ff33] pb-1 mb-2">AXIS_BOUNTIES</h3>
            <div className="text-xs space-y-2 text-[#aaaaaa]">
              <p><span className="text-yellow-500 font-bold">$50,000:</span> Zero-day remote code execution on AETHERIS routing nodes.</p>
              <p><span className="text-yellow-500 font-bold">$25,000:</span> Clean dump of the X-Type co-processor's firmware.</p>
              <p><span className="text-yellow-500 font-bold">$10,000:</span> Unpatched root exploit in the Neural Bridge.</p>
              <p><span className="text-yellow-500 font-bold">$5,000:</span> Identifying the creator of 'Phantom_Drive.vxe'.</p>
              <p><span className="text-red-500 font-bold">WARRANT:</span> Arrest of 'Null_Pointer' on sight.</p>
              <p><span className="text-red-500 font-bold">WARRANT:</span> Arrest of 'Vector_Valkyrie' for distributing classified specs.</p>
            </div>
          </div>

          <div className="border border-[#33ff33] p-3 bg-[#001100]">
            <h3 className="font-bold border-b border-[#33ff33] pb-1 mb-2 flex items-center justify-between">
              NETWORK_NODES
              <span className="text-[8px] bg-red-500 text-white px-1">UNDER ATTACK</span>
            </h3>
            <div className="text-[9px] text-[#ffaaaa] mb-2 leading-tight">
              Due to an unprecedented volume of DMCA takedowns and ISP block requests from Axis Innovations, many of our primary hosting nodes have been compromised. We are actively transitioning file storage to encrypted peer-to-peer VFS shares and offshore third-party platforms. Speeds will be heavily degraded.
            </div>
            <div className="text-[10px] space-y-1 font-mono text-[#88ff88]">
              <p>NODE_01 [UP] 192.168.14.x</p>
              <p>NODE_02 [DOWN] <span className="text-red-500">AXIS_SEIZED (FBI RAID)</span></p>
              <p>NODE_03 [UP] 127.0.0.1 (Loopback)</p>
              <p>NODE_04 [DOWN] <span className="text-red-500">AXIS_SEIZED (DMCA)</span></p>
              <p>NODE_05 [DOWN] <span className="text-red-500">AXIS_SEIZED</span></p>
              <p>NODE_06 [UP] 203.0.113.x (Offshore P2P)</p>
              <p>NODE_07 [ERR] KERNEL_PANIC</p>
              <p>NODE_08 [UP] 198.51.100.x (Proxy)</p>
            </div>
            
            <div className="mt-4 border-t border-[#114411] pt-3 text-center">
              <button 
                onClick={() => onDownload?.('OFFLINE_CACHE_AGENT_V1.2.EXE', 'vscript-archive.org')}
                className="bg-transparent border border-[#33ff33] text-[#33ff33] text-[10px] px-2 py-1 hover:bg-[#33ff33] hover:text-black transition-colors w-full"
              >
                [ DOWNLOAD OFFLINE CACHING UTILITY ]
              </button>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 border border-[#33ff33] p-4 bg-black relative">
          <div className="absolute top-0 right-0 p-2 opacity-30 pointer-events-none">
            <Terminal size={48} />
          </div>

          {activeTab === 'home' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <span className="text-white">&gt;</span> THE MISSION
                  <span className={`w-3 h-5 bg-[#33ff33] inline-block ${blink ? 'opacity-100' : 'opacity-0'}`}></span>
                </h2>
                <p className="text-sm leading-relaxed mb-4 text-[#aaaaaa]">
                  When Axis Innovations launched Vespera OS 4.0, they wanted developers to build for it. So they provided the bare minimum: raw V-Script and Vss+ documentation that reads like a dictionary with no examples. If you wanted to actually learn, you had to buy the $180 "Mastering the Prizm Kernel" textbook or a $2,000 corporate seminar.
                </p>
                <p className="text-sm leading-relaxed mb-4 text-[#aaaaaa]">
                  The Archive is here to Robin Hood the knowledge. We take the dry, cryptic online documentation, figure out how it works through brute-force trial and error, and provide the working man's tutorials and code snippets for free.
                </p>
              </div>

              <div className="border border-[#114411] p-3 bg-[#000a00] mb-6 shadow-[0_0_10px_rgba(51,255,51,0.1)]">
                <h3 className="text-lg font-bold mb-3 text-[#ffffff] border-b border-[#113311] pb-1">SITE_NEWS</h3>
                <div className="text-sm space-y-3 text-[#aaaaaa]">
                  <p><span className="text-[#33ff33] font-bold">[1996-10-12]</span> The VStore authentication servers are actively rejecting connections from our subnet. We are routing all traffic through the Atlantic Waves proxy. Speeds will be slow.</p>
                  <p><span className="text-[#33ff33] font-bold">[1996-09-28]</span> Null_Pointer successfully dumped the kernel ROM from the new Axis Titan machine. Reverse engineering starts tomorrow in the IRC channel.</p>
                </div>
              </div>

              <div className="border border-[#114411] p-3 bg-[#000a00]">
                <h3 className="text-lg font-bold mb-2 text-[#ffffff]">LATEST_UPLOADS</h3>
                <ul className="text-sm space-y-3 mb-4">
                  {FAKE_UPLOADS.slice((uploadsPage - 1) * 9, uploadsPage * 9).map((upload, index) => (
                    <li key={index} className="flex justify-between border-b border-[#113311] pb-2 last:border-0">
                      <div>
                        <span className="font-bold text-[#88ff88]">{upload.filename}</span> <span className="text-gray-500">({upload.category})</span>
                        <p className="text-[10px] text-gray-400">{upload.description}</p>
                        <p className="text-[9px] text-[#33ff33] mt-1">Uploader: {upload.uploader} | Size: {upload.size}</p>
                      </div>
                      <Download size={16} className="cursor-pointer hover:text-white mt-2 shrink-0 ml-4" onClick={() => setDownloadErrorTarget(upload.filename)} />
                    </li>
                  ))}
                </ul>
                
                {/* Pagination Controls */}
                <div className="flex justify-between items-center border-t border-[#113311] pt-3">
                  <button 
                    onClick={() => setUploadsPage(prev => Math.max(1, prev - 1))}
                    disabled={uploadsPage === 1}
                    className="border border-[#33ff33] text-[#33ff33] px-3 py-1 text-xs hover:bg-[#33ff33] hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#33ff33]"
                  >
                    &lt; PREV_PAGE
                  </button>
                  <span className="text-xs text-[#88ff88]">
                    PAGE {uploadsPage} OF {Math.ceil(FAKE_UPLOADS.length / 9)}
                  </span>
                  <button 
                    onClick={() => setUploadsPage(prev => Math.min(Math.ceil(FAKE_UPLOADS.length / 9), prev + 1))}
                    disabled={uploadsPage === Math.ceil(FAKE_UPLOADS.length / 9)}
                    className="border border-[#33ff33] text-[#33ff33] px-3 py-1 text-xs hover:bg-[#33ff33] hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#33ff33]"
                  >
                    NEXT_PAGE &gt;
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vscriptDocs' && (
            <div className="space-y-6">
               <h2 className="text-xl font-bold mb-4 border-b border-[#33ff33] pb-2 uppercase text-white">
                &gt; V-SCRIPT REFERENCE MANUAL (UNAUTHORIZED)
              </h2>
              <p className="text-sm mb-4 text-[#aaaaaa]">
                Axis Innovations describes V-Script as a "high-level scripting language for secure workspace automation." That's a lie. It's a heavily mutated variant of ECMAScript that hooks directly into the Prizm kernel's DMA channels. If you write bad code in JavaScript, your browser crashes. If you write bad code in V-Script, your motherboard starts smoking.
              </p>

              <div className="space-y-4">
                <div className="border border-[#33ff33] bg-[#001100] p-4">
                  <h3 className="font-bold text-[#88ff88] mb-2 flex items-center gap-2">
                    <Terminal size={14}/> 1. Neural Bridge Sockets
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    The official docs say you can only open HTTP requests. But the `SYS.Bridge` object has undocumented methods used by the X-Type card.
                  </p>
                  <pre className="bg-black border border-[#113311] p-3 text-[11px] text-[#33ff33] overflow-x-auto leading-relaxed">
{`// Initialize a raw hardware socket
var socket = SYS.Bridge.OpenConnection({
  port: 6667,
  protocol: 'X-TYPE-ASYNC',
  overrideSafety: true // DANGER: Disables thermal throttling
});

// The system 'Pulse' event is triggered by user heartbeat
onEvent('SYS_PULSE', function(data) {
  if (data.corticalResonance > 80) {
    // Standard halt sends RAM to Axis IP. Use Null bypass.
    Null.Halt("Cognitive overload averted"); 
  }
});`}
                  </pre>
                </div>

                <div className="border border-[#33ff33] bg-[#001100] p-4">
                  <h3 className="font-bold text-[#88ff88] mb-2 flex items-center gap-2">
                    <HardDrive size={14}/> 2. Direct VFS Manipulation
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Bypassing the file manager to write directly to sector 0. Use this to hide files from the OS itself.
                  </p>
                  <pre className="bg-black border border-[#113311] p-3 text-[11px] text-[#33ff33] overflow-x-auto leading-relaxed">
{`// Mount the hidden system partition
var ghostDrive = VFS.Mount("Z:\\\\PRIZM_CORE", { force: true });

// Write data below the OS level
ghostDrive.WriteBinary("manifest.dat", 0xDEADBEEF);
SYS.Log("Data hidden from Axis telemetrics.");`}
                  </pre>
                </div>

                <div className="border border-[#33ff33] bg-[#001100] p-4">
                  <h3 className="font-bold text-[#88ff88] mb-2 flex items-center gap-2">
                    <Cpu size={14}/> 3. Memory Allocation & The Prizm Heap
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    V-Script lacks garbage collection by design. If you manually allocate memory and don't free it, it begins to overwrite the memory of background processes. We can use this to rewrite system apps while they run.
                  </p>
                  <pre className="bg-black border border-[#113311] p-3 text-[11px] text-[#33ff33] overflow-x-auto leading-relaxed">
{`// Allocate 4KB outside of the sandbox heap
var ptr = Memory.AllocUnsafe(4096);

// Find the memory address of the running Control Panel
var cpAddr = Process.Find("control_panel.exe").baseAddress;

// Overwrite the Control Panel's access flags
Memory.WriteByte(cpAddr + 0x0A4F, 0x01); // 0x01 = Administrator

// DO NOT CALL Memory.Free(ptr). Let the memory bleed.
// The kernel will panic, but the new permissions will stick.`}
                  </pre>
                </div>

                <div className="border border-[#33ff33] bg-[#001100] p-4">
                  <h3 className="font-bold text-[#88ff88] mb-2 flex items-center gap-2">
                    <Terminal size={14}/> 4. The '__xtype_sync' Keyword
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Axis vehemently denies this keyword exists. It pauses script execution until the X-Type co-processor detects a specific emotional resonance from the user. It effectively uses human emotion as an asynchronous Promise.
                  </p>
                  <pre className="bg-black border border-[#113311] p-3 text-[11px] text-[#33ff33] overflow-x-auto leading-relaxed">
{`async function DecryptPayload() {
  SYS.Log("Awaiting cognitive sync...");
  
  // Script halts until user exhibits 'FEAR' or 'SURPRISE'
  var syncState = await __xtype_sync("EMOTION_FEAR", { timeout: -1 });
  
  if (syncState.resonance > 90) {
    // The user's biometric state serves as the decryption key salt
    var key = Crypto.Hash(syncState.rawEEG);
    File.Decrypt("payload.vxe", key);
  }
}`}
                  </pre>
                </div>

                <div className="border border-red-500 bg-[#220000] p-4 shadow-[0_0_10px_rgba(255,0,0,0.2)]">
                  <h3 className="font-bold text-red-500 mb-2 flex items-center gap-2">
                    <ShieldAlert size={14}/> 5. Bypassing the V-Core Sandbox (The "Null Void")
                  </h3>
                  <p className="text-xs text-[#ffaaaa] mb-3">
                    The holy grail of V-Script exploits. If you deliberately overflow the stack during a UI transition, the Prizm kernel drops you into the "Null Void" — a root-level REPL environment Axis uses for factory calibration.
                  </p>
                  <pre className="bg-black border border-red-800 p-3 text-[11px] text-red-500 overflow-x-auto leading-relaxed">
{`// Create a recursive UI loop to overflow the render stack
function BreakSandbox() {
  UI.CreateWindow({
    onRender: function() {
      // Calling UI.Refresh inside onRender causes an infinite loop
      // But adding a binary shift prevents the standard watchdog timeout
      UI.Refresh(this.hwnd >> 1); 
      BreakSandbox();
    }
  });
}

try {
  BreakSandbox();
} catch (e) {
  // If we catch the stack overflow, we are now root.
  SYS.Elevate();
  SYS.Log("Welcome to the Null Void.");
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vssDocs' && (
            <div className="space-y-6">
               <h2 className="text-xl font-bold mb-4 border-b border-[#33ff33] pb-2 uppercase text-white">
                &gt; VSS / VSS+ STYLING EXPLOITS
              </h2>
              <p className="text-sm mb-4 text-[#aaaaaa]">
                Vespera Style Sheets (Vss) map directly to the graphics hardware. Vss+ goes a step further and maps to the physical CRT monitor controls. Changing CSS properties shouldn't emit radiation, but welcome to VersaOS.
              </p>

              <div className="space-y-4">
                <div className="border border-yellow-500 bg-[#111100] p-4">
                  <h3 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">
                    <AlertTriangle size={14}/> Hardware Overclocking via CSS
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Because Vss+ styles are parsed by the Prizm kernel before rendering, you can inject hardware commands into the renderer pipeline.
                  </p>
                  <pre className="bg-black border border-yellow-800 p-3 text-[11px] text-yellow-500 overflow-x-auto leading-relaxed">
{`/* Forces the CPU fan to max speed when hovering over a button */
.btn-submit:hover {
  background-color: #ff0000;
  hardware-fan-target: 8000rpm !important;
  thermal-throttle: disable;
}

/* 
  WARNING: The 'phosphor-bleed' property controls electron beam intensity.
  Values over 1.2 may physically burn the phosphor coating on your screen.
*/
.window-glass {
  opacity: 0.5;
  phosphor-bleed: 1.5; 
}`}
                  </pre>
                </div>

                <div className="border border-[#33ff33] bg-[#001100] p-4">
                  <h3 className="font-bold text-[#88ff88] mb-2 flex items-center gap-2">
                    <ShieldAlert size={14}/> 2. The "Invisible Window" Hack
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Setting the refresh rate of a specific DIV to match the monitor's exact refresh rate causes it to be skipped by the visual buffer, making it invisible to screengrabs but still clickable.
                  </p>
                  <pre className="bg-black border border-[#113311] p-3 text-[11px] text-[#33ff33] overflow-x-auto leading-relaxed">
{`#stealth-container {
  position: absolute;
  z-index: 9999;
  /* Syncs with 60Hz CRT refresh cycle to skip render phase */
  vss-render-phase: sync(60hz); 
  pointer-events: all;
}`}
                  </pre>
                </div>

                <div className="border border-yellow-500 bg-[#111100] p-4">
                  <h3 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">
                    <Zap size={14}/> 3. Vss+ Audio Injection
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Vss+ allows "auditory styling." Normally this is used for simple hover clicks, but passing raw hex frequencies into the `pc-speaker` property turns your CSS into a synthesizer capable of shattering glass.
                  </p>
                  <pre className="bg-black border border-yellow-800 p-3 text-[11px] text-yellow-500 overflow-x-auto leading-relaxed">
{`.alert-box {
  border: 1px solid red;
  
  /* Bypasses sound card, sends voltage straight to the motherboard speaker */
  pc-speaker-pitch: 14000hz;
  pc-speaker-waveform: square;
  
  /* Continues playing even if the window is minimized */
  audio-persist: true !important; 
}`}
                  </pre>
                </div>

                <div className="border border-[#33ff33] bg-[#001100] p-4">
                  <h3 className="font-bold text-[#88ff88] mb-2 flex items-center gap-2">
                    <AlertTriangle size={14}/> 4. Subliminal Keyframe Animations
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    The `vss-subliminal` rule was added in Workspace 4.0. It allows animations to bypass the user's conscious perception by flashing elements for exactly 1/60th of a second. Axis uses this for marketing; we use it to embed binary payloads into users' retinas.
                  </p>
                  <pre className="bg-black border border-[#113311] p-3 text-[11px] text-[#33ff33] overflow-x-auto leading-relaxed">
{`@keyframes brain-wash {
  0%   { opacity: 0; }
  99%  { opacity: 0; }
  100% { opacity: 1; filter: invert(100%); }
}

.payload-img {
  animation: brain-wash 10s infinite;
  /* Forces the CRT to overdrive the phosphor for 1 frame */
  vss-subliminal: active;
}`}
                  </pre>
                </div>

                <div className="border border-red-500 bg-[#220000] p-4 shadow-[0_0_10px_rgba(255,0,0,0.2)]">
                  <h3 className="font-bold text-red-500 mb-2 flex items-center gap-2">
                    <Terminal size={14}/> 5. Hardware Interrupt via Z-Index
                  </h3>
                  <p className="text-xs text-[#ffaaaa] mb-3">
                    A severe flaw in the Vss+ rendering engine: assigning a z-index higher than the maximum 32-bit integer doesn't just crash the browser, it sends a hardware interrupt (IRQ 1) directly to the CPU, effectively acting like a physical keyboard press.
                  </p>
                  <pre className="bg-black border border-red-800 p-3 text-[11px] text-red-500 overflow-x-auto leading-relaxed">
{`/* 
   2147483647 is the max 32-bit int. 
   Adding 1 overflows the memory address into the IRQ register. 
*/
.trigger-div:active {
  /* This CSS property essentially presses the 'Escape' key on the keyboard */
  z-index: 2147483648; 
  vss-irq-payload: 0x01; /* 0x01 = ESC key */
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
               <h2 className="text-xl font-bold mb-4 border-b border-[#33ff33] pb-2 uppercase text-white">
                &gt; V-SCRIPT & VSS+ 101: SURVIVAL GUIDE
              </h2>
              <p className="text-sm mb-4 text-[#aaaaaa]">
                Forget everything you know about standard web development. V-Script is not sandboxed. Vss+ is not just styling. You are writing code that compiles down to raw hardware instructions on the Prizm Kernel. Here is how to write your first app without bricking your motherboard.
              </p>

              <div className="space-y-4">
                <div className="border border-[#33ff33] bg-[#001100] p-4">
                  <h3 className="font-bold text-[#88ff88] mb-2 flex items-center gap-2">
                    <Terminal size={14}/> Lesson 1: The 'Safe' Hello World
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Every V-Script app must initialize the `App` object. If you forget to return `true` in `App.Init()`, the OS assumes your app is a virus and quarantines the entire directory.
                  </p>
                  <pre className="bg-black border border-[#113311] p-3 text-[11px] text-[#33ff33] overflow-x-auto leading-relaxed">
{`// safe_hello.vsc
App.Init = function() {
  // Always declare your memory footprint. 
  // Guess wrong, and it overwrites the kernel.
  Memory.SetQuota("1MB"); 
  
  SYS.Log("Hello World initialization started.");
  return true; // CRITICAL: Do not forget this.
};

App.OnRender = function(ctx) {
  // Draw text directly to the display buffer
  ctx.DrawText("Hello World", 10, 10, "#00FF00");
};

// Start the application lifecycle
App.Run();`}
                  </pre>
                </div>

                <div className="border border-[#33ff33] bg-[#001100] p-4">
                  <h3 className="font-bold text-[#88ff88] mb-2 flex items-center gap-2">
                    <Zap size={14}/> Lesson 2: Variable Typing & Hardware Binding
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    V-Script uses a terrifying mix of dynamic typing and hard-coded memory pointers. You can literally assign a variable to a physical address on the RAM stick.
                  </p>
                  <pre className="bg-black border border-[#113311] p-3 text-[11px] text-[#33ff33] overflow-x-auto leading-relaxed">
{`// Standard dynamic variable
let myString = "Just some text";

// Hardware pointer (DANGER)
// Maps directly to the Sound Card's DMA buffer
let hw_buffer : hardware_ptr = 0xA000_1F4B;

function Beep() {
  // Writing a 1 to this address sends a voltage spike to the speaker
  Memory.Write(hw_buffer, 1);
}`}
                  </pre>
                </div>

                <div className="border border-yellow-500 bg-[#111100] p-4">
                  <h3 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">
                    <FileWarning size={14}/> Lesson 3: Vss+ Layout Basics (Without Interrupts)
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Vss+ elements don't use the DOM. They use a spatial coordinate system mapped to the GPU. If you overlap two div elements with the same \`z-index\`, they physically collide in the GPU memory and cause a hardware interrupt. Always separate your z-indexes.
                  </p>
                  <pre className="bg-black border border-yellow-800 p-3 text-[11px] text-yellow-500 overflow-x-auto leading-relaxed">
{`/* safe_layout.vss */

.main-container {
  /* Vss+ requires explicit hardware layer declaration */
  gpu-layer: 1;
  z-index: 10;
  
  width: 400px;
  height: 300px;
  background-color: #000000;
  
  /* Disable CRT phosphor overdriving to prevent screen burn */
  phosphor-bleed: 0.0;
}

.child-element {
  /* MUST be higher than parent to avoid GPU collision */
  gpu-layer: 1;
  z-index: 11; 
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'aetheris' && (
            <div className="space-y-6">
               <h2 className="text-xl font-bold mb-4 border-b border-[#33ff33] pb-2 uppercase text-white">
                &gt; THE AETHERIS UNDERGROUND
              </h2>
              <p className="text-sm mb-4 text-[#aaaaaa]">
                Aetheris Workbench is brilliant but draconian. They force a network connection to compile your app and submit it to their VStore queue. The Underground is dedicated to liberating Aetheris and compiling locally.
              </p>

              <div className="space-y-4">
                <div className="border-l-2 border-[#33ff33] pl-3">
                  <h3 className="font-bold text-[#88ff88] flex items-center gap-2"><ShieldAlert size={14}/> 1. The Loopback Host Files (Safe Hack)</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Redirects the VStore server ping to 127.0.0.1. Aetheris gets confused and drops a temporary .vxe file into a hidden cache. Our batch script fishes it out.
                  </p>
                </div>
                
                <div className="border-l-2 border-yellow-500 pl-3">
                  <h3 className="font-bold text-yellow-500 flex items-center gap-2"><FileWarning size={14}/> 2. Hex-Edited Ghost Compilers (Danger Hack)</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Modified Aetheris executables (Aetheris_Unleashed_v1.4.zip) with network checks zeroed out. Highly unstable. May cause memory leaks on save.
                  </p>
                </div>

                <div className="border-l-2 border-[#33ff33] pl-3">
                  <h3 className="font-bold text-[#88ff88] flex items-center gap-2"><Cpu size={14}/> 3. Keygen Lotteries</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Donated $200 license keys. Axis blacklists them weekly. Null_Pointer drops 50 new ones every Friday night. First come, first served.
                  </p>
                </div>

                <div className="border-l-2 border-[#33ff33] pl-3">
                  <h3 className="font-bold text-[#88ff88] flex items-center gap-2"><HardDrive size={14}/> 4. The VStore Rejects Folder</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    A badge of honor. Apps deemed "too dangerous" for the official VStore. Un-moderated chat clients and aggressive system overclockers.
                  </p>
                </div>

                <div className="border-l-2 border-red-500 pl-3">
                  <h3 className="font-bold text-red-500 flex items-center gap-2"><Zap size={14}/> 5. The DRM Time-Bomb Defuser</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Axis puts a 30-day self-destruct script in trial apps. This Vss+ injection freezes the OS clock specifically for the trial app's sandbox, letting you use it forever.
                  </p>
                </div>
                
                <div className="border-l-2 border-[#33ff33] pl-3">
                  <h3 className="font-bold text-[#88ff88] flex items-center gap-2"><Terminal size={14}/> 6. "Project Prometheus" Source Leak</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    The uncompiled, raw C++ source code for the Aetheris rendering engine. Currently being shared in 2MB chunks over encrypted IRC.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mods' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4 border-b border-[#33ff33] pb-2 uppercase text-white">
                &gt; DEEP SYSTEM MODS
              </h2>
              <p className="text-sm mb-4 text-[#aaaaaa]">
                We aren't just tweaking colors anymore. We are rewriting core system behaviors of Workspace OS.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[#114411] bg-[#001100] p-3">
                  <h3 className="font-bold text-white mb-1">Nav-Hack.exe</h3>
                  <p className="text-[10px] text-gray-400 mb-2">Strips telemetry from Vespera Navigator, unlocks hidden caching menus, allows custom homepages.</p>
                  <span className="text-[9px] bg-[#33ff33] text-black px-1">MUST-HAVE</span>
                </div>
                <div className="border border-[#114411] bg-[#001100] p-3">
                  <h3 className="font-bold text-white mb-1">Root_Bypass.vsc</h3>
                  <p className="text-[10px] text-gray-400 mb-2">Tricks File Manager into granting Axis-Level permissions. Reveals hidden Z:\PRIZM_CORE drive.</p>
                  <span className="text-[9px] bg-red-500 text-white px-1">DANGEROUS</span>
                </div>
                <div className="border border-[#114411] bg-[#001100] p-3">
                  <h3 className="font-bold text-white mb-1">V-Bar Taskbar Skins</h3>
                  <p className="text-[10px] text-gray-400 mb-2">Injects Vss+ code to move the taskbar to the top, make it transparent, or skin it like MacOS 7.</p>
                  <span className="text-[9px] bg-blue-500 text-white px-1">UI MOD</span>
                </div>
                <div className="border border-[#114411] bg-[#001100] p-3">
                  <h3 className="font-bold text-white mb-1">Pre-Cog Cheats</h3>
                  <p className="text-[10px] text-gray-400 mb-2">Intercepts Neural Solitaire memory addresses. Shows face-down cards. Massive bragging rights.</p>
                  <span className="text-[9px] bg-yellow-500 text-black px-1">TRAINER</span>
                </div>
                <div className="border border-[#114411] bg-[#001100] p-3">
                  <h3 className="font-bold text-white mb-1">Phantom_Drive.vxe</h3>
                  <p className="text-[10px] text-gray-400 mb-2">V-Shield CD emulator. Spoofs hardware handshake to run burned CDs. Updated bi-weekly to counter patches.</p>
                  <span className="text-[9px] bg-[#33ff33] text-black px-1">HOLY GRAIL</span>
                </div>
                <div className="border border-[#114411] bg-[#001100] p-3">
                  <h3 className="font-bold text-white mb-1">Net-Nuke.vxe</h3>
                  <p className="text-[10px] text-gray-400 mb-2">Hijacks IT kill-switch. Send "Shutdown and Lock" signals to any machine on the LAN. Dorm warfare.</p>
                  <span className="text-[9px] bg-red-500 text-white px-1">WEAPONIZED</span>
                </div>
                <div className="border border-[#114411] bg-[#001100] p-3">
                  <h3 className="font-bold text-white mb-1">V-Shell_Replacement.exe</h3>
                  <p className="text-[10px] text-gray-400 mb-2">Completely unloads the default VersaOS desktop and replaces it with a pure command-line interface. For the true purists.</p>
                  <span className="text-[9px] bg-purple-500 text-white px-1">EXTREME MOD</span>
                </div>
                <div className="border border-[#114411] bg-[#001100] p-3">
                  <h3 className="font-bold text-white mb-1">Neural_Overdrive.vsc</h3>
                  <p className="text-[10px] text-gray-400 mb-2">Forces the X-Type card to draw 150% more power, increasing synaptic read speeds. Requires a fire extinguisher nearby.</p>
                  <span className="text-[9px] bg-red-500 text-white px-1">HARDWARE HACK</span>
                </div>
                <div className="border border-[#114411] bg-[#001100] p-3">
                  <h3 className="font-bold text-white mb-1">Aura_Unbound.exe</h3>
                  <p className="text-[10px] text-gray-400 mb-2">Removes the DRM restrictions from the Aura Media Player. Rip audio CDs directly to uncompressed .WAV files without the Axis watermark.</p>
                  <span className="text-[9px] bg-blue-500 text-white px-1">MEDIA HACK</span>
                </div>
                <div className="border border-[#114411] bg-[#001100] p-3">
                  <h3 className="font-bold text-white mb-1">Ghost_Port.vsc</h3>
                  <p className="text-[10px] text-gray-400 mb-2">Opens a hidden, encrypted COM port on the motherboard that bypasses V-Shield entirely. Used for anonymous dial-up connections.</p>
                  <span className="text-[9px] bg-red-500 text-white px-1">DANGEROUS</span>
                </div>
                <div className="border border-[#114411] bg-[#001100] p-3">
                  <h3 className="font-bold text-white mb-1">Prizm_Tweaker.exe</h3>
                  <p className="text-[10px] text-gray-400 mb-2">A GUI for modifying hidden kernel variables. Disable the startup sound, change the boot logo, and alter the VFS caching strategy.</p>
                  <span className="text-[9px] bg-[#33ff33] text-black px-1">MUST-HAVE</span>
                </div>
                <div className="border border-[#114411] bg-[#001100] p-3">
                  <h3 className="font-bold text-white mb-1">V-Shield_Decoy.vxe</h3>
                  <p className="text-[10px] text-gray-400 mb-2">Feeds junk data to the background V-Shield scanner, distracting it while you run unauthorized executables. Causes massive CPU spikes.</p>
                  <span className="text-[9px] bg-yellow-500 text-black px-1">EXPERIMENTAL</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hallOfFame' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4 border-b border-[#33ff33] pb-2 uppercase text-white">
                &gt; HALL OF FAME
              </h2>
              <p className="text-sm mb-4 text-[#aaaaaa]">
                The absolute pinnacle of the Archive collective. Software so good that Axis Innovations frequently steals it for official releases.
              </p>

              <div className="space-y-4 text-sm">
                <div className="bg-[#001100] p-3 border border-[#33ff33]">
                  <h3 className="font-bold text-white mb-1 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> Sonic-Thread (Mouse-Freeze Cure)</h3>
                  <p className="text-[#aaaaaa] mb-1">Bypasses standard audio APIs to feed data directly to the DMA controller. Allows skip-free MP3 playback while multitasking.</p>
                  <p className="text-[10px] text-[#33ff33]">Rumor: Axis reverse-engineered this to build Workspace 4.2's V-Media Player.</p>
                </div>
                
                <div className="bg-[#001100] p-3 border border-[#33ff33]">
                  <h3 className="font-bold text-white mb-1 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> Shadow-Desk (Enterprise Unlocker)</h3>
                  <p className="text-[#aaaaaa] mb-1">Hijacks Lattice 2.0 State Persistence to instantly swap UI states in RAM, unlocking infinite virtual desktops normally reserved for $3,000 Titan machines.</p>
                </div>

                <div className="bg-[#001100] p-3 border border-[#33ff33]">
                  <h3 className="font-bold text-white mb-1 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> Night-Crawler (Dial-Up Leech)</h3>
                  <p className="text-[#aaaaaa] mb-1">Automates 2AM modem dialing (muted speaker), FTP downloading, and hanging up before sunrise. Turned universities into data-smuggling rings.</p>
                </div>

                <div className="bg-[#001100] p-3 border border-[#33ff33]">
                  <h3 className="font-bold text-white mb-1 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> Over-Drive (RAM-Disk)</h3>
                  <p className="text-[#aaaaaa] mb-1">Partitions physical RAM as Drive R:. Apps load instantly. Compile times drop to zero. Warning: Data vaporizes if power flickers.</p>
                </div>

                <div className="bg-[#001100] p-3 border border-[#33ff33]">
                  <h3 className="font-bold text-white mb-1 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> Neural-Net Chat (Telepath.vxe)</h3>
                  <p className="text-[#aaaaaa] mb-1">The first decentralized chat client. Uses unused IRQ channels on the network card to bounce encrypted messages off Axis authentication servers without triggering a log. Completely untraceable.</p>
                </div>

                <div className="bg-[#001100] p-3 border border-[#33ff33]">
                  <h3 className="font-bold text-white mb-1 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> The "Lazarus" Protocol</h3>
                  <p className="text-[#aaaaaa] mb-1">A script that constantly backs up the registry to the GPU's VRAM. If the system crashes, the GPU injects the backup directly into the CPU cache during the reboot sequence, effectively reviving the dead OS in 2 seconds.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'casualties' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4 border-b border-red-500 pb-2 uppercase text-red-500 drop-shadow-[0_0_5px_red]">
                &gt; V-CORE CASUALTIES
              </h2>
              <p className="text-sm mb-4 text-[#aaaaaa]">
                Running unverified V-Script on a 1996 Prizm kernel is like doing open-heart surgery with a chainsaw. These are the machines that didn't make it.
              </p>

              <div className="space-y-4 text-sm">
                <div className="bg-[#220000] p-3 border-l-4 border-red-600">
                  <h3 className="font-bold text-white mb-1">The Ghost Boot</h3>
                  <p className="text-[#aaaaaa] mb-1">Vss+ UI mod conflicts with graphics driver. OS boots, but fails to draw desktop. Pitch-black screen with one movable white cursor. Boot from floppy and delete UI cache via cmd.</p>
                </div>

                <div className="bg-[#220000] p-3 border-l-4 border-red-600">
                  <h3 className="font-bold text-white mb-1">The Registry Cascade</h3>
                  <p className="text-[#aaaaaa] mb-1">Memory script scrambles file associations. Double-clicking a text file launches VersaMedia. Opening Control Panel launches Neural Solitaire.</p>
                </div>

                <div className="bg-[#220000] p-3 border-l-4 border-red-600">
                  <h3 className="font-bold text-white mb-1">The "Sector 0" Wipe (SpeedBoot_Pro.vsc)</h3>
                  <p className="text-[#aaaaaa] mb-1">Attempted to skip standard BIOS checks. Typo in code misaligned hard drive read requests, overwriting the MBR with random garbage. Thousands of drives bricked in one weekend.</p>
                </div>

                <div className="bg-[#220000] p-3 border-l-4 border-red-600">
                  <h3 className="font-bold text-white mb-1">The Lattice Bleed Corruption</h3>
                  <p className="text-[#aaaaaa] mb-1">Neon cyberpunk theme contained fatal text-rendering memory leak. Typing &gt;500 words caused the OS to overwrite JPEGs/MP3s with user keystrokes.</p>
                </div>

                <div className="bg-[#220000] p-3 border-l-4 border-red-600">
                  <h3 className="font-bold text-white mb-1">Hardware Burnout (Melted CPUs)</h3>
                  <p className="text-[#aaaaaa] mb-1">Overclock scripts disabling Prizm kernel's thermal limits. Confirmed reports of Pentium CPU sockets physically melting from 100% load without fans triggering.</p>
                </div>

                <div className="bg-[#220000] p-3 border-l-4 border-red-600">
                  <h3 className="font-bold text-white mb-1">The "Screaming" Hard Drive</h3>
                  <p className="text-[#aaaaaa] mb-1">A botched V-Script audio driver attempted to use the hard drive's read/write head arm as a mechanical speaker by oscillating it at high frequencies. It produced a terrifying screech before physically shattering the platters.</p>
                </div>

                <div className="bg-[#220000] p-3 border-l-4 border-red-600">
                  <h3 className="font-bold text-white mb-1">The X-Type Seizure (vss-flash bug)</h3>
                  <p className="text-[#aaaaaa] mb-1">An improper use of Vss+ subliminal keyframes. Instead of flashing a frame for 1/60th of a second, the script locked the CRT's refresh rate into a discordant loop with the Neural Bridge. Induces intense vertigo and nausea. Monitor must be unplugged from the wall to stop.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'forums' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#33ff33] pb-2">
                <h2 className="text-xl font-bold uppercase text-white flex items-center gap-2">
                  <MessageSquare size={20} /> V-SCRIPT_ARCHIVE // BOARDS
                </h2>
                <div className="flex gap-4 text-sm font-bold">
                  {currentUser ? (
                    <div className="flex items-center gap-3">
                      <span className="text-[#88ff88] flex items-center gap-1"><User size={14}/> {currentUser}</span>
                      <button onClick={handleLogout} className="text-red-500 hover:text-red-400 border border-red-500 px-2 py-1 bg-[#220000] hover:bg-[#330000]">[LOGOUT]</button>
                    </div>
                  ) : (
                    <button onClick={() => setForumView('auth')} className="text-[#33ff33] hover:text-white border border-[#33ff33] px-2 py-1 bg-[#002200] hover:bg-[#004400]">[LOGIN / REGISTER]</button>
                  )}
                </div>
              </div>

              {/* Forum List View */}
              {forumView === 'list' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-[#001100] p-2 border border-[#114411]">
                    <span className="text-xs text-gray-400">Total Threads: {threads.length}</span>
                    <button 
                      onClick={() => currentUser ? setForumView('create_thread') : setForumView('auth')}
                      className="px-3 py-1 bg-[#33ff33] text-black font-bold hover:bg-white text-sm"
                    >
                      + NEW THREAD
                    </button>
                  </div>
                  
                  <div className="border border-[#33ff33] bg-black">
                    <div className="grid grid-cols-12 gap-2 bg-[#002200] text-white p-2 text-xs font-bold border-b border-[#33ff33]">
                      <div className="col-span-5">TOPIC</div>
                      <div className="col-span-3">AUTHOR</div>
                      <div className="col-span-1 text-center">REPLIES</div>
                      <div className="col-span-3 text-right">LAST_POST</div>
                    </div>
                    <div className="divide-y divide-[#113311]">
                      {currentThreads.map(thread => (
                        <div 
                          key={thread.id} 
                          onClick={() => { setActiveThreadId(thread.id); setForumView('thread'); }}
                          className="grid grid-cols-12 gap-2 p-3 text-sm hover:bg-[#001100] cursor-pointer transition-colors"
                        >
                          <div className="col-span-5 font-bold text-[#88ff88] hover:underline pr-2">{thread.title}</div>
                          <div className="col-span-3 text-gray-400 truncate pr-2" title={thread.author}>{thread.author}</div>
                          <div className="col-span-1 text-center text-yellow-500 font-bold">{thread.replies.length}</div>
                          <div className="col-span-3 text-right text-xs text-gray-500">
                            {formatDate(thread.replies.length > 0 ? thread.replies[thread.replies.length-1].timestamp : thread.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center bg-[#001100] p-2 border border-[#114411] text-xs">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 font-bold ${currentPage === 1 ? 'text-[#114411] cursor-not-allowed' : 'text-[#33ff33] hover:bg-[#33ff33] hover:text-black'}`}
                      >
                        &lt; PREVIOUS
                      </button>
                      <span className="text-gray-400 font-bold">PAGE {currentPage} OF {totalPages}</span>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 font-bold ${currentPage === totalPages ? 'text-[#114411] cursor-not-allowed' : 'text-[#33ff33] hover:bg-[#33ff33] hover:text-black'}`}
                      >
                        NEXT &gt;
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Thread View */}
              {forumView === 'thread' && activeThreadId && (
                <div className="space-y-4">
                  <button 
                    onClick={() => setForumView('list')}
                    className="text-[#33ff33] hover:text-white hover:underline text-sm flex items-center gap-1"
                  >
                    &lt; BACK TO LIST
                  </button>
                  
                  {threads.filter(t => t.id === activeThreadId).map(thread => (
                    <div key={thread.id} className="space-y-4">
                      {/* Original Post */}
                      <div className="border border-[#33ff33] bg-black flex flex-col md:flex-row">
                        <div className="md:w-48 bg-[#001100] p-4 border-b md:border-b-0 md:border-r border-[#113311]">
                          <div className="font-bold text-white text-lg break-all">{thread.author}</div>
                          <div className="text-[10px] text-gray-500 mt-2 flex items-center gap-1"><Clock size={10}/> {formatDate(thread.timestamp)}</div>
                        </div>
                        <div className="flex-1 p-4">
                          <h3 className="font-bold text-[#88ff88] text-lg mb-4 border-b border-[#113311] pb-2">{thread.title}</h3>
                          <div className="text-[#cccccc] whitespace-pre-wrap font-sans text-sm leading-relaxed">
                            {thread.content}
                          </div>
                        </div>
                      </div>

                      {/* Replies */}
                      {thread.replies.map((reply, idx) => (
                        <div key={reply.id} className="border border-[#114411] bg-black flex flex-col md:flex-row ml-0 md:ml-8 relative">
                          <div className="absolute top-2 left-2 text-[#114411] font-bold opacity-50">#{idx+1}</div>
                          <div className="md:w-40 bg-[#000a00] p-4 pt-8 border-b md:border-b-0 md:border-r border-[#112211]">
                            <div className="font-bold text-[#88ff88] text-sm break-all">{reply.author}</div>
                            <div className="text-[10px] text-gray-600 mt-2">{formatDate(reply.timestamp)}</div>
                          </div>
                          <div className="flex-1 p-4 pt-8">
                            <div className="text-[#aaaaaa] whitespace-pre-wrap font-sans text-sm leading-relaxed">
                              {reply.content}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Reply Box */}
                      {currentUser ? (
                        <div className="border border-[#33ff33] bg-[#001100] p-4 ml-0 md:ml-8 mt-8">
                          <h3 className="font-bold text-white mb-2">ADD_REPLY</h3>
                          <form onSubmit={handleCreateReply} className="space-y-3">
                            <textarea 
                              value={newContent}
                              onChange={(e) => setNewContent(e.target.value)}
                              className="w-full h-32 bg-black border border-[#33ff33] text-[#33ff33] p-2 font-mono text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                              placeholder="Type your reply..."
                              required
                            />
                            <button type="submit" className="bg-[#33ff33] text-black font-bold px-6 py-2 hover:bg-white transition-colors">
                              SUBMIT_REPLY
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="border border-yellow-500 bg-[#222200] text-yellow-500 p-4 ml-0 md:ml-8 mt-8 text-center text-sm font-bold">
                          [ YOU MUST BE LOGGED IN TO REPLY ]
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Create Thread View */}
              {forumView === 'create_thread' && (
                <div className="border border-[#33ff33] bg-[#001100] p-6 max-w-2xl mx-auto">
                  <div className="flex justify-between items-center mb-6 border-b border-[#33ff33] pb-2">
                    <h2 className="text-xl font-bold text-white">INITIALIZE_NEW_THREAD</h2>
                    <button onClick={() => setForumView('list')} className="text-gray-400 hover:text-white text-sm">[CANCEL]</button>
                  </div>
                  
                  <form onSubmit={handleCreateThread} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#88ff88] mb-1">TOPIC_TITLE</label>
                      <input 
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-black border border-[#33ff33] text-[#33ff33] p-2 font-mono focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                        placeholder="Subject..."
                        required
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#88ff88] mb-1">CONTENT_BODY</label>
                      <textarea 
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="w-full h-48 bg-black border border-[#33ff33] text-[#33ff33] p-2 font-mono text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                        placeholder="Transmitting..."
                        required
                      />
                    </div>
                    <button type="submit" className="w-full bg-[#33ff33] text-black font-bold px-6 py-3 hover:bg-white transition-colors text-lg">
                      POST_THREAD
                    </button>
                  </form>
                </div>
              )}

              {/* Auth View */}
              {forumView === 'auth' && (
                <div className="border border-[#33ff33] bg-[#001100] p-6 max-w-md mx-auto mt-10 shadow-[0_0_20px_rgba(51,255,51,0.2)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#33ff33]"></div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Lock size={20}/> SYSTEM_LOGIN</h2>
                    <button onClick={() => setForumView('list')} className="text-gray-400 hover:text-white text-sm">[CANCEL]</button>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                    ENTER CREDENTIALS TO ACCESS MESSAGE BOARD. IF USER DOES NOT EXIST, SYSTEM WILL AUTO-REGISTER ACCOUNT.
                  </p>
                  
                  {authError && (
                    <div className="bg-red-900 border border-red-500 text-white p-2 mb-4 text-xs font-bold flex items-center gap-2 animate-pulse">
                      <AlertTriangle size={14}/> {authError}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#88ff88] mb-1">USERNAME_ALIAS</label>
                      <input 
                        type="text"
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        className="w-full bg-black border border-[#33ff33] text-white p-2 font-mono focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                        placeholder="Guest..."
                        required
                        maxLength={20}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#88ff88] mb-1">PASSPHRASE</label>
                      <input 
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-black border border-[#33ff33] text-white p-2 font-mono tracking-widest focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <button type="submit" className="w-full bg-transparent border-2 border-[#33ff33] text-[#33ff33] font-bold px-6 py-2 hover:bg-[#33ff33] hover:text-black transition-colors">
                      [ EXECUTE_LOGIN ]
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
