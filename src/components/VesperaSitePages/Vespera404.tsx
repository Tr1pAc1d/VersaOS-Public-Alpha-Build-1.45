import React from 'react';
import { VesperaPageProps } from './types';

export const Vespera404: React.FC<VesperaPageProps> = ({ navigate }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <h2 className="text-4xl font-bold mb-4 text-red-600 border-b-2 border-red-600 pb-2 w-full text-center">404 - Not Found</h2>
      <p className="text-lg mb-4 font-bold">The requested document could not be found on this server.</p>
      <p className="text-sm">Please check the URL or return to the <button className="text-blue-600 underline cursor-pointer bg-transparent border-none" onClick={() => navigate('home')}>homepage</button>.</p>
      
      <div className="mt-12 opacity-50 flex items-center gap-2">
         <img src="https://web.archive.org/web/19991129013009im_/http://www.geocities.com/SiliconValley/Way/6253/html20.gif" alt="Broken icon" className="w-8 h-8 opacity-20 filter grayscale" />
         <span className="text-[10px] text-gray-500 font-mono">AETHERIS SYSTEM ERROR: NODE UNREACHABLE</span>
      </div>
    </div>
  );
};
