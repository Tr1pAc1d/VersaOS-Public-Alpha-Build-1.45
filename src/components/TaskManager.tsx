import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Activity, Cpu, HardDrive, Zap, Power, RefreshCw } from 'lucide-react';
import { APP_DICTIONARY } from '../utils/appDictionary';

// ── Resource profiles per app ───────────────────────────────────────────────
const APP_RESOURCE_PROFILES: Record<string, { ramKB: number; cpuPercent: number; diskMB: number; publisher: string; startupImpact: 'Low' | 'Medium' | 'High' }> = {
  browser:        { ramKB: 8192,  cpuPercent: 12, diskMB: 24, publisher: 'Vespera Systems',  startupImpact: 'High' },
  workbench:      { ramKB: 4096,  cpuPercent: 6,  diskMB: 8,  publisher: 'AETHERIS Corp.',   startupImpact: 'Medium' },
  analyzer:       { ramKB: 3072,  cpuPercent: 8,  diskMB: 4,  publisher: 'AETHERIS Corp.',   startupImpact: 'Medium' },
  files:          { ramKB: 2048,  cpuPercent: 3,  diskMB: 2,  publisher: 'Vespera Systems',  startupImpact: 'Low' },
  chat:           { ramKB: 1536,  cpuPercent: 4,  diskMB: 2,  publisher: 'Vespera Systems',  startupImpact: 'Low' },
  control_panel:  { ramKB: 1024,  cpuPercent: 2,  diskMB: 1,  publisher: 'Vespera Systems',  startupImpact: 'Low' },
  xtype:          { ramKB: 2048,  cpuPercent: 5,  diskMB: 4,  publisher: 'Vespera Systems',  startupImpact: 'Medium' },
  netmon:         { ramKB: 3072,  cpuPercent: 7,  diskMB: 6,  publisher: 'AETHERIS Corp.',   startupImpact: 'High' },
  vstore:         { ramKB: 4096,  cpuPercent: 5,  diskMB: 12, publisher: 'Vespera Systems',  startupImpact: 'Medium' },
  vmail:          { ramKB: 2048,  cpuPercent: 3,  diskMB: 8,  publisher: 'VesperaNET Inc.',  startupImpact: 'Low' },
  media_player:   { ramKB: 3072,  cpuPercent: 8,  diskMB: 6,  publisher: 'Vespera Systems',  startupImpact: 'Medium' },
  retrotv:        { ramKB: 4096,  cpuPercent: 10, diskMB: 8,  publisher: 'Meridian Broadcasting',  startupImpact: 'High' },
  remote_desktop: { ramKB: 5120,  cpuPercent: 9,  diskMB: 10, publisher: 'Vespera Systems',  startupImpact: 'High' },
  rhid:           { ramKB: 2048,  cpuPercent: 6,  diskMB: 4,  publisher: 'RHID Security',    startupImpact: 'Medium' },
  defrag:         { ramKB: 1536,  cpuPercent: 4,  diskMB: 2,  publisher: 'Vespera Systems',  startupImpact: 'Low' },
  scandisk:       { ramKB: 1024,  cpuPercent: 3,  diskMB: 1,  publisher: 'Vespera Systems',  startupImpact: 'Low' },
  about:          { ramKB: 512,   cpuPercent: 1,  diskMB: 0,  publisher: 'Vespera Systems',  startupImpact: 'Low' },
  help:           { ramKB: 768,   cpuPercent: 1,  diskMB: 1,  publisher: 'Vespera Systems',  startupImpact: 'Low' },
  findfiles:      { ramKB: 1024,  cpuPercent: 3,  diskMB: 1,  publisher: 'Vespera Systems',  startupImpact: 'Low' },
  dialup:         { ramKB: 1536,  cpuPercent: 4,  diskMB: 2,  publisher: 'VesperaNET Inc.',  startupImpact: 'Low' },
  packman:        { ramKB: 2048,  cpuPercent: 6,  diskMB: 4,  publisher: 'Vespera Games',    startupImpact: 'Low' },
  leave_me_alone: { ramKB: 2048,  cpuPercent: 5,  diskMB: 4,  publisher: 'MarketJS',         startupImpact: 'Low' },
  axis_paint:     { ramKB: 3072,  cpuPercent: 5,  diskMB: 6,  publisher: 'Axis Innovations', startupImpact: 'Medium' },
  vsweeper:       { ramKB: 512,   cpuPercent: 1,  diskMB: 0,  publisher: 'Vespera Games',    startupImpact: 'Low' },
  versa_edit:     { ramKB: 768,   cpuPercent: 2,  diskMB: 1,  publisher: 'Vespera Systems',  startupImpact: 'Low' },
  welcome_tour:   { ramKB: 1024,  cpuPercent: 2,  diskMB: 1,  publisher: 'Vespera Systems',  startupImpact: 'Low' },
  task_manager:   { ramKB: 1024,  cpuPercent: 3,  diskMB: 1,  publisher: 'Vespera Systems',  startupImpact: 'Low' },
  aw_release_radar: { ramKB: 2048, cpuPercent: 4, diskMB: 4,  publisher: 'Atlantic Waves',   startupImpact: 'Low' },
};

