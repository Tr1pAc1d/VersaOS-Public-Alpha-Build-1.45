import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Cpu, ChevronRight, ChevronDown, Monitor, HardDrive, Keyboard, Mouse, Wifi, Volume2, Server, Disc, Printer, AlertTriangle, User, Shield, Activity, Zap, X, Search, FileText, Settings as SettingsIcon } from 'lucide-react';
import { OS_CONFIG } from '../constants/os';

// ── Device Manager Tree Data ──────────────────────────────────────────────────
interface DeviceNode {
  id: string;
  label: string;
  isCategory?: boolean;
  children?: DeviceNode[];
  warning?: boolean;
  driver?: string;
  irq?: string;
  io?: string;
  dma?: string;
  manufacturer?: string;
  status?: string;
}

const DEVICE_TREE: DeviceNode[] = [
  { id: 'cdrom', label: 'CDROM', isCategory: true, children: [
    { id: 'cd_atapi', label: 'ATAPI IDE CD-ROM (2x Speed)', driver: 'C:\\VESPERA\\DRIVERS\\CDROM.SYS', irq: '14', io: '0170-0177', manufacturer: 'Generic', status: 'This device is working properly.' },
  ]},
  { id: 'disk', label: 'Disk drives', isCategory: true, children: [
    { id: 'disk_quantum', label: 'QUANTUM FIREBALL ST 3.2GB', driver: 'C:\\VESPERA\\DRIVERS\\VSP_IDE.SYS', irq: '14', io: '01F0-01F7', manufacturer: 'Quantum Corp.', status: 'This device is working properly.' },
  ]},
  { id: 'display', label: 'Display adapters', isCategory: true, children: [
    { id: 'gpu_s3', label: 'S3 86C911 GUI Accelerator (1MB VRAM)', driver: 'C:\\VESPERA\\DRIVERS\\S3_DRV.SYS', irq: '11', io: '03C0-03DF', manufacturer: 'S3 Incorporated', status: 'This device is working properly.' },
  ]},
  { id: 'floppy_ctrl', label: 'Floppy disk controllers', isCategory: true, children: [
    { id: 'fdc', label: 'Standard Floppy Disk Controller', driver: 'C:\\VESPERA\\SYSTEM\\HAL.DLL', irq: '6', io: '03F0-03F7', dma: '2', manufacturer: 'Generic', status: 'This device is working properly.' },
  ]},
  { id: 'hdd_ctrl', label: 'Hard disk controllers', isCategory: true, children: [
    { id: 'ide_ctrl', label: 'Intel 82371SB PCI Bus Master IDE Controller', driver: 'C:\\VESPERA\\DRIVERS\\VSP_IDE.SYS', irq: '14', io: '01F0-01F7', manufacturer: 'Intel Corporation', status: 'This device is working properly.' },
  ]},
  { id: 'keyboard', label: 'Keyboard', isCategory: true, children: [
    { id: 'kb_std', label: 'Standard 101/102-Key Keyboard', driver: 'C:\\VESPERA\\DRIVERS\\KEYBOARD.DRV', irq: '1', io: '0060-0064', manufacturer: 'Generic', status: 'This device is working properly.' },
  ]},
  { id: 'modem', label: 'Modem', isCategory: true, children: [
    { id: 'modem_usr', label: 'US Robotics 28.8 Sportster Fax Modem', driver: 'C:\\VESPERA\\DRIVERS\\MODEM_96.DLL', irq: '3', io: '02F8-02FF', manufacturer: 'US Robotics', status: 'This device is working properly.' },
  ]},
  { id: 'monitor', label: 'Monitor', isCategory: true, children: [
    { id: 'mon_vga', label: 'Standard VGA/SVGA Color CRT (60Hz Interlaced)', driver: 'C:\\VESPERA\\DRIVERS\\DISPLAY.DRV', manufacturer: 'Generic', status: 'This device is working properly.' },
  ]},
  { id: 'mouse', label: 'Mouse', isCategory: true, children: [
    { id: 'mouse_ps2', label: 'PS/2 Compatible Mouse', driver: 'C:\\VESPERA\\DRIVERS\\MOUSE.SYS', irq: '12', io: '0060', manufacturer: 'Generic', status: 'This device is working properly.' },
  ]},
  { id: 'network', label: 'Network adapters', isCategory: true, children: [
    { id: 'nic_ne2k', label: 'NE2000 Compatible Ethernet Adapter', driver: 'C:\\VESPERA\\DRIVERS\\NE2000.VXD', irq: '10', io: '0300-031F', manufacturer: 'Novell/Eagle', status: 'This device is working properly.' },
  ]},
  { id: 'ports', label: 'Ports (COM & LPT)', isCategory: true, children: [
    { id: 'com1', label: 'Communications Port (COM1)', irq: '4', io: '03F8-03FF', manufacturer: 'Generic', status: 'This device is working properly.' },
    { id: 'lpt1', label: 'Printer Port (LPT1)', irq: '7', io: '0378-037F', manufacturer: 'Generic', status: 'This device is working properly.' },
  ]},
  { id: 'sound', label: 'Sound, video and game controllers', isCategory: true, children: [
    { id: 'sb16', label: 'Creative Labs Sound Blaster 16', driver: 'C:\\VESPERA\\DRIVERS\\SOUND_BL.VXD', irq: '5', io: '0220-022F', dma: '1', manufacturer: 'Creative Labs', status: 'This device is working properly.' },
    { id: 'echosoft', label: 'EchoSoft Acoustic Signal Processor (v2.1)', driver: 'C:\\VESPERA\\SYSTEM\\MMSYSTEM.DLL', irq: '9', manufacturer: 'EchoSoft (Vespera)', status: 'This device is working properly.' },
  ]},
  { id: 'sysdevices', label: 'System devices', isCategory: true, children: [
    { id: 'cpu', label: 'Intel i486DX Processor @ 50MHz', manufacturer: 'Intel Corporation', irq: '—', status: 'This device is working properly.' },
    { id: 'mobo', label: 'Vespera-X 486-VL System Board', manufacturer: 'Vespera Systems', status: 'This device is working properly.' },
    { id: 'dma_ctrl', label: 'DMA Controller', irq: '—', io: '0000-001F', dma: '4', manufacturer: 'Generic', status: 'This device is working properly.' },
    { id: 'pic', label: 'Programmable Interrupt Controller', irq: '2', io: '0020-003F', manufacturer: 'Generic', status: 'This device is working properly.' },
    { id: 'timer', label: 'System Timer', irq: '0', io: '0040-005F', manufacturer: 'Generic', status: 'This device is working properly.' },
    { id: 'rtc', label: 'System CMOS/Real-Time Clock', irq: '8', io: '0070-007F', manufacturer: 'Generic', status: 'This device is working properly.' },
  ]},
  { id: 'xtype', label: 'X-Type Co-Processors [EXPERIMENTAL]', isCategory: true, children: [
    { id: 'xtype_bridge', label: 'X-Type Neural Bridge v1.0', warning: true, driver: 'C:\\VESPERA\\SYSTEM\\NEURAL_BRIDGE.DLL', irq: '15', io: '0x0F4A-0x0F7F', manufacturer: 'Axis Innovations', status: 'WARNING: This device is operating outside normal parameters. Analog frequency anomalies detected on bus 0x03C0.' },
    { id: 'xtype_synapc', label: 'Synap-C Heuristic Compiler Module', warning: true, driver: 'C:\\VESPERA\\SYSTEM\\SYNAPTIC_MEM.SYS', manufacturer: 'Axis Innovations', status: 'CAUTION: Compiler is processing non-deterministic input streams. Memory mapping: NON-EUCLIDEAN.' },
  ]},
  { id: 'aetheris_net', label: 'AETHERIS Network Subsystem', isCategory: true, children: [
    { id: 'aeth_router', label: 'AETHERIS Backbone Router (Virtual)', driver: 'C:\\VESPERA\\SYSTEM\\HAL.DLL', manufacturer: 'Vespera Systems', status: 'This device is working properly.' },
    { id: 'aeth_sentinel', label: 'Sentinel Data Vault Encryption Engine', warning: true, driver: 'C:\\VESPERA\\SYSTEM\\COMMDLG.DLL', manufacturer: 'Sentinel Data Vaults (Vespera)', status: 'WARNING: Encryption engine is processing an unusually high volume of outbound packets to node 6.0.0.6.' },
  ]},
];

