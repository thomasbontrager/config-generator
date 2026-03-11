import { useEffect, useRef, useState } from "react";

/**
 * ShipforgeFollower – a neon "⚡ Shipforge" label that follows the cursor.
 *
 * Behavior:
 *  • Smoothly tracks the mouse with a slight lag for a "alive" feel.
 *  • Hides while the cursor is hovering any <button> or <a> element (so it
 *    doesn't overlap interactive controls) and fades back in on move-away.
 *  • Disappears for 600 ms when the user clicks any button, then returns.
 *  • Never renders on touch devices (no persistent cursor).
 */
export default function ShipforgeFollower() {
  const followerRef = useRef(null);
  const posRef = useRef({ x: -200, y: -200 });
  const targetRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Don't render on touch-only devices
    if (window.matchMedia("(hover: none)").matches) return;

    function onMouseMove(e) {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      // Hide when hovering buttons or links
      const over = document.elementFromPoint(e.clientX, e.clientY);
      const isInteractive =
        over &&
        (over.closest("button") ||
          over.closest("a") ||
          over.closest("[role='button']"));
      setHidden(!!isInteractive);
    }

    function onMouseLeave() {
      setVisible(false);
    }

    function onMouseDown(e) {
      const target = e.target;
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']")
      ) {
        setHidden(true);
        setTimeout(() => setHidden(false), 600);
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mousedown", onMouseDown);

    // Smooth lerp animation loop
    function tick() {
      const el = followerRef.current;
      if (el) {
        const lerp = 0.12;
        posRef.current.x += (targetRef.current.x - posRef.current.x) * lerp;
        posRef.current.y += (targetRef.current.y - posRef.current.y) * lerp;
        el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousedown", onMouseDown);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  return (
    <div
      ref={followerRef}
      aria-hidden="true"
      className={`sf-follower ${visible && !hidden ? "sf-follower--visible" : ""}`}
    >
      <span className="sf-follower__bolt">⚡</span>
      <span className="sf-follower__text">Shipforge</span>
    </div>
  );
}
