import { useEffect, useRef, useState } from "react";

export default function ParallaxBackground() {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const frameRef = useRef(null);
  const latestPosRef = useRef({ x: 50, y: 50 });

  useEffect(() => {
    const move = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      latestPosRef.current = { x, y };

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(() => {
          frameRef.current = null;
          const { x: latestX, y: latestY } = latestPosRef.current;
          setPos({ x: latestX, y: latestY });
        });
      }
    };

    window.addEventListener("pointermove", move, { passive: true });

   return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      window.removeEventListener("pointermove", move, { passive: true });
    };
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 transition-all duration-300"
      style={{
        background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, #1e3a8a 0%, #0b0f14 50%)`,
      }}
    />
  );
}
