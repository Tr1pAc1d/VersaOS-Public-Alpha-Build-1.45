import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Hammer, Settings, Save, FolderOpen, File as FileIcon,
  Copy, Scissors, ClipboardPaste, Undo, Plus, Trash2, Edit3,
  CheckCircle2, AlertTriangle, Package, Code2, Image as ImageIcon,
  X, ChevronRight, Monitor
} from 'lucide-react';
import type { AppManifest } from '../types/pluginTypes';
import {
  listProjects, saveProject, deleteProject, createNewProject,
  getWorkbenchSettings, setWorkbenchSettings, getProjectFileName,
  serializeProject, deserializeProject, PROJECT_EXTENSION,
  type WorkbenchProject, type WorkbenchProjectFile,
  type WorkbenchSettings, type StorageMode,
} from '../utils/workbenchProjects';
import { System, executePlugin } from '../utils/systemRegistry';
import { VesperaSplash } from './VesperaSplash';
import { VersaSlideFilePicker } from './VersaSlideFilePicker';

interface LogEntry {
  text: string;
  type?: 'normal' | 'warning' | 'error' | 'success';
}

interface AetherisWorkbenchProps {
  vfs?: any;
  onOpenSetupWizard?: (manifest: AppManifest) => void;
  /** Optional VFS node ID of a .awj file to open on mount */
  initialProjectFileId?: string | null;
}

const CATEGORIES = [
  'Featured Apps',
  'Games & Entertainment',
  'Productivity',
  'System Utilities',
  'Networking',
  'System',
  'Desktop Applets',
];