const DEFAULT_PROFILE = { ramKB: 1024, cpuPercent: 2, diskMB: 1, publisher: 'Unknown', startupImpact: 'Low' as const };

// Startup-eligible apps
const STARTUP_ELIGIBLE_APPS = [
  'files', 'browser', 'workbench', 'analyzer', 'chat', 'control_panel',
  'xtype', 'vstore', 'media_player', 'vmail', 'netmon',
];

// System "processes" that are always running
const SYSTEM_PROCESSES = [
  { name: 'KERNEL.SYS',         pid: 0,  ramKB: 1024, cpu: 0.5 },
  { name: 'EXPLORER.EXE',       pid: 1,  ramKB: 2048, cpu: 1.0 },
  { name: 'SYSTEM',             pid: 4,  ramKB: 512,  cpu: 0.3 },
  { name: 'SHELL.DLL',          pid: 8,  ramKB: 768,  cpu: 0.2 },
  { name: 'GDI.DLL',            pid: 12, ramKB: 640,  cpu: 0.4 },
  { name: 'ADAPTIVE_SCHED.CFG', pid: 16, ramKB: 256,  cpu: 0.1 },
  { name: 'HAL.DLL',            pid: 20, ramKB: 384,  cpu: 0.2 },
  { name: 'MMSYSTEM.DLL',       pid: 24, ramKB: 512,  cpu: 0.3 },
];

const TOTAL_RAM_KB = 32768; // 32 MB
const TOTAL_DISK_MB = 1200; // 1.2 GB
const BASE_DISK_USED_MB = 420;

// ── Component ───────────────────────────────────────────────────────────────

