(function () {
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    @keyframes friends-rgb-name {
      0% { color: #fca5a5; text-shadow: 0 0 12px rgba(252,165,165,0.55); }
      33% { color: #c4b5fd; text-shadow: 0 0 12px rgba(196,181,253,0.55); }
      66% { color: #93c5fd; text-shadow: 0 0 12px rgba(147,197,253,0.55); }
      100% { color: #fca5a5; text-shadow: 0 0 12px rgba(252,165,165,0.55); }
    }

    .friend-rgb-name {
      animation: friends-rgb-name 3.2s linear infinite;
    }
  `;
  document.head.appendChild(styleTag);

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
          className: "friend-rgb-name inline-block",
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

  function createMember(member, index) {
    const node = document.createElement(member.href ? "a" : "div");
    node.className =
      "flex flex-col items-center gap-2 transition-all duration-300 ease-out";
    node.style.opacity = "0";
    node.style.transform = "translateX(14px)";
    node.style.transition = `opacity 220ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 40}ms, transform 220ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 40}ms`;

    if (member.href) {
      node.href = member.href;
      node.target = "_blank";
      node.rel = "noreferrer";
      node.style.textDecoration = "none";
    }

    let avatar;
    if (member.image) {
      avatar = document.createElement("img");
      avatar.src = member.image;
      avatar.alt = `${member.name} profile`;
      avatar.className = "border border-zinc-700 object-cover";
      avatar.style.width = "88px";
      avatar.style.height = "88px";
    } else {
      avatar = document.createElement("div");
      avatar.className =
        "flex items-center justify-center border border-zinc-700 bg-zinc-900 text-xl uppercase text-zinc-300";
      avatar.style.width = "88px";
      avatar.style.height = "88px";
      avatar.textContent = member.name.charAt(0);
    }

    const label = document.createElement("span");
    label.className = `${member.className || "text-white"} text-center`;
    label.textContent = member.name;
    if (member.style) {
      Object.assign(label.style, member.style);
    }
    label.style.opacity = "0";
    label.style.transform = "translateY(8px)";
    label.style.transition = `opacity 200ms cubic-bezier(0.22, 1, 0.36, 1) ${60 + index * 40}ms, transform 200ms cubic-bezier(0.22, 1, 0.36, 1) ${60 + index * 40}ms`;
    node.appendChild(avatar);
    node.appendChild(label);

    requestAnimationFrame(() => {
      node.style.opacity = "1";
      node.style.transform = "translateX(0)";
      label.style.opacity = "1";
      label.style.transform = "translateY(0)";
    });

    return node;
  }

  function enhanceFriendsCard() {
    const headings = Array.from(document.querySelectorAll("h2"));
    const heading = headings.find((node) => node.textContent.trim().toLowerCase() === "my friends");
    if (!heading) return false;

    const card = heading.closest(".border");
    if (!card || card.dataset.friendsMenuEnhanced === "true") return false;
    card.dataset.friendsMenuEnhanced = "true";

    const oldContent = Array.from(card.children).find((child) => child !== heading);
    if (oldContent) oldContent.remove();

    const layout = document.createElement("div");
    layout.className = "space-y-6 text-sm";

    const buttonColumn = document.createElement("div");
    buttonColumn.className = "flex flex-wrap gap-2";

    const panel = document.createElement("div");
    panel.className = "border border-zinc-800 p-4";

    const title = document.createElement("p");
    title.className = "mb-3 inline-block";

    const list = document.createElement("div");
    list.className = "flex flex-wrap gap-4";

    let isAnimating = false;

    function paintGroup(activeGroup) {
      title.className = `mb-3 inline-block ${activeGroup.accentClass}`;
      title.textContent = activeGroup.label;
      title.style.color = "";
      title.style.textShadow = "";
      if (activeGroup.accentStyle) {
        Object.assign(title.style, activeGroup.accentStyle);
      }
      title.style.opacity = "0";
      title.style.transform = "translateX(14px)";
      title.style.transition = "opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 200ms cubic-bezier(0.22, 1, 0.36, 1)";
      list.innerHTML = "";
      activeGroup.members.forEach((member, index) => list.appendChild(createMember(member, index)));
      buttons.forEach(({ button, id, group }) => {
        const active = id === activeGroup.id;
        button.className = active
          ? "border px-2 py-1 text-left text-xs transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(255,255,255,0.08)] active:translate-y-0 border-zinc-600 text-white bg-zinc-900"
          : "border px-2 py-1 text-left text-xs transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(255,255,255,0.08)] active:translate-y-0 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900";
        const label = button.querySelector("span");
        if (label && group.accentStyle) {
          Object.assign(label.style, group.accentStyle);
        }
      });

      requestAnimationFrame(() => {
        title.style.opacity = "1";
        title.style.transform = "translateX(0)";
      });
    }

    function renderGroup(group) {
      if (isAnimating) return;
      isAnimating = true;

      list.style.transition = "opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 200ms cubic-bezier(0.22, 1, 0.36, 1)";
      list.style.opacity = "0";
      list.style.transform = "translateX(-18px)";

      window.setTimeout(() => {
        paintGroup(group);
        list.style.opacity = "0";
        list.style.transform = "translateX(18px)";

        requestAnimationFrame(() => {
          list.style.opacity = "1";
          list.style.transform = "translateX(0)";
        });

        window.setTimeout(() => {
          isAnimating = false;
        }, 220);
      }, 110);
    }

    const buttons = friendGroups.map((group) => {
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = `<span class="${group.accentClass}">${group.label}</span>`;
      const label = button.querySelector("span");
      if (label && group.accentStyle) {
        Object.assign(label.style, group.accentStyle);
      }
      button.addEventListener("click", function () {
        renderGroup(group);
      });
      buttonColumn.appendChild(button);
      return { id: group.id, button, group };
    });

    panel.appendChild(title);
    panel.appendChild(list);
    layout.appendChild(buttonColumn);
    layout.appendChild(panel);
    card.appendChild(layout);

    paintGroup(friendGroups[0]);
    return true;
  }

  const interval = window.setInterval(function () {
    if (enhanceFriendsCard()) {
      window.clearInterval(interval);
    }
  }, 250);

  window.addEventListener("load", enhanceFriendsCard);
})();
