import React from 'react';

export const LeaveMeAlone: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-start w-full h-full bg-[#1a2a0a] select-none pt-2">
      <div className="border-4 border-[#4a7c29] bg-black p-[2px] shadow-[0_0_20px_rgba(80,180,30,0.2)] mb-2">
        <iframe
          src="https://cdn-factory.marketjs.com/en/leave-me-alone/index.html"
          style={{ width: 480, height: 640, border: 'none', display: 'block' }}
          frameBorder="0"
          scrolling="no"
          title="Leave Me Alone"
          allow="autoplay; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads"
        />
      </div>
      <div className="flex flex-col items-center text-gray-400 font-mono text-[10px] w-full px-4 text-center">
        <p className="text-[#8dc63f] font-bold mb-0.5 tracking-widest text-xs uppercase">Controls</p>
        <p className="leading-tight text-gray-500">
          Use <span className="text-white font-bold">ARROW KEYS</span> or <span className="text-white font-bold">WASD</span> to move · <span className="text-white font-bold">SPACE</span> to place item
        </p>
      </div>
    </div>
  );
};
