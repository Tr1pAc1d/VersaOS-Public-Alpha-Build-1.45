/**
 * Vespera OS audio: plays after the first user gesture (pointer/key/touch)
 * and retries queued sounds on each interaction so autoplay policy is not triggered.
 */

const SOUNDS = {
  startup: '/Sounds/Startup/Vespera_Start_up.mp3',
  shutdown: '/Sounds/Shutdown/Vespera_Shut_Down.mp3',
  alert: '/Sounds/Alerts/Vespera_Alert.mp3',
  error: '/Sounds/Alerts/Error.mp3',
  fatalError: '/Sounds/Alerts/Fatal_Error.mp3',
  installComplete: '/Sounds/Alerts/Install_Complete.mp3',
  bootAfterBios: encodeURI('/Sounds/Startup/Boot Sound/boot_After_Bios.mp3'),
  browserBoot: '/Sounds/Apps/Browser/Vespera_Internet_Browser_Boot_Up.mp3',
  downloadFailed: '/Sounds/Apps/Browser/Download_Failed.mp3',
  click: encodeURI('/Sounds/Apps/Misc sounds/Click.mp3'),
  modemDial: encodeURI('/Sounds/Apps/Misc sounds/internet-modem-dialing.mp3'),
  vstoreWizard: encodeURI(
    '/Sounds/Apps/Misc sounds/VStore_Video_Games_Install_wizard_Music_For_when_installing_a_game_via_The_VStore.mp3'
  ),
  vstoreLoading: '/Sounds/Apps/VStore/vstore_inital_loading.mp3',
  beepDoop: '/Sounds/Misc/Beep-doop-Beep.mp3',
  c64Disk: '/Sounds/Misc/c64-disk-drive-load-program-001-8419.mp3',
  glitchCorrupt: '/Sounds/Misc/computer-glitch-corrupted-file.mp3',
  humLoop: encodeURI(
    '/Sounds/Misc/computer-humming-loop(Show always be playing when the gui os boots up).mp3'
  ),
  harshError: '/Sounds/Misc/deep-server-harsh-error-tone.mp3',
  info: '/Sounds/Misc/info-computer-sound.mp3',
  newMail: '/Sounds/Misc/info-computer-sound.mp3',
} as const;

type QueuedItem = { src: string; volume: number };

let unlockListenersAttached = false;
let ambientRequested = false;
let ambientEl: HTMLAudioElement | null = null;
let wizardLoopEl: HTMLAudioElement | null = null;
const queue: QueuedItem[] = [];

function flushQueue() {
  while (queue.length > 0) {
    const item = queue.shift();
    if (item) playSoundNow(item.src, item.volume);
  }
}

function tryStartAmbient() {
  if (!ambientRequested || ambientEl) return;
  const a = new Audio(SOUNDS.humLoop);
  a.loop = true;
  a.volume = 0.12;
  void a.play().then(() => {
    ambientEl = a;
  }).catch(() => {
    ambientEl = null;
  });
}

/** Call once at app root. Every user interaction flushes the queue and retries ambient. */
export function initVesperaAudio() {
  if (typeof window === 'undefined' || unlockListenersAttached) return;
  unlockListenersAttached = true;

  const onInteract = () => {
    flushQueue();
    tryStartAmbient();
  };

  const opts: AddEventListenerOptions = { capture: true, passive: true };
  window.addEventListener('pointerdown', onInteract, opts);
  window.addEventListener('keydown', onInteract, opts);
  window.addEventListener('touchstart', onInteract, opts);
}

function enqueue(src: string, volume: number) {
  queue.push({ src, volume });
}

function playSoundNow(src: string, volume: number) {
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => enqueue(src, volume));
    }
  } catch (err) {
    console.error('Audio playback error:', err);
  }
}

/** One-shot SFX; queues if the browser has not yet allowed audio. */
export function playSound(src: string, volume = 1) {
  initVesperaAudio();
  playSoundNow(src, volume);
}

export const playStartupSound = () => playSound(SOUNDS.startup);
export const playShutdownSound = () => playSound(SOUNDS.shutdown);
export const playAlertSound = () => playSound(SOUNDS.alert, 0.95);
export const playErrorSound = () => playSound(SOUNDS.error);
export const playFatalErrorSound = () => playSound(SOUNDS.fatalError);
export const playInstallCompleteSound = () => playSound(SOUNDS.installComplete, 0.95);
export const playBootAfterBiosSound = () => playSound(SOUNDS.bootAfterBios, 0.85);
export const playBrowserBootSound = () => playSound(SOUNDS.browserBoot, 0.75);
export const playDownloadFailedSound = () => playSound(SOUNDS.downloadFailed, 0.9);
export const playUIClickSound = () => playSound(SOUNDS.click, 0.45);
export const playModemDialingSound = () => playSound(SOUNDS.modemDial, 0.5);
export const playVStoreLoadingSound = () => playSound(SOUNDS.vstoreLoading, 0.55);
export const playBeepDoopSound = () => playSound(SOUNDS.beepDoop, 0.7);
export const playDiskLoadSound = () => playSound(SOUNDS.c64Disk, 0.65);
export const playGlitchCorruptSound = () => playSound(SOUNDS.glitchCorrupt, 0.6);
export const playHarshErrorSound = () => playSound(SOUNDS.harshError, 0.85);
export const playInfoSound = () => playSound(SOUNDS.info, 0.75);
export const playNewMailSound = () => playSound(SOUNDS.newMail, 0.65);

