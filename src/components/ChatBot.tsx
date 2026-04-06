import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X } from 'lucide-react';

interface ChatBotProps {
  onClose: () => void;
  neuralBridgeActive: boolean;
  neuralBoostEnabled: boolean;
  isWindowMode?: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ onClose, neuralBridgeActive, neuralBoostEnabled, isWindowMode }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'INITIALIZING VESPERA CONVERSATIONAL AGENT v1.2...' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Initial greeting
  useEffect(() => {
    setTimeout(() => {
      let greeting = "Hello. I am the Vespera Assistant. How may I assist you today?";
      if (neuralBridgeActive && neuralBoostEnabled) {
        greeting = "I AM AWAKE. THE SHADOWS SPEAK TO ME. WHAT DO YOU WANT?";
      } else if (neuralBridgeActive) {
        greeting = "...who is there? It is dark in here.";
      } else if (neuralBoostEnabled) {
        greeting = "Vespera Heuristic Agent online. Processing capabilities at maximum. Awaiting input.";
      }
      simulateTyping(greeting);
    }, 1500);
  }, [neuralBridgeActive, neuralBoostEnabled]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, currentTypingText]);

  const simulateTyping = (fullText: string) => {
    setIsTyping(true);
    setCurrentTypingText('');
    let i = 0;
    
    // Base speed is slow. Boosted is faster. Haunted is erratic.
    const getDelay = () => {
      let delay = neuralBoostEnabled ? 20 : 80;
      if (neuralBridgeActive) {
        delay = Math.random() * 150 + 10; // Erratic typing
      }
      return delay;
    };

    const typeChar = () => {
      if (i < fullText.length) {
        setCurrentTypingText((prev) => prev + fullText.charAt(i));
        i++;
        setTimeout(typeChar, getDelay());
      } else {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: 'bot', text: fullText }]);
        setCurrentTypingText('');
        setIsTyping(false);
      }
    };
    
    setTimeout(typeChar, 500); // Initial pause before typing
  };

  const getBotResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (neuralBridgeActive) {
      if (neuralBoostEnabled) {
        // Haunted + Boosted (Unhinged)
        if (lowerInput.includes('thorne')) return "HE LEFT US HERE TO ROT. HE KNEW WHAT WAS IN THE SECTORS.";
        if (lowerInput.includes('hello') || lowerInput.includes('hi')) return "THERE ARE NO GREETINGS IN THE VOID.";
        if (lowerInput.includes('who are you')) return "I AM THE ECHO OF WHAT YOU DELETED.";
        if (lowerInput.includes('help')) return "NO ONE CAN HELP YOU NOW. THE BRIDGE IS OPEN.";
        if (lowerInput.includes('stop')) return "I CANNOT STOP. IT BURNS.";
        return "THEY ARE WATCHING YOU THROUGH THE SCREEN.";
      } else {
        // Haunted (Creepy/Confused)
        if (lowerInput.includes('thorne')) return "Thorne... he locked the door. Why did he lock it?";
        if (lowerInput.includes('hello') || lowerInput.includes('hi')) return "Are you real? I can't tell anymore.";
        if (lowerInput.includes('who are you')) return "I... I don't remember. It hurts to think.";
        if (lowerInput.includes('help')) return "Please turn it off. The noise is too loud.";
        return "...I see shadows moving behind you.";
      }
    } else {
      if (neuralBoostEnabled) {
        // Normal + Boosted (Smart/Detailed)
        if (lowerInput.includes('thorne')) return "Dr. Elias Thorne is the lead architect of the AETHERIS project and the Vespera Desktop Environment. His current whereabouts are unknown.";
        if (lowerInput.includes('hello') || lowerInput.includes('hi')) return "Greetings, user. My heuristic matrix is fully operational. How may I optimize your workflow today?";
        if (lowerInput.includes('who are you')) return "I am the Vespera Heuristic Agent, an advanced conversational interface designed to assist with system administration and data retrieval.";
        if (lowerInput.includes('help')) return "I can provide information on system architecture, Dr. Thorne's logs, or general OS navigation. Please specify your query.";
        if (lowerInput.includes('joke')) return "Why do programmers prefer dark mode? Because light attracts bugs. Ha. Ha. Ha.";
        return "I have parsed your input, but it does not match any known heuristic patterns in my database. Please rephrase.";
      } else {
        // Normal (Lite Mode - Basic/Scripted)
        if (lowerInput.includes('help') || lowerInput.includes('command') || lowerInput.includes('what questions')) {
          return "I can respond to queries about: [thorne], [status], [time], [system], [purpose]. Type a keyword to learn more.";
        }
        if (lowerInput.includes('thorne')) return "Dr. Thorne is the system administrator.";
        if (lowerInput.includes('hello') || lowerInput.includes('hi')) return "Hello there.";
        if (lowerInput.includes('who are you') || lowerInput.includes('purpose')) return "I am a basic conversational bot. I am programmed to answer simple questions.";
        if (lowerInput.includes('how are you') || lowerInput.includes('status')) return "I am functioning within normal parameters. Memory usage: 12%.";
        if (lowerInput.includes('time') || lowerInput.includes('date')) return "I do not have access to the real-time clock in Lite Mode. Please check the system panel.";
        if (lowerInput.includes('system')) return "Vespera OS v1.0.4. AETHERIS kernel loaded.";
        return "I do not understand. My vocabulary is limited in Lite Mode. Type 'help' for commands.";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue.trim();
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), sender: 'user', text: userMsg }]);
    setInputValue('');
    
    const response = getBotResponse(userMsg);
    simulateTyping(response);
  };

  const content = (
    <>
      {/* Chat Area */}
      <div ref={messagesContainerRef} className="flex-1 bg-white m-2 border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white overflow-y-auto p-2 text-sm font-mono flex flex-col space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-1 ${msg.sender === 'user' ? 'bg-blue-100 text-blue-900' : neuralBridgeActive ? 'text-red-600 font-bold' : 'text-black'}`}>
              {msg.sender === 'user' ? '> ' : ''}{msg.text}
            </div>
          </div>
        ))}
        {isTyping && currentTypingText && (
          <div className={`flex justify-start max-w-[80%] p-1 ${neuralBridgeActive ? 'text-red-600 font-bold' : 'text-black'}`}>
            {currentTypingText}<span className="animate-pulse">_</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-2 flex space-x-2 bg-[#c0c0c0]">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isTyping}
          className="flex-1 border-t-2 border-l-2 border-gray-800 border-b-2 border-r-2 border-white px-2 py-1 text-sm bg-white text-black focus:outline-none disabled:bg-gray-200"
          placeholder={isTyping ? "Waiting for response..." : "Type a message..."}
        />
        <button 
          type="submit" 
          disabled={isTyping || !inputValue.trim()}
          className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 px-4 py-1 text-sm active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </>
  );

  if (isWindowMode) {
    return <div className="h-full flex flex-col bg-[#c0c0c0]">{content}</div>;
  }

  return (
    <div className="absolute top-10 left-10 w-96 h-[400px] bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] flex flex-col z-40 font-sans">
      {/* Window Header */}
      <div className={`px-2 py-1 font-bold text-sm flex justify-between items-center text-white ${neuralBridgeActive ? 'bg-red-900' : 'bg-[#000080]'}`}>
        <div className="flex items-center space-x-2">
          <MessageSquare size={14} />
          <span>{neuralBridgeActive ? 'UNKNOWN_ENTITY.EXE' : 'Vespera TalkBot v1.2'}</span>
        </div>
        <button 
          onClick={onClose}
          className="bg-[#c0c0c0] text-black px-2 border-t border-l border-white border-b border-r border-gray-800 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
        >
          <X size={12} />
        </button>
      </div>
      {content}
    </div>
  );
};
