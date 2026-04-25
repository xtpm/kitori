(function () {
  const TRACK = {
    title: "first strike",
    artist: "Jades",
    src: "/music/first-strike-jades.mp3",
    cover: "/music/first-strike-jades.jpg",
  };

  function findPlayer() {
    return document.querySelector("div.fixed.bottom-4.right-4");
  }

  function patchPlayer() {
    const player = findPlayer();
    if (!(player instanceof HTMLElement)) return;

    const audio = document.querySelector("audio");
    if (audio instanceof HTMLAudioElement) {
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
    if (subtitle) subtitle.textContent = "background player";

    const ranges = player.querySelectorAll('input[type="range"]');
    if (ranges.length > 1) {
      const seekBar = ranges[ranges.length - 1];
      if (seekBar instanceof HTMLElement) {
        seekBar.style.display = "none";
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
  window.addEventListener("beforeunload", () => window.clearInterval(interval));
})();
