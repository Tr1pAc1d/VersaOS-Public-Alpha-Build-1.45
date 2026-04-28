const fs = require('fs');
const path = require('path');

const THEMES = [
  { id: 'hacker', hotX: 0, hotY: 0, defaultSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='20' viewBox='0 0 16 20'><rect width='16' height='20' fill='%2300ff00'/></svg>", pointerSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='20' viewBox='0 0 16 20'><rect width='16' height='20' fill='none' stroke='%2300ff00' stroke-width='2'/></svg>" },
  { id: 'ocean', hotX: 12, hotY: 2, defaultSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 2L8 10C8 13.31 10.69 16 14 16C17.31 16 20 13.31 20 10L12 2Z' fill='%2300e5ff' stroke='%23002d3d' stroke-width='1'/></svg>", pointerSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 2L8 10C8 13.31 10.69 16 14 16C17.31 16 20 13.31 20 10L12 2Z' fill='none' stroke='%2300e5ff' stroke-width='2'/></svg>" },
  { id: 'sunset', hotX: 12, hotY: 2, defaultSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 2l10 18H2L12 2z' fill='none' stroke='%23ff00ff' stroke-width='2'/></svg>", pointerSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 2l10 18H2L12 2z' fill='%23ff00ff' stroke='%23ffffff' stroke-width='1'/></svg>" },
  { id: 'gold', hotX: 4, hotY: 4, defaultSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M4 4l5.5 16 3-6.5 6.5-3z' fill='%23ffd700' stroke='%235c4305' stroke-width='1'/></svg>", pointerSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M4 4l5.5 16 3-6.5 6.5-3z' fill='none' stroke='%23ffd700' stroke-width='2'/></svg>" },
  { id: 'rose', hotX: 12, hotY: 3, defaultSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='%23ffb6c1' stroke='%2354303b' stroke-width='1'/></svg>", pointerSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' fill='none' stroke='%23ffb6c1' stroke-width='2'/></svg>" },
  { id: 'monochrome', hotX: 3, hotY: 3, defaultSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 3l7 18 3-7 7-3z' fill='%23ffffff' stroke='%23000000' stroke-width='2'/></svg>", pointerSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 3l7 18 3-7 7-3z' fill='%23000000' stroke='%23ffffff' stroke-width='2'/></svg>" },
  { id: 'midnight', hotX: 5, hotY: 5, defaultSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M9.37,5A9,9,0,0,0,16.5,21.9,9.05,9.05,0,0,1,10.5,3.1a9.14,9.14,0,0,0-1.13,1.9Z' fill='%238a2be2' stroke='%23ffffff' stroke-width='1'/></svg>", pointerSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M9.37,5A9,9,0,0,0,16.5,21.9,9.05,9.05,0,0,1,10.5,3.1a9.14,9.14,0,0,0-1.13,1.9Z' fill='none' stroke='%238a2be2' stroke-width='2'/></svg>" },
  { id: 'crimson', hotX: 12, hotY: 2, defaultSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 2L2 20h20L12 2z' fill='%23ff0000' stroke='%23260000' stroke-width='2'/><circle cx='12' cy='14' r='2' fill='%23260000'/></svg>", pointerSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 2L2 20h20L12 2z' fill='none' stroke='%23ff0000' stroke-width='3'/><circle cx='12' cy='14' r='2' fill='%23ff0000'/></svg>" },
  { id: 'teal', hotX: 3, hotY: 3, defaultSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 3l6 16 3-6 6-3z' fill='%2300ffff' stroke='%23004d4d' stroke-width='1'/></svg>", pointerSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 3l6 16 3-6 6-3z' fill='none' stroke='%2300ffff' stroke-width='2'/></svg>" },
  { id: 'win95', hotX: 2, hotY: 2, defaultSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M2 2l5 15 3-5 5-3z' fill='%23ffffff' stroke='%23000000' stroke-width='1'/></svg>", pointerSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M2 2l5 15 3-5 5-3z' fill='none' stroke='%23000000' stroke-width='2'/></svg>" },
  { id: 'motif', hotX: 2, hotY: 2, defaultSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M2 2l6 16 3-6 6-3z' fill='%23537096' stroke='%23ffffff' stroke-width='1'/></svg>", pointerSvg: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M2 2l6 16 3-6 6-3z' fill='none' stroke='%23537096' stroke-width='2'/></svg>" }
];

let css = '';
THEMES.forEach(t => {
  const encDefault = encodeURIComponent(t.defaultSvg);
  const encPointer = encodeURIComponent(t.pointerSvg);
  
  css += '\n/* ── Plus Cursor: ' + t.id + ' ── */\n';
  css += '.plus-cursor-' + t.id + ',\n.plus-cursor-' + t.id + ' * {\n';
  css += '  cursor: url("data:image/svg+xml,' + encDefault + '") ' + t.hotX + ' ' + t.hotY + ', auto !important;\n}\n';

  css += '.plus-cursor-' + t.id + ' a,\n.plus-cursor-' + t.id + ' button,\n.plus-cursor-' + t.id + ' [role="button"],\n.plus-cursor-' + t.id + ' input[type="checkbox"],\n.plus-cursor-' + t.id + ' label {\n';
  css += '  cursor: url("data:image/svg+xml,' + encPointer + '") ' + t.hotX + ' ' + t.hotY + ', pointer !important;\n}\n';

  css += '\n/* ── Plus Overlay / Scrollbar: ' + t.id + ' ── */\n';
  css += '.plus-overlay-' + t.id + ' {\n  position: relative;\n}\n';

  if (t.id === 'hacker') {
    css += '.plus-overlay-' + t.id + '::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  background: repeating-linear-gradient(0deg, rgba(0,255,0,0.03) 0px, transparent 2px);\n  z-index: 9998;\n}\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-track { background: #001100; }\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-thumb { background: #005500; border: 1px solid #00ff00; }\n';
  } else if (t.id === 'ocean') {
    css += '.plus-overlay-' + t.id + '::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  background: radial-gradient(circle at 50% 100%, rgba(0,229,255,0.05) 0%, transparent 80%);\n  z-index: 9998;\n}\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-track { background: #001a33; }\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-thumb { background: #004c66; border: 1px solid #00e5ff; }\n';
  } else if (t.id === 'sunset') {
    css += '.plus-overlay-' + t.id + '::after {\n  content: "";\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  background: linear-gradient(180deg, rgba(255,0,255,0.03) 0%, transparent 40%, rgba(0,255,255,0.03) 100%);\n  z-index: 9998;\n}\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-track { background: #2a0033; }\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-thumb { background: #4a1c5e; border: 1px solid #ff00ff; }\n';
  } else if (t.id === 'gold') {
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-track { background: #2a2200; }\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-thumb { background: #b8860b; border: 1px solid #ffd700; }\n';
  } else if (t.id === 'rose') {
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-track { background: #3a202b; }\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-thumb { background: #a86f7f; border: 1px solid #ffb6c1; }\n';
  } else if (t.id === 'monochrome') {
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-track { background: #000000; }\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-thumb { background: #ececec; border: 1px solid #ffffff; }\n';
  } else if (t.id === 'midnight') {
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-track { background: #05051a; }\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-thumb { background: #191970; border: 1px solid #8a2be2; }\n';
  } else if (t.id === 'crimson') {
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-track { background: #260000; }\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-thumb { background: #8b0000; border: 1px solid #ff0000; }\n';
  } else if (t.id === 'teal') {
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-track { background: #004d4d; }\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-thumb { background: #008080; border: 1px solid #00ffff; }\n';
  } else if (t.id === 'win95') {
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-track { background: #c0c0c0; border: 1px solid #808080; }\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-thumb { background: #dfdfdf; border-top: 1px solid #ffffff; border-left: 1px solid #ffffff; border-right: 1px solid #000; border-bottom: 1px solid #000; }\n';
  } else if (t.id === 'motif') {
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-track { background: #425a7a; }\n';
    css += '.plus-scrollbar-' + t.id + ' ::-webkit-scrollbar-thumb { background: #537096; border-top: 1px solid #84a3c6; border-left: 1px solid #84a3c6; border-bottom: 1px solid #2a3f5c; border-right: 1px solid #2a3f5c; }\n';
  }
});

const cssPath = path.join(__dirname, 'src', 'styles', 'plusThemes.css');
fs.appendFileSync(cssPath, "\n" + css);
