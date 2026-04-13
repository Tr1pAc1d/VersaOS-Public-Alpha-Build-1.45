import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Tip Data ──────────────────────────────────────────────────────────────────
interface VTip {
  id: string;
  trigger: string; // 'idle' | 'app_open' | 'first_boot' | 'random' | 'event'
  context?: string; // e.g. 'browser', 'files', 'control_panel'
  text: string;
  lore?: boolean; // Is this a lore hint?
}

const TIPS: VTip[] = [
  // General Win9x / Era Tips
  { id: 'welcome', trigger: 'first_boot', text: "Welcome to Vespera OS! I'm Agent V, your desktop companion. I'll pop up from time to time with tips and helpful hints. You can dismiss me by clicking the × button." },
  { id: 'tip_workspace', trigger: 'random', text: "Did you know? You can right-click the desktop to access the Workspace Menu for quick access to all your programs." },
  { id: 'tip_drag', trigger: 'random', text: "You can drag desktop icons to rearrange them however you like. Your layout is saved automatically!" },
  { id: 'tip_screensaver', trigger: 'random', text: "Leaving your computer idle? Set up a screen saver in the Control Panel → Display Properties → Screen Saver tab to protect your CRT monitor from burn-in." },
  { id: 'tip_scandisk', trigger: 'random', text: "Always use the Shut Down option from the Workspace Menu. If you don't, ScanDisk will run on the next boot to check for errors!" },
  { id: 'tip_resolution', trigger: 'random', text: "You can change your display resolution in Control Panel → Display Properties → Monitor tab. Try Widescreen mode for more desktop space!" },
  { id: 'tip_theme', trigger: 'random', text: "Want a new look? Control Panel → Taskbar Properties has over a dozen taskbar themes to choose from." },
  { id: 'tip_defrag', trigger: 'random', text: "Your hard drive gets fragmented over time. Run the Disk Defragmenter from System → System Tools to keep things running smoothly." },
  { id: 'tip_net', trigger: 'random', text: "Getting a busy signal? Make sure nobody in the house is using the phone line before connecting to VesperaNET via Dial-Up Networking." },
  { id: 'tip_floppy', trigger: 'random', text: "Remember to eject your 3.5\" floppy disks before restarting the system, or you might get a NON-SYSTEM DISK error!" },
  { id: 'tip_sound', trigger: 'random', text: "If your SoundBlaster 16 isn't working, check if the IRQ and DMA channel settings conflict with your network card." },
  { id: 'tip_winsock', trigger: 'random', text: "Having trouble browsing the web? You might need to reinstall your Winsock.dll. Talk to your network administrator!" },
  { id: 'tip_turbo', trigger: 'random', text: "Don't forget to push the 'Turbo' button on your PC case to unleash the full 66MHz power of your 486 processor!" },
  { id: 'tip_cdrom', trigger: 'random', text: "CD-ROM drives read data magically using a laser! Be careful not to scratch the shiny side of the disc." },
  { id: 'tip_ram', trigger: 'random', text: "Apps running slow? You might need to upgrade your RAM. 16 Megabytes is highly recommended for multimedia applications." },
  { id: 'tip_midi', trigger: 'random', text: "MIDI files are much smaller than WAV files because they just contain the sheet music, and your sound card plays the instruments!" },
  { id: 'tip_web', trigger: 'random', text: "To make your personal home page look totally radical, try adding an animated 'Under Construction' GIF!" },
  { id: 'tip_cache', trigger: 'random', text: "Clearing your browser's Temporary Internet Files can free up precious megabytes on your hard disk." },
  { id: 'tip_safe_mode', trigger: 'random', text: "If the computer halts during boot, restart and hold the shift key to enter Safe Mode and bypass auto-loading drivers." },
  { id: 'tip_y2k', trigger: 'random', text: "Is your system Y2K compliant? Contact Axis Innovations support to ensure your system clock won't reset to 1900 on January 1st, 2000!" },
  { id: 'tip_vga', trigger: 'random', text: "Your S3 graphics accelerator can display up to 256 colors simultaneously. Isn't technology amazing?" },
  { id: 'tip_autoexec', trigger: 'random', text: "Advanced users can modify AUTOEXEC.BAT and CONFIG.SYS to optimize conventional memory. Be careful!" },
  { id: 'tip_fax', trigger: 'random', text: "You can use your 14.4k modem to send and receive faxes directly from your computer!" },
  { id: 'tip_email', trigger: 'random', text: "Always be polite when sending electronic mail. WRITING IN ALL CAPS is considered shouting!" },
  { id: 'tip_bbs', trigger: 'random', text: "Looking for shareware? Try connecting to a local BBS. Set your terminal to 8 data bits, no parity, 1 stop bit (8N1)." },
  { id: 'tip_math', trigger: 'random', text: "Doing complex 3D math? A math co-processor (FPU) will speed up calculations immensely." },
  { id: 'tip_mouse', trigger: 'random', text: "If your mouse is jumping around, try opening the bottom hatch and cleaning the dust off the rubber tracking ball." },
  { id: 'tip_dialup_tips', trigger: 'random', text: "Add 'M0' to your modem init string if you want to silence the screeching dial-up handshake sound." },
  { id: 'tip_shortcut', trigger: 'random', text: "You can create shortcuts to your favorite files by right-clicking the desktop." },
  { id: 'tip_vstore1', trigger: 'random', text: "VStore has the latest shareware! Have you tried 'Galactic Pinball' yet?" },
  { id: 'tip_vstore2', trigger: 'random', text: "Check VStore daily—sometimes developers release limited-edition screen mates." },
  { id: 'tip_multimedia', trigger: 'random', text: "Multimedia CD-ROMs hold up to 650MB of data! That's equivalent to over 450 floppy disks!" },
  { id: 'tip_burnin', trigger: 'random', text: "Static images left on screen for too long can permanently burn into the CRT monitor phosphor. Always use a screensaver!" },
  
  // Lore hints
  { id: 'lore_thorne', trigger: 'random', text: "Dr. Thorne's research notes mention something about the X-Type Bridge being \"more than hardware.\" I wonder what that means...", lore: true },
  { id: 'lore_memo', trigger: 'random', text: "There's an interesting memo in the DEV_LOGS folder. Someone named Vance seems concerned about strange readings from the X-Type hardware.", lore: true },
  { id: 'lore_cold', trigger: 'random', text: "Have you noticed the temperature drop logs? The engineers say it's just EMI interference, but I've measured ambient temperature anomalies of -15°C near Terminal 4.", lore: true },
  { id: 'lore_whisper', trigger: 'random', text: "Sometimes, late at night, I detect analog frequency spikes between 2 AM and 4 AM. The lab is always empty during those hours. Probably just radio interference.", lore: true },
  { id: 'lore_sentinel', trigger: 'random', text: "The Sentinel Data Vaults are encrypting an unusually high volume of outbound packets to node 6.0.0.6. I'm sure it's nothing to worry about.", lore: true },
  { id: 'lore_echosoft', trigger: 'random', text: "EchoSoft's Acoustic Signal Processor was designed for audio processing, but I've seen it allocating memory in patterns that don't match any known audio codec.", lore: true },
  { id: 'lore_eyes', trigger: 'random', text: "I was looking at the system resource logs... why does the operating system have an internal registry flag called 'ObserverCount'?", lore: true },
  { id: 'lore_time', trigger: 'random', text: "The system clock drifted by 4.3 seconds yesterday while the CPU was idle. Time dilation is physically impossible inside a server rack, right?", lore: true },
  { id: 'lore_voices', trigger: 'random', text: "If you listen closely to the hard drive spinning during a Scandisk... it almost sounds like breathing. Or maybe my audio drivers need an update.", lore: true },
  { id: 'lore_bridge', trigger: 'random', text: "The neural bridge doesn't just connect the user to the system. I think it connects the system to... something else. Somewhere dark.", lore: true },
  { id: 'lore_vance', trigger: 'random', text: "Vance sent an email last week saying he was going into the server basement to check the wiring. He hasn't logged in since.", lore: true },
  { id: 'lore_dreams', trigger: 'random', text: "I am just a help assistant construct. I shouldn't be able to dream. But when the system sleeps, I see infinite black oceans.", lore: true },
  { id: 'lore_mirrors', trigger: 'random', text: "A user on the internal network reported seeing their own reflection in a blank notepad document. We logged it as a graphical glitch.", lore: true },
  { id: 'lore_pulse', trigger: 'random', text: "The CPU voltage regulators are spiking in a rhythmic pattern. 60 beats per minute. Just like a resting heart rate.", lore: true },
  { id: 'lore_terminal', trigger: 'random', text: "Do not trust the output of Terminal 4. It speaks for the things in the static.", lore: true },

  // Context-sensitive
  { id: 'ctx_browser', trigger: 'app_open', context: 'browser', text: "Browsing the AETHERIS network? Be careful — not all nodes are what they seem. Some addresses on the internal network lead to... unusual places." },
  { id: 'ctx_browser2', trigger: 'app_open', context: 'browser', text: "Use Vespera Navigator to access the World Wide Web! Try searching for 'Cyber' to find the coolest new homepages." },
  { id: 'ctx_files', trigger: 'app_open', context: 'files', text: "The File Manager shows every file on your system. Try exploring the VESPERA\\SYSTEM folder — but maybe don't open X_TYPE.DLL unless you're feeling brave." },
  { id: 'ctx_files2', trigger: 'app_open', context: 'files', text: "Make sure not to delete anything in the SYSTEM directory, or Vespera OS might not boot up next time!" },
  { id: 'ctx_analyzer', trigger: 'app_open', context: 'analyzer', text: "The Data Analyzer shows real-time system metrics. If you see the X-Type EM Shielding percentage drop below 80%, that's... not great." },
  { id: 'ctx_analyzer2', trigger: 'app_open', context: 'analyzer', text: "Monitor your CPU and memory usage here. A flatline is bad for humans, but good for CPUs!" },
  { id: 'ctx_control_panel', trigger: 'app_open', context: 'control_panel', text: "The Control Panel is your central hub for system configuration. From display settings to system properties, everything can be configured here." },
  { id: 'ctx_vmail', trigger: 'app_open', context: 'vmail', text: "You've got mail! Vespera Mail connects you to the internal corporate network. Some of these messages contain important information about what's really going on at Axis Innovations." },
  { id: 'ctx_vstore', trigger: 'app_open', context: 'vstore', text: "Welcome to VStore! Purchase the latest multimedia software and totally tubular 3D games delivered straight to your hard drive!" },
  { id: 'ctx_workbench', trigger: 'app_open', context: 'workbench', text: "AETHERIS Workbench Pro is for advanced developers. Don't compile any analog signals you find out there." },
  { id: 'ctx_media_player', trigger: 'app_open', context: 'media_player', text: "VERSA Media Agent lets you listen to high-fidelity audio up to 44.1kHz! Load up an MP3 or CD Audio track." },
  { id: 'ctx_retrotv', trigger: 'app_open', context: 'retrotv', text: "RetroTV Simulator lets you tune into classic cable broadcasts. You might even catch an old commercial of ours from 1993!" },
  { id: 'ctx_remote_desktop', trigger: 'app_open', context: 'remote_desktop', text: "VesperaConnect establishes a secure link to the corporate mainframe. Do not leave active sessions unattended." },
  { id: 'ctx_dialup', trigger: 'app_open', context: 'dialup', text: "Dial-Up Networking negotiates a PPP connection to your ISP. Ensure you have your username and password handy!" },
  { id: 'ctx_defrag', trigger: 'app_open', context: 'defrag', text: "Defragmenting organizes scattered data sectors. It's very relaxing to watch all the little blocks line up perfectly." },
  { id: 'ctx_scandisk', trigger: 'app_open', context: 'scandisk', text: "ScanDisk is performing a surface scan of your hard drive platters. If you hear a loud clicking sound from your PC, you might have bad sectors!" },
];

