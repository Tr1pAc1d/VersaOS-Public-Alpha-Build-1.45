import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Plus, Trash2, Copy, File, Save, FolderOpen, Type, Image as ImageIcon, Square, Circle, Minus, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, RotateCcw, RotateCw, ChevronUp, ChevronDown, Search, X } from 'lucide-react';
import { VFSNode } from '../hooks/useVFS';
import { VersaSlideFilePicker } from './VersaSlideFilePicker';
import { VesperaSplash } from './VesperaSplash';

interface VersaSlideProps {
  vfs: any;
  onClose: () => void;
  initialFileId?: string;
  initialFileName?: string;
}

type ElementType = 'text' | 'image' | 'shape' | 'table';
type ShapeType = 'rectangle' | 'oval' | 'line';
type WordArtStyle = 'none' | 'rainbow' | 'shadow' | 'outline' | 'wave' | 'retro';

interface SlideElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  // Text props
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  rotation?: number;
  // Image props
  src?: string;
  // Shape props
  shapeType?: ShapeType;
  backgroundColor?: string;
  borderColor?: string;
  // WordArt props
  wordArtStyle?: WordArtStyle;
  // Table props
  tableData?: string[][];
}

interface Slide {
  id: string;
  elements: SlideElement[];
  backgroundColor: string;
  notes?: string;
  transition?: 'none' | 'fade' | 'wipe-left' | 'wipe-right' | 'dissolve' | 'zoom-in' | 'zoom-out' | 'slide-up' | 'slide-down';
  autoAdvanceDelay?: number; // 0 or undefined means disabled, >0 is seconds
}

interface Presentation {
  title: string;
  slides: Slide[];
  theme: string;
}

const THEMES: Record<string, { bg: string, text: string }> = {
  'Classic White':     { bg: '#ffffff', text: '#000000' },
  'Midnight Corporate':{ bg: '#000040', text: '#ffffff' },
  'Vespera Teal':      { bg: '#008080', text: '#ffffff' },
  'Retro Green':       { bg: '#004000', text: '#00ff00' },
  'Sunset Warm':       { bg: '#800040', text: '#ffffff' },
  'Ocean Blue':        { bg: '#003366', text: '#ffffff' },
  'Forest Green':      { bg: '#1a4a2e', text: '#ccffcc' },
  'Desert Sand':       { bg: '#c8a96e', text: '#3d1c00' },
  'Steel Gray':        { bg: '#4a4a5a', text: '#e8e8f0' },
  'Grape Purple':      { bg: '#4b0082', text: '#e8d5ff' },
  'Fiesta Red':        { bg: '#8b0000', text: '#fff0f0' },
  'Navy & Gold':       { bg: '#001f5b', text: '#ffd700' },
};

const FONTS = [
  'Arial', 'Arial Black', 'Arial Narrow',
  'Times New Roman', 'Georgia', 'Garamond',
  'Courier New', 'Lucida Console',
  'Comic Sans MS', 'Impact', 'Verdana',
  'Tahoma', 'Trebuchet MS', 'Century Gothic',
  'MS Sans Serif', 'Palatino Linotype',
];

const FONT_SIZES = [8,9,10,11,12,14,16,18,20,24,28,32,36,40,48,54,60,72,96];

const TRANSITIONS: { id: Slide['transition']; label: string }[] = [
  { id: 'none',       label: 'No Transition' },
  { id: 'fade',       label: 'Fade' },
  { id: 'wipe-left',  label: 'Wipe Left' },
  { id: 'wipe-right', label: 'Wipe Right' },
  { id: 'dissolve',   label: 'Dissolve' },
  { id: 'zoom-in',    label: 'Zoom In' },
  { id: 'zoom-out',   label: 'Zoom Out' },
  { id: 'slide-up',   label: 'Slide Up' },
  { id: 'slide-down', label: 'Slide Down' },
];

// Slide layout templates
const SLIDE_LAYOUTS: { id: string; label: string; elements: Partial<SlideElement>[] }[] = [
  {
    id: 'title',
    label: 'Title Slide',
    elements: [
      { type: 'text', x: 100, y: 140, width: 600, height: 110, content: 'Click to add title', fontSize: 40, fontFamily: 'Arial', color: '#000000', align: 'center', bold: true },
      { type: 'text', x: 150, y: 290, width: 500, height: 60,  content: 'Click to add subtitle', fontSize: 24, fontFamily: 'Arial', color: '#666666', align: 'center' },
    ],
  },
  {
    id: 'title-content',
    label: 'Title + Content',
    elements: [
      { type: 'text', x: 40, y: 20,  width: 720, height: 70,  content: 'Slide Title', fontSize: 32, fontFamily: 'Arial', color: '#000000', bold: true },
      { type: 'text', x: 40, y: 110, width: 720, height: 430, content: '• Point one\n• Point two\n• Point three', fontSize: 20, fontFamily: 'Arial', color: '#222222' },
    ],
  },
  {
    id: 'two-col',
    label: 'Two Columns',
    elements: [
      { type: 'text', x: 40,  y: 20,  width: 720, height: 70,  content: 'Slide Title', fontSize: 32, fontFamily: 'Arial', color: '#000000', bold: true },
      { type: 'text', x: 40,  y: 110, width: 340, height: 430, content: '• Left item 1\n• Left item 2\n• Left item 3', fontSize: 18, fontFamily: 'Arial', color: '#222222' },
      { type: 'text', x: 420, y: 110, width: 340, height: 430, content: '• Right item 1\n• Right item 2\n• Right item 3', fontSize: 18, fontFamily: 'Arial', color: '#222222' },
    ],
  },
  {
    id: 'blank',
    label: 'Blank Slide',
    elements: [],
  },
  {
    id: 'image-text',
    label: 'Image + Caption',
    elements: [
      { type: 'shape', shapeType: 'rectangle', x: 180, y: 60,  width: 440, height: 380, backgroundColor: '#cccccc', borderColor: '#888888' },
      { type: 'text',  x: 40,  y: 470, width: 720, height: 80,  content: 'Caption text here', fontSize: 20, fontFamily: 'Arial', color: '#333333', align: 'center' },
    ],
  },
  {
    id: 'section',
    label: 'Section Header',
    elements: [
      { type: 'text', x: 100, y: 200, width: 600, height: 120, content: 'Section Title', fontSize: 48, fontFamily: 'Arial Black', color: '#000000', bold: true, align: 'center' },
      { type: 'shape', shapeType: 'line', x: 200, y: 340, width: 400, height: 4, backgroundColor: '#000080', borderColor: '#000080' },
    ],
  },
];

const DEFAULT_SLIDE: Slide = {
  id: 'slide-1',
  elements: [
    {
      id: 'title-1', type: 'text', x: 100, y: 150, width: 600, height: 100,
      content: 'Click to add title', fontSize: 36, fontFamily: 'Arial', color: '#000000', align: 'center', bold: true
    },
    {
      id: 'subtitle-1', type: 'text', x: 150, y: 300, width: 500, height: 50,
      content: 'Click to add subtitle', fontSize: 24, fontFamily: 'Arial', color: '#666666', align: 'center'
    }
  ],
  backgroundColor: '#ffffff'
};

