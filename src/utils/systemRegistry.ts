/**
 * systemRegistry.ts
 *
 * The global Vespera System object — the only API surface exposed to
 * third-party plugin code executed via `new Function()`.
 *
 * Plugins interact with the OS exclusively through this object:
 *   System.openWindow(id)
 *   System.notify(message)
 *   System.getManifest()
 *
 * The registry itself (System.registerApp / System.getPlugins) is used
 * by VStore and GUIOS — not by plugin code directly.
 */

import type { AppManifest, InstalledPlugin } from '../types/pluginTypes';

// ─── Storage key ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'vespera_plugins';

// ─── Persistence helpers ──────────────────────────────────────────────────────

function readPlugins(): InstalledPlugin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InstalledPlugin[];
  } catch {
    return [];
  }
}

function writePlugins(plugins: InstalledPlugin[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plugins));
}

// ─── Manifest validation ──────────────────────────────────────────────────────

export function validateManifest(raw: unknown): { valid: true; manifest: AppManifest } | { valid: false; error: string } {
  if (typeof raw !== 'object' || raw === null) {
    return { valid: false, error: 'Manifest must be a JSON object.' };
  }
  const m = raw as Record<string, unknown>;

  const required: Array<keyof AppManifest> = ['id', 'name', 'version', 'description', 'author', 'entryCode'];
  for (const field of required) {
    if (typeof m[field] !== 'string' || !(m[field] as string).trim()) {
      return { valid: false, error: `Missing or empty required field: "${field}".` };
    }
  }

  const idReg = /^[a-z0-9_]{1,48}$/;
  if (!idReg.test(m.id as string)) {
    return { valid: false, error: 'Field "id" must be lowercase letters, numbers, and underscores only (max 48 chars).' };
  }

  return {
    valid: true,
    manifest: {
      id:          m.id as string,
      name:        m.name as string,
      version:     m.version as string,
      description: m.description as string,
      author:      m.author as string,
      // iconUrl is optional — fall back to a system default so empty uploads don't break registration
      iconUrl:     (typeof m.iconUrl === 'string' && m.iconUrl.trim()) ? m.iconUrl.trim() : '/Icons/application_hourglass-0.png',
      entryCode:   m.entryCode as string,
      size:        typeof m.size === 'string' ? m.size : '~1.0 MB',
      category:    typeof m.category === 'string' ? m.category : 'Featured Apps',
    },
  };
}

// ─── Global Error Reporting ───────────────────────────────────────────────────

export interface SystemErrorDetails {
  type?: string;
  title: string;
  message: string;
  fatal: boolean;
  pluginId?: string;
}

/**
 * Dispatches a global system error event that GUIOS intercepts for BSOD/Alerts.
 */
export function reportError(details: SystemErrorDetails): void {
  window.dispatchEvent(new CustomEvent('vespera-system-error', { detail: details }));
}

// ─── The System API object ────────────────────────────────────────────────────

/** The System API passed to plugin `init(container, System)` calls. */
export interface VesperaSystemAPI {
  /** Opens a registered OS window by its ID. */
  openWindow: (id: string) => void;
  /** Dispatches a desktop notification toast. */
  notify: (message: string) => void;
  /** Returns the manifest of the currently running plugin. */
  getManifest: () => AppManifest | null;
  /** Dispatches an error to the global OS handler (can trigger BSOD or alert). */
  reportError: (details: SystemErrorDetails) => void;
  /** Shows a simple alert dialog with OK button. */
  alert: (title: string, message: string) => void;
  /** Shows a confirmation dialog. Returns true if OK clicked, false if Cancel. */
  confirm: (title: string, message: string) => boolean;
  /** OS version string for capability checks. */
  version: string;
  /** Changes the plugin window's title bar text. */
  setTitle: (title: string) => void;
  /** Resizes the plugin window to w × h pixels. */
  resize: (w: number, h: number) => void;
  /** Moves the plugin window to x, y coordinates. */
  move: (x: number, y: number) => void;
  /** Closes the plugin window (self-termination). */
  close: () => void;
  /** Minimizes the plugin window. */
  minimize: () => void;
  /** Maximizes or restores the plugin window. */
  maximize: () => void;
  /** Sets the plugin window to stay on top of others. */
  setAlwaysOnTop: (value: boolean) => void;
  /** Shows a Vespera-style splash screen over the plugin window. */
  showSplash: (options: { appName: string; subtitle?: string; icon?: string; version?: string; durationMs?: number }) => void;
  /** Plays a system sound by ID (e.g. 'startup', 'error', 'ding', 'chimes', 'chord'). */
  playSound: (soundId: string) => void;
  /** Retrieves hardware and OS information. */
  getSystemInfo: () => { os: string; version: string; cpu: string; memory: string; display: string };
}

/**
 * Build a scoped System API for a single plugin execution context.
 * The plugin can call System.openWindow but cannot touch the registry.
 */
