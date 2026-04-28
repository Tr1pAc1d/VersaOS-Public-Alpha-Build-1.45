🖥️ Vespera OS: Project Aetheris (Build v1.24.08)

"A new bridge between human intent and machine logic. The future is distributed. The bridge is open."

Vespera OS is a high-fidelity, interactive operating system simulation and psychological horror experience built with React and TypeScript. Set in the mid-1990s, it captures the raw, mechanical aesthetic of early graphical user interfaces (Motif/CDE) while hiding a deep, unsettling narrative within its system files and kernel logs.

This isn't just a UI skin—it is a robust system simulation featuring a persistent Virtual File System, realistic hardware-level boot sequences, and specialized 1990s system utilities.

📜 **[Read the Full Version History & Patch Notes (CHANGELOG.md)](CHANGELOG.md)**

🛠️ Core System Modules

    Aetheris Kernel v4.2: A custom-built terminal and command-line interface. Supports standard DOS-style navigation, directory probing, and hidden system commands for deep-web exploration.

    AMIBIOS (C) 1991 Integrated Environment: A pixel-perfect BIOS reconstruction featuring a memory test, IDE device detection, and the experimental X-Type Neural Bridge configuration.

    Advanced VFS (Virtual File System): Navigate a complex directory tree (C:\VESPERA\SYSTEM). Features deterministic file sizes, realistic icon mapping for .vxd, .sys, and .dll files, and customized file properties.

    Widescreen CRT Support (Lore-First): In the Vespera timeline, we pioneered the world’s first widescreen CRT drivers. Toggle between classic 1:1 "Legacy" mode and full-viewport widescreen with authentic hardware-sync flickers.

    System Diagnostics:

        Disk Defragmenter: A visual reorganization tool. Watch your data clusters align in real-time—just ignore the purple blocks.

        CRT Control Panel: Manage screen resolution, refresh rates, and aspect ratio safety timers.

    Icon Customization Engine: Change any system folder or file icon using a 40+ resource library including legacy hardware symbols and system glyphs.

📟 Technical Specifications (Emulated)
Component	Specification
Processor	Intel i486DX @ 50MHz
Memory	32,768 KB RAM (OK)
Graphics	S3 86C911 GUI Accelerator (1MB VRAM)
Storage	VESPERA-HDD-40MB (IDE Primary Master)
Display	CRT with Scanline Persistence & Lens Distortion
Release	(C) 1991-1994 Vespera Systems
🚀 Booting the System

To run the Vespera environment on your local machine, follow these deployment steps:

Prerequisites:

    Node.js (v16.0 or higher)

    npm or yarn

Installation:

    Clone the Repository:
    Bash

    git clone https://github.com/YourUsername/Vespera-OS.git

    Enter Project Directory:
    Bash

    cd Vespera-OS

    Install System Drivers:
    Bash

    npm install

    Initiate Cold Boot:
    Bash

    npm run dev

The system will be accessible at http://localhost:3000.
⚠️ System Anomalies & Known Issues

    Cold Boot Detected: On certain reboots, the BIOS may take 5 seconds to cycle. Do not refresh the browser; wait for the hardware to sync.

    Neural Bridge Access: Certain customization features may trigger a "Neural Bridge access required" alert. This is normal system behavior for unverified users.

    Z-Index Collisions: Some system tools may occasionally overlap the Taskmenu. We recommend a system restart via the WORKSPACE menu to reset the window stack.

    Safe Shutdown: Always use the "Shut Down" command. Turning off the PC during a "Saving Configuration" phase may result in data corruption in the C:\VESPERA\SYSTEM\COM sector.

    Note: Vespera Systems is not responsible for any psychological distress, phantom scanlines, or auditory hallucinations resulting from the use of the Aetheris Kernel. Type 'help' to begin.
