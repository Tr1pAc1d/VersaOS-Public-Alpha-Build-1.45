/**
 * AppManifest — the canonical contract for a Vespera OS third-party plugin.
 *
 * Developers format this as a JSON object and paste it into the
 * VStore "Developer Import" tab.  The `entryCode` must define an
 * `init(container, System)` function that mounts the app's UI into
 * the supplied DOM element.
 *
 * Example manifest:
 * {
 *   "id": "my_calculator",
 *   "name": "My Calculator",
 *   "version": "1.0.0",
 *   "description": "A simple retro calculator.",
 *   "author": "Dev Name",
 *   "iconUrl": "https://example.com/calc.ico",
 *   "entryCode": "function init(container, System) { container.innerHTML = '<h1>Hello</h1>'; }"
 * }
 */
export interface AppManifest {
  /** Unique slug — used as the VFS app id and localStorage key.
   *  Only lowercase letters, numbers, and underscores. */
  id: string;
  /** Human-readable display name shown in the title bar and on the desktop. */
  name: string;
  /** Semver string, e.g. "1.0.0" */
  version: string;
  /** Short description shown in the VStore detail view and setup wizard. */
  description: string;
  /** Publisher / developer name. */
  author: string;
  /**
   * URL or inline data-URI for the app icon image (PNG/ICO/SVG).
   * This becomes the .ico file in Program_Files and the desktop shortcut icon.
   */
  iconUrl: string;
  /**
   * Raw JavaScript source code.
   * MUST declare a top-level `init(container, System)` function.
   * `container` — the HTMLDivElement the app should render into.
   * `System`    — the Vespera System API (see systemRegistry.ts).
   */
  entryCode: string;
  /** Human-readable file size, e.g. "1.2 MB". Defaults to "~1.0 MB". */
  size?: string;
  /** VStore category the plugin appears under. Defaults to "Featured Apps". */
  category?: string;
  /** Install timestamp (set automatically by System.registerApp). */
  installedAt?: string;
}

/**
 * Minimal runtime record persisted to localStorage alongside the full manifest.
 * Used by GUIOS to reconstruct the plugin window list after a page refresh.
 */
export interface InstalledPlugin {
  manifest: AppManifest;
  windowId: string;   // `plugin_${manifest.id}`
  installedAt: string;
}
