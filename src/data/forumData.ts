import { ForumThread } from '../components/VScriptArchiveSite';

export const DEFAULT_THREADS: ForumThread[] = [
  {
    id: 't1',
    title: 'Lattice 2.0 Reverse Engineering - Progress so far',
    author: 'Null_Pointer',
    content: "I've managed to dump the RAM during the Lattice boot sequence. Looks like they are using a modified version of the old Prizm kernel's UI loop. If we can inject a Vss+ keyframe right at cycle 400, we might be able to bypass the signature check entirely. Anyone got a hex dump of the auth module?",
    timestamp: Date.now() - 86400000 * 3,
    replies: [
      {
        id: 'r1',
        author: 'Admin_Dave',
        content: "Careful with that. I tried a timing attack on cycle 400 last week and my motherboard literally started smoking. The new thermal throttling is tied to the signature check.",
        timestamp: Date.now() - 86400000 * 2.8
      },
      {
        id: 'r2',
        author: 'Vector_Valkyrie',
        content: "Dave is right. Use the loopback host file trick first to isolate it from the network, then try the injection at cycle 402, not 400. They added a dummy cycle just to fry people doing exactly this.",
        timestamp: Date.now() - 86400000 * 2.5
      }
    ]
  },
  {
    id: 't_win95_1',
    title: 'Why is Aetheris Workbench so slow on Windows 95?',
    author: 'WinBoy95',
    content: "I tried installing the VersaOS environment on my Windows 95 rig. It works, but Aetheris Workbench takes almost 3 minutes to compile a basic 'Hello World' app. On native VersaOS it takes 2 seconds. What gives?",
    timestamp: Date.now() - 86400000 * 4,
    replies: [
      {
        id: 'r_win95_2',
        author: 'Kernel_Panic',
        content: "Windows 95 uses preemptive multitasking that absolutely chokes on V-Script's asynchronous I/O calls. Axis deliberately didn't optimize the Win32 ports to force developers to buy native VersaOS hardware.",
        timestamp: Date.now() - 86400000 * 3.9
      },
      {
        id: 'r_win95_3',
        author: 'Null_Pointer',
        content: "You can speed it up by disabling the V-Shield virtualization layer in the Win95 registry. Look for HKLM\\Software\\Axis\\Vespera\\Virtualization and set it to 0. It's dangerous, but it cuts compile times in half.",
        timestamp: Date.now() - 86400000 * 3.5
      }
    ]
  },
  {
    id: 't2',
    title: 'Need a working V-Amp crack for OS 4.0',
    author: 'Newbie_99',
    content: "Every time I try to run V-Amp on the new OS update, the system thinks it's a memory leak and kills the process. Does anyone have a patched version?",
    timestamp: Date.now() - 86400000 * 1,
    replies: [
      {
        id: 'r3',
        author: 'Null_Pointer',
        content: "Check the LATEST_UPLOADS section on the main terminal. I just dropped a compiled .vsc that bypasses the watchdog. Just don't move your mouse while playing MP3s or it skips.",
        timestamp: Date.now() - 86400000 * 0.9
      }
    ]
  },
  {
    id: 't_new48',
    title: 'File Manager crashing when opening folders with >500 items',
    author: 'Data_Hoarder',
    content: "Whenever I open my 'Archive' folder in the Vespera File Manager, the OS hangs for 30 seconds and then throws a 'Buffer Overflow in VFS_Index' error. The folder only has 600 text files in it.",
    timestamp: Date.now() - 86400000 * 45,
    replies: [
      {
        id: 'r_new49',
        author: 'Admin_Dave',
        content: "It's an issue with the icon preview cache. The OS tries to generate a thumbnail for every file in the active viewport simultaneously, which exhausts the 16MB UI heap limit. Open your terminal, type `set VFS_THUMBNAILS=0`, and restart.",
        timestamp: Date.now() - 86400000 * 44.5
      }
    ]
  },
  {
    id: 't_new51',
    title: 'System clock keeps drifting backwards every reboot',
    author: 'Time_Traveler',
    content: "Every time I reboot my machine, the VersaOS clock is exactly 5 minutes slower than the real time. I keep having to manually sync it.",
    timestamp: Date.now() - 86400000 * 48,
    replies: [
      {
        id: 'r_new52',
        author: 'Hardware_Guy',
        content: "Your motherboard's CMOS battery is dying. It's the little silver coin battery on the board. Replace it with a new CR2032. It's a $2 fix.",
        timestamp: Date.now() - 86400000 * 47.9
      }
    ]
  },
  {
    id: 't_winnt_1',
    title: 'Vespera GUI totally corrupted on Windows NT 4.0',
    author: 'Corp_Drone',
    content: "Trying to run the VersaOS simulation layer at work on my NT 4.0 workstation. The whole GUI renders as black boxes and cyan lines. The text is entirely missing. Is NT not supported at all?",
    timestamp: Date.now() - 86400000 * 7,
    replies: [
      {
        id: 'r_winnt_2',
        author: 'Vector_Valkyrie',
        content: "NT 4.0 abstracts the hardware layer too much for VersaOS's liking. Vss+ tries to write directly to the video memory buffer, and NT's HAL (Hardware Abstraction Layer) blocks it. You have to write a custom video miniport driver to bypass it.",
        timestamp: Date.now() - 86400000 * 6.5
      },
      {
        id: 'r_winnt_3',
        author: 'Corp_Drone',
        content: "Are you serious? I just wanted to play Neural Solitaire on my lunch break.",
        timestamp: Date.now() - 86400000 * 6.0
      }
    ]
  },
  {
    id: 't_new54',
    title: 'Mouse cursor stutters when downloading large files',
    author: 'Lag_Spike',
    content: "When I download anything larger than 10MB over the network, my mouse cursor starts teleporting around the screen instead of moving smoothly. Is my network card dying?",
    timestamp: Date.now() - 86400000 * 50,
    replies: [
      {
        id: 'r_new55',
        author: 'Admin_Dave',
        content: "No, your network card is fine. It's an IRQ conflict. Your ethernet controller is probably sharing IRQ 12 with the PS/2 mouse port. The CPU is getting flooded with network interrupts and dropping the mouse polling packets.",
        timestamp: Date.now() - 86400000 * 49.5
      }
    ]
  },
  {
    id: 't_win98_1',
    title: 'Windows 98 Blue Screens when injecting Vss+ payload',
    author: 'CrashOverride',
    content: "I've been trying to test my Vss+ web payloads on a Windows 98 SE machine running Internet Explorer 4. Every time the payload hits cycle 400, Windows just throws a fatal exception 0E. Why does this work on VersaOS but nuke Win98?",
    timestamp: Date.now() - 86400000 * 12,
    replies: [
      {
        id: 'r_win98_2',
        author: 'Null_Pointer',
        content: "VersaOS has a dedicated hardware watchdog for Vss+ engine overloads. If a payload tries to pull too many cycles, VersaOS drops the thread. Windows 98 doesn't have that protection. The Vss+ payload literally starves the Windows GDI (Graphics Device Interface) until the kernel panics.",
        timestamp: Date.now() - 86400000 * 11.5
      },
      {
        id: 'r_win98_3',
        author: 'CrashOverride',
        content: "So you're saying I accidentally wrote a Windows 98 killer virus?",
        timestamp: Date.now() - 86400000 * 11.0
      },
      {
        id: 'r_win98_4',
        author: 'Null_Pointer',
        content: "Yes. Don't upload it. Axis will send lawyers to your house.",
        timestamp: Date.now() - 86400000 * 10.5
      }
    ]
  },
  {
    id: 't_new57',
    title: 'Aetheris Workbench randomly deleting trailing commas?',
    author: 'Code_Monkey',
    content: "I'm losing my mind. I save a `.vsc` file in Aetheris, and sometimes it just deletes the trailing commas from my array declarations. Then the script fails to compile. Is this a known bug?",
    timestamp: Date.now() - 86400000 * 55,
    replies: [
      {
        id: 'r_new58',
        author: 'Vector_Valkyrie',
        content: "Yes, it's a bug in the aggressive auto-formatter that was introduced in version 1.4.2. It misidentifies trailing commas as syntax errors during the pre-compile linting phase.",
        timestamp: Date.now() - 86400000 * 54.5
      }
    ]
  },
  {
    id: 't_new61',
    title: 'Corrupted fonts after installing new SoundBlaster drivers?',
    author: 'Audio_Phile',
    content: "I just installed the updated SoundBlaster 16 drivers, and now all the text in the terminal is rendering as gibberish blocks. The audio works fine though.",
    timestamp: Date.now() - 86400000 * 60,
    replies: [
      {
        id: 'r_new62',
        author: 'Admin_Dave',
        content: "The SoundBlaster installer has a bad memory management routine that overwrites the upper memory block (UMB) where the TrueType font cache is stored.",
        timestamp: Date.now() - 86400000 * 59.5
      }
    ]
  },
  {
    id: 't_exploit_1',
    title: 'Buffer Overflow in the VersaOS Calculator',
    author: 'Math_Whiz',
    content: "Found something wild today. If you paste a string longer than 255 characters into the 'Hex' input field in the VersaOS Calculator, it overflows directly into the Aetheris Workbench compiler's memory space. I was able to inject arbitrary V-Script by padding the input with NOPs.",
    timestamp: Date.now() - 86400000 * 14,
    replies: [
      {
        id: 'r_exploit_2',
        author: 'Vector_Valkyrie',
        content: "Can you post the proof of concept? That implies the Calculator is running with Ring 0 privileges, which is terrifying.",
        timestamp: Date.now() - 86400000 * 13.5
      },
      {
        id: 'r_exploit_3',
        author: 'Math_Whiz',
        content: "POC is up on the FTP server. It turns out ALL default VersaOS apps run in Ring 0 because they share the same UI thread to save memory.",
        timestamp: Date.now() - 86400000 * 13.0
      }
    ]
  },
  {
    id: 't_hardware_1',
    title: 'CD-ROM drive randomly opening and closing?',
    author: 'Spooky_Drive',
    content: "Ever since I updated to VersaOS 4.1, my physical CD-ROM tray will randomly eject and close itself every few hours. I thought it was a ghost.",
    timestamp: Date.now() - 86400000 * 16,
    replies: [
      {
        id: 'r_hardware_2',
        author: 'Null_Pointer',
        content: "It's the new V-Shield background scanner. It pings the ATAPI interface to check for new media, but the timeout is too short, so it sends a hardware reset command, which pops the tray. Axis knows about it.",
        timestamp: Date.now() - 86400000 * 15.5
      }
    ]
  },
  {
    id: 't_win_1',
    title: 'Vespera Navigator on Windows XP Beta?',
    author: 'Beta_Tester',
    content: "Has anyone managed to get the Vespera Navigator to run on the new Windows XP 'Whistler' leaked beta builds? The installer just crashes with a 'Kernel32.dll not compatible' error.",
    timestamp: Date.now() - 86400000 * 21,
    replies: [
      {
        id: 'r_win_2',
        author: 'Admin_Dave',
        content: "Whistler uses a completely different architecture for the NT kernel. The old Vespera shims for Win95/98 won't work anymore. We'll have to wait for Axis to release a native NT5 port, or write a wrapper.",
        timestamp: Date.now() - 86400000 * 20.5
      }
    ]
  },
  {
    id: 't_exploit_4',
    title: 'Bypassing the Trial Period on VersaSlide',
    author: 'Penny_Pincher',
    content: "I refuse to pay $150 for a presentation app. Has anyone figured out how to bypass the 30-day trial on VersaSlide?",
    timestamp: Date.now() - 86400000 * 24,
    replies: [
      {
        id: 'r_exploit_5',
        author: 'Null_Pointer',
        content: "The trial date is stored in a hidden file called '.vs_meta' in the C:\\System\\Config directory. It's encrypted, but the encryption key is literally just the user's MAC address. I wrote a script to reset it. Check the Underground tab.",
        timestamp: Date.now() - 86400000 * 23.5
      }
    ]
  },
  {
    id: 't_hardware_3',
    title: 'Monitor refresh rate locked at 60Hz?',
    author: 'CRT_Gamer',
    content: "I just bought a new Sony Trinitron CRT that supports 120Hz, but VersaOS refuses to let me set the refresh rate above 60Hz. The option is grayed out in the Display settings.",
    timestamp: Date.now() - 86400000 * 26,
    replies: [
      {
        id: 'r_hardware_4',
        author: 'Vector_Valkyrie',
        content: "The Vss+ rendering engine is hardcoded to 60fps to sync with the Neural Bridge hardware. If you uncap the refresh rate, the V-Script animations will play twice as fast and break all the timings.",
        timestamp: Date.now() - 86400000 * 25.5
      }
    ]
  },
  {
    id: 't_win_3',
    title: 'Running V-Script on Linux/WINE?',
    author: 'Penguin_Power',
    content: "I'm trying to migrate away from Windows completely. Has anyone successfully run the VersaOS environment through WINE on RedHat?",
    timestamp: Date.now() - 86400000 * 31,
    replies: [
      {
        id: 'r_win_4',
        author: 'Kernel_Panic',
        content: "It barely works. WINE can't emulate the undocumented DirectX 5 calls that Axis uses for the Vss+ hardware acceleration. You get 5 frames per second and no sound.",
        timestamp: Date.now() - 86400000 * 30.5
      },
      {
        id: 'r_win_5',
        author: 'Penguin_Power',
        content: "Damn. Guess I'm stuck dual-booting.",
        timestamp: Date.now() - 86400000 * 30.0
      }
    ]
  },
  {
    id: 't_exploit_6',
    title: 'Extracting passwords from the V-Shield memory dump',
    author: 'Black_Hat',
    content: "If you force a kernel panic using the Lattice 2.0 reverse engineering trick, V-Shield creates a crash dump file. I analyzed it in a hex editor and found plaintext passwords for the currently logged-in user.",
    timestamp: Date.now() - 86400000 * 33,
    replies: [
      {
        id: 'r_exploit_7',
        author: 'Admin_Dave',
        content: "This is a massive zero-day. Please delete this thread and report it to Axis for the bounty. If someone weaponizes this, it's game over.",
        timestamp: Date.now() - 86400000 * 32.5
      },
      {
        id: 'r_exploit_8',
        author: 'Black_Hat',
        content: "Information wants to be free, Dave. I already pushed it to the IRC channel.",
        timestamp: Date.now() - 86400000 * 32.0
      }
    ]
  },
  {
    id: 't_hardware_5',
    title: 'Why do my floppy disks keep corrupting on VersaOS?',
    author: 'Disk_Swap',
    content: "I have gone through 5 different floppy disks this week. Every time I format them in VersaOS and copy files, they are unreadable when I take them to my Windows 98 machine.",
    timestamp: Date.now() - 86400000 * 36,
    replies: [
      {
        id: 'r_hardware_6',
        author: 'Null_Pointer',
        content: "VersaOS doesn't use standard FAT16 formatting. It uses a proprietary file system called VFS-12 that Windows cannot read without a third-party driver. You have to format the disk as FAT16 explicitly from the command line.",
        timestamp: Date.now() - 86400000 * 35.5
      }
    ]
  },
  {
    id: 't_win_6',
    title: 'Porting Aetheris to Windows 2000?',
    author: 'Win2K_Fan',
    content: "I love the Aetheris Workbench, but I hate VersaOS. Has anyone started a project to port the compiler to native Win32 so we can use it on Windows 2000?",
    timestamp: Date.now() - 86400000 * 38,
    replies: [
      {
        id: 'r_win_7',
        author: 'Vector_Valkyrie',
        content: "It's impossible. The compiler relies on deep hooks into the VersaOS kernel to parse V-Script into native machine code. You'd basically have to rewrite the entire compiler from scratch.",
        timestamp: Date.now() - 86400000 * 37.5
      }
    ]
  },
  {
    id: 't_exploit_9',
    title: 'Spoofing the MAC address in V-Script?',
    author: 'Anon_User',
    content: "Is there a reliable way to spoof my MAC address from within a V-Script application? I want to bypass a trial limitation on a specific software.",
    timestamp: Date.now() - 86400000 * 41,
    replies: [
      {
        id: 'r_exploit_10',
        author: 'Kernel_Panic',
        content: "Not from within V-Script. V-Script runs in a sandbox that abstracts the physical hardware. You need to use a compiled C payload to manipulate the network adapter directly, or use the loopback trick.",
        timestamp: Date.now() - 86400000 * 40.5
      }
    ]
  },
  {
    id: 't_hardware_7',
    title: 'Overheating CPU with VSS+ animations',
    author: 'Hot_Box',
    content: "I built a web page with a lot of complex VSS+ keyframe animations. Whenever I load it, my CPU fan spins up to 100% and the system temperature spikes to 90C. Is this normal?",
    timestamp: Date.now() - 86400000 * 43,
    replies: [
      {
        id: 'r_hardware_8',
        author: 'Admin_Dave',
        content: "Yes. VSS+ is incredibly inefficient. It uses software rendering for most 2D transforms unless you specifically flag them with `gpu-layer: 1`. You're basically forcing your CPU to calculate millions of pixels per second.",
        timestamp: Date.now() - 86400000 * 42.5
      }
    ]
  },
  {
    id: 't_win_8',
    title: 'Vespera Mail completely frozen on Windows Me',
    author: 'Millennium_Bug',
    content: "I installed the Vespera Mail client on my Windows Me laptop. It opens, but the UI is completely unresponsive. I can't click any buttons or type in the fields.",
    timestamp: Date.now() - 86400000 * 46,
    replies: [
      {
        id: 'r_win_9',
        author: 'Vector_Valkyrie',
        content: "Windows Me has a known issue with the custom window manager that VersaOS apps use. It drops the mouse event hooks. Nobody has bothered to patch it because... well, it's Windows Me.",
        timestamp: Date.now() - 86400000 * 45.5
      }
    ]
  },
  {
    id: 't_exploit_11',
    title: 'Injecting SQL into the Admin Log?',
    author: 'Bobby_Tables',
    content: "I noticed that the Admin Log on the main terminal seems to just append text blindly. Has anyone tried injecting SQL commands through the username field during login to see if it drops the database?",
    timestamp: Date.now() - 86400000 * 49,
    replies: [
      {
        id: 'r_exploit_12',
        author: 'Null_Pointer',
        content: "It's not an SQL database. It's a flat text file. You can't inject SQL into a text file. However, you CAN inject V-Script if you escape the string correctly, which will execute when Admin_Dave opens the log. Have fun.",
        timestamp: Date.now() - 86400000 * 48.5
      }
    ]
  },
  {
    id: 't_hardware_9',
    title: 'Keyboard input lagging by 2 seconds',
    author: 'Slow_Poke',
    content: "Out of nowhere, my keyboard input has started lagging. I type a word, and it appears on screen 2 seconds later. Mouse movement is perfectly fine.",
    timestamp: Date.now() - 86400000 * 52,
    replies: [
      {
        id: 'r_hardware_10',
        author: 'Hardware_Guy',
        content: "Check your PS/2 port connection. If it's loose, the motherboard drops the interrupts and has to resynchronize the clock signal with the keyboard microcontroller, which causes the delay.",
        timestamp: Date.now() - 86400000 * 51.5
      }
    ]
  },
  {
    id: 't_win_10',
    title: 'VersaOS vs Windows 98 for Gaming?',
    author: 'Frag_Master',
    content: "I'm building a new rig for Quake and Unreal Tournament. Should I install Windows 98 or stick with VersaOS? I've heard VersaOS has better memory management.",
    timestamp: Date.now() - 86400000 * 54,
    replies: [
      {
        id: 'r_win_11',
        author: 'Admin_Dave',
        content: "Go with Windows 98. VersaOS doesn't support DirectX or OpenGL natively. You have to run games through a compatibility layer that cuts your frame rate in half. VersaOS is for developers, not gamers.",
        timestamp: Date.now() - 86400000 * 53.5
      }
    ]
  },
  {
    id: 't_exploit_13',
    title: 'Disabling V-Shield via memory injection',
    author: 'Code_Breaker',
    content: "I've been analyzing the V-Shield process. It seems to have a hardcoded memory offset for its 'active' state flag. I wrote a small script to flip that bit to 0, effectively turning off the antivirus without needing admin rights.",
    timestamp: Date.now() - 86400000 * 57,
    replies: [
      {
        id: 'r_exploit_14',
        author: 'Vector_Valkyrie',
        content: "That's brilliant. Does it survive a reboot?",
        timestamp: Date.now() - 86400000 * 56.5
      },
      {
        id: 'r_exploit_15',
        author: 'Code_Breaker',
        content: "No, it resides in volatile RAM. You have to run the injection script every time the system starts. I added it to my Startup folder.",
        timestamp: Date.now() - 86400000 * 56.0
      }
    ]
  },
  {
    id: 't_hardware_11',
    title: 'Monitor displaying everything in green?',
    author: 'Matrix_Fan',
    content: "My CRT monitor suddenly decided that the only color it knows is green. Everything is varying shades of green and black. Is my graphics card dying?",
    timestamp: Date.now() - 86400000 * 59,
    replies: [
      {
        id: 'r_hardware_12',
        author: 'Hardware_Guy',
        content: "Check your VGA cable. The pins for the Red and Blue color channels are probably bent or broken. The Green pin is still making contact.",
        timestamp: Date.now() - 86400000 * 58.5
      }
    ]
  },
  {
    id: 't_win_12',
    title: 'VesperaOS Networking on Windows 3.1?',
    author: 'Retro_Nerd',
    content: "Just for fun, I installed the old Windows 3.1 port of the Vespera Navigator. It runs, but it can't connect to the internet. I have Trumpet Winsock installed and working.",
    timestamp: Date.now() - 86400000 * 62,
    replies: [
      {
        id: 'r_win_13',
        author: 'Null_Pointer',
        content: "The Win3.1 port relies on a specific 16-bit winsock library that Axis distributed on a separate floppy disk. Trumpet Winsock won't work. Good luck finding that disk; it's practically lost media now.",
        timestamp: Date.now() - 86400000 * 61.5
      }
    ]
  },
  {
    id: 't_exploit_16',
    title: 'Gaining root access via the Print Spooler',
    author: 'Paper_Jam',
    content: "I found a vulnerability in the VersaOS Print Spooler service. If you submit a print job with a document name longer than 1024 characters, it overflows the buffer and allows executing code with system privileges.",
    timestamp: Date.now() - 86400000 * 64,
    replies: [
      {
        id: 'r_exploit_17',
        author: 'Admin_Dave',
        content: "Not another print spooler exploit. This is the third one this year. Axis needs to rewrite that whole subsystem.",
        timestamp: Date.now() - 86400000 * 63.5
      }
    ]
  },
  {
    id: 't_hardware_13',
    title: 'Strange buzzing noise from the motherboard',
    author: 'Buzzer_Beater',
    content: "Whenever my CPU usage hits 100%, there is a high-pitched buzzing noise coming directly from the motherboard. It's not a fan. What is it?",
    timestamp: Date.now() - 86400000 * 67,
    replies: [
      {
        id: 'r_hardware_14',
        author: 'Hardware_Guy',
        content: "That's coil whine. The inductors on your motherboard's voltage regulator module (VRM) are vibrating at a high frequency due to the increased electrical current demanded by the CPU. It's annoying but harmless.",
        timestamp: Date.now() - 86400000 * 66.5
      }
    ]
  },
  {
    id: 't_win_13',
    title: 'Running VesperaOS in VMWare Workstation 3.0?',
    author: 'Virtual_Reality',
    content: "Has anyone managed to get VesperaOS running in a VMWare virtual machine? The setup halts during the 'Initializing Video' phase and throws an 'Unsupported VGA BIOS' error.",
    timestamp: Date.now() - 86400000 * 69,
    replies: [
      {
        id: 'r_win_14',
        author: 'Kernel_Panic',
        content: "VMWare emulates an S3 Trio64 graphics card. VesperaOS dropped support for S3 cards in version 3.5 because they lacked the necessary hardware overlays for Vss+. You have to use an older build of the OS or pass through a physical GPU.",
        timestamp: Date.now() - 86400000 * 68.5
      }
    ]
  },
  {
    id: 't_exploit_18',
    title: 'Bypassing the Aetheris Trial with a hex editor',
    author: 'Cracker_Jack',
    content: "I found a way to bypass the 30-day trial for Aetheris Workbench. If you open `Aetheris.exe` in a hex editor, jump to offset 0x00A45B, and change `74 05` (JE) to `EB 05` (JMP), it skips the license check completely.",
    timestamp: Date.now() - 86400000 * 71,
    replies: [
      {
        id: 'r_exploit_19',
        author: 'Null_Pointer',
        content: "That worked in version 1.3, but in 1.4 they added a CRC checksum to the executable. If you modify even a single byte, it refuses to load. You have to patch the checksum validator too, which is obfuscated.",
        timestamp: Date.now() - 86400000 * 70.5
      }
    ]
  },
  {
    id: 't_hardware_15',
    title: 'Why does VesperaOS spin down my hard drives so fast?',
    author: 'Data_Hoarder',
    content: "I have 4 hard drives in my machine. Whenever I try to access one I haven't used in 5 minutes, there's a 3-second delay while the drive spins up. Why is the timeout so aggressive?",
    timestamp: Date.now() - 86400000 * 74,
    replies: [
      {
        id: 'r_hardware_16',
        author: 'Admin_Dave',
        content: "It's an 'eco' feature introduced in the latest kernel patch to reduce power consumption on laptops. You can change it by editing `C:\\System\\Config\\power.ini` and setting `SpindownTimeout=0`.",
        timestamp: Date.now() - 86400000 * 73.5
      }
    ]
  },
  {
    id: 't_win_15',
    title: 'Transferring files between Windows 98 and VesperaOS',
    author: 'Dual_Booter',
    content: "What's the easiest way to move files between my Windows 98 partition and my VesperaOS partition? Windows can't read VFS-12, and VesperaOS mounts my FAT32 drive as read-only.",
    timestamp: Date.now() - 86400000 * 77,
    replies: [
      {
        id: 'r_win_16',
        author: 'Vector_Valkyrie',
        content: "The easiest way is actually networking. Set up an FTP server on the Windows 98 side using Serv-U, and connect to it using the VesperaOS terminal via the loopback address or local IP.",
        timestamp: Date.now() - 86400000 * 76.5
      }
    ]
  },
  {
    id: 't_exploit_20',
    title: 'V-Script sandbox escape via the Clipboard API',
    author: 'Black_Hat',
    content: "I discovered that the V-Script `SYS.Clipboard.Write()` function doesn't sanitize escape characters. You can write a shellcode payload to the clipboard, and if the user pastes it into the terminal, it executes automatically without pressing Enter.",
    timestamp: Date.now() - 86400000 * 80,
    replies: [
      {
        id: 'r_exploit_21',
        author: 'Admin_Dave',
        content: "That's nasty. I'm adding a warning to the front page. Don't paste anything from untrusted V-Script apps until Axis patches this.",
        timestamp: Date.now() - 86400000 * 79.5
      }
    ]
  },
  {
    id: 't_hardware_17',
    title: 'Replacing the motherboard battery without losing BIOS settings?',
    author: 'Hardware_Guy',
    content: "My CMOS battery is dying, but I have a highly customized BIOS profile for overclocking my CPU. Is there a way to swap the battery without the BIOS resetting to defaults?",
    timestamp: Date.now() - 86400000 * 83,
    replies: [
      {
        id: 'r_hardware_18',
        author: 'Mistakes_Were_Made',
        content: "Just leave the PC plugged into the wall and turned ON while you swap the battery. The power supply will keep the CMOS chip energized.",
        timestamp: Date.now() - 86400000 * 82.5
      },
      {
        id: 'r_hardware_19',
        author: 'Vector_Valkyrie',
        content: "DO NOT DO THAT. You will short out the motherboard with your screwdriver. Just write down the settings on a piece of paper like a normal person.",
        timestamp: Date.now() - 86400000 * 82.0
      }
    ]
  },
  {
    id: 't_win_17',
    title: 'Windows NT 4.0 Blue Screens when VesperaOS is on the network',
    author: 'SysAdmin_Hell',
    content: "I set up a VesperaOS machine on my office network for testing. Suddenly, all the Windows NT 4.0 workstations started blue screening with 'IRQL_NOT_LESS_OR_EQUAL'. What is VesperaOS broadcasting?",
    timestamp: Date.now() - 86400000 * 86,
    replies: [
      {
        id: 'r_win_18',
        author: 'Null_Pointer',
        content: "VesperaOS uses a proprietary peer discovery protocol that floods the subnet with malformed IPX/SPX packets. NT 4.0's network driver can't handle them and panics. You need to disable 'Network Discovery' in the Vespera Control Panel.",
        timestamp: Date.now() - 86400000 * 85.5
      }
    ]
  },
  {
    id: 't_exploit_22',
    title: 'Extracting the VesperaOS source code from the RAM disk',
    author: 'Source_Hunter',
    content: "I noticed that during the installation process, the setup copies a compressed archive called `src_bundle.vz` to a temporary RAM disk. If you interrupt the setup by pulling the hard drive cable, the RAM disk stays active in memory. Has anyone tried dumping it?",
    timestamp: Date.now() - 86400000 * 89,
    replies: [
      {
        id: 'r_exploit_23',
        author: 'Null_Pointer',
        content: "Yes, we dumped it years ago. It's not the source code for the OS; it's the source code for the installation wizard itself. It's just a bunch of boring C++ scripts that format the drive.",
        timestamp: Date.now() - 86400000 * 88.5
      }
    ]
  },
  {
    id: 't_hardware_20',
    title: 'My mouse only moves horizontally',
    author: 'Tech_Support',
    content: "I'm using a standard PS/2 ball mouse. Since yesterday, the cursor only moves left and right. Up and down does nothing. Did VesperaOS break my mouse driver?",
    timestamp: Date.now() - 86400000 * 92,
    replies: [
      {
        id: 'r_hardware_21',
        author: 'Hardware_Guy',
        content: "Take the ball out of the bottom of the mouse and look at the rollers inside. The vertical roller is probably caked in dust and lint. Scrape it off with a toothpick.",
        timestamp: Date.now() - 86400000 * 91.5
      },
      {
        id: 'r_hardware_22',
        author: 'Tech_Support',
        content: "Oh my god, it was disgusting. Works perfectly now. Thanks.",
        timestamp: Date.now() - 86400000 * 91.0
      }
    ]
  },
  {
    id: 't_win_19',
    title: 'VesperaOS overwrote my Windows bootloader',
    author: 'Dual_Boot_Fail',
    content: "I tried installing VesperaOS on a separate partition, but it completely nuked the Windows 98 bootloader (IO.SYS). Now the PC boots straight into Vespera. How do I get Windows back?",
    timestamp: Date.now() - 86400000 * 95,
    replies: [
      {
        id: 'r_win_20',
        author: 'Admin_Dave',
        content: "Boot from a Windows 98 floppy disk, run `fdisk /mbr`, and then `sys c:`. That will rebuild the Windows boot sector. Then you'll need to use a third-party boot manager like GRUB to chainload VesperaOS.",
        timestamp: Date.now() - 86400000 * 94.5
      }
    ]
  },
  {
    id: 't_exploit_24',
    title: 'Privilege escalation via the Screen Saver',
    author: 'Code_Monkey',
    content: "The VesperaOS screen saver daemon runs as the SYSTEM user. If you replace the default `.vss` screen saver file with a script that launches the terminal, it opens a root shell when the screen saver activates.",
    timestamp: Date.now() - 86400000 * 98,
    replies: [
      {
        id: 'r_exploit_25',
        author: 'Vector_Valkyrie',
        content: "Classic exploit. This worked in Windows NT 3.51 too. Axis really needs to learn from Microsoft's mistakes.",
        timestamp: Date.now() - 86400000 * 97.5
      }
    ]
  },
  {
    id: 't_hardware_23',
    title: 'PC speaker won\'t stop beeping',
    author: 'Beep_Boop',
    content: "Every time I compile a script in Aetheris, the internal PC speaker emits a loud, continuous beep that doesn't stop until I reboot. Is my RAM bad?",
    timestamp: Date.now() - 86400000 * 101,
    replies: [
      {
        id: 'r_hardware_24',
        author: 'Null_Pointer',
        content: "No, it's a bug in the compiler's error handler. If it hits a specific syntax error, it triggers an interrupt to the PC speaker but forgets to send the 'stop' command. Just unplug the speaker from the motherboard header.",
        timestamp: Date.now() - 86400000 * 100.5
      }
    ]
  },
  {
    id: 't_win_21',
    title: 'Playing audio CDs on VesperaOS?',
    author: 'Music_Lover',
    content: "I put a music CD in my drive, but VesperaOS doesn't mount it. The drive just spins up and stops. Does this OS not support Red Book audio?",
    timestamp: Date.now() - 86400000 * 104,
    replies: [
      {
        id: 'r_win_22',
        author: 'Vector_Valkyrie',
        content: "It does, but you need a physical audio cable connecting the back of your CD-ROM drive directly to the CD-IN header on your sound card. VesperaOS doesn't support digital audio extraction (DAE) over the IDE ribbon cable yet.",
        timestamp: Date.now() - 86400000 * 103.5
      }
    ]
  },
  {
    id: 't_exploit_26',
    title: 'Hiding files inside the VFS swap file',
    author: 'Ghost_Coder',
    content: "I found a way to hide data from the V-Shield scanner. The `pagefile.vfs` swap file is locked by the kernel and can't be scanned. You can use a raw disk editor to inject data into the unused blocks of the swap file.",
    timestamp: Date.now() - 86400000 * 107,
    replies: [
      {
        id: 'r_exploit_27',
        author: 'Admin_Dave',
        content: "That's incredibly risky. If the OS decides it needs that page memory, it will overwrite your hidden data instantly and corrupt whatever the kernel was trying to page out, causing a blue screen.",
        timestamp: Date.now() - 86400000 * 106.5
      }
    ]
  },
  {
    id: 't_hardware_25',
    title: 'Can I use a serial mouse on COM2?',
    author: 'Retro_Gamer',
    content: "My PS/2 port died, so I bought an old 9-pin serial mouse. It works on Windows 95 on COM1, but VesperaOS insists on reserving COM1 for the terminal debugger. Can I force the mouse onto COM2?",
    timestamp: Date.now() - 86400000 * 110,
    replies: [
      {
        id: 'r_hardware_26',
        author: 'Hardware_Guy',
        content: "Yes, edit the `C:\\System\\Drivers\\mouse.ini` file and change `Port=3F8` (COM1) to `Port=2F8` (COM2), and `IRQ=4` to `IRQ=3`. Reboot and it should work.",
        timestamp: Date.now() - 86400000 * 109.5
      }
    ]
  },
  {
    id: 't_win_23',
    title: 'V-Script IDE for Windows 2000?',
    author: 'Dev_Guy',
    content: "Is there any third-party IDE for writing V-Script on Windows? I hate rebooting into VesperaOS just to use Aetheris Workbench.",
    timestamp: Date.now() - 86400000 * 113,
    replies: [
      {
        id: 'r_win_24',
        author: 'Null_Pointer',
        content: "Just use Notepad++ with the custom syntax highlighting file from the Deep System Mods section. You still have to compile on VersaOS, but you can write the code anywhere.",
        timestamp: Date.now() - 86400000 * 112.5
      }
    ]
  },
  {
    id: 't_exploit_28',
    title: 'Denial of Service via ping of death',
    author: 'Packet_Kiddie',
    content: "If you send a malformed ICMP ping packet larger than 65535 bytes to a VesperaOS machine, the TCP/IP stack overflows and crashes the entire system. Tested it on my roommate's PC.",
    timestamp: Date.now() - 86400000 * 116,
    replies: [
      {
        id: 'r_exploit_29',
        author: 'Admin_Dave',
        content: "This is a known issue. The Ping of Death affects Windows 95, NT, and Linux too. Axis released a patch for it yesterday. Tell your roommate to run the OS updater.",
        timestamp: Date.now() - 86400000 * 115.5
      }
    ]
  },
  {
    id: 't_hardware_27',
    title: 'Monitor degaussing ring is stuck on',
    author: 'Magneto',
    content: "I pressed the degauss button on my monitor, but the relay got stuck. The screen has been violently shaking and humming loudly for 5 minutes. Is it going to explode?",
    timestamp: Date.now() - 86400000 * 119,
    replies: [
      {
        id: 'r_hardware_28',
        author: 'Hardware_Guy',
        content: "TURN IT OFF NOW. The degauss coil draws a massive amount of current and will melt the plastic housing and potentially start a fire if it runs for more than a few seconds. Unplug it from the wall.",
        timestamp: Date.now() - 86400000 * 118.5
      }
    ]
  },
  {
    id: 't_win_25',
    title: 'Can Windows 98 read the VesperaOS boot sector?',
    author: 'Curious_Cat',
    content: "If I put the VesperaOS installation CD into a Windows 98 machine, it shows up as blank. Why can't Windows even see the files on the disc?",
    timestamp: Date.now() - 86400000 * 122,
    replies: [
      {
        id: 'r_win_26',
        author: 'Vector_Valkyrie',
        content: "The CD isn't formatted with ISO-9660 (the standard CD file system). It uses a custom Axis format that only the motherboard's BIOS El Torito boot extension can read. It's essentially a giant raw boot image, not a file system.",
        timestamp: Date.now() - 86400000 * 121.5
      }
    ]
  },
  {
    id: 't_exploit_30',
    title: 'Bypassing the login screen with a blank floppy',
    author: 'Hacker_Man',
    content: "If you insert an unformatted floppy disk into the drive right as the login screen appears, the OS tries to read it, fails, throws an exception dialog, and if you click 'Cancel', it drops you into the desktop as the default user.",
    timestamp: Date.now() - 86400000 * 125,
    replies: [
      {
        id: 'r_exploit_31',
        author: 'Null_Pointer',
        content: "Wow. That is hilariously bad error handling. I just tested it and it works. Axis security at its finest.",
        timestamp: Date.now() - 86400000 * 124.5
      }
    ]
  },
  {
    id: 't_hardware_29',
    title: 'Sound card picking up radio stations?',
    author: 'TinFoil_Audio',
    content: "I have a cheap generic sound card installed. When I plug in my headphones, I can faintly hear a local AM radio station playing in the background. Is the government spying on me?",
    timestamp: Date.now() - 86400000 * 128,
    replies: [
      {
        id: 'r_hardware_30',
        author: 'Hardware_Guy',
        content: "No, your sound card just has terrible EMI (Electromagnetic Interference) shielding, and your headphone cable is acting as an antenna. Move your PC away from power cords, or buy a SoundBlaster card with proper shielding.",
        timestamp: Date.now() - 86400000 * 127.5
      }
    ]
  },
  {
    id: 't_win_27',
    title: 'VesperaOS network shares on Windows ME?',
    author: 'Net_Admin',
    content: "I'm trying to access a shared folder on my VesperaOS machine from a Windows ME laptop. Windows asks for a password, but VesperaOS doesn't have a password set for that share.",
    timestamp: Date.now() - 86400000 * 131,
    replies: [
      {
        id: 'r_win_28',
        author: 'Admin_Dave',
        content: "Windows ME uses an older version of SMB that sends passwords in plaintext. VesperaOS refuses the connection because it requires NTLMv2 encryption. You have to edit the Windows registry to force NTLMv2.",
        timestamp: Date.now() - 86400000 * 130.5
      }
    ]
  },
  {
    id: 't_exploit_32',
    title: 'Crashing Vespera Navigator with a huge URL',
    author: 'Web_Terrorist',
    content: "If you type a URL longer than 2048 characters into the Vespera Navigator address bar, the browser instantly closes without an error message.",
    timestamp: Date.now() - 86400000 * 134,
    replies: [
      {
        id: 'r_exploit_33',
        author: 'Vector_Valkyrie',
        content: "It's a buffer overflow, but the V-Shield watchdog catches it before it corrupts system memory, which is why it force-closes the app. It's actually the security system working correctly for once.",
        timestamp: Date.now() - 86400000 * 133.5
      }
    ]
  },
  {
    id: 't_hardware_31',
    title: 'ZIP Drive clicking of death',
    author: 'Zip_Fan',
    content: "My parallel port ZIP drive started making a rhythmic clicking noise, and now none of my disks are readable. Are all my backups gone?",
    timestamp: Date.now() - 86400000 * 137,
    replies: [
      {
        id: 'r_hardware_32',
        author: 'Data_Ghost',
        content: "Yes, that's the Click of Death. The read/write heads have become misaligned and are physically scratching the magnetic media off the disks. Do NOT put any good disks into that drive, it will destroy them too.",
        timestamp: Date.now() - 86400000 * 136.5
      }
    ]
  },
  {
    id: 't_win_29',
    title: 'Running 16-bit Windows games on VesperaOS?',
    author: 'Retro_Gamer',
    content: "I want to play SkiFree and Chip's Challenge on VersaOS. Is there an emulator like DOSBox, but for 16-bit Windows?",
    timestamp: Date.now() - 86400000 * 140,
    replies: [
      {
        id: 'r_win_30',
        author: 'Null_Pointer',
        content: "Not yet. VesperaOS has no Win16 subsystem. You're better off just using a Windows 3.1 virtual machine.",
        timestamp: Date.now() - 86400000 * 139.5
      }
    ]
  },
  {
    id: 't_exploit_34',
    title: 'Changing the boot logo without the dev kit',
    author: 'Customizer',
    content: "Axis charges $500 for the 'OEM Customization Kit' just to change the boot splash screen. I found that the logo is just an uncompressed bitmap stored at physical disk sector 15. You can overwrite it with a hex editor.",
    timestamp: Date.now() - 86400000 * 143,
    replies: [
      {
        id: 'r_exploit_35',
        author: 'Admin_Dave',
        content: "Be very careful doing that. If your new bitmap is even one byte larger than the original, you will overwrite the start of the partition table and brick the drive.",
        timestamp: Date.now() - 86400000 * 142.5
      }
    ]
  },
  {
    id: 't_hardware_33',
    title: 'Turbo button does nothing?',
    author: 'Speed_Demon',
    content: "My AT case has a 'Turbo' button. When I push it, the MHz display changes from 33 to 66, but VesperaOS feels exactly the same. Does the OS ignore the button?",
    timestamp: Date.now() - 86400000 * 146,
    replies: [
      {
        id: 'r_hardware_34',
        author: 'Hardware_Guy',
        content: "The Turbo button actually slows the PC down. It was designed to make old games playable when CPUs got too fast. VesperaOS doesn't rely on CPU clock cycles for timing, so you won't notice a difference in the UI, but compiling will take twice as long.",
        timestamp: Date.now() - 86400000 * 145.5
      }
    ]
  },
  {
    id: 't_win_31',
    title: 'Why doesn\'t VesperaOS have a Recycle Bin?',
    author: 'Accidental_Deleter',
    content: "I accidentally deleted my main project folder and realized too late that VesperaOS doesn't have a recycle bin. Files just vanish. Why??",
    timestamp: Date.now() - 86400000 * 149,
    replies: [
      {
        id: 'r_win_32',
        author: 'Vector_Valkyrie',
        content: "Because Axis designed it for servers and embedded systems where disk space is at a premium. A recycle bin requires tracking deleted file metadata. If you want safety nets, go back to Windows.",
        timestamp: Date.now() - 86400000 * 148.5
      }
    ]
  },
  {
    id: 't_exploit_36',
    title: 'Triggering an easter egg in the Control Panel',
    author: 'Easter_Bunny',
    content: "If you hold Shift + Ctrl + Alt and double-click the 'System Time' icon in the Control Panel, a tiny window pops up showing a picture of the development team.",
    timestamp: Date.now() - 86400000 * 152,
    replies: [
      {
        id: 'r_exploit_37',
        author: 'Null_Pointer',
        content: "Nice find. If you look closely at the guy in the back row on the left, that's the lead developer who got fired last year for leaking the Vss+ documentation to this very site.",
        timestamp: Date.now() - 86400000 * 151.5
      }
    ]
  }
];
