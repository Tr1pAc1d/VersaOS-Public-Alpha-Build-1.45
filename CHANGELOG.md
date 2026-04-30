# VersaOS Version History & Detailed Patch Notes

This document chronicles the exhaustive evolution of VersaOS, detailing why changes were made alongside the specific files added, modified, and removed in every commit.

---

## [Commit 1cd69c8] - 2026-04-28
**Author:** Tr1pAc1d, GitGhost709
**Message:** feat: implement automated changelog generation script and add project CHANGELOG.md file

### 🟢 Added (2 files)
- `CHANGELOG.md`
- `scratch/generate_changelog.cjs`

### 🟡 Modified (1 files)
- `README.md`

---

## [Commit d521448] - 2026-04-28
**Author:** Tr1pAc1d
**Message:** refactor: reorganize project structure by moving utility scripts to scratch directory and adding new UI components and data models

### 📝 Developer Notes
### 🛠 System Architecture & Refactoring
- **Project Structure Reorganization**: Moved extraneous utility scripts to a dedicated `scratch` directory to strictly adhere to React/Vite best practices.
- **UI Components & Data Models**: Integrated new universal UI components and standardized data models across the OS.
- **TypeScript Enhancements**: Resolved `unknown` type mismatches and hardened type casting across app handlers.

### 🌐 VesperaNET & Lore Expansion
- **V-Script Archive (Overhaul)**: Populated the V-Script Archive interface with lore-heavy, deceptive download options.
- **Archive Pagination System**: Implemented a multi-page pagination system capable of rendering hundreds of fake software entries.
- **Simulated Connectivity Events**: Implemented dynamic P2P connection failure modals for fake downloads.

### 🐞 Bug Fixes
- **VMail System Stability**: Patched a background worker issue affecting email delivery for VMail.

### 🟢 Added (10 files)
- `public/Sounds/TV white noise static.mp3`
- `public/Television_static_HD.gif`
- `public/The V-Script Archive/453543345.png`
- `public/The V-Script Archive/543543534.png`
- `public/The V-Script Archive/654564.png`
- `public/The V-Script Archive/V-Script Archive Logo white main.png`
- `public/The V-Script Archive/source.gif`
- `src/components/OfflineCacheSetupWizard.tsx`
- `src/components/VScriptArchiveSite.tsx`
- `src/data/forumData.ts`

### 🟡 Modified (10 files)
- `public/The V-Script Archive/V-Script Archive Info.txt`
- `src/components/DownloadDialog.tsx`
- `src/components/GUIOS.tsx`
- `src/components/MeridianBroadcastingSite.tsx`
- `src/components/RetroTV.tsx`
- `src/components/VersaFileManager.tsx`
- `src/components/WebBrowser.tsx`
- `src/contexts/VMailContext.tsx`
- `src/data/loreEmails.ts`
- `src/utils/appDictionary.ts`

---

## [Commit a275250] - 2026-04-27
**Author:** Tr1pAc1d
**Message:** feat: implement core GUIOS shell, file manager, drawing tools, and system registry infrastructure

### 📝 Developer Notes
### ✨ Core OS Shell Integration (GUIOS)
- **GUIOS Foundation**: Rebuilt the core GUIOS shell to manage window rendering, z-indexing, and global state.
- **System Registry Infrastructure**: Built the underlying system registry to store and manage persistent OS settings.

### 🔊 Audio Asset Adjustments
- **Sound Library Optimization**: The 3000+ sound files added in the [Commit 6d968e1] - 2026-04-27 commit were removed because of memory/file size limits. New sounds and sound scheme options will be added in the future.

### 🟡 Modified (4 files)
- `src/components/AxisPaint.tsx`
- `src/components/GUIOS.tsx`
- `src/components/VersaFileManager.tsx`
- `src/utils/systemRegistry.ts`

