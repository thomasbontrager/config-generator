import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { generateZip } from "../generateZip";
import Navbar from "../components/Navbar";
import UpgradeModal from "../components/UpgradeModal";
import Hero from "../components/Hero";
import GeneratorPanel from "../components/GeneratorPanel";
import Features from "../components/Features";
import PricingCTA from "../components/PricingCTA";
import Footer from "../components/Footer";

export default function Home() {
  const { user } = useAuth();
  const [selected, setSelected] = useState({ vite: true, express: true });
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [generating, setGenerating] = useState(false);
  const cursorGlowRef = useRef(null);

  const isActive =
    user?.subscription === "ACTIVE" || user?.subscription === "TRIAL";

  // Cursor-reactive glow effect
  useEffect(() => {
    function onMouseMove(e) {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(99,102,241,0.12), transparent 50%)`;
      }
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  function toggleStack(id) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleGenerate() {
    if (!user) {
      window.location.href = "/signup";
      return;
    }
    if (!isActive) {
      setShowUpgrade(true);
      return;
    }
    const anySelected = Object.values(selected).some(Boolean);
    if (!anySelected) return;

    setGenerating(true);
    try {
      await generateZip({ vite: selected.vite, express: selected.express });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <div className="grid-bg" />
      <div className="cursor-glow" ref={cursorGlowRef} />
      <Navbar />

      <Hero />

      <GeneratorPanel
        selected={selected}
        onToggle={toggleStack}
        onGenerate={handleGenerate}
        generating={generating}
        isActive={isActive}
        user={user}
      />

      <Features />

      <PricingCTA />

      <Footer />

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
