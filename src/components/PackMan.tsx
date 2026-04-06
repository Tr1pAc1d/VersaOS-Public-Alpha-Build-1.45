import React from 'react';

export const PackMan: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-start w-full h-full bg-[#111] select-none pt-2">
      <div className="border-4 border-gray-600 bg-black p-[2px] shadow-[0_0_15px_rgba(255,255,0,0.15)] mb-3">
        <iframe 
          src="https://funhtml5games.com?embed=pacman" 
          style={{ width: 342, height: 490, border: 'none' }} 
          frameBorder="0" 
          scrolling="no" 
          title="Pac-Man Game"
        />
      </div>
      <div className="flex flex-col items-center justify-center text-gray-400 font-mono text-[10px] w-full px-4 text-center">
        <p className="text-yellow-500 font-bold mb-1 tracking-widest text-xs uppercase">Game Controls</p>
        <p className="leading-tight">
          Use <span className="text-white font-bold tracking-widest">W A S D</span> or <span className="text-white font-bold">ARROW KEYS</span> to navigate.
        </p>
      </div>
    </div>
  );
};