### 🔴 Removed (3156 files)
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/bevp.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/bevr.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/blnc.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/blno.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/btne.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/btnp.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/btnr.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/btnx.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/chkp.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/chkr.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dbtr.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/delay.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dsce.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dscp.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dscr.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dscx.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dske.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dski.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/fcpd.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/fdof.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/fdon.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/fdrp.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/flap.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/fnew.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/fral.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/fsel.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/ftrs.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/ladr.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/laup.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/mnuc.mov`
- *...and 3126 more files.*

---

## [Commit 6d968e1] - 2026-04-27
**Author:** Tr1pAc1d
**Message:** feat: implement file system components and add legacy Windows sound effect library

### 📝 Developer Notes
### 📂 Virtual File System (VFS)
- **VersaFileManager Foundation**: Established the base VFS components for navigating, manipulating, and deleting files.
- **File Collision Systems**: Added a file collision dialog (`CollisionModal.tsx`) for file moves and saves.
- **Drawing Tools**: Integrated native drawing capabilities via the new `AxisPaint.tsx` app.

### 🟢 Added (3205 files)
- `More Vmail Spam.txt`
- `public/Icons/Microsoft_PowerPoint_1994.svg`
- `public/Icons/Microsoft_PowerPoint_1995.svg`
- `public/Icons/VSlides.png`
- `public/PowerPoint4.0.png`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/PCI based Power Mac Startup.wav`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/bevp.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/bevr.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/blnc.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/blno.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/btne.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/btnp.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/btnr.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/btnx.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/chkp.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/chkr.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dbtr.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/delay.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dsce.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dscp.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dscr.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dscx.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dske.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/dski.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/fcpd.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/fdof.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/fdon.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/fdrp.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/flap.mov`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Sound Schemes/MacOS/Platinum/fnew.mov`
- *...and 3175 more files.*

### 🟡 Modified (15 files)
- `src/components/AetherisWorkbench.tsx`
- `src/components/AxisPaint.tsx`
- `src/components/ControlPanel.tsx`
- `src/components/GUIOS.tsx`
- `src/components/PluginSandbox.tsx`
- `src/components/ShortcutWizard.tsx`
- `src/components/VMail.tsx`
- `src/components/VersaFileManager.tsx`
- `src/components/VersaMediaPlayer.tsx`
- `src/components/VesperaWrite.tsx`
- `src/data/vstoreApps.ts`
- `src/hooks/useVFS.ts`
- `src/utils/appDictionary.ts`
- `src/utils/audio.ts`
- `src/utils/systemRegistry.ts`

### 🔴 Removed (3 files)
- `public/Icons/Extra Icons/media_player_stream_mono.ico`
- `public/Icons/Extra Icons/media_player_stream_no2.ico`
- `public/Icons/Extra Icons/media_player_stream_stereo.ico`

---

## [Commit 3d380c3] - 2026-04-27
**Author:** Tr1pAc1d
**Message:** feat: import extensive collection of legacy Windows system sound schemes into Control Panel assets

### 📝 Developer Notes
### 🎨 Audio & Aesthetics
- **Massive Sound Library Import**: Imported thousands of legacy audio files into `public/Sounds/`, including Windows XP base sounds and Foley effects.
- **1996 Splash Screen Update**: Corrected the splash loading screen to strictly display the year 1996.

