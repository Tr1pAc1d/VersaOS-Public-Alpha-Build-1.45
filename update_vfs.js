
const fs = require('fs');
const path = require('path');

const folders = [
  { id: 'v_config', name: 'CONFIG', type: 'directory', parentId: 'vespera' },
  { id: 'v_drivers', name: 'DRIVERS', type: 'directory', parentId: 'vespera' },
  { id: 'v_logs', name: 'LOG_ARCHIVE', type: 'directory', parentId: 'vespera' },
  { id: 'v_network', name: 'NETWORK', type: 'directory', parentId: 'vespera' },
  { id: 'v_sys_arch', name: 'ARCH', type: 'directory', parentId: 'system' },
  { id: 'v_sys_arch_i386', name: 'I386', type: 'directory', parentId: 'v_sys_arch' },
  { id: 'v_sys_com', name: 'COM', type: 'directory', parentId: 'system' },
  { id: 'v_sys_crit', name: 'CRITICAL', type: 'directory', parentId: 'system' },
  { id: 'v_sys_net', name: 'NET', type: 'directory', parentId: 'system' },
  { id: 'v_temp', name: 'TEMP', type: 'directory', parentId: 'vespera' },
  { id: 'v_spool', name: 'SPOOL', type: 'directory', parentId: 'vespera' },
  { id: 'v_media', name: 'MEDIA', type: 'directory', parentId: 'vespera' },
  { id: 'v_fonts', name: 'FONTS', type: 'directory', parentId: 'vespera' },
  { id: 'v_bin', name: 'BIN', type: 'directory', parentId: 'vespera' },
  { id: 'v_etc', name: 'ETC', type: 'directory', parentId: 'vespera' },
  { id: 'v_lib', name: 'LIB', type: 'directory', parentId: 'vespera' },
  { id: 'v_inc', name: 'INCLUDE', type: 'directory', parentId: 'vespera' },
  { id: 'v_src', name: 'SRC', type: 'directory', parentId: 'vespera' },
  { id: 'v_sys_net_conf', name: 'CONF', type: 'directory', parentId: 'v_sys_net' },
  { id: 'v_sys_net_serv', name: 'SERV', type: 'directory', parentId: 'v_sys_net' }
];

const driveFiles = ['VSP_IDE.SYS', 'MODEM_96.DLL', 'SOUND_BL.VXD', 'DISPLAY.DRV', 'KEYBOARD.DRV', 'MOUSE.SYS', 'CDROM.SYS', 'VGA_LIB.DLL', 'S3_DRV.SYS', 'NE2000.VXD'];
const configFiles = ['DRIVERS.INI', 'NET.CFG', 'BOOT.LOG', 'SYSTEM.INI', 'PROTOCOL.INI', 'WIN.INI', 'CONFIG.SYS', 'AUTOEXEC.BAT', 'MOUSE.INI', 'NETWORK.INF'];
const systemFiles = ['HAL.DLL', 'MotifLib.DLL', 'GDI.DLL', 'MMSYSTEM.DLL', 'USER.DLL', 'SHELL.DLL', 'COMMDLG.DLL', 'OLEDLG.DLL', 'LZEXPAND.DLL', 'VER.DLL', 'NEURAL_BRIDGE.DLL', 'SYNAPTIC_MEM.SYS', 'ADAPTIVE_SCHEDULER.CFG'];
const logFiles = ['INSTALL.LOG', 'X_TYPE_ANOMALIES.LOG', 'MEMORY_DUMP.LOG', 'SCHEDULER.LOG', 'ERROR.LOG', 'REBOOT.LOG', 'ACCESS.LOG'];
const netFiles = ['TCPIP.DLL', 'WINSOCK.VXD', 'NETBIOS.SYS', 'SNMP.DLL', 'DHCP.SYS', 'TELNET.EXE', 'FTP.EXE', 'PING.EXE'];

const files = [];
driveFiles.forEach(f => files.push({ id: `f_${f.toLowerCase().replace('.', '_')}`, name: f, type: 'file', parentId: 'v_drivers', content: '' }));
configFiles.forEach(f => files.push({ id: `f_${f.toLowerCase().replace('.', '_')}`, name: f, type: 'file', parentId: 'v_config', content: '' }));
systemFiles.forEach(f => files.push({ id: `f_${f.toLowerCase().replace('.', '_')}`, name: f, type: 'file', parentId: 'system', content: '' }));
logFiles.forEach(f => files.push({ id: `f_${f.toLowerCase().replace('.', '_')}`, name: f, type: 'file', parentId: 'v_logs', content: '' }));
netFiles.forEach(f => files.push({ id: `f_${f.toLowerCase().replace('.', '_')}`, name: f, type: 'file', parentId: 'v_network', content: '' }));

const extensions = ['DLL', 'SYS', 'CFG', 'INI', 'VXD', 'INF', 'LOG', 'BAT', 'COM', 'DRV'];
const foldersToFill = folders.map(f => f.id).concat(['system', 'vespera', 'v_config', 'v_drivers', 'v_logs', 'v_network']);
while (files.length < 210) {
  const ext = extensions[Math.floor(Math.random() * extensions.length)];
  const name = Math.random().toString(36).substr(2, 6).toUpperCase() + '.' + ext;
  const parentId = foldersToFill[Math.floor(Math.random() * foldersToFill.length)];
  const id = `extra_${files.length}`;
  if (!files.find(f => f.name === name && f.parentId === parentId)) {
    files.push({ id, name, type: 'file', parentId, content: '' });
  }
}

const newNodes = [...folders, ...files];
const nodesCode = newNodes.map(n => JSON.stringify(n)).join(',\n  ');

const vfsPath = path.join('d:', 'VersaOS-main', 'src', 'hooks', 'useVFS.ts');
let content = fs.readFileSync(vfsPath, 'utf8');

const searchStr = "{ id: 'sys_log_04', name: 'sys_log_04.txt', type: 'file', parentId: 'documents', content: \"Signal interference detected on Node 6.0.0.6. Do not attempt connection without X-Type Bridge active.\" },";
const replacement = searchStr + "\n  " + nodesCode + ",";

if (content.includes(searchStr)) {
  content = content.replace(searchStr, replacement);
  fs.writeFileSync(vfsPath, content);
  console.log('Successfully updated useVFS.ts');
} else {
  console.error('Could not find insertion point in useVFS.ts');
}
