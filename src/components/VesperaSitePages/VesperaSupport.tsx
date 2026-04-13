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
      setResults([{ title: '0 Matches Found', desc: 'No exact matches found in the Vespera Knowledge Base. Please ensure your physical manual index matches your OS version and try again.' }]);
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
