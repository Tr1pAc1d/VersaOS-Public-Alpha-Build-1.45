import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Square, Maximize2, Minimize2, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";

interface VideoPlayerPopupProps {
  onClose: () => void;
  videoUrl?: string;
  videoTitle?: string;
}

const win9x = {
  raised: "border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800",
  sunken: "border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white",
  button: "bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 active:border-t-gray-800 active:border-l-gray-800 active:border-b-white active:border-r-white",
  titleBar: "bg-[#000080] text-white",
};

export const VideoPlayerPopup: React.FC<VideoPlayerPopupProps> = ({ onClose, videoUrl: propVideoUrl, videoTitle: propVideoTitle }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(propVideoUrl || null);
  const [videoTitle, setVideoTitle] = useState<string>(propVideoTitle || "Video Player");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update video URL when prop changes
  useEffect(() => {
    if (propVideoUrl) {
      setVideoUrl(propVideoUrl);
    }
    if (propVideoTitle) {
      setVideoTitle(propVideoTitle);
    }
  }, [propVideoUrl, propVideoTitle]);

  // Handle fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Video controls timeout (hide controls after inactivity)
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
    } else {
      v.play().catch(() => {});
    }
  }, [isPlaying]);

  const stopPlayback = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setIsPlaying(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const formatTime = (sec: number): string => {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden">
      {/* Video Container */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-black flex items-center justify-center"
        onMouseMove={showControlsTemporarily}
        onClick={showControlsTemporarily}
      >
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="max-w-full max-h-full"
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
            onDurationChange={() => setDuration(videoRef.current?.duration ?? 0)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            autoPlay
          />
        ) : (
          <div className="text-gray-500 text-sm">No video loaded</div>
        )}

        {/* Overlay Controls */}
        {showControls && videoUrl && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none">
            {/* Top bar with title */}
            <div className="absolute top-0 left-0 right-0 p-2 flex items-center justify-between pointer-events-auto">
              <span className="text-white text-sm font-bold truncate">{videoTitle}</span>
            </div>

            {/* Center play button (when paused) */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors pointer-events-auto"
              >
                <Play size={32} className="text-white ml-1" />
              </button>
            )}

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-auto">
              <div className={`bg-[#c0c0c0] ${win9x.raised} p-2 space-y-2`}>
                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono w-12 text-right">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={Math.min(currentTime, duration || 0)}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (videoRef.current) {
                        videoRef.current.currentTime = v;
                        setCurrentTime(v);
                      }
                    }}
                    className="flex-1 h-2 accent-[#000080]"
                  />
                  <span className="text-[10px] font-mono w-12">{formatTime(duration)}</span>
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button onClick={togglePlay} className={`p-1.5 ${win9x.button}`} title={isPlaying ? "Pause" : "Play"}>
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button onClick={stopPlayback} className={`p-1.5 ${win9x.button}`} title="Stop">
                      <Square size={16} />
                    </button>
                    <div className="w-px h-6 bg-gray-500 mx-1" />
                    <button
                      onClick={() => {
                        if (videoRef.current) videoRef.current.currentTime -= 10;
                      }}
                      className={`p-1.5 ${win9x.button}`}
                      title="Rewind 10s"
                    >
                      <SkipBack size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (videoRef.current) videoRef.current.currentTime += 10;
                      }}
                      className={`p-1.5 ${win9x.button}`}
                      title="Forward 10s"
                    >
                      <SkipForward size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Volume */}
                    <button
                      onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
                      className="p-1"
                      title={volume === 0 ? "Unmute" : "Mute"}
                    >
                      {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={volume}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setVolume(v);
                        if (videoRef.current) videoRef.current.volume = v;
                      }}
                      className="w-20 h-2 accent-[#000080]"
                    />

                    <div className="w-px h-6 bg-gray-500 mx-1" />

                    {/* Fullscreen */}
                    <button onClick={toggleFullscreen} className={`p-1.5 ${win9x.button}`} title="Fullscreen">
                      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerPopup;