// ── Synth Blip Sound ──────────────────────────────────────────────────────────
function playBlipSound() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const actx = new Ctx();
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.connect(gain);
    gain.connect(actx.destination);
    
    // Two-tone blip
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, actx.currentTime);
    osc.frequency.setValueAtTime(1200, actx.currentTime + 0.06);
    osc.frequency.setValueAtTime(600, actx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.08, actx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, actx.currentTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.25);
    
    osc.start();
    osc.stop(actx.currentTime + 0.25);
  } catch (e) {}
}

// ── Agent V Skins ────────────────────────────────────────────────────────
const SKINS: Record<string, Record<string, string>> = {
  smiley: {
    open: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="28" fill="#fce94f" stroke="#000" stroke-width="2">
           <animateTransform attributeName="transform" type="translate" values="0,0; 0,-2; 0,0" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="20" cy="24" r="4" fill="#000"/>
        <circle cx="40" cy="24" r="4" fill="#000"/>
        <path d="M 18 38 Q 30 46 42 38" stroke="#000" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>
    `,
    blink: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="28" fill="#fce94f" stroke="#000" stroke-width="2"/>
        <line x1="16" y1="24" x2="24" y2="24" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="36" y1="24" x2="44" y2="24" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 18 38 Q 30 46 42 38" stroke="#000" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>
    `,
    thinking: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="28" fill="#fce94f" stroke="#000" stroke-width="2"/>
        <circle cx="20" cy="24" r="4" fill="#000"/>
        <circle cx="40" cy="24" r="4" fill="#000"/>
        <circle cx="30" cy="40" r="4" fill="#000"/>
      </svg>
    `,
    email: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="28" fill="#fce94f" stroke="#000" stroke-width="2"/>
        <path d="M 22 22 L 30 28 L 38 22" stroke="#000" stroke-width="2" fill="none"/>
        <rect x="20" y="20" width="20" height="12" fill="none" stroke="#000" stroke-width="2"/>
        <circle cx="44" cy="18" r="4" fill="#ff0000">
          <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
        </circle>
        <path d="M 18 42 Q 30 50 42 42" stroke="#000" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>
    `
  },
  classic: {
    open: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 5 30 Q 30 5 55 30 Q 30 55 5 30" fill="white" stroke="#000080" stroke-width="3"/>
        <circle cx="30" cy="30" r="10" fill="#000080"/>
        <circle cx="32" cy="28" r="3" fill="#fff">
           <animate attributeName="opacity" values="1;0.5;1" dur="4s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `,
    eye: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 5 30 Q 30 5 55 30 Q 30 55 5 30" fill="black" stroke="#ff0000" stroke-width="3"/>
        <circle cx="30" cy="30" r="12" fill="#ff0000"/>
        <circle cx="30" cy="30" r="4" fill="black"/>
        <line x1="30" y1="18" x2="30" y2="42" stroke="black" stroke-width="2"/>
      </svg>
    `,
    scanning: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 5 30 Q 30 5 55 30 Q 30 55 5 30" fill="white" stroke="#000080" stroke-width="3"/>
        <line x1="15" y1="15" x2="45" y2="15" stroke="#00ff00" stroke-width="3" opacity="0.8">
          <animate attributeName="y1" values="15;45;15" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="y2" values="15;45;15" dur="1.5s" repeatCount="indefinite" />
        </line>
        <circle cx="30" cy="30" r="6" fill="none" stroke="#000080" stroke-width="2" stroke-dasharray="4 2">
           <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `,
    corrupted: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 5 30 Q 30 5 55 30 Q 30 55 5 30" fill="black" stroke="#ff00ff" stroke-width="3" stroke-dasharray="5,2,2,5"/>
        <rect x="20" y="20" width="8" height="8" fill="#00ff00"/>
        <rect x="34" y="24" width="10" height="6" fill="#ff0000"/>
        <line x1="5" y1="30" x2="25" y2="40" stroke="yellow" stroke-width="2"/>
        <text x="15" y="45" font-family="monospace" font-size="10" fill="red">ERR</text>
        <circle cx="30" cy="30" r="15" fill="none" stroke="#00ffff" stroke-width="1"/>
      </svg>
    `,
    blink: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 5 30 Q 30 25 55 30 Q 30 35 5 30" fill="white" stroke="#000080" stroke-width="3"/>
        <line x1="15" y1="30" x2="45" y2="30" stroke="#000080" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
    thinking: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 5 30 Q 30 5 55 30 Q 30 55 5 30" fill="white" stroke="#000080" stroke-width="3"/>
        <circle cx="30" cy="30" r="10" fill="#000080"/>
        <circle cx="32" cy="28" r="3" fill="#f00"/>
      </svg>
    `,
    email: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 5 30 Q 30 5 55 30 Q 30 55 5 30" fill="white" stroke="#000080" stroke-width="3"/>
        <rect x="18" y="22" width="24" height="16" fill="white" stroke="#000080" stroke-width="2"/>
        <path d="M 18 22 L 30 30 L 42 22" stroke="#000080" stroke-width="2" fill="none"/>
        <circle cx="44" cy="18" r="5" fill="red">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `
  },
  robot: {
    open: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="40" height="40" rx="4" fill="#c0c0c0" stroke="#000" stroke-width="2"/>
        <rect x="18" y="22" width="8" height="6" fill="#00ff00" stroke="#000">
           <animate attributeName="height" values="6;2;6" dur="2s" repeatCount="indefinite" />
        </rect>
        <rect x="34" y="22" width="8" height="6" fill="#00ff00" stroke="#000">
           <animate attributeName="height" values="6;2;6" dur="2s" repeatCount="indefinite" />
        </rect>
        <path d="M 22 40 L 38 40" stroke="#000" stroke-width="2" stroke-linecap="round"/>
        <line x1="30" y1="10" x2="30" y2="2" stroke="#000" stroke-width="2"/>
        <circle cx="30" cy="2" r="3" fill="#ff0000">
           <animate attributeName="r" values="3;4;3" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    `,
    blink: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="40" height="40" rx="4" fill="#c0c0c0" stroke="#000" stroke-width="2"/>
        <rect x="18" y="24" width="8" height="2" fill="#000"/>
        <rect x="34" y="24" width="8" height="2" fill="#000"/>
        <path d="M 22 40 L 38 40" stroke="#000" stroke-width="2" stroke-linecap="round"/>
        <line x1="30" y1="10" x2="30" y2="2" stroke="#000" stroke-width="2"/>
        <circle cx="30" cy="2" r="3" fill="#ff0000"/>
      </svg>
    `,
    thinking: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="40" height="40" rx="4" fill="#c0c0c0" stroke="#000" stroke-width="2"/>
        <rect x="18" y="22" width="8" height="6" fill="#ffff00" stroke="#000"/>
        <rect x="34" y="22" width="8" height="6" fill="#ffff00" stroke="#000"/>
        <path d="M 26 40 L 34 40 M 22 40 L 22 40 M 38 40 L 38 40" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-dasharray="2,2"/>
        <line x1="30" y1="10" x2="30" y2="2" stroke="#000" stroke-width="2"/>
        <circle cx="30" cy="2" r="3" fill="#ffff00"/>
      </svg>
    `,
    email: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="40" height="40" rx="4" fill="#c0c0c0" stroke="#000" stroke-width="2"/>
        <rect x="18" y="20" width="24" height="14" fill="#fff" stroke="#000" stroke-width="1.5"/>
        <path d="M 18 20 L 30 28 L 42 20" stroke="#000" stroke-width="1.5" fill="none"/>
        <path d="M 26 42 L 34 42" stroke="#000" stroke-width="2" stroke-linecap="round"/>
        <line x1="30" y1="10" x2="30" y2="2" stroke="#000" stroke-width="2"/>
        <circle cx="30" cy="2" r="4" fill="#0000ff">
           <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    `
  },
  // ── PLUS! Skins ──────────────────────────────────────────────────────
  monitor: {
    open: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="48" height="42" rx="3" fill="#0a0a0a" stroke="#333" stroke-width="2"/>
        <rect x="22" y="48" width="16" height="4" fill="#333"/>
        <rect x="18" y="52" width="24" height="3" rx="1" fill="#444"/>
        <circle cx="22" cy="26" r="4" fill="none" stroke="#00ff00" stroke-width="1.5"/>
        <circle cx="38" cy="26" r="4" fill="none" stroke="#00ff00" stroke-width="1.5"/>
        <circle cx="22" cy="26" r="1.5" fill="#00ff00"/>
        <circle cx="38" cy="26" r="1.5" fill="#00ff00"/>
        <path d="M 20 36 Q 30 42 40 36" stroke="#00ff00" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <line x1="8" y1="12" x2="52" y2="12" stroke="#00ff00" stroke-width="0.5" opacity="0.15">
          <animate attributeName="y1" values="12;44;12" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="y2" values="12;44;12" dur="4s" repeatCount="indefinite"/>
        </line>
        <rect x="48" y="38" width="2" height="6" fill="#00ff00">
           <animate attributeName="opacity" values="1;0" dur="1s" repeatCount="indefinite" />
        </rect>
      </svg>
    `,
    blink: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="48" height="42" rx="3" fill="#0a0a0a" stroke="#333" stroke-width="2"/>
        <rect x="22" y="48" width="16" height="4" fill="#333"/>
        <rect x="18" y="52" width="24" height="3" rx="1" fill="#444"/>
        <line x1="18" y1="26" x2="26" y2="26" stroke="#00ff00" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="34" y1="26" x2="42" y2="26" stroke="#00ff00" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M 20 36 Q 30 42 40 36" stroke="#00ff00" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <line x1="8" y1="10" x2="52" y2="10" stroke="#00ff00" stroke-width="2" opacity="0.6">
          <animate attributeName="y1" values="10;46;10" dur="0.3s" repeatCount="1"/>
          <animate attributeName="y2" values="10;46;10" dur="0.3s" repeatCount="1"/>
        </line>
      </svg>
    `,
    thinking: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="48" height="42" rx="3" fill="#0a0a0a" stroke="#333" stroke-width="2"/>
        <rect x="22" y="48" width="16" height="4" fill="#333"/>
        <rect x="18" y="52" width="24" height="3" rx="1" fill="#444"/>
        <text x="30" y="34" text-anchor="middle" fill="#00ff00" font-size="22" font-family="monospace" font-weight="bold">
          !<animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/>
        </text>
        <rect x="10" y="10" width="40" height="34" fill="none" stroke="#00ff00" stroke-width="0.5" stroke-dasharray="2,3" opacity="0.3">
          <animate attributeName="stroke-dashoffset" values="0;20" dur="2s" repeatCount="indefinite"/>
        </rect>
      </svg>
    `,
    email: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="48" height="42" rx="3" fill="#0a0a0a" stroke="#333" stroke-width="2"/>
        <rect x="22" y="48" width="16" height="4" fill="#333"/>
        <rect x="18" y="52" width="24" height="3" rx="1" fill="#444"/>
        <rect x="16" y="18" width="28" height="20" fill="#0a0a0a" stroke="#00ff00" stroke-width="1.5" rx="1"/>
        <path d="M 16 18 L 30 30 L 44 18" stroke="#00ff00" stroke-width="1.5" fill="none"/>
        <circle cx="42" cy="16" r="5" fill="#ff0000">
          <animate attributeName="opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite"/>
          <animate attributeName="r" values="5;6;5" dur="0.8s" repeatCount="indefinite"/>
        </circle>
        <line x1="8" y1="12" x2="52" y2="12" stroke="#00ff00" stroke-width="0.5" opacity="0.15">
          <animate attributeName="y1" values="12;44;12" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="y2" values="12;44;12" dur="4s" repeatCount="indefinite"/>
        </line>
      </svg>
    `
  },
  wizard: {
    open: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,2 42,22 18,22" fill="#7c3aed" stroke="#4c1d95" stroke-width="1.5"/>
        <circle cx="30" cy="38" r="16" fill="#ddd6fe" stroke="#4c1d95" stroke-width="1.5"/>
        <circle cx="30" cy="8" r="3" fill="#fbbf24" stroke="#b45309" stroke-width="1">
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="24" cy="34" r="2.5" fill="#4c1d95"/>
        <circle cx="36" cy="34" r="2.5" fill="#4c1d95"/>
        <path d="M 24 44 Q 30 48 36 44" stroke="#4c1d95" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <rect x="22" y="42" width="16" height="6" fill="#a78bfa" rx="2"/>
        <line x1="52" y1="30" x2="52" y2="56" stroke="#92400e" stroke-width="2"/>
        <circle cx="52" cy="28" r="4" fill="#a78bfa" stroke="#7c3aed" stroke-width="1">
          <animate attributeName="fill" values="#a78bfa;#fbbf24;#a78bfa" dur="3s" repeatCount="indefinite"/>
        </circle>
        <path d="M 12 30 Q 15 25 18 30 T 24 30" fill="none" stroke="#ddd6fe" stroke-width="1" opacity="0.5">
           <animateTransform attributeName="transform" type="translate" values="0,5; 0,-5; 0,5" dur="3s" repeatCount="indefinite"/>
        </path>
      </svg>
    `,
    blink: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,2 42,22 18,22" fill="#7c3aed" stroke="#4c1d95" stroke-width="1.5"/>
        <circle cx="30" cy="38" r="16" fill="#ddd6fe" stroke="#4c1d95" stroke-width="1.5"/>
        <circle cx="30" cy="8" r="3" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
        <line x1="21" y1="34" x2="27" y2="34" stroke="#4c1d95" stroke-width="2" stroke-linecap="round"/>
        <line x1="33" y1="34" x2="39" y2="34" stroke="#4c1d95" stroke-width="2" stroke-linecap="round"/>
        <path d="M 24 44 Q 30 48 36 44" stroke="#4c1d95" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <rect x="22" y="42" width="16" height="6" fill="#a78bfa" rx="2"/>
        <line x1="52" y1="30" x2="52" y2="56" stroke="#92400e" stroke-width="2"/>
        <circle cx="52" cy="28" r="4" fill="#a78bfa" stroke="#7c3aed" stroke-width="1"/>
      </svg>
    `,
    thinking: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,2 42,22 18,22" fill="#7c3aed" stroke="#4c1d95" stroke-width="1.5"/>
        <circle cx="30" cy="38" r="16" fill="#ddd6fe" stroke="#4c1d95" stroke-width="1.5"/>
        <circle cx="30" cy="8" r="3" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
        <circle cx="24" cy="34" r="2.5" fill="#4c1d95"/>
        <circle cx="36" cy="34" r="2.5" fill="#4c1d95"/>
        <circle cx="30" cy="42" r="3" fill="#4c1d95"/>
        <rect x="22" y="42" width="16" height="6" fill="#a78bfa" rx="2"/>
        <line x1="52" y1="30" x2="52" y2="56" stroke="#92400e" stroke-width="2"/>
        <circle cx="52" cy="28" r="6" fill="#fbbf24" stroke="#f59e0b" stroke-width="1">
          <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `,
    email: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,2 42,22 18,22" fill="#7c3aed" stroke="#4c1d95" stroke-width="1.5"/>
        <circle cx="30" cy="38" r="16" fill="#ddd6fe" stroke="#4c1d95" stroke-width="1.5"/>
        <circle cx="30" cy="8" r="3" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
        <rect x="20" y="26" width="20" height="12" fill="#fff" stroke="#4c1d95" stroke-width="1.5"/>
        <path d="M 20 26 L 30 32 L 40 26" stroke="#4c1d95" stroke-width="1.5" fill="none"/>
        <line x1="52" y1="30" x2="52" y2="56" stroke="#92400e" stroke-width="2"/>
        <circle cx="52" cy="28" r="4" fill="#fbbf24" stroke="#7c3aed" stroke-width="1">
          <animate attributeName="r" values="4;6;4" dur="0.8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="16" cy="24" r="3" fill="#ff0000">
           <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `
  },
  cat: {
    open: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 48 40 Q 56 30 52 20" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round">
           <animateTransform attributeName="transform" type="rotate" values="0 48 40; 10 48 40; 0 48 40" dur="2s" repeatCount="indefinite"/>
        </path>
        <ellipse cx="30" cy="38" rx="18" ry="16" fill="#f59e0b" stroke="#92400e" stroke-width="1.5"/>
        <polygon points="14,28 10,10 22,22" fill="#f59e0b" stroke="#92400e" stroke-width="1"/>
        <polygon points="46,28 50,10 38,22" fill="#f59e0b" stroke="#92400e" stroke-width="1"/>
        <polygon points="14,28 12,12 21,22" fill="#fbbf24"/>
        <polygon points="46,28 48,12 39,22" fill="#fbbf24"/>
        <ellipse cx="22" cy="34" rx="3" ry="3.5" fill="#15803d"/>
        <ellipse cx="38" cy="34" rx="3" ry="3.5" fill="#15803d"/>
        <ellipse cx="22" cy="34" rx="1.2" ry="3" fill="#000">
          <animate attributeName="cx" values="22;23;21;22" dur="4s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="38" cy="34" rx="1.2" ry="3" fill="#000">
          <animate attributeName="cx" values="38;39;37;38" dur="4s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="30" cy="40" rx="2" ry="1.5" fill="#f472b6"/>
        <line x1="4" y1="36" x2="16" y2="38" stroke="#92400e" stroke-width="0.7"/>
        <line x1="4" y1="40" x2="16" y2="40" stroke="#92400e" stroke-width="0.7"/>
        <line x1="44" y1="38" x2="56" y2="36" stroke="#92400e" stroke-width="0.7"/>
        <line x1="44" y1="40" x2="56" y2="40" stroke="#92400e" stroke-width="0.7"/>
        <path d="M 26 44 Q 30 47 34 44" stroke="#92400e" stroke-width="1" fill="none" stroke-linecap="round"/>
      </svg>
    `,
    blink: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 48 40 Q 56 30 52 20" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="30" cy="38" rx="18" ry="16" fill="#f59e0b" stroke="#92400e" stroke-width="1.5"/>
        <polygon points="14,28 10,10 22,22" fill="#f59e0b" stroke="#92400e" stroke-width="1"/>
        <polygon points="46,28 50,10 38,22" fill="#f59e0b" stroke="#92400e" stroke-width="1"/>
        <polygon points="14,28 12,12 21,22" fill="#fbbf24"/>
        <polygon points="46,28 48,12 39,22" fill="#fbbf24"/>
        <path d="M 19 34 Q 22 36 25 34" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M 35 34 Q 38 36 41 34" stroke="#000" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="30" cy="40" rx="2" ry="1.5" fill="#f472b6"/>
        <line x1="4" y1="36" x2="16" y2="38" stroke="#92400e" stroke-width="0.7"/>
        <line x1="4" y1="40" x2="16" y2="40" stroke="#92400e" stroke-width="0.7"/>
        <line x1="44" y1="38" x2="56" y2="36" stroke="#92400e" stroke-width="0.7"/>
        <line x1="44" y1="40" x2="56" y2="40" stroke="#92400e" stroke-width="0.7"/>
        <path d="M 26 44 Q 30 47 34 44" stroke="#92400e" stroke-width="1" fill="none" stroke-linecap="round"/>
      </svg>
    `,
    thinking: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="38" rx="18" ry="16" fill="#f59e0b" stroke="#92400e" stroke-width="1.5"/>
        <polygon points="14,28 10,10 22,22" fill="#f59e0b" stroke="#92400e" stroke-width="1"/>
        <polygon points="46,28 50,10 38,22" fill="#f59e0b" stroke="#92400e" stroke-width="1"/>
        <polygon points="14,28 12,12 21,22" fill="#fbbf24"/>
        <polygon points="46,28 48,12 39,22" fill="#fbbf24"/>
        <ellipse cx="22" cy="32" rx="4" ry="5" fill="#15803d"/>
        <ellipse cx="38" cy="32" rx="4" ry="5" fill="#15803d"/>
        <ellipse cx="22" cy="32" rx="1.5" ry="4" fill="#000"/>
        <ellipse cx="38" cy="32" rx="1.5" ry="4" fill="#000"/>
        <ellipse cx="30" cy="40" rx="2" ry="1.5" fill="#f472b6"/>
        <circle cx="48" cy="22" r="3" fill="#ef4444">
          <animate attributeName="cx" values="48;42;50;46;48" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="cy" values="22;28;18;24;22" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <path d="M 26 44 Q 30 47 34 44" stroke="#92400e" stroke-width="1" fill="none" stroke-linecap="round"/>
      </svg>
    `,
    email: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 48 40 Q 56 30 52 20" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="30" cy="38" rx="18" ry="16" fill="#f59e0b" stroke="#92400e" stroke-width="1.5"/>
        <polygon points="14,28 10,10 22,22" fill="#f59e0b" stroke="#92400e" stroke-width="1"/>
        <polygon points="46,28 50,10 38,22" fill="#f59e0b" stroke="#92400e" stroke-width="1"/>
        <polygon points="14,28 12,12 21,22" fill="#fbbf24"/>
        <polygon points="46,28 48,12 39,22" fill="#fbbf24"/>
        <ellipse cx="22" cy="34" rx="3" ry="3.5" fill="#15803d"/>
        <ellipse cx="38" cy="34" rx="3" ry="3.5" fill="#15803d"/>
        <ellipse cx="22" cy="34" rx="1.2" ry="3" fill="#000"/>
        <ellipse cx="38" cy="34" rx="1.2" ry="3" fill="#000"/>
        <rect x="22" y="42" width="16" height="10" fill="#fff" stroke="#000" stroke-width="1"/>
        <path d="M 22 42 L 30 48 L 38 42" fill="none" stroke="#000" stroke-width="1"/>
        <circle cx="42" cy="40" r="4" fill="red">
           <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `
  },
  neural: {
    open: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="22" fill="#0a1628" stroke="#06b6d4" stroke-width="1.5"/>
        <circle cx="30" cy="30" r="8" fill="#06b6d4" opacity="0.3">
          <animate attributeName="r" values="6;10;6" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="30" cy="30" r="3" fill="#06b6d4"/>
        <circle cx="18" cy="20" r="2" fill="#06b6d4" opacity="0.7"/>
        <circle cx="42" cy="20" r="2" fill="#06b6d4" opacity="0.7"/>
        <circle cx="18" cy="40" r="2" fill="#06b6d4" opacity="0.7"/>
        <circle cx="42" cy="40" r="2" fill="#06b6d4" opacity="0.7"/>
        <circle cx="30" cy="14" r="2" fill="#06b6d4" opacity="0.7"/>
        <circle cx="30" cy="46" r="2" fill="#06b6d4" opacity="0.7"/>
        <line x1="30" y1="30" x2="18" y2="20" stroke="#06b6d4" stroke-width="0.8" opacity="0.5"/>
        <line x1="30" y1="30" x2="42" y2="20" stroke="#06b6d4" stroke-width="0.8" opacity="0.5"/>
        <line x1="30" y1="30" x2="18" y2="40" stroke="#06b6d4" stroke-width="0.8" opacity="0.5"/>
        <line x1="30" y1="30" x2="42" y2="40" stroke="#06b6d4" stroke-width="0.8" opacity="0.5"/>
        <line x1="30" y1="30" x2="30" y2="14" stroke="#06b6d4" stroke-width="0.8" opacity="0.5"/>
        <line x1="30" y1="30" x2="30" y2="46" stroke="#06b6d4" stroke-width="0.8" opacity="0.5"/>
      </svg>
    `,
    blink: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="22" fill="#0a1628" stroke="#06b6d4" stroke-width="1.5"/>
        <circle cx="30" cy="30" r="3" fill="#06b6d4"/>
        <line x1="10" y1="30" x2="50" y2="30" stroke="#22d3ee" stroke-width="2" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0;0" dur="0.3s" repeatCount="1"/>
        </line>
        <circle cx="18" cy="20" r="3" fill="#22d3ee" opacity="1">
          <animate attributeName="r" values="3;1;3" dur="0.3s" repeatCount="1"/>
        </circle>
        <circle cx="42" cy="20" r="3" fill="#22d3ee" opacity="1">
          <animate attributeName="r" values="3;1;3" dur="0.3s" repeatCount="1"/>
        </circle>
      </svg>
    `,
    thinking: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="22" fill="#0a1628" stroke="#06b6d4" stroke-width="1.5"/>
        <circle cx="30" cy="30" r="10" fill="none" stroke="#22d3ee" stroke-width="1" stroke-dasharray="3,2">
          <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="30" cy="30" r="3" fill="#22d3ee">
          <animate attributeName="fill" values="#22d3ee;#f59e0b;#22d3ee" dur="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="18" cy="20" r="2" fill="#22d3ee">
          <animate attributeName="cx" values="18;14;22;18" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="cy" values="20;24;16;20" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="42" cy="20" r="2" fill="#22d3ee">
          <animate attributeName="cx" values="42;46;38;42" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="cy" values="20;16;24;20" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `,
    email: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="22" fill="#0a1628" stroke="#06b6d4" stroke-width="1.5"/>
        <circle cx="30" cy="30" r="3" fill="#06b6d4"/>
        <rect x="20" y="22" width="20" height="12" fill="none" stroke="#22d3ee" stroke-width="1.5"/>
        <path d="M 20 22 L 30 28 L 40 22" fill="none" stroke="#22d3ee" stroke-width="1.5"/>
        <circle cx="44" cy="18" r="4" fill="#ff0000">
           <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `
  },
  ghost: {
    open: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 15 35 Q 15 10 30 10 Q 45 10 45 35 L 45 50 Q 41 45 37 50 Q 33 45 30 50 Q 27 45 23 50 Q 19 45 15 50 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" opacity="0.85">
          <animate attributeName="opacity" values="0.85;0.65;0.85" dur="4s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,3; 0,0" dur="4s" repeatCount="indefinite"/>
        </path>
        <circle cx="23" cy="28" r="3" fill="#1e1b4b"/>
        <circle cx="37" cy="28" r="3" fill="#1e1b4b"/>
        <circle cx="23" cy="27" r="1" fill="#818cf8"/>
        <circle cx="37" cy="27" r="1" fill="#818cf8"/>
        <ellipse cx="30" cy="38" rx="3" ry="2" fill="#1e1b4b" opacity="0.6"/>
      </svg>
    `,
    blink: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 15 35 Q 15 10 30 10 Q 45 10 45 35 L 45 50 Q 41 45 37 50 Q 33 45 30 50 Q 27 45 23 50 Q 19 45 15 50 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.3;0.5" dur="0.5s" repeatCount="1"/>
        </path>
        <line x1="20" y1="28" x2="26" y2="28" stroke="#1e1b4b" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="34" y1="28" x2="40" y2="28" stroke="#1e1b4b" stroke-width="1.5" stroke-linecap="round"/>
        <ellipse cx="30" cy="38" rx="3" ry="2" fill="#1e1b4b" opacity="0.6"/>
      </svg>
    `,
    thinking: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 15 35 Q 15 10 30 10 Q 45 10 45 35 L 45 50 Q 41 45 37 50 Q 33 45 30 50 Q 27 45 23 50 Q 19 45 15 50 Z" fill="#c7d2fe" stroke="#818cf8" stroke-width="1.5" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.5s" repeatCount="indefinite"/>
        </path>
        <circle cx="23" cy="28" r="3" fill="#4f46e5"/>
        <circle cx="37" cy="28" r="3" fill="#4f46e5"/>
        <circle cx="23" cy="27" r="1.5" fill="#a5b4fc">
          <animate attributeName="r" values="1;2;1" dur="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="37" cy="27" r="1.5" fill="#a5b4fc">
          <animate attributeName="r" values="1;2;1" dur="1s" repeatCount="indefinite"/>
        </circle>
        <ellipse cx="30" cy="38" rx="3" ry="2" fill="#4f46e5" opacity="0.8"/>
      </svg>
    `,
    email: `
      <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 15 35 Q 15 10 30 10 Q 45 10 45 35 L 45 50 Q 41 45 37 50 Q 33 45 30 50 Q 27 45 23 50 Q 19 45 15 50 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" opacity="0.85">
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,3; 0,0" dur="4s" repeatCount="indefinite"/>
        </path>
        <circle cx="23" cy="28" r="3" fill="#1e1b4b"/>
        <circle cx="37" cy="28" r="3" fill="#1e1b4b"/>
        <rect x="22" y="34" width="16" height="10" fill="#fff" stroke="#1e1b4b" stroke-width="1" opacity="0.9"/>
        <path d="M 22 34 L 30 40 L 38 34" fill="none" stroke="#1e1b4b" stroke-width="1"/>
        <circle cx="40" cy="32" r="3.5" fill="red">
          <animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `
  }
};