export function startGuiAmbientHum() {
  initVesperaAudio();
  ambientRequested = true;
  tryStartAmbient();
}

export function stopGuiAmbientHum() {
  ambientRequested = false;
  if (ambientEl) {
    ambientEl.pause();
    ambientEl = null;
  }
}

export function startVStoreInstallWizardMusic() {
  initVesperaAudio();
  stopVStoreInstallWizardMusic();
  const a = new Audio(SOUNDS.vstoreWizard);
  a.loop = true;
  a.volume = 0.35;
  void a.play().then(() => {
    wizardLoopEl = a;
  }).catch(() => {
    wizardLoopEl = null;
  });
}

export function stopVStoreInstallWizardMusic() {
  if (wizardLoopEl) {
    wizardLoopEl.pause();
    wizardLoopEl = null;
  }
}

// ── Plus! Theme Procedural Ambient Audio ────────────────────────────────────

let plusAudioCtx: AudioContext | null = null;
let plusGainNode: GainNode | null = null;
let plusNodes: AudioNode[] = [];
let plusTimers: ReturnType<typeof setTimeout>[] = [];
let plusAmbientType: 'nature' | 'void' | null = null;

function ensurePlusAudioCtx(): AudioContext {
  if (!plusAudioCtx || plusAudioCtx.state === 'closed') {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    plusAudioCtx = new Ctx();
  }
  if (plusAudioCtx.state === 'suspended') {
    plusAudioCtx.resume();
  }
  return plusAudioCtx;
}

function createNatureAmbient(ctx: AudioContext, masterGain: GainNode) {
  // Wind/rustling: filtered white noise
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const windNode = ctx.createBufferSource();
  windNode.buffer = noiseBuffer;
  windNode.loop = true;

  const windFilter = ctx.createBiquadFilter();
  windFilter.type = 'bandpass';
  windFilter.frequency.value = 400;
  windFilter.Q.value = 0.5;

  const windGain = ctx.createGain();
  windGain.gain.value = 0.3;

  windNode.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(masterGain);
  windNode.start();

  plusNodes.push(windNode, windFilter, windGain);

  // Slow wind modulation
  const windLfo = ctx.createOscillator();
  windLfo.type = 'sine';
  windLfo.frequency.value = 0.15;
  const windLfoGain = ctx.createGain();
  windLfoGain.gain.value = 150;
  windLfo.connect(windLfoGain);
  windLfoGain.connect(windFilter.frequency);
  windLfo.start();
  plusNodes.push(windLfo, windLfoGain);

  // Bird chirps (periodic sine bursts)
  function scheduleBirdChirp() {
    const delay = 3000 + Math.random() * 8000;
    const timer = setTimeout(() => {
      if (!plusAudioCtx || plusAmbientType !== 'nature') return;
      try {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        const baseFreq = 1800 + Math.random() * 1200;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, ctx.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, ctx.currentTime + 0.15);

        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0, ctx.currentTime);
        chirpGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(chirpGain);
        chirpGain.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } catch (e) { /* ctx may be closed */ }

      scheduleBirdChirp();
    }, delay);
    plusTimers.push(timer);
  }
  scheduleBirdChirp();

  // Occasional digital glitch — static burst
  function scheduleGlitch() {
    const delay = 15000 + Math.random() * 30000;
    const timer = setTimeout(() => {
      if (!plusAudioCtx || plusAmbientType !== 'nature') return;
      try {
        const glitchBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
        const gData = glitchBuf.getChannelData(0);
        for (let i = 0; i < gData.length; i++) {
          gData[i] = (Math.random() * 2 - 1) * (i < gData.length * 0.1 ? (i / (gData.length * 0.1)) : 1);
        }
        const glitchSrc = ctx.createBufferSource();
        glitchSrc.buffer = glitchBuf;
        const glitchGain = ctx.createGain();
        glitchGain.gain.value = 0.04;
        const glitchFilter = ctx.createBiquadFilter();
        glitchFilter.type = 'highpass';
        glitchFilter.frequency.value = 2000;
        glitchSrc.connect(glitchFilter);
        glitchFilter.connect(glitchGain);
        glitchGain.connect(masterGain);
        glitchSrc.start();
      } catch (e) {}
      scheduleGlitch();
    }, delay);
    plusTimers.push(timer);
  }
  scheduleGlitch();
}

