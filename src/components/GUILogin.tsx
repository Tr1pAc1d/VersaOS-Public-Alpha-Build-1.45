import React, { useState, useEffect } from 'react';
import { User, KeyRound, Monitor, ArrowLeft } from 'lucide-react';
import { playBeepDoopSound } from '../utils/audio';

interface SystemUser {
  id: string;
  username: string;
  password?: string;
  displayName: string;
  isAdmin: boolean;
  isGuest: boolean;
  profilePic?: string;
}

interface GUILoginProps {
  onLogin: (username: string) => void;
  neuralBridgeActive: boolean;
  isVisible?: boolean;
  onShutdown?: () => void;
}

const DEFAULT_USERS: SystemUser[] = [
  { id: 'sys_admin', username: 'admin', password: 'admin', displayName: 'Administrator', isAdmin: true, isGuest: false, profilePic: '' },
  { id: 'sys_guest', username: 'guest', password: '', displayName: 'Guest', isAdmin: false, isGuest: true, profilePic: '' },
];

export const GUILogin: React.FC<GUILoginProps> = ({ onLogin, neuralBridgeActive, isVisible = true, onShutdown }) => {
  const [mode, setMode] = useState<'tiles' | 'manual'>('tiles');
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [manualPassword, setManualPassword] = useState('');
  const [server, setServer] = useState('VESPERA_HQ');
  const [error, setError] = useState('');
  const [creepyText, setCreepyText] = useState('');
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(DEFAULT_USERS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vespera_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) setSystemUsers(parsed);
      }
    } catch (e) {}
  }, []);

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

  const attemptLogin = (user: string, pass: string) => {
    const uLower = user.toLowerCase().trim();
    if (uLower === 'thorne') { setError('ACCOUNT LOCKED BY OVERSEER'); return; }
    const matchedUser = systemUsers.find(u => u.username.toLowerCase() === uLower);
    if (matchedUser) {
      if ((matchedUser.password || '') === pass) { playBeepDoopSound(); onLogin(matchedUser.username); }
      else setError('Incorrect password.');
    } else {
      setError('Unknown user name or password.');
    }
  };

  const handleTileClick = (user: SystemUser) => {
    setError(''); setPassword('');
    if (!user.password) { playBeepDoopSound(); onLogin(user.username); }
    else setSelectedUser(user);
  };

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center font-sans relative overflow-hidden transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'radial-gradient(ellipse at center, #1a6b6b 0%, #005858 50%, #003d3d 100%)' }}>

      {/* CRT scanlines */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.06]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,#000 3px,#000 4px)' }} />

      {/* ── MAIN PANEL ── */}
      <div className="relative z-10 w-[400px] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">

        {/* Title bar */}
        <div className="bg-gradient-to-r from-[#000080] to-[#1a6ea5] px-3 py-1.5 flex items-center gap-2 border-b border-[#00004d]">
          <img src="/Vespera Logo Small.png" alt="" className="w-5 h-5 object-contain" onError={() => {}} />
          <span className="text-white text-xs font-bold tracking-widest uppercase flex-1">Vespera OS — Logon</span>
          <span className="text-blue-300 text-[9px] font-mono">Build 4.0</span>
        </div>

        {/* Body */}
        <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 p-4 flex flex-col gap-3 text-black">

          {/* ── TILE VIEW ── */}
          {mode === 'tiles' && !selectedUser && (<>
            <p className="text-[10px] text-gray-700 font-bold text-center uppercase tracking-widest border-b border-gray-400 pb-2">
              Select an account to log on
            </p>

            {/* User list — side by side, compact */}
            <div className={`grid gap-2 ${systemUsers.length <= 3 ? 'grid-cols-' + systemUsers.length : 'grid-cols-3'}`}
              style={{ gridTemplateColumns: `repeat(${Math.min(systemUsers.length, 3)}, minmax(0,1fr))` }}>
              {systemUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleTileClick(user)}
                  className="flex flex-col items-center gap-1.5 p-2 border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 bg-[#d4d4d4] hover:bg-[#ddeaff] active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white group transition-colors cursor-pointer focus:outline-dotted focus:outline-[#000080]"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white overflow-hidden bg-[#5a7a8a] flex items-center justify-center shrink-0">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={user.displayName} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <User size={26} className="text-[rgba(255,255,255,0.7)]" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-black group-hover:text-[#000080] text-center leading-tight truncate w-full">
                    {user.displayName}
                  </span>
                  <span className={`text-[9px] font-bold tracking-wide ${user.isAdmin ? 'text-[#000080]' : 'text-gray-500'}`}>
                    {user.isAdmin ? 'Administrator' : user.isGuest ? 'Guest' : 'User'}
                  </span>
                </button>
              ))}
            </div>

            {neuralBridgeActive && (
              <div className="text-red-700 text-[9px] animate-pulse font-bold text-center tracking-widest border border-red-400 bg-red-50 py-0.5">
                ⚠ BRIDGE ACTIVE — CONNECTION UNSTABLE
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-400 pt-2 mt-1">
              <button onClick={() => { setMode('manual'); setError(''); }}
                className="flex items-center gap-1 text-[10px] text-[#000080] hover:underline font-bold">
                <KeyRound size={10} /> Other account…
              </button>
              {onShutdown && (
                <button onClick={onShutdown}
                  className="flex items-center gap-1 text-[10px] text-gray-600 hover:underline">
                  <Monitor size={10} /> Shut Down…
                </button>
              )}
            </div>
          </>)}

          {/* ── TILE PASSWORD PROMPT ── */}
          {mode === 'tiles' && selectedUser && (<>
            <button onClick={() => { setSelectedUser(null); setPassword(''); setError(''); }}
              className="flex items-center gap-1 text-[10px] text-[#000080] hover:underline font-bold self-start">
              <ArrowLeft size={10} /> Back
            </button>

            <div className="flex items-center gap-3 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white bg-white p-2">
              <div className="w-10 h-10 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white overflow-hidden bg-[#5a7a8a] flex items-center justify-center shrink-0">
                {selectedUser.profilePic ? (
                  <img src={selectedUser.profilePic} alt={selectedUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  <User size={22} className="text-[rgba(255,255,255,0.7)]" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-black">{selectedUser.displayName}</div>
                <div className="text-[9px] text-gray-500">{selectedUser.isAdmin ? 'Administrator' : 'User'}</div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); attemptLogin(selectedUser.username, password); }}
              className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-700">Password:</label>
              <input type="password" placeholder="Enter password…" value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }} autoFocus
                className="border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white px-2 py-1 text-xs bg-white font-mono text-black focus:outline-none" />
              {error && <div className="text-red-700 text-[10px] font-bold">{error}</div>}
              <div className="flex gap-2 mt-1">
                <button type="submit"
                  className="flex-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white py-1 text-xs font-bold text-black hover:bg-[#d0d0d0]">
                  OK
                </button>
                <button type="button" onClick={() => { setSelectedUser(null); setPassword(''); setError(''); }}
                  className="flex-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white py-1 text-xs font-bold text-black hover:bg-[#d0d0d0]">
                  Cancel
                </button>
              </div>
            </form>
          </>)}

          {/* ── MANUAL / CLASSIC MODE ── */}
          {mode === 'manual' && (<>
            <div className="flex items-start gap-3 border-b border-gray-400 pb-3 mb-3">
              <div className="w-8 h-8 bg-[#008080] border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white flex items-center justify-center shrink-0">
                <span className="text-white font-black text-sm">?</span>
              </div>
              <p className="text-xs leading-relaxed text-black">
                Type a user name and password to log on to Vespera Desktop Environment.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); attemptLogin(username, manualPassword); }}
              className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label className="w-20 text-xs text-right shrink-0 text-black">User name:</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} autoFocus
                  className="flex-1 border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white px-2 py-0.5 text-xs bg-white text-black focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-20 text-xs text-right shrink-0 text-black">Password:</label>
                <input type="password" value={manualPassword} onChange={e => setManualPassword(e.target.value)}
                  className="flex-1 border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white px-2 py-0.5 text-xs bg-white font-mono text-black focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-20 text-xs text-right shrink-0 text-black">Log on to:</label>
                <select value={server} onChange={e => setServer(e.target.value)}
                  className="flex-1 border-2 border-t-gray-700 border-l-gray-700 border-b-white border-r-white px-2 py-0.5 text-xs bg-white text-black focus:outline-none">
                  <option value="VESPERA_HQ">VESPERA_HQ</option>
                  <option value="SECTOR_7">SECTOR_7_LABS</option>
                  <option value="AETHERIS_NET">AETHERIS_NET</option>
                  <option value="LOCAL_MACHINE">This Computer</option>
                </select>
              </div>

              {error && <div className="text-red-700 text-[10px] font-bold ml-22">{error}</div>}
              {neuralBridgeActive && !error && (
                <div className="text-red-700 text-[9px] animate-pulse font-bold text-center">BRIDGE ACTIVE — CONNECTION UNSTABLE</div>
              )}

              <div className="flex justify-end gap-1.5 border-t border-gray-400 pt-2 mt-1">
                <button type="submit"
                  className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white px-4 py-1 text-xs font-bold text-black hover:bg-[#d0d0d0]">
                  OK
                </button>
                <button type="button" onClick={() => { setUsername(''); setManualPassword(''); setError(''); }}
                  className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white px-4 py-1 text-xs font-bold text-black hover:bg-[#d0d0d0]">
                  Cancel
                </button>
                {onShutdown && (
                  <button type="button" onClick={onShutdown}
                    className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white px-4 py-1 text-xs font-bold text-black hover:bg-[#d0d0d0]">
                    Shutdown…
                  </button>
                )}
                <button type="button" onClick={() => { setMode('tiles'); setError(''); setUsername(''); setManualPassword(''); }}
                  className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 active:border-t-gray-700 active:border-l-gray-700 active:border-b-white active:border-r-white px-3 py-1 text-xs font-bold text-black hover:bg-[#d0d0d0]">
                  ← Users
                </button>
              </div>
            </form>
          </>)}
        </div>

        {/* Status bar */}
        <div className="bg-[#c0c0c0] border-t border-gray-500 px-3 py-0.5 flex items-center justify-between">
          <span className="text-[9px] text-gray-600 font-mono">© 1997 Vespera Systems Corp. — Build 4.0.1996</span>
          <span className="text-[9px] text-gray-500 font-mono">VESPERA_HQ</span>
        </div>
      </div>

      {/* Neural Bridge creep */}
      {neuralBridgeActive && creepyText && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 mix-blend-difference">
          <span className="text-red-600 text-6xl font-black opacity-20 tracking-widest transform rotate-12">{creepyText}</span>
        </div>
      )}
    </div>
  );
};
