const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const PROJECT_CASE_STUDIES = {
  "smart-analysis":
    "https://www.figma.com/proto/nOWVeJIwIkZxu95sFbAVcg/Smart-Analysis?node-id=188-21&t=5vwn3qgVNJf9gY22-1&scaling=scale-down-width&content-scaling=fixed&page-id=13%3A12",
  chatbot:
    "https://www.figma.com/proto/aSKfrVEm8NCnuUFps3HH4u/Gru-Chatbot?node-id=3-405&t=sQ9SfE1NrdD9dSdY-1&scaling=min-zoom&content-scaling=fixed&page-id=3%3A401",
  "navi-mumbai":
    "https://www.figma.com/proto/qCdYV3xTJmBDqE6iM8t0s0/Navi-Mumbai-Case-Study?node-id=76-2&t=M8mRYPnRtbOG5f6G-1&scaling=scale-down-width&content-scaling=fixed&page-id=0%3A1",
  cricter:
    "https://www.figma.com/proto/ccPVCzC2U79iAdHHMJAWPB/Cricter-App-Design?node-id=652-1346&t=bg6VZJlTifvQKywA-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=316%3A228",
};

// ─── Loader ───
window.addEventListener("load", () => {
  const loader = qs("#loader");
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add("is-hidden");
    triggerHeroAnimations();
  }, 1400);
});

function triggerHeroAnimations() {
  const hero = qs("#home");
  if (!hero) return;
  qsa("[data-animate]", hero).forEach((el, i) => {
    const delay = parseFloat(el.dataset.delay || 0) * 1000;
    setTimeout(() => el.classList.add("is-visible"), 200 + delay);
  });
}

// ─── Navigation ───
(() => {
  const nav = qs("#nav");
  if (!nav) return;

  const navLinks = qsa(".nav-link", nav);
  const sections = qsa("section[id]");
  let lastScroll = 0;

  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 60);

    if (y > lastScroll && y > 300) {
      nav.style.transform = "translateY(-100%)";
    } else {
      nav.style.transform = "translateY(0)";
    }
    lastScroll = y;

    let currentId = "";
    for (const section of sections) {
      const top = section.offsetTop - 200;
      if (y >= top && y < top + section.offsetHeight) {
        currentId = section.id;
        break;
      }
    }
    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      a.classList.toggle("active", !!currentId && href === `#${currentId}`);
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
})();

// ─── Mobile Nav ───
(() => {
  const toggle = qs("#menuToggle");
  const mobileNav = qs("#mobileNav");
  const hamburger = qs(".hamburger");
  if (!toggle || !mobileNav) return;

  const closeEls = qsa("[data-mobile-nav-close]", mobileNav);

  const open = () => {
    mobileNav.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    hamburger?.classList.add("is-open");
  };
  const close = () => {
    mobileNav.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    hamburger?.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => mobileNav.hidden ? open() : close());
  closeEls.forEach((el) => el.addEventListener("click", close));
  qsa("a", mobileNav).forEach((a) => a.addEventListener("click", close));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();

// ─── Custom Cursor ───
(() => {
  const cursor = qs(".cursor");
  const follower = qs(".cursor-follower");
  const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;
  if (!cursor || !follower || !finePointer) return;

  let cx = 0, cy = 0, fx = 0, fy = 0;

  const setLabel = (label) => follower.setAttribute("data-label", label || "");
  setLabel("");

  window.addEventListener("mousemove", (e) => {
    cx = e.clientX;
    cy = e.clientY;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
  });

  const tick = () => {
    fx += (cx - fx) * 0.1;
    fy += (cy - fy) * 0.1;
    follower.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  tick();

  const hoverTargets = qsa("a, button, .project-card, .connect-card, .bento-chip, .btn");
  hoverTargets.forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hovering"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hovering"));
  });

})();

// ─── Scroll Reveal ───
(() => {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const elements = qsa("[data-animate]");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const heroElements = qsa("#home [data-animate]");
  const nonHeroElements = elements.filter((el) => !el.closest("#home"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  nonHeroElements.forEach((el) => observer.observe(el));
})();

// ─── Animated Counters ───
(() => {
  const counters = qsa("[data-animate='counter']");
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const numberEl = qs(".stat-number", el);
    if (!numberEl || isNaN(target)) return;

    const duration = 2000;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      numberEl.textContent = value;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
})();

// ─── Horizontal Journey (scroll-driven) ───
// The section gets a tall computed height so that vertical scroll is
// consumed entirely by the horizontal train movement.  The inner
// `.journey-horizontal` wrapper is `position: sticky; top: 0` which
// keeps it pinned in the viewport while the outer section scrolls past.
(() => {
  const section = qs("#journey");
  const wrapper = qs("#journeyHorizontal");
  const train = qs("#journeyTrain");
  const loco = qs("#trainLoco");
  const trackEl = qs(".train-track");
  if (!section || !wrapper || !train) return;

  const isMobile = () => window.innerWidth <= 768;
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  function getScrollDistance() {
    return Math.max(0, train.scrollWidth - window.innerWidth);
  }

  function setup() {
    if (isMobile() || prefersReducedMotion) {
      section.style.height = "";
      train.style.transform = "";
      section.classList.remove("is-pinned");
      return;
    }

    // Reset height to auto first so header can measure naturally
    section.style.height = "auto";
    const headerH = qs(".journey-header")?.offsetHeight || 0;
    const scrollDist = getScrollDistance();

    // Total section height = header + viewport (sticky) + horizontal scroll runway
    section.style.height = `${headerH + scrollDist + window.innerHeight}px`;
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (isMobile() || prefersReducedMotion) return;

      const scrollDist = getScrollDistance();
      if (scrollDist <= 0) return;

      const sectionRect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const headerH = qs(".journey-header")?.offsetHeight || 0;

      // The sticky wrapper locks once the header has scrolled out.
      // scrolled = how far past that lock point we've gone.
      // At scrolled=0 → progress=0 (train at start)
      // At scrolled=scrollDist → progress=1 (train at end)
      const scrolled = -(sectionRect.top + headerH);
      const progress = Math.min(1, Math.max(0, scrolled / scrollDist));

      // Pinned = the sticky wrapper is locked in the viewport
      // This is true from when the header scrolls out until
      // the section bottom reaches the viewport bottom.
      const isPinned = scrolled >= 0 && sectionRect.bottom >= vh;
      section.classList.toggle("is-pinned", isPinned);

      train.style.transform = `translateX(${-(progress * scrollDist)}px)`;

      const pct = `${progress * 100}%`;
      if (loco) loco.style.left = pct;
      if (trackEl) {
        const line = qs(".train-track-line", trackEl);
        if (line) line.style.setProperty("--track-progress", pct);
      }
    });
  }

  setup();
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { setup(); onScroll(); });
})();

