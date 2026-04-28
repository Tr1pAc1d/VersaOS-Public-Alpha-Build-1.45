import React, { useState, useEffect, useRef } from 'react';
import { Mail, ShieldAlert, KeyRound, ArrowRight, Server, Inbox, Send, FileEdit, Trash2, BookUser, Search, RefreshCw, AlertTriangle, UserCircle2, UserPlus, Network, Paperclip, Save, CornerUpLeft, CornerUpRight, Printer, Book } from 'lucide-react';
import { getAccounts, VStoreAccount, getSession, setSession } from './VStoreAuth';
import { useVMail } from '../contexts/VMailContext';
import { playBrowserBootSound, playInfoSound } from '../utils/audio';
import { VersaFileManager } from './VersaFileManager';
import { VesperaSplash } from './VesperaSplash';

export const CONTACTS = [
  { name: 'SysAdmin', email: 'admin@vesperanet.sys' },
  { name: 'X-Type Support', email: 'xtype@internal.vesperanet.sys' },
  { name: 'Elias Thorne', email: 'thorne.e@vesperasystems.com' },
  { name: 'Dr. Vasquez', email: 'dr.vasquez@vesperacorp.internal' },
  { name: 'IT Helpdesk', email: 'helpdesk@vesperacorp.internal' },
  { name: 'Postmaster', email: 'postmaster@vesperacorp.internal' },
  { name: 'EchoSoft Liaison', email: 'unknown_sender@echosoft.com' }
];

