// Lightweight interactions for this static portfolio.
// - loader hide
// - mobile nav open/close
// - project modal open/close + simple embed switching

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Case study links (used by project card clicks + cursor label)
const PROJECT_CASE_STUDIES = {
  "smart-analysis":
    "https://www.figma.com/proto/nOWVeJIwIkZxu95sFbAVcg/Smart-Analysis?node-id=188-21&t=5vwn3qgVNJf9gY22-1&scaling=scale-down-width&content-scaling=fixed&page-id=13%3A12",
  chatbot:
    "https://www.figma.com/proto/aSKfrVEm8NCnuUFps3HH4u/Gru-Chatbot?node-id=3-405&t=sQ9SfE1NrdD9dSdY-1&scaling=min-zoom&content-scaling=fixed&page-id=3%3A401",
  "navi-mumbai":
    "https://www.figma.com/proto/qCdYV3xTJmBDqE6iM8t0s0/Navi-Mumbai-Case-Study?node-id=76-2&t=M8mRYPnRtbOG5f6G-1&scaling=scale-down-width&content-scaling=fixed&page-id=0%3A1",
  cricter: "",
};

function setAriaExpanded(el, value) {
  if (!el) return;
  el.setAttribute("aria-expanded", value ? "true" : "false");
}

// Loader
window.addEventListener("load", () => {
  const loader = qs(".loader");
  if (!loader) return;
  loader.classList.add("is-hidden");
});

// Navigation (scrolled state + hide-on-scroll + active link)
(() => {
  const nav = qs(".nav");
  if (!nav) return;

  const navLinks = qsa(".nav-link", nav);
  const sections = qsa("section[id]");

  let lastScrollY = window.scrollY || 0;

  const update = () => {
    const currentScroll = window.scrollY || 0;

    // Background on scroll
    nav.classList.toggle("scrolled", currentScroll > 50);

    // Hide / show based on scroll direction
    if (currentScroll > lastScrollY && currentScroll > 400) {
      nav.style.transform = "translateY(-100%)";
    } else {
      nav.style.transform = "translateY(0)";
    }
    lastScrollY = currentScroll;

    // Active link highlighting
    if (!navLinks.length || !sections.length) return;

    let currentId = "";
    for (const section of sections) {
      const top = section.offsetTop - 200;
      const bottom = top + section.offsetHeight;
      if (currentScroll >= top && currentScroll < bottom) {
        currentId = section.getAttribute("id") || "";
        break;
      }
    }

    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      a.classList.toggle("active", Boolean(currentId) && href === `#${currentId}`);
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
})();

// Custom cursor (subtle; safe-guarded for touch devices)
(() => {
  const cursor = qs(".cursor");
  const follower = qs(".cursor-follower");
  const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;
  if (!cursor || !follower || !finePointer) return;

  let x = 0;
  let y = 0;
  let fx = 0;
  let fy = 0;
  let hoverProject = false;

  const setFollowerLabel = (label) => {
    follower.setAttribute("data-label", label ? String(label) : "");
  };

  // Default: no label.
  setFollowerLabel("");

  window.addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  });

  const tick = () => {
    fx += (x - fx) * 0.12;
    fy += (y - fy) * 0.12;
    follower.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  tick();

  // Hover label for project cards (desktop / fine pointer only).
  qsa(".project-card").forEach((card) => {
    if (card.classList.contains("project-disabled")) return;

    card.addEventListener("mouseenter", () => {
      hoverProject = true;
      const key = card.getAttribute("data-project") || "";
      const url = PROJECT_CASE_STUDIES[key] || "";
      setFollowerLabel(url ? "View Case Study" : "");
    });
    card.addEventListener("mouseleave", () => {
      hoverProject = false;
      setFollowerLabel("");
    });
  });

  // Safety: clear label if window loses focus while hovering.
  window.addEventListener("blur", () => {
    if (!hoverProject) return;
    hoverProject = false;
    setFollowerLabel("");
  });
})();

