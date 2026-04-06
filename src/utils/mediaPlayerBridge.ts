/** Sync taskbar tray with VERSA Media Agent (custom events + shared volume storage). */

export const VERSA_MEDIA_VOLUME_STORAGE_KEY = 'versa_media_volume_v1';

export const VERSA_MEDIA_PLAYER_STATE_EVENT = 'versa-media-player-state';
export const VERSA_MEDIA_PLAYER_SET_VOLUME_EVENT = 'versa-media-player-set-volume';

export type VersaMediaPlayerStateDetail = {
  isPlaying: boolean;
  volume: number;
  hasTrack: boolean;
  /** Resolved artwork URL for taskbar (ID3 blob or public cover path), or null */
  nowPlayingArt?: string | null;
};

export function readVersaMediaVolume(): number {
  const v = Number(localStorage.getItem(VERSA_MEDIA_VOLUME_STORAGE_KEY));
  return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.85;
}

export function writeVersaMediaVolume(volume: number): void {
  localStorage.setItem(VERSA_MEDIA_VOLUME_STORAGE_KEY, String(volume));
}
