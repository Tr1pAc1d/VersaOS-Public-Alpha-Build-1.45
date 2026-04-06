import React, { useState, useEffect, useRef } from 'react';
import { RHIDIcon } from './RHIDSetupWizard';

interface RHIDTerminalProps {
  neuralBridgeActive: boolean;
}

const BOOT_BANNER = [
  "",
  "  RHID Terminal v4.03.22.1",
  "  Based on Red Hat Linux 3.0.3 (Picasso)",
  "  Kernel 2.0.36-rhid on an i486",
  "",
  "  Copyright (C) 1994-1996 Red Hat Software, Inc.",
  "  RHID modifications (C) 1996 Vespera Systems Corporation.",
  "  Licensed under GNU GPL v2. Type 'license' for details.",
  "",
  "  Type 'help' for a list of available commands.",
  "",
];

const FAKE_FS: Record<string, { type: 'dir' | 'file'; content?: string; children?: string[] }> = {
  '/': { type: 'dir', children: ['bin', 'etc', 'home', 'usr', 'var', 'tmp', 'dev', 'proc', 'boot'] },
  '/bin': { type: 'dir', children: ['bash', 'ls', 'cat', 'grep', 'sed', 'awk', 'cp', 'mv', 'rm', 'mkdir', 'rmdir', 'chmod', 'chown', 'ps', 'kill', 'ping', 'mount'] },
  '/etc': { type: 'dir', children: ['passwd', 'shadow', 'hosts', 'fstab', 'inittab', 'resolv.conf', 'sysconfig'] },
  '/etc/passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nthorne:x:1000:1000:Dr. A. Thorne:/home/thorne:/bin/bash\nnobody:x:65534:65534:Nobody:/nonexistent:/bin/false' },
  '/etc/hosts': { type: 'file', content: '127.0.0.1\tlocalhost\n10.0.0.1\tvespera.localdomain\tvespera\n6.0.0.6\taetheris-gateway' },
  '/etc/fstab': { type: 'file', content: '/dev/hda1\t/\text2\tdefaults\t1 1\n/dev/hda2\tswap\tswap\tdefaults\t0 0\nproc\t/proc\tproc\tdefaults\t0 0' },
  '/etc/resolv.conf': { type: 'file', content: 'nameserver 10.0.0.1\nsearch vespera.localdomain' },
  '/etc/inittab': { type: 'file', content: 'id:3:initdefault:\nsi::sysinit:/etc/rc.d/rc.sysinit\nl3:3:wait:/etc/rc.d/rc 3' },
  '/home': { type: 'dir', children: ['thorne'] },
  '/home/thorne': { type: 'dir', children: ['.bashrc', '.bash_history', 'notes.txt', 'workspace'] },
  '/home/thorne/.bashrc': { type: 'file', content: '# .bashrc\nexport PS1="[\\u@\\h \\W]\\$ "\nexport PATH=/usr/local/bin:/bin:/usr/bin\nalias ll="ls -la"\nalias cls="clear"' },
  '/home/thorne/.bash_history': { type: 'file', content: 'ls -la\ncat /etc/passwd\nping 6.0.0.6\ncd /home/thorne\nvi notes.txt\nuname -a\nps aux' },
  '/home/thorne/notes.txt': { type: 'file', content: 'Oct 15, 1996\n\nThe RHID subsystem is working but something is wrong with the kernel bridge.\nI keep seeing ghost processes in /proc that I did not start.\nPID 666 shows up intermittently. Owner: unknown.\n\nDo NOT scan node 6.0.0.6 through the RHID terminal.\nThe X-Type bridge responds differently through this subsystem.\n\n- Thorne' },
  '/home/thorne/workspace': { type: 'dir', children: ['project.c', 'Makefile', 'README'] },
  '/home/thorne/workspace/README': { type: 'file', content: 'RHID Terminal Project Files\n\nThis workspace contains experimental Synap-C / C hybrid code.\nDo not compile without X-Type shielding enabled.' },
  '/usr': { type: 'dir', children: ['bin', 'lib', 'share', 'local'] },
  '/var': { type: 'dir', children: ['log', 'spool', 'tmp'] },
  '/var/log': { type: 'dir', children: ['messages', 'secure', 'dmesg'] },
  '/var/log/messages': { type: 'file', content: 'Oct 14 03:22:01 vespera kernel: EXT2-fs: mounted filesystem with ordered data mode.\nOct 14 03:22:01 vespera init: Entering runlevel: 3\nOct 14 03:22:04 vespera kernel: WARNING: Anomalous IRQ 15 activity detected.\nOct 14 03:22:05 vespera kernel: X-Type bridge: analog frequency spike on bus 0x03C0.\nOct 14 03:22:05 vespera kernel: Non-euclidean memory map loaded at 0xDEAD0000.' },
  '/tmp': { type: 'dir', children: [] },
  '/dev': { type: 'dir', children: ['hda', 'hda1', 'hda2', 'tty0', 'tty1', 'null', 'zero', 'random', 'console'] },
  '/proc': { type: 'dir', children: ['1', '2', '3', 'cpuinfo', 'meminfo', 'version', 'uptime'] },
  '/proc/cpuinfo': { type: 'file', content: 'processor\t: 0\nvendor_id\t: GenuineIntel\ncpu family\t: 4\nmodel\t\t: 3\nmodel name\t: Intel 486 DX/4\nstepping\t: 0\ncpu MHz\t\t: 50.000\nbogomips\t: 10.24' },
  '/proc/meminfo': { type: 'file', content: '        total:    used:    free:  shared: buffers:  cached:\nMem:  33554432 28311552  5242880  2097152  4194304  8388608\nSwap:  8388608        0  8388608\nMemTotal:     32768 kB\nMemFree:       5120 kB\nMemShared:     2048 kB\nBuffers:       4096 kB\nCached:        8192 kB' },
  '/proc/version': { type: 'file', content: 'Linux version 2.0.36-rhid (root@vespera) (gcc version 2.7.2.3) #1 SMP Tue Oct 14 03:22:01 EDT 1996' },
  '/proc/uptime': { type: 'file', content: '8142.56 7891.23' },
  '/boot': { type: 'dir', children: ['vmlinuz-2.0.36', 'initrd.img', 'System.map'] },
};

