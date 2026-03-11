import { useEffect, useRef } from "react";

const CURSOR_OFFSET_X = 50;
const CURSOR_OFFSET_Y = 32;
const CURSOR_SMOOTHING = 0.1;
const REVEAL_DELAY_MS = 1200;

export default function ShipforgeCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    let targetX = -300;
    let targetY = -300;
    let currentX = -300;
    let currentY = -300;
    let visible = true;
    let overButton = false;
    let revealTimeout = null;
    let rafId = null;

    function setVisible(show) {
      visible = show;
      if (show) {
        el.style.opacity = "1";
        el.style.transform = `translate(${currentX}px, ${currentY}px) scale(1)`;
      } else {
        el.style.opacity = "0";
        el.style.transform = `translate(${currentX}px, ${currentY}px) scale(0)`;
      }
    }

    function isButtonTarget(target) {
      return !!(
        target.closest("button") ||
        target.closest("a") ||
        target.closest('[role="button"]')
      );
    }

    function onMouseMove(e) {
      targetX = e.clientX - CURSOR_OFFSET_X;
      targetY = e.clientY - CURSOR_OFFSET_Y;
    }

    function onMouseOver(e) {
      if (isButtonTarget(e.target)) {
        overButton = true;
        if (visible) {
          setVisible(false);
        }
      }
    }

    function onMouseOut(e) {
      if (isButtonTarget(e.target)) {
        overButton = false;
        if (!visible) {
          setVisible(true);
        }
      }
    }

    function onClick(e) {
      if (isButtonTarget(e.target)) {
        setVisible(false);
        clearTimeout(revealTimeout);
        revealTimeout = setTimeout(() => {
          if (!overButton) {
            setVisible(true);
          }
        }, REVEAL_DELAY_MS);
      }
    }

    function animate() {
      currentX += (targetX - currentX) * CURSOR_SMOOTHING;
      currentY += (targetY - currentY) * CURSOR_SMOOTHING;
      if (visible) {
        el.style.transform = `translate(${currentX}px, ${currentY}px) scale(1)`;
      }
      rafId = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("click", onClick);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(rafId);
      clearTimeout(revealTimeout);
    };
  }, []);

  return (
    <div ref={cursorRef} className="shipforge-cursor" aria-hidden="true">
      <span className="shipforge-cursor__bolt">⚡</span>
      <span className="shipforge-cursor__text">Shipforge</span>
    </div>
  );
}