### 🟢 Added (12 files)
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Startup and Shutdown additional sounds/melogoff.wav`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Startup and Shutdown additional sounds/nt4loggoff.wav`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Startup and Shutdown additional sounds/o95.wav`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Startup and Shutdown additional sounds/o98.wav`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Startup and Shutdown additional sounds/ome.wav`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Startup and Shutdown additional sounds/ont4.wav`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Startup and Shutdown additional sounds/ont5.wav`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Startup and Shutdown additional sounds/owfw311.wav`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Startup and Shutdown additional sounds/owin31.wav`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Startup and Shutdown additional sounds/oxp.wav`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Startup and Shutdown additional sounds/win98logoff.wav`
- `public/Sounds/Addition Sound options for Sounds in Control Panel/Startup and Shutdown additional sounds/winxpshutdown.wav`

### 🟡 Modified (2 files)
- `src/components/ControlPanel.tsx`
- `src/components/GUIOS.tsx`

---

## [Commit aad5782] - 2026-04-27
**Author:** Tr1pAc1d
**Message:** chore: update package-lock.json dependencies

### 📝 Developer Notes
### ⚙️ Maintenance & Dependencies
- Performed an exhaustive `package-lock.json` update to resolve vulnerabilities and update React/Vite.

### 🟡 Modified (1 files)
- `package-lock.json`

---

## [Commit 4794eee] - 2026-04-23
**Author:** Tr1pAc1d
**Message:** feat: implement VStore application marketplace and add core software components including Minecraft Classic, WebBrowser, and VMail.

### 📝 Developer Notes
### 🛒 VStore Marketplace & Applications
- **VStore Marketplace Launch**: Launched the VStore allowing users to dynamically install mock software.
- **Minecraft Classic Port**: Added a playable integration of Minecraft Classic.
- **WebBrowser Application**: Shipped the initial `WebBrowser` component.
- **VMail Client**: Shipped the `VMail` email client with unread counts and notifications.

### 🟢 Added (7 files)
- `public/Apps/MinecraftClassic.js`
- `public/Meridian News Assets/unnamed.gif`
- `public/more news stories.txt`
- `src/components/MinecraftClassic.tsx`
- `src/components/VideoPlayerPopup.tsx`
- `src/utils/workbenchProjects.ts`
- `tsc_output.txt`

### 🟡 Modified (18 files)
- `src/components/AetherisWorkbench.tsx`
- `src/components/ControlPanel.tsx`
- `src/components/FindFiles.tsx`
- `src/components/GUIOS.tsx`
- `src/components/MeridianBroadcastingSite.tsx`
- `src/components/RunDialog.tsx`
- `src/components/VMail.tsx`
- `src/components/VStore.tsx`
- `src/components/VersaFileManager.tsx`
- `src/components/VersaMediaPlayer.tsx`
- `src/components/WebBrowser.tsx`
- `src/components/WelcomeTour.tsx`
- `src/data/vstoreApps.ts`
- `src/hooks/useVFS.ts`
- `src/index.css`
- `src/utils/helpContent.tsx`
- `src/utils/pngIcons.ts`
- `src/utils/systemRegistry.ts`

---

## [Commit 7416204] - 2026-04-21
**Author:** Tr1pAc1d
**Message:** feat: add system components, VStore data, and extensive asset library for icons, cursors, and help documentation.

### 📝 Developer Notes
### 💾 Data Layer & Asset Expansion
- **VStore Data Layer**: Added JSON data structures to support the VStore backend (download sizes, reviews, screenshots).
- **Help Documentation**: Wrote comprehensive help documentation mimicking classic Windows Help format (CHM).

### 🟢 Added (833 files)
- `fix_window_config.cjs`
- `fix_window_config.js`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/altselect.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/bg.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/busy.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/diag1.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/diag2.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/handwrit.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/help.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/link.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/move.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/normal.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/precision.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/resizehor.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/resizever.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/text.cur`
- `public/Cursors/DEFAULT ALWAY USE CURSORS/unavail.cur`
- `public/Games_VStore/Embed Code.txt`
- `public/Games_VStore/Frogga/Embed Code.txt`
- `public/Games_VStore/Frogga/frogga.jpg`
- `public/Games_VStore/Frogga/info.txt`
- `public/Games_VStore/Leave Me Alone/Embed code.txt`
- `public/Games_VStore/Leave Me Alone/Leave_Me_Alone_Icon.png`
- `public/Games_VStore/Leave Me Alone/info.txt`
- `public/Games_VStore/Leave Me Alone/leave-me-alone.jpg`
- `public/Games_VStore/Street Fight/Embed code.txt`
- `public/Games_VStore/Street Fight/info.txt`
- `public/Games_VStore/Street Fight/street-fight.jpg`
- `public/Games_VStore/info.txt`
- `public/Help_Images/More/Axis Paint/Axis Paint - Save As Box - Help menu.png`
- *...and 803 more files.*

