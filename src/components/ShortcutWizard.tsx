import React, { useState } from 'react';

interface ShortcutWizardProps {
  onClose: () => void;
  onCreate: (name: string, target: string, iconType: string) => void;
  installedApps: string[];
}

const AVAILABLE_APPS = [
  { id: 'files', name: 'File Manager', iconType: 'folder' },
  { id: 'xtype', name: 'X-Type Control Panel', iconType: 'system' },
  { id: 'browser', name: 'Vespera Navigator', iconType: 'network' },
  { id: 'chat', name: 'Vespera Assistant', iconType: 'app' },
  { id: 'analyzer', name: 'Data Stream Analyzer', iconType: 'app' },
  { id: 'workbench', name: 'AETHERIS Workbench Pro', iconType: 'app' },
  { id: 'media_player', name: 'VERSA Media Agent', iconType: 'app' },
  { id: 'netmon', name: 'AETHERIS Network Monitor', iconType: 'network' },
  { id: 'rhid', name: 'RHID Terminal', iconType: 'terminal' }
];

export const ShortcutWizard: React.FC<ShortcutWizardProps> = ({ onClose, onCreate, installedApps }) => {
  const availableApps = AVAILABLE_APPS.filter(app => {
    if (app.id === 'netmon') return installedApps.includes('netmon');
    if (app.id === 'rhid') return installedApps.includes('rhid');
    return true;
  });
  const [selectedApp, setSelectedApp] = useState(availableApps[0].id);
  const [shortcutName, setShortcutName] = useState(availableApps[0].name);

  const handleAppChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const appId = e.target.value;
    setSelectedApp(appId);
    const app = availableApps.find(a => a.id === appId);
    if (app) {
      setShortcutName(app.name);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-[400px] font-sans text-black">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white font-bold px-2 py-1 flex items-center justify-between mb-4">
          <span>Create Shortcut</span>
          <button onClick={onClose} className="bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-1 font-bold leading-none active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">X</button>
        </div>

        <div className="px-4 pb-4 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Select Application:</label>
            <select 
              value={selectedApp}
              onChange={handleAppChange}
              className="w-full bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-sm"
            >
              {availableApps.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Shortcut Name:</label>
            <input 
              type="text"
              value={shortcutName}
              onChange={(e) => setShortcutName(e.target.value)}
              className="w-full bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button 
              onClick={onClose}
              className="px-4 py-1 font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white hover:bg-gray-200"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                const app = availableApps.find(a => a.id === selectedApp);
                onCreate(shortcutName, selectedApp, app?.iconType || 'app');
              }}
              className="px-4 py-1 font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white hover:bg-gray-200"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
