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