### 🟡 Modified (29 files)
- `public/wallpapers/Abstract_Color.png`
- `src/components/AxisPaint.tsx`
- `src/components/ControlPanel.tsx`
- `src/components/GUILogin.tsx`
- `src/components/GUIOS.tsx`
- `src/components/GenericSetupWizard.tsx`
- `src/components/HelpViewer.tsx`
- `src/components/MeridianBroadcastingSite.tsx`
- `src/components/RHIDTerminal.tsx`
- `src/components/RemoteDesktop.tsx`
- `src/components/SetupWizard.tsx`
- `src/components/ShortcutWizard.tsx`
- `src/components/SignOutScreen.tsx`
- `src/components/TaskManager.tsx`
- `src/components/Terminal.tsx`
- `src/components/VMessengerSetup.tsx`
- `src/components/VStore.tsx`
- `src/components/VersaFileManager.tsx`
- `src/components/VesperaSitePages/VesperaSupport.tsx`
- `src/components/VesperaSystemsSite.tsx`
- `src/components/WebBrowser.tsx`
- `src/components/WelcomeTour.tsx`
- `src/data/vstoreApps.ts`
- `src/hooks/useRemoteVFS.ts`
- `src/hooks/useVFS.ts`
- `src/utils/appDictionary.ts`
- `src/utils/audio.ts`
- `src/utils/helpContent.tsx`
- `src/utils/pngIcons.ts`

### 🔴 Removed (9 files)
- `public/w93/games/CastleGafa/castlegafa.desktop`
- `public/w93/games/CatMario/catmario.desktop`
- `public/w93/games/HalfLife3/hl3.desktop`
- `public/w93/games/Sirtet/sirtet.desktop`
- `public/w93/games/SkiFree/skifree.desktop`
- `public/wallpapers/windows_xp_102.jpg`
- `public/wallpapers/windows_xp_104.jpg`
- `public/wallpapers/windows_xp_150.jpg`
- `src/components/W93AppLauncher.tsx`

---

## [Commit bfa1ce3] - 2026-04-20
**Author:** Tr1pAc1d
**Message:** feat: implement dynamic program files and dependency checks for app launches

### 📝 Developer Notes
### ⚙️ System Core & Program Execution
- **Dynamic Program Files**: Implemented dynamic generation of program files in `C:\Program Files` upon app installation.
- **Pre-launch Dependency Checks**: Added rigorous dependency checks prior to app launches (e.g. checking for mock `.dll` files).

### 🟡 Modified (2 files)
- `src/components/GUIOS.tsx`
- `src/hooks/useVFS.ts`

---

## [Commit e3ca64f] - 2026-04-20
**Author:** Tr1pAc1d
**Message:** feat: implement VersaFileManager, add game desktop entries, and include new system utilities and icons.

### 📝 Developer Notes
### 📂 VersaFileManager Enhancements
- Finalized the tree-view folder navigation UI for the VersaFileManager.
- Added custom game desktop entries.

### 🟢 Added (11 files)
- `public/Apps/ClassicMC (AlexApps).js`
- `public/Apps/Hypercam93 (utf-16).js`
- `public/Apps/Terminal++ (Driftini).js`
- `public/Icons/Extra Icons/Doom Icon.png`
- `public/Icons/Extra Icons/Pac-Man.ico`
- `public/w93/games/CastleGafa/castlegafa.desktop`
- `public/w93/games/CatMario/catmario.desktop`
- `public/w93/games/HalfLife3/hl3.desktop`
- `public/w93/games/Sirtet/sirtet.desktop`
- `public/w93/games/SkiFree/skifree.desktop`
- `src/components/W93AppLauncher.tsx`

### 🟡 Modified (4 files)
- `src/components/GUIOS.tsx`
- `src/components/RHIDTerminal.tsx`
- `src/components/VersaFileManager.tsx`
- `src/hooks/useVFS.ts`

---

## [Commit 5dea18b] - 2026-04-20
**Author:** Tr1pAc1d
**Message:** feat: add comprehensive set of system icons and user profile images to public assets

### 📝 Developer Notes
### 🎨 System Avatars
- Added a comprehensive set of highly compressed, 256-color system icons and user profile images for user customization.

