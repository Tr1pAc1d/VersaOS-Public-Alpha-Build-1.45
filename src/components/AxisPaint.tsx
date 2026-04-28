import React, { useCallback, useEffect, useRef, useState } from 'react';
import { VFSNode } from '../hooks/useVFS';
import { VersaSlideFilePicker } from './VersaSlideFilePicker';

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
type Tool =
  | 'freeselect' | 'select' | 'eraser' | 'fill' | 'picker' | 'zoom'
  | 'pencil' | 'brush' | 'airbrush' | 'text'
  | 'line' | 'curve' | 'rect' | 'polygon' | 'ellipse' | 'roundrect';

type FillMode = 'none' | 'both' | 'fill';

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
const IMAGE_EXT = /\.(png|jpg|jpeg|webp|bmp|gif)$/i;

// Classic MS Paint palette – 2 rows × 14 colours
const PALETTE: string[] = [
  // Row 1 (dark)
  '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
  '#808040','#004040','#003c7e','#004080','#400080','#804000',
  // Row 2 (light)
  '#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff',
  '#ffff80','#80ff80','#80ffff','#0080ff','#ff0080','#ff8000',
];

const LINE_WIDTHS = [1, 2, 3, 4, 5];

const ERASER_SIZES = [4, 6, 8, 12];

const BRUSH_SHAPES = [
  { id: 'round-sm',  w: 3,  h: 3,  round: true },
  { id: 'round-md',  w: 5,  h: 5,  round: true },
  { id: 'round-lg',  w: 8,  h: 8,  round: true },
  { id: 'sq-sm',     w: 3,  h: 3,  round: false },
  { id: 'sq-md',     w: 5,  h: 5,  round: false },
  { id: 'sq-lg',     w: 8,  h: 8,  round: false },
  { id: 'diag-fwd',  w: 6,  h: 6,  round: false, diag: 1 },
  { id: 'diag-bwd',  w: 6,  h: 6,  round: false, diag: -1 },
];

const AIRBRUSH_SIZES = [8, 18, 32];

const SAVE_TYPES = [
  { ext: '.png',  mime: 'image/png',   label: '24-bit Bitmap (PNG)' },
  { ext: '.jpg',  mime: 'image/jpeg',  label: 'JPEG (*.jpg)' },
  { ext: '.webp', mime: 'image/webp',  label: 'WebP (*.webp)' },
  { ext: '.bmp',  mime: 'image/bmp',   label: 'Monochrome Bitmap (BMP)' },
];