// Mobile nav
(() => {
  const toggle = qs(".mobile-nav-toggle");
  const mobileNav = qs("#mobileNav");
  if (!toggle || !mobileNav) return;

  const closeEls = qsa("[data-mobile-nav-close]", mobileNav);

  const open = () => {
    mobileNav.hidden = false;
    setAriaExpanded(toggle, true);
    toggle.setAttribute("aria-label", "Close menu");
  };

  const close = () => {
    mobileNav.hidden = true;
    setAriaExpanded(toggle, false);
    toggle.setAttribute("aria-label", "Open menu");
  };

  toggle.addEventListener("click", () => {
    if (mobileNav.hidden) open();
    else close();
  });

  closeEls.forEach((el) => el.addEventListener("click", close));

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  qsa("a", mobileNav).forEach((a) => a.addEventListener("click", close));
})();

// Journey marker scroll animation (circle moving down the rail as you scroll the section)
(() => {
  const section = qs("#journey");
  const track = qs(".journey-track");
  const marker = qs(".journey-marker");
  if (!section || !track || !marker) return;

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReducedMotion) return;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  let ticking = false;

  const update = () => {
    ticking = false;

    // Track is hidden on mobile layouts; don't do work in that case.
    if (window.getComputedStyle(track).display === "none") return;

    // Map progress to the "sticky window" of the section:
    // - start when the section reaches the sticky top offset
    // - end when the section bottom reaches the sticky element bottom
    const stickyTop = parseFloat(window.getComputedStyle(track).top) || 0;
    const start = section.offsetTop - stickyTop;
    const end = section.offsetTop + section.offsetHeight - stickyTop - track.clientHeight;
    const range = Math.max(1, end - start);
    const progress = clamp((window.scrollY - start) / range, 0, 1);

    const maxY = Math.max(0, track.clientHeight - marker.offsetHeight);
    marker.style.setProperty("--journey-marker-y", `${progress * maxY}px`);
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
})();

// Project cards -> open case study directly (no modal)
(() => {
  qsa(".project-card").forEach((card) => {
    if (card.classList.contains("project-disabled")) return;

    card.addEventListener("click", () => {
      const key = card.getAttribute("data-project") || "";
      const url = PROJECT_CASE_STUDIES[key] || "";
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  });
})();

// Copy email/phone + toast
(() => {
  const copyLinks = qsa("[data-copy-email], [data-copy-phone]");
  const toast = qs("#toast");
  if (!copyLinks.length || !toast) return;

  // Ensure the <a> has a useful href even if JS is running (for Ctrl/Cmd-click) and
  // also avoids the default "#" jump when handlers are not attached for some reason.
  copyLinks.forEach((link) => {
    const fallbackHref = link.getAttribute("data-mailto") || link.getAttribute("data-tel");
    if (fallbackHref) link.setAttribute("href", fallbackHref);
  });

  let toastTimer = null;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");

    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1800);
  };

  const fallbackCopy = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  };

  const isModifiedClick = (e) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1;

  copyLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      // Keep expected browser behavior for Cmd/Ctrl-click etc.
      if (isModifiedClick(e)) return;

      e.preventDefault();

      const value =
        link.getAttribute("data-copy-email") || link.getAttribute("data-copy-phone") || "";
      if (!value) return;

      const label = link.hasAttribute("data-copy-email") ? "Email" : "Phone number";

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          fallbackCopy(value);
        }
        showToast(`${label} copied`);
      } catch (_) {
        // If clipboard is blocked, try fallback once.
        try {
          fallbackCopy(value);
          showToast(`${label} copied`);
        } catch (_) {
          showToast(`Couldn't copy ${label.toLowerCase()}`);
        }
      }
    });
  });
})();

