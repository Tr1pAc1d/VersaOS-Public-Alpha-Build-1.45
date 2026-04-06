import React, { useState } from 'react';
import { User, CreditCard, DollarSign, Wallet, ShieldCheck, ArrowLeft, Building2, UserCircle2, AlertTriangle } from 'lucide-react';
import { VStoreAccount, getAccounts, saveAccounts, setSession } from './VStoreAuth';

interface VStoreAccountSettingsProps {
  account: VStoreAccount;
  onUpdateAccount: (account: VStoreAccount) => void;
  onClose: () => void;
}

export const VStoreAccountSettings: React.FC<VStoreAccountSettingsProps> = ({ account, onUpdateAccount, onClose }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'funds'>('profile');
  
  // Billing Form State
  const [cardName, setCardName] = useState(account.billing?.cardName || '');
  const [cardNumber, setCardNumber] = useState(account.billing?.cardNumber || '');
  const [expiry, setExpiry] = useState(account.billing?.expiry || '');
  const [cvv, setCvv] = useState(account.billing?.cvv || '');
  const [address, setAddress] = useState(account.billing?.address || '');
  const [city, setCity] = useState(account.billing?.city || '');
  const [state, setState] = useState(account.billing?.state || '');
  const [zip, setZip] = useState(account.billing?.zip || '');
  
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [fundStatus, setFundStatus] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(account.displayName);
  const [editEmail, setEditEmail] = useState(account.email || '');

  // Auth Overlay State
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authLog, setAuthLog] = useState<string[]>([]);

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving to VStore Secure Vault...');
    
    setTimeout(() => {
      const updatedAccount: VStoreAccount = {
        ...account,
        billing: {
          cardName, cardNumber, expiry, cvv, address, city, state, zip
        }
      };
      
      const accounts = getAccounts();
      const idx = accounts.findIndex(a => a.username === account.username);
      if (idx !== -1) {
        accounts[idx] = updatedAccount;
        saveAccounts(accounts);
        onUpdateAccount(updatedAccount);
        setSaveStatus('Billing Information Saved Successfully.');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    }, 800);
  };

  const handleSaveProfile = () => {
    const updatedAccount: VStoreAccount = {
      ...account,
      displayName: editDisplayName,
      email: editEmail
    };
    
    const accounts = getAccounts();
    const idx = accounts.findIndex(a => a.username === account.username);
    if (idx !== -1) {
      accounts[idx] = updatedAccount;
      saveAccounts(accounts);
      onUpdateAccount(updatedAccount);
    }
    setIsEditingProfile(false);
  };

  const handleAddFunds = (amount: number) => {
    if (!account.billing?.cardNumber) {
      setFundStatus('Error: No valid billing method on file.');
      setTimeout(() => setFundStatus(null), 3000);
      return;
    }

    setIsAuthorizing(true);
    setAuthLog([
      `> INITIATING SECURE SOCKET LAYER [128-BIT]...`,
      `> CONNECTING TO VSTORE CLEARING HOUSE (PORT 443)...`
    ]);
    
    setTimeout(() => setAuthLog(p => [...p, `> VERIFYING VAULT PROFILE ID: VS-AUTHSYS-${account.memberId}`]), 2500);
    setTimeout(() => setAuthLog(p => [...p, `> AUTHORIZING TRANSACTION SIZE: $${amount.toFixed(2)}`]), 5000);
    setTimeout(() => setAuthLog(p => [...p, `> ACCOUNT STANDING: VERIFIED`]), 6500);
    setTimeout(() => setAuthLog(p => [...p, `> AWAITING BANK CONFIRMATION (${account.billing?.cardNumber?.slice(-4) || 'XXXX'})...`]), 8000);
    setTimeout(() => setAuthLog(p => [...p, `> APPROVED. PACKET RECEIVED.`]), 10500);
    setTimeout(() => setAuthLog(p => [...p, `> CLOSING SECURE CONNECTION.`]), 11000);

    setTimeout(() => {
      const updatedAccount: VStoreAccount = {
        ...account,
        balance: (account.balance || 0) + amount
      };
      
      const accounts = getAccounts();
      const idx = accounts.findIndex(a => a.username === account.username);
      if (idx !== -1) {
        accounts[idx] = updatedAccount;
        saveAccounts(accounts);
        onUpdateAccount(updatedAccount);
      }
      setIsAuthorizing(false);
      setAuthLog([]);
      setFundStatus(`Transaction Approved. Added $${amount.toFixed(2)}.`);
      setTimeout(() => setFundStatus(null), 4000);
    }, 12500);
  };

  if (account.isGuest) {
    return (
      <div className="flex-1 bg-[#ececec] text-black border-2 border-t-[#a0a0a0] border-l-[#a0a0a0] border-b-white border-r-white p-6 flex flex-col items-center justify-center">
        <UserCircle2 size={64} className="text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-[#000080]">Guest Account Restricted</h2>
        <p className="mt-2 text-center text-sm w-3/4">Guest accounts cannot access billing profiles or make purchases. Please register a free Member ID to unlock the digital wallet.</p>
        <button 
          onClick={onClose}
          className="mt-6 px-8 py-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#ececec] text-black border-2 border-t-[#a0a0a0] border-l-[#a0a0a0] border-b-white border-r-white flex flex-col relative z-0">
      <div className="bg-[#000080] text-white p-2 font-bold text-lg flex items-center justify-between border-b-2 border-[#000040]">
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 bg-[#c0c0c0] border-[1px] border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black hover:bg-[#d0d0d0]"
          >
            <ArrowLeft size={16} />
          </button>
          <span>VStore Account Control Panel</span>
        </div>
        <div className="flex gap-4 text-sm bg-black px-3 py-1 border border-gray-600 font-mono shadow-inner items-center">
          <span className="text-gray-400">WALLET:</span>
          <span className="text-green-400 font-bold tracking-widest">${(account.balance || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-[180px] bg-white border-r-2 border-gray-400 p-2 flex flex-col gap-1 shadow-inner shrink-0">
          <button 
            className={`flex items-center gap-2 px-3 py-2 text-sm font-bold border ${activeTab === 'profile' ? 'bg-[#000080] text-white border-[#000040]' : 'hover:bg-gray-200 border-transparent text-black'}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} /> Profile Details
          </button>
          <button 
            className={`flex items-center gap-2 px-3 py-2 text-sm font-bold border ${activeTab === 'billing' ? 'bg-[#000080] text-white border-[#000040]' : 'hover:bg-gray-200 border-transparent text-black'}`}
            onClick={() => setActiveTab('billing')}
          >
            <CreditCard size={16} /> Payment Methods
          </button>
          <button 
            className={`flex items-center gap-2 px-3 py-2 text-sm font-bold border ${activeTab === 'funds' ? 'bg-[#000080] text-white border-[#000040]' : 'hover:bg-gray-200 border-transparent text-black'}`}
            onClick={() => setActiveTab('funds')}
          >
            <Wallet size={16} /> Add Funds
          </button>
          
          <div className="mt-auto mb-2 text-center">
             <ShieldCheck size={48} className="mx-auto text-green-700 opacity-80" />
             <p className="text-[10px] text-gray-500 font-bold mt-2">128-Bit Secure SSL<br/>Encrypted Connection</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b-2 border-gray-400 pb-1">
                <h3 className="font-bold text-xl text-[#000080]">Member Profile</h3>
                {isEditingProfile ? (
                  <button 
                    onClick={handleSaveProfile}
                    className="px-4 py-1.5 bg-[#008000] text-white font-bold text-xs border-2 border-t-[#00cc00] border-l-[#00cc00] border-b-[#004d00] border-r-[#004d00] active:border-t-[#004d00] active:border-l-[#004d00] active:border-b-[#00cc00] active:border-r-[#00cc00]"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-1 bg-[#c0c0c0] font-bold text-sm border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-inner">
                  <p className="text-xs text-gray-500 font-bold mb-1">Display Name</p>
                  {isEditingProfile ? (
                    <input 
                      type="text" 
                      value={editDisplayName} 
                      onChange={e => setEditDisplayName(e.target.value)} 
                      className="w-full border border-gray-400 bg-[#fffff0] font-mono text-lg p-1 outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="font-mono text-lg">{account.displayName}</p>
                  )}
                </div>
                <div className="bg-white p-3 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-inner">
                  <p className="text-xs text-gray-500 font-bold mb-1">VStore Member ID</p>
                  <p className="font-mono text-lg text-gray-500 cursor-not-allowed select-none">{account.memberId}</p>
                </div>
                <div className="bg-white p-3 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-inner col-span-2 md:col-span-1">
                  <p className="text-xs text-gray-500 font-bold mb-1">Email Address</p>
                  {isEditingProfile ? (
                    <input 
                      type="text" 
                      value={editEmail} 
                      onChange={e => setEditEmail(e.target.value)} 
                      className="w-full border border-gray-400 bg-[#fffff0] font-mono p-1 outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="font-mono">{account.email || 'None Provided'}</p>
                  )}
                </div>
                <div className="bg-white p-3 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-inner">
                  <p className="text-xs text-gray-500 font-bold mb-1">Member Since</p>
                  <p className="font-mono">{new Date(account.memberSince).toLocaleDateString()}</p>
                </div>
                <div className="bg-white p-3 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-inner">
                  <p className="text-xs text-gray-500 font-bold mb-1">Total Downloads</p>
                  <p className="font-mono text-xl text-[#000080]">{account.totalDownloads}</p>
                </div>
                <div className="bg-white p-3 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-inner">
                  <p className="text-xs text-gray-500 font-bold mb-1">Purchased Titles</p>
                  <p className="font-mono text-xl text-green-700">{account.purchasedApps?.length || 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-xl text-[#000080] border-b-2 border-gray-400 pb-1 flex justify-between items-center">
                <span>Billing Information</span>
                <span className="text-xs text-gray-500 font-normal">* Fake profiles accepted.</span>
              </h3>
              
              {saveStatus && (
                <div className="bg-[#ffffcc] border border-[#cccc99] p-2 text-sm font-bold text-[#000080]">
                  {saveStatus}
                </div>
              )}

              <form onSubmit={handleSaveBilling} className="bg-white p-4 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-inner flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 border-b border-gray-300 pb-4">
                   <div className="flex flex-col gap-1">
                     <label className="text-xs font-bold">Name on Card</label>
                     <input type="text" value={cardName} onChange={e=>setCardName(e.target.value)} className="border border-gray-400 p-1 text-sm bg-[#fffff0]" />
                   </div>
                   <div className="flex flex-col gap-1">
                     <label className="text-xs font-bold">Card Number</label>
                     <input type="text" value={cardNumber} onChange={e=>setCardNumber(e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" className="border border-gray-400 p-1 text-sm bg-[#fffff0] font-mono" />
                   </div>
                   <div className="flex flex-col gap-1">
                     <label className="text-xs font-bold">Expiration (MM/YY)</label>
                     <input type="text" value={expiry} onChange={e=>setExpiry(e.target.value)} placeholder="12/99" className="border border-gray-400 p-1 text-sm bg-[#fffff0]" />
                   </div>
                   <div className="flex flex-col gap-1">
                     <label className="text-xs font-bold">Security Code (CVV)</label>
                     <input type="text" value={cvv} onChange={e=>setCvv(e.target.value)} placeholder="123" className="border border-gray-400 p-1 text-sm bg-[#fffff0]" />
                   </div>
                </div>

                <div className="flex flex-col gap-3">
                   <h4 className="font-bold text-sm text-gray-700 flex items-center gap-1"><Building2 size={14}/> Billing Address</h4>
                   <div className="flex flex-col gap-1">
                     <label className="text-xs font-bold">Street Address</label>
                     <input type="text" value={address} onChange={e=>setAddress(e.target.value)} className="border border-gray-400 p-1 text-sm bg-[#fffff0]" />
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                     <div className="flex flex-col gap-1 col-span-1">
                       <label className="text-xs font-bold">City</label>
                       <input type="text" value={city} onChange={e=>setCity(e.target.value)} className="border border-gray-400 p-1 text-sm bg-[#fffff0]" />
                     </div>
                     <div className="flex flex-col gap-1 col-span-1">
                       <label className="text-xs font-bold">State/Prov</label>
                       <input type="text" value={state} onChange={e=>setState(e.target.value)} className="border border-gray-400 p-1 text-sm bg-[#fffff0]" />
                     </div>
                     <div className="flex flex-col gap-1 col-span-1">
                       <label className="text-xs font-bold">ZIP/Postal</label>
                       <input type="text" value={zip} onChange={e=>setZip(e.target.value)} className="border border-gray-400 p-1 text-sm bg-[#fffff0]" />
                     </div>
                   </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" className="px-6 py-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 flex items-center gap-2 font-bold text-sm shadow-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
                    <ShieldCheck size={16} className="text-green-700" /> Save Securely
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'funds' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-xl text-[#000080] border-b-2 border-gray-400 pb-1">Fund Digital Wallet</h3>
              
              <div className="bg-[#e6e6fa] border-2 border-[#000080] p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-white border border-gray-400 flex items-center justify-center shrink-0">
                   <DollarSign size={40} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Current Wallet Balance: <span className="text-green-700">${(account.balance || 0).toFixed(2)}</span></h4>
                  <p className="text-sm text-gray-700 mt-1">Add funds using your saved billing profile to securely purchase software without entering your credit card details every time.</p>
                </div>
              </div>

              {!account.billing?.cardNumber && (
                <div className="bg-red-100 border border-red-500 text-red-800 p-3 text-sm font-bold flex gap-2">
                  <AlertTriangle size={18} className="shrink-0" />
                  Please add a Payment Method before attempting to add funds.
                </div>
              )}

              {fundStatus && (
                <div className="bg-[#ffffcc] border border-[#cccc99] p-3 text-sm font-bold text-[#000080]">
                  {fundStatus}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-2">
                 {[10, 20, 50, 100].map(amt => (
                   <button 
                     key={amt}
                     onClick={() => handleAddFunds(amt)}
                     disabled={!account.billing?.cardNumber}
                     className={`border-4 bg-[#c0c0c0] p-3 text-center flex flex-col items-center justify-center gap-1 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white ${
                       !account.billing?.cardNumber 
                         ? 'opacity-50 border-gray-400 cursor-not-allowed' 
                         : 'border-t-white border-l-white border-b-gray-800 border-r-gray-800 hover:bg-[#d0d0d0]'
                     }`}
                   >
                     <span className="font-bold text-2xl text-green-800">${amt}</span>
                     <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Add to Wallet</span>
                   </button>
                 ))}
              </div>
            </div>
          )}

          {/* Secure 10s Auth Overlay */}
          {isAuthorizing && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8">
              <div className="bg-[#000080] w-full max-w-md border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.6)]">
                <div className="bg-blue-900 px-2 py-1 text-white font-bold text-sm tracking-wider border-b border-[#000040] shadow-inner flex items-center gap-2">
                  <ShieldCheck size={16} className="text-green-400" /> VStore Internal Authentication
                </div>
                <div className="p-4 bg-black text-green-500 font-mono text-xs overflow-hidden h-48 border-[4px] border-[#c0c0c0] flex flex-col justify-end relative">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150"></div>
                  </div>
                  <div className="space-y-1 mt-auto break-all pb-2 pr-4">
                    {authLog.map((log, i) => (
                      <p key={i} className="animate-[slideIn_0.2s_ease-out_forwards] tracking-tight">{log}</p>
                    ))}
                    <p className="animate-pulse">_</p>
                  </div>
                </div>
                <div className="bg-[#c0c0c0] p-2 text-center text-[10px] font-bold border-t-2 border-white">
                  PLEASE DO NOT REFRESH OR POWER OFF YOUR MODEM.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
