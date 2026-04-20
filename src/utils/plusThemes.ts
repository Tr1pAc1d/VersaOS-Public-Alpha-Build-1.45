/**
 * Vespera Plus! Desktop Enhancement Pack — Theme Definitions
 *
 * Each Plus! theme defines ambient audio, cursor style, window animation
 * timing, and visual overlay classes applied to the desktop shell.
 */

export interface PlusThemeWindowTransition {
  duration: number; // seconds
  ease: string;
}

export interface PlusTheme {
  id: string;
  name: string;
  description: string;
  // Audio
  ambientType: 'nature' | 'void' | null;
  ambientVolume: number;
  // CSS classes applied to desktop root
  cursorClass: string;
  overlayClass: string;
  scrollbarClass: string;
  // Window open/close animation overrides
  windowTransition: {
    open: PlusThemeWindowTransition;
    close: PlusThemeWindowTransition;
  };
  // Preview colors for the Control Panel theme selector
  previewColors: string[];
  // Deep Theme attributes
  defaultWallpaper?: string;
  defaultBackgroundColor?: string;
  defaultTaskbarTheme?: string;
  defaultClockColor?: string;
  defaultClockBgColor?: string;
}

export const PLUS_THEMES: Record<string, PlusTheme> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'The default Vespera OS desktop experience. No ambient audio or visual enhancements.',
    ambientType: null,
    ambientVolume: 0,
    cursorClass: '',
    overlayClass: '',
    scrollbarClass: '',
    windowTransition: {
      open: { duration: 0.15, ease: 'easeOut' },
      close: { duration: 0.1, ease: 'easeIn' },
    },
    previewColors: ['#c0c0c0', '#000080', '#008080', '#ffffff'],
    defaultWallpaper: '',
    defaultBackgroundColor: '#5f8787',
    defaultTaskbarTheme: 'motif',
    defaultClockColor: '',
    defaultClockBgColor: '',
  },
  cyber_nature: {
    id: 'cyber_nature',
    name: 'Cyber-Nature',
    description: 'Birdsong and rustling leaves drift through the circuits... until the digital static takes over.',
    ambientType: 'nature',
    ambientVolume: 0.15,
    cursorClass: 'plus-cursor-earth',
    overlayClass: 'plus-overlay-nature',
    scrollbarClass: 'plus-scrollbar-nature',
    windowTransition: {
      open: { duration: 0.4, ease: 'easeOut' },
      close: { duration: 0.3, ease: 'easeIn' },
    },
    previewColors: ['#0a2e0a', '#22c55e', '#065f46', '#86efac'],
    defaultWallpaper: '',
    defaultBackgroundColor: '#0a3a0a',
    defaultTaskbarTheme: 'forest',
    defaultClockColor: '#a8e6a8',
    defaultClockBgColor: '#0a3a0a',
  },
  corporate_void: {
    id: 'corporate_void',
    name: 'Corporate-Void',
    description: 'High-contrast. Sharp edges. The fluorescent lights hum. Something watches from the static.',
    ambientType: 'void',
    ambientVolume: 0.12,
    cursorClass: 'plus-cursor-ghostly',
    overlayClass: 'plus-overlay-void',
    scrollbarClass: 'plus-scrollbar-void',
    windowTransition: {
      open: { duration: 0.5, ease: 'easeInOut' },
      close: { duration: 0.15, ease: 'easeIn' },
    },
    previewColors: ['#0a0a0a', '#dc2626', '#1a1a2e', '#4a4a4a'],
    defaultWallpaper: '',
    defaultBackgroundColor: '#0a0a0a',
    defaultTaskbarTheme: 'dark',
    defaultClockColor: '#dc2626',
    defaultClockBgColor: '#0a0a0a',
  },
  hacker: {
    id: 'hacker',
    name: 'Mainframe Hacker',
    description: 'Bypass the firewall. Green terminal glows and matrix grids.',
    ambientType: 'void',
    ambientVolume: 0.1,
    cursorClass: 'plus-cursor-greenglow',
    overlayClass: 'plus-overlay-hacker',
    scrollbarClass: 'plus-scrollbar-hacker',
    windowTransition: { open: { duration: 0.2, ease: 'easeOut' }, close: { duration: 0.1, ease: 'easeIn' } },
    previewColors: ['#003300', '#00ff00', '#001100', '#005500'],
    defaultBackgroundColor: '#001100',
    defaultTaskbarTheme: 'hacker',
    defaultClockColor: '#00ff00',
    defaultClockBgColor: '#001100',
  },
  ocean: {
    id: 'ocean',
    name: 'Deep Ocean',
    description: 'Submerge into the abyss. Deep blue pressure and sonar pings.',
    ambientType: 'nature',
    ambientVolume: 0.1,
    cursorClass: 'plus-cursor-blueglass',
    overlayClass: 'plus-overlay-ocean',
    scrollbarClass: 'plus-scrollbar-ocean',
    windowTransition: { open: { duration: 0.3, ease: 'easeInOut' }, close: { duration: 0.2, ease: 'easeIn' } },
    previewColors: ['#004c66', '#00e5ff', '#002d3d', '#006b8f'],
    defaultBackgroundColor: '#001a33',
    defaultTaskbarTheme: 'ocean',
    defaultClockColor: '#00e5ff',
    defaultClockBgColor: '#001a33',
  },
  sunset: {
    id: 'sunset',
    name: 'Synthwave Sunset',
    description: 'Neon grids and wireframe mountains. The 1980s that never existed.',
    ambientType: null,
    ambientVolume: 0,
    cursorClass: 'plus-cursor-redblack',
    overlayClass: 'plus-overlay-sunset',
    scrollbarClass: 'plus-scrollbar-sunset',
    windowTransition: { open: { duration: 0.25, ease: 'easeOut' }, close: { duration: 0.15, ease: 'easeIn' } },
    previewColors: ['#4a1c5e', '#ff00ff', '#2a1033', '#00ffff'],
    defaultBackgroundColor: '#2a0033',
    defaultTaskbarTheme: 'sunset',
    defaultClockColor: '#ff00ff',
    defaultClockBgColor: '#2a0033',
  },
  gold: {
    id: 'gold',
    name: 'Executive Gold',
    description: 'Premium textures for the boardroom. Luxury and wealth.',
    ambientType: null,
    ambientVolume: 0,
    cursorClass: 'plus-cursor-bluesilver',
    overlayClass: 'plus-overlay-gold',
    scrollbarClass: 'plus-scrollbar-gold',
    windowTransition: { open: { duration: 0.3, ease: 'easeOut' }, close: { duration: 0.2, ease: 'easeIn' } },
    previewColors: ['#b8860b', '#ffd700', '#5c4305', '#deb887'],
    defaultBackgroundColor: '#2a2200',
    defaultTaskbarTheme: 'gold',
    defaultClockColor: '#ffd700',
    defaultClockBgColor: '#2a2200',
  },
  rose: {
    id: 'rose',
    name: 'Rose Dust',
    description: 'Soft pinks and warm retro hues. Gentle and calming.',
    ambientType: 'nature',
    ambientVolume: 0.08,
    cursorClass: 'plus-cursor-blueglass',
    overlayClass: 'plus-overlay-rose',
    scrollbarClass: 'plus-scrollbar-rose',
    windowTransition: { open: { duration: 0.2, ease: 'easeInOut' }, close: { duration: 0.2, ease: 'easeInOut' } },
    previewColors: ['#a86f7f', '#ffb6c1', '#54303b', '#cda4b1'],
    defaultBackgroundColor: '#3a202b',
    defaultTaskbarTheme: 'rose',
    defaultClockColor: '#ffb6c1',
    defaultClockBgColor: '#3a202b',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome CRT',
    description: 'High contrast black and white. Pure data processing.',
    ambientType: 'void',
    ambientVolume: 0.1,
    cursorClass: 'plus-cursor-redblack',
    overlayClass: 'plus-overlay-monochrome',
    scrollbarClass: 'plus-scrollbar-monochrome',
    windowTransition: { open: { duration: 0.1, ease: 'linear' }, close: { duration: 0.1, ease: 'linear' } },
    previewColors: ['#ececec', '#ffffff', '#b0b0b0', '#000000'],
    defaultBackgroundColor: '#000000',
    defaultTaskbarTheme: 'monochrome',
    defaultClockColor: '#ffffff',
    defaultClockBgColor: '#000000',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Violet',
    description: 'Deep purple skies. Quiet and focused late-night operation.',
    ambientType: null,
    ambientVolume: 0,
    cursorClass: 'plus-cursor-ghostly',
    overlayClass: 'plus-overlay-midnight',
    scrollbarClass: 'plus-scrollbar-midnight',
    windowTransition: { open: { duration: 0.2, ease: 'easeOut' }, close: { duration: 0.1, ease: 'easeIn' } },
    previewColors: ['#191970', '#8a2be2', '#05051a', '#323299'],
    defaultBackgroundColor: '#05051a',
    defaultTaskbarTheme: 'midnight',
    defaultClockColor: '#8a2be2',
    defaultClockBgColor: '#05051a',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Alert',
    description: 'Red alert protocols active. High tension hardware.',
    ambientType: 'void',
    ambientVolume: 0.12,
    cursorClass: 'plus-cursor-redblack',
    overlayClass: 'plus-overlay-crimson',
    scrollbarClass: 'plus-scrollbar-crimson',
    windowTransition: { open: { duration: 0.1, ease: 'easeIn' }, close: { duration: 0.1, ease: 'easeIn' } },
    previewColors: ['#8b0000', '#ff0000', '#260000', '#c20000'],
    defaultBackgroundColor: '#260000',
    defaultTaskbarTheme: 'crimson',
    defaultClockColor: '#ff0000',
    defaultClockBgColor: '#260000',
  },
  teal: {
    id: 'teal',
    name: 'Classic Teal',
    description: 'The nostalgic 90s standard. Reliable and sturdy.',
    ambientType: null,
    ambientVolume: 0,
    cursorClass: 'plus-cursor-bluesilver',
    overlayClass: 'plus-overlay-teal',
    scrollbarClass: 'plus-scrollbar-teal',
    windowTransition: { open: { duration: 0.15, ease: 'easeOut' }, close: { duration: 0.1, ease: 'easeIn' } },
    previewColors: ['#008080', '#00ffff', '#004d4d', '#00b3b3'],
    defaultBackgroundColor: '#004d4d',
    defaultTaskbarTheme: 'teal',
    defaultClockColor: '#00ffff',
    defaultClockBgColor: '#004d4d',
  },
  win95: {
    id: 'win95',
    name: 'Retro 95',
    description: 'Pure 1995 aesthetic. Beige windows and generic cursors.',
    ambientType: null,
    ambientVolume: 0,
    cursorClass: 'plus-cursor-bluesilver',
    overlayClass: 'plus-overlay-win95',
    scrollbarClass: 'plus-scrollbar-win95',
    windowTransition: { open: { duration: 0.1, ease: 'linear' }, close: { duration: 0.1, ease: 'linear' } },
    previewColors: ['#c0c0c0', '#ffffff', '#808080', '#000000'],
    defaultBackgroundColor: '#008080',
    defaultTaskbarTheme: 'win95',
    defaultClockColor: '#000000',
    defaultClockBgColor: '#c0c0c0',
  },
  motif_plus: {
    id: 'motif_plus',
    name: 'Retro Motif Supreme',
    description: 'The standard Vespera motif, but enhanced with smooth overlays and animations.',
    ambientType: null,
    ambientVolume: 0,
    cursorClass: 'plus-cursor-bluesilver',
    overlayClass: 'plus-overlay-motif',
    scrollbarClass: 'plus-scrollbar-motif',
    windowTransition: { open: { duration: 0.3, ease: 'easeOut' }, close: { duration: 0.2, ease: 'easeIn' } },
    previewColors: ['#537096', '#ffffff', '#2a3f5c', '#84a3c6'],
    defaultBackgroundColor: '#425a7a',
    defaultTaskbarTheme: 'motif',
    defaultClockColor: '#ffffff',
    defaultClockBgColor: '#425a7a',
  },
};