function jsHighlight(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="text-green-700">$1</span>')
    .replace(/\b(function|return|var|let|const|if|else|for|while|try|catch|new|typeof|instanceof|true|false|null|undefined)\b/g, '<span class="text-blue-700 font-bold">$1</span>')
    .replace(/\b(document|window|console|Math|Date|JSON|setTimeout|setInterval|clearTimeout|clearInterval)\b/g, '<span class="text-purple-700">$1</span>')
    .replace(/\b(System|container|init)\b/g, '<span class="text-red-700 font-bold">$1</span>')
    .replace(/(\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>');
}

export const AetherisWorkbench: React.FC<AetherisWorkbenchProps> = ({ vfs, onOpenSetupWizard, initialProjectFileId }) => {
  const [view, setView] = useState<'projects' | 'editor'>('projects');
  
  // Splash Screen State
  const [splashDone, setSplashDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parentWin = containerRef.current?.closest('.absolute.bg-\\[\\#c0c0c0\\]') as HTMLElement;
    if (parentWin) {
      parentWin.style.visibility = splashDone ? 'visible' : 'hidden';
    }
  }, [splashDone]);

  const [projects, setProjects] = useState<WorkbenchProject[]>([]);
  const [project, setProject] = useState<WorkbenchProject | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [showSavePicker, setShowSavePicker] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState<WorkbenchSettings>(getWorkbenchSettings());
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [renameFileId, setRenameFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const logsRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  const refreshProjects = useCallback(() => {
    setProjects(listProjects());
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  // Open initial project file if provided (e.g., double-clicked .awj file)
  useEffect(() => {
    if (initialProjectFileId && vfs) {
      handleOpenFromVFS(initialProjectFileId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProjectFileId, vfs]);

  const activeFile = project?.files.find(f => f.id === selectedFileId) || null;

  // ── CSS helpers ─────────────────────────────────────────────────────────
  const injectProjectCss = useCallback((files: WorkbenchProjectFile[], container: HTMLDivElement) => {
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    if (cssFiles.length === 0) return;
    const style = document.createElement('style');
    style.textContent = cssFiles.map(f => f.content).join('\n');
    container.appendChild(style);
  }, []);

  const bakeEntryCode = useCallback((mainFile: WorkbenchProjectFile, files: WorkbenchProjectFile[]): string => {
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    if (cssFiles.length === 0) return mainFile.content;
    const cssContent = cssFiles.map(f => f.content).join('\n');
    return `(function(){\n  var s=document.createElement('style');\n  s.textContent=${JSON.stringify(cssContent)};\n  container.appendChild(s);\n})();\n` + mainFile.content;
  }, []);

  const addLog = (text: string, type?: LogEntry['type']) => {
    setLogs(prev => [...prev, { text, type }]);
  };

  const handleNewProject = () => {
    const p = createNewProject();
    setProject(p);
    setSelectedFileId(p.files[0]?.id || '');
    setView('editor');
    setLogs([]);
    addLog('> New project created.', 'normal');
  };

  const handleOpenFromVFS = (nodeId: string) => {
    if (!vfs) return;
    const node = vfs.getNode(nodeId);
    if (!node || !node.content) {
      addLog('> ERROR: Could not read project file', 'error');
      return;
    }
    const imported = deserializeProject(node.content);
    if (!imported) {
      addLog('> ERROR: Invalid .awj file format', 'error');
      return;
    }
    imported.vfsNodeId = nodeId;
    const saved = saveProject(imported);
    setProject(saved);
    setSelectedFileId(saved.files[0]?.id || '');
    setView('editor');
    setLogs([]);
    addLog(`> Opened "${saved.name}" from VFS`, 'success');
  };

  const handleOpenProject = (p: WorkbenchProject) => {
    setProject(p);
    setSelectedFileId(p.files[0]?.id || '');
    setView('editor');
    setLogs([]);
    addLog(`> Opened project "${p.name}".`, 'normal');
  };

  const handleSaveProject = () => {
    if (!project) return;
    // Save based on storage mode
    if (settings.storageMode === 'vfs' && vfs) {
      if (project.vfsNodeId) {
        // Update existing file silently
        const content = serializeProject(project);
        vfs.updateFileContent(project.vfsNodeId, content);
        const saved = saveProject(project);
        setProject(saved);
        refreshProjects();
        addLog(`> Project "${saved.name}" updated in VFS.`, 'success');
      } else {
        // First time saving to VFS, show picker
        setShowSavePicker(true);
      }
    } else {
      // localStorage mode (default)
      const saved = saveProject({ ...project, vfsNodeId: null });
      setProject(saved);
      refreshProjects();
      addLog(`> Project "${saved.name}" saved to localStorage.`, 'success');
    }
  };

  const handleExportProject = () => {
    if (!project) return;
    const content = serializeProject(project);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getProjectFileName(project.name);
    a.click();
    URL.revokeObjectURL(url);
    addLog(`> Exported "${project.name}" as ${getProjectFileName(project.name)}`, 'success');
  };

  const handleImportProject = async (file: File) => {
    try {
      const content = await file.text();
      const imported = deserializeProject(content);
      if (!imported) {
        addLog('> ERROR: Invalid .awj file format', 'error');
        return;
      }
      // Generate new ID to avoid collisions
      imported.id = '';
      const saved = saveProject(imported);
      setProject(saved);
      setSelectedFileId(saved.files[0]?.id || '');
      setView('editor');
      refreshProjects();
      addLog(`> Imported project "${saved.name}"`, 'success');
    } catch {
      addLog('> ERROR: Failed to import project', 'error');
    }
  };

  const handleDeleteProject = (id: string, vfsNodeId?: string | null) => {
    if (!window.confirm('Delete this project permanently?')) return;
    
    // Also delete from VFS if applicable
    if (vfsNodeId && vfs) {
      vfs.deleteNode(vfsNodeId);
    }
    
    deleteProject(id);
    refreshProjects();
    if (project?.id === id) {
      setProject(null);
      setView('projects');
    }
    addLog('> Project deleted.', 'warning');
  };

  const updateFileContent = (fileId: string, content: string) => {
    if (!project) return;
    setProject({
      ...project,
      files: project.files.map(f => (f.id === fileId ? { ...f, content } : f)),
    });
  };

  const updateProjectMeta = (patch: Partial<WorkbenchProject>) => {
    if (!project) return;
    setProject({ ...project, ...patch });
  };

  const addFile = () => {
    if (!project) return;
    const name = window.prompt('File name (e.g. utils.js):');
    if (!name || project.files.some(f => f.name === name)) return;
    const id = 'file_' + Date.now().toString(36);
    const newFile: WorkbenchProjectFile = { id, name, content: '' };
    setProject({ ...project, files: [...project.files, newFile] });
    setSelectedFileId(id);
  };

  const removeFile = (fileId: string) => {
    if (!project) return;
    if (project.files.length <= 1) {
      alert('A project must have at least one file.');
      return;
    }
    const f = project.files.find(x => x.id === fileId);
    if (f?.name === 'main.js' && !window.confirm('Remove main.js? You will need another entry point.')) return;
    const next = project.files.filter(f => f.id !== fileId);
    setProject({ ...project, files: next });
    if (selectedFileId === fileId) setSelectedFileId(next[0]?.id || '');
  };

  const startRename = (file: WorkbenchProjectFile) => {
    setRenameFileId(file.id);
    setRenameValue(file.name);
  };

  const commitRename = () => {
    if (!project || !renameFileId) return;
    const trimmed = renameValue.trim();
    if (!trimmed || project.files.some(f => f.name === trimmed && f.id !== renameFileId)) {
      setRenameFileId(null);
      return;
    }
    setProject({
      ...project,
      files: project.files.map(f => (f.id === renameFileId ? { ...f, name: trimmed } : f)),
    });
    setRenameFileId(null);
  };

  const handleRun = () => {
    if (!project || !activeFile) return;
    const mainFile = project.files.find(f => f.name === 'main.js');
    if (!mainFile) {
      addLog('> ERROR: No main.js entry point found.', 'error');
      return;
    }
    setShowPreview(true);
    setPreviewError(null);
    addLog('> Building preview manifest...', 'normal');

    const bakedEntry = bakeEntryCode(mainFile, project.files);
    const manifest: AppManifest = {
      id: project.id || 'preview_' + Date.now(),
      name: project.name,
      version: project.version,
      description: project.description || 'Preview',
      author: project.author || 'Unknown',
      iconUrl: project.iconDataUrl || '/Icons/application_hourglass-0.png',
      entryCode: bakedEntry,
    };

    setTimeout(() => {
      if (!previewRef.current) return;
      previewRef.current.innerHTML = '';
      injectProjectCss(project.files, previewRef.current);
      const err = executePlugin(manifest, previewRef.current);
      if (err) {
        setPreviewError(err);
        addLog('> Preview error: ' + err, 'error');
      } else {
        const cssCount = project.files.filter(f => f.name.endsWith('.css')).length;
        addLog(`> Preview running${cssCount > 0 ? ` (${cssCount} stylesheet${cssCount > 1 ? 's' : ''} injected)` : ''}.`, 'success');
      }
    }, 50);
  };

  const handleCompileAndPublish = async () => {
    if (!project) return;
    if (isBuilding) return;
    setIsBuilding(true);
    setLogs([]);
    setShowPreview(false);

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    addLog('> AETHERIS Workbench Pro — Compile & Publish', 'normal');
    await delay(300);

    // Validation
    addLog('> Validating project metadata...', 'normal');
    await delay(400);
    if (!project.name.trim()) {
      addLog('> ERROR: Project name is required.', 'error');
      window.dispatchEvent(new CustomEvent('vespera-system-error', {
        detail: { type: 'Validation Error', title: 'Project Name Required', message: 'Please enter a project name in the Properties panel before publishing.', fatal: false }
      }));
      setIsBuilding(false); return;
    }
    if (!project.author.trim()) {
      addLog('> ERROR: Author is required.', 'error');
      window.dispatchEvent(new CustomEvent('vespera-system-error', {
        detail: { type: 'Validation Error', title: 'Author Name Required', message: 'Please enter an author name in the Properties panel before publishing.', fatal: false }
      }));
      setIsBuilding(false); return;
    }
    if (!project.description.trim()) {
      addLog('> ERROR: Description is required.', 'error');
      window.dispatchEvent(new CustomEvent('vespera-system-error', {
        detail: { type: 'Validation Error', title: 'Description Required', message: 'Please enter a project description in the Properties panel before publishing.', fatal: false }
      }));
      setIsBuilding(false); return;
    }

    const mainFile = project.files.find(f => f.name === 'main.js');
    if (!mainFile) {
      addLog('> ERROR: main.js entry point is required.', 'error');
      window.dispatchEvent(new CustomEvent('vespera-system-error', {
        detail: { type: 'Build Error', title: 'Missing Entry Point', message: 'main.js file is required. Create a main.js file with an init(container, System) function.', fatal: false }
      }));
      setIsBuilding(false); return;
    }
    if (!mainFile.content.trim()) {
      addLog('> ERROR: main.js is empty.', 'error');
      window.dispatchEvent(new CustomEvent('vespera-system-error', {
        detail: { type: 'Build Error', title: 'Empty Entry Point', message: 'main.js exists but contains no code. Add your init(container, System) function.', fatal: false }
      }));
      setIsBuilding(false); return;
    }

    const hasInit = /function\s+init\s*\(/.test(mainFile.content) || /\binit\s*[:=]\s*function/.test(mainFile.content);
    if (!hasInit) {
      addLog('> WARNING: main.js does not declare an init(container, System) function.', 'warning');
    }
    await delay(400);

    addLog('> Syntax-checking JavaScript...', 'normal');
    await delay(300);
    try {
      // eslint-disable-next-line no-new-func
      new Function('System', 'container', `"use strict";\n${mainFile.content}\nif(typeof init==='function')init(container,System);`);
      addLog('> Syntax OK.', 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`> SYNTAX ERROR: ${msg}`, 'error');
      window.dispatchEvent(new CustomEvent('vespera-system-error', {
        detail: { type: 'Syntax Error', title: 'JavaScript Syntax Error', message: msg, fatal: false }
      }));
      setIsBuilding(false);
      return;
    }

    await delay(400);
    addLog('> Linking modules...', 'normal');
    await delay(500);
    addLog('> Optimizing bundle...', 'normal');
    await delay(400);
    addLog('> Generating AppManifest...', 'normal');
    await delay(300);

    const bakedEntry = bakeEntryCode(mainFile, project.files);
    const cssCount = project.files.filter(f => f.name.endsWith('.css')).length;
    if (cssCount > 0) {
      addLog(`> Baking ${cssCount} stylesheet${cssCount > 1 ? 's' : ''} into bundle...`, 'normal');
      await delay(200);
    }

    const manifest: AppManifest = {
      id: project.id || 'app_' + Date.now().toString(36),
      name: project.name,
      version: project.version || '1.0.0',
      description: project.description,
      author: project.author,
      iconUrl: project.iconDataUrl || '/Icons/application_hourglass-0.png',
      entryCode: bakedEntry,
      size: '~1.0 MB',
      category: project.category || 'Featured Apps',
    };

    addLog('> Registering with Vespera System Registry...', 'normal');
    await delay(400);

    try {
      System.registerApp(manifest);
      addLog('> Registration successful.', 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      addLog(`> Registration failed: ${msg}`, 'error');
      setIsBuilding(false);
      return;
    }

    addLog('> Publishing to VStore Catalyst...', 'normal');
    await delay(600);
    addLog(`> App "${manifest.name}" v${manifest.version} published.`, 'success');

    if (onOpenSetupWizard) {
      addLog('> Launching Setup Wizard...', 'normal');
      setTimeout(() => onOpenSetupWizard(manifest), 400);
    }

    setIsBuilding(false);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      updateProjectMeta({ iconDataUrl: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  // ── RENDER: Projects List ───────────────────────────────────────────────
  if (view === 'projects') {
    return (
      <div ref={containerRef} className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-[11px] select-none">
        {!splashDone && (
          <VesperaSplash
            appName="AETHERIS"
            subtitle="Workbench Pro"
            version="Version 2.0"
            developer="Vespera Systems"
            icon="/Icons/notepad_file_gear-0.png"
            durationMs={2000}
            onDone={() => setSplashDone(true)}
          />
        )}
        <div className="flex gap-4 px-2 py-1 border-b border-gray-500">
          <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer"><span className="underline">F</span>ile</span>
          <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer"><span className="underline">E</span>dit</span>
          <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer" onClick={() => setShowMetadata(true)}><span className="underline">P</span>roject</span>
          <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer" onClick={() => setShowSettings(true)}><span className="underline">S</span>ettings</span>
          <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer" onClick={() => setShowHelp(true)}><span className="underline">H</span>elp</span>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#000080] flex items-center gap-2">
              <Code2 size={18} /> AETHERIS Workbench Pro — Projects
            </h2>
            <button
              onClick={handleNewProject}
              className="flex items-center gap-1 px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold text-xs"
            >
              <Plus size={14} /> New Project
            </button>
          </div>
          {projects.length === 0 ? (
            <div className="text-center text-gray-600 py-12">
              <Package size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="font-bold mb-1">No Projects Found</p>
              <p className="text-xs">Create a new project to start building Vespera apps.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {projects.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2">
                  {p.iconDataUrl ? (
                    <img src={p.iconDataUrl} alt="" className="w-8 h-8 object-contain" style={{ imageRendering: 'pixelated' }} />
                  ) : (
                    <FileIcon size={24} className="text-gray-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-600">v{p.version} · {p.author || 'No author'} · {p.files.length} file{p.files.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button
                    onClick={() => handleOpenProject(p)}
                    className="px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDeleteProject(p.id)}
                    className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── RENDER: Editor ──────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-[11px] select-none">
      {!splashDone && (
        <VesperaSplash
          appName="AETHERIS"
          subtitle="Workbench Pro"
          version="Version 2.0"
          developer="Vespera Systems"
          icon="/Icons/notepad_file_gear-0.png"
          durationMs={2000}
          onDone={() => setSplashDone(true)}
        />
      )}
      <div className="flex gap-4 px-2 py-1 border-b border-gray-500 relative">
        {activeMenu && <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />}
        
        {/* File Menu */}
        <div className="relative">
          <span 
            className={`px-1 cursor-pointer select-none ${activeMenu === 'file' ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white'}`}
            onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
          >
            <span className="underline">F</span>ile
          </span>
          {activeMenu === 'file' && (
            <div className="absolute top-[120%] left-0 w-40 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0_rgba(0,0,0,0.3)] z-50 text-black py-1">
              <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer" onClick={() => { setActiveMenu(null); handleNewProject(); }}>New Project</div>
              <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer" onClick={() => { setActiveMenu(null); setView('projects'); }}>Open Project...</div>
              <div className="border-t border-gray-500 my-1 mx-1"></div>
              <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer" onClick={() => { setActiveMenu(null); handleSaveProject(); }}>Save Project</div>
              <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer" onClick={() => { setActiveMenu(null); setShowSavePicker(true); }}>Save Project As...</div>
              <div className="border-t border-gray-500 my-1 mx-1"></div>
              <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer" onClick={() => { setActiveMenu(null); handleExportProject(); }}>Export to OS</div>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <span 
            className={`px-1 cursor-pointer select-none ${activeMenu === 'edit' ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white'}`}
            onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
          >
            <span className="underline">E</span>dit
          </span>
          {activeMenu === 'edit' && (
            <div className="absolute top-[120%] left-0 w-32 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0_rgba(0,0,0,0.3)] z-50 text-black py-1">
              <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer opacity-50" onClick={() => setActiveMenu(null)}>Undo</div>
              <div className="border-t border-gray-500 my-1 mx-1"></div>
              <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer opacity-50" onClick={() => setActiveMenu(null)}>Cut</div>
              <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer opacity-50" onClick={() => setActiveMenu(null)}>Copy</div>
              <div className="px-4 py-1 hover:bg-[#000080] hover:text-white cursor-pointer opacity-50" onClick={() => setActiveMenu(null)}>Paste</div>
            </div>
          )}
        </div>

        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer select-none" onClick={() => setShowMetadata(true)}><span className="underline">P</span>roject</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer select-none" onClick={() => setShowSettings(true)}><span className="underline">S</span>ettings</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer select-none" onClick={() => setShowHelp(true)}><span className="underline">H</span>elp</span>
      </div>

      {/* Toolbar */}
      <div className="flex gap-1 px-2 py-1 border-b border-gray-500 items-center flex-wrap">
        <div className="flex gap-1 border-r border-gray-500 pr-2">
          <button onClick={() => { setView('projects'); }} className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white" title="Back to Projects"><FolderOpen size={14} /></button>
          <button onClick={handleNewProject} className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white" title="New Project"><FileIcon size={14} /></button>
          <button onClick={handleSaveProject} className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white" title="Save Project"><Save size={14} /></button>
        </div>
        <div className="flex gap-1 border-r border-gray-500 px-2">
          <button className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"><Scissors size={14} /></button>
          <button className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"><Copy size={14} /></button>
          <button className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"><ClipboardPaste size={14} /></button>
        </div>
        <div className="flex gap-1 pl-2">
          <button onClick={() => setShowMetadata(true)} className="flex items-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold text-[10px]">
            <Edit3 size={12} /> Properties
          </button>
          <button
            onClick={handleRun}
            disabled={isBuilding}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50 font-bold text-green-800 text-[10px]"
          >
            <Play size={12} className="fill-green-800" /> Run
          </button>
          <button
            onClick={handleCompileAndPublish}
            disabled={isBuilding}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 disabled:opacity-50 font-bold text-[10px]"
          >
            <Hammer size={12} /> Compile & Publish
          </button>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-gray-700">
          <span className="font-bold text-[#000080]">{project?.name}</span>
          <span>— {activeFile?.name || 'No file'}</span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-h-0 p-1 gap-1">
        <div className="flex-1 flex gap-1 min-h-0">
          {/* Left Pane: File Tree */}
          <div className="w-52 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex flex-col overflow-hidden">
            <div className="bg-[#000080] text-white px-2 py-1 text-[10px] font-bold flex items-center justify-between">
              <span className="flex items-center gap-1"><FolderOpen size={12} /> Project Files</span>
              <button onClick={addFile} className="hover:bg-blue-700 p-0.5"><Plus size={12} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-1">
              {project?.files.map(f => (
                <div
                  key={f.id}
                  className={`flex items-center gap-1 px-1 py-0.5 cursor-pointer group ${selectedFileId === f.id ? 'bg-[#000080] text-white' : 'hover:bg-[#c0c0c0]'}`}
                  onClick={() => setSelectedFileId(f.id)}
                >
                  <FileIcon size={12} className={selectedFileId === f.id ? 'text-white' : 'text-gray-600'} />
                  {renameFileId === f.id ? (
                    <input
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenameFileId(null); }}
                      autoFocus
                      className="w-full text-[10px] px-0.5 outline-none text-black"
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 truncate text-[11px]">{f.name}</span>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); startRename(f); }}
                    className={`opacity-0 group-hover:opacity-100 p-0.5 ${selectedFileId === f.id ? 'text-white hover:bg-blue-700' : 'text-gray-600 hover:bg-gray-300'}`}
                  >
                    <Edit3 size={10} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); removeFile(f.id); }}
                    className={`opacity-0 group-hover:opacity-100 p-0.5 ${selectedFileId === f.id ? 'text-white hover:bg-blue-700' : 'text-red-600 hover:bg-gray-300'}`}
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-400 p-1 text-[10px] text-gray-600 bg-[#ececec]">
              <p className="truncate font-bold">{project?.name}</p>
              <p>v{project?.version}</p>
            </div>
          </div>

          {/* Center Pane: Editor */}
          <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex flex-col relative overflow-hidden">
            {activeFile ? (
              <>
                <div className="bg-[#c0c0c0] border-b border-gray-400 px-2 py-0.5 text-[10px] font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1"><FileIcon size={12} /> {activeFile.name}</span>
                  {project && project.files.some(f => f.id === selectedFileId && f.content !== (activeFile?.content ?? '')) && (
                    <span className="text-orange-700 text-[9px]">modified</span>
                  )}
                </div>
                <div className="flex-1 relative overflow-hidden">
                  <textarea
                    value={activeFile.content}
                    onChange={e => updateFileContent(activeFile.id, e.target.value)}
                    disabled={isBuilding}
                    spellCheck={false}
                    className="absolute inset-0 w-full h-full p-2 resize-none outline-none font-mono text-[12px] leading-relaxed whitespace-pre bg-transparent z-10 disabled:bg-gray-100"
                    style={{ color: 'transparent', caretColor: 'black' }}
                  />
                  <div
                    className="absolute inset-0 p-2 font-mono text-[12px] leading-relaxed whitespace-pre pointer-events-none overflow-hidden"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: jsHighlight(activeFile.content) }}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a file from the project tree.</p>
              </div>
            )}
          </div>

          {/* Right Pane: Preview */}
          {showPreview && (
            <div className="w-64 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex flex-col">
              <div className="bg-[#c0c0c0] border-b border-gray-400 px-2 py-0.5 text-[10px] font-bold flex items-center justify-between">
                <span className="flex items-center gap-1"><Monitor size={12} /> Live Preview</span>
                <button onClick={() => setShowPreview(false)} className="hover:bg-gray-300 p-0.5"><X size={12} /></button>
              </div>
              <div className="flex-1 overflow-auto relative">
                {previewError ? (
                  <div className="p-2 text-red-700 text-[10px] font-mono">
                    <AlertTriangle size={14} className="mb-1" />
                    <p className="font-bold">Runtime Error</p>
                    <p>{previewError}</p>
                  </div>
                ) : (
                  <div ref={previewRef} className="w-full h-full" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Pane: Build Output */}
        <div className="h-36 flex flex-col shrink-0">
          <div className="flex gap-1">
            {['Build Output', 'Preview Log'].map(tab => (
              <div
                key={tab}
                className={`px-3 py-1 border-2 border-b-0 cursor-pointer ${
                  tab === 'Build Output'
                    ? 'bg-[#c0c0c0] border-t-white border-l-white border-r-gray-800 z-10 relative top-[2px]'
                    : 'bg-[#d4d4d4] border-t-white border-l-white border-r-gray-800 text-gray-600 mt-[2px]'
                }`}
              >
                {tab}
              </div>
            ))}
          </div>
          <div ref={logsRef} className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 font-mono text-[11px] overflow-y-auto">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`
                  ${log.type === 'warning' ? 'text-orange-600 font-bold' : ''}
                  ${log.type === 'error' ? 'text-red-700 font-bold' : ''}
                  ${log.type === 'success' ? 'text-green-700 font-bold' : ''}
                `}
              >
                {log.text}
              </div>
            ))}
            {isBuilding && <div className="animate-pulse">_</div>}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex gap-1 px-1 py-0.5 border-t-2 border-gray-400 mt-1">
        <div className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 truncate">
          {isBuilding ? 'Building...' : project ? `Ready — ${project.files.length} file(s)` : 'Ready'}
        </div>
        <div className="w-24 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 text-center">Ln 1, Col 1</div>
        <div className="w-12 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 text-center text-gray-500">JS</div>
        <div className="w-12 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 text-center text-gray-500">OVR</div>
      </div>

      {/* Help Dialog */}
      {showHelp && (
        <div className="absolute inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-[#c0c0c0] w-full max-w-2xl h-[85%] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0_rgba(0,0,0,0.3)] flex flex-col">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm flex items-center justify-between shrink-0">
              <span>AETHERIS Workbench Pro — Developer Documentation</span>
              <button onClick={() => setShowHelp(false)} className="hover:bg-blue-700 p-0.5"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 text-[11px] text-black space-y-3 leading-relaxed">
              <div className="bg-yellow-50 border border-yellow-400 p-2 text-[10px]">
                <strong>IMPORTANT:</strong> AETHERIS Workbench Pro compiles JavaScript, not Java. All code must be valid ECMAScript (circa 1996 compatibility recommended). Apps execute inside a scoped sandbox via <code>new Function()</code>.
              </div>

              <h3 className="font-bold text-[#000080] text-xs border-b border-gray-400 pb-0.5">1. The init() Contract</h3>
              <p>Every app <strong>must</strong> declare an <code>init(container, System)</code> function. The Workbench will search for this during Compile & Publish. Without it, your app will not initialize.</p>
              <pre className="bg-white border border-gray-400 p-1.5 font-mono text-[10px] whitespace-pre-wrap">function init(container, System) {'{'}
  container.innerHTML = '&lt;h1&gt;Hello Vespera&lt;/h1&gt;';
{'}'}</pre>

              <h3 className="font-bold text-[#000080] text-xs border-b border-gray-400 pb-0.5 mt-2">2. System API Reference</h3>
              <p>The <code>System</code> object is your only bridge to Vespera OS. Available methods:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><code>System.openWindow(id)</code> — Launch another OS app by ID.</li>
                <li><code>System.notify(message)</code> — Show a desktop toast notification.</li>
                <li><code>System.getManifest()</code> — Retrieve your app's metadata (name, version, author).</li>
                <li><code>System.alert(title, message)</code> — Show an error dialog with OK button.</li>
                <li><code>System.confirm(title, message)</code> — Show a confirm dialog. Returns true/false.</li>
                <li><code>System.reportError(details)</code> — Trigger a system-level error/BSOD event.</li>
                <li><code>System.version</code> — Returns the OS version string (e.g. "1.45").</li>
              </ul>

              <h3 className="font-bold text-[#000080] text-xs border-b border-gray-400 pb-0.5 mt-2">2a. Error Handling & Dialogs</h3>
              <p>Apps can show error dialogs and confirmations to the user:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><code>System.alert(title, message)</code> — Shows a non-fatal error dialog with an error sound. Use for validation errors, missing files, or unexpected conditions.</li>
                <li><code>System.confirm(title, message)</code> — Shows a blocking confirm dialog with OK/Cancel. Returns <code>true</code> if OK clicked, <code>false</code> otherwise. Use for destructive actions like delete, quit, or overwrite.</li>
                <li><code>System.reportError({`{`} type, title, message, fatal {`}`})</code> — Report a system error. If <code>fatal: true</code>, triggers the Blue Screen of Death. All errors are logged to <code>C:\Vespera\System\Logs\ERROR.LOG</code>.</li>
              </ul>
              <p className="text-orange-700 font-bold">Note: Error dialogs play the classic Vespera error sound automatically. Confirm dialogs use the native browser confirm (blocking) for retro authenticity.</p>

              <h3 className="font-bold text-[#000080] text-xs border-b border-gray-400 pb-0.5 mt-2">2b. Media & System Info</h3>
              <p>Access system hardware parameters, media, and loading screens:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><code>System.showSplash({`{`} appName, subtitle, icon, version {`}`})</code> — Display the native Vespera OS loading splash screen over your app.</li>
                <li><code>System.playSound(id)</code> — Play a system sound. Available IDs: <code>startup</code>, <code>error</code>, <code>ding</code>, <code>chimes</code>, <code>chord</code>, <code>tada</code>.</li>
                <li><code>System.getSystemInfo()</code> — Retrieve hardware and OS specs (CPU, Memory, Display, Version).</li>
              </ul>

              <h3 className="font-bold text-[#000080] text-xs border-b border-gray-400 pb-0.5 mt-2">2c. Window Shell Control API</h3>
              <p>Your app runs inside a standard Vespera OS window shell with a title bar, border, and chrome buttons. You can control this shell directly from your code:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><code>System.setTitle(title)</code> — Dynamically change the window title bar text.</li>
                <li><code>System.resize(w, h)</code> — Resize the window to <code>w</code> × <code>h</code> pixels.</li>
                <li><code>System.move(x, y)</code> — Reposition the window to screen coordinates <code>x, y</code>.</li>
                <li><code>System.close()</code> — Self-terminate and close your app's window.</li>
                <li><code>System.minimize()</code> — Collapse the window to the taskbar.</li>
                <li><code>System.maximize()</code> — Toggle maximized (fullscreen within the desktop) state.</li>
                <li><code>System.setAlwaysOnTop(bool)</code> — Pin your window above all others (use sparingly).</li>
              </ul>
              <p className="text-orange-700 font-bold">Caution: <code>System.close()</code> is immediate. If your app has unsaved data, prompt the user first. <code>setAlwaysOnTop(true)</code> can annoy users — respect their desktop space.</p>

              <h3 className="font-bold text-[#000080] text-xs border-b border-gray-400 pb-0.5 mt-2">3. CSS & Multi-File Projects</h3>
              <p>You may create <code>.css</code> files in your project. At <strong>Run</strong> time, they are injected as <code>&lt;style&gt;</code> tags into the live preview. At <strong>Compile & Publish</strong> time, all CSS files are <strong>baked directly into the bundle</strong> so your published app is self-contained.</p>
              <p className="text-orange-700 font-bold">Limitation: HTML files are not served. Build your DOM structure via JavaScript (innerHTML, createElement, or template strings). External image/font URLs work only if they are absolute (http/https) or data-URIs.</p>

              <h3 className="font-bold text-[#000080] text-xs border-b border-gray-400 pb-0.5 mt-2">4. Common Pitfalls & Warnings</h3>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><strong>No module system:</strong> You cannot use <code>import</code>, <code>require</code>, or <code>export</code>. All code must be in one self-contained <code>main.js</code> entry point. Helper logic should be written as plain functions inside that file.</li>
                <li><strong>No external libraries:</strong> React, jQuery, and npm packages are unavailable. Use vanilla DOM APIs only.</li>
                <li><strong>No filesystem access:</strong> You cannot read or write to the VFS from inside a plugin. Store state in <code>localStorage</code> if persistence is needed.</li>
                <li><strong>No network by default:</strong> <code>fetch()</code> works but be aware of CORS. Absolute URLs to public APIs may be blocked.</li>
                <li><strong>Event cleanup:</strong> Always remove event listeners and stop <code>setInterval</code>/<code>setTimeout</code> timers in a cleanup hook if your app supports re-mounting. The container is wiped on each preview run, but stale global listeners can leak.</li>
                <li><strong>Memory:</strong> Avoid massive DOM trees or infinite loops. The sandbox runs in the main browser thread — a hung script will freeze Vespera OS.</li>
              </ul>

              <h3 className="font-bold text-[#000080] text-xs border-b border-gray-400 pb-0.5 mt-2">5. Example: Hello World</h3>
              <pre className="bg-white border border-gray-400 p-1.5 font-mono text-[10px] whitespace-pre-wrap">function init(container, System) {'{'}
  container.innerHTML = `
    &lt;div style="padding:20px;font-family:sans-serif;"&gt;
      &lt;h1&gt;Hello Vespera&lt;/h1&gt;
      &lt;button id="btn"&gt;Notify OS&lt;/button&gt;
    &lt;/div&gt;
  `;
  document.getElementById('btn').onclick = function() {'{'}
    System.notify('Button clicked!');
  {'}'};
{'}'}</pre>

              <h3 className="font-bold text-[#000080] text-xs border-b border-gray-400 pb-0.5 mt-2">5a. Example: Error Handling</h3>
              <pre className="bg-white border border-gray-400 p-1.5 font-mono text-[10px] whitespace-pre-wrap">function init(container, System) {'{'}
  container.innerHTML = `
    &lt;div style="padding:20px;font-family:sans-serif;"&gt;
      &lt;button id="delete"&gt;Delete Data&lt;/button&gt;
      &lt;button id="error"&gt;Trigger Error&lt;/button&gt;
    &lt;/div&gt;
  `;
  document.getElementById('delete').onclick = function() {'{'}
    var confirmed = System.confirm('Delete Data', 'Are you sure? This cannot be undone.');
    if (confirmed) {'{'}
      System.notify('Data deleted successfully');
    {'}'}
  {'}'};
  document.getElementById('error').onclick = function() {'{'}
    System.alert('File Not Found', 'Could not load save.dat from storage.');
  {'}'};
{'}'}</pre>

              <h3 className="font-bold text-[#000080] text-xs border-b border-gray-400 pb-0.5 mt-2">6. Example: Canvas Game Loop</h3>
              <pre className="bg-white border border-gray-400 p-1.5 font-mono text-[10px] whitespace-pre-wrap">function init(container, System) {'{'}
  var canvas = document.createElement('canvas');
  canvas.width = 300; canvas.height = 200;
  container.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var x = 0;
  var iv = setInterval(function() {'{'}
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,300,200);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(x,80,20,20);
    x = (x+2)%280;
  {'}'}, 16);
  // Optional cleanup if container is destroyed
  container._cleanup = function() {'{'} clearInterval(iv); {'}'};
{'}'}</pre>

              <h3 className="font-bold text-[#000080] text-xs border-b border-gray-400 pb-0.5 mt-2">6a. Example: Window Shell Controls</h3>
              <pre className="bg-white border border-gray-400 p-1.5 font-mono text-[10px] whitespace-pre-wrap">function init(container, System) {'{'}
  container.innerHTML = `
    &lt;div style="padding:20px;font-family:sans-serif;"&gt;
      &lt;h1&gt;Window Controller&lt;/h1&gt;
      &lt;button id="big"&gt;Big Mode&lt;/button&gt;
      &lt;button id="small"&gt;Small Mode&lt;/button&gt;
      &lt;button id="top"&gt;Pin On Top&lt;/button&gt;
      &lt;button id="close"&gt;Self-Destruct&lt;/button&gt;
    &lt;/div&gt;
  `;
  document.getElementById('big').onclick = function() {'{'}
    System.setTitle('Big Mode Active');
    System.resize(800, 600);
  {'}'};
  document.getElementById('small').onclick = function() {'{'}
    System.setTitle('Compact View');
    System.resize(320, 240);
    System.move(20, 20);
  {'}'};
  document.getElementById('top').onclick = function() {'{'}
    System.setAlwaysOnTop(true);
  {'}'};
  document.getElementById('close').onclick = function() {'{'}
    if (confirm('Close this window?')) System.close();
  {'}'};
{'}'}</pre>

              <h3 className="font-bold text-[#000080] text-xs border-b border-gray-400 pb-0.5 mt-2">7. Publishing Checklist</h3>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Project name, author, and description are filled in (Properties panel).</li>
                <li><code>main.js</code> contains a valid <code>init(container, System)</code> function.</li>
                <li>All CSS files have <code>.css</code> extensions so they are bundled correctly.</li>
                <li>Code syntax-checks without errors (Workbench validates before publishing).</li>
                <li>App runs correctly in <strong>Live Preview</strong> before you hit Compile & Publish.</li>
              </ul>

              <div className="bg-blue-50 border border-blue-300 p-2 text-[10px] mt-2">
                <strong>Need more help?</strong> Visit the VStore Developer Portal for community plugins and example source code. AETHERIS Workbench Pro is the professional tool — the free portal is available for quick one-off scripts.
              </div>
            </div>
            <div className="p-2 border-t border-gray-400 flex justify-end shrink-0">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save File Picker */}
      {showSavePicker && (
        <VersaSlideFilePicker
          vfs={vfs}
          defaultName={project ? getProjectFileName(project.name) : ''}
          folderOnly={false}
          allowedExtensions={[{ value: '.awj', label: 'AETHERIS Workbench Project (*.awj)' }]}
          title="Save Project As..."
          onConfirm={(folderId, filename) => {
            if (!project) return;
            const content = serializeProject(project);
            
            // Check if file exists in that folder
            const existingNode = vfs.nodes?.find((n: any) => n.name === filename && n.parentId === folderId);
            let newNodeId = '';
            
            if (existingNode) {
              vfs.updateFileContent(existingNode.id, content);
              newNodeId = existingNode.id;
            } else {
              const newNode = vfs.createNode(filename, 'file', folderId, content);
              newNodeId = newNode.id;
            }
            
            const saved = saveProject({ ...project, vfsNodeId: newNodeId });
            setProject(saved);
            refreshProjects();
            addLog(`> Project "${saved.name}" saved to VFS as ${filename}.`, 'success');
            setShowSavePicker(false);
          }}
          onCancel={() => setShowSavePicker(false)}
        />
      )}

      {/* Folder Picker */}
      {showFolderPicker && (
        <VersaSlideFilePicker
          vfs={vfs}
          folderOnly={true}
          onConfirm={(folderId) => {
            const newSettings = { ...settings, vfsSaveLocation: folderId };
            setSettings(newSettings);
            setWorkbenchSettings(newSettings);
            setShowFolderPicker(false);
            addLog(`> VFS Save Location changed to: ${folderId}`, 'success');
          }}
          onCancel={() => setShowFolderPicker(false)}
        />
      )}

      {/* Settings Dialog */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-[#c0c0c0] w-full max-w-md border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0_rgba(0,0,0,0.3)] flex flex-col max-h-[90%]">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm flex items-center justify-between">
              <span>Workbench Settings</span>
              <button onClick={() => setShowSettings(false)} className="hover:bg-blue-700 p-0.5"><X size={14} /></button>
            </div>
            <div className="p-3 overflow-y-auto flex-1 space-y-3 text-[11px]">
              <div>
                <label className="block font-bold mb-1">Storage Mode</label>
                <select
                  value={settings.storageMode}
                  onChange={(e) => {
                    const newSettings = { ...settings, storageMode: e.target.value as StorageMode };
                    setSettings(newSettings);
                    setWorkbenchSettings(newSettings);
                    addLog(`> Storage mode set to: ${newSettings.storageMode}`, 'success');
                  }}
                  className="w-full border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-1 py-0.5 outline-none bg-white"
                >
                  <option value="localStorage">localStorage (Browser)</option>
                  <option value="vfs">VFS (Virtual File System as .awj files)</option>
                </select>
                <p className="text-[10px] text-gray-600 mt-1">
                  Choose where to save projects. VFS mode stores them as .awj files in the Vespera file system.
                </p>
              </div>

              {settings.storageMode === 'vfs' && (
                <div>
                  <label className="block font-bold mb-1">VFS Save Location</label>
                  <div className="flex gap-2">
                    <input
                      value={settings.vfsSaveLocation}
                      onChange={(e) => {
                        const newSettings = { ...settings, vfsSaveLocation: e.target.value };
                        setSettings(newSettings);
                        setWorkbenchSettings(newSettings);
                      }}
                      placeholder="Enter directory node ID (e.g., 'documents')"
                      className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-1 py-0.5 outline-none bg-white"
                    />
                    <button
                      onClick={() => setShowFolderPicker(true)}
                      className="px-3 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[11px] font-bold"
                    >
                      Browse...
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">
                    The VFS directory node ID where .awj project files will be saved. Default is 'documents'.
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-300 p-2 text-[10px]">
                <strong>.AWJ File Format:</strong> Aetheris Workbench JavaScript project files. 
                These contain the complete project metadata and all source files in JSON format.
                Double-click .awj files in File Manager to open them in Workbench.
              </div>

              <div className="border-t border-gray-400 pt-2">
                <label className="block font-bold mb-1">Import / Export</label>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportProject}
                    disabled={!project}
                    className="flex-1 px-2 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50 text-[10px] font-bold"
                  >
                    Export Current Project
                  </button>
                  <label className="flex-1 px-2 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-[10px] font-bold text-center cursor-pointer">
                    <input
                      type="file"
                      accept=".awj,.json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImportProject(file);
                        e.target.value = '';
                      }}
                    />
                    Import Project
                  </label>
                </div>
              </div>
            </div>
            <div className="p-2 border-t border-gray-400 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Dialog */}
      {showMetadata && project && (
        <div className="absolute inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-[#c0c0c0] w-full max-w-md border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0_rgba(0,0,0,0.3)] flex flex-col max-h-[90%]">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm flex items-center justify-between">
              <span>Project Properties</span>
              <button onClick={() => setShowMetadata(false)} className="hover:bg-blue-700 p-0.5"><X size={14} /></button>
            </div>
            <div className="p-3 overflow-y-auto flex-1 space-y-2 text-[11px]">
              <div>
                <label className="block font-bold mb-0.5">App Name *</label>
                <input
                  value={project.name}
                  onChange={e => updateProjectMeta({ name: e.target.value })}
                  className="w-full border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-1 py-0.5 outline-none bg-white"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block font-bold mb-0.5">Version</label>
                  <input
                    value={project.version}
                    onChange={e => updateProjectMeta({ version: e.target.value })}
                    className="w-full border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-1 py-0.5 outline-none bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-bold mb-0.5">Category</label>
                  <select
                    value={project.category}
                    onChange={e => updateProjectMeta({ category: e.target.value })}
                    className="w-full border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-1 py-0.5 outline-none bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold mb-0.5">Author *</label>
                <input
                  value={project.author}
                  onChange={e => updateProjectMeta({ author: e.target.value })}
                  className="w-full border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-1 py-0.5 outline-none bg-white"
                />
              </div>
              <div>
                <label className="block font-bold mb-0.5">Description *</label>
                <textarea
                  value={project.description}
                  onChange={e => updateProjectMeta({ description: e.target.value })}
                  rows={3}
                  className="w-full border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-1 py-0.5 outline-none bg-white resize-none"
                />
              </div>
              <div>
                <label className="block font-bold mb-0.5">Icon</label>
                <div className="flex items-center gap-2">
                  {project.iconDataUrl ? (
                    <img src={project.iconDataUrl} alt="" className="w-8 h-8 border border-gray-400 object-contain" style={{ imageRendering: 'pixelated' }} />
                  ) : (
                    <ImageIcon size={24} className="text-gray-500" />
                  )}
                  <label className="px-2 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white cursor-pointer text-[10px] font-bold">
                    <input type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                    Choose Icon...
                  </label>
                  {project.iconDataUrl && (
                    <button onClick={() => updateProjectMeta({ iconDataUrl: '' })} className="text-red-700 text-[10px]">Clear</button>
                  )}
                </div>
              </div>
            </div>
            <div className="p-2 border-t border-gray-400 flex justify-end gap-2">
              <button
                onClick={() => setShowMetadata(false)}
                className="px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

