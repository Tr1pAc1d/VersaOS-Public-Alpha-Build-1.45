import React from 'react';
import { Globe, CheckCircle2, AlertTriangle } from 'lucide-react';
import { VesperaPageProps } from './types';

export const VesperaWelcome: React.FC<VesperaPageProps> = ({ navigate }) => {
  return (
    <div className="flex flex-col h-full items-center py-12 px-6">
      <div className="bg-[#004c66] w-full p-8 text-white border-4 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] max-w-3xl flex flex-col items-center text-center">
        <Globe size={48} className="mb-4 text-[#e0e0e0]" />
        <h2 className="text-4xl font-bold mb-2 tracking-widest" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}><span className="text-[#ffff00]">VESPERA</span>NET</h2>
        <h3 className="text-lg uppercase tracking-widest mb-8 border-b border-[#006680] pb-2">Global Access Established</h3>
        
        <div className="w-full bg-[#c0c0c0] text-black border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-6 shadow-inner text-left">
          <h4 className="text-xl font-bold border-b-2 border-[#000080] pb-2 text-[#000080] flex items-center gap-2">
            <CheckCircle2 size={24} className="text-green-700" /> Account Verification Successful
          </h4>
          <p className="mt-4 text-sm leading-relaxed font-semibold">
            Thank you for registering a Global Member ID with Vespera Systems. Your digital authentication profile is now permanently active on the VesperaNET secure mainframe.
          </p>
          <p className="mt-4 text-sm leading-relaxed">
            With your assigned Member ID, you can instantly log in to the <strong>VStore Catalyst Software Exchange</strong> to securely manage your digital wallet, review lifetime download histories, and purchase premium applications spanning enterprise productivity, system utilities, and legacy entertainment.
          </p>
          
          <div className="bg-[#ffffcc] border border-gray-400 p-3 mt-6 text-xs flex gap-3 items-start">
            <AlertTriangle size={24} className="text-red-700 shrink-0" />
            <div>
              <strong className="text-red-700 uppercase">System Security Warning:</strong> Do not share your VStore Member ID or password on public boards. Vespera Systems administrators will NEVER ask for your dial-up password, authentication protocols, or vault billing profiles.
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={() => navigate('vespera:store')} className="px-8 py-2 bg-[#000080] text-white font-bold border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 cursor-pointer hover:brightness-125">
              Continue to VStore Portal &gt;&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
