import React, { useCallback, useEffect, useRef, useState } from 'react';
import { VFSNode } from '../hooks/useVFS';

type Tool =
  | 'pencil'
  | 'brush'
  | 'airbrush'
  | 'eraser'
  | 'fill'
  | 'line'
  | 'rect'
  | 'ellipse'
  | 'roundrect'
  | 'text'
  | 'select'
  | 'picker';

const IMAGE_EXT = /\.(png|jpg|jpeg|webp|bmp|gif)$/i;

/** Classic Paint-style default palette (28 + 2 custom slots handled separately). */
const DEFAULT_PALETTE: string[] = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#808040', '#004040', '#0080ff', '#004080', '#400080', '#804000', '#ffffff', '#c0c0c0',
  '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#80ff80',
  '#80ffff', '#0080ff', '#ff0080', '#804000',
];

const SAVE_TYPES: { ext: string; mime: string; label: string }[] = [
  { ext: '.png', mime: 'image/png', label: 'PNG' },
  { ext: '.jpg', mime: 'image/jpeg', label: 'JPEG' },
  { ext: '.webp', mime: 'image/webp', label: 'WebP' },
  { ext: '.bmp', mime: 'image/bmp', label: 'BMP' },
];

function canvasToBmpDataUrl(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/png');
  const w = canvas.width;
  const h = canvas.height;
  const { data } = ctx.getImageData(0, 0, w, h);
  const rowSize = Math.ceil((w * 3) / 4) * 4;
  const imageSize = rowSize * h;
  const fileSize = 14 + 40 + imageSize;
  const buf = new ArrayBuffer(fileSize);
  const view = new DataView(buf);
  let o = 0;
  view.setUint8(o++, 0x42);
  view.setUint8(o++, 0x4d);
  view.setUint32(o, fileSize, true);
  o += 4;
  view.setUint32(o, 0, true);
  o += 4;
  view.setUint32(o, 14 + 40, true);
  o += 4;
  view.setUint32(o, 40, true);
  o += 4;
  view.setInt32(o, w, true);
  o += 4;
  view.setInt32(o, h, true);
  o += 4;
  view.setUint16(o, 1, true);
  o += 2;
  view.setUint16(o, 24, true);
  o += 2;
  view.setUint32(o, 0, true);
  o += 4;
  view.setUint32(o, imageSize, true);
  o += 4;
  view.setUint32(o, 0, true);
  o += 4;
  view.setUint32(o, 0, true);
  o += 4;
  view.setUint32(o, 0, true);
  o += 4;
  view.setUint32(o, 0, true);
  o += 4;
  for (let y = h - 1; y >= 0; y--) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      view.setUint8(o++, data[i + 2]);
      view.setUint8(o++, data[i + 1]);
      view.setUint8(o++, data[i + 0]);
    }
    const pad = rowSize - w * 3;
    for (let p = 0; p < pad; p++) view.setUint8(o++, 0);
  }
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:image/bmp;base64,${btoa(binary)}`;
}

function encodeCanvas(canvas: HTMLCanvasElement, mime: string): string {
  if (mime === 'image/bmp') return canvasToBmpDataUrl(canvas);
  try {
    if (mime === 'image/jpeg' || mime === 'image/webp') {
      return canvas.toDataURL(mime, 0.92);
    }
    return canvas.toDataURL(mime);
  } catch {
    return canvas.toDataURL('image/png');
  }
}

function parseHex(c: string): { r: number; g: number; b: number; a: number } {
  const s = c.replace('#', '');
  if (s.length === 6) {
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
      a: 255,
    };
  }
  return { r: 0, g: 0, b: 0, a: 255 };
}

function colorsMatch(
  a: { r: number; g: number; b: number; a: number },
  b: { r: number; g: number; b: number; a: number }
) {
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

function floodFill(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sx: number,
  sy: number,
  fill: { r: number; g: number; b: number; a: number }
) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const start = (sy * w + sx) * 4;
  const target = {
    r: d[start],
    g: d[start + 1],
    b: d[start + 2],
    a: d[start + 3],
  };
  if (colorsMatch(target, fill)) return;
  const stack: [number, number][] = [[sx, sy]];
  const vis = new Uint8Array(w * h);
  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const idx = y * w + x;
    if (vis[idx]) continue;
    const o = idx * 4;
    const c = { r: d[o], g: d[o + 1], b: d[o + 2], a: d[o + 3] };
    if (!colorsMatch(c, target)) continue;
    vis[idx] = 1;
    d[o] = fill.r;
    d[o + 1] = fill.g;
    d[o + 2] = fill.b;
    d[o + 3] = fill.a;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  ctx.putImageData(img, 0, 0);
}

interface AxisPaintProps {
  vfs: {
    nodes: VFSNode[];
    getChildren: (id: string) => VFSNode[];
    createNode: (
      name: string,
      type: 'file' | 'directory' | 'shortcut',
      parentId: string,
      content?: string,
      targetId?: string,
      iconType?: string
    ) => VFSNode;
    updateFileContent: (id: string, content: string) => void;
    getNode: (id: string) => VFSNode | undefined;
  };
  onClose: () => void;
}

const FOLDER_PRESETS: { id: string; label: string }[] = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'documents', label: 'Documents' },
  { id: 'downloads', label: 'Downloads' },
];

export const AxisPaint: React.FC<AxisPaintProps> = ({ vfs, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [docW, setDocW] = useState(640);
  const [docH, setDocH] = useState(480);
  const [tool, setTool] = useState<Tool>('pencil');
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [brush, setBrush] = useState(3);
  const [filled, setFilled] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [customColors, setCustomColors] = useState<[string, string]>(['#ff0000', '#00ff00']);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [status, setStatus] = useState('For help, click Help Topics on the Help Menu.');
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);

  const [saveOpen, setSaveOpen] = useState(false);
  const [saveFolder, setSaveFolder] = useState('documents');
  const [saveName, setSaveName] = useState('untitled.png');
  const [saveExt, setSaveExt] = useState('.png');

  const [openDlg, setOpenDlg] = useState(false);
  const [openFolder, setOpenFolder] = useState('documents');

  const [attrOpen, setAttrOpen] = useState(false);
  const [attrW, setAttrW] = useState(640);
  const [attrH, setAttrH] = useState(480);

  const dragRef = useRef<{
    active: boolean;
    x0: number;
    y0: number;
    mode: 'draw' | 'shape' | 'select';
  } | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const pushUndo = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, c.width, c.height);
    setUndoStack((u) => [...u.slice(-19), snap]);
  }, []);

  const applyUndo = useCallback(() => {
    setUndoStack((u) => {
      if (u.length === 0) return u;
      const c = canvasRef.current;
      if (!c) return u;
      const ctx = c.getContext('2d');
      if (!ctx) return u;
      const prev = u[u.length - 1];
      const next = u.slice(0, -1);
      ctx.putImageData(prev, 0, 0);
      return next;
    });
  }, []);

  const initCanvasWhite = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.width = docW;
    c.height = docH;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, docW, docH);
    setUndoStack([]);
    setCurrentFileId(null);
    setCurrentFileName(null);
  }, [docW, docH]);

  useEffect(() => {
    initCanvasWhite();
  }, []);

  useEffect(() => {
    const p = previewRef.current;
    if (p) {
      p.width = docW;
      p.height = docH;
    }
  }, [docW, docH]);

  const quickSave = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    if (currentFileId && currentFileName) {
      const m = currentFileName.match(/(\.[^.]+)$/i);
      const ext = (m ? m[1] : '.png').toLowerCase();
      const mime = SAVE_TYPES.find((t) => t.ext === ext)?.mime || 'image/png';
      const dataUrl = encodeCanvas(c, mime);
      vfs.updateFileContent(currentFileId, dataUrl);
      setStatus(`Saved ${currentFileName}`);
      return;
    }
    setSaveOpen(true);
  }, [currentFileId, currentFileName, vfs]);

  const getPos = (e: React.MouseEvent | MouseEvent, el: HTMLCanvasElement) => {
    const r = el.getBoundingClientRect();
    const scaleX = el.width / r.width;
    const scaleY = el.height / r.height;
    return {
      x: Math.floor((e.clientX - r.left) * scaleX),
      y: Math.floor((e.clientY - r.top) * scaleY),
    };
  };

  const drawLine = (x0: number, y0: number, x1: number, y1: number, color: string, width: number, round: boolean) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = round ? 'round' : 'butt';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  };

  const onDown = (e: React.MouseEvent) => {
    const c = canvasRef.current;
    if (!c) return;
    const p = getPos(e, c);
    if (tool === 'picker') {
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const px = ctx.getImageData(p.x, p.y, 1, 1).data;
      const hex = `#${[px[0], px[1], px[2]].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
      if (e.button === 2) setBg(hex);
      else setFg(hex);
      setStatus(`Color sampled ${hex}`);
      return;
    }
    if (tool === 'fill') {
      pushUndo();
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const col = parseHex(fg);
      floodFill(ctx, c.width, c.height, p.x, p.y, col);
      setStatus('Filled area');
      return;
    }
    if (tool === 'text') {
      const t = window.prompt('Enter text:', 'Text');
      if (t) {
        pushUndo();
        const ctx = c.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = fg;
        ctx.font = '16px sans-serif';
        ctx.fillText(t, p.x, p.y);
      }
      return;
    }
    if (tool === 'select') {
      dragRef.current = { active: true, x0: p.x, y0: p.y, mode: 'select' };
      return;
    }
    if (['line', 'rect', 'ellipse', 'roundrect'].includes(tool)) {
      dragRef.current = { active: true, x0: p.x, y0: p.y, mode: 'shape' };
      return;
    }
    dragRef.current = { active: true, x0: p.x, y0: p.y, mode: 'draw' };
    pushUndo();
  };

  const onMove = (e: React.MouseEvent) => {
    const c = canvasRef.current;
    const prev = previewRef.current;
    if (!c) return;
    const p = getPos(e, c);
    setStatus(`${p.x}, ${p.y}px`);
    const d = dragRef.current;
    if (!d?.active) return;

    if (d.mode === 'draw') {
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const color = tool === 'eraser' ? bg : fg;
      if (tool === 'pencil') {
        drawLine(d.x0, d.y0, p.x, p.y, color, 1, true);
      } else if (tool === 'brush') {
        drawLine(d.x0, d.y0, p.x, p.y, color, brush, true);
      } else if (tool === 'airbrush') {
        for (let i = 0; i < 4; i++) {
          const ax = p.x + (Math.random() - 0.5) * brush * 3;
          const ay = p.y + (Math.random() - 0.5) * brush * 3;
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          ctx.arc(ax, ay, brush / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      d.x0 = p.x;
      d.y0 = p.y;
      return;
    }

    if (d.mode === 'shape' && prev) {
      const pv = prev.getContext('2d');
      if (!pv) return;
      prev.width = c.width;
      prev.height = c.height;
      pv.clearRect(0, 0, prev.width, prev.height);
      pv.strokeStyle = fg;
      pv.lineWidth = Math.max(1, brush);
      pv.fillStyle = fg;
      const x0 = d.x0;
      const y0 = d.y0;
      if (tool === 'line') {
        pv.beginPath();
        pv.moveTo(x0, y0);
        pv.lineTo(p.x, p.y);
        pv.stroke();
      } else if (tool === 'rect') {
        const w = p.x - x0;
        const h = p.y - y0;
        if (filled) pv.fillRect(x0, y0, w, h);
        else pv.strokeRect(x0, y0, w, h);
      } else if (tool === 'ellipse' || tool === 'roundrect') {
        const w = Math.abs(p.x - x0);
        const h = Math.abs(p.y - y0);
        const left = Math.min(x0, p.x);
        const top = Math.min(y0, p.y);
        pv.beginPath();
        if (tool === 'ellipse') {
          pv.ellipse(left + w / 2, top + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        } else {
          const r = Math.min(w, h) * 0.15;
          pv.roundRect(left, top, w, h, r);
        }
        if (filled) pv.fill();
        else pv.stroke();
      }
    }
  };

  const commitShape = (e: React.MouseEvent) => {
    const c = canvasRef.current;
    const prev = previewRef.current;
    const d = dragRef.current;
    if (!c || !d || d.mode !== 'shape') return;
    const p = getPos(e, c);
    pushUndo();
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = fg;
    ctx.fillStyle = fg;
    ctx.lineWidth = Math.max(1, brush);
    const x0 = d.x0;
    const y0 = d.y0;
    if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else if (tool === 'rect') {
      const w = p.x - x0;
      const h = p.y - y0;
      if (filled) ctx.fillRect(x0, y0, w, h);
      else ctx.strokeRect(x0, y0, w, h);
    } else if (tool === 'ellipse' || tool === 'roundrect') {
      const w = Math.abs(p.x - x0);
      const h = Math.abs(p.y - y0);
      const left = Math.min(x0, p.x);
      const top = Math.min(y0, p.y);
      ctx.beginPath();
      if (tool === 'ellipse') {
        ctx.ellipse(left + w / 2, top + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      } else {
        const r = Math.min(w, h) * 0.15;
        ctx.roundRect(left, top, w, h, r);
      }
      if (filled) ctx.fill();
      else ctx.stroke();
    }
    if (prev) {
      const pv = prev.getContext('2d');
      if (pv) pv.clearRect(0, 0, prev.width, prev.height);
    }
  };

  const onUp = (e: React.MouseEvent) => {
    const d = dragRef.current;
    if (!d?.active) return;
    if (d.mode === 'shape') {
      commitShape(e);
    }
    dragRef.current = null;
  };

  const performSave = () => {
    const c = canvasRef.current;
    if (!c) return;
    const mime = SAVE_TYPES.find((t) => t.ext === saveExt)?.mime || 'image/png';
    const dataUrl = encodeCanvas(c, mime);
    let name = saveName.trim();
    if (!name.toLowerCase().endsWith(saveExt)) {
      name = name.replace(/\.[^.]+$/, '') + saveExt;
    }
    if (currentFileId) {
      vfs.updateFileContent(currentFileId, dataUrl);
      setCurrentFileName(name);
      setStatus(`Saved ${name}`);
    } else {
      const node = vfs.createNode(name, 'file', saveFolder, dataUrl);
      setCurrentFileId(node.id);
      setCurrentFileName(name);
      setStatus(`Saved ${name} to ${FOLDER_PRESETS.find((f) => f.id === saveFolder)?.label}`);
    }
    setSaveOpen(false);
  };

  const imageNodes = vfs.getChildren(openFolder).filter(
    (n) => n.type === 'file' && n.content && IMAGE_EXT.test(n.name)
  );

  const loadFromVfs = (node: VFSNode) => {
    if (!node.content || !node.content.startsWith('data:image')) {
      setStatus('Could not open file');
      return;
    }
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current;
      if (!c) return;
      setDocW(img.naturalWidth);
      setDocH(img.naturalHeight);
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0);
      setUndoStack([]);
      setCurrentFileId(node.id);
      setCurrentFileName(node.name);
      setStatus(`Opened ${node.name}`);
      setOpenDlg(false);
    };
    img.src = node.content;
  };

  const applyAttributes = () => {
    pushUndo();
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const img = ctx.getImageData(0, 0, c.width, c.height);
    c.width = attrW;
    c.height = attrH;
    setDocW(attrW);
    setDocH(attrH);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, attrW, attrH);
    ctx.putImageData(img, 0, 0);
    setAttrOpen(false);
  };

  const paletteSlot = (color: string, i: number) => (
    <button
      key={i}
      type="button"
      className={`w-5 h-5 border border-[#2a3f5c] shrink-0 ${fg === color ? 'ring-2 ring-[#7eb8ff]' : ''}`}
      style={{ background: color }}
      onClick={() => setFg(color)}
      onContextMenu={(e) => {
        e.preventDefault();
        setBg(color);
      }}
    />
  );

  return (
    <div className="flex flex-col h-full bg-[#0d1218] text-[#c8d4e0] font-sans text-xs select-none">
      {/* Menu */}
      <div className="flex gap-4 px-2 py-1 border-b border-[#1e3a5f] bg-[#0a1018] text-[11px]">
        <div className="relative group">
          <span className="cursor-pointer hover:text-[#7eb8ff]">File</span>
          <div className="hidden group-hover:block absolute left-0 top-full z-50 bg-[#121a22] border border-[#2a3f5c] min-w-[180px] py-1 shadow-lg">
            <button type="button" className="block w-full text-left px-3 py-1 hover:bg-[#1e3a5f]" onClick={initCanvasWhite}>
              New
            </button>
            <button type="button" className="block w-full text-left px-3 py-1 hover:bg-[#1e3a5f]" onClick={() => setOpenDlg(true)}>
              Open…
            </button>
            <button type="button" className="block w-full text-left px-3 py-1 hover:bg-[#1e3a5f]" onClick={quickSave}>
              Save
            </button>
            <button type="button" className="block w-full text-left px-3 py-1 hover:bg-[#1e3a5f]" onClick={() => setSaveOpen(true)}>
              Save As…
            </button>
            <button type="button" className="block w-full text-left px-3 py-1 hover:bg-[#1e3a5f]" onClick={() => setAttrOpen(true)}>
              Attributes…
            </button>
            <hr className="border-[#2a3f5c] my-1" />
            <button type="button" className="block w-full text-left px-3 py-1 hover:bg-[#1e3a5f]" onClick={onClose}>
              Exit
            </button>
          </div>
        </div>
        <div className="relative group">
          <span className="cursor-pointer hover:text-[#7eb8ff]">Edit</span>
          <div className="hidden group-hover:block absolute left-0 top-full z-50 bg-[#121a22] border border-[#2a3f5c] min-w-[140px] py-1">
            <button type="button" className="block w-full text-left px-3 py-1 hover:bg-[#1e3a5f]" onClick={applyUndo}>
              Undo
            </button>
          </div>
        </div>
        <div className="relative group">
          <span className="cursor-pointer hover:text-[#7eb8ff]">View</span>
          <div className="hidden group-hover:block absolute left-0 top-full z-50 bg-[#121a22] border border-[#2a3f5c] min-w-[140px] py-1">
            {[1, 2, 4].map((z) => (
              <button
                key={z}
                type="button"
                className="block w-full text-left px-3 py-1 hover:bg-[#1e3a5f]"
                onClick={() => setZoom(z)}
              >
                Zoom {z}x
              </button>
            ))}
          </div>
        </div>
        <div className="relative group">
          <span className="cursor-pointer hover:text-[#7eb8ff]">Help</span>
          <div className="hidden group-hover:block absolute left-0 top-full z-50 bg-[#121a22] border border-[#2a3f5c] min-w-[200px] py-1">
            <div className="px-3 py-2 text-[10px] text-[#9ca8b8]">
              Axis Paint 2.0 — Synap-C brushes & heuristic fill. Save to Desktop, Documents, or Downloads.
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Tools */}
        <div className="flex flex-col gap-1 p-1 border-r border-[#1e3a5f] bg-[#0a1018] w-[52px]">
          {(
            [
              ['pencil', 'P'],
              ['brush', 'B'],
              ['airbrush', 'A'],
              ['eraser', 'E'],
              ['fill', 'F'],
              ['line', 'L'],
              ['rect', 'R'],
              ['ellipse', 'O'],
              ['roundrect', 'D'],
              ['text', 'T'],
              ['select', 'S'],
              ['picker', 'I'],
            ] as const
          ).map(([id, hint]) => (
            <button
              key={id}
              type="button"
              title={`${id} (${hint})`}
              className={`text-[9px] py-1 px-0.5 border ${tool === id ? 'border-[#7eb8ff] bg-[#1e3a5f]' : 'border-[#2a3f5c] hover:bg-[#152028]'}`}
              onClick={() => setTool(id)}
            >
              {hint}
            </button>
          ))}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2 p-1 border-b border-[#1e3a5f] bg-[#0f1419]">
            <span className="text-[10px] text-[#6b7c90]">Brush</span>
            <input
              type="range"
              min={1}
              max={16}
              value={brush}
              onChange={(e) => setBrush(+e.target.value)}
              className="w-24"
            />
            <label className="flex items-center gap-1 text-[10px] ml-2">
              <input type="checkbox" checked={filled} onChange={(e) => setFilled(e.target.checked)} />
              Filled shapes
            </label>
          </div>

          <div className="flex flex-1 min-h-0 overflow-auto bg-[#05080c] p-2">
            <div
              className="relative m-auto shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] border border-[#2a3f5c]"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
              <canvas
                ref={canvasRef}
                width={docW}
                height={docH}
                className="block bg-white cursor-crosshair max-w-none"
                onMouseDown={onDown}
                onMouseMove={onMove}
                onMouseUp={onUp}
                onMouseLeave={onUp}
                onContextMenu={(e) => e.preventDefault()}
              />
              <canvas ref={previewRef} className="absolute left-0 top-0 pointer-events-none max-w-none" />
            </div>
          </div>

          {/* Palette */}
          <div className="flex flex-wrap gap-0.5 p-2 border-t border-[#1e3a5f] bg-[#0a1018] items-center">
            {DEFAULT_PALETTE.map((col, i) => paletteSlot(col, i))}
            {customColors.map((col, i) => (
              <button
                key={`c${i}`}
                type="button"
                className="w-5 h-5 border border-dashed border-[#5b8fc7]"
                style={{ background: col }}
                onClick={() => {
                  const n = window.prompt('HTML color (#rrggbb)', col);
                  if (n) {
                    setCustomColors((prev) => {
                      const copy: [string, string] = [...prev];
                      copy[i] = n;
                      return copy;
                    });
                    setFg(n);
                  }
                }}
              />
            ))}
            <div className="ml-2 flex items-center gap-2 text-[10px]">
              <span className="w-6 h-6 border border-[#2a3f5c]" style={{ background: fg }} title="Foreground" />
              <span className="w-6 h-6 border border-[#2a3f5c]" style={{ background: bg }} title="Background (right-click palette)" />
            </div>
          </div>

          <div className="px-2 py-1 border-t border-[#1e3a5f] bg-[#0a1018] text-[10px] text-[#6b7c90] truncate">{status}</div>
        </div>
      </div>

      {saveOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="bg-[#121a22] border border-[#2a3f5c] p-4 w-[360px] shadow-xl">
            <h3 className="font-bold text-[#7eb8ff] mb-3">Save As (Vespera)</h3>
            <label className="block text-[10px] mb-1">Folder</label>
            <select
              className="w-full bg-black/40 border border-[#2a3f5c] p-1 mb-2 text-[11px]"
              value={saveFolder}
              onChange={(e) => setSaveFolder(e.target.value)}
            >
              {FOLDER_PRESETS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <label className="block text-[10px] mb-1">File name</label>
            <input
              className="w-full bg-black/40 border border-[#2a3f5c] p-1 mb-2 font-mono text-[11px]"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <label className="block text-[10px] mb-1">Format</label>
            <select
              className="w-full bg-black/40 border border-[#2a3f5c] p-1 mb-3 text-[11px]"
              value={saveExt}
              onChange={(e) => setSaveExt(e.target.value)}
            >
              {SAVE_TYPES.map((t) => (
                <option key={t.ext} value={t.ext}>
                  {t.label} ({t.ext})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-3 py-1 border border-[#3d5a80] text-[11px]" onClick={() => setSaveOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="px-3 py-1 border border-[#5b8fc7] bg-[#1e3a5f] text-[11px] font-bold"
                onClick={performSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {openDlg && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="bg-[#121a22] border border-[#2a3f5c] p-4 w-[380px] max-h-[70vh] flex flex-col shadow-xl">
            <h3 className="font-bold text-[#7eb8ff] mb-3">Open from Vespera</h3>
            <select
              className="w-full bg-black/40 border border-[#2a3f5c] p-1 mb-2 text-[11px]"
              value={openFolder}
              onChange={(e) => setOpenFolder(e.target.value)}
            >
              {FOLDER_PRESETS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="flex-1 overflow-y-auto border border-[#2a3f5c] min-h-[120px] max-h-[240px]">
              {imageNodes.length === 0 ? (
                <div className="p-2 text-[10px] text-[#6b7c90]">No image files in this folder.</div>
              ) : (
                imageNodes.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className="block w-full text-left px-2 py-1 hover:bg-[#1e3a5f] font-mono text-[11px]"
                    onClick={() => loadFromVfs(n)}
                  >
                    {n.name}
                  </button>
                ))
              )}
            </div>
            <button type="button" className="mt-2 px-3 py-1 border border-[#3d5a80] self-end text-[11px]" onClick={() => setOpenDlg(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {attrOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="bg-[#121a22] border border-[#2a3f5c] p-4 w-[300px]">
            <h3 className="font-bold text-[#7eb8ff] mb-3">Attributes</h3>
            <div className="flex gap-2 mb-3">
              <div>
                <label className="text-[10px]">Width</label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-[#2a3f5c] p-1"
                  value={attrW}
                  onChange={(e) => setAttrW(+e.target.value || 1)}
                />
              </div>
              <div>
                <label className="text-[10px]">Height</label>
                <input
                  type="number"
                  className="w-full bg-black/40 border border-[#2a3f5c] p-1"
                  value={attrH}
                  onChange={(e) => setAttrH(+e.target.value || 1)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-3 py-1 border border-[#3d5a80]" onClick={() => setAttrOpen(false)}>
                Cancel
              </button>
              <button type="button" className="px-3 py-1 border border-[#5b8fc7] bg-[#1e3a5f]" onClick={applyAttributes}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
