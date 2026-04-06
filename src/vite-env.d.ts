/// <reference types="vite/client" />

declare module "virtual:media-player-library" {
  export const MEDIA_PLAYER_LIBRARY: {
    tracks: { file: string; cover: string | null }[];
  };
}
