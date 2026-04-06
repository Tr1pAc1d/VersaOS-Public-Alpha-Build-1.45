import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const VIRTUAL_ID = "virtual:media-player-library";
const RESOLVED_VIRTUAL_ID = "\0" + VIRTUAL_ID;

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const FOLDER_COVER_NAMES = [
  "cover.jpg",
  "cover.jpeg",
  "cover.png",
  "cover.webp",
  "album.jpg",
  "album.jpeg",
  "album.png",
  "folder.jpg",
  "folder.jpeg",
  "folder.png",
  "folder.webp",
];

export interface ScannedTrack {
  file: string;
  cover: string | null;
}

export function scanMediaPlayerMusicDir(rootDir: string): { tracks: ScannedTrack[] } {
  const dir = path.join(rootDir, "public", "MediaPlayer", "Music");
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {
      /* ignore */
    }
    return { tracks: [] };
  }

  const files = fs.readdirSync(dir);
  const lower = (f: string) => f.toLowerCase();

  const mp3s = files
    .filter((f) => lower(f).endsWith(".mp3"))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  let folderCover: string | null = null;
  for (const name of FOLDER_COVER_NAMES) {
    const hit = files.find((f) => lower(f) === name);
    if (hit) {
      folderCover = hit;
      break;
    }
  }

  const tracks: ScannedTrack[] = mp3s.map((mp3) => {
    const baseLower = mp3.replace(/\.mp3$/i, "").toLowerCase();
    let cover: string | null = null;
    for (const ext of IMAGE_EXT) {
      const hit = files.find((f) => lower(f) === `${baseLower}${ext}`);
      if (hit) {
        cover = hit;
        break;
      }
    }
    if (!cover && folderCover) cover = folderCover;
    return { file: mp3, cover };
  });

  return { tracks };
}

export function mediaPlayerLibraryPlugin(rootDir: string): Plugin {
  const musicDir = path.join(rootDir, "public", "MediaPlayer", "Music");

  return {
    name: "media-player-library",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;
      const data = scanMediaPlayerMusicDir(rootDir);
      return `export const MEDIA_PLAYER_LIBRARY = ${JSON.stringify(data)};`;
    },
    configureServer(server) {
      if (!fs.existsSync(musicDir)) return;
      server.watcher.add(musicDir);
      let timer: ReturnType<typeof setTimeout> | null = null;
      const scheduleReload = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          timer = null;
          server.ws.send({ type: "full-reload", path: "*" });
        }, 300);
      };
      server.watcher.on("all", (evt, filePath) => {
        const n = String(filePath).replace(/\\/g, "/");
        if (!n.includes("public/MediaPlayer/Music")) return;
        if (evt === "add" || evt === "unlink" || evt === "change") scheduleReload();
      });
    },
  };
}
