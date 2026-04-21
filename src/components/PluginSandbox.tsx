import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { executePlugin, getPlugin } from '../utils/systemRegistry';

interface PluginSandboxProps {
  /** The manifest id (without the `plugin_` prefix). */
  pluginId: string;
}

/**
 * PluginSandbox
 *
 * Renders a third-party plugin inside an isolated <div>.
 * On mount it calls System.executePlugin(manifest, container) via
 * systemRegistry.executePlugin, which uses `new Function()` to run
 * the plugin's entryCode in a scoped context.
 *
 * Any runtime errors are caught and displayed as a retro error panel
 * rather than crashing GUIOS.
 */
export const PluginSandbox: React.FC<PluginSandboxProps> = ({ pluginId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pluginName, setPluginName] = useState('');
  const [pluginVersion, setPluginVersion] = useState('');
  const [pluginAuthor, setPluginAuthor] = useState('');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const record = getPlugin(pluginId);
    if (!record) {
      setError(`Plugin manifest not found for id "${pluginId}".`);
      return;
    }

    const { manifest } = record;
    setPluginName(manifest.name);
    setPluginVersion(manifest.version);
    setPluginAuthor(manifest.author);

    if (!containerRef.current) return;

    const errorMsg = executePlugin(manifest, containerRef.current);
    if (errorMsg) setError(errorMsg);
  }, [pluginId]);

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col h-full bg-[#c0c0c0] p-4 overflow-auto">
        {/* Win95-style error box */}
        <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0_rgba(0,0,0,0.3)] max-w-md mx-auto mt-8">
          <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm flex items-center gap-2">
            <AlertTriangle size={14} />
            Plugin Runtime Error
          </div>
          <div className="p-5 flex gap-4">
            <AlertTriangle size={36} className="text-yellow-600 shrink-0 mt-1" />
            <div className="text-sm leading-relaxed text-black">
              <p className="font-bold mb-2">The plugin could not be initialized.</p>
              <div className="bg-white border border-black p-2 font-mono text-[11px] text-red-800 mb-3 whitespace-pre-wrap">
                {error}
              </div>
              <p className="text-[11px] text-gray-600">
                The plugin's <code>init()</code> function threw an exception.
                Contact the plugin author for support.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal state ───────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full overflow-auto bg-white"
      style={{ minHeight: 0 }}
    />
  );
};
