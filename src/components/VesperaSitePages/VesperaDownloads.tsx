import React from 'react';
import { VesperaPageProps } from './types';

export const VesperaDownloads: React.FC<VesperaPageProps> = ({ onDownload, startFailingDownload }) => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-4 text-[#000080] border-b-2 border-[#000080] pb-2">Developer Network & Downloads</h2>
      <p className="mb-4 text-sm">Access the latest development tools, system updates, and media codecs. Vespera Systems provides robust support for our proprietary languages.</p>
      
      <table className="w-full text-sm border-2 border-gray-800 bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.2)] mb-8">
        <thead className="bg-[#000080] text-white text-left">
          <tr>
            <th className="p-2 border-r border-gray-400">Filename</th>
            <th className="p-2 border-r border-gray-400">Description</th>
            <th className="p-2 border-r border-gray-400">Size</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-300 hover:bg-gray-100">
            <td className="p-2 border-r border-gray-300 font-mono font-bold">AETHERIS_NET_MON_SETUP.EXE</td>
            <td className="p-2 border-r border-gray-300">AETHERIS Network Monitor v4.2 Setup. Advanced diagnostic tool for node routing and EMI frequency analysis.</td>
            <td className="p-2 border-r border-gray-300">1.2 MB</td>
            <td className="p-2">
              <button
                  onClick={() => onDownload?.('AETHERIS_NET_MON_SETUP.EXE', 'vesperasystems.com')}
                  className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-2 py-1 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
                >
                  Download
                </button>
            </td>
          </tr>
          <tr className="border-b border-gray-300 hover:bg-red-50" style={{ borderLeft: '3px solid #CC0000' }}>
            <td className="p-2 border-r border-gray-300 font-mono font-bold" style={{ color: '#8B0000' }}>RHID_SUBSYSTEM_SETUP.EXE</td>
            <td className="p-2 border-r border-gray-300">RHID Subsystem for Vespera OS v4.03.22.1 &mdash; Kernel &amp; Linux Subsystem Update for Vespera Systems. Based on Red Hat 3.0.3 RHID altered distribution. Provides POSIX-compliant shell environment.</td>
            <td className="p-2 border-r border-gray-300">2.8 MB</td>
            <td className="p-2">
              <button
                  onClick={() => onDownload?.('RHID_SUBSYSTEM_SETUP.EXE', 'vesperasystems.com')}
                  className="border-2 px-2 py-1 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
                  style={{ backgroundColor: '#CC0000', color: 'white', borderTopColor: '#FF4444', borderLeftColor: '#FF4444', borderBottomColor: '#660000', borderRightColor: '#660000' }}
                >
                  Download
                </button>
            </td>
          </tr>
          <tr className="border-b border-gray-300 hover:bg-gray-100">
            <td className="p-2 border-r border-gray-300 font-mono font-bold">VSCRIPT_31.EXE</td>
            <td className="p-2 border-r border-gray-300">V-Script (Visual Vespera) IDE v3.1. The industry standard for point-and-click application development.</td>
            <td className="p-2 border-r border-gray-300">4.2 MB</td>
            <td className="p-2"><button onClick={() => startFailingDownload('VSCRIPT_31.EXE')} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-2 py-1 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Download</button></td>
          </tr>
          <tr className="border-b border-gray-300 hover:bg-gray-100">
            <td className="p-2 border-r border-gray-300 font-mono font-bold">CORENET_TK.ZIP</td>
            <td className="p-2 border-r border-gray-300">CoreNet Embedded Toolkit v4.0. Low-level compiler for Logic-7 microcontrollers.</td>
            <td className="p-2 border-r border-gray-300">850 KB</td>
            <td className="p-2"><button onClick={() => startFailingDownload('CORENET_TK.ZIP')} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-2 py-1 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Download</button></td>
          </tr>
          <tr className="border-b border-gray-300 hover:bg-gray-100">
            <td className="p-2 border-r border-gray-300 font-mono font-bold">AURA_CODEC.EXE</td>
            <td className="p-2 border-r border-gray-300">Aura Audio/Video Codec Pack v2.0. Required for playback of .AUR media files.</td>
            <td className="p-2 border-r border-gray-300">1.1 MB</td>
            <td className="p-2"><button onClick={() => startFailingDownload('AURA_CODEC.EXE')} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-2 py-1 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Download</button></td>
          </tr>
          <tr className="border-b border-gray-300 hover:bg-gray-100">
            <td className="p-2 border-r border-gray-300 font-mono font-bold">VOS_SP1.EXE</td>
            <td className="p-2 border-r border-gray-300">Vespera OS Service Pack 1. Includes critical security patches for AETHERIS networking.</td>
            <td className="p-2 border-r border-gray-300">12.5 MB</td>
            <td className="p-2"><button onClick={() => startFailingDownload('VOS_SP1.EXE')} className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 px-2 py-1 text-xs font-bold active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white">Download</button></td>
          </tr>
          <tr className="bg-red-50 hover:bg-red-100">
            <td className="p-2 border-r border-gray-300 font-mono font-bold text-red-800">SYNAP_C_SDK.TAR.GZ</td>
            <td className="p-2 border-r border-gray-300 text-red-900">Synap-C Neural Compiler SDK. <br/><span className="text-xs font-bold">RESTRICTED: AXIS INNOVATIONS CLEARANCE REQUIRED.</span></td>
            <td className="p-2 border-r border-gray-300 text-red-800">[REDACTED]</td>
            <td className="p-2"><button onClick={() => alert("ACCESS DENIED. UNAUTHORIZED DOWNLOAD ATTEMPT LOGGED.")} className="bg-red-800 text-white border-2 border-t-red-400 border-l-red-400 border-b-red-950 border-r-red-950 px-2 py-1 text-xs font-bold active:border-t-red-950 active:border-l-red-950 active:border-b-red-400 active:border-r-red-400">Download</button></td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
