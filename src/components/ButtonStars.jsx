import { useEffect } from "react";

const STAR_CHARS = ["✦", "✧", "★", "✸", "✺", "✻", "✼", "✽", "❋", "✵"];
const NEON_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#06b6d4",
  "#f472b6",
  "#34d399",
  "#fbbf24",
  "#60a5fa",
  "#a78bfa",
];
const STAR_COUNT = 14;
const STAR_FADE_DURATION_MS = 500;

function createStar(button) {
  const rect = button.getBoundingClientRect();
  const star = document.createElement("div");
  star.className = "btn-star";

  const side = Math.floor(Math.random() * 4);
  let x, y;
  const margin = 14;
  switch (side) {
    case 0:
      x = Math.random() * (rect.width + margin * 2) - margin;
      y = -(margin + Math.random() * 10);
      break;
    case 1:
      x = rect.width + margin / 2 + Math.random() * 8;
      y = Math.random() * rect.height;
      break;
    case 2:
      x = Math.random() * (rect.width + margin * 2) - margin;
      y = rect.height + margin / 2 + Math.random() * 8;
      break;
    default:
      x = -(margin / 2 + Math.random() * 8);
      y = Math.random() * rect.height;
  }

  const size = 8 + Math.random() * 14;
  const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
  const char = STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)];
  const delay = Math.random() * 0.35;
  const dur = 0.4 + Math.random() * 0.4;

  star.textContent = char;
  star.style.cssText = `
    position: fixed;
    left: ${rect.left + x}px;
    top: ${rect.top + y}px;
    font-size: ${size}px;
    color: ${color};
    text-shadow: 0 0 6px ${color}, 0 0 14px ${color}, 0 0 28px ${color};
    pointer-events: none;
    z-index: 9998;
    user-select: none;
    animation: sf-star-grow ${dur}s ${delay}s cubic-bezier(0.34,1.56,0.64,1) forwards,
               sf-star-flash ${dur * 0.8}s ${delay}s ease-in-out infinite alternate;
    opacity: 0;
    transform: scale(0) rotate(${Math.random() * 360}deg);
    will-change: transform, opacity;
  `;

  return star;
}

export default function ButtonStars() {
  useEffect(() => {
    const starsMap = new Map();

    function addStars(button) {
      if (starsMap.has(button)) return;
      const list = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        const star = createStar(button);
        document.body.appendChild(star);
        list.push(star);
      }
      starsMap.set(button, list);
    }

    function removeStars(button) {
      const list = starsMap.get(button);
      if (!list) return;
      starsMap.delete(button);
      list.forEach((star) => {
        star.style.animation = `sf-star-fade ${STAR_FADE_DURATION_MS}ms ease forwards`;
        setTimeout(() => {
          if (star.parentNode) star.parentNode.removeChild(star);
        }, STAR_FADE_DURATION_MS);
      });
    }

    function onEnter(e) {
      addStars(e.currentTarget);
    }

    function onLeave(e) {
      removeStars(e.currentTarget);
    }

    const attached = new WeakSet();

    function attachToButtons() {
      document
        .querySelectorAll("button, a, [role='button']")
        .forEach((btn) => {
          if (!attached.has(btn)) {
            attached.add(btn);
            btn.addEventListener("mouseenter", onEnter);
            btn.addEventListener("mouseleave", onLeave);
          }
        });
    }

    attachToButtons();

    const observer = new MutationObserver(attachToButtons);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.querySelectorAll(".btn-star").forEach((s) => {
        if (s.parentNode) s.parentNode.removeChild(s);
      });
    };
  }, []);

  return null;
}
