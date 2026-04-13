import React from 'react';
import { Cpu } from 'lucide-react';
import { VesperaPageProps } from './types';

export const VesperaStore: React.FC<VesperaPageProps> = ({ xtypeImage }) => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Vespera Direct Sales</h2>
      <p className="mb-6 text-sm">Order the latest Vespera hardware and software directly from our secure AETHERIS-encrypted storefront. Please allow 4-6 weeks for delivery.</p>
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Product 1 */}
        <div className="border-2 border-gray-400 bg-white p-4 flex flex-col shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
          <div className="h-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-gray-200 mb-4 border border-gray-400 flex items-center justify-center overflow-hidden bg-center bg-no-repeat bg-contain">
            <img src="/Vespera Website assets/Product Images/Vespera Workplace RHID Edition Box.png" alt="Horizon Desktop PC" className="object-contain h-full w-auto hover:scale-110 transition-transform duration-500" />
          </div>
          <h3 className="font-bold text-lg text-[#000080]">Horizon Desktop PC (VOS 1.0.4)</h3>
          <p className="text-xs text-gray-600 mb-2">Intel i486DX 50MHz, 16MB RAM, 1.2GB HDD</p>
          <p className="text-sm flex-1">The ultimate workstation for Vespera OS. Pre-configured for maximum stability and enterprise networking.</p>
          <div className="mt-4 flex justify-between items-center border-t border-gray-300 pt-3">
            <span className="font-bold text-lg">$2,499.00</span>
            <button className="bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black px-4 py-1 text-sm font-bold active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 hover:brightness-125">Add to Cart</button>
          </div>
        </div>

        {/* Product 2 */}
        <div className="border-2 border-gray-400 bg-white p-4 flex flex-col shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
          <div className="h-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-gray-200 mb-4 border border-gray-400 flex items-center justify-center overflow-hidden bg-center bg-no-repeat bg-contain">
            <img src="/Vespera Website assets/Product Images/Vespera Workplace RHID Second Edition Box.png" alt="Omni-Task Suite" className="object-contain h-full w-auto hover:scale-110 transition-transform duration-500" />
          </div>
          <h3 className="font-bold text-lg text-[#000080]">Omni-Task Office Suite 2.0</h3>
          <p className="text-xs text-gray-600 mb-2">CD-ROM Edition</p>
          <p className="text-sm flex-1">Includes Vespera Slide Deck, Omni-Word, and Omni-Calc. The definitive productivity suite for the modern professional.</p>
          <div className="mt-4 flex justify-between items-center border-t border-gray-300 pt-3">
            <span className="font-bold text-lg">$399.00</span>
            <button className="bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black px-4 py-1 text-sm font-bold active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 hover:brightness-125">Add to Cart</button>
          </div>
        </div>

        {/* Product 3 */}
        <div className="border-2 border-gray-400 bg-white p-4 flex flex-col shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
          <div className="h-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-gray-200 mb-4 border border-gray-400 flex items-center justify-center overflow-hidden bg-center bg-no-repeat bg-contain">
            <img src="/Vespera Website assets/Product Images/VMail Product box.png" alt="Vespera VMail" className="object-contain h-full w-auto hover:scale-110 transition-transform duration-500" />
          </div>
          <h3 className="font-bold text-lg text-[#000080]">Vespera VMail Pro</h3>
          <p className="text-xs text-gray-600 mb-2">VesperaNET Member Exclusive</p>
          <p className="text-sm flex-1">Secure, encrypted email for the corporate professional. Fully integrated with VStore Catalyst and VesperaNET global directories.</p>
          <div className="mt-4 flex justify-between items-center border-t border-gray-300 pt-3">
            <span className="font-bold text-lg">$89.00</span>
            <button className="bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black px-4 py-1 text-sm font-bold active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 hover:brightness-125">Add to Cart</button>
          </div>
        </div>

        {/* Product 4 */}
        <div className="border-2 border-red-600 bg-red-50 p-4 flex flex-col shadow-[4px_4px_0px_rgba(0,0,0,0.2)] relative overflow-hidden">
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-10">Experimental</div>
          <div className="h-40 bg-gray-200 mb-4 border border-gray-400 flex items-center justify-center overflow-hidden">
            {xtypeImage ? (
              <img src={xtypeImage} alt="X-Type Expansion Card" className="object-cover w-full h-full hover:scale-110 transition-transform duration-500" />
            ) : (
              <Cpu size={48} className="text-red-800" />
            )}
          </div>
          <h3 className="font-bold text-lg text-red-800">X-Type Neural Bridge</h3>
          <p className="text-xs text-red-600 mb-2">Model X-1 (VLB Architecture)</p>
          <p className="text-sm flex-1 text-red-900">The machine that learns. Offload heuristic processing and establish a localized neural feedback loop. <br/><br/><span className="italic text-xs font-bold">Warning: Requires robust EMI shielding.</span></p>
          <div className="mt-4 flex justify-between items-center border-t border-red-300 pt-3">
            <span className="font-bold text-lg text-red-800">$899.00</span>
            <button className="bg-red-800 text-white border-2 border-t-red-400 border-l-red-400 border-b-black border-r-black px-4 py-1 text-sm font-bold active:border-t-black active:border-l-black active:border-b-red-400 active:border-r-red-400 hover:brightness-125">Add to Cart</button>
          </div>
        </div>

        {/* Product 5 - AETHERIS Logistics Node */}
        <div className="border-2 border-gray-400 bg-white p-4 flex flex-col shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
          <div className="h-40 bg-gray-200 mb-4 border border-gray-400 flex items-center justify-center overflow-hidden">
             <img src="/Vespera Website assets/A photo of a heavy, metal, rack-mounted server.jpeg" alt="Server rack" className="w-full h-auto grayscale contrast-125 scale-110" />
          </div>
          <h3 className="font-bold text-lg text-[#000080]">AETHERIS Logistics Node</h3>
          <p className="text-xs text-gray-600 mb-2">Enterprise Class Rack</p>
          <p className="text-sm flex-1">Industrial-scale packet routing with unbreakable hardware-level Sentinel encryption.</p>
          <div className="mt-4 flex justify-between items-center border-t border-gray-300 pt-3">
            <span className="font-bold text-lg">Inquire</span>
            <button className="bg-[#000080] text-white border-2 border-t-blue-400 border-l-blue-400 border-b-black border-r-black px-4 py-1 text-sm font-bold active:border-t-black active:border-l-black active:border-b-blue-400 active:border-r-blue-400 hover:brightness-125">Sales rep</button>
          </div>
        </div>
      </div>
    </>
  );
};
