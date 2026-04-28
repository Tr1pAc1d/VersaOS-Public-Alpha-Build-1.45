const { execSync } = require('child_process');
const fs = require('fs');

const commitNotes = {
    'd521448': "### 🛠 System Architecture & Refactoring\n- **Project Structure Reorganization**: Moved extraneous utility scripts to a dedicated `scratch` directory to strictly adhere to React/Vite best practices.\n- **UI Components & Data Models**: Integrated new universal UI components and standardized data models across the OS.\n- **TypeScript Enhancements**: Resolved `unknown` type mismatches and hardened type casting across app handlers.\n\n### 🌐 VesperaNET & Lore Expansion\n- **V-Script Archive (Overhaul)**: Populated the V-Script Archive interface with lore-heavy, deceptive download options.\n- **Archive Pagination System**: Implemented a multi-page pagination system capable of rendering hundreds of fake software entries.\n- **Simulated Connectivity Events**: Implemented dynamic P2P connection failure modals for fake downloads.\n\n### 🐞 Bug Fixes\n- **VMail System Stability**: Patched a background worker issue affecting email delivery for VMail.",
    'a275250': "### ✨ Core OS Shell Integration (GUIOS)\n- **GUIOS Foundation**: Rebuilt the core GUIOS shell to manage window rendering, z-indexing, and global state.\n- **System Registry Infrastructure**: Built the underlying system registry to store and manage persistent OS settings.\n\n### 🔊 Audio Asset Adjustments\n- **Sound Library Optimization**: The 3000+ sound files added in the [Commit 6d968e1] - 2026-04-27 commit were removed because of memory/file size limits. New sounds and sound scheme options will be added in the future.",
    '6d968e1': "### 📂 Virtual File System (VFS)\n- **VersaFileManager Foundation**: Established the base VFS components for navigating, manipulating, and deleting files.\n- **File Collision Systems**: Added a file collision dialog (`CollisionModal.tsx`) for file moves and saves.\n- **Drawing Tools**: Integrated native drawing capabilities via the new `AxisPaint.tsx` app.",
    '3d380c3': "### 🎨 Audio & Aesthetics\n- **Massive Sound Library Import**: Imported thousands of legacy audio files into `public/Sounds/`, including Windows XP base sounds and Foley effects.\n- **1996 Splash Screen Update**: Corrected the splash loading screen to strictly display the year 1996.",
    'aad5782': "### ⚙️ Maintenance & Dependencies\n- Performed an exhaustive `package-lock.json` update to resolve vulnerabilities and update React/Vite.",
    '4794eee': "### 🛒 VStore Marketplace & Applications\n- **VStore Marketplace Launch**: Launched the VStore allowing users to dynamically install mock software.\n- **Minecraft Classic Port**: Added a playable integration of Minecraft Classic.\n- **WebBrowser Application**: Shipped the initial `WebBrowser` component.\n- **VMail Client**: Shipped the `VMail` email client with unread counts and notifications.",
    '7416204': "### 💾 Data Layer & Asset Expansion\n- **VStore Data Layer**: Added JSON data structures to support the VStore backend (download sizes, reviews, screenshots).\n- **Help Documentation**: Wrote comprehensive help documentation mimicking classic Windows Help format (CHM).",
    'bfa1ce3': "### ⚙️ System Core & Program Execution\n- **Dynamic Program Files**: Implemented dynamic generation of program files in `C:\\Program Files` upon app installation.\n- **Pre-launch Dependency Checks**: Added rigorous dependency checks prior to app launches (e.g. checking for mock `.dll` files).",
    'e3ca64f': "### 📂 VersaFileManager Enhancements\n- Finalized the tree-view folder navigation UI for the VersaFileManager.\n- Added custom game desktop entries.",
    '5dea18b': "### 🎨 System Avatars\n- Added a comprehensive set of highly compressed, 256-color system icons and user profile images for user customization.",
    '5e611f3': "### 🌍 Internet Connectivity & WebBrowser Upgrades\n- **Multi-Tab Browsing**: Upgraded the `WebBrowser` component to support multi-tab browsing.\n- **VesperaNET Authentication**: Integrated VesperaNET simulated ISP authentication.\n- **Simulated Connectivity Dial-up**: Added simulated download failure logic and dial-up latency delays.",
    '288b0c0': "### 🎨 Customization\n- **Cursor Themes**: Introduced an extensive asset library containing dozens of custom, era-accurate cursor themes.\n- **Cursor Engine**: Built the CSS engine capable of overriding the global cursor based on the user's selected theme.",
    '0f8c271': "### 🏢 Ecosystem Expansion\n- **Vespera Systems Site**: Designed and implemented the mock corporate 'Vespera Systems' website establishing the in-universe product catalog.",
    '2074d02': "### 📝 Documentation\n- Updated `README.md` with Node.js setup instructions, commands, and project vision.",
    '4d5db99': "### 🚀 Initial Public Release\n- **Vespera OS Public Build 1.11.1**: Initial public alpha release of the VersaOS web operating system environment."
};