// Skills: scroll reveal + interactive glow tracking
(() => {
  const section = qs("#skills");
  if (!section) return;

  // Tool icon fallback: if an external SVG fails, replace with a monogram.
  qsa(".tool-logo img", section).forEach((img) => {
    img.addEventListener("error", () => {
      const wrap = img.closest(".tool-logo");
      if (!wrap) return;
      const fallback = wrap.getAttribute("data-fallback") || "";
      wrap.classList.add("is-fallback");
      if (fallback) wrap.textContent = fallback;
    });
  });

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const cards = qsa("[data-reveal]", section);

  // Stagger chip transitions per card for a "build" effect.
  cards.forEach((card) => {
    qsa(".skill-chip", card).forEach((chip, idx) => {
      chip.style.setProperty("--d", `${Math.min(idx * 28, 420)}ms`);
    });
    qsa(".tool-tile", card).forEach((tile, idx) => {
      tile.style.setProperty("--d", `${Math.min(idx * 24, 360)}ms`);
    });
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    cards.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { root: null, threshold: 0.18 },
    );

    cards.forEach((el) => io.observe(el));
  }

  // Pointer-follow glow (desktop only).
  const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;
  if (!finePointer) return;

  const tiltCards = qsa("[data-tilt]", section);
  tiltCards.forEach((card) => {
    card.style.setProperty("--mx", "50%");
    card.style.setProperty("--my", "22%");

    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty("--mx", `${Math.max(0, Math.min(100, x))}%`);
      card.style.setProperty("--my", `${Math.max(0, Math.min(100, y))}%`);
    };

    const onLeave = () => {
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "22%");
    };

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
  });
})();