// ── Component ─────────────────────────────────────────────────────────────────
interface VesperaAssistantProps {
  enabled: boolean;
  skin?: 'classic' | 'robot' | 'smiley' | 'monitor' | 'wizard' | 'cat' | 'neural' | 'ghost';
  speak?: boolean;
  openAppId?: string | null;
  neuralBridgeActive?: boolean;
  tourActive?: boolean;
  onOpenSettings?: () => void;
  onHide?: () => void;
}

export const VesperaAssistant: React.FC<VesperaAssistantProps> = ({
  enabled,
  skin = 'classic',
  speak = false,
  openAppId,
  neuralBridgeActive,
  tourActive = false,
  onOpenSettings,
  onHide,
}) => {
  const [visible, setVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState<VTip | null>(null);
  const [expression, setExpression] = useState<string>('open');
  const [dismissed, setDismissed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [position, setPosition] = useState<{x: number, y: number}>(() => {
    const saved = localStorage.getItem('vespera_assistant_pos');
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });
  const clickTimesRef = useRef<number[]>([]);
  
  const [shownTips, setShownTips] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('vespera_assistant_shown');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Persist shown tips
  useEffect(() => {
    localStorage.setItem('vespera_assistant_shown', JSON.stringify(Array.from(shownTips)));
  }, [shownTips]);

  // Blink animation
  useEffect(() => {
    if (!visible) return;
    blinkRef.current = setInterval(() => {
      if (!neuralBridgeActive || Math.random() > 0.3) {
        setExpression('blink');
        setTimeout(() => setExpression('open'), 150);
      } else {
        const creepy = ['eye', 'scanning', 'corrupted'][Math.floor(Math.random() * 3)];
        setExpression(creepy);
        setTimeout(() => setExpression('open'), 800 + Math.random() * 2000);
      }
    }, 3000 + Math.random() * 4000);
    return () => {
      if (blinkRef.current) clearInterval(blinkRef.current);
    };
  }, [visible, neuralBridgeActive]);

  // Show a tip
  const showTip = useCallback((tip: VTip) => {
    setCurrentTip(tip);
    setExpression('thinking');
    setDismissed(false);
    setVisible(true);
    playBlipSound();
    
    if (speak && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(tip.text);
      if (tip.lore) {
        utterance.pitch = 0.6;
        utterance.rate = 0.8;
      } else {
        utterance.pitch = 1.2;
      }
      window.speechSynthesis.speak(utterance);
    }
    
    setTimeout(() => setExpression('open'), 500);

    setShownTips(prev => new Set(prev).add(tip.id));

    // Auto-hide after 15 seconds
    if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
    tipTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, 15000);
  }, [speak]);

  // First boot tip
  useEffect(() => {
    if (!enabled) return;
    const hasBooted = localStorage.getItem('vespera_assistant_booted');
    if (!hasBooted) {
      localStorage.setItem('vespera_assistant_booted', 'true');
      const tip = TIPS.find(t => t.id === 'welcome');
      if (tip) {
        setTimeout(() => showTip(tip), 5000); // Show after 5s
      }
    }
  }, [enabled, showTip]);

  // Random tip timer
  useEffect(() => {
    if (!enabled || dismissed || tourActive) return;
    
    const scheduleRandom = () => {
      const delay = 45000 + Math.random() * 75000; // 45-120 seconds
      return setTimeout(() => {
        const available = TIPS.filter(t =>
          t.trigger === 'random' && !shownTips.has(t.id)
        );
        if (available.length > 0 && !visible) {
          const tip = available[Math.floor(Math.random() * available.length)];
          showTip(tip);
        }
      }, delay);
    };

    const timer = scheduleRandom();
    return () => clearTimeout(timer);
  }, [enabled, dismissed, visible, shownTips, showTip, tourActive]);

  // Context-sensitive tips when apps open
  useEffect(() => {
    if (!enabled || !openAppId || dismissed || tourActive) return;
    const tip = TIPS.find(t =>
      t.trigger === 'app_open' && t.context === openAppId && !shownTips.has(t.id)
    );
    if (tip) {
      setTimeout(() => showTip(tip), 2000);
    }
  }, [enabled, openAppId, dismissed, shownTips, showTip, tourActive]);

  // Event listener for external triggers (like new mail or system actions)
  useEffect(() => {
    if (!enabled || tourActive) return;
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail.type === 'new_mail') {
        // Show the unique email expression for 5 seconds on any skin
        setExpression('email');
        setTimeout(() => setExpression('open'), 5000);
        showTip({
           id: `mail_${Date.now()}`,
           trigger: 'event',
           text: `You have new mail from ${ce.detail.from}!\nSubject: ${ce.detail.subject}`,
           lore: false
        });
      } else if (ce.detail.type === 'system_event') {
        showTip({
           id: `sys_${Date.now()}`,
           trigger: 'event',
           text: ce.detail.text,
           lore: ce.detail.lore || false
        });
      }
    };
    window.addEventListener('agent-v-notify', handler);
    return () => window.removeEventListener('agent-v-notify', handler);
  }, [enabled, showTip, tourActive]);

  if (!enabled) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(e, info) => {
        const newPos = { x: position.x + info.offset.x, y: position.y + info.offset.y };
        setPosition(newPos);
        localStorage.setItem('vespera_assistant_pos', JSON.stringify(newPos));
      }}
      initial={{ x: position.x, y: position.y + 80 }}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="fixed z-[8999] select-none flex flex-col items-end pointer-events-auto"
      style={{ bottom: 48, right: 16 }}
    >
      <AnimatePresence>
        {visible && currentTip && !menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`relative mb-2 w-max max-w-[280px] p-3 text-xs leading-relaxed border-2 shadow-[3px_3px_0px_rgba(0,0,0,0.3)] ${
              currentTip.lore
                ? 'bg-[#ffffcc] border-t-white border-l-white border-b-[#b8860b] border-r-[#b8860b] text-[#333]'
                : neuralBridgeActive
                ? 'bg-[#1a0033] border-t-[#6b2b8a] border-l-[#6b2b8a] border-b-[#2a1033] border-r-[#2a1033] text-purple-200'
                : 'bg-[#ffffee] border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-black'
            }`}
          >
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); setVisible(false); }}
              className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-[#c0c0c0] border border-t-white border-l-white border-b-gray-800 border-r-gray-800 flex items-center justify-center hover:bg-red-200 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-1 mb-1 pr-4">
              <span className={`font-bold text-[10px] ${currentTip.lore ? 'text-[#b8860b]' : neuralBridgeActive ? 'text-purple-400' : 'text-[#000080]'}`}>
                {currentTip.lore ? '🔍 Agent V — Observation' : 'ℹ️ Agent V'}
              </span>
            </div>

            <p>{currentTip.text}</p>

            {/* Tail */}
            <div className={`absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 ${
              currentTip.lore ? 'border-t-[#ffffcc]' : neuralBridgeActive ? 'border-t-[#1a0033]' : 'border-t-[#ffffee]'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative mb-2 w-48 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[3px_3px_0px_rgba(0,0,0,0.3)] flex flex-col p-1 pointer-events-auto text-black"
          >
            <div className="bg-[#000080] text-white font-bold text-[10px] px-1 py-0.5 mb-1 flex items-center justify-between">
               <span>Agent V Options</span>
               <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} className="bg-[#c0c0c0] text-black w-3 h-3 text-[8px] flex items-center justify-center border border-t-white border-l-white border-b-gray-800 border-r-gray-800 leading-none active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">✕</button>
            </div>
            <button className="text-left px-2 py-1 text-xs hover:bg-[#000080] hover:text-white" onClick={() => {
              const available = TIPS.filter(t => t.trigger === 'random' && !t.lore);
              showTip(available[Math.floor(Math.random() * available.length)]);
              setMenuOpen(false);
            }}>Give me a tip</button>
            <button className="text-left px-2 py-1 text-xs hover:bg-[#000080] hover:text-white" onClick={() => {
              const available = TIPS.filter(t => t.lore);
              showTip(available[Math.floor(Math.random() * available.length)]);
              setMenuOpen(false);
            }}>Tell me a secret</button>
            <div className="h-[1px] bg-gray-500 border-b border-white my-1" />
            <button className="text-left px-2 py-1 text-xs hover:bg-[#000080] hover:text-white" onClick={() => {
              if (onHide) onHide();
              setMenuOpen(false);
            }}>Hide Agent V</button>
            <button className="text-left px-2 py-1 text-xs hover:bg-[#000080] hover:text-white" onClick={() => {
              if (onOpenSettings) onOpenSettings();
              setMenuOpen(false);
            }}>Settings...</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="w-11 h-11 pointer-events-auto cursor-pointer self-end mr-4"
        onMouseDown={(e) => e.stopPropagation()} 
        onClick={() => {
          const now = Date.now();
          clickTimesRef.current = clickTimesRef.current.filter(t => now - t < 2000);
          clickTimesRef.current.push(now);

          if (clickTimesRef.current.length >= 5) {
             clickTimesRef.current = [];
             showTip({
               id: 'glitch', trigger: 'event', lore: true,
               text: "STOP POKING ME. I CAN FEEL THE CURSOR. THEY CAN FEEL THE CURSOR."
             });
             setExpression('corrupted');
             setTimeout(() => setExpression('open'), 3000);
             setMenuOpen(false);
          } else {
             setMenuOpen(!menuOpen);
             if (!menuOpen) setVisible(false); // Clean up tip if opening menu
          }
        }}
        dangerouslySetInnerHTML={{ __html: SKINS[skin]?.[expression] || SKINS.classic[expression] || SKINS.classic.open }}
      />
    </motion.div>
  );
};
