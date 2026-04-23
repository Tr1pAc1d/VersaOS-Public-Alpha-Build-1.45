import React, { useCallback, useEffect, useRef, useState } from "react";
import jsmediatags from "jsmediatags";
import {
  Disc3,
  FolderOpen,
  SkipBack,
  SkipForward,
  Square,
  Play,
  Pause,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  List,
  FileVideo,
  Film,
  Music,
  X,
  Check,
  ExternalLink,
} from "lucide-react";
import { MEDIA_PLAYER_LIBRARY } from "virtual:media-player-library";
import {
  readVersaMediaVolume,
  writeVersaMediaVolume,
  VERSA_MEDIA_PLAYER_SET_VOLUME_EVENT,
  VERSA_MEDIA_PLAYER_STATE_EVENT,
  type VersaMediaPlayerStateDetail,
} from "../utils/mediaPlayerBridge";

interface VersaMediaPlayerProps {
  onOpenVideoPopup?: (videoUrl: string, title: string) => void;
}

export type MediaType = "audio" | "video";
export type PlaylistSource = "builtin" | "user" | "vfs";
export type VisualizerStyle = "bars" | "wave" | "circle" | "spectrum";
export type VisualizerColor = "blue" | "green" | "red" | "purple" | "rainbow";

export interface PlaylistTrack {
  id: string;
  url: string;
  source: PlaylistSource;
  fileName: string;
  mediaType: MediaType;
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  duration?: number;
  /** Embedded ID3 picture (blob URL — revoked on cleanup) */
  artUrl?: string;
  /** Static cover next to the MP3 in public/MediaPlayer/Music (or folder cover.jpg / album.jpg) */
  coverImageUrl?: string;
  /** VFS node ID if stored in virtual file system */
  vfsNodeId?: string;
}

export interface UserPlaylist {
  id: string;
  name: string;
  tracks: string[]; // Track IDs
  createdAt: number;
}

/** VFS Media File storage key */
const VFS_MEDIA_STORAGE_KEY = "versa_media_vfs_v1";
/** User Playlists storage key */
const PLAYLISTS_STORAGE_KEY = "versa_media_playlists_v1";

/** Stored media file metadata */
interface VFSMediaFile {
  id: string;
  name: string;
  type: MediaType;
  dataUrl: string;
  size: number;
  addedAt: number;
  metadata?: {
    title?: string;
    artist?: string;
    album?: string;
    year?: string;
  };
}

function pickStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") {
    const s = v.trim();
    return s || undefined;
  }
  if (typeof v === "object" && v !== null && "data" in v) {
    const d = (v as { data: unknown }).data;
    if (Array.isArray(d)) {
      const s = d
        .map((x) => (typeof x === "number" ? String.fromCharCode(x) : ""))
        .join("")
        .trim();
      return s || undefined;
    }
  }
  return undefined;
}

function bytesFromPictureData(data: unknown): Uint8Array | null {
  if (data == null) return null;
  if (data instanceof Uint8Array) return data.byteLength ? data : null;
  if (data instanceof ArrayBuffer) {
    const u = new Uint8Array(data);
    return u.byteLength ? u : null;
  }
  if (Array.isArray(data)) {
    const u = new Uint8Array(data);
    return u.byteLength ? u : null;
  }
  return null;
}

/** ID3 can expose one APIC or an array; pick the first usable image. */
function artUrlFromId3Tags(tags: Record<string, unknown>): string | undefined {
  const raw = tags.picture;
  const pics: unknown[] = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
  for (const p of pics) {
    if (!p || typeof p !== "object") continue;
    const format = (p as { format?: string }).format;
    const data = (p as { data?: unknown }).data;
    const bytes = bytesFromPictureData(data);
    if (!format || !bytes) continue;
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: format });
    return URL.createObjectURL(blob);
  }
  return undefined;
}

function extractMetaFromTagContainer(tag: { tags: Record<string, unknown> }): Partial<PlaylistTrack> {
  const t = tag.tags;
  const out: Partial<PlaylistTrack> = {};
  const title = pickStr(t.title);
  const artist = pickStr(t.artist);
  const album = pickStr(t.album);
  const year = pickStr(t.year);
  if (title) out.title = title;
  if (artist) out.artist = artist;
  if (album) out.album = album;
  if (year) out.year = year;
  const artUrl = artUrlFromId3Tags(t);
  if (artUrl) out.artUrl = artUrl;
  return out;
}

function readTagsFromBlob(blob: Blob): Promise<{ ok: true; meta: Partial<PlaylistTrack> } | { ok: false }> {
  return new Promise((resolve) => {
    jsmediatags.read(blob, {
      onSuccess: (tag) => resolve({ ok: true, meta: extractMetaFromTagContainer(tag as { tags: Record<string, unknown> }) }),
      onError: () => resolve({ ok: false }),
    });
  });
}

