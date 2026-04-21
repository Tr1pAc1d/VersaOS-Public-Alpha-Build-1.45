import React, { useState } from 'react';
import { APP_DICTIONARY } from '../utils/appDictionary';
import { Monitor } from 'lucide-react';

interface ShortcutWizardProps {
  onClose: () => void;
  onCreate: (name: string, target: string, iconType: string) => void;
  installedApps: string[];
}

export const ShortcutWizard: React.FC<ShortcutWizardProps> = ({ onClose, onCreate, installedApps }) => {
  const appKeys = Object.keys(APP_DICTIONARY).filter(k => k !== 'default');
  
  const availableApps = appKeys
    .filter(id => {
      const entry = APP_DICTIONARY[id];
      if (entry.isSystem) return true;
      if (installedApps.includes(id)) return true;
      return false;
    })
    .map(id => ({
      id,
      name: APP_DICTIONARY[id].defaultTitle,
      iconType: APP_DICTIONARY[id].customIcon || 'app'
    }));

  const [selectedApp, setSelectedApp] = useState(availableApps[0]?.id || '');
  const [shortcutName, setShortcutName] = useState(availableApps[0]?.name || '');

  const handleAppChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const appId = e.target.value;
    setSelectedApp(appId);
    const app = availableApps.find(a => a.id === appId);
    if (app) {
      setShortcutName(app.name);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-[420px] font-sans text-black select-none">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white font-bold px-2 py-1 flex items-center justify-between">
          <span>Create Shortcut</span>
          <button onClick={onClose} className="bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 h-5 w-5 flex items-center justify-center font-bold leading-none active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white focus:outline-none">×</button>
        </div>

        <div className="p-4 flex gap-4">
          <div className="mt-1 shrink-0">
            <Monitor size={36} className="text-gray-800" strokeWidth={1.5} />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs mb-3 leading-relaxed">Select the item you wish to create a shortcut for from the list below, and specify a display name.</p>
              <label className="block text-sm font-bold mb-1">Target Application:</label>
              <select 
                value={selectedApp}
                onChange={handleAppChange}
                className="w-full bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-xs focus:outline-none"
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
                className="w-full bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1.5 text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-2 p-3 bg-[#c0c0c0] border-t border-gray-500 shadow-[inset_0_1px_0_white] flex justify-end gap-2">
          <button 
            onClick={() => {
              if (!selectedApp) return;
              const app = availableApps.find(a => a.id === selectedApp);
              onCreate(shortcutName, selectedApp, app?.iconType || 'app');
            }}
            className="px-6 py-1 text-sm font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white focus:outline-none hover:bg-gray-200"
          >
            Create
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-1 text-sm font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white focus:outline-none hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
