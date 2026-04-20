const fs = require('fs');
const file = 'D:/VersaOS-main/src/data/vstoreApps.ts';
let code = fs.readFileSync(file, 'utf-8');

if (!code.includes('customIcon?: string;')) {
  code = code.replace(/icon:\s*any;/, "icon: any;\n  customIcon?: string;");
}

const mappings = {
  'packman': 'game_mine_1-0.png',
  'doom95': 'game_mine_1-0.png',
  'simcity2k': 'directory_business_calendar-4.png',
  'quake96': 'joystick-5.png',
  'msfs95': 'joystick-5.png',
  'duke3d': 'joystick-5.png',
  'commander_keen': 'game_mine_1-0.png',
  'myst_demo': 'camera3-4.png',
  'solitaire95': 'game_solitaire-0.png',
  'minesweeper': 'game_mine_1-0.png',
  'pinball': 'game_mine_1-0.png',
  
  'netsurf': 'world-2.png',
  'ie3': 'world-2.png',
  'mirc': 'msn3-4.png',
  'icq': 'msn_cool-3.png',
  'wsftp': 'directory_dial_up_networking_cool-3.png',
  'eudora': 'envelope_closed-0.png',
  'cuseeme': 'camera3_vid-2.png',
  
  'vmail': 'mailbox_world-2.png',
  'v_messenger': 'msn_cool-3.png',
  'word95': 'notepad-2.png',
  'excel95': 'bar_graph-1.png',
  'photoshop4': 'paint_file-4.png',
  'coreldraw': 'true_type_paint-0.png',
  'page_maker': 'kodak_imaging-0.png',
  'filemaker': 'directory_admin_tools-4.png',
  'calc': 'bar_graph_default-1.png',
  
  'winzip': 'package-1.png',
  'norton': 'scandisk-0.png',
  'winamp': 'multimedia-4.png',
  'partitionmagic': 'clean_drive-0.png',
  'afterdark': 'monitor_application.png',
  'realplayer': 'multimedia-2.png',
  'hyperterm': 'directory_dial_up_networking_cool-4.png',
  'acdsee': 'magnifying_glass_4-1.png',
  'directx': 'chip_ramdrive-2.png',
  'tweakui': 'settings_gear-2.png',
  
  'quakeworld': 'netmeeting-2.png',
  'simant': 'joystick-5.png',
  'descent': 'joystick-5.png',
  'kq5': 'joystick-5.png',
  'mvis': 'cd_audio_cd_a-3.png',
  'wordperfect': 'notepad-2.png',
  'winfax': 'printer_plotter-0.png',
  'zonealarm': 'scandisk-0.png',
  'goose': 'mouse_trails.png',
  'napster': 'cd_audio_cd_a-4.png',
  'encarta': 'help_book_computer-4.png',
  'mathcad': 'bar_graph-1.png',
  'connectix': 'computer-5.png',
  'bbsdoor': 'server_window.png',
  'getright': 'network_drive_cool-3.png'
};

for(const [id, iconFn] of Object.entries(mappings)) {
  const regex = new RegExp(`(id:\\s*'${id}',[\\s\\S]*?icon:\\s*[A-Za-z0-9_]+,)`);
  code = code.replace(regex, `$1\n    customIcon: '/Icons/${iconFn}',`);
}

fs.writeFileSync(file, code);
console.log("Updated vstoreApps.ts");
