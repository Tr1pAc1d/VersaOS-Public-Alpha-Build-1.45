import React, { useState, useEffect } from 'react';
import { Mail, ShieldAlert, KeyRound, ArrowRight, Server, Inbox, Send, FileEdit, Trash2, BookUser, Search, RefreshCw, AlertTriangle, UserCircle2 } from 'lucide-react';
import { getAccounts, VStoreAccount } from './VStoreAuth';

const INITIAL_EMAILS = [
  {
    id: 1,
    from: 'VesperaNet Admin',
    subject: 'Welcome to VesperaNET Mail',
    date: 'Oct 14, 1996 08:00 AM',
    body: 'Dear Member,\n\nWelcome to your new VMail inbox! As a connected user of the VStore Catalyst network, your digital correspondence is fully encrypted via a 128-bit SSL handshake.\n\nPlease remember that Vespera Systems will never ask for your password via email. If you receive suspicious packets, immediately alert the SysAdmin.\n\nEnjoy the future.\n\n- The Vespera Systems Team',
    folder: 'inbox',
    read: false
  },
  {
    id: 2,
    from: 'Aetheris Weekly',
    subject: 'Optimize Your X-Type Shielding',
    date: 'Oct 12, 1996 11:45 AM',
    body: 'Newsletter Volume 4.1.1\n\nIs your X-Type hardware experiencing erratic neural processing overloads? Make sure your ceramic shielding is properly seated to block out ambient RF noise from local AM radio towers. Several users report improved Synap-C compilation speeds after applying supplemental EMI foam.\n\n[End of Newsletter]',
    folder: 'inbox',
    read: true
  }
];

