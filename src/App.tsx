import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function App() {
  const [hoverName, setHoverName] = useState(false);
  const [typedName, setTypedName] = useState("sup, im tpm");
  const [status, setStatus] = useState("offline");
  const [lanyard, setLanyard] = useState<any>(null);
  const [now, setNow] = useState(Date.now());
  const [page, setPage] = useState("home");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredProject, setHoveredProject] = useState<any>(null);
  const [booting, setBooting] = useState(true);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);
  const [playerVolume, setPlayerVolume] = useState(0.35);
  const [autoplayMuted, setAutoplayMuted] = useState(true);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(
    Array.from({ length: 20 }, () => 0.14),
  );

  const backgroundTracks = [
    {
      title: "Dancing with your eyes closed",
      artist: "Jane Remover",
      src: "/music/dancing-with-your-eyes-closed-jane-remover.mp3",
      cover: "/music/dancing-with-your-eyes-closed-jane-remover.png",
    },
    {
      title: "Take a chance",
      artist: "LynU",
      src: "/music/take-a-chance-lynu.mp3",
      cover: "/music/take-a-chance-lynu.jpg",
    },
  ];

  const currentBackgroundTrack = backgroundTracks[currentTrackIndex];

  const projectItems = [
    {
      title: "kuudere.cc",
      desc: "my digital paradise. a passion project for me and my friends, built as a home beyond bio links.",
      link: "https://kuudere.cc",
      panelTitle: "kuudere.cc",
      panelText:
        "kuudere.cc is my digital paradise, built as a personal space for me and my friends to exist online without the limits of typical bio link pages. it is a passion project centered around identity, creativity, and having a place that feels more alive, personal, and ours.",
      panelMeta: "status: active",
    },
    {
      title: "kobeni.net",
      desc: "a exclusive invite only bio link service | ON HOLD",
      link: "#",
      panelTitle: "kobeni.net",
      panelText:
        "exclusive invite-only bio link service that was meant to be a cleaner, more private take on bio pages. founded by tpm, mke, arturiafm, and lennie.",
      panelMeta: "status: on hold",
    },
    {
      title: "yotsuba.cc",
      desc: "the older version of this site. | made by mke.",
      link: "#",
      panelTitle: "yotsuba.cc",
      panelText:
        "older version of this site, built around a minimal dark layout and personal web aesthetic. it had the early look, structure, and overall feel that helped shape what this site turned into later on.",
      panelMeta: "credit: mke",
    },
    {
      title: "Luck Software",
      desc: "a old cheat company i founded that sold FN, Valorant, and Apex cheats.",
      link: "#",
      panelTitle: "Luck Software",
      panelText:
        "old cheat company i founded, sold fn, valorant, and apex cheats. i handled sales, marketing, invoices, and most of the client side too.",
      panelMeta: "era: archived",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const lines = [
      "booting portfolio.sys",
      "loading user profile... ok",
      "syncing lanyard presence... ok",
      "mounting archive... ok",
      "rendering interface... ok",
      "welcome back, tpm",
    ];

    const timers: number[] = [];

    lines.forEach((line, index) => {
      timers.push(
        window.setTimeout(() => {
          setBootLines((prev) => [...prev, line]);
        }, 180 + index * 220),
      );
    });

    timers.push(
      window.setTimeout(() => {
        setBooting(false);
      }, 180 + lines.length * 220 + 300),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchStatus = () => {
      fetch("https://api.lanyard.rest/v1/users/1177326138926837884")
        .then((res) => res.json())
        .then((data) => {
          if (!data?.data) return;
          setStatus(data.data.discord_status || "offline");
          setLanyard(data.data);
        })
        .catch(() => setStatus("offline"));
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const target = hoverName ? "sup, im yearn" : "sup, im tpm";
    let eraseTimer: number | null = null;
    let typeTimer: number | null = null;

    const erase = () => {
      setTypedName((prev) => {
        if (prev.length > 0) {
          eraseTimer = window.setTimeout(erase, 25);
          return prev.slice(0, -1);
        }

        let i = 0;
        const type = () => {
          setTypedName(target.slice(0, i + 1));
          i += 1;
          if (i < target.length) {
            typeTimer = window.setTimeout(type, 40);
          }
        };

        typeTimer = window.setTimeout(type, 40);
        return "";
      });
    };

    eraseTimer = window.setTimeout(erase, 25);

    return () => {
      if (eraseTimer) window.clearTimeout(eraseTimer);
      if (typeTimer) window.clearTimeout(typeTimer);
    };
  }, [hoverName]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = playerVolume;
  }, [playerVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = autoplayMuted;
  }, [autoplayMuted]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setPlayerDuration(audio.duration || 0);
    const onTimeUpdate = () => setPlayerProgress(audio.currentTime || 0);
    const onEnded = () => {
      setCurrentTrackIndex((prev) => (prev + 1) % backgroundTracks.length);
      setIsPlaying(true);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [backgroundTracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    setPlayerProgress(0);

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      initializeVisualizer();
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setVisualizerBars((prev) => prev.map(() => 0.14));
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) return;

    const resumePlayback = () => {
      setAutoplayMuted(false);
      setIsPlaying(true);
    };

    window.addEventListener("pointerdown", resumePlayback, { once: true });
    window.addEventListener("keydown", resumePlayback, { once: true });

    return () => {
      window.removeEventListener("pointerdown", resumePlayback);
      window.removeEventListener("keydown", resumePlayback);
    };
  }, [isPlaying]);

  const statusColor =
    {
      online: "text-green-500",
      idle: "text-yellow-400",
      offline: "text-red-500",
    }[status] || "text-red-500";

  const avatar = lanyard?.discord_user
    ? `https://cdn.discordapp.com/avatars/${lanyard.discord_user.id}/${lanyard.discord_user.avatar}.png`
    : null;

  const customStatus = lanyard?.activities?.find((a: any) => a.type === 4);
  const activity = lanyard?.activities?.find((a: any) => a.type === 0);
  const spotify = lanyard?.spotify;

  const getActivityAssetUrl = (applicationId?: string, image?: string) => {
    if (!image) return null;
    if (image.startsWith("mp:external/")) {
      return `https://media.discordapp.net/external/${image.replace("mp:external/", "")}`;
    }
    if (!applicationId) return null;
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`;
  };

  const activityLargeImage = getActivityAssetUrl(
    activity?.application_id,
    activity?.assets?.large_image,
  );
  const activitySmallImage = getActivityAssetUrl(
    activity?.application_id,
    activity?.assets?.small_image,
  );

  const { progress, current, duration } = useMemo(() => {
    if (!spotify?.timestamps?.start || !spotify?.timestamps?.end) {
      return { progress: 0, current: 0, duration: 0 };
    }

    const start = spotify.timestamps.start;
    const end = spotify.timestamps.end;
    const total = Math.max(end - start, 0);
    const elapsed = Math.max(0, Math.min(now - start, total));

    return {
      progress: total > 0 ? (elapsed / total) * 100 : 0,
      current: elapsed,
      duration: total,
    };
  }, [spotify, now]);

  const format = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatPlayerSeconds = (secondsValue: number) => {
    const totalSeconds = Math.max(0, Math.floor(secondsValue));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const animateVisualizer = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const data = new Uint8Array(analyser.frequencyBinCount);

    const renderFrame = () => {
      const audio = audioRef.current;
      if (!audio) return;

      analyser.getByteFrequencyData(data);

      const bars = Array.from({ length: 20 }, (_, index) => {
        const bucketSize = Math.max(1, Math.floor(data.length / 20));
        const start = index * bucketSize;
        const end = Math.min(data.length, start + bucketSize);
        let total = 0;

        for (let i = start; i < end; i += 1) {
          total += data[i];
        }

        const average = end > start ? total / (end - start) : 0;
        const normalized = average / 255;
        return audio.paused ? 0.14 : Math.max(0.14, normalized);
      });

      setVisualizerBars(bars);
      animationFrameRef.current = window.requestAnimationFrame(renderFrame);
    };

    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    renderFrame();
  };

  const initializeVisualizer = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    const AudioContextCtor = window.AudioContext || (window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    }).webkitAudioContext;

    if (!AudioContextCtor) return;

    if (!audioContextRef.current) {
      const context = new AudioContextCtor();
      const analyser = context.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.82;

      const sourceNode = context.createMediaElementSource(audio);
      sourceNode.connect(analyser);
      analyser.connect(context.destination);

      audioContextRef.current = context;
      analyserRef.current = analyser;
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume().catch(() => undefined);
    }

    animateVisualizer();
  };

  const attemptAutoplay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.muted = autoplayMuted;
      initializeVisualizer();
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleBackgroundPlayer = () => {
    setIsPlaying((prev) => !prev);
  };

  const nextBackgroundTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % backgroundTracks.length);
    setIsPlaying(true);
  };

  const prevBackgroundTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + backgroundTracks.length) % backgroundTracks.length);
    setIsPlaying(true);
  };

  const titleClass = (title: string) => {
    if (title === "kuudere.cc") {
      return "rgb-text inline-block";
    }
    if (title === "kobeni.net") {
      return "text-red-400 inline-block [text-shadow:0_0_16px_rgba(248,113,113,0.95),0_0_30px_rgba(248,113,113,0.45)]";
    }
    if (title === "yotsuba.cc") {
      return "text-emerald-300 inline-block [text-shadow:0_0_16px_rgba(110,231,183,0.95),0_0_30px_rgba(110,231,183,0.45)]";
    }
    if (title === "Luck Software") {
      return "text-violet-300 inline-block [text-shadow:0_0_16px_rgba(196,181,253,0.95),0_0_30px_rgba(196,181,253,0.45)]";
    }
    return "text-white";
  };

  const renderProjectMeta = (title: string, meta: string) => {
    if (title === "kuudere.cc" && meta === "status: active") {
      return (
        <>
          status:{" "}
          <span className="text-emerald-300 [text-shadow:0_0_10px_rgba(110,231,183,0.85),0_0_18px_rgba(110,231,183,0.45)]">
            active
          </span>
        </>
      );
    }

    return meta;
  };

  useEffect(() => {
    if (booting) return;
    attemptAutoplay();
  }, [booting, currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const retryAutoplay = () => {
      attemptAutoplay();
    };

    const retryWhenVisible = () => {
      if (document.visibilityState === "visible") {
        attemptAutoplay();
      }
    };

    audio.addEventListener("loadeddata", retryAutoplay);
    audio.addEventListener("canplay", retryAutoplay);
    window.addEventListener("pageshow", retryAutoplay);
    document.addEventListener("visibilitychange", retryWhenVisible);

    return () => {
      audio.removeEventListener("loadeddata", retryAutoplay);
      audio.removeEventListener("canplay", retryAutoplay);
      window.removeEventListener("pageshow", retryAutoplay);
      document.removeEventListener("visibilitychange", retryWhenVisible);
    };
  }, [booting, currentTrackIndex]);

  return (
    <>
      <style>{`
        @keyframes rgbshift {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        .rgb-text {
          background: linear-gradient(90deg, #ff4d4d, #ffd24d, #4dff88, #4dd2ff, #b84dff, #ff4db8, #ff4d4d);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: rgbshift 3s linear infinite;
          filter: drop-shadow(0 0 10px rgba(255, 120, 210, 0.28))
            drop-shadow(0 0 18px rgba(120, 210, 255, 0.2));
        }
        .hide-native-cursor,
        .hide-native-cursor * {
          cursor: none !important;
        }
        .crosshair-cursor {
          position: fixed;
          left: 0;
          top: 0;
          width: 16px;
          height: 16px;
          pointer-events: none;
          z-index: 100;
        }
        .crosshair-cursor::before,
        .crosshair-cursor::after {
          content: "";
          position: absolute;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 0 4px rgba(255,255,255,0.18);
        }
        .crosshair-cursor::before {
          left: 50%;
          top: 0;
          width: 1px;
          height: 100%;
          transform: translateX(-50%);
        }
        .crosshair-cursor::after {
          top: 50%;
          left: 0;
          width: 100%;
          height: 1px;
          transform: translateY(-50%);
        }
        .crosshair-center {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 2px;
          height: 2px;
          border: 1px solid rgba(255,255,255,0.9);
          background: transparent;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 4px rgba(255,255,255,0.12);
        }
        @keyframes bootflicker {
          0%, 100% { opacity: 1; }
          8% { opacity: 0.92; }
          12% { opacity: 1; }
          52% { opacity: 0.96; }
          56% { opacity: 1; }
        }
        .boot-screen {
          animation: bootflicker 1.4s linear infinite;
        }
      `}</style>

      <div className="min-h-screen bg-[#121212] text-gray-200 font-mono relative overflow-hidden hide-native-cursor">
        <div
          className="crosshair-cursor"
          style={{ transform: `translate(${mousePosition.x - 8}px, ${mousePosition.y - 8}px)` }}
        >
          <div className="crosshair-center" />
        </div>

        <AnimatePresence>
          {booting && (
            <motion.div
              key="boot"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="absolute inset-0 z-40 bg-[#121212] border-b border-zinc-900 boot-screen"
            >
              <div className="max-w-6xl mx-auto p-6 h-full flex items-center">
                <div className="w-full border border-zinc-800 bg-black/20 p-6 text-sm text-green-400">
                  <div className="mb-4 text-zinc-500">[boot@tpm ~]$ startup</div>
                  <div className="space-y-2 min-h-[180px]">
                    {bootLines.map((line, index) => (
                      <motion.p
                        key={`${line}-${index}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.12 }}
                      >
                        <span className="text-zinc-500 mr-2">&gt;</span>
                        {line}
                      </motion.p>
                    ))}
                    <div className="text-green-400 animate-pulse">▌</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: booting ? 0 : 1, y: booting ? 12 : 0, scale: booting ? 0.99 : 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <audio ref={audioRef} preload="auto" autoPlay playsInline>
            <source src={currentBackgroundTrack.src} type="audio/mpeg" />
          </audio>

          <div className="max-w-6xl mx-auto p-6 relative z-10">
            <div className="flex items-end justify-between border-b border-zinc-800 pb-3 mb-6 text-sm gap-4">
              <div>
                <span className="text-white">tpm</span>
                <span className={status === "online" ? " rgb-text" : ` ${statusColor}`}>
                  {status === "online" ? " - online" : ` - ${status}`}
                </span>
              </div>

              <div className="text-right self-end">
                <div className="mb-2 flex justify-end gap-2 text-xs">
                  <button
                    onClick={() => setPage("home")}
                    className={`border px-2 py-1 transition-colors ${
                      page === "home"
                        ? "border-zinc-600 text-white bg-zinc-900"
                        : "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                  >
                    home
                  </button>
                  <button
                    onClick={() => setPage("archive")}
                    className={`border px-2 py-1 transition-colors ${
                      page === "archive"
                        ? "border-zinc-600 text-white bg-zinc-900"
                        : "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                  >
                    archive
                  </button>
                </div>

                <div className="text-green-400">
                  <span className="text-zinc-500">[tpm@local ~]$</span>{" "}
                  {new Date(now).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                  <span className="ml-1 animate-pulse">▌</span>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {page === "home" ? (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-6">
                      <div
                        className="border border-zinc-800 p-4"
                        onMouseEnter={() => setHoverName(true)}
                        onMouseLeave={() => setHoverName(false)}
                      >
                        <div className="flex gap-4 items-center mb-3">
                          {avatar && (
                            <img
                              src={avatar}
                              alt="Discord avatar"
                              className="w-16 h-16 border border-zinc-700 object-cover"
                            />
                          )}

                          <div>
                            <h2 className="text-white mb-1 inline-block min-w-[13ch]">
                              {typedName}
                            </h2>
                            <p className="text-sm text-zinc-400">professional vibecoder</p>
                            {customStatus && (
                              <p className="text-xs text-zinc-500 mt-1">{customStatus.state}</p>
                            )}
                          </div>
                        </div>

                        {spotify && (
                          <div className="mt-4 border border-zinc-800 p-3 transition-all duration-300 hover:shadow-[0_0_18px_rgba(255,255,255,0.15)]">
                            <div className="flex gap-3 items-center mb-2">
                              <img
                                src={spotify.album_art_url}
                                alt="Album art"
                                className="w-10 h-10 border border-zinc-700 object-cover"
                              />

                              <div className="text-xs min-w-0">
                                <p className="text-white truncate">{spotify.song}</p>
                                <p className="text-zinc-500 truncate">{spotify.artist}</p>
                              </div>
                            </div>

                            <div className="w-full bg-zinc-800 h-1 relative overflow-hidden">
                              <div className="bg-white h-1" style={{ width: `${progress}%` }} />
                            </div>

                            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                              <span>{format(current)}</span>
                              <span>{format(duration)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border border-zinc-800 p-4">
                        <h3 className="text-white underline mb-2">info</h3>
                        <p className="text-sm">19</p>
                        <p className="text-sm">emotionally unavailable</p>
                        <p className="text-sm">what&apos;s real, will prosper.</p>
                      </div>

                      {activity && (
                        <div className="border border-zinc-800 p-4">
                          <h3 className="text-white underline mb-3">current activity</h3>

                          <div className="border border-zinc-800 p-3 flex gap-4 items-center">
                            {(activityLargeImage || activitySmallImage) && (
                              <div className="relative shrink-0">
                                {activityLargeImage ? (
                                  <img
                                    src={activityLargeImage}
                                    alt="Current activity"
                                    className="w-12 h-12 border border-zinc-700 object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 border border-zinc-700 bg-zinc-900" />
                                )}

                                {activitySmallImage && (
                                  <img
                                    src={activitySmallImage}
                                    alt="Activity icon"
                                    className="absolute -bottom-1 -right-1 w-4 h-4 border border-zinc-700 bg-[#121212] object-cover"
                                  />
                                )}
                              </div>
                            )}

                            <div className="text-xs min-w-0">
                              <p className="text-white truncate">{activity.name}</p>
                              {activity.details && (
                                <p className="text-zinc-400 truncate">{activity.details}</p>
                              )}
                              {activity.timestamps?.start && (
                                <p className="text-zinc-500 mt-1">
                                  elapsed {format(now - activity.timestamps.start)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="border border-zinc-800 p-4">
                        <h3 className="text-white underline mb-2">socials</h3>

                        <p className="text-sm">
                          twitter
                          <a
                            href="https://x.com/spoofedserials"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 hover:underline transition-colors hover:text-blue-400"
                          >
                            @spoofedserials
                          </a>
                        </p>

                        <p className="text-sm">
                          instagram
                          <a
                            href="https://www.instagram.com/0mkx/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 hover:underline transition-colors hover:text-pink-400"
                          >
                            @0mkx
                          </a>
                        </p>

                        <p className="text-sm">
                          tiktok
                          <a
                            href="https://www.tiktok.com/@zuxm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 hover:underline transition-colors hover:text-cyan-400"
                          >
                            @zuxm
                          </a>
                        </p>

                        <p className="text-sm">
                          telegram
                          <a
                            href="https://t.me/nulledserials"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 hover:underline transition-colors hover:text-blue-300"
                          >
                            @nulledserials
                          </a>
                        </p>

                        <p className="text-sm">
                          github
                          <a
                            href="https://github.com/xtpm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 hover:underline transition-colors hover:text-zinc-300"
                          >
                            @xtpm
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                      <div className="border border-zinc-800 p-4">
                        <h2 className="text-white mb-3">about</h2>
                        <div className="border border-zinc-800 p-3 text-sm text-zinc-400">
                          sales expert, video editor, and top tier{" "}
                          <span className="text-white inline-block [text-shadow:0_0_8px_rgba(255,255,255,0.45)]">
                            vibe coder
                          </span>
                          .
                        </div>
                      </div>

                      <div className="border border-zinc-800 p-4">
                        <h2 className="text-white mb-4">my friends</h2>

                        <div className="space-y-6 text-sm">
                          <div>
                            <p className="text-purple-400 mb-2 inline-block [text-shadow:0_0_10px_rgba(168,85,247,0.35)]">
                              tohka.net
                            </p>
                            <div className="space-y-1">
                              {["mke", "lennie", "arturiafm"].map((name) => (
                                <motion.div
                                  key={name}
                                  whileHover={{ x: 6, scale: 1.02 }}
                                  transition={{ duration: 0.18, ease: "easeOut" }}
                                  className="px-2 py-1 rounded hover:text-white hover:bg-zinc-800/60 hover:shadow-[0_0_10px_rgba(255,255,255,0.08)] transition-all"
                                >
                                  <span>{name}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          <div>
                        <p className="text-red-400 mb-2 inline-block [text-shadow:0_0_10px_rgba(248,113,113,0.35)]">
                          .gg/bunnie
                        </p>
                            <div className="space-y-1">
                              {["serena", "shad", "jace"].map((name) => (
                                <motion.div
                                  key={name}
                                  whileHover={{ x: 6, scale: 1.02 }}
                                  transition={{ duration: 0.18, ease: "easeOut" }}
                                  className="px-2 py-1 rounded hover:bg-zinc-800/60 hover:shadow-[0_0_10px_rgba(255,255,255,0.08)] transition-all"
                                >
                                  <span
                                    className={
                                      name === "serena"
                                        ? "text-pink-200 inline-block [text-shadow:0_0_10px_rgba(251,207,232,0.55)]"
                                        : name === "shad"
                                          ? "inline-block [color:#c24a2c] [text-shadow:0_0_10px_rgba(194,74,44,0.5)]"
                                          : name === "jace"
                                            ? "text-lime-300 inline-block [text-shadow:0_0_10px_rgba(190,242,100,0.5)]"
                                            : "text-white"
                                    }
                                  >
                                    {name}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-red-400 mb-2 inline-block [text-shadow:0_0_10px_rgba(248,113,113,0.35)]">
                              the niggas.
                            </p>
                            <div className="space-y-1">
                              {["isaac", "dash", "angel", "geo"].map((name) => (
                                <motion.div
                                  key={name}
                                  whileHover={{ x: 6, scale: 1.02 }}
                                  transition={{ duration: 0.18, ease: "easeOut" }}
                                  className="px-2 py-1 rounded hover:text-white hover:bg-zinc-800/60 hover:shadow-[0_0_10px_rgba(255,255,255,0.08)] transition-all"
                                >
                                  <span>{name}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="archive"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  <div className="border border-zinc-800 p-4">
                    <h2 className="text-white mb-2">archive</h2>
                    <p className="text-sm text-zinc-500">
                      some of my projects that never made it out...
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] gap-6">
                    <div className="border border-zinc-800 p-4">
                      <h3 className="text-white mb-4">projects</h3>
                      <div className="space-y-3">
                        {projectItems.map((item) => (
                          <a
                            key={item.title}
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            onMouseEnter={() => setHoveredProject(item)}
                            onMouseLeave={() => setHoveredProject(null)}
                            className="block border border-zinc-800 p-3 transition-all duration-200 hover:bg-zinc-900/70 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,255,255,0.06)]"
                          >
                            <p className={`text-sm ${titleClass(item.title)}`}>{item.title}</p>
                            <p className="text-zinc-500 text-xs mt-1">
                              {item.title === "kobeni.net" ? (
                                <>
                                  a exclusive invite only bio link service |{" "}
                                  <span className="text-red-400 inline-block [text-shadow:0_0_16px_rgba(248,113,113,0.95),0_0_30px_rgba(248,113,113,0.45)]">
                                    ON HOLD
                                  </span>
                                </>
                              ) : item.title === "yotsuba.cc" ? (
                                <>
                                  the older version of this site. | made by{" "}
                                  <span className="text-violet-300 inline-block [text-shadow:0_0_16px_rgba(196,181,253,0.95),0_0_30px_rgba(196,181,253,0.45)]">
                                    mke
                                  </span>
                                  .
                                </>
                              ) : (
                                item.desc
                              )}
                            </p>
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="border border-zinc-800 p-4 min-h-[220px] flex flex-col">
                      <h3 className="text-white mb-4">project info</h3>
                      <div className="flex-1">
                        <AnimatePresence mode="wait">
                          {hoveredProject ? (
                            <motion.div
                              key={hoveredProject.title}
                              initial={{ opacity: 0, x: 18 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -18 }}
                              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                              className="border border-zinc-800 p-4 bg-zinc-950/40 h-full"
                            >
                              <p className={`text-sm mb-2 ${titleClass(hoveredProject.title)}`}>
                                {hoveredProject.panelTitle}
                              </p>
                              <p className="text-zinc-400 text-sm leading-7">
                                {hoveredProject.panelText}
                              </p>
                              <p className="text-zinc-500 text-[11px] mt-4 uppercase tracking-wide">
                                {renderProjectMeta(hoveredProject.title, hoveredProject.panelMeta)}
                              </p>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="empty-project"
                              initial={{ opacity: 0, filter: "blur(4px)" }}
                              animate={{ opacity: 1, filter: "blur(0px)" }}
                              exit={{ opacity: 0, filter: "blur(4px)" }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="border border-dashed border-zinc-800 p-4 text-zinc-500 text-xs leading-6 h-full flex items-center"
                            >
                              hover a project to preview more info here.
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-4 right-4 z-30 w-[300px] border border-zinc-800 bg-[#121212]/95 backdrop-blur-sm p-3 shadow-[0_0_20px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-center gap-3">
                <img
                  src={currentBackgroundTrack.cover}
                  alt="Track cover"
                  className="w-12 h-12 border border-zinc-700 object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs truncate">{currentBackgroundTrack.title}</p>
                  <p className="text-zinc-500 text-[11px] truncate">{currentBackgroundTrack.artist}</p>
                </div>
              </div>

              <div className="mt-3 flex h-8 items-end justify-between gap-0.5 overflow-hidden border border-emerald-300/30 bg-zinc-950/60 px-2 py-1 shadow-[0_0_18px_rgba(110,231,183,0.12)]">
                {visualizerBars.map((bar, index) => (
                  <motion.span
                    key={index}
                    animate={{ height: `${Math.max(18, bar * 100)}%`, opacity: isPlaying ? 1 : 0.45 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="block h-full min-w-0 flex-1 rounded-[1px] bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]"
                  />
                ))}
              </div>

              <div className="mt-3 w-full bg-zinc-800 h-1 overflow-hidden">
                <div
                  className="bg-white h-1"
                  style={{ width: `${playerDuration ? (playerProgress / playerDuration) * 100 : 0}%` }}
                />
              </div>

              <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
                <span>{formatPlayerSeconds(playerProgress)}</span>
                <span>{formatPlayerSeconds(playerDuration)}</span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevBackgroundTrack}
                    className="border border-zinc-800 px-2 py-1 hover:bg-zinc-900 transition-colors"
                  >
                    prev
                  </button>
                  <button
                    onClick={toggleBackgroundPlayer}
                    className="border border-zinc-800 px-3 py-1 hover:bg-zinc-900 transition-colors text-white"
                  >
                    {isPlaying ? "pause" : "play"}
                  </button>
                  <button
                    onClick={nextBackgroundTrack}
                    className="border border-zinc-800 px-2 py-1 hover:bg-zinc-900 transition-colors"
                  >
                    next
                  </button>
                </div>

                <div className="w-[86px]">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={playerVolume}
                    onChange={(event) => {
                      setAutoplayMuted(false);
                      setPlayerVolume(Number(event.target.value));
                    }}
                    className="w-full accent-white"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
