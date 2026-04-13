import React from 'react';
import { UserCircle2 } from 'lucide-react';
import { VesperaPageProps } from './types';

export const VesperaAccount: React.FC<VesperaPageProps> = ({ webAccount, onDownload }) => {
  if (!webAccount) return null;

  return (
    <>
      <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Network Member Profile</h2>
      
      <div className="bg-[#f0f0f0] p-6 border-2 border-t-white border-l-white border-b-gray-400 border-r-gray-400 shadow-md max-w-2xl mx-auto mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 bg-[#000080] flex items-center justify-center border-2 border-[#ffcc00] shadow-inner">
              <UserCircle2 size={48} className="text-[#ffcc00]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black border-b border-gray-400 pb-1 mb-2">{webAccount.displayName}</h3>
              <p className="text-xs text-gray-600 font-mono">ACCOUNT ID: {webAccount.memberId}</p>
              <p className="text-xs text-[#000080] font-bold mt-1">STATUS: {webAccount.tier.toUpperCase()} MEMBER VERIFIED</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mb-6 border-t border-b border-gray-400 py-4">
            <div><span className="text-gray-600 font-bold block mb-1">MEMBER SINCE:</span>{new Date(webAccount.memberSince).toLocaleDateString()}</div>
            <div><span className="text-gray-600 font-bold block mb-1">CURRENT TIER:</span>{webAccount.tier}</div>
            <div><span className="text-gray-600 font-bold block mb-1">VSTORE POINTS:</span>{webAccount.vstorePoints}</div>
            <div><span className="text-gray-600 font-bold block mb-1">EST. WALLET BALANCE:</span>${webAccount.balance.toFixed(2)}</div>
            <div><span className="text-gray-600 font-bold block mb-1">DOWNLOAD COUNT:</span>{webAccount.totalDownloads}</div>
          </div>

          <div className="bg-white p-4 border border-gray-400">
            <h4 className="font-bold text-[#000080] border-b border-gray-300 pb-1 mb-3">Upgrade Membership</h4>
            <p className="text-xs text-black mb-4">
              Ready to experience the raw power of VesperaNET Gold? Gain access to unmetered file transfers and the exclusive SysAdmin lounge.
            </p>
            <form className="flex flex-col gap-3 text-xs font-bold" onSubmit={(e) => { e.preventDefault(); alert('Automatic upgrades are currently offline. Please dial 1-800-VESPERA for operator assistance.'); }}>
              <div className="flex items-center gap-2">
                <input type="radio" id="gold" name="tier" defaultChecked />
                <label htmlFor="gold" className="text-orange-600 cursor-pointer">Gold Tier ($19.95/mo)</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" id="plat" name="tier" disabled />
                <label htmlFor="plat" className="text-gray-400">Platinum Tier (Requires Corporate Token)</label>
              </div>
              <div className="mt-3">
                <label className="block mb-1">Valid Credit Card Number:</label>
                <input type="password" placeholder="XXXX-XXXX-XXXX-XXXX" className="border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white p-1" />
              </div>
              <button type="submit" className="mt-2 w-1/3 px-4 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-black active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs whitespace-nowrap cursor-pointer">
                Process Upgrade
              </button>
            </form>
          </div>
      </div>
    </>
  );
};