// ── Credits Data ──────────────────────────────────────────────────────────────
const CREDITS = [
  'Dr. Elias A. Thorne — Director of Advanced Heuristics',
  'Dr. M. Vance — Lead Systems Architecture',
  'Dr. K. Sato — Neural Interface Engineering',
  'J. Marlow — Heuristic Compiler Design (Synap-C)',
  'R. Chen — AETHERIS Kernel Development',
  'P. Volkov — Security & Sentinel Encryption',
  'T. Osei — GUI Framework & Motif Integration',
  'L. Reeves — Hardware QA & X-Type Shielding',
  'A. Navarro — Documentation & Internal Comms',
  'S. Park — EchoSoft Audio Integration',
  '',
  '— "The machine is more than the sum of its parts." —',
  '',
  '© 1991–1996 Vespera Systems Corporation.',
  'A subsidiary of Axis Innovations.',
];

// ── Hardware Profiles ─────────────────────────────────────────────────────────
const DEFAULT_PROFILES = [
  { id: 'original', name: 'Original Configuration', isCurrent: true },
  { id: 'safe', name: 'Safe Mode (VGA Only)', isCurrent: false },
  { id: 'diag', name: 'Diagnostic Mode (No X-Type)', isCurrent: false },
];

// ── Environment Variables ─────────────────────────────────────────────────────
const SYSTEM_ENV_VARS = [
  { name: 'PATH', value: 'C:\\VESPERA;C:\\VESPERA\\SYSTEM;C:\\VESPERA\\BIN' },
  { name: 'TEMP', value: 'C:\\VESPERA\\TEMP' },
  { name: 'COMSPEC', value: 'C:\\COMMAND.COM' },
  { name: 'AXIS_BRIDGE_ID', value: '0x0F4A3C21' },
  { name: 'AETHERIS_KERNEL', value: 'v4.2' },
  { name: 'SYNAPTIC_THRESHOLD', value: '0.847' },
  { name: 'WINDIR', value: 'C:\\VESPERA' },
  { name: 'OS', value: 'Vespera_OS' },
];

// ── Component ─────────────────────────────────────────────────────────────────
interface SystemPropertiesProps {
  onBack: () => void;
  vfs: any;
  currentUser?: string;
  neuralBridgeActive?: boolean;
  initialTab?: SysTab;
  initialDevice?: string | null;
}

type SysTab = 'General' | 'Devices' | 'Hardware' | 'Performance';
type DevicePropTab = 'General' | 'Driver' | 'Resources' | 'Settings';
type AdvDialog = null | 'startup' | 'virtual_memory' | 'env_vars' | 'sys_report';

