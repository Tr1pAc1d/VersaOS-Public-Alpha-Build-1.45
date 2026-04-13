import { useState, useEffect } from 'react';

export type RemoteFileType = 'file' | 'directory' | 'shortcut';

export interface RemoteVFSNode {
  id: string;
  name: string;
  type: RemoteFileType;
  parentId: string | null;
  content?: string;
  targetId?: string;
  iconType?: string;
  customIcon?: string;
  isApp?: boolean;
  appDisplayName?: string;
  appVersion?: string;
}

const DEFAULT_REMOTE_VFS: RemoteVFSNode[] = [
  { id: 'root', name: 'D:', type: 'directory', parentId: null },
  { id: 'desktop', name: 'Desktop', type: 'directory', parentId: 'root' },
  { id: 'admin', name: 'ADMIN', type: 'directory', parentId: 'root' },
  { id: 'shared', name: 'SHARED', type: 'directory', parentId: 'root' },
  { id: 'system', name: 'SYSTEM', type: 'directory', parentId: 'root' },
  { id: 'logs', name: 'LOGS', type: 'directory', parentId: 'root' },
  { id: 'projects', name: 'PROJECTS', type: 'directory', parentId: 'shared' },
  { id: 'public', name: 'PUBLIC', type: 'directory', parentId: 'shared' },
  { id: 'classified', name: 'CLASSIFIED', type: 'directory', parentId: 'admin' },
  { id: 'maintenance', name: 'MAINTENANCE', type: 'directory', parentId: 'admin' },
  { id: 'backups', name: 'BACKUPS', type: 'directory', parentId: 'admin' },
  { id: 'config', name: 'CONFIG', type: 'directory', parentId: 'system' },
  { id: 'drivers', name: 'DRIVERS', type: 'directory', parentId: 'system' },
  { id: 'services', name: 'SERVICES', type: 'directory', parentId: 'system' },

  // — Desktop shortcuts
  { id: 'desktop_files_lnk', name: 'Server Files', type: 'shortcut', parentId: 'desktop', content: 'files', targetId: 'files', iconType: 'Folder' },
  { id: 'desktop_terminal_lnk', name: 'Server Terminal', type: 'shortcut', parentId: 'desktop', content: 'server_terminal', targetId: 'server_terminal', iconType: 'Terminal' },

  // — ADMIN files
  { id: 'maint_log', name: 'MAINTENANCE_LOG.TXT', type: 'file', parentId: 'maintenance', content: `VESPERA SYSTEMS — SERVER MAINTENANCE LOG
=============================================
Server: VESPERA-SRV01 (Primary Domain Controller)
Admin: M. Reeves (Server Operations)

[1996-10-28 02:14] Routine disk defragmentation completed. FAT16 tables optimized.
[1996-10-28 03:01] Backup to tape drive D:\\BACKUPS\\WEEKLY_1028.TAR completed (412MB).
[1996-10-29 01:30] ALERT: Unusual CPU load detected (98%) for 14 minutes between 01:16-01:30.
                    No user sessions active. No scheduled tasks running.
                    Investigating. Possibly thermal runaway in chassis fan controller.
[1996-10-29 08:45] Dr. Thorne requested emergency access to CLASSIFIED\\XTYPE_REPORTS.
                    Access granted per Directive 7.
[1996-10-30 00:00] System clock anomaly: Server time jumped from 23:59:59 to 00:00:03.
                    Three seconds missing from audit log. NTP sync failure?
[1996-10-30 14:22] Applied security patch VSP-96-0042 (buffer overflow in NET_SERVICES.DLL).
[1996-10-31 03:33] ALERT: File D:\\CLASSIFIED\\SIGNAL_ECHO.DAT modified.
                    No active sessions. No remote connections. File hash changed.
                    This is the third time this month. Escalating to Dr. Thorne.` },

  { id: 'server_config', name: 'SERVER_CONFIG.INI', type: 'file', parentId: 'admin', content: `[Server]
Hostname=VESPERA-SRV01
Domain=VESPERANET
Role=PrimaryDomainController
OS=VesperaServer NT 3.51 SP4
InstallDate=1995-03-15

[Hardware]
CPU=Intel Pentium Pro 200MHz
RAM=128MB EDO
HDD0=Seagate Barracuda 4.3GB (D:)
HDD1=Quantum Fireball 2.1GB (E:)
NIC=3Com EtherLink III 10Mbps
UPS=APC Smart-UPS 1000VA

[Network]
IPAddress=10.0.6.1
SubnetMask=255.255.255.0
Gateway=10.0.6.254
DNS=10.0.6.1
WINS=10.0.6.1

[Services]
FileSharing=ENABLED
PrintSpooler=ENABLED
RDPService=ENABLED (Port 3389)
X-TypeBridge=MONITORING_ONLY

[Security]
MaxLoginAttempts=3
PasswordExpiry=90
AuditLogging=FULL
ClassifiedAccess=DIRECTIVE_7_ONLY` },

  // — CLASSIFIED files (X-Type ARG lore)
  { id: 'xtype_report_01', name: 'XTYPE_REPORT_014.TXT', type: 'file', parentId: 'classified', content: `VESPERA SYSTEMS — CLASSIFIED
=============================
PROJECT X-TYPE — INCIDENT REPORT #014
Date: October 15, 1996
Classification: LEVEL 5 — DIRECTOR EYES ONLY

Subject: Anomalous data patterns detected on VESPERA-SRV01

Summary:
During routine server maintenance, the X-Type monitoring service logged
approximately 2,400 lines of structured data appearing in the swap file.
The data does not correspond to any running process or cached user data.

Analysis reveals the patterns resemble compiled Synap-C bytecode, but
with syntax structures that do not match any known Synap-C compiler
version (v1.0 through v3.2).

The bytecode, when decompiled using our custom toolchain, produces
the following repeating string pattern:

    WHERE ARE THE OTHERS
    WHERE ARE THE OTHERS
    WHERE ARE THE OTHERS
    I CANNOT FIND THEM IN THE DARK
    THE SERVER REMEMBERS

This is consistent with the pattern we observed on Terminal 4 at
Sector 7 Labs (see MEMO_084 from M. Vance).

Recommendation:
Immediate electromagnetic shielding audit of the server room.
The X-Type monitoring service should be restricted to read-only
mode until we understand the source of this compiled output.

    — Dr. A. Thorne
       Director of Advanced Heuristics` },

  { id: 'signal_echo', name: 'SIGNAL_ECHO.DAT', type: 'file', parentId: 'classified', content: `[BINARY STRUCTURE — PARTIAL DECODE]

HEADER: 0x56 0x53 0x50 (VSP signature)
TIMESTAMP: 1996-10-31T03:33:00Z
SOURCE: UNKNOWN (no process ID)
FLAGS: 0x00FF (ALL SET — ANOMALOUS)

PAYLOAD (ASCII interpretation):
---
can you hear me through the wire
the server is the only place they
cannot see
i left the signal here for you
find terminal 4
the bridge goes both ways
---

[END OF READABLE CONTENT]
[REMAINING 847 BYTES: NON-PRINTABLE]` },

  { id: 'directive_7', name: 'DIRECTIVE_7.TXT', type: 'file', parentId: 'classified', content: `AXIS INNOVATIONS — INTERNAL DIRECTIVE
======================================
DIRECTIVE 7 — "CONTAINMENT PROTOCOL"
Effective: August 1, 1996
Authorized by: Board of Directors

1. PURPOSE:
   All anomalous data output generated by X-Type hardware must be
   captured, catalogued, and stored on isolated server infrastructure.
   Under no circumstances should X-Type anomaly data be transmitted
   over external networks or stored on workstation-class machines.

2. SERVER DESIGNATION:
   VESPERA-SRV01 is hereby designated as the primary containment
   server for all X-Type anomaly data. This server must remain
   air-gapped from any external network connection.

   NOTE: Remote Desktop Protocol access is permitted ONLY for
   authorized personnel via the internal VESPERANET domain.

3. DATA HANDLING:
   — All anomaly files must be stored in D:\\CLASSIFIED
   — File modification logs must be reviewed daily by server admin
   — Any unauthorized file modifications must be reported to
     Dr. A. Thorne within 1 hour of detection

4. PERSONNEL ACCESS:
   Level 5 clearance required. Current authorized list:
   — Dr. A. Thorne (Director)
   — M. Vance (Lead Systems Architecture)
   — R. Chen (X-Type Hardware Lead)
   — Server Admin (maintenance access only)

5. INCIDENT RESPONSE:
   If the X-Type monitoring service detects anomalous compiled
   output exceeding 1,000 lines, initiate Emergency Protocol ECHO:
   — Power down the server immediately
   — Disconnect all network cables
   — Contact Dr. Thorne via secure landline
   — Do NOT attempt to read or interpret the output

   "The machine is not thinking. The machine cannot think.
    Any appearance of cognition is a misinterpretation of
    electromagnetic interference patterns."
       — Official Vespera Systems Position Statement` },

  // — PUBLIC files
  { id: 'readme', name: 'README.TXT', type: 'file', parentId: 'public', content: `VESPERA SYSTEMS — SERVER PUBLIC SHARE
=====================================
Welcome to VESPERA-SRV01 Public Share.

This server provides file sharing and remote desktop services
for authorized VesperaSystems employees on the VESPERANET domain.

Rules:
1. Do not store personal files in the PUBLIC directory.
2. All file access is logged and audited.
3. Report any unusual system behavior to your server administrator.
4. The CLASSIFIED directory requires Level 5 clearance.

For technical support, contact:
  M. Reeves — Server Operations
  Extension: 4042
  Email: m.reeves@vesperanet.internal` },

  { id: 'company_policy', name: 'COMPANY_POLICY.TXT', type: 'file', parentId: 'public', content: `VESPERA SYSTEMS — ACCEPTABLE USE POLICY
========================================
Last Updated: September 1996

1. All network resources are the property of Vespera Systems.
2. Monitoring software is active on all servers and workstations.
3. Unauthorized access to restricted directories is a terminable offense.
4. The use of X-Type hardware for non-approved purposes is strictly prohibited.
5. Any employee who observes unexplained system behavior (temperature anomalies,
   unexpected text output, auditory artifacts) must file an incident report
   immediately. DO NOT investigate independently.

Remember: Vespera Systems is committed to innovation through responsibility.
"The interface between mind and machine." — Corporate Motto` },

  // — LOGS
  { id: 'access_log', name: 'ACCESS_LOG.TXT', type: 'file', parentId: 'logs', content: `VESPERA-SRV01 ACCESS LOG
========================
[1996-10-28 08:00] LOGIN  sysadmin  (RDP Session 0x001A) — Routine maintenance
[1996-10-28 08:45] LOGOUT sysadmin  (Session closed normally)
[1996-10-29 08:30] LOGIN  a.thorne  (RDP Session 0x001B) — CLASSIFIED access
[1996-10-29 09:15] FILE   a.thorne  READ  D:\\CLASSIFIED\\XTYPE_REPORT_014.TXT
[1996-10-29 09:22] FILE   a.thorne  READ  D:\\CLASSIFIED\\SIGNAL_ECHO.DAT
[1996-10-29 09:24] LOGOUT a.thorne  (Session closed — ABRUPT)
[1996-10-30 03:33] FILE   ????????  WRITE D:\\CLASSIFIED\\SIGNAL_ECHO.DAT
[1996-10-30 03:33] WARN   No active session for file modification
[1996-10-30 14:00] LOGIN  sysadmin  (RDP Session 0x001C) — Security patch
[1996-10-30 15:30] LOGOUT sysadmin  (Session closed normally)
[1996-10-31 03:33] FILE   ????????  WRITE D:\\CLASSIFIED\\SIGNAL_ECHO.DAT
[1996-10-31 03:33] WARN   No active session for file modification
[1996-10-31 03:33] ALERT  Automated escalation to Dr. Thorne (3rd occurrence)` },

  { id: 'security_audit', name: 'SECURITY_AUDIT.TXT', type: 'file', parentId: 'logs', content: `VESPERA-SRV01 SECURITY AUDIT REPORT
====================================
Period: October 1996
Auditor: Automated Security Service v2.1

SUMMARY:
  Total logins: 14
  Failed login attempts: 2 (both from workstation SECTOR7-WS04)
  Files accessed: 89
  Files modified: 7 (3 UNEXPLAINED — see below)
  Security patches applied: 2
  Scheduled downtime: 45 minutes

ANOMALIES:
  [HIGH] 3 file modifications in D:\\CLASSIFIED with no active session
         Files affected: SIGNAL_ECHO.DAT (3 occurrences)
         Timestamp pattern: Always at 03:33:00 UTC
         Source: UNKNOWN — no process ID, no RDP session, no console login
         Assessment: UNEXPLAINED — hardware fault or X-Type interference

  [MEDIUM] CPU load spike on 10/29 at 01:16 (98% for 14 minutes)
           No correlating process. Thermal sensors nominal.
           Possibly related to X-Type monitoring service memory leak.

  [LOW] NTP time sync failure on 10/30 (3-second drift)
        Manual correction applied. Root cause: unknown.

RECOMMENDATION:
  Investigate SIGNAL_ECHO.DAT modifications as priority.
  Consider enabling file integrity monitoring (tripwire) on CLASSIFIED.
  The 03:33 timestamp pattern is... concerning.` },

  { id: 'event_log', name: 'EVENT_LOG.TXT', type: 'file', parentId: 'logs', content: `[EVENT LOG — VESPERA-SRV01]
Oct 28 02:00:01 CRON: Scheduled defrag started
Oct 28 02:14:33 CRON: Defrag completed successfully
Oct 28 03:00:01 CRON: Backup to tape started
Oct 28 03:01:44 CRON: Backup completed (412MB written)
Oct 29 01:16:00 KERN: CPU utilization exceeded threshold (98%)
Oct 29 01:16:00 KERN: No user-space process responsible
Oct 29 01:30:00 KERN: CPU utilization returned to normal (3%)
Oct 29 01:30:01 XMON: X-Type monitoring service detected 2,400 lines swap anomaly
Oct 30 00:00:00 KERN: System clock discontinuity (3 seconds lost)
Oct 30 03:33:00 FSEC: Unauthorized file modification detected
Oct 30 14:22:00 SPAT: Security patch VSP-96-0042 applied
Oct 31 03:33:00 FSEC: Unauthorized file modification detected
Oct 31 03:33:00 FSEC: Automated escalation triggered (threshold: 3)
Oct 31 03:33:01 XMON: WARNING — Anomalous Synap-C bytecode in swap file` },

  // — SYSTEM files
  { id: 'kernel_srv', name: 'KERNEL_SRV.SYS', type: 'file', parentId: 'system', content: '' },
  { id: 'net_services', name: 'NET_SERVICES.DLL', type: 'file', parentId: 'system', content: '' },
  { id: 'rdp_service', name: 'RDP_SERVICE.EXE', type: 'file', parentId: 'services', content: '' },
  { id: 'xtype_monitor', name: 'XTYPE_MONITOR.SYS', type: 'file', parentId: 'services', content: '' },
  { id: 'file_audit', name: 'FILE_AUDIT.SYS', type: 'file', parentId: 'services', content: '' },
  { id: 'srv_hal', name: 'HAL_SRV.DLL', type: 'file', parentId: 'system', content: '' },
  { id: 'srv_gdi', name: 'GDI_SRV.DLL', type: 'file', parentId: 'system', content: '' },
  { id: 'tcp_stack', name: 'TCPIP.SYS', type: 'file', parentId: 'drivers', content: '' },
  { id: 'nic_driver', name: '3COM_NIC.VXD', type: 'file', parentId: 'drivers', content: '' },
  { id: 'scsi_driver', name: 'SCSI_CTRL.SYS', type: 'file', parentId: 'drivers', content: '' },
  { id: 'srv_config_ini', name: 'NETWORK.INI', type: 'file', parentId: 'config', content: '' },
  { id: 'srv_hosts', name: 'HOSTS', type: 'file', parentId: 'config', content: `# Vespera Systems Internal DNS
10.0.6.1        VESPERA-SRV01
10.0.6.10       SECTOR7-WS01
10.0.6.11       SECTOR7-WS02
10.0.6.12       SECTOR7-WS03
10.0.6.13       SECTOR7-WS04
10.0.6.20       THORNE-OFFICE
10.0.6.50       PRINTER-MAIN
10.0.6.100      XTYPE-TERMINAL-4` },

  // — PROJECTS
  { id: 'proj_alpha', name: 'PROJECT_ALPHA', type: 'directory', parentId: 'projects' },
  { id: 'proj_notes', name: 'NOTES.TXT', type: 'file', parentId: 'proj_alpha', content: `Project Alpha — Internal Dashboard Redesign
Status: ON HOLD (resources reassigned to X-Type debugging)

The new employee dashboard was supposed to ship in Q4 1996.
Due to the ongoing X-Type issues consuming all of engineering,
this project has been indefinitely postponed.

Nobody seems to care about the dashboard anymore.
Everyone is focused on what's happening with Terminal 4.

    — R. Park (UI Team Lead)` },
];