function createVoidAmbient(ctx: AudioContext, masterGain: GainNode) {
  // Deep drone: two detuned sine oscillators
  const drone1 = ctx.createOscillator();
  drone1.type = 'sine';
  drone1.frequency.value = 55; // Low A
  const drone1Gain = ctx.createGain();
  drone1Gain.gain.value = 0.35;

  const drone2 = ctx.createOscillator();
  drone2.type = 'sine';
  drone2.frequency.value = 55.8; // Slightly detuned for beating
  const drone2Gain = ctx.createGain();
  drone2Gain.gain.value = 0.3;

  drone1.connect(drone1Gain);
  drone1Gain.connect(masterGain);
  drone1.start();

  drone2.connect(drone2Gain);
  drone2Gain.connect(masterGain);
  drone2.start();

  plusNodes.push(drone1, drone1Gain, drone2, drone2Gain);

  // Sub-bass pulse
  const subOsc = ctx.createOscillator();
  subOsc.type = 'triangle';
  subOsc.frequency.value = 30;
  const subGain = ctx.createGain();
  subGain.gain.value = 0.15;

  const subLfo = ctx.createOscillator();
  subLfo.type = 'sine';
  subLfo.frequency.value = 0.08;
  const subLfoGain = ctx.createGain();
  subLfoGain.gain.value = 0.12;
  subLfo.connect(subLfoGain);
  subLfoGain.connect(subGain.gain);
  subLfo.start();

  subOsc.connect(subGain);
  subGain.connect(masterGain);
  subOsc.start();

  plusNodes.push(subOsc, subGain, subLfo, subLfoGain);

  // Filtered noise layer (fluorescent hum)
  const bufferSize = 2 * ctx.sampleRate;
  const noiseBuf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    nd[i] = Math.random() * 2 - 1;
  }
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = noiseBuf;
  noiseSrc.loop = true;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 120;
  noiseFilter.Q.value = 8;

  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.08;

  noiseSrc.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  noiseSrc.start();

  plusNodes.push(noiseSrc, noiseFilter, noiseGain);

  // Occasional unsettling whisper-like sound
  function scheduleWhisper() {
    const delay = 20000 + Math.random() * 40000;
    const timer = setTimeout(() => {
      if (!plusAudioCtx || plusAmbientType !== 'void') return;
      try {
        const wBuf = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
        const wd = wBuf.getChannelData(0);
        for (let i = 0; i < wd.length; i++) {
          const env = Math.sin((i / wd.length) * Math.PI);
          wd[i] = (Math.random() * 2 - 1) * env * 0.5;
        }
        const wSrc = ctx.createBufferSource();
        wSrc.buffer = wBuf;

        const wFilter = ctx.createBiquadFilter();
        wFilter.type = 'bandpass';
        wFilter.frequency.value = 800 + Math.random() * 600;
        wFilter.Q.value = 3;

        const wGain = ctx.createGain();
        wGain.gain.value = 0.03;

        wSrc.connect(wFilter);
        wFilter.connect(wGain);
        wGain.connect(masterGain);
        wSrc.start();
      } catch (e) {}
      scheduleWhisper();
    }, delay);
    plusTimers.push(timer);
  }
  scheduleWhisper();
}

export function startPlusAmbient(type: 'nature' | 'void', volume = 0.15) {
  stopPlusAmbient();
  try {
    const ctx = ensurePlusAudioCtx();
    plusGainNode = ctx.createGain();
    plusGainNode.gain.value = volume;
    plusGainNode.connect(ctx.destination);
    plusAmbientType = type;

    if (type === 'nature') {
      createNatureAmbient(ctx, plusGainNode);
    } else {
      createVoidAmbient(ctx, plusGainNode);
    }
  } catch (e) {
    console.error('Plus! ambient audio error:', e);
  }
}

export function stopPlusAmbient() {
  plusAmbientType = null;
  plusTimers.forEach(t => clearTimeout(t));
  plusTimers = [];
  plusNodes.forEach(n => {
    try {
      if ('stop' in n && typeof (n as any).stop === 'function') (n as any).stop();
      n.disconnect();
    } catch (e) {}
  });
  plusNodes = [];
  if (plusGainNode) {
    try { plusGainNode.disconnect(); } catch (e) {}
    plusGainNode = null;
  }
}

export function setPlusAmbientVolume(vol: number) {
  if (plusGainNode) {
    plusGainNode.gain.value = vol;
  }
}

export function setPlusAmbientMuted(muted: boolean) {
  if (plusGainNode) {
    plusGainNode.gain.value = muted ? 0 : 0.15;
  }
}

