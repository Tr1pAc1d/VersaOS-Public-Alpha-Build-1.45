import React, { useState } from 'react';
import { VesperaPageProps } from './types';
import { Search } from 'lucide-react';

export const VesperaSupport: React.FC<VesperaPageProps> = ({ startFailingDownload }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ title: string; desc: string; isError?: boolean }[] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toUpperCase();
    if (!q) return;

    if (q === 'X-TYPE' || q === 'XTYPE' || q === 'NEURAL' || q === 'X TYPE') {
      setResults([{ title: 'DIAGNOSTIC ERR_THERMAL_BLEED', desc: 'The co-processor is not overheating. The temperature spikes correspond exactly to human REM sleep patterns. Disconnect it from your network immediately.', isError: true }]);
    } else if (q.includes('DREAM')) {
      setResults([{ title: 'USER KNOWLEDGE BASE: COGNITIVE OVERFLOW', desc: 'Do not sleep in the same room as an active Horizon Desktop PC. The fans sound like whispering because they learn names.', isError: true }]);
    } else if (q.includes('THORNE')) {
      setResults([{ title: 'EMPLOYEE DIRECTORY EXPUNGED', desc: 'Dr. Aris Thorne has been relocated to Facility 4. All access tokens revoked. Do not attempt to contact.', isError: true }]);
    } else if (q.includes('DOWNLOAD') || q.includes('CODEC') || q === 'AURA') {
      startFailingDownload?.();
      setResults([{ title: 'INSTALLATION ROUTINE INITIATED...', desc: 'Initiating Aura codec patch over the bridge.' }]);
    } else {
      const sizes = ['14 KB', '1.2 MB', '4.5 MB', '450 KB', '2.1 MB', '89 KB', '12 MB', '640 KB', '3.1 MB', '24 KB', '128 KB'];
      const adjectives = ['Legacy', 'PCI', 'VGA', '16-bit', '32-bit', 'Neural', 'Quantum', 'Vespera', 'Aetheris', 'Generic', 'Enhanced', 'Integrated', 'Optical', 'Analog', 'Digital', 'Sync', 'Async', 'Parallel', 'Serial', 'ATAPI', 'SCSI', 'ISA', 'AGP', 'VLB', 'PCMCIA', 'Token Ring', 'Ethernet'];
      const nouns = ['Driver', 'Codec', 'Patch', 'Update', 'Firmware', 'BIOS', 'Utility', 'Extension', 'Module', 'Interface', 'Controller', 'Adapter', 'Accelerator', 'Synthesizer', 'Modem', 'Soundcard', 'Framebuffer', 'Bridge', 'Bus Master', 'ROM'];
      const versions = ['v1.0', 'v2.4a', 'v3.11', 'v4.0', 'v95', 'vNT', 'SP1', 'SP2', 'Beta', 'RC1', 'WHQL', 'Archive', 'OEM', 'Retail'];
      
      const genericResults = Array.from({ length: 148 }).map((_, i) => {
        const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
        const adj = rand(adjectives);
        const noun = rand(nouns);
        const ver = rand(versions);
        const code = rand(['0x0', '0x2', '0xF', '0x8']) + Math.floor(Math.random() * 10000).toString(16).toUpperCase();
        
        const isQueryInjected = Math.random() > 0.65;
        const titleWords = [adj, isQueryInjected ? q : '', noun, ver];
        const title = titleWords.filter(Boolean).join(' ').toUpperCase() + ` [SYS_${code}]`;
        
        const date = `199${Math.floor(Math.random() * 7)}-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 18) + 10}`;
        const desc = `Date: ${date} | Size: ${rand(sizes)} | Category: ${adj} Systems
Provides architectural compatibility and registry updates for standard ${noun.toLowerCase()} protocols. Overrides existing generic configuration. May require system reboot.`;
        
        return { title, desc };
      });
      
      // Sort to make it look like an organized directory index
      setResults(genericResults.sort((a,b) => a.title.localeCompare(b.title)));
    }
  };

  return (
    <>
      <div className="border-b-2 border-[#000080] mb-4 pb-2">
        <h2 className="text-3xl font-bold text-[#000080] flex items-center gap-3">
          Vespera Systems Support
        </h2>
      </div>
      
      <p className="mb-8 text-sm">
        Welcome to the Vespera Technical Support Database. Enter your query below to search thousands of indexed physical manuals and technical documentation.
      </p>

      {/* Search Box */}
      <div className="bg-[#c0c0c0] p-4 border border-t-white border-l-white border-b-gray-800 border-r-gray-800 mb-8 max-w-xl mx-auto shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="E.g. Video Codec, Modem Drivers..."
            className="flex-1 px-2 py-1 text-sm border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white outline-none"
          />
          <button 
            type="submit"
            className="bg-[#c0c0c0] px-4 py-1 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold active:border-t-gray-800 active:border-l-gray-800 flex items-center gap-1 cursor-pointer"
          >
            <Search size={14} /> Search
          </button>
        </form>
      </div>

      {/* Results */}
      {results && (
        <div className="max-w-2xl mx-auto">
          <h3 className="font-bold text-[#000080] mb-4 border-b border-gray-300">Search Results for "{query}"</h3>
          <div className="space-y-4">
            {results.map((res, i) => (
              <div key={i} className={`p-4 border \${res.isError ? 'border-red-600 bg-red-50 text-red-900' : 'border-gray-400 bg-white'} shadow-sm`}>
                <h4 className={`font-bold text-lg mb-2 \${res.isError ? 'text-red-700' : 'text-[#000080]'}`}>
                  {res.title}
                </h4>
                <p className="text-sm leading-relaxed">{res.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Numbers */}
      <div className="mt-16 text-xs text-center border border-gray-300 p-4 bg-gray-50/50">
        <p className="font-bold mb-2">Can't find what you're looking for?</p>
        <p>Call our global helpdesk: <strong>1-800-VESPERA</strong> (Standard long-distance rates apply)</p>
        <p>Operating Hours: Mon-Fri, 9:00 AM - 5:00 PM EST</p>
      </div>
    </>
  );
};
