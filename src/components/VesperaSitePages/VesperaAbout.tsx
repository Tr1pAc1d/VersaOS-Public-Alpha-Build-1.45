import React from 'react';
import { VesperaPageProps } from './types';

export const VesperaAbout: React.FC<VesperaPageProps> = ({ navigate }) => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2 flex items-end justify-between">
        About Vespera Systems
      </h2>
      
      <div className="mb-8 text-sm leading-relaxed space-y-4">
        {/* Executive Portrait added */}
        <div className="float-right ml-4 mb-2 p-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 max-w-[220px]">
          <img src="/Vespera Website assets/Dr. Arthur Thorne (Portrait).png" alt="Dr. Arthur Thorne" className="w-full h-auto grayscale contrast-125 brightness-110 border border-gray-500" />
          <p className="text-[10px] text-center font-bold mt-1 text-[#000080]">Dr. Arthur Thorne</p>
          <p className="text-[9px] text-center italic text-gray-700">Founder & Director of Advanced Heuristics</p>
        </div>
        
        <div>
          <h3 className="font-bold text-md text-[#000080]">Our Origins</h3>
          <p>Founded in 1975 by the visionary Dr. Thorne, Vespera Systems began as an elite computational think-tank dedicated to a singular, ambitious goal: bridging the gap between human intuition and raw computational power. For over two decades, our dedicated team of engineers and data scientists has operated at the vanguard of technological research, translating complex theoretical computing into practical, world-changing solutions.</p>
        </div>

        <div>
          <h3 className="font-bold text-md text-[#000080]">A Legacy of Cross-Sector Innovation</h3>
          <p>What began in the laboratory has now revolutionized the globe. Long before our entry into the personal computing market, Vespera's proprietary algorithms silently powered the world's most critical infrastructure. Today, Vespera Systems provides cutting-edge technology across a multitude of vital sectors. From state-of-the-art medical diagnostic software that saves lives, to complex logistical frameworks, right down to the everyday third-party utility applications that keep your home office running smoothly—Vespera is the invisible engine driving the modern world.</p>
        </div>

        <div>
          <h3 className="font-bold text-md text-[#000080]">The Power of Vespera OS & AETHERIS</h3>
          <p>Our flagship operating environment, Vespera OS, is built upon the rock-solid foundation of our proprietary AETHERIS architecture. Designed for the rigorous demands of the modern enterprise, Vespera OS brings unparalleled stability, true preemptive multitasking, and a seamless, intuitive graphical interface directly to your desktop. Whether you are analyzing complex data streams or surfing the Information Superhighway, Vespera ensures your workflow is uninterrupted and absolute.</p>
        </div>

        <div className="mt-8 mb-4 border-2 border-gray-400 p-2 max-w-sm mx-auto">
          <img src="/Vespera Website assets/The AETHERIS Mainframe.png" alt="The AETHERIS Mainframe" className="w-full h-auto grayscale saturate-0" />
          <p className="text-[10px] text-center font-bold mt-1 text-gray-700">The first AETHERIS Mainframe (1981)</p>
        </div>

        <div>
          <h3 className="font-bold text-md text-[#000080]">The Public Coding Languages</h3>
          <p className="mb-2">The public knows Vespera as a pioneer in software development. While Synap-C is our brand-new, cutting-edge language meant for the X-Type, we maintain two legacy languages that run the normal, everyday world.</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong>V-Script (Visual Vespera):</strong> Introduced in 1990, this highly popular, user-friendly, object-oriented language is the equivalent of Visual Basic. Third-party developers use V-Script to build 90% of the shareware, desktop games, and business applications available for Vespera OS.
            </li>
            <li>
              <strong>CoreNet (C-Net):</strong> Our ultra-reliable, low-level language developed back in the late 1970s. It is entirely text-based, highly efficient, and requires virtually no system memory to run. CoreNet is the invisible backbone of modern infrastructure, used to program embedded systems like Automotive Engine Control Units (ECUs), traffic light grids, hospital heart monitors, and banking mainframes. It isn't flashy, but it never crashes.
            </li>
          </ul>
        </div>

        <div className="mt-8 mb-4 my-6">
          <img src="/Vespera Website assets/Vespera Systems Global Headquarters.png" alt="Vespera Systems Global Headquarters" className="w-full max-w-lg mx-auto border-4 border-gray-400 shadow-xl saturate-50 sepia-[.3]" />
          <p className="text-[10px] text-center font-bold mt-2 text-gray-700">Vespera Systems Global Headquarters - Silicon Valley</p>
        </div>

        <div>
          <h3 className="font-bold text-md text-[#000080]">Strategic Acquisitions & Partnerships</h3>
          <p className="mb-2">At Vespera Systems, we believe in fostering innovation by welcoming brilliant new brands into our family.</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong>Prism Graphics Corporation (Joined 1992):</strong> We proudly welcomed the talented team at Prism to help us evolve their popular "Prism Presenter" into what is now Vespera Slide Deck.
            </li>
            <li>
              <strong>EchoSoft Audio (Joined 1994):</strong> Recognizing the revolutionary potential of this German startup's digital audio compression, Vespera brought EchoSoft into the fold.
            </li>
            <li>
              <strong>Sentinel Data Vaults (Joined 1988):</strong> To ensure our users have absolute peace of mind, we integrated this pioneering data-security firm into the Vespera family. Their trusted encryption algorithms now provide enterprise-grade security directly within the AETHERIS kernel. <span className="text-[10px] text-gray-400 italic">(Internal Note: Unbreakable encryption required for digital containment fields).</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-md text-[#000080]">The Next Evolution: X-Type Neural Bridge</h3>
          <p>At Vespera, we don't just build computers; we build partners. With the upcoming rollout of our experimental X-Type Neural Bridge technology, Vespera is completely redefining the user experience. The X-Type co-processor goes beyond traditional keyboard and mouse inputs. By utilizing advanced heuristic processing, it adapts to your unique workflow. It learns. It anticipates. It understands.</p>
          <p className="mt-2">We believe the machine should adapt to the mind, not the other way around. Vespera isn't just building the next generation of hardware; we are building the next step in human-machine evolution.</p>
          <p className="mt-6 mb-8 text-center text-xl font-bold italic text-[#000080] border-y border-gray-400 py-4 shadow-sm">Welcome to the future.</p>
        </div>
      </div>
    </>
  );
};
