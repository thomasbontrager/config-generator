import { useEffect, useState } from "react";

export default function ParallaxBackground() {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const move = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPos({ x, y });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
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
