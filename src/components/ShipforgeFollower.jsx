import { useEffect, useRef, useState, useCallback } from "react";

const STAR_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#ec4899", "#10b981"];

function isInteractive(el) {
  if (!el) return false;
  return el.closest("button, a, [role='button'], input, select, textarea, label") !== null;
}

export default function ShipforgeFollower() {
  const followerRef = useRef(null);
  const [hidden, setHidden] = useState(false);
  const [clicked, setClicked] = useState(false);
  const targetRef = useRef({ x: -300, y: -300 });
  const currentRef = useRef({ x: -300, y: -300 });
  const rafRef = useRef(null);
  const hideTimerRef = useRef(null);
  const starsContainerRef = useRef(null);
  const activeButtonRef = useRef(null);
  const starsTimerRef = useRef(null);

  const spawnStars = useCallback((button) => {
    const container = starsContainerRef.current;
    if (!container || !button) return;

    const rect = button.getBoundingClientRect();

    // Remove old stars
    while (container.firstChild) container.removeChild(container.firstChild);

    const count = 18;
    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");
      star.className = "sf-star";

      const angle = (i / count) * 360;
      const rads = (angle * Math.PI) / 180;
      const rx = rect.left + rect.width / 2;
      const ry = rect.top + rect.height / 2;
      const radius = Math.max(rect.width, rect.height) * 0.7 + Math.random() * 20;

      const sx = rx + Math.cos(rads) * radius;
      const sy = ry + Math.sin(rads) * radius;

      star.style.cssText = `
        left: ${sx}px;
        top: ${sy}px;
        color: ${STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]};
        font-size: ${8 + Math.random() * 10}px;
        animation-delay: ${Math.random() * 0.3}s;
        animation-duration: ${0.6 + Math.random() * 0.6}s;
      `;
      star.textContent = ["✦", "★", "✸", "✺", "✶", "⭐"][Math.floor(Math.random() * 6)];
      container.appendChild(star);
    }

    container.style.display = "block";
  }, []);

  const clearStars = useCallback(() => {
    const container = starsContainerRef.current;
    if (!container) return;
    container.style.display = "none";
    while (container.firstChild) container.removeChild(container.firstChild);
  }, []);

  useEffect(() => {
    function onMouseMove(e) {
      targetRef.current = { x: e.clientX, y: e.clientY };

      const over = isInteractive(document.elementFromPoint(e.clientX, e.clientY));
      if (over) {
        setHidden(true);
        const btn = document.elementFromPoint(e.clientX, e.clientY)?.closest("button, a, [role='button']");
        if (btn && btn !== activeButtonRef.current) {
          activeButtonRef.current = btn;
          clearInterval(starsTimerRef.current);
          spawnStars(btn);
          starsTimerRef.current = setInterval(() => {
            if (activeButtonRef.current) spawnStars(activeButtonRef.current);
          }, 400);
        }
      } else {
        setHidden(false);
        activeButtonRef.current = null;
        clearInterval(starsTimerRef.current);
        clearStars();
      }
    }

    function onMouseDown(e) {
      if (isInteractive(e.target)) {
        setClicked(true);
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setClicked(false);
        }, 1200);
      }
    }

    function animate() {
      const t = targetRef.current;
      const c = currentRef.current;
      c.x += (t.x - c.x) * 0.1;
      c.y += (t.y - c.y) * 0.1;
      if (followerRef.current) {
        followerRef.current.style.transform = `translate(${c.x}px, ${c.y}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      cancelAnimationFrame(rafRef.current);
      clearTimeout(hideTimerRef.current);
      clearInterval(starsTimerRef.current);
    };
  }, [spawnStars, clearStars]);

  return (
    <>
      {/* Stars container - fixed, full viewport */}
      <div
        ref={starsContainerRef}
        className="sf-stars-container"
        aria-hidden="true"
      />

      {/* Shipforge follower */}
      <div
        ref={followerRef}
        className={`sf-follower${hidden || clicked ? " sf-follower--hidden" : ""}`}
        aria-hidden="true"
      >
        <span className="sf-follower__bolt">⚡</span>
        <span className="sf-follower__text">Shipforge</span>
        <span className="sf-follower__glow" />
      </div>
    </>
  );
}
