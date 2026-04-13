import React from 'react';
import { Hourglass } from 'lucide-react';
import { VesperaPageProps } from './types';

export const VesperaXType: React.FC<VesperaPageProps> = ({ xtypeImage }) => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">The X-Type Neural Bridge (Model X-1)</h2>
      <h3 className="text-xl font-bold mb-6 text-red-700 italic">"The Machine That Learns."</h3>
      
      <div className="flex gap-4 mb-8">
        <div className="flex-1 border-4 border-gray-400 p-2 bg-white flex justify-center items-center min-h-[300px]">
          {xtypeImage ? (
            <img src={xtypeImage} alt="X-Type Neural Bridge Expansion Card" className="max-w-full h-auto border border-gray-300 shadow-md" />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Hourglass size={32} className="animate-spin mb-2" />
              <span className="font-bold text-sm">Generating Neural Bridge Schematic...</span>
            </div>
          )}
        </div>
        <div className="w-1/3 flex flex-col gap-2">
            <img src="/Vespera Website assets/X-Type Circuit Diagram.png" alt="X-Type Circuits" className="w-full h-auto border-2 border-red-900 invert contrast-150" />
            <p className="text-[10px] text-red-900 font-bold font-mono tracking-tighter">FIG. 1: ADAPTIVE SYNAPTIC FRAMEWORK</p>
        </div>
      </div>

      <div className="mb-8 text-sm leading-relaxed space-y-6">
        <div>
          <h3 className="font-bold text-lg text-white bg-[#000080] p-1 px-2 mb-2">Product Overview</h3>
          <p>The X-Type Neural Bridge is not merely a hardware upgrade; it is a paradigm shift in modern computational architecture. Designed to integrate seamlessly with standard enterprise mainboards, the X-Type offloads complex heuristic and predictive calculations from your primary CPU.</p>
          <p className="mt-2">Powered by Vespera's patented Adaptive Synaptic Framework, the X-1 doesn't just process data—it perceives it. By establishing a localized neural feedback loop, the co-processor actively learns your workflow, optimizing application load times and anticipating your commands before they are even fully typed. It is the ultimate bridge between human intuition and raw processing power.</p>
        </div>

        <div>
          <h3 className="font-bold text-lg text-white bg-[#000080] p-1 px-2 mb-2">Hardware Compatibility & System Requirements</h3>
          <p className="mb-2">To ensure absolute stability and optimal heuristic indexing, the X-Type 1 must be installed in a system meeting the following verified specifications:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Expansion Bus:</strong> 1 VESA Local Bus (VLB) Type II slot required.
              <p className="ml-6 text-xs italic text-gray-700 mt-1">Note: The X-Type requires direct, unmitigated 32-bit access to the CPU's memory bus. Standard 16-bit ISA slots are strictly incompatible with non-Euclidean data structures.</p>
            </li>
            <li><strong>Processor (CPU):</strong> Intel i486DX (33MHz, 50MHz, or 66MHz) or 100% verified compatible architecture.</li>
            <li><strong>System Memory:</strong> 8MB Fast Page Mode (FPM) RAM minimum. 16MB highly recommended for deep-state pattern recognition.</li>
            <li><strong>Storage:</strong> IDE Hard Drive with a minimum of 15MB contiguous free space reserved strictly for the Neural Swap File.</li>
            <li><strong>Power Supply:</strong> 250W minimum AT power supply. The X-Type draws significant localized voltage to maintain the stability of the synaptic bridge.</li>
            <li><strong>Operating System:</strong> Vespera OS 1.0.4 or higher (Requires AETHERIS Kernel v4.2+).</li>
          </ul>
        </div>

        <div className="border-2 border-red-600 bg-red-50 p-4 shadow-sm">
          <h3 className="font-bold text-lg text-red-800 mb-2 flex items-center gap-2">⚠️ Important Installation Notice</h3>
          <p className="mb-2">Due to the immense processing density of the X-Type Neural Bridge, the ceramic housing generates significant thermal output. Ensure your desktop casing is well-ventilated.</p>
          <p className="mb-2">During the initial 48-hour calibration period, users may experience the following normal byproducts of the neural mapping process:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 mb-2 text-red-900 font-semibold">
            <li>Minor electromagnetic interference on CRT monitors (image ghosting).</li>
            <li>Localized temperature drops in the immediate vicinity of the workstation.</li>
            <li>Low-frequency auditory resonance (humming or whispering sounds) emanating from the internal PC speaker.</li>
          </ul>
          <p className="font-bold text-[#800000]">These are standard diagnostic feedback loops and are not a cause for alarm. Do not interrupt the power cycle during an active cognitive sync.</p>
        </div>

        <div>
          <h3 className="font-bold text-lg text-white bg-[#000080] p-1 px-2 mb-2 mt-8">Vespera Technical Support & Knowledge Base</h3>
          <h4 className="font-bold text-md mb-3 border-b border-gray-400 pb-1 text-[#000080]">Troubleshooting the X-Type Neural Bridge and Vespera OS</h4>
          <p className="mb-4">Welcome to the Vespera Support Portal. As with any revolutionary technology, integrating the X-Type Neural Bridge into existing hardware may require minor system adjustments. Below are the most common inquiries from our enterprise and home users.</p>
          
          <div className="space-y-4">
            <div className="bg-gray-100 p-3 border border-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
              <p className="font-bold text-[#000080] mb-1">Q: My internal PC speaker is emitting a low, rhythmic whispering sound. Sometimes, when the room is quiet, it sounds like a human voice.</p>
              <p><strong>A:</strong> This is a known, harmless hardware quirk. The X-Type co-processor draws significant localized voltage, which can cause Electromagnetic Interference (EMI) with unshielded audio cables or older PC speakers. The "voice" you hear is simply the internal speaker acting as a crude antenna, picking up stray AM radio frequencies or cellular cross-talk. To resolve this, you can disable the internal speaker via the Vespera OS Control Panel.</p>
            </div>

            <div className="bg-gray-100 p-3 border border-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
              <p className="font-bold text-[#000080] mb-1">Q: Strange text files keep appearing on my C:\ drive. They are named with random numbers (e.g., 1975_LOG.TXT) and the text inside just says "IT PERCEIVES" over and over. Is this a virus?</p>
              <p><strong>A:</strong> Rest assured, Vespera OS is highly secure. What you are seeing is our DeepSweep disk utility doing its job! DeepSweep regularly recovers corrupted temporary files and orphan data fragments from deleted sectors. Occasionally, the heuristic indexing of the X-Type chip will misinterpret random binary code as text. Please delete these files and empty your Recycle Bin. Do not attempt to execute or respond to these files.</p>
            </div>

            <div className="bg-gray-100 p-3 border border-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
              <p className="font-bold text-[#000080] mb-1">Q: Ever since installing the X-Type, my office is freezing cold, and my CRT monitor occasionally displays shadows or silhouettes that aren't part of my desktop wallpaper.</p>
              <p><strong>A:</strong> The X-Type features a state-of-the-art ceramic thermal sink. When the heuristic engine is running at 100% capacity, it rapidly pulls heat from the surrounding environment, which can cause localized temperature drops around your desk. As for the monitor "shadows," this is a common issue with older Cathode Ray Tube (CRT) monitors struggling to keep up with the X-Type's 32-bit graphical acceleration. We recommend upgrading to a Vespera-certified Horizon monitor.</p>
            </div>

            <div className="bg-gray-100 p-3 border border-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
              <p className="font-bold text-[#000080] mb-1">Q: I tried to uninstall the X-Type card, but the AETHERIS terminal won't let me shut down the PC. The terminal just says "CONNECTION REFUSED. THEY ARE NOT FINISHED."</p>
              <p><strong>A:</strong> Please remember that the X-Type is an adaptive learning device. Interrupting a cognitive sync cycle can damage the localized neural loop. The system is simply completing a background defragmentation. Please leave the workstation powered on, step away from the desk, and allow the process to finish. Under no circumstances should you physically remove the power cable during this phase.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