### 🟢 Added (1789 files)
- `analyze_icons.cjs`
- `download_icons.cjs`
- `extract_icons_for_picker.cjs`
- `public/Cards/Solitaire all Cards.png`
- `public/Icons/Extra Icons/QuickView_icon.png`
- `public/Icons/Extra Icons/VBSccript_file_format_icon.png`
- `public/Icons/Extra Icons/Windows_Script_Host_Icon.png`
- `public/Icons/Extra Icons/Windows_Write_icon.png`
- `public/Icons/Extra Icons/netscape1.ico`
- `public/Icons/Extra Icons/netscape2.ico`
- `public/Icons/Extra Icons/seamonkey1.ico`
- `public/Icons/Extra Icons/seamonkey2.ico`
- `public/Icons/Extra Icons/seamonkey3.ico`
- `public/Icons/ac_plug-0.png`
- `public/Icons/ac_plug-1.png`
- `public/Icons/accesibility_window_abc.png`
- `public/Icons/access_wheelchair_big.png`
- `public/Icons/accessibility-0.png`
- `public/Icons/accessibility-1.png`
- `public/Icons/accessibility-2.png`
- `public/Icons/accessibility-3.png`
- `public/Icons/accessibility-4.png`
- `public/Icons/accessibility-5.png`
- `public/Icons/accessibility_big_keys.png`
- `public/Icons/accessibility_contrast.png`
- `public/Icons/accessibility_kbd_mouse.png`
- `public/Icons/accessibility_key_pointer.png`
- `public/Icons/accessibility_stopwatch.png`
- `public/Icons/accessibility_toggle.png`
- `public/Icons/accessibility_toggle2.png`
- *...and 1759 more files.*

### 🟡 Modified (15 files)
- `index.html`
- `src/components/ControlPanel.tsx`
- `src/components/DesktopIcon.tsx`
- `src/components/GUIOS.tsx`
- `src/components/GenericSetupWizard.tsx`
- `src/components/IconPicker.tsx`
- `src/components/Screensavers.tsx`
- `src/components/TaskManager.tsx`
- `src/components/VStore.tsx`
- `src/components/VersaFileManager.tsx`
- `src/components/WebBrowser.tsx`
- `src/data/vstoreApps.ts`
- `src/hooks/useVFS.ts`
- `src/utils/appDictionary.ts`
- `src/utils/plusThemes.ts`

---

## [Commit 5e611f3] - 2026-04-14
**Author:** Tr1pAc1d
**Message:** feat: implement WebBrowser component with multi-tab support, VesperaNET authentication, and simulated download failure logic.

### 📝 Developer Notes
### 🌍 Internet Connectivity & WebBrowser Upgrades
- **Multi-Tab Browsing**: Upgraded the `WebBrowser` component to support multi-tab browsing.
- **VesperaNET Authentication**: Integrated VesperaNET simulated ISP authentication.
- **Simulated Connectivity Dial-up**: Added simulated download failure logic and dial-up latency delays.

### 🟢 Added (9 files)
- `Playlists_for_Meridian.txt`
- `Television_static.gif`
- `Website Links backup.txt`
- `public/Television_static.gif`
- `src/components/ActiveApplets.tsx`
- `src/components/MeridianBroadcastingSite.tsx`
- `src/components/TaskManager.tsx`
- `src/components/VMessengerSetup.tsx`
- `src/components/WeatherChannelApp.tsx`

### 🟡 Modified (15 files)
- `src/components/ControlPanel.tsx`
- `src/components/GUIOS.tsx`
- `src/components/RetroTV.tsx`
- `src/components/SetupWizard.tsx`
- `src/components/VSweeper.tsx`
- `src/components/VesperaAssistant.tsx`
- `src/components/VesperaChat.tsx`
- `src/components/VesperaSystemsSite.tsx`
- `src/components/WebBrowser.tsx`
- `src/components/WelcomeTour.tsx`
- `src/components/XTypeUtility.tsx`
- `src/data/vstoreApps.ts`
- `src/hooks/useVFS.ts`
- `src/utils/appDictionary.ts`
- `src/utils/runCommands.ts`

---

## [Commit 288b0c0] - 2026-04-13
**Author:** Tr1pAc1d
**Message:** feat: implement Vespera Systems site components and add extensive cursor theme assets

