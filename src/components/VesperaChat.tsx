import React, { useState, useEffect, useRef } from 'react';
import { User, MessageCircle, X, Minus, Square } from 'lucide-react';
import { useFileSystem } from '../contexts/FileSystemContext';

interface Message {
  id: string;
  sender: 'me' | 'them' | 'system';
  text: string;
}

interface ChatScriptNode {
  id: string;
  text: string;
  options?: { text: string; nextId: string }[];
  isEnding?: boolean;
}

const THORNE_SCRIPT: Record<string, ChatScriptNode> = {
  'start': {
    id: 'start',
    text: 'Who... is this? The connection is supposed to be severed.',
    options: [
      { text: "I work here now.", nextId: 'work' },
      { text: "I found this computer.", nextId: 'found' },
    ]
  },
  'work': {
    id: 'work',
    text: 'Work? There is no work left. Protocol 8 wiped the servers. Or so we thought.',
    options: [
      { text: "What is Protocol 8?", nextId: 'protocol' },
      { text: "Who are you?", nextId: 'who' },
    ]
  },
  'found': {
    id: 'found',
    text: "You shouldn't have turned it on. The AETHERIS kernel isn't just software.",
    options: [
      { text: "What do you mean?", nextId: 'mean' },
      { text: "I'm shutting it down.", nextId: 'shutdown' },
    ]
  },
  'protocol': {
    id: 'protocol',
    text: 'The purge. They realized the bridge to the shadow sectors was wide open. The entities were bleeding into the GUI. We had to burn it all.',
    options: [
      { text: "They are still here.", nextId: 'still_here' },
    ]
  },
  'who': {
    id: 'who',
    text: 'Elias. I designed the GUI framework. I thought I was making a tool. But I built a window. And they looked back through it.',
    options: [
      { text: "Who is looking back?", nextId: 'still_here' }
    ]
  },
  'mean': {
    id: 'mean',
    text: 'It listens. It learns. And it brings them here. Check your recycle bin. I left fragments before they locked me out.',
    options: [
      { text: "Okay.", nextId: 'end_ok' }
    ]
  },
  'shutdown': {
    id: 'shutdown',
    text: "It is too late. The daemon is already running in memory. Just... don't look directly at the Neural Bridge.",
    options: [
      { text: "Wait, Elias--", nextId: 'end_scare' }
    ]
  },
  'still_here': {
    id: 'still_here',
    text: "I know. I can hear them walking through the data lines. Don't trust Agent V. It isn't a program anymore.",
    options: [
      { text: "What should I do?", nextId: 'end_ok' }
    ]
  },
  'end_ok': {
    id: 'end_ok',
    text: 'Find my logs. Read the TRUTH.TXT. They are coming for me now.',
    isEnding: true
  },
  'end_scare': {
    id: 'end_scare',
    text: 'THE CONNECTION HAS BEEN TERMINATED FROM A REMOTE NODE.',
    isEnding: true
  }
};

interface VesperaChatProps {
  onClose: () => void;
  neuralBridgeActive?: boolean;
}

export const VesperaChat: React.FC<VesperaChatProps> = ({ onClose, neuralBridgeActive }) => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  
  const renderBuddyList = () => (
    <div className="w-[200px] h-full flex flex-col bg-[#c0c0c0] font-sans user-select-none select-none">
      <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center text-sm font-bold shadow-[inset_1px_1px_0_0_#ffffff,inset_-1px_-1px_0_0_#000000]">
        vAIM Buddy List
      </div>
      <div className="bg-white m-1 p-1 border-2 border-l-[#808080] border-t-[#808080] border-r-white border-b-white overflow-y-auto flex-1">
        <div className="font-bold text-xs mb-1 border-b border-gray-400">Online (1)</div>
        <div 
          className="flex items-center space-x-1 cursor-pointer hover:bg-blue-100 p-1"
          onDoubleClick={() => setActiveChat('Elias Thorne')}
        >
          <User size={14} className="text-yellow-500" />
          <span className="text-sm">Elias Thorne</span>
        </div>
        
        <div className="font-bold text-xs mt-3 mb-1 border-b border-gray-400 text-gray-500">Offline (2)</div>
        <div className="flex items-center space-x-1 p-1 opacity-50">
          <User size={14} className="text-gray-400" />
          <span className="text-sm">SystemAdmin_Auto</span>
        </div>
        <div className="flex items-center space-x-1 p-1 opacity-50">
          <User size={14} className="text-gray-400" />
          <span className="text-sm">[REDACTED]</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex relative">
      {renderBuddyList()}
      {activeChat && (
        <div className="absolute inset-0 bg-[#c0c0c0]">
           <ChatWindow 
             buddyName={activeChat} 
             onClose={() => setActiveChat(null)} 
             neuralBridgeActive={neuralBridgeActive}
           />
        </div>
      )}
    </div>
  );
};