// ─── Project Cards (click + pointer glow + background reaction) ───
(() => {
  const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;
  const workBg = qs("#workBg");
  const workSection = qs("#work");

  qsa(".project-card").forEach((card) => {
    card.addEventListener("click", () => {
      const key = card.dataset.project || "";
      const url = PROJECT_CASE_STUDIES[key] || "";
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });

    if (!finePointer || !workBg || !workSection) return;

    const glow = card.querySelector(".project-card-glow");

    card.addEventListener("pointerenter", () => {
      workBg.classList.add("is-active");
      updateBgPosition(card);
    });

    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      if (glow) {
        glow.style.setProperty("--glow-x", `${x}%`);
        glow.style.setProperty("--glow-y", `${y}%`);
      }
    });

    card.addEventListener("pointerleave", () => {
      workBg.classList.remove("is-active");
    });
  });

  function updateBgPosition(card) {
    if (!workBg || !workSection) return;
    const sectionRect = workSection.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const cx = cardRect.left + cardRect.width / 2 - sectionRect.left;
    const cy = cardRect.top + cardRect.height / 2 - sectionRect.top;

    // Move spotlight to card center
    workBg.style.setProperty("--spot-x", `${cx}px`);
    workBg.style.setProperty("--spot-y", `${cy}px`);

    // Pull orbs toward the hovered card
    const sectionW = sectionRect.width;
    const sectionH = sectionRect.height;
    const pullX1 = (cx / sectionW - 0.3) * 200;
    const pullY1 = (cy / sectionH - 0.2) * 150;
    const pullX2 = (cx / sectionW - 0.7) * 180;
    const pullY2 = (cy / sectionH - 0.8) * 120;

    workBg.style.setProperty("--orb1-transform", `translate(${pullX1}px, ${pullY1}px) scale(1.3)`);
    workBg.style.setProperty("--orb2-transform", `translate(${pullX2}px, ${pullY2}px) scale(1.25)`);
  }
})();

// ─── Copy Email / Phone + Toast ───
(() => {
  const copyLinks = qsa("[data-copy-email], [data-copy-phone]");
  const toast = qs("#toast");
  if (!copyLinks.length || !toast) return;

  copyLinks.forEach((link) => {
    const fallbackHref = link.getAttribute("data-mailto") || link.getAttribute("data-tel");
    if (fallbackHref) link.setAttribute("href", fallbackHref);
  });

  let toastTimer = null;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2000);
  };

  const fallbackCopy = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-9999px;left:-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  };

  const isModified = (e) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1;

  copyLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      if (isModified(e)) return;
      e.preventDefault();

      const value = link.dataset.copyEmail || link.dataset.copyPhone || "";
      if (!value) return;
      const label = link.hasAttribute("data-copy-email") ? "Email" : "Phone number";

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          fallbackCopy(value);
        }
        showToast(`${label} copied`);
      } catch {
        try {
          fallbackCopy(value);
          showToast(`${label} copied`);
        } catch {
          showToast(`Couldn't copy ${label.toLowerCase()}`);
        }
      }
    });
  });
})();

// ─── Tool icon fallback ───
(() => {
  qsa(".tool-icon img").forEach((img) => {
    img.addEventListener("error", () => {
      const parent = img.closest(".tool-icon");
      if (!parent) return;
      parent.classList.add("tool-icon--text");
      const name = img.closest(".tool-item")?.querySelector("span:last-child")?.textContent || "";
      parent.textContent = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
      img.remove();
    });
  });
})();

// ─── Smooth scroll for anchor links ───
(() => {
  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = qs(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();

// ─── Parallax gradient orbs on scroll ───
(() => {
  const orbs = qsa(".hero-gradient-orb");
  if (!orbs.length) return;
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReducedMotion) return;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      orbs.forEach((orb, i) => {
        const speed = 0.15 + i * 0.08;
        orb.style.transform = `translateY(${y * speed}px)`;
      });
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
})();