### 📝 Developer Notes
### 🎨 Customization
- **Cursor Themes**: Introduced an extensive asset library containing dozens of custom, era-accurate cursor themes.
- **Cursor Engine**: Built the CSS engine capable of overriding the global cursor based on the user's selected theme.

### 🟢 Added (107 files)
- `append_plus_styles.cjs`
- `generate_css.cjs`
- `public/Cursors/Green glow/Green hourglass.cur`
- `public/Cursors/Green glow/Slight Glow Green.ani`
- `public/Cursors/Green glow/SlightGlowGreenHourglass.ani`
- `public/Cursors/Red-Black/MyCursorSet1.cur`
- `public/Cursors/Red-Black/MyCursorSet10.cur`
- `public/Cursors/Red-Black/MyCursorSet11.cur`
- `public/Cursors/Red-Black/MyCursorSet12.cur`
- `public/Cursors/Red-Black/MyCursorSet13.cur`
- `public/Cursors/Red-Black/MyCursorSet14.cur.ani`
- `public/Cursors/Red-Black/MyCursorSet2.cur`
- `public/Cursors/Red-Black/MyCursorSet3.cur`
- `public/Cursors/Red-Black/MyCursorSet4.cur`
- `public/Cursors/Red-Black/MyCursorSet5.cur`
- `public/Cursors/Red-Black/MyCursorSet6.cur`
- `public/Cursors/Red-Black/MyCursorSet7.cur`
- `public/Cursors/Red-Black/MyCursorSet8.cur`
- `public/Cursors/Red-Black/MyCursorSet9.cur`
- `public/Cursors/cool/Earth_Pointer.ani`
- `public/Cursors/cool/Earth_alt.ani`
- `public/Cursors/cool/Earth_crosshair.ani.cur`
- `public/Cursors/cool/Earth_handwriting.cur`
- `public/Cursors/cool/Earth_help.ani`
- `public/Cursors/cool/Earth_link_select.ani`
- `public/Cursors/cool/Earth_moving.ani`
- `public/Cursors/cool/Earth_moving_diagonal1.ani`
- `public/Cursors/cool/Earth_moving_diagonal2.ani`
- `public/Cursors/cool/Earth_moving_horizontal.ani`
- `public/Cursors/cool/Earth_moving_vertical.ani`
- *...and 77 more files.*

### 🟡 Modified (20 files)
- `src/App.tsx`
- `src/components/ControlPanel.tsx`
- `src/components/DesktopIcon.tsx`
- `src/components/GUIOS.tsx`
- `src/components/GenericSetupWizard.tsx`
- `src/components/SystemProperties.tsx`
- `src/components/VMail.tsx`
- `src/components/VersaFileManager.tsx`
- `src/components/VesperaSitePages/VesperaHome.tsx`
- `src/components/VesperaSitePages/types.ts`
- `src/components/VesperaSystemsSite.tsx`
- `src/components/VesperaWrite.tsx`
- `src/components/WebBrowser.tsx`
- `src/contexts/FileSystemContext.tsx`
- `src/contexts/VMailContext.tsx`
- `src/data/vstoreApps.ts`
- `src/hooks/useVFS.ts`
- `src/index.css`
- `src/utils/appDictionary.ts`
- `src/utils/audio.ts`

### 🔴 Removed (1 files)
- `tsc_output.txt`

---

## [Commit 0f8c271] - 2026-04-13
**Author:** Tr1pAc1d
**Message:** feat: implement Vespera ecosystem components, custom cursor themes, and web browser functionality

### 📝 Developer Notes
### 🏢 Ecosystem Expansion
- **Vespera Systems Site**: Designed and implemented the mock corporate 'Vespera Systems' website establishing the in-universe product catalog.

