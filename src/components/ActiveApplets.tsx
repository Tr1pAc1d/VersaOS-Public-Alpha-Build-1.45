import React, { useState, useEffect, useRef } from 'react';

// ── Definitions ─────────────────────────────────────────────────────────────
interface AppletConfig {
  enabled: boolean;
  position: 'dock_left' | 'dock_right' | 'float';
  borderStyle: 'raised' | 'sunken' | 'none';
  x?: number;
  y?: number;
}

interface ActiveAppletsProps {
  vfs: any;
  chromeTheme: any;
  desktopRef: React.RefObject<HTMLDivElement>;
}

interface WidgetProps {
  chromeTheme: any;
}

// ── Individual Applets ──────────────────────────────────────────────────────

const CpuMonitor = ({ chromeTheme }: WidgetProps) => {
  const [load, setLoad] = useState([10, 20, 50, 80, 40, 20]);
  useEffect(() => {
    const int = setInterval(() => {
      setLoad(prev => prev.map(() => Math.floor(Math.random() * 100)));
    }, 500);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex flex-col gap-1 w-32 items-center p-1" style={{ color: chromeTheme.headerBg }}>
      <div className="text-[9px] font-bold tracking-widest px-1 w-full text-center" style={{ borderBottom: `1px solid ${chromeTheme.headerBg}` }}>SYS-MON</div>
      <div className="flex items-end h-10 gap-1 w-full px-1">
        {load.map((val, i) => (
          <div key={i} className="flex-1" style={{ height: `${val}%`, backgroundColor: chromeTheme.headerBg, transition: 'height 0.2s' }} />
        ))}
      </div>
    </div>
  );
};

const Marquee = ({ chromeTheme }: WidgetProps) => {
  return (
    <div className="w-48 overflow-hidden whitespace-nowrap p-1 bg-black flex items-center h-6">
      <div 
        className="inline-block text-[10px] font-mono whitespace-nowrap font-bold"
        style={{ color: chromeTheme.headerBg, animation: 'marquee 10s linear infinite' }}
      >
        <span>{">>>"} VESPERA OS INITIALIZED... NETWORK SECURE... HEURISTICS NOMINAL... {">>>"}</span>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(200px); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

const Oscilloscope = ({ chromeTheme }: WidgetProps) => {
  return (
    <div className="w-32 h-12 bg-black flex items-center justify-center relative overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
        <path 
          className="waveform"
          d="M0,20 Q12.5,0 25,20 T50,20 T75,20 T100,20" 
          fill="none" 
          stroke={chromeTheme.headerBg} 
          strokeWidth="2" 
        />
      </svg>
      <style>{`
        @keyframes drawOsc {
          0% { stroke-dashoffset: 200; transform: translateX(0); }
          100% { stroke-dashoffset: 0; transform: translateX(-50%); }
        }
        .waveform {
          stroke-dasharray: 200;
          animation: drawOsc 1s infinite linear;
          width: 200%;
        }
      `}</style>
    </div>
  );
};

const Mascot = ({ chromeTheme }: WidgetProps) => {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const int = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="w-12 h-12 flex items-center justify-center bg-transparent">
      <svg width="32" height="32" viewBox="0 0 32 32" fill={chromeTheme.headerBg}>
        {/* Cat silhouette */}
        <path d="M4 8 L8 12 L12 12 L16 8 L16 16 L4 16 Z" />
        <path d="M4 16 L28 16 L28 24 L24 28 L8 28 L4 24 Z" />
        {/* Eyes */}
        {!blink && (
          <g fill={chromeTheme.bodyBg}>
            <rect x="8" y="16" width="4" height="4" />
            <rect x="20" y="16" width="4" height="4" />
          </g>
        )}
        {blink && (
           <g fill={chromeTheme.bodyBg}>
             <rect x="8" y="18" width="4" height="1" />
             <rect x="20" y="18" width="4" height="1" />
           </g>
        )}
        {/* Nose */}
        <rect x="15" y="20" width="2" height="2" fill={chromeTheme.bodyBg} />
      </svg>
    </div>
  );
};

const NetBlinker = ({ chromeTheme }: WidgetProps) => {
  const [tx, setTx] = useState(false);
  const [rx, setRx] = useState(false);
  
  useEffect(() => {
    const int = setInterval(() => {
      setTx(Math.random() > 0.7);
      setRx(Math.random() > 0.6);
    }, 200);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex gap-2 p-1" style={{ backgroundColor: chromeTheme.windowInactiveBg }}>
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full border border-black ${tx ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-red-900'}`} />
        <span className="text-[8px] font-bold" style={{ color: chromeTheme.windowInactiveText }}>TX</span>
      </div>
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full border border-black ${rx ? 'bg-green-500 shadow-[0_0_5px_green]' : 'bg-green-900'}`} />
        <span className="text-[8px] font-bold" style={{ color: chromeTheme.windowInactiveText }}>RX</span>
      </div>
    </div>
  );
};

const WorldClock = ({ chromeTheme }: WidgetProps) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const int = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="p-1 px-2 font-mono text-center shadow-inner" style={{ backgroundColor: '#000', color: chromeTheme.headerBg }}>
      <div className="text-[9px] opacity-70">LOCAL SYS TIME</div>
      <div className="text-xl font-bold tracking-widest">{time.toLocaleTimeString([], { hour12: false })}</div>
    </div>
  );
};

// ── Manager & Containers ────────────────────────────────────────────────────

export const WIDGET_COMPONENTS: Record<string, React.FC<WidgetProps>> = {
  applet_cpu: CpuMonitor,
  applet_marquee: Marquee,
  applet_osc: Oscilloscope,
  applet_mascot: Mascot,
  applet_blinker: NetBlinker,
  applet_clock: WorldClock
};

export const ActiveAppletsManager: React.FC<ActiveAppletsProps> = ({ vfs, chromeTheme, desktopRef }) => {
  const applets: Record<string, AppletConfig> = vfs.displaySettings?.activeApplets || {};

  const activeApplets = Object.entries(applets).filter(([_, config]) => config.enabled);

  if (activeApplets.length === 0) return null;

  const leftDocked = activeApplets.filter(([_, config]) => config.position === 'dock_left');
  const rightDocked = activeApplets.filter(([_, config]) => config.position === 'dock_right');
  const floating = activeApplets.filter(([_, config]) => config.position === 'float');

  const getBorderStyle = (style: string) => {
    if (style === 'raised') return { borderRight: `2px solid ${chromeTheme.borderDark}`, borderBottom: `2px solid ${chromeTheme.borderDark}`, borderLeft: `2px solid ${chromeTheme.borderLight}`, borderTop: `2px solid ${chromeTheme.borderLight}`, backgroundColor: chromeTheme.bodyBg };
    if (style === 'sunken') return { borderLeft: `2px solid ${chromeTheme.borderDark}`, borderTop: `2px solid ${chromeTheme.borderDark}`, borderRight: `2px solid ${chromeTheme.borderLight}`, borderBottom: `2px solid ${chromeTheme.borderLight}`, backgroundColor: chromeTheme.bodyBg };
    return { backgroundColor: 'transparent' };
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[8900]">
      {/* Floating */}
      {floating.map(([id, config]) => (
        <DraggableApplet key={id} id={id} config={config} vfs={vfs} chromeTheme={chromeTheme} desktopRef={desktopRef} getBorderStyle={getBorderStyle}>
          {WIDGET_COMPONENTS[id] ? React.createElement(WIDGET_COMPONENTS[id], { chromeTheme }) : null}
        </DraggableApplet>
      ))}
      
    </div>
  );
};

export const TaskbarAppletSlot: React.FC<{ vfs: any, chromeTheme: any, side: 'dock_left' | 'dock_right', collapsed?: boolean }> = ({ vfs, chromeTheme, side, collapsed }) => {
  const [hovered, setHovered] = useState(false);
  const applets: Record<string, AppletConfig> = vfs.displaySettings?.activeApplets || {};
  const activeApplets = Object.entries(applets).filter(([_, config]) => config.enabled && config.position === side);
  
  if (activeApplets.length === 0) return null;
  // Limit to 1 applet per side as requested by user
  const [id, config] = activeApplets[0];

  const getBorderStyle = (style: string) => {
    if (style === 'raised') return { borderRight: `2px solid ${chromeTheme.borderDark}`, borderBottom: `2px solid ${chromeTheme.borderDark}`, borderLeft: `2px solid ${chromeTheme.borderLight}`, borderTop: `2px solid ${chromeTheme.borderLight}`, backgroundColor: chromeTheme.bodyBg };
    if (style === 'sunken') return { borderLeft: `2px solid ${chromeTheme.borderDark}`, borderTop: `2px solid ${chromeTheme.borderDark}`, borderRight: `2px solid ${chromeTheme.borderLight}`, borderBottom: `2px solid ${chromeTheme.borderLight}`, backgroundColor: chromeTheme.bodyBg };
    return { backgroundColor: 'transparent' };
  };

  const Comp = WIDGET_COMPONENTS[id];
  if (!Comp) return null;

  if (collapsed) {
    return (
      <div 
        className="relative h-full flex items-center justify-center shrink-0 ml-auto"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button 
          className="h-full w-6 flex flex-col items-center justify-center gap-0.5 border-2 active:bg-gray-300"
          style={{ 
            backgroundColor: chromeTheme.bodyBg, 
            borderTopColor: chromeTheme.borderLight, borderLeftColor: chromeTheme.borderLight, 
            borderBottomColor: chromeTheme.borderDark, borderRightColor: chromeTheme.borderDark 
          }}
        >
          <div className="w-3 h-0.5" style={{ backgroundColor: chromeTheme.bodyText }} />
          <div className="w-3 h-0.5" style={{ backgroundColor: chromeTheme.bodyText }} />
          <div className="w-3 h-0.5" style={{ backgroundColor: chromeTheme.bodyText }} />
        </button>
        {hovered && (
          <div 
            className="absolute bottom-[calc(100%+4px)] right-0 p-1 flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.5)] z-[10000]" 
            style={getBorderStyle(config.borderStyle)}
          >
            <Comp chromeTheme={chromeTheme} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={getBorderStyle(config.borderStyle)} className="h-full flex items-center justify-center p-0.5 shrink-0 overflow-hidden relative">
      <Comp chromeTheme={chromeTheme} />
    </div>
  );
};

const DraggableApplet: React.FC<{ id: string, config: AppletConfig, vfs: any, chromeTheme: any, desktopRef: any, getBorderStyle: any, children: React.ReactNode }> = ({ id, config, vfs, chromeTheme, desktopRef, getBorderStyle, children }) => {
  const [pos, setPos] = useState({ x: config.x || 100, y: config.y || 100 });
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const scale = desktopRef.current ? desktopRef.current.getBoundingClientRect().width / desktopRef.current.offsetWidth : 1;
    offset.current = {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const desktopRect = desktopRef.current?.getBoundingClientRect();
    const scale = desktopRect ? desktopRect.width / desktopRef.current!.offsetWidth : 1;
    
    let newX = (e.clientX - (desktopRect?.left || 0)) / scale - offset.current.x;
    let newY = (e.clientY - (desktopRect?.top || 0)) / scale - offset.current.y;
    
    // Bounds check roughly
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    
    setPos({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      // Save position to VFS
      if (vfs.updateAppletSettings) {
        vfs.updateAppletSettings(id, { x: pos.x, y: pos.y });
      }
    }
  };

  return (
    <div 
      className="absolute pointer-events-auto cursor-move select-none"
      style={{
        left: pos.x,
        top: pos.y,
        ...getBorderStyle(config.borderStyle)
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="p-1 pointer-events-none">
        {children}
      </div>
    </div>
  );
};
