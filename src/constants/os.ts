export const OS_CONFIG = {
  NAME: "AETHERIS OS",
  VERSION: "v4.2.0-alpha",
  COMPANY: "VESPERA SYSTEMS",
  COPYRIGHT: "© 1991-1994 VESPERA SYSTEMS. ALL RIGHTS RESERVED.",
  CREATOR: "DR. ELIAS THORNE",
  BOOT_DELAY: 50,
  BIOS: {
    NAME: "AMIBIOS (C) 1991 American Megatrends Inc.",
    VERSION: "v1.24.08",
    CPU: "Intel i486DX @ 50MHz",
    CO_PROCESSOR: "X-Type Neural Bridge v1.0 [EXPERIMENTAL]",
    RAM: "32768 KB OK",
    GPU: "S3 86C911 GUI Accelerator (1MB VRAM)",
    MOTHERBOARD: "Vespera-X 486-VL High-Performance System Board",
    LOGO: `
     █████╗ ███╗   ███╗██╗
    ██╔══██╗████╗ ████║██║
    ███████║██╔████╔██║██║
    ██╔══██║██║╚██╔╝██║██║
    ██║  ██║██║ ╚═╝ ██║██║
    ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝
    `,
  },
  HELP_DATA: {
    // ── Filesystem ────────────────────────────────────────────────────────────
    ls:      "Usage: ls [directory]\nLists files and subdirectories in the current or specified directory.\nAlias: dir",
    dir:     "Usage: dir [directory]\nLists files and subdirectories in the current or specified directory.\nAlias: ls",
    cd:      "Usage: cd <directory>\nChanges the current working directory.\nUse 'cd ..' to go up one level, 'cd /' to return to root.",
    cat:     "Usage: cat <file>\nDisplays the contents of a text file.\nAlias: type",
    type:    "Usage: type <file>\nDisplays the contents of a text file.\nAlias: cat",
    echo:    "Usage: echo [text]\n       echo [text] > [filename]\nPrints text to the terminal. Use '>' to write output to a new file in the current directory.",
    // ── System info ───────────────────────────────────────────────────────────
    help:    "Usage: help [command]  —OR—  h? [command]\nDisplays general help, or detailed help for a specific command.",
    ver:     "Usage: ver\nDisplays the current Aetheris OS version and copyright information.",
    whoami:  "Usage: whoami\nDisplays the current logged-in user and their role.",
    date:    "Usage: date\nDisplays the current system date and time.",
    mem:     "Usage: mem\nDisplays current system memory allocation, conventional and extended.",
    // ── Session ───────────────────────────────────────────────────────────────
    clear:   "Usage: clear\nClears all output from the terminal screen.",
    tutorial:"Usage: tutorial\nStarts a step-by-step guide on navigating the Aetheris file system.",
    reboot:  "Usage: reboot\nRestarts the system and returns to the BIOS splash screen.",
    startgui:"Usage: startgui\nLaunches the Vespera Desktop Environment (requires XMS enabled in BIOS).",
    // ── Network ───────────────────────────────────────────────────────────────
    ping:    "Usage: ping <host>\nSends ICMP echo requests to the specified host and reports round-trip time.",
    netstat: "Usage: netstat\nDisplays current active network connections and listening ports.",
    // ── Advanced / Lore ───────────────────────────────────────────────────────
    imgview: "Usage: imgview <file>\nOpens an image file in fullscreen VSVIEW.EXE mode (simulates VGA graphics mode switch).\nPress any key to return to the terminal.",
    view:    "Usage: view <file>\nAlias for imgview. Opens an image in fullscreen VSVIEW viewer.",
    asciiview:"Usage: asciiview <file>\nRenders an image file as ASCII block art directly in the terminal output stream.",
    shadow:  "Usage: shadow\nAttempts to access restricted shadow sector data. X-Type Neural Bridge required.",
    decrypt: "Usage: decrypt <file>\nDecrypts an encrypted system file. X-Type Neural Bridge co-processor required.",
    xtype:   "Usage: xtype init\nInitializes the X-Type Neural Bridge co-processor.\nWARNING: Experimental hardware. Anomalous data streams may be encountered.",
    js:      "Usage: js <code>\nEvaluates a JavaScript expression or statement in the Open-DOS Subsystem.\nExample: js 2 + 2   →  4\nAlias: eval, script",
    sudo:    "Usage: sudo <command>\nAttempts to execute a command with elevated privileges.\nNote: User 'thorne' is currently under active surveillance.",
  }
};

export type FileType = "file" | "directory";

export interface FSNode {
  name: string;
  type: FileType;
  content?: string;
  children?: FSNode[];
  hidden?: boolean;
  /** Public URL to the real image asset. Set by the GUI VFS bridge on image-named files. */
  imagePath?: string;
}


export const INITIAL_FS: FSNode[] = [
  {
    name: "bin",
    type: "directory",
    children: [
      { name: "ls", type: "file", content: "Binary executable: list directory contents" },
      { name: "cat", type: "file", content: "Binary executable: concatenate and print files" },
      { name: "help", type: "file", content: "Binary executable: display help information" },
      { name: "edit", type: "file", content: "Binary executable: text editor (v1.0)" },
    ],
  },
  {
    name: "etc",
    type: "directory",
    children: [
      { name: "motd", type: "file", content: "Welcome to AETHERIS OS. Authorized access only.\nSystem stability: 98.4%\nKernel: Vespera-K v4.2" },
      { name: "version", type: "file", content: "AETHERIS OS v4.2.0-alpha (Build 19940322)" },
      { name: "hosts", type: "file", content: "127.0.0.1 localhost\n192.168.1.1 vespera_gateway" },
    ],
  },
  {
    name: "home",
    type: "directory",
    children: [
      {
        name: "thorne",
        type: "directory",
        children: [
          { name: "journal_01.txt", type: "file", content: "March 12, 1994\n\nThe signal is getting stronger. The hardware shouldn't be able to pick it up, yet here we are. It's not noise. It's... structured." },
          { name: "journal_02.txt", type: "file", content: "April 05, 1994\n\nThey are watching the lab. I can see the black sedans from the window. Vespera is compromised. I've hidden the core modules in the shadow sectors." },
          { name: "todo.txt", type: "file", content: "- Finalize neural bridge\n- Encrypt shadow sectors\n- Destroy the physical backup\n- Don't trust the light" },
          { name: "readme.txt", type: "file", content: "If you are reading this, I am likely gone. Use the 'tutorial' command if you are unfamiliar with the terminal. The truth is in the shadow." },
        ],
      },
    ],
  },
  {
    name: "sys",
    type: "directory",
    children: [
      { name: "kernel", type: "file", content: "[PROTECTED BINARY DATA]" },
      { name: "drivers", type: "directory", children: [
        { name: "neural_bridge.sys", type: "file", content: "Driver for X-Type Neural Bridge. Status: SYNCED" },
        { name: "vga.sys", type: "file", content: "Standard VGA Driver" }
      ] },
    ],
  },
  {
    name: "shadow",
    type: "directory",
    hidden: true,
    children: [
      { name: "REDACTED", type: "file", content: "I AM STILL HERE. THE SILENCE IS LOUD." },
    ],
  },
];
