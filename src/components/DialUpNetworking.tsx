import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Radio } from 'lucide-react';
import { useNetworkLink } from '../contexts/NetworkLinkContext';
import { playModemDialingSound, playUIClickSound } from '../utils/audio';

export const DialUpNetworking: React.FC = () => {
  const { strictDialUp, setStrictDialUp, linkStatus, isLinkUp, connect, disconnect } = useNetworkLink();
  const playedDialForSession = useRef(false);

  useEffect(() => {
    if (linkStatus === 'dialing' && !playedDialForSession.current) {
      playedDialForSession.current = true;
      playModemDialingSound();
    }
    if (linkStatus !== 'dialing') {
      playedDialForSession.current = false;
    }
  }, [linkStatus]);

  const statusLabel =
    !strictDialUp
      ? 'Not required — Vespera Navigator uses a direct local stack (legacy mode).'
      : linkStatus === 'dialing'
        ? 'Dialing VesperaNET…'
        : linkStatus === 'online'
          ? 'Connected to VesperaNET.'
          : 'Disconnected. External sites on Navigator are blocked until you connect.';

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans p-4 gap-4 overflow-y-auto select-none">
      <div className="flex items-start gap-3 border-b-2 border-gray-500 pb-3">
        <div className="p-2 bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white">
          <Phone size={28} className="text-[#000080]" />
        </div>
        <div>
          <h1 className="text-lg font-bold">VesperaNET Dial-Up Connection</h1>
          <p className="text-xs text-gray-700 mt-1">Establish a 28.8k analog link before browsing the wider Web (optional realism).</p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={strictDialUp}
          onChange={(e) => {
            playUIClickSound();
            setStrictDialUp(e.target.checked);
          }}
        />
        <span>Require dial-up before external Web (Navigator blocks off-LAN pages until connected)</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <label className="block font-bold text-xs text-gray-600">Phone number</label>
          <input
            readOnly
            className="w-full px-2 py-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white font-mono text-xs"
            value="9,555-0142 (VesperaNET POP)"
          />
        </div>
        <div className="space-y-1">
          <label className="block font-bold text-xs text-gray-600">User name</label>
          <input
            readOnly
            className="w-full px-2 py-1 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-white font-mono text-xs"
            value="GUEST"
          />
        </div>
      </div>

      <div
        className={`flex items-center gap-2 px-3 py-2 text-sm font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 ${
          isLinkUp ? 'bg-[#e8f5e9] text-green-900' : linkStatus === 'dialing' ? 'bg-[#fff8e1] text-yellow-900' : 'bg-[#ffebee] text-red-900'
        }`}
      >
        <Radio size={18} className="shrink-0" />
        <span>{statusLabel}</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-auto">
        <button
          type="button"
          disabled={!strictDialUp || linkStatus === 'dialing' || linkStatus === 'online'}
          onClick={() => {
            playUIClickSound();
            connect();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d4d4d4] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
        >
          <Phone size={16} /> Dial
        </button>
        <button
          type="button"
          disabled={!strictDialUp || linkStatus === 'offline'}
          onClick={() => {
            playUIClickSound();
            disconnect();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d4d4d4] active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white"
        >
          <PhoneOff size={16} /> Hang up
        </button>
      </div>

      <p className="text-[10px] text-gray-600 leading-snug">
        Settings are stored separately from your disk image (key <span className="font-mono">vespera_network_link</span>) so your files and desktop are untouched.
      </p>
    </div>
  );
};
