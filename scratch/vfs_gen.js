
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

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
while (files.length < 220) {
  const ext = extensions[Math.floor(Math.random() * extensions.length)];
  let name = '';
  const len = Math.floor(Math.random() * 5) + 3;
  for (let i = 0; i < len; i++) name += chars[Math.floor(Math.random() * chars.length)];
  name += '.' + ext;
  const parentId = foldersToFill[Math.floor(Math.random() * foldersToFill.length)];
  const id = `extra_${files.length}`;
  if (!files.find(f => f.name === name && f.parentId === parentId)) {
    files.push({ id, name, type: 'file', parentId, content: '' });
  }
}

const allData = [...folders, ...files];
process.stdout.write(JSON.stringify(allData));
