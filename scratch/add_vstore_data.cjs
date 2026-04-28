// Script to add ratings, reviews, downloadCounts to all VStore apps
// and append new 1990s filler apps
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'vstoreApps.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Fake review data pools
const usernames = [
  'PCGamer_Dave', 'SysAdmin_Mike', 'TechJunkie92', 'DOSmaster',
  'NetSurfer_Jim', 'DialUpDan', 'WinWizard', 'CyberSally',
  'MegaByte_Mary', 'PixelPete', 'NerdyNorma', 'BBS_King',
  'FloppyDisk_Fred', 'IRCchat_Irene', 'RAM_Randy', 'VGAVince'
];

const reviewTexts = {
  high: [
    'Absolutely essential software. Runs great on my 486!',
    'Best program in its class. Worth every kilobyte.',
    'Downloaded this over my 14.4k modem, worth the 3 hour wait!',
    'My office cant function without this. 5 stars.',
    'Incredible quality for shareware. Highly recommended.',
    'Works perfectly on my Pentium 90. No IRQ conflicts!',
    'This is why I upgraded to 16MB of RAM. Amazing.',
    'Finally software that doesnt crash on my system!',
  ],
  mid: [
    'Pretty good but needs more features in the next version.',
    'Works ok but crashes sometimes when multitasking.',
    'Decent software, wish it supported more file formats.',
    'Good enough for what I need. Could use a manual.',
    'Runs fine but the interface is a bit clunky.',
    'Solid 3 stars. Gets the job done but nothing special.',
  ],
  low: [
    'Keeps giving me GPF errors. Needs a patch.',
    'Doesnt work with my Sound Blaster Pro. Very frustrating.',
    'Took 6 hours to download and it wont even install right.',
    'Conflicts with my mouse driver. Had to reinstall DOS.',
  ]
};

const dates96 = [
  'Dec 15, 1996', 'Nov 28, 1996', 'Oct 3, 1996', 'Sep 19, 1996',
  'Aug 7, 1996', 'Jul 22, 1996', 'Jun 14, 1996', 'May 1, 1996',
  'Apr 18, 1996', 'Mar 9, 1996', 'Feb 25, 1996', 'Jan 11, 1996',
  'Dec 2, 1995', 'Nov 14, 1995', 'Oct 30, 1995', 'Sep 5, 1995'
];

// Deterministic seeded random based on string
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (h * 16807 + 0) % 2147483647;
    return (h & 0x7fffffff) / 0x7fffffff;
  };
}

function generateForApp(appId) {
  const rand = seededRandom(appId);
  const rating = Math.round((2.5 + rand() * 2.5) * 10) / 10; // 2.5-5.0
  const downloadCount = Math.floor(500 + rand() * 15000);
  
  const numReviews = 2 + Math.floor(rand() * 2); // 2-3 reviews
  const reviews = [];
  const usedUsers = new Set();
  
  for (let i = 0; i < numReviews; i++) {
    let userIdx;
    do { userIdx = Math.floor(rand() * usernames.length); } while (usedUsers.has(userIdx));
    usedUsers.add(userIdx);
    
    const revRating = Math.max(1, Math.min(5, Math.round(rating + (rand() - 0.5) * 2)));
    const pool = revRating >= 4 ? reviewTexts.high : revRating >= 3 ? reviewTexts.mid : reviewTexts.low;
    const textIdx = Math.floor(rand() * pool.length);
    const dateIdx = Math.floor(rand() * dates96.length);
    
    reviews.push({
      user: usernames[userIdx],
      date: dates96[dateIdx],
      rating: revRating,
      text: pool[textIdx]
    });
  }
  
  return { rating, downloadCount, reviews };
}

// Find all app IDs in the file using regex
const appIdRegex = /id:\s*'([^']+)'/g;
let match;
const appIds = [];
while ((match = appIdRegex.exec(content)) !== null) {
  appIds.push(match[1]);
}

console.log(`Found ${appIds.length} apps`);

