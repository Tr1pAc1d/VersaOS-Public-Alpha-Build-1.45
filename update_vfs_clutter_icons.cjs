const fs = require('fs');
const file = 'D:/VersaOS-main/src/hooks/useVFS.ts';
let code = fs.readFileSync(file, 'utf-8');

const regexes = [
  { match: /(id: 'desktop',.*parentId: 'root')/, append: ", customIcon: '/Icons/directory_closed-4.png'" },
  { match: /(id: 'users',.*parentId: 'root')/, append: ", customIcon: '/Icons/users_green-4.png'" },
  { match: /(id: 'programs',.*parentId: 'root')/, append: ", customIcon: '/Icons/directory_admin_tools-4.png'" },
  { match: /(id: 'vespera',.*parentId: 'root')/, append: ", customIcon: '/Icons/directory_closed_cool-0.png'" },
  { match: /(id: 'dev_logs',.*parentId: 'vespera')/, append: ", customIcon: '/Icons/directory_closed-4.png'" },
  { match: /(id: 'system',.*parentId: 'vespera')/, append: ", customIcon: '/Icons/directory_closed-4.png'" },
  { match: /(id: 'downloads',.*parentId: 'root')/, append: ", customIcon: '/Icons/directory_open_file_mydocs-4.png'" },
  { match: /(id: 'documents',.*parentId: 'root')/, append: ", customIcon: '/Icons/directory_open_file_mydocs_2k-4.png'" },
  { match: /(id: 'memo_084',.*type: 'file',.*)( content: `TO:)/, repl: "$1 customIcon: '/Icons/notepad-2.png',$2" },
  { match: /(id: 'kernel_sys',.*type: 'file',.*)( content: "BINARY)/, repl: "$1 customIcon: '/Icons/executable_gear-0.png',$2" },
  { match: /(id: 'x_type_dll',.*type: 'file',.*)( content: "0x0)/, repl: "$1 customIcon: '/Icons/gears_3-0.png',$2" },
  { match: /(id: 'readme_txt',.*type: 'file',.*)( content: "Welcome)/, repl: "$1 customIcon: '/Icons/notepad-2.png',$2" },
  { match: /(id: 'sys_log_04',.*type: 'file',.*)( content: "Signal)/, repl: "$1 customIcon: '/Icons/msg_error-0.png',$2" },
  { match: /(id: 'v_config',.*parentId: 'vespera')/, append: ", customIcon: '/Icons/directory_control_panel-0.png'" },
  { match: /(id: 'v_drivers',.*parentId: 'vespera')/, append: ", customIcon: '/Icons/directory_closed-4.png'" },
  { match: /(id: 'v_logs',.*parentId: 'vespera')/, append: ", customIcon: '/Icons/directory_closed-4.png'" },
  { match: /(id: 'dev_log_01',.*type: 'file',.*)( content: "Oct)/, repl: "$1 customIcon: '/Icons/msg_error-0.png',$2" },
  { match: /(id: 'f_install_log',.*type: 'file',.*)( content: '')/, repl: "$1 customIcon: '/Icons/script_file-something.png',$2" }, // wait regex might fail if not careful
  { match: /(id: 'v_defrag_exe',.*parentId: 'system',)( content: 'BINARY_DEFRAG_V1.0')/, repl: "$1 customIcon: '/Icons/clean_drive-0.png',$2" },
];

let modified = code;
for (const rx of regexes) {
  if (rx.append) {
    // only if not already containing customIcon
    const matched = modified.match(rx.match);
    if (matched && !matched[0].includes('customIcon')) {
       modified = modified.replace(rx.match, `$1${rx.append}`);
    }
  } else if (rx.repl) {
    modified = modified.replace(rx.match, rx.repl);
  }
}

// Global replace for specific config extensions
modified = modified.replace(/name: '([^']+)\.INI', type: 'file', parentId: '([^']+)', content: '' \}/g, "name: '$1.INI', type: 'file', parentId: '$2', content: '', customIcon: '/Icons/settings_gear-2.png' }");
modified = modified.replace(/name: '([^']+)\.CFG', type: 'file', parentId: '([^']+)', content: '' \}/g, "name: '$1.CFG', type: 'file', parentId: '$2', content: '', customIcon: '/Icons/settings_gear-2.png' }");
modified = modified.replace(/name: '([^']+)\.BAT', type: 'file', parentId: '([^']+)', content: '' \}/g, "name: '$1.BAT', type: 'file', parentId: '$2', content: '', customIcon: '/Icons/executable_gear-0.png' }");
modified = modified.replace(/name: '([^']+)\.SYS', type: 'file', parentId: '([^']+)', content: '' \}/g, "name: '$1.SYS', type: 'file', parentId: '$2', content: '', customIcon: '/Icons/chip_ramdrive-2.png' }");
modified = modified.replace(/name: '([^']+)\.DLL', type: 'file', parentId: '([^']+)', content: '' \}/g, "name: '$1.DLL', type: 'file', parentId: '$2', content: '', customIcon: '/Icons/gears_3-0.png' }");
modified = modified.replace(/name: '([^']+)\.VXD', type: 'file', parentId: '([^']+)', content: '' \}/g, "name: '$1.VXD', type: 'file', parentId: '$2', content: '', customIcon: '/Icons/memory-1.png' }");
modified = modified.replace(/name: '([^']+)\.DRV', type: 'file', parentId: '([^']+)', content: '' \}/g, "name: '$1.DRV', type: 'file', parentId: '$2', content: '', customIcon: '/Icons/tools_gear-0.png' }");
modified = modified.replace(/name: '([^']+)\.LOG', type: 'file', parentId: '([^']+)', content: '' \}/g, "name: '$1.LOG', type: 'file', parentId: '$2', content: '', customIcon: '/Icons/notepad-2.png' }");


fs.writeFileSync(file, modified);
console.log("Updated useVFS.ts");
