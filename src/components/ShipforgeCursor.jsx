import { useEffect, useRef, useState } from "react";

/**
 * ShipforgeCursor — a viral neon glowing ⚡ Shipforge badge that follows the
 * mouse around the entire page.
 *
 * Behaviour:
 *  - Appears as soon as the user moves the mouse.
 *  - Hides (with a springy scale-out) when the cursor is over any button / link / .btn.
 *  - Disappears (with a pop-out animation) when the user clicks a button.
 *  - Reappears 1.5 s after the click.
 *  - Uses requestAnimationFrame + lerp for a smooth, "alive" trailing movement.
 */

const INTERACTIVE_SELECTOR = "button, a, .btn, [role='button'], input, select, textarea, label";
const CLICK_SELECTOR = "button, .btn, [role='button']";
const LERP_FACTOR = 0.13;
const REVEAL_DELAY_MS = 1500;

export default function ShipforgeCursor() {
  const [show, setShow] = useState(false);
  const cursorRef = useRef(null);

  // Target position (raw mouse)
  const targetPos = useRef({ x: -400, y: -400 });
  // Smoothed position (lerped toward target each frame)
  const smoothPos = useRef({ x: -400, y: -400 });
  const rafRef = useRef(null);
  const revealTimer = useRef(null);

  // Mutable state for show logic (avoids stale closures in the effect)
  const stateRef = useRef({ hasMoved: false, active: true, onInteractive: false });

  useEffect(() => {
    function syncShow() {
      const { hasMoved, active, onInteractive } = stateRef.current;
      setShow(hasMoved && active && !onInteractive);
    }

    // rAF loop: lerp smoothPos toward targetPos and apply to DOM directly
    function tick() {
      const { x: tx, y: ty } = targetPos.current;
      let { x: cx, y: cy } = smoothPos.current;
      cx += (tx - cx) * LERP_FACTOR;
      cy += (ty - cy) * LERP_FACTOR;
      smoothPos.current = { x: cx, y: cy };

      if (cursorRef.current) {
        cursorRef.current.style.left = `${cx}px`;
        cursorRef.current.style.top = `${cy}px`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    function onMouseMove(e) {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!stateRef.current.hasMoved) {
        stateRef.current.hasMoved = true;
        syncShow();
      }
    }

    function onMouseOver(e) {
      if (e.target.closest(INTERACTIVE_SELECTOR) && !stateRef.current.onInteractive) {
        stateRef.current.onInteractive = true;
        syncShow();
      }
    }

    function onMouseOut(e) {
      const el = e.target.closest(INTERACTIVE_SELECTOR);
      if (el && !el.contains(e.relatedTarget) && stateRef.current.onInteractive) {
        stateRef.current.onInteractive = false;
        syncShow();
      }
    }

    function onClick(e) {
      if (e.target.closest(CLICK_SELECTOR)) {
        stateRef.current.active = false;
        syncShow();
        clearTimeout(revealTimer.current);
        revealTimer.current = setTimeout(() => {
          stateRef.current.active = true;
          stateRef.current.onInteractive = false;
          syncShow();
        }, REVEAL_DELAY_MS);
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(revealTimer.current);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`sf-cursor${show ? " sf-cursor--show" : ""}`}
      aria-hidden="true"
    >
      <span className="sf-cursor__bolt">⚡</span>
      <span className="sf-cursor__text">Shipforge</span>
    </div>
  );
}