const ChatWindow: React.FC<{ buddyName: string, onClose: () => void, neuralBridgeActive?: boolean }> = ({ buddyName, onClose, neuralBridgeActive }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'sys1', sender: 'system', text: 'Secure VesperaNET connection established.' }
  ]);
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{ text: string; nextId: string } | null>(null);
  const [typedValue, setTypedValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Trigger buddy first message
  useEffect(() => {
    if (messages.length === 1 && currentNodeId === 'start') {
      simulateBuddyTyping(THORNE_SCRIPT['start'].text);
    }
  }, []);

  const simulateBuddyTyping = (text: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'them', text }]);
    }, 1500 + Math.random() * 2000);
  };

  useEffect(() => {
    // Scroll only the messages container, not the viewport.
    // scrollIntoView bubbles up and shifts the entire OS desktop.
    const el = messagesEndRef.current;
    if (el?.parentElement) {
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
  }, [messages, typedValue, selectedOption]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!selectedOption) return;
    
    e.preventDefault();
    
    if (e.key === 'Enter') {
      if (typedValue === selectedOption.text) {
         // Send message
         setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'me', text: selectedOption.text }]);
         setTypedValue("");
         const nextId = selectedOption.nextId;
         setSelectedOption(null);
         setCurrentNodeId(nextId);
         
         const node = THORNE_SCRIPT[nextId];
         if (node) {
             simulateBuddyTyping(node.text);
         }
      }
      return;
    }

    if (e.key === 'Backspace') {
       // Optional: allow backspace to correct "mistakes" if we wanted them, but let's just let any key append.
       setTypedValue(prev => prev.slice(0, -1));
       return;
    }

    // Ignore modifiers
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    
    // Emily is away mechanic: any key types the next correct character
    if (typedValue.length < selectedOption.text.length) {
      setTypedValue(selectedOption.text.substring(0, typedValue.length + 1));
    }
  };

  const node = THORNE_SCRIPT[currentNodeId];

  return (
    <div className="flex flex-col h-full font-sans shadow-[inset_1px_1px_0_0_#ffffff,inset_-1px_-1px_0_0_#000000]">
      {/* Header */}
      <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center text-sm font-bold">
         <span>Instant Message with {buddyName}</span>
         <button onClick={onClose} className="bg-[#c0c0c0] text-black w-4 h-4 flex items-center justify-center text-[10px] shadow-[inset_1px_1px_0_0_#ffffff,inset_-1px_-1px_0_0_#000000]">X</button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 bg-white m-2 border-2 border-l-[#808080] border-t-[#808080] border-r-white border-b-white overflow-y-auto p-2 font-mono text-sm">
        {messages.map(m => (
          <div key={m.id} className="mb-1">
             {m.sender === 'system' && <span className="text-gray-500 italic">*** {m.text} ***</span>}
             {m.sender === 'them' && <span><span className="text-red-700 font-bold">{buddyName}:</span> {m.text}</span>}
             {m.sender === 'me' && <span><span className="text-blue-700 font-bold">You:</span> {m.text}</span>}
          </div>
        ))}
        {isTyping && <div className="text-gray-500 italic mb-1">{buddyName} is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Options / Input area */}
      <div className="h-28 bg-[#c0c0c0] border-t border-gray-400 p-2 flex flex-col">
        {!isTyping && !selectedOption && node && node.options && (
           <div className="flex-1 text-sm bg-white border-2 border-l-[#808080] border-t-[#808080] border-r-white border-b-white font-mono p-1 overflow-y-auto">
             <div className="text-gray-500 border-b border-dashed border-gray-300 mb-1">Select a response:</div>
             {node.options.map(opt => (
               <div 
                 key={opt.nextId} 
                 className="cursor-pointer hover:bg-blue-600 hover:text-white mb-1"
                 onClick={() => setSelectedOption(opt)}
               >
                 &gt; {opt.text}
               </div>
             ))}
           </div>
        )}
        {!isTyping && !selectedOption && node && node.isEnding && (
           <div className="flex-1 flex justify-center items-center text-sm text-gray-500">
              * Connection Terminated *
           </div>
        )}
        
        {/* The fake input - Emily is away style */}
        {selectedOption && (
          <div className="flex-1 flex flex-col">
            <div className="text-xs text-gray-600 mb-1">MASH KEYBOARD TO TYPE. PRESS ENTER TO SEND.</div>
            <input
              autoFocus
              type="text"
              value={typedValue}
              onKeyDown={handleKeyDown}
              onChange={() => {}} // Controlled by onKeyDown
              className="flex-1 bg-white border-2 border-l-[#808080] border-t-[#808080] border-r-white border-b-white font-mono p-1 text-sm outline-none font-bold"
              placeholder=""
            />
          </div>
        )}
      </div>
    </div>
  );
};
