import React, { useState } from 'react';
import { VesperaPageProps } from './types';

interface GuestbookEntry {
  id: string;
  name: string;
  date: string;
  message: string;
  isCreepy?: boolean;
}

// Module-level array persists for the duration of the OS session (app life)
const defaultEntries: GuestbookEntry[] = [
  {
    id: '1',
    name: 'Bill R.',
    date: '10/22/1995',
    message: 'We recently upgraded our entire logistics floor to Vespera OS 1.0.3. The networking stability is unparalleled. Keep up the good work!',
  },
  {
    id: '2',
    name: 'Sarah J.',
    date: '11/04/1995',
    message: 'Love the new Web Directory layout! It makes surfing the information superhighway so much easier.',
  },
  {
    id: '3',
    name: 'T. Vance',
    date: '12/15/1995',
    message: 'When will the X-Type Neural Bridge be available for consumer purchase? I want to test it on my home rig.',
  },
  {
    id: '4',
    name: 'A. Thorne',
    date: '01/03/1996',
    message: 'test entry - checking server latency',
  },
  {
    id: '5',
    name: 'Axis.SysAdmin.4',
    date: '02/28/1996',
    message: 'DO NOT INSTALL THE X-TYPE WITHOUT THERMAL SHIELDING. THE CERAMIC HEAT SINK IS INSUFFICIENT. I AM LOSING FEELING IN MY HANDS, AND I HEAR THE FANS WHISPERING MY NAME. THEY ARE LISTENING THROUGH THE AUDIO CODECS.',
    isCreepy: true
  }
];

// Initialize once to persist user's session entries
let sessionGuestStorage = [...defaultEntries];

export const VesperaGuestbook: React.FC<VesperaPageProps> = ({ webAccount, setWebLoginModal }) => {
  const [entries, setEntries] = useState<GuestbookEntry[]>(sessionGuestStorage);
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webAccount) return;
    if (!newMessage.trim()) return;

    const newEntry: GuestbookEntry = {
      id: Date.now().toString(),
      name: webAccount.displayName,
      date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      message: newMessage,
    };

    const updated = [newEntry, ...entries];
    sessionGuestStorage = updated;
    setEntries(updated);
    setNewMessage('');
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Sign Our Guestbook!</h2>
      <p className="mb-6 text-sm">We love hearing from our valued users! Please leave a comment about your experience with Vespera Systems.</p>

      {/* Guestbook Form */}
      <div className="bg-[#c0c0c0] p-4 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-md mb-8">
        {webAccount ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-2 p-2 bg-[#000080] text-white">
              <span className="text-sm font-bold">Posting as Member:</span>
              <span className="text-sm text-[#ffcc00] font-mono">{webAccount.displayName}</span>
            </div>
            <div className="flex items-start gap-2">
              <label className="text-sm font-bold w-16">Message:</label>
              <textarea 
                rows={3}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white px-2 py-1 resize-none"
              />
            </div>
            <div className="flex justify-end mt-2">
              <button 
                type="submit" 
                className="bg-[#c0c0c0] px-6 py-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold cursor-pointer"
              >
                Sign Book
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center p-6 border-2 border-gray-400 bg-white shadow-inner">
            <p className="font-bold text-[#000080] mb-2">VesperaNET Authorization Required</p>
            <p className="text-sm mb-4">You must be logged into the corporate network to leave a public message.</p>
            <button 
              onClick={() => setWebLoginModal(true)}
              className="bg-[#c0c0c0] px-6 py-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white font-bold cursor-pointer text-[#000080]"
            >
              Log in to VesperaNET
            </button>
          </div>
        )}
      </div>

      {/* Guestbook Entries */}
      <div className="space-y-4">
        {entries.map((entry) => {
           if (entry.isCreepy) {
              return (
                 <div key={entry.id} className="border-2 border-gray-400 p-3 bg-white w-full">
                    {/* The creepy class blends exact color so it looks like blank space unless highlighted */}
                    <p className="text-xs font-bold text-gray-400 border-b border-gray-200 pb-1 mb-2 select-none opacity-20">Name: <span className="opacity-0">{entry.name}</span></p>
                    <p className="text-sm text-white select-text selection:bg-red-900 selection:text-white leading-loose">{entry.message}</p>
                 </div>
              )
           }

           return (
            <div key={entry.id} className="border-2 border-gray-400 p-3 bg-white w-full shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
              <div className="flex justify-between items-center border-b border-gray-200 pb-1 mb-2">
                <p className="text-xs font-bold text-black flex items-center gap-2">
                  <img src="https://web.archive.org/web/19991129013009im_/http://www.geocities.com/SiliconValley/Way/6253/html20.gif" className="w-3 h-3 opacity-30 grayscale" alt="" />
                  Name: <span className="text-[#000080]">{entry.name}</span>
                </p>
                <p className="text-[10px] text-gray-500 font-mono">{entry.date}</p>
              </div>
              <p className="text-sm text-black leading-relaxed">{entry.message}</p>
            </div>
          );
        })}
      </div>
      
      {/* 90s Web Elements */}
      <div className="mt-8 text-center">
         <img src="https://web.archive.org/web/19991129013009im_/http://www.geocities.com/SiliconValley/Way/6253/netscape3.gif" alt="Netscape Enhanced" className="h-6 inline-block mx-auto opacity-50 grayscale hover:grayscale-0"/>
      </div>
    </>
  );
};