function generateChangelog() {
    const logOutput = execSync('git log --name-status --pretty=format:"COMMIT_START|%h|%cd|%s|%an" --date=short').toString();
    const lines = logOutput.split('\n');

    let markdown = "# VersaOS Version History & Detailed Patch Notes\n\n";
    markdown += "This document chronicles the exhaustive evolution of VersaOS, detailing why changes were made alongside the specific files added, modified, and removed in every commit.\n\n---\n\n";

    let currentCommit = null;

    for (const line of lines) {
        if (!line.trim()) continue;

        if (line.startsWith('COMMIT_START|')) {
            if (currentCommit) {
                markdown += renderCommit(currentCommit);
            }
            const parts = line.split('|');
            currentCommit = {
                hash: parts[1],
                date: parts[2],
                message: parts[3],
                author: parts[4],
                added: [],
                modified: [],
                deleted: []
            };
        } else if (currentCommit) {
            const status = line.charAt(0);
            const file = line.substring(1).trim();
            if (status === 'A') currentCommit.added.push(file);
            else if (status === 'M') currentCommit.modified.push(file);
            else if (status === 'D') currentCommit.deleted.push(file);
        }
    }

    if (currentCommit) {
        markdown += renderCommit(currentCommit);
    }

    fs.writeFileSync('CHANGELOG.md', markdown);
    console.log('CHANGELOG.md generated successfully.');
}

function renderCommit(commit) {
    let out = "## [Commit " + commit.hash + "] - " + commit.date + "\n";
    out += "**Author:** " + commit.author + "\n";
    out += "**Message:** " + commit.message + "\n\n";

    if (commitNotes[commit.hash]) {
        out += "### 📝 Developer Notes\n";
        out += commitNotes[commit.hash] + "\n\n";
    }

    const maxList = 30; // Max files to list individually before summarizing

    if (commit.added.length > 0) {
        out += "### 🟢 Added (" + commit.added.length + " files)\n";
        if (commit.added.length > maxList) {
            out += commit.added.slice(0, maxList).map(f => "- `" + f + "`").join('\n') + '\n';
            out += "- *...and " + (commit.added.length - maxList) + " more files.*\n";
        } else {
            out += commit.added.map(f => "- `" + f + "`").join('\n') + '\n';
        }
        out += '\n';
    }

    if (commit.modified.length > 0) {
        out += "### 🟡 Modified (" + commit.modified.length + " files)\n";
        if (commit.modified.length > maxList) {
            out += commit.modified.slice(0, maxList).map(f => "- `" + f + "`").join('\n') + '\n';
            out += "- *...and " + (commit.modified.length - maxList) + " more files.*\n";
        } else {
            out += commit.modified.map(f => "- `" + f + "`").join('\n') + '\n';
        }
        out += '\n';
    }

    if (commit.deleted.length > 0) {
        out += "### 🔴 Removed (" + commit.deleted.length + " files)\n";
        if (commit.deleted.length > maxList) {
            out += commit.deleted.slice(0, maxList).map(f => "- `" + f + "`").join('\n') + '\n';
            out += "- *...and " + (commit.deleted.length - maxList) + " more files.*\n";
        } else {
            out += commit.deleted.map(f => "- `" + f + "`").join('\n') + '\n';
        }
        out += '\n';
    }

    out += "---\n\n";
    return out;
}

generateChangelog();
