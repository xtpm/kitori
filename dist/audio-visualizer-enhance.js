const BAR_COUNT = 20;
let audioContext;
let analyser;
let sourceNode;
let animationFrameId;
let nyandereOutlineIntervalId = null;
let nyanderePresenceIntervalId = null;

function animateNyanderePreviewReorder(targetId) {
  const center = document.querySelector(".nyandere-preview-center");
  const about = document.getElementById("nyandere-about");
  const socials = document.getElementById("nyandere-socials");
  const friends = document.getElementById("nyandere-friends");
  const lower = center?.querySelector(".nyandere-preview-lower");
  if (!(center instanceof HTMLElement) || !(about instanceof HTMLElement) || !(socials instanceof HTMLElement) || !(friends instanceof HTMLElement) || !(lower instanceof HTMLElement)) {
    return;
  }

  const cards = [about, socials, friends];
  const firstRects = new Map(cards.map((card) => [card, card.getBoundingClientRect()]));
  const orderMap = {
    "nyandere-about": [about, socials, friends],
    "nyandere-socials": [socials, about, friends],
    "nyandere-friends": [friends, about, socials],
  };
  const targetOrder = orderMap[targetId];
  if (!targetOrder) {
    return;
  }
  const isAlreadyOrdered =
    Array.from(center.children).slice(0, 3).every((child, index) => child === targetOrder[index]) &&
    center.lastElementChild === lower;
  if (isAlreadyOrdered) {
    return;
  }
  targetOrder.forEach((card) => center.appendChild(card));
  center.appendChild(lower);

  cards.forEach((card) => {
    const first = firstRects.get(card);
    if (!first) {
      return;
    }
    const last = card.getBoundingClientRect();
    const deltaY = first.top - last.top;
    if (Math.abs(deltaY) < 1) {
      return;
    }
    card.animate(
      [
        { transform: `translateY(${deltaY}px)` },
        { transform: "translateY(0)" },
      ],
      {
        duration: 450,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    );
  });
}

function isNyanderePath() {
  return window.location.pathname.replace(/\/+$/, "") === "/nyandere";
}

function getNyandereStatusColor(status) {
  return {
    online: "#22c55e",
    idle: "#facc15",
    dnd: "#ef4444",
    offline: "#71717a",
  }[status] || "#71717a";
}

function getNyandereActivityAssetUrl(applicationId, image) {
  if (!image) return null;
  if (image.startsWith("mp:external/")) {
    return `https://media.discordapp.net/external/${image.replace("mp:external/", "")}`;
  }
  if (!applicationId) return null;
  return `https://cdn.discordapp.com/app-assets/${applicationId}/${image}.png`;
}

function getNyandereAvatarUrl(discordUser) {
  if (!discordUser?.id) return null;
  if (discordUser.avatar) {
    const ext = discordUser.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${ext}?size=256`;
  }

  const fallbackIndex = Number((BigInt(discordUser.id) >> 22n) % 6n);
  return `https://cdn.discordapp.com/embed/avatars/${fallbackIndex}.png`;
}

function formatNyandereDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}


function renderNyanderePresenceCard(data) {
  const shell = document.getElementById("nyandere-lanyard-card");
  if (!shell) {
    return;
  }

  const profile = data?.data || null;
  const discordUser = profile?.discord_user;
  const avatar = getNyandereAvatarUrl(discordUser);
  const customStatus = profile?.activities?.find((activity) => activity.type === 4);
  const richActivity = profile?.activities?.find((activity) => activity.type === 0);
  const spotify = profile?.spotify;
  const status = profile?.discord_status || "offline";
  const spotifyStart = spotify?.timestamps?.start ?? null;
  const spotifyEnd = spotify?.timestamps?.end ?? null;
  const spotifyDuration = spotifyStart && spotifyEnd ? Math.max(spotifyEnd - spotifyStart, 0) : 0;
  const spotifyElapsed = spotifyStart && spotifyEnd ? Math.max(0, Math.min(Date.now() - spotifyStart, spotifyDuration)) : 0;
  const spotifyProgress = spotifyDuration > 0 ? (spotifyElapsed / spotifyDuration) * 100 : 0;
  const activityImage = getNyandereActivityAssetUrl(
    richActivity?.application_id,
    richActivity?.assets?.large_image,
  );

  shell.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;align-items:flex-start;gap:16px;">
        <div style="width:80px;flex-shrink:0;">
          ${
            avatar
              ? `<img src="${avatar}" alt="Discord avatar" style="width:100%;aspect-ratio:1/1;object-fit:cover;border:1px solid rgba(61,236,255,0.82);" />`
              : `<div style="display:flex;align-items:center;justify-content:center;aspect-ratio:1/1;border:1px solid rgba(61,236,255,0.82);background:#ffffff;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#111827;">offline</div>`
          }
        </div>
        <div style="min-width:0;flex:1;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <div style="font-size:22px;line-height:1;color:#111827;">${discordUser?.global_name || discordUser?.username || "tpm"}</div>
            <span style="font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:${getNyandereStatusColor(status)};">${status}</span>
          </div>
          <div style="margin-top:6px;color:#425466;">@${discordUser?.username || "xtpm"}</div>
          ${
            customStatus?.state
              ? `<div style="margin-top:10px;line-height:1.7;color:#111827;">${customStatus.state}</div>`
              : ""
          }
        </div>
      </div>

      ${
        spotify
          ? `<div style="border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.12);padding:12px;">
              <div style="font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(17,24,39,0.7);">now playing</div>
              <div style="display:flex;align-items:center;gap:12px;margin-top:8px;">
                <img src="${spotify.album_art_url}" alt="Album art" style="width:48px;height:48px;object-fit:cover;border:1px solid rgba(61,236,255,0.82);" />
                <div style="min-width:0;">
                  <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#111827;">${spotify.song}</div>
                  <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#425466;">${spotify.artist}</div>
                </div>
              </div>
              <div style="margin-top:12px;">
                <div style="height:6px;width:100%;overflow:hidden;background:#d8faff;">
                  <div style="height:100%;width:${spotifyProgress}%;background:#3decff;"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:#425466;">
                  <span>${formatNyandereDuration(spotifyElapsed)}</span>
                  <span>${formatNyandereDuration(spotifyDuration)}</span>
                </div>
              </div>
            </div>`
          : richActivity
            ? `<div style="border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.12);padding:12px;">
                <div style="font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(17,24,39,0.7);">activity</div>
                <div style="display:flex;align-items:center;gap:12px;margin-top:8px;">
                  ${
                    activityImage
                      ? `<img src="${activityImage}" alt="Activity asset" style="width:48px;height:48px;object-fit:cover;border:1px solid rgba(61,236,255,0.82);" />`
                      : ""
                  }
                  <div style="min-width:0;">
                    <div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#111827;">${richActivity.name || "Active now"}</div>
                    ${
                      richActivity.details
                        ? `<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#425466;">${richActivity.details}</div>`
                        : ""
                    }
                    ${
                      richActivity.state
                        ? `<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#0f172a;">${richActivity.state}</div>`
                        : ""
                    }
                  </div>
                </div>
              </div>`
            : `<div style="border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.12);padding:12px;">
                <div style="font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(17,24,39,0.7);">presence</div>
                <div style="margin-top:8px;color:#111827;">nothing active right now</div>
              </div>`
      }
    </div>
  `;
}

function startNyanderePresenceSync() {
  const fetchPresence = () => {
    fetch("https://api.lanyard.rest/v1/users/1270175700309115006")
      .then((response) => response.json())
      .then((data) => renderNyanderePresenceCard(data))
      .catch(() => renderNyanderePresenceCard(null));
  };

  fetchPresence();

  if (nyanderePresenceIntervalId) {
    return;
  }

  nyanderePresenceIntervalId = window.setInterval(fetchPresence, 30000);
}

function renderNyandereOutline() {
  if (!isNyanderePath()) {
    return false;
  }

  const root = document.getElementById("root");
  if (!root) {
    return false;
  }

  if (root.querySelector(".nyandere-preview-shell")) {
    startNyanderePresenceSync();
    return true;
  }

  const styleId = "nyandere-outline-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@600&display=swap');
      body {
        --ny-bg: #f4f7f4;
        --ny-panel: #ffffff;
        --ny-surface: #ffffff;
        --ny-surface-soft: #ffffff;
        --ny-tab: #3decff;
        --ny-border: #3decff;
        --ny-text: #111827;
        --ny-muted: #425466;
        margin: 0;
        font-family: "Inter", sans-serif;
        font-weight: 600;
        background: var(--ny-bg);
        color: var(--ny-text);
        scroll-behavior: smooth;
      }
      .nyandere-preview-shell {
        min-height: 100vh;
        padding: 32px 16px;
        position: relative;
        overflow: hidden;
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
      @keyframes nyanderePreviewFadeRise {
        from {
          opacity: 0;
          transform: translateY(18px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .nyandere-preview-load-in {
        opacity: 0;
        animation: nyanderePreviewFadeRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        will-change: opacity, transform;
      }
      .nyandere-preview-delay-1 {
        animation-delay: 0.18s;
      }
      .nyandere-preview-delay-2 {
        animation-delay: 0.28s;
      }
      .nyandere-preview-delay-3 {
        animation-delay: 0.42s;
      }
      .nyandere-preview-delay-4 {
        animation-delay: 0.56s;
      }
      .nyandere-preview-panel {
        max-width: 1120px;
        margin: 0 auto;
        border: 1px solid rgba(61,236,255,0.92);
        background: var(--ny-panel);
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,0.9),
          0 0 0 1px rgba(61,236,255,0.22),
          0 14px 30px rgba(61,236,255,0.14);
        padding: 24px;
      }
      .nyandere-preview-inner,
      .nyandere-preview-box,
      .nyandere-preview-tab {
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.55);
      }
      .nyandere-preview-inner {
        border: 1px solid rgba(61,236,255,0.88);
        background: var(--ny-surface-soft);
        overflow: hidden;
      }
      .nyandere-preview-banner {
        position: relative;
        min-height: 210px;
        padding: 44px 40px 20px;
        border-bottom: 1px solid rgba(61, 236, 255, 0.42);
        background: #ffffff;
      }
      .nyandere-preview-banner-grid {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-start;
      }
      .nyandere-preview-kicker {
        font-size: 11px;
        letter-spacing: 0.35em;
        text-transform: none;
        color: rgba(200, 193, 219, 0.85);
      }
      @keyframes nyanderePreviewRgbShift {
        0% {
          color: #ff4d4d;
          text-shadow: 0 0 8px rgba(255,77,77,0.22);
        }
        33% {
          color: #ffd24d;
          text-shadow: 0 0 8px rgba(255,210,77,0.22);
        }
        66% {
          color: #4dd2ff;
          text-shadow: 0 0 8px rgba(77,210,255,0.22);
        }
        100% {
          color: #b84dff;
          text-shadow: 0 0 8px rgba(184,77,255,0.22);
        }
      }
      .nyandere-preview-kicker-rgb {
        animation: nyanderePreviewRgbShift 6s linear infinite;
      }
      .nyandere-preview-title {
        display: inline-block;
        margin-top: 88px;
        transform: translateX(-10px);
        font-size: clamp(32px, 4vw, 52px);
        font-style: italic;
        font-family: "Cormorant Garamond", serif;
        font-weight: 700;
        letter-spacing: 0.01em;
        line-height: 0.95;
        background: none;
        -webkit-background-clip: text;
        background-clip: text;
        color: var(--ny-text);
        filter: drop-shadow(0 0 10px rgba(244,247,244,0.08));
      }
      .nyandere-preview-copy {
        max-width: 520px;
        margin-top: 16px;
        font-size: 14px;
        line-height: 1.9;
        color: var(--ny-muted);
      }
      .nyandere-preview-shell,
      .nyandere-preview-shell * {
        font-family: "Inter", sans-serif;
        font-weight: 600;
        color: var(--ny-text);
      }
      .nyandere-preview-note-panel,
      .nyandere-preview-box,
      .nyandere-preview-tab {
        border: 1px solid rgba(223,238,242,0.72);
        background: var(--ny-surface-soft);
      }
      .nyandere-preview-note-panel {
        width: 240px;
        max-width: 100%;
        padding: 16px;
        font-size: 12px;
        line-height: 1.8;
        color: var(--ny-muted);
      }
      .nyandere-preview-tabs {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 8px;
        padding: 10px 12px;
        border-bottom: 1px solid rgba(223, 238, 242, 0.32);
        background: var(--ny-bg);
      }
      .nyandere-preview-tab {
        padding: 10px 12px;
        text-align: center;
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 0.2em;
        color: var(--ny-text);
        background: rgba(61,236,255,0.18);
      }
      .nyandere-preview-tab-link {
        display: block;
        color: #ffffff;
        text-decoration: none;
      }
      .nyandere-preview-grid {
        display: grid;
        grid-template-columns: 220px minmax(0, 1fr);
        gap: 16px;
        padding: 16px;
        background: #0f0f14;
      }
      .nyandere-preview-box {
        padding: 12px;
      }
      .nyandere-preview-sidebar-head {
        padding: 10px 12px;
        font-size: 28px;
        line-height: 1;
        color: var(--ny-text);
        background: var(--ny-panel);
        border: 1px solid rgba(223,238,242,0.72);
      }
      .nyandere-preview-list {
        margin-top: 12px;
        display: grid;
        gap: 8px;
        font-size: 14px;
      }
      .nyandere-preview-list div {
        padding: 10px 12px;
        color: var(--ny-text);
        border: 1px solid rgba(61,236,255,0.82);
        background: #ffffff;
      }
      .nyandere-preview-list a {
        display: block;
        padding: 10px 12px;
        color: var(--ny-text) !important;
        border: 1px solid rgba(61,236,255,0.82);
        background: rgba(61,236,255,0.08);
        text-decoration: none;
        transition:
          transform 0.18s ease,
          border-color 0.18s ease,
          background-color 0.18s ease,
          color 0.18s ease;
      }
      .nyandere-preview-list a:hover {
        transform: translateX(4px);
        border-color: rgba(61,236,255,1);
        background: rgba(61,236,255,0.18);
        color: var(--ny-text) !important;
      }
      .nyandere-preview-social-card {
        transition:
          transform 0.35s ease,
          border-color 0.35s ease,
          background-color 0.35s ease,
          box-shadow 0.35s ease;
      }
      .nyandere-preview-social-card:hover {
        transform: translateY(-3px);
        border-color: rgba(61,236,255,1) !important;
        background: rgba(61,236,255,0.18) !important;
        box-shadow: 0 0 18px rgba(61,236,255,0.24);
      }
      .nyandere-preview-friend-card {
        transition:
          transform 0.35s ease,
          border-color 0.35s ease,
          background-color 0.35s ease,
          box-shadow 0.35s ease;
      }
      .nyandere-preview-friend-card:hover {
        transform: translateY(-3px);
        border-color: rgba(61,236,255,1) !important;
        background: rgba(61,236,255,0.18) !important;
        box-shadow: 0 0 18px rgba(61,236,255,0.24);
      }
      .nyandere-preview-center {
        display: grid;
        gap: 16px;
      }
      .nyandere-preview-welcome {
        overflow: hidden;
      }
      .nyandere-preview-welcome-head {
        padding: 12px 16px;
        border-bottom: 1px solid rgba(61, 236, 255, 0.5);
        background: #ffffff;
      }
      .nyandere-preview-welcome-head h2 {
        margin: 0;
        color: var(--ny-text);
        font-size: 30px;
        font-style: italic;
        filter: drop-shadow(0 0 8px rgba(244,247,244,0.16));
      }
      .nyandere-preview-welcome-body {
        padding: 16px;
        color: var(--ny-muted);
        font-size: 14px;
        line-height: 1.9;
      }
      .nyandere-preview-dashed {
        margin-top: 16px;
        border: 2px dashed rgba(61,236,255,0.6);
        background: rgba(61,236,255,0.08);
        padding: 16px;
        color: var(--ny-muted);
      }
      .nyandere-preview-lower {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 220px;
        gap: 16px;
      }
      .nyandere-preview-placeholder {
        min-height: 240px;
        font-size: 14px;
        line-height: 1.9;
        color: var(--ny-muted);
        border: 1px dashed rgba(223,238,242,0.72);
        background: rgba(127,128,153,0.18);
        padding: 20px;
      }
      .nyandere-preview-micro h3 {
        margin: 0;
        color: var(--ny-text);
        font-size: 18px;
      }
      .nyandere-preview-footer {
        padding: 14px 24px;
        text-align: center;
        font-size: 11px;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: #d8d2e7;
        background: #050506;
        border-top: 1px solid rgba(244, 114, 182, 0.32);
      }
      @media (max-width: 900px) {
        .nyandere-preview-tabs,
        .nyandere-preview-grid,
        .nyandere-preview-lower {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  root.innerHTML = `
    <div class="nyandere-preview-shell">
      <div class="nyandere-opening-layer">
        <div class="nyandere-opening-wash"></div>
        <div class="nyandere-opening-grid"></div>
        <div class="nyandere-opening-glow"></div>
      </div>
      <div class="nyandere-preview-panel nyandere-preview-load-in" style="position:relative;z-index:1;">
        <div class="nyandere-preview-inner">
          <div class="nyandere-preview-banner" id="nyandere-index">
            <div class="nyandere-preview-banner-grid">
                <div>
                  <div class="nyandere-preview-kicker nyandere-preview-kicker-rgb">/nyandere</div>
                  <div class="nyandere-preview-title">nyandere's blog &gt;_&lt;</div>
                </div>
            </div>
          </div>

          <div class="nyandere-preview-grid">
            <div class="nyandere-preview-box nyandere-preview-load-in nyandere-preview-delay-2" id="nyandere-links">
              <div class="nyandere-preview-sidebar-head">links</div>
              <div class="nyandere-preview-list">
                <a href="#nyandere-about">about me</a>
                <a href="#nyandere-socials">socials</a>
                <a href="#nyandere-friends">friends</a>
                <a href="#nyandere-gallery">extra</a>
              </div>
              <div style="margin-top:16px;border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.18);padding:16px;text-align:center;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#111827;">
                personal bookmarks
              </div>
            </div>

            <div class="nyandere-preview-center nyandere-preview-load-in nyandere-preview-delay-3">
              <div class="nyandere-preview-box nyandere-preview-welcome" id="nyandere-about">
                <div class="nyandere-preview-welcome-head">
                  <h2>about me</h2>
                </div>
                <div class="nyandere-preview-welcome-body">
                  <div>
                    i can spend all night playing overwatch, looping the same songs i love, and getting
                    way too attached to visual novels. i love cats most of all, especially my cat pearl,
                    and i want this page to feel like a small personal space filled with the things that
                    make me happiest.
                  </div>
                </div>
              </div>

              <div class="nyandere-preview-box" id="nyandere-socials">
                <div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:12px;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#111827;">
                  <span>socials</span>
                </div>
                <div style="display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr));">
                  <a class="nyandere-preview-social-card" href="https://www.tiktok.com/@webentries" target="_blank" rel="noreferrer" style="display:block;border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.14);padding:12px 16px;text-decoration:none;">
                    <div style="font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(17,24,39,0.8);">tiktok</div>
                    <div style="margin-top:8px;color:#111827;">@webentries</div>
                  </a>
                  <a class="nyandere-preview-social-card" href="https://www.instagram.com/daintycatgirl/" target="_blank" rel="noreferrer" style="display:block;border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.14);padding:12px 16px;text-decoration:none;">
                    <div style="font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(17,24,39,0.8);">instagram</div>
                    <div style="margin-top:8px;color:#111827;">@daintycatgirl</div>
                  </a>
                  <a class="nyandere-preview-social-card" href="https://x.com/daintycatgirl" target="_blank" rel="noreferrer" style="display:block;border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.14);padding:12px 16px;text-decoration:none;">
                    <div style="font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(17,24,39,0.8);">twitter</div>
                    <div style="margin-top:8px;color:#111827;">@daintycatgirl</div>
                  </a>
                  <a class="nyandere-preview-social-card" href="https://t.me/fawndere" target="_blank" rel="noreferrer" style="display:block;border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.14);padding:12px 16px;text-decoration:none;">
                    <div style="font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:rgba(17,24,39,0.8);">telegram</div>
                    <div style="margin-top:8px;color:#111827;">@fawndere</div>
                  </a>
                </div>
              </div>

              <div class="nyandere-preview-box" id="nyandere-friends">
                <div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:12px;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#f4efe6;">
                  <span>friends</span>
                </div>
                <div style="display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr));">
                  <a class="nyandere-preview-friend-card" href="https://kuudere.cc" target="_blank" rel="noreferrer" style="display:block;border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.14);padding:12px 16px;color:#111827;text-decoration:none;">dylan</a>
                  <div class="nyandere-preview-friend-card" style="border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.14);padding:12px 16px;color:#111827;">shad</div>
                  <div class="nyandere-preview-friend-card" style="border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.14);padding:12px 16px;color:#111827;">jace</div>
                  <div class="nyandere-preview-friend-card" style="border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.14);padding:12px 16px;color:#111827;">niko</div>
                  <div class="nyandere-preview-friend-card" style="border:1px solid rgba(61,236,255,0.82);background:rgba(61,236,255,0.14);padding:12px 16px;color:#111827;">jazzie</div>
                </div>
              </div>

              <div class="nyandere-preview-lower">
                <div class="nyandere-preview-box" id="nyandere-gallery">
                  <div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:12px;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#f4efe6;">
                    <span>profile card</span>
                    <span>live status</span>
                  </div>
                  <div class="nyandere-preview-placeholder" id="nyandere-lanyard-card">
                    loading presence...
                  </div>
                </div>

                <div class="nyandere-preview-box nyandere-preview-micro" id="nyandere-interests">
                  <h3>interests</h3>
                  <div style="margin-top:12px;display:grid;gap:12px;font-size:14px;line-height:1.7;color:#f4efe6;">
                    <div>overwatch</div>
                    <div>roblox</div>
                    <div>visual novels</div>
                    <div>music (ptv, malcolm todd, dominic fike)</div>
                    <div>cats</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  startNyanderePresenceSync();

  root.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");
      if (!href) {
        return;
      }
      if (href === "#nyandere-socials") {
        event.preventDefault();
        animateNyanderePreviewReorder("nyandere-socials");
        window.history.replaceState(null, "", href);
        return;
      }
      if (href === "#nyandere-friends") {
        event.preventDefault();
        animateNyanderePreviewReorder("nyandere-friends");
        window.history.replaceState(null, "", href);
        return;
      }
      if (href === "#nyandere-about") {
        event.preventDefault();
        animateNyanderePreviewReorder("nyandere-about");
        window.history.replaceState(null, "", href);
        return;
      }
      const target = document.querySelector(href);
      if (!(target instanceof HTMLElement)) {
        return;
      }
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({ top, behavior: "smooth" });
      window.history.replaceState(null, "", href);
    });
  });

  return true;
}

function ensureNyandereOutlinePersistent() {
  if (!isNyanderePath()) {
    return false;
  }

  renderNyandereOutline();

  if (nyandereOutlineIntervalId) {
    return true;
  }

  nyandereOutlineIntervalId = window.setInterval(() => {
    renderNyandereOutline();
  }, 250);

  return true;
}

function ensureRgbProjectStyle() {
  if (document.getElementById("kuudere-project-rgb-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "kuudere-project-rgb-style";
  style.textContent = `
    .kuudere-project-rgb {
      display: inline-block;
      background: linear-gradient(90deg, #ff4d4d, #ffd24d, #4dff88, #4dd2ff, #b84dff, #ff4db8, #ff4d4d);
      background-size: 300% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      color: #f0edf7;
      animation: rgbshift 3s linear infinite;
      filter: drop-shadow(0 0 10px rgba(255, 120, 210, 0.28))
        drop-shadow(0 0 18px rgba(120, 210, 255, 0.2));
    }
    .mint-active-glow {
      color: rgb(110 231 183);
      text-shadow: 0 0 10px rgba(110, 231, 183, 0.85), 0 0 18px rgba(110, 231, 183, 0.45);
    }
  `;

  document.head.appendChild(style);
}

function syncKuudereProjectTitles() {
  document.querySelectorAll("p").forEach((node) => {
    const text = node.textContent?.trim();
    if (text === "kuudere.cc") {
      node.classList.add("kuudere-project-rgb");
    }
  });
}

function syncActiveStatusGlow() {
  document.querySelectorAll("p").forEach((node) => {
    const text = node.textContent?.trim()?.toLowerCase();
    if (text === "status: active" && !node.querySelector(".mint-active-glow")) {
      node.innerHTML = 'status: <span class="mint-active-glow">active</span>';
    }
  });
}

function disableProjectCardLinks() {
  document.querySelectorAll('a').forEach((node) => {
    const title = node.querySelector('p')?.textContent?.trim();
    if (!title) {
      return;
    }

    const projectTitles = new Set(["kuudere.cc", "kobeni.net", "yotsuba.cc", "Luck Software"]);
    if (!projectTitles.has(title)) {
      return;
    }

    node.removeAttribute("href");
    node.removeAttribute("target");
    node.removeAttribute("rel");
    node.style.cursor = "default";
    node.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  });
}

function createBars(container) {
  const bars = [];
  container.innerHTML = "";

  for (let index = 0; index < BAR_COUNT; index += 1) {
    const bar = document.createElement("span");
    bar.style.display = "block";
    bar.style.flex = "1 1 0";
    bar.style.minWidth = "0";
    bar.style.height = "14%";
    bar.style.background = "rgb(110 231 183)";
    bar.style.borderRadius = "1px";
    bar.style.boxShadow = "0 0 10px rgba(110,231,183,0.8)";
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
  if (ensureNyandereOutlinePersistent()) {
    return;
  }

  ensureRgbProjectStyle();
  syncKuudereProjectTitles();
  syncActiveStatusGlow();
  disableProjectCardLinks();

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
  audio.autoplay = false;
  audio.preload = "metadata";
  audio.playsInline = true;

  const visualizer = document.createElement("div");
  visualizer.style.marginTop = "12px";
  visualizer.style.display = "flex";
  visualizer.style.alignItems = "end";
  visualizer.style.justifyContent = "space-between";
  visualizer.style.gap = "2px";
  visualizer.style.height = "32px";
  visualizer.style.overflow = "hidden";
  visualizer.style.border = "1px solid rgba(110,231,183,0.3)";
  visualizer.style.background = "rgba(9,9,11,0.6)";
  visualizer.style.padding = "4px 8px";
  visualizer.style.boxShadow = "0 0 18px rgba(110,231,183,0.12)";

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

}

enhancePlayer();

const projectTitleObserver = new MutationObserver(() => {
  if (isNyanderePath()) {
    renderNyandereOutline();
    return;
  }

  syncKuudereProjectTitles();
  syncActiveStatusGlow();
  disableProjectCardLinks();
});

projectTitleObserver.observe(document.body, {
  childList: true,
  subtree: true,
});