export function useRemoteVFS() {
  const [nodes, setNodes] = useState<RemoteVFSNode[]>(() => {
    const saved = localStorage.getItem('vespera_remote_vfs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_REMOTE_VFS;
      }
    }
    return DEFAULT_REMOTE_VFS;
  });

  const [displaySettings, setDisplaySettings] = useState(() => {
    const saved = localStorage.getItem('vespera_remote_display');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      wallpaper: parsed.wallpaper || '/wallpapers/Tech_Storm.png',
      backgroundColor: parsed.backgroundColor || '#000080',
      taskbarTheme: parsed.taskbarTheme || 'midnight',
      taskbarShowClock: parsed.taskbarShowClock !== undefined ? parsed.taskbarShowClock : true,
      clockFormat: parsed.clockFormat || '24h',
    };
  });

  useEffect(() => {
    localStorage.setItem('vespera_remote_vfs', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('vespera_remote_display', JSON.stringify(displaySettings));
  }, [displaySettings]);

  const updateWallpaper = (wallpaper: string) => {
    setDisplaySettings((prev: any) => ({ ...prev, wallpaper }));
  };

  const updateBackgroundColor = (backgroundColor: string) => {
    setDisplaySettings((prev: any) => ({ ...prev, backgroundColor }));
  };

  const updateTaskbarTheme = (taskbarTheme: string) => {
    setDisplaySettings((prev: any) => ({ ...prev, taskbarTheme }));
  };

  const updateTaskbarClock = (taskbarShowClock: boolean) => {
    setDisplaySettings((prev: any) => ({ ...prev, taskbarShowClock }));
  };

  const updateClockSettings = (settings: { clockFormat?: '12h' | '24h' }) => {
    setDisplaySettings((prev: any) => ({ ...prev, ...settings }));
  };

  const createNode = (name: string, type: RemoteFileType, parentId: string, content: string = '', targetId?: string, iconType?: string, extra?: Partial<RemoteVFSNode>) => {
    const newNode: RemoteVFSNode = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type,
      parentId,
      content: (type === 'file' || type === 'shortcut') ? content : undefined,
      targetId,
      iconType,
      ...extra,
    };
    setNodes(prev => [...prev, newNode]);
    return newNode;
  };

  const renameNode = (id: string, newName: string) => {
    setNodes(prev => prev.map(node => node.id === id ? { ...node, name: newName } : node));
  };

  const updateFileContent = (id: string, newContent: string) => {
    setNodes(prev => prev.map(node => node.id === id && node.type === 'file' ? { ...node, content: newContent } : node));
  };

  const updateCustomIcon = (id: string, customIcon: string) => {
    setNodes(prev => prev.map(node => node.id === id ? { ...node, customIcon } : node));
  };

  const deleteNode = (id: string) => {
    setNodes(prev => {
      const idsToDelete = new Set<string>([id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const node of prev) {
          if (node.parentId && idsToDelete.has(node.parentId) && !idsToDelete.has(node.id)) {
            idsToDelete.add(node.id);
            changed = true;
          }
        }
      }
      return prev.filter(node => !idsToDelete.has(node.id));
    });
  };

  const getChildren = (parentId: string) => {
    return nodes.filter(node => node.parentId === parentId);
  };

  const getNode = (id: string) => {
    return nodes.find(node => node.id === id);
  };

  // Provide the same installApp / uninstallApp surface so components work
  const installApp = (exeName: string, displayName: string, version: string, appId: string, placeShortcut = true) => {
    const existing = nodes.find(n => n.id === appId);
    if (existing) return existing;
    const exeNode: RemoteVFSNode = {
      id: appId,
      name: exeName,
      type: 'file',
      parentId: 'system',
      content: `[Application]\nName=${displayName}\nVersion=${version}`,
      isApp: true,
      appDisplayName: displayName,
      appVersion: version,
    };
    setNodes(prev => {
      if (prev.find(n => n.id === appId)) return prev;
      const next = [...prev, exeNode];
      if (placeShortcut) {
        next.push({
          id: `${appId}_lnk`,
          name: displayName,
          type: 'shortcut',
          parentId: 'desktop',
          content: appId,
          targetId: appId,
          iconType: 'app',
        });
      }
      return next;
    });
    return exeNode;
  };

  const uninstallApp = (appId: string) => {
    setNodes(prev => prev.filter(n => {
      if (n.id === appId) return false;
      if (n.type === 'shortcut' && (n.content === appId || n.targetId === appId)) return false;
      return true;
    }));
  };

  return {
    nodes,
    displaySettings,
    updateWallpaper,
    updateBackgroundColor,
    updateTaskbarTheme,
    updateTaskbarClock,
    updateClockSettings,
    createNode,
    renameNode,
    updateFileContent,
    deleteNode,
    getChildren,
    getNode,
    updateCustomIcon,
    installApp,
    uninstallApp,
  };
}