/** Available system updates for the Vespera Update panel */
export interface SystemUpdate {
  id: string;
  name: string;
  kb: string;
  size: string;
  description: string;
  installDuration: number; // seconds (approximate)
  lore?: boolean;
}

export const AVAILABLE_UPDATES: SystemUpdate[] = [
  {
    id: 'sp1',
    name: 'Vespera OS Service Pack 1',
    kb: 'KB100204',
    size: '1.4 MB',
    description: 'Critical system stability updates, improved memory management, and enhanced Motif rendering pipeline.',
    installDuration: 6,
  },
  {
    id: 'plus_pack',
    name: 'Vespera Plus! Desktop Enhancement Pack',
    kb: 'KB200517',
    size: '3.8 MB',
    description: 'Premium desktop themes with ambient soundscapes, custom cursors, and immersive visual effects. Transform the soul of your operating system.',
    installDuration: 15,
  },
  {
    id: 'rhid_update',
    name: 'RHID Module Update v2.1',
    kb: 'KB300091',
    size: '0.6 MB',
    description: 'Updated intrusion detection signatures. Includes expanded monitoring of non-standard frequency bands on the X-Type bus.',
    installDuration: 8,
    lore: true,
  },
  {
    id: 'screensaver_plus',
    name: 'Vespera Plus! Screen Saver Pack',
    kb: 'KB501138',
    size: '2.4 MB',
    description: '10 stunning new animated screen savers including Aurora Borealis, Plasma Wave, Warp Tunnel, Burning Embers, Crystal Lattice, Neon Rain, DNA Helix, Galaxy Spiral, Lissajous Art, and a retro Digital Clock. Requires Vespera OS 1.0.4.',
    installDuration: 10,
  },
  {
    id: 'agentv_plus',
    name: 'VAgent PLUS! Character Expansion',
    kb: 'KB400833',
    size: '2.1 MB',
    description: 'Premium skin pack for your personal assistant. Includes 5 new ultra-high-fidelity animated companions: Monitor, Wizard, Cat, Neural, and Ghost.',
    installDuration: 12,
  },
];
