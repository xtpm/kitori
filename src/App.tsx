import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function App() {
  const nyandereLanyardUserId = "1270175700309115006";
  const [hoverName, setHoverName] = useState(false);
  const [typedName, setTypedName] = useState("sup, im tpm");
  const [status, setStatus] = useState("offline");
  const [lanyard, setLanyard] = useState<any>(null);
  const [nyandereStatus, setNyandereStatus] = useState("offline");
  const [nyandereLanyard, setNyandereLanyard] = useState<any>(null);
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
  const [visualizerBars, setVisualizerBars] = useState<number[]>(
    Array.from({ length: 20 }, () => 0.14),
  );
  const [nyanderePinnedSection, setNyanderePinnedSection] = useState<"default" | "socials" | "friends">("default");
  const [activeFriendGroup, setActiveFriendGroup] = useState("tohka.net");

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

  const friendGroups = [
    {
      id: "terry davis fanclub",
      label: "terry davis fanclub",
      accentClass: "inline-block",
      accentStyle: {
        color: "#fef08a",
        textShadow: "0 0 10px rgba(254,240,138,0.55)",
      },
      members: [
        {
          name: "mke",
          image: "/friends/mke.png",
          className: "inline-block",
          style: {
            color: "#d8b4fe",
            textShadow: "0 0 10px rgba(216,180,254,0.8), 0 0 20px rgba(216,180,254,0.35)",
          },
        },
        {
          name: "lennie",
          image: "/friends/lennie.jpg",
          className: "rgb-text inline-block",
          style: {
            textShadow: "0 0 12px rgba(255,255,255,0.28)",
          },
        },
        {
          name: "arturiafm",
          image: "/friends/arturiafm.png",
          className: "inline-block",
          style: {
            color: "#fcd34d",
            textShadow: "0 0 10px rgba(252,211,77,0.82), 0 0 22px rgba(252,211,77,0.38)",
          },
        },
      ],
    },
    {
      id: ".gg/bunnie",
      label: ".gg/bunnie",
      accentClass:
        "text-pink-200 [text-shadow:0_0_10px_rgba(251,207,232,0.55)]",
      members: [
        {
          name: "serena",
          image: "/friends/serena.jpg",
          href: "https://kuudere.cc/nyandere",
          className:
            "text-pink-200 inline-block [text-shadow:0_0_10px_rgba(251,207,232,0.55)]",
        },
        {
          name: "shad",
          image: "/friends/shad.jpg",
          className:
            "inline-block [color:#c24a2c] [text-shadow:0_0_10px_rgba(194,74,44,0.5)]",
        },
      ],
    },
    {
      id: "the niggas.",
      label: "the niggas.",
      accentClass:
        "text-red-400 [text-shadow:0_0_10px_rgba(248,113,113,0.35)]",
      members: [
        { name: "isaac", image: "/friends/isaac.png" },
        { name: "dash", image: "/friends/dash.png" },
        { name: "angel", image: "/friends/angel.png" },
        { name: "geo", image: "/friends/geo.png" },
      ],
    },
  ];

  const currentFriendGroup =
    friendGroups.find((group) => group.id === activeFriendGroup) ?? friendGroups[0];

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
    const fetchNyandereStatus = () => {
      fetch(`https://api.lanyard.rest/v1/users/${nyandereLanyardUserId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data?.data) return;
          setNyandereStatus(data.data.discord_status || "offline");
          setNyandereLanyard(data.data);
        })
        .catch(() => setNyandereStatus("offline"));
    };

    fetchNyandereStatus();
    const interval = setInterval(fetchNyandereStatus, 30000);
    return () => clearInterval(interval);
  }, [nyandereLanyardUserId]);

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

  const getDiscordAvatarUrl = (discordUser?: { id?: string; avatar?: string | null }) => {
    if (!discordUser?.id) return null;
    if (discordUser.avatar) {
      const ext = discordUser.avatar.startsWith("a_") ? "gif" : "png";
      return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${ext}?size=256`;
    }

    const fallbackIndex = Number((BigInt(discordUser.id) >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${fallbackIndex}.png`;
  };


  const activityLargeImage = getActivityAssetUrl(
    activity?.application_id,
    activity?.assets?.large_image,
  );
  const activitySmallImage = getActivityAssetUrl(
    activity?.application_id,
    activity?.assets?.small_image,
  );
  const nyandereStatusColor =
    {
      online: "text-green-500",
      idle: "text-yellow-400",
      offline: "text-red-500",
      dnd: "text-red-500",
    }[nyandereStatus] || "text-red-500";

  const nyandereAvatar = getDiscordAvatarUrl(nyandereLanyard?.discord_user);

  const nyandereCustomStatus = nyandereLanyard?.activities?.find((a: any) => a.type === 4);
  const nyandereActivity = nyandereLanyard?.activities?.find((a: any) => a.type === 0);
  const nyandereSpotify = nyandereLanyard?.spotify;
  const nyandereActivityLargeImage = getActivityAssetUrl(
    nyandereActivity?.application_id,
    nyandereActivity?.assets?.large_image,
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

  const { progress: nyandereSpotifyProgress, current: nyandereSpotifyCurrent, duration: nyandereSpotifyDuration } = useMemo(() => {
    if (!nyandereSpotify?.timestamps?.start || !nyandereSpotify?.timestamps?.end) {
      return { progress: 0, current: 0, duration: 0 };
    }

    const start = nyandereSpotify.timestamps.start;
    const end = nyandereSpotify.timestamps.end;
    const total = Math.max(end - start, 0);
    const elapsed = Math.max(0, Math.min(now - start, total));

    return {
      progress: total > 0 ? (elapsed / total) * 100 : 0,
      current: elapsed,
      duration: total,
    };
  }, [nyandereSpotify, now]);

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

  const handleNyandereAnchorClick = (href: string) => (event: any) => {
    if (!href.startsWith("#")) return;
    event.preventDefault();
    if (href === "#nyandere-socials") {
      setNyanderePinnedSection("socials");
      window.history.replaceState(null, "", href);
      return;
    }
    if (href === "#nyandere-friends") {
      setNyanderePinnedSection("friends");
      window.history.replaceState(null, "", href);
      return;
    }
    if (href === "#nyandere-about") {
      setNyanderePinnedSection("default");
      window.history.replaceState(null, "", href);
      return;
    }
    const target = document.querySelector(href);
    if (target instanceof HTMLElement) {
      const top = target.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top, behavior: "smooth" });
      window.history.replaceState(null, "", href);
    }
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

  const pathname =
    typeof window !== "undefined" ? window.location.pathname.replace(/\/+$/, "") || "/" : "/";
  const isNyanderePage = pathname === "/nyandere";

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
        html, body {
          background: #f4f7f4;
          scroll-behavior: smooth;
        }
        .nyandere-sky {
          --ny-bg: #f4f7f4;
          --ny-panel: #ffffff;
          --ny-surface: #ffffff;
          --ny-surface-soft: #ffffff;
          --ny-tab: #3decff;
          --ny-border: #3decff;
          --ny-text: #111827;
          --ny-muted: #425466;
          background: var(--ny-bg);
          font-family: "Inter", sans-serif;
          font-weight: 600;
          color: var(--ny-text);
        }
        .nyandere-sky * {
          font-family: inherit;
        }
        .nyandere-sky p,
        .nyandere-sky h1,
        .nyandere-sky h2,
        .nyandere-sky h3,
        .nyandere-sky span,
        .nyandere-sky div {
          color: var(--ny-text) !important;
        }
        .nyandere-panel {
          border: 1px solid rgba(61, 236, 255, 0.92);
          background: var(--ny-panel);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.9),
            0 0 0 1px rgba(61,236,255,0.22),
            0 14px 30px rgba(61,236,255,0.14);
        }
        .nyandere-box {
          border: 1px solid rgba(61, 236, 255, 0.88);
          background: var(--ny-surface-soft);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.6);
        }
        .nyandere-tab {
          border: 1px solid rgba(61, 236, 255, 0.88);
          background: rgba(61, 236, 255, 0.18);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7);
        }
        .nyandere-tab-link {
          display: block;
          color: #ffffff;
          text-decoration: none;
        }
        .nyandere-link-item {
          display: block;
          text-decoration: none;
          color: var(--ny-muted);
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background-color 0.18s ease,
            color 0.18s ease;
        }
        .nyandere-link-item:hover {
          transform: translateX(4px);
          border-color: rgba(61, 236, 255, 1);
          background: rgba(61, 236, 255, 0.2);
          color: var(--ny-text);
        }
        .nyandere-social-card {
          display: block;
          text-decoration: none;
          transition:
            transform 0.35s ease,
            border-color 0.35s ease,
            background-color 0.35s ease,
            box-shadow 0.35s ease;
        }
        .nyandere-social-card:hover {
          transform: translateY(-3px);
          border-color: rgba(61, 236, 255, 1);
          background: rgba(61, 236, 255, 0.18);
          box-shadow: 0 0 18px rgba(61, 236, 255, 0.24);
        }
        .nyandere-friend-card {
          transition:
            transform 0.35s ease,
            border-color 0.35s ease,
            background-color 0.35s ease,
            box-shadow 0.35s ease;
        }
        .nyandere-friend-card:hover {
          transform: translateY(-3px);
          border-color: rgba(61, 236, 255, 1);
          background: rgba(61, 236, 255, 0.18);
          box-shadow: 0 0 18px rgba(61, 236, 255, 0.24);
        }
        .nyandere-note {
          border: 2px dashed rgba(61, 236, 255, 0.6);
          background: rgba(61, 236, 255, 0.08);
        }
        @keyframes nyandereOpeningWash {
          0% {
            opacity: 0.95;
            transform: scaleY(1);
          }
          65% {
            opacity: 0.42;
          }
          100% {
            opacity: 0;
            transform: scaleY(1.02);
          }
        }
        @keyframes nyandereOpeningGrid {
          0% {
            opacity: 0;
            transform: translateY(-24px);
          }
          18% {
            opacity: 0.45;
          }
          100% {
            opacity: 0;
            transform: translateY(36px);
          }
        }
        @keyframes nyandereOpeningGlow {
          0% {
            opacity: 0;
            transform: scale(0.98);
          }
          30% {
            opacity: 0.35;
          }
          100% {
            opacity: 0;
            transform: scale(1.04);
          }
        }
        .nyandere-opening-layer {
          pointer-events: none;
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }
        .nyandere-opening-wash {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(61,236,255,0.28), rgba(61,236,255,0.08) 32%, rgba(255,255,255,0) 72%),
            radial-gradient(circle at 18% 12%, rgba(61,236,255,0.28), transparent 38%);
          transform-origin: top center;
          animation: nyandereOpeningWash 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .nyandere-opening-grid {
          position: absolute;
          inset: -10% 0 0;
          background-image:
            linear-gradient(rgba(61,236,255,0.22) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,236,255,0.14) 1px, transparent 1px);
          background-size: 100% 28px, 28px 100%;
          mix-blend-mode: screen;
          animation: nyandereOpeningGrid 1.25s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .nyandere-opening-glow {
          position: absolute;
          inset: 8% 10%;
          border: 1px solid rgba(61,236,255,0.26);
          box-shadow:
            0 0 48px rgba(61,236,255,0.16),
            inset 0 0 36px rgba(61,236,255,0.08);
          animation: nyandereOpeningGlow 1.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes nyandereFadeRise {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .nyandere-load-in {
          opacity: 0;
          animation: nyandereFadeRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          will-change: opacity, transform;
        }
        .nyandere-delay-1 {
          animation-delay: 0.18s;
        }
        .nyandere-delay-2 {
          animation-delay: 0.28s;
        }
        .nyandere-delay-3 {
          animation-delay: 0.42s;
        }
        .nyandere-delay-4 {
          animation-delay: 0.56s;
        }
        .nyandere-title {
          font-family: "Cormorant Garamond", serif;
          font-weight: 700;
          letter-spacing: 0.01em;
          line-height: 0.95;
        }
      `}</style>

      {isNyanderePage ? (
        <div className="min-h-screen nyandere-sky relative overflow-hidden text-[#111827] px-4 py-8">
          <div className="nyandere-opening-layer">
            <div className="nyandere-opening-wash" />
            <div className="nyandere-opening-grid" />
            <div className="nyandere-opening-glow" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="nyandere-panel nyandere-load-in p-4 md:p-6 backdrop-blur-[2px]">
              <div className="nyandere-box overflow-hidden">
                <div
                  id="nyandere-index"
                  className="relative min-h-[210px] border-b border-[#3decff]/60 bg-[#ffffff] px-6 pt-8 pb-5 md:px-10"
                >
                  <div className="relative z-10 flex h-full flex-col justify-end">
                    <div className="max-w-xl">
                      <p className="rgb-text mb-2 text-xs tracking-[0.35em]">
                        /nyandere
                      </p>
                      <h1 className="nyandere-title mt-20 -translate-x-2 inline-block text-3xl italic tracking-wide text-[#111827] drop-shadow-[0_0_10px_rgba(61,236,255,0.12)] md:text-5xl">
                        nyandere&apos;s blog &gt;_&lt;
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 bg-[#f4f7f4] p-4 md:grid-cols-[220px_minmax(0,1fr)]">
                  <div id="nyandere-links" className="nyandere-box nyandere-load-in nyandere-delay-2 p-3">
                    <div className="border border-[#3decff]/80 bg-[#ffffff] px-3 py-2 text-lg text-[#111827] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9)]">
                      links
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      {[
                        { label: "about me", href: "#nyandere-about" },
                        { label: "socials", href: "#nyandere-socials" },
                        { label: "friends", href: "#nyandere-friends" },
                        { label: "extra", href: "#nyandere-gallery" },
                      ].map((item) => (
                        <a
                          key={item.label}
                          className="nyandere-tab nyandere-link-item px-3 py-2"
                          href={item.href}
                          onClick={handleNyandereAnchorClick(item.href)}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                    <div className="mt-4 border border-[#3decff]/80 bg-[#3decff]/18 px-3 py-4 text-center text-xs uppercase tracking-[0.28em] text-[#111827]">
                      personal bookmarks
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 nyandere-load-in nyandere-delay-3">
                    <motion.div
                      layout
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        order:
                          nyanderePinnedSection === "default"
                            ? 0
                            : nyanderePinnedSection === "socials"
                              ? 1
                              : 2,
                      }}
                      id="nyandere-about"
                      className="nyandere-box overflow-hidden"
                    >
                      <div className="border-b border-[#3decff]/50 bg-[#ffffff] px-4 py-3">
                        <h2 className="text-2xl font-bold italic text-[#111827] drop-shadow-[0_0_8px_rgba(61,236,255,0.14)]">
                          about me
                        </h2>
                      </div>
                      <div className="space-y-4 px-4 py-4 text-sm leading-7 text-[#425466]">
                        <p>
                          i can spend all night playing overwatch, looping the same songs i love,
                          and getting way too attached to visual novels. i love cats most of all,
                          especially my cat pearl, and i want this page to feel like a small
                          personal space filled with the things that make me happiest.
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      layout
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        order:
                          nyanderePinnedSection === "socials"
                            ? 0
                            : nyanderePinnedSection === "default"
                              ? 1
                              : 2,
                      }}
                      id="nyandere-socials"
                      className="nyandere-box p-4"
                    >
                      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-[#111827]/80">
                        <span>socials</span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          { label: "tiktok", value: "@webentries", href: "https://www.tiktok.com/@webentries" },
                          { label: "instagram", value: "@daintycatgirl", href: "https://www.instagram.com/daintycatgirl/" },
                          { label: "twitter", value: "@daintycatgirl", href: "https://x.com/daintycatgirl" },
                          { label: "telegram", value: "@fawndere", href: "https://t.me/fawndere" },
                        ].map((item) => (
                          <a
                            key={item.label}
                            className="nyandere-social-card border border-[#3decff]/80 bg-[#3decff]/14 px-4 py-3"
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <p className="text-[10px] uppercase tracking-[0.28em] text-[#111827]/80">
                              {item.label}
                            </p>
                            <p className="mt-2 text-[#111827]">{item.value}</p>
                          </a>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      layout
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        order:
                          nyanderePinnedSection === "friends"
                            ? 0
                            : nyanderePinnedSection === "default"
                              ? 2
                              : 1,
                      }}
                      id="nyandere-friends"
                      className="nyandere-box p-4"
                    >
                      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-[#f4efe6]/80">
                        <span>friends</span>
                      </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {[
                            { name: "dylan", href: "https://kuudere.cc" },
                            { name: "shad" },
                            { name: "jace" },
                            { name: "niko" },
                            { name: "jazzie" },
                          ].map((friend) =>
                            friend.href ? (
                              <a
                                key={friend.name}
                                href={friend.href}
                                target="_blank"
                                rel="noreferrer"
                                className="nyandere-friend-card border border-[#3decff]/80 bg-[#3decff]/14 px-4 py-3 text-[#111827] no-underline"
                              >
                                {friend.name}
                              </a>
                            ) : (
                              <div
                                key={friend.name}
                                className="nyandere-friend-card border border-[#3decff]/80 bg-[#3decff]/14 px-4 py-3 text-[#111827]"
                              >
                                {friend.name}
                              </div>
                            ),
                          )}
                        </div>
                    </motion.div>

                    <motion.div
                      layout
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      style={{ order: 3 }}
                      className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]"
                    >
                      <div id="nyandere-gallery" className="nyandere-box p-4">
                        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.28em] text-[#111827]/80">
                          <span>profile card</span>
                          <span>live status</span>
                        </div>
                        <div className="min-h-[240px] border border-dashed border-[#3decff]/80 bg-[#ffffff] p-4 text-sm text-[#111827]">
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              <div className="w-20 shrink-0">
                              {nyandereAvatar ? (
                                <img
                                  src={nyandereAvatar}
                                  alt="Discord avatar"
                                  className="aspect-square w-full border border-[#dfeef2]/70 object-cover"
                                />
                              ) : (
                                <div className="flex aspect-square w-full items-center justify-center border border-[#3decff]/80 bg-[#ffffff] text-xs uppercase tracking-[0.28em] text-[#111827]">
                                  offline
                                </div>
                              )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl text-[#111827]">
                                    {nyandereLanyard?.discord_user?.global_name || nyandereLanyard?.discord_user?.username || "tpm"}
                                  </h3>
                                  <span className={`text-[10px] uppercase tracking-[0.28em] ${nyandereStatusColor}`}>
                                    {nyandereStatus}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-[#425466]">
                                  @{nyandereLanyard?.discord_user?.username || "xtpm"}
                                </p>
                                {nyandereCustomStatus?.state && (
                                  <p className="mt-2 line-clamp-2 leading-6 text-[#111827]">
                                    {nyandereCustomStatus.state}
                                  </p>
                                )}
                              </div>
                            </div>

                            {nyandereSpotify ? (
                              <div className="border border-[#3decff]/80 bg-[#3decff]/12 p-3">
                                <p className="text-[10px] uppercase tracking-[0.28em] text-[#111827]/70">
                                  now playing
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                  <img
                                    src={nyandereSpotify.album_art_url}
                                    alt="Album art"
                                    className="h-12 w-12 border border-[#dfeef2]/70 object-cover"
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate text-[#111827]">{nyandereSpotify.song}</p>
                                    <p className="truncate text-[#425466]">{nyandereSpotify.artist}</p>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <div className="h-1.5 w-full overflow-hidden bg-[#d8faff]">
                                    <div
                                      className="h-full bg-[#3decff]"
                                      style={{ width: `${nyandereSpotifyProgress}%` }}
                                    />
                                  </div>
                                  <div className="mt-1.5 flex justify-between text-[11px] text-[#425466]">
                                    <span>{format(nyandereSpotifyCurrent)}</span>
                                    <span>{format(nyandereSpotifyDuration)}</span>
                                  </div>
                                </div>
                              </div>
                            ) : nyandereActivity ? (
                              <div className="border border-[#3decff]/80 bg-[#3decff]/12 p-3">
                                <p className="text-[10px] uppercase tracking-[0.28em] text-[#111827]/70">
                                  activity
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                  {nyandereActivityLargeImage && (
                                    <img
                                      src={nyandereActivityLargeImage}
                                      alt="Activity asset"
                                      className="h-12 w-12 border border-[#dfeef2]/70 object-cover"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <p className="truncate text-[#111827]">{nyandereActivity.name}</p>
                                    {nyandereActivity.details && (
                                      <p className="truncate text-[#425466]">{nyandereActivity.details}</p>
                                    )}
                                    {nyandereActivity.state && (
                                      <p className="truncate text-[#0f172a]">{nyandereActivity.state}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="border border-[#3decff]/80 bg-[#3decff]/12 p-3">
                                <p className="text-[10px] uppercase tracking-[0.28em] text-[#111827]/70">
                                  presence
                                </p>
                                <p className="mt-2 text-[#111827]">nothing active right now</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div id="nyandere-interests" className="nyandere-box p-4">
                        <h3 className="text-lg text-[#f4f7f4]">interests</h3>
                        <div className="mt-3 space-y-4 text-sm leading-6 text-[#f4efe6]">
                          <p>overwatch</p>
                          <p>roblox</p>
                          <p>visual novels</p>
                          <p>music (ptv, malcolm todd, dominic fike)</p>
                          <p>cats</p>
                        </div>
                      </div>
                    </motion.div>

                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      ) : (
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
          <audio ref={audioRef} preload="metadata" playsInline>
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
                          <div className="flex flex-wrap gap-2">
                            {friendGroups.map((group) => {
                              const isActive = currentFriendGroup.id === group.id;

                              return (
                                <button
                                  key={group.id}
                                  type="button"
                                  onClick={() => setActiveFriendGroup(group.id)}
                                  className={`border px-2 py-1 text-left text-xs transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(255,255,255,0.08)] active:translate-y-0 ${
                                    isActive
                                      ? "border-zinc-600 text-white bg-zinc-900"
                                      : "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                                  }`}
                                >
                                  <span className={group.accentClass} style={group.accentStyle}>
                                    {group.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="border border-zinc-800 p-4 min-h-[240px]">
                            <AnimatePresence mode="wait">
                              <motion.p
                                key={currentFriendGroup.id}
                                initial={{ opacity: 0, x: 14 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -14 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className={`mb-3 inline-block ${currentFriendGroup.accentClass}`}
                                style={currentFriendGroup.accentStyle}
                              >
                                {currentFriendGroup.label}
                              </motion.p>
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                              <motion.div
                                key={currentFriendGroup.id}
                                initial={{ opacity: 0, x: 18 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -18 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-wrap gap-4"
                              >
                                {currentFriendGroup.members.map((friend, index) =>
                                  friend.href ? (
                                    <motion.a
                                      key={friend.name}
                                      href={friend.href}
                                      target="_blank"
                                      rel="noreferrer"
                                      initial={{ opacity: 0, x: 14 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -14 }}
                                      transition={{
                                        duration: 0.22,
                                        delay: index * 0.04,
                                        ease: [0.22, 1, 0.36, 1],
                                      }}
                                      whileHover={{ x: 6, scale: 1.02 }}
                                      className="flex flex-col items-center gap-2 hover:opacity-100 transition-all no-underline"
                                    >
                                      {friend.image ? (
                                        <img
                                          src={friend.image}
                                          alt={`${friend.name} profile`}
                                          className="border border-zinc-700 object-cover"
                                          style={{ width: 88, height: 88 }}
                                        />
                                      ) : (
                                        <div
                                          className="flex items-center justify-center border border-zinc-700 bg-zinc-900 text-xl uppercase text-zinc-300"
                                          style={{ width: 88, height: 88 }}
                                        >
                                          {friend.name.charAt(0)}
                                        </div>
                                      )}
                                      <motion.span
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{
                                          duration: 0.2,
                                          delay: 0.06 + index * 0.04,
                                          ease: [0.22, 1, 0.36, 1],
                                        }}
                                        className={`text-center ${friend.className ?? "text-white"}`}
                                        style={friend.style}
                                      >
                                        {friend.name}
                                      </motion.span>
                                    </motion.a>
                                  ) : (
                                    <motion.div
                                      key={friend.name}
                                      initial={{ opacity: 0, x: 14 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -14 }}
                                      transition={{
                                        duration: 0.22,
                                        delay: index * 0.04,
                                        ease: [0.22, 1, 0.36, 1],
                                      }}
                                      whileHover={{ x: 6, scale: 1.02 }}
                                      className="flex flex-col items-center gap-2 transition-all"
                                    >
                                      {friend.image ? (
                                        <img
                                          src={friend.image}
                                          alt={`${friend.name} profile`}
                                          className="border border-zinc-700 object-cover"
                                          style={{ width: 88, height: 88 }}
                                        />
                                      ) : (
                                        <div
                                          className="flex items-center justify-center border border-zinc-700 bg-zinc-900 text-xl uppercase text-zinc-300"
                                          style={{ width: 88, height: 88 }}
                                        >
                                          {friend.name.charAt(0)}
                                        </div>
                                      )}
                                      <motion.span
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{
                                          duration: 0.2,
                                          delay: 0.06 + index * 0.04,
                                          ease: [0.22, 1, 0.36, 1],
                                        }}
                                        className={`text-center ${friend.className ?? "text-white"}`}
                                        style={friend.style}
                                      >
                                        {friend.name}
                                      </motion.span>
                                    </motion.div>
                                  ),
                                )}
                              </motion.div>
                            </AnimatePresence>
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
                          <div
                            key={item.title}
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
                          </div>
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
      )}
    </>
  );
}
