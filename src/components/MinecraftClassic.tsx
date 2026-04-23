import React, { useEffect } from 'react';
import { ExternalLink, Gamepad2 } from 'lucide-react';

export const MinecraftClassic: React.FC = () => {
  useEffect(() => {
    // Disable drag on parent window when this is open
    window.parent.dispatchEvent(new CustomEvent('minecraft-active', { detail: true }));
    return () => {
      window.parent.dispatchEvent(new CustomEvent('minecraft-active', { detail: false }));
    };
  }, []);

  const openMinecraft = () => {
    window.open('https://classic.minecraft.net/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full h-full bg-[#87CEEB] flex flex-col items-center justify-center p-8">
      <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow-[8px_8px_0_rgba(0,0,0,0.3)] p-8 max-w-md w-full text-center">
        <Gamepad2 size={64} className="mx-auto mb-4 text-green-700" />
        <h2 className="text-xl font-bold text-black mb-2">Minecraft Classic</h2>
        <p className="text-sm text-gray-700 mb-4">
          Due to browser security restrictions, embedded games cannot capture the mouse properly.
        </p>
        <p className="text-xs text-gray-600 mb-6">
          Click below to open Minecraft Classic in a new tab for full mouse support.
        </p>
        <button
          onClick={openMinecraft}
          className="w-full px-4 py-3 bg-green-600 text-white font-bold border-2 border-t-green-400 border-l-green-400 border-b-green-800 border-r-green-800 hover:bg-green-500 active:border-t-green-800 active:border-l-green-800 active:border-b-green-400 active:border-r-green-400 flex items-center justify-center gap-2"
        >
          <ExternalLink size={18} />
          Launch Minecraft Classic
        </button>
        <p className="text-[10px] text-gray-500 mt-4">
          Opens classic.minecraft.net in new tab
        </p>
      </div>
    </div>
  );
};