interface TaskManagerProps {
  windows: { id: string; title: string; isOpen: boolean; isMinimized?: boolean; isMaximized?: boolean }[];
  onEndTask: (id: string) => void;
  onSwitchTo: (id: string) => void;
  vfs: any;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ windows, onEndTask, onSwitchTo, vfs }) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'performance' | 'startup'>('applications');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [cpuHistory, setCpuHistory] = useState<number[]>(() => Array(40).fill(3));
  const [tick, setTick] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Startup apps from VFS
  const startupApps: { appId: string; enabled: boolean }[] = vfs.displaySettings?.startupApps || [];

  // ── Open windows (excluding task_manager itself to avoid recursion) ───
  const openWindows = useMemo(() =>
    windows.filter(w => w.isOpen && w.id !== 'task_manager'),
    [windows]
  );

  // ── Calculate resource usage ──────────────────────────────────────────
  const { totalCpu, totalRam, totalDisk } = useMemo(() => {
    const baseCpu = SYSTEM_PROCESSES.reduce((sum, p) => sum + p.cpu, 0);
    const baseRam = SYSTEM_PROCESSES.reduce((sum, p) => sum + p.ramKB, 0);
    let appCpu = 0;
    let appRam = 0;
    let appDisk = 0;
    for (const win of openWindows) {
      const profile = APP_RESOURCE_PROFILES[win.id] || DEFAULT_PROFILE;
      appCpu += profile.cpuPercent;
      appRam += profile.ramKB;
      appDisk += profile.diskMB;
    }
    return {
      totalCpu: Math.min(100, baseCpu + appCpu),
      totalRam: baseRam + appRam + 1024, // +1024 for task_manager itself
      totalDisk: BASE_DISK_USED_MB + appDisk,
    };
  }, [openWindows]);

  // ── CPU history tick ──────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      setCpuHistory(prev => {
        // Add jitter
        const jitter = (Math.random() - 0.5) * 4;
        const newVal = Math.max(1, Math.min(100, totalCpu + jitter));
        return [...prev.slice(1), newVal];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [totalCpu]);

  // ── Draw CPU graph on canvas ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 'performance') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#003300';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (h / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const x = (w / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Line
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    cpuHistory.forEach((val, i) => {
      const x = (i / (cpuHistory.length - 1)) * w;
      const y = h - (val / 100) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill under the line
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 255, 0, 0.08)';
    ctx.fill();
  }, [cpuHistory, activeTab]);

  // ── Startup handlers ──────────────────────────────────────────────────
  const toggleStartupApp = (appId: string) => {
    const existing = startupApps.find(a => a.appId === appId);
    let newApps: { appId: string; enabled: boolean }[];
    if (existing) {
      newApps = startupApps.map(a => a.appId === appId ? { ...a, enabled: !a.enabled } : a);
    } else {
      newApps = [...startupApps, { appId, enabled: true }];
    }
    if (vfs.updateStartupApps) {
      vfs.updateStartupApps(newApps);
    }
  };

  const isStartupEnabled = (appId: string) => {
    return startupApps.find(a => a.appId === appId)?.enabled || false;
  };

  // ── Uptime calculation ────────────────────────────────────────────────
  const [uptime, setUptime] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => setUptime(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (s: number) => {
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ramUsedPct = Math.min(100, (totalRam / TOTAL_RAM_KB) * 100);
  const diskUsedPct = Math.min(100, (totalDisk / TOTAL_DISK_MB) * 100);

  // ── Tab Render ────────────────────────────────────────────────────────

  const tabs: { id: 'applications' | 'performance' | 'startup'; label: string }[] = [
    { id: 'applications', label: 'Applications' },
    { id: 'performance', label: 'Performance' },
    { id: 'startup', label: 'Startup' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] font-sans select-none text-black text-sm">
      {/* Tab Bar */}
      <div className="flex items-end px-2 pt-1 gap-0 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1 text-xs font-bold border-2 relative -mb-[2px] transition-none
              ${activeTab === tab.id
                ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800 border-b-[#c0c0c0] z-10'
                : 'bg-[#b0b0b0] border-t-white border-l-white border-r-gray-800 border-b-gray-800 text-gray-600 hover:text-black'
              }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="flex-1 border-b-2 border-gray-800 -mb-[2px]" />
      </div>

      {/* Tab Content */}
      <div className="flex-1 mx-2 mb-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 bg-[#c0c0c0] p-2 flex flex-col overflow-hidden">

        {/* ═══════════ APPLICATIONS TAB ═══════════ */}
        {activeTab === 'applications' && (
          <div className="flex flex-col h-full gap-2">
            <div className="text-xs font-bold text-gray-600 mb-1">Click a task, then click a button below.</div>
            {/* Process List */}
            <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-y-auto">
              {/* Header */}
              <div className="flex items-center bg-[#c0c0c0] border-b-2 border-b-gray-500 px-2 py-0.5 text-[11px] font-bold sticky top-0 z-10">
                <span className="flex-1">Task</span>
                <span className="w-24 text-center">Status</span>
                <span className="w-16 text-right">Mem Usage</span>
              </div>
              {openWindows.map(win => {
                const profile = APP_RESOURCE_PROFILES[win.id] || DEFAULT_PROFILE;
                const meta = APP_DICTIONARY[win.id] || APP_DICTIONARY['default'];
                return (
                  <div
                    key={win.id}
                    onClick={() => setSelectedApp(win.id)}
                    className={`flex items-center px-2 py-1 text-[11px] cursor-pointer border-b border-gray-200
                      ${selectedApp === win.id ? 'bg-[#000080] text-white' : 'hover:bg-gray-100'}`}
                  >
                    <span className="flex-1 flex items-center gap-2 truncate">
                      {meta.customIcon ? (
                        <img src={meta.customIcon} alt="icon" className={`w-[14px] h-[14px] pointer-events-none ${selectedApp === win.id ? '' : 'drop-shadow-sm'}`} style={{ imageRendering: 'pixelated' }} draggable={false} />
                      ) : (
                        <meta.icon size={14} className={selectedApp === win.id ? 'text-white' : meta.color} />
                      )}
                      {win.title}
                    </span>
                    <span className={`w-24 text-center ${selectedApp === win.id ? 'text-green-300' : 'text-green-700'}`}>
                      Running
                    </span>
                    <span className="w-16 text-right font-mono">
                      {Math.round(profile.ramKB / 1024 * 10) / 10} MB
                    </span>
                  </div>
                );
              })}
              {openWindows.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400 text-xs italic">No applications running.</div>
              )}
            </div>
            {/* Buttons */}
            <div className="flex gap-2 justify-end shrink-0">
              <button
                disabled={!selectedApp}
                onClick={() => { if (selectedApp) { onEndTask(selectedApp); setSelectedApp(null); } }}
                className="px-4 py-1 text-xs font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50"
              >
                End Task
              </button>
              <button
                disabled={!selectedApp}
                onClick={() => { if (selectedApp) { onSwitchTo(selectedApp); } }}
                className="px-4 py-1 text-xs font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50"
              >
                Switch To
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ PERFORMANCE TAB ═══════════ */}
        {activeTab === 'performance' && (
          <div className="flex flex-col h-full gap-2 overflow-y-auto">
            {/* CPU Section */}
            <div className="flex gap-2">
              {/* CPU Usage Graph */}
              <div className="flex-1">
                <div className="text-[10px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Cpu size={12} /> CPU Usage
                </div>
                <div className="bg-black border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1">
                  <canvas ref={canvasRef} width={200} height={90} className="w-full h-[90px]" />
                </div>
              </div>
              {/* CPU Usage Bar */}
              <div className="w-24 flex flex-col items-center">
                <div className="text-[10px] font-bold text-gray-700 mb-1">CPU</div>
                <div className="flex-1 w-full bg-black border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 flex items-end">
                  <div
                    className="w-full transition-all duration-500"
                    style={{ height: `${Math.max(2, totalCpu)}%`, backgroundColor: '#00FF00' }}
                  />
                </div>
                <div className="text-[10px] font-mono font-bold mt-1 text-center">{Math.round(totalCpu)}%</div>
              </div>
            </div>

            {/* RAM Section */}
            <div className="border-2 border-t-gray-400 border-l-gray-400 border-b-white border-r-white p-2">
              <div className="text-[10px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Activity size={12} /> Physical Memory (RAM)
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  {/* RAM progress bar */}
                  <div className="h-4 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-[1px]">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${ramUsedPct}%`,
                        backgroundColor: ramUsedPct > 85 ? '#cc0000' : ramUsedPct > 60 ? '#cccc00' : '#000080',
                      }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold w-20 text-right shrink-0">
                  {Math.round(totalRam / 1024)} / {TOTAL_RAM_KB / 1024} MB
                </span>
              </div>
              {/* RAM Details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-2 text-[10px] font-mono">
                <span>Total Physical:</span>  <span className="text-right">{(TOTAL_RAM_KB).toLocaleString()} KB</span>
                <span>Available:</span>       <span className="text-right">{Math.max(0, TOTAL_RAM_KB - totalRam).toLocaleString()} KB</span>
                <span>In Use:</span>          <span className="text-right">{totalRam.toLocaleString()} KB</span>
                <span>System Cache:</span>    <span className="text-right">{(SYSTEM_PROCESSES.reduce((s, p) => s + p.ramKB, 0)).toLocaleString()} KB</span>
                <span>Commit Charge:</span>   <span className="text-right">{(totalRam + 4096).toLocaleString()} KB</span>
              </div>
            </div>

            {/* HDD Section */}
            <div className="border-2 border-t-gray-400 border-l-gray-400 border-b-white border-r-white p-2">
              <div className="text-[10px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                <HardDrive size={12} /> Disk Usage (C:)
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-4 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-[1px]">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${diskUsedPct}%`,
                        backgroundColor: diskUsedPct > 85 ? '#cc0000' : '#000080',
                      }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold w-28 text-right shrink-0">
                  {totalDisk} / {TOTAL_DISK_MB} MB
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-2 text-[10px] font-mono">
                <span>Total Capacity:</span>  <span className="text-right">{TOTAL_DISK_MB.toLocaleString()} MB</span>
                <span>Used Space:</span>      <span className="text-right">{totalDisk.toLocaleString()} MB</span>
                <span>Free Space:</span>      <span className="text-right">{Math.max(0, TOTAL_DISK_MB - totalDisk).toLocaleString()} MB</span>
                <span>File System:</span>     <span className="text-right">FAT16</span>
              </div>
            </div>

            {/* Kernel Memory & Uptime */}
            <div className="flex gap-2">
              <div className="flex-1 border-2 border-t-gray-400 border-l-gray-400 border-b-white border-r-white p-2">
                <div className="text-[10px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Zap size={12} /> Kernel Memory
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] font-mono">
                  <span>Paged:</span>     <span className="text-right">{(2048 + openWindows.length * 128).toLocaleString()} KB</span>
                  <span>NonPaged:</span>  <span className="text-right">{(768 + openWindows.length * 64).toLocaleString()} KB</span>
                </div>
              </div>
              <div className="flex-1 border-2 border-t-gray-400 border-l-gray-400 border-b-white border-r-white p-2">
                <div className="text-[10px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Power size={12} /> System
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] font-mono">
                  <span>Processes:</span> <span className="text-right">{SYSTEM_PROCESSES.length + openWindows.length + 1}</span>
                  <span>Uptime:</span>    <span className="text-right">{formatUptime(uptime)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STARTUP TAB ═══════════ */}
        {activeTab === 'startup' && (
          <div className="flex flex-col h-full gap-2">
            <div className="text-xs font-bold text-gray-600 mb-1">
              Configure programs that launch automatically when Vespera OS starts.
            </div>
            {/* Startup List */}
            <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white overflow-y-auto">
              {/* Header */}
              <div className="flex items-center bg-[#c0c0c0] border-b-2 border-b-gray-500 px-2 py-0.5 text-[11px] font-bold sticky top-0 z-10">
                <span className="w-6 shrink-0"></span>
                <span className="flex-1">Name</span>
                <span className="w-28 text-center">Publisher</span>
                <span className="w-16 text-center">Status</span>
                <span className="w-20 text-center">Impact</span>
              </div>
              {STARTUP_ELIGIBLE_APPS.map(appId => {
                const meta = APP_DICTIONARY[appId] || APP_DICTIONARY['default'];
                const profile = APP_RESOURCE_PROFILES[appId] || DEFAULT_PROFILE;
                const enabled = isStartupEnabled(appId);
                return (
                  <div
                    key={appId}
                    className="flex items-center px-2 py-1.5 text-[11px] border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleStartupApp(appId)}
                  >
                    <span className="w-6 shrink-0 flex items-center justify-center">
                      <div className={`w-3.5 h-3.5 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white flex items-center justify-center`}>
                        {enabled && <span className="text-black text-[9px] font-bold leading-none">✓</span>}
                      </div>
                    </span>
                    <span className="flex-1 flex items-center gap-2 truncate">
                      {meta.customIcon ? (
                        <img src={meta.customIcon} alt="icon" className="w-[14px] h-[14px] pointer-events-none drop-shadow-sm" style={{ imageRendering: 'pixelated' }} draggable={false} />
                      ) : (
                        <meta.icon size={14} className={meta.color} />
                      )}
                      {meta.defaultTitle}
                    </span>
                    <span className="w-28 text-center text-gray-500 truncate">{profile.publisher}</span>
                    <span className={`w-16 text-center font-bold ${enabled ? 'text-green-700' : 'text-gray-400'}`}>
                      {enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className={`w-20 text-center font-mono text-[10px] ${
                      profile.startupImpact === 'High' ? 'text-red-600 font-bold' :
                      profile.startupImpact === 'Medium' ? 'text-yellow-700' : 'text-green-700'
                    }`}>
                      {profile.startupImpact}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Startup controls */}
            <div className="flex gap-2 justify-between items-center shrink-0">
              <span className="text-[10px] text-gray-500 italic">
                {startupApps.filter(a => a.enabled).length} program(s) enabled at startup
              </span>
              <button
                onClick={() => {
                  if (vfs.updateStartupApps) {
                    vfs.updateStartupApps([]);
                  }
                }}
                className="px-4 py-1 text-xs font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white flex items-center gap-1"
              >
                <RefreshCw size={12} /> Disable All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-6 px-2 py-1 bg-[#c0c0c0] border-t-2 border-t-white text-[10px] font-mono shrink-0">
        <span className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-0.5">
          Processes: {SYSTEM_PROCESSES.length + openWindows.length + 1}
        </span>
        <span className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-0.5">
          CPU Usage: {Math.round(totalCpu)}%
        </span>
        <span className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-0.5">
          Physical Memory: {Math.round(ramUsedPct)}% ({Math.round(totalRam / 1024)}MB / {TOTAL_RAM_KB / 1024}MB)
        </span>
      </div>
    </div>
  );
};
