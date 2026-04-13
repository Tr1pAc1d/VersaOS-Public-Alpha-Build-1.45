import React from 'react';
import { VesperaPageProps } from './types';

export const VesperaProducts: React.FC<VesperaPageProps> = ({ navigate }) => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Products & Services</h2>
      <div className="mb-8 text-sm leading-relaxed space-y-6">
        <div>
          <h3 className="font-bold text-lg text-white bg-[#000080] p-1 px-2 mb-2">Vespera OS & Software Solutions</h3>
          <p className="mb-2">Vespera Systems provides the definitive software ecosystem for the modern enterprise. Our software is designed with absolute efficiency and uncompromising stability in mind.</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Vespera OS:</strong> The flagship operating environment. Preemptive multitasking, secure memory allocation, and an intuitive graphical interface.</li>
            <li><strong>Omni-Task Office Suite:</strong> Featuring Vespera Slide Deck (formerly Prism Presenter), Omni-Word, and Omni-Calc. The corporate standard for productivity.</li>
            <li><strong>Aura Media Player:</strong> Revolutionary digital audio compression. <span className="italic text-gray-600 text-xs">Note: Aura's advanced analog frequency filtering reduces unexpected vocal artifacts during playback of highly compressed files.</span></li>
            <li><strong>DeepSweep Utility:</strong> The premier system cleaner. DeepSweep bypasses traditional OS safeguards to scrub forgotten memory sectors. It finds what shouldn't be found. 
               <br/><img src="/Vespera Website assets/Product Images/DeepSweep Box.png" alt="DeepSweep Box" className="w-16 h-16 ml-6 my-2 object-contain float-right grayscale" />
            </li>
            <li><strong>Soma-Scan Diagnostic:</strong> The industry-leading medical diagnostic parsing engine utilized by 40% of Northern Hemisphere healthcare providers.</li>
          </ul>
        </div>
        
        <div className="clear-both pt-4">
          <h3 className="font-bold text-lg text-white bg-[#000080] p-1 px-2 mb-2">Hardware & Embedded Systems</h3>
          <p className="mb-2">Beyond the desktop, Vespera manufactures the microcontrollers and networking infrastructure that power the 21st century.</p>
          
          <div className="float-left mr-4 mt-2 mb-2 border-2 border-gray-400 p-1 w-[200px]">
             <img src="/Vespera Website assets/A photo of a heavy, metal, rack-mounted server.jpeg" alt="Server rack" className="w-full h-auto grayscale contrast-125" />
             <p className="text-[9px] text-center font-bold font-mono">AETHERIS Logistics Node 7B</p>
          </div>
          
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Horizon Desktop PCs:</strong> Turn-key workstations built to harness the full power of Vespera OS, now available with optional CD-ROM upgrades.</li>
            <li><strong>Vespera Logic-7 Microcontrollers:</strong> The brain inside your vehicle. Controlling electronic fuel injection, ABS, and digital displays in thousands of sedans worldwide.</li>
            <li><strong>AETHERIS Logistics Node:</strong> Massive, humming rack-mounted network mainframes pushing enterprise packets globally. <span className="italic text-[10px] text-gray-500 block ml-6">Nodes are shipped with Sentinel encryption keys pre-generated to securely handle Axis Innovations' dark data.</span></li>
            <li><strong className="text-red-700 cursor-pointer hover:underline" onClick={() => navigate('vespera:xtype')}>X-Type Neural Bridge (Model X-1):</strong> Our experimental co-processor designed to boost heuristic processing. The machine that learns.</li>
          </ul>
        </div>
      </div>
    </>
  );
};