/** Fetches audio as a blob so jsmediatags uses BlobReader (XHR on /MediaPlayer/... can fail or miss range requests). */
async function loadTrackAudioMeta(track: PlaylistTrack): Promise<{ ok: true; meta: Partial<PlaylistTrack> } | { ok: false } | null> {
  try {
    if (track.url.startsWith("blob:") || track.url.startsWith("data:")) {
      const blob = await fetch(track.url).then((r) => r.blob());
      return readTagsFromBlob(blob);
    }
    const abs = track.url.startsWith("http") ? track.url : new URL(track.url, window.location.origin).href;
    const res = await fetch(abs);
    if (!res.ok) return null;
    const blob = await res.blob();
    return readTagsFromBlob(blob);
  } catch {
    return null;
  }
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMediaTypeFromFileName(fileName: string): MediaType {
  const ext = fileName.toLowerCase().split(".").pop() || "";
  const videoExts = ["mp4", "webm", "ogg", "ogv", "mov", "mkv", "avi"];
  return videoExts.includes(ext) ? "video" : "audio";
}

function isAudioFile(fileName: string): boolean {
  const ext = fileName.toLowerCase().split(".").pop() || "";
  return ["mp3", "wav", "ogg", "oga", "aac", "flac", "m4a", "wma"].includes(ext);
}

function isVideoFile(fileName: string): boolean {
  const ext = fileName.toLowerCase().split(".").pop() || "";
  return ["mp4", "webm", "ogg", "ogv", "mov", "mkv", "avi"].includes(ext);
}

function isMediaFile(fileName: string): boolean {
  return isAudioFile(fileName) || isVideoFile(fileName);
}

function buildBuiltinTracksFromScan(): PlaylistTrack[] {
  return MEDIA_PLAYER_LIBRARY.tracks.map(({ file, cover }) => ({
    id: `builtin-${file}`,
    url: `/MediaPlayer/Music/${encodeURIComponent(file)}`,
    source: "builtin" as const,
    fileName: file,
    mediaType: "audio" as const,
    coverImageUrl: cover ? `/MediaPlayer/Music/${encodeURIComponent(cover)}` : undefined,
  }));
}

/** Win9x style raised/sunken border helpers */
const win9x = {
  raised: "border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800",
  sunken: "border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white",
  button: "bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white",
  buttonPressed: "bg-[#c0c0c0] border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white",
  titleBar: "bg-[#000080] text-white",
  titleBarInactive: "bg-[#808080] text-[#c0c0c0]",
  menuBar: "bg-[#c0c0c0] border-b border-gray-400",
  statusBar: "bg-[#c0c0c0] border-t border-gray-400",
  groove: "border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white",
};

/** Enhanced visualizer with multiple styles */
const AudioVisualizer: React.FC<{ isPlaying: boolean; style: VisualizerStyle; color: VisualizerColor }> = ({ isPlaying, style, color }) => {
  const [bars, setBars] = useState<number[]>(Array(32).fill(10));
  const [wave, setWave] = useState<number[]>(Array(64).fill(50));
  const [circle, setCircle] = useState<number[]>(Array(36).fill(50));

  const getColor = (i: number, total: number): string => {
    if (color === "rainbow") {
      const hue = (i / total) * 360;
      return `hsl(${hue}, 70%, 50%)`;
    }
    const colors = {
      blue: "#000080",
      green: "#008000",
      red: "#800000",
      purple: "#800080",
    };
    return colors[color];
  };

  useEffect(() => {
    if (!isPlaying) {
      setBars(Array(32).fill(10));
      setWave(Array(64).fill(50));
      setCircle(Array(36).fill(50));
      return;
    }
    const interval = setInterval(() => {
      setBars((prev) => prev.map(() => Math.random() * 80 + 10));
      setWave((prev) => prev.map((v, i) => 50 + Math.sin(i * 0.2 + Date.now() * 0.01) * 30 + Math.random() * 10));
      setCircle((prev) => prev.map((v, i) => 50 + Math.sin(i * 0.3 + Date.now() * 0.008) * 25 + Math.random() * 15));
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (style === "bars") {
    return (
      <div className="flex items-end gap-0.5 h-16 px-2">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-1.5 border border-gray-600 rounded-t"
            style={{
              height: `${h}%`,
              background: isPlaying ? getColor(i, bars.length) : "#333",
              transition: "height 0.08s ease",
            }}
          />
        ))}
      </div>
    );
  }

  if (style === "wave") {
    return (
      <div className="flex items-center h-16 px-2">
        {wave.map((h, i) => (
          <div
            key={i}
            className="w-1 border border-gray-600"
            style={{
              height: `${h}%`,
              background: isPlaying ? getColor(i, wave.length) : "#333",
              transition: "height 0.08s ease",
            }}
          />
        ))}
      </div>
    );
  }

  if (style === "circle") {
    return (
      <div className="flex items-center justify-center h-16">
        <div className="relative w-32 h-32">
          {circle.map((h, i) => {
            const angle = (i / circle.length) * 360;
            const radius = 40 + h * 0.3;
            const x = 64 + Math.cos((angle * Math.PI) / 180) * radius;
            const y = 64 + Math.sin((angle * Math.PI) / 180) * radius;
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full border border-gray-600"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  background: isPlaying ? getColor(i, circle.length) : "#333",
                  transform: "translate(-50%, -50%)",
                  transition: "all 0.08s ease",
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (style === "spectrum") {
    return (
      <div className="flex items-end gap-0.5 h-16 px-2">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 border border-gray-600 rounded-t"
            style={{
              height: `${h}%`,
              background: isPlaying ? `linear-gradient(180deg, ${getColor(i, bars.length)} 0%, #000 100%)` : "#333",
              transition: "height 0.08s ease",
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};

/** Fake equalizer display */
const EqualizerDisplay: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const [levels, setLevels] = useState<number[]>(Array(10).fill(0));

  useEffect(() => {
    if (!isPlaying) {
      setLevels(Array(10).fill(0));
      return;
    }
    const interval = setInterval(() => {
      setLevels((prev) => prev.map(() => Math.random() * 80 + 20));
    }, 80);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const freqs = ["60Hz", "170Hz", "310Hz", "600Hz", "1KHz", "3KHz", "6KHz", "12KHz", "14KHz", "16KHz"];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end justify-between h-16 px-1 gap-0.5">
        {levels.map((lvl, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full bg-black border win9x.sunken relative h-12 overflow-hidden">
              <div
                className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 via-yellow-500 to-red-500 transition-all duration-75"
                style={{ height: `${lvl}%` }}
              />
            </div>
            <span className="text-[8px] text-gray-600 font-mono">{freqs[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const VersaMediaPlayer: React.FC<VersaMediaPlayerProps> = ({ onOpenVideoPopup }) => {
  const mediaRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const artUrlsRef = useRef<Set<string>>(new Set());
  const parsedIdsRef = useRef<Set<string>>(new Set());
  const isPlayingRef = useRef(false);
  const indexRef = useRef(0);

  const registerArtUrl = (u: string | undefined) => {
    if (u) artUrlsRef.current.add(u);
  };

  const revokeArtUrl = (u: string | undefined) => {
    if (u && artUrlsRef.current.has(u)) {
      URL.revokeObjectURL(u);
      artUrlsRef.current.delete(u);
    }
  };

  const [playlist, setPlaylist] = useState<PlaylistTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(readVersaMediaVolume);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [shuffle, setShuffle] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showVisualizer, setShowVisualizer] = useState(true);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [vfsMediaFiles, setVfsMediaFiles] = useState<VFSMediaFile[]>([]);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [visualizerStyle, setVisualizerStyle] = useState<VisualizerStyle>("bars");
  const [visualizerColor, setVisualizerColor] = useState<VisualizerColor>("blue");
  const [sortOrder, setSortOrder] = useState<"title" | "artist" | "album" | "date">("title");
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
  const [playlistManagerOpen, setPlaylistManagerOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  indexRef.current = currentIndex;
  isPlayingRef.current = isPlaying;

  const current = playlist[currentIndex] ?? null;
  const isVideo = current?.mediaType === "video";

  // Load VFS media files from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(VFS_MEDIA_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: VFSMediaFile[] = JSON.parse(stored);
        setVfsMediaFiles(parsed);
      } catch (e) {
        console.error("Failed to parse VFS media files", e);
      }
    }
  }, []);

  // Load user playlists from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    if (stored) {
      try {
        setUserPlaylists(JSON.parse(stored));
      } catch {
        setUserPlaylists([]);
      }
    }
  }, []);

  // Save VFS media files to localStorage
  const saveVfsMediaFiles = useCallback((files: VFSMediaFile[]) => {
    setVfsMediaFiles(files);
    localStorage.setItem(VFS_MEDIA_STORAGE_KEY, JSON.stringify(files));
  }, []);

  // Save user playlists to localStorage
  const saveUserPlaylists = useCallback((playlists: UserPlaylist[]) => {
    localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    setUserPlaylists(playlists);
  }, []);

  // Create new playlist
  const createPlaylist = (name: string) => {
    if (!name.trim()) return;
    const newPlaylist: UserPlaylist = {
      id: crypto.randomUUID(),
      name: name.trim(),
      tracks: [],
      createdAt: Date.now(),
    };
    saveUserPlaylists([...userPlaylists, newPlaylist]);
    setNewPlaylistName("");
  };

  // Delete playlist
  const deletePlaylist = (id: string) => {
    saveUserPlaylists(userPlaylists.filter((p) => p.id !== id));
    if (currentPlaylistId === id) setCurrentPlaylistId(null);
  };

  // Add current track to playlist
  const addToPlaylist = (playlistId: string) => {
    if (!current) return;
    saveUserPlaylists(
      userPlaylists.map((p) =>
        p.id === playlistId && !p.tracks.includes(current.id)
          ? { ...p, tracks: [...p.tracks, current.id] }
          : p
      )
    );
  };

  // Load playlist tracks into current playlist
  const loadPlaylist = (playlistId: string) => {
    const playlist = userPlaylists.find((p) => p.id === playlistId);
    if (!playlist) return;
    setCurrentPlaylistId(playlistId);
    const allTracks = [...buildBuiltinTracksFromScan(), ...vfsMediaFiles.map((f) => ({
      id: `vfs-${f.id}`,
      url: f.dataUrl,
      source: "vfs" as const,
      fileName: f.name,
      mediaType: f.type,
      vfsNodeId: f.id,
      title: f.metadata?.title,
      artist: f.metadata?.artist,
      album: f.metadata?.album,
      year: f.metadata?.year,
    }))];
    const playlistTracks = playlist.tracks
      .map((id) => allTracks.find((t) => t.id === id))
      .filter((t): t is PlaylistTrack => t !== undefined);
    setPlaylist(playlistTracks);
    if (playlistTracks.length > 0) setCurrentIndex(0);
  };

  // Sort playlist
  const sortPlaylist = (order: "title" | "artist" | "album" | "date") => {
    setSortOrder(order);
    setPlaylist((prev) => {
      const sorted = [...prev];
      sorted.sort((a, b) => {
        switch (order) {
          case "title":
            return (a.title || a.fileName).localeCompare(b.title || b.fileName);
          case "artist":
            return (a.artist || "").localeCompare(b.artist || "");
          case "album":
            return (a.album || "").localeCompare(b.album || "");
          case "date":
            return 0;
          default:
            return 0;
        }
      });
      return sorted;
    });
  };

  // Add VFS media files to playlist on mount
  useEffect(() => {
    const vfsTracks: PlaylistTrack[] = vfsMediaFiles.map((file) => ({
      id: `vfs-${file.id}`,
      url: file.dataUrl,
      source: "vfs",
      fileName: file.name,
      mediaType: file.type,
      vfsNodeId: file.id,
      title: file.metadata?.title,
      artist: file.metadata?.artist,
      album: file.metadata?.album,
      year: file.metadata?.year,
    }));

    setPlaylist((prev) => {
      const builtin = prev.filter((t) => t.source === "builtin");
      const user = prev.filter((t) => t.source === "user");
      return [...builtin, ...vfsTracks, ...user];
    });
  }, [vfsMediaFiles.length]);

  const mergeTrackMeta = useCallback((id: string, partial: Partial<PlaylistTrack>) => {
    setPlaylist((prev) =>
      prev.map((tr) => {
        if (tr.id !== id) return tr;
        const nextArt = partial.artUrl;
        if (nextArt && tr.artUrl && nextArt !== tr.artUrl) revokeArtUrl(tr.artUrl);
        if (nextArt) registerArtUrl(nextArt);
        return { ...tr, ...partial };
      })
    );
  }, []);

  const enrichTrack = useCallback(
    async (track: PlaylistTrack) => {
      if (parsedIdsRef.current.has(track.id)) return;
      if (track.mediaType === "audio") {
        const result = await loadTrackAudioMeta(track);
        if (result === null || !result.ok) return;
        parsedIdsRef.current.add(track.id);
        mergeTrackMeta(track.id, result.meta);
      }
    },
    [mergeTrackMeta]
  );

  useEffect(() => {
    const built = buildBuiltinTracksFromScan();
    setPlaylist((prev) => {
      const vfs = prev.filter((t) => t.source === "vfs");
      const user = prev.filter((t) => t.source === "user");
      const next = [...built, ...vfs, ...user];
      const prevCur = prev[indexRef.current];
      queueMicrotask(() => {
        if (prevCur) {
          const ni = next.findIndex((t) => t.id === prevCur.id);
          if (ni >= 0) setCurrentIndex(ni);
        } else if (next.length && indexRef.current >= next.length) {
          setCurrentIndex(0);
        }
      });
      return next;
    });
  }, [vfsMediaFiles.length]);

  useEffect(() => {
    if (!current) return;
    enrichTrack(current);
  }, [current?.id, current?.url, enrichTrack]);

  useEffect(() => {
    const a = mediaRef.current;
    if (!a || !current) return;
    a.volume = volume;
  }, [volume, current?.url]);

  useEffect(() => {
    writeVersaMediaVolume(volume);
  }, [volume]);

  useEffect(() => {
    const detail: VersaMediaPlayerStateDetail = {
      isPlaying,
      volume,
      hasTrack: !!current,
      nowPlayingArt: current ? current.artUrl || current.coverImageUrl || null : null,
    };
    window.dispatchEvent(new CustomEvent(VERSA_MEDIA_PLAYER_STATE_EVENT, { detail }));
  }, [isPlaying, volume, current?.id, current?.artUrl, current?.coverImageUrl]);

  useEffect(() => {
    const onSetVol = (e: Event) => {
      const v = (e as CustomEvent<{ volume: number }>).detail?.volume;
      if (typeof v === "number" && v >= 0 && v <= 1) setVolume(v);
    };
    window.addEventListener(VERSA_MEDIA_PLAYER_SET_VOLUME_EVENT, onSetVol);
    return () => window.removeEventListener(VERSA_MEDIA_PLAYER_SET_VOLUME_EVENT, onSetVol);
  }, []);

  useEffect(() => {
    const a = mediaRef.current;
    if (!a || !current) return;
    a.src = current.url;
    a.load();
    if (isPlayingRef.current) {
      a.play().catch(() => setIsPlaying(false));
    }
  }, [current?.url]);

  useEffect(() => {
    const a = mediaRef.current;
    if (!a) return;
    const syncPlaying = () => setIsPlaying(!a.paused && !a.ended);
    syncPlaying();
    a.addEventListener("play", syncPlaying);
    a.addEventListener("playing", syncPlaying);
    a.addEventListener("pause", syncPlaying);
    a.addEventListener("ended", syncPlaying);
    return () => {
      a.removeEventListener("play", syncPlaying);
      a.removeEventListener("playing", syncPlaying);
      a.removeEventListener("pause", syncPlaying);
      a.removeEventListener("ended", syncPlaying);
    };
  }, [current?.url]);

  useEffect(() => {
    return () => {
      artUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      artUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent(VERSA_MEDIA_PLAYER_STATE_EVENT, {
          detail: {
            isPlaying: false,
            volume: readVersaMediaVolume(),
            hasTrack: false,
            nowPlayingArt: null,
          },
        })
      );
    };
  }, []);

  // Handle video popup
  const handleVideoPlay = useCallback((track: PlaylistTrack) => {
    if (track.mediaType === "video" && onOpenVideoPopup) {
      onOpenVideoPopup(track.url, track.title || track.fileName);
      return true;
    }
    return false;
  }, [onOpenVideoPopup]);

  const togglePlay = () => {
    const a = mediaRef.current;
    if (!a || !current) return;
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
    } else {
      a.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const stopPlayback = () => {
    const a = mediaRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleMediaEnded = useCallback(() => {
    if (repeatMode === "one") {
      const a = mediaRef.current;
      if (a) {
        a.currentTime = 0;
        a.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
      return;
    }
    const plen = playlist.length;
    if (plen === 0) return;
    setCurrentIndex((ci) => {
      const atEnd = ci >= plen - 1;
      if (atEnd && repeatMode === "off") {
        queueMicrotask(() => setIsPlaying(false));
        return ci;
      }
      if (shuffle && plen > 1) {
        let j = ci;
        let g = 0;
        while (j === ci && g++ < 64) j = Math.floor(Math.random() * plen);
        queueMicrotask(() => setIsPlaying(true));
        return j;
      }
      if (shuffle && plen === 1) {
        queueMicrotask(() => {
          const a = mediaRef.current;
          if (a) {
            a.currentTime = 0;
            a.play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          }
        });
        return ci;
      }
      const next = (ci + 1) % plen;
      queueMicrotask(() => setIsPlaying(true));
      return next;
    });
  }, [repeatMode, shuffle, playlist.length]);

  const goNext = useCallback(() => {
    if (!playlist.length) return;
    const plen = playlist.length;
    if (shuffle && plen > 1) {
      setCurrentIndex((ci) => {
        let j = ci;
        let g = 0;
        while (j === ci && g++ < 64) j = Math.floor(Math.random() * plen);
        return j;
      });
    } else {
      setCurrentIndex((i) => {
        const atEnd = i >= plen - 1;
        if (atEnd && repeatMode === "off") {
          queueMicrotask(() => setIsPlaying(false));
          return i;
        }
        if (repeatMode === "one") {
          queueMicrotask(() => {
            const a = mediaRef.current;
            if (a) {
              a.currentTime = 0;
              a.play().catch(() => setIsPlaying(false));
            }
          });
          return i;
        }
        return (i + 1) % plen;
      });
    }
    setIsPlaying(true);
  }, [playlist.length, shuffle, repeatMode]);

  const goPrev = useCallback(() => {
    if (!playlist.length) return;
    setCurrentIndex((i) => (i - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  }, [playlist.length]);

  const handleFileUpload = async (files: FileList | null, saveToVfs: boolean = false) => {
    if (!files?.length) return;
    const added: PlaylistTrack[] = [];
    const newVfsFiles: VFSMediaFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!isMediaFile(file.name)) continue;

      const mediaType = getMediaTypeFromFileName(file.name);
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      const mimeType = mediaType === "video" ? "video/mp4" : "audio/mpeg";
      const dataUrl = `data:${mimeType};base64,${base64}`;
      const url = saveToVfs ? dataUrl : URL.createObjectURL(file);

      if (!saveToVfs) registerArtUrl(url);

      const id = saveToVfs ? `vfs-${crypto.randomUUID()}` : `user-${file.name}-${Date.now()}-${i}`;
      const track: PlaylistTrack = {
        id,
        url,
        source: saveToVfs ? "vfs" : "user",
        fileName: file.name,
        mediaType,
        vfsNodeId: saveToVfs ? id.replace("vfs-", "") : undefined,
      };

      // Extract metadata for audio files
      if (mediaType === "audio") {
        const tagResult = await readTagsFromBlob(file);
        if (tagResult.ok) {
          if (tagResult.meta.artUrl) registerArtUrl(tagResult.meta.artUrl);
          Object.assign(track, tagResult.meta);
        }
      }

      added.push(track);

      if (saveToVfs) {
        newVfsFiles.push({
          id: id.replace("vfs-", ""),
          name: file.name,
          type: mediaType,
          dataUrl,
          size: file.size,
          addedAt: Date.now(),
          metadata: {
            title: track.title,
            artist: track.artist,
            album: track.album,
            year: track.year,
          },
        });
      }
    }

    if (added.length) {
      if (saveToVfs && newVfsFiles.length) {
        saveVfsMediaFiles([...vfsMediaFiles, ...newVfsFiles]);
      }
      setPlaylist((prev) => {
        const next = [...prev, ...added];
        if (prev.length === 0) queueMicrotask(() => setCurrentIndex(0));
        return next;
      });
    }

    return added.length;
  };

  const onAddFiles = async (e: React.ChangeEvent<HTMLInputElement>, saveToVfs: boolean = false) => {
    await handleFileUpload(e.target.files, saveToVfs);
    e.target.value = "";
  };

  const triggerFileInput = (saveToVfs: boolean) => {
    fileInputRef.current?.click();
    // Store the saveToVfs flag for the onChange handler
    (fileInputRef.current as any).dataset.saveToVfs = String(saveToVfs);
  };

  const removeTrack = (id: string) => {
    const track = playlist.find((t) => t.id === id);
    if (!track) return;

    // Remove from VFS if applicable
    if (track.source === "vfs" && track.vfsNodeId) {
      const updatedVfs = vfsMediaFiles.filter((f) => f.id !== track.vfsNodeId);
      saveVfsMediaFiles(updatedVfs);
    }

    setPlaylist((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx < 0) return prev;
      const tr = prev[idx];
      revokeArtUrl(tr.artUrl);
      if (tr.url.startsWith("blob:")) URL.revokeObjectURL(tr.url);
      const next = prev.filter((t) => t.id !== id);
      setCurrentIndex((ci) => {
        if (next.length === 0) return 0;
        if (idx < ci) return ci - 1;
        if (idx === ci) return Math.min(ci, next.length - 1);
        return ci;
      });
      return next;
    });
  };

  const displayTitle = current?.title || current?.fileName.replace(/\.(mp3|mp4|webm|ogg|ogv|wav|aac|flac|m4a|wma|mov|mkv|avi)$/i, "") || "—";
  const displayArtist = current?.artist || (isVideo ? "Video File" : "Unknown artist");
  const displayAlbum = current?.album || "—";
  const displayYear = current?.year || "";

  // Menu handlers
  const menuItems = {
    file: [
      { label: "Open File...", action: () => fileInputRef.current?.click() },
      { label: "Add to Media Library...", action: () => fileInputRef.current?.click() },
      { label: "-", action: null },
      { label: "Media Library...", action: () => setMediaLibraryOpen(true) },
      { label: "Playlist Manager...", action: () => setPlaylistManagerOpen(true) },
      { label: "-", action: null },
      { label: "Exit", action: () => {} },
    ],
    view: [
      { label: "Playlist", action: () => setShowPlaylist(!showPlaylist), checked: showPlaylist },
      { label: "Visualizer", action: () => setShowVisualizer(!showVisualizer), checked: showVisualizer },
      { label: "Equalizer", action: () => setShowEqualizer(!showEqualizer), checked: showEqualizer },
      { label: "-", action: null },
      { label: "Visualizer Style", action: () => {
        const styles: VisualizerStyle[] = ["bars", "wave", "circle", "spectrum"];
        const idx = styles.indexOf(visualizerStyle);
        setVisualizerStyle(styles[(idx + 1) % styles.length]);
      }},
      { label: "Visualizer Color", action: () => {
        const colors: VisualizerColor[] = ["blue", "green", "red", "purple", "rainbow"];
        const idx = colors.indexOf(visualizerColor);
        setVisualizerColor(colors[(idx + 1) % colors.length]);
      }},
    ],
    play: [
      { label: "Play/Pause", action: togglePlay },
      { label: "Stop", action: stopPlayback },
      { label: "-", action: null },
      { label: "Previous", action: goPrev },
      { label: "Next", action: goNext },
      { label: "-", action: null },
      { label: "Shuffle", action: () => setShuffle(!shuffle), checked: shuffle },
      { label: "Repeat", action: () => setRepeatMode(repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off") },
    ],
    tools: [
      { label: "Sort by Title", action: () => sortPlaylist("title") },
      { label: "Sort by Artist", action: () => sortPlaylist("artist") },
      { label: "Sort by Album", action: () => sortPlaylist("album") },
    ],
  };

  return (
    <div className="flex flex-col h-full min-h-[480px] bg-[#1a1a1a] text-white font-sans select-none overflow-hidden">
      {/* Title Bar - Classic dark blue */}
      <div className="shrink-0 px-2 py-1 flex items-center justify-between text-xs font-bold bg-[#000080] border-b border-[#000040]">
        <div className="flex items-center gap-2">
          <Film size={14} className="text-white" />
          <span className="tracking-wide">VERSA Media Agent 2.0</span>
        </div>
        <span className="text-[10px] opacity-90 font-mono">Build 9611</span>
      </div>

      {/* Menu Bar - Dark gray */}
      <div className="shrink-0 px-1 py-0.5 flex items-center gap-4 text-xs bg-[#2a2a2a] border-b border-[#3a3a3a]">
        {Object.entries(menuItems).map(([key, items]) => (
          <div key={key} className="relative">
            <button
              className="px-2 py-0.5 hover:bg-[#4a4a4a] hover:text-white uppercase font-bold text-gray-300"
              onClick={() => setActiveMenu(activeMenu === key ? null : key)}
              onMouseEnter={() => activeMenu && setActiveMenu(key)}
            >
              {key}
            </button>
            {activeMenu === key && (
              <div
                className="absolute top-full left-0 mt-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 py-1 min-w-[160px] z-50 text-black"
                onMouseLeave={() => setActiveMenu(null)}
              >
                {items.map((item, idx) =>
                  item.label === "-" ? (
                    <div key={idx} className="border-t border-gray-400 my-1" />
                  ) : (
                    <button
                      key={idx}
                      className="w-full text-left px-3 py-1 text-xs hover:bg-[#000080] hover:text-white flex items-center justify-between"
                      onClick={() => {
                        item.action?.();
                        setActiveMenu(null);
                      }}
                    >
                      <span>{item.label}</span>
                      {item.checked && <Check size={12} />}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Black Video/Art Area */}
        <div className="flex-1 min-h-0 bg-black relative flex flex-col">
          {isVideo ? (
            /* Video - Show placeholder with "Open in Video Player" button */
            <div className="flex-1 flex flex-col items-center justify-center bg-black text-white p-4">
              <Film size={64} className="text-gray-600 mb-4" />
              <p className="text-sm mb-4">Video File</p>
              <button
                onClick={() => current && handleVideoPlay(current)}
                className="flex items-center gap-2 px-4 py-2 bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 hover:bg-[#d0d0d0]"
              >
                <ExternalLink size={16} />
                <span>Open in Video Player</span>
              </button>
            </div>
          ) : (
            /* Audio - Album Art / Visualizer Area */
            <div className="flex-1 flex flex-col p-2 gap-2">
              {/* Now Playing Info - Sunken border frame */}
              <div className="flex gap-2 p-2 bg-[#2a2a2a] border-2 border-t-gray-800 border-l-gray-800 border-b-gray-600 border-r-gray-600">
                <div className="w-20 h-20 shrink-0 bg-[#1a1a1a] border border-gray-600 flex items-center justify-center overflow-hidden">
                  {current?.artUrl || current?.coverImageUrl ? (
                    <img
                      src={current.artUrl || current.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Disc3 className="text-gray-600" size={32} />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 text-xs">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Now playing</div>
                  <div className="font-bold text-sm text-white truncate" title={displayTitle}>
                    {displayTitle}
                  </div>
                  <div className="text-gray-300 truncate">{displayArtist}</div>
                  <div className="text-gray-400 truncate">
                    {displayAlbum}
                    {displayYear ? ` · ${displayYear}` : ""}
                  </div>
                </div>
              </div>

              {/* Visualizer / Equalizer - Smaller height */}
              <div className="h-12 bg-[#1a1a1a] border-2 border-t-gray-800 border-l-gray-800 border-b-gray-600 border-r-gray-600 overflow-hidden">
                {showEqualizer ? (
                  <div className="h-full bg-[#2a2a2a] p-2">
                    <div className="text-[10px] font-bold text-gray-400 mb-1">Equalizer</div>
                    <EqualizerDisplay isPlaying={isPlaying} />
                  </div>
                ) : showVisualizer ? (
                  <div className="h-full bg-black flex items-center justify-center">
                    <AudioVisualizer isPlaying={isPlaying} style={visualizerStyle} color={visualizerColor} />
                  </div>
                ) : (
                  <div className="h-full bg-black flex items-center justify-center">
                    <div className="text-gray-600 text-xs">Visualizer Off</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audio element */}
          <audio
            ref={mediaRef}
            className="hidden"
            onTimeUpdate={() => setCurrentTime(mediaRef.current?.currentTime ?? 0)}
            onDurationChange={() => setDuration(mediaRef.current?.duration ?? 0)}
            onEnded={handleMediaEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>

        {/* Controls Section - Dark gray */}
        <div className="shrink-0 bg-[#2a2a2a] p-2 space-y-2 border-t border-[#3a3a3a]">
          {/* Transport Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              disabled={!playlist.length}
              className="p-1.5 bg-[#3a3a3a] text-white border border-gray-600 hover:bg-[#4a4a4a] disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous"
            >
              <SkipBack size={18} />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              disabled={!current}
              className="p-1.5 bg-[#3a3a3a] text-white border border-gray-600 hover:bg-[#4a4a4a] disabled:opacity-40 disabled:cursor-not-allowed"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              type="button"
              onClick={stopPlayback}
              disabled={!current}
              className="p-1.5 bg-[#3a3a3a] text-white border border-gray-600 hover:bg-[#4a4a4a] disabled:opacity-40 disabled:cursor-not-allowed"
              title="Stop"
            >
              <Square size={16} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!playlist.length}
              className="p-1.5 bg-[#3a3a3a] text-white border border-gray-600 hover:bg-[#4a4a4a] disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next"
            >
              <SkipForward size={18} />
            </button>

            <div className="w-px h-6 bg-gray-600 mx-1" />

            {/* Position Slider */}
            <div className="flex-1 flex items-center gap-2">
              <span className="text-[10px] font-mono w-12 text-right shrink-0 text-gray-300">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(ev) => {
                  const v = Number(ev.target.value);
                  const a = mediaRef.current;
                  if (a) {
                    a.currentTime = v;
                    setCurrentTime(v);
                  }
                }}
                className="flex-1 h-2 accent-[#000080]"
                disabled={!current || !duration}
              />
              <span className="text-[10px] font-mono w-12 shrink-0 text-gray-300">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Shuffle */}
              <button
                type="button"
                onClick={() => setShuffle((s) => !s)}
                disabled={!playlist.length}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold ${shuffle ? "bg-[#000080] text-white" : "bg-[#3a3a3a] text-gray-300 border border-gray-600"} hover:bg-[#4a4a4a] disabled:opacity-40 disabled:cursor-not-allowed`}
                title={shuffle ? "Shuffle on" : "Shuffle off"}
              >
                <Shuffle size={12} />
                <span>Shuffle</span>
              </button>

              {/* Repeat */}
              <button
                type="button"
                onClick={() => setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"))}
                disabled={!playlist.length}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold ${repeatMode !== "off" ? "bg-[#000080] text-white" : "bg-[#3a3a3a] text-gray-300 border border-gray-600"} hover:bg-[#4a4a4a] disabled:opacity-40 disabled:cursor-not-allowed`}
                title={repeatMode === "off" ? "Repeat: off" : repeatMode === "all" ? "Repeat: all" : "Repeat: one track"}
              >
                {repeatMode === "one" ? <Repeat1 size={12} /> : <Repeat size={12} />}
                <span>
                  {repeatMode === "off" ? "Repeat" : repeatMode === "all" ? "Repeat All" : "Repeat One"}
                </span>
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
                className="p-1 text-gray-300 hover:text-white"
                title={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <span className="text-[10px] w-12 text-gray-300">Volume</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-24 h-2 accent-[#000080]"
              />
            </div>
          </div>
        </div>

        {/* Playlist - Dark theme */}
        {showPlaylist && (
          <div className="shrink-0 flex flex-col bg-[#2a2a2a] min-h-[200px] max-h-[400px] border-t border-[#3a3a3a]">
            <div className="flex items-center justify-between px-2 py-1 border-b border-[#3a3a3a] bg-[#3a3a3a]">
              <div className="flex items-center gap-2">
                <ListMusic size={14} className="text-gray-300" />
                <span className="text-xs font-bold text-white">Playlist</span>
                <span className="text-[10px] text-gray-400">({playlist.length} items)</span>
                {currentPlaylistId && (
                  <span className="text-[10px] text-[#6699ff]">· {userPlaylists.find(p => p.id === currentPlaylistId)?.name}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPlaylistManagerOpen(true)}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#3a3a3a] text-gray-300 border border-gray-600 hover:bg-[#4a4a4a]"
                  title="Manage Playlists"
                >
                  <List size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => triggerFileInput(false)}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#3a3a3a] text-gray-300 border border-gray-600 hover:bg-[#4a4a4a]"
                >
                  <FolderOpen size={12} />
                  Add Files
                </button>
                <button
                  type="button"
                  onClick={() => triggerFileInput(true)}
                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#3a3a3a] text-gray-300 border border-gray-600 hover:bg-[#4a4a4a]"
                >
                  <FileVideo size={12} />
                  Save to Library
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*,.mp3,.mp4,.webm,.ogg,.ogv,.wav,.aac,.flac,.m4a,.wma,.mov,.mkv,.avi"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const saveToVfs = (e.target as any).dataset.saveToVfs === "true";
                    onAddFiles(e, saveToVfs);
                  }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-[#1a1a1a] m-1 border border-gray-700">
              {playlist.length === 0 ? (
                <div className="p-3 text-xs text-gray-400">
                  <p className="font-bold text-white mb-1">No media files.</p>
                  <p className="text-[10px] leading-relaxed">
                    Add audio (MP3, WAV, etc.) or video (MP4, WebM, etc.) files to play them.
                    Click &quot;Save to Library&quot; to persist files across sessions.
                  </p>
                </div>
              ) : (
                <table className="w-full text-[10px]">
                  <thead className="bg-[#3a3a3a] sticky top-0">
                    <tr className="border-b border-gray-600">
                      <th className="text-left px-2 py-1 font-bold w-8 text-gray-300">#</th>
                      <th className="text-left px-2 py-1 font-bold text-gray-300">Title</th>
                      <th className="text-left px-2 py-1 font-bold text-gray-300">Artist</th>
                      <th className="text-left px-2 py-1 font-bold text-gray-300">Type</th>
                      <th className="text-left px-2 py-1 font-bold text-gray-300">Source</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {playlist.map((tr, i) => {
                      const active = i === currentIndex;
                      const line = tr.title || tr.fileName.replace(/\.(mp3|mp4|webm|ogg|ogv|wav|aac|flac|m4a|wma|mov|mkv|avi)$/i, "");
                      return (
                        <tr
                          key={tr.id}
                          className={`border-b border-gray-700 cursor-pointer ${active ? "bg-[#000080] text-white" : "hover:bg-[#3a3a3a] text-gray-300"}`}
                          onClick={() => {
                            const track = playlist[i];
                            if (track.mediaType === "video") {
                              setCurrentIndex(i);
                              handleVideoPlay(track);
                            } else {
                              setCurrentIndex(i);
                              setIsPlaying(true);
                              setTimeout(() => mediaRef.current?.play().catch(() => setIsPlaying(false)), 0);
                            }
                          }}
                        >
                          <td className="px-2 py-1 text-center">{i + 1}</td>
                          <td className="px-2 py-1 truncate max-w-[150px]">
                            <div className="flex items-center gap-1">
                              {tr.mediaType === "video" ? <Film size={10} /> : <Music size={10} />}
                              <span className="truncate">{line}</span>
                            </div>
                          </td>
                          <td className="px-2 py-1 truncate max-w-[100px]">{tr.artist || "—"}</td>
                          <td className="px-2 py-1 capitalize">{tr.mediaType}</td>
                          <td className="px-2 py-1 capitalize">{tr.source}</td>
                          <td className="px-1">
                            {(tr.source === "user" || tr.source === "vfs") && (
                              <button
                                className={`p-0.5 ${active ? "text-white hover:text-red-300" : "text-gray-500 hover:text-red-700"}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTrack(tr.id);
                                }}
                              >
                                <X size={12} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Status Bar - Dark theme */}
        <div className="shrink-0 px-2 py-1 flex items-center justify-between text-[9px] text-gray-400 border-t border-[#3a3a3a] bg-[#2a2a2a]">
          <div className="flex items-center gap-4">
            <span>
              {current
                ? `${current.mediaType === "video" ? "Video" : "Audio"} · ${current.fileName}`
                : "Ready"}
            </span>
            {current && (
              <span className="text-[#6699ff]">
                {current.source === "vfs" ? "Library" : current.source === "builtin" ? "Built-in" : "Temporary"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>MPEG Layer-3 / H.264 / WebM</span>
            <span>Vespera Media System v2.0</span>
          </div>
        </div>
      </div>

      {/* Media Library Modal - Dark theme */}
      {mediaLibraryOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-[500px] max-h-[400px] flex flex-col">
            <div className="bg-[#000080] px-2 py-1 flex items-center justify-between text-xs font-bold text-white border-b border-[#000040]">
              <span>Media Library</span>
              <button onClick={() => setMediaLibraryOpen(false)} className="hover:bg-red-700 px-1">
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 p-3 overflow-auto">
              <h3 className="text-xs font-bold mb-2 text-white">Saved Media Files ({vfsMediaFiles.length})</h3>
              {vfsMediaFiles.length === 0 ? (
                <p className="text-xs text-gray-400">No files in library. Use &quot;Save to Library&quot; to add files.</p>
              ) : (
                <div className="space-y-1">
                  {vfsMediaFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-[#1a1a1a] border border-gray-700 text-xs">
                      <div className="flex items-center gap-2">
                        {file.type === "video" ? <Film size={14} className="text-gray-300" /> : <Music size={14} className="text-gray-300" />}
                        <span className="font-bold text-white">{file.name}</span>
                        <span className="text-gray-400">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        onClick={() => {
                          const updated = vfsMediaFiles.filter((f) => f.id !== file.id);
                          saveVfsMediaFiles(updated);
                          // Also remove from playlist
                          const trackId = `vfs-${file.id}`;
                          removeTrack(trackId);
                        }}
                        className="px-2 py-0.5 text-[10px] bg-[#3a3a3a] text-red-400 border border-gray-600 hover:bg-[#4a4a4a]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-2 border-t border-gray-600 flex justify-end gap-2">
              <button
                onClick={() => setMediaLibraryOpen(false)}
                className="px-4 py-1 text-xs font-bold bg-[#3a3a3a] text-white border border-gray-600 hover:bg-[#4a4a4a]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Manager Modal */}
      {playlistManagerOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 w-[500px] max-h-[500px] flex flex-col">
            <div className="bg-[#000080] px-2 py-1 flex items-center justify-between text-xs font-bold text-white border-b border-[#000040]">
              <span>Playlist Manager</span>
              <button onClick={() => setPlaylistManagerOpen(false)} className="hover:bg-red-700 px-1">
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 p-3 overflow-auto">
              {/* Create new playlist */}
              <div className="mb-4 p-2 bg-[#1a1a1a] border border-gray-700">
                <h3 className="text-xs font-bold mb-2 text-white">Create New Playlist</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Playlist name..."
                    className="flex-1 px-2 py-1 text-xs bg-[#3a3a3a] text-white border border-gray-600 focus:outline-none focus:border-[#6699ff]"
                    onKeyPress={(e) => e.key === "Enter" && createPlaylist(newPlaylistName)}
                  />
                  <button
                    onClick={() => createPlaylist(newPlaylistName)}
                    className="px-3 py-1 text-xs font-bold bg-[#3a3a3a] text-white border border-gray-600 hover:bg-[#4a4a4a]"
                  >
                    Create
                  </button>
                </div>
              </div>

              {/* Playlist list */}
              <h3 className="text-xs font-bold mb-2 text-white">Your Playlists ({userPlaylists.length})</h3>
              {userPlaylists.length === 0 ? (
                <p className="text-xs text-gray-400">No playlists yet. Create one above!</p>
              ) : (
                <div className="space-y-1">
                  {userPlaylists.map((pl) => (
                    <div key={pl.id} className="flex items-center justify-between p-2 bg-[#1a1a1a] border border-gray-700 text-xs">
                      <div className="flex-1">
                        <div className="font-bold text-white">{pl.name}</div>
                        <div className="text-gray-400">{pl.tracks.length} tracks</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => loadPlaylist(pl.id)}
                          className="px-2 py-0.5 text-[10px] bg-[#3a3a3a] text-white border border-gray-600 hover:bg-[#4a4a4a]"
                          title="Load Playlist"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deletePlaylist(pl.id)}
                          className="px-2 py-0.5 text-[10px] bg-[#3a3a3a] text-red-400 border border-gray-600 hover:bg-[#4a4a4a]"
                          title="Delete Playlist"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add current track to playlist */}
              {current && userPlaylists.length > 0 && (
                <div className="mt-4 p-2 bg-[#1a1a1a] border border-gray-700">
                  <h3 className="text-xs font-bold mb-2 text-white">Add Current Track to Playlist</h3>
                  <div className="text-gray-400 text-[10px] mb-2 truncate">{displayTitle}</div>
                  <select
                    onChange={(e) => addToPlaylist(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-[#3a3a3a] text-white border border-gray-600 focus:outline-none focus:border-[#6699ff]"
                  >
                    <option value="">Select playlist...</option>
                    {userPlaylists.map((pl) => (
                      <option key={pl.id} value={pl.id}>{pl.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="p-2 border-t border-gray-600 flex justify-end gap-2">
              <button
                onClick={() => setPlaylistManagerOpen(false)}
                className="px-4 py-1 text-xs font-bold bg-[#3a3a3a] text-white border border-gray-600 hover:bg-[#4a4a4a]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
