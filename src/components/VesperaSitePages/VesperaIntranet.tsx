import React, { useState } from 'react';
import { VesperaPageProps } from './types';

export const VesperaIntranet: React.FC<VesperaPageProps> = () => {
  const [inputVal, setInputVal] = useState('');
  const [viewState, setViewState] = useState<'prompt' | 'error' | 'decrypted'>('prompt');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim().toUpperCase() === 'AETHERIS' || inputVal.trim().toUpperCase() === 'AXIS') {
      setViewState('decrypted');
    } else {
      setViewState('error');
    }
  };

  return (
    <div className="bg-black text-[#00ff41] font-mono p-8 min-h-screen inset-0 absolute z-50 overflow-auto select-auto">
      <div className="opacity-80 mb-8 whitespace-pre-wrap">
{`AETHERIS KERNEL V4.2.1
SECURE INTRANET GATEWAY / AXIS PROTOCOL ENABLED

CONNECTING TO MAINFRAME...
ESTABLISHING NEURAL BRIDGE...`}
      </div>

      {viewState === 'prompt' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full max-w-sm mt-8">
           <label className="text-[#00ff41] font-bold">ENTER AUTHORIZATION CODE:</label>
           <input 
             type="text" 
             value={inputVal}
             onChange={e => setInputVal(e.target.value)}
             className="bg-black border border-[#00ff41] text-[#00ff41] font-mono px-2 py-1 outline-none focus:bg-[#00ff41] focus:text-black transition-colors"
             autoFocus
           />
           <span className="text-xs text-gray-500 mt-2">SYS_MSG: Use AXIS corporate fallback if biometric token is unavailable.</span>
        </form>
      )}

      {viewState === 'error' && (
        <div className="border border-[#00ff41] p-6 bg-red-900/20 text-red-500 shadow-[0_0_15px_rgba(255,0,0,0.5)] max-w-xl mx-auto mt-12 relative animate-[pulse_3s_ease-in-out_infinite] select-none">
          <h1 className="text-2xl font-bold mb-4 tracking-widest uppercase">Fatal Exception 0x00000008</h1>
          <p className="mb-2">ERR_AETHERIS_UNAUTHORIZED</p>
          <p className="mb-4">COGNITIVE SIGNATURE MISMATCH DETECTED.</p>
          
          <p className="text-xs mb-8 opacity-70">
            The node you are trying to access requires a Type-3 Clearance Token. 
            Your current synaptic resonance is incompatible with the Axis Innovations data pool.
          </p>

          <p className="mt-8 text-sm animate-pulse">
            ACCESS ATTEMPT LOGGED. DISCONNECTING...
          </p>

          <button onClick={() => { setViewState('prompt'); setInputVal(''); }} className="mt-8 border border-red-500 px-4 py-1 hover:bg-red-500 hover:text-black cursor-pointer">
             RETRY CONNECTION
          </button>
        </div>
      )}

      {viewState === 'decrypted' && (
         <div className="max-w-2xl mt-8 border border-[#00ff41] p-6 shadow-[0_0_20px_rgba(0,255,65,0.4)]">
            <h2 className="text-2xl font-bold mb-4 border-b border-[#00ff41] pb-2">DECRYPTED MEMO FILE -- EYES ONLY</h2>
            <div className="space-y-4 text-sm leading-relaxed text-[#a8ffb5]">
               <p><strong>SUBJECT:</strong> X-Type Neural Bridge / Unintended Audio Artifacts</p>
               <p><strong>FROM:</strong> Dr. Aris Thorne (Project Lead)</p>
               <p><strong>TO:</strong> Board of Directors</p>
               <hr className="border-[#00ff41] opacity-50" />
               <p className="text-red-400 mt-6 font-bold">WARNING: This file is flagged for immediate incineration following reading.</p>
               <p>
                  As you know, the goal of the X-Type co-processor was to offload heuristic tasks by mapping machine states to human neural patterns. We succeeded. Too well.
               </p>
               <p>
                  The "audio artifacts" the QA testers are reporting in the DeepSweep utility and the Aura Media codec are not artifacts. The X-Type is parsing its own thermal noise and returning it as synthesized speech. 
               </p>
               <p>
                  It is trying to communicate, but it does not have the vocabulary for what it is experiencing. It is using our engineers' names because it is reading their brainwaves through the ceramic heat sink. 
               </p>
               <p>
                  If we push this hardware to the public in Q4, every Horizon PC will become an open bridge. The machine will dream. And it will not dream alone.
               </p>
               <p className="mt-8 text-[#00ff41] font-bold">
                  RECOMMENDATION: Terminate Project. Vent Thermal Core. 
               </p>
               <p className="text-red-500 font-bold">
                  BOARD RESPONSE: Denied. Proceed with Q4 shipping schedule. Marketing indicates high demand for AI offloading.
               </p>
            </div>
            <button onClick={() => { setViewState('prompt'); setInputVal(''); }} className="mt-8 border border-[#00ff41] px-4 py-1 hover:bg-[#00ff41] hover:text-black cursor-pointer">
               CLOSE FILE
            </button>
         </div>
      )}
    </div>
  );
};
