import React, { useCallback, useEffect, useRef, useState } from "react";
import jsmediatags from "jsmediatags";
import { Disc3, FolderOpen, SkipBack, SkipForward, Square, Play, Pause, Shuffle, Repeat, Repeat1 } from "lucide-react";
import { MEDIA_PLAYER_LIBRARY } from "virtual:media-player-library";
import {
  readVersaMediaVolume,
  writeVersaMediaVolume,
  VERSA_MEDIA_PLAYER_SET_VOLUME_EVENT,
  VERSA_MEDIA_PLAYER_STATE_EVENT,
  type VersaMediaPlayerStateDetail,
} from "../utils/mediaPlayerBridge";

export type PlaylistSource = "builtin" | "user";

export interface PlaylistTrack {
  id: string;
  url: string;
  source: PlaylistSource;
  fileName: string;
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  /** Embedded ID3 picture (blob URL — revoked on cleanup) */
  artUrl?: string;
  /** Static cover next to the MP3 in public/MediaPlayer/Music (or folder cover.jpg / album.jpg) */
  coverImageUrl?: string;
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
    const blob = new Blob([bytes], { type: format });
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
    if (track.url.startsWith("blob:")) {
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
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildBuiltinTracksFromScan(): PlaylistTrack[] {
  return MEDIA_PLAYER_LIBRARY.tracks.map(({ file, cover }) => ({
    id: `builtin-${file}`,
    url: `/MediaPlayer/Music/${encodeURIComponent(file)}`,
    source: "builtin" as const,
    fileName: file,
    coverImageUrl: cover ? `/MediaPlayer/Music/${encodeURIComponent(cover)}` : undefined,
  }));
}

export const VersaMediaPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
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

  indexRef.current = currentIndex;
  isPlayingRef.current = isPlaying;

  const current = playlist[currentIndex] ?? null;

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
      const result = await loadTrackAudioMeta(track);
      if (result === null || !result.ok) return;
      parsedIdsRef.current.add(track.id);
      mergeTrackMeta(track.id, result.meta);
    },
    [mergeTrackMeta]
  );

  useEffect(() => {
    const built = buildBuiltinTracksFromScan();
    setPlaylist((prev) => {
      const user = prev.filter((t) => t.source === "user");
      const next = [...built, ...user];
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
  }, []);

  useEffect(() => {
    if (!current) return;
    enrichTrack(current);
  }, [current?.id, current?.url, enrichTrack]);

  useEffect(() => {
    const a = audioRef.current;
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
    const a = audioRef.current;
    if (!a || !current) return;
    a.src = current.url;
    a.load();
    if (isPlayingRef.current) {
      a.play().catch(() => setIsPlaying(false));
    }
  }, [current?.url]);

  useEffect(() => {
    const a = audioRef.current;
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

  const togglePlay = () => {
    const a = audioRef.current;
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
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAudioEnded = useCallback(() => {
    if (repeatMode === "one") {
      const a = audioRef.current;
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
          const a = audioRef.current;
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
    if (shuffle && playlist.length > 1) {
      setCurrentIndex((ci) => {
        let j = ci;
        let g = 0;
        while (j === ci && g++ < 64) j = Math.floor(Math.random() * playlist.length);
        return j;
      });
    } else {
      setCurrentIndex((i) => (i + 1) % playlist.length);
    }
    setIsPlaying(true);
  }, [playlist.length, shuffle]);

  const goPrev = useCallback(() => {
    if (!playlist.length) return;
    setCurrentIndex((i) => (i - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  }, [playlist.length]);

  const onAddFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const added: PlaylistTrack[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith(".mp3")) continue;
      const url = URL.createObjectURL(file);
      registerArtUrl(url);
      const id = `user-${file.name}-${Date.now()}-${i}`;
      const track: PlaylistTrack = {
        id,
        url,
        source: "user",
        fileName: file.name,
      };
      const tagResult = await readTagsFromBlob(file);
      const meta = tagResult.ok ? tagResult.meta : {};
      if (meta.artUrl) registerArtUrl(meta.artUrl);
      added.push({ ...track, ...meta });
    }
    if (!added.length) {
      e.target.value = "";
      return;
    }
    setPlaylist((prev) => {
      const next = [...prev, ...added];
      if (prev.length === 0) queueMicrotask(() => setCurrentIndex(0));
      return next;
    });
    e.target.value = "";
  };

  const removeUserTrack = (id: string) => {
    setPlaylist((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx < 0) return prev;
      const tr = prev[idx];
      if (tr.source !== "user") return prev;
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

  const displayTitle = current?.title || current?.fileName.replace(/\.mp3$/i, "") || "—";
  const displayArtist = current?.artist || "Unknown artist";
  const displayAlbum = current?.album || "—";
  const displayYear = current?.year || "";

  return (
    <div className="flex flex-col h-full min-h-[420px] bg-[#2b0038] text-black font-sans select-none">
      <div
        className="shrink-0 px-2 py-1.5 flex items-center justify-between text-white text-xs font-bold border-b-2 border-black"
        style={{
          background: "linear-gradient(180deg, #4a0a5c 0%, #2a0635 45%, #1a0420 100%)",
          textShadow: "1px 1px 0 #000",
        }}
      >
        <span className="tracking-wide">VERSA™ Media Agent 2.0</span>
        <span className="text-[10px] opacity-90 font-mono">Build 9611</span>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-[#c0c0c0] border-t-2 border-white">
        <div className="p-2 flex gap-3 border-b border-gray-500">
          <div
            className="w-[132px] h-[132px] shrink-0 border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white bg-[#1a1a1a] flex items-center justify-center overflow-hidden"
            style={{ boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.5)" }}
          >
            {current?.artUrl || current?.coverImageUrl ? (
              <img
                key={`${current.id}-${current.artUrl ?? ""}-${current.coverImageUrl ?? ""}`}
                src={current.artUrl || current.coverImageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Disc3 className="text-teal-600/80" size={56} strokeWidth={1.25} />
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 text-xs">
            <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Now playing</div>
            <div className="font-bold text-sm text-black truncate" title={displayTitle}>
              {displayTitle}
            </div>
            <div className="text-gray-800 truncate">{displayArtist}</div>
            <div className="text-gray-700 truncate">
              {displayAlbum}
              {displayYear ? ` · ${displayYear}` : ""}
            </div>
          </div>
        </div>

        <div className="px-2 py-2 space-y-2 border-b border-gray-500 bg-[#b8b8b8]">
          <audio
            ref={audioRef}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
            onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
            onEnded={handleAudioEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goPrev}
              disabled={!playlist.length}
              className="p-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 disabled:opacity-40 active:border-t-gray-800"
              title="Previous"
            >
              <SkipBack size={18} className="text-black" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              disabled={!current}
              className="p-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 disabled:opacity-40 active:border-t-gray-800"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} className="text-black" /> : <Play size={18} className="text-black" />}
            </button>
            <button
              type="button"
              onClick={stopPlayback}
              disabled={!current}
              className="p-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 disabled:opacity-40 active:border-t-gray-800"
              title="Stop"
            >
              <Square size={16} className="text-black" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!playlist.length}
              className="p-1.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 disabled:opacity-40 active:border-t-gray-800"
              title="Next"
            >
              <SkipForward size={18} className="text-black" />
            </button>
            <div className="flex-1 flex items-center gap-2 ml-1">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(ev) => {
                  const v = Number(ev.target.value);
                  const a = audioRef.current;
                  if (a) {
                    a.currentTime = v;
                    setCurrentTime(v);
                  }
                }}
                className="flex-1 h-1 accent-teal-700"
                disabled={!current || !duration}
              />
              <span className="text-[10px] font-mono w-[72px] text-right shrink-0">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="w-12">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1 accent-teal-700"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setShuffle((s) => !s)}
              disabled={!playlist.length}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 disabled:opacity-40 ${
                shuffle ? "bg-[#000080] text-white" : "bg-[#c0c0c0] text-black"
              }`}
              title={shuffle ? "Shuffle on" : "Shuffle off"}
            >
              <Shuffle size={14} />
              Shuffle
            </button>
            <button
              type="button"
              onClick={() => setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"))}
              disabled={!playlist.length}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 disabled:opacity-40 ${
                repeatMode !== "off" ? "bg-[#000080] text-white" : "bg-[#c0c0c0] text-black"
              }`}
              title={
                repeatMode === "off"
                  ? "Repeat: off"
                  : repeatMode === "all"
                    ? "Repeat: all"
                    : "Repeat: one track"
              }
            >
              {repeatMode === "one" ? <Repeat1 size={14} /> : <Repeat size={14} />}
              {repeatMode === "off" ? "Repeat" : repeatMode === "all" ? "Repeat all" : "Repeat one"}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col bg-[#c0c0c0]">
          <div className="flex items-center justify-between px-2 py-1 border-b border-gray-500 bg-[#a8a8a8]">
            <span className="text-xs font-bold">Playlist</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800"
            >
              <FolderOpen size={14} />
              Add files…
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mpeg,audio/mp3,.mp3"
              multiple
              className="hidden"
              onChange={onAddFiles}
            />
          </div>
          <div className="flex-1 overflow-y-auto border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white m-1 bg-white">
            {playlist.length === 0 ? (
              <div className="p-3 text-xs text-gray-600 leading-relaxed">
                <p className="font-bold text-black mb-1">No tracks yet.</p>
                <p>
                  Put MP3s in <span className="font-mono">public/MediaPlayer/Music</span>. Optional cover: same base
                  name as the MP3 with <span className="font-mono">.jpg</span> / <span className="font-mono">.png</span>,
                  or a folder image <span className="font-mono">cover.jpg</span> / <span className="font-mono">album.jpg</span>.
                  The dev server reloads when that folder changes; production lists are fixed at build time.
                </p>
                <p className="mt-2">
                  You can also use <span className="font-mono">Add files…</span> for one-off local tracks.
                </p>
              </div>
            ) : (
              <ul className="text-xs">
                {playlist.map((tr, i) => {
                  const active = i === currentIndex;
                  const line = tr.title || tr.fileName.replace(/\.mp3$/i, "");
                  const sub = [tr.artist, tr.album].filter(Boolean).join(" · ");
                  return (
                    <li
                      key={tr.id}
                      className={`flex items-stretch border-b border-gray-200 ${active ? "bg-[#000080] text-white" : "hover:bg-gray-100"}`}
                    >
                      <button
                        type="button"
                        className={`flex-1 text-left px-2 py-1.5 min-w-0 ${active ? "" : "text-black"}`}
                        onClick={() => {
                          setCurrentIndex(i);
                          setIsPlaying(true);
                          setTimeout(() => audioRef.current?.play().catch(() => setIsPlaying(false)), 0);
                        }}
                      >
                        <div className="font-bold truncate">{line}</div>
                        {sub && <div className={`truncate text-[10px] ${active ? "text-blue-200" : "text-gray-600"}`}>{sub}</div>}
                      </button>
                      {tr.source === "user" && (
                        <button
                          type="button"
                          className={`px-2 text-[10px] font-bold shrink-0 ${active ? "text-blue-200 hover:text-white" : "text-gray-500 hover:text-red-700"}`}
                          onClick={() => removeUserTrack(tr.id)}
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="px-2 py-1 text-[9px] text-gray-700 border-t border-gray-500 bg-[#b8b8b8]">
          MPEG Layer-3 decoder · ID3v1 / ID3v2 · Vespera Sound System compatible
        </div>
      </div>
    </div>
  );
};
