import { useEffect, useState } from "react";

export default function ShipforgeCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMove(e) {
      setPos({ x: e.clientX, y: e.clientY });
    }

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: pos.y - 10,
        left: pos.x - 10,
        width: 20,
        height: 20,
        borderRadius: "50%",
        pointerEvents: "none",
        background:
          "radial-gradient(circle, rgba(0,255,200,0.9) 0%, rgba(0,255,200,0.3) 60%, transparent 70%)",
        zIndex: 9999,
        transition: "transform 0.05s linear",
      }}
    />
  );
}