export const VMail: React.FC<{ onClose: () => void, vfs?: any }> = ({ onClose, vfs }) => {
  const { emails, sendEmail, deleteEmail, markAsRead, saveDraft } = useVMail();
  const [activeAccount, setActiveAccount] = useState<VStoreAccount | null>(() => {
    const session = getSession();
    if (session) {
      const account = getAccounts().find(a => a.username === session);
      if (account && !account.isGuest) return account;
    }
    return null;
  });
  
  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Connection State
  const [isDialing, setIsDialing] = useState(false);
  const [dialStep, setDialStep] = useState('');
  const [dialProgress, setDialProgress] = useState(0);

  // App State
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);
  
  // Interaction State
  const [draftTo, setDraftTo] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [draftAttachments, setDraftAttachments] = useState<{name: string, content: string}[]>([]);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, message: string}>({isOpen: false, message: ''});

  // Splash Screen State
  const [splashDone, setSplashDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hide the parent window frame until the splash screen is done
  useEffect(() => {
    const parentWin = containerRef.current?.closest('.absolute.bg-\\[\\#c0c0c0\\]') as HTMLElement;
    if (parentWin) {
      parentWin.style.visibility = splashDone ? 'visible' : 'hidden';
    }
  }, [splashDone]);

  const handleCreateAccount = () => {
     window.dispatchEvent(new CustomEvent('launch-app', { detail: { id: 'browser', defaultUrl: 'vespera:account' } }));
  };

  const executeConnectionSequence = (account: VStoreAccount) => {
     setIsDialing(true);
     setDialStep('Negotiating VesperaNET SSL Handshake...');
     setDialProgress(10);
     playBrowserBootSound();

     setTimeout(() => {
        setDialStep('Verifying Cryptographic Tokens...');
        setDialProgress(40);
     }, 1500);

     setTimeout(() => {
        setDialStep('Synchronizing Inbox Vectors...');
        setDialProgress(70);
     }, 3000);

     setTimeout(() => {
        setDialStep('Connection Established.');
        setDialProgress(100);
     }, 4200);

     setTimeout(() => {
        setIsDialing(false);
        setActiveAccount(account);
        setSession(account.username);
     }, 4800);
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
        window.dispatchEvent(new CustomEvent('vespera-system-error', {
          detail: { type: 'Authentication Error', title: 'VMail Login Failed', message: `VStore Member ID "${username}" not found in the directory. Please check your credentials.`, fatal: false }
        }));
        playInfoSound();
      } else if (account.isGuest) {
        setLoginError('Guest accounts do not have VMail inboxes.');
        window.dispatchEvent(new CustomEvent('vespera-system-error', {
          detail: { type: 'Authentication Error', title: 'Guest Account Restricted', message: 'Guest accounts do not have access to VMail. Please use a registered VStore Member account.', fatal: false }
        }));
        playInfoSound();
      } else if (account.password !== password) {
        setLoginError('Invalid Dial-Up Password.');
        window.dispatchEvent(new CustomEvent('vespera-system-error', {
          detail: { type: 'Authentication Error', title: 'Invalid Password', message: 'The password you entered is incorrect. Please try again.', fatal: false }
        }));
        playInfoSound();
      } else {
        // Success -> trigger connection boot
        executeConnectionSequence(account);
      }
      setIsAuthenticating(false);
    }, 1200);
  };

  const handleSend = () => {
    if (!draftTo || !draftBody) return;
    sendEmail(draftTo, draftSubject, draftBody, activeAccount?.displayName || 'Unknown', draftAttachments.length > 0 ? draftAttachments : undefined);
    setComposing(false);
    setDraftTo('');
    setDraftSubject('');
    setDraftBody('');
    setDraftAttachments([]);
    setActiveFolder('sent');
  };

  const handleDiscard = () => {
    if (draftTo || draftBody || draftSubject) {
      saveDraft(draftSubject ? draftTo : 'Draft', draftSubject, draftBody, draftAttachments.length > 0 ? draftAttachments : undefined);
    }
    setComposing(false);
    setDraftTo('');
    setDraftSubject('');
    setDraftBody('');
    setDraftAttachments([]);
  };

  const handleReply = (emailData: any) => {
    setDraftTo(emailData.from);
    setDraftSubject(emailData.subject.startsWith('Re:') ? emailData.subject : `Re: ${emailData.subject}`);
    setDraftBody(`\n\n----------------------------------------\nOn ${emailData.date}, ${emailData.from} wrote:\n\n> ${emailData.body.split('\n').join('\n> ')}`);
    setDraftAttachments([]);
    setComposing(true);
  };

  const handleForward = (emailData: any) => {
    setDraftTo('');
    setDraftSubject(emailData.subject.startsWith('Fwd:') ? emailData.subject : `Fwd: ${emailData.subject}`);
    setDraftBody(`\n\n---------- Forwarded message ---------\nFrom: ${emailData.from}\nDate: ${emailData.date}\nSubject: ${emailData.subject}\n\n${emailData.body}`);
    setDraftAttachments(emailData.attachments || []);
    setComposing(true);
  };

  const handleSaveToVfs = (emailData: any) => {
    if (!vfs) return;
    const safeRef = emailData.subject.replace(/[^a-z0-9]/gi, '_').substring(0, 15);
    const content = `From: ${emailData.from}\r\nDate: ${emailData.date}\r\nSubject: ${emailData.subject}\r\n\r\n${emailData.body}`;
    vfs.createNode(`MAIL_${safeRef}.TXT`, 'file', 'documents', content);
    playInfoSound();
    setAlertModal({ isOpen: true, message: `Saved to C:\\DOCUMENTS\\MAIL_${safeRef}.TXT` });
  };

  const handleDelete = () => {
    if (selectedEmailId) {
      deleteEmail(selectedEmailId);
      setSelectedEmailId(null);
    }
  };

  const handleFetch = () => {
    setIsFetching(true);
    setTimeout(() => setIsFetching(false), 1500);
  };

  // 1. Unauthenticated or Dialing Views
  if (!activeAccount) {
    return (
      <div ref={containerRef} className="h-full overflow-hidden relative">
        {!splashDone && (
          <VesperaSplash
            appName="VMail"
            subtitle="VesperaNET Secure Mail"
            version="Version 1.0"
            developer="Vespera Systems"
            icon="/Icons/mailbox_world-2.png"
            durationMs={2500}
            onDone={() => setSplashDone(true)}
          />
        )}
        <div className="absolute inset-0 bg-[#004c66] flex flex-col justify-end">
          <div className="h-4 bg-white/20 border-t border-white/40"></div>
          <div className="h-2 bg-white/10 border-t border-white/20 mt-1"></div>
        </div>
        
        <div className="absolute inset-0 flex items-start justify-center pt-16 p-4 font-sans text-black">
          {/* Auth Modal Box */}
          <div className="bg-[#c0c0c0] w-full max-w-lg border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col z-10 transition-all">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold tracking-wide border-b border-white flex justify-between">
              <span className="text-sm">VesperaNET Secure Mail</span>
              <button onClick={onClose} className="bg-[#c0c0c0] text-black w-4 h-4 flex items-center justify-center font-bold font-mono border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 hover:active:border-t-gray-800 hover:active:border-l-gray-800 hover:active:border-b-white hover:active:border-r-white text-[10px]">X</button>
            </div>
            
            <div className="p-4 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_1px,#d0d0d0_1px,#d0d0d0_2px)] bg-[#c0c0c0]">
              <div className="bg-white p-4 border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white relative">
                
                {isDialing ? (
                   <div className="flex flex-col items-center justify-center h-48 py-4">
                      <Network size={48} className="text-[#000080] animate-pulse mb-4" />
                      <h2 className="font-bold text-lg text-[#000080] font-serif mb-2">Connecting to Server</h2>
                      <p className="text-xs text-gray-600 mb-6 font-mono text-center h-4">{dialStep}</p>
                      
                      <div className="w-[80%] border border-gray-400 bg-gray-200 h-6 relative shadow-inner overflow-hidden">
                        <div 
                          className="h-full bg-[#000080] transition-all duration-300 ease-linear flex items-center overflow-hidden" 
                          style={{width: `${dialProgress}%`}}
                        >
                           <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.2)_10px,rgba(255,255,255,0.2)_20px)]" />
                        </div>
                      </div>
                   </div>
                ) : (
                   <>
                      <div className="flex gap-4 mb-6 border-b-2 border-[#000080] pb-4">
                        <div className="flex flex-col items-center justify-center bg-[#000080] p-2 border-2 border-t-gray-400 border-l-gray-400 border-b-black border-r-black">
                           <Mail size={32} className="text-white" />
                        </div>
                        <div>
                           <h2 className="font-bold text-xl text-[#000080] font-serif">VMAIL PROFESSIONAL</h2>
                           <p className="text-xs text-gray-700 leading-tight mt-1 max-w-sm">
                             Provide your VStore credentials to access your unified digital inbox.
                           </p>
                        </div>
                      </div>

                      {loginError && (
                        <div className="bg-red-100 border border-red-500 p-2 text-xs font-bold text-red-800 flex items-center gap-2 mb-4">
                           <AlertTriangle size={16} className="shrink-0" /> {loginError}
                        </div>
                      )}

                      <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div className="flex flex-col ml-12">
                           <label className="text-xs font-bold text-gray-800 mb-1">Username:</label>
                           <input 
                             disabled={isAuthenticating}
                             type="text" 
                             value={username} onChange={e=>setUsername(e.target.value)} 
                             className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-sm bg-white focus:bg-[#fffff0] outline-none max-w-[200px]" 
                           />
                        </div>
                        <div className="flex flex-col ml-12">
                           <label className="text-xs font-bold text-gray-800 mb-1">Password:</label>
                           <input 
                             disabled={isAuthenticating}
                             type="password" 
                             value={password} onChange={e=>setPassword(e.target.value)} 
                             className="border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-1 text-sm bg-white focus:bg-[#fffff0] outline-none font-mono max-w-[200px]" 
                           />
                        </div>
                        
                        <div className="mt-4 border-t border-gray-300 pt-4 flex flex-col gap-2 relative">
                           <button type="button" onClick={handleCreateAccount} className="absolute -top-3 right-0 bg-white px-2 text-[10px] text-blue-700 underline font-bold cursor-pointer hover:text-red-600">
                             Need an account?
                           </button>
                           <div className="flex justify-end gap-2">
                             <button type="button" onClick={onClose} className="px-5 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold text-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black hover:bg-[#d0d0d0]">
                               Cancel
                             </button>
                             <button disabled={isAuthenticating} type="submit" className="px-6 py-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold text-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black hover:bg-[#d0d0d0] disabled:opacity-50">
                               {isAuthenticating ? 'Working...' : 'Log In'}
                             </button>
                           </div>
                        </div>
                      </form>
                   </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main Mail Client
  const selectedEmailData = emails.find(e => e.id === selectedEmailId);
  const activeFolderEmails = emails.filter(e => e.folder === activeFolder);
  const unreadCount = emails.filter(e => e.folder === 'inbox' && !e.read).length;

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 relative">
      {!splashDone && (
        <VesperaSplash
          appName="VMail"
          subtitle="VesperaNET Secure Mail"
          version="Version 1.0"
          developer="Vespera Systems"
          icon="/Icons/mailbox_world-2.png"
          durationMs={2500}
          onDone={() => setSplashDone(true)}
        />
      )}
      {/* VMail Menu Bar */}
      <div className="flex items-center gap-4 py-1 px-2 border-b border-gray-500 text-xs">
         <div className="flex gap-4">
            <span className="hover:bg-[#000080] hover:text-white px-1">File</span>
            <span className="hover:bg-[#000080] hover:text-white px-1">Edit</span>
            <span className="hover:bg-[#000080] hover:text-white px-1">View</span>
            <span className="hover:bg-[#000080] hover:text-white px-1">Tools</span>
            <span className="hover:bg-[#000080] hover:text-white px-1">Message</span>
            <span className="hover:bg-[#000080] hover:text-white px-1">Help</span>
         </div>
      </div>

      {/* VMail Toolbar */}
      <div className="flex items-center gap-1 p-1 pl-2 bg-[#c0c0c0] border-b-2 border-gray-400 shrink-0">
        <button 
          className="flex gap-1 items-center justify-center px-3 py-1 bg-[#c0c0c0] border-2 border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-800 hover:border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white" 
          onClick={() => setComposing(true)}
        >
           <FileEdit size={16} className="text-[#000080]"/>
           <span className="text-xs font-bold mt-0.5">Compose</span>
        </button>
        <div className="w-px h-6 bg-gray-500 mx-1 border-r border-white"></div>
        <button 
          className="flex gap-1 items-center justify-center px-3 py-1 bg-[#c0c0c0] border-2 border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-800 hover:border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white" 
          onClick={handleFetch} 
          disabled={isFetching}
        >
           <RefreshCw size={16} className={`text-blue-700 ${isFetching ? 'animate-spin' : ''}`}/>
           <span className="text-xs mt-0.5">Send/Recv</span>
        </button>
        <button className="flex gap-1 items-center justify-center px-3 py-1 bg-[#c0c0c0] border-2 border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-800 hover:border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white" onClick={() => setShowAddressBook(true)}>
           <BookUser size={16} className="text-gray-700"/>
           <span className="text-xs mt-0.5">Address</span>
        </button>
        <button 
          className="flex gap-1 items-center justify-center px-3 py-1 bg-[#c0c0c0] border-2 border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-800 hover:border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white" 
          onClick={handleDelete} 
          disabled={!selectedEmailId}
        >
           <Trash2 size={16} className={`\${selectedEmailId ? 'text-red-700' : 'text-gray-400'}`}/>
           <span className="text-xs mt-0.5">Delete</span>
        </button>
        
        <img src="/Vespera Logo Small.png" alt="logo" className="h-6 ml-auto mr-4 opacity-50 contrast-125 saturate-0" />
      </div>

      <div className="flex flex-1 overflow-hidden p-1 gap-1">
        {/* Left Folders Pane */}
        <div className="w-[180px] bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white flex flex-col p-1 shrink-0 overflow-y-auto">
          <div className="flex items-center gap-1 font-bold text-xs p-1 mb-2 bg-[#000080] text-white">
             <Server size={14}/> Local Folders
          </div>
          <button 
            onClick={() => setActiveFolder('inbox')}
            className={`flex items-center justify-between p-1 pl-4 text-xs font-bold ${activeFolder === 'inbox' ? 'bg-[#000080] text-white' : 'text-black hover:bg-gray-200'}`}
          >
            <div className="flex items-center gap-2"><Inbox size={14} className={activeFolder === 'inbox' ? 'text-white' : 'text-[#000080]'}/> Inbox</div>
            {unreadCount > 0 && <span>({unreadCount})</span>}
          </button>
          <button 
            onClick={() => setActiveFolder('sent')}
            className={`flex items-center p-1 pl-4 text-xs ${activeFolder === 'sent' ? 'bg-[#000080] text-white' : 'text-black hover:bg-gray-200'}`}
          >
            <div className="flex items-center gap-2"><Send size={14} className={activeFolder === 'sent' ? 'text-white' : 'text-[#000080]'}/> Sent Items</div>
          </button>
          <button 
            onClick={() => setActiveFolder('drafts')}
            className={`flex items-center p-1 pl-4 text-xs ${activeFolder === 'drafts' ? 'bg-[#000080] text-white' : 'text-black hover:bg-gray-200'}`}
          >
            <div className="flex items-center gap-2"><FileEdit size={14} className={activeFolder === 'drafts' ? 'text-white' : 'text-[#000080]'}/> Drafts</div>
          </button>
          <button 
            onClick={() => setActiveFolder('trash')}
            className={`flex items-center p-1 pl-4 text-xs ${activeFolder === 'trash' ? 'bg-[#000080] text-white' : 'text-black hover:bg-gray-200'}`}
          >
            <div className="flex items-center gap-2"><Trash2 size={14} className={activeFolder === 'trash' ? 'text-white' : 'text-[#000080]'}/> Deleted Items</div>
          </button>
        </div>

        {/* Right Pane (Split horizontal for list and read) */}
        <div className="flex flex-col flex-1 min-w-0 gap-1 overflow-hidden">
          {/* Message List - ALWAYS VISIBLE */}
          <div className="h-[40%] bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-inner flex flex-col overflow-y-auto">
            <div className="bg-[#c0c0c0] flex border-b-2 border-b-gray-400 text-xs font-bold font-sans sticky top-0 shadow-sm">
              <div className="w-6 border-r-2 border-r-white border-b border-b-gray-400 flex-shrink-0"></div>
              <div className="w-1/3 border-r-2 border-r-white border-b border-b-gray-400 py-1 px-2">From</div>
              <div className="flex-1 border-r-2 border-r-white border-b border-b-gray-400 py-1 px-2">Subject</div>
              <div className="w-1/4 py-1 px-2 border-b border-b-gray-400">Received</div>
            </div>
            
            {activeFolderEmails.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 mt-2 font-serif italic">This folder is empty.</div>
            ) : (
              activeFolderEmails.map(email => (
                <div 
                  key={email.id}
                  onClick={() => {
                    setSelectedEmailId(email.id);
                    markAsRead(email.id);
                    setComposing(false); // Cancel composing if they click a different email here
                  }}
                  className={`flex text-xs cursor-pointer select-none
                    ${selectedEmailId === email.id && !composing ? 'bg-[#000080] text-white' : 'text-black hover:bg-gray-100'}
                    ${!email.read && (selectedEmailId !== email.id || composing) ? 'font-bold' : ''}
                  `}
                >
                  <div className="w-6 py-0.5 flex-shrink-0 flex items-center justify-center">
                    {!email.read && <Mail size={12} className={selectedEmailId === email.id && !composing ? 'text-white' : 'text-[#000080]'} />}
                  </div>
                  <div className="w-1/3 py-1 px-2 truncate border-r border-[#ececec]">{email.from}</div>
                  <div className="flex-1 py-1 px-2 truncate border-r border-[#ececec]">{email.subject}</div>
                  <div className="w-1/4 py-1 px-2 truncate">{email.date}</div>
                </div>
              ))
            )}
          </div>

          {composing ? (
            <div className="flex-1 flex flex-col min-h-0 bg-[#c0c0c0] p-2 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800">
              <div className="flex gap-2 mb-2 items-center border-b border-gray-400 pb-2">
                 <button className="flex gap-1 px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black hover:bg-[#d0d0d0]" onClick={handleSend} disabled={!draftTo || !draftBody}>
                   <Send size={16} className="text-[#000080]"/> Send
                 </button>
                 <button className="flex gap-1 px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs text-black active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white" onClick={() => setShowAttachmentPicker(!showAttachmentPicker)}>
                   <Paperclip size={14} className="text-gray-700"/> Attach
                 </button>
                 <button className="px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-xs text-black active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white ml-auto" onClick={handleDiscard}>
                   Discard
                 </button>
              </div>
              <div className="flex flex-col gap-1 mb-2">
                <div className="flex items-center gap-2 text-sm bg-white border border-gray-400 p-1">
                  <label className="w-16 font-bold text-gray-800 text-right">To:</label>
                  <div className="flex-1 flex relative items-stretch border border-gray-300">
                    <input type="text" value={draftTo} onChange={(e) => setDraftTo(e.target.value)} className="flex-1 outline-none font-sans bg-transparent px-1 min-w-0" placeholder="recipient@vesperanet.sys" />
                    <div className="w-5 bg-[#c0c0c0] border-l border-gray-400 flex items-center justify-center relative cursor-pointer active:bg-gray-300 hover:bg-[#d0d0d0]">
                       <span className="text-[8px] pointer-events-none">&#9660;</span>
                       <select 
                         className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                         value=""
                         onChange={(e) => {
                           if (e.target.value) setDraftTo(e.target.value);
                         }}
                       >
                         <option value="" disabled>Contacts...</option>
                         {CONTACTS.map(c => <option key={c.email} value={c.email}>{c.name} &lt;{c.email}&gt;</option>)}
                       </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm bg-white border border-gray-400 p-1">
                  <label className="w-16 font-bold text-gray-800 text-right">Subject:</label>
                  <input type="text" value={draftSubject} onChange={(e) => setDraftSubject(e.target.value)} className="flex-1 outline-none font-sans" />
                </div>
                {draftAttachments.length > 0 && (
                  <div className="flex items-center gap-2 text-sm bg-white border border-gray-400 p-1">
                    <label className="w-16 font-bold text-gray-800 text-right shrink-0">Attached:</label>
                    <div className="flex-1 flex gap-2 overflow-x-auto">
                      {draftAttachments.map((att, i) => (
                        <span key={i} className="flex gap-1 items-center bg-gray-200 px-1 border border-gray-400 text-xs text-[#000080]">
                          <Paperclip size={10} /> {att.name}
                          <button onClick={() => setDraftAttachments(prev => prev.filter((_, index) => index !== i))} className="ml-1 text-black hover:text-red-600 font-bold">x</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <textarea 
                value={draftBody} 
                onChange={(e) => setDraftBody(e.target.value)} 
                className="flex-1 p-2 font-mono text-sm bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white outline-none resize-none shadow-inner" 
              ></textarea>
            </div>
          ) : (
              <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white shadow-inner flex flex-col overflow-hidden">
                {selectedEmailData ? (
                  <>
                     <div className="bg-[#c0c0c0] border-b border-gray-400 p-1 flex gap-1 items-center shrink-0">
                       <button onClick={() => handleReply(selectedEmailData)} className="flex items-center gap-1 px-3 py-0.5 bg-[#c0c0c0] border-2 border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-800 hover:border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs">
                         <CornerUpLeft size={14} className="text-[#000080]" /> Reply
                       </button>
                       <button onClick={() => handleForward(selectedEmailData)} className="flex items-center gap-1 px-3 py-0.5 bg-[#c0c0c0] border-2 border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-800 hover:border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs">
                         <CornerUpRight size={14} className="text-[#000080]" /> Forward
                       </button>
                       <div className="w-px h-4 bg-gray-500 mx-1 border-r border-white"></div>
                       <button onClick={() => handleSaveToVfs(selectedEmailData)} className="flex items-center gap-1 px-3 py-0.5 bg-[#c0c0c0] border-2 border-transparent hover:border-t-white hover:border-l-white hover:border-b-gray-800 hover:border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-xs">
                         <Save size={14} className="text-[#000080]" /> Export VFS
                       </button>
                     </div>
                     <div className="bg-[#ececec] border-b border-gray-400 p-2 text-xs flex flex-col font-sans shrink-0">
                        <div className="flex mb-1"><strong className="w-16 shrink-0 text-gray-600 font-bold">From:</strong> <span>{selectedEmailData.from}</span></div>
                        <div className="flex mb-1"><strong className="w-16 shrink-0 text-gray-600 font-bold">Date:</strong> <span>{selectedEmailData.date}</span></div>
                        <div className="flex mb-1"><strong className="w-16 shrink-0 text-gray-600 font-bold">To:</strong> <span>{activeAccount.displayName} &lt;{activeAccount.username}@vesperanet.sys&gt;</span></div>
                        <div className="flex pt-1"><strong className="w-16 shrink-0 text-gray-600 font-bold">Subject:</strong> <span className="font-bold">{selectedEmailData.subject}</span></div>
                     </div>
                     <div className="flex-1 flex flex-col min-h-0 bg-white">
                       <div className="flex-1 overflow-y-auto whitespace-pre-wrap font-mono text-[13px] p-4 text-black leading-relaxed">
                         {selectedEmailData.body}
                       </div>
                       {selectedEmailData.attachments && selectedEmailData.attachments.length > 0 && (
                         <div className="p-2 border-t-2 border-gray-400 bg-gray-200 shrink-0 shadow-inner">
                           <div className="font-bold text-xs mb-2 text-gray-700">Attachments:</div>
                           <div className="flex gap-2 flex-wrap">
                             {selectedEmailData.attachments.map((att, idx) => (
                               <div key={idx} className="flex flex-col gap-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2 text-xs w-48 shadow-sm">
                                 <div className="flex items-center gap-2 mb-1">
                                    <Paperclip size={14} className="text-[#000080]" />
                                    <span className="font-mono truncate flex-1 font-bold">{att.name}</span>
                                 </div>
                                 <button 
                                   onClick={() => {
                                     // Save to VFS downloads
                                     if (vfs) {
                                        vfs.createNode(att.name, 'file', 'downloads', att.content || '');
                                        playInfoSound();
                                        setAlertModal({ isOpen: true, message: `Attachment saved to C:\\DOWNLOADS\\${att.name}` });
                                     } else {
                                        setAlertModal({ isOpen: true, message: 'VFS not available to save attachment.' });
                                     }
                                   }}
                                   className="flex justify-center items-center gap-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-2 py-1 hover:active:border-t-gray-800 hover:active:border-l-gray-800 hover:active:border-b-white hover:active:border-r-white font-bold w-full"
                                 >
                                   <Save size={12} /> Save Target
                                 </button>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400 bg-gray-50 scale-110 opacity-50">
                     <Mail size={80} className="mb-2" />
                  </div>
                )}
              </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t-2 border-t-gray-400 text-[10px] uppercase font-bold text-gray-600 py-0.5 px-2 flex justify-between items-center bg-[#c0c0c0] shrink-0">
        <div className="flex gap-2 items-center">
          <span>Connected as: {activeAccount.displayName}</span>
          <button 
            onClick={() => { setSession(null); setActiveAccount(null); }}
            className="text-[#000080] hover:text-red-700 underline capitalize cursor-pointer font-bold leading-none"
          >
            Sign Out
          </button>
        </div>
        <span>{unreadCount} Unread Message{unreadCount !== 1 ? 's' : ''}</span>
      </div>

      {showAttachmentPicker && vfs && (
        <div className="absolute inset-0 z-50 p-4 bg-black/20 flex items-center justify-center pointer-events-auto">
          <div className="w-[600px] h-[400px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide border-b border-white flex justify-between">
              <span>Insert Object</span>
              <button onClick={() => setShowAttachmentPicker(false)} className="bg-[#c0c0c0] text-black w-4 h-4 flex items-center justify-center font-bold font-mono border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 hover:active:border-t-gray-800 hover:active:border-l-gray-800 hover:active:border-b-white hover:active:border-r-white text-[10px]">X</button>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <VersaFileManager 
                vfs={vfs} 
                isPickerMode={true} 
                onCancel={() => setShowAttachmentPicker(false)}
                onOpenFile={(nodeId) => {
                  const file = vfs.getNode(nodeId);
                  if (file && file.type === 'file') {
                    setDraftAttachments(prev => [...prev, { name: file.name, content: file.content || '' }]);
                    setShowAttachmentPicker(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
      {showAddressBook && (
        <div className="absolute inset-0 z-[60] p-4 bg-black/20 flex items-center justify-center pointer-events-auto">
          <div className="w-[500px] h-[350px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide border-b border-white flex justify-between">
              <div className="flex gap-2 items-center"><Book size={14}/> <span>VesperaNET Address Book</span></div>
              <button onClick={() => setShowAddressBook(false)} className="bg-[#c0c0c0] text-black w-4 h-4 flex items-center justify-center font-bold font-mono border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 hover:active:border-t-gray-800 hover:active:border-l-gray-800 hover:active:border-b-white hover:active:border-r-white text-[10px]">X</button>
            </div>
            <div className="flex items-center gap-2 p-2 border-b-2 border-gray-500 bg-[#c0c0c0] shrink-0">
              <BookUser size={32} className="text-[#000080]" />
              <div className="flex flex-col">
                 <span className="font-bold text-sm font-serif">Global Directory</span>
                 <span className="text-xs text-gray-700">Select a contact below to automatically populate the Compose window.</span>
              </div>
            </div>
            <div className="flex-1 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white m-2 overflow-y-auto w-[460px] self-center">
               <table className="w-full text-xs text-left">
                 <thead className="bg-[#c0c0c0] sticky top-0 border-b border-gray-400">
                   <tr>
                     <th className="font-bold py-1 px-2 border-r border-gray-400">Name</th>
                     <th className="font-bold py-1 px-2">E-Mail Address</th>
                   </tr>
                 </thead>
                 <tbody>
                   {CONTACTS.map((c, i) => (
                      <tr 
                         key={i} 
                         className="hover:bg-[#000080] hover:text-white cursor-pointer border-b border-[#ececec]"
                         onClick={() => {
                           setDraftTo(c.email);
                           setComposing(true);
                           setShowAddressBook(false);
                         }}
                      >
                        <td className="py-1 px-2 border-r border-[#ececec] whitespace-nowrap">{c.name}</td>
                        <td className="py-1 px-2">{c.email}</td>
                      </tr>
                   ))}
                   {/* Extract dynamically from emails where from isn't self and not in known */}
                   {Array.from(new Set(emails.filter(e => e.folder === 'inbox' || e.folder === 'sent').map(e => {
                      const m = e.from.match(/<([^>]+)>/);
                      if (m) return m[1];
                      if (e.from.includes('@')) return e.from;
                      return '';
                   }))).filter(f => f && f !== `${activeAccount.username}@vesperanet.sys` && !CONTACTS.some(c => c.email === f)).map((f, i) => (
                      <tr 
                         key={f} 
                         className="hover:bg-[#000080] hover:text-white cursor-pointer border-b border-[#ececec]"
                         onClick={() => {
                           setDraftTo(f);
                           setComposing(true);
                           setShowAddressBook(false);
                         }}
                      >
                        <td className="py-1 px-2 border-r border-[#ececec] whitespace-nowrap opacity-60">Unknown Entity</td>
                        <td className="py-1 px-2">{f}</td>
                      </tr>
                   ))}
                 </tbody>
               </table>
            </div>
            <div className="p-2 border-t border-gray-500 flex justify-end gap-2 bg-[#c0c0c0]">
               <button onClick={() => setShowAddressBook(false)} className="px-6 py-1 font-bold text-sm bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {alertModal.isOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/20 pointer-events-auto">
          <div className="w-[340px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-sm tracking-wide border-b border-white flex justify-between">
              <span>Information</span>
              <button onClick={() => setAlertModal({isOpen: false, message: ''})} className="bg-[#c0c0c0] text-black w-4 h-4 flex items-center justify-center font-bold font-mono border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 text-[10px] hover:active:border-t-gray-800 hover:active:border-l-gray-800 hover:active:border-b-white hover:active:border-r-white">X</button>
            </div>
            <div className="p-5 flex gap-4 text-sm items-center font-sans tracking-wide leading-relaxed bg-[#c0c0c0]">
               <div className="w-10 h-10 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 rounded-full bg-[#000080] flex items-center justify-center text-white font-bold text-xl shrink-0 text-center font-serif">i</div>
               <div>{alertModal.message}</div>
            </div>
            <div className="p-3 border-t border-gray-500 flex justify-center bg-[#c0c0c0]">
               <button onClick={() => setAlertModal({isOpen: false, message: ''})} className="px-10 py-1 font-bold text-sm bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white text-black hover:bg-gray-200 focus:border-black focus:border-dotted outline-none shadow-[inset_0_0_0_1px_black]" autoFocus>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