### 🟢 Added (28 files)
- `patch_browser.cjs`
- `public/Vespera Website assets/A photo of a heavy, metal, rack-mounted server.jpeg`
- `public/Vespera Website assets/Dr. Arthur Thorne (Portrait).png`
- `public/Vespera Website assets/Product Images/DeepSweep Box.png`
- `public/Vespera Website assets/Product Images/Vespera Workplace OS - Default box.png`
- `public/Vespera Website assets/The AETHERIS Mainframe.png`
- `public/Vespera Website assets/Vespera Systems Global Headquarters.png`
- `public/Vespera Website assets/X-Type Circuit Diagram.png`
- `src/components/VesperaSitePages/Vespera404.tsx`
- `src/components/VesperaSitePages/VesperaAbout.tsx`
- `src/components/VesperaSitePages/VesperaAccount.tsx`
- `src/components/VesperaSitePages/VesperaAxisLog.tsx`
- `src/components/VesperaSitePages/VesperaCareers.tsx`
- `src/components/VesperaSitePages/VesperaDownloads.tsx`
- `src/components/VesperaSitePages/VesperaGuestbook.tsx`
- `src/components/VesperaSitePages/VesperaHome.tsx`
- `src/components/VesperaSitePages/VesperaIntranet.tsx`
- `src/components/VesperaSitePages/VesperaPress.tsx`
- `src/components/VesperaSitePages/VesperaProducts.tsx`
- `src/components/VesperaSitePages/VesperaStore.tsx`
- `src/components/VesperaSitePages/VesperaSupport.tsx`
- `src/components/VesperaSitePages/VesperaWelcome.tsx`
- `src/components/VesperaSitePages/VesperaXType.tsx`
- `src/components/VesperaSitePages/types.ts`
- `src/components/VesperaSystemsSite.tsx`
- `src/contexts/VMailContext.tsx`
- `system-maintenance-box.png`
- `tsc.txt`

### 🟡 Modified (5 files)
- `src/App.tsx`
- `src/components/GUIOS.tsx`
- `src/components/VMail.tsx`
- `src/components/WebBrowser.tsx`
- `tsc_output.txt`

---

## [Commit 2074d02] - 2026-04-05
**Author:** Tr1pAc1d
**Message:** Update README.md

### 📝 Developer Notes
### 📝 Documentation
- Updated `README.md` with Node.js setup instructions, commands, and project vision.

### 🟡 Modified (1 files)
- `README.md`

---

## [Commit 4d5db99] - 2026-04-05
**Author:** Tr1pAc1d
**Message:** Vespera OS Public Build 1.11.1

### 📝 Developer Notes
### 🚀 Initial Public Release
- **Vespera OS Public Build 1.11.1**: Initial public alpha release of the VersaOS web operating system environment.

### 🟢 Added (181 files)
- `.env.example`
- `.gitignore`
- `README.md`
- `add_icons.cjs`
- `add_icons2.cjs`
- `add_prices.cjs`
- `add_vstore_data.cjs`
- `gen-image.ts`
- `index.html`
- `metadata.json`
- `nodes_str.txt`
- `npm run dev.txt`
- `package-lock.json`
- `package.json`
- `public/Help_Images/Control_Panel/CM_home.png`
- `public/Help_Images/Control_Panel/Display Properties/CM_Display_Properties_Monitor_Tab.png`
- `public/Help_Images/Control_Panel/Display Properties/CM_Display_Properties_Settings_Tab.png`
- `public/Help_Images/Control_Panel/Display Properties/CM_Display_Properties_background_Tab.png`
- `public/Help_Images/Control_Panel/System/system_device_manager.png`
- `public/Help_Images/Control_Panel/System/system_general.png`
- `public/Help_Images/Control_Panel/System/system_hardware_profiles.png`
- `public/Help_Images/Control_Panel/System/system_performance.png`
- `public/Help_Images/Control_Panel/System/system_user_profiles.png`
- `public/Help_Images/Control_Panel/Task_Menu/Task_Menu_System_apps.png`
- `public/Help_Images/Control_Panel/Task_Menu/Task_Menu_Wave_Bars_custom_options.png`
- `public/Help_Images/Control_Panel/Task_Menu/black_Task_Menu.png`
- `public/Help_Images/Control_Panel/Task_Menu/task_menu_Shortcuts.png`
- `public/Help_Images/Control_Panel/Task_Menu/task_menu_clock.png`
- `public/Help_Images/Control_Panel/Task_Menu/task_menu_programs.png`
- `public/Help_Images/Control_Panel/Task_Menu/task_menu_start.png`
- *...and 151 more files.*

---

