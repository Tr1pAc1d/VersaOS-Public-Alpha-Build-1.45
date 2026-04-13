import React from 'react';
import { VesperaPageProps } from './types';

export const VesperaPress: React.FC<VesperaPageProps> = ({ url, navigate }) => {
  if (url === 'vespera:press/echosoft') {
    return (
      <div className="font-serif text-sm leading-relaxed max-w-3xl bg-[#fffff0] p-8 border-4 border-double border-gray-800 shadow-md mx-auto relative top-0 z-0">
        <div className="text-center border-b-4 border-gray-800 pb-4 mb-6">
          <h2 className="text-4xl font-bold font-serif tracking-widest uppercase text-black">Vespera News</h2>
          <p className="text-xs uppercase tracking-widest mt-1 text-gray-600">Corporate Announcements & Press</p>
        </div>
        
        <h3 className="text-2xl font-bold mb-2 leading-tight text-black">VESPERA SYSTEMS FINALIZES ACQUISITION OF ECHOSOFT AUDIO, CEMENTING LEADERSHIP IN MULTIMEDIA AND SIGNAL PROCESSING</h3>
        <p className="text-xs text-gray-600 mb-6 italic border-b border-gray-300 pb-4">Published: October 12, 1994 | Contact: Vespera Systems Public Relations</p>
        
        <p className="mb-4 text-justify"><strong className="text-lg">S</strong><strong>ILICON VALLEY, CA –</strong> Vespera Systems, a global leader in advanced operating environments and enterprise hardware, today announced the completion of its acquisition of EchoSoft Audio, a pioneer in analog-to-digital signal processing, in a stock transaction valued at approximately $45 million.</p>
        
        <p className="mb-4 text-justify">The acquisition brings EchoSoft’s revolutionary spectral compression algorithms under the Vespera umbrella. EchoSoft’s proprietary technology is widely recognized for its unprecedented ability to isolate micro-fluctuations in analog frequencies, virtually eliminating background noise and delivering perfect digital fidelity.</p>
        
        <p className="mb-4 text-justify border-l-4 border-gray-400 pl-4 italic bg-gray-100 py-2">"The multimedia revolution is here, and audio is no longer just a peripheral—it is a core component of the computing experience," said Dr. Arthur Thorne, Founder and Director of Advanced Heuristics at Vespera Systems. "EchoSoft's unique approach to analog frequency isolation allows for the detection and digital translation of micro-acoustic data previously lost to background noise. By integrating their algorithms directly into the AETHERIS architecture, we are ensuring that Vespera hardware doesn't just process sound; it truly listens."</p>
        
        <p className="mb-4 text-justify">Starting in Q1 1995, EchoSoft’s core engineering team will be relocated to Vespera’s advanced R&D facility. Their technology will be heavily utilized in the development of the upcoming Aura Media Player, bundled natively with future releases of Vespera OS.</p>
        
        <p className="mb-4 text-justify">Furthermore, Vespera Systems plans to integrate EchoSoft’s deep-level frequency parsing into its new Synap-C development environment. This will allow third-party developers, automotive ECU manufacturers, and industrial hardware partners to utilize highly sensitive environmental audio-telemetry in their own embedded systems.</p>
        
        <p className="mb-6 text-justify border-l-4 border-gray-400 pl-4 italic bg-gray-100 py-2">"We are thrilled to join the Vespera family," said Dieter Vogel, former CEO of EchoSoft Audio. "Our mission was always to capture the invisible spectrum of sound. With Vespera's unparalleled hardware capabilities and the upcoming X-Type architectures, the potential applications for our frequency-mapping software are limitless."</p>
        
        <div className="border-t-2 border-gray-800 pt-4 mt-8">
          <h4 className="font-bold mb-2 uppercase text-xs tracking-wider">About Vespera Systems</h4>
          <p className="text-xs text-justify text-gray-700 mb-8">Founded in 1975, Vespera Systems develops, manufactures, licenses, and supports a wide range of software and hardware products for computing devices. From the Vespera OS graphical environment to the CoreNet embedded frameworks powering modern infrastructure, Vespera’s mission is to bridge the gap between human intuition and raw computational power. The Future is Now.</p>
        </div>
        
        <button onClick={() => navigate('vespera:press')} className="text-blue-700 underline hover:text-red-600 font-sans font-bold text-sm bg-transparent border-none cursor-pointer">&lt;&lt; Return to News Index</button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Press Releases</h2>
      <p className="mb-6 text-sm">Read the latest news and corporate announcements from Vespera Systems.</p>
      <ul className="space-y-4 text-sm">
        <li>
          <span className="font-bold">10/12/94</span> - <span className="text-blue-700 underline cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:press/echosoft')}>Vespera Systems Finalizes Acquisition of EchoSoft Audio</span>
        </li>
        <li>
          <span className="font-bold">08/24/93</span> - <span className="text-blue-700 underline cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:404')}>Vespera Announces Omni-Task Office Suite 2.0</span>
        </li>
        <li>
          <span className="font-bold">11/05/92</span> - <span className="text-blue-700 underline cursor-pointer hover:text-red-600" onClick={() => navigate('vespera:404')}>Prism Graphics Corporation Joins the Vespera Family</span>
        </li>
      </ul>
    </>
  );
};
