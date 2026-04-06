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
    ls: "Usage: ls [directory]\nLists files and subdirectories in the current or specified directory.\nAlias: dir",
    dir: "Usage: dir [directory]\nLists files and subdirectories in the current or specified directory.\nAlias: ls",
    cd: "Usage: cd <directory>\nChanges the current working directory.\nUse 'cd ..' to go up one level.",
    cat: "Usage: cat <file>\nDisplays the contents of a text file.\nAlias: type",
    type: "Usage: type <file>\nDisplays the contents of a text file.\nAlias: cat",
    help: "Usage: help [command] or h? [command]\nDisplays general help or help for a specific command.",
    tutorial: "Usage: tutorial\nStarts a brief guide on how to navigate the Aetheris file system.",
    mem: "Usage: mem\nDisplays current system memory allocation and status.",
    ver: "Usage: ver\nDisplays the current Aetheris OS version information.",
    reboot: "Usage: reboot\nRestarts the system and returns to the BIOS splash screen.",
    startgui: "Usage: startgui\nLaunches the Vespera Desktop Environment (if enabled in BIOS).",
    xtype: "Usage: xtype init\nInitializes the X-Type Neural Bridge co-processor. WARNING: Experimental hardware.",
  }
};

export type FileType = "file" | "directory";

export interface FSNode {
  name: string;
  type: FileType;
  content?: string;
  children?: FSNode[];
  hidden?: boolean;
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
