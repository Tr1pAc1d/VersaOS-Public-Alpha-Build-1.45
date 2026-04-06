import React, { useState, useEffect } from 'react';
import { playBeepDoopSound } from '../utils/audio';

interface GUILoginProps {
  onLogin: (username: string) => void;
  neuralBridgeActive: boolean;
  isVisible?: boolean;
  onShutdown?: () => void;
}

export const GUILogin: React.FC<GUILoginProps> = ({ onLogin, neuralBridgeActive, isVisible = true, onShutdown }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [server, setServer] = useState('VESPERA_HQ');
  const [dialUp, setDialUp] = useState(false);
  const [error, setError] = useState('');
  const [creepyText, setCreepyText] = useState('');

  useEffect(() => {
    if (!neuralBridgeActive) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const messages = ["THEY ARE WAITING", "LET US IN", "DO NOT LOG IN", "WE SEE YOU"];
        setCreepyText(messages[Math.floor(Math.random() * messages.length)]);
        setTimeout(() => setCreepyText(''), 500);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [neuralBridgeActive]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = username.toLowerCase().trim();

    // Pull users directly from persistent storage
    let systemUsers: any[] = [];
    try {
      const saved = localStorage.getItem('vespera_users');
      if (saved) {
        systemUsers = JSON.parse(saved);
      }
    } catch (e) {}

    // Fallback to defaults if empty/corrupt
    if (!systemUsers || systemUsers.length === 0) {
      systemUsers = [
        { id: 'sys_admin', username: 'admin', password: 'admin', displayName: 'Administrator', isAdmin: true, isGuest: false },
        { id: 'sys_guest', username: 'guest', password: '', displayName: 'Guest', isAdmin: false, isGuest: true }
      ];
    }

    if (user === 'thorne') {
      setError('ACCOUNT LOCKED BY OVERSEER');
      return;
    }

    const matchedUser = systemUsers.find(u => u.username.toLowerCase() === user);

    if (matchedUser) {
      if ((matchedUser.password || '') === password) {
        playBeepDoopSound();
        onLogin(matchedUser.username); // Pass the raw username up to the OS layer
      } else {
        setError('Invalid password.');
      }
    } else {
      setError('Unknown user or invalid password.');
    }
  };

  return (
    <div className={`w-full h-full bg-[#008080] flex items-center justify-center font-sans relative overflow-hidden transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* 90s style window */}
      <div className="bg-[#c0c0c0] text-black border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 p-1 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] w-96 relative z-10">
        <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm flex justify-between items-center">
          <span>Welcome to Vespera</span>
          <button className="bg-[#c0c0c0] text-black px-2 border-t border-l border-white border-b border-r border-gray-800 text-xs font-bold">X</button>
        </div>
        <div className="p-4">
          <div className="flex items-start mb-6">
            <div className="w-10 h-10 mr-4 bg-[#008080] border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white flex items-center justify-center">
              <span className="text-white font-bold text-xl">?</span>
            </div>
            <p className="text-sm leading-relaxed">
              Type a user name and password to log on to Vespera Desktop Environment.
              <br/><br/>
              <span className="text-xs text-gray-600">Hint: Try 'admin' or 'guest'</span>
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-3 flex items-center">
              <label className="w-24 text-sm">User name:</label>
              <input 
                type="text" 
                className="flex-1 border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white px-2 py-1 text-sm bg-white text-black focus:outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mb-3 flex items-center">
              <label className="w-24 text-sm">Password:</label>
              <input 
                type="password" 
                className="flex-1 border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white px-2 py-1 text-sm bg-white text-black focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-3 flex items-center">
              <label className="w-24 text-sm">Log on to:</label>
              <select 
                className="flex-1 border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white px-2 py-1 text-sm bg-white text-black focus:outline-none"
                value={server}
                onChange={(e) => setServer(e.target.value)}
              >
                <option value="VESPERA_HQ">VESPERA_HQ</option>
                <option value="SECTOR_7">SECTOR_7_LABS</option>
                <option value="AETHERIS_NET">AETHERIS_NET</option>
                <option value="LOCAL_MACHINE">This Computer</option>
              </select>
            </div>

            <div className="mb-6 flex items-center ml-24">
              <input 
                type="checkbox" 
                id="dialup"
                className="mr-2"
                checked={dialUp}
                onChange={(e) => setDialUp(e.target.checked)}
              />
              <label htmlFor="dialup" className="text-sm">Log on using <span className="underline">d</span>ial-up connection</label>
            </div>
            
            <div className="h-6 mb-2">
              {error && <div className="text-red-600 text-xs font-bold">{error}</div>}
              {neuralBridgeActive && !error && <div className="text-red-800 text-xs animate-pulse font-bold">BRIDGE ACTIVE - CONNECTION UNSTABLE</div>}
            </div>

            <div className="flex justify-end space-x-2">
              <button type="submit" className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 px-4 py-1 text-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-1">
                OK
              </button>
              <button type="button" onClick={() => {setUsername(''); setPassword(''); setError('');}} className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 px-4 py-1 text-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-1">
                Cancel
              </button>
              <button type="button" disabled={!onShutdown} onClick={onShutdown} className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 px-4 py-1 text-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed">
                Shutdown...
              </button>
              <button type="button" className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 px-4 py-1 text-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-1">
                <span className="underline">O</span>ptions &lt;&lt;
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Neural Bridge Creepy Effects */}
      {neuralBridgeActive && creepyText && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 mix-blend-difference">
          <span className="text-red-600 text-6xl font-black opacity-30 tracking-widest scale-150 transform rotate-12">
            {creepyText}
          </span>
        </div>
      )}
    </div>
  );
};