const CREEPY_RESPONSES = [
  "bash: command not found... but something else was.",
  "I/O error: device at 0xDEAD0000 is LISTENING.",
  "Permission denied. THEY do not want you here.",
  "Segmentation fault (consciousness dumped)",
  "bash: fork: cannot allocate memory for the FORGOTTEN",
  "WARNING: /proc/666 appeared. Owner: UNKNOWN. PID: 666.",
  "ERROR: read() returned data that was never written."
];

export const RHIDTerminal: React.FC<RHIDTerminalProps> = ({ neuralBridgeActive }) => {
  const [history, setHistory] = useState<string[]>([...BOOT_BANNER]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/home/thorne');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdIndex, setCmdIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getPromptDir = () => {
    if (cwd === '/home/thorne') return '~';
    if (cwd.startsWith('/home/thorne/')) return '~' + cwd.slice('/home/thorne'.length);
    return cwd;
  };

  const prompt = `[thorne@vespera ${getPromptDir()}]$ `;

  const resolvePath = (path: string): string => {
    if (path.startsWith('/')) return path;
    const parts = cwd.split('/').filter(Boolean);
    const pathParts = path.split('/');
    for (const p of pathParts) {
      if (p === '..') parts.pop();
      else if (p !== '.' && p !== '') parts.push(p);
    }
    return '/' + parts.join('/');
  };

  const processCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const lines: string[] = [`${prompt}${trimmed}`];
    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Neural bridge creepy chance
    if (neuralBridgeActive && Math.random() > 0.82 && command !== 'clear') {
      lines.push(CREEPY_RESPONSES[Math.floor(Math.random() * CREEPY_RESPONSES.length)]);
      setHistory(prev => [...prev, ...lines]);
      return;
    }

    switch (command) {
      case 'help':
        lines.push(
          "RHID Terminal v4.03.22.1 — Available Commands:",
          "",
          "  help          Show this help message",
          "  ls [dir]      List directory contents",
          "  cd [dir]      Change directory",
          "  pwd           Print working directory",
          "  cat <file>    Display file contents",
          "  uname [-a]    System information",
          "  whoami        Current user",
          "  hostname      System hostname",
          "  date          Current date/time",
          "  uptime        System uptime",
          "  free          Memory usage",
          "  df            Disk usage",
          "  ps [aux]      Process list",
          "  ping <host>   Ping a host",
          "  man <cmd>     Manual pages",
          "  echo <text>   Print text",
          "  clear         Clear screen",
          "  history       Command history",
          "  license       Display license info",
          "  exit          Close terminal",
          ""
        );
        break;

      case 'ls': {
        const target = args[0] ? resolvePath(args[0]) : cwd;
        const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
        const fsEntry = FAKE_FS[target];
        if (fsEntry && fsEntry.type === 'dir') {
          const children = fsEntry.children || [];
          const items = showAll ? ['.', '..', ...children] : children;
          if (longFormat) {
            lines.push(`total ${items.length * 4}`);
            items.forEach(item => {
              const fullPath = target === '/' ? `/${item}` : `${target}/${item}`;
              const child = FAKE_FS[fullPath];
              const isDir = child?.type === 'dir' || item === '.' || item === '..';
              const size = child?.content ? child.content.length : (isDir ? 4096 : 0);
              lines.push(`${isDir ? 'd' : '-'}rwxr-xr-x  1 thorne  thorne  ${String(size).padStart(6)}  Oct 14  1996  ${item}`);
            });
          } else {
            if (items.length > 0) lines.push(items.join('  '));
          }
        } else {
          lines.push(`ls: ${target}: No such file or directory`);
        }
        break;
      }

      case 'cd': {
        if (!args[0] || args[0] === '~') {
          setCwd('/home/thorne');
        } else {
          const target = resolvePath(args[0]);
          const fsEntry = FAKE_FS[target];
          if (fsEntry && fsEntry.type === 'dir') {
            setCwd(target);
          } else if (fsEntry) {
            lines.push(`bash: cd: ${args[0]}: Not a directory`);
          } else {
            lines.push(`bash: cd: ${args[0]}: No such file or directory`);
          }
        }
        break;
      }

      case 'pwd':
        lines.push(cwd);
        break;

      case 'cat': {
        if (!args[0]) {
          lines.push("cat: missing operand");
          break;
        }
        const target = resolvePath(args[0]);
        const fsEntry = FAKE_FS[target];
        if (fsEntry && fsEntry.type === 'file' && fsEntry.content) {
          lines.push(...fsEntry.content.split('\n'));
        } else if (fsEntry && fsEntry.type === 'dir') {
          lines.push(`cat: ${args[0]}: Is a directory`);
        } else {
          lines.push(`cat: ${args[0]}: No such file or directory`);
        }
        break;
      }

      case 'uname':
        if (args.includes('-a')) {
          lines.push("Linux vespera 2.0.36-rhid #1 SMP Tue Oct 14 03:22:01 EDT 1996 i486 unknown");
        } else if (args.includes('-r')) {
          lines.push("2.0.36-rhid");
        } else {
          lines.push("Linux");
        }
        break;

      case 'whoami':
        lines.push("thorne");
        break;

      case 'hostname':
        lines.push("vespera");
        break;

      case 'date':
        lines.push(new Date().toString());
        break;

      case 'uptime':
        lines.push(" " + new Date().toLocaleTimeString() + "  up 94 days,  3:22,  1 user,  load average: 0.12, 0.08, 0.04");
        break;

      case 'free':
        lines.push(
          "             total       used       free     shared    buffers     cached",
          "Mem:         32768      27648       5120       2048       4096       8192",
          "-/+ buffers/cache:      15360      17408",
          "Swap:         8192          0       8192"
        );
        break;

      case 'df':
        lines.push(
          "Filesystem         1024-blocks  Used Available Capacity Mounted on",
          "/dev/hda1            1228800  842752   386048     69%   /",
          "proc                       0       0        0      0%   /proc"
        );
        break;

      case 'ps': {
        const isAux = args.includes('aux') || args.includes('-aux');
        if (isAux) {
          lines.push(
            "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND",
            "root         1  0.0  0.1   1120   340 ?        S    03:22   0:04 init [3]",
            "root         2  0.0  0.0      0     0 ?        SW   03:22   0:00 [kflushd]",
            "root         3  0.0  0.0      0     0 ?        SW   03:22   0:00 [kswapd]",
            "root        54  0.0  0.1   1180   424 ?        S    03:22   0:01 syslogd -m 0",
            "root        63  0.0  0.1   1340   512 ?        S    03:22   0:00 crond",
            "thorne     141  0.0  0.2   2240   740 tty1     S    03:24   0:00 -bash",
            "thorne     218  0.0  0.1   1780   400 tty1     R    " + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + "   0:00 ps aux"
          );
          if (neuralBridgeActive) {
            lines.push("?????      666  99.9 66.6      ?     ? ?        ?    ??:??   ?:?? [REDACTED]");
          }
        } else {
          lines.push(
            "  PID TTY          TIME CMD",
            "  141 tty1     00:00:00 bash",
            "  219 tty1     00:00:00 ps"
          );
        }
        break;
      }

      case 'ping': {
        if (!args[0]) {
          lines.push("Usage: ping [-c count] host");
          break;
        }
        const host = args[args.length - 1];
        lines.push(`PING ${host} (${host}): 56 data bytes`);
        for (let i = 0; i < 4; i++) {
          const ms = (Math.random() * 40 + 5).toFixed(1);
          lines.push(`64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${ms} ms`);
        }
        lines.push("", `--- ${host} ping statistics ---`);
        lines.push("4 packets transmitted, 4 packets received, 0% packet loss");
        if (host === '6.0.0.6' && neuralBridgeActive) {
          lines.push("", "WARNING: ICMP response contained non-standard payload:");
          lines.push("0x0000: 57 45 20 41 52 45 20 48 45 52 45");
          lines.push('PAYLOAD_DECODE: "WE ARE HERE"');
        }
        break;
      }

      case 'echo':
        lines.push(args.join(' '));
        break;

      case 'man':
        if (!args[0]) {
          lines.push("What manual page do you want?");
        } else {
          lines.push(`${args[0].toUpperCase()}(1)          Red Hat Linux          ${args[0].toUpperCase()}(1)`, "");
          lines.push("NAME");
          lines.push(`       ${args[0]} - ${args[0] === 'ls' ? 'list directory contents' : args[0] === 'cat' ? 'concatenate and display files' : args[0] === 'cd' ? 'change directory' : args[0] === 'grep' ? 'search for patterns in files' : 'system command'}`);
          lines.push("", "SYNOPSIS");
          lines.push(`       ${args[0]} [options] [arguments]`);
          lines.push("", "DESCRIPTION");
          lines.push(`       This is a RHID system command provided as part of the GNU Core Utilities.`);
          lines.push(`       Part of Red Hat Linux 3.0.3 (RHID modified distribution).`);
          lines.push("", `RHID Terminal v4.03.22.1          October 1996          ${args[0].toUpperCase()}(1)`);
        }
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'history':
        cmdHistory.forEach((cmd, i) => {
          lines.push(`  ${String(i + 1).padStart(4)}  ${cmd}`);
        });
        break;

      case 'id':
        lines.push("uid=1000(thorne) gid=1000(thorne) groups=1000(thorne),10(wheel)");
        break;

      case 'license':
        lines.push(
          "RHID Terminal v4.03.22.1",
          "Copyright (C) 1994-1996 Red Hat Software, Inc.",
          "Portions Copyright (C) 1991-1996 Vespera Systems Corporation.",
          "",
          "This software is distributed under the GNU General Public License v2.",
          "Red Hat is a registered trademark of Red Hat Software, Inc.",
          "RHID is an independently modified distribution and is not affiliated",
          "with or endorsed by Red Hat Software, Inc.",
          ""
        );
        break;

      case 'exit':
        lines.push("logout");
        break;

      default:
        lines.push(`bash: ${command}: command not found`);
        break;
    }

    setHistory(prev => [...prev, ...lines]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processCommand(input);
      setCmdHistory(prev => [...prev, input]);
      setCmdIndex(-1);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIndex = cmdIndex === -1 ? cmdHistory.length - 1 : Math.max(0, cmdIndex - 1);
        setCmdIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdIndex !== -1) {
        const newIndex = cmdIndex + 1;
        if (newIndex >= cmdHistory.length) {
          setCmdIndex(-1);
          setInput('');
        } else {
          setCmdIndex(newIndex);
          setInput(cmdHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div
      className="h-full w-full bg-black font-mono text-sm text-[#00ff41] flex flex-col cursor-text select-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Title */}
      <div className="bg-[#8B0000] text-white px-2 py-0.5 text-xs font-bold flex items-center gap-2 shrink-0 border-b border-red-900">
        <svg width="12" height="12" viewBox="0 0 64 64" fill="none"><polygon points="32,4 60,32 32,60 4,32" fill="#CC0000" stroke="#8B0000" strokeWidth="2"/><text x="32" y="38" textAnchor="middle" fill="white" fontSize="18" fontFamily="monospace" fontWeight="bold">&gt;_</text></svg>
        <span>RHID Terminal v4.03.22.1 — thorne@vespera:~</span>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-2 pb-0"
      >
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all min-h-[1.1em] leading-tight">
            {line}
          </div>
        ))}
        {/* Input Line */}
        <div className="flex items-center whitespace-pre">
          <span>{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-[#00ff41] outline-none border-none font-mono text-sm caret-[#00ff41]"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
};
