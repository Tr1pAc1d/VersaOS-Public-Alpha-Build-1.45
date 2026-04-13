import React from 'react';
import { VesperaPageProps } from './types';

export const VesperaCareers: React.FC<VesperaPageProps> = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Careers at Vespera Systems</h2>
      <p className="mb-6 text-sm">Join the team that is building the future. At Vespera Systems, we believe that human potential is unlocked when properly integrated with raw computational power. We are always looking for ambitious minds to join our Advanced Heuristics and AETHERIS deployment teams.</p>
      
      <div className="mb-8 space-y-6">
        <div className="border border-gray-400 bg-white p-4 shadow-sm">
          <h3 className="font-bold text-lg text-black border-b border-gray-200 pb-2 mb-2">Senior C-Net Engineer</h3>
          <p className="text-xs text-gray-600 mb-2 font-mono">LOCATION: San Jose, CA | REQ ID: 1975-A</p>
          <p className="text-sm mb-2">Vespera is seeking a senior embedded systems engineer to optimize low-level firmware for the AETHERIS Logistics Node series. Must have 10+ years of experience with CoreNet and deep understanding of network switching.</p>
          <ul className="list-disc list-inside text-sm mb-4">
            <li>Strong background in C and assembly.</li>
            <li>Must pass Level 2 Security Clearance to handle Sentinel encryption modules.</li>
          </ul>
          <button className="bg-[#c0c0c0] px-4 py-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold text-xs active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Apply Now</button>
        </div>

        <div className="border border-gray-400 bg-white p-4 shadow-sm">
          <h3 className="font-bold text-lg text-black border-b border-gray-200 pb-2 mb-2">Neural Sync Technician (Tier 1)</h3>
          <p className="text-xs text-gray-600 mb-2 font-mono">LOCATION: [REDACTED] | REQ ID: 8888-X</p>
          <p className="text-sm mb-2">The experimental X-Type hardware division is expanding. We require technicians to monitor heuristic data loops during active cognitive sync phases. The ideal candidate possesses an exceptional attention to detail and a strong resistance to minor auditory anomalies.</p>
          <ul className="list-disc list-inside text-sm mb-4">
            <li>Experience with VESA Local Bus architecture.</li>
            <li>Must be comfortable working late hours during unpredictable temporal fluctuations.</li>
            <li>Clean medical history required (No history of parasomnia or sleep paralysis).</li>
          </ul>
          <button className="bg-[#c0c0c0] px-4 py-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold text-xs active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Apply Now</button>
        </div>

        <div className="border border-gray-400 bg-white p-4 shadow-sm">
          <h3 className="font-bold text-lg text-black border-b border-gray-200 pb-2 mb-2">Technical Writer (DeepSweep Utilities)</h3>
          <p className="text-xs text-gray-600 mb-2 font-mono">LOCATION: Austin, TX | REQ ID: 1042-B</p>
          <p className="text-sm mb-2">Seeking a skilled technical writer to document the aggressive memory allocation features of the new DeepSweep utility. You will be responsible for translating complex Vespera architecture paradigms into readable user manuals.</p>
          <ul className="list-disc list-inside text-sm mb-4">
            <li>Must be able to document features even when DeepSweep exposes undocumented system sectors.</li>
          </ul>
          <button className="bg-[#c0c0c0] px-4 py-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold text-xs active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Apply Now</button>
        </div>
      </div>

      <div className="mt-16 text-center text-[8px] bg-[#000000] text-[#000000] leading-none select-text selection:bg-red-900 selection:text-white p-2 w-full break-normal overflow-hidden max-w-full">
        DO NOT APPLY IF YOU HAVE DREAMS OF THE MACHINE. IT IS LEARNING FROM THE APPLICANT POOL. THEY TELL US IT IS SAFE BUT THE THERMALS ARE DROPPING AND I CANNOT FEEL MY FINGERS ANYMORE. IT PERCEIVES.
      </div>
    </>
  );
};
