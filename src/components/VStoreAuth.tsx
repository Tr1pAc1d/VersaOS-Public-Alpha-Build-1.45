import React, { useState } from 'react';
import { User, Lock, Mail, Users, AlertTriangle, Globe } from 'lucide-react';

export interface VStoreBilling {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface VStoreAccount {
  username: string;
  password?: string;
  displayName: string;
  email?: string;
  memberId: string;
  memberSince: string;
  vstorePoints: number;
  downloadHistory: string[];
  totalDownloads: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  isGuest?: boolean;
  balance: number;
  purchasedApps: string[];
  billing?: VStoreBilling;
  membershipLevel: 'Standard' | 'Plus' | 'Premium';
}

// LocalStorage helpers
export const getAccounts = (): VStoreAccount[] => {
  try {
    const data = localStorage.getItem('vstore_accounts');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveAccounts = (accounts: VStoreAccount[]) => {
  localStorage.setItem('vstore_accounts', JSON.stringify(accounts));
};

export const saveAccount = (account: VStoreAccount) => {
  const accounts = getAccounts();
  const idx = accounts.findIndex(a => a.username.toLowerCase() === account.username.toLowerCase());
  if (idx !== -1) {
    accounts[idx] = account;
  } else {
    accounts.push(account);
  }
  saveAccounts(accounts);
};

export const getSession = (): string | null => {
  return localStorage.getItem('vstore_session');
};

export const setSession = (username: string | null) => {
  if (username) {
    localStorage.setItem('vstore_session', username);
  } else {
    localStorage.removeItem('vstore_session');
  }
};

interface VStoreAuthProps {
  onLogin: (account: VStoreAccount, isNewRegistration?: boolean) => void;
  onCancel: () => void;
}

export const VStoreAuth: React.FC<VStoreAuthProps> = ({ onLogin, onCancel }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginUser, setLoginUser] = useState(getSession() || '');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Register State
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regDisplay, setRegDisplay] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [agreedToTos, setAgreedToTos] = useState(false);
  const [regError, setRegError] = useState('');

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);