// For each app, add the rating/downloadCount/reviews after 'functional: true/false'
for (const appId of appIds) {
  const data = generateForApp(appId);
  
  // Some games are age restricted
  const ageRestrictedIds = ['doom95', 'duke3d', 'quake96', 'quakeworld', 'descent'];
  const isAgeRestricted = ageRestrictedIds.includes(appId);
  
  // Find the functional line for this specific app
  // We need to find the pattern: id: 'appId' followed by functional: true/false
  const appBlockRegex = new RegExp(
    `(id:\\s*'${appId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?functional:\\s*(?:true|false))`,
    ''
  );
  
  const appMatch = content.match(appBlockRegex);
  if (!appMatch) {
    console.log(`  Could not find app block for: ${appId}`);
    continue;
  }
  
  const originalBlock = appMatch[1];
  
  // Check if it already has systemDownload
  const hasSystemDownload = /systemDownload/.test(
    content.substring(content.indexOf(originalBlock), content.indexOf(originalBlock) + originalBlock.length + 100)
  );
  
  // Build the new fields string
  const reviewsStr = JSON.stringify(data.reviews, null, 6)
    .replace(/\n/g, '\n    ')
    .replace(/"(\w+)":/g, '$1:')
    .replace(/"/g, "'");
  
  let newFields = `,\n    rating: ${data.rating},\n    downloadCount: ${data.downloadCount},\n    reviews: ${reviewsStr}`;
  if (isAgeRestricted) {
    newFields += `,\n    ageRestricted: true`;
  }
  
  // Only add if not already added
  if (content.includes(`id: '${appId}'`) && !content.includes(`id: '${appId}'`) === false) {
    continue;
  }
  
  // Find the closing of this app's functional line and add after it
  // But only if we haven't already added rating to it
  const ratingCheck = new RegExp(`id:\\s*'${appId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?rating:`);
  if (ratingCheck.test(content)) {
    console.log(`  Skipping ${appId} - already has rating`);
    continue;
  }
  
  // Find the functional: true/false line for this app and add after it
  // We search from the position of the id
  const idPos = content.indexOf(`id: '${appId}'`);
  if (idPos === -1) continue;
  
  // Find the next 'functional:' after this id
  const funcRegex = /functional:\s*(true|false)/;
  const searchFrom = content.substring(idPos);
  const funcMatch = searchFrom.match(funcRegex);
  if (!funcMatch) continue;
  
  const funcPos = idPos + funcMatch.index + funcMatch[0].length;
  
  // Check if next meaningful thing is systemDownload or closing brace
  const afterFunc = content.substring(funcPos, funcPos + 50);
  if (afterFunc.match(/^\s*,\s*\n\s*systemDownload/)) {
    // Has systemDownload - insert after systemDownload line
    const sdRegex = /systemDownload:\s*(true|false)/;
    const sdMatch = content.substring(funcPos).match(sdRegex);
    if (sdMatch) {
      const sdPos = funcPos + sdMatch.index + sdMatch[0].length;
      content = content.substring(0, sdPos) + newFields + content.substring(sdPos);
      console.log(`  Added data after systemDownload for: ${appId}`);
      continue;
    }
  }
  
  // Insert after functional line 
  content = content.substring(0, funcPos) + newFields + content.substring(funcPos);
  console.log(`  Added data for: ${appId}`);
}

// Now add new 1990s filler apps before the closing ];
const newApps = `

  // ── Additional 1990s Filler Apps ──
  {
    id: 'lemmings',
    name: 'Lemmings for Windows',
    developer: 'Psygnosis',
    version: '1.0',
    size: '3.2 MB',
    icon: Gamepad2,
    color: 'text-green-500',
    category: 'Games & Entertainment',
    description: 'Guide hordes of mindless lemmings through increasingly devious obstacle courses. Assign jobs like Digger, Builder, and Blocker to save them from certain doom!',
    requirements: 'Windows 3.1 or 95, 4MB RAM, VGA',
    screenshotUrl: 'https://placehold.co/400x300/008800/FFFFFF/png?text=Lemmings+Level+View',
    functional: false,
    rating: 4.6,
    downloadCount: 8921,
    reviews: [
      { user: 'PCGamer_Dave', date: 'Nov 12, 1996', rating: 5, text: 'Still the greatest puzzle game ever made. My whole family plays!' },
      { user: 'PixelPete', date: 'Sep 4, 1996', rating: 4, text: 'Addictive gameplay. Wish there were more levels in the shareware version.' }
    ]
  },
  {
    id: 'oregon_trail',
    name: 'Oregon Trail Deluxe',
    developer: 'MECC',
    version: '1.2',
    size: '5.1 MB',
    icon: Gamepad2,
    color: 'text-amber-700',
    category: 'Games & Entertainment',
    description: 'Lead your pioneer family westward in this legendary educational adventure. Hunt for food, ford rivers, and try not to die of dysentery.',
    requirements: 'Windows 3.1, 4MB RAM, Mouse',
    screenshotUrl: 'https://placehold.co/400x300/8B6914/FFFFFF/png?text=Oregon+Trail+Wagon',
    functional: false,
    rating: 4.8,
    downloadCount: 14205,
    reviews: [
      { user: 'NerdyNorma', date: 'Oct 28, 1996', rating: 5, text: 'Played this in school, now I can play at home! Classic.' },
      { user: 'DOSmaster', date: 'Aug 15, 1996', rating: 5, text: 'You have died of dysentery. 10/10 would play again.' }
    ]
  },
  {
    id: 'worms',
    name: 'Worms: Reinforcements',
    developer: 'Team17',
    version: '1.0',
    size: '8.5 MB',
    icon: Gamepad2,
    color: 'text-pink-500',
    category: ['Games & Entertainment'],
    description: 'Turn-based artillery combat with cartoon worms! Use bazookas, dynamite, and the legendary Holy Hand Grenade to annihilate your opponents.',
    requirements: '486DX, 8MB RAM, VGA, Sound Card',
    screenshotUrl: 'https://placehold.co/400x300/4488FF/FFFFFF/png?text=Worms+Battlefield',
    functional: false,
    rating: 4.4,
    downloadCount: 6782,
    reviews: [
      { user: 'BBS_King', date: 'Dec 1, 1996', rating: 5, text: 'Hotseat multiplayer is amazing. We play this every lunch break!' },
      { user: 'FloppyDisk_Fred', date: 'Jul 19, 1996', rating: 4, text: 'Great fun, but takes forever to download on my 14.4k modem.' }
    ]
  },
  {
    id: 'warcraft2',
    name: 'WarCraft II: Tides of Darkness',
    developer: 'Blizzard Entertainment',
    version: '1.4',
    size: '18.2 MB',
    icon: Gamepad2,
    color: 'text-red-700',
    category: ['Featured Apps', 'Games & Entertainment'],
    description: 'Command the armies of the Alliance or the Horde in this genre-defining real-time strategy game. Build your base, harvest resources, and crush your enemies!',
    requirements: 'Pentium 60MHz, 16MB RAM, SVGA, CD-ROM',
    screenshotUrl: 'https://placehold.co/400x300/003300/FFD700/png?text=WarCraft+II+Battle',
    functional: false,
    ageRestricted: true,
    rating: 4.9,
    downloadCount: 12450,
    reviews: [
      { user: 'PCGamer_Dave', date: 'Nov 30, 1996', rating: 5, text: 'The best RTS ever made. Blizzard is unstoppable.' },
      { user: 'TechJunkie92', date: 'Oct 15, 1996', rating: 5, text: 'Zug zug! This game eats all my free time.' },
      { user: 'NetSurfer_Jim', date: 'Sep 2, 1996', rating: 5, text: 'Multiplayer over Kali is incredible. The future of gaming!' }
    ]
  },
  {
    id: 'fractint',
    name: 'Fractint',
    developer: 'Stone Soup Group',
    version: '20.0',
    size: '1.8 MB',
    icon: ImageIcon,
    color: 'text-indigo-500',
    category: ['Productivity', 'System Utilities'],
    description: 'The definitive fractal generation program. Explore Mandelbrot sets, Julia sets, and hundreds of other fractal types with blazing-fast integer math rendering.',
    requirements: 'DOS 3.0+, 640K RAM, VGA',
    screenshotUrl: 'https://placehold.co/400x300/000000/FF44FF/png?text=Mandelbrot+Fractal',
    functional: false,
    rating: 4.3,
    downloadCount: 3421,
    reviews: [
      { user: 'MegaByte_Mary', date: 'Aug 22, 1996', rating: 5, text: 'I left my PC rendering a deep zoom overnight. The result was breathtaking.' },
      { user: 'RAM_Randy', date: 'Jun 10, 1996', rating: 4, text: 'Great for screensaver material. Runs fast even on my old 386.' }
    ]
  },
  {
    id: 'trumpet_winsock',
    name: 'Trumpet Winsock',
    developer: 'Trumpet Software',
    version: '3.0',
    size: '900 KB',
    icon: Globe,
    color: 'text-blue-500',
    category: 'Networking',
    description: 'The essential TCP/IP stack for Windows 3.1 users. Required to connect to the Internet before Windows 95. Includes built-in dialer and PPP/SLIP support.',
    requirements: 'Windows 3.1, Modem, ISP Account',
    screenshotUrl: 'https://placehold.co/400x300/C0C0C0/000080/png?text=Trumpet+Winsock+Dialer',
    functional: false,
    rating: 4.1,
    downloadCount: 11230,
    reviews: [
      { user: 'DialUpDan', date: 'Mar 14, 1996', rating: 4, text: 'Without this, I literally could not get online. Essential shareware.' },
      { user: 'IRCchat_Irene', date: 'Jan 25, 1996', rating: 4, text: 'Tricky to configure SLIP settings but once its working, its rock solid.' }
    ]
  },
  {
    id: 'paint_shop_pro',
    name: 'Paint Shop Pro 4',
    developer: 'JASC Software',
    version: '4.12',
    size: '6.8 MB',
    icon: PenTool,
    color: 'text-orange-600',
    category: 'Productivity',
    description: 'A powerful and affordable alternative to Photoshop. Full-featured image editor with layers, effects, and batch conversion. Supports BMP, GIF, JPEG, PNG, and 30+ formats.',
    requirements: 'Windows 95, 8MB RAM, 256-color Display',
    screenshotUrl: 'https://placehold.co/400x300/FFFFFF/FF6600/png?text=Paint+Shop+Pro+Canvas',
    functional: false,
    rating: 4.5,
    downloadCount: 9340,
    reviews: [
      { user: 'PixelPete', date: 'Nov 5, 1996', rating: 5, text: 'Half the price of Photoshop and does everything I need. Love the batch converter.' },
      { user: 'CyberSally', date: 'Sep 21, 1996', rating: 4, text: 'Great for editing GIFs for my GeoCities page!' }
    ]
  },
  {
    id: 'stuffit',
    name: 'StuffIt Expander',
    developer: 'Aladdin Systems',
    version: '4.0',
    size: '1.6 MB',
    icon: Package,
    color: 'text-teal-600',
    category: 'System Utilities',
    description: 'Expand .SIT, .HQX, .BIN, and .SEA archives from Macintosh users. Essential for cross-platform file exchange in mixed Mac/PC offices.',
    requirements: 'Windows 3.1 or 95, 2MB RAM',
    screenshotUrl: 'https://placehold.co/400x300/C0C0C0/008080/png?text=StuffIt+Expander',
    functional: false,
    rating: 3.8,
    downloadCount: 4120,
    reviews: [
      { user: 'SysAdmin_Mike', date: 'Oct 8, 1996', rating: 4, text: 'Our office has Macs and PCs - this is indispensable.' },
      { user: 'WinWizard', date: 'Jul 3, 1996', rating: 4, text: 'Cleanly handles every Mac archive I throw at it.' }
    ]
  },
  {
    id: 'netbus',
    name: 'NetBus Remote Admin',
    developer: 'Carl-Fredrik Neikter',
    version: '1.60',
    size: '490 KB',
    icon: Terminal,
    color: 'text-red-500',
    category: 'Networking',
    description: 'Remote administration tool for Windows PCs. Control mouse, keyboard, and file system of any networked PC. For authorized system administrators ONLY.',
    requirements: 'Windows 95, TCP/IP Network',
    screenshotUrl: 'https://placehold.co/400x300/000000/FF0000/png?text=NetBus+Remote+Control',
    functional: false,
    ageRestricted: true,
    rating: 3.2,
    downloadCount: 2180,
    reviews: [
      { user: 'SysAdmin_Mike', date: 'Dec 20, 1996', rating: 4, text: 'Powerful tool for managing lab PCs remotely. Use responsibly!' },
      { user: 'BBS_King', date: 'Nov 1, 1996', rating: 2, text: 'This is basically a trojan horse. DANGEROUS if misused.' }
    ]
  },
  {
    id: 'pkzip',
    name: 'PKZIP for Windows',
    developer: 'PKWARE Inc.',
    version: '2.50',
    size: '1.4 MB',
    icon: Package,
    color: 'text-blue-800',
    category: 'System Utilities',
    description: 'The original .ZIP archive format creator. PKZIP invented the ZIP standard and remains the fastest, most reliable compression utility available for DOS and Windows.',
    requirements: 'DOS 3.0+ or Windows 3.1+, 640K RAM',
    screenshotUrl: 'https://placehold.co/400x300/000080/FFFF00/png?text=PKZIP+Archive+Manager',
    functional: false,
    rating: 4.2,
    downloadCount: 13890,
    reviews: [
      { user: 'DOSmaster', date: 'Apr 12, 1996', rating: 5, text: 'The grandfather of all zip tools. Fast, reliable, legendary.' },
      { user: 'FloppyDisk_Fred', date: 'Feb 8, 1996', rating: 4, text: 'Essential for fitting files on floppies. Use it daily.' }
    ]
  },
  {
    id: 'doom2',
    name: 'DOOM II: Hell on Earth',
    developer: 'id Software',
    version: '1.9',
    size: '14.5 MB',
    icon: ShieldAlert,
    color: 'text-red-800',
    category: 'Games & Entertainment',
    description: 'The demons have invaded Earth. Fight through 32 brutal levels with the devastating new Super Shotgun. Supports up to 4-player deathmatch over IPX network.',
    requirements: '486DX2/66, 8MB RAM, Sound Blaster, MS-DOS 5.0+',
    screenshotUrl: 'https://placehold.co/400x300/440000/FF2200/png?text=DOOM+II+Super+Shotgun',
    functional: false,
    ageRestricted: true,
    rating: 4.9,
    downloadCount: 15200,
    reviews: [
      { user: 'PCGamer_Dave', date: 'Dec 15, 1996', rating: 5, text: 'The Super Shotgun alone makes this a masterpiece. BFG is icing on the cake.' },
      { user: 'TechJunkie92', date: 'Oct 30, 1996', rating: 5, text: 'IPX deathmatch at LAN parties is the ultimate gaming experience.' },
      { user: 'DOSmaster', date: 'Aug 19, 1996', rating: 5, text: 'RIP AND TEAR! Best FPS ever made.' }
    ]
  },
  {
    id: 'lotus123',
    name: 'Lotus 1-2-3 for Windows',
    developer: 'Lotus Development',
    version: '5.0',
    size: '16.8 MB',
    icon: Grid,
    color: 'text-blue-600',
    category: 'Productivity',
    description: 'The legendary spreadsheet that defined business computing. Lotus 1-2-3 combines spreadsheets, charting, and database functionality in one integrated package.',
    requirements: 'Windows 3.1 or 95, 8MB RAM, 20MB Disk',
    screenshotUrl: 'https://placehold.co/400x300/FFFFFF/0000AA/png?text=Lotus+1-2-3+Spreadsheet',
    functional: false,
    rating: 4.0,
    downloadCount: 7650,
    reviews: [
      { user: 'SysAdmin_Mike', date: 'May 18, 1996', rating: 4, text: 'Still the standard in our accounting dept. Macros are unbeatable.' },
      { user: 'NerdyNorma', date: 'Mar 25, 1996', rating: 4, text: 'Losing ground to Excel but the power user features are still superior.' }
    ]
  },
  {
    id: 'cuteftp',
    name: 'CuteFTP',
    developer: 'GlobalSCAPE',
    version: '2.0',
    size: '1.8 MB',
    icon: Globe,
    color: 'text-yellow-600',
    category: 'Networking',
    description: 'An intuitive FTP client with a colorful interface. Drag and drop file uploads, built-in site manager, and automatic ASCII/Binary mode detection.',
    requirements: 'Windows 95, Winsock 1.1, Internet Connection',
    screenshotUrl: 'https://placehold.co/400x300/FFFFCC/000000/png?text=CuteFTP+Site+Manager',
    functional: false,
    rating: 4.3,
    downloadCount: 8920,
    reviews: [
      { user: 'NetSurfer_Jim', date: 'Nov 22, 1996', rating: 5, text: 'Much easier to use than WS_FTP. The site manager is a game changer.' },
      { user: 'CyberSally', date: 'Sep 8, 1996', rating: 4, text: 'I use this to upload my homepage to Geocities every day!' }
    ]
  },
  {
    id: 'norton_commander',
    name: 'Norton Commander',
    developer: 'Symantec',
    version: '5.5',
    size: '3.4 MB',
    icon: HardDrive,
    color: 'text-blue-900',
    category: 'System Utilities',
    description: 'The legendary dual-panel DOS file manager. Navigate your file system with blazing speed using keyboard shortcuts. Copy, move, and view files like a power user.',
    requirements: 'DOS 3.0+, 640K RAM',
    screenshotUrl: 'https://placehold.co/400x300/0000AA/00FFFF/png?text=Norton+Commander+Panels',
    functional: false,
    rating: 4.7,
    downloadCount: 11400,
    reviews: [
      { user: 'DOSmaster', date: 'Jul 14, 1996', rating: 5, text: 'I refuse to use Windows Explorer. Norton Commander forever.' },
      { user: 'SysAdmin_Mike', date: 'Apr 5, 1996', rating: 5, text: 'F5 to copy, F6 to move, F8 to delete. Muscle memory. Perfection.' }
    ]
  },
  {
    id: 'theme_hospital',
    name: 'Theme Hospital Demo',
    developer: 'Bullfrog Productions',
    version: '1.0',
    size: '11.3 MB',
    icon: Briefcase,
    color: 'text-white',
    category: 'Games & Entertainment',
    description: 'Build and manage your own hospital! Cure bizarre diseases like Bloaty Head and Slack Tongue. Keep your patients happy and your staff from quitting.',
    requirements: 'Pentium 75MHz, 16MB RAM, SVGA, CD-ROM',
    screenshotUrl: 'https://placehold.co/400x300/EEEEFF/FF0000/png?text=Theme+Hospital+Ward',
    functional: false,
    rating: 4.5,
    downloadCount: 5430,
    reviews: [
      { user: 'WinWizard', date: 'Dec 8, 1996', rating: 5, text: 'Hilarious and addictive. Bloaty Head patients crack me up every time.' },
      { user: 'MegaByte_Mary', date: 'Oct 19, 1996', rating: 4, text: 'Great sim game from the makers of Theme Park. Very polished.' }
    ]
  },
  {
    id: 'winrar',
    name: 'WinRAR',
    developer: 'Eugene Roshal',
    version: '2.0',
    size: '950 KB',
    icon: Package,
    color: 'text-purple-800',
    category: 'System Utilities',
    description: 'A powerful archive manager supporting RAR and ZIP formats. Features solid compression, split archives across multiple floppy disks, and recovery records for damaged archives.',
    requirements: 'Windows 3.1 or 95, 4MB RAM',
    screenshotUrl: 'https://placehold.co/400x300/4B0082/FFFFFF/png?text=WinRAR+Archive',
    functional: false,
    rating: 4.4,
    downloadCount: 10250,
    reviews: [
      { user: 'FloppyDisk_Fred', date: 'Nov 17, 1996', rating: 5, text: 'Better compression than ZIP and the trial never expires! Perfect.' },
      { user: 'RAM_Randy', date: 'Aug 30, 1996', rating: 4, text: 'RAR format is slowly taking over. Great software.' }
    ]
  },
  {
    id: 'civ2',
    name: 'Civilization II Demo',
    developer: 'MicroProse',
    version: '1.0',
    size: '20.5 MB',
    icon: Gamepad2,
    color: 'text-amber-600',
    category: ['Featured Apps', 'Games & Entertainment'],
    description: 'One more turn... Build an empire from the Stone Age to the Space Age in this legendary turn-based strategy masterpiece. Features advisors, diplomacy, and Wonder movies.',
    requirements: 'Pentium 90MHz, 16MB RAM, SVGA, CD-ROM',
    screenshotUrl: 'https://placehold.co/400x300/005500/FFD700/png?text=Civilization+II+Map',
    functional: false,
    rating: 4.9,
    downloadCount: 13800,
    reviews: [
      { user: 'PCGamer_Dave', date: 'Dec 12, 1996', rating: 5, text: 'I started playing at 8pm and suddenly it was 4am. GOTY material.' },
      { user: 'NerdyNorma', date: 'Oct 5, 1996', rating: 5, text: 'The most addictive strategy game ever created. Just one more turn...' },
      { user: 'TechJunkie92', date: 'Jul 28, 1996', rating: 5, text: 'Sid Meier is a genius. This and Alpha Centauri will define a generation.' }
    ]
  }`;

// Find the position of the closing ]; and insert before it
const closingBracket = content.lastIndexOf('];');
if (closingBracket !== -1) {
  content = content.substring(0, closingBracket) + newApps + '\n' + content.substring(closingBracket);
  console.log('Added new filler apps');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done! File updated successfully.');