const FOLDER_PRESETS = [
  { id: 'desktop',   label: 'Desktop' },
  { id: 'documents', label: 'Documents' },
  { id: 'downloads', label: 'Downloads' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   WIN-95 STYLE HELPERS
───────────────────────────────────────────────────────────────────────────── */
const W95: React.CSSProperties = {
  fontFamily: '"MS Sans Serif", Arial, sans-serif',
  fontSize: 11,
};

const raised: React.CSSProperties = {
  borderTop: '1px solid #ffffff',
  borderLeft: '1px solid #ffffff',
  borderBottom: '1px solid #808080',
  borderRight: '1px solid #808080',
};

const sunken: React.CSSProperties = {
  borderTop: '1px solid #808080',
  borderLeft: '1px solid #808080',
  borderBottom: '1px solid #ffffff',
  borderRight: '1px solid #ffffff',
};

const deepRaised: React.CSSProperties = {
  borderTop: '2px solid #ffffff',
  borderLeft: '2px solid #ffffff',
  borderBottom: '2px solid #404040',
  borderRight: '2px solid #404040',
};

const deepSunken: React.CSSProperties = {
  borderTop: '2px solid #404040',
  borderLeft: '2px solid #404040',
  borderBottom: '2px solid #ffffff',
  borderRight: '2px solid #ffffff',
};

/* ─────────────────────────────────────────────────────────────────────────────
   CANVAS UTILITIES
───────────────────────────────────────────────────────────────────────────── */
function parseHex(c: string) {
  const s = c.replace('#', '');
  return { r: parseInt(s.slice(0,2),16), g: parseInt(s.slice(2,4),16), b: parseInt(s.slice(4,6),16), a: 255 };
}

function colorsMatch(a:{r:number;g:number;b:number;a:number}, b:{r:number;g:number;b:number;a:number}) {
  return a.r===b.r && a.g===b.g && a.b===b.b && a.a===b.a;
}

function floodFill(ctx: CanvasRenderingContext2D, w: number, h: number, sx: number, sy: number, fill: {r:number;g:number;b:number;a:number}) {
  const img = ctx.getImageData(0,0,w,h);
  const d = img.data;
  const start = (sy*w+sx)*4;
  const target = { r:d[start], g:d[start+1], b:d[start+2], a:d[start+3] };
  if (colorsMatch(target, fill)) return;
  const stack: [number,number][] = [[sx,sy]];
  const vis = new Uint8Array(w*h);
  while (stack.length) {
    const [x,y] = stack.pop()!;
    if (x<0||y<0||x>=w||y>=h) continue;
    const idx = y*w+x;
    if (vis[idx]) continue;
    const o = idx*4;
    if (!colorsMatch({r:d[o],g:d[o+1],b:d[o+2],a:d[o+3]}, target)) continue;
    vis[idx]=1; d[o]=fill.r; d[o+1]=fill.g; d[o+2]=fill.b; d[o+3]=fill.a;
    stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  ctx.putImageData(img,0,0);
}

function canvasToBmpDataUrl(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d'); if (!ctx) return canvas.toDataURL('image/png');
  const w=canvas.width, h=canvas.height;
  const {data} = ctx.getImageData(0,0,w,h);
  const rowSize = Math.ceil((w*3)/4)*4;
  const imageSize = rowSize*h;
  const fileSize = 54+imageSize;
  const buf = new ArrayBuffer(fileSize); const view = new DataView(buf); let o=0;
  view.setUint8(o++,0x42); view.setUint8(o++,0x4d);
  view.setUint32(o,fileSize,true); o+=4; view.setUint32(o,0,true); o+=4;
  view.setUint32(o,54,true); o+=4; view.setUint32(o,40,true); o+=4;
  view.setInt32(o,w,true); o+=4; view.setInt32(o,h,true); o+=4;
  view.setUint16(o,1,true); o+=2; view.setUint16(o,24,true); o+=2;
  view.setUint32(o,0,true); o+=4; view.setUint32(o,imageSize,true); o+=4;
  for (let i=0;i<16;i+=4) { view.setUint32(o,0,true); o+=4; }
  for (let y=h-1;y>=0;y--) {
    for (let x=0;x<w;x++) {
      const i=(y*w+x)*4;
      view.setUint8(o++,data[i+2]); view.setUint8(o++,data[i+1]); view.setUint8(o++,data[i]);
    }
    const pad=rowSize-w*3; for (let p=0;p<pad;p++) view.setUint8(o++,0);
  }
  const bytes=new Uint8Array(buf); let bin='';
  for (let i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]);
  return `data:image/bmp;base64,${btoa(bin)}`;
}

function encodeCanvas(canvas: HTMLCanvasElement, mime: string): string {
  if (mime==='image/bmp') return canvasToBmpDataUrl(canvas);
  try { return canvas.toDataURL(mime, mime==='image/jpeg'||mime==='image/webp' ? 0.92 : undefined); }
  catch { return canvas.toDataURL('image/png'); }
}

/* ─────────────────────────────────────────────────────────────────────────────
   TOOL ICONS (16×16 SVG)
───────────────────────────────────────────────────────────────────────────── */
const TOOL_ICONS: Record<Tool, React.ReactNode> = {
  freeselect: <svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="10" height="10" fill="none" stroke="#000" strokeWidth="1" strokeDasharray="2,2"/><polygon points="10,10 15,15 12,15 11,12 8,15" fill="#000" stroke="#000" strokeWidth="0.5"/></svg>,
  select:     <svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="10" height="10" fill="none" stroke="#000" strokeWidth="1"/><polygon points="10,10 15,15 12,15 11,12 8,15" fill="#000" stroke="#000" strokeWidth="0.5"/></svg>,
  eraser:     <svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="8" width="12" height="6" rx="1" fill="#ff9999" stroke="#000" strokeWidth="1"/><rect x="2" y="8" width="6" height="6" rx="1" fill="#fff" stroke="#000" strokeWidth="1"/><line x1="0" y1="13" x2="16" y2="13" stroke="#000" strokeWidth="1"/></svg>,
  fill:       <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 12 L6 2 L8 4 L14 4 L14 6 L8 6 L10 8 L4 14 Z" fill="#000"/><ellipse cx="13" cy="13" rx="2" ry="2" fill="#0000ff"/><path d="M11 11 Q15 11 15 15" fill="none" stroke="#0000ff" strokeWidth="1.5"/></svg>,
  picker:     <svg width="16" height="16" viewBox="0 0 16 16"><path d="M11 1 L15 5 L6 14 L2 14 L2 10 Z" fill="#fff" stroke="#000" strokeWidth="1"/><rect x="2" y="10" width="4" height="4" fill="#fff" stroke="#000" strokeWidth="0.5"/><line x1="11" y1="5" x2="6" y2="10" stroke="#000" strokeWidth="1.5"/></svg>,
  zoom:       <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="7" cy="7" r="5" fill="none" stroke="#000" strokeWidth="1.5"/><line x1="11" y1="11" x2="15" y2="15" stroke="#000" strokeWidth="2"/><text x="5" y="10" fontSize="6" fontFamily="Arial" fontWeight="bold" fill="#000">+</text></svg>,
  pencil:     <svg width="16" height="16" viewBox="0 0 16 16"><path d="M13 1 L15 3 L5 13 L2 14 L3 11 Z" fill="#fff" stroke="#000" strokeWidth="1"/><path d="M13 1 L15 3 L12 5 L10 3 Z" fill="#ffcc00" stroke="#000" strokeWidth="0.5"/><path d="M3 11 L5 13" stroke="#000" strokeWidth="1"/></svg>,
  brush:      <svg width="16" height="16" viewBox="0 0 16 16"><path d="M12 1 L14 3 L8 9 L6 7 Z" fill="#8B4513" stroke="#000" strokeWidth="0.5"/><path d="M6 7 L8 9 L5 14 Q2 15 3 12 Z" fill="#c0c0c0" stroke="#000" strokeWidth="0.5"/><path d="M3 12 Q1 15 4 15 Q5 15 5 14" fill="#888" stroke="#000" strokeWidth="0.5"/></svg>,
  airbrush:   <svg width="16" height="16" viewBox="0 0 16 16"><rect x="3" y="6" width="8" height="6" rx="1" fill="#c0c0c0" stroke="#000" strokeWidth="1"/><rect x="11" y="7" width="3" height="4" rx="1" fill="#c0c0c0" stroke="#000" strokeWidth="0.5"/><line x1="7" y1="4" x2="7" y2="6" stroke="#000" strokeWidth="1"/><circle cx="3" cy="3" r="1" fill="#000" opacity="0.4"/><circle cx="6" cy="2" r="0.7" fill="#000" opacity="0.4"/><circle cx="9" cy="3" r="1" fill="#000" opacity="0.4"/><circle cx="5" cy="4" r="0.7" fill="#000" opacity="0.4"/></svg>,
  text:       <svg width="16" height="16" viewBox="0 0 16 16"><text x="2" y="13" fontSize="13" fontFamily="Times New Roman" fontWeight="bold" fill="#000">A</text></svg>,
  line:       <svg width="16" height="16" viewBox="0 0 16 16"><line x1="1" y1="15" x2="15" y2="1" stroke="#000" strokeWidth="1.5"/></svg>,
  curve:      <svg width="16" height="16" viewBox="0 0 16 16"><path d="M1 14 Q5 2 9 8 Q13 14 15 2" fill="none" stroke="#000" strokeWidth="1.5"/></svg>,
  rect:       <svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="3" width="14" height="10" fill="none" stroke="#000" strokeWidth="1.5"/></svg>,
  polygon:    <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1 15,6 12,14 4,14 1,6" fill="none" stroke="#000" strokeWidth="1.5"/></svg>,
  ellipse:    <svg width="16" height="16" viewBox="0 0 16 16"><ellipse cx="8" cy="8" rx="7" ry="5" fill="none" stroke="#000" strokeWidth="1.5"/></svg>,
  roundrect:  <svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="3" width="14" height="10" rx="3" fill="none" stroke="#000" strokeWidth="1.5"/></svg>,
};

const TOOLS_GRID: [Tool, string][] = [
  ['freeselect','Free-Form Select'],['select','Select'],
  ['eraser','Eraser/Color Eraser'],['fill','Fill With Color'],
  ['picker','Pick Color'],['zoom','Magnifier'],
  ['pencil','Pencil'],['brush','Brush'],
  ['airbrush','Airbrush'],['text','Text'],
  ['line','Line'],['curve','Curve'],
  ['rect','Rectangle'],['polygon','Polygon'],
  ['ellipse','Ellipse'],['roundrect','Rounded Rectangle'],
];

/* ─────────────────────────────────────────────────────────────────────────────
   INTERFACES
───────────────────────────────────────────────────────────────────────────── */
interface AxisPaintProps {
  vfs: {
    nodes: VFSNode[];
    getChildren: (id: string) => VFSNode[];
    createNode: (name: string, type: 'file'|'directory'|'shortcut', parentId: string, content?: string, targetId?: string, iconType?: string) => VFSNode;
    updateFileContent: (id: string, content: string) => void;
    getNode: (id: string) => VFSNode | undefined;
  };
  onClose: () => void;
}

/* ─────────────────────────────────────────────────────────────────────────────
   WIN95 DIALOG COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const Dialog95: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; width?: number }> =
  ({ title, onClose, children, width = 300 }) => (
  <div style={{ position:'absolute', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(128,128,128,0.5)' }}>
    <div style={{ ...W95, width, background:'#c0c0c0', ...deepRaised }}>
      <div style={{ background:'#000080', color:'#fff', padding:'3px 6px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, fontWeight:'bold', userSelect:'none' }}>
        <span>{title}</span>
        <button onClick={onClose} style={{ ...W95, background:'#c0c0c0', ...raised, width:16, height:14, fontSize:9, fontWeight:'bold', cursor:'default', padding:0, lineHeight:'12px' }}>×</button>
      </div>
      <div style={{ padding:8 }}>{children}</div>
    </div>
  </div>
);

const Btn95: React.FC<{ onClick?: () => void; disabled?: boolean; children: React.ReactNode; style?: React.CSSProperties; width?: number }> =
  ({ onClick, disabled, children, style, width = 75 }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
      style={{ ...W95, width, height:23, background:'#c0c0c0', cursor:'default', padding:'0 4px', fontSize:11, ...(pressed ? sunken : raised), ...style }}
    >{children}</button>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export const AxisPaint: React.FC<AxisPaintProps> = ({ vfs, onClose }) => {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);

  const [docW, setDocW] = useState(600);
  const [docH, setDocH] = useState(400);
  const [tool, setTool]     = useState<Tool>('pencil');
  const [fg,   setFg]       = useState('#000000');
  const [bg,   setBg]       = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(1);
  const [eraserSize, setEraserSize] = useState(4);
  const [brushShape, setBrushShape] = useState('round-sm');
  const [airbrushSize, setAirbrushSize] = useState(0);
  const [fillMode, setFillMode] = useState<FillMode>('none');
  const [zoom, setZoom]     = useState(1);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const [status, setStatus] = useState('For Help, click Help Topics on the Help Menu.');
  const [cursorPos, setCursorPos] = useState<{x:number;y:number}|null>(null);
  const [selectionSize, setSelectionSize] = useState<{w:number;h:number}|null>(null);
  const [currentFileId, setCurrentFileId] = useState<string|null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('untitled');

  // Menus
  const [openMenu, setOpenMenu] = useState<string|null>(null);

  // Dialogs
  const [saveOpen, setSaveOpen]   = useState(false);
  const [openDlg,  setOpenDlg]    = useState(false);
  const [attrOpen, setAttrOpen]   = useState(false);
  const [attrW,    setAttrW]      = useState(600);
  const [attrH,    setAttrH]      = useState(400);
  const [saveFolder, setSaveFolder] = useState('documents');
  const [saveName,   setSaveName]   = useState('untitled.png');
  const [saveExt,    setSaveExt]    = useState('.png');
  const [openFolder, setOpenFolder] = useState('documents');

  // Polygon accumulation
  const polygonPts = useRef<{x:number;y:number}[]>([]);

  // Drawing state
  const dragRef = useRef<{ active:boolean; x0:number; y0:number; mode:'draw'|'shape'|'select'|'freeselect'; pts:{x:number;y:number}[] } | null>(null);
  const airInterval = useRef<ReturnType<typeof setInterval>|null>(null);

  /* ── Canvas helpers ──────────────────────────────────────────────────────── */
  const getCtx   = () => canvasRef.current?.getContext('2d') ?? null;
  const getOvCtx = () => overlayRef.current?.getContext('2d') ?? null;

  const syncOverlaySize = useCallback(() => {
    const ov = overlayRef.current; const c = canvasRef.current;
    if (ov && c) { ov.width = c.width; ov.height = c.height; }
  }, []);

  const pushUndo = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const snap = ctx.getImageData(0,0,c.width,c.height);
    setUndoStack(u => [...u.slice(-19), snap]);
    setRedoStack([]);
  }, []);

  const applyUndo = useCallback(() => {
    setUndoStack(u => {
      if (!u.length) return u;
      const c = canvasRef.current; if (!c) return u;
      const ctx = c.getContext('2d'); if (!ctx) return u;
      const curr = ctx.getImageData(0,0,c.width,c.height);
      setRedoStack(r => [...r.slice(-19), curr]);
      ctx.putImageData(u[u.length-1], 0, 0);
      return u.slice(0,-1);
    });
  }, []);

  const applyRedo = useCallback(() => {
    setRedoStack(r => {
      if (!r.length) return r;
      const c = canvasRef.current; if (!c) return r;
      const ctx = c.getContext('2d'); if (!ctx) return r;
      const curr = ctx.getImageData(0,0,c.width,c.height);
      setUndoStack(u => [...u.slice(-19), curr]);
      ctx.putImageData(r[r.length-1], 0, 0);
      return r.slice(0,-1);
    });
  }, []);

  const initCanvas = useCallback((w = docW, h = docH) => {
    const c = canvasRef.current; if (!c) return;
    c.width = w; c.height = h;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,w,h);
    syncOverlaySize();
    setUndoStack([]); setRedoStack([]);
    setCurrentFileId(null); setCurrentFileName('untitled');
    setStatus('For Help, click Help Topics on the Help Menu.');
  }, [docW, docH, syncOverlaySize]);

  useEffect(() => { initCanvas(); }, []);

  /* ── Coordinate mapping ─────────────────────────────────────────────────── */
  const getPos = (e: React.MouseEvent | MouseEvent, el: HTMLCanvasElement) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(el.width-1,  Math.floor((e.clientX - r.left) / zoom))),
      y: Math.max(0, Math.min(el.height-1, Math.floor((e.clientY - r.top)  / zoom))),
    };
  };

  /* ── Drawing primitives ─────────────────────────────────────────────────── */
  const ctxLine = (ctx: CanvasRenderingContext2D, x0:number, y0:number, x1:number, y1:number, color:string, w:number, round = true) => {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w;
    ctx.lineCap = round ? 'round' : 'square'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x0+.5, y0+.5); ctx.lineTo(x1+.5, y1+.5); ctx.stroke(); ctx.restore();
  };

  const ctxShape = (ctx: CanvasRenderingContext2D, shapeTool: Tool, x0:number,y0:number,x1:number,y1:number, fg:string, bg:string, lw:number, fm:FillMode, cpx?: number, cpy?: number) => {
    const left = Math.min(x0,x1), top = Math.min(y0,y1);
    const w = Math.abs(x1-x0), h = Math.abs(y1-y0);
    ctx.save(); ctx.strokeStyle = fg; ctx.fillStyle = bg==='none' ? fg : bg; ctx.lineWidth = lw; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath();
    if (shapeTool === 'line') { ctx.moveTo(x0+.5,y0+.5); ctx.lineTo(x1+.5,y1+.5); ctx.stroke(); }
    else if (shapeTool === 'curve') {
      // quadratic bezier: control point defaults to midpoint offset when not provided
      const cx = cpx !== undefined ? cpx : (x0+x1)/2;
      const cy = cpy !== undefined ? cpy : (y0+y1)/2;
      ctx.moveTo(x0+.5, y0+.5);
      ctx.quadraticCurveTo(cx+.5, cy+.5, x1+.5, y1+.5);
      ctx.stroke();
    }
    else if (shapeTool === 'rect') {
      if (fm !== 'fill') { ctx.strokeRect(left+.5,top+.5,w,h); }
      if (fm !== 'none') { ctx.fillStyle = (fm==='both' ? bg : fg); ctx.fillRect(left+.5+lw/2,top+.5+lw/2,Math.max(0,w-lw),Math.max(0,h-lw)); if(fm==='both') ctx.strokeRect(left+.5,top+.5,w,h); }
    } else if (shapeTool === 'ellipse') {
      if (w < 1 || h < 1) { ctx.restore(); return; }
      ctx.ellipse(left+w/2+.5, top+h/2+.5, w/2, h/2, 0, 0, Math.PI*2);
      if (fm !== 'fill') ctx.stroke(); if (fm !== 'none') { ctx.fillStyle = (fm==='both' ? bg : fg); ctx.fill(); if(fm==='both') ctx.stroke(); }
    } else if (shapeTool === 'roundrect') {
      const r = Math.min(w,h)*0.2;
      ctx.roundRect(left+.5,top+.5,w,h,r);
      if (fm !== 'fill') ctx.stroke(); if (fm !== 'none') { ctx.fillStyle = (fm==='both' ? bg : fg); ctx.fill(); if(fm==='both') ctx.stroke(); }
    }
    ctx.restore();
  };

  /* ── Curve tool state ───────────────────────────────────────────────────── */
  // phase=0: initial drag defines endpoints; phase=1: next drag/click defines control point
  const curveState = useRef<{ phase: 0|1; x0:number; y0:number; x1:number; y1:number } | null>(null);

  /* ── Event handlers ─────────────────────────────────────────────────────── */
  const onDown = (e: React.MouseEvent) => {
    e.preventDefault(); // CRITICAL: stops browser native image drag
    if (openMenu) { setOpenMenu(null); return; }
    const c = canvasRef.current; if (!c) return;
    const p = getPos(e, c);
    const color = e.button === 2 ? bg : fg;

    if (tool === 'zoom') {
      if (e.button === 2) setZoom(z => Math.max(1, z/2));
      else setZoom(z => Math.min(8, z*2));
      return;
    }
    if (tool === 'picker') {
      const ctx = getCtx(); if (!ctx) return;
      const px = ctx.getImageData(p.x,p.y,1,1).data;
      const hex = `#${[px[0],px[1],px[2]].map(v=>v.toString(16).padStart(2,'0')).join('')}`;
      if (e.button===2) setBg(hex); else setFg(hex);
      return;
    }
    if (tool === 'fill') {
      pushUndo();
      const ctx = getCtx(); if (!ctx) return;
      floodFill(ctx, c.width, c.height, p.x, p.y, parseHex(color));
      return;
    }
    if (tool === 'text') {
      const t = window.prompt('Enter text:', '');
      if (t) {
        pushUndo(); const ctx = getCtx(); if (!ctx) return;
        ctx.save(); ctx.fillStyle = color; ctx.font = `${lineWidth*4+10}px Arial`;
        ctx.fillText(t, p.x, p.y); ctx.restore();
      }
      return;
    }
    if (tool === 'polygon') {
      if (e.detail === 2) {
        // double-click = close polygon
        if (polygonPts.current.length >= 2) {
          pushUndo(); const ctx = getCtx(); if (!ctx) return;
          ctx.save(); ctx.strokeStyle=color; ctx.fillStyle=bg; ctx.lineWidth=lineWidth;
          ctx.beginPath();
          polygonPts.current.forEach((pt,i) => i===0 ? ctx.moveTo(pt.x,pt.y) : ctx.lineTo(pt.x,pt.y));
          ctx.closePath();
          if (fillMode!=='fill') ctx.stroke(); if (fillMode!=='none') { ctx.fillStyle=fillMode==='both'?bg:color; ctx.fill(); if(fillMode==='both') ctx.stroke(); }
          ctx.restore();
          getOvCtx()?.clearRect(0,0,c.width,c.height);
          polygonPts.current = [];
        }
        return;
      }
      polygonPts.current.push(p);
      // draw segment on overlay
      const ov = getOvCtx(); if (!ov) return;
      ov.clearRect(0,0,c.width,c.height);
      ov.save(); ov.strokeStyle=color; ov.lineWidth=lineWidth;
      ov.beginPath();
      polygonPts.current.forEach((pt,i) => i===0 ? ov.moveTo(pt.x,pt.y) : ov.lineTo(pt.x,pt.y));
      ov.stroke(); ov.restore();
      return;
    }
    if (tool === 'freeselect' || tool === 'select') {
      dragRef.current = { active:true, x0:p.x, y0:p.y, mode: tool==='select' ? 'select' : 'freeselect', pts:[p] };
      return;
    }
    // Curve tool: two-phase interaction
    if (tool === 'curve') {
      const cs = curveState.current;
      if (cs && cs.phase === 1) {
        // Phase 2: this click is the control point — commit the curve
        pushUndo();
        const ctx = getCtx(); if (!ctx) return;
        ctxShape(ctx, 'curve', cs.x0, cs.y0, cs.x1, cs.y1, color, bg, lineWidth, fillMode, p.x, p.y);
        getOvCtx()?.clearRect(0,0,c.width,c.height);
        curveState.current = null;
        return;
      }
      // Phase 1: click+drag to define endpoints
      dragRef.current = { active:true, x0:p.x, y0:p.y, mode:'shape', pts:[] };
      return;
    }
    if (['line','rect','ellipse','roundrect'].includes(tool)) {
      dragRef.current = { active:true, x0:p.x, y0:p.y, mode:'shape', pts:[] };
      return;
    }
    // Freehand start — also draw a single dot on the initial click
    pushUndo();
    dragRef.current = { active:true, x0:p.x, y0:p.y, mode:'draw', pts:[] };
    const ctx = getCtx();
    if (ctx) {
      if (tool === 'pencil') {
        ctx.save(); ctx.fillStyle = color; ctx.fillRect(p.x, p.y, 1, 1); ctx.restore();
      } else if (tool === 'brush') {
        const bs = BRUSH_SHAPES.find(b => b.id === brushShape) || BRUSH_SHAPES[0];
        ctx.save(); ctx.fillStyle = color; ctx.globalAlpha = 1;
        if (bs.round) { ctx.beginPath(); ctx.arc(p.x, p.y, bs.w/2, 0, Math.PI*2); ctx.fill(); }
        else { ctx.fillRect(p.x-bs.w/2, p.y-bs.h/2, bs.w, bs.h); }
        ctx.restore();
      } else if (tool === 'eraser') {
        ctx.save(); ctx.fillStyle = bg;
        ctx.fillRect(p.x - eraserSize/2, p.y - eraserSize/2, eraserSize, eraserSize);
        ctx.restore();
      }
    }
    if (tool === 'airbrush') {
      const spray = () => {
        const actx = getCtx(); if (!actx) return;
        const sz = AIRBRUSH_SIZES[airbrushSize];
        actx.save(); actx.fillStyle = color;
        for (let i=0;i<12;i++) {
          const angle = Math.random()*Math.PI*2;
          const dist  = Math.random()*sz;
          actx.globalAlpha = 0.25;
          actx.fillRect((dragRef.current?.x0 ?? p.x)+Math.cos(angle)*dist, (dragRef.current?.y0 ?? p.y)+Math.sin(angle)*dist, 1, 1);
        }
        actx.restore();
      };
      spray();
      airInterval.current = setInterval(spray, 50);
    }
  };

  const onMove = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent browser text/image selection while drawing
    const c = canvasRef.current; if (!c) return;
    const p = getPos(e, c);
    setCursorPos(p);
    const d = dragRef.current;
    const color = e.buttons === 2 ? bg : fg;

    // Curve phase-1: show preview of control point bend before committing
    if (tool === 'curve' && curveState.current?.phase === 1 && !d?.active) {
      const cs = curveState.current;
      const ov = getOvCtx(); if (!ov) return;
      ov.clearRect(0,0,c.width,c.height);
      ctxShape(ov, 'curve', cs.x0, cs.y0, cs.x1, cs.y1, color, bg, lineWidth, fillMode, p.x, p.y);
      return;
    }

    if (!d?.active) return;

    if (d.mode === 'draw') {
      const ctx = getCtx(); if (!ctx) return;
      if (tool === 'pencil') {
        ctxLine(ctx, d.x0, d.y0, p.x, p.y, color, 1);
      } else if (tool === 'brush') {
        const bs = BRUSH_SHAPES.find(b => b.id === brushShape) || BRUSH_SHAPES[0];
        if ((bs as any).diag) {
          ctxLine(ctx, d.x0, d.y0, p.x, p.y, color, Math.max(1, bs.w/3), false);
        } else {
          ctxLine(ctx, d.x0, d.y0, p.x, p.y, color, bs.w, bs.round);
        }
      } else if (tool === 'eraser') {
        ctx.save(); ctx.fillStyle = bg;
        ctx.fillRect(p.x - eraserSize/2, p.y - eraserSize/2, eraserSize, eraserSize);
        ctx.restore();
      }
      d.x0 = p.x; d.y0 = p.y;
      return;
    }

    if (d.mode === 'freeselect') {
      d.pts.push(p);
      const ov = getOvCtx(); if (!ov) return;
      ov.clearRect(0,0,c.width,c.height);
      ov.save(); ov.strokeStyle='#000'; ov.lineWidth=1; ov.setLineDash([4,4]);
      ov.beginPath(); d.pts.forEach((pt,i) => i===0 ? ov.moveTo(pt.x,pt.y) : ov.lineTo(pt.x,pt.y));
      ov.stroke(); ov.restore();
      return;
    }

    if (d.mode === 'select') {
      const w = Math.abs(p.x-d.x0), h = Math.abs(p.y-d.y0);
      setSelectionSize({w,h});
      const ov = getOvCtx(); if (!ov) return;
      ov.clearRect(0,0,c.width,c.height);
      ov.save(); ov.strokeStyle='#000'; ov.lineWidth=1; ov.setLineDash([4,4]);
      ov.strokeRect(Math.min(d.x0,p.x)+.5, Math.min(d.y0,p.y)+.5, w, h);
      ov.restore();
      return;
    }

    if (d.mode === 'shape') {
      const ov = getOvCtx(); if (!ov) return;
      ov.clearRect(0,0,c.width,c.height);
      ctxShape(ov, tool, d.x0,d.y0, p.x,p.y, color, bg, lineWidth, fillMode);
    }
  };

  const onUp = (e: React.MouseEvent) => {
    e.preventDefault();
    const d = dragRef.current;
    if (!d?.active) { dragRef.current=null; return; }
    const c = canvasRef.current; if (!c) return;
    const p = getPos(e, c);
    const color = e.button===2 ? bg : fg;

    if (d.mode === 'shape') {
      if (tool === 'curve') {
        // End of phase-0 drag: store endpoints, enter phase-1 (control point)
        const ov = getOvCtx();
        // draw the straight line on overlay as phase-1 preview
        if (ov) {
          ov.clearRect(0,0,c.width,c.height);
          ctxShape(ov, 'line', d.x0, d.y0, p.x, p.y, color, bg, lineWidth, fillMode);
        }
        curveState.current = { phase: 1, x0: d.x0, y0: d.y0, x1: p.x, y1: p.y };
      } else {
        pushUndo();
        const ctx = getCtx(); if (!ctx) return;
        ctxShape(ctx, tool, d.x0,d.y0, p.x,p.y, color, bg, lineWidth, fillMode);
        getOvCtx()?.clearRect(0,0,c.width,c.height);
      }
    }
    if (d.mode === 'select' || d.mode === 'freeselect') {
      setSelectionSize(null);
      getOvCtx()?.clearRect(0,0,c.width,c.height);
    }
    if (airInterval.current) { clearInterval(airInterval.current); airInterval.current=null; }
    dragRef.current = null;
  };

  /* ── Save / Open ────────────────────────────────────────────────────────── */
  const quickSave = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    if (currentFileId && currentFileName !== 'untitled') {
      const ext = (currentFileName.match(/(\.[^.]+)$/i)?.[1] || '.png').toLowerCase();
      const mime = SAVE_TYPES.find(t=>t.ext===ext)?.mime || 'image/png';
      vfs.updateFileContent(currentFileId, encodeCanvas(c, mime));
      setStatus(`Saved ${currentFileName}`); return;
    }
    setSaveOpen(true);
  }, [currentFileId, currentFileName, vfs]);

  const handleSaveAs = (folderId: string, filename: string) => {
    const c = canvasRef.current; if (!c) return;
    
    const extMatch = filename.match(/\.[^/.]+$/);
    const ext = extMatch ? extMatch[0].toLowerCase() : '.png';
    const mime = SAVE_TYPES.find(t=>t.ext===ext)?.mime || 'image/png';
    const dataUrl = encodeCanvas(c, mime);
    
    const existing = vfs.nodes.find((n: VFSNode) => n.parentId === folderId && n.name === filename);
    if (existing) {
      vfs.updateFileContent(existing.id, dataUrl);
      setCurrentFileId(existing.id);
    } else {
      const node = vfs.createNode(filename, 'file', folderId, dataUrl, undefined, 'file', { customIcon: '/Icons/Microsoft Office/97_paintbrush_32.png' });
      setCurrentFileId(node.id);
    }
    setCurrentFileName(filename);
    setStatus(`Saved ${filename}`);
    setSaveOpen(false);
  };

  const imageNodes = vfs.getChildren(openFolder).filter(n => n.type==='file' && n.content && IMAGE_EXT.test(n.name));

  const loadFromVfs = (node: VFSNode) => {
    if (!node.content?.startsWith('data:image')) { setStatus('Cannot open file.'); return; }
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current; if (!c) return;
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      setDocW(img.naturalWidth); setDocH(img.naturalHeight);
      const ctx = c.getContext('2d'); if (!ctx) return;
      ctx.fillStyle='#fff'; ctx.fillRect(0,0,c.width,c.height);
      ctx.drawImage(img,0,0); syncOverlaySize();
      setUndoStack([]); setRedoStack([]);
      setCurrentFileId(node.id); setCurrentFileName(node.name);
      setStatus(`Opened ${node.name}`); setOpenDlg(false);
    };
    img.src = node.content;
  };

  const applyAttributes = () => {
    pushUndo(); const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const img = ctx.getImageData(0,0,c.width,c.height);
    c.width=attrW; c.height=attrH; setDocW(attrW); setDocH(attrH);
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,attrW,attrH); ctx.putImageData(img,0,0);
    syncOverlaySize(); setAttrOpen(false);
  };

  const selectAll = () => {
    const c = canvasRef.current; if(!c) return;
    const ov = getOvCtx(); if (!ov) return;
    ov.clearRect(0,0,c.width,c.height);
    ov.save(); ov.strokeStyle='#000'; ov.lineWidth=1; ov.setLineDash([4,4]);
    ov.strokeRect(.5,.5,c.width-1,c.height-1); ov.restore();
    setSelectionSize({w:c.width,h:c.height});
  };

  /* ── Keyboard shortcuts ─────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key==='z') { e.preventDefault(); applyUndo(); }
        if (e.key==='y') { e.preventDefault(); applyRedo(); }
        if (e.key==='s') { e.preventDefault(); quickSave(); }
        if (e.key==='a') { e.preventDefault(); selectAll(); }
        if (e.key==='+' || e.key==='=') { e.preventDefault(); setZoom(z => Math.min(8, z*2)); }
        if (e.key==='-') { e.preventDefault(); setZoom(z => Math.max(1, z/2)); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [applyUndo, applyRedo, quickSave]);

  /* ── Sub-options panel ──────────────────────────────────────────────────── */
  const renderSubOptions = () => {
    if (['eraser'].includes(tool)) {
      return (
        <div style={{ padding:4 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2 }}>
            {ERASER_SIZES.map((sz,i) => (
              <button key={sz} onClick={() => setEraserSize(sz)}
                style={{ ...W95, display:'flex', alignItems:'center', justifyContent:'center', width:22, height:22, background:'#c0c0c0', cursor:'default', ...(eraserSize===sz ? deepSunken : raised) }}>
                <div style={{ width:sz/2, height:sz/2, background:'#fff', border:'1px solid #000', borderRadius:0 }}/>
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (tool === 'brush') {
      return (
        <div style={{ padding:4 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:1 }}>
            {BRUSH_SHAPES.map(bs => (
              <button key={bs.id} onClick={() => setBrushShape(bs.id)}
                style={{ ...W95, display:'flex', alignItems:'center', justifyContent:'center', width:20, height:20, background:'#c0c0c0', cursor:'default', ...(brushShape===bs.id ? deepSunken : raised) }}>
                <div style={{ width:bs.w/1.5, height:bs.h/1.5, background:'#000', borderRadius: bs.round ? '50%' : 0, transform: (bs as any).diag ? 'rotate(45deg)' : undefined }}/>
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (tool === 'airbrush') {
      return (
        <div style={{ padding:4, display:'flex', gap:2 }}>
          {AIRBRUSH_SIZES.map((sz,i) => (
            <button key={sz} onClick={() => setAirbrushSize(i)}
              style={{ ...W95, display:'flex', alignItems:'center', justifyContent:'center', width:22, height:22, background:'#c0c0c0', cursor:'default', ...(airbrushSize===i ? deepSunken : raised) }}>
              <div style={{ width:sz/3.5, height:sz/3.5, background:'#000', borderRadius:'50%', opacity:0.6 }}/>
            </button>
          ))}
        </div>
      );
    }
    if (['line','curve','rect','ellipse','roundrect','polygon'].includes(tool)) {
      return (
        <div style={{ padding:4 }}>
          {/* Line width */}
          <div style={{ display:'flex', flexDirection:'column', gap:2, marginBottom: ['rect','ellipse','roundrect','polygon'].includes(tool)?4:0 }}>
            {LINE_WIDTHS.map(w => (
              <button key={w} onClick={() => setLineWidth(w)}
                style={{ ...W95, width:44, height:w+7, background:'#c0c0c0', cursor:'default', display:'flex', alignItems:'center', ...(lineWidth===w ? deepSunken : raised) }}>
                <div style={{ width:'100%', height:w, background:'#000' }}/>
              </button>
            ))}
          </div>
          {/* Fill mode */}
          {['rect','ellipse','roundrect','polygon'].includes(tool) && (
            <div style={{ display:'flex', flexDirection:'column', gap:1, marginTop:4 }}>
              {([['none','Outline only'],['both','Outline + Fill'],['fill','Fill only']] as [FillMode,string][]).map(([fm, label]) => (
                <button key={fm} onClick={() => setFillMode(fm)}
                  title={label}
                  style={{ ...W95, width:44, height:14, background:'#c0c0c0', cursor:'default', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2px', ...(fillMode===fm ? deepSunken : raised) }}>
                  <div style={{ width:18, height:10, background: fm==='fill' ? '#000' : '#fff', border: fm==='fill'?'none':'1px solid #000' }}/>
                  {fm!=='fill'&&<div style={{ width:18, height:10, background: fm==='both' ? '#808080' : '#fff', border:'1px solid #000'}}/>}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (tool === 'zoom') {
      return (
        <div style={{ padding:4, display:'flex', flexDirection:'column', gap:2 }}>
          {[1,2,4,6,8].map(z => (
            <button key={z} onClick={() => setZoom(z)}
              style={{ ...W95, fontSize:10, padding:'1px 3px', background:'#c0c0c0', cursor:'default', ...(zoom===z ? deepSunken : raised) }}>
              {z}×
            </button>
          ))}
        </div>
      );
    }
    return null;
  };

  /* ── Menu items ─────────────────────────────────────────────────────────── */
  const MENUS = {
    File: [
      { label: 'New',        shortcut:'Ctrl+N', action: () => { initCanvas(); setOpenMenu(null); } },
      { label: 'Open…',      shortcut:'Ctrl+O', action: () => { setOpenDlg(true); setOpenMenu(null); } },
      { label: 'Save',       shortcut:'Ctrl+S', action: () => { quickSave(); setOpenMenu(null); } },
      { label: 'Save As…',   shortcut:'',       action: () => { setSaveOpen(true); setOpenMenu(null); } },
      { separator: true },
      { label: 'Attributes…',shortcut:'Ctrl+E', action: () => { setAttrW(docW); setAttrH(docH); setAttrOpen(true); setOpenMenu(null); } },
      { separator: true },
      { label: 'Exit',       shortcut:'Alt+F4', action: () => { onClose(); setOpenMenu(null); } },
    ],
    Edit: [
      { label: 'Undo',     shortcut:'Ctrl+Z', action: () => { applyUndo(); setOpenMenu(null); } },
      { label: 'Redo',     shortcut:'Ctrl+Y', action: () => { applyRedo(); setOpenMenu(null); } },
      { separator: true },
      { label: 'Select All', shortcut:'Ctrl+A', action: () => { selectAll(); setOpenMenu(null); } },
      { separator: true },
      { label: 'Clear Image', shortcut:'',   action: () => { pushUndo(); const ctx=getCtx(); const c=canvasRef.current; if(ctx&&c){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);} setOpenMenu(null); } },
    ],
    View: [
      { label:'Zoom In',  shortcut:'Ctrl++', action: () => { setZoom(z=>Math.min(8,z*2)); setOpenMenu(null); } },
      { label:'Zoom Out', shortcut:'Ctrl+-', action: () => { setZoom(z=>Math.max(1,z/2)); setOpenMenu(null); } },
      { separator: true },
      ...[1,2,4,6,8].map(z => ({ label:`${z}× (${z*100}%)`, shortcut:'', action:() => { setZoom(z); setOpenMenu(null); } })),
    ],
    Image: [
      { label:'Flip/Rotate…', shortcut:'', action: () => {
        pushUndo(); const c=canvasRef.current; const ctx=getCtx(); if(!c||!ctx) return;
        const tmp=document.createElement('canvas'); tmp.width=c.height; tmp.height=c.width;
        const tc=tmp.getContext('2d'); if(!tc) return;
        tc.translate(tmp.width,0); tc.rotate(Math.PI/2); tc.drawImage(c,0,0);
        c.width=tmp.width; c.height=tmp.height; setDocW(tmp.width); setDocH(tmp.height);
        ctx.drawImage(tmp,0,0); syncOverlaySize(); setOpenMenu(null);
      }},
      { label:'Invert Colors', shortcut:'Ctrl+I', action: () => {
        pushUndo(); const c=canvasRef.current; const ctx=getCtx(); if(!c||!ctx) return;
        const img=ctx.getImageData(0,0,c.width,c.height);
        for(let i=0;i<img.data.length;i+=4){img.data[i]=255-img.data[i];img.data[i+1]=255-img.data[i+1];img.data[i+2]=255-img.data[i+2];}
        ctx.putImageData(img,0,0); setOpenMenu(null);
      }},
    ],
    Options: [
      { label:'Edit Colors…', shortcut:'', action: () => {
        const nc = window.prompt('Enter HTML color (#rrggbb):', fg);
        if (nc) setFg(nc); setOpenMenu(null);
      }},
    ],
    Help: [
      { label:'Help Topics', shortcut:'', action: () => { setStatus('Axis Paint 2.0 — MS Paint compatible drawing app.'); setOpenMenu(null); } },
      { separator: true },
      { label:'About Axis Paint…', shortcut:'', action: () => { alert('Axis Paint 2.0\nVespera OS 1.0.4\n\nA full-featured MS Paint compatible graphics editor.'); setOpenMenu(null); } },
    ],
  } as const;

  type MenuKey = keyof typeof MENUS;

  const renderMenu = (key: MenuKey) => (
    <div key={key} style={{ position:'relative' }}
      onMouseEnter={() => openMenu ? setOpenMenu(key) : undefined}>
      <button
        onClick={() => setOpenMenu(openMenu===key ? null : key)}
        style={{ ...W95, background: openMenu===key ? '#000080' : 'transparent', color: openMenu===key ? '#fff' : '#000', padding:'2px 6px', cursor:'default', border:'none', outline:'none' }}>
        {key}
      </button>
      {openMenu === key && (
        <div style={{ position:'absolute', top:'100%', left:0, minWidth:190, background:'#c0c0c0', ...deepRaised, zIndex:1000 }}>
          {(MENUS[key] as any[]).map((item: any, i: number) =>
            item.separator
              ? <div key={i} style={{ ...sunken, height:0, margin:'2px 4px', borderBottomColor:'transparent', borderRightColor:'transparent' }}/>
              : <button key={i} onClick={item.action}
                  style={{ ...W95, display:'flex', justifyContent:'space-between', width:'100%', padding:'3px 20px 3px 20px', background:'transparent', border:'none', cursor:'default', textAlign:'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background='#000080', e.currentTarget.style.color='#fff')}
                  onMouseLeave={e => (e.currentTarget.style.background='transparent', e.currentTarget.style.color='#000')}>
                  <span>{item.label}</span>
                  {item.shortcut && <span style={{ color:'inherit', opacity:0.7 }}>{item.shortcut}</span>}
                </button>
          )}
        </div>
      )}
    </div>
  );

  /* ── Render ─────────────────────────────────────────────────────────────── */
  const canvasCursor = () => {
    if (tool==='zoom') return 'zoom-in';
    if (tool==='picker') return 'crosshair';
    if (tool==='fill') return 'cell';
    if (tool==='eraser') return 'cell';
    if (tool==='text') return 'text';
    if (['select','freeselect'].includes(tool)) return 'default';
    return 'crosshair';
  };

  const docTitle = `${currentFileName} - Axis Paint`;

  /* ── Cursor style ──────────────────────────────────────────────────────── */
  const cursorStyle: React.CSSProperties['cursor'] = (() => {
    if (tool === 'zoom')    return 'zoom-in';
    if (tool === 'picker')  return 'crosshair';
    if (tool === 'fill')    return 'cell';
    if (tool === 'eraser')  return 'cell';
    if (tool === 'text')    return 'text';
    if (tool === 'select' || tool === 'freeselect') return 'default';
    return 'crosshair';
  })();

  /* ── Tool change: reset transient state ────────────────────────────────── */
  const handleToolChange = (id: Tool) => {
    setTool(id);
    polygonPts.current = [];
    curveState.current = null;
    dragRef.current = null;
    if (airInterval.current) { clearInterval(airInterval.current); airInterval.current = null; }
    const c = canvasRef.current;
    getOvCtx()?.clearRect(0, 0, c?.width || 0, c?.height || 0);
  };

  return (
    <div
      style={{ ...W95, display:'flex', flexDirection:'column', height:'100%', background:'#c0c0c0', color:'#000', userSelect:'none' }}
      onClick={e => { if (!(e.target as HTMLElement).closest('[data-menu]')) setOpenMenu(null); }}
    >
      {/* ── Menu Bar ── */}
      <div style={{ display:'flex', padding:'2px 2px 0', background:'#c0c0c0' }} data-menu>
        {(Object.keys(MENUS) as MenuKey[]).map(k => renderMenu(k))}
      </div>

      {/* ── Body ── */}
      <div style={{ display:'flex', flex:1, minHeight:0, padding:2, gap:2 }}>

        {/* ── Toolbox ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:0, ...deepRaised, background:'#c0c0c0', flexShrink:0 }}>
          {/* Tool grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, padding:2 }}>
            {TOOLS_GRID.map(([id, label]) => (
              <button
                key={id}
                title={label}
              onClick={() => handleToolChange(id)}
                style={{ ...W95, display:'flex', alignItems:'center', justifyContent:'center', width:24, height:24, background:'#c0c0c0', cursor:'default', padding:0, ...(tool===id ? deepSunken : raised) }}>
                {TOOL_ICONS[id]}
              </button>
            ))}
          </div>
          {/* Sub-options */}
          <div style={{ borderTop:'1px solid #808080', minHeight:60, padding:2 }}>
            {renderSubOptions()}
          </div>
          {/* FG/BG Color swatches */}
          <div style={{ padding:4, display:'flex', alignItems:'flex-end', gap:0, marginTop:'auto' }}>
            <div style={{ position:'relative', width:34, height:34 }}>
              <div title="Background color (right-click palette)" onClick={() => setBg(fg)}
                style={{ position:'absolute', right:0, bottom:0, width:22, height:22, background:bg, ...sunken, cursor:'default', zIndex:1 }}/>
              <div title="Foreground color (left-click palette)"
                style={{ position:'absolute', left:0, top:0, width:22, height:22, background:fg, ...sunken, cursor:'default', zIndex:2 }}/>
            </div>
          </div>
        </div>

        {/* ── Canvas Area ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          <div
            ref={scrollRef}
            style={{ flex:1, overflow:'auto', background:'#808080', ...deepSunken, position:'relative' }}>
            <div style={{ padding:6, display:'inline-block', minWidth:'100%', minHeight:'100%' }}>
              <div style={{ position:'relative', display:'inline-block', lineHeight:0, boxShadow:'2px 2px 4px rgba(0,0,0,0.5)' }}>
                <canvas
                  ref={canvasRef}
                  width={docW}
                  height={docH}
                  draggable={false}
                  style={{ display:'block', cursor:cursorStyle, transform:`scale(${zoom})`, transformOrigin:'top left',
                    imageRendering: zoom >= 2 ? 'pixelated' : 'auto',
                    touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
                  onMouseDown={onDown}
                  onMouseMove={onMove}
                  onMouseUp={onUp}
                  onMouseLeave={e => {
                    setCursorPos(null);
                    if (dragRef.current?.active) onUp(e);
                    if (airInterval.current) { clearInterval(airInterval.current); airInterval.current=null; }
                  }}
                  onDragStart={e => e.preventDefault()}
                  onContextMenu={e => e.preventDefault()}
                />
                <canvas
                  ref={overlayRef}
                  width={docW}
                  height={docH}
                  draggable={false}
                  style={{ position:'absolute', top:0, left:0, pointerEvents:'none',
                    transform:`scale(${zoom})`, transformOrigin:'top left',
                    imageRendering: zoom>=2?'pixelated':'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Color Palette ── */}
      <div style={{ display:'flex', alignItems:'center', gap:2, padding:'2px 4px', background:'#c0c0c0', borderTop:'1px solid #808080' }}>
        {/* Color box (large FG / BG) */}
        <div style={{ position:'relative', width:32, height:28, marginRight:4, flexShrink:0 }}>
          <div style={{ position:'absolute', right:0, bottom:0, width:20, height:18, background:bg, ...sunken }} />
          <div style={{ position:'absolute', left:0, top:0, width:20, height:18, background:fg, ...sunken }} />
        </div>
        {/* Palette */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(14, 16px)', gridTemplateRows:'repeat(2, 16px)', gap:1 }}>
          {PALETTE.map((col, i) => (
            <button
              key={i}
              title={col}
              onClick={() => setFg(col)}
              onContextMenu={e => { e.preventDefault(); setBg(col); }}
              style={{ width:16, height:16, background:col, border:'1px solid', borderTopColor:'#808080', borderLeftColor:'#808080', borderBottomColor:'#fff', borderRightColor:'#fff', cursor:'default', padding:0 }}
            />
          ))}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div style={{ display:'flex', gap:2, padding:'2px 4px', background:'#c0c0c0', borderTop:'1px solid #808080' }}>
        <div style={{ flex:1, ...sunken, padding:'1px 4px', ...W95, fontSize:11 }}>
          {status}
        </div>
        {cursorPos && (
          <div style={{ width:90, ...sunken, padding:'1px 4px', ...W95, fontSize:11, textAlign:'center', flexShrink:0 }}>
            {cursorPos.x},{cursorPos.y}px
          </div>
        )}
        {selectionSize && (
          <div style={{ width:90, ...sunken, padding:'1px 4px', ...W95, fontSize:11, textAlign:'center', flexShrink:0 }}>
            {selectionSize.w}×{selectionSize.h}
          </div>
        )}
        <div style={{ width:60, ...sunken, padding:'1px 4px', ...W95, fontSize:11, textAlign:'center', flexShrink:0 }}>
          {docW}×{docH}
        </div>
      </div>

      {/* ── Save Dialog ── */}
      {saveOpen && (
        <VersaSlideFilePicker
          vfs={vfs as any}
          title="Save As"
          defaultName={currentFileName === 'untitled' ? 'untitled.png' : currentFileName.replace(/\.[^/.]+$/, '')}
          allowedExtensions={SAVE_TYPES.map(t => ({ value: t.ext, label: t.label }))}
          onConfirm={handleSaveAs}
          onCancel={() => setSaveOpen(false)}
        />
      )}

      {/* ── Open Dialog ── */}
      {openDlg && (
        <VersaSlideFilePicker
          vfs={vfs as any}
          title="Open"
          mode="open"
          allowedExtensions={SAVE_TYPES.map(t => ({ value: t.ext, label: t.label }))}
          onConfirm={(folderId, filename) => {
            const existing = vfs.nodes.find((n: VFSNode) => n.parentId === folderId && n.name === filename);
            if (existing) {
              loadFromVfs(existing);
            } else {
              alert('File not found.');
            }
          }}
          onCancel={() => setOpenDlg(false)}
        />
      )}

      {/* ── Attributes Dialog ── */}
      {attrOpen && (
        <Dialog95 title="Image Attributes" onClose={() => setAttrOpen(false)} width={260}>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ flex:1 }}>
                <div style={{ ...W95, marginBottom:2 }}>Width (pixels):</div>
                <input type="number" value={attrW} onChange={e => setAttrW(+e.target.value||1)}
                  style={{ ...W95, width:'100%', ...sunken, padding:'2px 4px', background:'#fff', boxSizing:'border-box' }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ ...W95, marginBottom:2 }}>Height (pixels):</div>
                <input type="number" value={attrH} onChange={e => setAttrH(+e.target.value||1)}
                  style={{ ...W95, width:'100%', ...sunken, padding:'2px 4px', background:'#fff', boxSizing:'border-box' }}/>
              </div>
            </div>
            <div style={{ ...W95, fontSize:10, color:'#808080' }}>Current size: {docW} × {docH} pixels</div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:4 }}>
              <Btn95 onClick={applyAttributes}>OK</Btn95>
              <Btn95 onClick={() => setAttrOpen(false)}>Cancel</Btn95>
            </div>
          </div>
        </Dialog95>
      )}
    </div>
  );
};
