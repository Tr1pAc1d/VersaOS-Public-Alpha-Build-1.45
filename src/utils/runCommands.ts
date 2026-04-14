/** Normalize first token of a Run dialog line (strip quotes, lower case). */
export function parseRunLine(line: string): { command: string; args: string } {
  const trimmed = line.trim();
  if (!trimmed) return { command: '', args: '' };
  if (trimmed.startsWith('"')) {
    const end = trimmed.indexOf('"', 1);
    if (end > 0) {
      const command = trimmed.slice(1, end).toLowerCase();
      const args = trimmed.slice(end + 1).trim();
      return { command, args };
    }
  }
  const parts = trimmed.split(/\s+/);
  const command = (parts[0] || '').toLowerCase().replace(/^"+|"+$/g, '');
  const args = parts.slice(1).join(' ').replace(/^"+|"+$/g, '');
  return { command, args };
}

/** Maps aliases → canonical window / app id (lowercase keys). */
export const RUN_COMMAND_ALIASES: Record<string, string> = {
  explorer: 'files',
  'explorer.exe': 'files',
  files: 'files',
  browser: 'browser',
  navigator: 'browser',
  'navigator.exe': 'browser',
  iexplore: 'browser',
  'iexplore.exe': 'browser',
  www: 'browser',
  cmd: 'workbench',
  command: 'workbench',
  workbench: 'workbench',
  'workbench.exe': 'workbench',
  control: 'control_panel',
  controlpanel: 'control_panel',
  'control.exe': 'control_panel',
  notepad: 'versa_edit',
  edit: 'versa_edit',
  'notepad.exe': 'versa_edit',
  versaedit: 'versa_edit',
  help: 'help',
  'help.exe': 'help',
  defrag: 'defrag',
  'defrag.exe': 'defrag',
  scandisk: 'scandisk',
  chkdsk: 'scandisk',
  'scandisk.exe': 'scandisk',
  dialup: 'dialup',
  net: 'dialup',
  mail: 'vmail',
  vmail: 'vmail',
  store: 'vstore',
  vstore: 'vstore',
  chat: 'chat',
  assistant: 'chat',
  analyzer: 'analyzer',
  monitor: 'netmon',
  netmon: 'netmon',
  rhid: 'rhid',
  telnet: 'rhid',
  xtype: 'xtype',
  about: 'about',
  msinfo: 'about',
  packman: 'packman',
  pacman: 'packman',
  mspaint: 'axis_paint',
  'mspaint.exe': 'axis_paint',
  paint: 'axis_paint',
  axis_paint: 'axis_paint',
  find: 'findfiles',
  findfiles: 'findfiles',
  mediaplayer: 'media_player',
  wmp: 'media_player',
  vma: 'media_player',
  'media_player.exe': 'media_player',
  taskmgr: 'task_manager',
  'taskmgr.exe': 'task_manager',
  taskmanager: 'task_manager',
  task_manager: 'task_manager',
};