export const VersaSlide: React.FC<VersaSlideProps> = ({ vfs, onClose, initialFileId, initialFileName }) => {
  const [presentation, setPresentation] = useState<Presentation>({
    title: 'Presentation1.vsp',
    slides: [{ ...DEFAULT_SLIDE }],
    theme: 'Classic White'
  });
  
  const [activeSlideId, setActiveSlideId] = useState<string>('slide-1');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Home' | 'Insert' | 'Design' | 'Slideshow' | 'View'>('Home');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideshowPlaying, setSlideshowPlaying] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Splash screen
  const [splashDone, setSplashDone] = useState(false);

  // Undo / Redo
  const undoStack = useRef<Presentation[]>([]);
  const redoStack = useRef<Presentation[]>([]);

  // Clipboard
  const [clipboard, setClipboard] = useState<SlideElement | null>(null);

  // Misc UI
  const [zoom, setZoom] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [showClipart, setShowClipart] = useState(false);
  const [clipartQuery, setClipartQuery] = useState('');
  const [clipartResults, setClipartResults] = useState<{title: string; thumb: string; url: string}[]>([]);
  const [clipartLoading, setClipartLoading] = useState(false);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [currentFileId, setCurrentFileId] = useState<string | undefined>(initialFileId);
  const [isDirty, setIsDirty] = useState(false);

  // Grid snapping
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [gridSize, setGridSize] = useState(16);
  const [showGrid, setShowGrid] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStart, setRotationStart] = useState({ cx: 0, cy: 0, initialAngle: 0, initialElementRotation: 0 });

  const activeSlide = presentation.slides.find(s => s.id === activeSlideId) || presentation.slides[0];
  const selectedElement = activeSlide?.elements.find(e => e.id === selectedElementId);

  // Keyboard navigation for slideshow
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      } else if (e.key === 'ArrowRight' || e.key === 'Space') {
        if (currentSlideIndex < presentation.slides.length - 1) {
          setCurrentSlideIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentSlideIndex > 0) {
          setCurrentSlideIndex(prev => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, currentSlideIndex, presentation.slides.length]);

  // Slide autoplay timer
  useEffect(() => {
    if (!isFullscreen || !slideshowPlaying) return;
    const currentSlide = presentation.slides[currentSlideIndex];
    if (!currentSlide || !currentSlide.autoAdvanceDelay || currentSlide.autoAdvanceDelay <= 0) return;

    const timerId = setTimeout(() => {
      if (currentSlideIndex < presentation.slides.length - 1) {
        setCurrentSlideIndex(prev => prev + 1);
      } else {
        setIsFullscreen(false); // End show if it's the last slide
      }
    }, currentSlide.autoAdvanceDelay * 1000);

    return () => clearTimeout(timerId);
  }, [isFullscreen, slideshowPlaying, currentSlideIndex, presentation.slides]);

  // Menu bar outside click handler
  useEffect(() => {
    if (!openMenu) return;
    const closeMenu = () => setOpenMenu(null);
    window.addEventListener('mousedown', closeMenu);
    return () => window.removeEventListener('mousedown', closeMenu);
  }, [openMenu]);

  // Combined keyboard handler (delete, undo/redo, copy/paste, etc.)
  useEffect(() => {
    if (isFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); return; }
        if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) { e.preventDefault(); redo(); return; }
        if (e.key === 'c' && selectedElementId) { e.preventDefault(); setClipboard(activeSlide.elements.find(el => el.id === selectedElementId) || null); return; }
        if (e.key === 'v' && clipboard) {
          e.preventDefault();
          const pasted: SlideElement = { ...clipboard, id: `el-${Date.now()}`, x: clipboard.x + 16, y: clipboard.y + 16 };
          recordAndUpdate({ elements: [...activeSlide.elements, pasted] });
          setSelectedElementId(pasted.id);
          return;
        }
        if (e.key === 'd' && selectedElementId) {
          e.preventDefault();
          const src = activeSlide.elements.find(el => el.id === selectedElementId);
          if (src) { const dup = { ...src, id: `el-${Date.now()}`, x: src.x + 16, y: src.y + 16 }; recordAndUpdate({ elements: [...activeSlide.elements, dup] }); setSelectedElementId(dup.id); }
          return;
        }
        if (e.key === 'a') { e.preventDefault(); setSelectedElementId(activeSlide.elements[activeSlide.elements.length - 1]?.id || null); return; }
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !typing && selectedElementId) {
        recordAndUpdate({ elements: activeSlide.elements.filter(el => el.id !== selectedElementId) });
        setSelectedElementId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen, selectedElementId, activeSlide, clipboard]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-load file when opened via Open With / double-click
  useEffect(() => {
    if (!initialFileId) return;
    const node = vfs.nodes.find((n: any) => n.id === initialFileId);
    if (!node?.content) return;
    try {
      const loaded = JSON.parse(node.content);
      // Validate it looks like a presentation
      if (loaded?.slides && Array.isArray(loaded.slides)) {
        setPresentation({ ...loaded, title: initialFileName || loaded.title || node.name });
        setActiveSlideId(loaded.slides[0]?.id || 'slide-1');
        setIsDirty(false);
      }
    } catch {
      // File content is not valid JSON — open blank
    }
  }, [initialFileId]);


  // Hide the parent window frame until the splash screen is done
  useEffect(() => {
    const parentWin = containerRef.current?.closest('.absolute.bg-\\[\\#c0c0c0\\]') as HTMLElement;
    if (parentWin) {
      parentWin.style.visibility = splashDone ? 'visible' : 'hidden';
    }
  }, [splashDone]);

  // ── Undo / Redo ───────────────────────────────────────────────────────────
  const pushUndo = (prev: Presentation) => {
    undoStack.current = [...undoStack.current.slice(-49), prev];
    redoStack.current = [];
  };

  const undo = () => {
    if (!undoStack.current.length) return;
    const prev = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);
    redoStack.current = [presentation, ...redoStack.current.slice(0, 49)];
    setPresentation(prev);
  };

  const redo = () => {
    if (!redoStack.current.length) return;
    const next = redoStack.current[0];
    redoStack.current = redoStack.current.slice(1);
    undoStack.current = [...undoStack.current.slice(-49), presentation];
    setPresentation(next);
  };

  // Wraps slide-level updates with undo recording
  const recordAndUpdate = (updates: Partial<Slide>) => {
    pushUndo(presentation);
    setIsDirty(true);
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === activeSlideId ? { ...s, ...updates } : s)
    }));
  };

  const updateSlide = (slideId: string, updates: Partial<Slide>) => {
    setIsDirty(true);
    setPresentation(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === slideId ? { ...s, ...updates } : s)
    }));
  };

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    updateSlide(activeSlideId, {
      elements: activeSlide.elements.map(e => e.id === elementId ? { ...e, ...updates } : e)
    });
  };

  // ── Layer ordering ────────────────────────────────────────────────────────
  const bringForward = () => {
    if (!selectedElementId) return;
    const els = [...activeSlide.elements];
    const i = els.findIndex(e => e.id === selectedElementId);
    if (i < els.length - 1) { [els[i], els[i + 1]] = [els[i + 1], els[i]]; recordAndUpdate({ elements: els }); }
  };

  const sendBackward = () => {
    if (!selectedElementId) return;
    const els = [...activeSlide.elements];
    const i = els.findIndex(e => e.id === selectedElementId);
    if (i > 0) { [els[i], els[i - 1]] = [els[i - 1], els[i]]; recordAndUpdate({ elements: els }); }
  };

  // ── Clipart (Wikimedia Commons) ───────────────────────────────────────────
  const searchClipart = async () => {
    if (!clipartQuery.trim()) return;
    setClipartLoading(true);
    setClipartResults([]);
    try {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(clipartQuery + ' clipart')}&srnamespace=6&format=json&origin=*&srlimit=16`;
      const res = await fetch(searchUrl);
      const data = await res.json();
      const titles: string[] = data.query.search.map((r: any) => r.title.replace('File:', ''));
      if (!titles.length) { setClipartLoading(false); return; }
      const imgUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles.slice(0, 12).map(t => 'File:' + t).join('|'))}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=80&format=json&origin=*`;
      const imgRes = await fetch(imgUrl);
      const imgData = await imgRes.json();
      const pages = Object.values(imgData.query.pages) as any[];
      const results = pages
        .filter(p => p.imageinfo?.[0]?.url)
        .map(p => ({
          title: p.title.replace('File:', ''),
          url: p.imageinfo[0].url,
          thumb: p.imageinfo[0].thumburl || p.imageinfo[0].url,
        }));
      setClipartResults(results);
    } catch { setClipartResults([]); }
    setClipartLoading(false);
  };

  const insertClipart = (url: string) => {
    const el: SlideElement = { id: `img-${Date.now()}`, type: 'image', x: 200, y: 150, width: 200, height: 150, src: url };
    recordAndUpdate({ elements: [...activeSlide.elements, el] });
    setSelectedElementId(el.id);
  };

  // ── Save As ───────────────────────────────────────────────────────────────
  const handleSaveAs = (folderId: string, filename: string) => {
    const content = JSON.stringify(presentation);
    const existing = vfs.nodes.find((n: VFSNode) => n.parentId === folderId && n.name === filename);
    if (existing) {
      vfs.updateFileContent(existing.id, content);
      setCurrentFileId(existing.id);
    } else {
      const newNode = vfs.createNode(filename, 'file', folderId, content, undefined, 'file', { customIcon: '/Icons/Microsoft Office/97_powerpoint_32.png' });
      setCurrentFileId(newNode.id);
    }
    setPresentation(prev => ({ ...prev, title: filename }));
    setIsDirty(false);
    setShowSaveAs(false);
  };


  const addSlide = () => {
    setShowLayoutPicker(true);
  };

  const confirmAddSlide = (layoutId: string) => {
    const layout = SLIDE_LAYOUTS.find(l => l.id === layoutId);
    
    // Process layout elements to assign IDs and default styles
    const newElements = (layout?.elements || []).map(el => {
      const isText = el.type === 'text';
      return {
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random()}`,
        ...(isText && { color: el.color || THEMES[presentation.theme].text }),
        ...(!isText && { backgroundColor: el.backgroundColor || THEMES[presentation.theme].bg }),
      } as SlideElement;
    });

    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      elements: newElements,
      backgroundColor: THEMES[presentation.theme].bg,
      transition: 'none'
    };
    
    setPresentation(prev => ({ ...prev, slides: [...prev.slides, newSlide] }));
    setActiveSlideId(newSlide.id);
    setShowLayoutPicker(false);
  };

  const duplicateSlide = () => {
    const newSlide: Slide = {
      ...activeSlide,
      id: `slide-${Date.now()}`,
      elements: activeSlide.elements.map(e => ({ ...e, id: `${e.type}-${Date.now()}-${Math.random()}` }))
    };
    const currentIndex = presentation.slides.findIndex(s => s.id === activeSlideId);
    const newSlides = [...presentation.slides];
    newSlides.splice(currentIndex + 1, 0, newSlide);
    setPresentation(prev => ({ ...prev, slides: newSlides }));
    setActiveSlideId(newSlide.id);
  };

  const deleteSlide = () => {
    if (presentation.slides.length <= 1) return;
    const currentIndex = presentation.slides.findIndex(s => s.id === activeSlideId);
    const newSlides = presentation.slides.filter(s => s.id !== activeSlideId);
    setPresentation(prev => ({ ...prev, slides: newSlides }));
    setActiveSlideId(newSlides[Math.max(0, currentIndex - 1)].id);
  };

  const addElement = (type: ElementType, shapeType?: ShapeType, wordArtStyle?: WordArtStyle, rows?: number, cols?: number) => {
    const newEl: SlideElement = {
      id: `${type}-${Date.now()}`,
      type,
      x: 200, y: 200, width: type === 'table' ? 300 : 200, height: type === 'table' ? 150 : 100,
    };

    if (type === 'text') {
      newEl.content = wordArtStyle && wordArtStyle !== 'none' ? 'WordArt Text' : 'Double-click to edit text';
      newEl.fontSize = wordArtStyle && wordArtStyle !== 'none' ? 48 : 18;
      newEl.fontFamily = wordArtStyle && wordArtStyle !== 'none' ? 'Impact' : 'Arial';
      newEl.color = THEMES[presentation.theme].text;
      newEl.align = 'center';
      if (wordArtStyle) newEl.wordArtStyle = wordArtStyle;
    } else if (type === 'shape') {
      newEl.shapeType = shapeType;
      newEl.backgroundColor = '#000080';
      newEl.borderColor = '#000000';
    } else if (type === 'image') {
      newEl.src = 'https://placehold.co/200x150?text=Image';
    } else if (type === 'table') {
      newEl.tableData = Array(rows || 3).fill(null).map(() => Array(cols || 3).fill('Cell'));
      newEl.backgroundColor = '#ffffff';
      newEl.borderColor = '#000000';
      newEl.color = '#000000';
    }

    updateSlide(activeSlideId, { elements: [...activeSlide.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const loadPresentation = () => {
    setShowOpenPicker(true);
  };

  const applyTheme = (themeName: string) => {
    const theme = THEMES[themeName];
    setPresentation(prev => ({
      ...prev,
      theme: themeName,
      slides: prev.slides.map(s => ({ ...s, backgroundColor: theme.bg }))
    }));
  };

  const handleDragStart = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canvasRef.current) return;
    setSelectedElementId(el.id);
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    // Store offset entirely in slide-space (800×600)
    setDragOffset({
      x: (e.clientX - rect.left) * scaleX - el.x,
      y: (e.clientY - rect.top) * scaleY - el.y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedElementId(el.id);
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, w: el.width, h: el.height });
  };

  const handleRotateStart = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canvasRef.current) return;
    setSelectedElementId(el.id);
    setIsRotating(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    
    const screenCx = rect.left + (cx / scaleX);
    const screenCy = rect.top + (cy / scaleY);
    
    const initialAngle = Math.atan2(e.clientY - screenCy, e.clientX - screenCx) * (180 / Math.PI);
    setRotationStart({ cx: screenCx, cy: screenCy, initialAngle, initialElementRotation: el.rotation || 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedElement || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;

    const snapVal = (v: number) => snapEnabled ? Math.round(v / gridSize) * gridSize : v;
    if (isDragging) {
      // Convert mouse to slide-space then subtract the stored slide-space offset
      const rawX = (e.clientX - rect.left) * scaleX - dragOffset.x;
      const rawY = (e.clientY - rect.top) * scaleY - dragOffset.y;
      const newX = snapVal(Math.max(0, Math.min(800 - selectedElement.width, rawX)));
      const newY = snapVal(Math.max(0, Math.min(600 - selectedElement.height, rawY)));
      updateElement(selectedElement.id, { x: newX, y: newY });
    } else if (isResizing) {
      // dx/dy are in screen pixels — scale them to slide-space
      const dx = (e.clientX - resizeStart.x) * scaleX;
      const dy = (e.clientY - resizeStart.y) * scaleY;
      updateElement(selectedElement.id, {
        width: Math.max(20, resizeStart.w + dx),
        height: Math.max(20, resizeStart.h + dy),
      });
    } else if (isRotating) {
      const angle = Math.atan2(e.clientY - rotationStart.cy, e.clientX - rotationStart.cx) * (180 / Math.PI);
      let diff = angle - rotationStart.initialAngle;
      
      let newRot = rotationStart.initialElementRotation + diff;
      if (e.shiftKey) {
        newRot = Math.round(newRot / 15) * 15;
      }
      
      newRot = (Math.round(newRot) % 360 + 360) % 360;
      updateElement(selectedElement.id, { rotation: newRot });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  };

  const renderToolbar = () => {
    return (
      <div className="bg-[#c0c0c0] border-b-2 border-gray-500 p-1 flex flex-col gap-1">
        <div className="flex gap-1 border-b border-gray-400 pb-1">
          <button onClick={() => setActiveTab('Home')} className={`px-3 py-1 text-sm ${activeTab === 'Home' ? 'bg-white border border-gray-400' : 'hover:bg-[#d4d4d4]'}`}>Home</button>
          <button onClick={() => setActiveTab('Insert')} className={`px-3 py-1 text-sm ${activeTab === 'Insert' ? 'bg-white border border-gray-400' : 'hover:bg-[#d4d4d4]'}`}>Insert</button>
          <button onClick={() => setActiveTab('Design')} className={`px-3 py-1 text-sm ${activeTab === 'Design' ? 'bg-white border border-gray-400' : 'hover:bg-[#d4d4d4]'}`}>Design</button>
          <button onClick={() => setActiveTab('Slideshow')} className={`px-3 py-1 text-sm ${activeTab === 'Slideshow' ? 'bg-white border border-gray-400' : 'hover:bg-[#d4d4d4]'}`}>Slideshow</button>
          <button onClick={() => setActiveTab('View')} className={`px-3 py-1 text-sm ${activeTab === 'View' ? 'bg-white border border-gray-400' : 'hover:bg-[#d4d4d4]'}`}>View</button>
        </div>

        <div className="flex items-center gap-2 p-1 min-h-[32px]">
          {activeTab === 'Home' && (
            <>
              <button onClick={() => { pushUndo(presentation); setPresentation({ title: 'Presentation1.vsp', slides: [{ ...DEFAULT_SLIDE }], theme: 'Classic White' }); setActiveSlideId('slide-1'); setIsDirty(false); setCurrentFileId(undefined); }} className="p-1 hover:bg-[#d4d4d4] border border-transparent hover:border-gray-400" title="New"><File size={16} /></button>
              <button onClick={loadPresentation} className="p-1 hover:bg-[#d4d4d4] border border-transparent hover:border-gray-400" title="Open"><FolderOpen size={16} /></button>
              <button onClick={() => {
                if (currentFileId) {
                  const content = JSON.stringify(presentation);
                  vfs.updateFileContent(currentFileId, content);
                  setIsDirty(false);
                } else {
                  setShowSaveAs(true); 
                }
              }} className="p-1 hover:bg-[#d4d4d4] border border-transparent hover:border-gray-400" title="Save"><Save size={16} /></button>
              <div className="w-px h-6 bg-gray-500 mx-1" />
              <button onClick={undo} disabled={!undoStack.current.length} className={`p-1 border border-transparent hover:border-gray-400 ${undoStack.current.length ? 'hover:bg-[#d4d4d4]' : 'opacity-30 cursor-not-allowed'}`} title="Undo (Ctrl+Z)"><RotateCcw size={16} /></button>
              <button onClick={redo} disabled={!redoStack.current.length} className={`p-1 border border-transparent hover:border-gray-400 ${redoStack.current.length ? 'hover:bg-[#d4d4d4]' : 'opacity-30 cursor-not-allowed'}`} title="Redo (Ctrl+Y)"><RotateCw size={16} /></button>
              <div className="w-px h-6 bg-gray-500 mx-1" />
              <button onClick={bringForward} disabled={!selectedElementId} className={`p-1 border border-transparent hover:border-gray-400 ${selectedElementId ? 'hover:bg-[#d4d4d4]' : 'opacity-30 cursor-not-allowed'}`} title="Bring Forward"><ChevronUp size={16} /></button>
              <button onClick={sendBackward} disabled={!selectedElementId} className={`p-1 border border-transparent hover:border-gray-400 ${selectedElementId ? 'hover:bg-[#d4d4d4]' : 'opacity-30 cursor-not-allowed'}`} title="Send Backward"><ChevronDown size={16} /></button>
              <div className="w-px h-6 bg-gray-500 mx-1" />
              
              <select
                className="border border-gray-400 p-1 text-sm w-44"
                value={selectedElement?.fontFamily || 'Arial'}
                onChange={(e) => selectedElement && updateElement(selectedElement.id, { fontFamily: e.target.value })}
                disabled={!selectedElement || selectedElement.type !== 'text'}
              >
                {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
              </select>

              <select
                className="border border-gray-400 p-1 text-sm w-14"
                value={selectedElement?.fontSize || 18}
                onChange={(e) => selectedElement && updateElement(selectedElement.id, { fontSize: +e.target.value })}
                disabled={!selectedElement || selectedElement.type !== 'text'}
              >
                {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <div className="flex border border-gray-400 bg-white">
                <button onClick={() => selectedElement && updateElement(selectedElement.id, { bold: !selectedElement.bold })} className={`p-1 ${selectedElement?.bold ? 'bg-gray-300' : 'hover:bg-gray-200'}`} disabled={!selectedElement || selectedElement.type !== 'text'}><Bold size={16} /></button>
                <button onClick={() => selectedElement && updateElement(selectedElement.id, { italic: !selectedElement.italic })} className={`p-1 ${selectedElement?.italic ? 'bg-gray-300' : 'hover:bg-gray-200'}`} disabled={!selectedElement || selectedElement.type !== 'text'}><Italic size={16} /></button>
                <button onClick={() => selectedElement && updateElement(selectedElement.id, { underline: !selectedElement.underline })} className={`p-1 ${selectedElement?.underline ? 'bg-gray-300' : 'hover:bg-gray-200'}`} disabled={!selectedElement || selectedElement.type !== 'text'}><Underline size={16} /></button>
              </div>

              <div className="flex border border-gray-400 bg-white">
                <button onClick={() => selectedElement && updateElement(selectedElement.id, { align: 'left' })} className={`p-1 ${selectedElement?.align === 'left' ? 'bg-gray-300' : 'hover:bg-gray-200'}`} disabled={!selectedElement || selectedElement.type !== 'text'}><AlignLeft size={16} /></button>
                <button onClick={() => selectedElement && updateElement(selectedElement.id, { align: 'center' })} className={`p-1 ${selectedElement?.align === 'center' ? 'bg-gray-300' : 'hover:bg-gray-200'}`} disabled={!selectedElement || selectedElement.type !== 'text'}><AlignCenter size={16} /></button>
                <button onClick={() => selectedElement && updateElement(selectedElement.id, { align: 'right' })} className={`p-1 ${selectedElement?.align === 'right' ? 'bg-gray-300' : 'hover:bg-gray-200'}`} disabled={!selectedElement || selectedElement.type !== 'text'}><AlignRight size={16} /></button>
              </div>

              {/* Text color (text elements) */}
              {selectedElement?.type === 'text' && (
                <>
                  <label className="flex items-center gap-1 text-xs">
                    <span>A</span>
                    <input type="color" value={selectedElement.color || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                      title="Text Color" className="w-6 h-6 p-0 border-0" />
                  </label>
                  <div className="w-px h-6 bg-gray-500 mx-1" />
                  <label className="flex items-center gap-1 text-xs" title="Line Spacing">
                    <span>↕</span>
                    <input type="number" step="0.1" min="0.5" max="3" className="border border-gray-400 p-0.5 text-xs w-12"
                      value={selectedElement.lineHeight || 1.2}
                      onChange={e => updateElement(selectedElement.id, { lineHeight: parseFloat(e.target.value) || 1.2 })} />
                  </label>
                  <label className="flex items-center gap-1 text-xs" title="Letter Spacing">
                    <span>↔</span>
                    <input type="number" step="1" min="-5" max="20" className="border border-gray-400 p-0.5 text-xs w-12"
                      value={selectedElement.letterSpacing || 0}
                      onChange={e => updateElement(selectedElement.id, { letterSpacing: parseInt(e.target.value) || 0 })} />
                  </label>
                </>
              )}

              <div className="w-px h-6 bg-gray-500 mx-1" />
              <button 
                className={`p-1 border text-sm flex items-center gap-1 ${showProperties ? 'bg-[#d4d4d4] border-gray-500' : 'border-transparent hover:bg-[#d4d4d4] hover:border-gray-400'}`}
                onClick={() => setShowProperties(!showProperties)}
                disabled={!selectedElementId}
              >
                Props
              </button>

              {/* Shape fill + border color (shape elements) */}
              {selectedElement?.type === 'shape' && (
                <>
                  <div className="w-px h-6 bg-gray-500 mx-1" />
                  <label className="flex items-center gap-1 text-xs">
                    <span>Fill</span>
                    <input type="color" value={selectedElement.backgroundColor || '#000080'}
                      onChange={(e) => updateElement(selectedElement.id, { backgroundColor: e.target.value })}
                      title="Fill Color" className="w-6 h-6 p-0 border-0" />
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <span>Line</span>
                    <input type="color" value={selectedElement.borderColor || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, { borderColor: e.target.value })}
                      title="Border Color" className="w-6 h-6 p-0 border-0" />
                  </label>
                </>
              )}
            </>
          )}

          {activeTab === 'Insert' && (
            <>
              <button onClick={() => addElement('text')} className="flex items-center gap-1 p-1 hover:bg-[#d4d4d4] border border-transparent hover:border-gray-400 text-sm"><Type size={16} /> Text Box</button>
              <button onClick={() => addElement('image')} className="flex items-center gap-1 p-1 hover:bg-[#d4d4d4] border border-transparent hover:border-gray-400 text-sm"><ImageIcon size={16} /> Image URL</button>
              <div className="w-px h-6 bg-gray-500 mx-1" />
              <button onClick={() => addElement('shape', 'rectangle')} className="flex items-center gap-1 p-1 hover:bg-[#d4d4d4] border border-transparent hover:border-gray-400 text-sm"><Square size={16} /> Rect</button>
              <button onClick={() => addElement('shape', 'oval')} className="flex items-center gap-1 p-1 hover:bg-[#d4d4d4] border border-transparent hover:border-gray-400 text-sm"><Circle size={16} /> Oval</button>
              <button onClick={() => addElement('shape', 'line')} className="flex items-center gap-1 p-1 hover:bg-[#d4d4d4] border border-transparent hover:border-gray-400 text-sm"><Minus size={16} /> Line</button>
              <div className="w-px h-6 bg-gray-500 mx-1" />
              <button onClick={() => setShowClipart(c => !c)} className={`flex items-center gap-1 p-1 border text-sm ${showClipart ? 'bg-[#d4d4d4] border-gray-500' : 'border-transparent hover:bg-[#d4d4d4] hover:border-gray-400'}`}><Search size={16} /> Clipart…</button>
            </>
          )}

          {activeTab === 'Design' && (
            <>
              <span className="text-sm mr-2">Theme:</span>
              <select 
                className="border border-gray-400 p-1 text-sm"
                value={presentation.theme}
                onChange={(e) => applyTheme(e.target.value)}
              >
                {Object.keys(THEMES).map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <div className="w-px h-6 bg-gray-500 mx-2" />
              <span className="text-sm mr-2">Slide Bg:</span>
              <input 
                type="color" 
                value={activeSlide.backgroundColor}
                onChange={(e) => updateSlide(activeSlideId, { backgroundColor: e.target.value })}
                className="w-6 h-6 p-0 border-0"
              />
            </>
          )}

          {activeTab === 'Slideshow' && (
            <>
              <button onClick={() => { setCurrentSlideIndex(0); setIsFullscreen(true); }} className="flex items-center gap-1 p-1 hover:bg-[#d4d4d4] border border-transparent hover:border-gray-400 text-sm text-blue-800 font-bold"><Play size={16} /> From Beginning</button>
              <button onClick={() => { setCurrentSlideIndex(presentation.slides.findIndex(s => s.id === activeSlideId)); setIsFullscreen(true); }} className="flex items-center gap-1 p-1 hover:bg-[#d4d4d4] border border-transparent hover:border-gray-400 text-sm"><Play size={16} /> From Current</button>
              <div className="w-px h-6 bg-gray-500 mx-2" />
              <span className="text-sm mr-2">Transition:</span>
              <select 
                className="border border-gray-400 p-1 text-sm"
                value={activeSlide.transition || 'none'}
                onChange={(e) => updateSlide(activeSlideId, { transition: e.target.value as Slide['transition'] })}
              >
                {TRANSITIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <div className="w-px h-6 bg-gray-500 mx-2" />
              <span className="text-sm mr-2" title="Advance after X seconds">Timer (sec):</span>
              <input 
                type="number" 
                min={0}
                className="border border-gray-400 p-1 text-sm w-16"
                value={activeSlide.autoAdvanceDelay || 0}
                onChange={(e) => updateSlide(activeSlideId, { autoAdvanceDelay: Math.max(0, parseInt(e.target.value) || 0) })}
              />
            </>
          )}

          {activeTab === 'View' && (
            <>
              <label className="flex items-center gap-1 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={snapEnabled} onChange={e => setSnapEnabled(e.target.checked)} />
                Snap to Grid
              </label>
              <div className="w-px h-6 bg-gray-500 mx-1" />
              <span className="text-sm">Grid:</span>
              <select
                className="border border-gray-400 p-1 text-sm"
                value={gridSize}
                onChange={e => setGridSize(+e.target.value)}
                disabled={!snapEnabled}
              >
                <option value={4}>Fine (4 px)</option>
                <option value={8}>Small (8 px)</option>
                <option value={16}>Medium (16 px)</option>
                <option value={24}>Large (24 px)</option>
                <option value={32}>Coarse (32 px)</option>
              </select>
              <div className="w-px h-6 bg-gray-500 mx-1" />
              <label className="flex items-center gap-1 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
                Show Grid
              </label>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderElement = (el: SlideElement, interactive = true) => {
    const isSelected = el.id === selectedElementId && interactive;
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${el.x}px`,
      top: `${el.y}px`,
      width: `${el.width}px`,
      height: `${el.height}px`,
      border: isSelected ? '1px dashed #666' : '1px solid transparent',
      cursor: interactive ? (isDragging && isSelected ? 'grabbing' : 'grab') : 'default',
    };

    let content = null;

    const isEditing = interactive && el.id === editingElementId;

    if (el.type === 'text') {
      if (isEditing) {
        // Edit mode: focusable textarea, no drag interception
        content = (
          <textarea
            autoFocus
            value={el.content}
            onChange={(e) => updateElement(el.id, { content: e.target.value })}
            className="w-full h-full bg-transparent border-none outline-none resize-none overflow-hidden"
            style={{
              fontSize: `${el.fontSize}px`,
              fontFamily: el.fontFamily,
              color: el.color,
              textAlign: el.align,
              fontWeight: el.bold ? 'bold' : 'normal',
              fontStyle: el.italic ? 'italic' : 'normal',
              textDecoration: el.underline ? 'underline' : 'none',
              lineHeight: el.lineHeight || 1.2,
              letterSpacing: `${el.letterSpacing || 0}px`,
              cursor: 'text',
              userSelect: 'auto',
            }}
          />
        );
      } else {
        // Select/drag mode: non-editable display div
        content = (
          <div 
            className={el.wordArtStyle && el.wordArtStyle !== 'none' ? `wordart-${el.wordArtStyle}` : ''}
            style={{
              width: '100%', height: '100%',
              fontSize: `${el.fontSize}px`,
              fontFamily: el.fontFamily,
              color: el.color,
              textAlign: el.align,
              fontWeight: el.bold ? 'bold' : 'normal',
              fontStyle: el.italic ? 'italic' : 'normal',
              textDecoration: el.underline ? 'underline' : 'none',
              lineHeight: el.lineHeight || 1.2,
              letterSpacing: `${el.letterSpacing || 0}px`,
              whiteSpace: 'pre-wrap',
              pointerEvents: 'none',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: el.align === 'center' ? 'center' : el.align === 'right' ? 'flex-end' : 'flex-start',
            }}
          >
            {el.content}
          </div>
        );
      }
    } else if (el.type === 'image') {
      content = <img src={el.src} alt="" className="w-full h-full object-cover" style={{ pointerEvents: 'none' }} />;
    } else if (el.type === 'shape') {
      if (el.shapeType === 'rectangle') {
        content = <div style={{ width: '100%', height: '100%', backgroundColor: el.backgroundColor, border: `2px solid ${el.borderColor}`, pointerEvents: 'none' }} />;
      } else if (el.shapeType === 'oval') {
        content = <div style={{ width: '100%', height: '100%', backgroundColor: el.backgroundColor, border: `2px solid ${el.borderColor}`, borderRadius: '50%', pointerEvents: 'none' }} />;
      } else if (el.shapeType === 'line') {
        content = <div style={{ width: '100%', height: '2px', backgroundColor: el.borderColor, marginTop: el.height / 2, pointerEvents: 'none' }} />;
      }
    } else if (el.type === 'table') {
      content = (
        <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', pointerEvents: 'none' }}>
          <tbody>
            {(el.tableData || [['']]).map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} style={{ border: `2px solid ${el.borderColor || '#000'}`, padding: '4px', backgroundColor: el.backgroundColor, color: el.color, fontSize: '14px', fontFamily: 'Arial', overflow: 'hidden' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <div
        key={el.id}
        style={{
          ...style,
          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
          transformOrigin: 'center center',
          cursor: !interactive ? 'default' : isEditing ? 'text' : isDragging && isSelected ? 'grabbing' : 'grab',
        }}
        onMouseDown={(e) => {
          if (!interactive || isEditing) return;
          handleDragStart(e, el);
        }}
        onDoubleClick={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          if (el.type === 'text') {
            setSelectedElementId(el.id);
            setEditingElementId(el.id);
          } else if (el.type === 'image') {
            const url = prompt('Enter image URL:', el.src);
            if (url) updateElement(el.id, { src: url });
          } else if (el.type === 'table') {
            const currentCsv = (el.tableData || [['']]).map(r => r.join(',')).join('\\n');
            const newCsv = prompt('Edit table data (CSV format, separate columns with commas, rows with newlines):', currentCsv);
            if (newCsv !== null) {
              const newData = newCsv.split('\\n').map(row => row.split(','));
              updateElement(el.id, { tableData: newData });
            }
          }
        }}
      >
        {content}
        {isSelected && !isEditing && (
          <>
            <div
              className="absolute left-[-6px] top-[-6px] w-3 h-3 rounded-full bg-blue-500 border-2 border-white cursor-pointer shadow-sm z-50 hover:bg-blue-400 hover:scale-110 transition-transform"
              onMouseDown={(e) => handleRotateStart(e, el)}
              title="Rotate (Hold Shift to snap)"
            />
            <div
              className="absolute right-[-5px] bottom-[-5px] w-2.5 h-2.5 bg-white border border-black cursor-se-resize z-50"
              onMouseDown={(e) => handleResizeStart(e, el)}
            />
          </>
        )}
      </div>
    );
  };

  if (isFullscreen) {
    const slide = presentation.slides[currentSlideIndex];
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center" onClick={() => { if (currentSlideIndex < presentation.slides.length - 1) setCurrentSlideIndex(prev => prev + 1); }}>
        <div 
          key={slide.id}
          className={`relative shadow-2xl transition-${slide.transition || 'none'}`} 
          style={{ width: '800px', height: '600px', backgroundColor: slide.backgroundColor }}
        >
          {slide.elements.map(el => renderElement(el, false))}
        </div>
        <div className="absolute bottom-4 left-4 text-white/50 text-xs font-mono z-50 flex items-center gap-4">
          <span className="pointer-events-none">
            Slide {currentSlideIndex + 1} of {presentation.slides.length} &nbsp;·&nbsp; ← → Navigate &nbsp;·&nbsp; ESC Exit
          </span>
          {slide.autoAdvanceDelay && slide.autoAdvanceDelay > 0 && (
            <button 
              className="bg-black/60 hover:bg-black/80 text-white border border-white/30 px-2 py-0.5 rounded cursor-pointer pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); setSlideshowPlaying(!slideshowPlaying); }}
            >
              {slideshowPlaying ? '⏸ Pause Timer' : '▶ Resume Timer'} ({slide.autoAdvanceDelay}s)
            </button>
          )}
        </div>
        <button className="absolute top-3 right-3 bg-black/60 text-white border border-white/30 text-xs px-2 py-1 z-50" onClick={e => { e.stopPropagation(); setIsFullscreen(false); }}>✕ Exit</button>
        {currentSlideIndex > 0 && <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white border border-white/30 text-lg px-3 py-2 z-50" onClick={e => { e.stopPropagation(); setCurrentSlideIndex(i => i - 1); }}>‹</button>}
        {currentSlideIndex < presentation.slides.length - 1 && <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white border border-white/30 text-lg px-3 py-2 z-50" onClick={e => { e.stopPropagation(); setCurrentSlideIndex(i => i + 1); }}>›</button>}
        
        {/* Global Transition Styles */}
        <style>{`
          @keyframes vsFade { from { opacity: 0; } to { opacity: 1; } }
          @keyframes vsWipeLeft { from { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); } to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } }
          @keyframes vsWipeRight { from { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); } to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } }
          @keyframes vsZoomIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes vsZoomOut { from { transform: scale(1.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes vsSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          @keyframes vsSlideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
          @keyframes vsDissolve { 0% { opacity: 0; filter: blur(10px); } 100% { opacity: 1; filter: blur(0px); } }

          .transition-fade { animation: vsFade 0.5s ease-in-out forwards; }
          .transition-wipe-left { animation: vsWipeLeft 0.5s ease-out forwards; }
          .transition-wipe-right { animation: vsWipeRight 0.5s ease-out forwards; }
          .transition-zoom-in { animation: vsZoomIn 0.5s ease-out forwards; }
          .transition-zoom-out { animation: vsZoomOut 0.5s ease-out forwards; }
          .transition-slide-up { animation: vsSlideUp 0.5s ease-out forwards; }
          .transition-slide-down { animation: vsSlideDown 0.5s ease-out forwards; }
          .transition-dissolve { animation: vsDissolve 0.6s ease-in-out forwards; }

          .wordart-rainbow { background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet); -webkit-background-clip: text; color: transparent; }
          .wordart-shadow { text-shadow: 4px 4px 0px #888, 8px 8px 0px #444; }
          .wordart-outline { -webkit-text-stroke: 2px black; color: white; }
          .wordart-wave { animation: vsWave 2s infinite ease-in-out; }
          .wordart-retro { background: linear-gradient(to bottom, #ff00ff, #00ffff); -webkit-background-clip: text; color: transparent; -webkit-text-stroke: 1px black; text-shadow: 3px 3px 0px black; }

          @keyframes vsWave { 0%, 100% { transform: translateY(0) skewX(-10deg); } 50% { transform: translateY(-10px) skewX(-10deg); } }
        `}</style>
      </div>
    );
  }
  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans overflow-hidden select-none">

      {/* Floating splash portal — shown over the whole OS desktop */}
      {!splashDone && (
        <VesperaSplash
          appName="VersaSlide"
          subtitle="Presentation Suite"
          version="Version 1.0"
          developer="Forethought, Inc."
          publisher="Vespera Systems"
          year="1996"
          icon="/Icons/Microsoft Office/97_powerpoint_32.png"
          licensedTo="Vespera OS User"
          loadingMessages={[
            'Initializing presentation engine...',
            'Loading drawing tools...',
            'Preparing slide canvas...',
            'Ready.',
          ]}
          durationMs={3000}
          onDone={() => setSplashDone(true)}
        />
      )}

      {/* Win95 Menu Bar */}
      <div className="flex gap-0 px-1 py-0.5 text-xs border-b border-gray-500 bg-[#c0c0c0] relative z-40">
        {[
          { label: 'File', items: [
            { label: 'New Presentation', action: () => { setPresentation({ title: 'Presentation1.vsp', slides: [{...DEFAULT_SLIDE}], theme: 'Classic White' }); setActiveSlideId('slide-1'); setCurrentFileId(undefined); } },
            { label: 'Open...', action: loadPresentation },
            { label: 'Save', action: () => { 
              if (currentFileId) {
                const content = JSON.stringify(presentation);
                vfs.updateFileContent(currentFileId, content);
                setIsDirty(false);
              } else {
                setShowSaveAs(true); 
              }
            } },
            { label: 'Save As...', action: () => setShowSaveAs(true) },
            { divider: true },
            { label: 'Exit', action: onClose }
          ]},
          { label: 'Edit', items: [
            { label: 'Undo', action: undo, disabled: undoStack.current.length === 0, shortcut: 'Ctrl+Z' },
            { label: 'Redo', action: redo, disabled: redoStack.current.length === 0, shortcut: 'Ctrl+Y' },
            { divider: true },
            { label: 'Cut', action: () => { if (selectedElementId) { setClipboard(activeSlide.elements.find(el => el.id === selectedElementId) || null); recordAndUpdate({ elements: activeSlide.elements.filter(el => el.id !== selectedElementId) }); setSelectedElementId(null); } }, disabled: !selectedElementId, shortcut: 'Ctrl+X' },
            { label: 'Copy', action: () => { if (selectedElementId) setClipboard(activeSlide.elements.find(el => el.id === selectedElementId) || null); }, disabled: !selectedElementId, shortcut: 'Ctrl+C' },
            { label: 'Paste', action: () => { if (clipboard) { const pasted = { ...clipboard, id: `el-${Date.now()}`, x: clipboard.x + 16, y: clipboard.y + 16 }; recordAndUpdate({ elements: [...activeSlide.elements, pasted] }); setSelectedElementId(pasted.id); } }, disabled: !clipboard, shortcut: 'Ctrl+V' },
            { label: 'Delete', action: () => { if (selectedElementId) { recordAndUpdate({ elements: activeSlide.elements.filter(el => el.id !== selectedElementId) }); setSelectedElementId(null); } }, disabled: !selectedElementId, shortcut: 'Del' },
            { divider: true },
            { label: 'Duplicate Slide', action: duplicateSlide }
          ]},
          { label: 'View', items: [
            { label: 'Normal', action: () => setActiveTab('Home') },
            { label: 'Slide Show', action: () => { setCurrentSlideIndex(presentation.slides.findIndex(s => s.id === activeSlideId)); setIsFullscreen(true); }, shortcut: 'F5' },
            { divider: true },
            { label: 'Toolbars >', action: () => {} },
            { label: 'Snap to Grid', action: () => setSnapEnabled(!snapEnabled), checked: snapEnabled }
          ]},
          { label: 'Insert', items: [
            { label: 'New Slide...', action: () => setShowLayoutPicker(true), shortcut: 'Ctrl+M' },
            { divider: true },
            { label: 'Text Box', action: () => addElement('text') },
            { label: 'Image URL...', action: () => addElement('image') },
            { label: 'Rectangle', action: () => addElement('shape', 'rectangle') },
            { label: 'Oval', action: () => addElement('shape', 'oval') },
            { label: 'Line', action: () => addElement('shape', 'line') },
            { divider: true },
            { label: 'WordArt...', action: () => {
              const style = prompt('Choose WordArt Style:\\n1: Rainbow\\n2: Shadow\\n3: Outline\\n4: Wave\\n5: Retro', '1');
              const styleMap: Record<string, WordArtStyle> = { '1': 'rainbow', '2': 'shadow', '3': 'outline', '4': 'wave', '5': 'retro' };
              if (style && styleMap[style]) addElement('text', undefined, styleMap[style]);
            }},
            { label: 'Table...', action: () => {
              const dim = prompt('Enter table dimensions (RowsxCols, e.g., 3x3):', '3x3');
              if (dim) {
                const parts = dim.split('x');
                const r = parseInt(parts[0]) || 3;
                const c = parseInt(parts[1]) || 3;
                addElement('table', undefined, undefined, r, c);
              }
            }}
          ]},
          { label: 'Format', items: [
            { label: 'Slide Theme...', action: () => setActiveTab('Design') },
            { label: 'Slide Background...', action: () => setActiveTab('Design') }
          ]},
          { label: 'Tools', items: [
            { label: 'Clipart Gallery...', action: () => setShowClipart(true) }
          ]},
          { label: 'Slide Show', items: [
            { label: 'View Show', action: () => { setCurrentSlideIndex(0); setIsFullscreen(true); } },
            { label: 'Slide Transitions...', action: () => setActiveTab('Slideshow') }
          ]}
        ].map(menu => (
          <div key={menu.label} className="relative group">
            <span 
              className={`px-2 py-0.5 cursor-pointer block ${openMenu === menu.label ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white'}`}
              onMouseDown={(e) => { e.stopPropagation(); setOpenMenu(openMenu === menu.label ? null : menu.label); }}
              onMouseEnter={() => { if (openMenu) setOpenMenu(menu.label); }}
            >
              {menu.label}
            </span>
            {openMenu === menu.label && (
              <div className="absolute top-full left-0 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] py-1 min-w-[180px] z-50">
                {menu.items.map((item, i) => item.divider ? (
                  <div key={i} className="my-1 border-t border-gray-500 border-b border-white mx-1" />
                ) : (
                  <div 
                    key={item.label} 
                    className={`px-4 py-1 flex items-center justify-between ${item.disabled ? 'text-gray-500' : 'hover:bg-[#000080] hover:text-white cursor-pointer'}`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      if (!item.disabled) {
                        item.action?.();
                        setOpenMenu(null);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3">{item.checked ? '✓' : ''}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.shortcut && <span className="opacity-70 ml-4">{item.shortcut}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <span className="ml-auto text-gray-500 px-2 py-0.5 italic">{isDirty ? `● ${presentation.title}` : presentation.title}</span>
      </div>

      {renderToolbar()}

      <div className="flex flex-1 overflow-hidden">
        {/* Slide panel */}
        <div className="w-40 bg-white border-r-2 border-gray-400 flex flex-col flex-shrink-0">
          <div className="flex bg-[#c0c0c0] border-b border-gray-400 p-1 gap-1">
            <button onClick={addSlide} className="flex-1 text-xs flex items-center justify-center gap-1 border border-transparent hover:border-gray-500 hover:bg-[#d4d4d4] py-1"><Plus size={12} /> New</button>
            <button onClick={duplicateSlide} className="flex-1 text-xs flex items-center justify-center gap-1 border border-transparent hover:border-gray-500 hover:bg-[#d4d4d4] py-1"><Copy size={12} /> Dup</button>
            <button onClick={deleteSlide} className="flex-1 text-xs flex items-center justify-center gap-1 border border-transparent hover:border-gray-500 hover:bg-[#d4d4d4] py-1 text-red-700"><Trash2 size={12} /> Del</button>
          </div>
          <div className="flex-1 overflow-y-auto p-1 flex flex-col gap-1 bg-gray-200">
            {presentation.slides.map((slide, i) => (
              <div key={slide.id} onClick={() => { setActiveSlideId(slide.id); setSelectedElementId(null); }}
                className={`flex gap-1 items-start cursor-pointer p-1 ${activeSlideId === slide.id ? 'bg-[#000080] text-white' : 'hover:bg-gray-300 text-black'}`}>
                <div className="text-xs font-bold w-4 text-center mt-1 flex-shrink-0">{i + 1}</div>
                <div className="flex-1 h-16 border border-gray-400 shadow-sm relative overflow-hidden pointer-events-none" style={{ backgroundColor: slide.backgroundColor }}>
                  <div style={{ transform: 'scale(0.13)', transformOrigin: 'top left', width: '800px', height: '600px' }}>
                    {slide.elements.map(el => renderElement(el, false))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 bg-gray-400 overflow-auto flex items-center justify-center p-6 relative"
            onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div ref={canvasRef} className="bg-white shadow-[3px_3px_12px_rgba(0,0,0,0.6)] relative flex-shrink-0"
              style={{ width: 800, height: 600, backgroundColor: activeSlide?.backgroundColor, transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              onClick={e => { if (e.target === canvasRef.current) { setSelectedElementId(null); setEditingElementId(null); } }}>
              {/* Grid overlay */}
              {showGrid && (
                <svg className="absolute inset-0 pointer-events-none" width={800} height={600} style={{ zIndex: 0 }}>
                  <defs>
                    <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                      <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(0,0,200,0.15)" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width={800} height={600} fill="url(#grid)" />
                </svg>
              )}
              {activeSlide?.elements.map(el => renderElement(el))}
            </div>
          </div>

          {/* Speaker Notes */}
          {showNotes && (
            <div className="h-28 border-t-2 border-gray-500 bg-white flex flex-col flex-shrink-0">
              <div className="text-xs bg-[#c0c0c0] border-b border-gray-400 px-2 py-0.5 font-bold">Speaker Notes — Slide {presentation.slides.findIndex(s => s.id === activeSlideId) + 1}</div>
              <textarea
                className="flex-1 p-2 text-sm resize-none outline-none border-none"
                placeholder="Click to add speaker notes for this slide…"
                value={activeSlide?.notes || ''}
                onChange={e => updateSlide(activeSlideId, { notes: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Clipart Panel */}
        {showClipart && (
          <div className="w-52 bg-[#c0c0c0] border-l-2 border-gray-400 flex flex-col flex-shrink-0">
            <div className="flex items-center justify-between bg-[#000080] text-white text-xs px-2 py-1 font-bold">
              <span>Insert Clipart</span>
              <button onClick={() => setShowClipart(false)} className="hover:bg-blue-700 px-1"><X size={12} /></button>
            </div>
            <div className="p-2 border-b border-gray-400 flex gap-1">
              <input
                className="flex-1 border border-gray-500 bg-white px-1 text-xs"
                placeholder="Search…"
                value={clipartQuery}
                onChange={e => setClipartQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchClipart()}
              />
              <button onClick={searchClipart} className="bg-[#c0c0c0] border border-gray-500 px-2 text-xs hover:bg-[#d4d4d4]">Find</button>
            </div>
            <div className="flex-1 overflow-y-auto p-1">
              {clipartLoading && <div className="text-xs text-center p-4 text-gray-600">Searching…</div>}
              {!clipartLoading && clipartResults.length === 0 && (
                <div className="text-xs text-center p-4 text-gray-500">Enter a search term and click Find.<br/><br/>Images from Wikimedia Commons.</div>
              )}
              <div className="grid grid-cols-3 gap-1">
                {clipartResults.map((r, i) => (
                  <button key={i} onClick={() => insertClipart(r.url)}
                    className="border border-gray-400 hover:border-[#000080] hover:bg-blue-50 p-0.5 aspect-square overflow-hidden"
                    title={r.title}>
                    <img src={r.thumb} alt={r.title} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Object Properties Panel */}
        {showProperties && selectedElement && (
          <div className="absolute right-4 top-24 w-48 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] z-40 flex flex-col pointer-events-auto">
            <div className="flex items-center justify-between bg-[#000080] text-white text-xs px-2 py-1 font-bold cursor-move">
              <span>Object Properties</span>
              <button onClick={() => setShowProperties(false)} className="hover:bg-blue-700 px-1"><X size={12} /></button>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2 text-xs">
              <label className="flex flex-col gap-0.5">
                <span>X Position</span>
                <input type="number" className="border border-gray-400 px-1" value={Math.round(selectedElement.x)} onChange={e => updateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })} />
              </label>
              <label className="flex flex-col gap-0.5">
                <span>Y Position</span>
                <input type="number" className="border border-gray-400 px-1" value={Math.round(selectedElement.y)} onChange={e => updateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })} />
              </label>
              <label className="flex flex-col gap-0.5">
                <span>Width</span>
                <input type="number" className="border border-gray-400 px-1" value={Math.round(selectedElement.width)} onChange={e => updateElement(selectedElement.id, { width: parseInt(e.target.value) || 0 })} />
              </label>
              <label className="flex flex-col gap-0.5">
                <span>Height</span>
                <input type="number" className="border border-gray-400 px-1" value={Math.round(selectedElement.height)} onChange={e => updateElement(selectedElement.id, { height: parseInt(e.target.value) || 0 })} />
              </label>
              <label className="flex flex-col gap-0.5 col-span-2">
                <span>Rotation (degrees)</span>
                <input type="number" className="border border-gray-400 px-1" value={selectedElement.rotation || 0} onChange={e => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) || 0 })} />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#c0c0c0] border-t-2 border-white flex items-center px-2 text-xs text-gray-700 gap-3 flex-shrink-0">
        <span className="border-r border-gray-400 pr-3">Slide {presentation.slides.findIndex(s => s.id === activeSlideId) + 1} / {presentation.slides.length}</span>
        <span className="border-r border-gray-400 pr-3">{presentation.theme}</span>
        <span className="border-r border-gray-400 pr-3">{selectedElement ? selectedElement.type : 'No selection'}</span>
        <button onClick={() => setShowNotes(n => !n)} className={`border px-2 ${showNotes ? 'border-gray-500 bg-[#d4d4d4]' : 'border-transparent hover:border-gray-400'}`}>Notes</button>
        <span className="ml-auto flex items-center gap-2">
          <span>{Math.round(zoom * 100)}%</span>
          <input type="range" min={0.4} max={1.6} step={0.05} value={zoom} onChange={e => setZoom(+e.target.value)} className="w-20 accent-gray-600" />
          <span className="text-gray-400">VersaSlide 1.0</span>
        </span>
      </div>

      {/* Save As Modal */}
      {showSaveAs && (
        <VersaSlideFilePicker
          vfs={vfs}
          defaultName={presentation.title.replace(/\.(vsp|pptx)$/i, '')}
          onConfirm={handleSaveAs}
          onCancel={() => setShowSaveAs(false)}
        />
      )}

      {/* Open Modal */}
      {showOpenPicker && (
        <VersaSlideFilePicker
          vfs={vfs}
          title="Open"
          mode="open"
          onConfirm={(folderId, filename) => {
            const existing = vfs.nodes.find((n: VFSNode) => n.parentId === folderId && n.name === filename);
            if (existing && existing.content) {
              try {
                const loaded = JSON.parse(existing.content);
                setPresentation(loaded);
                setActiveSlideId(loaded.slides[0]?.id);
                setCurrentFileId(existing.id);
                setIsDirty(false);
                setShowOpenPicker(false);
              } catch (e) { alert('Error loading file.'); }
            } else {
              alert('File not found or empty.');
            }
          }}
          onCancel={() => setShowOpenPicker(false)}
        />
      )}

      {/* New Slide Layout Picker Modal */}
      {showLayoutPicker && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-[500px] shadow-lg flex flex-col">
            <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center font-bold text-sm">
              <span>New Slide Layout</span>
              <button onClick={() => setShowLayoutPicker(false)} className="hover:bg-red-600 px-1 border border-transparent hover:border-white">
                <X size={14} />
              </button>
            </div>
            
            <div className="p-4 grid grid-cols-3 gap-4 bg-white m-2 border border-gray-400 overflow-y-auto max-h-[400px]">
              {SLIDE_LAYOUTS.map(layout => (
                <div key={layout.id} 
                  className="flex flex-col items-center gap-2 p-2 border border-transparent hover:border-[#000080] hover:bg-[#e0e0ff] cursor-pointer"
                  onClick={() => confirmAddSlide(layout.id)}
                >
                  <div className="w-[120px] h-[90px] border-2 border-gray-400 bg-white shadow-sm relative pointer-events-none overflow-hidden mx-auto flex-shrink-0">
                    {/* Render a miniature preview of the layout */}
                    <div className="absolute top-0 left-0" style={{ transform: 'scale(0.15)', transformOrigin: 'top left', width: '800px', height: '600px' }}>
                      {layout.elements.map((el, i) => renderElement({ ...el, id: `preview-${i}` } as SlideElement, false))}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-center">{layout.label}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 p-2 bg-[#c0c0c0]">
              <button onClick={() => setShowLayoutPicker(false)} className="px-6 py-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-sm hover:active:border-t-gray-800 hover:active:border-l-gray-800 hover:active:border-b-white hover:active:border-r-white hover:active:bg-[#a0a0a0]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Global Transition Styles */}
      <style>{`
        @keyframes vsFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vsWipeLeft { from { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); } to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } }
        @keyframes vsWipeRight { from { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); } to { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } }
        @keyframes vsZoomIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes vsZoomOut { from { transform: scale(1.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes vsSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes vsSlideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        @keyframes vsDissolve { 0% { opacity: 0; filter: blur(10px); } 100% { opacity: 1; filter: blur(0px); } }

        .transition-fade { animation: vsFade 0.5s ease-in-out forwards; }
        .transition-wipe-left { animation: vsWipeLeft 0.5s ease-out forwards; }
        .transition-wipe-right { animation: vsWipeRight 0.5s ease-out forwards; }
        .transition-zoom-in { animation: vsZoomIn 0.5s ease-out forwards; }
        .transition-zoom-out { animation: vsZoomOut 0.5s ease-out forwards; }
        .transition-slide-up { animation: vsSlideUp 0.5s ease-out forwards; }
        .transition-slide-down { animation: vsSlideDown 0.5s ease-out forwards; }
        .transition-dissolve { animation: vsDissolve 0.6s ease-in-out forwards; }

        .wordart-rainbow { background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet); -webkit-background-clip: text; color: transparent; text-shadow: none; }
        .wordart-shadow { text-shadow: 4px 4px 0px #888, 8px 8px 0px #444; }
        .wordart-outline { -webkit-text-stroke: 2px black; color: white; text-shadow: none; }
        .wordart-wave { animation: vsWave 2s infinite ease-in-out; }
        .wordart-retro { background: linear-gradient(to bottom, #ff00ff, #00ffff); -webkit-background-clip: text; color: transparent; -webkit-text-stroke: 1px black; text-shadow: 3px 3px 0px black; }

        @keyframes vsWave { 0%, 100% { transform: translateY(0) skewX(-10deg); } 50% { transform: translateY(-10px) skewX(-10deg); } }
      `}</style>
    </div>
  );
};

