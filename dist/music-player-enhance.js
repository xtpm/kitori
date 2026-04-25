(function () {
  const TRACK = {
    title: "first strike",
    artist: "Jades",
    src: "/music/first-strike-jades.mp3",
    cover: "/music/first-strike-jades.jpg",
  };
  const DEFAULT_VOLUME = 0.2;
  const STYLE_ID = "music-player-enhance-style";
  const VISUALIZER_BARS = 20;
  let visualizerFrame = null;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .music-volume-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 18px;
        background: transparent;
      }
      .music-volume-slider:focus {
        outline: none;
      }
      .music-volume-slider::-webkit-slider-runnable-track {
        height: 6px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.28);
        background: linear-gradient(180deg, rgba(28,28,32,0.98), rgba(56,56,64,0.92));
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 10px rgba(255,255,255,0.04);
      }
      .music-volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        margin-top: -5px;
        border: 1px solid rgba(255,255,255,0.85);
        border-radius: 999px;
        background: radial-gradient(circle at 35% 35%, #ffffff 0 34%, #d9ffe7 35%, #8ff0bf 72%, #5fd7a0 100%);
        box-shadow: 0 0 0 2px rgba(18,18,18,0.9), 0 0 10px rgba(110,231,183,0.38);
        cursor: pointer;
      }
      .music-volume-slider::-moz-range-track {
        height: 6px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.28);
        background: linear-gradient(180deg, rgba(28,28,32,0.98), rgba(56,56,64,0.92));
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 10px rgba(255,255,255,0.04);
      }
      .music-volume-slider::-moz-range-thumb {
        width: 14px;
        height: 14px;
        border: 1px solid rgba(255,255,255,0.85);
        border-radius: 999px;
        background: radial-gradient(circle at 35% 35%, #ffffff 0 34%, #d9ffe7 35%, #8ff0bf 72%, #5fd7a0 100%);
        box-shadow: 0 0 0 2px rgba(18,18,18,0.9), 0 0 10px rgba(110,231,183,0.38);
        cursor: pointer;
      }
      .music-visualizer {
        margin-top: 12px;
        display: flex;
        height: 40px;
        align-items: flex-end;
        justify-content: space-between;
        gap: 4px;
        overflow: hidden;
        border: 1px solid rgba(110,231,183,0.25);
        background: linear-gradient(180deg, rgba(3,10,8,0.96), rgba(16,30,24,0.92));
        padding: 8px 12px;
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,0.04),
          0 0 22px rgba(110,231,183,0.12);
      }
      .music-visualizer-bar {
        min-width: 0;
        flex: 1;
        background: linear-gradient(180deg, #f4fff8 0%, #b8ffd7 30%, #72f2b3 68%, #29b87b 100%);
        box-shadow:
          0 0 10px rgba(110,231,183,0.45),
          0 0 18px rgba(110,231,183,0.18);
        opacity: 0.45;
        height: 18%;
        transition: height 160ms ease-out, opacity 160ms ease-out;
        transform-origin: center bottom;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureVisualizer(player) {
    if (!(player instanceof HTMLElement)) return null;
    let visualizer = player.querySelector(".music-visualizer");
    if (visualizer instanceof HTMLElement) return visualizer;

    const header = player.querySelector(".flex.items-center.gap-3");
    if (!(header instanceof HTMLElement)) return null;

    visualizer = document.createElement("div");
    visualizer.className = "music-visualizer";
    for (let i = 0; i < VISUALIZER_BARS; i += 1) {
      const bar = document.createElement("span");
      bar.className = "music-visualizer-bar";
      visualizer.appendChild(bar);
    }

    header.insertAdjacentElement("afterend", visualizer);
    return visualizer;
  }

  function syncVisualizer(player, audio) {
    const visualizer = ensureVisualizer(player);
    if (!(visualizer instanceof HTMLElement) || !(audio instanceof HTMLAudioElement)) return;
    const bars = Array.from(visualizer.children);

    const render = () => {
      const active = !audio.paused && !audio.ended;
      const baseTime = audio.currentTime || 0;

      bars.forEach((bar, index) => {
        if (!(bar instanceof HTMLElement)) return;
        const wave = (Math.sin(baseTime * 4.2 + index * 0.55) + 1) / 2;
        const bounce = (Math.sin(baseTime * 7.1 + index * 0.9) + 1) / 2;
        const level = active ? Math.max(0.18, wave * 0.68 + bounce * 0.22) : 0.18;
        bar.style.height = `${Math.max(18, level * 100)}%`;
        bar.style.opacity = active ? "1" : "0.45";
      });

      visualizerFrame = window.requestAnimationFrame(render);
    };

    if (visualizerFrame) {
      window.cancelAnimationFrame(visualizerFrame);
    }
    render();
  }

  function syncPlayButton(player, audio) {
    if (!(player instanceof HTMLElement) || !(audio instanceof HTMLAudioElement)) return;
    const buttons = Array.from(player.querySelectorAll("button"));
    const playButton = buttons.find((button) => {
      const label = button.textContent?.trim().toLowerCase();
      return label === "play" || label === "pause";
    });
    if (playButton) {
      playButton.textContent = audio.paused ? "play" : "pause";
    }
  }

  function findPlayer() {
    return document.querySelector("div.fixed.bottom-4.right-4");
  }

  function patchPlayer() {
    ensureStyles();
    const player = findPlayer();
    if (!(player instanceof HTMLElement)) return;

    const audio = document.querySelector("audio");
    if (audio instanceof HTMLAudioElement) {
      syncVisualizer(player, audio);

      if (audio.dataset.musicDefaultVolumeApplied !== "true") {
        audio.dataset.musicDefaultVolumeApplied = "true";
        audio.volume = DEFAULT_VOLUME;
      }

      const source = audio.querySelector("source");
      const currentSrc = source?.getAttribute("src") || "";
      if (currentSrc !== TRACK.src) {
        const shouldResume = !audio.paused;
        if (source) {
          source.setAttribute("src", TRACK.src);
        } else {
          audio.src = TRACK.src;
        }
        audio.load();
        if (shouldResume) {
          audio.play().catch(() => undefined);
        }
      }

      if (audio.dataset.musicAutoplayBound !== "true") {
        audio.dataset.musicAutoplayBound = "true";

        const attemptAutoplay = () => {
          audio.play().catch(() => undefined);
          syncPlayButton(player, audio);
        };

        audio.addEventListener("canplay", attemptAutoplay);
        audio.addEventListener("play", () => syncPlayButton(player, audio));
        audio.addEventListener("pause", () => syncPlayButton(player, audio));
        window.addEventListener("pointerdown", attemptAutoplay, { once: true });
        window.addEventListener("keydown", attemptAutoplay, { once: true });

        attemptAutoplay();
      }

      syncPlayButton(player, audio);
    }

    const cover = player.querySelector("img");
    if (cover instanceof HTMLImageElement) {
      if (!cover.src.endsWith(TRACK.cover.replace("/music/", ""))) {
        cover.src = TRACK.cover;
      }
      cover.alt = "Track cover";
    }

    const title = player.querySelector("p.text-white.text-xs");
    if (title) title.textContent = TRACK.title;

    const artist = player.querySelector("p.text-zinc-500.text-\\[11px\\]");
    if (artist) artist.textContent = TRACK.artist;

    const subtitle = player.querySelector("p.text-zinc-600.text-\\[10px\\]");
    if (subtitle instanceof HTMLElement) {
      subtitle.style.display = "none";
    }

    const ranges = player.querySelectorAll('input[type="range"]');
    if (ranges.length > 1) {
      const seekBar = ranges[ranges.length - 1];
      if (seekBar instanceof HTMLElement) {
        seekBar.style.display = "none";
      }
    }
    if (ranges.length > 0) {
      const volumeBar = ranges[0];
      if (volumeBar instanceof HTMLInputElement) {
        volumeBar.className = "music-volume-slider";
        if (volumeBar.dataset.musicDefaultVolumeApplied !== "true") {
          volumeBar.dataset.musicDefaultVolumeApplied = "true";
          volumeBar.value = String(DEFAULT_VOLUME);
        }
      }
    }

    if (player.dataset.musicEnhanceBound !== "true") {
      player.dataset.musicEnhanceBound = "true";
      player.addEventListener(
        "click",
        (event) => {
          const target = event.target;
          if (!(target instanceof HTMLButtonElement)) return;
          const label = target.textContent?.trim().toLowerCase();
          if (label === "prev" || label === "next") {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
          }
        },
        true,
      );
    }
  }

  const interval = window.setInterval(patchPlayer, 250);
  window.addEventListener("load", patchPlayer);
  window.addEventListener("beforeunload", () => {
    window.clearInterval(interval);
    if (visualizerFrame) {
      window.cancelAnimationFrame(visualizerFrame);
    }
  });
})();