export const SystemProperties: React.FC<SystemPropertiesProps> = ({ onBack, vfs, currentUser, neuralBridgeActive, initialTab, initialDevice }) => {
  const [tab, setTab] = useState<SysTab>(initialTab || 'General');

  // General tab
  const [clickCount, setClickCount] = useState(0);
  const [showCredits, setShowCredits] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  // Device Manager tab
  const [expanded, setExpanded] = useState<Set<string>>(new Set(DEVICE_TREE.map(c => c.id)));
  const [selectedDevice, setSelectedDevice] = useState<string | null>(initialDevice || null);
  const [showDeviceProps, setShowDeviceProps] = useState(false);
  const [devicePropTab, setDevicePropTab] = useState<DevicePropTab>('General');
  const [deviceConflicts, setDeviceConflicts] = useState<Record<string, boolean>>({});

  // ── Device IRQ Conflict Simulation ──────────────────────────────────────────
  useEffect(() => {
    // Collect all conflictable device IDs
    const conflictableIds: string[] = [];
    DEVICE_TREE.forEach(category => {
      category.children?.forEach(dev => {
        // Can conflict if it has an IRQ and isn't already a hardcoded warning
        if (!dev.warning && dev.irq && dev.irq !== '—') {
          conflictableIds.push(dev.id);
        }
      });
    });

    const intervalId = setInterval(() => {
      setDeviceConflicts(prev => {
        const next = { ...prev };
        // Randomly resolve existing conflicts
        Object.keys(next).forEach(id => {
          if (next[id] && Math.random() < 0.2) {
            next[id] = false;
          }
        });
        
        // Randomly create a new conflict (15% chance every 15s)
        if (Math.random() < 0.15) {
          const targetId = conflictableIds[Math.floor(Math.random() * conflictableIds.length)];
          if (targetId) next[targetId] = true;
        }
        return next;
      });
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [disabledDevices, setDisabledDevices] = useState<Set<string>>(new Set());
  const [uninstalledDevices, setUninstalledDevices] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [warningModal, setWarningModal] = useState<{ type: 'lore' | 'critical', id: string } | null>(null);

  // Driver updates
  const [updatedDrivers, setUpdatedDrivers] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('vespera_updated_drivers') || '{}'); } catch { return {}; }
  });
  useEffect(() => {
    localStorage.setItem('vespera_updated_drivers', JSON.stringify(updatedDrivers));
  }, [updatedDrivers]);
  const [updateWizard, setUpdateWizard] = useState<{ step: number, target: string } | null>(null);
  const [installProgress, setInstallProgress] = useState(0);
  const [rebootPrompt, setRebootPrompt] = useState(false);

  useEffect(() => {
    if (updateWizard?.step === 1) {
      const t = setTimeout(() => {
        setUpdateWizard(prev => prev ? { ...prev, step: 2 } : null);
      }, 1500);
      return () => clearTimeout(t);
    } else if (updateWizard?.step === 3) {
      if (installProgress < 100) {
        const t = setTimeout(() => {
          setInstallProgress(p => Math.min(100, p + (Math.random() * 4 + 1))); // Much slower: +1 to 5% every 400ms = ~12-15 seconds
        }, 400);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => {
          setUpdatedDrivers(d => ({ ...d, [updateWizard.target]: '4.1.2.114' }));
          import('../utils/audio').then(m => m.playInstallCompleteSound());
          setUpdateWizard(prev => prev ? { ...prev, step: 4 } : null);
        }, 1000);
        return () => clearTimeout(t);
      }
    }
  }, [updateWizard, installProgress]);

  // Performance tab
  const [advDialog, setAdvDialog] = useState<AdvDialog>(null);
  const shieldRef = useRef<number[]>(Array.from({ length: 30 }, () => 90 + Math.random() * 8));
  const loadRef = useRef<number[]>(Array.from({ length: 30 }, () => 8 + Math.random() * 12));
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const perfInterval = setInterval(() => {
      if (tab === 'Performance') {
        const bridgeActive = neuralBridgeActive;
        shieldRef.current = [...shieldRef.current.slice(1), bridgeActive ? 70 + Math.random() * 28 : 84 + Math.random() * 15];
        loadRef.current = [...loadRef.current.slice(1), bridgeActive ? 35 + Math.random() * 40 : 5 + Math.random() * 20];
        forceUpdate(n => n + 1);
      }
    }, 500);
    const timeInterval = setInterval(() => setUptimeSeconds(s => s + 1), 1000);
    return () => { clearInterval(perfInterval); clearInterval(timeInterval); };
  }, [tab, neuralBridgeActive]);

  // Credits auto-close
  useEffect(() => {
    if (!showCredits) return;
    const t = setTimeout(() => setShowCredits(false), 20000);
    return () => clearTimeout(t);
  }, [showCredits]);

  const handleOSClick = () => {
    const next = clickCount + 1;
    setClickCount(next);
    if (next >= 5) { setShowCredits(true); setClickCount(0); }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const findDevice = (id: string): DeviceNode | undefined => {
    for (const cat of DEVICE_TREE) {
      if (cat.id === id) return cat;
      for (const ch of cat.children || []) { if (ch.id === id) return ch; }
    }
    return undefined;
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDeviceAction = (action: string) => {
    const id = contextMenu?.id;
    if (!id) return;
    setContextMenu(null);
    
    if (action === 'properties') {
      setSelectedDevice(id);
      setShowDeviceProps(true);
      setDevicePropTab('General');
    } else if (action === 'disable') {
      const CRITICAL_DEVICES = ['cpu', 'mobo', 'dma_ctrl', 'pic', 'timer', 'rtc'];
      if (id.startsWith('xtype_') || id.startsWith('aeth_')) {
        import('../utils/audio').then(m => m.playAlertSound());
        setWarningModal({ type: 'lore', id });
      } else if (CRITICAL_DEVICES.includes(id)) {
        import('../utils/audio').then(m => m.playHarshErrorSound());
        setWarningModal({ type: 'critical', id });
      } else {
        setDisabledDevices(prev => new Set(prev).add(id));
      }
    } else if (action === 'enable') {
      setDisabledDevices(prev => { const n = new Set(prev); n.delete(id); return n; });
    } else if (action === 'uninstall') {
      const CRITICAL_DEVICES = ['cpu', 'mobo', 'dma_ctrl', 'pic', 'timer', 'rtc'];
      if (id.startsWith('xtype_') || id.startsWith('aeth_')) {
        setWarningModal({ type: 'lore', id });
      } else if (CRITICAL_DEVICES.includes(id)) {
        setWarningModal({ type: 'critical', id });
      } else {
        if (confirm('Are you sure you want to remove this device from your system?')) {
          setUninstalledDevices(prev => new Set(prev).add(id));
        }
      }
    } else if (action === 'scan') {
      setScanning(true);
      setTimeout(() => {
        setUninstalledDevices(new Set());
        setScanning(false);
      }, 2000);
    }
  };

  const playBeep = () => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const actx = new Ctx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.connect(gain);
      gain.connect(actx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(750, actx.currentTime);
      gain.gain.setValueAtTime(0.1, actx.currentTime);
      osc.start();
      setTimeout(() => {
        gain.gain.exponentialRampToValueAtTime(0.00001, actx.currentTime + 0.1);
        osc.stop(actx.currentTime + 0.1);
      }, 150);
    } catch(e) {}
  };

  const startDriverUpdate = (id: string) => {
    setShowDeviceProps(false);
    setUpdateWizard({ step: 1, target: id });
  };

  // ── Sparkline helper ────────────────────────────────────────────────────────
  const Sparkline = ({ data, color, label }: { data: number[]; color: string; label: string }) => {
    const h = 50, w = 200;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / 100) * h}`).join(' ');
    const fillPoints = `0,${h} ${points} ${w},${h}`;
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-bold">{label}</span>
        <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-black" style={{ width: w + 8, height: h + 8, padding: 4 }}>
          <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <polygon points={fillPoints} fill={color} opacity={0.25} />
            <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
          </svg>
        </div>
        <span className="text-[9px] text-gray-600 font-mono">{data[data.length - 1].toFixed(1)}%</span>
      </div>
    );
  };

  // ── Motif button helper ─────────────────────────────────────────────────────
  const Btn = ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button type="button" 
      onPointerDown={(e) => e.stopPropagation()} 
      onMouseDown={(e) => e.stopPropagation()}
      onClick={onClick} 
      disabled={disabled}
      className={`px-3 py-1 text-xs font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white bg-[#c0c0c0] disabled:opacity-50 disabled:cursor-not-allowed`}
    >{children}</button>
  );

  // ── Tab bar ─────────────────────────────────────────────────────────────────
  const TABS: SysTab[] = ['General', 'Devices', 'Hardware', 'Performance'];

  // ── General Tab ─────────────────────────────────────────────────────────────
  const renderGeneral = () => (
    <div className="flex flex-col gap-3 text-xs overflow-y-auto">
      {/* Logo & OS info */}
      <div className="flex gap-4 items-start border-b border-gray-400 pb-3">
        <div className="w-16 h-16 bg-[#000080] flex items-center justify-center shrink-0 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800">
          <div className="text-white text-center leading-none">
            <div className="text-[8px] font-bold tracking-widest">VESPERA</div>
            <div className="text-lg font-bold mt-0.5">V</div>
            <div className="text-[7px] tracking-wider">SYSTEMS</div>
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full">
          <span className="font-bold text-sm cursor-pointer hover:text-[#000080] inline-block" onClick={handleOSClick}>
            Vespera OS 1.0.4
          </span>
          <span className="text-gray-600">Build 19940322 (AETHERIS Kernel v4.2)</span>
          <span className="text-gray-500 text-[10px]">© 1991–1996 Vespera Systems Corporation</span>
          <div className="mt-1 flex justify-between items-center text-[10px]">
             <span>System Uptime:</span>
             <span className="font-mono bg-white border border-gray-400 px-1">{formatUptime(uptimeSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Registered to */}
      <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-[#000080] mb-1">Registered to:</p>
            <p>{currentUser || 'Administrator'}</p>
            <p>Vespera Systems, Inc.</p>
            <p className="text-gray-500 mt-1 text-[10px]">Product ID: 51873-OEM-0027649-84221</p>
          </div>
          <Btn disabled>Change Registration...</Btn>
        </div>
      </div>

      {/* Computer */}
      <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-2">
        <p className="font-bold text-[#000080] mb-1">Computer:</p>
        <p>{OS_CONFIG.BIOS.CPU}</p>
        <p className="text-red-700 font-bold">{OS_CONFIG.BIOS.CO_PROCESSOR}</p>
        <p>{OS_CONFIG.BIOS.RAM}</p>
        <div className="mt-2 text-[10px] text-gray-600 border-t border-gray-200 pt-1">
          File System: FAT16 | Disk: QUANTUM FIREBALL ST 3.2GB | Free Space: 386,048 KB
        </div>
      </div>

      <Btn onClick={() => setShowSupport(true)}>Support Information...</Btn>
    </div>
  );

  // ── Device Manager Tab ──────────────────────────────────────────────────────
  const renderDeviceManager = () => {
    let tree = DEVICE_TREE.map(cat => ({
      ...cat,
      children: cat.children ? cat.children.filter(dev => 
        !uninstalledDevices.has(dev.id) &&
        (searchQuery === '' || dev.label.toLowerCase().includes(searchQuery.toLowerCase()))
      ) : []
    })).filter(cat => cat.children.length > 0) as DeviceNode[];

    // If search is active but returns no children, check if category itself matches
    if (searchQuery !== '' && tree.length === 0) {
      tree = DEVICE_TREE.filter(cat => cat.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return (
      <div className="flex flex-col gap-2 overflow-hidden flex-1 min-h-0 relative">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Btn onClick={() => { if (selectedDevice && !selDev?.isCategory) { setShowDeviceProps(true); setDevicePropTab('General'); } }} disabled={!selectedDevice || selDev?.isCategory}>Properties</Btn>
            <Btn onClick={() => setExpanded(new Set(DEVICE_TREE.map(c => c.id)))}>Refresh</Btn>
            <Btn onClick={() => setAdvDialog('sys_report')}>System Summary</Btn>
          </div>
          <div className="bg-white border border-gray-400 flex items-center px-1">
            <Search size={12} className="text-gray-500 mr-1" />
            <input 
              type="text" 
              placeholder="Filter list..." 
              className="outline-none text-[10px] w-24"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {scanning && (
          <div className="absolute inset-0 z-50 bg-[#c0c0c0]/80 flex flex-col items-center justify-center -m-3">
            <SettingsIcon size={24} className="text-[#000080] animate-spin mb-2" />
            <span className="font-bold text-[#000080]">Scanning for plug and play hardware...</span>
          </div>
        )}

        <div 
          className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-y-auto text-xs min-h-0"
          onContextMenu={e => { e.preventDefault(); e.stopPropagation(); }}
          onClick={() => setContextMenu(null)}
        >
          {tree.map(cat => (
            <div key={cat.id}>
              <div
                className={`flex items-center gap-1 px-1 py-0.5 cursor-default ${selectedDevice === cat.id ? 'bg-[#000080] text-white' : 'hover:bg-blue-50'}`}
                onClick={() => { setSelectedDevice(cat.id); setContextMenu(null); }}
              >
                <button className="w-4 h-4 flex items-center justify-center shrink-0" onClick={e => { e.stopPropagation(); toggleExpand(cat.id); }}>
                  {expanded.has(cat.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                <Server size={12} className={selectedDevice === cat.id ? 'text-white' : 'text-yellow-600'} />
                <span className="font-bold truncate">{cat.label}</span>
              </div>
              {expanded.has(cat.id) && cat.children?.map(dev => {
                const isDisabled = disabledDevices.has(dev.id);
                return (
                  <div
                    key={dev.id}
                    className={`flex items-center gap-1 pl-8 pr-1 py-0.5 cursor-default ${selectedDevice === dev.id ? 'bg-[#000080] text-white' : 'hover:bg-blue-50'}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedDevice(dev.id); setContextMenu(null); }}
                    onDoubleClick={() => { setSelectedDevice(dev.id); setShowDeviceProps(true); setDevicePropTab('General'); }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedDevice(dev.id);
                      setContextMenu({ x: e.clientX, y: e.clientY, id: dev.id });
                    }}
                  >
                    {isDisabled ? (
                      <X size={12} className={selectedDevice === dev.id ? 'text-red-300' : 'text-red-500'} />
                    ) : (dev.warning || deviceConflicts[dev.id]) ? (
                      <AlertTriangle size={12} className={selectedDevice === dev.id ? 'text-yellow-300' : 'text-yellow-500'} />
                    ) : (
                      <Cpu size={12} className={selectedDevice === dev.id ? 'text-white' : 'text-gray-500'} />
                    )}
                    <span className={`truncate ${isDisabled ? 'text-gray-400 line-through' : ''}`}>{dev.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
          {tree.length === 0 && (
            <div className="p-4 text-gray-500 italic text-center">No devices matching scan found.</div>
          )}
        </div>

        {/* Custom Context Menu */}
        {contextMenu && (
          <div 
            className="fixed z-50 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-md py-1 min-w-[150px] text-xs text-black"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="px-3 py-1 hover:bg-[#000080] hover:text-white cursor-default" onClick={() => handleDeviceAction('properties')}>Properties</div>
            <div className="h-px bg-gray-400 my-1 mx-2"></div>
            {disabledDevices.has(contextMenu.id) ? (
              <div className="px-3 py-1 hover:bg-[#000080] hover:text-white cursor-default" onClick={() => handleDeviceAction('enable')}>Enable Device</div>
            ) : (
              <div className="px-3 py-1 hover:bg-[#000080] hover:text-white cursor-default" onClick={() => handleDeviceAction('disable')}>Disable</div>
            )}
            <div className="px-3 py-1 hover:bg-[#000080] hover:text-white cursor-default" onClick={() => handleDeviceAction('uninstall')}>Uninstall</div>
            <div className="h-px bg-gray-400 my-1 mx-2"></div>
            <div className="px-3 py-1 hover:bg-[#000080] hover:text-white cursor-default" onClick={() => handleDeviceAction('update')}>Update Driver Software...</div>
            <div className="px-3 py-1 hover:bg-[#000080] hover:text-white cursor-default" onClick={() => handleDeviceAction('scan')}>Scan for hardware changes</div>
          </div>
        )}
      </div>
    );
  };

  // ── Hardware Profiles Tab ───────────────────────────────────────────────────
  const renderHardwareProfiles = () => (
    <div className="flex flex-col gap-3 text-xs overflow-y-auto">
      <p className="text-gray-700">Hardware profiles provide a way for you to set up different hardware configurations.</p>
      <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-0 overflow-y-auto h-28">
        {DEFAULT_PROFILES.map(p => (
          <div key={p.id} className={`px-2 py-1.5 cursor-default border-b border-gray-200 ${p.isCurrent ? 'bg-[#000080] text-white font-bold' : 'hover:bg-blue-50'}`}>
            {p.name}{p.isCurrent ? ' (Current)' : ''}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Btn disabled>Copy...</Btn>
        <Btn disabled>Rename...</Btn>
        <Btn disabled>Delete</Btn>
      </div>
      <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-2">
        <p className="font-bold mb-2">When Vespera starts:</p>
        <label className="flex items-center gap-2 cursor-pointer mb-1">
          <input type="radio" name="hw_boot" defaultChecked /> Wait indefinitely to select a Hardware Profile.
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="hw_boot" /> Select the first profile after <span className="font-mono border border-gray-400 px-1 mx-1">30</span> seconds.
        </label>
      </div>
    </div>
  );

  // ── User Profiles Tab ───────────────────────────────────────────────────────
  const renderUserProfiles = () => {
    const users = vfs?.systemUsers || [];
    return (
      <div className="flex flex-col gap-3 text-xs overflow-y-auto">
        <p className="text-gray-700">User profiles allow multiple users to store desktop personalization settings on a single machine.</p>
        <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white overflow-y-auto">
          <div className="grid grid-cols-[1fr_60px_50px_80px] gap-0 border-b border-gray-300 bg-[#c0c0c0] font-bold px-2 py-1">
            <span>Name</span><span>Size</span><span>Type</span><span>Modified</span>
          </div>
          {users.map((u: any) => (
            <div key={u.id} className="grid grid-cols-[1fr_60px_50px_80px] gap-0 px-2 py-1 border-b border-gray-100 hover:bg-blue-50 cursor-default">
              <span className="flex items-center gap-1"><User size={12} className="text-gray-500" />{u.displayName}</span>
              <span className="text-gray-500">~48 KB</span>
              <span className="text-gray-500">Local</span>
              <span className="text-gray-500">10/14/1996</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Btn disabled>Change Type...</Btn>
          <Btn disabled>Delete</Btn>
          <Btn disabled>Copy To...</Btn>
        </div>
        <div className="border border-gray-400 bg-white p-2 text-[10px] text-gray-600">
          Desktop settings for this user are stored in: <span className="font-mono font-bold">C:\Users\{currentUser || 'admin'}</span>
        </div>
      </div>
    );
  };

  // ── Performance Tab ─────────────────────────────────────────────────────────
  const renderPerformance = () => (
    <div className="flex flex-col gap-3 text-xs overflow-y-auto">
      {/* Status bars */}
      <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-2 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 font-bold">Memory:</span>
          <div className="flex-1 h-3 bg-gray-200 border border-gray-400"><div className="h-full bg-[#000080]" style={{ width: '84%' }} /></div>
          <span className="text-[10px] text-gray-600 w-32 text-right">27,648 KB of 32,768 KB</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 font-bold">System Resources:</span>
          <div className="flex-1 h-3 bg-gray-200 border border-gray-400"><div className="h-full bg-[#008080]" style={{ width: '62%' }} /></div>
          <span className="text-[10px] text-gray-600 w-32 text-right">62% free</span>
        </div>
        <div className="flex justify-between text-[10px] text-gray-600 mt-1">
          <span>Disk Cache: <b>8,192 KB</b></span>
          <span>Swap File: <b>C:\VESPERA\TEMP\386SPART.PAR</b></span>
        </div>
      </div>

      {/* Sparklines */}
      <div className="flex gap-4 flex-wrap">
        <Sparkline data={shieldRef.current} color="#00ff41" label="X-Type EM Shielding (%)" />
        <Sparkline data={loadRef.current} color="#ff4444" label="Heuristic Processor Load (%)" />
      </div>

      {/* Advanced buttons */}
      <div className="border border-gray-400 p-2 flex flex-col gap-2">
        <span className="font-bold text-[#000080]">Advanced</span>
        <div className="flex gap-2 flex-wrap">
          <Btn onClick={() => setAdvDialog('startup')}>Startup and Recovery...</Btn>
          <Btn onClick={() => setAdvDialog('virtual_memory')}>Virtual Memory...</Btn>
          <Btn onClick={() => setAdvDialog('env_vars')}>Environment Variables...</Btn>
        </div>
      </div>
    </div>
  );

  // ── Sub-dialogs ─────────────────────────────────────────────────────────────
  const renderModal = (title: string, onClose: () => void, children: React.ReactNode) => (
    <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
      <div className="bg-[#c0c0c0] w-[380px] max-h-[90%] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[4px_4px_10px_rgba(0,0,0,0.5)] flex flex-col">
        <div className="bg-[#000080] text-white px-2 py-1 font-bold text-xs flex justify-between items-center shrink-0">
          <span>{title}</span>
          <button type="button" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onClick={onClose} className="w-4 h-4 bg-[#c0c0c0] text-black border border-t-white border-l-white border-b-black border-r-black flex items-center justify-center text-[10px] font-bold">×</button>
        </div>
        <div className="p-3 flex flex-col gap-3 text-xs overflow-y-auto">{children}</div>
        <div className="flex justify-end gap-2 p-2 border-t border-gray-400 shrink-0">
          <Btn onClick={onClose}>OK</Btn>
          <Btn onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );

  const selDev = selectedDevice ? findDevice(selectedDevice) : null;

  return (
    <div className="flex flex-col h-full p-3 gap-2 relative select-none">
      {/* Back bar */}
      <div className="flex items-center gap-2 border-b border-gray-500 pb-2 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold">
          <ArrowLeft size={12} /> Back
        </button>
        <div className="flex items-center gap-2">
          <Cpu size={20} className="text-[#000080]" />
          <span className="font-bold text-sm tracking-wide">System Properties</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b-2 border-white mt-1 relative z-10 px-1 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-2 py-1 text-[10px] font-bold border-2 border-b-0 rounded-t-sm whitespace-nowrap ${
              tab === t
                ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800 pb-2 -mb-0.5 z-20'
                : 'bg-gray-300 border-t-white border-l-white border-r-gray-800 mt-1 cursor-pointer'
            }`}
          >{t}</button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-3 bg-[#c0c0c0] flex flex-col relative z-0 -mt-2 overflow-hidden min-h-0">
        {tab === 'General' && renderGeneral()}
        {tab === 'Devices' && renderDeviceManager()}
        {tab === 'Hardware' && renderHardwareProfiles()}
        {tab === 'Performance' && renderPerformance()}
      </div>

      {/* ── Overlays ─────────────────────────────────────────────────────────── */}

      {/* Support Dialog */}
      {showSupport && renderModal('Vespera Systems Technical Support', () => setShowSupport(false),
        <>
          <div className="flex items-center gap-3 border-b border-gray-400 pb-2">
            <Shield size={28} className="text-[#000080] shrink-0" />
            <div>
              <p className="font-bold">Vespera Systems</p>
              <p className="text-[10px] text-gray-600">A subsidiary of Axis Innovations</p>
            </div>
          </div>
          <p><b>Technical Support Hotline:</b> 1-800-VESPERA</p>
          <p><b>BBS Dial-In:</b> (555) 0199-AETHERIS</p>
          <p><b>Internet:</b> http://www.vesperasystems.com/Support.html</p>
          <div className="bg-yellow-50 border border-yellow-300 p-2 text-[10px] mt-1">
            <b>NOTE:</b> X-Type hardware issues require Level 7 clearance. Contact Dr. Thorne directly.
          </div>
        </>
      )}

      {/* Credits Easter Egg */}
      {showCredits && (
        <div className="absolute inset-0 z-[99999] bg-[#000080] flex flex-col items-center justify-center cursor-pointer" onClick={() => setShowCredits(false)}>
          <div className="text-white text-center animate-bounce-slow">
            <p className="text-lg font-bold tracking-widest mb-4">AXIS INNOVATIONS</p>
            <p className="text-[10px] tracking-wider mb-6">— presents —</p>
          </div>
          <div className="overflow-hidden h-48 w-64">
            <div className="animate-[scrollUp_16s_linear_infinite] flex flex-col gap-2 text-white text-center text-[11px]">
              {CREDITS.map((c, i) => <p key={i} className={c === '' ? 'h-4' : ''}>{c}</p>)}
              <div className="h-48" />
              {CREDITS.map((c, i) => <p key={`r${i}`} className={c === '' ? 'h-4' : ''}>{c}</p>)}
            </div>
          </div>
          <p className="text-[9px] text-blue-300 mt-4 animate-pulse">Click anywhere to close</p>
          <style>{`@keyframes scrollUp { 0% { transform: translateY(100%); } 100% { transform: translateY(-100%); } }`}</style>
        </div>
      )}

      {/* Device Properties Dialog */}
      {showDeviceProps && selDev && !selDev.isCategory && renderModal(`${selDev.label} Properties`, () => setShowDeviceProps(false),
        <>
          <div className="flex gap-0.5 border-b-2 border-white relative z-10 -mx-3 -mt-3 px-2 pt-2" >
            {(['General', 'Driver', 'Resources'] as DevicePropTab[]).map(dt => (
              <button key={dt} onClick={() => setDevicePropTab(dt)}
                className={`px-2 py-1 text-[10px] font-bold border-2 border-b-0 rounded-t-sm ${
                  devicePropTab === dt ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800 pb-2 -mb-0.5 z-20' : 'bg-gray-300 border-t-white border-l-white border-r-gray-800 mt-0.5 cursor-pointer'
                }`}
              >{dt}</button>
            ))}
          </div>
          <div className="pt-2">
            {devicePropTab === 'General' && (() => {
              const hasWarning = selDev.warning || deviceConflicts[selDev.id];
              let statusMsg = selDev.status;
              if (deviceConflicts[selDev.id]) {
                statusMsg = "This device cannot find enough free resources that it can use. (Code 12)\n\nIf you want to use this device, you will need to disable one of the other devices on this system.";
              }
              return (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 border-b border-gray-400 pb-2">
                    {hasWarning ? <AlertTriangle size={20} className="text-yellow-500" /> : <Cpu size={20} className="text-[#000080]" />}
                    <span className="font-bold">{selDev.label}</span>
                  </div>
                  <p><b>Manufacturer:</b> {selDev.manufacturer || 'Unknown'}</p>
                  <p><b>Device type:</b> Hardware</p>
                  <div className={`p-2 border ${hasWarning ? 'border-yellow-400 bg-yellow-50' : 'border-green-400 bg-green-50'}`}>
                    <p className={hasWarning ? 'text-yellow-800' : 'text-green-800'}><b>Device status:</b></p>
                    <p className={`text-[10px] mt-1 whitespace-pre-wrap ${hasWarning ? 'text-yellow-700' : 'text-green-700'}`}>{statusMsg}</p>
                  </div>
                </div>
              );
            })()}
            {devicePropTab === 'Driver' && (() => {
              const UPDATABLE_DEVICES = ['gpu_s3', 'modem_usr', 'sb16', 'nic_ne2k'];
              const isUpdated = updatedDrivers[selDev.id];
              return (
                <div className="flex flex-col gap-2">
                  <p><b>Driver files:</b></p>
                  <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-2 font-mono text-[10px]">
                    {selDev.driver || 'N/A — No driver file'}
                  </div>
                  <p><b>Provider:</b> {selDev.manufacturer || 'Generic'}</p>
                  <p><b>Date:</b> {isUpdated ? '02/18/1998' : '10/14/1996'}</p>
                  <p><b>Version:</b> {isUpdated || '4.0.0.950'}</p>
                  <Btn onClick={() => startDriverUpdate(selDev.id)}>Update Driver...</Btn>
                </div>
              );
            })()}
            {devicePropTab === 'Resources' && (
              <div className="flex flex-col gap-2">
                <p className="font-bold text-[#000080]">Resource settings:</p>
                <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-2">
                  <table className="w-full text-[10px]">
                    <thead><tr className="border-b border-gray-300"><th className="text-left py-0.5">Resource</th><th className="text-left">Setting</th></tr></thead>
                    <tbody>
                      {selDev.irq && <tr className="border-b border-gray-100"><td className="py-0.5">Interrupt Request</td><td>IRQ {selDev.irq}</td></tr>}
                      {selDev.io && <tr className="border-b border-gray-100"><td className="py-0.5">Input/Output Range</td><td>{selDev.io}</td></tr>}
                      {selDev.dma && <tr><td className="py-0.5">Direct Memory Access</td><td>DMA {selDev.dma}</td></tr>}
                      {!selDev.irq && !selDev.io && !selDev.dma && <tr><td colSpan={2} className="py-1 text-gray-500 italic">No resources assigned.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-gray-600">Conflicting device list: <i>No conflicts.</i></p>
              </div>
            )}
            {devicePropTab === 'Settings' && (
              <div className="flex flex-col gap-2">
                <p className="font-bold text-[#000080]">Device-specific settings</p>
                <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-2 min-h-[140px]">
                  {selDev.id === 'sb16' ? (
                     <div className="flex flex-col items-center justify-center h-full gap-3">
                       <Volume2 size={32} className="text-gray-400" />
                       <p className="text-center text-[10px] text-gray-600">Test audio output capabilities for Sound Blaster 16.</p>
                       <Btn onClick={playBeep}>Play Test Beep</Btn>
                     </div>
                  ) : selDev.id === 'mon_vga' ? (
                     <div className="flex flex-col items-center justify-center h-full gap-3">
                       <Monitor size={32} className="text-gray-400" />
                       <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Enable high color (16-bit)</label>
                       <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Refresh rate: 60Hz</label>
                     </div>
                  ) : selDev.id.startsWith('xtype_') ? (
                     <div className="flex flex-col items-center justify-center h-full gap-3 text-red-800">
                       <Shield size={32} className="text-red-500" />
                       <p className="font-bold text-center">RESTRICTED SETTINGS</p>
                       <p className="text-[10px] text-center">Settings for X-Type Co-Processors require Axis Innovations Level 7 security clearance. Access denied.</p>
                     </div>
                  ) : (
                     <div className="flex items-center justify-center h-full text-gray-500 italic text-center text-[10px]">
                       No advanced settings available for this device.
                     </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* System Report Dialog */}
      {advDialog === 'sys_report' && renderModal('System Summary', () => setAdvDialog(null),
        <>
          <div className="flex items-center gap-3 border-b border-gray-400 pb-2">
            <Activity size={28} className="text-[#000080] shrink-0" />
            <div>
              <p className="font-bold text-sm">Vespera OS Diagnostics Report</p>
              <p className="text-[10px] text-gray-600">Generated: {new Date().toLocaleString()}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2 text-[10px]">
            <p><b>OS Version:</b> Vespera OS 1.0.4 (Build 19940322)</p>
            <p><b>Kernel Platform:</b> AETHERIS v4.2</p>
            <p><b>Installed Memory:</b> {OS_CONFIG.BIOS.RAM}</p>
            <p><b>CPU Architecture:</b> x86 (Intel i486DX / 50MHz)</p>
            <p><b>System Uptime:</b> {formatUptime(uptimeSeconds)}</p>
            <div className="mt-2 pt-2 border-t border-gray-300">
               <p className="font-bold text-[#000080] mb-1">Hardware Status Summary:</p>
               <p>Total Installed Devices: {DEVICE_TREE.reduce((acc, cat) => acc + (cat.children?.length || 0), 0)}</p>
               <p className="text-red-700">Disabled Devices: {disabledDevices.size}</p>
               <p className="text-yellow-700">Warnings Detected: {DEVICE_TREE.reduce((acc, cat) => acc + (cat.children?.filter(d => d.warning)?.length || 0), 0)}</p>
            </div>
            <div className="mt-2 bg-blue-50 border border-blue-200 p-2 italic">
              "Diagnostics indicate nominal core functionality. However, X-Type neural bridge parameters remain outside of Euclidean specification."
            </div>
          </div>
        </>
      )}

      {/* Startup and Recovery Dialog */}
      {advDialog === 'startup' && renderModal('Startup and Recovery', () => setAdvDialog(null),
        <>
          <p className="font-bold text-[#000080]">System startup</p>
          <p>Default operating system:</p>
          <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white px-2 py-1 font-mono text-[10px]">
            Vespera OS [Version 1.0.4]
          </div>
          <p>Show list for <span className="font-mono border border-gray-400 px-1">30</span> seconds.</p>
          <p className="font-bold text-[#000080] mt-2">System failure</p>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Write an event to the system log</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Send an administrative alert</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Automatically restart</label>
        </>
      )}

      {/* Driver Update Wizard Dialog */}
      {updateWizard && (
        <div className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-auto bg-black/10">
          <div className="bg-[#c0c0c0] w-[420px] border-2 border-t-white border-l-white border-b-black border-r-black shadow-lg flex flex-col">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-xs flex justify-between items-center shrink-0">
              <span>Update Device Driver Wizard</span>
              <button type="button" onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onClick={() => setUpdateWizard(null)} className="w-4 h-4 bg-[#c0c0c0] text-black border border-t-white border-l-white border-b-black border-r-black flex items-center justify-center text-[10px] font-bold">×</button>
            </div>
            
            <div className="p-3 flex flex-col min-h-[220px] text-xs">
              <div className="flex gap-4 h-full">
                <div className="w-24 bg-[#000080] shrink-0 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex items-center justify-center">
                   <SettingsIcon size={48} className="text-white/20" />
                </div>
                
                <div className="flex flex-col flex-1">
                  <p className="font-bold text-sm mb-3">Hardware Update Wizard</p>
                  
                  {updateWizard.step === 1 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-700">
                       <SettingsIcon size={24} className="animate-spin text-[#000080]" />
                       <p>Please wait while the wizard searches...</p>
                    </div>
                  )}

                  {updateWizard.step === 2 && (() => {
                    const canUpdate = ['gpu_s3', 'modem_usr', 'sb16', 'nic_ne2k'].includes(updateWizard.target) && !updatedDrivers[updateWizard.target];
                    return (
                      <div className="flex flex-col gap-2 flex-1">
                         <p>This wizard will help you install software for:</p>
                         <p className="font-bold mb-2">{findDevice(updateWizard.target)?.label}</p>
                         
                         {canUpdate ? (
                           <>
                             <p className="border border-gray-400 p-2 bg-white">A newer driver software package was found for this device on the Vespera default media.</p>
                             <div className="mt-auto pt-2 border-t border-gray-300">
                               <p className="text-[10px] text-gray-600">Click Next to continue.</p>
                             </div>
                           </>
                         ) : (
                           <>
                             <p className="border border-gray-400 p-2 bg-white">The best driver software for your device is already installed. Vespera OS has determined the driver software is up to date.</p>
                             <div className="mt-auto pt-2 border-t border-gray-300">
                               <p className="text-[10px] text-gray-600">Click Finish to close the wizard.</p>
                             </div>
                           </>
                         )}
                      </div>
                    );
                  })()}

                  {updateWizard.step === 3 && (() => {
                    const DRIVER_PHASES: Record<string, string[]> = {
                      gpu_s3: [
                        'Extracting S3_DRV.CAB...',
                        'Copying S3_DRV.DLL to C:\\VESPERA\\SYSTEM\\',
                        'Copying S3_VXD.VXD to C:\\VESPERA\\SYSTEM\\',
                        'Writing INF definitions...',
                        'Updating Registry: HKEY_LOCAL_MACHINE\\Enum\\PCI\\',
                        'Registering Display Adapter...',
                        'Finalizing installation...'
                      ],
                      modem_usr: [
                        'Extracting MDM_USR.CAB...',
                        'Copying MDMUSR.SYS to C:\\VESPERA\\SYSTEM\\',
                        'Copying UNIMODEM.VXD to C:\\VESPERA\\SYSTEM\\',
                        'Configuring COM ports...',
                        'Writing initialization string ATZ...',
                        'Updating Registry: HKEY_LOCAL_MACHINE\\Enum\\Root\\Modem\\',
                        'Finalizing installation...'
                      ],
                      sb16: [
                        'Extracting SB16SND.CAB...',
                        'Copying SB16SND.DRV to C:\\VESPERA\\SYSTEM\\',
                        'Copying MSMPU401.SYS to C:\\VESPERA\\SYSTEM\\',
                        'Configuring DMA 1 and IRQ 5...',
                        'Writing MIDI configurations...',
                        'Updating SYSTEM.INI [boot] drivers...',
                        'Finalizing installation...'
                      ],
                      nic_ne2k: [
                        'Extracting NE2000.CAB...',
                        'Copying NDI.DLL to C:\\VESPERA\\SYSTEM\\',
                        'Copying NE2K.VXD to C:\\VESPERA\\SYSTEM\\',
                        'Binding TCP/IP stack...',
                        'Configuring I/O Range 0300-031F...',
                        'Updating NDIS drivers...',
                        'Finalizing installation...'
                      ]
                    };
                    const phases = DRIVER_PHASES[updateWizard.target] || [
                      'Extracting generic drivers...',
                      'Copying driver files...',
                      'Updating registry...',
                      'Finalizing installation...'
                    ];
                    const currentPhase = phases[Math.min(phases.length - 1, Math.floor((installProgress / 100) * phases.length))];

                    return (
                      <div className="flex flex-col gap-2 flex-1 mt-4 relative">
                        <p>Installing driver software...</p>
                        <div className="border border-gray-400 p-1 bg-white flex items-center mb-1">
                          <Monitor size={16} className="text-[#000080] mr-2" />
                          <span className="truncate">{findDevice(updateWizard.target)?.label}</span>
                        </div>
                        
                        <p className="text-gray-500 italic truncate pl-1 absolute top-[55px] w-full">{currentPhase}</p>
                        
                        <div className="h-4 border border-gray-400 bg-white overflow-hidden mt-6">
                          <div className="h-full bg-[#000080]" style={{ width: `${installProgress}%` }} />
                        </div>
                      </div>
                    );
                  })()}

                  {updateWizard.step === 4 && (
                    <div className="flex flex-col gap-2 flex-1">
                      <p className="font-bold">Completing the Hardware Update Wizard</p>
                      <p>The wizard has finished installing the software for:</p>
                      <p className="font-bold">{findDevice(updateWizard.target)?.label}</p>
                      <div className="mt-auto pt-2 border-t border-gray-300">
                         <p className="text-[10px] text-gray-600">Click Finish to close the wizard.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-2 border-t border-gray-400 shrink-0 bg-[#c0c0c0]">
              {(updateWizard.step === 2) && (
                 <>
                   {['gpu_s3', 'modem_usr', 'sb16', 'nic_ne2k'].includes(updateWizard.target) && !updatedDrivers[updateWizard.target] ? (
                     <Btn onClick={() => { setInstallProgress(0); setUpdateWizard({ ...updateWizard, step: 3 }); }}>Next {'>'}</Btn>
                   ) : null}
                 </>
              )}
              {updateWizard.step === 2 || updateWizard.step === 4 ? (
                <Btn onClick={() => {
                  if (updateWizard.step === 4 && ['gpu_s3', 'mobo'].includes(updateWizard.target)) {
                    setRebootPrompt(true);
                  }
                  setUpdateWizard(null);
                }}>Finish</Btn>
              ) : updateWizard.step !== 3 ? (
                <Btn onClick={() => setUpdateWizard(null)}>Cancel</Btn>
              ) : (
                <Btn disabled>Cancel</Btn>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reboot Prompt */}
      {rebootPrompt && renderModal('System Settings Change', () => setRebootPrompt(false),
        <div className="flex gap-4">
          <Shield size={32} className="text-blue-700 shrink-0 mt-1" />
          <div className="flex flex-col gap-2">
            <p>You must restart your computer before the new hardware settings will take effect.</p>
            <p>Do you want to restart your computer now?</p>
            <div className="flex gap-2 mt-2">
               <Btn onClick={() => window.location.reload()}>Yes</Btn>
               <Btn onClick={() => setRebootPrompt(false)}>No</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Warning Dialogs */}
      {warningModal && renderModal(warningModal.type === 'lore' ? 'Hardware Constraint Violation' : 'System Device Error', () => setWarningModal(null),
        <>
          <div className="flex gap-3">
             <AlertTriangle size={36} className="text-red-600 shrink-0 mt-1" />
             <div className="flex flex-col gap-2">
               <p className="font-bold text-lg text-red-800">ACTION PREVENTED</p>
               <p className="text-xs">
                 The requested action (DISABLE) on the device '<span className="font-mono bg-white px-1 border">{findDevice(warningModal.id)?.label}</span>' has been blocked by the active AETHERIS Kernel policy.
               </p>
               {warningModal.type === 'lore' ? (
                 <p className="text-xs">
                   <b className="text-red-700">Reason:</b> This hardware component is integral to the containment and heuristic processing of the neural bridge. Halting its I/O operations will result in immediate catastrophic destabilization of the shielding matrix.
                 </p>
               ) : (
                 <p className="text-xs">
                   <b className="text-red-700">Reason:</b> This device is critical to basic computer operation. You cannot disable or uninstall core processsing components, memory managers, or interrupt controllers while Vespera OS is running.
                 </p>
               )}
               <p className="text-[10px] text-gray-600 border-t border-gray-400 pt-2 mt-2">
                 {warningModal.type === 'lore' ? <>Override code required. Reference security directive <b>AXIS-7A</b>.</> : <>Please restart your system in Diagnostic Mode to manage core devices.</>}
               </p>
             </div>
          </div>
        </>
      )}

      {/* Startup and Recovery Dialog */}
      {advDialog === 'startup' && renderModal('Startup and Recovery', () => setAdvDialog(null),
        <>
          <p className="font-bold text-[#000080]">System startup</p>
          <p>Default operating system:</p>
          <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white px-2 py-1 font-mono text-[10px]">
            Vespera OS [Version 1.0.4]
          </div>
          <p>Show list for <span className="font-mono border border-gray-400 px-1">30</span> seconds.</p>
          <p className="font-bold text-[#000080] mt-2">System failure</p>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Write an event to the system log</label>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Send an administrative alert</label>
          <p>Write debugging info to:</p>
          <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white px-2 py-1 font-mono text-[10px]">
            C:\VESPERA\MEMORY.DMP
          </div>
        </>
      )}

      {/* Virtual Memory Dialog */}
      {advDialog === 'virtual_memory' && renderModal('Virtual Memory', () => setAdvDialog(null),
        <>
          <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Let Vespera manage virtual memory settings. (Recommended)</label>
          <p className="font-bold text-[#000080]">Paging file:</p>
          <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-2">
            <p className="font-mono text-[10px]">C:\VESPERA\TEMP\386SPART.PAR</p>
            <div className="grid grid-cols-2 gap-1 mt-2 text-[10px]">
              <span>Initial size: <b>8,192 KB</b></span>
              <span>Maximum size: <b>16,384 KB</b></span>
            </div>
          </div>
          <p className="font-bold text-[#000080] mt-1">Drive space:</p>
          <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white px-2 py-1 font-mono text-[10px]">
            C: [QUANTUM FIREBALL] — 386,048 KB Free
          </div>
        </>
      )}

      {/* Environment Variables Dialog */}
      {advDialog === 'env_vars' && renderModal('Environment Variables', () => setAdvDialog(null),
        <>
          <p className="font-bold text-[#000080]">User variables for {currentUser || 'admin'}:</p>
          <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-0 h-12 overflow-y-auto">
            <div className="px-2 py-1 text-[10px] text-gray-500 italic">No user variables defined.</div>
          </div>
          <p className="font-bold text-[#000080] mt-1">System variables:</p>
          <div className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white p-0 overflow-y-auto" style={{ maxHeight: 140 }}>
            <table className="w-full text-[10px]">
              <thead><tr className="border-b border-gray-300 bg-[#c0c0c0]"><th className="text-left px-2 py-0.5">Variable</th><th className="text-left px-2">Value</th></tr></thead>
              <tbody>
                {SYSTEM_ENV_VARS.map(v => (
                  <tr key={v.name} className="border-b border-gray-100 hover:bg-blue-50">
                    <td className="px-2 py-0.5 font-mono font-bold">{v.name}</td>
                    <td className="px-2 py-0.5 font-mono">{v.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