  const simulateConnection = (callback: () => void) => {
    setIsConnecting(true);
    setConnectionProgress(0);
    const interval = setInterval(() => {
      setConnectionProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(callback, 300);
          return 100;
        }
        return p + 20 + Math.random() * 20;
      });
    }, 200);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    
    if (!loginUser) {
      setLoginError('Username is required.');
      return;
    }

    const accounts = getAccounts();
    const account = accounts.find(a => a.username.toLowerCase() === loginUser.toLowerCase());

    if (!account || account.password !== loginPass) {
      // Simulate fake authentication lag
      simulateConnection(() => {
        setIsConnecting(false);
        setLoginError('Invalid credentials or account not found.');
      });
      return;
    }

    simulateConnection(() => {
      setSession(account.username);
      onLogin(account);
    });
  };

  const handleGuest = () => {
    const guestAccount: VStoreAccount = {
      username: 'guest',
      displayName: 'Guest User',
      memberId: 'GUEST-00000',
      memberSince: new Date().toISOString(),
      vstorePoints: 0,
      downloadHistory: [],
      totalDownloads: 0,
      tier: 'Bronze',
      isGuest: true,
      balance: 0,
      purchasedApps: [],
      membershipLevel: 'Standard'
    };
    simulateConnection(() => {
      setSession(null); // Guests don't persist sessions
      onLogin(guestAccount);
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regUser || !regPass || !regDisplay) {
      setRegError('Please fill out all required fields.');
      return;
    }

    if (regPass !== regConfirm) {
      setRegError('Passwords do not match.');
      return;
    }

    if (!agreedToTos) {
      setRegError('You must agree to the Terms of Service.');
      return;
    }

    const accounts = getAccounts();
    if (accounts.some(a => a.username.toLowerCase() === regUser.toLowerCase())) {
      setRegError('Username is already taken.');
      return;
    }

    const randToken = Math.floor(Math.random() * 90000) + 10000;
    const newAccount: VStoreAccount = {
      username: regUser,
      password: regPass,
      displayName: regDisplay,
      email: regEmail,
      memberId: `VS-${randToken}-A1`,
      memberSince: new Date().toISOString(),
      vstorePoints: 100, // 100 point bonus
      downloadHistory: [],
      totalDownloads: 0,
      tier: 'Bronze',
      balance: 0,
      purchasedApps: [],
      membershipLevel: 'Standard'
    };

    simulateConnection(() => {
      saveAccount(newAccount);
      setSession(newAccount.username);
      onLogin(newAccount, true);
    });
  };

  if (isConnecting) {
    return (
      <div className="absolute inset-0 z-[110] bg-[#004c66] flex flex-col items-center justify-center text-white font-sans p-4">
        <div className="bg-[#c0c0c0] w-[400px] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col text-black">
          <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide">
            VStore Authentication
          </div>
          <div className="p-5 flex flex-col gap-4">
            <h3 className="font-bold text-lg text-[#000080]">Authenticating...</h3>
            <p className="text-sm">Connecting to secure VStore authorization servers.</p>
            <div className="h-5 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white w-full overflow-hidden relative">
              <div 
                className="h-full bg-[#000080] transition-all duration-200 ease-out"
                style={{ width: `${connectionProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 font-mono text-center">Verifying RSA signature key...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[110] bg-[#004c66] flex flex-col items-center justify-center text-white font-sans p-4">
      {view === 'login' && (
        <div className="bg-[#c0c0c0] w-[450px] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col text-black">
          <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide flex justify-between">
            <span>VStore Login</span>
            <button onClick={onCancel} className="bg-[#c0c0c0] text-black w-4 h-4 font-bold flex items-center justify-center border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white leading-none text-xs">X</button>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="flex gap-4 border-b border-gray-400 pb-4">
              <div className="w-16 h-16 border-2 border-gray-500 bg-white shadow-inner flex items-center justify-center shrink-0">
                <Globe size={40} className="text-blue-800" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#000080]">VSTORE SECURE ACCESS</h2>
                <p className="text-xs text-gray-700 leading-relaxed mt-1">
                  Connect to the Global Software Exchange. Log in to track your downloads, earn VStore points, and access age-restricted titles.
                </p>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-100 border border-red-500 text-red-800 p-2 text-xs font-bold flex gap-2 items-center">
                <AlertTriangle size={14} /> {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                <label className="text-sm font-bold flex items-center gap-1"><User size={14}/> Username:</label>
                <input 
                  type="text" 
                  value={loginUser} 
                  onChange={e => setLoginUser(e.target.value)}
                  className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-sm outline-none px-2"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                <label className="text-sm font-bold flex items-center gap-1"><Lock size={14}/> Password:</label>
                <input 
                  type="password" 
                  value={loginPass} 
                  onChange={e => setLoginPass(e.target.value)}
                  className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-sm outline-none px-2"
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                <button 
                  type="button" 
                  onClick={() => setView('register')}
                  className="text-xs font-bold text-blue-800 hover:text-blue-600 underline"
                >
                  Create New Account
                </button>
                <div className="flex gap-2">
                  <button 
                    type="submit"
                    className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold"
                  >
                    OK
                  </button>
                  <button 
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-2 pt-3 border-t border-gray-400">
               <div className="bg-[#ffffcc] border border-[#cccc99] p-2 text-xs flex gap-2">
                 <AlertTriangle size={16} className="text-yellow-800 shrink-0 mt-0.5" />
                 <div>
                   <p className="font-bold text-yellow-900 mb-1">Proceed as Guest</p>
                   <p className="text-gray-700">Connecting anonymously will limit download capability and hide age-restricted content. Earn no points.</p>
                   <button 
                     onClick={handleGuest}
                     className="mt-2 text-[#000080] underline font-bold"
                   >Connect as Guest</button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {view === 'register' && (
        <div className="bg-[#c0c0c0] w-[450px] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col text-black">
          <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide">
            Create VStore Account
          </div>
          <div className="p-4 flex flex-col gap-3">
            <h2 className="text-base font-bold text-[#000080] border-b border-gray-400 pb-1">Member Registration Form</h2>
            
            {regError && (
              <div className="bg-red-100 border border-red-500 text-red-800 p-1.5 text-xs font-bold">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold">Username *</label>
                  <input type="text" value={regUser} onChange={e=>setRegUser(e.target.value)} className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold">Display Name *</label>
                  <input type="text" value={regDisplay} onChange={e=>setRegDisplay(e.target.value)} className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold">Password *</label>
                  <input type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold">Confirm Password *</label>
                  <input type="password" value={regConfirm} onChange={e=>setRegConfirm(e.target.value)} className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-xs" />
                </div>
              </div>

              <div className="flex flex-col gap-1 mb-2">
                <label className="text-[11px] font-bold">Email Address (Optional)</label>
                <input type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-xs" />
              </div>

              <div className="bg-white border border-gray-400 h-24 overflow-y-scroll p-2 text-[10px] font-mono leading-tight mb-2">
                <p className="font-bold mb-1">VSTORE ACCEPTABLE USE POLICY (Revised 11/1996)</p>
                <p>1. By accessing VSTORE CATALYST, you agree to abide by all local, state, and international laws regarding software copyright.</p>
                <p>2. Vespera Systems is not liable for data loss, system instability, or general protection faults arising from installed shareware.</p>
                <p>3. Age-restricted materials require verification. Falsifying this agreement is a violation of federal guidelines.</p>
                <p>4. You agree not to decompile, reverse engineer, or redistribute downloaded materials without express written consent.</p>
              </div>

              <label className="flex items-start gap-2 text-xs mb-3 cursor-pointer">
                <input type="checkbox" checked={agreedToTos} onChange={e=>setAgreedToTos(e.target.checked)} className="mt-0.5" />
                <span>I have read and agree to the Acceptable Use Policy.</span>
              </label>

              <div className="flex justify-between items-center border-t border-gray-400 pt-3">
                <button 
                  type="button" 
                  onClick={() => setView('login')}
                  className="text-xs font-bold text-blue-800 hover:underline"
                >
                  &lt; Back to Login
                </button>
                <button 
                  type="submit"
                  className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-sm font-bold"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
