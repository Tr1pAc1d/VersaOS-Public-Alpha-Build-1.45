/**
 * workbenchProjects.ts
 *
 * Data model + persistence for Aetheris Workbench Pro projects.
 * A project maps directly to an AppManifest (with main.js becoming entryCode).
 * 
 * Projects can be saved to:
 * 1. localStorage (default) - under 'vespera_workbench_projects'
 * 2. VFS (Virtual File System) - as .awj files in user-defined location
 */

export interface WorkbenchProjectFile {
  id: string;
  name: string;
  content: string;
}

export interface WorkbenchProject {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: string;
  iconDataUrl: string;
  files: WorkbenchProjectFile[];
  createdAt: string;
  updatedAt: string;
  /** VFS node ID if stored in file system, null if in localStorage */
  vfsNodeId?: string | null;
}

/** Storage mode for projects */
export type StorageMode = 'localStorage' | 'vfs';

/** Settings for project storage */
export interface WorkbenchSettings {
  storageMode: StorageMode;
  /** VFS directory node ID where .awj files are stored (default: 'documents') */
  vfsSaveLocation: string;
}

const STORAGE_KEY = 'vespera_workbench_projects';
const SETTINGS_KEY = 'vespera_workbench_settings';

/** Default .awj file extension for Aetheris Workbench JavaScript projects */
export const PROJECT_EXTENSION = '.awj';

/** Get workbench settings with defaults */
export function getWorkbenchSettings(): WorkbenchSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        storageMode: parsed.storageMode || 'localStorage',
        vfsSaveLocation: parsed.vfsSaveLocation || 'documents',
      };
    }
  } catch { /* ignore */ }
  return { storageMode: 'localStorage', vfsSaveLocation: 'documents' };
}

/** Save workbench settings */
export function setWorkbenchSettings(settings: WorkbenchSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** Get file name with .awj extension */
export function getProjectFileName(projectName: string): string {
  const base = projectName.replace(/[^a-z0-9_\-]/gi, '_').slice(0, 48) || 'untitled';
  return `${base}${PROJECT_EXTENSION}`;
}

function readProjects(): WorkbenchProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeProjects(projects: WorkbenchProject[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/** Serialize project to .awj format (JSON with metadata header) */
export function serializeProject(project: WorkbenchProject): string {
  const header = {
    format: 'Aetheris Workbench Project',
    version: '1.0',
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify({ header, project }, null, 2);
}

/** Deserialize .awj content to project */
export function deserializeProject(content: string): WorkbenchProject | null {
  try {
    const parsed = JSON.parse(content);
    // Support both wrapped format and direct project JSON
    const project = parsed.project || parsed;
    if (project.id && project.name && Array.isArray(project.files)) {
      return project as WorkbenchProject;
    }
  } catch { /* ignore */ }
  return null;
}

function generateId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 48) || 'untitled';
}

function makeDefaultProject(): WorkbenchProject {
  const now = new Date().toISOString();
  return {
    id: '',
    name: 'Untitled Project',
    version: '1.0.0',
    author: '',
    description: '',
    category: 'Featured Apps',
    iconDataUrl: '',
    files: [
      {
        id: 'main_js',
        name: 'main.js',
        content: `function init(container, System) {\n  container.innerHTML = '<div style="padding:16px;font-family:sans-serif;"><h1>Hello Vespera</h1></div>';\n}`,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export function listProjects(): WorkbenchProject[] {
  return readProjects().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export function getProject(id: string): WorkbenchProject | undefined {
  return readProjects().find(p => p.id === id);
}

export function saveProject(project: WorkbenchProject): WorkbenchProject {
  const projects = readProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  const now = new Date().toISOString();
  const toSave: WorkbenchProject = { ...project, updatedAt: now };

  if (idx >= 0) {
    projects[idx] = toSave;
  } else {
    // Auto-generate ID if missing / duplicate
    if (!toSave.id || projects.some(p => p.id === toSave.id)) {
      toSave.id = generateId(toSave.name) + '_' + Date.now().toString(36);
    }
    toSave.createdAt = now;
    projects.push(toSave);
  }

  writeProjects(projects);
  return toSave;
}

export function deleteProject(id: string): boolean {
  const projects = readProjects().filter(p => p.id !== id);
  if (projects.length === readProjects().length) return false;
  writeProjects(projects);
  return true;
}

export function createNewProject(partial?: Partial<WorkbenchProject>): WorkbenchProject {
  const base = makeDefaultProject();
  const now = new Date().toISOString();
  const project: WorkbenchProject = {
    ...base,
    ...partial,
    id: generateId(partial?.name || base.name) + '_' + Date.now().toString(36),
    createdAt: now,
    updatedAt: now,
  };
  return project;
}

export { generateId, makeDefaultProject };