function buildSystemAPI(manifest: AppManifest): VesperaSystemAPI {
  const windowId = `plugin_${manifest.id}`;
  return {
    version: '1.45',
    openWindow(id: string) {
      window.dispatchEvent(new CustomEvent('launch-app', { detail: id }));
    },
    notify(message: string) {
      window.dispatchEvent(new CustomEvent('vespera-plugin-notify', {
        detail: { pluginId: manifest.id, message },
      }));
    },
    getManifest() {
      return manifest;
    },
    reportError(details: SystemErrorDetails) {
      reportError({ ...details, pluginId: manifest.id });
    },
    alert(title: string, message: string) {
      reportError({
        type: 'Application Alert',
        title,
        message,
        fatal: false,
        pluginId: manifest.id,
      });
    },
    confirm(title: string, message: string): boolean {
      // Use native confirm for blocking behavior (retro style)
      return window.confirm(`${title}\n\n${message}`);
    },
    setTitle(title: string) {
      window.dispatchEvent(new CustomEvent('vespera-plugin-set-title', {
        detail: { windowId, title },
      }));
    },
    resize(w: number, h: number) {
      window.dispatchEvent(new CustomEvent('vespera-plugin-resize', {
        detail: { windowId, width: w, height: h },
      }));
    },
    move(x: number, y: number) {
      window.dispatchEvent(new CustomEvent('vespera-plugin-move', {
        detail: { windowId, x, y },
      }));
    },
    close() {
      window.dispatchEvent(new CustomEvent('vespera-plugin-close', {
        detail: { windowId },
      }));
    },
    minimize() {
      window.dispatchEvent(new CustomEvent('vespera-plugin-minimize', {
        detail: { windowId },
      }));
    },
    maximize() {
      window.dispatchEvent(new CustomEvent('vespera-plugin-maximize', {
        detail: { windowId },
      }));
    },
    setAlwaysOnTop(value: boolean) {
      window.dispatchEvent(new CustomEvent('vespera-plugin-always-on-top', {
        detail: { windowId, value },
      }));
    },
    showSplash(options: { appName: string; subtitle?: string; icon?: string; version?: string; durationMs?: number }) {
      window.dispatchEvent(new CustomEvent('vespera-plugin-splash', {
        detail: { windowId, ...options },
      }));
    },
    playSound(soundId: string) {
      window.dispatchEvent(new CustomEvent('vespera-sound-play', {
        detail: { soundId },
      }));
    },
    getSystemInfo() {
      return {
        os: 'Vespera OS',
        version: '1.45',
        cpu: 'Virtual X-Type 1 Neural Bridge',
        memory: '32MB EDO RAM',
        display: 'VGA 640x480 256 Colors',
      };
    },
  };
}

// ─── Plugin execution ─────────────────────────────────────────────────────────

/**
 * Safely execute an installed plugin's entryCode inside a container element.
 * The code is run via `new Function()` — the only JS supplied to the plugin
 * is its own entryCode plus the scoped System API and its container div.
 *
 * Returns null on success, or an error message string on failure.
 */
export function executePlugin(manifest: AppManifest, container: HTMLDivElement): string | null {
  try {
    // eslint-disable-next-line no-new-func
    const factory = new Function('System', 'container', `
      "use strict";
      ${manifest.entryCode}
      if (typeof init === 'function') {
        init(container, System);
      } else {
        container.innerHTML = '<div style="color:red;font-family:monospace;padding:16px;">Plugin Error: no init() function found.</div>';
      }
    `);
    factory(buildSystemAPI(manifest), container);
    return null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    reportError({
      title: 'Installation/Launch Failed',
      message: msg,
      fatal: false,
      pluginId: manifest.id,
      type: 'Application Error'
    });
    return `Plugin runtime error: ${msg}`;
  }
}

// ─── Public registry API ──────────────────────────────────────────────────────

/**
 * Returns all persisted plugins.
 */
export function getPlugins(): InstalledPlugin[] {
  return readPlugins();
}

/**
 * Returns a single plugin by its manifest id, or undefined.
 */
export function getPlugin(id: string): InstalledPlugin | undefined {
  return readPlugins().find(p => p.manifest.id === id);
}

/**
 * Registers a new plugin:
 * 1. Validates the manifest.
 * 2. Persists to localStorage.
 * 3. Fires a `plugin-installed` CustomEvent so GUIOS / VStore can react.
 *
 * Returns the stored InstalledPlugin on success, or throws with a descriptive message.
 */
export function registerApp(rawManifest: unknown): InstalledPlugin {
  const result = validateManifest(rawManifest);
  if (!result.valid) throw new Error(result.error);

  const manifest: AppManifest = {
    ...result.manifest,
    installedAt: new Date().toISOString(),
  };

  const plugins = readPlugins();
  // Allow re-registration (update) of an existing plugin id
  const idx = plugins.findIndex(p => p.manifest.id === manifest.id);
  const record: InstalledPlugin = {
    manifest,
    windowId: `plugin_${manifest.id}`,
    installedAt: manifest.installedAt!,
  };

  if (idx >= 0) {
    plugins[idx] = record;
  } else {
    plugins.push(record);
  }

  writePlugins(plugins);

  window.dispatchEvent(new CustomEvent('plugin-installed', { detail: record }));

  return record;
}

/**
 * Removes a plugin from the registry.
 * Does NOT modify the VFS (that is handled by vfs.uninstallApp in GUIOS).
 */
export function unregisterPlugin(id: string): void {
  const plugins = readPlugins().filter(p => p.manifest.id !== id);
  writePlugins(plugins);
  window.dispatchEvent(new CustomEvent('plugin-uninstalled', { detail: { id } }));
}

// ─── The global System object exposed to plugin code ─────────────────────────
// (Plugin code receives a *scoped* copy via buildSystemAPI; this export is
// for external callers like VStore and GUIOS that need the registry methods.)

export const System = {
  registerApp,
  getPlugins,
  getPlugin,
  unregisterPlugin,
  executePlugin,
  validateManifest,
  reportError,
};

export default System;
