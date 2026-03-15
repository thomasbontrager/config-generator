import { useEffect, useRef, useState, useCallback } from "react";

/**
 * ShipforgeCursor
 *
 * - Glowing ⚡ Shipforge text that smoothly follows the mouse everywhere.
 * - When the mouse enters a button/link the cursor hides and neon stars
 *   erupt around the element's edges.
 * - When the mouse leaves the button the stars fade out and the cursor
 *   re-appears.
 * - Clicking a button while the cursor is hidden makes the cursor do a
 *   quick "pop" re-appear and then resume following.
 */

const STAR_CHARS = ["★", "✦", "✧", "⟡", "✸", "✺", "❋", "✼"];
const STAR_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b",
  "#ec4899", "#10b981", "#f97316", "#a78bfa",
];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function createStar(rect, index, total) {
  const angle = (index / total) * 2 * Math.PI;
  const rx = rect.width / 2 + randomBetween(8, 28);
  const ry = rect.height / 2 + randomBetween(8, 28);
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return {
    id: Math.random(),
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
    char: STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)],
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    size: randomBetween(10, 22),
    rotation: randomBetween(0, 360),
    opacity: 0,
    scale: 0,
  };
}

export default function ShipforgeCursor() {
  const posRef = useRef({ x: -200, y: -200 });
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);
  const [stars, setStars] = useState([]);
  const rafRef = useRef(null);
  const animRafRef = useRef(null);
  const currentRef = useRef({ x: -200, y: -200 });
  const hoveredRef = useRef(null);

  // ── Spawn + animate stars around an element ──────────────────────────────
  const spawnStars = useCallback((el) => {
    const rect = el.getBoundingClientRect();
    const count = 14;
    const newStars = Array.from({ length: count }, (_, i) =>
      createStar(rect, i, count)
    );
    setStars(newStars);

    let frame = 0;
    function animate() {
      frame++;
      setStars((prev) =>
        prev.map((s) => {
          if (frame < 8) {
            return {
              ...s,
              opacity: Math.min(1, s.opacity + 0.15),
              scale: Math.min(1.2, s.scale + 0.18),
            };
          } else if (frame < 22) {
            return {
              ...s,
              opacity: 1,
              scale: 1 + 0.05 * Math.sin(frame * 0.7 + s.id),
            };
          } else {
            return {
              ...s,
              opacity: Math.max(0, s.opacity - 0.08),
              scale: Math.max(0, s.scale - 0.06),
            };
          }
        })
      );
      if (frame < 36) {
        animRafRef.current = requestAnimationFrame(animate);
      } else if (hoveredRef.current === el) {
        // Re-spawn for continuous effect while hovering
        spawnStars(el);
      }
    }
    cancelAnimationFrame(animRafRef.current);
    animRafRef.current = requestAnimationFrame(animate);
  }, []);

  // ── Smooth follow loop ──────────────────────────────────────────────────
  useEffect(() => {
    let animId;
    function loop() {
      const target = posRef.current;
      const cur = currentRef.current;
      const EASE = 0.14;
      currentRef.current = {
        x: cur.x + (target.x - cur.x) * EASE,
        y: cur.y + (target.y - cur.y) * EASE,
      };
      setPos({ ...currentRef.current });
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── Mouse events ────────────────────────────────────────────────────────
  useEffect(() => {
    function onMove(e) {
      posRef.current = { x: e.clientX, y: e.clientY };
      const el = e.target;
      const isInteractive =
        el.tagName === "BUTTON" ||
        el.tagName === "A" ||
        el.closest("button") ||
        el.closest("a");

      if (isInteractive) {
        const btn =
          el.tagName === "BUTTON" || el.tagName === "A"
            ? el
            : el.closest("button") || el.closest("a");
        if (btn !== hoveredRef.current) {
          hoveredRef.current = btn;
          setVisible(false);
          spawnStars(btn);
        }
      } else {
        if (hoveredRef.current) {
          hoveredRef.current = null;
          setStars([]);
        }
        setVisible(true);
      }
    }

    function onLeave() {
      hoveredRef.current = null;
      setStars([]);
      setVisible(false);
    }

    function onClick(e) {
      const isInteractive =
        e.target.tagName === "BUTTON" ||
        e.target.tagName === "A" ||
        e.target.closest("button") ||
        e.target.closest("a");
      if (isInteractive) {
        setStars([]);
        hoveredRef.current = null;
        setVisible(true);
        setTimeout(() => setVisible(false), 600);
      }
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("click", onClick);
    };
  }, [spawnStars]);

  // ── Cleanup animation frames on unmount ──────────────────────────────────
  useEffect(() => {
    const raf = rafRef;
    const animRaf = animRafRef;
    return () => {
      cancelAnimationFrame(raf.current);
      cancelAnimationFrame(animRaf.current);
    };
  }, []);

  return (
    <>
      {/* ── Cursor follower ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 99999,
          transform: `translate(${pos.x - 50}px, ${pos.y - 18}px)`,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.25s ease",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 900,
            letterSpacing: "0.04em",
            fontFamily: "'Inter', system-ui, sans-serif",
            background:
              "linear-gradient(135deg, #6366f1 0%, #a78bfa 40%, #06b6d4 80%, #6366f1 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter:
              "drop-shadow(0 0 8px rgba(99,102,241,0.9)) drop-shadow(0 0 16px rgba(139,92,246,0.7))",
            animation:
              "sfCursorShimmer 3s linear infinite, sfCursorPulse 2s ease-in-out infinite",
          }}
        >
          ⚡ Shipforge
        </span>
      </div>

      {/* ── Button edge stars ── */}
      {stars.map((s) => (
        <div
          key={s.id}
          aria-hidden="true"
          style={{
            position: "fixed",
            top: s.y,
            left: s.x,
            transform: `translate(-50%, -50%) scale(${s.scale}) rotate(${s.rotation}deg)`,
            opacity: s.opacity,
            pointerEvents: "none",
            zIndex: 99998,
            fontSize: s.size,
            color: s.color,
            textShadow: `0 0 8px ${s.color}, 0 0 18px ${s.color}`,
            filter: `drop-shadow(0 0 4px ${s.color})`,
            transition: "none",
            userSelect: "none",
          }}
        >
          {s.char}
        </div>
      ))}

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes sfCursorShimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes sfCursorPulse {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(99,102,241,0.9))
                    drop-shadow(0 0 14px rgba(139,92,246,0.6));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(99,102,241,1))
                    drop-shadow(0 0 28px rgba(6,182,212,0.8));
          }
        }
      `}</style>
    </>
  );
}

