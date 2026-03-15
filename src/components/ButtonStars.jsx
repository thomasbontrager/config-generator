import { useEffect } from "react";

const STAR_CHARS = ["✦", "✸", "★", "✺", "✹", "⋆", "✷", "✵", "✴", "❋", "✾", "✿"];
const COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b",
  "#10b981", "#f43f5e", "#e879f9", "#facc15",
  "#60a5fa", "#4ade80", "#fb923c", "#a78bfa",
];

const STAR_SIZE_MIN = 9;
const STAR_SIZE_MAX = 19;
const STAR_DURATION_MIN = 480;
const STAR_DURATION_MAX = 920;
const STAR_DELAY_MAX = 180;
const STAR_EDGE_OFFSET_MIN = 4;
const STAR_EDGE_OFFSET_MAX = 22;
const ANIMATION_CLEANUP_BUFFER = 60; // extra ms after animation ends before DOM removal
const INITIAL_STAR_BURST = 6;
const STAR_SPAWN_INTERVAL = 70; // ms between continuous star spawns
const FADE_OUT_DURATION = 350; // ms — matches CSS transition used on removal
const FADE_OUT_CLEANUP = FADE_OUT_DURATION + 60; // small buffer after fade

const BTN_SELECTOR = "button, .btn, [role='button']";

function rand(min, max) {
  return min + Math.random() * (max - min);
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * ButtonStars — mounts as a side-effect component (renders null).
 *
 * On mouseover of any button/.btn/[role=button], neon flashing star characters
 * continuously spawn around the element's edges, growing and flashing.
 * On mouseout they glow away and disappear.
 */
export default function ButtonStars() {
  useEffect(() => {
    const active = new Map();   // btn → container element
    const timers = new Map();   // btn → interval id

    function spawnStar(btn, container) {
      const rect = btn.getBoundingClientRect();
      const star = document.createElement("span");
      star.className = "btn-sparkle";
      star.textContent = pick(STAR_CHARS);

      const color = pick(COLORS);
      const size = rand(STAR_SIZE_MIN, STAR_SIZE_MAX);
      const dur = rand(STAR_DURATION_MIN, STAR_DURATION_MAX);
      const delay = rand(0, STAR_DELAY_MAX);

      // Random position along one of the four edges (with a small outward offset)
      const edge = Math.floor(rand(0, 4));
      let x, y;
      if (edge === 0)      { x = rand(rect.left, rect.right);   y = rand(rect.top - STAR_EDGE_OFFSET_MAX, rect.top - STAR_EDGE_OFFSET_MIN); }
      else if (edge === 1) { x = rand(rect.left, rect.right);   y = rand(rect.bottom + STAR_EDGE_OFFSET_MIN, rect.bottom + STAR_EDGE_OFFSET_MAX); }
      else if (edge === 2) { x = rand(rect.left - STAR_EDGE_OFFSET_MAX, rect.left - STAR_EDGE_OFFSET_MIN); y = rand(rect.top, rect.bottom); }
      else                 { x = rand(rect.right + STAR_EDGE_OFFSET_MIN, rect.right + STAR_EDGE_OFFSET_MAX); y = rand(rect.top, rect.bottom); }

      star.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        font-size: ${size}px;
        color: ${color};
        text-shadow: 0 0 6px ${color}, 0 0 14px ${color}, 0 0 26px ${color};
        pointer-events: none;
        z-index: 99997;
        user-select: none;
        will-change: transform, opacity;
        animation: btn-sparkle-anim ${dur}ms ${delay}ms ease-out both;
      `;

      container.appendChild(star);
      // Auto-remove star after animation completes
      setTimeout(() => star.remove(), dur + delay + ANIMATION_CLEANUP_BUFFER);
    }

    function startStars(btn) {
      if (active.has(btn)) return;

      const container = document.createElement("div");
      container.className = "btn-stars-wrap";
      document.body.appendChild(container);
      active.set(btn, container);

      // Spawn a burst immediately then keep spawning
      for (let i = 0; i < INITIAL_STAR_BURST; i++) spawnStar(btn, container);
      const id = setInterval(() => {
        if (!btn.isConnected) {
          stopStars(btn);
          return;
        }
        spawnStar(btn, container);
      }, STAR_SPAWN_INTERVAL);
      timers.set(btn, id);
    }

    function stopStars(btn) {
      const container = active.get(btn);
      if (!container) return;

      clearInterval(timers.get(btn));
      timers.delete(btn);
      active.delete(btn);

      // Fade all remaining stars out
      Array.from(container.children).forEach(star => {
        star.style.transition = `opacity ${FADE_OUT_DURATION}ms ease, transform ${FADE_OUT_DURATION}ms ease`;
        star.style.opacity = "0";
        star.style.transform = "scale(0.2) rotate(120deg)";
      });
      setTimeout(() => container.remove(), FADE_OUT_CLEANUP);
    }

    function onOver(e) {
      const btn = e.target.closest(BTN_SELECTOR);
      if (btn) startStars(btn);
    }

    function onOut(e) {
      const btn = e.target.closest(BTN_SELECTOR);
      if (btn && !btn.contains(e.relatedTarget)) stopStars(btn);
    }

    document.addEventListener("mouseover", onOver, true);
    document.addEventListener("mouseout", onOut, true);

    return () => {
      document.removeEventListener("mouseover", onOver, true);
      document.removeEventListener("mouseout", onOut, true);
      timers.forEach(clearInterval);
      active.forEach(c => c.remove());
    };
  }, []);

  return null;
}