// Tools: sticker wall canvas (drag + shuffle/reset + local save)
(() => {
  const wall = qs("[data-tools-wall]");
  if (!wall) return;

  const canvas = qs("#toolsWallCanvas", wall);
  const source = qs("[data-tools-source]", wall);
  if (!canvas || !source) return;

  const tools = qsa(".tool-tile", source)
    .map((tile) => {
      const name = qs(".tool-name", tile)?.textContent?.trim() || tile.textContent?.trim() || "";
      const id = tile.getAttribute("data-tool") || name.toLowerCase().replace(/\s+/g, "-");
      const logo = qs(".tool-logo", tile);
      const fallback =
        logo?.getAttribute("data-fallback") ||
        logo?.textContent?.trim() ||
        name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() || "")
          .join("");

      return { id, name, fallback };
    })
    .filter((t) => t.name);

  if (!tools.length) return;

  const STORAGE_KEY = "toolsWallLayout_v1";
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const rand = (min, max) => min + Math.random() * (max - min);

  // Sticky note palette (high readability on a darker wall)
  const palette = [
    { bg: "#FFF59D", fold: "#F3E37A" }, // yellow
    { bg: "#FFD6A5", fold: "#F4BA7A" }, // peach
    { bg: "#CAFFBF", fold: "#A9EFA0" }, // mint
    { bg: "#BDE0FE", fold: "#9AC7F2" }, // sky
    { bg: "#FFC6FF", fold: "#F1A5F1" }, // pink
  ];

  function buildLayout({ scatter = false } = {}) {
    const cols = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(tools.length))));
    const rows = Math.ceil(tools.length / cols);

    return tools.map((t, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const baseX = (col + 0.5) / cols;
      const baseY = (row + 0.5) / rows;

      return {
        id: t.id,
        name: t.name,
        fallback: t.fallback,
        x: clamp(baseX + rand(-0.06, 0.06), 0.08, 0.92),
        y: clamp(baseY + rand(-0.07, 0.07), 0.12, 0.90),
        // Keep rotation tiny for readability (sticky note vibe without making text hard to scan)
        rot: scatter ? rand(-0.07, 0.07) : rand(-0.05, 0.05),
        colorIndex: i % palette.length,
      };
    });
  }

  function loadLayout() {
    try {
      const raw = window.localStorage?.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;

      const byId = new Map(parsed.map((s) => [s?.id, s]));
      const out = tools
        .map((t, i) => {
          const saved = byId.get(t.id);
          if (!saved) return null;
          return {
            id: t.id,
            name: t.name,
            fallback: t.fallback,
            x: typeof saved.x === "number" ? clamp(saved.x, 0.02, 0.98) : null,
            y: typeof saved.y === "number" ? clamp(saved.y, 0.06, 0.96) : null,
            rot: typeof saved.rot === "number" ? clamp(saved.rot, -0.25, 0.25) : null,
            colorIndex:
              typeof saved.colorIndex === "number"
                ? Math.abs(Math.round(saved.colorIndex)) % palette.length
                : i % palette.length,
          };
        })
        .filter(Boolean);

      if (out.length !== tools.length) return null;
      if (out.some((s) => s.x == null || s.y == null || s.rot == null)) return null;
      return out;
    } catch (_) {
      return null;
    }
  }

  let stickers = loadLayout() || buildLayout({ scatter: true });

  let saveTimer = null;
  function scheduleSave() {
    if (!window.localStorage) return;
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      try {
        const payload = stickers.map((s) => ({
          id: s.id,
          x: s.x,
          y: s.y,
          rot: s.rot,
          colorIndex: s.colorIndex,
        }));
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (_) {}
    }, 200);
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let viewW = 0;
  let viewH = 0;
  let scale = 1;
  let noiseSeed = Math.floor(Math.random() * 1e9);

  function seededRand() {
    // LCG (fast, deterministic-ish) for stable texture
    noiseSeed = (noiseSeed * 1664525 + 1013904223) % 4294967296;
    return noiseSeed / 4294967296;
  }

  function roundRectPath(c, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    c.beginPath();
    c.moveTo(x + rr, y);
    c.lineTo(x + w - rr, y);
    c.quadraticCurveTo(x + w, y, x + w, y + rr);
    c.lineTo(x + w, y + h - rr);
    c.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    c.lineTo(x + rr, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - rr);
    c.lineTo(x, y + rr);
    c.quadraticCurveTo(x, y, x + rr, y);
    c.closePath();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    viewW = Math.max(1, rect.width);
    viewH = Math.max(1, rect.height);
    scale = clamp(Math.min(viewW / 880, viewH / 520), 0.85, 1.2);

    const nextW = Math.round(viewW * dpr);
    const nextH = Math.round(viewH * dpr);
    if (canvas.width !== nextW) canvas.width = nextW;
    if (canvas.height !== nextH) canvas.height = nextH;

    // Draw in CSS pixels (so hit-testing is straightforward)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function getStickerRect(s) {
    // Use the cached w/h if we have it; otherwise compute.
    const size = s._w && s._h ? { w: s._w, h: s._h } : computeStickySize(s.name);
    const w = size.w;
    const h = size.h;
    const cx = s.x * viewW;
    const cy = s.y * viewH;
    return { x: cx - w / 2, y: cy - h / 2, w, h, cx, cy };
  }

  function clampStickerToBounds(s) {
    const { w, h } = s._w && s._h ? { w: s._w, h: s._h } : computeStickySize(s.name);
    const pad = 6 * scale;
    const minX = (w / 2 + pad) / viewW;
    const maxX = 1 - minX;
    const minY = (h / 2 + pad) / viewH;
    const maxY = 1 - minY;
    s.x = clamp(s.x, minX, maxX);
    s.y = clamp(s.y, minY, maxY);
  }

  // Resolve overlaps using simple AABB separation (rotation is tiny; this is a good approximation).
  // - If activeIdx is provided, only moves that sticker (used while dragging).
  function resolveOverlaps({ iterations = 40, activeIdx = null } = {}) {
    if (stickers.length < 2) return;

    // Ensure size cache exists (depends on viewW/viewH/scale)
    stickers.forEach((s) => {
      const { w, h } = computeStickySize(s.name);
      s._w = w;
      s._h = h;
    });

    const moveOnlyActive = typeof activeIdx === "number" && activeIdx >= 0;
    const pad = 10 * scale;

    for (let iter = 0; iter < iterations; iter++) {
      let moved = false;
      for (let i = 0; i < stickers.length; i++) {
        for (let j = i + 1; j < stickers.length; j++) {
          const ai = i;
          const bi = j;
          const a = stickers[ai];
          const b = stickers[bi];
          const ra = getStickerRect(a);
          const rb = getStickerRect(b);

          if (!rectsOverlap(ra, rb)) continue;

          const dx = ra.cx - rb.cx;
          const dy = ra.cy - rb.cy;
          const overlapX = ra.w / 2 + rb.w / 2 + pad - Math.abs(dx);
          const overlapY = ra.h / 2 + rb.h / 2 + pad - Math.abs(dy);

          if (overlapX <= 0 || overlapY <= 0) continue;

          // Minimal translation direction
          let pushX = 0;
          let pushY = 0;
          if (overlapX < overlapY) {
            const dir = dx === 0 ? (Math.random() > 0.5 ? 1 : -1) : Math.sign(dx);
            pushX = overlapX * dir;
          } else {
            const dir = dy === 0 ? (Math.random() > 0.5 ? 1 : -1) : Math.sign(dy);
            pushY = overlapY * dir;
          }

          if (moveOnlyActive) {
            if (ai !== activeIdx && bi !== activeIdx) continue;
            const target = ai === activeIdx ? a : b;
            target.x = (target.x * viewW + pushX) / viewW;
            target.y = (target.y * viewH + pushY) / viewH;
            clampStickerToBounds(target);
            moved = true;
          } else {
            // Split movement between both stickers for a stable layout
            a.x = (a.x * viewW + pushX * 0.5) / viewW;
            a.y = (a.y * viewH + pushY * 0.5) / viewH;
            b.x = (b.x * viewW - pushX * 0.5) / viewW;
            b.y = (b.y * viewH - pushY * 0.5) / viewH;
            clampStickerToBounds(a);
            clampStickerToBounds(b);
            moved = true;
          }
        }
      }
      if (!moved) break;
    }
  }

  function drawWallBackground() {
    // Light corkboard-ish wall for bright sticky notes
    ctx.clearRect(0, 0, viewW, viewH);
    ctx.fillStyle = "#F6F1E8";
    ctx.fillRect(0, 0, viewW, viewH);

    // Warm vignette
    const v = ctx.createRadialGradient(viewW * 0.5, viewH * 0.45, 0, viewW * 0.5, viewH * 0.45, Math.max(viewW, viewH) * 0.9);
    v.addColorStop(0, "rgba(255, 184, 77, 0.10)");
    v.addColorStop(0.6, "rgba(109, 40, 255, 0.04)");
    v.addColorStop(1, "rgba(20, 22, 28, 0.10)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, viewW, viewH);

    // Speckle texture (cheap, capped count)
    const count = Math.min(520, Math.round((viewW * viewH) / 2600));
    ctx.save();
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < count; i++) {
      const x = seededRand() * viewW;
      const y = seededRand() * viewH;
      const r = (seededRand() * 1.8 + 0.4) * scale;
      ctx.fillStyle = seededRand() > 0.55 ? "rgba(255,255,255,0.18)" : "rgba(20,22,28,0.12)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function wrapLines(text, maxWidth) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    if (!words.length) return [""];
    const lines = [];
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const test = `${line} ${words[i]}`;
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
      } else {
        lines.push(line);
        line = words[i];
      }
    }
    lines.push(line);
    return lines;
  }

  function ellipsize(line, maxWidth) {
    const ell = "…";
    if (ctx.measureText(line).width <= maxWidth) return line;
    let s = line;
    while (s.length > 1 && ctx.measureText(`${s}${ell}`).width > maxWidth) {
      s = s.slice(0, -1);
    }
    return `${s}${ell}`;
  }

  function computeStickySize(text) {
    const fontSize = Math.max(16, Math.round(18 * scale));
    const lineH = Math.round(fontSize * 1.2);
    ctx.font = `800 ${fontSize}px Sora, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;

    const maxTextW = Math.min(240 * scale, Math.max(160 * scale, viewW * 0.32));
    let lines = wrapLines(text, maxTextW);
    if (lines.length > 2) lines = [lines[0], lines.slice(1).join(" ")];
    lines = lines.map((l, idx) => (idx === 1 ? ellipsize(l, maxTextW) : l));

    const pad = Math.round(16 * scale);
    const w = Math.round(maxTextW + pad * 2);
    const h = Math.round(lines.length * lineH + pad * 2 + 10 * scale);
    return { w, h, fontSize, lineH, pad, lines };
  }

  function drawSticker(s) {
    const px = s.x * viewW;
    const py = s.y * viewH;
    const pal = palette[s.colorIndex % palette.length];
    const { w, h, fontSize, lineH, pad, lines } = computeStickySize(s.name);

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(s.rot);

    // Shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.40)";
    ctx.shadowBlur = 22 * scale;
    ctx.shadowOffsetY = 10 * scale;

    // Sticky note body
    const r = 12 * scale;
    const x = -w / 2;
    const y = -h / 2;

    roundRectPath(ctx, x, y, w, h, r);
    ctx.fillStyle = pal.bg;
    ctx.fill();

    // Border
    ctx.shadowColor = "transparent";
    ctx.lineWidth = Math.max(1, 1.3 * scale);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
    ctx.stroke();

    // Folded corner (top-right)
    const fold = Math.min(22 * scale, w * 0.16, h * 0.22);
    ctx.beginPath();
    ctx.moveTo(x + w - fold, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + fold);
    ctx.closePath();
    ctx.fillStyle = pal.fold;
    ctx.fill();

    // Subtle paper highlight
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    roundRectPath(ctx, x + 12 * scale, y + 10 * scale, w - 24 * scale, 14 * scale, 8 * scale);
    ctx.fill();
    ctx.restore();

    // Text (high contrast)
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(20, 22, 28, 0.92)";
    ctx.font = `800 ${fontSize}px Sora, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const centerY = 0 + 4 * scale;
    if (lines.length === 1) {
      ctx.fillText(lines[0], 0, centerY);
    } else {
      ctx.fillText(lines[0], 0, centerY - lineH * 0.55);
      ctx.fillText(lines[1], 0, centerY + lineH * 0.55);
    }

    // Small monogram in the bottom-left (light, optional)
    ctx.globalAlpha = 0.35;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = `900 ${Math.max(11, Math.round(12 * scale))}px Sora, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
    ctx.fillText(String(s.fallback || "").slice(0, 2), x + pad, y + h - pad * 0.6);
    ctx.globalAlpha = 1;

    ctx.restore();

    // Cache for hit-testing
    s._w = w;
    s._h = h;
  }

  let raf = 0;
  function requestDraw() {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = 0;
      resize();
      // Prevent overlaps after resize / first paint.
      resolveOverlaps({ iterations: 20 });
      drawWallBackground();
      stickers.forEach(drawSticker);
    });
  }

  function getPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function hitTest(x, y) {
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      const px = s.x * viewW;
      const py = s.y * viewH;
      const w = s._w || computeStickySize(s.name).w;
      const h = s._h || computeStickySize(s.name).h;
      const dx = x - px;
      const dy = y - py;
      const cos = Math.cos(-s.rot);
      const sin = Math.sin(-s.rot);
      const lx = dx * cos - dy * sin;
      const ly = dx * sin + dy * cos;
      if (Math.abs(lx) <= w / 2 && Math.abs(ly) <= h / 2) return i;
    }
    return -1;
  }

  let active = null;
  let dragDx = 0;
  let dragDy = 0;

  canvas.addEventListener("pointerdown", (e) => {
    const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;
    if (finePointer) e.preventDefault();

    const p = getPoint(e);
    const idx = hitTest(p.x, p.y);
    if (idx < 0) return;
    active = stickers[idx];

    // Bring to front
    stickers.splice(idx, 1);
    stickers.push(active);

    dragDx = active.x * viewW - p.x;
    dragDy = active.y * viewH - p.y;

    canvas.setPointerCapture?.(e.pointerId);
    canvas.style.cursor = "grabbing";
    requestDraw();
  });

  canvas.addEventListener("pointermove", (e) => {
    const p = getPoint(e);

    if (!active) {
      const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;
      if (!finePointer) return;
      canvas.style.cursor = hitTest(p.x, p.y) >= 0 ? "grab" : "default";
      return;
    }

    active.x = clamp((p.x + dragDx) / viewW, 0.05, 0.95);
    active.y = clamp((p.y + dragDy) / viewH, 0.08, 0.94);
    // Enforce non-overlap while dragging (active sticker is always at the end due to bring-to-front).
    resolveOverlaps({ iterations: 28, activeIdx: stickers.length - 1 });
    scheduleSave();
    requestDraw();
  });

  function endDrag() {
    if (!active) return;
    active = null;
    canvas.style.cursor = "default";
    scheduleSave();
    requestDraw();
  }

  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  window.addEventListener("blur", endDrag);

  canvas.addEventListener("dblclick", (e) => {
    // No-op (keeping interactions simple + readable)
  });

  window.addEventListener("resize", requestDraw);
  // Ensure the initial layout doesn't overlap.
  requestDraw();
})();