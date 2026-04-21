import React, { useState, useEffect } from 'react';
import { useVFS } from '../hooks/useVFS';

export const VolumeControl: React.FC = () => {
  const { displaySettings, updateSoundSettings } = useVFS();
  
  const [masterVolume, setMasterVolume] = useState(displaySettings?.soundEffectsVolume ?? 1.0);
  const [masterMuted, setMasterMuted] = useState(displaySettings?.systemMuted ?? false);

  // Fake states for realism
  const [waveVol, setWaveVol] = useState(0.8);
  const [waveMute, setWaveMute] = useState(false);
  const [synthVol, setSynthVol] = useState(0.9);
  const [synthMute, setSynthMute] = useState(false);
  const [lineVol, setLineVol] = useState(0.5);
  const [lineMute, setLineMute] = useState(true);
  const [cdVol, setCdVol] = useState(0.7);
  const [cdMute, setCdMute] = useState(false);

  useEffect(() => {
    updateSoundSettings(masterVolume, masterMuted);
  }, [masterVolume, masterMuted]);

  useEffect(() => {
    if (displaySettings?.soundEffectsVolume !== undefined && displaySettings.soundEffectsVolume !== masterVolume) {
      setMasterVolume(displaySettings.soundEffectsVolume);
    }
    if (displaySettings?.systemMuted !== undefined && displaySettings.systemMuted !== masterMuted) {
      setMasterMuted(displaySettings.systemMuted);
    }
  }, [displaySettings?.soundEffectsVolume, displaySettings?.systemMuted]);

  const SliderColumn = ({ 
    title, 
    vol, 
    setVol, 
    mute, 
    setMute, 
    muteLabel = "Mute" 
  }: { 
    title: string, 
    vol: number, 
    setVol: (v: number) => void, 
    mute: boolean, 
    setMute: (m: boolean) => void, 
    muteLabel?: string 
  }) => (
    <div className="flex flex-col items-center border-r-[2px] border-r-white border-b-white pr-2 mr-2 last:border-r-0 last:mr-0 last:pr-0">
      <div className="text-xs mb-3 text-center w-[70px] min-h-[32px]">{title}</div>
      
      {/* Fake Balance Control */}
      <div className="flex flex-col items-center mb-6 w-full">
        <label className="text-[10px] mb-1">Balance:</label>
        <div className="flex items-center justify-between w-full px-1">
          <span className="text-[9px] font-bold">L</span>
          <div className="relative w-8 h-1 bg-gray-500 border border-gray-400 border-b-white border-r-white mx-1">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-3 bg-[#c0c0c0] border-t-white border-l-white border-b-gray-800 border-r-gray-800 border" />
          </div>
          <span className="text-[9px] font-bold">R</span>
        </div>
      </div>
      
      <div className="text-[10px] mb-2 self-start pl-2">Volume:</div>
      
      {/* Volume Slider - Custom pointer implementation */}
      <div 
        className="relative h-32 w-12 flex justify-center mb-4 cursor-pointer"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          const updateVol = (clientY: number) => {
            let newVol = 1 - (clientY - rect.top) / rect.height;
            newVol = Math.max(0, Math.min(1, newVol));
            setVol(newVol);
          };
          updateVol(e.clientY);

          const handleMove = (moveEvent: PointerEvent) => {
            updateVol(moveEvent.clientY);
          };
          const handleUp = () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
          };
          window.addEventListener('pointermove', handleMove);
          window.addEventListener('pointerup', handleUp);
        }}
      >
        {/* Track */}
        <div className="absolute inset-y-0 w-2 bg-gray-800 border-r border-b border-white pointer-events-none"></div>
        {/* Thumb Visual */}
        <div 
          className="absolute w-8 h-4 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 shadow shadow-black/20 pointer-events-none"
          style={{ bottom: (vol * 100) + '%', transform: 'translateY(50%)' }}
        />
        {/* Tick marks */}
        <div className="absolute inset-y-0 left-0 w-2 flex flex-col justify-between py-1 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-1.5 h-px bg-gray-500"></div>
          ))}
        </div>
        <div className="absolute inset-y-0 right-0 w-2 flex flex-col justify-between py-1 items-end pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-1.5 h-px bg-gray-500"></div>
          ))}
        </div>
      </div>

      <div className="mt-auto mb-2 flex items-center justify-start w-full pl-1">
        <input 
          type="checkbox" 
          id={'checkbox-' + title} 
          checked={mute}
          onChange={(e) => setMute(e.target.checked)}
          className="mr-1 mt-0.5"
        />
        <label htmlFor={'checkbox-' + title} className="text-[11px] select-none">{muteLabel}</label>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans box-border overflow-hidden select-none pb-1">
      {/* Menu Bar */}
      <div className="flex px-1 py-0.5 border-b border-white shadow-[0_1px_0_gray] text-xs">
        <div className="px-1.5 hover:bg-blue-800 hover:text-white cursor-pointer">
          <span className="underline">O</span>ptions
        </div>
        <div className="px-1.5 hover:bg-blue-800 hover:text-white cursor-pointer">
          <span className="underline">H</span>elp
        </div>
      </div>
      
      {/* Sliders Area */}
      <div className="flex flex-1 p-2 bg-[#c0c0c0] overflow-x-auto overflow-y-hidden border-t-2 border-t-[#dfdfdf]">
        <SliderColumn 
          title="Volume Control" 
          vol={masterVolume} setVol={setMasterVolume} 
          mute={masterMuted} setMute={setMasterMuted} 
          muteLabel="Mute all" 
        />
        <SliderColumn 
          title="Wave" 
          vol={waveVol} setVol={setWaveVol} 
          mute={waveMute} setMute={setWaveMute} 
        />
        <SliderColumn 
          title="SW Synth" 
          vol={synthVol} setVol={setSynthVol} 
          mute={synthMute} setMute={setSynthMute} 
        />
        <SliderColumn 
          title="Line In" 
          vol={lineVol} setVol={setLineVol} 
          mute={lineMute} setMute={setLineMute} 
        />
        <SliderColumn 
          title="CD Audio" 
          vol={cdVol} setVol={setCdVol} 
          mute={cdMute} setMute={setCdMute} 
        />
      </div>

      {/* Footer */}
      <div className="px-2 py-1 text-[11px] border-t border-gray-400 shadow-[0_-1px_0_white]">
        ESS Maestro
      </div>
    </div>
  );
};
