const BAR_COUNT = 20;
let audioContext;
let analyser;
let sourceNode;
let animationFrameId;

function createBars(container) {
  const bars = [];
  container.innerHTML = "";

  for (let index = 0; index < BAR_COUNT; index += 1) {
    const bar = document.createElement("span");
    bar.style.flex = "1";
    bar.style.display = "block";
    bar.style.height = "14%";
    bar.style.background = "rgba(255,255,255,0.9)";
    bar.style.opacity = "0.45";
    bar.style.transition = "height 140ms ease, opacity 140ms ease";
    container.appendChild(bar);
    bars.push(bar);
  }

  return bars;
}

function animateBars(audio, bars) {
  if (!analyser) {
    return;
  }

  const data = new Uint8Array(analyser.frequencyBinCount);

  const renderFrame = () => {
    analyser.getByteFrequencyData(data);

    const bucketSize = Math.max(1, Math.floor(data.length / BAR_COUNT));

    bars.forEach((bar, index) => {
      const start = index * bucketSize;
      const end = Math.min(data.length, start + bucketSize);
      let total = 0;

      for (let cursor = start; cursor < end; cursor += 1) {
        total += data[cursor];
      }

      const average = end > start ? total / (end - start) : 0;
      const normalized = average / 255;
      const height = audio.paused ? 14 : Math.max(18, normalized * 100);

      bar.style.height = `${height}%`;
      bar.style.opacity = audio.paused ? "0.45" : "1";
    });

    animationFrameId = window.requestAnimationFrame(renderFrame);
  };

  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId);
  }

  renderFrame();
}

async function connectVisualizer(audio, bars) {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    return;
  }

  if (!audioContext) {
    audioContext = new AudioContextCtor();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.82;

    sourceNode = audioContext.createMediaElementSource(audio);
    sourceNode.connect(analyser);
    analyser.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    try {
      await audioContext.resume();
    } catch {
      return;
    }
  }

  animateBars(audio, bars);
}

function enhancePlayer() {
  const audio = document.querySelector("audio");
  const title = Array.from(document.querySelectorAll("p")).find(
    (node) => node.textContent?.trim() === "Dancing with your eyes closed",
  );

  if (!audio || !title) {
    window.setTimeout(enhancePlayer, 250);
    return;
  }

  const player = title.closest(".fixed");
  const metaText = Array.from(player?.querySelectorAll("p") || []).find(
    (node) => node.textContent?.trim() === "background player",
  );

  if (!player || !metaText) {
    return;
  }

  metaText.remove();
  audio.autoplay = true;
  audio.preload = "auto";
  audio.playsInline = true;

  const visualizer = document.createElement("div");
  visualizer.style.marginTop = "12px";
  visualizer.style.display = "flex";
  visualizer.style.alignItems = "end";
  visualizer.style.gap = "4px";
  visualizer.style.height = "32px";
  visualizer.style.overflow = "hidden";
  visualizer.style.border = "1px solid rgb(39 39 42)";
  visualizer.style.background = "rgba(9,9,11,0.6)";
  visualizer.style.padding = "4px 8px";

  const bars = createBars(visualizer);

  const topRow = player.firstElementChild;
  if (topRow?.nextSibling) {
    player.insertBefore(visualizer, topRow.nextSibling);
  } else {
    player.appendChild(visualizer);
  }

  const bootVisualizer = () => {
    connectVisualizer(audio, bars);
  };

  audio.addEventListener("play", bootVisualizer);
  audio.addEventListener("pause", () => {
    bars.forEach((bar) => {
      bar.style.height = "14%";
      bar.style.opacity = "0.45";
    });
  });

  player.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", bootVisualizer);
  });

  const ranges = player.querySelectorAll('input[type="range"]');
  const seekSlider = ranges[ranges.length - 1];
  if (seekSlider) {
    seekSlider.remove();
  }

  const startPlayback = async () => {
    try {
      await audio.play();
      bootVisualizer();
    } catch {
      return;
    }
  };

  startPlayback();

  audio.addEventListener("loadeddata", startPlayback);
  audio.addEventListener("canplay", startPlayback);
  window.addEventListener("pageshow", startPlayback);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      startPlayback();
    }
  });

  const resumePlayback = () => {
    startPlayback();
  };

  window.addEventListener("pointerdown", resumePlayback, { once: true });
  window.addEventListener("keydown", resumePlayback, { once: true });
}

enhancePlayer();