export const VMail: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeAccount, setActiveAccount] = useState<VStoreAccount | null>(null);
  
  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // App State
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [emails, setEmails] = useState(INITIAL_EMAILS);
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);
  
  // Interaction State
  const [draftTo, setDraftTo] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const handleSend = () => {
    if (!draftTo || !draftBody) return;
    const newEmail = {
      id: Date.now(),
      from: activeAccount?.displayName || 'Unknown',
      subject: draftSubject || '(No Subject)',
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      body: draftBody,
      folder: 'sent',
      read: true
    };
    setEmails(prev => [newEmail, ...prev]);
    setComposing(false);
    setDraftTo('');
    setDraftSubject('');
    setDraftBody('');
    setActiveFolder('sent');
  };

  const handleDelete = () => {
    if (selectedEmailId) {
      setEmails(prev => prev.map(e => e.id === selectedEmailId ? { ...e, folder: 'trash' } : e));
      setSelectedEmailId(null);
    }
  };

  const handleFetch = () => {
    setIsFetching(true);
    setTimeout(() => {
      setIsFetching(false);
    }, 1500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsAuthenticating(true);

    setTimeout(() => {
      const accounts = getAccounts();
      const account = accounts.find(a => a.username.toLowerCase() === username.toLowerCase());

      if (!account) {
        setLoginError('VStore Member ID not found.');
      } else if (account.isGuest) {
        setLoginError('Guest accounts do not have VMail inboxes.');
      } else if (account.password !== password) {
        setLoginError('Invalid Dial-Up Password.');
      } else {
        setActiveAccount(account);
      }
      setIsAuthenticating(false);
    }, 1200);
  };

  if (!activeAccount) {
    return (
      <div className="flex-1 overflow-hidden relative">
        {/* Repeating horizon line background for visual flavor behind the dialog */}
        <div className="absolute inset-0 bg-[#004c66] flex flex-col justify-end">
          <div className="h-4 bg-white/20 border-t border-white/40"></div>
          <div className="h-2 bg-white/10 border-t border-white/20 mt-1"></div>
        </div>
        
        <div className="absolute inset-0 flex items-start justify-center pt-16 p-4 font-sans text-black">
          {/* Auth Modal Box */}
          <div className="bg-[#c0c0c0] w-full max-w-lg border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col z-10">
            {/* Titlebar */}
            <div className="bg-[#000080] text-white px-2 py-1 font-bold tracking-wide border-b border-white">
              <span className="text-sm">VesperaNET: Secure Gateway</span>
            </div>
            
            <div className="p-4 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_1px,#d0d0d0_1px,#d0d0d0_2px)] bg-[#c0c0c0]">
              <div className="bg-white/40 p-4 border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white relative">
                
                <div className="flex gap-4 mb-6 border-b-2 border-gray-400 pb-4">
                   <div className="flex flex-col gap-1 mt-1">
                     <div className="w-12 h-6 border-2 border-[#000080] rounded-sm flex items-center px-1"><div className="w-1.5 h-1.5 bg-[#000080] rounded-full"></div></div>
                     <div className="w-12 h-6 border-2 border-[#000080] rounded-sm flex items-center px-1"><div className="w-1.5 h-1.5 bg-[#000080] rounded-full"></div></div>
                   </div>
                   <div>
                     <h2 className="font-bold text-lg text-[#000080] tracking-wider font-serif">VMAIL CLIENT LOGIN</h2>
                     <p className="text-xs text-gray-700 leading-tight mt-1 max-w-sm">
                       Please provide your valid VStore Member credentials to access your unified digital inbox.
                     </p>
                   </div>
                </div>

                {loginError && (
                  <div className="bg-[#ffffcc] border border-[#cccc99] p-2 text-xs font-bold text-red-700 flex items-center gap-2 mb-4">
                     <AlertTriangle size={16} className="shrink-0" /> {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                   <div className="flex flex-col gap-1 ml-4">
                     <label className="text-xs font-bold text-gray-800 flex items-center gap-1"><UserCircle2 size={12}/> VStore Username</label>
                     <input 
                       disabled={isAuthenticating}
                       type="text" 
                       value={username} onChange={e=>setUsername(e.target.value)} 
                       className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-sm bg-white focus:bg-[#fffff0] outline-none max-w-sm shadow-inner" 
                     />
                   </div>
                   <div className="flex flex-col gap-1 ml-4">
                     <label className="text-xs font-bold text-gray-800 flex items-center gap-1"><KeyRound size={12}/> VStore Password</label>
                     <input 
                       disabled={isAuthenticating}
                       type="password" 
                       value={password} onChange={e=>setPassword(e.target.value)} 
                       className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-sm bg-white focus:bg-[#fffff0] outline-none font-mono max-w-sm shadow-inner" 
                     />
                   </div>
                   
                   <div className="mt-6 flex justify-between items-center bg-[#c0c0c0] p-2 border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white">
                     <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-2">
                       {isAuthenticating ? 'VERIFYING...' : 'WAITING FOR USER INPUT.'}
                     </div>
                     <div className="flex gap-2">
                       <button type="button" onClick={onClose} className="px-5 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold text-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black hover:bg-[#d0d0d0]">
                         Cancel
                       </button>
                       <button disabled={isAuthenticating} type="submit" className="px-5 py-1.5 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black font-bold text-sm active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 hover:bg-blue-900 flex items-center gap-1 disabled:opacity-50">
                         Authenticate <ArrowRight size={14} className="ml-1"/>
                       </button>
                     </div>
                   </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedEmailData = emails.find(e => e.id === selectedEmailId);
  const activeFolderEmails = emails.filter(e => e.folder === activeFolder);

  return (
    <div className="flex flex-col h-full bg-[#ececec] text-black font-sans">
      {/* VMail Main Toolbar */}
      <div className="flex items-center gap-2 p-1.5 bg-[#c0c0c0] border-b-2 border-gray-400">
        <div className="flex items-center gap-1 px-3 py-1 bg-[#000080] text-white border-2 border-t-white border-l-white border-b-[#000040] border-r-[#000040] shadow-sm ml-1">
           <Mail size={16} /> <span className="font-bold tracking-widest text-sm">VMAIL PRO</span>
        </div>
        <div className="w-px h-6 bg-gray-400 mx-1"></div>
        {composing ? (
          <button className="flex flex-col items-center justify-center w-14 h-12 border-2 border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-800 hover:border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white" onClick={handleSend}>
             <span className="text-green-700 font-bold tracking-wider mt-1"><Send size={20} className="mx-auto"/>Send</span>
          </button>
        ) : (
          <button className="flex flex-col items-center justify-center w-14 h-12 border-2 border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-800 hover:border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white" onClick={() => setComposing(true)}>
             <FileEdit size={20} className="text-gray-700"/>
             <span className="text-[10px] mt-1">Compose</span>
          </button>
        )}
        <button className="flex flex-col items-center justify-center w-14 h-12 border-2 border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-800 hover:border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white" onClick={handleFetch} disabled={isFetching}>
           <RefreshCw size={20} className={`text-blue-700 \${isFetching ? 'animate-spin' : ''}`}/>
           <span className="text-[10px] mt-1">Fetch</span>
        </button>
        <button className="flex flex-col items-center justify-center w-14 h-12 border-2 border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-800 hover:border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">
           <BookUser size={20} className="text-gray-700"/>
           <span className="text-[10px] mt-1">Address</span>
        </button>
        <button className="flex flex-col items-center justify-center w-14 h-12 border-2 border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-800 hover:border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white" onClick={handleDelete} disabled={!selectedEmailId}>
           <Trash2 size={20} className={`\${selectedEmailId ? 'text-red-700' : 'text-gray-400'}`}/>
           <span className="text-[10px] mt-1">Delete</span>
        </button>
        <div className="ml-auto px-4 py-1 text-xs text-gray-500 font-bold border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white">
           Session: {activeAccount.displayName}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[200px] border-r-2 border-gray-400 bg-white shadow-inner shrink-0 flex flex-col p-2 gap-1 overflow-y-auto">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 mt-1 ml-1">Folders</p>
          <button 
            onClick={() => setActiveFolder('inbox')}
            className={`flex items-center justify-between p-1.5 px-2 text-sm border focus:outline-dotted \${activeFolder === 'inbox' ? 'bg-[#000080] text-white border-transparent' : 'text-black border-transparent hover:bg-blue-50'}`}
          >
            <div className="flex items-center gap-2"><Inbox size={16}/> Inbox</div>
            <span className="font-bold">2</span>
          </button>
          <button 
            onClick={() => setActiveFolder('sent')}
            className={`flex items-center justify-between p-1.5 px-2 text-sm border focus:outline-dotted \${activeFolder === 'sent' ? 'bg-[#000080] text-white border-transparent' : 'text-black border-transparent hover:bg-blue-50'}`}
          >
            <div className="flex items-center gap-2"><Send size={16}/> Sent Items</div>
          </button>
          <button 
            onClick={() => setActiveFolder('drafts')}
            className={`flex items-center justify-between p-1.5 px-2 text-sm border focus:outline-dotted \${activeFolder === 'drafts' ? 'bg-[#000080] text-white border-transparent' : 'text-black border-transparent hover:bg-blue-50'}`}
          >
            <div className="flex items-center gap-2"><FileEdit size={16}/> Drafts</div>
          </button>
          <button 
            onClick={() => setActiveFolder('trash')}
            className={`flex items-center justify-between p-1.5 px-2 text-sm border focus:outline-dotted \${activeFolder === 'trash' ? 'bg-[#000080] text-white border-transparent' : 'text-black border-transparent hover:bg-blue-50'}`}
          >
            <div className="flex items-center gap-2"><Trash2 size={16}/> Deleted Items</div>
          </button>
          
          <div className="mt-8 border-t border-gray-300 pt-2">
            <p className="text-[10px] text-gray-500 text-center font-bold">128-Bit VesperaNET Encryption</p>
          </div>
        </div>

        {/* Right Split Pane */}
        <div className="flex flex-col flex-1 min-w-0">
          {composing ? (
            <div className="flex flex-col h-full bg-[#c0c0c0] p-4 text-sm font-sans z-10">
              <div className="flex flex-col gap-2 mb-4 bg-[#c0c0c0]">
                <div className="flex items-center gap-2">
                  <label className="w-16 text-right font-bold text-gray-800">To:</label>
                  <input type="text" value={draftTo} onChange={(e) => setDraftTo(e.target.value)} className="flex-1 p-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white outline-none" placeholder="recipient@vesperanet.sys" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-16 text-right font-bold text-gray-800">Subject:</label>
                  <input type="text" value={draftSubject} onChange={(e) => setDraftSubject(e.target.value)} className="flex-1 p-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white outline-none" />
                </div>
              </div>
              <textarea 
                value={draftBody} 
                onChange={(e) => setDraftBody(e.target.value)} 
                className="flex-1 p-2 font-mono text-sm border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white outline-none resize-none" 
                placeholder="Compose your message here..."
              ></textarea>
              <div className="mt-4 flex justify-end gap-2">
                 <button className="px-5 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black hover:bg-[#d0d0d0]" onClick={() => setComposing(false)}>
                   Discard
                 </button>
                 <button className="px-5 py-1.5 bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black font-bold active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 hover:bg-blue-900 disabled:opacity-50" onClick={handleSend} disabled={!draftTo || !draftBody}>
                   Send Message
                 </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top Half: Message List */}
              <div className="h-[40%] border-b-2 border-gray-400 bg-white overflow-y-auto shadow-inner flex flex-col">
                <div className="bg-[#c0c0c0] flex border-b border-gray-400 text-xs font-bold font-sans">
                  <div className="w-8 border-r border-gray-400 py-1 px-1 flex-shrink-0 text-center">!</div>
                  <div className="w-1/3 border-r border-gray-400 py-1 px-2 line-clamp-1 flex-shrink-0">From</div>
                  <div className="flex-1 border-r border-gray-400 py-1 px-2 line-clamp-1 min-w-0">Subject</div>
                  <div className="w-1/4 py-1 px-2 line-clamp-1 flex-shrink-0">Received</div>
                </div>
                
                {activeFolderEmails.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500 italic mt-4">There are no messages in this folder.</div>
                ) : (
                  activeFolderEmails.map(email => (
                    <div 
                      key={email.id}
                      onClick={() => {
                        setSelectedEmailId(email.id);
                        setEmails(e => e.map(em => em.id === email.id ? { ...em, read: true } : em));
                      }}
                      className={`flex text-sm cursor-pointer border-b border-gray-200 select-none
                        \${selectedEmailId === email.id ? 'bg-[#000080] text-white' : 'text-black hover:bg-blue-50'}
                        \${!email.read && selectedEmailId !== email.id ? 'font-bold' : ''}
                      `}
                    >
                      <div className="w-8 border-r border-gray-200 py-1 px-1 flex-shrink-0 flex items-center justify-center">
                        {!email.read && <Mail size={12} className={selectedEmailId === email.id ? 'text-white' : 'text-blue-700'} />}
                      </div>
                      <div className="w-1/3 border-r border-gray-200 py-1 px-2 truncate flex-shrink-0">{email.from}</div>
                      <div className="flex-1 border-r border-gray-200 py-1 px-2 truncate min-w-0">{email.subject}</div>
                      <div className="w-1/4 py-1 px-2 truncate flex-shrink-0">{email.date}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Half: Message Viewer */}
              <div className="flex-1 bg-white p-4 overflow-y-auto shadow-inner">
                {selectedEmailData ? (
                  <div className="flex flex-col h-full font-sans">
                     <div className="bg-[#f0f0f0] border border-gray-300 p-3 mb-4 text-sm flex flex-col gap-1 shadow-sm">
                        <div className="flex"><span className="w-16 text-gray-500 font-bold shrink-0 text-right pr-2">From:</span> <span className="font-bold">{selectedEmailData.from}</span></div>
                        <div className="flex"><span className="w-16 text-gray-500 font-bold shrink-0 text-right pr-2">Date:</span> <span>{selectedEmailData.date}</span></div>
                        <div className="flex"><span className="w-16 text-gray-500 font-bold shrink-0 text-right pr-2">To:</span> <span>{activeAccount.displayName} &lt;{activeAccount.username}@vesperanet.sys&gt;</span></div>
                        <div className="flex mt-1 pt-1 border-t border-gray-300"><span className="w-16 text-gray-500 font-bold shrink-0 text-right pr-2">Subject:</span> <span className="font-bold text-[#000080]">{selectedEmailData.subject}</span></div>
                     </div>
                     <div className="flex-1 whitespace-pre-wrap font-mono text-sm pl-2 pr-4 overflow-y-auto leading-relaxed">
                       {selectedEmailData.body}
                     </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                     <div className="text-center flex flex-col items-center">
                       <Mail size={48} className="mb-2 opacity-30" />
                       <p className="text-sm font-bold opacity-60">No Message Selected</p>
                     </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
